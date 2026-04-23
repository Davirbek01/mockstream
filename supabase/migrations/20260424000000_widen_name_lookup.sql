-- Widen student-name lookup window in v_suspicious_ips from 24h to 7 days.
-- Rationale: suspicious rows often have no name in the current 24h window
-- because bad_center / tamper events fire before the student types a name.
-- But the same IP may have submitted a named mock in the past week. Surface
-- that historical name to help identify repeat abusers.

CREATE OR REPLACE VIEW public.v_suspicious_ips AS
WITH recent AS (
  SELECT *
    FROM public.ai_submission_logs
   WHERE created_at > now() - interval '24 hours'
     AND ip IS NOT NULL AND ip <> ''
)
SELECT
  ip,
  COUNT(*)                                                     AS total_calls,
  COUNT(*) FILTER (WHERE status <> 'ok')                       AS failures,
  COUNT(*) FILTER (WHERE status = 'tamper_detected')           AS tamper_events,
  COUNT(*) FILTER (WHERE status = 'bad_center')                AS bad_center_events,
  COUNT(*) FILTER (WHERE status = 'rate_limited')              AS rate_limit_events,
  COUNT(DISTINCT center_id) FILTER (WHERE center_id IS NOT NULL AND center_id <> '') AS distinct_centers,
  ARRAY(
    SELECT DISTINCT sn
      FROM (
        SELECT student_name AS sn
          FROM public.ai_submission_logs
         WHERE ip = r.ip
           AND student_name IS NOT NULL AND student_name <> ''
           AND created_at > now() - interval '7 days'
         ORDER BY created_at DESC
         LIMIT 20
      ) s
  ) AS student_names,
  (SELECT string_agg(DISTINCT center_id, ', ')
     FROM public.ai_submission_logs
    WHERE ip = r.ip
      AND center_id IS NOT NULL AND center_id <> ''
      AND created_at > now() - interval '24 hours'
  ) AS centers,
  MAX(created_at) AS last_seen,
  (SELECT ip IS NOT NULL FROM public.blocked_ips WHERE blocked_ips.ip = r.ip) AS is_blocked
FROM recent r
GROUP BY ip
ORDER BY failures DESC, total_calls DESC;

GRANT SELECT ON public.v_suspicious_ips TO authenticated;
