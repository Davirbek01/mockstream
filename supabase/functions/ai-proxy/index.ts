// =====================================================================
// Supabase Edge Function: ai-proxy  (v3 — transparent passthrough proxy)
// ---------------------------------------------------------------------
// The browser sends the SAME request body it would have sent directly to
// the provider, but to a path under this function. We forward it to the
// real provider with a SERVER-SIDE key, then return the response unchanged.
// This means existing client code keeps working — only the URL changes
// (handled by site/ai-proxy-interceptor.js).
//
// Path scheme:
//   /functions/v1/ai-proxy/gemini/<rest-of-path>     →  generativelanguage.googleapis.com/<rest-of-path>?key=GEMINI_API_KEY
//   /functions/v1/ai-proxy/openai/<rest-of-path>     →  api.openai.com/<rest-of-path>           (Bearer OPENAI_API_KEY)
//   /functions/v1/ai-proxy/claude/<rest-of-path>     →  api.anthropic.com/<rest-of-path>        (x-api-key CLAUDE_API_KEY)
//   /functions/v1/ai-proxy/grok/<rest-of-path>       →  api.x.ai/<rest-of-path>                 (Bearer GROK_API_KEY)
//   /functions/v1/ai-proxy/deepseek/<rest-of-path>   →  api.deepseek.com/<rest-of-path>         (Bearer DEEPSEEK_API_KEY)
//   /functions/v1/ai-proxy/assemblyai/<rest-of-path> →  api.assemblyai.com/<rest-of-path>       (Authorization: ASSEMBLYAI_API_KEY — no "Bearer" prefix)
//
// Gates (all enforced before forwarding):
//   1) IP blocklist          (public.blocked_ips)
//   2) Center whitelist      (row in public.site_settings
//                             where key='center_config_{testId}'
//                             AND value->>'active' != 'false')
//   3) Rate limit per IP     (env RATE_LIMIT_PER_10MIN; 0 = disabled, default 0)
//   4) Daily cap per center  (value->>'dailyMockLimit'; 0 = unlimited, default 0)
//   5) Daily cap per student (value->>'maxAttemptsPerStudent'; 0 = unlimited)
//                             Identifies student by Google email (x-ms-email)
//                             when present, otherwise falls back to IP.
// Every forwarded call is logged to public.ai_submission_logs.
//
// Deploy:
//   supabase functions deploy ai-proxy --no-verify-jwt
// Secrets:
//   GEMINI_API_KEY, OPENAI_API_KEY, CLAUDE_API_KEY, GROK_API_KEY, DEEPSEEK_API_KEY, ASSEMBLYAI_API_KEY
//   <PROVIDER>_API_KEY_2 ... _5  (optional backups; auto-used on 429/5xx)
//   GEMINI_API_KEY_PREPAY,    GEMINI_API_KEY_PREPAY_2     (Gemini billing-slot keys)
//   GEMINI_API_KEY_POSTPAY,   GEMINI_API_KEY_POSTPAY_2    (used when site_settings.gemini_active_plan
//     = 'prepay' | 'prepay_2' | 'prepay_both' | 'postpay' | 'postpay_2' | 'postpay_both' —
//     '_both' modes try slot 1 first then auto-fail-over to slot 2 on 429/5xx,
//     so a drained billing account can't take down all Gemini calls.)
//   RATE_LIMIT_PER_10MIN  (default: 0 = disabled)
//   AI_DAILY_CAP_DEFAULT  (default: 0 = unlimited; per-center value overrides)
// =====================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL          = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY      = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Per-provider key list. Primary first, then optional _2 / _3 backups.
// On 429 / 5xx the proxy auto-retries with the next key in the list.
function collectKeys(base: string): string[] {
  const out: string[] = [];
  const primary = Deno.env.get(base) || '';
  if (primary) out.push(primary);
  for (let i = 2; i <= 5; i++) {
    const k = Deno.env.get(`${base}_${i}`) || '';
    if (k) out.push(k);
  }
  return out;
}
const GEMINI_KEYS:   string[] = collectKeys('GEMINI_API_KEY');
const GEMINI_KEY_PREPAY:    string = Deno.env.get('GEMINI_API_KEY_PREPAY')    || '';
const GEMINI_KEY_PREPAY_2:  string = Deno.env.get('GEMINI_API_KEY_PREPAY_2')  || '';
const GEMINI_KEY_POSTPAY:   string = Deno.env.get('GEMINI_API_KEY_POSTPAY')   || '';
const GEMINI_KEY_POSTPAY_2: string = Deno.env.get('GEMINI_API_KEY_POSTPAY_2') || '';
const OPENAI_KEYS:   string[] = collectKeys('OPENAI_API_KEY');
const CLAUDE_KEYS:   string[] = collectKeys('CLAUDE_API_KEY');
const GROK_KEYS:     string[] = collectKeys('GROK_API_KEY');
const DEEPSEEK_KEYS: string[] = collectKeys('DEEPSEEK_API_KEY');
const ASSEMBLYAI_KEYS: string[] = collectKeys('ASSEMBLYAI_API_KEY');
function keysFor(provider: string): string[] {
  switch (provider) {
    case 'gemini':     return GEMINI_KEYS;
    case 'openai':     return OPENAI_KEYS;
    case 'claude':     return CLAUDE_KEYS;
    case 'grok':       return GROK_KEYS;
    case 'deepseek':   return DEEPSEEK_KEYS;
    case 'assemblyai': return ASSEMBLYAI_KEYS;
    default:           return [];
  }
}

