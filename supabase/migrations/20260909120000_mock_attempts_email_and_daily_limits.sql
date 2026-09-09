-- =====================================================================
-- Per-account, per-skill daily mock limits
-- ---------------------------------------------------------------------
-- mock_attempts has identified students by candidate_name since it was
-- created, which is useless as a limit key: two students who type the same
-- name are one person, and one student who types their name differently is
-- two. Sign-in is mandatory now, so every attempt can carry the account
-- email instead.
--
-- Counting rule (chosen deliberately — see mock_daily_usage below):
--   an attempt counts once it is SUBMITTED, or once it is more than
--   30 minutes old and still unsubmitted.
-- Opening a mock therefore costs nothing for half an hour, which is what
-- makes a dropped connection or an accidental close survivable, while an
-- abandoned mock still cannot be used to farm unlimited opens.
-- =====================================================================

ALTER TABLE public.mock_attempts
  ADD COLUMN IF NOT EXISTS user_email TEXT;

-- Left NULL for every existing row on purpose. Old attempts cannot be
-- mapped back to accounts, and back-filling them from candidate_name would
-- block students on the first day for mocks they took months ago.
-- A NULL row counts toward nobody's limit.

CREATE INDEX IF NOT EXISTS mock_attempts_daily_limit
  ON public.mock_attempts (user_email, center, skill, opened_at DESC)
  WHERE user_email IS NOT NULL;

-- ---------------------------------------------------------------------
-- The counting rule, defined ONCE.
-- Both the pre-open gate (check-mock-limit) and the report gate
-- (authorize-finish) call this, so the two can never drift apart and start
-- disagreeing about whether a student is over their limit.
--
-- Returns:
--   used            how many attempts count inside the rolling 24h window
--   oldest_counted  when the earliest of those was opened; + 24h is the
--                   moment the count drops again, i.e. the reset time we
--                   show the student
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.mock_daily_usage(
  p_email  TEXT,
  p_center TEXT,
  p_skill  TEXT
)
RETURNS TABLE (used INTEGER, oldest_counted TIMESTAMPTZ)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER AS used,
         MIN(opened_at)    AS oldest_counted
  FROM public.mock_attempts
  WHERE user_email = lower(trim(p_email))
    AND center     = p_center
    AND skill      = p_skill
    -- Rolling window, not calendar day: a student who finishes at 23:50
    -- should not get a fresh allowance ten minutes later.
    AND opened_at >= now() - INTERVAL '24 hours'
    -- Rows dated in the future exist (a device with a wrong clock wrote
    -- them; mock_attempts has rows a month ahead). Left in, they would
    -- pin a student over their limit for weeks.
    AND opened_at <= now()
    AND (submitted_at IS NOT NULL OR opened_at < now() - INTERVAL '30 minutes')
$$;

REVOKE ALL ON FUNCTION public.mock_daily_usage(TEXT, TEXT, TEXT) FROM PUBLIC;
-- Edge Functions only. anon must not be able to probe how much of their
-- allowance is left, or to call it with somebody else's address.
GRANT EXECUTE ON FUNCTION public.mock_daily_usage(TEXT, TEXT, TEXT) TO service_role;
