-- Add tier (regular | premium) to mock_codes so each (center,skill,mock_number)
-- can have BOTH a regular and a premium code.
--   regular  → unlocks the mock, no AI auto-analysis / no premium UI extras
--   premium  → unlocks the mock + triggers AI grading + premium features
-- Existing rows are backfilled as 'premium' to match prior behavior.

ALTER TABLE public.mock_codes
  ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'premium'
  CHECK (tier IN ('regular','premium'));

-- Replace primary key to include tier
ALTER TABLE public.mock_codes DROP CONSTRAINT IF EXISTS mock_codes_pkey;
ALTER TABLE public.mock_codes
  ADD CONSTRAINT mock_codes_pkey PRIMARY KEY (center, skill, mock_number, tier);
