-- =====================================================================
-- Backfill mock_attempts from existing public.results rows.
-- Run ONCE after the 20260501000000 migration. Safe to re-run; backfill
-- rows are tagged source='backfill' so a re-run produces duplicates only
-- if you do not first DELETE FROM mock_attempts WHERE source='backfill'.
-- =====================================================================

INSERT INTO public.mock_attempts
  (candidate_name, center, exam_type, skill, mock_number, tier_at_open,
   opened_at, submitted_at, source)
SELECT
  LOWER(TRIM(student_name)),
  COALESCE(NULLIF(TRIM(center), ''), 'mock_stream'),
  COALESCE(NULLIF(TRIM(exam_type), ''), 'cefr'),
  COALESCE(NULLIF(TRIM(skill), ''), 'unknown'),
  NULLIF(REGEXP_REPLACE(mock_number, '\D', '', 'g'), '')::INT,
  'unknown',
  created_at,
  created_at,
  'backfill'
FROM public.results
WHERE student_name IS NOT NULL
  AND TRIM(student_name) <> ''
  AND mock_number ~ '\d';
