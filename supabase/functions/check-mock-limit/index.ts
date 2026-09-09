// =====================================================================
// Supabase Edge Function: check-mock-limit
// ---------------------------------------------------------------------
// Answers one question, before a mock is allowed to open:
//   "may this account start <skill> at this centre right now?"
//
// TWO limits, both set in the admin Centers panel, both applying at once:
//
//   1. Per ACCOUNT, per skill, over a rolling window — stops one premium
//      login being shared around a class.
//        dailyLimitReading / dailyLimitListening / dailyLimitWriting /
//        dailyLimitSpeaking   + dailyLimitWindowHours (default 24,
//        clamped 1..168; 5 means "one, then the next five hours later")
//
//   2. Per CENTRE, per skill, per calendar month — caps a centre's total
//      volume, e.g. 5000 speaking a month.
//        monthlyLimitReading / monthlyLimitListening /
//        monthlyLimitWriting / monthlyLimitSpeaking
//
// 0 or missing = unlimited on every one of them, which is the default for
// every centre — nothing changes until an admin types a number.
//
// Both counting rules live in SQL (mock_daily_usage,
// mock_center_monthly_usage), never here, so they cannot drift into
// disagreeing about what an "attempt" is. In both: an attempt counts once it
// is submitted, or once it is 30 minutes old and still unsubmitted — so a
// dropped connection or an accidental close costs nothing.
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

const CAP = (skill: Skill) => skill.charAt(0).toUpperCase() + skill.slice(1);

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

function posInt(raw: unknown): number {
  const n = typeof raw === 'number' ? raw : parseInt(String(raw ?? ''), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
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

type Config = { perAccount: number; windowHours: number; perMonth: number };

async function readConfig(centerId: string, skill: Skill): Promise<Config> {
  const none: Config = { perAccount: 0, windowHours: 24, perMonth: 0 };
  const { data } = await sb
    .from('site_settings')
    .select('value')
    .eq('key', `center_config_${centerId}`)
    .maybeSingle();
  if (!data) return none;
  let v: any = (data as { value: unknown }).value;
  if (typeof v === 'string') { try { v = JSON.parse(v); } catch { return none; } }

  // Clamped to 1h..168h (a week). Below an hour the fixed 30-minute grace
  // would swallow most of the window; the SQL clamps identically, so a bad
  // value can only narrow the window, never widen it.
  const rawWin = v?.dailyLimitWindowHours;
  const w = typeof rawWin === 'number' ? rawWin : parseFloat(String(rawWin ?? ''));

  return {
    perAccount:  posInt(v?.[`dailyLimit${CAP(skill)}`]),
    perMonth:    posInt(v?.[`monthlyLimit${CAP(skill)}`]),
    windowHours: Number.isFinite(w) && w > 0 ? Math.min(Math.max(w, 1), 168) : 24
  };
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

  const cfg = await readConfig(centerId, skill);
  // Fast path for every centre as configured today: one query, then out.
  if (cfg.perAccount <= 0 && cfg.perMonth <= 0) {
    return unlimited({ reason: 'no_limit_set' });
  }

  // Identity is resolved only once we know some limit is configured.
  let email = await verifiedEmail(req.headers.get('authorization') || '');
  let identified = 'jwt';
  if (!email) {
    email = String(body.email || '').trim().toLowerCase();
    identified = email ? 'client' : 'none';
  }

  // Admins pass both gates. Their attempts still COUNT toward the centre's
  // monthly quota — they are real usage — but a centre that has run out must
  // not lock its own administrator out of checking it.
  if (email && await isAdmin(email)) {
    return unlimited({ reason: 'admin', identified });
  }

  // ---- gate 1: the centre's monthly quota ----------------------------
  // Checked first: it needs no identity, and when a centre is out of quota
  // the answer is the same for everybody.
  if (cfg.perMonth > 0) {
    const { data, error } = await sb.rpc('mock_center_monthly_usage', {
      p_center: centerId,
      p_skill:  skill
    });
    if (error) {
      console.error('[check-mock-limit] center usage failed:', error.message);
    } else {
      const row  = Array.isArray(data) ? data[0] : data;
      const used = Number(row?.used || 0);
      if (used >= cfg.perMonth) {
        return json(200, {
          allowed: false,
          scope: 'center',
          limit: cfg.perMonth,
          used,
          remaining: 0,
          periodEnd: row?.period_end ? String(row.period_end) : null,
          skill,
          identified
        });
      }
    }
  }

  // ---- gate 2: this account's rolling-window limit -------------------
  if (cfg.perAccount <= 0) return unlimited({ reason: 'center_quota_only', identified });
  if (!email)              return unlimited({ reason: 'no_account', identified });

  const { data, error } = await sb.rpc('mock_daily_usage', {
    p_email:        email,
    p_center:       centerId,
    p_skill:        skill,
    p_window_hours: cfg.windowHours
  });
  if (error) {
    console.error('[check-mock-limit] mock_daily_usage failed:', error.message);
    return unlimited({ reason: 'count_failed', identified });
  }

  const row    = Array.isArray(data) ? data[0] : data;
  const used   = Number(row?.used || 0);
  const oldest = row?.oldest_counted ? String(row.oldest_counted) : '';

  if (used < cfg.perAccount) {
    return json(200, {
      allowed: true,
      limit: cfg.perAccount,
      used,
      remaining: cfg.perAccount - used,
      windowHours: cfg.windowHours,
      identified
    });
  }

  // Over the limit. The count drops again when the earliest attempt inside
  // the window ages out of it, which is the only honest "come back at" we
  // can give the student.
  let nextAvailableAt: string | null = null;
  if (oldest) {
    const t = Date.parse(oldest);
    if (Number.isFinite(t)) {
      nextAvailableAt = new Date(t + cfg.windowHours * 60 * 60 * 1000).toISOString();
    }
  }

  return json(200, {
    allowed: false,
    scope: 'account',
    limit: cfg.perAccount,
    used,
    remaining: 0,
    nextAvailableAt,
    windowHours: cfg.windowHours,
    skill,
    identified
  });
});
