-- ============================================================================
-- admin_day_submissions() — the list behind the Resend Reports panel.
-- ----------------------------------------------------------------------------
-- Supabase keeps every report; Telegram is the part that can drop one. The
-- panel lists a chosen day's submissions so the admin can post the missing
-- ones to their centre's channel again — every row stays visible (practice
-- drills included), the undelivered ones are simply marked.
--
-- Days are Asia/Tashkent, because the admin picks the date from a calendar,
-- not from UTC. p_from / p_to narrow it to a time window of that day.
--
-- DELIVERY is decided by ONE thing: the send carries the id of the row it
-- belongs to (the senders were changed to key on it on 19 Aug 2026). Matching
-- by time instead was tried and is worthless — a busy centre has a send in
-- almost every minute, so 440 of 442 rows "matched" something. `day_linked_pct`
-- reports how much of the day was sent that way, and the panel greys the
-- verdict out below 60% rather than painting an older day red.
--
-- SUPER ADMIN ONLY (an admin row with no centre — the main site). The panel
-- reaches every centre's channel, which is not a centre admin's business, so
-- the guard is deliberately narrower than is_any_admin(). A non-admin caller
-- gets an empty set rather than an error, and the tile is not in
-- CENTER_ADMIN_PANELS on the client side either.
-- ============================================================================
drop function if exists public.admin_day_submissions(date, text, text);
drop function if exists public.admin_day_submissions(date, text, text, text, text, text);

create or replace function public.admin_day_submissions(
  p_date   date,
  p_center text default null,
  p_skill  text default null,
  p_type   text default 'all',      -- all | full | practice
  p_from   text default null,       -- 'HH:MM' local, inclusive
  p_to     text default null        -- 'HH:MM' local, inclusive
)
returns table (
  id             uuid,
  student_name   text,
  center         text,
  skill          text,
  exam_type      text,
  mock_number    text,
  score          text,
  level          text,
  taken_at       text,
  report_path    text,
  user_email     text,
  caption        text,
  is_practice    boolean,
  delivered      boolean,
  day_linked_pct numeric
)
language sql
security definer
set search_path = public
as $$
with b as (
  select (p_date::timestamp at time zone 'Asia/Tashkent')       as d0,
         ((p_date + 1)::timestamp at time zone 'Asia/Tashkent') as d1
),
sent as (
  select distinct split_part(t.idem_key, '|', 3) k
  from telegram_send_log t, b
  where t.ok and t.ts >= b.d0 - interval '10 min' and t.ts < b.d1 + interval '60 min'
    and split_part(t.idem_key, '|', 3) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
),
day_rows as (
  select r.* from results r, b
  where r.created_at >= b.d0 and r.created_at < b.d1 and r.report_path is not null
),
cover as (
  select case when count(*) = 0 then 0
              else round(100.0 * count(*) filter (where exists (select 1 from sent s where s.k = d.id::text))
                         / count(*), 1) end pct
  from day_rows d
)
select d.id, d.student_name, d.center, d.skill, d.exam_type, d.mock_number,
       d.score, d.level,
       to_char(d.created_at at time zone 'Asia/Tashkent', 'HH24:MI') as taken_at,
       d.report_path, d.user_email, d.caption,
       (coalesce(d.mock_number, '') ilike '%practice%' or coalesce(d.caption, '') ilike '%practice%') as is_practice,
       exists (select 1 from sent s where s.k = d.id::text) as delivered,
       (select pct from cover) as day_linked_pct
from day_rows d
where public.is_super_admin()
  and (p_center is null or p_center = '' or d.center = p_center)
  and (p_skill  is null or p_skill  = '' or d.skill  = p_skill)
  and (p_type is null or p_type = 'all'
       or (p_type = 'practice' and     (coalesce(d.mock_number,'') ilike '%practice%' or coalesce(d.caption,'') ilike '%practice%'))
       or (p_type = 'full'     and not (coalesce(d.mock_number,'') ilike '%practice%' or coalesce(d.caption,'') ilike '%practice%')))
  and (p_from is null or p_from = '' or (d.created_at at time zone 'Asia/Tashkent')::time >= p_from::time)
  and (p_to   is null or p_to   = '' or (d.created_at at time zone 'Asia/Tashkent')::time <= p_to::time)
order by d.created_at;
$$;

revoke all on function public.admin_day_submissions(date, text, text, text, text, text) from public;
grant execute on function public.admin_day_submissions(date, text, text, text, text, text) to authenticated, anon;

comment on function public.admin_day_submissions(date, text, text, text, text, text) is
  'Submissions of one Asia/Tashkent day for the admin re-send panel, each flagged practice/full and delivered-to-Telegram. Super admin only.';
