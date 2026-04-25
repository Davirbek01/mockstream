-- ============================================================================
-- Codes Management — VIP codes, individual mock codes, admin passcodes
-- Replaces alwaysdata /verify, Telegram bot code generator, hardcoded admin pw
-- ============================================================================

-- ─── centers ────────────────────────────────────────────────────────────────
-- Lightweight registry. Doesn't replace site_settings; just used for the UI
-- listing in the Code Management panel + per-center config knobs.
CREATE TABLE IF NOT EXISTS public.centers (
  id              text PRIMARY KEY,                  -- e.g. 'mockstream', 'bek'
  display_name    text NOT NULL,
  clone_can_edit  boolean NOT NULL DEFAULT false,    -- toggle: clone admin can renew codes
  premium_mode    boolean NOT NULL DEFAULT false,    -- when true, codes not required (whole center is premium)
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── vip_codes ──────────────────────────────────────────────────────────────
-- One row per (center, type). Renewing replaces `code` in-place (old dies).
-- type: 'regular' (no AI), 'premium' (AI + premium features)
CREATE TABLE IF NOT EXISTS public.vip_codes (
  center           text NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
  type             text NOT NULL CHECK (type IN ('regular','premium')),
  code             text NOT NULL,                    -- numeric string, ≤8 digits
  expires_at       timestamptz,                      -- NULL = never expires
  last_renewed_at  timestamptz NOT NULL DEFAULT now(),
  last_renewed_by  text,                             -- 'super_admin' | 'clone:<center>' | 'bot'
  PRIMARY KEY (center, type)
);

CREATE INDEX IF NOT EXISTS idx_vip_codes_code ON public.vip_codes (code);

-- ─── mock_codes ─────────────────────────────────────────────────────────────
-- One row per (center, skill, mock_number). Lazily created when admin requests
-- a code for that mock. Renewing replaces `code` in-place.
-- skill: 'listening','reading','writing','speaking','full_mock'
-- (CEFR & IELTS share a single code per mock_number per skill per center.)
CREATE TABLE IF NOT EXISTS public.mock_codes (
  center           text NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
  skill            text NOT NULL CHECK (skill IN ('listening','reading','writing','speaking','full_mock')),
  mock_number      int  NOT NULL CHECK (mock_number >= 1 AND mock_number <= 999),
  code             text NOT NULL,
  expires_at       timestamptz,
  last_renewed_at  timestamptz NOT NULL DEFAULT now(),
  last_renewed_by  text,
  PRIMARY KEY (center, skill, mock_number)
);

CREATE INDEX IF NOT EXISTS idx_mock_codes_code ON public.mock_codes (code);

-- ─── admin_passcodes ────────────────────────────────────────────────────────
-- Per-center admin passcodes (clone admins). Plus one super-admin row with
-- center='__super__' that grants global access.
-- Stored as plain numeric string (≤8 digits). For higher security we could
-- bcrypt these, but keeping plain matches existing alwaysdata behavior + lets
-- super-admin view/reset codes from the UI without forced reset flow.
CREATE TABLE IF NOT EXISTS public.admin_passcodes (
  center           text PRIMARY KEY,                 -- center id, or '__super__'
  passcode         text NOT NULL,                    -- numeric string
  updated_at       timestamptz NOT NULL DEFAULT now(),
  updated_by       text
);

-- ─── code_audit ─────────────────────────────────────────────────────────────
-- Append-only log of every code change. Useful for "who renewed what when".
CREATE TABLE IF NOT EXISTS public.code_audit (
  id           bigserial PRIMARY KEY,
  ts           timestamptz NOT NULL DEFAULT now(),
  actor        text NOT NULL,                        -- 'super_admin' | 'clone:<center>' | 'bot'
  action       text NOT NULL,                        -- 'create_center' | 'renew_vip' | 'renew_mock' | 'set_expiry' | 'revoke' | 'set_passcode'
  center       text,
  details      jsonb
);

CREATE INDEX IF NOT EXISTS idx_code_audit_center_ts ON public.code_audit (center, ts DESC);

-- ─── verify_attempts ────────────────────────────────────────────────────────
-- Rate-limit table. Each verify-passcode call inserts a row keyed by IP.
-- Edge Function rejects if >10 attempts in last 60 seconds for same IP.
CREATE TABLE IF NOT EXISTS public.verify_attempts (
  id      bigserial PRIMARY KEY,
  ts      timestamptz NOT NULL DEFAULT now(),
  ip      text NOT NULL,
  ok      boolean NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_verify_attempts_ip_ts ON public.verify_attempts (ip, ts DESC);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
-- Lock down ALL tables. Only Edge Functions (service role) read/write.
-- The anon/authenticated role can read NOTHING — verification goes through
-- the Edge Function which uses service role and applies its own auth checks.
ALTER TABLE public.centers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_codes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_codes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_passcodes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_audit       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verify_attempts  ENABLE ROW LEVEL SECURITY;

-- (no policies = service_role bypass, anon/authenticated fully blocked)

-- ─── Seed initial data ──────────────────────────────────────────────────────
-- Insert known centers from existing channel mappings so the UI has them.
INSERT INTO public.centers (id, display_name) VALUES
  ('mockstream', 'Mock Stream'),
  ('bek',        'Bekzod''s Multilevel'),
  ('global',     'Global Education'),
  ('niners',     'Niner''s Academy'),
  ('muzaffars',  'Muzaffar''s English'),
  ('camelot',    'Camelot'),
  ('wisdom',     'Wisdom'),
  ('achievers',  'Achievers')
ON CONFLICT (id) DO NOTHING;

-- Seed default super-admin passcode. CHANGE THIS IMMEDIATELY after deploy.
INSERT INTO public.admin_passcodes (center, passcode, updated_by)
VALUES ('__super__', '12345678', 'migration')
ON CONFLICT (center) DO NOTHING;
