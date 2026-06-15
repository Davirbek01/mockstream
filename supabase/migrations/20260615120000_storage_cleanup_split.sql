-- Phase B: split auto-cleanup into audio/recordings vs report pages, and make
-- it actually work (the old cron deleted by report_path with net.http_delete and
-- a vault key that no longer matched, so storage deletes silently failed and
-- left orphaned files while nulling report_path).
--
-- New approach: cleanup_old_reports() now delegates to the storage-cleanup Edge
-- Function, which enumerates STORAGE directly (reaches orphans) and deletes with
-- the injected service role. Categories controlled by site_settings:
--   cleanup_delete_audio   'on'|'off'  -> .m4a + .zip   (default on)
--   cleanup_delete_reports 'on'|'off'  -> .html         (default off — keep)

insert into site_settings (key, value) values
  ('cleanup_delete_audio','on'),
  ('cleanup_delete_reports','off')
on conflict (key) do nothing;

create or replace function public.cleanup_old_reports()
returns json
language plpgsql
security definer
set search_path to 'public','extensions'
as $function$
declare
  v_url text;
  v_key text;
  v_req bigint;
begin
  select decrypted_secret into v_url from vault.decrypted_secrets where name = 'project_url';
  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'service_role_key';
  if v_url is null or v_key is null then
    raise exception 'cleanup_old_reports: project_url or service_role_key missing in vault';
  end if;
  select net.http_post(
    url     := v_url || '/functions/v1/storage-cleanup',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || v_key),
    body    := '{}'::jsonb
  ) into v_req;
  return json_build_object('dispatched', true, 'request_id', v_req);
end;
$function$;
