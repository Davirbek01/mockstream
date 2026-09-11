-- =====================================================================
-- One room, or a password passed around town?
-- ---------------------------------------------------------------------
-- Device count cannot tell those apart, and they are not the same
-- problem. A teacher signing a class in on the centre's own account is
-- not a student cheating, and a warning written for the second would be
-- wrong — and probably insulting — aimed at the first. The wording of
-- any warning depends entirely on which of the two this is.
--
-- Networks separate them. A classroom is many devices behind ONE router;
-- a shared password is the same account turning up on several.
--
-- Measured 2026-09-11 on the four accounts over the line:
--   cambridgeschool0077          7 devices · 1 network   → a room
--   turonsocialsciencestudents   5 devices · 1 network   → a room
--   octoberprep101               8 devices · 3 networks  → passed around
--   tg_6376179666               11 devices · 3 networks  → passed around
--
-- Half the list was never the problem we thought we were looking at.
--
-- mock_attempts carries no IP, so the addresses come from
-- ai_submission_logs over the same window — most submissions make an AI
-- call, which is plenty to tell one network from three.
--
-- ⚠️ Adding OUT columns needs DROP first; CREATE OR REPLACE refuses to
-- change a function's return type.
-- =====================================================================
DROP FUNCTION IF EXISTS public.shared_account_watch(INTEGER, INTEGER, INTEGER);

CREATE FUNCTION public.shared_account_watch(
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
  ip_count        INTEGER,
  network_count   INTEGER,
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
  -- Addresses live in ai_submission_logs, not mock_attempts. Most
  -- submissions make an AI call, which is enough to tell one network
  -- from three.
  nets AS (
    SELECT lower(trim(user_email)) AS user_email,
           COUNT(DISTINCT ip)::INTEGER AS ip_count,
           COUNT(DISTINCT split_part(ip, '.', 1) || '.' || split_part(ip, '.', 2))::INTEGER AS network_count
    FROM public.ai_submission_logs
    WHERE created_at >= now() - (GREATEST(COALESCE(p_days_back, 2), 1) * INTERVAL '1 day')
      AND COALESCE(ip, '') <> ''
      AND COALESCE(user_email, '') <> ''
    GROUP BY 1
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
           COUNT(DISTINCT v.d)::INTEGER AS overlap_devices
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
    COALESCE((SELECT n.ip_count FROM nets n WHERE n.user_email = lower(trim(agg.user_email))), 0),
    COALESCE((SELECT n.network_count FROM nets n WHERE n.user_email = lower(trim(agg.user_email))), 0),
    agg.first_at,
    agg.last_at,
    (SELECT jsonb_agg(q.d ORDER BY (q.d->>'n')::INTEGER DESC)
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

