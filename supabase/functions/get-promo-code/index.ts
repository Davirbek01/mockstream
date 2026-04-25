// =====================================================================
// Supabase Edge Function: get-promo-code
// ---------------------------------------------------------------------
// Hands out a REGULAR mock code (no AI grading, no premium features) to
// the support-tab chat bubble, so the AI assistant can give visitors a
// "free try" while upselling Premium.
//
// Request: JSON POST
//   {
//     center: "achievers",            // SITE_CONFIG.testIdentifier (normalized)
//     skill: "listening|reading|writing|speaking|full_mock",
//     mock_number: 12,                // optional; required for non-fullmock if
//                                     // user picked a specific number
//     user_key: "device:abc|email:x"  // stable per-user identifier
//   }
//
// Response:
//   { ok, code, mock_number, skill, center, tier:'regular',
//     daily_used, daily_remaining, hourly_locked_until?, upsell }
// or { ok:false, error, retry_after_seconds?, daily_remaining? }
//
// Rate limits (per user_key):
//   - Max 1 handout per 60 minutes
//   - Max 4 handouts per 24 hours
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
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age':       '86400',
};

const HOURLY_CAP = 1;
const DAILY_CAP  = 4;
const SKILLS = new Set(['listening', 'reading', 'writing', 'speaking', 'full_mock']);

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' }
  });
}

function normalizeCenter(raw: string): string {
  const c = (raw || '').toLowerCase().trim();
  if (c === 'mock_stream') return 'mockstream';
  return c;
}

