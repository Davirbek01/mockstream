-- ============================================================================
-- Speaking drafts: each recorded answer is kept on the server while the exam
-- is unfinished, so a student can continue it on another device.
-- ----------------------------------------------------------------------------
-- Private bucket, no policies: only the speaking-draft Edge Function (service
-- role) reads or writes it, after proving from the caller's JWT whose drafts
-- they are. Layout: <sha256(email)[:32]>/<test_type>/<mock>/q<N>.webm|.txt
--   .webm  the answer exactly as saved on the recording device
--   .txt   its transcript, when the student is premium (transcribed as soon
--          as the answer is saved, the way the mobile app does it)
--
-- A draft lives until the exam is submitted, the student starts a different
-- mock of the same type or discards it — or 72 hours pass, matching
-- test_sessions. The 72-hour sweep runs from daily-health-check.
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('speaking-drafts', 'speaking-drafts', false, 10485760)
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 10485760;

-- Object names older than p_hours, for the sweep to remove through the
-- Storage API (deleting rows here directly would orphan the files).
CREATE OR REPLACE FUNCTION public.speaking_draft_stale_objects(p_hours int DEFAULT 72, p_limit int DEFAULT 1000)
RETURNS TABLE(name text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, storage AS $$
  SELECT o.name
    FROM storage.objects o
   WHERE o.bucket_id = 'speaking-drafts'
     AND coalesce(o.updated_at, o.created_at) < now() - make_interval(hours => greatest(1, p_hours))
   ORDER BY o.created_at
   LIMIT greatest(1, least(p_limit, 5000))
$$;

REVOKE ALL ON FUNCTION public.speaking_draft_stale_objects(int, int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.speaking_draft_stale_objects(int, int) TO service_role;
