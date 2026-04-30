// =====================================================================
// Supabase Edge Function: verify-passcode
// ---------------------------------------------------------------------
// Drop-in replacement for both alwaysdata /verify endpoints:
//   - davirbek.alwaysdata.net/verify   (regular VIP codes)
//   - admin0709.alwaysdata.net/verify  (premium VIP + site-admin)
//
// Accepts ALL legacy request shapes (kept identical so client call sites
// don't need body-shape changes — only URL swaps):
//
//   { code: "12345678",   center: "mockstream" }            // regular VIP
//   { passcode: "12345678", center: "mockstream" }          // premium VIP
//   { passcode: "12345678", center: "mockstream",
//     type: "bsb", validate: true }                         // site-admin
//   { passcode: 12345678 }   // (number, premium fallback)
//
//   Plus new (preferred) shape used by mock-code unlocks:
//     { code, center, skill: "listening", mock_number: 1 }
//
// Response (matches alwaysdata):
//   { access: true,  valid: true, role?: 'regular'|'premium'|'admin'|'mock' }
//   { access: false, valid: false, error?: string }
//
// Security:
//   - service-role DB access (RLS blocks all anon reads)
//   - per-IP rate limit: 10 attempts / 60 sec → 429
//   - constant-time string comparison
//   - always returns generic { access:false } on miss (no enumeration leak)
//
// Deploy:
//   supabase functions deploy verify-passcode --no-verify-jwt
// =====================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const VIP_TOKEN_SECRET = Deno.env.get('VIP_TOKEN_SECRET') || '';
const VIP_TOKEN_TTL_SEC = 4 * 60 * 60; // 4 hours
const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// ── HMAC-SHA256 signed VIP token ──────────────────────────────────────────
// Format: base64url(payload).base64url(sig)
// Payload: { c: center, r: role, p: premium_ai, exp: unix_seconds }
// Secret lives only in VIP_TOKEN_SECRET env var (never sent to browser).
function b64urlEncode(bytes: Uint8Array): string {
  let s = btoa(String.fromCharCode(...bytes));
  return s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
async function mintVipToken(payload: Record<string, unknown>): Promise<string | null> {
  if (!VIP_TOKEN_SECRET) return null;
  try {
    const enc = new TextEncoder();
    const payloadJson = JSON.stringify(payload);
    const payloadB64 = b64urlEncode(enc.encode(payloadJson));
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(VIP_TOKEN_SECRET),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payloadB64));
    const sigB64 = b64urlEncode(new Uint8Array(sig));
    return `${payloadB64}.${sigB64}`;
  } catch (_e) {
    return null;
  }
}
async function withToken(resp: Record<string, unknown>, role: string, premium: boolean, center: string): Promise<Record<string, unknown>> {
  const exp = Math.floor(Date.now() / 1000) + VIP_TOKEN_TTL_SEC;
  const token = await mintVipToken({ c: center, r: role, p: premium, exp });
  if (token) resp.token = token;
  return resp;
}

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info'
};

const RATE_LIMIT_MAX = 10;       // attempts
const RATE_LIMIT_SEC = 60;       // window

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' }
  });
}

// Constant-time equal (prevents timing side-channel on code lookup).
function ctEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Center id normalization — older clients send "mock_stream", new convention is
// "mockstream". Strip underscores and lowercase.
function normCenter(c: unknown): string {
  if (typeof c !== 'string') return '';
  return c.toLowerCase().replace(/[_\s]/g, '');
}

