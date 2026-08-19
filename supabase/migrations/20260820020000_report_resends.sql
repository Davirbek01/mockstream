-- ============================================================================
-- report_resends — a stored report posted to Telegram again from the admin
-- panel, and counted in the dashboard as its own report.
-- ----------------------------------------------------------------------------
-- The results table is NOT written to. A re-send is recorded here and the two
-- dashboard functions project it as an extra entry dated the day it was sent,
-- so the same work shows up under BOTH days and every figure — Total, Today,
-- the centre count, the device split, the averages — counts it twice, the way
-- a separate report would be counted.
--
-- Keeping it out of `results` is what protects the truth underneath: the
-- exam's real timestamp, the student's own history, and anything computed
-- from the raw table stay exactly as they were.
-- ============================================================================
create table if not exists public.report_resends (
  id           bigserial primary key,
  result_id    uuid not null references public.results(id) on delete cascade,
  resent_at    timestamptz not null default now(),
  by_email     text,
  in_dashboard boolean not null default true
);

create index if not exists report_resends_at_idx     on public.report_resends (resent_at desc);
create index if not exists report_resends_result_idx on public.report_resends (result_id);

alter table public.report_resends enable row level security;
revoke all on public.report_resends from anon, authenticated;
-- The two dashboard functions run with the CALLER's rights, so the dashboard
-- has to be able to read this table itself: without the grant it failed with
-- 42501 "permission denied for table report_resends" and the page showed a
-- Connection Error. Only the three columns the projection needs are granted —
-- by_email, which names the admin, is not one of them.
grant select (result_id, resent_at, in_dashboard) on public.report_resends to anon, authenticated;
drop policy if exists report_resends_read on public.report_resends;
create policy report_resends_read on public.report_resends
  for select to anon, authenticated using (true);

-- Called by the Resend Reports panel after a successful send, when the admin
-- left "show in dashboard too" ticked.
create or replace function public.record_report_resend(p_result_id uuid)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare v_id bigint;
begin
  if not public.is_super_admin() then
    raise exception 'not permitted';
  end if;
  insert into public.report_resends (result_id, by_email, in_dashboard)
  values (p_result_id, lower(coalesce(auth.jwt() ->> 'email', '')), true)
  returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.record_report_resend(uuid) from public;
grant execute on function public.record_report_resend(uuid) to authenticated;

comment on table public.report_resends is
  'One row per admin re-send of a stored report. The dashboard projects it as an extra entry on the re-send date; results itself is never modified.';


-- ── The two dashboard functions ────────────────────────────────────────────
-- Both keep the ONE pass over `results` they have always done, and merge the
-- re-sends from their own small table afterwards. Unioning the two BEFORE the
-- scan (the first attempt) doubled the work, hit the statement timeout, and the
-- dashboard answered 500 for every caller. The base CTEs are MATERIALIZED so
-- the planner cannot inline them back into a double scan.
--
-- Measured with the admin's own JWT: rows 1.72s → 1.78s, i.e. the feature costs
-- about 60ms. Most of that 1.7s is the RLS policy on `results`, which evaluates
-- an admin lookup per row across 126k rows — pre-existing, not from this work.

create or replace function public.results_dashboard_rows(
  p_center text default null, p_exam_type text default null, p_skill text default null,
  p_type text default null, p_name text default null, p_date_from date default null,
  p_date_to date default null, p_tz_offset_min integer default 0,
  p_sort_field text default 'created_at', p_sort_desc boolean default true,
  p_limit integer default 50, p_offset integer default 0)
returns setof results
language plpgsql
stable
as $function$
DECLARE
  v_sort_col text;
  v_dir      text;
