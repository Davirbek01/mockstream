-- Skill cards now count SUBMITTED mocks, like the Results Dashboard
-- ---------------------------------------------------------------------
-- The cards read "N taken today · M all-time" but counted mock_attempts —
-- rows written the moment a mock is OPENED. A student who opened one, saw the
-- access-code prompt and left counted as having taken it. On 9 Sep at bek the
-- card showed 446 writing "taken" against 106 actually submitted. Bekzod
-- reported the cards disagreeing with the dashboard; both were right, they
-- were counting different events.
--
-- mock_attempts also only ever covered the WEBSITE — premium-gate.js writes it
-- and the apps never load it — so app submissions were invisible to the cards
-- while the dashboard counted them. That is how some days showed MORE
-- submitted than "taken" (bek, 8 Sep listening: 145 opened, 172 submitted).
--
-- Both now read public.results: one row per finished, reported mock, whatever
-- platform produced it. Signature, defaults and column names are unchanged, so
-- no client deploy is needed. Verified for bek today: cards and dashboard
-- return identical numbers.
CREATE OR REPLACE FUNCTION public.mock_attempt_skill_summary(
  p_skill     TEXT,
  p_exam_type TEXT,
  p_center    TEXT DEFAULT NULL::text
)
RETURNS TABLE (today BIGINT, all_time BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    COUNT(*) FILTER (
      WHERE (created_at AT TIME ZONE 'Asia/Tashkent')::date
          = (now()      AT TIME ZONE 'Asia/Tashkent')::date
    ) AS today,
    COUNT(*) AS all_time
  FROM public.results
  WHERE skill     = p_skill
    AND exam_type = p_exam_type
    AND (
      -- the main site deliberately shows platform-wide totals
      p_center IS NULL
      OR p_center IN ('mock_stream','mockstream')
      OR center = p_center
    );
$function$;
