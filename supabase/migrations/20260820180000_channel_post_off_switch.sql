-- ============================================================================
-- Let the channel-post mechanism be switched off and stay off.
-- ----------------------------------------------------------------------------
-- Applied 2026-08-20.
--
-- apply_channel_post_cron('off') already unschedules the cron jobs, but the
-- settings row could not record that state — the check constraint allowed only
-- the four frequency presets. So "off" lived nowhere durable, and any caller
-- reaching generate-channel-post still produced a Gemini-written post.
--
-- Which is what happened. The caller was not a schedule at all: the 08:00
-- health report sweeps every Edge Function by POSTing an empty body, to find
-- the ones that have lost their code — and an empty body is exactly what the
-- cron used to send, so the sweep commissioned ten posts between 19 and 20 Aug,
-- eight of which reached the public channel. The sweep now sends OPTIONS, and
-- generate-channel-post refuses outright when this column reads 'off'. Two
-- defences, because one that depends on every caller behaving is not a defence.
-- ============================================================================

alter table public.channel_post_settings
  drop constraint if exists channel_post_settings_cron_preset_check;

alter table public.channel_post_settings
  add constraint channel_post_settings_cron_preset_check
  check (cron_preset in ('off', 'once_daily', 'twice_daily', 'thrice_daily', 'four_times_daily'));

comment on column public.channel_post_settings.cron_preset is
  'off = the whole channel-post mechanism is disabled (generate-channel-post refuses, no cron scheduled). Otherwise the posting frequency. paused_from_preset remembers what to restore.';

-- Applied alongside (state, not schema):
--   update channel_post_settings
--      set paused_from_preset = coalesce(paused_from_preset, cron_preset),
--          cron_preset = 'off', auto_publish = false
--    where id = 1;                       -- paused_from_preset now holds 'twice_daily'
--   select apply_channel_post_cron('off');
