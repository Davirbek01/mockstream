-- =====================================================================
-- Migration: add user_email to public.results so we can:
--   (1) only count Google-signed-in users in the Registered Users panel
--   (2) backfill historical guest results when a student later signs in
--       (matched by student_name + center, then claimed under their email)
--   (3) faster "results owned by this email" lookups
-- =====================================================================

ALTER TABLE public.results
  ADD COLUMN IF NOT EXISTS user_email TEXT;

CREATE INDEX IF NOT EXISTS results_email_time
  ON public.results (user_email, created_at DESC)
  WHERE user_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS results_name_center
  ON public.results (student_name, center);
