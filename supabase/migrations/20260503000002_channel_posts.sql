-- AI-generated channel posts with admin moderation queue
-- Cron picks a topic twice daily, generates text+image via Gemini, writes
-- pending row. Admin reviews on the dashboard, approves → publishes to
-- t.me/mock_stream via @mockstream_news_bot.
--
-- Revert: see end of file for rollback SQL.

CREATE TABLE IF NOT EXISTS public.channel_posts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic               TEXT NOT NULL,
  text_content        TEXT NOT NULL,
  image_url           TEXT,
  image_prompt        TEXT,                       -- the prompt used (debugging)
  status              TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','approved','rejected','published','failed')),
  scheduled_for       TIMESTAMPTZ,                -- the cron slot it was meant for
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at         TIMESTAMPTZ,
  approved_by         UUID REFERENCES auth.users(id),
  rejected_at         TIMESTAMPTZ,
  published_at        TIMESTAMPTZ,
  telegram_message_id BIGINT,                     -- returned by sendPhoto
  error_message       TEXT
);

CREATE INDEX IF NOT EXISTS channel_posts_status_idx
  ON public.channel_posts (status, created_at DESC);
CREATE INDEX IF NOT EXISTS channel_posts_topic_idx
  ON public.channel_posts (topic, created_at DESC);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public._channel_posts_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS channel_posts_touch ON public.channel_posts;
CREATE TRIGGER channel_posts_touch
  BEFORE UPDATE ON public.channel_posts
  FOR EACH ROW EXECUTE FUNCTION public._channel_posts_touch_updated_at();

-- RLS: admin only — all CRUD gated through _caller_is_admin()
ALTER TABLE public.channel_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS channel_posts_admin_select ON public.channel_posts;
CREATE POLICY channel_posts_admin_select ON public.channel_posts
  FOR SELECT USING (_caller_is_admin());

DROP POLICY IF EXISTS channel_posts_admin_insert ON public.channel_posts;
CREATE POLICY channel_posts_admin_insert ON public.channel_posts
  FOR INSERT WITH CHECK (_caller_is_admin());

DROP POLICY IF EXISTS channel_posts_admin_update ON public.channel_posts;
CREATE POLICY channel_posts_admin_update ON public.channel_posts
  FOR UPDATE USING (_caller_is_admin()) WITH CHECK (_caller_is_admin());

DROP POLICY IF EXISTS channel_posts_admin_delete ON public.channel_posts;
CREATE POLICY channel_posts_admin_delete ON public.channel_posts
  FOR DELETE USING (_caller_is_admin());

-- Storage bucket for AI-generated images (public read so Telegram can fetch
-- via URL when posting). Service-role writes from the Edge Function.
INSERT INTO storage.buckets (id, name, public)
  VALUES ('channel-post-images', 'channel-post-images', true)
  ON CONFLICT (id) DO NOTHING;

-- Allow public to read images (so Telegram can fetch the URL)
DROP POLICY IF EXISTS "channel_post_images_public_read" ON storage.objects;
CREATE POLICY "channel_post_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'channel-post-images');

-- Service-role bypasses RLS, so no INSERT/UPDATE/DELETE policy is needed
-- (Edge Functions write images via the service-role client).

-- ─── pg_cron schedules ──────────────────────────────────────────────
-- Twice-daily, M-F: 04:00 UTC (= 09:00 Tashkent) + 12:00 UTC (= 17:00 Tashkent).
-- The cron uses pg_net to fire the generate-channel-post Edge Function.
-- The function URL is unauthenticated by design — worst case, an attacker
-- who guesses the URL can trigger a generation (cost ~$0.05 each, written
-- to pending queue for admin review). If abuse becomes a problem we add a
-- shared-secret header check later.
--
-- Idempotent on re-run: unschedule any pre-existing job with the same name.

SELECT cron.unschedule('channel-post-morning')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'channel-post-morning');
SELECT cron.unschedule('channel-post-evening')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'channel-post-evening');

SELECT cron.schedule(
  'channel-post-morning',
  '0 4 * * 1-5',
  $$
    SELECT net.http_post(
      url := 'https://zknyukkbtbcqgvkgjktb.supabase.co/functions/v1/generate-channel-post',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := '{"slot": "morning"}'::jsonb
    );
  $$
);

SELECT cron.schedule(
  'channel-post-evening',
  '0 12 * * 1-5',
  $$
    SELECT net.http_post(
      url := 'https://zknyukkbtbcqgvkgjktb.supabase.co/functions/v1/generate-channel-post',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := '{"slot": "evening"}'::jsonb
    );
  $$
);

-- ─── Revert ──────────────────────────────────────────────────────────
-- SELECT cron.unschedule('channel-post-morning');
-- SELECT cron.unschedule('channel-post-evening');
-- DROP POLICY "channel_post_images_public_read" ON storage.objects;
-- DELETE FROM storage.buckets WHERE id = 'channel-post-images';
-- DROP TABLE public.channel_posts CASCADE;
-- DROP FUNCTION public._channel_posts_touch_updated_at();
