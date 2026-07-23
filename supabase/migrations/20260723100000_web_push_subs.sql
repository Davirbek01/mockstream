-- Web-Push (website/PWA) subscriptions + auto "new mock" notify — the
-- WEBSITE twin of 20260616090000_notify_new_mock_push.sql (native apps).
--
-- web_push_subs stores browser PushSubscription triples. Anon may only
-- INSERT (endpoint upsert); reads/deletes are service-role only (the
-- web-push Edge Function prunes dead endpoints itself). Endpoint URLs are
-- high-entropy capability URLs.

create table if not exists public.web_push_subs (
  id         uuid primary key default gen_random_uuid(),
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  center_id  text not null default 'mock_stream',
  ua         text,
  created_at timestamptz not null default now()
);

alter table public.web_push_subs enable row level security;

drop policy if exists web_push_subs_insert on public.web_push_subs;
create policy web_push_subs_insert on public.web_push_subs
  for insert to anon, authenticated
  with check (true);

-- Auto "new mock available" web push. Mirrors notify_new_mock() (native)
-- exactly, but posts to the web-push Edge Function instead.
create or replace function public.notify_new_mock_web()
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
  if new.status is distinct from 'published' then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.status is not distinct from 'published' then
    return new;
  end if;

  select decrypted_secret into v_url from vault.decrypted_secrets where name = 'project_url';
  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'service_role_key';
  if v_url is null or v_key is null then
    return new;
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
    url     := v_url || '/functions/v1/web-push',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || v_key),
    body    := jsonb_build_object(
      'title', v_title,
      'body',  v_body,
      'url',   '/landing-v3.html',
      'center','all',
      'data',  jsonb_build_object('type','new_mock','id',new.id,'mock_type',new.mock_type,'mock_number',new.mock_number)
    )
  ) into v_req;

  return new;
end;
$function$;

drop trigger if exists trg_notify_new_mock_web on public.mock_tests;
create trigger trg_notify_new_mock_web
  after insert or update of status on public.mock_tests
  for each row execute function public.notify_new_mock_web();
