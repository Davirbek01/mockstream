-- Telegram login linkage table
--
-- Stores the Telegram numeric user id ↔ Supabase auth user mapping created by
-- the verify-telegram-login Edge Function. Service-role only writes; users
-- can read their own row via RLS so the client can show "Linked to @username".
--
-- Revert: DROP TABLE public.user_telegram_links CASCADE;

CREATE TABLE IF NOT EXISTS public.user_telegram_links (
  telegram_id          BIGINT PRIMARY KEY,
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_username    TEXT,
  telegram_photo_url   TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_telegram_links_user_id_idx
  ON public.user_telegram_links (user_id);

-- RLS: service_role bypasses; only the linked user can SELECT their own row.
-- No INSERT/UPDATE/DELETE policies → writes restricted to service_role only.
ALTER TABLE public.user_telegram_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_telegram_links_self_select ON public.user_telegram_links;
CREATE POLICY user_telegram_links_self_select ON public.user_telegram_links
  FOR SELECT USING (user_id = auth.uid());

-- updated_at auto-touch trigger
CREATE OR REPLACE FUNCTION public._user_telegram_links_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_telegram_links_touch ON public.user_telegram_links;
CREATE TRIGGER user_telegram_links_touch
  BEFORE UPDATE ON public.user_telegram_links
  FOR EACH ROW EXECUTE FUNCTION public._user_telegram_links_touch_updated_at();
