-- ============================================================================
-- Telegram bot: per-chat session state
-- Used by the `telegram-bot-webhook` Edge Function to remember:
--   • whether this chat has authed with the super-admin passcode
--   • which center the user is currently inspecting
--   • current step in the conversation flow
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.bot_chat_sessions (
  chat_id        bigint PRIMARY KEY,
  username       text,
  authed         boolean NOT NULL DEFAULT false,
  authed_at      timestamptz,
  current_center text,
  -- 'await_passcode' | 'menu' | 'await_type' | 'await_action'
  state          text NOT NULL DEFAULT 'await_passcode',
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bot_chat_sessions_authed
  ON public.bot_chat_sessions (authed, updated_at DESC);

-- RLS: lock down. Only the Edge Function (service role) ever touches this.
ALTER TABLE public.bot_chat_sessions ENABLE ROW LEVEL SECURITY;
-- (No policies = no anon/authenticated access. Service role bypasses RLS.)
