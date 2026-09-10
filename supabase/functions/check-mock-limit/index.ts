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
//        dailyLimitSpeaking / dailyLimitFullMock
//        + dailyLimitWindowHours — the centre's default interval (24,
//          clamped 1..168; 5 means "one, then the next five hours later")
//        + dailyLimitWindowReading / ...Listening / ...Writing / ...Speaking /
//          ...FullMock — optional per-skill override of that interval, for
//          centres that want e.g. speaking every 5h but reading every 2h.
//          0 or absent falls back to the centre default.
//
//   2. Per CENTRE, per skill, per calendar month — caps a centre's total
//      volume, e.g. 5000 speaking a month.
//        monthlyLimitReading / monthlyLimitListening / monthlyLimitWriting /
//        monthlyLimitSpeaking / monthlyLimitFullMock
//
//   3. iOS ONLY, and only for accounts that get no AI: one mock per rolling
//      window across ALL FOUR SKILLS combined — sit writing and speaking is
//      closed too. Set by iosDailyLimit (+ iosDailyWindowHours, default 24).
//      iOS opens every mock to everyone, because a passcode in front of
//      content is what App Store guideline 3.1.1 forbids; this is the fair-use
//      rule that replaces the lock, NOT a paywall. Anyone who gets AI —
//      personal premium, or a centre running in premium mode — is exempt, and
//      the refusal deliberately never mentions premium. It lives in a config
//      field precisely so it can be switched off in seconds, with no new
//      build, if review ever objects.
//
// A full mock counts as its own skill ("full_mock"), not as four. Without it
// a per-skill limit was trivially bypassed: full mock contains all four.
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

const SKILLS = ['reading', 'listening', 'writing', 'speaking', 'full_mock'] as const;
const IOS_WINDOW_DEFAULT = 24;
type Skill = typeof SKILLS[number];

