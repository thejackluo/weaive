-- Migration: origin_stories Storage Bucket
-- Purpose: Create Supabase Storage bucket for origin story photos and audio
-- Story: 1.7 - Commitment Ritual & Origin Story (Backend Integration)

-- ═══════════════════════════════════════════════════════════════════════
-- STORAGE BUCKET SETUP
-- ═══════════════════════════════════════════════════════════════════════
-- Bucket structure: origin-stories/{user_id}/photo_{timestamp}.jpg
--                   origin-stories/{user_id}/audio_{timestamp}.aac

-- Create origin-stories bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'origin-stories',
  'origin-stories',
  false,  -- Private bucket - requires authentication
  10485760,  -- 10MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'audio/aac', 'audio/mp4', 'audio/mpeg', 'audio/x-m4a']
)
ON CONFLICT (id) DO NOTHING;  -- Skip if bucket already exists

-- ═══════════════════════════════════════════════════════════════════════
-- STORAGE POLICIES
-- ═══════════════════════════════════════════════════════════════════════
-- Pattern: Users can upload/view/delete their own files only
-- Path structure: {user_id}/* ensures user_id-based isolation

-- SELECT policy: Users can view their own origin story files
CREATE POLICY "users_select_own_origin_files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'origin-stories' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM user_profiles WHERE auth_user_id = auth.uid()::text
  )
);

-- INSERT policy: Users can upload files to their own folder
CREATE POLICY "users_insert_own_origin_files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'origin-stories' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM user_profiles WHERE auth_user_id = auth.uid()::text
  )
);

-- UPDATE policy: Users can update metadata of their own files (optional, but good practice)
CREATE POLICY "users_update_own_origin_files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'origin-stories' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM user_profiles WHERE auth_user_id = auth.uid()::text
  )
)
WITH CHECK (
  bucket_id = 'origin-stories' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM user_profiles WHERE auth_user_id = auth.uid()::text
  )
);

-- DELETE policy: Users can delete their own files (if needed for retakes during onboarding)
CREATE POLICY "users_delete_own_origin_files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'origin-stories' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM user_profiles WHERE auth_user_id = auth.uid()::text
  )
);

-- ═══════════════════════════════════════════════════════════════════════
-- COMMENTS (Wrapped in DO block to avoid permission errors in test environments)
-- ═══════════════════════════════════════════════════════════════════════
-- Note: COMMENT ON storage.objects policies requires superuser in some environments
-- Wrapping in DO block makes this non-fatal if permissions are insufficient

DO $$
BEGIN
  -- Try to add comments, but don't fail if permissions are insufficient
  EXECUTE 'COMMENT ON POLICY "users_select_own_origin_files" ON storage.objects IS ''Users can view their own origin story files in origin-stories bucket. Path: {user_id}/photo.jpg or {user_id}/audio.aac''';
  EXECUTE 'COMMENT ON POLICY "users_insert_own_origin_files" ON storage.objects IS ''Users can upload origin story files to their own folder. Enforces user_id-based folder isolation.''';
  EXECUTE 'COMMENT ON POLICY "users_update_own_origin_files" ON storage.objects IS ''Users can update metadata (not content) of their own origin story files.''';
  EXECUTE 'COMMENT ON POLICY "users_delete_own_origin_files" ON storage.objects IS ''Users can delete their own origin story files. Useful for retakes during onboarding before final submission.''';
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Skipping policy comments due to insufficient privileges (non-fatal)';
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not add policy comments: %', SQLERRM;
END $$;
