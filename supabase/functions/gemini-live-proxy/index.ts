// =====================================================================
// Supabase Edge Function: gemini-live-proxy
// ---------------------------------------------------------------------
// WebSocket proxy from the browser to Google's Gemini Live API. Browser
// connects with a VIP token in the URL query. We verify the token,
// then open an upstream WebSocket to Google with the real GEMINI_API_KEY
// (server-side only) and pipe messages both ways.
//
// Why: ephemeral tokens from Google's auth_tokens endpoint are not
// accepted by the Live WebSocket's `?key=` parameter (returns "API key
// not valid"). The proxy keeps the real key server-side without
// requiring ephemeral tokens to work.
//
// Connect URL (from browser):
//   wss://zknyukkbtbcqgvkgjktb.supabase.co/functions/v1/gemini-live-proxy?token=<vip>&model=<model>&api=<v1alpha|v1beta>
//
// Gate: VIP token must verify (HMAC) AND have premium flag (p:true OR
//       role 'premium'/'admin').
//
// Daily quota: 5 connections per (center, IP) per 24h via the existing
//              gemini_live_token_log table.
//
// Deploy:
//   supabase functions deploy gemini-live-proxy --no-verify-jwt
// =====================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const VIP_TOKEN_SECRET = Deno.env.get('VIP_TOKEN_SECRET') || '';
const GEMINI_API_KEY   = Deno.env.get('GEMINI_API_KEY')   || '';

const DEFAULT_MODEL = 'gemini-3.1-flash-live-preview';
const DEFAULT_API   = 'v1beta';
const SESSIONS_PER_DAY = 5;

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info, upgrade, connection'
};

// ── VIP token verify ────────────────────────────────────────────────
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
interface VipPayload { c?: string; r?: string; p?: boolean; exp?: number; }
async function verifyVipToken(token: string): Promise<{ ok: boolean; payload?: VipPayload; error?: string }> {
  if (!VIP_TOKEN_SECRET) return { ok: false, error: 'no_secret' };
  if (typeof token !== 'string' || !token.includes('.')) return { ok: false, error: 'malformed' };
  const [payloadB64, sigB64] = token.split('.', 2);
  if (!payloadB64 || !sigB64) return { ok: false, error: 'malformed' };
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(VIP_TOKEN_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payloadB64));
    const expectedSig = new Uint8Array(sig);
    const providedSig = b64urlDecode(sigB64);
    if (!ctEq(expectedSig, providedSig)) return { ok: false, error: 'bad_signature' };
    const dec = new TextDecoder().decode(b64urlDecode(payloadB64));
    const payload = JSON.parse(dec) as VipPayload;
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== 'number' || payload.exp < now) return { ok: false, error: 'expired' };
    return { ok: true, payload };
  } catch (_e) { return { ok: false, error: 'crypto_error' }; }
}

async function quotaExceeded(centerId: string, ip: string): Promise<boolean> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await sb.from('gemini_live_token_log')
    .select('id', { count: 'exact', head: true })
    .eq('center_id', centerId).eq('ip', ip).gte('issued_at', since);
  return (count ?? 0) >= SESSIONS_PER_DAY;
}
async function logIssue(centerId: string, ip: string, role: string) {
  sb.from('gemini_live_token_log').insert({ center_id: centerId, ip, role, issued_at: new Date().toISOString() }).then(() => {});
}

// ── Main handler ────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

  const url = new URL(req.url);
  const vipToken = url.searchParams.get('token') || '';
  const model    = (url.searchParams.get('model')  || DEFAULT_MODEL).replace(/[^\w.-]/g, '');
  const apiPath  = (url.searchParams.get('api')    || DEFAULT_API).replace(/[^\w.-]/g, '');

  const upgradeHeader = req.headers.get('upgrade') || '';
  if (upgradeHeader.toLowerCase() !== 'websocket') {
    return new Response(JSON.stringify({
      error: 'expected_ws_upgrade',
      hint: 'Connect via new WebSocket("wss://.../gemini-live-proxy?token=<vip>")'
    }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } });
  }

  // Gate
  const verify = await verifyVipToken(vipToken);
  if (!verify.ok) return new Response(JSON.stringify({ error: 'vip_' + (verify.error || 'invalid') }), { status: 403, headers: CORS });
  const payload = verify.payload!;
  const isPremium = payload.p === true || payload.r === 'premium' || payload.r === 'admin';
  if (!isPremium) return new Response(JSON.stringify({ error: 'not_premium' }), { status: 403, headers: CORS });

  const centerId = (payload.c || 'unknown').toString();
  const role     = (payload.r || 'unknown').toString();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('cf-connecting-ip') || '';

  if (role !== 'admin' && await quotaExceeded(centerId, ip)) {
    return new Response(JSON.stringify({ error: 'daily_quota_exceeded', limit: SESSIONS_PER_DAY }), { status: 429, headers: CORS });
  }

  if (!GEMINI_API_KEY) return new Response(JSON.stringify({ error: 'no_api_key' }), { status: 500, headers: CORS });

  // Upgrade browser connection
  const { socket: clientWS, response } = Deno.upgradeWebSocket(req);

  // Open upstream WS to Google (real API key)
  const upstreamUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.${apiPath}.GenerativeService.BidiGenerateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
  const upstream = new WebSocket(upstreamUrl);
  upstream.binaryType = 'arraybuffer';

  // Buffer browser messages until upstream is ready
  const pending: (string | ArrayBuffer)[] = [];
  let upstreamReady = false;

  const closeBoth = () => {
    try { if (clientWS.readyState === 1) clientWS.close(); } catch (_e) {}
    try { if (upstream.readyState === 1) upstream.close(); } catch (_e) {}
  };

  upstream.onopen = () => {
    upstreamReady = true;
    for (const m of pending) {
      try { upstream.send(m as any); } catch (_e) {}
    }
    pending.length = 0;
  };
  upstream.onmessage = (e) => {
    if (clientWS.readyState !== 1) return;
    try { clientWS.send(e.data); } catch (_e) {}
  };
  upstream.onerror = (_e) => { closeBoth(); };
  upstream.onclose = (e) => {
    try { if (clientWS.readyState === 1) clientWS.close(e.code === 1005 ? 1000 : e.code, e.reason || ''); } catch (_e) {}
  };

  clientWS.onmessage = (e) => {
    if (!upstreamReady) {
      pending.push(e.data as any);
      return;
    }
    try { upstream.send(e.data as any); } catch (_e) {}
  };
  clientWS.onerror = (_e) => { closeBoth(); };
  clientWS.onclose = () => {
    try { if (upstream.readyState === 1) upstream.close(); } catch (_e) {}
  };

  // Log connection AFTER successful gate (before WS handshake completes is OK).
  logIssue(centerId, ip, role);

  return response;
});
