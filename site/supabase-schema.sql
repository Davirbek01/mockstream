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

-- Allow anon UPDATE (profile name change merges results)
CREATE POLICY "Allow anon update results" ON results
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

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

CREATE POLICY "Allow anon delete settings" ON site_settings
  FOR DELETE TO anon USING (true);

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
  v_reports_bytes BIGINT;
  v_reports_count INT;
  v_attachments_bytes BIGINT;
  v_attachments_count INT;
BEGIN
  -- Count files and total size in ALL storage buckets
  SELECT COALESCE(COUNT(*), 0), COALESCE(SUM((metadata->>'size')::BIGINT), 0)
  INTO v_reports_count, v_reports_bytes
  FROM storage.objects
  WHERE bucket_id = 'reports' AND metadata IS NOT NULL;

  SELECT COALESCE(COUNT(*), 0), COALESCE(SUM((metadata->>'size')::BIGINT), 0)
  INTO v_attachments_count, v_attachments_bytes
  FROM storage.objects
  WHERE bucket_id = 'chat-attachments' AND metadata IS NOT NULL;

  v_file_count := v_reports_count + v_attachments_count;
  v_total_bytes := v_reports_bytes + v_attachments_bytes;

  -- Get database size
  SELECT pg_database_size(current_database()) INTO v_db_bytes;

  result := json_build_object(
    'file_count', v_file_count,
    'total_bytes', v_total_bytes,
    'db_size_bytes', v_db_bytes,
    'reports_bytes', v_reports_bytes,
    'reports_count', v_reports_count,
    'attachments_bytes', v_attachments_bytes,
    'attachments_count', v_attachments_count
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

-- ============================================================================
-- 14. Candidates — student profile data (synced from sidebar profile popup)
-- ============================================================================
CREATE TABLE IF NOT EXISTS candidates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  student_name  TEXT NOT NULL DEFAULT '',
  email         TEXT DEFAULT '',
  phone         TEXT DEFAULT '',
  address       TEXT DEFAULT '',
  avatar_url    TEXT DEFAULT '',
  center        TEXT NOT NULL DEFAULT 'mock_stream',
  device_id     TEXT DEFAULT '',
  blocked       BOOLEAN DEFAULT false
);

-- One row per name+center combo (upsert on save)
CREATE UNIQUE INDEX IF NOT EXISTS idx_candidates_name_center
  ON candidates (student_name, center);

CREATE INDEX IF NOT EXISTS idx_candidates_center ON candidates (center);

ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "candidates_select" ON candidates
  FOR SELECT TO anon USING (true);

CREATE POLICY "candidates_insert" ON candidates
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "candidates_update" ON candidates
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- Device registry phase 1 (detect-only) — applied 2026-08-09.
-- Spec: docs/superpowers/specs/2026-08-09-device-limit-enforcement-design.md
-- Fed by: premium_devices mirror trigger (web) + register_device_session RPC
-- (apps). ONE-WAY premium_devices → device_sessions; never the reverse.
-- Scope: identities with an active premium_emails row ONLY.
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION _norm_center(c text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN c IS NULL OR btrim(c) = '' OR lower(c) IN ('mock_stream','mockstream')
      THEN 'mockstream'
    ELSE lower(btrim(c))
  END
$$;

CREATE OR REPLACE FUNCTION _req_ip() RETURNS inet
LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN split_part(
    current_setting('request.headers', true)::json->>'x-forwarded-for',
    ',', 1)::inet;
EXCEPTION WHEN OTHERS THEN RETURN NULL;
END $$;

CREATE TABLE IF NOT EXISTS device_sessions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email        text NOT NULL,
  center_id    text NOT NULL,             -- ALWAYS _norm_center()'d
  device_key   text NOT NULL,
  platform     text NOT NULL CHECK (platform IN ('web','android','ios','windows','mac')),
  device_label text,
  hardware_fp  text,
  first_seen   timestamptz NOT NULL DEFAULT now(),
  last_seen    timestamptz NOT NULL DEFAULT now(),
  last_ip      inet,
  last_geo     text,
  blocked_at   timestamptz,               -- honoured only from phase 3
  blocked_by   text,
  source       text NOT NULL DEFAULT 'native' CHECK (source IN ('native','mirrored')),
  CONSTRAINT device_sessions_uniq UNIQUE (email, center_id, device_key)
);
CREATE INDEX IF NOT EXISTS idx_device_sessions_email  ON device_sessions (email);
CREATE INDEX IF NOT EXISTS idx_device_sessions_center ON device_sessions (center_id);

