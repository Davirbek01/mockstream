-- =====================================================================
-- A submitted result stamps its own attempt row
-- ---------------------------------------------------------------------
-- The limit counts a mock as SPENT when its attempt row carries a
-- submitted_at. Twelve exam pages call PremiumGate.recordOpen; only three
-- (IELTS reading, and the two full mocks) ever called recordSubmit. The
-- mobile app had a recordMockSubmit() that nothing invoked. Measured
-- platform-wide on 2026-09-10: 12 of 176 attempts in six hours were
-- stamped — 7%.
--
-- Everything else fell back to the two softer rules ("older than 30
-- minutes" / "not the mock in progress"), which is exactly the one-mock
-- lag the centre reported: with a limit of 1 a student submitted two
-- Readings and was only stopped on the third, because the second was
-- still, as far as the table knew, in progress.
--
-- Doing it in the database rather than in each client fixes all three
-- platforms at once, needs no OTA and no site deploy, and cannot drift
-- again when a new exam page is added: a row in `results` IS the
-- submission, so that is where the stamp belongs.
--
-- Deliberately narrow:
--   • only 'Mock NN' — practice passages and Writing Plus are not mocks
--     and must not eat an allowance;
--   • only an attempt opened in the last 12 hours, never already stamped;
--   • the most recent matching open attempt, one row;
--   • any failure is swallowed — a statistics stamp must never be able to
--     reject a student's result.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.stamp_mock_attempt_on_result()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
  v_skill TEXT;
  v_mock  INTEGER;
  v_hit   TEXT[];
BEGIN
  v_email := lower(trim(COALESCE(NEW.user_email, '')));
  IF v_email = '' OR COALESCE(NEW.center, '') = '' THEN
    RETURN NEW;
  END IF;

  IF NEW.skill = 'full-mock' THEN
    -- Both full-mock pages record their open as mock_number 1.
    v_skill := 'full_mock';
    v_mock  := 1;
  ELSIF NEW.skill IN ('reading', 'listening', 'writing', 'speaking') THEN
    v_hit := regexp_match(COALESCE(NEW.mock_number, ''), '^\s*Mock\s+0*(\d+)\s*$');
    IF v_hit IS NULL THEN
      RETURN NEW;   -- practice / plus / anything else: not a mock
    END IF;
    v_skill := NEW.skill;
    v_mock  := v_hit[1]::INTEGER;
  ELSE
    RETURN NEW;
  END IF;

  UPDATE public.mock_attempts
     SET submitted_at = COALESCE(NEW.created_at, now())
   WHERE id = (
     SELECT id
       FROM public.mock_attempts
      WHERE user_email  = v_email
        AND center      = NEW.center
        AND skill       = v_skill
        AND mock_number = v_mock
        AND submitted_at IS NULL
        AND opened_at >= now() - INTERVAL '12 hours'
        AND opened_at <= now() + INTERVAL '1 minute'
      ORDER BY opened_at DESC
      LIMIT 1
   );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_stamp_mock_attempt_on_result ON public.results;
CREATE TRIGGER trg_stamp_mock_attempt_on_result
  AFTER INSERT ON public.results
  FOR EACH ROW
  EXECUTE FUNCTION public.stamp_mock_attempt_on_result();