// Config-key suffix per skill. Spelled out rather than derived from the skill
// name, because full_mock would capitalise to "Full_mock".
const FIELD: Record<Skill, string> = {
  reading:   'Reading',
  listening: 'Listening',
  writing:   'Writing',
  speaking:  'Speaking',
  // A full mock carries all four skills but has its own allowance, matching
  // how skillAccess already treats full_mock as a fifth entry. Charging it
  // against the four separate limits would lock a student out of every skill
  // for taking one exam.
  full_mock: 'FullMock'
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

type Config = {
  perAccount: number;
  windowHours: number;
  perMonth: number;
  /** iOS-only cross-skill cap; 0 = off. */
  iosDaily: number;
  iosWindowHours: number;
  /** True when the centre hands AI to everyone — those students are exempt. */
  centreGivesAi: boolean;
};

async function readConfig(centerId: string, skill: Skill): Promise<Config> {
  const none: Config = {
    perAccount: 0, windowHours: 24, perMonth: 0,
    iosDaily: 0, iosWindowHours: IOS_WINDOW_DEFAULT, centreGivesAi: false,
  };
  const { data } = await sb
    .from('site_settings')
    .select('value')
    .eq('key', `center_config_${centerId}`)
    .maybeSingle();
  if (!data) return none;
  let v: any = (data as { value: unknown }).value;
  if (typeof v === 'string') { try { v = JSON.parse(v); } catch { return none; } }

  // Interval: the per-skill override if one is set, else the centre default,
  // else 24h. Clamped to 1h..168h (a week) — below an hour the fixed
  // 30-minute grace would swallow most of the window. The SQL clamps
  // identically, so a bad value can only narrow the window, never widen it.
  const num = (raw: unknown): number => {
    const n = typeof raw === 'number' ? raw : parseFloat(String(raw ?? ''));
    return Number.isFinite(n) && n > 0 ? n : 0;
  };
  const w = num(v?.[`dailyLimitWindow${FIELD[skill]}`]) || num(v?.dailyLimitWindowHours) || 24;

  const iw = num(v?.iosDailyWindowHours) || IOS_WINDOW_DEFAULT;

  // A centre can hand AI to everyone, globally or for this one skill. Those
  // students are not "non-premium" in any sense that matters here.
  const skillAccess = (v?.skillAccess ?? {}) as Record<string, unknown>;
  const centreGivesAi = v?.globalAccess === 'premium'
                     || String(skillAccess[skill] ?? '') === 'premium';

  return {
    perAccount:  posInt(v?.[`dailyLimit${FIELD[skill]}`]),
    perMonth:    posInt(v?.[`monthlyLimit${FIELD[skill]}`]),
    windowHours: Math.min(Math.max(w, 1), 168),
    iosDaily:    posInt(v?.iosDailyLimit),
    iosWindowHours: Math.min(Math.max(iw, 1), 168),
    centreGivesAi,
  };
}

/** Does this account get AI in its own right? Those are exempt from the iOS rule. */
async function hasPremiumAccount(email: string): Promise<boolean> {
  if (!email) return false;
  const { data } = await sb
    .from('premium_emails')
    .select('tier, role')
    .eq('email', email)
    .neq('active', false)
    .limit(1);
  const row = Array.isArray(data) ? data[0] : null;
  if (!row) return false;
  return row.tier === 'premium' || row.role === 'admin';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST')    return json(405, { error: 'method_not_allowed' });

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* treated as empty below */ }

  const centerId = String(body.center || '').trim();
  const skillRaw = String(body.skill  || '').trim().toLowerCase();
  const platform = String(body.platform || '').trim().toLowerCase();

  if (!centerId || !SKILLS.includes(skillRaw as Skill)) {
    // Cambridge / SAT papers and anything unrecognised are not limited.
    // (Those runners record their own skill strings, e.g. fce_reading_writing.)
    return unlimited({ reason: 'not_limited' });
  }
  const skill = skillRaw as Skill;

  const cfg = await readConfig(centerId, skill);
  const iosRule = platform === 'ios' && cfg.iosDaily > 0 && !cfg.centreGivesAi;
  // Fast path for every centre as configured today: one query, then out.
  if (cfg.perAccount <= 0 && cfg.perMonth <= 0 && !iosRule) {
    return unlimited({ reason: 'no_limit_set' });
  }

  // Identity is resolved only once we know some limit is configured.
  let email = await verifiedEmail(req.headers.get('authorization') || '');
  let identified = 'jwt';
  if (!email) {
    email = String(body.email || '').trim().toLowerCase();
    identified = email ? 'client' : 'none';
  }

  // Admins pass both gates: a centre that has run out must not lock its own
  // administrator out of checking why. Note their attempts are not counted
  // either — premium-gate.js recordOpen() returns early for admins, so no
  // mock_attempts row is ever written for them.
  if (email && await isAdmin(email)) {
    return unlimited({ reason: 'admin', identified });
  }

  // ---- gate 0: the iOS fair-use rule -------------------------------
  // Checked before the others because it is the widest: it spans every skill,
  // so a student refused here is refused whatever they pick next.
  //
  // Being exempt from THIS rule is not being exempt from the others. A premium
  // account on iOS skips the fair-use cap but still owes the centre's
  // per-student and monthly limits, exactly as it would on Android or the web
  // — the allowance belongs to the student, not to the screen they opened.
  // Returning early here let an iOS premium account past every gate.
  if (iosRule && email && !(await hasPremiumAccount(email))) {
    const { data, error } = await sb.rpc('mock_daily_usage_any_skill', {
      p_email:        email,
      p_center:       centerId,
      p_window_hours: cfg.iosWindowHours,
    });
    if (error) {
      console.error('[check-mock-limit] ios usage failed:', error.message);
    } else {
      const row  = Array.isArray(data) ? data[0] : data;
      const used = Number(row?.used || 0);
      if (used >= cfg.iosDaily) {
        let nextAvailableAt: string | null = null;
        const oldest = row?.oldest_counted ? String(row.oldest_counted) : '';
        if (oldest) {
          const t = Date.parse(oldest);
          if (Number.isFinite(t)) {
            nextAvailableAt = new Date(t + cfg.iosWindowHours * 60 * 60 * 1000).toISOString();
          }
        }
        return json(200, {
          allowed: false,
          scope: 'ios_daily',
          limit: cfg.iosDaily,
          used,
          remaining: 0,
          nextAvailableAt,
          windowHours: cfg.iosWindowHours,
          skill,
          identified,
        });
      }
    }
  }
  // The iOS rule may be the only one configured — then there is nothing left
  // to check and the student passes.
  if (cfg.perAccount <= 0 && cfg.perMonth <= 0) {
    return unlimited({ reason: 'ios_rule_only', identified });
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
