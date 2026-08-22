// transcribe-audio — base64-JSON → Groq Whisper relay.
//
// Why this exists: React Native's new architecture (Expo Go SDK 56) cannot
// reliably attach local files to multipart requests (FormData {uri} parts are
// unsupported, and the expo-file-system native modules are unavailable in Go),
// so the mobile app sends the recording as base64 JSON and THIS function does
// the multipart upload to Groq server-side, where FormData/Blob are native.
//
// POST { b64: string, mime?: string, center?: string }
// → { text: string }
//
// Deploy with: supabase functions deploy transcribe-audio --no-verify-jwt
// (uses the project-wide GROQ_API_KEY secret, same as ai-proxy)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

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
  fd.append('response_format', 'json');
  // English exam — see the note in the apps' speakingPipeline.
  fd.append('language', 'en');

  try {
    const r = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}` },
      body: fd,
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return json(r.status, { error: 'groq_error', detail: data });
    return json(200, { text: (data?.text ?? '').trim() });
  } catch (e) {
    return json(502, { error: 'relay_failed', detail: String(e) });
  }
});
