-- =====================================================================
-- Addresses Resend will never deliver to again.
--
-- One bounce puts an address on Resend's suppression list permanently.
-- Until now nothing on our side knew that had happened: the student typed
-- the same address again, saw "Sign-in code sent. Check your inbox.", and
-- waited for a code that could not arrive. On 2026-09-24 one person tried
-- twice with the digits of her own name reordered — both bounced, both
-- silently dead.
--
-- So we keep our own copy of the list and tell her, at the moment she asks,
-- that this address cannot receive our mail and Google / Telegram will work.
--
-- Filled from two directions: the daily digest already walks Resend's event
-- list (daily-health-check/resendDay.ts), and the resend-webhook function
-- records a bounce the moment it happens.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.suppressed_emails (
  email       text PRIMARY KEY,
  reason      text NOT NULL DEFAULT 'bounced',   -- bounced | complained
  first_seen  timestamptz NOT NULL DEFAULT now(),
  last_seen   timestamptz NOT NULL DEFAULT now(),
  hits        int NOT NULL DEFAULT 1
);

COMMENT ON TABLE public.suppressed_emails IS
  'Addresses Resend has permanently suppressed. Read by _email_is_suppressed at sign-in.';

ALTER TABLE public.suppressed_emails ENABLE ROW LEVEL SECURITY;
-- No policies: nothing reaches this table directly. The RPC below is the
-- only way in, and it answers about ONE address the caller already typed —
-- so the list itself can never be enumerated.

/**
 * True when we know mail to this address bounced. Deliberately narrow: the
 * caller has to name the address, so this cannot be used to read the list.
 */
CREATE OR REPLACE FUNCTION public._email_is_suppressed(p_email text)
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
  FROM public.suppressed_emails
  WHERE email = lower(trim(p_email));
  RETURN v_count > 0;
END;
$$;

REVOKE ALL ON FUNCTION public._email_is_suppressed(text) FROM public;
GRANT EXECUTE ON FUNCTION public._email_is_suppressed(text) TO anon, authenticated;

/**
 * Record a bounce. Called by the watchers with the service role, never from
 * a browser — re-recording the same address bumps the counter rather than
 * losing when it was first seen.
 */
CREATE OR REPLACE FUNCTION public._record_suppressed_email(p_email text, p_reason text DEFAULT 'bounced')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_email IS NULL OR trim(p_email) = '' THEN
    RETURN;
  END IF;
  INSERT INTO public.suppressed_emails (email, reason)
  VALUES (lower(trim(p_email)), coalesce(nullif(trim(p_reason), ''), 'bounced'))
  ON CONFLICT (email) DO UPDATE
    SET last_seen = now(),
        hits      = public.suppressed_emails.hits + 1,
        reason    = EXCLUDED.reason;
END;
$$;

REVOKE ALL ON FUNCTION public._record_suppressed_email(text, text) FROM public;
GRANT EXECUTE ON FUNCTION public._record_suppressed_email(text, text) TO service_role;
