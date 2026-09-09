-- =====================================================================
-- Configurable limit window
-- ---------------------------------------------------------------------
-- The per-account mock limit was fixed at 24 hours. Centres want to set
-- their own interval — "one speaking per account, next one 5 hours later" —
-- so the window becomes a parameter, read per centre from
-- center_config_<id>.dailyLimitWindowHours (default 24).
--
-- DROP + CREATE rather than CREATE OR REPLACE: adding a defaulted parameter
-- would register a second, overloaded function, and a 3-argument call would
-- then be ambiguous between the two and fail outright.
-- =====================================================================

DROP FUNCTION IF EXISTS public.mock_daily_usage(TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.mock_daily_usage(
  p_email        TEXT,
  p_center       TEXT,
  p_skill        TEXT,
  p_window_hours NUMERIC
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
    -- should not get a fresh allowance ten minutes later. Clamped here as
    -- well as in the caller so a bad config value cannot produce a window
    -- of zero (every attempt instantly forgiven) or of years.
    AND opened_at >= now() - (LEAST(GREATEST(COALESCE(p_window_hours, 24), 1), 168) * INTERVAL '1 hour')
    -- Rows dated in the future exist (a device with a wrong clock wrote
    -- them; mock_attempts has rows a month ahead). Left in, they would
    -- pin a student over their limit for weeks.
    AND opened_at <= now()
    -- The 30-minute grace is NOT part of the configurable window. It exists
    -- so a dropped connection or an accidental close costs nothing, which is
    -- true whatever interval the centre picks.
    AND (submitted_at IS NOT NULL OR opened_at < now() - INTERVAL '30 minutes')
$$;

REVOKE ALL ON FUNCTION public.mock_daily_usage(TEXT, TEXT, TEXT, NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mock_daily_usage(TEXT, TEXT, TEXT, NUMERIC) TO service_role;
