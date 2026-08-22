-- ═══════════════════════════════════════════════════════════════════════════
-- daily_health_snapshot: tell the two kinds of "missing" apart, and count the
-- channel copies that went out as the legacy zip.
--
-- Applied to the deployed definition with targeted replacements (the body is
-- long and lives in the database); this file records what changed.
--
-- 1. `misses` now carries has_report. A row WITH a stored report that never
--    reached Telegram is a delivery failure worth chasing. A row WITHOUT one
--    was never sendable — a desktop build from before 9 Jul 2026 saved
--    practice drills as a bare score — and listing those as lost reports sent
--    us hunting a failure that never happened (12 of them on 21 Aug, all one
--    student).
--
-- 2. `telegram.via_zip` counts sends where telegram_send_log.via = 'zip', i.e.
--    the page could not fetch the encrypted report and fell back to the old
--    bundle. See 20260822090000_send_log_via.sql.
-- ═══════════════════════════════════════════════════════════════════════════
do $$
declare src text; s2 text;
begin
  select pg_get_functiondef(p.oid) into src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname='public' and p.proname='daily_health_snapshot';

  s2 := replace(src,
    '  select r.student_name, r.center, r.skill, to_char(r.created_at at time zone ''Asia/Tashkent'',''HH24:MI'') t, r.id::text',
    '  select r.student_name, r.center, r.skill, to_char(r.created_at at time zone ''Asia/Tashkent'',''HH24:MI'') t, r.id::text,
         (coalesce(r.report_path,'''') <> '''') has_report');
  if s2 <> src then src := s2; end if;

  s2 := replace(src,
    '''missing'', coalesce((select jsonb_agg(jsonb_build_object(''student'',student_name,''center'',center,''skill'',skill,''at'',t,''id'',id)) from misses),''[]''::jsonb),',
    '''missing'', coalesce((select jsonb_agg(jsonb_build_object(''student'',student_name,''center'',center,''skill'',skill,''at'',t,''id'',id,''has_report'',has_report)) from misses),''[]''::jsonb),');
  if s2 <> src then src := s2; end if;

  s2 := replace(src,
    '  select count(*) rows_logged, count(*) filter (where not ok) failed,',
    '  select count(*) rows_logged, count(*) filter (where not ok) failed,
         count(*) filter (where ok and via = ''zip'') via_zip,');
  if s2 <> src then src := s2; end if;

  s2 := replace(src,
    '''rows'',(select rows_logged from tg), ''failed'',(select failed from tg),',
    '''rows'',(select rows_logged from tg), ''failed'',(select failed from tg), ''via_zip'',(select via_zip from tg),');
  if s2 <> src then src := s2; end if;

  execute src;
end $$;