CREATE TABLE IF NOT EXISTS device_session_events (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email      text NOT NULL,
  center_id  text NOT NULL,
  device_key text NOT NULL,
  ip         inet,
  country    text,
  at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dse_email_at ON device_session_events (email, at);

ALTER TABLE device_sessions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_session_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY dev_sessions_admin_read ON device_sessions
  FOR SELECT USING (is_any_admin());
CREATE POLICY dev_events_admin_read ON device_session_events
  FOR SELECT USING (is_any_admin());

-- Registers the calling device for EVERY active premium centre of the given
-- identity (centres derived server-side; the client cannot claim one).
-- Returns rows touched; 0 = not premium (the scope guard).
CREATE OR REPLACE FUNCTION register_device_session(
  p_email text, p_telegram text, p_device_key text,
  p_platform text, p_label text DEFAULT NULL, p_hardware_fp text DEFAULT NULL
) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_center text; v_n integer := 0;
  v_ip inet := _req_ip();
  v_geo text;
BEGIN
  IF p_device_key IS NULL OR btrim(p_device_key) = '' THEN RETURN 0; END IF;
  IF p_platform NOT IN ('web','android','ios','windows','mac') THEN RETURN 0; END IF;
  BEGIN
    v_geo := current_setting('request.headers', true)::json->>'cf-ipcountry';
  EXCEPTION WHEN OTHERS THEN v_geo := NULL; END;

  FOR v_center IN
    SELECT DISTINCT _norm_center(center) FROM premium_emails
    WHERE active = true
      AND tier = 'premium'
      AND (expires_at IS NULL OR expires_at > now())
      AND (   (p_email    IS NOT NULL AND btrim(p_email) <> ''
               AND (lower(email) = lower(p_email)
                    OR lower(telegram_username) = lower(p_email)))
           OR (p_telegram IS NOT NULL AND btrim(p_telegram) <> ''
               AND lower(telegram_username) = lower(p_telegram)))
  LOOP
    INSERT INTO device_sessions
      (email, center_id, device_key, platform, device_label, hardware_fp,
       last_ip, last_geo, source)
    VALUES
      (lower(coalesce(nullif(btrim(p_email),''), p_telegram)), v_center,
       p_device_key, p_platform, p_label, p_hardware_fp, v_ip, v_geo, 'native')
    ON CONFLICT (email, center_id, device_key) DO UPDATE SET
      last_seen = now(), last_ip = coalesce(EXCLUDED.last_ip, device_sessions.last_ip),
      last_geo = coalesce(EXCLUDED.last_geo, device_sessions.last_geo),
      device_label = coalesce(EXCLUDED.device_label, device_sessions.device_label),
      hardware_fp = coalesce(EXCLUDED.hardware_fp, device_sessions.hardware_fp);

    INSERT INTO device_session_events (email, center_id, device_key, ip, country)
    VALUES (lower(coalesce(nullif(btrim(p_email),''), p_telegram)), v_center,
            p_device_key, v_ip, v_geo);
    v_n := v_n + 1;
  END LOOP;
  RETURN v_n;
END $$;

GRANT EXECUTE ON FUNCTION register_device_session(text,text,text,text,text,text)
  TO anon, authenticated;

-- ONE-WAY mirror premium_devices -> device_sessions (never the reverse:
-- app devices in premium_devices would trip the legacy >5 web rule).
-- Backfilled 2026-08-09: 169 device rows across 23 premium accounts.
CREATE OR REPLACE FUNCTION _mirror_premium_device() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_center text; v_ip inet; v_geo text;
BEGIN
  v_ip := _req_ip();
  BEGIN
    v_geo := current_setting('request.headers', true)::json->>'cf-ipcountry';
  EXCEPTION WHEN OTHERS THEN v_geo := NULL; END;
  FOR v_center IN
    SELECT DISTINCT _norm_center(center) FROM premium_emails
    WHERE active = true AND tier = 'premium'
      AND (expires_at IS NULL OR expires_at > now())
      AND (lower(email) = lower(NEW.email)
           OR lower(telegram_username) = lower(NEW.email))
  LOOP
    INSERT INTO device_sessions
      (email, center_id, device_key, platform, device_label, hardware_fp,
       last_ip, last_geo, source, first_seen, last_seen)
    VALUES
      (lower(NEW.email), v_center, NEW.device_id, 'web',
       nullif(concat_ws(' · ', NEW.device_info->>'model', NEW.device_info->>'os'), ''),
       NEW.hardware_fp, v_ip, v_geo, 'mirrored', NEW.created_at, NEW.last_seen)
    ON CONFLICT (email, center_id, device_key) DO UPDATE SET
      last_seen   = greatest(device_sessions.last_seen, EXCLUDED.last_seen),
      last_ip     = coalesce(EXCLUDED.last_ip, device_sessions.last_ip),
      last_geo    = coalesce(EXCLUDED.last_geo, device_sessions.last_geo),
      hardware_fp = coalesce(EXCLUDED.hardware_fp, device_sessions.hardware_fp);
    IF TG_OP = 'INSERT'
       OR OLD.last_seen IS NULL
       OR NEW.last_seen > OLD.last_seen + interval '10 minutes' THEN
      INSERT INTO device_session_events (email, center_id, device_key, ip, country)
      VALUES (lower(NEW.email), v_center, NEW.device_id, v_ip, v_geo);
    END IF;
  END LOOP;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_mirror_premium_device ON premium_devices;
CREATE TRIGGER trg_mirror_premium_device
  AFTER INSERT OR UPDATE ON premium_devices
  FOR EACH ROW EXECUTE FUNCTION _mirror_premium_device();

-- Phase 2: policy + the two admin RPCs behind the Devices panel.
-- device_policy: email IS NULL = per-centre settings row (auto_block_enabled,
-- default_limit); email set = per-account override. Writes only via
-- device_admin_action() (SECURITY DEFINER, is_any_admin() + centre scope).
-- device_admin_overview() returns the panel's full payload; centre-scoped
-- admins see only their centre (current_admin_center()), supers see all.
-- Full definitions in migration 'device_registry_admin' (2026-08-09).

-- Telegram-identity fix (2026-08-09, migration device_registry_tg_identity):
-- web Telegram sign-ins carry a SYNTHETIC email tg_<id>@... whose bigint id
-- matches premium_emails.telegram_id -- previously matched nothing, hiding
-- 104 of 171 active premium rows from the registry. One matcher
-- (_prem_matches) now feeds the RPC, the mirror trigger and the backfill;
-- registry identity = email, else @username, else tg:<id> (unifies one
-- person across sign-in methods). Full defs in the migration.

-- device_admin_overview() v2 (migration device_overview_full_roster):
-- starts from the ACTIVE PREMIUM ROSTER (premium_emails, canonical identity
-- email -> @username -> tg:<id>) and LEFT JOINs observed devices, so the
-- Devices panel lists every premium account -- 'seen': false where no device
-- has been observed yet. Read-only; premium panel and tables untouched.
