-- =====================================================================
-- Replace recursive pe_read_self_or_admin policy with a non-recursive
-- self-read-only policy. The OR-admin branch caused infinite recursion
-- because the helper function still re-triggered the policy in this
-- Supabase setup despite SECURITY DEFINER + SET row_security=off.
--
-- Trade-off:
--   * Users (and admins) can read their own row by JWT email — enough
--     for client-side checkPremiumRole() to detect admin status.
--   * Admin list-all reads (Site Management dashboards) must go through
--     a service-role Edge Function. Direct PostgREST list reads from
--     the browser will return only the caller's own row.
-- =====================================================================

DROP POLICY IF EXISTS "pe_read_self_or_admin" ON public.premium_emails;
DROP POLICY IF EXISTS "pe_read_self"          ON public.premium_emails;

CREATE POLICY "pe_read_self"
  ON public.premium_emails FOR SELECT
  TO anon, authenticated
  USING (
    lower(email) = lower(COALESCE(
      nullif(current_setting('request.jwt.claim.email', true), ''),
      (current_setting('request.jwt.claims', true)::jsonb ->> 'email')
    ))
  );
