// transcribe-audio — base64-JSON → Groq Whisper relay.
//
// Why this exists: React Native's new architecture (Expo Go SDK 56) cannot
// reliably attach local files to multipart requests (FormData {uri} parts are
// unsupported, and the expo-file-system native modules are unavailable in Go),
// so the mobile app sends the recording as base64 JSON and THIS function does
// the multipart upload to Groq server-side, where FormData/Blob are native.
//
// POST { b64: string, mime?: string, center?: string }
// → { text: string, duration: number|null }
//
// It also writes its own row to ai_submission_logs. This path bypasses
// ai-proxy (it holds the Groq key itself), so without that row the audio it
// transcribes is invisible to the daily spend line and to the AI health
// check — a blind spot exactly the size of the mobile fallback traffic.
//
// Deploy with: supabase functions deploy transcribe-audio --no-verify-jwt
// (uses the project-wide GROQ_API_KEY secret, same as ai-proxy)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

/** One row per call, in the same table ai-proxy writes to, so the spend line
 *  and the health check see this traffic like any other. Best-effort: a
 *  logging failure must never cost a student their transcript. */
async function logCall(
  req: Request,
  body: { center?: string },
  bytesIn: number,
  audioSec: number | null,
  errorMessage: string | null,
): Promise<void> {
  try {
    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) return;
    await fetch(`${url}/rest/v1/ai_submission_logs`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
        user_agent: req.headers.get('user-agent') || null,
        center_id: (body.center || req.headers.get('x-center-id') || '').trim() || null,
        provider: 'groq',
        endpoint: 'transcribe',
        skill: 'speaking',
        status: errorMessage ? 'provider_error' : 'ok',
        bytes_in: bytesIn,
        audio_sec: audioSec,
        error_message: errorMessage,
      }),
    });
  } catch { /* the transcript matters, the bookkeeping does not */ }
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' });

  const key = Deno.env.get('GROQ_API_KEY');
  if (!key) return json(500, { error: 'missing_groq_key' });

  let body: { b64?: string; mime?: string };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'invalid_json' });
  }
  const b64 = body.b64 || '';
  if (!b64 || b64.length < 100) return json(400, { error: 'missing_audio' });
  // ~25 MB base64 cap (≈18 MB audio) — far above any 2-minute answer
  if (b64.length > 25_000_000) return json(413, { error: 'audio_too_large' });

  let bytes: Uint8Array;
  try {
    const bin = atob(b64);
    bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  } catch {
    return json(400, { error: 'invalid_base64' });
  }

  const mime = body.mime || 'audio/m4a';
  const fd = new FormData();
  fd.append('file', new Blob([bytes], { type: mime }), 'answer.m4a');
  fd.append('model', 'whisper-large-v3-turbo');
  // verbose_json carries `duration`, which is what the spend line should be
  // priced on — the byte-size estimate drifts with the recording mix.
  fd.append('response_format', 'verbose_json');
  // English exam — see the note in the apps' speakingPipeline.
  fd.append('language', 'en');

  try {
    const r = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}` },
      body: fd,
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      await logCall(req, body, bytes.byteLength, null, `HTTP ${r.status} ${JSON.stringify(data).slice(0, 200)}`);
      return json(r.status, { error: 'groq_error', detail: data });
    }
    const duration = typeof data?.duration === 'number' ? Math.round(data.duration * 100) / 100 : null;
    await logCall(req, body, bytes.byteLength, duration, null);
    return json(200, { text: (data?.text ?? '').trim(), duration });
  } catch (e) {
    return json(502, { error: 'relay_failed', detail: String(e) });
  }
});
