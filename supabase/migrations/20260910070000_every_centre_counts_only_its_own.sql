-- Every centre counts only its own students — the main site included
-- ---------------------------------------------------------------------
-- Both card RPCs carried an exception that made mock-stream.com show the sum
-- of all seven centres: `p_center IN ('mock_stream','mockstream')` fell
-- through to no centre filter at all. The main site advertised 53,533 speaking
-- when 3,609 were its own; the rest belonged to Bekzod, Abror and the others.
-- The Results Dashboard has always been per-centre, so the cards disagreed
-- with it on the main site even after they started reading the same table.
CREATE OR REPLACE FUNCTION public.mock_attempt_skill_summary(
  p_skill TEXT, p_exam_type TEXT, p_center TEXT DEFAULT NULL::text
)
RETURNS TABLE (today BIGINT, all_time BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT
    COUNT(*) FILTER (
      WHERE (created_at AT TIME ZONE 'Asia/Tashkent')::date
          = (now()      AT TIME ZONE 'Asia/Tashkent')::date
    ) AS today,
    COUNT(*) AS all_time
  FROM public.results
  WHERE skill = p_skill
    AND exam_type = p_exam_type
    -- 'mockstream' is a legacy spelling of the same centre; both must match.
    AND (p_center IS NULL
         OR (p_center IN ('mock_stream','mockstream')
             AND center IN ('mock_stream','mockstream'))
         OR center = p_center);
$function$;

CREATE OR REPLACE FUNCTION public.full_mock_summary(p_center TEXT DEFAULT NULL::text)
RETURNS TABLE (all_time BIGINT, today BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT
    COUNT(*) AS all_time,
    COUNT(*) FILTER (
      WHERE (created_at AT TIME ZONE 'Asia/Tashkent')::date
          = (now()      AT TIME ZONE 'Asia/Tashkent')::date
    ) AS today
  FROM public.results
  WHERE skill = 'full-mock'
    AND (p_center IS NULL
         OR (p_center IN ('mock_stream','mockstream')
             AND center IN ('mock_stream','mockstream'))
         OR center = p_center);
$function$;
