-- =====================================================================
-- Fix: RLS policies on premium_emails / site_settings crash with 500
-- because `current_setting('request.jwt.claims', true)::jsonb` throws
-- "invalid input syntax for type json" when the claims setting is an
-- empty string (which is what PostgREST gives anon callers and some
-- auth states).  Wrap the JWT-email extraction in a safe helper and
-- replace the raw inline coalesce in the SELECT policy.
--
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to re-run.  Does NOT change who can read/write — only stops
-- the policies from crashing.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Helper: _jwt_email() — returns the caller's email (lower) or NULL.
-- Never raises, even when request.jwt.claims is empty/garbage.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public._jwt_email()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email  text;
  v_claims text;
BEGIN
  -- Preferred: PostgREST sets `request.jwt.claim.email` directly.
  v_email := nullif(current_setting('request.jwt.claim.email', true), '');
  IF v_email IS NOT NULL THEN
    RETURN lower(v_email);
  END IF;

  -- Fallback: full claims JSON. Guard the cast.
  v_claims := nullif(current_setting('request.jwt.claims', true), '');
  IF v_claims IS NULL THEN
    RETURN NULL;
  END IF;
  BEGIN
    v_email := (v_claims::jsonb) ->> 'email';
  EXCEPTION WHEN others THEN
    RETURN NULL;
  END;
  IF v_email IS NULL OR v_email = '' THEN
    RETURN NULL;
  END IF;
  RETURN lower(v_email);
END;
$$;

REVOKE ALL ON FUNCTION public._jwt_email() FROM public;
GRANT EXECUTE ON FUNCTION public._jwt_email() TO anon, authenticated;

-- ---------------------------------------------------------------------
-- Rewrite current_admin_center() to use the safe helper.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_admin_center()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(pe.center, '')
  FROM public.premium_emails pe
  WHERE pe.active = true
    AND pe.role   = 'admin'
    AND lower(pe.email) = public._jwt_email()
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.current_admin_center() FROM public;
GRANT EXECUTE ON FUNCTION public.current_admin_center() TO anon, authenticated;

-- ---------------------------------------------------------------------
-- Replace the SELECT policy on premium_emails so it no longer does the
-- unsafe inline jsonb cast. Same logic, just routed through _jwt_email().
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "pe_read_self_or_admin" ON public.premium_emails;

CREATE POLICY "pe_read_self_or_admin"
  ON public.premium_emails FOR SELECT
  TO anon, authenticated
  USING (
    -- self-lookup by email (signed-in user reading own row)
    lower(email) = public._jwt_email()
    -- or the caller is an admin of any kind (uses safe helper internally)
    OR public.current_admin_center() IS NOT NULL
  );