function normalizeSkill(raw: string): string {
  const s = (raw || '').toLowerCase().trim().replace(/-/g, '_');
  if (s === 'fullmock') return 'full_mock';
  return s;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST')    return json(405, { ok: false, error: 'method_not_allowed' });

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return json(400, { ok: false, error: 'invalid_json' }); }

  const center  = normalizeCenter(String(body.center || ''));
  const skill   = normalizeSkill(String(body.skill || ''));
  const userKey = String(body.user_key || '').trim().slice(0, 200);
  const ipHdr   = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
  const ip      = ipHdr.split(',')[0].trim().slice(0, 64);
  const fullKey = userKey ? `${userKey}|ip:${ip}` : `ip:${ip}`;

  let mockNumber: number | null = null;
  if (skill === 'full_mock') {
    mockNumber = 1; // full mock always uses #1
  } else if (body.mock_number !== undefined && body.mock_number !== null && body.mock_number !== '') {
    const n = parseInt(String(body.mock_number), 10);
    if (!Number.isInteger(n) || n < 1 || n > 999) {
      return json(400, { ok: false, error: 'invalid_mock_number' });
    }
    mockNumber = n;
  }

  if (!center)        return json(400, { ok: false, error: 'missing_center' });
  if (!SKILLS.has(skill)) return json(400, { ok: false, error: 'invalid_skill' });
  if (!fullKey || fullKey === 'ip:') return json(400, { ok: false, error: 'missing_user_key' });

  // ─── Rate-limit check ──────────────────────────────────────────────
  const now = Date.now();
  const since24h = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const { data: recent, error: rateErr } = await sb
    .from('promo_handouts')
    .select('issued_at')
    .eq('user_key', fullKey)
    .gte('issued_at', since24h)
    .order('issued_at', { ascending: false });
  if (rateErr) return json(500, { ok: false, error: 'rate_check_failed: ' + rateErr.message });

  const dailyUsed = (recent ?? []).length;
  if (dailyUsed >= DAILY_CAP) {
    const oldest = new Date((recent![DAILY_CAP - 1] as { issued_at: string }).issued_at).getTime();
    const resetAt = oldest + 24 * 60 * 60 * 1000;
    return json(429, {
      ok: false,
      error: 'daily_limit_reached',
      daily_used: dailyUsed,
      daily_cap: DAILY_CAP,
      retry_after_seconds: Math.max(60, Math.round((resetAt - now) / 1000)),
      next_allowed_at: new Date(resetAt).toISOString(),
      message: `Free tier allows ${DAILY_CAP} mock codes per day. Upgrade to Premium for unlimited access plus AI grading.`
    });
  }

  if (recent && recent.length > 0) {
    const lastTs = new Date((recent[0] as { issued_at: string }).issued_at).getTime();
    const hourlyResetAt = lastTs + HOURLY_CAP * 60 * 60 * 1000;
    if (hourlyResetAt > now) {
      return json(429, {
        ok: false,
        error: 'hourly_limit_reached',
        daily_used: dailyUsed,
        daily_remaining: DAILY_CAP - dailyUsed,
        retry_after_seconds: Math.max(60, Math.round((hourlyResetAt - now) / 1000)),
        next_allowed_at: new Date(hourlyResetAt).toISOString(),
        message: `Free tier allows 1 mock code per hour. Try again in a bit, or upgrade to Premium for instant unlimited access.`
      });
    }
  }

  // ─── Lookup the regular mock code ──────────────────────────────────
  let codeRow: { code: string; mock_number: number; expires_at: string | null } | null = null;

  if (mockNumber !== null) {
    const { data, error } = await sb
      .from('mock_codes')
      .select('code, mock_number, expires_at')
      .eq('center', center).eq('skill', skill).eq('mock_number', mockNumber).eq('tier', 'regular')
      .maybeSingle();
    if (error) return json(500, { ok: false, error: 'lookup_failed: ' + error.message });
    codeRow = data;
  } else {
    // No specific number: pick one the user hasn't received recently for this skill.
    const { data: pool, error: pErr } = await sb
      .from('mock_codes')
      .select('code, mock_number, expires_at')
      .eq('center', center).eq('skill', skill).eq('tier', 'regular');
    if (pErr) return json(500, { ok: false, error: 'lookup_failed: ' + pErr.message });
    const all = (pool ?? []) as Array<{ code: string; mock_number: number; expires_at: string | null }>;
    if (!all.length) {
      return json(404, { ok: false, error: 'no_codes_available', center, skill });
    }
    const { data: prev } = await sb
      .from('promo_handouts')
      .select('mock_number')
      .eq('user_key', fullKey).eq('center', center).eq('skill', skill)
      .gte('issued_at', since24h);
    const taken = new Set((prev ?? []).map(p => (p as { mock_number: number }).mock_number));
    const fresh = all.filter(r => !taken.has(r.mock_number));
    const pick  = (fresh.length ? fresh : all)[Math.floor(Math.random() * (fresh.length ? fresh.length : all.length))];
    codeRow = pick;
  }

  if (!codeRow || !codeRow.code) {
    return json(404, { ok: false, error: 'code_not_found', center, skill, mock_number: mockNumber });
  }

  // ─── Log handout ────────────────────────────────────────────────────
  const insertRow = {
    user_key: fullKey,
    center,
    skill,
    mock_number: codeRow.mock_number,
    code: codeRow.code
  };
  const { error: logErr } = await sb.from('promo_handouts').insert(insertRow);
  if (logErr) {
    // Non-fatal: still return the code, but warn.
    console.warn('[get-promo-code] handout log failed:', logErr.message);
  }
  // Audit too (best-effort, fire-and-forget).
  sb.from('code_audit').insert({
    actor: 'support_bot',
    action: 'handout_regular_code',
    center,
    details: { skill, mock_number: codeRow.mock_number, user_key: fullKey, ip }
  }).then(() => {});

  return json(200, {
    ok: true,
    code: codeRow.code,
    mock_number: codeRow.mock_number,
    skill,
    center,
    tier: 'regular',
    expires_at: codeRow.expires_at,
    daily_used: dailyUsed + 1,
    daily_remaining: DAILY_CAP - (dailyUsed + 1),
    hourly_locked_until: new Date(now + HOURLY_CAP * 60 * 60 * 1000).toISOString(),
    upsell: {
      headline: '🔥 Want more? Upgrade to Premium',
      bullets: [
        '🤖 Instant AI scoring with detailed feedback',
        '📝 Full transcripts for speaking & writing',
        '🔁 Retry mocks as many times as you want',
        '⚡ One code unlocks ALL skills',
        '♾ No daily/hourly limits'
      ]
    }
  });
});
