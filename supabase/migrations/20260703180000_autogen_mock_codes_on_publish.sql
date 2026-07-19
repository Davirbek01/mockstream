-- =====================================================================
-- Auto-generate per-mock codes when a mock is published.
-- ---------------------------------------------------------------------
-- Part B of "dynamic code slots". When a mock_tests row becomes
-- published, mint the missing Regular + Premium per-mock codes for that
-- (skill, mock_number) across every centre — so the Code Management
-- panel's per-mock rows appear with zero admin clicks.
--
-- The code system is exam-agnostic: a code is keyed by (center, skill,
-- mock_number, tier), with no CEFR/IELTS dimension. We therefore derive
-- the skill bucket from mock_type ('cefr-<skill>' / 'ielts-<skill>') and
-- ON CONFLICT DO NOTHING so a slot shared by both exams is only made once.
--
-- SAFETY: the insert is wrapped in its own BEGIN/EXCEPTION block so a
-- code-gen failure can NEVER roll back the mock publish itself. Worst
-- case, the codes just don't get auto-created and the admin falls back to
-- the panel's existing "Generate missing only" button.
-- =====================================================================

create or replace function public.autogen_mock_codes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_skill text;
begin
  -- Exam-agnostic skill bucket from mock_type: cefr-writing -> writing.
  v_skill := split_part(NEW.mock_type, '-', 2);
  if v_skill not in ('listening', 'reading', 'writing', 'speaking') then
    return NEW;
  end if;
  if NEW.mock_number is null or NEW.mock_number < 1 or NEW.mock_number > 999 then
    return NEW;
  end if;

  -- Non-blocking: never let a code-gen error abort the mock publish.
  begin
    insert into public.mock_codes
      (center, skill, mock_number, tier, code, expires_at, last_renewed_at, last_renewed_by)
    select
      c.id,
      v_skill,
      NEW.mock_number,
      t.tier,
      lpad((floor(random() * 100000000))::bigint::text, 8, '0'),
      null,               -- never expires (matches the panel's default)
      now(),
      'auto:publish'
    from public.centers c
    cross join (values ('regular'), ('premium')) as t(tier)
    on conflict (center, skill, mock_number, tier) do nothing;
  exception when others then
    raise warning 'autogen_mock_codes failed for % #%: %', v_skill, NEW.mock_number, sqlerrm;
  end;

  return NEW;
end;
$$;

-- Fire when a mock is created already-published, or transitions into
-- published from any other status. Editing an already-published mock does
-- not re-fire (OLD.status is distinct from 'published' guard).
drop trigger if exists trg_autogen_mock_codes_ins on public.mock_tests;
create trigger trg_autogen_mock_codes_ins
  after insert on public.mock_tests
  for each row
  when (NEW.status = 'published')
  execute function public.autogen_mock_codes();

drop trigger if exists trg_autogen_mock_codes_upd on public.mock_tests;
create trigger trg_autogen_mock_codes_upd
  after update on public.mock_tests
  for each row
  when (NEW.status = 'published' and OLD.status is distinct from 'published')
  execute function public.autogen_mock_codes();
