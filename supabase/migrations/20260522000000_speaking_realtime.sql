-- =====================================================================
-- Speaking Plus realtime (Gemini Live) — schema
-- ---------------------------------------------------------------------
-- Two tables:
--   gemini_live_token_log    — daily token-mint audit + quota source
--   speaking_realtime_sessions — captured audio + transcript + scoring
--                                 for admin review (with manual delete)
--
-- + Storage bucket policy hook (bucket itself is created via dashboard
--   or `supabase storage bucket create speaking-realtime-sessions`).
--
-- Apply:
--   supabase db push       (or apply this file via dashboard SQL editor)
-- =====================================================================

-- ── 1) Daily token-mint log (powers the per-IP/per-centre quota) ─────
CREATE TABLE IF NOT EXISTS public.gemini_live_token_log (
  id         BIGSERIAL    PRIMARY KEY,
  center_id  TEXT         NOT NULL,
  ip         TEXT,
  role       TEXT,
  issued_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS gemini_live_token_log_center_ip_issued
  ON public.gemini_live_token_log (center_id, ip, issued_at DESC);
CREATE INDEX IF NOT EXISTS gemini_live_token_log_issued
  ON public.gemini_live_token_log (issued_at DESC);
-- Anon must NOT read this — service role only.
ALTER TABLE public.gemini_live_token_log ENABLE ROW LEVEL SECURITY;
-- (No policies: only service role bypasses RLS.)


-- ── 2) Per-session capture (audio in storage, transcript inline) ─────
CREATE TABLE IF NOT EXISTS public.speaking_realtime_sessions (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id       TEXT         NOT NULL,
  user_email      TEXT,        -- Google email when signed in; nullable
  user_name       TEXT,        -- name student gave to the AI at session start
  started_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  ended_at        TIMESTAMPTZ,
  duration_sec    INTEGER,
  -- Question selection (which mock IDs the random picker chose)
  p1_1_source     JSONB,       -- { mock_id, questions: [...] }
  p1_2_source     JSONB,       -- { mock_id, questions: [...], image_urls: [...] }
  p2_source       JSONB,       -- { mock_id, cue_card }
  p3_source       JSONB,       -- { mock_id, prompts }
  -- Capture
  audio_url       TEXT,        -- Supabase Storage URL (bucket: speaking-realtime-sessions)
  transcript      JSONB,       -- [{role: 'user'|'model', text: '...', at_sec: 0}]
  -- Grading
  raw_section_scores JSONB,    -- { s1: 4, s2: 3, s3: 4, s4: 5 }
  raw_total        NUMERIC(4,1),
  cert_score       INTEGER,
  cefr_level       TEXT,       -- 'Below B1' | 'B1' | 'B2' | 'C1'
  grader_rationale JSONB,      -- per-section rationale text from the grading call
  -- Admin review
  reviewed_at      TIMESTAMPTZ, -- non-null once admin opens it
  reviewer_notes   TEXT
);
CREATE INDEX IF NOT EXISTS speaking_realtime_sessions_started
  ON public.speaking_realtime_sessions (started_at DESC);
CREATE INDEX IF NOT EXISTS speaking_realtime_sessions_center
  ON public.speaking_realtime_sessions (center_id, started_at DESC);
CREATE INDEX IF NOT EXISTS speaking_realtime_sessions_email
  ON public.speaking_realtime_sessions (user_email);
ALTER TABLE public.speaking_realtime_sessions ENABLE ROW LEVEL SECURITY;
-- No policies — service role + admin-mocks-style admin UI handles access.


-- ── 3) Reminder: create the storage bucket manually ──────────────────
-- Run once in dashboard (or via Supabase CLI):
--   supabase storage bucket create speaking-realtime-sessions --public=false
-- Audio files live at: speaking-realtime-sessions/<session_uuid>.webm
-- (or .ogg / .mp3 depending on what the browser MediaRecorder produces).
