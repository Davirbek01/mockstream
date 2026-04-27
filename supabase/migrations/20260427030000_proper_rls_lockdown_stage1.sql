-- =====================================================================
-- STAGE 1: Add proper RLS to premium_emails / results / premium_devices
--
-- Safety strategy:
--   * Stage 1 ADDS new restrictive policies but leaves the existing
--     "Allow anon ..." permissive policies in place.
--   * RLS is OR-evaluated: as long as the legacy permissive policies
--     exist, ALL access still works. Stage 1 cannot lock you out.
--   * After you verify Stage 1 keeps everything functional, Stage 2
--     (a separate SQL block, see comments at the bottom) drops the
--     legacy policies. THAT is what actually closes the hole.
--
-- An emergency-bypass policy hardcodes davirbekkhasanov02@gmail.com as
-- super admin so even if the helper functions break, you keep access.
--
-- Recursion-proof admin check:
--   The helper function `public._is_admin_email()` is SECURITY DEFINER,
--   owned by postgres (BYPASSRLS), uses LANGUAGE plpgsql (NOT inlined),
--   and explicitly SETs row_security = off. RLS is bypassed when this
--   function reads premium_emails, so policies that call it cannot
--   recurse.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Helper: lowercase JWT email (already exists from prior migration,
-- but redefine here so this file is self-contained / re-runnable).
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public._jwt_email()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  v_email  text;
  v_claims text;
BEGIN
  v_email := nullif(current_setting('request.jwt.claim.email', true), '');
  IF v_email IS NOT NULL THEN
    RETURN lower(v_email);
  END IF;
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
-- _is_admin_email(text): true if the given email has an active admin
-- row in premium_emails. RLS bypassed via SET row_security = off.
-- LANGUAGE plpgsql prevents inlining (SQL functions can be inlined and
-- lose their SET clauses, which is what caused our earlier recursion).
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public._is_admin_email(p_email text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  v_count int;
BEGIN
  IF p_email IS NULL OR p_email = '' THEN
    RETURN false;
  END IF;
  SELECT count(*) INTO v_count
  FROM public.premium_emails
  WHERE lower(email) = lower(p_email)
    AND role = 'admin'
    AND active = true;
  RETURN v_count > 0;
END;
$$;

REVOKE ALL ON FUNCTION public._is_admin_email(text) FROM public;
GRANT EXECUTE ON FUNCTION public._is_admin_email(text) TO anon, authenticated;

-- ---------------------------------------------------------------------
-- _admin_center_for(text): returns the center for an admin email
-- (or '' for super admin), NULL if not admin.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public._admin_center_for(p_email text)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  v_center text;
BEGIN
  IF p_email IS NULL OR p_email = '' THEN
    RETURN NULL;
  END IF;
  SELECT COALESCE(center, '') INTO v_center
  FROM public.premium_emails
  WHERE lower(email) = lower(p_email)
    AND role = 'admin'
    AND active = true
  LIMIT 1;
  RETURN v_center;  -- NULL if not found
END;
$$;

REVOKE ALL ON FUNCTION public._admin_center_for(text) FROM public;
GRANT EXECUTE ON FUNCTION public._admin_center_for(text) TO anon, authenticated;

-- ---------------------------------------------------------------------
-- Convenience: is the CURRENT caller an admin?
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public._caller_is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  v_email text;
BEGIN
  -- HARDCODED EMERGENCY ESCAPE HATCH:
  -- davirbekkhasanov02@gmail.com is always super admin even if the
  -- premium_emails row gets deleted/modified. Lets you recover.
  v_email := public._jwt_email();
  IF v_email = 'davirbekkhasanov02@gmail.com' THEN
    RETURN true;
  END IF;
  RETURN public._is_admin_email(v_email);
END;
$$;

REVOKE ALL ON FUNCTION public._caller_is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public._caller_is_admin() TO anon, authenticated;

-- =====================================================================
-- premium_emails: new policies (added alongside legacy "Allow anon ..."
-- policies — Stage 1 keeps both, Stage 2 drops the legacy ones).
-- =====================================================================
ALTER TABLE public.premium_emails ENABLE ROW LEVEL SECURITY;

-- SELECT: own row (so signed-in users can read their own premium status)
--         OR caller is admin (so admin panels see all rows)
DROP POLICY IF EXISTS "rls_pe_select" ON public.premium_emails;
CREATE POLICY "rls_pe_select"
  ON public.premium_emails FOR SELECT
  TO anon, authenticated
  USING (
    lower(email) = public._jwt_email()
    OR public._caller_is_admin()
  );

-- INSERT: only admins
DROP POLICY IF EXISTS "rls_pe_insert" ON public.premium_emails;
CREATE POLICY "rls_pe_insert"
  ON public.premium_emails FOR INSERT
  TO anon, authenticated
  WITH CHECK ( public._caller_is_admin() );

-- UPDATE: only admins
DROP POLICY IF EXISTS "rls_pe_update" ON public.premium_emails;
CREATE POLICY "rls_pe_update"
  ON public.premium_emails FOR UPDATE
  TO anon, authenticated
  USING ( public._caller_is_admin() )
  WITH CHECK ( public._caller_is_admin() );

-- DELETE: only admins
DROP POLICY IF EXISTS "rls_pe_delete" ON public.premium_emails;
CREATE POLICY "rls_pe_delete"
  ON public.premium_emails FOR DELETE
  TO anon, authenticated
  USING ( public._caller_is_admin() );

-- =====================================================================
-- results: new policies
-- =====================================================================
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- SELECT: own row (by user_email) OR caller is admin
--         Center-scoped admins see only their center's results.
DROP POLICY IF EXISTS "rls_results_select" ON public.results;
CREATE POLICY "rls_results_select"
  ON public.results FOR SELECT
  TO anon, authenticated
  USING (
    -- user reading own
    (user_email IS NOT NULL AND lower(user_email) = public._jwt_email())
    -- or super admin (center='')
    OR public._admin_center_for(public._jwt_email()) = ''
    -- or center-scoped admin matching the row's center
    OR (
      center IS NOT NULL
      AND public._admin_center_for(public._jwt_email()) = center
    )
  );

-- INSERT: anyone can submit, but if user_email is set it must match caller
DROP POLICY IF EXISTS "rls_results_insert" ON public.results;
CREATE POLICY "rls_results_insert"
  ON public.results FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    user_email IS NULL
    OR public._jwt_email() IS NULL  -- anon submitter
    OR lower(user_email) = public._jwt_email()
    OR public._caller_is_admin()
  );

