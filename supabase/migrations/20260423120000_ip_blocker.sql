-- =====================================================================
-- IP Blocker + Suspicious-IP tracking
-- ---------------------------------------------------------------------
-- Builds on the existing `blocked_ips` and `ai_submission_logs` tables.
--
--   1. Adds `student_name` column to ai_submission_logs so we can see
--      who was sitting at an IP when it was flagged.
--   2. Ensures blocked_ips has metadata (reason / created_at) + enables
--      RLS reads for authenticated admins (via premium_emails.active=true).
--   3. Adds a shadow-mode flag to site_settings so auto-blocking can be
--      turned on/off from the UI (default OFF for the first 48h).
--   4. Trigger: when the same IP logs 5+ non-'ok' statuses within 1h
--      AND shadow mode is disabled → auto-insert into blocked_ips.
--   5. View `v_suspicious_ips` — per-IP aggregation for the admin page,
--      includes last few student names seen on that IP.
--
-- Safe to re-run.
-- =====================================================================

-- 1) Student-name column on logs --------------------------------------
ALTER TABLE public.ai_submission_logs
  ADD COLUMN IF NOT EXISTS student_name TEXT;

CREATE INDEX IF NOT EXISTS ai_submission_logs_status_time
  ON public.ai_submission_logs (status, created_at DESC);


-- 2) Blocked IPs RLS for admin reads/writes --------------------------
-- Policy: a user is "admin" if their JWT email is in premium_emails with
-- role='admin' and active=true. Reads + writes allowed; all other
-- roles get nothing (service_role bypasses RLS automatically).
DROP POLICY IF EXISTS blocked_ips_admin_all ON public.blocked_ips;
CREATE POLICY blocked_ips_admin_all
  ON public.blocked_ips
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.premium_emails pe
      WHERE lower(pe.email) = lower(auth.jwt() ->> 'email')
        AND pe.active = true
        AND pe.role   = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.premium_emails pe
      WHERE lower(pe.email) = lower(auth.jwt() ->> 'email')
        AND pe.active = true
        AND pe.role   = 'admin'
    )
  );

-- Same policy for logs so the admin page can read them.
ALTER TABLE public.ai_submission_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ai_logs_admin_read ON public.ai_submission_logs;
CREATE POLICY ai_logs_admin_read
  ON public.ai_submission_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.premium_emails pe
      WHERE lower(pe.email) = lower(auth.jwt() ->> 'email')
        AND pe.active = true
        AND pe.role   = 'admin'
    )
  );


-- 3) Shadow-mode flag --------------------------------------------------
-- value = { "enforce": true|false }. Default OFF for safety.
INSERT INTO public.site_settings (key, value)
  VALUES ('ip_autoblock_config', '{"enforce": false, "threshold": 5, "window_minutes": 60}'::jsonb)
  ON CONFLICT (key) DO NOTHING;


-- 4) Auto-block trigger ------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_autoblock_ip()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cfg        JSONB;
  v_enforce    BOOLEAN;
  v_threshold  INT;
  v_window_min INT;
  v_bad_count  INT;
  v_already    INT;
BEGIN
  -- Only consider failure rows from verification functions.
  IF NEW.status IS NULL OR NEW.status = 'ok' OR NEW.ip IS NULL OR NEW.ip = '' THEN
    RETURN NEW;
  END IF;

  -- Read config (enforce flag + threshold).
  SELECT value INTO v_cfg FROM public.site_settings WHERE key = 'ip_autoblock_config';
  IF v_cfg IS NULL THEN
    v_enforce    := false;
    v_threshold  := 5;
    v_window_min := 60;
  ELSE
    v_enforce    := COALESCE((v_cfg ->> 'enforce')::boolean, false);
    v_threshold  := COALESCE((v_cfg ->> 'threshold')::int, 5);
    v_window_min := COALESCE((v_cfg ->> 'window_minutes')::int, 60);
  END IF;

  -- Only block when a tamper-grade event fires. Rate-limit alone isn't
  -- enough — we only count server-side integrity violations.
  IF NEW.status NOT IN ('tamper_detected', 'bad_center') THEN
    RETURN NEW;
  END IF;

  -- Already blocked? skip.
  SELECT 1 INTO v_already FROM public.blocked_ips WHERE ip = NEW.ip;
  IF FOUND THEN
    RETURN NEW;
  END IF;

  -- Count recent bad events from this IP.
  SELECT COUNT(*) INTO v_bad_count
    FROM public.ai_submission_logs
   WHERE ip = NEW.ip
     AND status IN ('tamper_detected', 'bad_center')
     AND created_at > now() - make_interval(mins => v_window_min);

  IF v_bad_count >= v_threshold AND v_enforce THEN
    INSERT INTO public.blocked_ips (ip, reason)
      VALUES (NEW.ip, format('auto: %s events in %smin', v_bad_count, v_window_min))
      ON CONFLICT (ip) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_autoblock_ip ON public.ai_submission_logs;
CREATE TRIGGER trg_autoblock_ip
AFTER INSERT ON public.ai_submission_logs
FOR EACH ROW EXECUTE FUNCTION public.fn_autoblock_ip();


-- 5) Suspicious-IPs view ----------------------------------------------
-- Aggregates last 24h of logs per IP with failure counts + recent names.
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
           AND created_at > now() - interval '24 hours'
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
