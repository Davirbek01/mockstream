-- Authorizes the storage-cleanup Edge Function. The function calls this with its
-- own (valid, injected) service role and passes the CALLER's token; this returns
-- true iff that token equals the vault service_role_key. This decouples auth from
-- whether the injected key and the vault key are byte-identical (they weren't).
-- Returns only a boolean — never the secret.
create or replace function public._cleanup_token_ok(p_token text)
returns boolean
language sql
security definer
set search_path to 'vault','public'
as $$
  select p_token is not null
     and p_token = (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key');
$$;

revoke all on function public._cleanup_token_ok(text) from public, anon, authenticated;
grant execute on function public._cleanup_token_ok(text) to service_role;
