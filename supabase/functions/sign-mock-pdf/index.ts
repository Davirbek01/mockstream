// =====================================================================
// Supabase Edge Function: sign-mock-pdf
// ---------------------------------------------------------------------
// Hands an admin ONE short-lived presigned URL for ONE mock PDF, logs
// the grant, and enforces a daily quota.
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
const QUOTA      = parseInt(Deno.env.get('PDF_DAILY_QUOTA') || '20', 10);
const EXPIRES    = 60; // sekund — havola almashishga yaramasligi uchun qisqa

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

interface Admin { email: string | null; center: string; label: string }

// The JWT is the only trustworthy identity here. A clone admin may have no
// email at all (Telegram sign-in), so match the same three ways the client's
// checkPremiumRole does: email, @username, numeric id.
async function admin(req: Request): Promise<Admin | null> {
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
    .select('email, role, center, active, expires_at, telegram_username, telegram_id')
    .or(ors.join(','));

  const now = Date.now();
  for (const r of rows || []) {
    if (r.role !== 'admin' || !r.active) continue;
    if (r.expires_at && Date.parse(r.expires_at) < now) continue;
    return {
      email: r.email || null,
      center: r.center || '',
      label: r.email || (r.telegram_username ? '@' + r.telegram_username
                                             : 'tg:' + r.telegram_id),
    };
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST')    return json(405, { error: 'POST only' });

  if (!R2_ACCOUNT || !R2_KEY || !R2_SECRET) {
    return json(500, { error: 'R2 credentials are not configured' });
  }

  const who = await admin(req);
  if (!who) {
    return json(403, { error: 'Mock PDFs are for admins only. Sign in with your admin account.' });
  }

  let body: { type?: string; number?: number | string; variant?: string | null };
  try { body = await req.json(); } catch { return json(400, { error: 'bad JSON' }); }

  const type = String(body.type || '');
  const num  = parseInt(String(body.number ?? ''), 10);
  const variant = body.variant === 'samples' ? 'samples' : null;

  if (!TYPES.has(type))                 return json(400, { error: 'unknown mock type' });
  if (!Number.isFinite(num) || num < 1 || num > 999) {
    return json(400, { error: 'bad mock number' });
  }

  // Quota counts DISTINCT papers over 24h, so re-downloading the same file
  // (a failed save, a second device) does not burn a fresh slot.
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { data: recent } = await sb
    .from('pdf_download_log')
    .select('mock_type, mock_number, variant')
    .eq('admin_email', who.label)
    .gte('at', since);

  const seen = new Set((recent || []).map(
    (r) => `${r.mock_type}/${r.mock_number}/${r.variant || ''}`));
  const mine = `${type}/${num}/${variant || ''}`;
  if (!seen.has(mine) && seen.size >= QUOTA) {
    return json(429, {
      error: `Kunlik chegara: 24 soatda ${QUOTA} ta PDF. Keyinroq urinib ko'ring.`,
      used: seen.size, quota: QUOTA,
    });
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
    used: seen.has(mine) ? seen.size : seen.size + 1,
    quota: QUOTA,
  });
});
