-- =====================================================================
-- support-bot per-user state
-- ---------------------------------------------------------------------
-- Tracks which mode (support|dictionary) each Telegram user is currently
-- in. Edge Function isolates are ephemeral, so this MUST be in DB.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.support_bot_user_modes (
  tg_user_id  bigint      NOT NULL PRIMARY KEY,
  mode        text        NOT NULL DEFAULT 'support',
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_bot_user_modes ENABLE ROW LEVEL SECURITY;
-- Service-role only; no anon policy.
