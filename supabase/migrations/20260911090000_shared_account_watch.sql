-- =====================================================================
-- Shared-account watch — the strict version
-- ---------------------------------------------------------------------
-- concurrent_session_report() reports every account with even ONE
-- overlap, which on 2026-09-11 was 14 accounts — and TEN of them had
-- only 2-3 devices. Two or three devices is a phone and a laptop, or
-- somebody who cleared their cookies once. Reporting those every day is
-- how a person learns to tap the button without reading, and the first
-- real cost of that is a paying student locked out.
--
-- So this asks for a shape one person cannot produce:
--
--   • several devices that actually OVERLAPPED — not merely seen
--   • sustained across more than one day
--   • and peak_concurrent: the most devices with a mock open at the
--     same instant. That is the number that settles it. One person is
--     1, occasionally 2 when a tab is left behind. Six is a class.
--
-- Evidence travels with the row: per device, how many attempts and over
-- what span. "8 devices" says nothing; "6 devices, 5-8 attempts each,
-- both days" is a decision.
--
-- Reports only. Nothing here blocks, warns or touches a student.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.shared_account_watch(
  p_days_back      INTEGER DEFAULT 2,
  p_min_devices    INTEGER DEFAULT 4,
  p_min_concurrent INTEGER DEFAULT 3
)
RETURNS TABLE (
  user_email      TEXT,
  center          TEXT,
  overlap_events  INTEGER,
  overlap_devices INTEGER,
  total_devices   INTEGER,
  active_days     INTEGER,
  peak_concurrent INTEGER,
  first_at        TIMESTAMPTZ,
  last_at         TIMESTAMPTZ,
  devices         JSONB
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH win AS (
    SELECT user_email, center, skill, mock_number, device_id, opened_at,
           -- An unsubmitted attempt is treated as open for 30 minutes: past
           -- that it is abandoned, not concurrent.
           LEAST(COALESCE(submitted_at, opened_at + INTERVAL '30 minutes'),
                 opened_at + INTERVAL '30 minutes') AS closed_at
    FROM public.mock_attempts
    WHERE opened_at >= now() - (GREATEST(COALESCE(p_days_back, 2), 1) * INTERVAL '1 day')
      AND opened_at <= now()
      AND user_email IS NOT NULL
      AND device_id  IS NOT NULL
  ),
  -- Two DIFFERENT devices working on DIFFERENT mocks at the same time.
  ov AS (
    SELECT a.user_email, a.center, a.device_id AS dev_a, b.device_id AS dev_b,
           a.opened_at AS at_a, b.opened_at AS at_b
    FROM win a
    JOIN win b
      ON  b.user_email = a.user_email
      AND b.center     = a.center
      AND b.device_id <> a.device_id
      AND NOT (b.skill = a.skill AND b.mock_number = a.mock_number)
      AND b.opened_at > a.opened_at
      AND b.opened_at < a.closed_at
  ),
  -- How many devices had something open at each attempt's start.
  conc AS (
    SELECT w.user_email, w.center,
           (SELECT COUNT(DISTINCT x.device_id)
              FROM win x
             WHERE x.user_email = w.user_email
               AND x.center     = w.center
               AND x.opened_at <= w.opened_at
               AND x.closed_at  > w.opened_at) AS at_once
    FROM win w
  ),
  agg AS (
    SELECT ov.user_email, ov.center,
           COUNT(*)::INTEGER AS overlap_events,
           MIN(ov.at_a) AS first_at,
           MAX(ov.at_b) AS last_at,
           COUNT(DISTINCT d)::INTEGER AS overlap_devices
    FROM ov, LATERAL (VALUES (ov.dev_a), (ov.dev_b)) AS v(d)
    GROUP BY ov.user_email, ov.center
  )
  SELECT
    agg.user_email,
    agg.center,
    agg.overlap_events,
    agg.overlap_devices,
    (SELECT COUNT(DISTINCT w.device_id)::INTEGER FROM win w
      WHERE w.user_email = agg.user_email AND w.center = agg.center),
    (SELECT COUNT(DISTINCT date_trunc('day', w.opened_at AT TIME ZONE 'Asia/Tashkent'))::INTEGER
       FROM win w
      WHERE w.user_email = agg.user_email AND w.center = agg.center),
    (SELECT COALESCE(MAX(c.at_once), 0)::INTEGER FROM conc c
      WHERE c.user_email = agg.user_email AND c.center = agg.center),
    agg.first_at,
    agg.last_at,
    (SELECT jsonb_agg(d ORDER BY (d->>'n')::INTEGER DESC)
       FROM (
         SELECT jsonb_build_object(
                  'device', right(w.device_id, 6),
                  'n',      COUNT(*),
                  'from',   to_char(MIN(w.opened_at) AT TIME ZONE 'Asia/Tashkent', 'DD Mon HH24:MI'),
                  'to',     to_char(MAX(w.opened_at) AT TIME ZONE 'Asia/Tashkent', 'DD Mon HH24:MI')
                ) AS d
         FROM win w
         WHERE w.user_email = agg.user_email AND w.center = agg.center
         GROUP BY w.device_id
       ) q)
  FROM agg
  WHERE agg.overlap_devices >= GREATEST(COALESCE(p_min_devices, 4), 2)
    AND (SELECT COALESCE(MAX(c.at_once), 0) FROM conc c
          WHERE c.user_email = agg.user_email AND c.center = agg.center)
        >= GREATEST(COALESCE(p_min_concurrent, 3), 2)
  ORDER BY agg.overlap_events DESC
$$;

REVOKE ALL ON FUNCTION public.shared_account_watch(INTEGER, INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.shared_account_watch(INTEGER, INTEGER, INTEGER) TO service_role;

-- Which accounts have already been reported, so a week of watching does not
-- become the same names every evening.
CREATE TABLE IF NOT EXISTS public.shared_account_reports (
  user_email   TEXT NOT NULL,
  center       TEXT NOT NULL,
  first_seen   TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen    TIMESTAMPTZ NOT NULL DEFAULT now(),
  times_seen   INTEGER NOT NULL DEFAULT 1,
  peak_concurrent INTEGER,
  PRIMARY KEY (user_email, center)
);

ALTER TABLE public.shared_account_reports ENABLE ROW LEVEL SECURITY;
-- service_role bypasses RLS; no policy means nobody else can read it, which
-- is right for a table of names under suspicion.
