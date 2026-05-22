// =====================================================================
// Supabase Edge Function: speaking-realtime-admin
// ---------------------------------------------------------------------
// Admin-only operations for realtime speaking sessions:
//   POST { action: 'list',   token, limit?, offset? }
//   POST { action: 'audio',  token, id }   → signed playback URL
//   POST { action: 'delete', token, id }   → remove row + audio file
//
// Gate: VIP token role MUST be 'admin'. Anything else returns 403.
//
// Deploy:
//   supabase functions deploy speaking-realtime-admin --no-verify-jwt
// =====================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const VIP_TOKEN_SECRET = Deno.env.get('VIP_TOKEN_SECRET') || '';
const BUCKET = 'speaking-realtime-sessions';

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info'
};
function json(s: number, b: unknown) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });
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
async function verifyAdminToken(token: string): Promise<{ ok: boolean; centerId?: string; error?: string }> {
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
    const payload = JSON.parse(dec);
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== 'number' || payload.exp < now) return { ok: false, error: 'expired' };
    if (payload.r !== 'admin') return { ok: false, error: 'not_admin' };
    return { ok: true, centerId: (payload.c || 'unknown').toString() };
  } catch (_e) { return { ok: false, error: 'crypto_error' }; }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST')    return json(405, { error: 'method_not_allowed' });

  let body: any;
  try { body = await req.json(); } catch (_e) { return json(400, { error: 'bad_json' }); }
  if (!body.token) return json(400, { error: 'missing_token' });

  const v = await verifyAdminToken(body.token);
  if (!v.ok) return json(403, { error: 'vip_' + (v.error || 'invalid') });

  const action = body.action;

  if (action === 'list') {
    const limit  = Math.min(Math.max(parseInt(body.limit  || '50', 10) || 50, 1), 200);
    const offset = Math.max(parseInt(body.offset || '0',  10) || 0, 0);
    const { data, error } = await sb
      .from('speaking_realtime_sessions')
      .select('id, center_id, user_email, user_name, started_at, ended_at, duration_sec, audio_url, cert_score, cefr_level, reviewed_at')
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) return json(502, { error: 'db_list_failed', detail: error.message });
    return json(200, { sessions: data || [] });
  }

  if (action === 'get') {
    if (!body.id) return json(400, { error: 'missing_id' });
    const { data, error } = await sb.from('speaking_realtime_sessions').select('*').eq('id', body.id).single();
    if (error) return json(404, { error: 'not_found' });
    return json(200, { session: data });
  }

  if (action === 'audio') {
    if (!body.id) return json(400, { error: 'missing_id' });
    const { data: row, error } = await sb.from('speaking_realtime_sessions').select('audio_url').eq('id', body.id).single();
    if (error || !row?.audio_url) return json(404, { error: 'not_found' });
    const { data: sig, error: sigErr } = await sb.storage.from(BUCKET).createSignedUrl(row.audio_url, 60 * 60); // 1h
    if (sigErr) return json(502, { error: 'sign_failed', detail: sigErr.message });
    return json(200, { url: sig.signedUrl });
  }

  if (action === 'delete') {
    if (!body.id) return json(400, { error: 'missing_id' });
    const { data: row } = await sb.from('speaking_realtime_sessions').select('audio_url').eq('id', body.id).single();
    if (row?.audio_url) {
      await sb.storage.from(BUCKET).remove([row.audio_url]).catch(() => {});
    }
    const { error } = await sb.from('speaking_realtime_sessions').delete().eq('id', body.id);
    if (error) return json(502, { error: 'delete_failed', detail: error.message });
    return json(200, { ok: true });
  }

  return json(400, { error: 'unknown_action' });
});