async function rateLimited(ip: string): Promise<boolean> {
  if (!ip) return false;
  const since = new Date(Date.now() - RATE_LIMIT_SEC * 1000).toISOString();
  const { count } = await sb
    .from('verify_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('ts', since);
  return (count ?? 0) >= RATE_LIMIT_MAX;
}

async function logAttempt(ip: string, ok: boolean) {
  if (!ip) return;
  // Fire-and-forget; failure to log must not break verification.
  sb.from('verify_attempts').insert({ ip, ok }).then(() => {});
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST')    return json(405, { access: false, error: 'method_not_allowed' });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
          || req.headers.get('cf-connecting-ip')
          || '';

  if (await rateLimited(ip)) {
    return json(429, { access: false, valid: false, error: 'rate_limited' });
  }

  let body: Record<string, unknown> = {};
  try {
    const ct = req.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      body = await req.json();
    } else if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
      const form = await req.formData();
      form.forEach((v, k) => { body[k] = v; });
    } else {
      // Try JSON anyway as a last resort
      const txt = await req.text();
      try { body = txt ? JSON.parse(txt) : {}; } catch { body = {}; }
    }
  } catch {
    body = {};
  }

  // Pull code from any of the legacy field names.
  const rawCode = body.code ?? body.passcode ?? body.otp ?? '';
  const code = String(rawCode).trim();
  const center = normCenter(body.center ?? body.testIdentifier ?? '');
  const skill  = typeof body.skill === 'string' ? body.skill.toLowerCase().replace(/-/g, '_') : '';
  const mockNum = body.mock_number != null ? parseInt(String(body.mock_number), 10) : null;

  if (!code) {
    // ── Email-based premium auto-unlock (Google / magic-link signed-in) ────
    // Body: { email_auth: true, user_jwt: "<supabase access token>", center }
    // Server validates JWT, extracts email, checks premium_emails, mints token.
    // Cannot be forged client-side because JWT is signed by Supabase auth.
    if (body.email_auth && typeof body.user_jwt === 'string' && body.user_jwt) {
      try {
        const { data: userData, error: userErr } = await sb.auth.getUser(body.user_jwt);
        const email = userData?.user?.email ? String(userData.user.email).toLowerCase() : '';
        if (!userErr && email) {
          const { data: rows } = await sb
            .from('premium_emails')
            .select('tier, role, center, active')
            .eq('email', email)
            .eq('active', true);
          if (rows && rows.length) {
            // Prefer a row whose center matches this site, else fall back to
            // any-center (empty/null center column treated as wildcard).
            const match = rows.find((r: any) =>
              !r.center || r.center === '' || normCenter(r.center) === center
            ) || (rows.find((r: any) => r.role === 'admin') || null);
            if (match) {
              const role = match.role === 'admin'
                ? 'admin'
                : (match.tier === 'premium' ? 'premium' : 'regular');
              const premium = match.tier === 'premium' || match.role === 'admin';
              await logAttempt(ip, true);
              const resp = await withToken(
                { access: true, valid: true, role, via: 'email_auth', tier: match.tier, email },
                role, premium, center || normCenter(match.center) || ''
              );
              return json(200, resp);
            }
          }
        }
      } catch (_e) { /* fall through to no_code */ }
    }

    // Allow code-less requests ONLY for center premium-mode token minting.
    // Server-side check against centers table is authoritative (cache tampering
    // on the client cannot fake this).
    if (center) {
      const { data: centerRow } = await sb
        .from('centers')
        .select('premium_mode')
        .eq('id', center)
        .maybeSingle();
      if (centerRow?.premium_mode) {
        await logAttempt(ip, true);
        const resp = await withToken({ access: true, valid: true, role: 'premium', via: 'center_premium_mode' }, 'premium', true, center);
        return json(200, resp);
      }
    }
    await logAttempt(ip, false);
    return json(200, { access: false, valid: false, error: 'no_code' });
  }

  // Center-level premium-mode: if true, ANY attempt succeeds (whole center
  // is unlocked). This matches the SITE_CONFIG.access='premium' bypass.
  if (center) {
    const { data: centerRow } = await sb
      .from('centers')
      .select('premium_mode')
      .eq('id', center)
      .maybeSingle();
    if (centerRow?.premium_mode) {
      await logAttempt(ip, true);
      const resp = await withToken({ access: true, valid: true, role: 'premium', via: 'center_premium_mode' }, 'premium', true, center);
      return json(200, resp);
    }
  }

  // ── 1. Try mock_codes — ONLY when caller specifies skill+mock_number ─────
  // (i.e. an actual per-mock unlock screen on Listening/Reading/Speaking/etc.)
  // We deliberately do NOT do a center-wide "any mock_code by value" lookup,
  // because mock codes must never unlock the global VIP input or admin gates.
  if (center && skill && mockNum != null) {
    const { data } = await sb
      .from('mock_codes')
      .select('code, expires_at, tier')
      .eq('center', center)
      .eq('skill', skill)
      .eq('mock_number', mockNum);
    if (data) {
      for (const row of data) {
        if (ctEq(row.code, code)) {
          if (!row.expires_at || new Date(row.expires_at) > new Date()) {
            await logAttempt(ip, true);
            const t = (row as { tier?: string }).tier === 'regular' ? 'regular' : 'premium';
            const resp = await withToken({ access: true, valid: true, role: t, source: 'mock', tier: t }, t, t === 'premium', center);
            return json(200, resp);
          }
        }
      }
    }
  }

  // ── 2. Try VIP codes for this center (regular + premium) ─────────────────
  if (center) {
    const { data } = await sb
      .from('vip_codes')
      .select('type, code, expires_at')
      .eq('center', center);
    if (data) {
      for (const row of data) {
        if (ctEq(row.code, code)) {
          if (!row.expires_at || new Date(row.expires_at) > new Date()) {
            await logAttempt(ip, true);
            const r = String(row.type || 'regular');
            const resp = await withToken({ access: true, valid: true, role: r }, r, r === 'premium', center);
            return json(200, resp);
          }
        }
      }
    }
  }

  // ── 3. Try admin passcode (per-center, plus super-admin) ─────────────────
  // Site-admin passcode lookups: legacy clients send {passcode, type:'bsb'}
  // with the user's center. The DB stores per-center admin codes; '__super__'
  // is a global override.
  //
  // For view.html locked report links, clients also send result_id. The row
  // is fetched here under service-role so (a) center admins can unlock links
  // opened on cross-center clone domains where anon RLS blocks the meta read,
  // and (b) the row data is bundled into the response so view.html doesn't
  // need a separate REST fetch (which RLS would block for anon callers).
  let lockedResultRow:
    | { id: string; report_path: string; student_name: string; skill: string; exam_type: string; center: string }
    | null = null;
  const rawResultId = typeof body.result_id === 'string' ? body.result_id.trim() : '';
  if (rawResultId && /^[0-9a-f-]{36}$/i.test(rawResultId)) {
    const { data } = await sb
      .from('results')
      .select('id, report_path, student_name, skill, exam_type, center')
      .eq('id', rawResultId)
      .maybeSingle();
    if (data) lockedResultRow = data as typeof lockedResultRow;
  }

  const candidates: string[] = [];
  if (lockedResultRow && lockedResultRow.center) {
    const rowCenter = normCenter(lockedResultRow.center);
    if (rowCenter) candidates.push(rowCenter);
  }
  if (center && !candidates.includes(center)) candidates.push(center);
  candidates.push('__super__');
  for (const c of candidates) {
    const { data } = await sb
      .from('admin_passcodes')
      .select('passcode')
      .eq('center', c)
      .maybeSingle();
    if (data && ctEq(data.passcode, code)) {
      await logAttempt(ip, true);
      const r = c === '__super__' ? 'super_admin' : 'admin';
      const resp: Record<string, unknown> = await withToken({ access: true, valid: true, role: r }, r, true, center || c);
      if (lockedResultRow) {
        // Super admin sees any row; center admin only sees rows from their center.
        const rowCenter = normCenter(lockedResultRow.center);
        if (r === 'super_admin' || rowCenter === c) {
          resp.report = {
            id: lockedResultRow.id,
            report_path: lockedResultRow.report_path,
            student_name: lockedResultRow.student_name,
            skill: lockedResultRow.skill,
            exam_type: lockedResultRow.exam_type
          };
        }
      }
      return json(200, resp);
    }
  }

  // ── Miss ─────────────────────────────────────────────────────────────────
  await logAttempt(ip, false);
  return json(200, { access: false, valid: false });
});
