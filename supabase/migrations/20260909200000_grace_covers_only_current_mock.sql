-- =====================================================================
-- The 30-minute grace now covers ONE mock, not the whole skill
-- ---------------------------------------------------------------------
-- The grace exists so a dropped connection costs nothing: reopen the mock
-- you were on and it is still one attempt. But as written it forgave EVERY
-- attempt younger than 30 minutes, so a student could open Reading 1, 2 and
-- 3 inside twenty minutes and none of them counted — the limit did nothing.
--
-- Measured on `record` in the four hours after switching it on: 24 pairs of
-- attempts landed inside their own window, and 20 of them were inside the
-- 30-minute grace. Worse, that is exactly the shape of the problem the limit
-- was built for — five people sharing one login all testing at the same time
-- are all inside the grace, so all of them pass.
--
-- New rule, per mock rather than per attempt:
--   the single most recently opened mock is free while it is unsubmitted and
--   under 30 minutes old. Everything opened before it counts.
--
--   reopen the same mock 5x after a drop  -> 0   (unchanged, the point of it)
--   open Reading 1, 2, 3 within 20 min    -> 2   (was 0)
--   open one mock and abandon it 40 min   -> 1   (unchanged)
--   submit a mock                         -> 1   (unchanged)
--
-- Counting per mock also means repeated reopens of the same mock collapse to
-- one, which is what made the old per-attempt counting need a grace at all.
-- =====================================================================

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
  WITH win AS (
    SELECT mock_number, opened_at, submitted_at
    FROM public.mock_attempts
    WHERE user_email = lower(trim(p_email))
      AND center     = p_center
      AND skill      = p_skill
      -- Rolling window, not calendar day.
      AND opened_at >= now() - (LEAST(GREATEST(COALESCE(p_window_hours, 24), 1), 168) * INTERVAL '1 hour')
      -- Rows dated in the future exist (devices with wrong clocks); left in,
      -- they would pin a student over their limit for weeks.
      AND opened_at <= now()
  ),
  per_mock AS (
    SELECT mock_number,
           MIN(opened_at)                    AS first_open,
           MAX(opened_at)                    AS last_open,
           bool_or(submitted_at IS NOT NULL) AS submitted
    FROM win
    GROUP BY mock_number
  ),
  ranked AS (
    SELECT per_mock.*,
           row_number() OVER (ORDER BY last_open DESC) AS recency
    FROM per_mock
  )
  SELECT COUNT(*)::INTEGER AS used,
         MIN(first_open)   AS oldest_counted
  FROM ranked
  WHERE submitted                                    -- finished: always counts
     OR last_open < now() - INTERVAL '30 minutes'    -- abandoned long enough
     OR recency > 1                                  -- not the one in progress
$$;

REVOKE ALL ON FUNCTION public.mock_daily_usage(TEXT, TEXT, TEXT, NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mock_daily_usage(TEXT, TEXT, TEXT, NUMERIC) TO service_role;
