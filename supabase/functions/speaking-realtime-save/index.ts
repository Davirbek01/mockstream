// =====================================================================
// Supabase Edge Function: speaking-realtime-save
// ---------------------------------------------------------------------
// Saves a completed realtime speaking session for admin review.
// - Verifies VIP token (premium gate)
// - Uploads audio blob to storage bucket `speaking-realtime-sessions`
// - Inserts row in public.speaking_realtime_sessions
// - Returns the new session row id
//
// Request: POST multipart/form-data
//   audio: <Blob>             (Opus / webm preferred)
//   meta:  <JSON string>      see MetaShape below
//
// Response: 200 { id, audio_url }
//           4xx { error: "..." }
//
// Deploy:
//   supabase functions deploy speaking-realtime-save --no-verify-jwt
// =====================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const VIP_TOKEN_SECRET = Deno.env.get('VIP_TOKEN_SECRET') || '';

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const BUCKET = 'speaking-realtime-sessions';
const MAX_AUDIO_BYTES = 25 * 1024 * 1024; // 25 MB — caps a single session at ~12 min Opus

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

interface MetaShape {
  token: string;
  user_name?: string;
  user_email?: string | null;
  started_at?: string;
  ended_at?: string;
  duration_sec?: number;
  // What the session actually cost, straight from the Live API rather than
  // inferred from the clock — see speaking_realtime_sessions.usage.
  usage?: unknown;
  audio_in_sec?: number;
  audio_out_sec?: number;
  p1_1_source?: any;
  p1_2_source?: any;
  p2_source?: any;
  p3_source?: any;
  transcript?: any;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST')    return json(405, { error: 'method_not_allowed' });

  const ct = req.headers.get('content-type') || '';
  if (!ct.includes('multipart/form-data')) return json(400, { error: 'expected_multipart' });

  let form: FormData;
  try { form = await req.formData(); } catch (_e) { return json(400, { error: 'bad_form' }); }

  const metaStr = form.get('meta');
  if (typeof metaStr !== 'string') return json(400, { error: 'missing_meta' });
  let meta: MetaShape;
  try { meta = JSON.parse(metaStr); } catch (_e) { return json(400, { error: 'bad_meta_json' }); }

  if (!meta.token) return json(400, { error: 'missing_token' });
  const v = await verifyVipToken(meta.token);
  if (!v.ok) return json(403, { error: 'vip_' + (v.error || 'invalid') });
  const payload = v.payload!;
  const isPremium = payload.p === true || payload.r === 'premium' || payload.r === 'admin';
  if (!isPremium) return json(403, { error: 'not_premium' });

  const audio = form.get('audio');
  if (!(audio instanceof File)) return json(400, { error: 'missing_audio' });
  if (audio.size === 0) return json(400, { error: 'empty_audio' });
  if (audio.size > MAX_AUDIO_BYTES) return json(413, { error: 'audio_too_large', max: MAX_AUDIO_BYTES });

  // Decide extension from mime; fall back to .webm.
  const mime = audio.type || 'audio/webm';
  const ext = mime.includes('mp4') ? 'mp4' : (mime.includes('ogg') ? 'ogg' : 'webm');
  const centerId = (payload.c || 'unknown').toString();
  const id = crypto.randomUUID();
  const path = `${centerId}/${id}.${ext}`;

  // Upload to storage
  const ab = await audio.arrayBuffer();
  const { error: upErr } = await sb.storage.from(BUCKET).upload(path, new Uint8Array(ab), {
    contentType: mime,
    upsert: false
  });
  if (upErr) return json(502, { error: 'upload_failed', detail: upErr.message });

  // Build the row
  const row: Record<string, unknown> = {
    id,
    center_id: centerId,
    user_email: meta.user_email || null,
    user_name:  meta.user_name  || null,
    started_at: meta.started_at || new Date().toISOString(),
    ended_at:   meta.ended_at   || new Date().toISOString(),
    duration_sec: typeof meta.duration_sec === 'number' ? Math.round(meta.duration_sec) : null,
    usage:         meta.usage ?? null,
    audio_in_sec:  typeof meta.audio_in_sec  === 'number' ? meta.audio_in_sec  : null,
    audio_out_sec: typeof meta.audio_out_sec === 'number' ? meta.audio_out_sec : null,
    p1_1_source: meta.p1_1_source ?? null,
    p1_2_source: meta.p1_2_source ?? null,
    p2_source:   meta.p2_source   ?? null,
    p3_source:   meta.p3_source   ?? null,
    audio_url:   path,
    transcript:  meta.transcript ?? null
  };

  const { error: insErr } = await sb.from('speaking_realtime_sessions').insert(row);
  if (insErr) {
    // Best-effort: try to remove the uploaded file so storage doesn't drift.
    await sb.storage.from(BUCKET).remove([path]).catch(() => {});
    return json(502, { error: 'insert_failed', detail: insErr.message });
  }

  return json(200, { id, audio_url: path, center: centerId });
});
