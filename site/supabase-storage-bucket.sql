-- Create public storage bucket for mock test audio files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'mock-audio',
  'mock-audio',
  true,
  5242880,  -- 5MB max per file
  ARRAY['audio/mpeg', 'audio/mp3']
);

-- Allow anonymous uploads (matching anon key)
CREATE POLICY "Allow public upload to mock-audio"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'mock-audio');

-- Allow anonymous reads (public bucket)
CREATE POLICY "Allow public read from mock-audio"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'mock-audio');

-- Allow upsert (overwrite existing files)
CREATE POLICY "Allow public update in mock-audio"
ON storage.objects FOR UPDATE
TO anon
USING (bucket_id = 'mock-audio');
