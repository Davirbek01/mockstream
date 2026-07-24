// =====================================================================
// Supabase Edge Function: ai-health-check
// ---------------------------------------------------------------------
// Monthly liveness probe of EVERY AI model wired into the platform —
// AI vendors retire models silently (Groq killed Llama-4-Scout and
// Qwen3-32B, Google killed gemini-3-pro-preview) and nothing surfaced
// until scoring/vision broke. This function probes each configured
// model with the same request shape the pages use, plus catalog checks,
// and stores the report in site_settings.scoring_ai_health_report
// (scoring_* prefix → readable by the admin panel via the existing
// whitelist, and auto-loaded into the System Prompts cache).
//
// Trigger: pg_cron job 'ai-health-monthly' (1st of each month) via
// pg_net + vault service key. Manual run:
//   POST /functions/v1/ai-health-check  (Authorization: Bearer <service>)
//
// Deploy:  supabase functions deploy ai-health-check --no-verify-jwt
// =====================================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const KEYS = {
  gemini:     Deno.env.get('GEMINI_API_KEY') || '',
  openai:     Deno.env.get('OPENAI_API_KEY') || '',
  claude:     Deno.env.get('CLAUDE_API_KEY') || '',
  grok:       Deno.env.get('GROK_API_KEY') || '',
  deepseek:   Deno.env.get('DEEPSEEK_API_KEY') || '',
  groq:       Deno.env.get('GROQ_API_KEY') || '',
  assemblyai: Deno.env.get('ASSEMBLYAI_API_KEY') || '',
};

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
};
function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}

type Res = { name: string; ok: boolean; info: string };

async function probe(name: string, fn: () => Promise<void>, out: Res[]) {
  const t0 = Date.now();
  try {
    try {
      await fn();
    } catch (e1) {
      // Retry once on 5xx — transient capacity blips (e.g. "model currently
      // overloaded") must not masquerade as retirements in the report.
      if (/HTTP 5\d\d/.test(String((e1 as Error).message))) {
        await new Promise((r) => setTimeout(r, 2500));
        await fn();
      } else throw e1;
    }
    out.push({ name, ok: true, info: ((Date.now() - t0) / 1000).toFixed(1) + 's' });
  } catch (e) {
    out.push({ name, ok: false, info: String((e as Error).message || e).slice(0, 200) });
  }
}

async function post(url: string, headers: Record<string, string>, body: unknown) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error('HTTP ' + r.status + ': ' + (await r.text()).slice(0, 150));
  return await r.json();
}
async function get(url: string, headers: Record<string, string>) {
  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error('HTTP ' + r.status + ': ' + (await r.text()).slice(0, 150));
  return await r.json();
}

