-- ============================================================================
-- SUPABASE SCHEMA: Community Messages
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================================

-- 1. Create the community_messages table
CREATE TABLE IF NOT EXISTS community_messages (
  id            BIGSERIAL PRIMARY KEY,
  content       TEXT NOT NULL DEFAULT '',
  sender_name   TEXT NOT NULL DEFAULT 'Anonymous',
  device_id     TEXT NOT NULL DEFAULT '',
  center        TEXT NOT NULL DEFAULT 'mock_stream',
  role          TEXT NOT NULL DEFAULT 'user',              -- 'user' | 'admin'
  parent_id     BIGINT REFERENCES community_messages(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_community_center ON community_messages (center, created_at);
CREATE INDEX IF NOT EXISTS idx_community_parent ON community_messages (parent_id);

-- 3. Row Level Security
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can read community messages
CREATE POLICY "Public read community messages"
  ON community_messages FOR SELECT
  USING (true);

-- Anyone can insert community messages
CREATE POLICY "Public insert community messages"
  ON community_messages FOR INSERT
  WITH CHECK (true);

-- Anyone can delete (admin dashboard uses anon key)
CREATE POLICY "Public delete community messages"
  ON community_messages FOR DELETE
  USING (true);
