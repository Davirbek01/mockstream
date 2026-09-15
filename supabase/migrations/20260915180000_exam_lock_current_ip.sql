-- ============================================================================
-- One exam at a time: show the holder's CURRENT IP, not the one it started on
-- ----------------------------------------------------------------------------
-- First two-device test (2026-09-15): the notice named the phone by the IP it
-- had when the exam began, 185.139.138.205; twenty minutes later the phone's
-- own "what is my IP" said 92.63.204.141. Mobile carriers move a phone between
-- addresses constantly. Every heartbeat now refreshes the stored IP, so the
-- notice shows where the other device is now.
--
-- DROP + CREATE rather than CREATE OR REPLACE: adding a defaulted parameter
-- with OR REPLACE registers a second overload, and the old four-argument
-- calls would then fail as ambiguous.
-- ============================================================================

DROP FUNCTION IF EXISTS public.exam_session_beat(text, uuid, text, boolean);

CREATE FUNCTION public.exam_session_beat(
  p_ident text, p_session_id uuid, p_device_key text, p_active boolean, p_ip text DEFAULT NULL)
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
    IF s.end_reason = 'expired' AND NOT EXISTS (
         SELECT 1 FROM exam_sessions o
          WHERE o.ident = s.ident AND o.center_id = s.center_id AND o.ended_at IS NULL) THEN
      UPDATE exam_sessions SET ended_at = NULL, end_reason = NULL, last_seen_at = now(),
             last_active_at = CASE WHEN p_active THEN now() ELSE last_active_at END,
             ip = coalesce(left(p_ip, 64), ip)
       WHERE id = s.id;
      RETURN jsonb_build_object('state', 'ok');
    END IF;
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
         last_active_at = CASE WHEN p_active THEN now() ELSE last_active_at END,
         ip = coalesce(left(p_ip, 64), ip)
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

REVOKE ALL ON FUNCTION public.exam_session_beat(text, uuid, text, boolean, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.exam_session_beat(text, uuid, text, boolean, text) TO service_role;
