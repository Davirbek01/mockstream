-- Cross-isolate idempotency log for the send-to-telegram Edge Function.
-- Each row reserves a (idempotency_key, target_tag) slot atomically via the
-- composite primary key. Successful posts are flagged ok=true with the
-- Telegram message_id; failed reservations are deleted by the function so a
-- legitimate retry can re-attempt. Rows older than 24h can be pruned safely.
CREATE TABLE IF NOT EXISTS telegram_send_log (
  idem_key   text        NOT NULL,
  target_tag text        NOT NULL,                -- e.g. 'mockstream' or 'general'
  center     text        NOT NULL,
  skill      text        NOT NULL,
  chat_id    text,
  message_id text,
  ok         boolean     NOT NULL DEFAULT false,
  ts         timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (idem_key, target_tag)
);

CREATE INDEX IF NOT EXISTS telegram_send_log_ts_idx ON telegram_send_log (ts DESC);
