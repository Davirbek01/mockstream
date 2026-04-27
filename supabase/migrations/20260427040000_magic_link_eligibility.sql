-- =====================================================================
-- Gate magic-link sign-in to known premium / admin emails only.
--
-- Rationale: Supabase auth.signInWithOtp() is open to anyone — there's no
-- built-in allowlist. We want regular visitors to be limited to Google
-- sign-in (which they self-provision). Magic-link is a backup channel for
-- users who can't use Google (iCloud, no Gmail, etc.) — but only if their
-- email is already on the premium / admin list.
--
-- Approach: a SECURITY DEFINER RPC the browser calls BEFORE asking
-- Supabase to send the magic link. RLS-bypassed read of premium_emails
-- so anon callers can verify their own eligibility without the row being
-- exposed.
-- =====================================================================

CREATE OR REPLACE FUNCTION public._email_eligible_for_magic_link(p_email text)
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
  -- Hardcoded super-admin escape hatch (matches _caller_is_admin).
  IF lower(p_email) = 'davirbekkhasanov02@gmail.com' THEN
    RETURN true;
  END IF;
  SELECT count(*) INTO v_count
  FROM public.premium_emails
  WHERE lower(email) = lower(p_email)
    AND active = true;
  RETURN v_count > 0;
END;
$$;

REVOKE ALL ON FUNCTION public._email_eligible_for_magic_link(text) FROM public;
GRANT EXECUTE ON FUNCTION public._email_eligible_for_magic_link(text) TO anon, authenticated;
