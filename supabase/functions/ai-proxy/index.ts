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
//
// Gates (all enforced before forwarding):
//   1) IP blocklist          (public.blocked_ips)
//   2) Center whitelist      (row in public.site_settings
//                             where key='center_config_{testId}'
//                             AND value->>'active' != 'false')
//   3) Rate limit per IP     (default: 20 calls / 10 min)
//   4) Daily cap per center  (value->>'dailyMockLimit' or env default)
// Every forwarded call is logged to public.ai_submission_logs.
//
// Deploy:
//   supabase functions deploy ai-proxy --no-verify-jwt
// Secrets:
//   GEMINI_API_KEY, OPENAI_API_KEY, CLAUDE_API_KEY, GROK_API_KEY, DEEPSEEK_API_KEY
//   RATE_LIMIT_PER_10MIN  (default: 20)
//   AI_DAILY_CAP_DEFAULT  (default: 500)
// =====================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL          = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY      = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GEMINI_API_KEY        = Deno.env.get('GEMINI_API_KEY')   || '';
const OPENAI_API_KEY        = Deno.env.get('OPENAI_API_KEY')   || '';
const CLAUDE_API_KEY        = Deno.env.get('CLAUDE_API_KEY')   || '';
const GROK_API_KEY          = Deno.env.get('GROK_API_KEY')     || '';
const DEEPSEEK_API_KEY      = Deno.env.get('DEEPSEEK_API_KEY') || '';
const RATE_LIMIT_PER_10MIN  = Number(Deno.env.get('RATE_LIMIT_PER_10MIN') || '20');
const AI_DAILY_CAP_DEFAULT  = Number(Deno.env.get('AI_DAILY_CAP_DEFAULT') || '500');

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

