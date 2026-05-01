-- =====================================================================
-- Migration: mock_attempts table — universal tracker for mock attempts
-- Backs the per-user "Taken N×" badge and the regular-tier one-shot lock.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.mock_attempts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_name TEXT NOT NULL,
  center         TEXT NOT NULL,
  exam_type      TEXT NOT NULL,
  skill          TEXT NOT NULL,
  mock_number    INT  NOT NULL,
  tier_at_open   TEXT NOT NULL,                -- 'regular' | 'premium' | 'unknown'
  opened_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at   TIMESTAMPTZ,
  device_id      TEXT,
  source         TEXT NOT NULL DEFAULT 'live'  -- 'live' | 'backfill'
);

CREATE INDEX IF NOT EXISTS mock_attempts_lookup
  ON public.mock_attempts (candidate_name, center, exam_type, skill, mock_number);

CREATE INDEX IF NOT EXISTS mock_attempts_global_count
  ON public.mock_attempts (skill, exam_type, mock_number);

ALTER TABLE public.mock_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon insert mock_attempts"
  ON public.mock_attempts FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon select mock_attempts"
  ON public.mock_attempts FOR SELECT TO anon
  USING (true);

CREATE POLICY "anon update mock_attempts submitted_at"
  ON public.mock_attempts FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);
