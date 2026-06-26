// =====================================================================
// Supabase Edge Function: guest-results
// ---------------------------------------------------------------------
// Returns a single device's GUEST results history (native apps only).
//
// Why this exists:
//   Signed-in users read their own rows directly via RLS (user_email =
//   their JWT email). Guests have no JWT, so RLS returns nothing — that
//   was the only thing standing between an attacker (who can trivially
//   extract the public anon key from the app bundle / a network proxy)
//   and the whole `results` table. We must NEVER loosen anon RLS to read
//   by device_id, because the client-supplied device filter is not
//   enforced by Postgres — an attacker would just drop the filter and
//   pull every guest row.
//
//   Instead this function runs server-side with the service-role key
//   (which never ships in any client) and:
//     • requires EXACT device_id(s) — there is no list-all path,
//     • returns ONLY guest rows (user_email IS NULL) so a guest on a
//       shared device can't see a signed-in person's results,
//     • caps ids-per-call and row count, and rate-limits per IP.
//
//   Security therefore rests on the device_id being unguessable, which
//   it is: mobile uses the OS Android-ID / iOS idForVendor, desktop a
//   hardware machine GUID. A proxy only ever reveals the attacker's OWN
//   device id, never anyone else's, and the id space (64–122 bits) makes
//   enumeration infeasible.
//
// Request:
//   { device_ids: ["<id>", "<legacy-id>"], center?: "bek" }
//   (single string `device_id` also accepted for convenience)
//
// Response:
//   { ok: true, rows: ResultRow[] }
//   { ok: false, error: string }
//
// Deploy:
//   supabase functions deploy guest-results --no-verify-jwt
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

const MAX_IDS  = 5;     // a device + a couple of legacy ids is plenty
const MAX_ROWS = 200;   // mirrors the signed-in useResults limit
const ID_RE    = /^[A-Za-z0-9_-]{4,128}$/;

const RATE_LIMIT_MAX = 60;  // lookups
const RATE_LIMIT_SEC = 60;  // per minute, per IP

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' }
  });
}

function normCenter(c: unknown): string {
  if (typeof c !== 'string') return '';
  return c.toLowerCase().replace(/[_\s]/g, '');
}

// Reuse verify_attempts for a lightweight per-IP limit. Prefix the ip so
// these never collide with the verify-passcode code rate limiter (which
// counts by exact ip). Defense-in-depth only — id entropy is the real wall.
async function rateLimited(ip: string): Promise<boolean> {
  if (!ip) return false;
  const key = `gr:${ip}`;
  const since = new Date(Date.now() - RATE_LIMIT_SEC * 1000).toISOString();
  const { count } = await sb
    .from('verify_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('ip', key)
    .gte('ts', since);
  return (count ?? 0) >= RATE_LIMIT_MAX;
}
function logAttempt(ip: string) {
  if (!ip) return;
  sb.from('verify_attempts').insert({ ip: `gr:${ip}`, ok: true }).then(() => {});
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST')    return json(405, { ok: false, error: 'method_not_allowed' });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
          || req.headers.get('cf-connecting-ip')
          || '';
  if (await rateLimited(ip)) return json(429, { ok: false, error: 'rate_limited' });

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { body = {}; }

  // Collect, validate, de-dupe, and cap the requested device ids.
  const raw = Array.isArray(body.device_ids)
    ? body.device_ids
    : (body.device_id != null ? [body.device_id] : []);
  const ids = Array.from(new Set(
    raw.map((v) => String(v).trim()).filter((v) => ID_RE.test(v))
  )).slice(0, MAX_IDS);

  if (!ids.length) return json(400, { ok: false, error: 'bad_device_id' });

  logAttempt(ip);

  let q = sb
    .from('results')
    .select('id,exam_type,skill,score,level,caption,mock_number,report_path,created_at,metadata')
    .in('device_id', ids)
    .is('user_email', null);           // guest rows only — never expose account rows

  const center = normCenter(body.center);
  if (center) q = q.eq('center', center);  // clone-app isolation; main app omits this

  const { data, error } = await q
    .order('created_at', { ascending: false })
    .limit(MAX_ROWS);

  if (error) return json(500, { ok: false, error: 'query_failed' });
  return json(200, { ok: true, rows: data ?? [] });
});
