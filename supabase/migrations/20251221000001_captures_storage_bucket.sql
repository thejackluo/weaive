-- Migration: captures Storage Bucket
-- Purpose: Create Supabase Storage bucket for proof photos and quick capture images
-- Story: 0.9 - Image Handling with Supabase Storage
-- Epic: 3 - Daily Actions & Proof (US-3.4, US-3.5)

-- ═══════════════════════════════════════════════════════════════════════
-- STORAGE BUCKET SETUP
-- ═══════════════════════════════════════════════════════════════════════
-- Bucket structure: captures/{user_id}/proof_{timestamp}.jpg
--                   captures/{user_id}/quick_{timestamp}.jpg
--                   captures/{user_id}/audio_{timestamp}.aac

-- Create captures bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'captures',
  'captures',
  false,  -- Private bucket - requires authentication
  10485760,  -- 10MB file size limit (per CLAUDE.md security requirements)
  ARRAY['image/jpeg', 'image/jpg', 'image/png']  -- Only images for MVP (Story 0.9 scope)
)
ON CONFLICT (id) DO NOTHING;  -- Skip if bucket already exists

-- ═══════════════════════════════════════════════════════════════════════
-- STORAGE POLICIES (RLS for Storage)
-- ═══════════════════════════════════════════════════════════════════════
-- Pattern: Users can upload/view/delete their own files only
-- Path structure: {user_id}/* ensures user_id-based isolation
-- Follows same pattern as origin-stories bucket

-- SELECT policy: Users can view their own capture files
CREATE POLICY "users_select_own_capture_files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'captures' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM user_profiles WHERE auth_user_id = auth.uid()::text
  )
);

-- INSERT policy: Users can upload files to their own folder
CREATE POLICY "users_insert_own_capture_files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'captures' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM user_profiles WHERE auth_user_id = auth.uid()::text
  )
);

-- UPDATE policy: Users can update metadata of their own files
CREATE POLICY "users_update_own_capture_files"
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

-- DELETE policy: Users can delete their own files
CREATE POLICY "users_delete_own_capture_files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'captures' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM user_profiles WHERE auth_user_id = auth.uid()::text
  )
);

-- ═══════════════════════════════════════════════════════════════════════
-- COMMENTS (Documentation)
-- ═══════════════════════════════════════════════════════════════════════
-- Wrapped in DO block to handle permission errors gracefully

DO $$
BEGIN
  -- Try to add comments, but don't fail if permissions are insufficient
  EXECUTE 'COMMENT ON POLICY "users_select_own_capture_files" ON storage.objects IS ''Users can view their own proof photos and quick capture images in captures bucket. Path: {user_id}/proof_{timestamp}.jpg''';
  EXECUTE 'COMMENT ON POLICY "users_insert_own_capture_files" ON storage.objects IS ''Users can upload capture images to their own folder. Enforces user_id-based folder isolation. 10MB max file size, JPEG/PNG only.''';
  EXECUTE 'COMMENT ON POLICY "users_update_own_capture_files" ON storage.objects IS ''Users can update metadata (not content) of their own capture files.''';
  EXECUTE 'COMMENT ON POLICY "users_delete_own_capture_files" ON storage.objects IS ''Users can delete their own capture files. Useful for correcting mistakes or removing unwanted proofs.''';
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Skipping policy comments due to insufficient privileges (non-fatal)';
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not add policy comments: %', SQLERRM;
END $$;
