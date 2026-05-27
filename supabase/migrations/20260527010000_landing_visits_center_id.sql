-- Landing visits — per-clone tracking + admin stats RPC.
--
-- Adds a `center_id` column to landing_visits so we can break the
-- daily-visitors count down by clone in the admin panel. The user-
-- facing counter on landing-v3 still reads the total across all
-- clones — center_id is only for analytics. Existing rows from before
-- this migration will show as center_id IS NULL ("unknown") in the
-- admin breakdown until they age out.

ALTER TABLE public.landing_visits
  ADD COLUMN IF NOT EXISTS center_id text;

CREATE INDEX IF NOT EXISTS landing_visits_day_center_idx
  ON public.landing_visits (day, center_id);

-- Replace the upsert RPC: accepts optional p_center_id (defaults to NULL
-- so the legacy 1-arg call from the currently-deployed landing-v3.html
-- keeps working until clients pick up the new build).
DROP FUNCTION IF EXISTS public.landing_visit_today(text);

CREATE OR REPLACE FUNCTION public.landing_visit_today(
  p_visitor_id text,
  p_center_id  text DEFAULT NULL
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today_tz date;
  cnt      int;
  v_center text;
BEGIN
  IF p_visitor_id IS NULL
     OR length(p_visitor_id) = 0
     OR length(p_visitor_id) > 64 THEN
    RAISE EXCEPTION 'bad visitor_id';
  END IF;

  v_center := NULLIF(trim(coalesce(p_center_id, '')), '');
  IF v_center IS NOT NULL AND length(v_center) > 32 THEN
    v_center := substring(v_center FROM 1 FOR 32);
  END IF;

  today_tz := (now() AT TIME ZONE 'Asia/Tashkent')::date;

  -- First visit of the day for this visitor inserts with their center_id.
  -- Subsequent calls update center_id only if it was previously NULL —
  -- this lets a user who initially landed on (say) the main site and is
  -- then redirected to a clone keep the FIRST center attribution.
  INSERT INTO public.landing_visits (visitor_id, day, center_id)
  VALUES (p_visitor_id, today_tz, v_center)
  ON CONFLICT (visitor_id, day) DO UPDATE
    SET center_id = COALESCE(public.landing_visits.center_id, EXCLUDED.center_id);

  SELECT count(*) INTO cnt
  FROM public.landing_visits
  WHERE day = today_tz;

  RETURN cnt;
END;
$$;

GRANT EXECUTE ON FUNCTION public.landing_visit_today(text, text) TO anon, authenticated;

-- Admin-only stats RPC. Returns last N days of (day, center_id, visitors)
-- so the admin panel can chart trends and break down by clone.
CREATE OR REPLACE FUNCTION public.landing_visit_stats(p_days int DEFAULT 30)
RETURNS TABLE(day date, center_id text, visitors int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_any_admin() THEN
    RAISE EXCEPTION 'admin only';
  END IF;
  IF p_days IS NULL OR p_days < 1 THEN p_days := 30; END IF;
  IF p_days > 365 THEN p_days := 365; END IF;

  RETURN QUERY
  SELECT lv.day,
         lv.center_id,
         count(*)::int AS visitors
  FROM public.landing_visits lv
  WHERE lv.day >= ((now() AT TIME ZONE 'Asia/Tashkent')::date - (p_days - 1))
  GROUP BY lv.day, lv.center_id
  ORDER BY lv.day DESC, lv.center_id NULLS LAST;
END;
$$;

GRANT EXECUTE ON FUNCTION public.landing_visit_stats(int) TO authenticated;
