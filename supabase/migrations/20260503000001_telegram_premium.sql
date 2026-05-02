-- Telegram-username-based premium grant
--
-- Phase 2 of the Telegram-login rollout: extends the existing premium_emails
-- table so admins can grant premium by Telegram username (not just email).
-- A premium row may now have:
--   * an email (for Google sign-in users)         — existing path
--   * a telegram_username (for Telegram-only)     — new path
--   * BOTH (a user who linked Google + Telegram)  — either matches
--
-- Revert:
--   ALTER TABLE public.premium_emails ALTER COLUMN email SET NOT NULL;
--   ALTER TABLE public.premium_emails DROP CONSTRAINT premium_emails_identity_required;
--   ALTER TABLE public.premium_emails DROP CONSTRAINT premium_emails_telegram_username_unique;
--   ALTER TABLE public.premium_emails DROP COLUMN telegram_username;
--   DROP FUNCTION public._jwt_telegram_username();
--   -- Re-create the original SELECT policy:
--   DROP POLICY rls_pe_select ON public.premium_emails;
--   CREATE POLICY rls_pe_select ON public.premium_emails FOR SELECT
--     USING ((lower(email) = _jwt_email()) OR _caller_is_admin());

-- 1. Email becomes nullable (so a row can be Telegram-only).
ALTER TABLE public.premium_emails ALTER COLUMN email DROP NOT NULL;

-- 2. Add telegram_username (no @ prefix), unique, nullable.
ALTER TABLE public.premium_emails ADD COLUMN IF NOT EXISTS telegram_username TEXT;

-- 3. Uniqueness so a Telegram username can only have one premium grant.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.premium_emails'::regclass
      AND conname  = 'premium_emails_telegram_username_unique'
  ) THEN
    ALTER TABLE public.premium_emails
      ADD CONSTRAINT premium_emails_telegram_username_unique UNIQUE (telegram_username);
  END IF;
END $$;

-- 4. Each row must identify the user by SOMETHING.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.premium_emails'::regclass
      AND conname  = 'premium_emails_identity_required'
  ) THEN
    ALTER TABLE public.premium_emails
      ADD CONSTRAINT premium_emails_identity_required
      CHECK (email IS NOT NULL OR telegram_username IS NOT NULL);
  END IF;
END $$;

-- 5. JWT helper — extracts telegram_username from user_metadata.
--    Mirrors the defensive structure of _jwt_email().
CREATE OR REPLACE FUNCTION public._jwt_telegram_username()
RETURNS TEXT
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path TO 'public'
SET row_security TO 'off'
AS $function$
DECLARE
  v_username text;
  v_claims   text;
BEGIN
  v_claims := nullif(current_setting('request.jwt.claims', true), '');
  IF v_claims IS NULL THEN
    RETURN NULL;
  END IF;
  BEGIN
    v_username := (v_claims::jsonb) -> 'user_metadata' ->> 'telegram_username';
  EXCEPTION WHEN others THEN
    RETURN NULL;
  END;
  IF v_username IS NULL OR v_username = '' THEN
    RETURN NULL;
  END IF;
  -- Strip leading @ just in case it was stored, then lowercase.
  v_username := lower(regexp_replace(v_username, '^@', ''));
  RETURN v_username;
END;
$function$;

-- 6. Replace SELECT RLS policy to also let Telegram users see their own row.
--    INSERT/UPDATE/DELETE policies remain admin-only — unchanged.
DROP POLICY IF EXISTS rls_pe_select ON public.premium_emails;
CREATE POLICY rls_pe_select ON public.premium_emails FOR SELECT
USING (
  (email IS NOT NULL AND lower(email) = _jwt_email())
  OR (telegram_username IS NOT NULL AND lower(telegram_username) = _jwt_telegram_username())
  OR _caller_is_admin()
);
