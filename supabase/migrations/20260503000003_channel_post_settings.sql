-- Channel-post settings + editable topics (Phase 2 of news system)
--
-- Moves the hardcoded TOPICS map and the cron schedule into DB so admin
-- can edit them via the settings tab in the news panel.
--
-- Revert: see end of file.

-- ── 1. Singleton settings table ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.channel_post_settings (
  id            INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  channel_id    TEXT NOT NULL DEFAULT '@mock_stream',
  footer_text   TEXT NOT NULL DEFAULT E'\n\n━━━━━━━━━━━━━\n🌐 mock-stream.com\n📺 youtube.com/@Mock-Stream\n💬 @DavirbekKhasanov\n📧 davirbekkhasanov@gmail.com',
  min_words     INT NOT NULL DEFAULT 100 CHECK (min_words >= 20 AND min_words <= 1000),
  max_words     INT NOT NULL DEFAULT 200 CHECK (max_words >= 50 AND max_words <= 2000),
  auto_publish  BOOLEAN NOT NULL DEFAULT false,
  cron_preset   TEXT NOT NULL DEFAULT 'twice_daily'
                CHECK (cron_preset IN ('once_daily','twice_daily','thrice_daily','four_times_daily')),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by    UUID REFERENCES auth.users(id)
);

-- Seed the singleton row (no-op if it already exists)
INSERT INTO public.channel_post_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Sanity: max_words must be > min_words
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'channel_post_settings_word_range_check'
  ) THEN
    ALTER TABLE public.channel_post_settings
      ADD CONSTRAINT channel_post_settings_word_range_check
      CHECK (max_words > min_words);
  END IF;
END $$;

