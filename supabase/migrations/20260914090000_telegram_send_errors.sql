-- Telegram send failures: keep them, name them, and grade them.
--
-- Until now send-to-telegram DELETED its reservation row whenever Telegram
-- refused a message or the request failed, so a real delivery error (a 429
-- flood limit, a 5xx, a network drop) left no trace at all. The only ok=false
-- rows that ever survived were sends CUT OFF mid-flight — the function stopped
-- before it could either mark success or clean up — and the 08:00 digest
-- counted those as "send failures" without being able to say which kind.
-- Measured over 30 days to 2026-09-14: ~23 such rows, all but one on the
-- `general` oversight channel (always the SECOND target, sent after the
-- centre's own channel).
--
-- Now send-to-telegram keeps the row with the reason in `error`, and the
-- snapshot reports three things separately:
--   failed_*  — Telegram or the network refused it; `error` says why
--   cut_*     — interrupted mid-send (error IS NULL); the message may or may
--               not have arrived, the log cannot tell
--   *_centre vs *_general — a centre channel missing a report is what needs
--               attention; the oversight channel missing a copy is a note
--
-- ⚠️ The dead-window check ("Telegram silence") must count only SUCCESSFUL
-- sends. It counted every row, which was harmless while failures were deleted,
-- but with failures kept, a window in which Telegram refused everything would
-- have looked busy and the digest's most serious alarm would never fire.

alter table public.telegram_send_log add column if not exists error text;

CREATE OR REPLACE FUNCTION public.daily_health_snapshot(p_days_back integer DEFAULT 1)
 RETURNS jsonb
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
 SET statement_timeout TO '60s'
AS $function$
with b as (
  select (date_trunc('day', (now() at time zone 'Asia/Tashkent')) - make_interval(days => p_days_back)) at time zone 'Asia/Tashkent' as d0,
         (date_trunc('day', (now() at time zone 'Asia/Tashkent')) - make_interval(days => p_days_back - 1)) at time zone 'Asia/Tashkent' as d1,
         (date_trunc('day', (now() at time zone 'Asia/Tashkent')) - make_interval(days => p_days_back + 6)) at time zone 'Asia/Tashkent' as w0
),
day_res as (select r.* from results r, b where r.created_at >= b.d0 and r.created_at < b.d1),
by_centre as (select center, skill, count(*) n from day_res where center is not null group by center, skill),
prev_week as (select count(*)::numeric / 7 avg_day from results r, b where r.created_at >= b.w0 and r.created_at < b.d0),
sent_ids as (
  select distinct tg_result_id(idem_key) k
  from telegram_send_log t, b
  where t.ts >= b.d0 and t.ts < b.d1 + interval '30 min' and ok
    and tg_result_id(idem_key) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
),
linked as (
  select count(*) filter (where exists (select 1 from sent_ids s where s.k = r.id::text)) n_linked,
         count(*) n_total from day_res r
),
base as (select * from tg_delivery_baseline(7, p_days_back)),
tg as (
  select count(*) rows_logged, count(*) filter (where not ok) failed,
         count(*) filter (where not ok and error is not null and target_tag <> 'general') failed_centre,
         count(*) filter (where not ok and error is not null and target_tag =  'general') failed_general,
         -- error IS NULL on a failed row = interrupted mid-send. The 10-minute
         -- margin keeps a send that is still in flight from counting.
         count(*) filter (where not ok and error is null and target_tag <> 'general' and ts < now() - interval '10 min') cut_centre,
         count(*) filter (where not ok and error is null and target_tag =  'general' and ts < now() - interval '10 min') cut_general,
         (array_agg(error order by ts desc) filter (where not ok and error is not null))[1] error_sample,
         count(*) filter (where ok and via = 'zip') via_zip,
         count(distinct tg_result_id(idem_key)) filter (where split_part(idem_key,'|',3) like 'resend-%') resends
  from telegram_send_log t, b where t.ts >= b.d0 and t.ts < b.d1
),
misses as (
  select r.student_name, r.center, r.skill, to_char(r.created_at at time zone 'Asia/Tashkent','HH24:MI') t, r.id::text,
         (coalesce(r.report_path,'') <> '') has_report
  from day_res r where not exists (select 1 from sent_ids s where s.k = r.id::text)
  order by r.created_at desc limit 15
),
ai as (select count(*) total, count(*) filter (where status <> 'ok') errors from ai_submission_logs l, b
        where l.created_at >= b.d0 and l.created_at < b.d1 and provider <> 'authorize-finish'),
ai_by as (select center_id, provider, count(*) n, (array_agg(error_message order by created_at desc))[1] sample
          from ai_submission_logs l, b where l.created_at >= b.d0 and l.created_at < b.d1
            and status <> 'ok' and provider <> 'authorize-finish' group by center_id, provider),
gate as (select count(*) filter (where status='ok') ok, count(*) filter (where status<>'ok') blocked
         from ai_submission_logs l, b where l.created_at >= b.d0 and l.created_at < b.d1 and provider='authorize-finish'),
gate_by as (select status, count(*) n from ai_submission_logs l, b
            where l.created_at >= b.d0 and l.created_at < b.d1 and provider='authorize-finish' and status<>'ok' group by status),
buckets as (select generate_series(b.d0, b.d1 - interval '10 min', interval '10 min') b0 from b),
windows as (select b0,
  (select count(*) from results r where r.created_at >= b0 and r.created_at < b0 + interval '10 min') subs,
  (select count(*) from telegram_send_log t where t.ok and t.ts >= b0 and t.ts < b0 + interval '10 min') sends from buckets),
dead as (select * from windows where subs >= 3 and sends = 0),
stale_app as (select count(*) total,
  count(*) filter (where error_message ilike '%scout%' or error_message ilike '%does not exist%') retired,
  count(distinct center_id) centres
  from ai_submission_logs l, b where l.created_at >= b.d0 and l.created_at < b.d1 and l.skill='vision'),
stale_by as (select center_id,
  case when user_agent ilike '%Electron%' then 'desktop'
       when user_agent ilike '%MockStream/%' or user_agent ilike '%CFNetwork%' then 'iPhone'
       when user_agent ilike '%okhttp%' or user_agent ilike '%Dalvik%' then 'Android'
       when user_agent ilike '%Mozilla%' then 'web' else 'other' end platform,
  count(*) n, count(*) filter (where status <> 'ok') failed
  from ai_submission_logs l, b where l.created_at >= b.d0 and l.created_at < b.d1 and l.skill='vision' group by 1,2)
select jsonb_build_object(
  'day', to_char((select d0 from b) at time zone 'Asia/Tashkent','YYYY-MM-DD'),
  'submissions', (select count(*) from day_res),
  'avg_7d', round((select avg_day from prev_week)),
  'by_centre', coalesce((select jsonb_agg(jsonb_build_object('center',center,'skill',skill,'n',n) order by n desc) from by_centre),'[]'::jsonb),
  'telegram', jsonb_build_object(
    'rows',(select rows_logged from tg), 'failed',(select failed from tg), 'via_zip',(select via_zip from tg),
    'failed_centre',(select failed_centre from tg), 'failed_general',(select failed_general from tg),
    'cut_centre',(select cut_centre from tg), 'cut_general',(select cut_general from tg),
    'error_sample',(select error_sample from tg),
    'submissions',(select n_linked from linked), 'resends',(select resends from tg),
    'gap',(select n_total - n_linked from linked),
    'gap_pct', case when (select n_total from linked)=0 then 0
                    else round(100.0*(select n_total - n_linked from linked)/(select n_total from linked),1) end,
    'gap_pct_7d', (select pct from base),
    'baseline_days', (select days_counted from base),
    'linked_pct', case when (select n_total from linked)=0 then 0
                       else round(100.0*(select n_linked from linked)/(select n_total from linked),1) end,
    'missing', coalesce((select jsonb_agg(jsonb_build_object('student',student_name,'center',center,'skill',skill,'at',t,'id',id,'has_report',has_report)) from misses),'[]'::jsonb),
    'dead_windows',(select count(*) from dead), 'dead_subs',coalesce((select sum(subs) from dead),0),
    'dead_at', coalesce((select string_agg(to_char(b0 at time zone 'Asia/Tashkent','HH24:MI'), ', ' order by b0) from dead),'')),
  'gate', jsonb_build_object('ok',(select ok from gate),'blocked',(select blocked from gate),
    'by', coalesce((select jsonb_agg(jsonb_build_object('reason',status,'n',n) order by n desc) from gate_by),'[]'::jsonb)),
  'ai', jsonb_build_object('total',(select total from ai),'errors',(select errors from ai),
    'by', coalesce((select jsonb_agg(jsonb_build_object('center',center_id,'provider',provider,'n',n,'sample',sample) order by n desc) from ai_by),'[]'::jsonb)),
  'stale_app', jsonb_build_object('total',(select total from stale_app),'retired',(select retired from stale_app),
    'by', coalesce((select jsonb_agg(jsonb_build_object('center',center_id,'platform',platform,'n',n,'failed',failed) order by n desc) from stale_by),'[]'::jsonb))
);
$function$;
