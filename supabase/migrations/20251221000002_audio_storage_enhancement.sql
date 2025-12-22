-- Migration 20251221000002: Audio Storage Enhancement
-- Purpose: Extend captures table for audio support + create captures storage bucket
-- Story: 0.11 - Voice/Speech-to-Text Infrastructure
-- Date: 2025-12-21

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 1: CAPTURES TABLE ENHANCEMENTS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add duration_sec column for audio/video captures
ALTER TABLE captures
ADD COLUMN IF NOT EXISTS duration_sec INT;

COMMENT ON COLUMN captures.duration_sec IS 'Duration in seconds for audio/video captures. NULL for other types.';

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 2: STORAGE BUCKET CREATION
-- ═══════════════════════════════════════════════════════════════════════════════
-- Bucket structure: captures/{user_id}/photo_{timestamp}.jpg
--                   captures/{user_id}/voice_{timestamp}.m4a

-- Create captures bucket for both photos (Story 0.9) and audio (Story 0.11)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'captures',
  'captures',
  false,  -- Private bucket - requires authentication
  26214400,  -- 25MB file size limit (25 * 1024 * 1024 bytes)
  ARRAY[
    -- Image formats (Story 0.9)
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/heic',
    'image/heif',
    -- Audio formats (Story 0.11)
    'audio/mpeg',      -- MP3
    'audio/mp4',       -- M4A
    'audio/x-m4a',     -- M4A alternative
    'audio/wav',       -- WAV
    'audio/wave',      -- WAV alternative
    'audio/flac',      -- FLAC
    'audio/ogg'        -- OGG
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 26214400,  -- Update limit to 25MB
  allowed_mime_types = ARRAY[
    'image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif',
    'audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/wave',
    'audio/flac', 'audio/ogg'
  ];

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 3: STORAGE RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════
-- Pattern: Folder-based isolation - users can only access {user_id}/* files
-- RLS Pattern from Story 0.4: auth.uid() → user_profiles.id lookup

-- SELECT policy: Users can view their own captures
CREATE POLICY IF NOT EXISTS "users_select_own_captures"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'captures' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM user_profiles WHERE auth_user_id = auth.uid()::text
  )
);

-- INSERT policy: Users can upload captures to their own folder
CREATE POLICY IF NOT EXISTS "users_insert_own_captures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'captures' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM user_profiles WHERE auth_user_id = auth.uid()::text
  )
);

-- UPDATE policy: Users can update metadata of their own captures
CREATE POLICY IF NOT EXISTS "users_update_own_captures"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'captures' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM user_profiles WHERE auth_user_id = auth.uid()::text
  )
)
WITH CHECK (
  bucket_id = 'captures' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM user_profiles WHERE auth_user_id = auth.uid()::text
  )
);

-- DELETE policy: Users can delete their own captures
CREATE POLICY IF NOT EXISTS "users_delete_own_captures"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'captures' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM user_profiles WHERE auth_user_id = auth.uid()::text
  )
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 4: COMMENTS (Wrapped in DO block to avoid permission errors)
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  -- Try to add comments, but don't fail if permissions are insufficient
  EXECUTE 'COMMENT ON POLICY "users_select_own_captures" ON storage.objects IS ''Users can view their own photo/audio captures. Folder-based isolation: {user_id}/*''';
  EXECUTE 'COMMENT ON POLICY "users_insert_own_captures" ON storage.objects IS ''Users can upload captures to their own folder. Enforces user_id-based folder isolation.''';
  EXECUTE 'COMMENT ON POLICY "users_update_own_captures" ON storage.objects IS ''Users can update metadata (not content) of their own captures.''';
  EXECUTE 'COMMENT ON POLICY "users_delete_own_captures" ON storage.objects IS ''Users can delete their own captures. Hard delete (not soft delete).''';
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Skipping policy comments due to insufficient privileges (non-fatal)';
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not add policy comments: %', SQLERRM;
END $$;
