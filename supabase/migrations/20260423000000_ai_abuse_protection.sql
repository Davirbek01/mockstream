-- =====================================================================
-- AI Abuse Protection — tables, RLS, and helper view
-- v2: centers are NOT duplicated. The source of truth is your existing
--     `site_settings` table, populated by the Center Hub admin UI.
--     The Edge Function validates requests against rows whose key is
--     `center_config_{testId}` and whose `active` flag is not false.
--
-- Run in: Supabase Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Blocked IPs — hard block list (manual ban).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blocked_ips (
  ip         TEXT PRIMARY KEY,
  reason     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;
-- No client access at all. Only service_role (Edge Function) reads/writes.


-- ---------------------------------------------------------------------
-- 2) AI submission logs — one row per AI call (rate-limit + forensics).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_submission_logs (
  id            BIGSERIAL PRIMARY KEY,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip            TEXT,
  user_agent    TEXT,
  center_id     TEXT,
  provider      TEXT,                 -- 'gemini' | 'openai' | 'claude' | ...
  skill         TEXT,                 -- 'writing' | 'speaking' | 'chat' | ...
  status        TEXT NOT NULL,        -- 'ok' | 'blocked_ip' | 'bad_center' | 'rate_limited' | 'provider_error'
  bytes_in      INTEGER,
  bytes_out     INTEGER,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS ai_submission_logs_ip_time
  ON public.ai_submission_logs (ip, created_at DESC);
CREATE INDEX IF NOT EXISTS ai_submission_logs_center_time
  ON public.ai_submission_logs (center_id, created_at DESC);

ALTER TABLE public.ai_submission_logs ENABLE ROW LEVEL SECURITY;
-- No client access. Only service_role reads/writes.


-- ---------------------------------------------------------------------
-- 3) (Removed) No separate per-center limits table — the Edge Function
--    reads the Center Hub's `dailyMockLimit` directly from
--    site_settings (key = 'center_config_{testId}', value JSON).
--    To change a center's AI daily cap: edit it in the Center Hub UI.
--      - 0 or empty  => falls back to env AI_DAILY_CAP_DEFAULT
--      - any N > 0   => hard daily cap of N successful calls
-- ---------------------------------------------------------------------


-- ---------------------------------------------------------------------
-- 4) Convenience view: who is hitting the proxy right now.
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_ai_abuse_watch AS
SELECT
  ip,
  center_id,
  COUNT(*)                                           AS calls_last_hour,
  COUNT(*) FILTER (WHERE status <> 'ok')             AS failures_last_hour,
  MAX(created_at)                                    AS last_call
FROM public.ai_submission_logs
WHERE created_at > now() - interval '1 hour'
GROUP BY ip, center_id
ORDER BY calls_last_hour DESC;


-- ---------------------------------------------------------------------
-- 5) Legacy cleanup: if you ran v1 earlier that created
--    `allowed_centers`, you can safely drop it — we no longer use it.
--    (Uncomment only if that table exists in your DB.)
-- ---------------------------------------------------------------------
-- DROP TABLE IF EXISTS public.allowed_centers;
