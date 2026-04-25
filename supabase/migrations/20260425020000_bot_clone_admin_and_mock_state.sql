-- ============================================================================
-- Telegram bot session: per-clone admin support + mock-code conversation state
-- Adds:
--   role           — 'super' | 'clone' (after auth)
--   current_skill  — used for mock-codes drill-down
-- ============================================================================

ALTER TABLE public.bot_chat_sessions
  ADD COLUMN IF NOT EXISTS role          text,
  ADD COLUMN IF NOT EXISTS current_skill text;
