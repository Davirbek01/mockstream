-- ============================================================================
-- pending_telegram_deliveries() — work that reached Supabase but not Telegram.
-- ----------------------------------------------------------------------------
-- The client sends the report itself, AFTER the score is already on screen, and
-- that send is a second upload of the whole file. Measured on 20 Aug 2026:
--
--   listening   2.0s to send   97% delivered
--   writing     4.7s           95%
--   reading     4.2s           92%
--   speaking    9.2s           80%   <- the biggest file, the worst loss
--
-- Closing the tab, locking the phone or a dip in signal inside that window ends
-- the delivery, while storage and the results row are already complete. Only
-- the channel copy is lost — which is the one thing a centre admin looks at.
--
-- So the server finishes the job: this returns rows old enough that the client
-- has certainly stopped trying, whose id appears in no successful send, with
-- everything the sender needs to build the message. The Login line is rebuilt
-- here because the client stamps it at send time from the signed-in session.
--
-- Read by the deliver-pending Edge Function, every five minutes.
-- Service role only.
-- ============================================================================
create or replace function public.pending_telegram_deliveries(
  p_min_age_min int default 2,
  p_max_age_min int default 180,
  p_limit       int default 20
)
returns table (
  id           uuid,
  center       text,
  skill        text,
  student_name text,
  mock_number  text,
  report_path  text,
  caption      text,
  login_line   text,
  created_at   timestamptz
)
language sql
security definer
set search_path = public
as $$
  select r.id, r.center, r.skill, r.student_name, r.mock_number, r.report_path, r.caption,
         case
           when coalesce(r.user_email, '') = '' then '👥 Login: Guest'
           when r.user_email ilike 'tg\_%@telegram.%' then
             coalesce(
               (select '✈️ Login: @' || l.telegram_username
                  from user_telegram_links l
                 where l.telegram_id::text = replace(split_part(r.user_email, '@', 1), 'tg_', '')
                   and coalesce(l.telegram_username, '') <> ''
                 limit 1),
               '✈️ Login: Telegram user')
           else '📧 Login: ' || lower(r.user_email)
         end as login_line,
         r.created_at
  from results r
  where r.report_path is not null
    and r.created_at <= now() - make_interval(mins => p_min_age_min)
    and r.created_at >= now() - make_interval(mins => p_max_age_min)
    and not exists (
      select 1 from telegram_send_log t
      where t.ok
        and t.ts >= r.created_at - interval '5 min'
        and split_part(t.idem_key, '|', 3) = r.id::text
    )
  order by r.created_at
  limit p_limit;
$$;

revoke all on function public.pending_telegram_deliveries(int, int, int) from public, anon, authenticated;

comment on function public.pending_telegram_deliveries(int, int, int) is
  'Reports stored in Supabase with no successful Telegram send. Read by the deliver-pending Edge Function every few minutes.';

-- The five-minute sweep, scheduled out of band on 20 Aug 2026 (pg_cron jobs do
-- not live in this migration history):
--   select cron.schedule('deliver-pending-5min', '*/5 * * * *', $job$
--     select net.http_post(
--       url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
--              || '/functions/v1/deliver-pending',
--       headers := jsonb_build_object('Content-Type','application/json',
--         'Authorization','Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')),
--       body := '{}'::jsonb, timeout_milliseconds := 120000)
--   $job$);
