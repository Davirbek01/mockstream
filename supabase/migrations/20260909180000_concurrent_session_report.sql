-- =====================================================================
-- Concurrent-session detection — DETECT ONLY
-- ---------------------------------------------------------------------
-- Finds accounts where a second mock was started, on a DIFFERENT device,
-- while an earlier one was still unfinished. Nothing is blocked and nothing
-- is shown to any student: this feeds one line in the 08:00 health report so
-- the real rate can be measured before deciding whether to warn at all.
-- Same staged approach the device registry used in Aug 2026.
--
-- Why device_id matters so much here: measured over 30 days, a naive
-- "two attempts open at once" rule fires 77,881 times, and 41,732 of those
-- (54%) are ONE person reopening the SAME mock — a reload, a back button, a
-- dropped connection. Requiring a different device_id AND a different mock
-- removes that entire class, along with two tabs on one machine and the
-- normal "opened reading, then listening" session.
--
-- What it cannot remove: one student legitimately using a phone and a laptop
-- at the same time. That is the reason this must not block anyone.
-- =====================================================================

CREATE INDEX IF NOT EXISTS mock_attempts_concurrency
  ON public.mock_attempts (user_email, center, opened_at)
  WHERE user_email IS NOT NULL AND device_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.concurrent_session_report(p_days_back INTEGER DEFAULT 1)
RETURNS TABLE (
  user_email TEXT,
  center     TEXT,
  events     INTEGER,
  devices    INTEGER,
  first_at   TIMESTAMPTZ,
  last_at    TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH win AS (
    SELECT user_email, center, skill, mock_number, device_id, opened_at, submitted_at
    FROM public.mock_attempts
    WHERE opened_at >= now() - (GREATEST(COALESCE(p_days_back, 1), 1) * INTERVAL '1 day')
      -- Rows dated in the future exist (devices with wrong clocks) and would
      -- otherwise appear "concurrent" with everything.
      AND opened_at <= now()
      AND user_email IS NOT NULL
      AND device_id  IS NOT NULL
  ),
  ov AS (
    SELECT a.user_email, a.center, a.opened_at AS at_a, b.opened_at AS at_b
    FROM win a
    JOIN win b
      ON  b.user_email = a.user_email
      AND b.center     = a.center
      -- Different machine. Without this the signal is mostly page reloads.
      AND b.device_id <> a.device_id
      -- Not the same mock reopened — that is one person recovering, not two.
      AND NOT (b.skill = a.skill AND b.mock_number = a.mock_number)
      AND b.opened_at > a.opened_at
      AND b.opened_at < a.opened_at + INTERVAL '30 minutes'
      -- ...and the first one had not finished when the second began.
      AND (a.submitted_at IS NULL OR a.submitted_at > b.opened_at)
  ),
  agg AS (
    SELECT user_email, center,
           COUNT(*)::INTEGER AS events,
           MIN(at_a) AS first_at,
           MAX(at_b) AS last_at
    FROM ov
    GROUP BY user_email, center
  )
  SELECT agg.user_email,
         agg.center,
         agg.events,
         (SELECT COUNT(DISTINCT w.device_id)::INTEGER
            FROM win w
           WHERE w.user_email = agg.user_email
             AND w.center     = agg.center) AS devices,
         agg.first_at,
         agg.last_at
  FROM agg
  ORDER BY agg.events DESC
$$;

REVOKE ALL ON FUNCTION public.concurrent_session_report(INTEGER) FROM PUBLIC;
-- Report only. anon must never be able to ask who is sharing an account.
GRANT EXECUTE ON FUNCTION public.concurrent_session_report(INTEGER) TO service_role;
