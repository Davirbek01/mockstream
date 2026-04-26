-- ============================================================================
-- Center-facing Telegram bots (one per center, served by a single dispatcher)
--
-- Each center can have its own student-facing Telegram bot showing 3 buttons:
--   👨‍🏫 Admin     — for the center admin (passcode-gated)
--   🎯 Take Mock   — opens the center's site as a Telegram Mini App
--   💬 Support    — relays student messages to the manager bot's inbox
--
-- The Edge Function `telegram-center-bot` reads its config from this table.
-- The actual bot token is NOT stored in the DB; it lives in a Supabase secret
-- whose name is recorded in `bot_token_env`.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.center_bots (
  center_id          text PRIMARY KEY
    REFERENCES public.centers(id) ON UPDATE CASCADE ON DELETE CASCADE,
  bot_username       text,
  bot_token_env      text NOT NULL,                 -- e.g. 'MOCK_STREAM_CENTER_BOT_TOKEN'
  webapp_url         text NOT NULL,                 -- e.g. 'https://mock-stream.com/landing.html?tg=1'
  show_admin_btn     boolean NOT NULL DEFAULT true,
  show_mock_btn      boolean NOT NULL DEFAULT true,
  show_support_btn   boolean NOT NULL DEFAULT true,
  active             boolean NOT NULL DEFAULT true,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.center_bots ENABLE ROW LEVEL SECURITY;
-- Service role only.

-- ─── Per-Telegram-user admin unlock state for each center bot ─────────────
CREATE TABLE IF NOT EXISTS public.center_bot_admin_sessions (
  center_id       text NOT NULL
    REFERENCES public.centers(id) ON UPDATE CASCADE ON DELETE CASCADE,
  tg_user_id      bigint NOT NULL,
  unlocked_at     timestamptz NOT NULL DEFAULT now(),
  expires_at      timestamptz NOT NULL DEFAULT (now() + interval '12 hours'),
  PRIMARY KEY (center_id, tg_user_id)
);

ALTER TABLE public.center_bot_admin_sessions ENABLE ROW LEVEL SECURITY;

-- ─── Per-Telegram-user "I'm in support mode" state ────────────────────────
CREATE TABLE IF NOT EXISTS public.center_bot_support_sessions (
  center_id    text NOT NULL
    REFERENCES public.centers(id) ON UPDATE CASCADE ON DELETE CASCADE,
  tg_user_id   bigint NOT NULL,
  opened_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (center_id, tg_user_id)
);

ALTER TABLE public.center_bot_support_sessions ENABLE ROW LEVEL SECURITY;

-- ─── Inbox of support messages, read & answered by the manager bot ────────
CREATE TABLE IF NOT EXISTS public.bot_support_messages (
  id                 bigserial PRIMARY KEY,
  center_id          text NOT NULL
    REFERENCES public.centers(id) ON UPDATE CASCADE ON DELETE CASCADE,
  source             text NOT NULL DEFAULT 'support'      -- 'support' | 'admin' (admin DMs that need attention)
    CHECK (source IN ('support', 'admin')),
  from_tg_user_id    bigint NOT NULL,
  from_username      text,
  from_display_name  text,
  body               text NOT NULL,
  status             text NOT NULL DEFAULT 'open'         -- 'open' | 'replied' | 'closed'
    CHECK (status IN ('open', 'replied', 'closed')),
  reply_body         text,
  replied_by         text,
  replied_at         timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bot_support_messages_open
  ON public.bot_support_messages (center_id, status, created_at DESC);

ALTER TABLE public.bot_support_messages ENABLE ROW LEVEL SECURITY;

-- ─── Make sure the Mock Stream center exists, then register the bot ───────
INSERT INTO public.centers (id, display_name)
  VALUES ('mock_stream', 'Mock Stream')
  ON CONFLICT (id) DO NOTHING;

INSERT INTO public.center_bots
  (center_id, bot_token_env, webapp_url, bot_username)
VALUES
  ('mock_stream',
   'MOCK_STREAM_CENTER_BOT_TOKEN',
   'https://mock-stream.com/landing.html?tg=1',
   NULL)
ON CONFLICT (center_id) DO UPDATE SET
  bot_token_env = EXCLUDED.bot_token_env,
  webapp_url    = EXCLUDED.webapp_url,
  updated_at    = now();

-- ─── Set the Admin button passcode for the Mock Stream center ─────────────
INSERT INTO public.admin_passcodes (center, passcode, updated_by)
VALUES ('mock_stream', '070421', 'migration:20260427')
ON CONFLICT (center) DO UPDATE SET
  passcode   = EXCLUDED.passcode,
  updated_at = now(),
  updated_by = EXCLUDED.updated_by;
