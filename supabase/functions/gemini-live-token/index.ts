// =====================================================================
// Supabase Edge Function: gemini-live-token
// ---------------------------------------------------------------------
// Mints a short-lived ephemeral token for the Gemini Live API
// (gemini-3.1-flash-live-preview). The browser then opens the WebSocket
// directly to Google with this token — the raw GEMINI_API_KEY never
// leaves the server.
//
// Gate: caller must present a valid VIP token (issued by verify-passcode)
//       AND the token's `p` (premium_ai) flag must be true. Anything
//       else returns 403.
//
// Request:  POST { token: "<vip_token>", model?: "gemini-3.1-flash-live-preview" }
// Response: 200 { token: "<ephemeral_token>", expires_at: <unix_sec>, model: "..." }
//           4xx { error: "..." }
//
// Token mint endpoint (Google docs, 2026-05):
//   POST https://generativelanguage.googleapis.com/v1alpha/auth_tokens?key=GEMINI_API_KEY
//
// Quota: per-VIP-token-center 5 sessions/day, soft limit via the
//        `gemini_live_token_log` table (see migration). Free this up by
//        cleaning logs older than 24h.
//
// Deploy:
//   supabase functions deploy gemini-live-token --no-verify-jwt
// =====================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const VIP_TOKEN_SECRET  = Deno.env.get('VIP_TOKEN_SECRET') || '';
const GEMINI_API_KEY    = Deno.env.get('GEMINI_API_KEY')   || '';

const DEFAULT_MODEL     = 'gemini-3.1-flash-live-preview';
// How long the ephemeral token is valid. Google accepts a window;
// 30 min is enough for a full 4-part exam with prep time.
const SESSION_TTL_SEC   = 30 * 60;
// Server-side daily quota — caps total cost per user/day. Soft; the
// final cost cap is the per-clone billing alert on Google's side.
const SESSIONS_PER_DAY  = 5;

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info'
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' }
  });
}

// ── VIP token verification (mirrors validate-vip-token) ─────────────
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
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

interface VipPayload {
  c?: string;     // center id
  r?: string;     // role: 'regular' | 'premium' | 'admin' | 'mock'
  p?: boolean;    // premium_ai flag
  exp?: number;   // unix seconds
}

async function verifyVipToken(token: string): Promise<{ ok: boolean; payload?: VipPayload; error?: string }> {
  if (!VIP_TOKEN_SECRET) return { ok: false, error: 'no_secret' };
  if (typeof token !== 'string' || !token.includes('.')) return { ok: false, error: 'malformed' };
  const [payloadB64, sigB64] = token.split('.', 2);
  if (!payloadB64 || !sigB64) return { ok: false, error: 'malformed' };

  let expectedSig: Uint8Array;
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(VIP_TOKEN_SECRET),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payloadB64));
    expectedSig = new Uint8Array(sig);
  } catch (_e) {
    return { ok: false, error: 'crypto_error' };
  }

  let providedSig: Uint8Array;
  try { providedSig = b64urlDecode(sigB64); } catch { return { ok: false, error: 'malformed' }; }
  if (!ctEq(expectedSig, providedSig)) return { ok: false, error: 'bad_signature' };

  let payload: VipPayload;
  try {
    const dec = new TextDecoder().decode(b64urlDecode(payloadB64));
    payload = JSON.parse(dec);
  } catch { return { ok: false, error: 'malformed' }; }

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== 'number' || payload.exp < now) {
    return { ok: false, error: 'expired' };
  }
  return { ok: true, payload };
}

// ── Per-day quota (logs into gemini_live_token_log) ─────────────────
async function quotaExceeded(centerId: string, ip: string): Promise<boolean> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  // Count by (center,ip) — admin override if needed via the role check below.
  const { count } = await sb
    .from('gemini_live_token_log')
    .select('id', { count: 'exact', head: true })
    .eq('center_id', centerId)
    .eq('ip', ip)
    .gte('issued_at', since);
  return (count ?? 0) >= SESSIONS_PER_DAY;
}

