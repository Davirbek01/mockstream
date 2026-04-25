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
const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

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
      return json(200, { access: true, valid: true, role: 'premium', via: 'center_premium_mode' });
    }
  }

  // ── 1. Try mock_codes (specific skill+mock_number, if provided) ──────────
  if (center && skill && mockNum != null) {
    const { data } = await sb
      .from('mock_codes')
      .select('code, expires_at')
      .eq('center', center)
      .eq('skill', skill)
      .eq('mock_number', mockNum)
      .maybeSingle();
    if (data && ctEq(data.code, code)) {
      if (!data.expires_at || new Date(data.expires_at) > new Date()) {
        await logAttempt(ip, true);
        return json(200, { access: true, valid: true, role: 'mock' });
      }
    }
  }

  // ── 2. Try mock_codes (any skill/mock for this center, by code) ──────────
  // This handles call sites that don't send skill/mock_number.
  if (center) {
    const { data } = await sb
      .from('mock_codes')
      .select('code, expires_at, skill, mock_number')
      .eq('center', center)
      .eq('code', code)
      .maybeSingle();
    if (data) {
      if (!data.expires_at || new Date(data.expires_at) > new Date()) {
        await logAttempt(ip, true);
        return json(200, {
          access: true, valid: true, role: 'mock',
          skill: data.skill, mock_number: data.mock_number
        });
      }
    }
  }

  // ── 3. Try VIP codes for this center (regular + premium) ─────────────────
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
            return json(200, { access: true, valid: true, role: row.type });
          }
        }
      }
    }
  }

  // ── 4. Try admin passcode (per-center, plus super-admin) ─────────────────
  // Site-admin passcode lookups: legacy clients send {passcode, type:'bsb'}
  // with the user's center. The DB stores per-center admin codes; '__super__'
  // is a global override.
  const candidates: string[] = [];
  if (center) candidates.push(center);
  candidates.push('__super__');
  for (const c of candidates) {
    const { data } = await sb
      .from('admin_passcodes')
      .select('passcode')
      .eq('center', c)
      .maybeSingle();
    if (data && ctEq(data.passcode, code)) {
      await logAttempt(ip, true);
      return json(200, {
        access: true, valid: true,
        role: c === '__super__' ? 'super_admin' : 'admin'
      });
    }
  }

  // ── Miss ─────────────────────────────────────────────────────────────────
  await logAttempt(ip, false);
  return json(200, { access: false, valid: false });
});
