-- ============================================================
-- Migration 003: Add extended profile fields to students table
-- + Supabase Storage bucket for avatar photos
-- ============================================================

-- Add new columns (nullable so existing rows are not broken)
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS username       VARCHAR(50),
  ADD COLUMN IF NOT EXISTS avatar_url     TEXT,
  ADD COLUMN IF NOT EXISTS gender         VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  ADD COLUMN IF NOT EXISTS school         VARCHAR(200);

-- ── Storage bucket for avatar uploads ──────────────────────────────────────
-- Run this via Supabase Dashboard > Storage > New bucket
-- OR via the SQL editor (storage schema must be available):

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,                         -- Public read so <img src> works without auth
  2097152,                      -- 2 MB max per file
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: anyone authenticated can upload to their own folder
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can read avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');
