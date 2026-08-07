-- Auto "new mock available" push.
-- When a mock_tests row becomes `published` (fresh insert, or a draft flipped to
-- published), notify all registered mobile devices via the send-push Edge
-- Function. Mocks are global (no per-centre column) so the audience is 'all'.
--
-- Fires via pg_net (async); reads project_url + service_role_key from vault, the
-- same pattern as cleanup_old_reports(). The service-role bearer authorises a
-- system send inside send-push.

create or replace function public.notify_new_mock()
returns trigger
language plpgsql
security definer
set search_path to 'public','extensions'
as $function$
declare
  v_url   text;
  v_key   text;
  v_exam  text;
  v_skill text;
  v_label text;
  v_title text;
  v_body  text;
  v_req   bigint;
begin
  -- only when the row is (now) published and wasn't already
  if new.status is distinct from 'published' then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.status is not distinct from 'published' then
    return new;
  end if;

  select decrypted_secret into v_url from vault.decrypted_secrets where name = 'project_url';
  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'service_role_key';
  if v_url is null or v_key is null then
    return new; -- vault not configured; skip silently (don't block the publish)
  end if;

  v_exam  := case when new.mock_type like 'ielts-%' then 'IELTS'
                  when new.mock_type like 'cefr-%'  then 'CEFR'
                  else '' end;
  v_skill := initcap(split_part(new.mock_type, '-', 2));
  v_label := trim(v_exam || ' ' || v_skill);
  v_title := '🎉 New mock available';
  v_body  := trim(v_label || ' Mock ' || coalesce(new.mock_number::text, '')) ||
             ' is now live — tap to practice!';

  select net.http_post(
    url     := v_url || '/functions/v1/send-push',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || v_key),
    body    := jsonb_build_object(
      'title', v_title,
      'body',  v_body,
      'center','all',
      'data',  jsonb_build_object('type','new_mock','id',new.id,'mock_type',new.mock_type,'mock_number',new.mock_number)
    )
  ) into v_req;

  return new;
end;
$function$;

drop trigger if exists trg_notify_new_mock on public.mock_tests;
create trigger trg_notify_new_mock
  after insert or update of status on public.mock_tests
  for each row execute function public.notify_new_mock();
