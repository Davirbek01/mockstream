-- =====================================================================
-- Admin Lockdown — RLS for premium_emails and site_settings.
-- After this migration:
--   * Anyone can still READ site_settings (needed for public pages).
--   * site_settings WRITE (add centers, change configs, AI routing,
--     etc.) → SUPER-ADMIN ONLY.
--       Super-admin = admin with empty/NULL center.
--   * premium_emails:
--       - Super-admin: full read/write on any row.
--       - Center admin (role='admin' + specific center): may read the
--         full list AND add/update/delete ONLY `user` rows scoped to
--         their own center. They CANNOT create or modify admin rows.
--       - Regular user (role='user'): read only their own row.
--   * Adding new centers, changing AI routing, global settings, etc.
--     remain super-admin only.
--
-- PREREQUISITE: at least ONE super-admin row must exist in
-- premium_emails BEFORE you run this (otherwise you lock yourself out).
--   INSERT INTO premium_emails (email, role, tier, center, active)
--   VALUES ('you@example.com', 'admin', 'premium', '', true);
--
-- Run in: Supabase Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Helper: current_admin_center()
--   Returns the caller's admin center from premium_emails.
--     ''     → super-admin (global)
--     'bek'  → center admin for bek
--     NULL   → not an admin (RLS will deny)
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


-- ---------------------------------------------------------------------
-- premium_emails — lock down.
-- Reads : admins (any kind) can read the full list; regular users can
--         read only their own row.
-- Writes:
--   * Super-admin → any row.
--   * Center admin → only rows where role='user' AND center=own center.
--   * Everyone else → denied.
-- ---------------------------------------------------------------------
ALTER TABLE public.premium_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pe_read_self_or_admin"    ON public.premium_emails;
DROP POLICY IF EXISTS "pe_read_admins"           ON public.premium_emails;
DROP POLICY IF EXISTS "pe_write_super_admin_ins" ON public.premium_emails;
DROP POLICY IF EXISTS "pe_write_super_admin_upd" ON public.premium_emails;
DROP POLICY IF EXISTS "pe_write_super_admin_del" ON public.premium_emails;
DROP POLICY IF EXISTS "pe_write_ins"             ON public.premium_emails;
DROP POLICY IF EXISTS "pe_write_upd"             ON public.premium_emails;
DROP POLICY IF EXISTS "pe_write_del"             ON public.premium_emails;

CREATE POLICY "pe_read_self_or_admin"
  ON public.premium_emails FOR SELECT
  TO anon, authenticated
  USING (
    -- self-lookup by email
    lower(email) = lower(COALESCE(
      nullif(current_setting('request.jwt.claim.email', true), ''),
      (current_setting('request.jwt.claims', true)::jsonb ->> 'email')
    ))
    -- or the caller is an admin of any kind
    OR public.current_admin_center() IS NOT NULL
  );

CREATE POLICY "pe_write_ins"
  ON public.premium_emails FOR INSERT
  TO authenticated
  WITH CHECK (
    public.current_admin_center() = ''                          -- super-admin: any row
    OR (
      public.current_admin_center() IS NOT NULL                 -- center admin:
      AND role   = 'user'                                       --   user rows only
      AND center = public.current_admin_center()                --   own center only
    )
  );

CREATE POLICY "pe_write_upd"
  ON public.premium_emails FOR UPDATE
  TO authenticated
  USING (
    public.current_admin_center() = ''
    OR (
      public.current_admin_center() IS NOT NULL
      AND role   = 'user'
      AND center = public.current_admin_center()
    )
  )
  WITH CHECK (
    public.current_admin_center() = ''
    OR (
      public.current_admin_center() IS NOT NULL
      AND role   = 'user'
      AND center = public.current_admin_center()
    )
  );

CREATE POLICY "pe_write_del"
  ON public.premium_emails FOR DELETE
  TO authenticated
  USING (
    public.current_admin_center() = ''
    OR (
      public.current_admin_center() IS NOT NULL
      AND role   = 'user'
      AND center = public.current_admin_center()
    )
  );


-- ---------------------------------------------------------------------
-- site_settings — public read, SUPER-ADMIN ONLY write.
-- (Center admins cannot change any site setting, including their own
-- center's config.  Adding new centers is super-admin only.)
-- ---------------------------------------------------------------------
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ss_read_public"   ON public.site_settings;
DROP POLICY IF EXISTS "ss_write_ins"     ON public.site_settings;
DROP POLICY IF EXISTS "ss_write_upd"     ON public.site_settings;
DROP POLICY IF EXISTS "ss_write_del"     ON public.site_settings;

CREATE POLICY "ss_read_public"
  ON public.site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "ss_write_ins"
  ON public.site_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.current_admin_center() = '');

CREATE POLICY "ss_write_upd"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING       (public.current_admin_center() = '')
  WITH CHECK  (public.current_admin_center() = '');

CREATE POLICY "ss_write_del"
  ON public.site_settings FOR DELETE
  TO authenticated
  USING (public.current_admin_center() = '');