BEGIN
  v_sort_col := CASE lower(coalesce(p_sort_field,''))
    WHEN 'created_at'   THEN 'created_at'
    WHEN 'student_name' THEN 'student_name'
    WHEN 'center'       THEN 'center'
    WHEN 'exam_type'    THEN 'exam_type'
    WHEN 'skill'        THEN 'skill'
    WHEN 'score'        THEN 'score'
    WHEN 'mock_number'  THEN 'mock_number'
    WHEN 'level'        THEN 'level'
    ELSE 'created_at'
  END;
  v_dir := CASE WHEN p_sort_desc THEN 'DESC NULLS LAST' ELSE 'ASC NULLS LAST' END;

  RETURN QUERY EXECUTE format(
    'WITH base AS MATERIALIZED (
       SELECT r.*
         FROM public.results r
        WHERE ($1::text IS NULL OR r.center    = $1)
          AND ($2::text IS NULL OR r.exam_type = $2)
          AND ($3::text IS NULL OR r.skill     = $3)
          AND ($4::text IS NULL OR lower(coalesce(r.student_name,'''')) LIKE ''%%'' || lower($4) || ''%%'')
          AND ($5::date IS NULL OR (r.created_at + ($6 || '' minutes'')::interval)::date >= $5)
          AND ($7::date IS NULL OR (r.created_at + ($6 || '' minutes'')::interval)::date <= $7)
          AND ($8::text IS NULL
               OR ($8 = ''practice'' AND (((r.metadata->>''is_practice'')::boolean IS TRUE) OR (r.mock_number LIKE ''Practice%%'')))
               OR ($8 = ''full''     AND NOT (((r.metadata->>''is_practice'')::boolean IS TRUE) OR (r.mock_number LIKE ''Practice%%''))))
        ORDER BY %I %s
        LIMIT ($9 + $10)
     ),
     res AS MATERIALIZED (
       SELECT r.id, x.resent_at AS created_at, r.student_name, r.center, r.exam_type, r.skill,
              r.score, r.level, r.caption, r.report_path, r.mock_number,
              coalesce(r.metadata, ''{}''::jsonb)
                || jsonb_build_object(''resend_of'', r.created_at, ''resend_at'', x.resent_at) AS metadata,
              r.device_info, r.user_email, r.device_id
         FROM public.report_resends x
         JOIN public.results r ON r.id = x.result_id
        WHERE x.in_dashboard
          AND ($1::text IS NULL OR r.center    = $1)
          AND ($2::text IS NULL OR r.exam_type = $2)
          AND ($3::text IS NULL OR r.skill     = $3)
          AND ($4::text IS NULL OR lower(coalesce(r.student_name,'''')) LIKE ''%%'' || lower($4) || ''%%'')
          AND ($5::date IS NULL OR (x.resent_at + ($6 || '' minutes'')::interval)::date >= $5)
          AND ($7::date IS NULL OR (x.resent_at + ($6 || '' minutes'')::interval)::date <= $7)
          AND ($8::text IS NULL
               OR ($8 = ''practice'' AND (((r.metadata->>''is_practice'')::boolean IS TRUE) OR (r.mock_number LIKE ''Practice%%'')))
               OR ($8 = ''full''     AND NOT (((r.metadata->>''is_practice'')::boolean IS TRUE) OR (r.mock_number LIKE ''Practice%%''))))
     )
     SELECT * FROM (SELECT * FROM base UNION ALL SELECT * FROM res) q
      ORDER BY %I %s
      LIMIT $9 OFFSET $10',
    v_sort_col, v_dir, v_sort_col, v_dir)
  USING p_center, p_exam_type, p_skill, p_name, p_date_from, p_tz_offset_min, p_date_to, p_type, p_limit, p_offset;
END;
$function$;

create or replace function public.results_dashboard_stats(
  p_center text default null, p_exam_type text default null, p_skill text default null,
  p_type text default null, p_name text default null, p_date_from date default null,
  p_date_to date default null, p_tz_offset_min integer default 0,
  p_today_start timestamptz default null, p_today_end timestamptz default null)
returns jsonb
language sql
stable
as $function$
WITH parsed AS MATERIALIZED (
  SELECT
    r.center, r.exam_type, r.score, r.created_at, r.device_info,
    r.mock_number, r.metadata,
    (substring(r.score from '^[0-9]+(?:\.[0-9]+)?'))::numeric AS score_num,
    -- "Full mock only" predicate: excludes Practice rows AND all *Plus modes.
    -- Mirrors the JS isPractice / isWritingPlus logic so the table's Practice/+
    -- badges always match what the Avg Score card excludes.
    NOT (
      ((r.metadata->>'is_practice'      )::boolean IS TRUE)
      OR ((r.metadata->>'is_writing_plus'  )::boolean IS TRUE)
      OR ((r.metadata->>'is_reading_plus'  )::boolean IS TRUE)
      OR ((r.metadata->>'is_listening_plus')::boolean IS TRUE)
      OR ((r.metadata->>'is_speaking_plus' )::boolean IS TRUE)
      OR ((r.metadata->>'is_plus'          )::boolean IS TRUE)
      OR (r.mock_number LIKE 'Practice%')
      OR (r.mock_number LIKE 'Writing Plus%')
      OR (r.mock_number LIKE 'Reading Plus%')
      OR (r.mock_number LIKE 'Listening Plus%')
      OR (r.mock_number LIKE 'Speaking Plus%')
    ) AS is_full_mock
  FROM public.results r
  WHERE (p_center    IS NULL OR r.center    = p_center)
    AND (p_exam_type IS NULL OR r.exam_type = p_exam_type)
    AND (p_skill     IS NULL OR r.skill     = p_skill)
    AND (p_name      IS NULL OR lower(coalesce(r.student_name,'')) LIKE '%' || lower(p_name) || '%')
    AND (p_date_from IS NULL OR (r.created_at + (p_tz_offset_min || ' minutes')::interval)::date >= p_date_from)
    AND (p_date_to   IS NULL OR (r.created_at + (p_tz_offset_min || ' minutes')::interval)::date <= p_date_to)
    AND (
      p_type IS NULL
      OR (p_type = 'practice' AND (((r.metadata->>'is_practice')::boolean IS TRUE) OR (r.mock_number LIKE 'Practice%')))
      OR (p_type = 'full'     AND NOT (((r.metadata->>'is_practice')::boolean IS TRUE) OR (r.mock_number LIKE 'Practice%')))
    )
),
resent AS MATERIALIZED (
  SELECT
    r.center, r.exam_type, r.score, x.resent_at AS created_at, r.device_info,
    r.mock_number, r.metadata,
    (substring(r.score from '^[0-9]+(?:\.[0-9]+)?'))::numeric AS score_num,
    NOT (
      ((r.metadata->>'is_practice'      )::boolean IS TRUE)
      OR ((r.metadata->>'is_writing_plus'  )::boolean IS TRUE)
      OR ((r.metadata->>'is_reading_plus'  )::boolean IS TRUE)
      OR ((r.metadata->>'is_listening_plus')::boolean IS TRUE)
      OR ((r.metadata->>'is_speaking_plus' )::boolean IS TRUE)
      OR ((r.metadata->>'is_plus'          )::boolean IS TRUE)
      OR (r.mock_number LIKE 'Practice%')
      OR (r.mock_number LIKE 'Writing Plus%')
      OR (r.mock_number LIKE 'Reading Plus%')
      OR (r.mock_number LIKE 'Listening Plus%')
      OR (r.mock_number LIKE 'Speaking Plus%')
    ) AS is_full_mock
  FROM public.report_resends x
  JOIN public.results r ON r.id = x.result_id
  WHERE x.in_dashboard
    AND (p_center    IS NULL OR r.center    = p_center)
    AND (p_exam_type IS NULL OR r.exam_type = p_exam_type)
    AND (p_skill     IS NULL OR r.skill     = p_skill)
    AND (p_name      IS NULL OR lower(coalesce(r.student_name,'')) LIKE '%' || lower(p_name) || '%')
    AND (p_date_from IS NULL OR (x.resent_at + (p_tz_offset_min || ' minutes')::interval)::date >= p_date_from)
    AND (p_date_to   IS NULL OR (x.resent_at + (p_tz_offset_min || ' minutes')::interval)::date <= p_date_to)
    AND (
      p_type IS NULL
      OR (p_type = 'practice' AND (((r.metadata->>'is_practice')::boolean IS TRUE) OR (r.mock_number LIKE 'Practice%')))
      OR (p_type = 'full'     AND NOT (((r.metadata->>'is_practice')::boolean IS TRUE) OR (r.mock_number LIKE 'Practice%')))
    )
),
allrows AS (SELECT * FROM parsed UNION ALL SELECT * FROM resent)
SELECT jsonb_build_object(
  'total',         COUNT(*),
  'today',         COUNT(*) FILTER (WHERE p_today_start IS NOT NULL AND created_at >= p_today_start AND created_at < p_today_end),
  'centers_count', COUNT(DISTINCT center),
  'avg_ielts',     ROUND(AVG(score_num) FILTER (WHERE lower(exam_type)='ielts' AND score_num IS NOT NULL)::numeric, 1),
  'cnt_ielts',     COUNT(*) FILTER (WHERE lower(exam_type)='ielts' AND score_num IS NOT NULL),
  'avg_cefr',      ROUND(AVG(score_num) FILTER (WHERE lower(exam_type)='cefr' AND score_num IS NOT NULL)::numeric, 1),
  'cnt_cefr',      COUNT(*) FILTER (WHERE lower(exam_type)='cefr' AND score_num IS NOT NULL),
  'avg_ielts_full', ROUND(AVG(score_num) FILTER (WHERE lower(exam_type)='ielts' AND score_num IS NOT NULL AND is_full_mock)::numeric, 1),
  'cnt_ielts_full', COUNT(*)             FILTER (WHERE lower(exam_type)='ielts' AND score_num IS NOT NULL AND is_full_mock),
  'avg_cefr_full',  ROUND(AVG(score_num) FILTER (WHERE lower(exam_type)='cefr'  AND score_num IS NOT NULL AND is_full_mock)::numeric, 1),
  'cnt_cefr_full',  COUNT(*)             FILTER (WHERE lower(exam_type)='cefr'  AND score_num IS NOT NULL AND is_full_mock),
  'mobile',        COUNT(*) FILTER (WHERE device_info->>'type' IN ('Mobile','Tablet')),
  'desktop',       COUNT(*) FILTER (WHERE device_info->>'type' IS NOT NULL AND device_info->>'type' NOT IN ('Mobile','Tablet'))
)
FROM allrows;
$function$;
