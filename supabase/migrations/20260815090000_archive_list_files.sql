-- Token-guarded listing of the `reports` storage bucket, used by the GCS
-- archiver (mockstream-desktop → .github/workflows/archive-reports.yml) and by
-- one-off backfills. Keyset pagination over storage.objects.
--
-- The token itself is NOT in this file: it lives in site_settings under key
-- 'archive_list_token' and, on the CI side, in the repo secret
-- ARCHIVE_LIST_TOKEN. Rotate by updating both.
CREATE OR REPLACE FUNCTION public.archive_list_files(
  p_token text,
  p_after text DEFAULT '',
  p_limit int DEFAULT 1000
) RETURNS TABLE(name text, size bigint, created_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, storage AS $$
BEGIN
  IF p_token IS DISTINCT FROM (SELECT s.value FROM site_settings s WHERE s.key = 'archive_list_token') THEN
    RAISE EXCEPTION 'invalid token';
  END IF;
  RETURN QUERY
    SELECT o.name, (o.metadata->>'size')::bigint, o.created_at
    FROM storage.objects o
    WHERE o.bucket_id = 'reports' AND o.name > p_after
    ORDER BY o.name
    LIMIT LEAST(GREATEST(p_limit, 1), 5000);
END $$;

REVOKE ALL ON FUNCTION public.archive_list_files(text, text, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.archive_list_files(text, text, int) TO anon, authenticated, service_role;
