-- =====================================================================
-- The apps could never write a mock_attempts row
-- ---------------------------------------------------------------------
-- mock_attempts had exactly three write policies, all of them TO anon:
-- insert, and the update that stamps submitted_at. The websites use the
-- anon key for these writes even for a signed-in student, so they were
-- fine. The mobile apps use supabase-js with the student's own JWT, which
-- makes them role `authenticated` — and there was no policy for that role,
-- so every insert was refused by RLS and swallowed by the best-effort
-- catch in mockAttempts.ts.
--
-- Consequence, measured on `record` 2026-09-10: three CEFR Reading mocks
-- submitted from the Android app at 05:39 produced three `results` rows
-- and ZERO `mock_attempts` rows. The per-account limit counts
-- mock_attempts, so app work used up no allowance at all — the student
-- could sit mock after mock in the app and never be stopped.
--
-- Same permissions as anon already has. This grants the apps nothing the
-- websites could not already do with the publishable key.
-- =====================================================================

DROP POLICY IF EXISTS "authenticated insert mock_attempts" ON public.mock_attempts;
CREATE POLICY "authenticated insert mock_attempts"
  ON public.mock_attempts FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated update mock_attempts submitted_at" ON public.mock_attempts;
CREATE POLICY "authenticated update mock_attempts submitted_at"
  ON public.mock_attempts FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);