-- UPDATE: only admins
DROP POLICY IF EXISTS "rls_results_update" ON public.results;
CREATE POLICY "rls_results_update"
  ON public.results FOR UPDATE
  TO anon, authenticated
  USING ( public._caller_is_admin() )
  WITH CHECK ( public._caller_is_admin() );

-- DELETE: only admins
DROP POLICY IF EXISTS "rls_results_delete" ON public.results;
CREATE POLICY "rls_results_delete"
  ON public.results FOR DELETE
  TO anon, authenticated
  USING ( public._caller_is_admin() );

-- =====================================================================
-- premium_devices: new policies
-- =====================================================================
ALTER TABLE public.premium_devices ENABLE ROW LEVEL SECURITY;

-- SELECT: own row OR admin
DROP POLICY IF EXISTS "rls_pd_select" ON public.premium_devices;
CREATE POLICY "rls_pd_select"
  ON public.premium_devices FOR SELECT
  TO anon, authenticated
  USING (
    (email IS NOT NULL AND lower(email) = public._jwt_email())
    OR public._caller_is_admin()
  );

-- INSERT: own email OR admin OR anon (device registration)
DROP POLICY IF EXISTS "rls_pd_insert" ON public.premium_devices;
CREATE POLICY "rls_pd_insert"
  ON public.premium_devices FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NULL
    OR public._jwt_email() IS NULL
    OR lower(email) = public._jwt_email()
    OR public._caller_is_admin()
  );

-- UPDATE: own row OR admin
DROP POLICY IF EXISTS "rls_pd_update" ON public.premium_devices;
CREATE POLICY "rls_pd_update"
  ON public.premium_devices FOR UPDATE
  TO anon, authenticated
  USING (
    (email IS NOT NULL AND lower(email) = public._jwt_email())
    OR public._caller_is_admin()
  )
  WITH CHECK (
    (email IS NOT NULL AND lower(email) = public._jwt_email())
    OR public._caller_is_admin()
  );

-- DELETE: only admins
DROP POLICY IF EXISTS "rls_pd_delete" ON public.premium_devices;
CREATE POLICY "rls_pd_delete"
  ON public.premium_devices FOR DELETE
  TO anon, authenticated
  USING ( public._caller_is_admin() );

-- =====================================================================
-- Make sure GRANTs are in place (RLS won't help if base privileges
-- aren't granted — PostgREST returns 500).
-- =====================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.premium_emails  TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.results         TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.premium_devices TO anon, authenticated;

-- =====================================================================
-- STAGE 2 (DO NOT RUN YET): drop legacy permissive policies.
-- After you verify Stage 1 keeps everything working AND that admin
-- accounts still work AND non-admin accounts can't see other people's
-- data, run the block below in a SEPARATE SQL Editor query.
--
-- Until you run Stage 2, the table is still wide open (legacy
-- "Allow anon ..." with qual=true grants everything to everyone).
--
--    DROP POLICY IF EXISTS "Allow anon select premium" ON public.premium_emails;
--    DROP POLICY IF EXISTS "Allow anon insert premium" ON public.premium_emails;
--    DROP POLICY IF EXISTS "Allow anon update premium" ON public.premium_emails;
--    DROP POLICY IF EXISTS "Allow anon delete premium" ON public.premium_emails;
--
--    DROP POLICY IF EXISTS "Allow anon select"         ON public.results;
--    DROP POLICY IF EXISTS "Allow anon insert"         ON public.results;
--    DROP POLICY IF EXISTS "Allow anon update results" ON public.results;
--
--    DROP POLICY IF EXISTS "Allow anon insert devices" ON public.premium_devices;
--    DROP POLICY IF EXISTS "anon_register"             ON public.premium_devices;
--
-- IF AFTER STAGE 2 SOMETHING BREAKS — emergency rollback (recreates
-- the wide-open policies):
--
--    CREATE POLICY "Allow anon select premium" ON public.premium_emails FOR SELECT TO anon, authenticated USING (true);
--    CREATE POLICY "Allow anon insert premium" ON public.premium_emails FOR INSERT TO anon, authenticated WITH CHECK (true);
--    CREATE POLICY "Allow anon update premium" ON public.premium_emails FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
--    CREATE POLICY "Allow anon delete premium" ON public.premium_emails FOR DELETE TO anon, authenticated USING (true);
--    CREATE POLICY "Allow anon select"         ON public.results        FOR SELECT TO anon, authenticated USING (true);
--    CREATE POLICY "Allow anon insert"         ON public.results        FOR INSERT TO anon, authenticated WITH CHECK (true);
--    CREATE POLICY "Allow anon update results" ON public.results        FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
-- =====================================================================