// Map "/<provider>/<path>" → real upstream URL + auth headers
function resolveTarget(provider: string, restPath: string, search: string): ProviderTarget | null {
  switch (provider) {
    case 'gemini': {
      if (!GEMINI_API_KEY) return null;
      // Strip any browser-supplied ?key=...; we add ours
      const sp = new URLSearchParams(search);
      sp.delete('key');
      sp.set('key', GEMINI_API_KEY);
      return {
        url: `https://generativelanguage.googleapis.com/${restPath}?${sp.toString()}`,
        headers: { 'Content-Type': 'application/json' }
      };
    }
    case 'openai': {
      if (!OPENAI_API_KEY) return null;
      return {
        url: `https://api.openai.com/${restPath}${search || ''}`,
        headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` }
      };
    }
    case 'claude': {
      if (!CLAUDE_API_KEY) return null;
      return {
        url: `https://api.anthropic.com/${restPath}${search || ''}`,
        headers: {
          'x-api-key':         CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type':      'application/json'
        }
      };
    }
    case 'grok': {
      if (!GROK_API_KEY) return null;
      return {
        url: `https://api.x.ai/${restPath}${search || ''}`,
        headers: { 'Authorization': `Bearer ${GROK_API_KEY}`, 'Content-Type': 'application/json' }
      };
    }
    case 'deepseek': {
      if (!DEEPSEEK_API_KEY) return null;
      return {
        url: `https://api.deepseek.com/${restPath}${search || ''}`,
        headers: { 'Authorization': `Bearer ${DEEPSEEK_API_KEY}`, 'Content-Type': 'application/json' }
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

async function getCenterGate(centerId: string): Promise<{ allowed: boolean; dailyCap: number }> {
  if (!centerId) return { allowed: false, dailyCap: 0 };
  const { data } = await sb
    .from('site_settings')
    .select('value')
    .eq('key', `center_config_${centerId}`)
    .maybeSingle();
  if (!data) return { allowed: false, dailyCap: 0 };
  let v: any = data.value;
  if (typeof v === 'string') { try { v = JSON.parse(v); } catch { v = {}; } }
  const allowed  = v?.active !== false;
  const dailyCap = (typeof v?.dailyMockLimit === 'number' && v.dailyMockLimit > 0)
                     ? v.dailyMockLimit
                     : AI_DAILY_CAP_DEFAULT;
  return { allowed, dailyCap };
}

async function ipRateExceeded(ip: string): Promise<boolean> {
  if (!ip) return false;
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count } = await sb
    .from('ai_submission_logs')
    .select('id', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('created_at', since);
  return (count || 0) >= RATE_LIMIT_PER_10MIN;
}

async function dailyCapExceeded(centerId: string, cap: number): Promise<boolean> {
  if (!centerId) return false;
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await sb
    .from('ai_submission_logs')
    .select('id', { count: 'exact', head: true })
    .eq('center_id', centerId)
    .eq('status', 'ok')
    .gte('created_at', since);
  return (count || 0) >= cap;
}

async function logCall(opts: {
  ip:       string;
  userAgent:string;
  centerId: string;
  provider: string;
  skill:    string;
  status:   string;
  bytesIn?: number;
  bytesOut?:number;
  errorMessage?: string;
}) {
  try {
    await sb.from('ai_submission_logs').insert({
      ip:            opts.ip || null,
      user_agent:    opts.userAgent || null,
      center_id:     opts.centerId || null,
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
      'Use /functions/v1/ai-proxy/<gemini|openai|claude|grok|deepseek>/<provider-path>');
  }

  // -------- collect identity --------
  const ip        = (req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || '').split(',')[0].trim();
  const centerId  = (req.headers.get('x-ms-center') || '').trim();
  const userAgent = (req.headers.get('user-agent') || '').slice(0, 256);
  const skillHint = (req.headers.get('x-ms-skill') || '').slice(0, 32);

  // -------- gate 1: IP blocklist --------
  if (await isIpBlocked(ip)) {
    logCall({ ip, userAgent, centerId, provider, skill: skillHint, status: 'blocked_ip', errorMessage: ip });
    return jsonErr(403, 'blocked_ip', ip);
  }

  // -------- gate 2: center whitelist --------
  const gate = await getCenterGate(centerId);
  if (!gate.allowed) {
    logCall({ ip, userAgent, centerId, provider, skill: skillHint, status: 'bad_center', errorMessage: centerId });
    return jsonErr(403, 'unknown_or_inactive_center',
      `centerId="${centerId}" not present in Center Hub or marked inactive.`);
  }

  // -------- gate 3: per-IP rate limit --------
  if (await ipRateExceeded(ip)) {
    logCall({ ip, userAgent, centerId, provider, skill: skillHint, status: 'rate_limited' });
    return jsonErr(429, 'rate_limited',
      `>${RATE_LIMIT_PER_10MIN} calls in 10 min from this IP.`);
  }

  // -------- gate 4: per-center daily cap --------
  if (await dailyCapExceeded(centerId, gate.dailyCap)) {
    logCall({ ip, userAgent, centerId, provider, skill: skillHint, status: 'rate_limited',
             errorMessage: `daily_cap ${gate.dailyCap}` });
    return jsonErr(429, 'daily_cap_exceeded',
      `Center ${centerId} hit cap of ${gate.dailyCap}/day.`);
  }

  // -------- resolve provider --------
  const target = resolveTarget(provider, restPath, search);
  if (!target) {
    return jsonErr(400, 'unknown_or_unconfigured_provider', provider);
  }

  // -------- forward request --------
  const fwdHeaders: Record<string, string> = { ...target.headers };
  // Pass through Content-Type if the original request had something
  // specific (e.g. multipart for whisper).  Provider headers win.
  const incomingCt = req.headers.get('content-type');
  if (incomingCt && !fwdHeaders['Content-Type'] && !fwdHeaders['content-type']) {
    fwdHeaders['Content-Type'] = incomingCt;
  }

  let upstream: Response;
  try {
    upstream = await fetch(target.url, {
      method:  req.method,
      headers: fwdHeaders,
      body:    req.method === 'GET' || req.method === 'HEAD' ? undefined : req.body,
      // @ts-ignore - Deno-specific to allow streaming bodies
      duplex:  'half'
    });
  } catch (e: any) {
    logCall({ ip, userAgent, centerId, provider, skill: skillHint, status: 'provider_error',
             errorMessage: (e?.message || String(e)).slice(0, 500) });
    return jsonErr(502, 'upstream_fetch_failed', e?.message || String(e));
  }

  // Log (don't block on log)
  logCall({
    ip, userAgent, centerId, provider, skill: skillHint,
    status: upstream.ok ? 'ok' : 'provider_error',
    errorMessage: upstream.ok ? '' : `HTTP ${upstream.status}`
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
