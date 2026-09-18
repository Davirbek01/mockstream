-- ============================================================================
-- Exam lock: a 20-second grace after a holder says its exam closed
-- ----------------------------------------------------------------------------
-- "Closed" arrives from the client, and a client can be wrong: the mobile app
-- ended its session at a speaking part intro while the exam was still running
-- (2026-09-17), and the other device then took the exam over WITHOUT asking,
-- because the lock saw no holder at all.
--
-- A takeover request in the first 20 seconds after a 'closed' session is now
-- rate_limited instead of released. If that device was still examining it
-- re-claims the exam within a second or two and the next request asks it
-- properly; if the student really did leave, the other device waits those
-- 20 seconds and then continues. 'submitted' (the exam is over for good) and
-- 'taken_over' / 'replaced' / 'expired' are unaffected, and so is starting a
-- fresh exam - only the takeover path waits.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.exam_takeover_request(
  p_ident text, p_center text, p_device_key text, p_platform text, p_label text,
  p_ip text, p_country text, p_exam_key text, p_exam_label text, p_practice boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  h exam_sessions;
  prev exam_takeover_requests;
  v_id uuid;
  v_new uuid;
  v_grace int;
BEGIN
  PERFORM pg_advisory_xact_lock(_exam_lock_key(p_ident, p_center));
  PERFORM _exam_expire(p_ident, p_center);

  SELECT * INTO h FROM exam_sessions
   WHERE ident = p_ident AND center_id = p_center AND ended_at IS NULL
     AND device_key <> p_device_key
   ORDER BY last_seen_at DESC LIMIT 1;
  IF NOT FOUND THEN
    -- Nobody holds it now. But a 'closed' that landed a moment ago may be a
    -- client mistake, so give that device a few seconds to re-claim.
    SELECT greatest(1, 20 - extract(epoch FROM now() - s.ended_at))::int INTO v_grace
      FROM exam_sessions s
     WHERE s.ident = p_ident AND s.center_id = p_center
       AND s.device_key <> p_device_key
       AND s.end_reason = 'closed'
       AND s.ended_at > now() - interval '20 seconds'
     ORDER BY s.ended_at DESC LIMIT 1;
    IF v_grace IS NOT NULL THEN
      RETURN jsonb_build_object('status', 'rate_limited', 'retry_in', v_grace);
    END IF;
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
