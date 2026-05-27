-- Landing visits daily counter (Tashkent timezone)
--
-- Powers the "N visitors today" badge on landing-v3.html. Each landing
-- visit fires the RPC `landing_visit_today(visitor_id)` with a
-- localStorage UUID; the function upserts a row keyed on
-- (visitor_id, day) where `day` is computed in Asia/Tashkent, then
-- returns the total distinct visitor count for that day. Day rolls
-- over at Tashkent midnight (UTC+5).
--
-- The table is locked behind RLS — anon and authenticated roles never
-- touch it directly; only the SECURITY DEFINER function below.

CREATE TABLE IF NOT EXISTS public.landing_visits (
  visitor_id text NOT NULL,
  day        date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (visitor_id, day)
);

CREATE INDEX IF NOT EXISTS landing_visits_day_idx ON public.landing_visits (day);

ALTER TABLE public.landing_visits ENABLE ROW LEVEL SECURITY;
-- No policies = no direct access. RPC below is the only path.

CREATE OR REPLACE FUNCTION public.landing_visit_today(p_visitor_id text)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today_tz date;
  cnt      int;
BEGIN
  -- Reject obviously bad / oversize ids to keep storage bounded.
  IF p_visitor_id IS NULL
     OR length(p_visitor_id) = 0
     OR length(p_visitor_id) > 64 THEN
    RAISE EXCEPTION 'bad visitor_id';
  END IF;

  today_tz := (now() AT TIME ZONE 'Asia/Tashkent')::date;

  INSERT INTO public.landing_visits (visitor_id, day)
  VALUES (p_visitor_id, today_tz)
  ON CONFLICT (visitor_id, day) DO NOTHING;

  SELECT count(*) INTO cnt
  FROM public.landing_visits
  WHERE day = today_tz;

  RETURN cnt;
END;
$$;

GRANT EXECUTE ON FUNCTION public.landing_visit_today(text) TO anon, authenticated;
