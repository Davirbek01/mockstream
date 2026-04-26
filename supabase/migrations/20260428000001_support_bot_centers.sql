-- Per-user "which center am I asking codes for" state for @MS23_support1_bot.
-- Set on /start <center_id> (deep-link) or via /center command.
CREATE TABLE IF NOT EXISTS public.support_bot_user_centers (
  tg_user_id  bigint NOT NULL PRIMARY KEY,
  center_id   text   NOT NULL REFERENCES public.centers(id) ON UPDATE CASCADE ON DELETE CASCADE,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_bot_user_centers ENABLE ROW LEVEL SECURITY;
