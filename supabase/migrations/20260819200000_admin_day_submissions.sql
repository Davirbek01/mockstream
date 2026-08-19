-- ============================================================================
-- admin_day_submissions() — the list behind the Resend Reports panel.
-- ----------------------------------------------------------------------------
-- Supabase keeps every report; Telegram is the part that can drop one. The
-- panel lists a chosen day's submissions so the admin can post the missing
-- ones to their centre's channel again.
--
-- Days are Asia/Tashkent, because the admin picks the date from a calendar,
-- not from UTC.
--
-- SUPER ADMIN ONLY (an admin row with no centre — the main site). The panel
-- reaches every centre's channel, which is not a centre admin's business, so
-- the guard is deliberately narrower than is_any_admin(). A non-admin caller
-- gets an empty set rather than an error, and the panel tile is hidden from
-- centre admins on the client side as well.
-- ============================================================================
drop function if exists public.admin_day_submissions(date, text, text);

create or replace function public.admin_day_submissions(
  p_date   date,
  p_center text default null,
  p_skill  text default null
)
returns table (
  id           uuid,
  student_name text,
  center       text,
  skill        text,
  exam_type    text,
  mock_number  text,
  score        text,
  level        text,
  taken_at     text,
  report_path  text,
  user_email   text,
  caption      text
)
language sql
security definer
set search_path = public
as $$
  select r.id, r.student_name, r.center, r.skill, r.exam_type, r.mock_number,
         r.score, r.level,
         to_char(r.created_at at time zone 'Asia/Tashkent', 'HH24:MI') as taken_at,
         r.report_path, r.user_email, r.caption
  from results r
  where public.is_super_admin()
    and r.created_at >= (p_date::timestamp at time zone 'Asia/Tashkent')
    and r.created_at <  ((p_date + 1)::timestamp at time zone 'Asia/Tashkent')
    and (p_center is null or p_center = '' or r.center = p_center)
    and (p_skill  is null or p_skill  = '' or r.skill  = p_skill)
    and r.report_path is not null
  order by r.created_at;
$$;

revoke all on function public.admin_day_submissions(date, text, text) from public;
grant execute on function public.admin_day_submissions(date, text, text) to authenticated, anon;

comment on function public.admin_day_submissions(date, text, text) is
  'Submissions of one Asia/Tashkent day for the admin re-send panel. Super admin only (main-site admin, no centre); returns nothing for anyone else.';