async function logIssue(centerId: string, ip: string, role: string) {
  // Fire-and-forget; failure to log must not break token issuance.
  sb.from('gemini_live_token_log').insert({
    center_id: centerId,
    ip,
    role,
    issued_at: new Date().toISOString()
  }).then(() => {});
}

// ── Google ephemeral-token mint ─────────────────────────────────────
// Endpoint per Gemini Live API docs (2026-05): mint a session-scoped
// auth token that the browser uses on the WebSocket. The raw API key
// never leaves the server.
async function mintGoogleEphemeral(model: string): Promise<{ ok: boolean; token?: string; expires_at?: number; error?: string }> {
  if (!GEMINI_API_KEY) return { ok: false, error: 'no_api_key' };

  const expireMs   = Date.now() + SESSION_TTL_SEC * 1000;
  const expireIso  = new Date(expireMs).toISOString();
  // newSessionExpireTime defines the window during which the token can
  // be used to OPEN a session; once open, the session stays alive until
  // expire_time. We give them a 2-min window to open after issuance.
  const newSessionExpireIso = new Date(Date.now() + 2 * 60 * 1000).toISOString();

  const url = `https://generativelanguage.googleapis.com/v1alpha/auth_tokens?key=${encodeURIComponent(GEMINI_API_KEY)}`;
  const body = {
    config: {
      uses: 1,
      expire_time: expireIso,
      new_session_expire_time: newSessionExpireIso,
      live_connect_constraints: {
        model: `models/${model}`
      }
    }
  };

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!r.ok) {
      const txt = await r.text();
      return { ok: false, error: `google_${r.status}: ${txt.slice(0, 240)}` };
    }
    const data = await r.json();
    // Response shape (subject to Google API changes — verify on first call):
    //   { name: "auth_tokens/<id>" }   ← the "name" is the ephemeral token
    // Some samples return { token: "..." } — accept either.
    const token = data?.name || data?.token;
    if (!token) return { ok: false, error: 'no_token_in_response' };
    return { ok: true, token, expires_at: Math.floor(expireMs / 1000) };
  } catch (e) {
    return { ok: false, error: `fetch_error: ${(e as Error).message}` };
  }
}

// ── Main handler ────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST')    return json(405, { error: 'method_not_allowed' });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
          || req.headers.get('cf-connecting-ip')
          || '';

  let body: { token?: string; model?: string } = {};
  try { body = await req.json(); } catch { return json(400, { error: 'bad_json' }); }

  if (!body.token) return json(400, { error: 'missing_token' });

  const verify = await verifyVipToken(body.token);
  if (!verify.ok) {
    return json(403, { error: 'vip_' + (verify.error || 'invalid') });
  }
  const payload = verify.payload!;

  // Premium gate: must have p:true OR role 'premium' / 'admin'.
  const isPremium = payload.p === true
                 || payload.r === 'premium'
                 || payload.r === 'admin';
  if (!isPremium) {
    return json(403, { error: 'not_premium' });
  }

  const centerId = (payload.c || 'unknown').toString();
  const role     = (payload.r || 'unknown').toString();

  // Admin bypasses the daily quota (so the user can test freely).
  if (role !== 'admin' && await quotaExceeded(centerId, ip)) {
    return json(429, { error: 'daily_quota_exceeded', limit: SESSIONS_PER_DAY });
  }

  const model = (body.model && /^[\w.-]+$/.test(body.model))
    ? body.model
    : DEFAULT_MODEL;

  const mint = await mintGoogleEphemeral(model);
  if (!mint.ok) {
    return json(502, { error: 'mint_failed', detail: mint.error });
  }

  // Log AFTER successful mint, so a failed mint doesn't burn quota.
  logIssue(centerId, ip, role);

  return json(200, {
    token: mint.token,
    expires_at: mint.expires_at,
    model,
    center: centerId
  });
});
