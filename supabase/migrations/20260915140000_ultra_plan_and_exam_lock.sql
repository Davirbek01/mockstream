-- ============================================================================
-- Ultra plan + one exam at a time for Premium accounts
-- ----------------------------------------------------------------------------
-- ULTRA (Mock Stream + Record only, never advertised): a premium account with
-- no per-student limits and no single-exam lock. Stored as a separate `plan`
-- column, NOT as tier='ultra': ~65 places across the site, both apps and the
-- functions test tier === 'premium' for AI features, and every one of them
-- would silently take AI away from an Ultra account. An Ultra row keeps
-- tier='premium', so all of that keeps working untouched.
--
-- SINGLE-EXAM LOCK (every centre, Premium accounts only — not Ultra, not
-- admins, not code users): while an exam or practice runs on one device, a
-- second device is told which device holds it. It can ask to take over; the
-- holding device must approve, unless it has been idle for 5 minutes and does
-- not answer within 60 seconds (a forgotten open tab must not trap anybody).
--
-- A session is live while its device keeps sending heartbeats. Browsers slow
-- background timers to once a minute, so a session is only considered gone
-- 150 s after its last heartbeat — 2 missed minute-ticks plus slack.
--
-- All tables here are service-role only (RLS on, no policies). The only
-- caller is the exam-session Edge Function, which resolves the account from
-- the caller's JWT — a client-supplied identity could lock someone else out.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. premium_emails.plan
-- ---------------------------------------------------------------------------
ALTER TABLE public.premium_emails
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'premium';

ALTER TABLE public.premium_emails
  DROP CONSTRAINT IF EXISTS premium_emails_plan_check;
ALTER TABLE public.premium_emails
  ADD CONSTRAINT premium_emails_plan_check CHECK (plan IN ('premium', 'ultra'));

-- Ultra exists on Mock Stream and Record only. '' is a grant for every centre,
-- which a super-admin may give; the functions still honour it only on those two.
ALTER TABLE public.premium_emails
  DROP CONSTRAINT IF EXISTS premium_emails_ultra_centres;
ALTER TABLE public.premium_emails
  ADD CONSTRAINT premium_emails_ultra_centres CHECK (
    plan <> 'ultra'
    OR lower(btrim(coalesce(center, ''))) IN ('', 'mock_stream', 'mockstream', 'record')
  );

COMMENT ON COLUMN public.premium_emails.plan IS
  'premium | ultra. Ultra = no per-student limits and no single-exam lock; Mock Stream + Record only. tier stays premium for AI features.';

