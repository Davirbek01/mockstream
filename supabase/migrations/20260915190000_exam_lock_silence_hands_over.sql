-- ============================================================================
-- One exam at a time: silence for 60 seconds hands the exam over
-- ----------------------------------------------------------------------------
-- Decided with Davirbek 2026-09-15 after the first two-device test. The
-- takeover prompt covers the whole exam on the holding device, so a student
-- who is really sitting it must press "Refuse" to carry on at all. No answer
-- in 60 seconds therefore means nobody is there — the exam moves to the
-- device that asked, whatever the holder's last activity. (The previous rule
-- handed over only after 5 idle minutes, which would have misjudged a student
-- reading silently.) The holder sees the countdown and what happens at zero.
--
-- A refusal now keeps that device from asking again for 5 minutes (was 2),
-- so a second person on a shared login cannot keep interrupting the student
-- with a prompt every couple of minutes.
-- ============================================================================

CREATE OR REPLACE FUNCTION public._exam_resolve_request(p_request_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r exam_takeover_requests;
  h exam_sessions;
  v_new uuid;
BEGIN
  SELECT * INTO r FROM exam_takeover_requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND THEN RETURN NULL; END IF;

  IF r.status IN ('approved', 'auto_approved', 'released') AND r.new_session_id IS NULL THEN
    v_new := _exam_new_session(r.ident, r.center_id, r.device_key, r.platform, r.device_label,
                               r.ip, r.country, r.exam_key, r.exam_label, r.is_practice);
    UPDATE exam_takeover_requests SET new_session_id = v_new WHERE id = r.id;
    RETURN r.status;
  END IF;
  IF r.status <> 'pending' THEN RETURN r.status; END IF;

  SELECT * INTO h FROM exam_sessions WHERE id = r.session_id;

  IF h.ended_at IS NOT NULL THEN
    v_new := _exam_new_session(r.ident, r.center_id, r.device_key, r.platform, r.device_label,
                               r.ip, r.country, r.exam_key, r.exam_label, r.is_practice);
    UPDATE exam_takeover_requests
       SET status = 'released', decided_at = now(), new_session_id = v_new WHERE id = r.id;
    INSERT INTO exam_lock_events (ident, center_id, kind) VALUES (r.ident, r.center_id, 'released');
    RETURN 'released';
  END IF;

  IF r.requested_at > now() - interval '60 seconds' THEN RETURN 'pending'; END IF;

  -- 60 seconds and no answer: the prompt covered the exam, so nobody is there.
  UPDATE exam_sessions SET ended_at = now(), end_reason = 'taken_over' WHERE id = h.id;
  v_new := _exam_new_session(r.ident, r.center_id, r.device_key, r.platform, r.device_label,
                             r.ip, r.country, r.exam_key, r.exam_label, r.is_practice);
  UPDATE exam_takeover_requests
     SET status = 'auto_approved', decided_at = now(), new_session_id = v_new WHERE id = r.id;
  INSERT INTO exam_lock_events (ident, center_id, kind, detail)
  VALUES (r.ident, r.center_id, 'auto_approved',
          jsonb_build_object('holder_idle_seconds', extract(epoch FROM now() - h.last_active_at)::int,
                             'seen', r.seen_at IS NOT NULL));
  RETURN 'auto_approved';
END $$;

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

  -- A request still pending is returned again, so a double tap cannot queue two.
  SELECT * INTO prev FROM exam_takeover_requests
   WHERE ident = p_ident AND center_id = p_center AND device_key = p_device_key
     AND status = 'pending' AND session_id = h.id
   ORDER BY requested_at DESC LIMIT 1;
  IF FOUND THEN
    RETURN jsonb_build_object('status', 'pending', 'request_id', prev.id,
      'expires_in', greatest(0, 60 - extract(epoch FROM now() - prev.requested_at))::int);
  END IF;

  -- Refused less than 5 minutes ago: wait.
  SELECT * INTO prev FROM exam_takeover_requests
   WHERE ident = p_ident AND center_id = p_center AND device_key = p_device_key
     AND status IN ('denied', 'no_answer')
     AND coalesce(decided_at, requested_at) > now() - interval '5 minutes'
   ORDER BY coalesce(decided_at, requested_at) DESC LIMIT 1;
  IF FOUND THEN
    RETURN jsonb_build_object('status', 'rate_limited',
      'retry_in', greatest(1, 300 - extract(epoch FROM now() - coalesce(prev.decided_at, prev.requested_at)))::int);
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

REVOKE ALL ON FUNCTION public._exam_resolve_request(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public._exam_resolve_request(uuid) TO service_role;
REVOKE ALL ON FUNCTION public.exam_takeover_request(text, text, text, text, text, text, text, text, text, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.exam_takeover_request(text, text, text, text, text, text, text, text, text, boolean) TO service_role;
