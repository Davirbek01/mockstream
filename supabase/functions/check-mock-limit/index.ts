// =====================================================================
// Supabase Edge Function: check-mock-limit
// ---------------------------------------------------------------------
// Answers one question, before a mock is allowed to open:
//   "may this account start <skill> at this centre right now?"
//
// The limit is per centre, per skill, per account, over a rolling window, all
// set in the admin Centers panel: dailyLimitReading / dailyLimitListening /
// dailyLimitWriting / dailyLimitSpeaking for the counts, and
// dailyLimitWindowHours for the interval they are measured over (default 24,
// clamped to 1..168 — e.g. 5 means "one speaking, the next five hours later").
// A count of 0 or missing = unlimited, which is the default for every centre
// — nothing changes until an admin types a number.
//
// The counting rule lives in the SQL function mock_daily_usage(), NOT here,
// so any second caller added later cannot drift into disagreeing about
// whether a student is over their limit. In short: an attempt counts once
// it is submitted, or once it is 30 minutes old and still unsubmitted.
//
// Identity: the caller's JWT when one is supplied, which is unfakeable and
// is what every signed-in student has (sign-in is mandatory to take a mock).
// A body email is accepted as a fallback so a student whose token is being
// refreshed is not locked out of the platform.
//
// SCOPE, stated plainly: this stops a shared login being used through the
// normal UI, which is what it was built for. It does not stop someone who
// edits localStorage to skip the gate — mock_attempts is anon-writable, so a
// determined student can also avoid recording the attempt at all. The hard
// ceiling for that case remains ai-proxy's maxAttemptsPerStudent, which
// refuses the SCORING call and therefore the report. A limit check inside
// authorize-finish was considered and not built: it is not told which skill
// the finish is for, so it would mean changing ~26 exam pages, and it would
// refuse a student only after they had already done the whole mock.
//
// Deploy:
//   supabase functions deploy check-mock-limit --no-verify-jwt
// =====================================================================

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

const SKILLS = ['reading', 'listening', 'writing', 'speaking'] as const;
type Skill = typeof SKILLS[number];

const LIMIT_FIELD: Record<Skill, string> = {
  reading:   'dailyLimitReading',
  listening: 'dailyLimitListening',
  writing:   'dailyLimitWriting',
  speaking:  'dailyLimitSpeaking',
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' }
  });
}

// "allowed" with no limit attached — used for every case where we cannot or
// should not enforce. Failing open is deliberate: a bug here must never be
// able to stop a whole centre from taking mocks.
function unlimited(extra: Record<string, unknown> = {}) {
  return json(200, { allowed: true, limit: 0, used: 0, remaining: null, ...extra });
}

async function verifiedEmail(authHeader: string): Promise<string> {
  const token = (authHeader || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return '';
  try {
    const { data, error } = await sb.auth.getUser(token);
    if (error || !data?.user?.email) return '';
    return String(data.user.email).trim().toLowerCase();
  } catch {
    // Also the path taken when the anon publishable key is sent as the
    // bearer, which is not a user token and has no email.
    return '';
  }
}

async function isAdmin(email: string): Promise<boolean> {
  if (!email) return false;
  const { data } = await sb
    .from('premium_emails')
    .select('role')
    .eq('email', email)
    .eq('role', 'admin')
    .neq('active', false)
    .maybeSingle();
  return !!data;
}

// The cap and the interval it is measured over. The interval is per centre,
// not per skill — a centre picks one rhythm ("one of anything every 5 hours")
// and applies it across the board.
async function centreLimit(centerId: string, skill: Skill): Promise<{ limit: number; windowHours: number }> {
  const { data } = await sb
    .from('site_settings')
    .select('value')
    .eq('key', `center_config_${centerId}`)
    .maybeSingle();
  if (!data) return { limit: 0, windowHours: 24 };
  let v: any = (data as { value: unknown }).value;
  if (typeof v === 'string') { try { v = JSON.parse(v); } catch { return { limit: 0, windowHours: 24 }; } }

  const rawLimit = v?.[LIMIT_FIELD[skill]];
  const n = typeof rawLimit === 'number' ? rawLimit : parseInt(String(rawLimit ?? ''), 10);
  const limit = Number.isFinite(n) && n > 0 ? n : 0;

  // Clamped to 1h..168h (a week). Below an hour the fixed 30-minute grace
  // would swallow most of the window; the SQL clamps identically so a bad
  // value can never widen the window instead of narrowing it.
  const rawWin = v?.dailyLimitWindowHours;
  const w = typeof rawWin === 'number' ? rawWin : parseFloat(String(rawWin ?? ''));
  const windowHours = Number.isFinite(w) && w > 0 ? Math.min(Math.max(w, 1), 168) : 24;

  return { limit, windowHours };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST')    return json(405, { error: 'method_not_allowed' });

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* treated as empty below */ }

  const centerId = String(body.center || '').trim();
  const skillRaw = String(body.skill  || '').trim().toLowerCase();

  if (!centerId || !SKILLS.includes(skillRaw as Skill)) {
    // Cambridge / SAT papers and anything unrecognised are not limited.
    return unlimited({ reason: 'not_limited' });
  }
  const skill = skillRaw as Skill;

  const { limit, windowHours } = await centreLimit(centerId, skill);
  if (limit <= 0) return unlimited({ reason: 'no_limit_set' });

  // Only resolve identity once we know a limit is actually configured —
  // otherwise this endpoint would do two extra round trips per mock open
  // for the centres (all of them, today) that have no limit at all.
  let email = await verifiedEmail(req.headers.get('authorization') || '');
  let identified = 'jwt';
  if (!email) {
    email = String(body.email || '').trim().toLowerCase();
    identified = email ? 'client' : 'none';
  }
  if (!email) return unlimited({ reason: 'no_account', identified });

  if (await isAdmin(email)) return unlimited({ reason: 'admin', identified });

  const { data, error } = await sb.rpc('mock_daily_usage', {
    p_email:        email,
    p_center:       centerId,
    p_skill:        skill,
    p_window_hours: windowHours
  });
  if (error) {
    console.error('[check-mock-limit] mock_daily_usage failed:', error.message);
    return unlimited({ reason: 'count_failed', identified });
  }

  const row  = Array.isArray(data) ? data[0] : data;
  const used = Number(row?.used || 0);
  const oldest = row?.oldest_counted ? String(row.oldest_counted) : '';

  if (used < limit) {
    return json(200, {
      allowed: true, limit, used, remaining: limit - used, windowHours, identified
    });
  }

  // Over the limit. The count drops again when the earliest attempt inside
  // the window ages out of it, which is the only honest "come back at" we
  // can give the student.
  let nextAvailableAt: string | null = null;
  if (oldest) {
    const t = Date.parse(oldest);
    if (Number.isFinite(t)) {
      nextAvailableAt = new Date(t + windowHours * 60 * 60 * 1000).toISOString();
    }
  }

  return json(200, {
    allowed: false, limit, used, remaining: 0, nextAvailableAt, windowHours, skill, identified
  });
});
