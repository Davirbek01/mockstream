// =====================================================================
// Supabase Edge Function: ai-proxy  (v2 — reads Center Hub as source of truth)
// ---------------------------------------------------------------------
// Blocks all direct-from-browser AI calls. Browser calls this instead.
// Checks:
//   1) IP blocklist          (public.blocked_ips)
//   2) Center whitelist      (row in public.site_settings
//                             where key='center_config_{testId}'
//                             AND value->>'active' != 'false')
//      -> Any center you add in the Center Hub UI is INSTANTLY allowed.
//   3) Rate limit per IP     (default: 20 calls / 10 min)
//   4) Daily cap per center  (public.ai_center_limits OR env default)
// Logs every call to public.ai_submission_logs.
//
// Deploy:
//   supabase functions deploy ai-proxy --no-verify-jwt
// Secrets (Dashboard → Project Settings → Edge Functions → Secrets):
//   GEMINI_API_KEY          (required for gemini)
//   OPENAI_API_KEY, CLAUDE_API_KEY, GROK_API_KEY, DEEPSEEK_API_KEY (optional)
//   RATE_LIMIT_PER_10MIN    (default: 20)
//   AI_DAILY_CAP_DEFAULT    (default: 500)
// =====================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ----- config ---------------------------------------------------------
const SUPABASE_URL          = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY      = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GEMINI_API_KEY        = Deno.env.get('GEMINI_API_KEY')   || '';
const OPENAI_API_KEY        = Deno.env.get('OPENAI_API_KEY')   || '';
const CLAUDE_API_KEY        = Deno.env.get('CLAUDE_API_KEY')   || '';
const GROK_API_KEY          = Deno.env.get('GROK_API_KEY')     || '';
const DEEPSEEK_API_KEY      = Deno.env.get('DEEPSEEK_API_KEY') || '';
const RATE_LIMIT_PER_10MIN  = parseInt(Deno.env.get('RATE_LIMIT_PER_10MIN') || '20', 10);
const AI_DAILY_CAP_DEFAULT  = parseInt(Deno.env.get('AI_DAILY_CAP_DEFAULT') || '500', 10);

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

async function log(row: Record<string, unknown>) {
  try { await admin.from('ai_submission_logs').insert(row); } catch (_e) { /* swallow */ }
}

// ----- Center Hub lookup ---------------------------------------------
// Source of truth: site_settings row with key = 'center_config_{testId}'.
// A center is allowed if the row exists AND its `active` flag is not false.
// Daily cap = center's `dailyMockLimit` field (0 = unlimited; missing => env default).
// Returns { allowed, dailyCap } where dailyCap===0 means no limit.
async function getCenterGate(centerId: string): Promise<{ allowed: boolean; dailyCap: number }> {
  if (!centerId) return { allowed: false, dailyCap: 0 };
  const key = `center_config_${centerId}`;
  const { data, error } = await admin
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  if (error || !data) return { allowed: false, dailyCap: 0 };
  let v: any = data.value;
  if (typeof v === 'string') { try { v = JSON.parse(v); } catch { v = {}; } }
  if (v?.active === false) return { allowed: false, dailyCap: 0 };

  // Read the per-center limit written by the Center Hub ("Daily Mock Limit").
  // 0 or missing => fall back to server default; > 0 => hard cap.
  const raw = Number(v?.dailyMockLimit);
  const dailyCap = Number.isFinite(raw) && raw > 0 ? raw : AI_DAILY_CAP_DEFAULT;
  return { allowed: true, dailyCap };
}

// ----- provider callers ----------------------------------------------
async function callGemini(req: any): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured on server');
  const model = (req.model || 'gemini-flash-latest').toString();
  const body: any = {
    contents: [{ parts: req.contentParts || [{ text: req.userPrompt || '' }] }],
    generationConfig: { temperature: req.temperature ?? 0.3 },
  };
  if (req.maxTokens) body.generationConfig.maxOutputTokens = req.maxTokens;
  if (req.jsonMode)  body.generationConfig.response_mime_type = 'application/json';
  if (req.systemText) body.systemInstruction = { parts: [{ text: req.systemText }] };

  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${GEMINI_API_KEY}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
  );
  if (!r.ok) throw new Error(`Gemini ${r.status}: ${await r.text().catch(()=> '')}`);
  const j = await r.json();
  if (j.error) throw new Error(j.error.message || 'Gemini error');
  if (!j.candidates?.length) throw new Error('Gemini: no candidates');
  return j.candidates[0].content.parts[0].text || '';
}

async function callOpenAI(req: any): Promise<string> {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured on server');
  const messages: any[] = [];
  if (req.systemText) messages.push({ role: 'system', content: req.systemText });
  messages.push({ role: 'user', content: req.userPrompt || '' });
  const body: any = { model: req.model || 'gpt-4o-mini', messages, temperature: req.temperature ?? 0.3 };
  if (req.maxTokens) body.max_tokens = req.maxTokens;
  if (req.jsonMode)  body.response_format = { type: 'json_object' };
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`OpenAI ${r.status}: ${await r.text().catch(()=> '')}`);
  const j = await r.json();
  return j.choices?.[0]?.message?.content || '';
}