-- ── 2. Topics table (replaces hardcoded TOPICS map) ────────────────
CREATE TABLE IF NOT EXISTS public.channel_topics (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key           TEXT UNIQUE NOT NULL,
  label         TEXT NOT NULL,
  text_prompt   TEXT NOT NULL,
  image_prompt  TEXT NOT NULL,
  enabled       BOOLEAN NOT NULL DEFAULT true,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS channel_topics_enabled_idx
  ON public.channel_topics (enabled, sort_order);

-- Seed with the 5 starter topics (matching the previous hardcoded TOPICS map).
-- Skipped if any topic with the same key already exists.
INSERT INTO public.channel_topics (key, label, text_prompt, image_prompt, sort_order) VALUES
  ('ad_mock_stream', 'Mock Stream promo',
   'Write a friendly, non-pushy Telegram channel post promoting Mock Stream — a free CEFR & IELTS exam prep platform. Highlight ONE specific feature each time (e.g. AI scoring, mock tests, instant feedback, multi-skill coverage). Include 2-3 relevant emojis. End with a clear CTA.',
   'A clean, modern illustration of a student studying English for an exam, with subtle Mock Stream branding feel — teal and orange color palette. Flat design, minimal text on image, 1:1 square format suitable for social media.',
   1),
  ('english_lifehack', 'English study lifehack',
   'Write a Telegram channel post sharing ONE specific, actionable English-learning lifehack (e.g. shadowing technique, spaced repetition for vocab, reading aloud for fluency). Make it concrete with a 30-second example. Use 2-3 emojis. End with a question that invites engagement.',
   'A flat illustration of a study lifehack concept — visual metaphor like a brain with arrows, a notebook with sticky notes, or earbuds with sound waves. Soft pastel colors, friendly, square format.',
   2),
  ('cefr_grammar_micro', 'CEFR grammar micro-lesson',
   'Write a Telegram channel post teaching ONE specific grammar point typically tested in CEFR exams (B1-C1 level). Pick a small precise topic — NOT "tenses in general" but e.g. "third conditional with wish" or "reported speech: backshifting". Structure: 1) the rule in one sentence, 2) 2-3 example sentences, 3) ONE common mistake learners make. 2-3 emojis.',
   'A minimalist chalkboard or notebook page illustration showing a grammar concept abstractly — formula-like layout, neat handwriting feel. Educational, professional, square format.',
   3),
  ('ielts_writing_phrase', 'IELTS writing phrase',
   'Write a Telegram channel post introducing ONE high-impact phrase or collocation used in IELTS Writing Task 2 (band 7+ vocabulary). Structure: 1) the phrase, 2) what it means, 3) one example sentence in context, 4) when NOT to use it (overuse warning). 2-3 emojis. End with an encouragement to try using it in their next practice.',
   'An illustration of a hand writing in an exam booklet with a fountain pen, professional and academic feel. Subtle warm lighting, square format. No specific text on the page.',
   4),
  ('cefr_speaking_tip', 'CEFR speaking exam tip',
   'Write a Telegram channel post giving ONE practical tip for the CEFR Speaking exam (specific to the Uzbekistan CEFR format with 4 parts: Q1-3 short answers, Q4-6 picture description, Q7 monologue, Q8 discussion). Pick ONE: handling nerves, stalling phrases, comparing pictures, structuring a monologue, etc. Make it actionable. 2-3 emojis.',
   'A friendly illustration of a student speaking confidently in an exam setting with an examiner — clear gestures, calm vibe, soft warm colors, square format.',
   5)
ON CONFLICT (key) DO NOTHING;

-- updated_at triggers for both tables
CREATE OR REPLACE FUNCTION public._channel_settings_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS channel_post_settings_touch ON public.channel_post_settings;
CREATE TRIGGER channel_post_settings_touch
  BEFORE UPDATE ON public.channel_post_settings
  FOR EACH ROW EXECUTE FUNCTION public._channel_settings_touch_updated_at();

DROP TRIGGER IF EXISTS channel_topics_touch ON public.channel_topics;
CREATE TRIGGER channel_topics_touch
  BEFORE UPDATE ON public.channel_topics
  FOR EACH ROW EXECUTE FUNCTION public._channel_settings_touch_updated_at();

-- RLS: admin only
ALTER TABLE public.channel_post_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS channel_post_settings_admin_all ON public.channel_post_settings;
CREATE POLICY channel_post_settings_admin_all ON public.channel_post_settings
  FOR ALL USING (_caller_is_admin()) WITH CHECK (_caller_is_admin());

DROP POLICY IF EXISTS channel_topics_admin_all ON public.channel_topics;
CREATE POLICY channel_topics_admin_all ON public.channel_topics
  FOR ALL USING (_caller_is_admin()) WITH CHECK (_caller_is_admin());

-- ── 3. Cron rescheduler (called by the settings update Edge Function) ─
-- A SECURITY DEFINER stored function that the channel-posts-admin Edge
-- Function can rpc() into to apply a new cron preset. It unschedules the
-- existing channel-post-* jobs and re-creates them based on the preset.
CREATE OR REPLACE FUNCTION public.apply_channel_post_cron(preset TEXT)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  schedules TEXT[];
  s         TEXT;
  i         INT := 0;
  cron_cmd  TEXT;
BEGIN
  -- Pick the cron expressions for the requested preset (M-F only).
  -- All times are UTC; Tashkent is UTC+5.
  CASE preset
    WHEN 'once_daily'        THEN schedules := ARRAY['0 4 * * 1-5'];                 -- 09:00 Tashkent
    WHEN 'twice_daily'       THEN schedules := ARRAY['0 4 * * 1-5','0 12 * * 1-5'];  -- 09 + 17 Tashkent
    WHEN 'thrice_daily'      THEN schedules := ARRAY['0 3 * * 1-5','0 8 * * 1-5','0 13 * * 1-5'];  -- 08 + 13 + 18 Tashkent
    WHEN 'four_times_daily'  THEN schedules := ARRAY['0 3 * * 1-5','0 7 * * 1-5','0 11 * * 1-5','0 15 * * 1-5'];  -- 08+12+16+20 Tashkent
    ELSE RAISE EXCEPTION 'unknown_preset: %', preset;
  END CASE;

  -- Unschedule all existing channel-post-* jobs
  FOR i IN 1..10 LOOP
    PERFORM cron.unschedule(jobname)
    FROM cron.job WHERE jobname LIKE 'channel-post-%';
    EXIT WHEN NOT FOUND;
  END LOOP;

  -- Reschedule based on the new preset
  i := 0;
  FOREACH s IN ARRAY schedules LOOP
    i := i + 1;
    cron_cmd := format($cmd$
      SELECT net.http_post(
        url := 'https://zknyukkbtbcqgvkgjktb.supabase.co/functions/v1/generate-channel-post',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := jsonb_build_object('slot', 'cron_%s')
      );
    $cmd$, i);
    PERFORM cron.schedule('channel-post-' || i, s, cron_cmd);
  END LOOP;

  RETURN format('Scheduled %s cron job(s) for preset %s', i, preset);
END;
$$;

-- Apply the current preset (twice_daily) to make sure the cron jobs match
-- the seeded settings row. Idempotent.
SELECT public.apply_channel_post_cron('twice_daily');

-- ── Revert ──────────────────────────────────────────────────────────
-- DROP FUNCTION public.apply_channel_post_cron(TEXT);
-- DROP TABLE public.channel_topics CASCADE;
-- DROP TABLE public.channel_post_settings CASCADE;
-- DROP FUNCTION public._channel_settings_touch_updated_at();
