-- ============================================================================
-- Daily AI spend, worked out from our own logs.
-- ----------------------------------------------------------------------------
-- Applied 2026-08-20.
--
-- Groq publishes no billing API. The console shows a balance and nothing else,
-- so "what did yesterday cost" cannot be asked of the provider — it has to be
-- derived. Every reply already carries its own usage block and the proxy
-- already buffers that reply, so storing two numbers per call turns our own log
-- into the bill.
--
-- Prices deliberately do NOT live here. They sit in
-- site_settings.ai_price_table, so a change on a provider's pricing page is a
-- one-line edit rather than a migration, and yesterday can be re-costed after
-- the fact. `_confirmed: false` in that JSON makes the digest print a warning
-- until the figures have been checked against each provider's own console — a
-- wrong rate here produces a total that is confidently wrong, which is worse
-- than no total at all.
--
-- Whisper is billed per hour of AUDIO, not per token. A transcription reply
-- carries no duration unless verbose_json was requested, so the bytes uploaded
-- are kept as the fallback measure; the digest converts them at the configured
-- bitrate and marks the result ~.
-- ============================================================================

alter table public.ai_submission_logs
  add column if not exists tokens_in  integer,
  add column if not exists tokens_out integer,
  add column if not exists audio_sec  numeric;

comment on column public.ai_submission_logs.tokens_in  is 'Prompt tokens the provider charged for. Null before 2026-08-20 or when the reply carried no usage block.';
comment on column public.ai_submission_logs.tokens_out is 'Completion tokens the provider charged for.';
comment on column public.ai_submission_logs.audio_sec  is 'Seconds of audio sent to a transcription model — how Whisper is billed.';

create or replace function public.ai_spend_window(p_days_back int default 1)
returns table (
  provider   text,
  lane       text,
  calls      bigint,
  ok_calls   bigint,
  tokens_in  bigint,
  tokens_out bigint,
  audio_sec  numeric,
  bytes_in   bigint,
  no_usage   bigint
)
language sql
security definer
set search_path to 'public'
as $function$
  with b as (
    select (date_trunc('day', (now() at time zone 'Asia/Tashkent')) - make_interval(days => p_days_back))
             at time zone 'Asia/Tashkent' as d0,
           (date_trunc('day', (now() at time zone 'Asia/Tashkent')) - make_interval(days => p_days_back - 1))
             at time zone 'Asia/Tashkent' as d1
  )
  select l.provider,
         coalesce(l.endpoint, 'all')                                   as lane,
         count(*)                                                      as calls,
         count(*) filter (where l.status = 'ok')                       as ok_calls,
         coalesce(sum(l.tokens_in), 0)                                 as tokens_in,
         coalesce(sum(l.tokens_out), 0)                                as tokens_out,
         coalesce(sum(l.audio_sec), 0)                                 as audio_sec,
         coalesce(sum(l.bytes_in), 0)                                  as bytes_in,
         -- Calls that answered but said nothing about their cost: a streamed
         -- reply, or a provider that omits usage. Printed beside the total so
         -- an under-count is visible as one rather than read as a cheap day.
         count(*) filter (where l.status = 'ok' and l.tokens_in is null
                            and l.audio_sec is null and l.bytes_in is null) as no_usage
  from ai_submission_logs l, b
  where l.created_at >= b.d0 and l.created_at < b.d1
    and l.provider <> 'authorize-finish'
  group by l.provider, coalesce(l.endpoint, 'all')
  having count(*) > 0;
$function$;

revoke all on function public.ai_spend_window(int) from public, anon, authenticated;
grant execute on function public.ai_spend_window(int) to service_role;

comment on function public.ai_spend_window(int) is
  'Quantities consumed per provider/lane for one Asia/Tashkent day. Priced by the daily-health-check function using site_settings.ai_price_table.';

-- Seeded alongside (values are the starting point, NOT verified):
--   insert into site_settings (key, value) values ('ai_price_table', '{ ... }');
