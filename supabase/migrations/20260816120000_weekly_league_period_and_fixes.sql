-- weekly_league — the XP leaderboard behind the mobile + desktop League
-- screens (the websites don't use it). Final state after three fixes:
--
--  1. p_days window: 7 (default, the weekly board) or <= 0 for ALL TIME.
--     NOTE: adding the parameter created a SECOND overload and PostgREST then
--     refused every 4-arg call (PGRST203) — i.e. every live app. The old
--     4-arg signature is dropped below; keep exactly one signature.
--  2. Exclude the 'full-mock' wrapper row: a full mock writes 4 skill rows +
--     1 combined row, and counting the wrapper added a phantom +1 mock/+50 XP.
--  3. Ignore placeholder names ('Unknown', 'Guest'…) when picking the display
--     name, so a student's real name wins (the board showed "Unknown" at #1).
DROP FUNCTION IF EXISTS public.weekly_league(text, text, text, integer);

CREATE OR REPLACE FUNCTION public.weekly_league(
  p_center text,
  p_exam text DEFAULT NULL::text,
  p_me text DEFAULT NULL::text,
  p_limit integer DEFAULT 50,
  p_days integer DEFAULT 7
)
 RETURNS TABLE(rank bigint, name text, xp bigint, mocks bigint, is_me boolean)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with recent as (
    select r.user_email,
      max(nullif(btrim(r.student_name), '')) filter (
        where lower(btrim(coalesce(r.student_name,''))) not in
          ('unknown','student','guest','learner','user','undefined','null','n/a','test')
      ) as student_name,
      sum(case when coalesce(r.metadata->>'practice','') = 'true' then 10 else 50 end) as xp,
      count(*) filter (where coalesce(r.metadata->>'practice','') <> 'true') as mocks
    from public.results r
    where r.center = p_center
      and (coalesce(p_days, 7) <= 0 or r.created_at >= now() - make_interval(days => coalesce(p_days, 7)))
      and (p_exam is null or r.exam_type = p_exam) and r.user_email is not null
      and coalesce(r.skill,'') <> 'full-mock'
    group by r.user_email
  ),
  ranked as (
    select row_number() over (order by xp desc, mocks desc, user_email) as rank, user_email, student_name, xp, mocks
    from recent
  )
  select rank,
    coalesce(nullif(btrim(split_part(student_name,' ',1) || ' ' ||
      case when position(' ' in coalesce(student_name,'')) > 0 then left(split_part(student_name,' ',2),1) || '.' else '' end), ''), 'Learner') as name,
    xp, mocks, (p_me is not null and user_email = p_me) as is_me
  from ranked order by rank limit greatest(1, least(p_limit, 200));
$function$;

REVOKE ALL ON FUNCTION public.weekly_league(text, text, text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.weekly_league(text, text, text, integer, integer) TO anon, authenticated, service_role;