// Gemini multi-billing: map a plan string ("prepay" | "prepay_2" |
// "prepay_both" | "postpay" | "postpay_2" | "postpay_both") to the
// corresponding configured key(s). Returns [] when the plan is unknown
// or when no matching key is configured. "_both" plans return both
// slots so the caller's normal 429/5xx auto-failover loop covers them.
function resolveGeminiKeysForPlan(plan: string): string[] {
  const planMap: Record<string, string[]> = {
    'prepay':       [GEMINI_KEY_PREPAY],
    'prepay_2':     [GEMINI_KEY_PREPAY_2],
    'prepay_both':  [GEMINI_KEY_PREPAY,  GEMINI_KEY_PREPAY_2],
    'postpay':      [GEMINI_KEY_POSTPAY],
    'postpay_2':    [GEMINI_KEY_POSTPAY_2],
    'postpay_both': [GEMINI_KEY_POSTPAY, GEMINI_KEY_POSTPAY_2],
  };
  const list = planMap[(plan || '').trim().toLowerCase()];
  if (!list) return [];
  return list.filter(k => !!k);
}

// Gemini multi-billing: read `gemini_active_plan` from site_settings and
// return the matching dedicated key(s). Falls back to the generic
// GEMINI_KEYS pool when nothing is configured. Cached for 60s to avoid
// a DB hit on every call. Per-request overrides (header `x-ms-gemini-plan`
// sent by the center-management plumbing) bypass this cache entirely.
let _geminiPlanCache: { keys: string[]; until: number } | null = null;
async function getGeminiKeys(): Promise<string[]> {
  const now = Date.now();
  if (_geminiPlanCache && _geminiPlanCache.until > now) return _geminiPlanCache.keys;
  let keys: string[] = GEMINI_KEYS;
  try {
    const { data } = await sb
      .from('site_settings')
      .select('value')
      .eq('key', 'gemini_active_plan')
      .maybeSingle();
    const plan = (data?.value || '').toString().trim().toLowerCase();
    const planKeys = resolveGeminiKeysForPlan(plan);
    if (planKeys.length) keys = planKeys;
  } catch (_e) { /* fall back to default keys */ }
  _geminiPlanCache = { keys, until: now + 60_000 };
  return keys;
}

const RATE_LIMIT_PER_10MIN  = Number(Deno.env.get('RATE_LIMIT_PER_10MIN') || '0');  // 0 = disabled
const AI_DAILY_CAP_DEFAULT  = Number(Deno.env.get('AI_DAILY_CAP_DEFAULT') || '0');  // 0 = unlimited

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

function jsonErr(status: number, error: string, detail?: string) {
  return new Response(
    JSON.stringify({ error, detail: detail || '' }),
    { status, headers: { ...CORS, 'Content-Type': 'application/json' } }
  );
}

interface ProviderTarget {
  url:     string;
  headers: Record<string, string>;
}

