-- Claim a guest's history when they finally sign in
-- ---------------------------------------------------------------------
-- Guest rows live in results with user_email IS NULL and the device's id.
-- Removing guest mode from the apps would otherwise strand that history: the
-- student signs in and their past mocks vanish, which is the one thing that
-- must not happen when you take a door away. 69,542 such rows exist today.
--
-- The email is taken from the CALLER'S OWN JWT, never from an argument, so a
-- signed-in user can only ever claim rows to themselves. Only unclaimed rows
-- (user_email IS NULL) on the device ids they pass are touched — a row that
-- already belongs to an account is never reassigned.
CREATE OR REPLACE FUNCTION public.claim_guest_results(p_device_ids TEXT[])
RETURNS INTEGER
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_email TEXT;
  v_count INTEGER;
BEGIN
  v_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  IF v_email = '' THEN
    RETURN 0;                      -- not signed in: nothing to claim to
  END IF;
  IF p_device_ids IS NULL OR array_length(p_device_ids, 1) IS NULL THEN
    RETURN 0;
  END IF;

  UPDATE public.results
     SET user_email = v_email
   WHERE user_email IS NULL
     AND device_id = ANY (p_device_ids);
  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- The same for attempt rows, so the student's limit allowance and the
  -- per-mock badges follow them into the account too.
  UPDATE public.mock_attempts
     SET user_email = v_email
   WHERE user_email IS NULL
     AND device_id = ANY (p_device_ids);

  RETURN v_count;
END;
$function$;

REVOKE ALL ON FUNCTION public.claim_guest_results(TEXT[]) FROM PUBLIC;
-- REVOKE FROM PUBLIC is not enough: Supabase's default privileges grant
-- EXECUTE to anon and authenticated directly. The function is already safe
-- without a JWT (returns 0, touches nothing), but anon has no business here.
REVOKE EXECUTE ON FUNCTION public.claim_guest_results(TEXT[]) FROM anon;
GRANT  EXECUTE ON FUNCTION public.claim_guest_results(TEXT[]) TO authenticated;
