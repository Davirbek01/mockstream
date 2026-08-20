-- =====================================================================
-- ai-credit-watch: know the moment an AI lane stops accepting work
-- ---------------------------------------------------------------------
-- Applied 2026-08-20. Two parts: the lane column on the call log, and the
-- window the watcher function reads every ten minutes (pg_cron job
-- 'ai-credit-watch-10min').
--
-- Why it exists. When the money runs out nothing breaks visibly — the
-- platform keeps taking submissions and the provider keeps refusing them.
-- DeepSeek answered HTTP 402 to 5,988 calls from 187 students between
-- 16 May and 2 Aug 2026, 1,889 of them in ONE day from 144 students who
-- had already sat the exam. The first person to notice was a student.
--
-- Why the lane. One Groq key serves two services: the scorer
-- (chat/completions, gpt-oss-120b) which grades every mock, and Whisper
-- (audio/transcriptions) which turns every speaking answer into the text
-- the scorer reads. Logged as one provider they hide each other — a dead
-- Whisper leaves chat answering normally while every speaking answer is
-- scored 0 on empty text.
--
-- Why the wording match. Only DeepSeek says 402. Groq — the provider doing
-- the real work here — never does: a drained balance drops the account to
-- free-tier limits and answers 429 with the limit named in the body. In
-- 30 days Groq logged 123,943 calls, 0 of them 402, and 348 of them 429.
-- =====================================================================

alter table public.ai_submission_logs
  add column if not exists endpoint text;

comment on column public.ai_submission_logs.endpoint is
  'Call lane: chat (scoring) | transcribe (Whisper) | vision | other path. Null for rows logged before 2026-08-20.';

create index if not exists ai_submission_logs_provider_lane_idx
  on public.ai_submission_logs (provider, endpoint, created_at desc);

drop function if exists public.ai_provider_health_window(integer);

create or replace function public.ai_provider_health_window(p_minutes integer default 15)
returns table (
  provider      text,
  lane          text,
  calls         bigint,
  errors        bigint,
  client_errors bigint,
  code_402      bigint,
  code_401      bigint,
  code_429      bigint,
  quota_words   bigint,
  students      bigint,
  sample_err    text
)
language sql
security definer
set search_path to 'public'
as $function$
  with base as (
    select l.provider,
           coalesce(l.endpoint, 'all')                         as lane,
           l.status,
           l.error_message,
           l.student_name,
           l.created_at,
           l.status <> 'ok'                                    as failed,
           -- The student's device sent an unusable file and Whisper rightly
           -- refused it; the provider is fine. 158 of these in a week — as
           -- provider failures they are permanent noise a real outage would
           -- have to climb over.
           (l.error_message ilike '%file is empty%'
             or l.error_message ilike '%too short%'
             or l.error_message ilike '%valid media file%')     as client_fault
    from ai_submission_logs l
    where l.created_at >= now() - make_interval(mins => p_minutes)
      and l.provider <> 'authorize-finish'
      and l.status not in ('plus_disabled', 'blocked_ip', 'blocked_email', 'bad_center')
  )
  select b.provider,
         b.lane,
         count(*)                                                          as calls,
         count(*) filter (where b.failed and not b.client_fault)           as errors,
         count(*) filter (where b.failed and b.client_fault)               as client_errors,
         count(*) filter (where b.error_message like '%402%')              as code_402,
         count(*) filter (where b.error_message like '%401%')              as code_401,
         count(*) filter (where b.error_message like '%429%')              as code_429,
         -- money, however the provider phrases it
         count(*) filter (
           where b.failed and (
                b.error_message ilike '%insufficient%'
             or b.error_message ilike '%balance%'
             or b.error_message ilike '%credit%'
             or b.error_message ilike '%billing%'
             or b.error_message ilike '%spending limit%'
             or b.error_message ilike '%tokens per day%'
             or b.error_message ilike '%requests per day%'
             or b.error_message ilike '%(TPD)%'
             or b.error_message ilike '%(RPD)%'
             or b.error_message ilike '%quota%'
             or b.error_message ilike '%payment%'))                        as quota_words,
         count(distinct b.student_name)
           filter (where b.failed and not b.client_fault)                  as students,
         (array_agg(b.error_message order by b.created_at desc)
            filter (where b.failed and not b.client_fault))[1]             as sample_err
  from base b
  group by b.provider, b.lane
  having count(*) filter (where b.failed and not b.client_fault) > 0;
$function$;

revoke all on function public.ai_provider_health_window(integer) from public, anon, authenticated;
grant execute on function public.ai_provider_health_window(integer) to service_role;

-- Schedule (applied by hand, recorded here):
--   select cron.schedule('ai-credit-watch-10min', '*/10 * * * *', $job$
--     select net.http_post(
--       url := (select decrypted_secret from vault.decrypted_secrets where name='project_url')
--              || '/functions/v1/ai-credit-watch',
--       headers := jsonb_build_object(
--         'Content-Type','application/json',
--         'Authorization','Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name='service_role_key')),
--       body := '{}'::jsonb, timeout_milliseconds := 60000);
--   $job$);
