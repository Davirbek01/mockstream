// =====================================================================
// Supabase Edge Function: authorize-finish
// ---------------------------------------------------------------------
// Called by the browser BEFORE showing any mock finish modal or
// generating a certificate. Verifies that:
//   1) The center_id (x-ms-center) exists & is active in Supabase.
//   2) The brand/logo/testIdentifier the client THINKS it has matches
//      the trusted values in site_settings.center_site_config_{id}.
//
// If anything is tampered → 403 + { mismatches: [...] }.
// The browser refuses to render finish modals / certs on 403.
//
// Deploy:
//   supabase functions deploy authorize-finish --no-verify-jwt
// =====================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' }
  });
}

async function readRow(key: string): Promise<Record<string, unknown> | null> {
  const { data } = await sb
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  if (!data) return null;
  let v: unknown = (data as { value: unknown }).value;
  if (typeof v === 'string') {
    try { v = JSON.parse(v); } catch { v = {}; }
  }
  return v as Record<string, unknown>;
}

async function logAttempt(opts: {
  ip: string;
  userAgent: string;
  centerId: string;
  status: string;
  errorMessage?: string;
  studentName?: string;
}) {
  try {
    await sb.from('ai_submission_logs').insert({
      ip:            opts.ip || null,
      user_agent:    opts.userAgent || null,
      center_id:     opts.centerId || null,
      student_name:  opts.studentName || null,
      provider:      'authorize-finish',
      skill:         null,
      status:        opts.status,
      bytes_in:      null,
      bytes_out:     null,
      error_message: opts.errorMessage || null
    });
  } catch (_e) { /* non-fatal */ }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS });
  }
  if (req.method !== 'POST') {
    return json(405, { error: 'method_not_allowed' });
  }

  // -------- identity --------
  const ip        = (req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || '').split(',')[0].trim();
  const userAgent = (req.headers.get('user-agent') || '').slice(0, 256);
  const centerId  = (req.headers.get('x-ms-center') || '').trim();

  // -------- parse body --------
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* empty body ok */ }
  const claim = {
    brandName:      typeof body.brandName      === 'string' ? body.brandName.trim()      : '',
    testIdentifier: typeof body.testIdentifier === 'string' ? body.testIdentifier.trim() : '',
    logoUrl:        typeof body.logoUrl        === 'string' ? body.logoUrl.trim()        : '',
    directorName:   typeof body.directorName   === 'string' ? body.directorName.trim()   : '',
  };
  const studentName = typeof body.studentName === 'string' ? body.studentName.trim().slice(0, 120) : '';

  // -------- gate 1: IP blocklist --------
  if (ip) {
    const { data: blocked } = await sb.from('blocked_ips').select('ip').eq('ip', ip).maybeSingle();
    if (blocked) {
      await logAttempt({ ip, userAgent, centerId, studentName, status: 'blocked_ip', errorMessage: ip });
      return json(403, { error: 'blocked_ip' });
    }
  }

  // -------- gate 2: center registered? --------
  if (!centerId) {
    await logAttempt({ ip, userAgent, centerId, studentName, status: 'bad_center', errorMessage: 'missing_center_header' });
    return json(403, { error: 'missing_center' });
  }

  const real = await readRow(`center_site_config_${centerId}`);
  if (!real) {
    await logAttempt({ ip, userAgent, centerId, studentName, status: 'bad_center', errorMessage: 'no_site_config_row' });
    return json(403, { error: 'unknown_center', centerId });
  }

  // -------- gate 3: center active? --------
  const gate = await readRow(`center_config_${centerId}`);
  if (gate && gate.active === false) {
    await logAttempt({ ip, userAgent, centerId, studentName, status: 'bad_center', errorMessage: 'center_inactive' });
    return json(403, { error: 'inactive_center', centerId });
  }

  // -------- gate 4: compare claim vs. truth --------
  const mismatches: string[] = [];
  if (claim.brandName      && claim.brandName      !== real.brandName)      mismatches.push('brandName');
  if (claim.testIdentifier && claim.testIdentifier !== real.testIdentifier) mismatches.push('testIdentifier');
  if (claim.logoUrl        && claim.logoUrl        !== real.logoUrl)        mismatches.push('logoUrl');
  if (claim.directorName   && claim.directorName   !== real.directorName)   mismatches.push('directorName');

  if (mismatches.length > 0) {
    // A claim that is EXACTLY the Mock Stream defaults, sent from another
    // centre, is not a forgery — it is the client that never loaded its own
    // config (cold cache, a dropped request) and fell back to the values baked
    // into the page. Blocking there punishes a student who did nothing wrong:
    // 11 finishes were refused this way on 2026-08-25 alone.
    //
    // Letting it through costs nothing, because this endpoint answers with the
    // SERVER's branding regardless — the claim carries no authority, it is only
    // ever a signal. A forgery naming some other real centre still blocks.
    const fallback = await readRow('center_site_config_mock_stream');
    const isUnloadedDefault = !!fallback && centerId !== 'mock_stream'
      && claim.brandName === fallback.brandName
      && claim.testIdentifier === fallback.testIdentifier;

    if (isUnloadedDefault) {
      await logAttempt({
        ip, userAgent, centerId, studentName,
        status: 'stale_claim',
        errorMessage: `client never loaded center_site_config_${centerId}; mismatches=${mismatches.join(',')}`
      });
    } else {
      await logAttempt({
        ip, userAgent, centerId, studentName,
        status: 'tamper_detected',
        errorMessage: `mismatches=${mismatches.join(',')}; claim=${JSON.stringify(claim)}`
      });
      return json(403, { error: 'tamper_detected', mismatches });
    }
  }

  // -------- success: return trusted data --------
  await logAttempt({ ip, userAgent, centerId, studentName, status: 'ok' });
  return json(200, {
    ok:   true,
    data: {
      brandName:        real.brandName        || '',
      testIdentifier:   real.testIdentifier   || '',
      logoUrl:          real.logoUrl          || '',
      directorName:     real.directorName     || '',
      directorFullName: real.directorFullName || '',
      directorTitle:    real.directorTitle    || '',
      ceoTitle:         real.ceoTitle         || '',
      siteDomain:       real.siteDomain       || '',
    }
  });
});