// Map "/<provider>/<path>" → real upstream URL + auth headers.
// `key` selects which configured API key to use (for fallback retries).
function resolveTarget(provider: string, restPath: string, search: string, key: string): ProviderTarget | null {
  if (!key) return null;
  switch (provider) {
    case 'gemini': {
      // Strip any browser-supplied ?key=...; we add ours
      const sp = new URLSearchParams(search);
      sp.delete('key');
      sp.set('key', key);
      return {
        url: `https://generativelanguage.googleapis.com/${restPath}?${sp.toString()}`,
        headers: { 'Content-Type': 'application/json' }
      };
    }
    case 'openai': {
      return {
        url: `https://api.openai.com/${restPath}${search || ''}`,
        headers: { 'Authorization': `Bearer ${key}` }
      };
    }
    case 'claude': {
      return {
        url: `https://api.anthropic.com/${restPath}${search || ''}`,
        headers: {
          'x-api-key':         key,
          'anthropic-version': '2023-06-01',
          'Content-Type':      'application/json'
        }
      };
    }
    case 'grok': {
      return {
        url: `https://api.x.ai/${restPath}${search || ''}`,
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' }
      };
    }
    case 'deepseek': {
      return {
        url: `https://api.deepseek.com/${restPath}${search || ''}`,
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' }
      };
    }
    case 'assemblyai': {
      // AssemblyAI auth = raw key in Authorization header (NO "Bearer" prefix).
      // Three endpoints we forward:
      //   POST /v2/upload        — body is raw audio bytes (Content-Type set by caller)
      //   POST /v2/transcript    — body is JSON { audio_url, language_detection: true }
      //   GET  /v2/transcript/{id} — polling for status
      return {
        url: `https://api.assemblyai.com/${restPath}${search || ''}`,
        headers: { 'Authorization': key }
      };
    }
    default:
      return null;
  }
}

async function isIpBlocked(ip: string): Promise<boolean> {
  if (!ip) return false;
  const { data } = await sb
    .from('blocked_ips')
    .select('ip')
    .eq('ip', ip)
    .maybeSingle();
  return !!data;
}

// Gate 6: per-account block. Admins flip candidates.blocked = true from the
// Registered Users panel. Lookup is by Google email (case-insensitive),
// scoped to the same center the user is currently submitting from so a
// block on one center can't accidentally lock the same email on another.
async function isEmailBlocked(email: string, centerId: string): Promise<boolean> {
  if (!email) return false;
  let q = sb.from('candidates').select('blocked').eq('email', email).eq('blocked', true);
  if (centerId) q = q.eq('center', centerId);
  const { data } = await q.maybeSingle();
  return !!data;
}

async function getCenterGate(centerId: string): Promise<{ allowed: boolean; dailyCap: number; perStudentCap: number }> {
  if (!centerId) return { allowed: false, dailyCap: 0, perStudentCap: 0 };
  const { data } = await sb
    .from('site_settings')
    .select('value')
    .eq('key', `center_config_${centerId}`)
    .maybeSingle();
  if (!data) return { allowed: false, dailyCap: 0, perStudentCap: 0 };
  let v: any = data.value;
  if (typeof v === 'string') { try { v = JSON.parse(v); } catch { v = {}; } }
  const allowed  = v?.active !== false;
  // dailyMockLimit: 0 (or missing) means unlimited → fall back to env default (also 0 = unlimited).
  const dailyCap = (typeof v?.dailyMockLimit === 'number' && v.dailyMockLimit > 0)
                     ? v.dailyMockLimit
                     : AI_DAILY_CAP_DEFAULT;
  const perStudentCap = (typeof v?.maxAttemptsPerStudent === 'number' && v.maxAttemptsPerStudent > 0)
                     ? v.maxAttemptsPerStudent
                     : 0;
  return { allowed, dailyCap, perStudentCap };
}

async function ipRateExceeded(ip: string): Promise<boolean> {
  if (!ip || RATE_LIMIT_PER_10MIN <= 0) return false;
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count } = await sb
    .from('ai_submission_logs')
    .select('id', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('created_at', since);
  return (count || 0) >= RATE_LIMIT_PER_10MIN;
}

async function dailyCapExceeded(centerId: string, cap: number): Promise<boolean> {
  if (!centerId || cap <= 0) return false;  // 0 / missing = unlimited
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await sb
    .from('ai_submission_logs')
    .select('id', { count: 'exact', head: true })
    .eq('center_id', centerId)
    .eq('status', 'ok')
    .gte('created_at', since);
  return (count || 0) >= cap;
}

