-- ============================================================================
-- SUPABASE SCHEMA: Dynamic Mock Tests (Test Maker)
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================================

-- 1. Create the table for dynamically added mocks
CREATE TABLE IF NOT EXISTS mock_tests (
  id            BIGSERIAL PRIMARY KEY,
  mock_type     TEXT NOT NULL DEFAULT 'cefr-speaking',   -- 'cefr-speaking', 'cefr-listening', etc.
  mock_number   INTEGER NOT NULL,                         -- e.g. 66, 67, ...
  title         TEXT NOT NULL DEFAULT '',                  -- display name e.g. "Mock 66"
  status        TEXT NOT NULL DEFAULT 'draft',             -- 'draft' | 'published'
  mock_data     JSONB NOT NULL,                            -- full test data object (SPEAKING_TEST_DATA etc.)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_mock_type_number UNIQUE (mock_type, mock_number)
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_mock_tests_type_status ON mock_tests (mock_type, status);
CREATE INDEX IF NOT EXISTS idx_mock_tests_type_number ON mock_tests (mock_type, mock_number);

-- 3. Auto-update updated_at
CREATE OR REPLACE FUNCTION update_mock_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_mock_tests_updated
  BEFORE UPDATE ON mock_tests
  FOR EACH ROW EXECUTE FUNCTION update_mock_updated_at();

-- 4. Row Level Security
ALTER TABLE mock_tests ENABLE ROW LEVEL SECURITY;

-- Public can read published mocks (for test pages to load)
CREATE POLICY "Public read published mocks"
  ON mock_tests FOR SELECT
  USING (status = 'published');

-- Anon can manage all mocks (for Test Maker admin)
-- NOTE: Tighten this to service_role or authenticated in production
CREATE POLICY "Anon manage mocks"
  ON mock_tests FOR ALL
  USING (true)
  WITH CHECK (true);
