// =====================================================================
// Supabase Edge Function: sign-mock-pdf
// ---------------------------------------------------------------------
// Hands an entitled caller ONE short-lived presigned URL for ONE mock PDF,
// logs the grant, and enforces a daily quota.
//
// Who may download, and how much per 24h PER SKILL (a mock counts once —
// its questions and its model answers together, not twice):
//   superadmin — admin with no centre: no limit
//   admin      — clone admin:        PDF_QUOTA_ADMIN   (3)
//   premium    — premium/ultra:      PDF_QUOTA_PREMIUM (1)
//   vip        — signed VIP token with premium_ai=true: PDF_QUOTA_VIP (1)
//   free       — the centre's free mock, for anyone, and it does NOT consume
//                the caller's own allowance
//
// An ordinary mock code also carries a VIP token, but with p=false. It opens
// the exam, NOT the paper, so it is refused with 402 and the client turns that
// into the "this is a premium feature" prompt. Keeping that distinction here,
// on the server, is the whole point — the button is visible to everyone.
//
// Why this exists: the PDFs were served from the public custom domain
// `audio.mock-stream.com/pdf/<type>/mock-NN.pdf`. The admin padlock on
// the sidebar hid the MENU, not the FILES — the path is trivially
// guessable and `pdf/manifest.json` published the full index, so anyone
// could take all 1075 papers without being an admin at all.
//
// The presigned URL points at the S3 endpoint
// `<account>.r2.cloudflarestorage.com`, NOT at the custom domain, so
// closing the public route (a WAF rule on `/pdf/*.pdf`) does not affect
// this path. Exam audio on the same bucket keeps working untouched.
//
// Request  (POST): { type, number, variant? }   variant: 'samples' | null
// Response:        { url, expiresIn, used, quota }
//
// Deploy:
//   supabase functions deploy sign-mock-pdf --no-verify-jwt
// (JWT is verified in here so failures come back as JSON, not a 401 from
// the gateway — same reason as admin-ips.)
//
// Secrets:
//   PDF_R2_ACCOUNT_ID, PDF_R2_ACCESS_KEY_ID, PDF_R2_SECRET_ACCESS_KEY
//   PDF_R2_BUCKET      (default 'mockstream-audio')
//   PDF_R2_PREFIX      (default 'pdf/')
//   PDF_DAILY_QUOTA    (default '20')
// =====================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { AwsClient } from 'https://esm.sh/aws4fetch@1.0.20';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY         = Deno.env.get('SUPABASE_ANON_KEY')!;

const R2_ACCOUNT = Deno.env.get('PDF_R2_ACCOUNT_ID') || '';
const R2_KEY     = Deno.env.get('PDF_R2_ACCESS_KEY_ID') || '';
const R2_SECRET  = Deno.env.get('PDF_R2_SECRET_ACCESS_KEY') || '';
const R2_BUCKET  = Deno.env.get('PDF_R2_BUCKET') || 'mockstream-audio';
const R2_PREFIX  = Deno.env.get('PDF_R2_PREFIX') ?? 'pdf/';
const EXPIRES    = 60; // sekund — havola almashishga yaramasligi uchun qisqa

// Kvota HAR KO'NIKMA (mock_type) bo'yicha alohida hisoblanadi va birligi —
// MOK, variant emas: bitta mokning savollari va namunaviy javoblari birgalikda
// bitta sanaladi. Shunda to'rtta ko'nikmadan kuniga to'rtta mok manbasi chiqadi,
// bitta ko'nikmadan to'rttasi emas.
//
// Super adminda cheklov yo'q (markazi bo'lmagan admin); klon admini kuniga
// uchta mok; premium, ultra va VIP bittadan.
const PER_SKILL: Record<string, number> = {
  superadmin: Infinity,
  admin:   parseInt(Deno.env.get('PDF_QUOTA_ADMIN')   || '3', 10),
  premium: parseInt(Deno.env.get('PDF_QUOTA_PREMIUM') || '1', 10),
  vip:     parseInt(Deno.env.get('PDF_QUOTA_VIP')     || '1', 10),
  // Bepul mok baribir har to'plamda bitta, shuning uchun bittadan yetarli.
  free:    parseInt(Deno.env.get('PDF_QUOTA_FREE')    || '1', 10),
};

