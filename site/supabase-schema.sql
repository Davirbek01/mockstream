-- ============================================================================
-- SUPABASE SCHEMA — Mock Stream Results Dashboard
-- ============================================================================
-- Run this SQL in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- after creating your project.
-- ============================================================================

-- 1. Create the results table
CREATE TABLE IF NOT EXISTS results (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  student_name  TEXT NOT NULL DEFAULT '',
  center        TEXT NOT NULL DEFAULT '',          -- testIdentifier: mock_stream, bek, global, niners, muzaffars
  exam_type     TEXT NOT NULL DEFAULT '',          -- 'cefr' or 'ielts'
  skill         TEXT NOT NULL DEFAULT '',          -- 'reading', 'listening', 'speaking', 'writing', 'full-mock'
  score         TEXT DEFAULT '',                   -- Display score: '55/75', '6.5', 'B2' etc.
  level         TEXT DEFAULT '',                   -- CEFR level: A2, B1, B2, C1, C2
  caption       TEXT DEFAULT '',                   -- Full Telegram caption for reference
  report_path   TEXT DEFAULT '',                   -- Storage path: 'mock_stream/<uuid>.html'
  mock_number   TEXT DEFAULT '',                   -- 'Mock 12', 'Mock 5' etc.
  metadata      JSONB DEFAULT '{}'::jsonb,         -- Extra data (part scores, timing, etc.)
  device_info   JSONB DEFAULT '{}'::jsonb          -- Device type, OS, model, browser
);

-- 2. Indexes for common dashboard queries
CREATE INDEX IF NOT EXISTS idx_results_created_at ON results (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_results_center     ON results (center);
CREATE INDEX IF NOT EXISTS idx_results_exam_type  ON results (exam_type);
CREATE INDEX IF NOT EXISTS idx_results_skill      ON results (skill);
CREATE INDEX IF NOT EXISTS idx_results_student    ON results (student_name);

-- 3. Enable Row Level Security
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Allow anyone with the anon key to INSERT (exam pages send results)
CREATE POLICY "Allow anon insert" ON results
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anyone with the anon key to SELECT (dashboard + public viewer)
CREATE POLICY "Allow anon select" ON results
  FOR SELECT TO anon
  USING (true);

-- 5. Create the Storage bucket for report files
-- Go to Storage → New Bucket → Name: "reports" → Public: ON
-- Or run via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage RLS — allow anon uploads and public reads
CREATE POLICY "Allow anon upload" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'reports');

CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'reports');

