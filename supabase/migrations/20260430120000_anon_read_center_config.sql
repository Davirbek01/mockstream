-- =====================================================================
-- anon_read_whitelist: add center_config_* to readable keys
-- ---------------------------------------------------------------------
-- Why:
--   Clone sites (bekzodsmultilevel.com, muzaffars-english.netlify.app, etc.)
--   anon-fetch `center_config_<centerId>` from site_settings on every page
--   load to apply per-center settings (Global Access, branding, AI provider,
--   mock gating, etc.). The previous whitelist included `center_site_config_%`
--   but not `center_config_%`, so super-admin saves on the main site landed
--   in the DB but were invisible to the clones — they fell back to defaults
--   and kept asking students for access codes despite the admin's overrides.
--
--   `center_site_config_%` (already whitelisted) and `center_config_%` carry
--   the same kind of non-sensitive per-center config; this migration brings
--   them to parity.
--
-- Effect:
--   - Anon callers can now SELECT rows whose key starts with `center_config_`.
--   - Authenticated admin writes are unchanged (admin_all policy).
--   - No other tables are affected.
-- =====================================================================

DROP POLICY IF EXISTS "anon_read_whitelist" ON public.site_settings;

CREATE POLICY "anon_read_whitelist"
  ON public.site_settings FOR SELECT
  TO anon
  USING (
    key LIKE 'hc\_%' ESCAPE '\' OR
    key LIKE 'scoring\_%' ESCAPE '\' OR
    key LIKE 'center\_site\_config\_%' ESCAPE '\' OR
    key LIKE 'center\_config\_%' ESCAPE '\' OR
    key LIKE 'video\_guides%' ESCAPE '\' OR
    key LIKE 'ai\_prompt\_%' ESCAPE '\' OR
    key = ANY (ARRAY['global_message','brand_name','logo_url','footer_text'])
  );