// VIP tokeni verify-passcode tomonidan imzolanadi; validate-vip-token bilan
// bir xil sir. Payload: { c: center, r: role, p: premium_ai, exp }.
const VIP_TOKEN_SECRET = Deno.env.get('VIP_TOKEN_SECRET') || '';

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

// Only the eight mock families have papers; anything else is a typo or a probe.
const TYPES = new Set([
  'cefr-reading', 'cefr-listening', 'cefr-speaking', 'cefr-writing',
  'ielts-reading', 'ielts-listening', 'ielts-speaking', 'ielts-writing',
]);

type Kind = 'superadmin' | 'admin' | 'premium' | 'vip' | 'free';
interface Who { label: string; center: string; kind: Kind }

// ── Bepul mok ──────────────────────────────────────────────────────────────
// Har to'plamdan bittasi kodsiz ishlanadi, ya'ni uning PDF'i ham hamma uchun
// ochiq bo'lishi kerak. Raqam QOTIRILMAYDI: u markaz sozlamasida turadi
// (`site_settings.center_config_<id>.freeMocks`, kalitlari pastki chiziq bilan:
// cefr_reading). Hozir hamma markazda 1, lekin admin panelidan o'zgartirilsa
// bu yer o'z-o'zidan ergashishi kerak.
const FREE_TTL = 5 * 60 * 1000;
let freeCache: { at: number; map: Record<string, Record<string, number>> } | null = null;

async function freeMocks(): Promise<Record<string, Record<string, number>>> {
  if (freeCache && Date.now() - freeCache.at < FREE_TTL) return freeCache.map;
  const out: Record<string, Record<string, number>> = {};
  const { data } = await sb
    .from('site_settings')
    .select('key, value')
    .like('key', 'center_config_%');
  for (const row of data || []) {
    let v: Record<string, unknown>;
    try {
      v = typeof row.value === 'string' ? JSON.parse(row.value) : (row.value || {});
    } catch { continue; }
    const fm = v.freeMocks as Record<string, number> | undefined;
    if (fm && typeof fm === 'object') {
      out[String(row.key).replace(/^center_config_/, '')] = fm;
    }
  }
  freeCache = { at: Date.now(), map: out };
  return out;
}

async function isFree(center: string, type: string, num: number): Promise<boolean> {
  const all = await freeMocks();
  const key = type.replace('-', '_');
  const cfg = all[center] || all['mock_stream'];
  if (cfg && Number(cfg[key]) === num) return true;
  // Markaz noma'lum bo'lsa ham, biror markazda bepul bo'lgan mok bepul qolsin —
  // aks holda klon domenidan kelgan o'quvchi o'z bepul mokidan mahrum bo'ladi.
  return Object.values(all).some((c) => Number(c[key]) === num);
}

// ── VIP tokeni ─────────────────────────────────────────────────────────────
// Oddiy mok kodi ham, premium VIP ham token oladi; farqi payloaddagi `p`
// (premium_ai) bayrog'ida. Yuklash FAQAT p=true bo'lganda beriladi —
// oddiy kod bilan kirgan o'quvchi PDF ola olmasligi kerak.
function b64urlDecode(s: string): Uint8Array {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function ctEq(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i];
  return d === 0;
}

async function vipClaims(token: string | null) {
  if (!VIP_TOKEN_SECRET || !token || !token.includes('.')) return null;
  const [payloadB64, sigB64] = token.split('.', 2);
  if (!payloadB64 || !sigB64) return null;
  try {
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(VIP_TOKEN_SECRET),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const want = new Uint8Array(await crypto.subtle.sign(
      'HMAC', key, new TextEncoder().encode(payloadB64)));
    if (!ctEq(want, b64urlDecode(sigB64))) return null;
    const claims = JSON.parse(new TextDecoder().decode(b64urlDecode(payloadB64)));
    if (typeof claims.exp === 'number' && claims.exp * 1000 < Date.now()) return null;
    return claims as { c?: string; r?: string; p?: boolean; exp?: number };
  } catch {
    return null;
  }
}

