-- Add user_email column to ai_submission_logs so the proxy can enforce
-- per-student rate limits using the signed-in Google email when available
-- (falls back to IP for guests). Used by gate 5 (maxAttemptsPerStudent).

ALTER TABLE public.ai_submission_logs
  ADD COLUMN IF NOT EXISTS user_email TEXT;

CREATE INDEX IF NOT EXISTS ai_submission_logs_email_center_time
  ON public.ai_submission_logs (user_email, center_id, created_at DESC)
  WHERE user_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS ai_submission_logs_ip_center_time
  ON public.ai_submission_logs (ip, center_id, created_at DESC);