const sayOk = (model: string, extra: Record<string, unknown> = {}) =>
  ({ model, messages: [{ role: 'user', content: 'Say OK' }], ...extra });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json(405, { error: 'POST only' });

  const bearer = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  let authed = bearer === SERVICE_ROLE_KEY;
  if (!authed && bearer && !bearer.startsWith('sb_')) {
    const { data: ok } = await sb.rpc('_cleanup_token_ok', { p_token: bearer });
    authed = ok === true;
  }
  if (!authed) return json(401, { error: 'unauthorized' });

  const R: Res[] = [];
  const gemini = (m: string, maxTok = 200) => () =>
    post(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${KEYS.gemini}`, {},
      { contents: [{ parts: [{ text: 'Say OK' }] }], generationConfig: { temperature: 0.3, maxOutputTokens: maxTok } }).then(() => {});
  const openaiChat = (body: unknown) => () =>
    post('https://api.openai.com/v1/chat/completions', { Authorization: 'Bearer ' + KEYS.openai }, body).then(() => {});
  const claude = (m: string) => () =>
    post('https://api.anthropic.com/v1/messages',
      { 'x-api-key': KEYS.claude, 'anthropic-version': '2023-06-01' },
      { model: m, max_tokens: 10, messages: [{ role: 'user', content: 'Say OK' }] }).then(() => {});
  const grok = (m: string) => () =>
    post('https://api.x.ai/v1/chat/completions', { Authorization: 'Bearer ' + KEYS.grok }, sayOk(m, { temperature: 0.3, max_tokens: 30 })).then(() => {});
  const deepseek = (body: unknown) => () =>
    post('https://api.deepseek.com/chat/completions', { Authorization: 'Bearer ' + KEYS.deepseek }, body).then(() => {});
  const groq = (m: string, maxTok = 30) => () =>
    post('https://api.groq.com/openai/v1/chat/completions', { Authorization: 'Bearer ' + KEYS.groq }, sayOk(m, { temperature: 0.3, max_tokens: maxTok })).then(() => {});

  // Primary tiers — keep in sync with the System Prompts tier buttons.
  await probe('gemini gemini-3.1-flash-lite', gemini('gemini-3.1-flash-lite'), R);
  await probe('gemini gemini-flash-latest', gemini('gemini-flash-latest'), R);
  await probe('gemini gemini-2.5-pro', gemini('gemini-2.5-pro', 400), R);
  await probe('openai gpt-5.4-nano', openaiChat(sayOk('gpt-5.4-nano', { temperature: 0.3, max_completion_tokens: 300 })), R);
  await probe('openai gpt-5.4-mini', openaiChat(sayOk('gpt-5.4-mini', { temperature: 0.3, max_completion_tokens: 300 })), R);
  await probe('openai gpt-5.4', openaiChat(sayOk('gpt-5.4', { max_completion_tokens: 300 })), R);
  await probe('openai gpt-4o-mini (vision helper)', openaiChat(sayOk('gpt-4o-mini', { temperature: 0.3, max_tokens: 30 })), R);
  await probe('claude claude-haiku-4-5', claude('claude-haiku-4-5'), R);
  await probe('claude claude-sonnet-5', claude('claude-sonnet-5'), R);
  await probe('claude claude-opus-4-8', claude('claude-opus-4-8'), R);
  await probe('grok grok-4.20-0309-non-reasoning', grok('grok-4.20-0309-non-reasoning'), R);
  await probe('grok grok-4.3', grok('grok-4.3'), R);
  await probe('grok grok-4.5', grok('grok-4.5'), R);
  await probe('grok grok-3-mini (legacy default)', grok('grok-3-mini'), R);
  await probe('deepseek deepseek-v4-flash', deepseek(sayOk('deepseek-v4-flash', { temperature: 0.3, max_tokens: 30 })), R);
  await probe('deepseek deepseek-v4-pro', deepseek(sayOk('deepseek-v4-pro', { max_tokens: 100 })), R);
  await probe('groq llama-3.1-8b-instant', groq('llama-3.1-8b-instant'), R);
  await probe('groq llama-3.3-70b-versatile', groq('llama-3.3-70b-versatile'), R);
  await probe('groq qwen/qwen3.6-27b', groq('qwen/qwen3.6-27b', 300), R);
  await probe('groq openai/gpt-oss-120b', groq('openai/gpt-oss-120b', 300), R);

  // Helpers + catalog presence.
  await probe('groq whisper-large-v3-turbo (catalog)', async () => {
    const j = await get('https://api.groq.com/openai/v1/models', { Authorization: 'Bearer ' + KEYS.groq });
    const ids = new Set((j.data || []).map((m: { id: string }) => m.id));
    for (const need of ['whisper-large-v3-turbo', 'llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'qwen/qwen3.6-27b', 'openai/gpt-oss-120b'])
      if (!ids.has(need)) throw new Error('RETIRED from Groq catalog: ' + need);
  }, R);
  await probe('assemblyai (transcriber backup)', async () => {
    await get('https://api.assemblyai.com/v2/transcript?limit=1', { Authorization: KEYS.assemblyai });
  }, R);
  await probe('grok catalog (4.20/4.3/4.5)', async () => {
    const j = await get('https://api.x.ai/v1/models', { Authorization: 'Bearer ' + KEYS.grok });
    const ids = new Set((j.data || []).map((m: { id: string }) => m.id));
    for (const need of ['grok-4.20-0309-non-reasoning', 'grok-4.3', 'grok-4.5'])
      if (!ids.has(need)) throw new Error('RETIRED from xAI catalog: ' + need);
  }, R);
  await probe('deepseek catalog (v4-flash/v4-pro)', async () => {
    const j = await get('https://api.deepseek.com/models', { Authorization: 'Bearer ' + KEYS.deepseek });
    const ids = new Set((j.data || []).map((m: { id: string }) => m.id));
    for (const need of ['deepseek-v4-flash', 'deepseek-v4-pro'])
      if (!ids.has(need)) throw new Error('RETIRED from DeepSeek catalog: ' + need);
  }, R);

  // ── Capability drift probes ────────────────────────────────────────
  // Vendors also change MODALITIES silently (grok-4.x gained vision; Groq
  // dropped it entirely). Probe image + audio acceptance per provider
  // representative and diff against last month's stored map — changes are
  // reported (not failed) so the admin banner can announce e.g.
  // "deepseek-v4-flash: image ✗→✓" the month a model turns multimodal.
  const PNG = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAKUlEQVR4nO3NsQ0AAAzCMP5/mj5RNkuZ4zSZtr0DAAAAAAAAAACA/gEHMsP8LofXz44AAAAASUVORK5CYII='; // 32x32 (1024 px) — xAI rejects images under 512 total pixels
  const WAV = 'UklGRqQMAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YYAMAAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAA=='; // 0.2s real WAV — zero-sample file was rejected by Gemini
  const tryBool = async (fn: () => Promise<unknown>) => { try { await fn(); return true; } catch { return false; } };
  const oaiImg = (url: string, key: string, model: string, extra: Record<string, unknown> = {}) => () =>
    post(url, { Authorization: 'Bearer ' + key },
      { model, messages: [{ role: 'user', content: [{ type: 'text', text: 'Reply OK' },
        { type: 'image_url', image_url: { url: 'data:image/png;base64,' + PNG } }] }], ...extra });
  const oaiAud = (url: string, key: string, model: string, extra: Record<string, unknown> = {}) => () =>
    post(url, { Authorization: 'Bearer ' + key },
      { model, messages: [{ role: 'user', content: [{ type: 'text', text: 'Reply OK' },
        { type: 'input_audio', input_audio: { data: WAV, format: 'wav' } }] }], ...extra });

  const caps: Record<string, { image: boolean; audio: boolean }> = {};
  caps['gemini-flash-latest'] = {
    image: await tryBool(() => post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${KEYS.gemini}`, {},
      { contents: [{ parts: [{ text: 'Reply OK' }, { inline_data: { mime_type: 'image/png', data: PNG } }] }], generationConfig: { maxOutputTokens: 100 } })),
    audio: await tryBool(() => post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${KEYS.gemini}`, {},
      { contents: [{ parts: [{ text: 'Reply OK' }, { inline_data: { mime_type: 'audio/wav', data: WAV } }] }], generationConfig: { maxOutputTokens: 100 } })),
  };
  caps['gpt-4o-mini'] = {
    image: await tryBool(oaiImg('https://api.openai.com/v1/chat/completions', KEYS.openai, 'gpt-4o-mini', { max_tokens: 30 })),
    audio: await tryBool(oaiAud('https://api.openai.com/v1/chat/completions', KEYS.openai, 'gpt-4o-mini', { max_tokens: 30 })),
  };
  caps['claude-haiku-4-5'] = {
    image: await tryBool(() => post('https://api.anthropic.com/v1/messages',
      { 'x-api-key': KEYS.claude, 'anthropic-version': '2023-06-01' },
      { model: 'claude-haiku-4-5', max_tokens: 10, messages: [{ role: 'user', content: [{ type: 'text', text: 'Reply OK' },
        { type: 'image', source: { type: 'base64', media_type: 'image/png', data: PNG } }] }] })),
    audio: await tryBool(() => post('https://api.anthropic.com/v1/messages',
      { 'x-api-key': KEYS.claude, 'anthropic-version': '2023-06-01' },
      { model: 'claude-haiku-4-5', max_tokens: 10, messages: [{ role: 'user', content: [{ type: 'text', text: 'Reply OK' },
        { type: 'document', source: { type: 'base64', media_type: 'audio/wav', data: WAV } }] }] })),
  };
  caps['grok-4.20-0309-non-reasoning'] = {
    image: await tryBool(oaiImg('https://api.x.ai/v1/chat/completions', KEYS.grok, 'grok-4.20-0309-non-reasoning', { max_tokens: 30 })),
    audio: await tryBool(oaiAud('https://api.x.ai/v1/chat/completions', KEYS.grok, 'grok-4.20-0309-non-reasoning', { max_tokens: 30 })),
  };
  caps['deepseek-v4-flash'] = {
    image: await tryBool(oaiImg('https://api.deepseek.com/chat/completions', KEYS.deepseek, 'deepseek-v4-flash', { max_tokens: 30 })),
    audio: await tryBool(oaiAud('https://api.deepseek.com/chat/completions', KEYS.deepseek, 'deepseek-v4-flash', { max_tokens: 30 })),
  };
  caps['llama-3.3-70b-versatile'] = {
    image: await tryBool(oaiImg('https://api.groq.com/openai/v1/chat/completions', KEYS.groq, 'llama-3.3-70b-versatile', { max_tokens: 30 })),
    audio: await tryBool(oaiAud('https://api.groq.com/openai/v1/chat/completions', KEYS.groq, 'llama-3.3-70b-versatile', { max_tokens: 30 })),
  };

  const capability_changes: string[] = [];
  try {
    const { data: prevRow } = await sb.from('site_settings').select('value').eq('key', 'scoring_ai_health_report').maybeSingle();
    const prevCaps = prevRow ? (JSON.parse(prevRow.value).capabilities || {}) : {};
    for (const [m, c] of Object.entries(caps)) {
      const o = prevCaps[m];
      if (!o) continue;
      if (o.image !== c.image) capability_changes.push(`${m}: image ${o.image ? '✓' : '✗'}→${c.image ? '✓' : '✗'}`);
      if (o.audio !== c.audio) capability_changes.push(`${m}: audio ${o.audio ? '✓' : '✗'}→${c.audio ? '✓' : '✗'}`);
    }
  } catch (_e) { /* first run or unparsable previous report */ }

  const fails = R.filter((r) => !r.ok);
  const report = {
    ts: new Date().toISOString(),
    total: R.length,
    pass: R.length - fails.length,
    fail: fails.length,
    fails: fails.map((f) => ({ name: f.name, info: f.info })),
    capabilities: caps,
    capability_changes,
    results: R,
  };
  await sb.from('site_settings').upsert({ key: 'scoring_ai_health_report', value: JSON.stringify(report) }, { onConflict: 'key' });
  return json(200, report);
});
