-- Hero tiles count submitted mocks, from every platform
-- ---------------------------------------------------------------------
-- The three landing tiles ("163,281 attempts all-time", "18 attempts today")
-- were the last surface still counting mock_attempts — rows written when a
-- mock is OPENED, and written only by the website and the desktop app. The
-- mobile app writes none, so everything students did on phones was missing
-- from the headline number while the Results Dashboard counted it in full.
-- At mock_stream that was 5,549 of 10,984 results — over half the centre's
-- work, invisible.
--
-- Now reads public.results, per centre, like every other surface. Includes
-- full-mock rows: sitting all four skills in sequence is an attempt like any
-- other. Signature and column names unchanged, so no client deploy.
--
-- Verified: the hero number now equals the sum of the four skill cards plus
-- the full-mock card exactly, for every centre.
CREATE OR REPLACE FUNCTION public.mock_attempt_summary(
  p_center TEXT DEFAULT NULL::text
)
RETURNS TABLE (all_time BIGINT, today BIGINT, last7 BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    COUNT(*) AS all_time,
    COUNT(*) FILTER (
      WHERE (created_at AT TIME ZONE 'Asia/Tashkent')::date
          = (now()      AT TIME ZONE 'Asia/Tashkent')::date
    ) AS today,
    COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days') AS last7
  FROM public.results
  WHERE (p_center IS NULL
         OR (p_center IN ('mock_stream','mockstream')
             AND center IN ('mock_stream','mockstream'))
         OR center = p_center);
$function$;
