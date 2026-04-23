# Admin Lockdown — Deploy Guide (step-by-step)

Goal: stop attackers from inserting themselves into `premium_emails` and
from writing `site_settings` directly. After this change, only a
Supabase-Auth-logged-in admin (email listed in `premium_emails` with
`role='admin'` and `active=true`) can write.

Pairs with: `DEPLOY_AI_PROXY.md`. Do the AI proxy first; do this second.

---

## Part 1 — Prepare your super-admin row (DO NOT SKIP)

Before turning on RLS you must have at least ONE super-admin in
`premium_emails` or you will lock yourself out.

In SQL Editor:

    -- Check what exists today
    SELECT id, email, role, center, active FROM premium_emails
    WHERE role = 'admin';

    -- If there's no row with role='admin' AND (center='' OR center IS NULL),
    -- add yourself as super-admin:
    INSERT INTO premium_emails (email, role, tier, center, active)
    VALUES ('YOUR_EMAIL_HERE@example.com', 'admin', 'premium', '', true);

Use the same email you can receive mail at — the magic link will go there.

---

## Part 2 — Enable Supabase Auth email login (one-time)

1. Supabase Dashboard → **Authentication → Providers → Email**.
2. Make sure **Enable Email provider** is ON.
3. Enable **Email OTP** (magic link). Disable "Confirm email" ONLY if
   you want first-time sign-in without confirmation; otherwise leave it.
4. Under **URL Configuration** → add your site URLs to **Redirect URLs**:
   - `https://mock-stream.com`
   - `https://mock-stream.com/results/`
   - Any clone site domains you use.

---

## Part 3 — Run the RLS migration

1. SQL Editor → New query.
2. Paste the contents of
   `supabase/migrations/20260423010000_admin_lockdown.sql`.
3. Run.

Verify:

    -- Should show RLS enabled:
    SELECT relname, relrowsecurity
    FROM pg_class
    WHERE relname IN ('premium_emails', 'site_settings');

    -- Should list the new policies:
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE tablename IN ('premium_emails', 'site_settings')
    ORDER BY tablename, policyname;

---

## Part 4 — Add the admin-auth helper to pages with admin UI

Pages that save to `site_settings` / `premium_emails` today:

- `site/results/index.html`   (premium menu + Center Hub)
- `site/landing.html`         (AI Router panel + Scoring Providers panel)

In the `<head>` of each, add:

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
    <script src="/admin-auth.js"></script>

---

## Part 5 — Replace anon-key writes with authed writes

Every save/edit/delete call that currently uses `SUPABASE_ANON_KEY`
must be replaced. Pattern:

BEFORE:

    await fetch(SUPABASE_URL + '/rest/v1/site_settings?key=eq.' + k, {
      method: 'PATCH',
      headers: {
        'apikey':        SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Content-Type':  'application/json',
        'Prefer':        'return=minimal'
      },
      body: JSON.stringify({ value: newValue })
    });

AFTER:

    await window.AdminAuth.requireLogin();
    await window.AdminAuth.fetch('/rest/v1/site_settings?key=eq.' + k, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ value: newValue })
    });

Do this in these functions (found during our audit):

- `results/index.html` → `addPremiumEmail`, `togglePremium`,
  `deletePremium`, `saveCenterConfig`, `_cmSaveAll`, `upsertSetting`.
- `landing.html` → `_spUpsertSetting`, `setAiRoutingModeForCenter`,
  video-guides save, global-message save.

Reads used only for rendering can keep using the anon key — `site_settings`
SELECT is still public.

---

## Part 6 — First-run test

1. Open the results dashboard admin page.
2. Click "Add admin email" (or the Center Hub save button).
3. The login modal opens. Enter your super-admin email.
4. Check your inbox → click the magic link → returns to the page logged in.
5. Try the save again → it should now succeed.
6. Open an **incognito** tab WITHOUT logging in → try to POST to
   `site_settings` using DevTools → should get `401` / `42501` RLS error.

---

## Part 7 — Managing roles day to day

- **Super-admin** = row in `premium_emails` with `role='admin'` and
  `center` empty/NULL. Can write anything.
- **Center admin** = row with `role='admin'` and `center='bek'`
  (or any testId). Can write only keys for that center.
- Add/remove admins from the Premium Menu as before. After the
  migration, that save requires super-admin login.

---

## Part 8 — Rollback (emergency)

If something breaks and you need to restore the old behaviour quickly:

    ALTER TABLE public.site_settings  DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.premium_emails DISABLE ROW LEVEL SECURITY;

Then debug and re-enable when ready.