-- ============================================================================
-- 7. Premium Emails table — email-based VIP access
-- ============================================================================
CREATE TABLE IF NOT EXISTS premium_emails (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  email       TEXT NOT NULL,
  tier        TEXT NOT NULL DEFAULT 'premium',     -- 'premium' (AI access) or 'regular' (mocks only)
  role        TEXT NOT NULL DEFAULT 'user',         -- 'user' (mocks only) or 'admin' (mocks + dashboard)
  center      TEXT NOT NULL DEFAULT '',             -- testIdentifier for clone filtering, '' = all centers
  active      BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT premium_emails_email_unique UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_premium_emails_email  ON premium_emails (email);
CREATE INDEX IF NOT EXISTS idx_premium_emails_active ON premium_emails (active);

ALTER TABLE premium_emails ENABLE ROW LEVEL SECURITY;

-- Allow anon SELECT (landing page checks email)
CREATE POLICY "Allow anon select premium" ON premium_emails
  FOR SELECT TO anon
  USING (true);

-- Allow anon INSERT (admin dashboard adds emails)
CREATE POLICY "Allow anon insert premium" ON premium_emails
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anon UPDATE (admin toggles active, edits tier)
CREATE POLICY "Allow anon update premium" ON premium_emails
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- Allow anon DELETE (admin removes emails)
CREATE POLICY "Allow anon delete premium" ON premium_emails
  FOR DELETE TO anon
  USING (true);

-- ============================================================================
-- 8. Premium Device Tracking — anti-sharing protection
-- ============================================================================
CREATE TABLE IF NOT EXISTS premium_devices (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  device_id   TEXT NOT NULL,
  device_info JSONB DEFAULT '{}'::jsonb,           -- {type, os, model, browser}
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT premium_devices_email_device UNIQUE (email, device_id)
);

CREATE INDEX IF NOT EXISTS idx_premium_devices_email ON premium_devices (email);

ALTER TABLE premium_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select devices" ON premium_devices
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert devices" ON premium_devices
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update devices" ON premium_devices
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon delete devices" ON premium_devices
  FOR DELETE TO anon USING (true);

-- ============================================================================
-- 9. Support Messages — Help Center chat storage
-- ============================================================================
CREATE TABLE IF NOT EXISTS support_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'user',  -- user, ai, admin
  sender_name     TEXT DEFAULT 'Anonymous',
  content         TEXT NOT NULL,
  category        TEXT DEFAULT 'support',        -- support, premium, partner
  center          TEXT DEFAULT 'mock_stream',
  device_id       TEXT DEFAULT NULL,
  attachment_url  TEXT DEFAULT NULL,
  attachment_type TEXT DEFAULT NULL,              -- image, pdf, voice
  attachment_name TEXT DEFAULT NULL,
  is_read         BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_msgs_conv ON support_messages (conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_support_msgs_center ON support_messages (center, created_at DESC);

ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select messages" ON support_messages
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert messages" ON support_messages
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update messages" ON support_messages
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- ============================================================================
-- 10. Site Settings — key/value config (AI prompt, Gemini key, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select settings" ON site_settings
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert settings" ON site_settings
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update settings" ON site_settings
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- ============================================================================
-- 11. Storage Stats Function — returns file count, total bytes, db size
-- ============================================================================
CREATE OR REPLACE FUNCTION get_storage_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  v_total_bytes BIGINT;
  v_file_count  INT;
  v_db_bytes    BIGINT;
BEGIN
  -- Count files and total size in storage.objects (reports bucket)
  SELECT COALESCE(COUNT(*), 0), COALESCE(SUM((metadata->>'size')::BIGINT), 0)
  INTO v_file_count, v_total_bytes
  FROM storage.objects
  WHERE bucket_id = 'reports';

  -- Get database size
  SELECT pg_database_size(current_database()) INTO v_db_bytes;

  result := json_build_object(
    'file_count', v_file_count,
    'total_bytes', v_total_bytes,
    'db_size_bytes', v_db_bytes
  );
  RETURN result;
END;
$$;

-- ============================================================================
-- 12. Cleanup Function — checks site_settings before deleting
-- ============================================================================
CREATE OR REPLACE FUNCTION cleanup_old_reports()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_enabled TEXT;
  v_days    INT;
  r RECORD;
BEGIN
  -- Check if cleanup is enabled
  SELECT value INTO v_enabled FROM site_settings WHERE key = 'cleanup_enabled';
  IF v_enabled IS NULL OR v_enabled != 'on' THEN
    RAISE NOTICE 'Cleanup is disabled. Skipping.';
    RETURN;
  END IF;

  -- Get retention days
  SELECT COALESCE(value::INT, 30) INTO v_days FROM site_settings WHERE key = 'cleanup_retention_days';
  IF v_days IS NULL THEN v_days := 30; END IF;

  -- Delete old storage files and clear report_path
  FOR r IN
    SELECT id, report_path
    FROM results
    WHERE report_path IS NOT NULL
      AND report_path != ''
      AND created_at < now() - (v_days || ' days')::INTERVAL
  LOOP
    -- Delete from storage.objects
    DELETE FROM storage.objects
    WHERE bucket_id = 'reports'
      AND name = r.report_path;

    -- Clear the report_path
    UPDATE results SET report_path = NULL WHERE id = r.id;
  END LOOP;
END;
$$;

-- ============================================================================
-- 13. Test Session Recovery — auto-save & resume unfinished tests (72h expiry)
-- ============================================================================
CREATE TABLE IF NOT EXISTS test_sessions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_identifier TEXT NOT NULL,          -- candidateName::deviceId
  test_type       TEXT NOT NULL,          -- e.g. 'cefr-listening', 'ielts-reading'
  test_id         TEXT DEFAULT '',        -- specific mock number / test file
  session_data    JSONB NOT NULL DEFAULT '{}',  -- full test state snapshot
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  expires_at      TIMESTAMPTZ DEFAULT (now() + interval '72 hours')
);

-- Unique per user+test combination (used for upsert)
CREATE UNIQUE INDEX IF NOT EXISTS test_sessions_user_test_idx
  ON test_sessions(user_identifier, test_type);

-- RLS — open access via anon key (same pattern as other tables)
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "test_sessions_all" ON test_sessions FOR ALL USING (true) WITH CHECK (true);

-- Cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM test_sessions WHERE expires_at < now();
END;
$$;

-- Schedule daily cleanup at 4:30 AM UTC
SELECT cron.schedule(
  'daily-session-cleanup',
  '30 4 * * *',
  'SELECT cleanup_expired_sessions()'
);
