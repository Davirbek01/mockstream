-- Client-side diagnostics for mobile/desktop flows we cannot observe from the
-- outside (full-mock delivery, speaking runner). Anon may INSERT only; reading
-- requires the service role. Written by src/lib/debugBeacon.{ts} in both app
-- repos; desktop tags are prefixed 'dt_'.
CREATE TABLE IF NOT EXISTS client_debug_logs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  tag text NOT NULL,
  device text,
  payload jsonb
);
ALTER TABLE client_debug_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS client_debug_insert ON client_debug_logs;
CREATE POLICY client_debug_insert ON client_debug_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
GRANT INSERT ON client_debug_logs TO anon, authenticated;