// Gate 5: per-student daily cap. Identifies a student by signed-in Google
// email when supplied; otherwise falls back to IP (so guests can't bypass
// by clearing local storage — they'd need to change network).
async function studentCapExceeded(
  centerId: string, email: string, ip: string, cap: number
): Promise<boolean> {
  if (!centerId || cap <= 0) return false;
  if (!email && !ip) return false;
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  let q = sb.from('ai_submission_logs')
    .select('id', { count: 'exact', head: true })
    .eq('center_id', centerId)
    .eq('status', 'ok')
    .gte('created_at', since);
  if (email) {
    q = q.eq('user_email', email);
  } else {
    q = q.eq('ip', ip).is('user_email', null);
  }
  const { count } = await q;
  return (count || 0) >= cap;
}

async function logCall(opts: {
  ip:       string;
  userAgent:string;
  centerId: string;
  provider: string;
  skill:    string;
  status:   string;
  studentName?: string;
  userEmail?:   string;
  bytesIn?: number;
  bytesOut?:number;
  errorMessage?: string;
}) {
  try {
    await sb.from('ai_submission_logs').insert({
      ip:            opts.ip || null,
      user_agent:    opts.userAgent || null,
      center_id:     opts.centerId || null,
      student_name:  opts.studentName || null,
      user_email:    opts.userEmail || null,
      provider:      opts.provider,
      skill:         opts.skill || null,
      status:        opts.status,
      bytes_in:      opts.bytesIn  ?? null,
      bytes_out:     opts.bytesOut ?? null,
      error_message: opts.errorMessage || null
    });
  } catch (_e) { /* non-fatal */ }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS });
  }

  // -------- parse path: /<provider>/<rest...>?query --------
  const url       = new URL(req.url);
  // After "/functions/v1/ai-proxy"
  const fullPath  = url.pathname.replace(/^.*\/ai-proxy\/?/, '');
  const segs      = fullPath.split('/');
  const provider  = (segs.shift() || '').toLowerCase();
  const restPath  = segs.join('/');
  const search    = url.search;

  if (!provider) {
    return jsonErr(400, 'missing_provider',
      'Use /functions/v1/ai-proxy/<gemini|openai|claude|grok|deepseek|assemblyai>/<provider-path>');
  }

  // -------- collect identity --------
  const ip        = (req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || '').split(',')[0].trim();
  const centerId  = (req.headers.get('x-ms-center') || '').trim();
  const userAgent = (req.headers.get('user-agent') || '').slice(0, 256);
  const skillHint = (req.headers.get('x-ms-skill') || '').slice(0, 32);
  const studentName = (req.headers.get('x-ms-student') || '').slice(0, 120);
  const userEmail = (req.headers.get('x-ms-email') || '').slice(0, 160).toLowerCase();

  // -------- gate 1: IP blocklist --------
  if (await isIpBlocked(ip)) {
    logCall({ ip, userAgent, centerId, provider, skill: skillHint, studentName, userEmail, status: 'blocked_ip', errorMessage: ip });
    return jsonErr(403, 'blocked_ip', ip);
  }

  // -------- gate 6: per-account block (Google email) --------
  if (await isEmailBlocked(userEmail, centerId)) {
    logCall({ ip, userAgent, centerId, provider, skill: skillHint, studentName, userEmail, status: 'blocked_email', errorMessage: userEmail });
    return jsonErr(403, 'blocked_email',
      `Account ${userEmail} is blocked for center ${centerId}.`);
  }

  // -------- gate 2: center whitelist --------
  const gate = await getCenterGate(centerId);
  if (!gate.allowed) {
    logCall({ ip, userAgent, centerId, provider, skill: skillHint, studentName, userEmail, status: 'bad_center', errorMessage: centerId });
    return jsonErr(403, 'unknown_or_inactive_center',
      `centerId="${centerId}" not present in Center Hub or marked inactive.`);
  }

  // -------- gate 3: per-IP rate limit --------
  if (await ipRateExceeded(ip)) {
    logCall({ ip, userAgent, centerId, provider, skill: skillHint, studentName, userEmail, status: 'rate_limited' });
    return jsonErr(429, 'rate_limited',
      `>${RATE_LIMIT_PER_10MIN} calls in 10 min from this IP.`);
  }

  // -------- gate 4: per-center daily cap --------
  if (await dailyCapExceeded(centerId, gate.dailyCap)) {
    logCall({ ip, userAgent, centerId, provider, skill: skillHint, studentName, userEmail, status: 'rate_limited',
             errorMessage: `daily_cap ${gate.dailyCap}` });
    return jsonErr(429, 'daily_cap_exceeded',
      `Center ${centerId} hit cap of ${gate.dailyCap}/day.`);
  }

  // -------- gate 5: per-student daily cap --------
  if (await studentCapExceeded(centerId, userEmail, ip, gate.perStudentCap)) {
    logCall({ ip, userAgent, centerId, provider, skill: skillHint, studentName, userEmail, status: 'rate_limited',
             errorMessage: `student_cap ${gate.perStudentCap}` });
    const who = userEmail ? `email ${userEmail}` : `IP ${ip}`;
    return jsonErr(429, 'student_cap_exceeded',
      `${who} hit cap of ${gate.perStudentCap} AI calls/day for center ${centerId}.`);
  }

  // -------- resolve provider --------
  // Per-request Gemini plan override: a center can pick its own billing
  // slot via the AI & Scoring panel (header set by ai-proxy-interceptor.js
  // from window._centerConfig.geminiPlan / __geminiPlanOverride). Empty /
  // missing / unknown plan falls through to the global default below.
  let providerKeys: string[];
  if (provider === 'gemini') {
    const planHdr = (req.headers.get('x-ms-gemini-plan') || '').trim().toLowerCase();
    const overrideKeys = planHdr ? resolveGeminiKeysForPlan(planHdr) : [];
    providerKeys = overrideKeys.length ? overrideKeys : await getGeminiKeys();
  } else {
    providerKeys = keysFor(provider);
  }
  if (providerKeys.length === 0) {
    return jsonErr(400, 'unknown_or_unconfigured_provider', provider);
  }

  // -------- forward request --------
  // Pass through Content-Type if the original request had something
  // specific (e.g. multipart for whisper).  Provider headers win.
  const incomingCt = req.headers.get('content-type');

  // Buffer the body once so we can retry with a different key on 429/5xx.
  const hasBody = !(req.method === 'GET' || req.method === 'HEAD');
  let bodyBuf: ArrayBuffer | undefined = undefined;
  if (hasBody) {
    try { bodyBuf = await req.arrayBuffer(); } catch { bodyBuf = undefined; }
  }

  let upstream: Response | null = null;
  let lastErr: any = null;
  let usedKeyIdx = 0;

  for (let i = 0; i < providerKeys.length; i++) {
    const t = resolveTarget(provider, restPath, search, providerKeys[i]);
    if (!t) continue;

    const fwdHeaders: Record<string, string> = { ...t.headers };
    if (incomingCt && !fwdHeaders['Content-Type'] && !fwdHeaders['content-type']) {
      fwdHeaders['Content-Type'] = incomingCt;
    }

    try {
      const r = await fetch(t.url, {
        method:  req.method,
        headers: fwdHeaders,
        body:    hasBody ? bodyBuf : undefined
      });
      // If transient (429 or 5xx) and we have another key, retry.
      if ((r.status === 429 || r.status >= 500) && i < providerKeys.length - 1) {
        try { await r.body?.cancel(); } catch {}
        lastErr = `HTTP ${r.status} on key#${i + 1}`;
        continue;
      }
      upstream  = r;
      usedKeyIdx = i;
      break;
    } catch (e: any) {
      lastErr = e?.message || String(e);
      if (i < providerKeys.length - 1) continue;
    }
  }

  if (!upstream) {
    logCall({ ip, userAgent, centerId, provider, skill: skillHint, studentName, userEmail, status: 'provider_error',
             errorMessage: String(lastErr || 'fetch_failed').slice(0, 500) });
    return jsonErr(502, 'upstream_fetch_failed', String(lastErr || 'fetch_failed'));
  }

  // Log (don't block on log). Mark which key index served it when >1 configured.
  const keyTag = (providerKeys.length > 1) ? `key#${usedKeyIdx + 1}` : '';
  logCall({
    ip, userAgent, centerId, provider, skill: skillHint, studentName, userEmail,
    status: upstream.ok ? 'ok' : 'provider_error',
    errorMessage: upstream.ok
      ? keyTag
      : `HTTP ${upstream.status}${keyTag ? ` (${keyTag})` : ''}`
  });

  // Stream upstream response back
  const respHeaders = new Headers(upstream.headers);
  // Strip hop-by-hop and replace CORS
  respHeaders.delete('content-encoding');
  respHeaders.delete('content-length');
  respHeaders.set('Access-Control-Allow-Origin',  '*');
  respHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  respHeaders.set('Access-Control-Allow-Headers', '*');

  return new Response(upstream.body, {
    status:     upstream.status,
    statusText: upstream.statusText,
    headers:    respHeaders
  });
});
