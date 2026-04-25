-- Tracks regular mock codes handed out by the support-tab AI assistant.
-- Used to enforce per-user rate limits (1/hour, 4/day for free tier).
CREATE TABLE IF NOT EXISTS promo_handouts (
  id          bigserial PRIMARY KEY,
  user_key    text        NOT NULL,
  center      text        NOT NULL,
  skill       text        NOT NULL,
  mock_number int,
  code        text,
  issued_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS promo_handouts_user_time_idx
  ON promo_handouts (user_key, issued_at DESC);

CREATE INDEX IF NOT EXISTS promo_handouts_center_idx
  ON promo_handouts (center, issued_at DESC);