async function callClaude(req: any): Promise<string> {
  if (!CLAUDE_API_KEY) throw new Error('CLAUDE_API_KEY not configured on server');
  const body: any = {
    model: req.model || 'claude-sonnet-4-20250514',
    max_tokens: req.maxTokens || 8192,
    messages: [{ role: 'user', content: req.userPrompt || '' }],
  };
  if (req.systemText) body.system = req.systemText;
  if (req.temperature !== undefined) body.temperature = req.temperature;
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Claude ${r.status}: ${await r.text().catch(()=> '')}`);
  const j = await r.json();
  return j.content?.[0]?.text || '';
}

async function callGrok(req: any): Promise<string> {
  if (!GROK_API_KEY) throw new Error('GROK_API_KEY not configured on server');
  const messages: any[] = [];
  if (req.systemText) messages.push({ role: 'system', content: req.systemText });
  messages.push({ role: 'user', content: req.userPrompt || '' });
  const body: any = { model: req.model || 'grok-3-mini', messages, temperature: req.temperature ?? 0.3 };
  if (req.maxTokens) body.max_tokens = req.maxTokens;
  if (req.jsonMode)  body.response_format = { type: 'json_object' };
  const r = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROK_API_KEY}` },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Grok ${r.status}: ${await r.text().catch(()=> '')}`);
  const j = await r.json();
  return j.choices?.[0]?.message?.content || '';
}

async function callDeepseek(req: any): Promise<string> {
  if (!DEEPSEEK_API_KEY) throw new Error('DEEPSEEK_API_KEY not configured on server');
  const messages: any[] = [];
  if (req.systemText) messages.push({ role: 'system', content: req.systemText });
  messages.push({ role: 'user', content: req.userPrompt || '' });
  const body: any = { model: req.model || 'deepseek-chat', messages, temperature: req.temperature ?? 0.3 };
  if (req.maxTokens) body.max_tokens = Math.min(req.maxTokens, 8192);
  const r = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`DeepSeek ${r.status}: ${await r.text().catch(()=> '')}`);
  const j = await r.json();
  return j.choices?.[0]?.message?.content || '';
}

// ----- main handler ---------------------------------------------------
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST')    return json(405, { error: 'method not allowed' });

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim()
          || req.headers.get('cf-connecting-ip')
          || 'unknown';
  const ua = req.headers.get('user-agent') || '';

  let body: any;
  try { body = await req.json(); } catch { return json(400, { error: 'invalid json' }); }

  const provider = String(body.provider || 'gemini').toLowerCase();
  const centerId = String(body.centerId || '').trim();
  const skill    = String(body.skill    || 'other').toLowerCase();

  // --- 1) IP blocklist -----------------------------------------------
  const { data: blocked } = await admin
    .from('blocked_ips').select('ip').eq('ip', ip).maybeSingle();
  if (blocked) {
    await log({ ip, user_agent: ua, center_id: centerId, provider, skill, status: 'blocked_ip' });
    return json(403, { error: 'blocked' });
  }

  // --- 2) Center whitelist + per-center daily cap (Center Hub is SoT) ---
  if (!centerId) {
    await log({ ip, user_agent: ua, center_id: null, provider, skill, status: 'bad_center', error_message: 'missing centerId' });
    return json(400, { error: 'missing centerId' });
  }
  const gate = await getCenterGate(centerId);
  if (!gate.allowed) {
    await log({ ip, user_agent: ua, center_id: centerId, provider, skill, status: 'bad_center' });
    return json(403, { error: 'center not allowed' });
  }

  // --- 3) Rate limit per IP (last 10 min) ----------------------------
  const tenMinAgo = new Date(Date.now() - 10 * 60_000).toISOString();
  const { count: ipCount } = await admin
    .from('ai_submission_logs')
    .select('id', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('created_at', tenMinAgo);
  if ((ipCount ?? 0) >= RATE_LIMIT_PER_10MIN) {
    await log({ ip, user_agent: ua, center_id: centerId, provider, skill, status: 'rate_limited' });
    return json(429, { error: 'rate limit exceeded, slow down' });
  }

  // --- 4) Daily cap per center (from Center Hub's dailyMockLimit) ----
  const dayAgo = new Date(Date.now() - 24 * 3600_000).toISOString();
  const { count: centerCount } = await admin
    .from('ai_submission_logs')
    .select('id', { count: 'exact', head: true })
    .eq('center_id', centerId)
    .eq('status', 'ok')
    .gte('created_at', dayAgo);
  if ((centerCount ?? 0) >= gate.dailyCap) {
    await log({ ip, user_agent: ua, center_id: centerId, provider, skill, status: 'rate_limited', error_message: 'daily cap' });
    return json(429, { error: 'daily cap reached for this center' });
  }

  // --- 5) Call provider ----------------------------------------------
  const bytesIn = JSON.stringify(body).length;
  try {
    let text = '';
    if      (provider === 'gemini')   text = await callGemini(body);
    else if (provider === 'openai')   text = await callOpenAI(body);
    else if (provider === 'claude')   text = await callClaude(body);
    else if (provider === 'grok')     text = await callGrok(body);
    else if (provider === 'deepseek') text = await callDeepseek(body);
    else throw new Error(`unsupported provider: ${provider}`);

    await log({
      ip, user_agent: ua, center_id: centerId, provider, skill,
      status: 'ok', bytes_in: bytesIn, bytes_out: text.length,
    });
    return json(200, { text });
  } catch (err) {
    const msg = (err as Error).message || String(err);
    await log({
      ip, user_agent: ua, center_id: centerId, provider, skill,
      status: 'provider_error', bytes_in: bytesIn, error_message: msg.slice(0, 500),
    });
    return json(502, { error: 'provider error', detail: msg.slice(0, 200) });
  }
});
