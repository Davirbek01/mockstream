-- ============================================================================
-- One exam at a time — what the web client needs from the server
-- ----------------------------------------------------------------------------
-- 1. Heartbeats without a JWT. The exam pages do not load auth.js, so nothing
--    refreshes the access token while a student sits a 60-minute paper; a
--    heartbeat that needed a live JWT would drop out mid-exam and hand the
--    account to whoever asked next. Only START and REQUEST prove who the
--    caller is (right after the landing page, where the token is fresh).
--    Everything after that is addressed by the unguessable session / request
--    uuid the server handed out, together with the device key — the same
--    capability model as a signed link. p_ident becomes optional: checked
--    when given, not required.
--
-- 2. A submitted result releases the lock. A student who finishes on the
--    laptop and leaves the results open must be able to start on the phone
--    straight away. A row in `results` IS the submission (the same reasoning
--    as stamp_mock_attempt_on_result), so the release happens there — for all
--    three platforms at once. A full mock writes section rows as it goes;
--    only its own 'full-mock' result ends a full-mock session.
--
-- 3. account_access picks one row deterministically when an account has more
--    than one (an email row and a Telegram row): the lock is keyed on the
--    ident it returns, so two calls must never disagree.
-- ============================================================================

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
      m.expires_at,
      m.created_at
    FROM m
  )
  SELECT kind, ident, expires_at FROM k
  WHERE kind IS NOT NULL
  ORDER BY CASE kind WHEN 'admin' THEN 0 WHEN 'ultra' THEN 1 ELSE 2 END, created_at, ident
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.exam_session_beat(
  p_ident text, p_session_id uuid, p_device_key text, p_active boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s exam_sessions;
  r exam_takeover_requests;
BEGIN
  SELECT * INTO s FROM exam_sessions
   WHERE id = p_session_id AND device_key = p_device_key
     AND (p_ident IS NULL OR ident = p_ident);
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
    -- Expired and somebody else holds it now: tell this device who.
    IF s.end_reason = 'expired' THEN
      RETURN jsonb_build_object('state', 'ended', 'reason', 'expired',
        'by', (SELECT jsonb_build_object('platform', o.platform, 'device_label', o.device_label,
                                         'ip', o.ip, 'country', o.country)
                 FROM exam_sessions o
                WHERE o.ident = s.ident AND o.center_id = s.center_id AND o.ended_at IS NULL
                ORDER BY o.last_seen_at DESC LIMIT 1));
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
     WHERE id = p_session_id AND device_key = p_device_key AND ended_at IS NULL
       AND (p_ident IS NULL OR ident = p_ident)
    RETURNING id
  )
  SELECT jsonb_build_object('ended', EXISTS (SELECT 1 FROM u))
$$;

CREATE OR REPLACE FUNCTION public.exam_takeover_poll(
  p_ident text, p_request_id uuid, p_device_key text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r exam_takeover_requests;
  v_status text;
BEGIN
  SELECT * INTO r FROM exam_takeover_requests
   WHERE id = p_request_id AND device_key = p_device_key
     AND (p_ident IS NULL OR ident = p_ident);
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

CREATE OR REPLACE FUNCTION public.exam_takeover_answer(
  p_ident text, p_session_id uuid, p_device_key text, p_request_id uuid, p_approve boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s exam_sessions;
  r exam_takeover_requests;
BEGIN
  SELECT * INTO s FROM exam_sessions
   WHERE id = p_session_id AND device_key = p_device_key
     AND (p_ident IS NULL OR ident = p_ident);
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

-- ---------------------------------------------------------------------------
-- A result releases the lock
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.end_exam_session_on_result()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ident text;
  v_center text;
BEGIN
  IF coalesce(btrim(NEW.user_email), '') = '' THEN RETURN NEW; END IF;

  SELECT a.ident INTO v_ident
    FROM account_access(NEW.user_email, '', coalesce(NEW.center, '')) a
   WHERE a.kind = 'premium';
  IF v_ident IS NULL THEN RETURN NEW; END IF;
  v_center := _norm_center(NEW.center);

  UPDATE exam_sessions
     SET ended_at = now(), end_reason = 'submitted'
   WHERE ident = v_ident AND center_id = v_center AND ended_at IS NULL
     -- a session opened a moment ago is the NEXT exam, not this result's
     AND started_at < now() - interval '20 seconds'
     -- a full mock's section rows must not end the full mock
     AND (coalesce(exam_key, '') NOT LIKE '%full-mock%' OR NEW.skill = 'full-mock');

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Releasing a lock must never be able to reject a student's result.
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_end_exam_session_on_result ON public.results;
CREATE TRIGGER trg_end_exam_session_on_result
  AFTER INSERT ON public.results
  FOR EACH ROW
  EXECUTE FUNCTION public.end_exam_session_on_result();

REVOKE ALL ON FUNCTION public.account_access(text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.account_access(text, text, text) TO service_role;
DO $$
DECLARE f text;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'exam_session_beat(text, uuid, text, boolean)',
    'exam_session_end(text, uuid, text, text)',
    'exam_takeover_poll(text, uuid, text)',
    'exam_takeover_answer(text, uuid, text, uuid, boolean)',
    'end_exam_session_on_result()'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC, anon, authenticated', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO service_role', f);
  END LOOP;
END $$;