-- ---------------------------------------------------------------------------
-- 2. account_access — what one signed-in account is on one centre
-- ---------------------------------------------------------------------------
-- Returns admin | ultra | premium, or no row. Matches the way auth.js and the
-- apps grant premium: by email, by Telegram @username, or by the Telegram id
-- inside a synthetic tg_<id>@… address (61% of premium accounts sign in with
-- Telegram). A row whose centre is '' applies to every centre.
CREATE OR REPLACE FUNCTION public.account_access(p_email text, p_telegram text, p_center text)
RETURNS TABLE(kind text, ident text, expires_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH m AS (
    SELECT pe.*,
      coalesce(nullif(lower(pe.email), ''),
               nullif(lower(ltrim(pe.telegram_username, '@')), ''),
               'tg:' || pe.telegram_id) AS row_ident
    FROM premium_emails pe
    WHERE pe.active = true
      AND (pe.role = 'admin' OR pe.expires_at IS NULL OR pe.expires_at > now())
      AND (btrim(coalesce(pe.center, '')) = '' OR _norm_center(pe.center) = _norm_center(p_center))
      AND (
        (coalesce(btrim(p_email), '') <> '' AND lower(pe.email) = lower(btrim(p_email)))
        OR (coalesce(btrim(p_telegram), '') <> ''
            AND lower(ltrim(pe.telegram_username, '@')) = lower(ltrim(btrim(p_telegram), '@')))
        OR (pe.telegram_id IS NOT NULL
            AND (regexp_match(coalesce(p_email, ''), '^tg_(\d+)@'))[1] IS NOT NULL
            AND pe.telegram_id = (regexp_match(coalesce(p_email, ''), '^tg_(\d+)@'))[1]::bigint)
      )
  ), k AS (
    SELECT
      CASE
        WHEN role = 'admin' THEN 'admin'
        WHEN tier = 'premium' AND plan = 'ultra'
             AND _norm_center(p_center) IN ('mockstream', 'record') THEN 'ultra'
        WHEN tier = 'premium' THEN 'premium'
      END AS kind,
      row_ident AS ident,
      m.expires_at
    FROM m
  )
  SELECT kind, ident, expires_at FROM k
  WHERE kind IS NOT NULL
  ORDER BY CASE kind WHEN 'admin' THEN 0 WHEN 'ultra' THEN 1 ELSE 2 END
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.account_access(text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.account_access(text, text, text) TO service_role;

-- ---------------------------------------------------------------------------
-- 3. Tables
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ident           text NOT NULL,
  center_id       text NOT NULL,
  device_key      text NOT NULL,
  platform        text NOT NULL DEFAULT 'web',
  device_label    text,
  ip              text,
  country         text,
  exam_key        text,
  exam_label      text,
  is_practice     boolean NOT NULL DEFAULT false,
  started_at      timestamptz NOT NULL DEFAULT now(),
  last_seen_at    timestamptz NOT NULL DEFAULT now(),
  -- last real interaction (tap, key, scroll, audio playing, recording)
  last_active_at  timestamptz NOT NULL DEFAULT now(),
  ended_at        timestamptz,
  end_reason      text CHECK (end_reason IN ('submitted', 'closed', 'taken_over', 'replaced', 'expired'))
);
CREATE INDEX IF NOT EXISTS exam_sessions_live_idx
  ON public.exam_sessions (ident, center_id) WHERE ended_at IS NULL;
CREATE INDEX IF NOT EXISTS exam_sessions_started_idx ON public.exam_sessions (started_at);
ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.exam_takeover_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      uuid NOT NULL REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
  ident           text NOT NULL,
  center_id       text NOT NULL,
  device_key      text NOT NULL,
  platform        text,
  device_label    text,
  ip              text,
  country         text,
  exam_key        text,
  exam_label      text,
  is_practice     boolean NOT NULL DEFAULT false,
  requested_at    timestamptz NOT NULL DEFAULT now(),
  seen_at         timestamptz,
  status          text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'denied', 'auto_approved', 'no_answer', 'released')),
  decided_at      timestamptz,
  new_session_id  uuid REFERENCES public.exam_sessions(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS exam_takeover_session_idx ON public.exam_takeover_requests (session_id) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS exam_takeover_device_idx ON public.exam_takeover_requests (device_key, requested_at DESC);
ALTER TABLE public.exam_takeover_requests ENABLE ROW LEVEL SECURITY;

-- One row per thing worth counting in the 08:00 report.
CREATE TABLE IF NOT EXISTS public.exam_lock_events (
  id         bigserial PRIMARY KEY,
  at         timestamptz NOT NULL DEFAULT now(),
  ident      text NOT NULL,
  center_id  text NOT NULL,
  kind       text NOT NULL CHECK (kind IN ('blocked', 'requested', 'approved', 'denied', 'auto_approved', 'no_answer', 'released')),
  detail     jsonb
);
CREATE INDEX IF NOT EXISTS exam_lock_events_at_idx ON public.exam_lock_events (at);
ALTER TABLE public.exam_lock_events ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 4. Helpers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public._exam_lock_key(p_ident text, p_center text)
RETURNS bigint LANGUAGE sql IMMUTABLE AS $$
  SELECT hashtextextended('exam_lock:' || p_ident || '|' || p_center, 0)
$$;

-- Ends sessions that stopped sending heartbeats. Called inside every entry
-- point, under the account's advisory lock, so nothing reads a stale holder.
CREATE OR REPLACE FUNCTION public._exam_expire(p_ident text, p_center text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE exam_sessions
     SET ended_at = last_seen_at, end_reason = 'expired'
   WHERE ident = p_ident AND center_id = p_center
     AND ended_at IS NULL
     AND last_seen_at < now() - interval '150 seconds'
$$;

CREATE OR REPLACE FUNCTION public._exam_session_json(s public.exam_sessions)
RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
  SELECT jsonb_build_object(
    'platform',     s.platform,
    'device_label', s.device_label,
    'ip',           s.ip,
    'country',      s.country,
    'exam_label',   s.exam_label,
    'is_practice',  s.is_practice,
    'started_at',   s.started_at
  )
$$;

CREATE OR REPLACE FUNCTION public._exam_new_session(
  p_ident text, p_center text, p_device_key text, p_platform text, p_label text,
  p_ip text, p_country text, p_exam_key text, p_exam_label text, p_practice boolean)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid;
BEGIN
  -- The same device reopening (reload, next mock) replaces its own session.
  UPDATE exam_sessions SET ended_at = now(), end_reason = 'replaced'
   WHERE ident = p_ident AND center_id = p_center
     AND device_key = p_device_key AND ended_at IS NULL;
  INSERT INTO exam_sessions (ident, center_id, device_key, platform, device_label, ip, country,
                             exam_key, exam_label, is_practice)
  VALUES (p_ident, p_center, p_device_key, coalesce(p_platform, 'web'), left(p_label, 80),
          left(p_ip, 64), left(p_country, 8), left(p_exam_key, 120), left(p_exam_label, 120),
          coalesce(p_practice, false))
  RETURNING id INTO v_id;
  RETURN v_id;
END $$;

-- Decide a pending request whose holder is gone, or whose 60 s ran out.
-- Returns the request's (possibly new) status.
CREATE OR REPLACE FUNCTION public._exam_resolve_request(p_request_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r exam_takeover_requests;
  h exam_sessions;
  v_new uuid;
BEGIN
  SELECT * INTO r FROM exam_takeover_requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND THEN RETURN NULL; END IF;

  -- Approved by the holder: the requester's session is created on its next poll.
  IF r.status IN ('approved', 'auto_approved', 'released') AND r.new_session_id IS NULL THEN
    v_new := _exam_new_session(r.ident, r.center_id, r.device_key, r.platform, r.device_label,
                               r.ip, r.country, r.exam_key, r.exam_label, r.is_practice);
    UPDATE exam_takeover_requests SET new_session_id = v_new WHERE id = r.id;
    RETURN r.status;
  END IF;
  IF r.status <> 'pending' THEN RETURN r.status; END IF;

  SELECT * INTO h FROM exam_sessions WHERE id = r.session_id;

  -- The holder finished, closed or went silent: nothing to take over.
  IF h.ended_at IS NOT NULL THEN
    v_new := _exam_new_session(r.ident, r.center_id, r.device_key, r.platform, r.device_label,
                               r.ip, r.country, r.exam_key, r.exam_label, r.is_practice);
    UPDATE exam_takeover_requests
       SET status = 'released', decided_at = now(), new_session_id = v_new WHERE id = r.id;
    INSERT INTO exam_lock_events (ident, center_id, kind) VALUES (r.ident, r.center_id, 'released');
    RETURN 'released';
  END IF;

  IF r.requested_at > now() - interval '60 seconds' THEN RETURN 'pending'; END IF;

  -- 60 s without an answer. An idle holder (nothing for 5 minutes) is a
  -- forgotten tab: hand the exam over. An active one had the prompt in front
  -- of somebody who did not agree: refuse.
  IF h.last_active_at < now() - interval '5 minutes' THEN
    UPDATE exam_sessions SET ended_at = now(), end_reason = 'taken_over' WHERE id = h.id;
    v_new := _exam_new_session(r.ident, r.center_id, r.device_key, r.platform, r.device_label,
                               r.ip, r.country, r.exam_key, r.exam_label, r.is_practice);
    UPDATE exam_takeover_requests
       SET status = 'auto_approved', decided_at = now(), new_session_id = v_new WHERE id = r.id;
    INSERT INTO exam_lock_events (ident, center_id, kind) VALUES (r.ident, r.center_id, 'auto_approved');
    RETURN 'auto_approved';
  END IF;

  UPDATE exam_takeover_requests SET status = 'no_answer', decided_at = now() WHERE id = r.id;
  INSERT INTO exam_lock_events (ident, center_id, kind) VALUES (r.ident, r.center_id, 'no_answer');
  RETURN 'no_answer';
END $$;

-- ---------------------------------------------------------------------------
-- 5. Entry points (service_role only)
-- ---------------------------------------------------------------------------

-- Start an exam. allowed=true with a session id, or allowed=false with the
-- device that holds the account.
CREATE OR REPLACE FUNCTION public.exam_session_start(
  p_ident text, p_center text, p_device_key text, p_platform text, p_label text,
  p_ip text, p_country text, p_exam_key text, p_exam_label text, p_practice boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  h exam_sessions;
  v_id uuid;
BEGIN
  PERFORM pg_advisory_xact_lock(_exam_lock_key(p_ident, p_center));
  PERFORM _exam_expire(p_ident, p_center);

  SELECT * INTO h FROM exam_sessions
   WHERE ident = p_ident AND center_id = p_center AND ended_at IS NULL
     AND device_key <> p_device_key
   ORDER BY last_seen_at DESC LIMIT 1;

  IF FOUND THEN
    INSERT INTO exam_lock_events (ident, center_id, kind, detail)
    VALUES (p_ident, p_center, 'blocked',
            jsonb_build_object('platform', p_platform, 'holder_platform', h.platform, 'exam_key', p_exam_key));
    RETURN jsonb_build_object('allowed', false, 'holder', _exam_session_json(h));
  END IF;

  v_id := _exam_new_session(p_ident, p_center, p_device_key, p_platform, p_label,
                            p_ip, p_country, p_exam_key, p_exam_label, p_practice);
  RETURN jsonb_build_object('allowed', true, 'session_id', v_id);
END $$;

-- Heartbeat from the holding device. Tells it when a takeover is waiting for
-- its answer, or when its exam has been handed to another device.
CREATE OR REPLACE FUNCTION public.exam_session_beat(
  p_ident text, p_session_id uuid, p_device_key text, p_active boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s exam_sessions;
  r exam_takeover_requests;
BEGIN
  SELECT * INTO s FROM exam_sessions
   WHERE id = p_session_id AND ident = p_ident AND device_key = p_device_key;
  IF NOT FOUND THEN RETURN jsonb_build_object('state', 'unknown'); END IF;

  PERFORM pg_advisory_xact_lock(_exam_lock_key(s.ident, s.center_id));
  SELECT * INTO s FROM exam_sessions WHERE id = p_session_id;

  IF s.ended_at IS NOT NULL THEN
    IF s.end_reason = 'taken_over' THEN
      SELECT * INTO r FROM exam_takeover_requests
       WHERE session_id = s.id AND status IN ('approved', 'auto_approved')
       ORDER BY decided_at DESC LIMIT 1;
      RETURN jsonb_build_object('state', 'ended', 'reason', 'taken_over',
        'by', CASE WHEN r.id IS NULL THEN NULL ELSE jsonb_build_object(
          'platform', r.platform, 'device_label', r.device_label, 'ip', r.ip, 'country', r.country) END);
    END IF;
    -- Expired while this device was asleep and nobody else took it: resume.
    IF s.end_reason = 'expired' AND NOT EXISTS (
         SELECT 1 FROM exam_sessions o
          WHERE o.ident = s.ident AND o.center_id = s.center_id AND o.ended_at IS NULL) THEN
      UPDATE exam_sessions SET ended_at = NULL, end_reason = NULL, last_seen_at = now(),
             last_active_at = CASE WHEN p_active THEN now() ELSE last_active_at END
       WHERE id = s.id;
      RETURN jsonb_build_object('state', 'ok');
    END IF;
    RETURN jsonb_build_object('state', 'ended', 'reason', s.end_reason);
  END IF;

  UPDATE exam_sessions
     SET last_seen_at = now(),
         last_active_at = CASE WHEN p_active THEN now() ELSE last_active_at END
   WHERE id = s.id;

  SELECT * INTO r FROM exam_takeover_requests
   WHERE session_id = s.id AND status = 'pending'
   ORDER BY requested_at DESC LIMIT 1;
  IF FOUND THEN
    IF _exam_resolve_request(r.id) = 'pending' THEN
      UPDATE exam_takeover_requests SET seen_at = coalesce(seen_at, now()) WHERE id = r.id;
      RETURN jsonb_build_object('state', 'request', 'request', jsonb_build_object(
        'id', r.id, 'platform', r.platform, 'device_label', r.device_label,
        'ip', r.ip, 'country', r.country, 'exam_label', r.exam_label,
        'requested_at', r.requested_at,
        'expires_in', greatest(0, 60 - extract(epoch FROM now() - r.requested_at))::int));
    END IF;
    -- Resolved just now (auto-approved): report the new state.
    SELECT * INTO s FROM exam_sessions WHERE id = p_session_id;
    IF s.ended_at IS NOT NULL THEN
      RETURN jsonb_build_object('state', 'ended', 'reason', s.end_reason);
    END IF;
  END IF;

  RETURN jsonb_build_object('state', 'ok');
END $$;

CREATE OR REPLACE FUNCTION public.exam_session_end(
  p_ident text, p_session_id uuid, p_device_key text, p_reason text)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  WITH u AS (
    UPDATE exam_sessions
       SET ended_at = now(),
           end_reason = CASE WHEN p_reason = 'submitted' THEN 'submitted' ELSE 'closed' END
     WHERE id = p_session_id AND ident = p_ident AND device_key = p_device_key AND ended_at IS NULL
    RETURNING id
  )
  SELECT jsonb_build_object('ended', EXISTS (SELECT 1 FROM u))
$$;

-- "Continue on this device". Returns pending (ask the holder), released (the
-- holder is already gone — continue), or rate_limited.
CREATE OR REPLACE FUNCTION public.exam_takeover_request(
  p_ident text, p_center text, p_device_key text, p_platform text, p_label text,
  p_ip text, p_country text, p_exam_key text, p_exam_label text, p_practice boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  h exam_sessions;
  prev exam_takeover_requests;
  v_id uuid;
  v_new uuid;
BEGIN
  PERFORM pg_advisory_xact_lock(_exam_lock_key(p_ident, p_center));
  PERFORM _exam_expire(p_ident, p_center);

  SELECT * INTO h FROM exam_sessions
   WHERE ident = p_ident AND center_id = p_center AND ended_at IS NULL
     AND device_key <> p_device_key
   ORDER BY last_seen_at DESC LIMIT 1;
  IF NOT FOUND THEN
    v_new := _exam_new_session(p_ident, p_center, p_device_key, p_platform, p_label,
                               p_ip, p_country, p_exam_key, p_exam_label, p_practice);
    RETURN jsonb_build_object('status', 'released', 'session_id', v_new);
  END IF;

  -- One request per device per 2 minutes. A request still pending is simply
  -- returned again, so a double tap cannot queue two.
  SELECT * INTO prev FROM exam_takeover_requests
   WHERE ident = p_ident AND center_id = p_center AND device_key = p_device_key
     AND requested_at > now() - interval '2 minutes'
   ORDER BY requested_at DESC LIMIT 1;
  IF FOUND THEN
    IF prev.status = 'pending' AND prev.session_id = h.id THEN
      RETURN jsonb_build_object('status', 'pending', 'request_id', prev.id,
        'expires_in', greatest(0, 60 - extract(epoch FROM now() - prev.requested_at))::int);
    END IF;
    RETURN jsonb_build_object('status', 'rate_limited',
      'retry_in', greatest(1, 120 - extract(epoch FROM now() - prev.requested_at))::int);
  END IF;

  INSERT INTO exam_takeover_requests (session_id, ident, center_id, device_key, platform, device_label,
                                      ip, country, exam_key, exam_label, is_practice)
  VALUES (h.id, p_ident, p_center, p_device_key, coalesce(p_platform, 'web'), left(p_label, 80),
          left(p_ip, 64), left(p_country, 8), left(p_exam_key, 120), left(p_exam_label, 120),
          coalesce(p_practice, false))
  RETURNING id INTO v_id;
  INSERT INTO exam_lock_events (ident, center_id, kind, detail)
  VALUES (p_ident, p_center, 'requested', jsonb_build_object('platform', p_platform, 'holder_platform', h.platform));
  RETURN jsonb_build_object('status', 'pending', 'request_id', v_id, 'expires_in', 60);
END $$;

-- The requesting device polls until the request is decided.
CREATE OR REPLACE FUNCTION public.exam_takeover_poll(
  p_ident text, p_request_id uuid, p_device_key text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r exam_takeover_requests;
  v_status text;
BEGIN
  SELECT * INTO r FROM exam_takeover_requests
   WHERE id = p_request_id AND ident = p_ident AND device_key = p_device_key;
  IF NOT FOUND THEN RETURN jsonb_build_object('status', 'unknown'); END IF;

  PERFORM pg_advisory_xact_lock(_exam_lock_key(r.ident, r.center_id));
  PERFORM _exam_expire(r.ident, r.center_id);
  v_status := _exam_resolve_request(r.id);
  SELECT * INTO r FROM exam_takeover_requests WHERE id = p_request_id;

  RETURN jsonb_build_object(
    'status', v_status,
    'session_id', r.new_session_id,
    'expires_in', CASE WHEN v_status = 'pending'
                       THEN greatest(0, 60 - extract(epoch FROM now() - r.requested_at))::int END);
END $$;

-- The holding device answers. Approving ends its exam (the page keeps the
-- answers as a draft) and lets the requester continue.
CREATE OR REPLACE FUNCTION public.exam_takeover_answer(
  p_ident text, p_session_id uuid, p_device_key text, p_request_id uuid, p_approve boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s exam_sessions;
  r exam_takeover_requests;
BEGIN
  SELECT * INTO s FROM exam_sessions
   WHERE id = p_session_id AND ident = p_ident AND device_key = p_device_key;
  IF NOT FOUND THEN RETURN jsonb_build_object('status', 'unknown'); END IF;

  PERFORM pg_advisory_xact_lock(_exam_lock_key(s.ident, s.center_id));

  SELECT * INTO r FROM exam_takeover_requests
   WHERE id = p_request_id AND session_id = s.id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('status', 'unknown'); END IF;
  IF r.status <> 'pending' THEN RETURN jsonb_build_object('status', r.status); END IF;

  IF p_approve THEN
    UPDATE exam_sessions SET ended_at = now(), end_reason = 'taken_over'
     WHERE id = s.id AND ended_at IS NULL;
    UPDATE exam_takeover_requests SET status = 'approved', decided_at = now() WHERE id = r.id;
    INSERT INTO exam_lock_events (ident, center_id, kind) VALUES (s.ident, s.center_id, 'approved');
    RETURN jsonb_build_object('status', 'approved');
  END IF;

  UPDATE exam_takeover_requests SET status = 'denied', decided_at = now() WHERE id = r.id;
  INSERT INTO exam_lock_events (ident, center_id, kind) VALUES (s.ident, s.center_id, 'denied');
  RETURN jsonb_build_object('status', 'denied');
END $$;

-- Counts for the 08:00 report: one row per kind over the last p_hours.
CREATE OR REPLACE FUNCTION public.exam_lock_summary(p_hours int DEFAULT 24)
RETURNS TABLE(kind text, events bigint, accounts bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT kind, count(*), count(DISTINCT ident)
    FROM exam_lock_events
   WHERE at > now() - make_interval(hours => greatest(1, p_hours))
   GROUP BY kind
$$;

DO $$
DECLARE f text;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    '_exam_expire(text, text)',
    '_exam_new_session(text, text, text, text, text, text, text, text, text, boolean)',
    '_exam_resolve_request(uuid)',
    'exam_session_start(text, text, text, text, text, text, text, text, text, boolean)',
    'exam_session_beat(text, uuid, text, boolean)',
    'exam_session_end(text, uuid, text, text)',
    'exam_takeover_request(text, text, text, text, text, text, text, text, text, boolean)',
    'exam_takeover_poll(text, uuid, text)',
    'exam_takeover_answer(text, uuid, text, uuid, boolean)',
    'exam_lock_summary(int)'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC, anon, authenticated', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO service_role', f);
  END LOOP;
END $$;
