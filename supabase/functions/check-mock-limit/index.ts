// =====================================================================
// Supabase Edge Function: check-mock-limit
// ---------------------------------------------------------------------
// Answers one question, before a mock is allowed to open:
//   "may this account start <skill> at this centre right now?"
//
// The limit is per centre, per skill, per account, over a rolling 24 hours,
// and is set in the admin Centers panel (dailyLimitReading /
// dailyLimitListening / dailyLimitWriting / dailyLimitSpeaking).
// 0 or missing = unlimited, which is the default for every centre — nothing
// changes until an admin types a number.
//
// The counting rule lives in the SQL function mock_daily_usage(), NOT here,
// so this and authorize-finish can never drift into disagreeing about
// whether a student is over their limit. In short: an attempt counts once
// it is submitted, or once it is 30 minutes old and still unsubmitted.
//
// Identity: the caller's JWT when one is supplied, which is unfakeable and
// is what every signed-in student has (sign-in is mandatory to take a mock).
// A body email is accepted as a fallback so a student whose token is being
// refreshed is not locked out of the platform — this endpoint is the UX
// gate, and getting past it only reaches the exam page. authorize-finish
// re-checks with the JWT alone before any report or certificate is issued,
// so nothing of value is handed out on an unverified identity.
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

async function skillLimit(centerId: string, skill: Skill): Promise<number> {
  const { data } = await sb
    .from('site_settings')
    .select('value')
    .eq('key', `center_config_${centerId}`)
    .maybeSingle();
  if (!data) return 0;
  let v: any = (data as { value: unknown }).value;
  if (typeof v === 'string') { try { v = JSON.parse(v); } catch { return 0; } }
  const raw = v?.[LIMIT_FIELD[skill]];
  const n = typeof raw === 'number' ? raw : parseInt(String(raw ?? ''), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
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

  const limit = await skillLimit(centerId, skill);
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
    p_email:  email,
    p_center: centerId,
    p_skill:  skill
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
      allowed: true, limit, used, remaining: limit - used, identified
    });
  }

  // Over the limit. The count drops again when the earliest attempt inside
  // the window ages out of it, which is the only honest "come back at" we
  // can give the student.
  let nextAvailableAt: string | null = null;
  if (oldest) {
    const t = Date.parse(oldest);
    if (Number.isFinite(t)) nextAvailableAt = new Date(t + 24 * 60 * 60 * 1000).toISOString();
  }

  return json(200, {
    allowed: false, limit, used, remaining: 0, nextAvailableAt, skill, identified
  });
});
