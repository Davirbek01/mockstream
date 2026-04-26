// ============================================================
// Supabase Edge Function: verify-telegram-init
// ------------------------------------------------------------
// Verifies a Telegram Mini App initData payload and returns the
// signed user identity. Only purpose: let landing.html bypass
// Google sign-in when opened from inside a center bot's Mini App.
//
// Request:  POST { center_id: "mock_stream", init_data: "..." }
// Response: 200 { ok:true, user:{id,first_name,last_name,username,photo_url,language_code,auth_date} }
//           4xx { ok:false, error:"..." }
//
// Verification follows Telegram's spec:
//   secret_key = HMAC_SHA256("WebAppData", bot_token)
//   check_string = sorted "key=value" pairs (excluding `hash`) joined by \n
//   expected = HMAC_SHA256(secret_key, check_string).hex
//   require expected == params.hash AND auth_date within 24h
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const MAX_AGE_SECONDS = 24 * 60 * 60; // reject initData older than 24h

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS }
  });
}

async function hmacSha256(keyBytes: Uint8Array, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return new Uint8Array(sig);
}
function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}
function ctEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

async function loadBotToken(centerId: string): Promise<string | null> {
  const { data } = await sb
    .from('center_bots')
    .select('bot_token_env, active')
    .eq('center_id', centerId)
    .maybeSingle();
  if (!data || data.active === false) return null;
  const env = String(data.bot_token_env || '').trim();
  if (!env) return null;
  return Deno.env.get(env) || null;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST')    return json(405, { ok: false, error: 'method not allowed' });

  let body: { center_id?: string; init_data?: string };
  try { body = await req.json(); }
  catch { return json(400, { ok: false, error: 'bad json' }); }

  const centerId = String(body.center_id || '').trim();
  const initData = String(body.init_data || '').trim();
  if (!centerId || !initData) {
    return json(400, { ok: false, error: 'center_id and init_data required' });
  }

  const token = await loadBotToken(centerId);
  if (!token) return json(404, { ok: false, error: 'center not configured' });

  // Parse the initData query string
  const params = new URLSearchParams(initData);
  const hash   = params.get('hash');
  if (!hash) return json(400, { ok: false, error: 'missing hash' });

  // Build the data_check_string: alphabetical sort, exclude `hash`
  const pairs: string[] = [];
  for (const [k, v] of params.entries()) {
    if (k === 'hash') continue;
    pairs.push(`${k}=${v}`);
  }
  pairs.sort();
  const checkString = pairs.join('\n');

  // secret_key = HMAC_SHA256("WebAppData", bot_token)
  const secretKey = await hmacSha256(new TextEncoder().encode(token), 'WebAppData');
  // expected = HMAC_SHA256(secret_key, check_string)
  const expectedBytes = await hmacSha256(secretKey, checkString);
  const expected = toHex(expectedBytes);

  if (!ctEq(expected, hash)) {
    return json(401, { ok: false, error: 'invalid signature' });
  }

  // Freshness check
  const authDate = Number(params.get('auth_date') || 0);
  if (!authDate || (Date.now() / 1000) - authDate > MAX_AGE_SECONDS) {
    return json(401, { ok: false, error: 'init_data expired' });
  }

  // Parse the user payload
  let user: Record<string, unknown> = {};
  try { user = JSON.parse(params.get('user') || '{}'); }
  catch { return json(400, { ok: false, error: 'malformed user' }); }
  const tgUserId = Number((user as { id?: number }).id);
  if (!tgUserId) return json(400, { ok: false, error: 'missing user.id' });

  return json(200, {
    ok:   true,
    user: {
      id:            tgUserId,
      first_name:    String((user as { first_name?: string }).first_name || ''),
      last_name:     String((user as { last_name?: string }).last_name || ''),
      username:      String((user as { username?: string }).username || ''),
      language_code: String((user as { language_code?: string }).language_code || ''),
      photo_url:     String((user as { photo_url?: string }).photo_url || ''),
      is_premium:    Boolean((user as { is_premium?: boolean }).is_premium),
      auth_date:     authDate
    },
    center_id: centerId
  });
});
