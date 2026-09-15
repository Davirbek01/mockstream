// ============================================================================
// Supabase Edge Function: exam-session
// ----------------------------------------------------------------------------
// One exam at a time for a Premium account, on every centre and every
// platform (web, Android, iOS, Windows, Mac). Practice counts as an exam.
//
// Who is locked: an active, unexpired Premium account on that centre.
// Who is not: Ultra (Mock Stream + Record), admins, code users, and anyone not
// signed in. Those get { allowed: true, tracked: false } and the client sends
// nothing further.
//
// The logic and its race protection live in SQL (migration
// 20260915140000_ultra_plan_and_exam_lock.sql); this function only resolves
// WHO is calling at start / request — from the JWT, never from the body, or
// anybody could lock somebody else out — and where from (IP, country). After
// that, the session / request uuid it handed out is the credential: the exam
// pages cannot refresh a token, and a paper outlives one.
//
// Actions (POST { action, ... }):
//   start    { center, device_key, platform, device_label, exam_key, exam_label, practice }
//            → { allowed, tracked, session_id, beat_seconds } | { allowed:false, holder }
//   beat     { session_id, device_key, active }          (no JWT needed)
//            → { state: ok | request | ended | unknown, request?, reason?, by? }
//   end      { session_id, device_key, reason: submitted | closed }
//   request  { same fields as start } → { status: pending | released | rate_limited, ... }
//   poll     { request_id, device_key } → { status, session_id? }
//   answer   { session_id, device_key, request_id, approve }
//
// Every failure fails OPEN: a bug or an outage here must never stop a
// student from taking a mock. Clients treat any non-JSON / error as allowed.
//
// Deploy: supabase functions deploy exam-session --no-verify-jwt
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

/** How often a holding device should report in. Short enough that a takeover
 *  request reaches it well inside its 60-second answer window. */
const BEAT_SECONDS = 15;

const PLATFORMS = ['web', 'android', 'ios', 'windows', 'mac'];

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' }
  });
}

const openDoor = (extra: Record<string, unknown> = {}) =>
  json(200, { allowed: true, tracked: false, ...extra });

function str(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

function clientIp(req: Request): string {
  const h = req.headers;
  const cf = h.get('cf-connecting-ip');
  if (cf) return cf.trim();
  const xff = h.get('x-forwarded-for') || '';
  return xff.split(',')[0].trim();
}

type Caller = { email: string; telegram: string };

async function caller(req: Request): Promise<Caller | null> {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  try {
    const { data, error } = await sb.auth.getUser(token);
    if (error || !data?.user?.email) return null;
    const meta = (data.user.user_metadata || {}) as Record<string, unknown>;
    return {
      email: String(data.user.email).trim().toLowerCase(),
      telegram: typeof meta.telegram_username === 'string' ? meta.telegram_username : '',
    };
  } catch {
    return null;
  }
}

/** admin | ultra | premium | '' for this account on this centre, plus the
 *  identity key the lock is held under. */
async function access(c: Caller, center: string): Promise<{ kind: string; ident: string }> {
  const { data, error } = await sb.rpc('account_access', {
    p_email: c.email, p_telegram: c.telegram, p_center: center,
  });
  if (error) throw new Error(`account_access: ${error.message}`);
  const row = Array.isArray(data) ? data[0] : data;
  return { kind: String(row?.kind || ''), ident: String(row?.ident || '') };
}

/** Centre id as the lock stores it: mock_stream and mockstream are one centre. */
function normCenter(c: string): string {
  const v = c.trim().toLowerCase();
  return v === '' || v === 'mock_stream' || v === 'mockstream' ? 'mockstream' : v;
}

async function rpc(fn: string, args: Record<string, unknown>) {
  const { data, error } = await sb.rpc(fn, args);
  if (error) throw new Error(`${fn}: ${error.message}`);
  return (data ?? {}) as Record<string, unknown>;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST')    return json(405, { error: 'method_not_allowed' });

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* empty */ }

  const action    = str(body.action, 16);
  const centerRaw = str(body.center, 40);
  const deviceKey = str(body.device_key, 120);
  if (!deviceKey) return openDoor({ reason: 'bad_request' });

  try {
    // ---- after the start: the session / request id is the credential ----
    // The exam pages cannot refresh an access token, so a 60-minute paper
    // would outlive it. The uuid the server handed out at start, together
    // with this device's key, is what a heartbeat proves instead.
    switch (action) {
      case 'beat': {
        const r = await rpc('exam_session_beat', {
          p_ident: null, p_session_id: str(body.session_id, 40), p_device_key: deviceKey,
          p_active: body.active === true,
        });
        return json(200, { ...r, beat_seconds: BEAT_SECONDS });
      }
      case 'end': {
        const r = await rpc('exam_session_end', {
          p_ident: null, p_session_id: str(body.session_id, 40), p_device_key: deviceKey,
          p_reason: str(body.reason, 16),
        });
        return json(200, r);
      }
      case 'poll': {
        const r = await rpc('exam_takeover_poll', {
          p_ident: null, p_request_id: str(body.request_id, 40), p_device_key: deviceKey,
        });
        return json(200, { ...r, beat_seconds: BEAT_SECONDS });
      }
      case 'answer': {
        const r = await rpc('exam_takeover_answer', {
          p_ident: null, p_session_id: str(body.session_id, 40), p_device_key: deviceKey,
          p_request_id: str(body.request_id, 40), p_approve: body.approve === true,
        });
        return json(200, r);
      }
      case 'start':
      case 'request':
        break;
      default:
        return openDoor({ reason: 'unknown_action' });
    }

    // ---- start / request: who is this, and are they locked at all ----
    if (!centerRaw) return openDoor({ reason: 'bad_request' });
    const center = normCenter(centerRaw);

    const c = await caller(req);
    if (!c) return openDoor({ reason: 'no_account' });

    const acc = await access(c, centerRaw);
    // Only Premium is locked. Ultra and admins are free by design; everyone
    // else has no account-bound access worth sharing.
    if (acc.kind !== 'premium' || !acc.ident) {
      return openDoor({ reason: acc.kind || 'not_premium' });
    }

    const platformRaw = str(body.platform, 16).toLowerCase();
    const platform    = PLATFORMS.includes(platformRaw) ? platformRaw : 'web';
    const startArgs = {
      p_ident:      acc.ident,
      p_center:     center,
      p_device_key: deviceKey,
      p_platform:   platform,
      p_label:      str(body.device_label, 80) || null,
      p_ip:         clientIp(req) || null,
      p_country:    (req.headers.get('cf-ipcountry') || '').slice(0, 8) || null,
      p_exam_key:   str(body.exam_key, 120) || null,
      p_exam_label: str(body.exam_label, 120) || null,
      p_practice:   body.practice === true,
    };

    if (action === 'start') {
      const r = await rpc('exam_session_start', startArgs);
      return json(200, { ...r, tracked: r.allowed === true, beat_seconds: BEAT_SECONDS });
    }
    const r = await rpc('exam_takeover_request', startArgs);
    return json(200, { ...r, beat_seconds: BEAT_SECONDS });
  } catch (e) {
    console.error('[exam-session]', action, (e as Error).message);
    // Fail open — for beat that means "carry on", for start "go ahead".
    return action === 'beat'
      ? json(200, { state: 'ok', beat_seconds: BEAT_SECONDS, degraded: true })
      : openDoor({ reason: 'error' });
  }
});
