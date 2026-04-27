// =====================================================================
// Supabase Edge Function: validate-vip-token
// ---------------------------------------------------------------------
// Verifies an HMAC-signed VIP token previously issued by verify-passcode.
//
// Request:  POST { token: "<payloadB64>.<sigB64>" }
// Response: 200 { valid: true,  role, premium_ai, exp }
//           200 { valid: false, error: "expired" | "bad_signature" | "malformed" | "no_secret" }
//
// Token format (issued by verify-passcode):
//   base64url( JSON({ c: center, r: role, p: premium_ai, exp: unix_sec }) )
//   "."
//   base64url( HMAC-SHA256( payloadB64, VIP_TOKEN_SECRET ) )
//
// Secret lives only in env var VIP_TOKEN_SECRET — never exposed to client.
//
// Deploy:
//   supabase functions deploy validate-vip-token --no-verify-jwt
// =====================================================================

const VIP_TOKEN_SECRET = Deno.env.get('VIP_TOKEN_SECRET') || '';

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

async function verifyToken(token: string): Promise<{ valid: boolean; role?: string; premium_ai?: boolean; exp?: number; error?: string }> {
  if (!VIP_TOKEN_SECRET) return { valid: false, error: 'no_secret' };
  if (typeof token !== 'string' || !token.includes('.')) return { valid: false, error: 'malformed' };

  const [payloadB64, sigB64] = token.split('.', 2);
  if (!payloadB64 || !sigB64) return { valid: false, error: 'malformed' };

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
    return { valid: false, error: 'crypto_error' };
  }

  let providedSig: Uint8Array;
  try { providedSig = b64urlDecode(sigB64); } catch { return { valid: false, error: 'malformed' }; }

  if (!ctEq(expectedSig, providedSig)) return { valid: false, error: 'bad_signature' };

  let payload: { c?: string; r?: string; p?: boolean; exp?: number };
  try {
    const json = new TextDecoder().decode(b64urlDecode(payloadB64));
    payload = JSON.parse(json);
  } catch {
    return { valid: false, error: 'malformed' };
  }

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== 'number' || payload.exp < now) {
    return { valid: false, error: 'expired' };
  }

  return {
    valid: true,
    role: payload.r || 'regular',
    premium_ai: !!payload.p,
    exp: payload.exp
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST')    return json(405, { valid: false, error: 'method_not_allowed' });

  let body: { token?: string } = {};
  try { body = await req.json(); } catch { /* leave empty */ }

  const result = await verifyToken(body.token || '');
  return json(200, result);
});
