-- =====================================================================
-- Per-centre monthly mock quota
-- ---------------------------------------------------------------------
-- A different thing from the per-account daily limit added earlier, and both
-- apply at once:
--
--   mock_daily_usage()          one student, rolling window  -> stops sharing
--   mock_center_monthly_usage() a whole centre, this month   -> caps volume
--
-- Set per centre, per skill, in the admin Centers panel
-- (monthlyLimitReading / monthlyLimitListening / monthlyLimitWriting /
-- monthlyLimitSpeaking). 0 = unlimited, the default everywhere.
--
-- Calendar month, not a rolling 30 days: a quota a centre is given ("5000
-- speaking this month") has to reset on a date they can point at, and
-- "how many are left this month" has to have an answer.
-- =====================================================================

-- The daily-limit index is on (user_email, center, skill, opened_at) and
-- cannot serve a query with no email, so the centre count needs its own.
CREATE INDEX IF NOT EXISTS mock_attempts_center_month
  ON public.mock_attempts (center, skill, opened_at DESC);

CREATE OR REPLACE FUNCTION public.mock_center_monthly_usage(
  p_center TEXT,
  p_skill  TEXT
)
RETURNS TABLE (used INTEGER, period_start TIMESTAMPTZ, period_end TIMESTAMPTZ)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COUNT(*)::INTEGER                              AS used,
    date_trunc('month', now())                     AS period_start,
    date_trunc('month', now()) + INTERVAL '1 month' AS period_end
  FROM public.mock_attempts
  WHERE center = p_center
    AND skill  = p_skill
    AND opened_at >= date_trunc('month', now())
    -- Rows dated in the future exist (devices with wrong clocks). Without
    -- this a handful of them would eat next month's quota too.
    AND opened_at <= now()
    -- Same rule the per-account limit uses, so the two never disagree about
    -- what an "attempt" is: it counts once submitted, or once it is 30
    -- minutes old and still unsubmitted.
    AND (submitted_at IS NOT NULL OR opened_at < now() - INTERVAL '30 minutes')
$$;

REVOKE ALL ON FUNCTION public.mock_center_monthly_usage(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mock_center_monthly_usage(TEXT, TEXT) TO service_role;