// Bir xil VIP kodi bitta kvota chelagiga tushsin: token payloadidan barqaror
// qisqa barmoq izi olinadi (kodning o'zi hech qayerda saqlanmaydi).
async function vipTag(payloadB64: string): Promise<string> {
  const h = new Uint8Array(await crypto.subtle.digest(
    'SHA-256', new TextEncoder().encode(payloadB64)));
  return 'vip:' + Array.from(h.slice(0, 6)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// The JWT is the only trustworthy identity here. A clone admin may have no
// email at all (Telegram sign-in), so match the same three ways the client's
// checkPremiumRole does: email, @username, numeric id.
async function account(req: Request): Promise<Who | null> {
  const m = (req.headers.get('authorization') || '').match(/^Bearer\s+(.+)$/i);
  if (!m) return null;

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${m[1]}` } },
  });
  const { data, error } = await userClient.auth.getUser();
  if (error || !data?.user) return null;

  const user = data.user;
  const meta = (user.user_metadata || {}) as Record<string, unknown>;
  const email = user.email ? String(user.email).toLowerCase() : '';
  const tgUser = typeof meta.telegram_username === 'string'
    ? meta.telegram_username.toLowerCase().replace(/^@/, '').trim() : '';
  let tgId: number | null = null;
  if (typeof meta.telegram_id === 'number') tgId = meta.telegram_id;
  else if (typeof meta.telegram_id === 'string' && /^\d+$/.test(meta.telegram_id)) {
    tgId = parseInt(meta.telegram_id, 10);
  }
  if (tgId === null && email) {
    const em = email.match(/^tg_(\d+)@/);
    if (em) tgId = parseInt(em[1], 10);
  }

  const ors: string[] = [];
  if (email)  ors.push(`email.eq.${email}`);
  if (tgUser) ors.push(`telegram_username.eq.${tgUser}`);
  if (tgId !== null) ors.push(`telegram_id.eq.${tgId}`);
  if (!ors.length) return null;

  const { data: rows } = await sb
    .from('premium_emails')
    .select('email, role, tier, plan, center, active, expires_at, telegram_username, telegram_id')
    .or(ors.join(','));

  const now = Date.now();
  let best: Who | null = null;
  for (const r of rows || []) {
    if (!r.active) continue;
    if (r.expires_at && Date.parse(r.expires_at) < now) continue;
    const label = r.email || (r.telegram_username ? '@' + r.telegram_username
                                                  : 'tg:' + r.telegram_id);
    if (r.role === 'admin') {
      // Markazi yo'q admin — super admin, unga cheklov qo'yilmaydi.
      return { label, center: r.center || '',
               kind: (r.center ? 'admin' : 'superadmin') };
    }
    // Premium ham, ultra ham yuklay oladi. `tier` eski ustun, `plan` yangisi —
    // ikkalasi ham qaraladi, chunki bazada ikkala shakl ham uchraydi.
    if (r.tier === 'premium' || r.plan === 'premium' || r.plan === 'ultra') {
      best = best || { label, center: r.center || '', kind: 'premium' };
    }
  }
  return best;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST')    return json(405, { error: 'POST only' });

  if (!R2_ACCOUNT || !R2_KEY || !R2_SECRET) {
    return json(500, { error: 'R2 credentials are not configured' });
  }

  // So'rov AVVAL o'qiladi: bepul mok tekshiruvi uchun qaysi mok so'ralgani
  // kerak, ya'ni huquqni undan oldin hal qilib bo'lmaydi.
  let body: {
    type?: string; number?: number | string;
    variant?: string | null; center?: string;
  };
  try { body = await req.json(); } catch { return json(400, { error: 'bad JSON' }); }

  const type = String(body.type || '');
  const num  = parseInt(String(body.number ?? ''), 10);
  const variant = body.variant === 'samples' ? 'samples' : null;

  if (!TYPES.has(type))                 return json(400, { error: 'unknown mock type' });
  if (!Number.isFinite(num) || num < 1 || num > 999) {
    return json(400, { error: 'bad mock number' });
  }

  // Huquq: hisob (admin / premium / ultra) -> VIP tokeni -> bepul mok.
  let who = await account(req);
  let ordinaryCode = false;
  if (!who) {
    const tok = req.headers.get('x-vip-token');
    const claims = await vipClaims(tok);
    if (claims) {
      if (claims.p === true) {
        who = { label: await vipTag((tok || '').split('.', 1)[0]),
                center: claims.c || '', kind: 'vip' };
      } else {
        // Oddiy mok kodi ham token oladi, lekin u faqat imtihonga kirish uchun.
        ordinaryCode = true;
      }
    }
  }

  // Har to'plamdan bittasi kodsiz ishlanadi, ya'ni uning varag'i ham hamma
  // uchun ochiq. Bu HUQUQI BOR odamga ham tegishli: premiumning kunlik yagona
  // o'rni hammaga tekin beriladigan mokka sarflanmasligi kerak. Shuning uchun
  // bepul mok kimdan kelishidan qat'i nazar 'free' chelagiga tushadi va
  // foydalanuvchining o'z chegarasini yemaydi.
  const center = String(body.center || '').trim().slice(0, 40);
  const free = await isFree(center || (who ? who.center : ''), type, num);
  if (free) {
    who = {
      label: who ? who.label
                 : 'free:' + (req.headers.get('cf-connecting-ip')
                              || req.headers.get('x-forwarded-for') || '?'),
      center: who ? who.center : center,
      kind: 'free',
    };
  }

  if (!who) {
    return json(402, {
      error: ordinaryCode
        ? "PDF yuklab olish premium imkoniyat. Oddiy mok kodi buni ochmaydi."
        : 'PDF yuklab olish premium imkoniyat. Premium yoki VIP kirish kerak.',
      upgrade: true,
    });
  }
  const quota = PER_SKILL[who.kind];

  // Sanoq SHU ko'nikma ichida va MOK birligida: variant qaralmaydi, ya'ni
  // savollarni olib, keyin namunaviy javoblarni olish bitta o'rin yeydi.
  // Bir xil mokni qayta yuklash ham yangi o'rin yemaydi (saqlanmay qolgan
  // bo'lsa yoki ikkinchi qurilmada ochsa).
  let used = 0;
  if (Number.isFinite(quota)) {
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { data: recent } = await sb
      .from('pdf_download_log')
      .select('mock_number')
      .eq('admin_email', who.label)
      .eq('mock_type', type)
      .gte('at', since);

    const seen = new Set((recent || []).map((r) => Number(r.mock_number)));
    used = seen.size;
    if (!seen.has(num) && seen.size >= quota) {
      return json(429, {
        error: `Kunlik chegara: bu ko'nikmadan 24 soatda ${quota} ta mok. `
             + `Keyinroq urinib ko'ring.`,
        used, quota, scope: type,
      });
    }
    if (!seen.has(num)) used += 1;
  }

  const name = `mock-${String(num).padStart(2, '0')}${variant ? '-samples' : ''}.pdf`;
  const key  = `${R2_PREFIX}${type}/${name}`;

  // Presigned GET against the S3 endpoint. aws4fetch puts the signature in the
  // query string with signQuery, which is what makes the URL self-contained.
  const r2 = new AwsClient({
    accessKeyId: R2_KEY,
    secretAccessKey: R2_SECRET,
    service: 's3',
    region: 'auto',
  });
  const target = new URL(
    `https://${R2_ACCOUNT}.r2.cloudflarestorage.com/${R2_BUCKET}/${key}`);
  target.searchParams.set('X-Amz-Expires', String(EXPIRES));

  let signedUrl: string;
  try {
    const signed = await r2.sign(target.toString(), {
      method: 'GET',
      aws: { signQuery: true },
    });
    signedUrl = signed.url;
  } catch (e) {
    return json(502, { error: 'signing failed', detail: String(e).slice(0, 200) });
  }

  // Logged AFTER signing succeeds, so a failed signature is not charged to the
  // admin's quota. A failed insert must not deny the download either — the log
  // is for accountability, not for gatekeeping.
  const { error: logErr } = await sb.from('pdf_download_log').insert({
    admin_email:  who.label,
    admin_center: who.center,
    mock_type:    type,
    mock_number:  num,
    variant,
    ip: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for'),
    user_agent: (req.headers.get('user-agent') || '').slice(0, 300),
  });
  if (logErr) console.error('[sign-mock-pdf] log insert failed:', logErr.message);

  return json(200, {
    url: signedUrl,
    expiresIn: EXPIRES,
    used,
    quota: Number.isFinite(quota) ? quota : null,
    kind: who.kind,
    scope: type,
  });
});
