-- =====================================================================
-- Fix: infinite recursion in pe_read_self_or_admin policy.
-- The policy calls current_admin_center(), which SELECTs premium_emails,
-- which re-triggers the policy. SECURITY DEFINER alone does not bypass
-- RLS unless the definer role has BYPASSRLS or row_security is disabled.
-- Adding SET row_security = off makes the function's inner queries skip
-- RLS regardless of the definer role.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.current_admin_center()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT COALESCE(pe.center, '')
  FROM public.premium_emails pe
  WHERE pe.active = true
    AND pe.role   = 'admin'
    AND lower(pe.email) = lower(
      COALESCE(
        nullif(current_setting('request.jwt.claim.email', true), ''),
        (current_setting('request.jwt.claims', true)::jsonb ->> 'email')
      )
    )
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.current_admin_center() FROM public;
GRANT EXECUTE ON FUNCTION public.current_admin_center() TO anon, authenticated;
