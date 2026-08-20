-- ============================================================================
-- daily_health_snapshot(): add the stale-app-build section.
-- ----------------------------------------------------------------------------
-- Applied 2026-08-20. Same function as 20260819090000, with `stale_app` added.
--
-- Since 5 Aug every client grades picture tasks from the pre-written text
-- stored with the mock, so a vision call is a signature of a client that has
-- not taken an update. In the fortnight to 20 Aug there were 46 of them, 14
-- asking for a model Groq withdrew — those students' picture tasks were graded
-- with no description of the image at all.
--
-- The volume is small and shrinking on its own, so this watches rather than
-- fixes: a line in the 08:00 digest, so that one centre freezing on an old
-- build shows up the next morning instead of never.
-- ============================================================================

create or replace function public.daily_health_snapshot(p_days_back int default 1)
returns jsonb
language sql
security definer
set search_path = public
as $$
with b as (
  select (date_trunc('day', (now() at time zone 'Asia/Tashkent')) - make_interval(days => p_days_back))
           at time zone 'Asia/Tashkent' as d0,
         (date_trunc('day', (now() at time zone 'Asia/Tashkent')) - make_interval(days => p_days_back - 1))
           at time zone 'Asia/Tashkent' as d1,
         (date_trunc('day', (now() at time zone 'Asia/Tashkent')) - make_interval(days => p_days_back + 6))
           at time zone 'Asia/Tashkent' as w0
),
day_res as (select r.* from results r, b where r.created_at >= b.d0 and r.created_at < b.d1),
by_centre as (
  select center, skill, count(*) n from day_res where center is not null group by center, skill
),
prev_week as (
  select count(*)::numeric / 7 avg_day from results r, b where r.created_at >= b.w0 and r.created_at < b.d0
),
tg as (
  select count(*) rows_logged, count(*) filter (where not ok) failed,
         count(distinct split_part(idem_key, '|', 3)) submissions
  from telegram_send_log t, b where t.ts >= b.d0 and t.ts < b.d1
),
tg_week as (
  select count(distinct split_part(idem_key, '|', 3)) submissions
  from telegram_send_log t, b where t.ts >= b.w0 and t.ts < b.d0
),
res_week as (select count(*) n from results r, b where r.created_at >= b.w0 and r.created_at < b.d0),
sent_ids as (
  select distinct split_part(idem_key, '|', 3) k
  from telegram_send_log t, b
  where t.ts >= b.d0 and t.ts < b.d1 + interval '30 min' and ok
    and split_part(idem_key, '|', 3) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
),
linked as (
  select count(*) filter (where exists (select 1 from sent_ids s where s.k = r.id::text)) n_linked,
         count(*) n_total
  from day_res r
),
misses as (
  select r.student_name, r.center, r.skill,
         to_char(r.created_at at time zone 'Asia/Tashkent', 'HH24:MI') t, r.id::text
  from day_res r
  where not exists (select 1 from sent_ids s where s.k = r.id::text)
  order by r.created_at desc
  limit 15
),
ai as (
  select count(*) total, count(*) filter (where status <> 'ok') errors
  from ai_submission_logs l, b
  where l.created_at >= b.d0 and l.created_at < b.d1 and provider <> 'authorize-finish'
),
ai_by as (
  select center_id, provider, count(*) n,
         (array_agg(error_message order by created_at desc))[1] sample
  from ai_submission_logs l, b
  where l.created_at >= b.d0 and l.created_at < b.d1
    and status <> 'ok' and provider <> 'authorize-finish'
  group by center_id, provider
),
-- The finish gate logs into the same table under a provider of its own. Its
-- refusals ARE the red UNAUTHORIZED wall a student sees, so they are counted
-- apart from model errors.
gate as (
  select count(*) filter (where status = 'ok') ok, count(*) filter (where status <> 'ok') blocked
  from ai_submission_logs l, b
  where l.created_at >= b.d0 and l.created_at < b.d1 and provider = 'authorize-finish'
),
gate_by as (
  select status, count(*) n
  from ai_submission_logs l, b
  where l.created_at >= b.d0 and l.created_at < b.d1 and provider = 'authorize-finish' and status <> 'ok'
  group by status
),
buckets as (select generate_series(b.d0, b.d1 - interval '10 min', interval '10 min') b0 from b),
windows as (
  select b0,
    (select count(*) from results r where r.created_at >= b0 and r.created_at < b0 + interval '10 min') subs,
    (select count(*) from telegram_send_log t where t.ts >= b0 and t.ts < b0 + interval '10 min') sends
  from buckets
),
dead as (select * from windows where subs >= 3 and sends = 0),
-- Vision calls are the fingerprint of an app build left behind.
--
-- Every published mock now carries its own pre-written image text (65/65 CEFR
-- speaking pairs, 96/96 IELTS Task 1 charts, none stale), and every client
-- shipped since 5 Aug 2026 reads that text instead of paying a vision model to
-- re-read a fixed picture. So a vision call today means the caller is running
-- code from before that — or, rarely, that a NEW mock was published without a
-- description, which is worth knowing too.
--
-- `retired` counts the ones asking for a model Groq has withdrawn. Those get no
-- description at all: the examiner grades a picture task having seen nothing.
-- They are the proof of age as well — that model name was deleted from the app
-- source on 4 Aug 2026, so a device still sending it has not taken an update in
-- over two weeks.
stale_app as (
  select count(*) total,
         count(*) filter (where error_message ilike '%scout%' or error_message ilike '%does not exist%') retired,
         count(distinct center_id) centres
  from ai_submission_logs l, b
  where l.created_at >= b.d0 and l.created_at < b.d1 and l.skill = 'vision'
),
stale_by as (
  select center_id,
         case
           when user_agent ilike '%Electron%'                                   then 'desktop'
           when user_agent ilike '%MockStream/%' or user_agent ilike '%CFNetwork%' then 'iPhone'
           when user_agent ilike '%okhttp%' or user_agent ilike '%Dalvik%'       then 'Android'
           when user_agent ilike '%Mozilla%'                                    then 'web'
           else 'other'
         end platform,
         count(*) n,
         count(*) filter (where status <> 'ok') failed
  from ai_submission_logs l, b
  where l.created_at >= b.d0 and l.created_at < b.d1 and l.skill = 'vision'
  group by 1, 2
)
select jsonb_build_object(
  'day',          to_char((select d0 from b) at time zone 'Asia/Tashkent', 'YYYY-MM-DD'),
  'submissions',  (select count(*) from day_res),
  'avg_7d',       round((select avg_day from prev_week)),
  'by_centre',    coalesce((select jsonb_agg(jsonb_build_object('center', center, 'skill', skill, 'n', n)
                                    order by n desc) from by_centre), '[]'::jsonb),
  'telegram',     jsonb_build_object(
                    'rows',        (select rows_logged from tg),
                    'failed',      (select failed from tg),
                    'submissions', (select submissions from tg),
                    'gap',         (select count(*) from day_res) - (select submissions from tg),
                    'gap_pct',     case when (select count(*) from day_res) = 0 then 0
                                        else round(100.0 * ((select count(*) from day_res) - (select submissions from tg))
                                                   / (select count(*) from day_res), 1) end,
                    'gap_pct_7d',  case when (select n from res_week) = 0 then 0
                                        else round(100.0 * ((select n from res_week) - (select submissions from tg_week))
                                                   / (select n from res_week), 1) end,
                    'linked_pct',  case when (select n_total from linked) = 0 then 0
                                        else round(100.0 * (select n_linked from linked) / (select n_total from linked), 1) end,
                    'missing',     coalesce((select jsonb_agg(jsonb_build_object(
                                      'student', student_name, 'center', center, 'skill', skill, 'at', t, 'id', id))
                                      from misses), '[]'::jsonb),
                    'dead_windows', (select count(*) from dead),
                    'dead_subs',    coalesce((select sum(subs) from dead), 0),
                    'dead_at',      coalesce((select string_agg(to_char(b0 at time zone 'Asia/Tashkent', 'HH24:MI'), ', '
                                              order by b0) from dead), '')
                  ),
  'gate',         jsonb_build_object(
                    'ok',      (select ok from gate),
                    'blocked', (select blocked from gate),
                    'by',      coalesce((select jsonb_agg(jsonb_build_object('reason', status, 'n', n) order by n desc)
                                         from gate_by), '[]'::jsonb)
                  ),
  'ai',           jsonb_build_object(
                    'total',  (select total from ai),
                    'errors', (select errors from ai),
                    'by',     coalesce((select jsonb_agg(jsonb_build_object('center', center_id, 'provider', provider,
                                                                            'n', n, 'sample', sample)
                                        order by n desc) from ai_by), '[]'::jsonb)
                  ),
  'stale_app',    jsonb_build_object(
                    'total',   (select total from stale_app),
                    'retired', (select retired from stale_app),
                    'by',      coalesce((select jsonb_agg(jsonb_build_object(
                                  'center', center_id, 'platform', platform, 'n', n, 'failed', failed)
                                  order by n desc) from stale_by), '[]'::jsonb)
                  )
);
$$;

revoke all on function public.daily_health_snapshot(int) from public, anon, authenticated;
grant execute on function public.daily_health_snapshot(int) to service_role;

comment on function public.daily_health_snapshot(int) is
  'Counts behind the 08:00 daily health report (Asia/Tashkent days). Called by the daily-health-check Edge Function with the service role.';

-- The 08:00 delivery itself (03:00 UTC), scheduled out of band on 19 Aug 2026
-- because pg_cron jobs do not live in this migration history:
--   select cron.schedule('daily-health-0800', '0 3 * * *', $job$
--     select net.http_post(
--       url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
--              || '/functions/v1/daily-health-check',
--       headers := jsonb_build_object('Content-Type','application/json',
--         'Authorization','Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')),
--       body := '{}'::jsonb, timeout_milliseconds := 240000)
--   $job$);
