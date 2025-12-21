-- ============================================================================
-- Migration: Audio Storage and Speech-to-Text Infrastructure
-- Story: 0.11 - Voice/Speech-to-Text Infrastructure
-- Epic: 0 - Foundation
-- Date: 2025-12-21
-- ============================================================================
-- Purpose: Add audio support to existing captures storage bucket and add
--          STT-specific tracking columns to ai_runs and daily_aggregates
--
-- Changes:
-- 1. Extend captures storage bucket to support audio MIME types
-- 2. Increase file size limit to 25MB for audio files
-- 3. Add duration_sec column to captures table
-- 4. Add audio_duration_sec and confidence_score to ai_runs table
-- 5. Add stt_request_count and stt_duration_minutes to daily_aggregates
-- 6. Add 'assemblyai' and 'whisper' to ai_provider enum
-- ============================================================================

-- ============================================================================
-- 1. EXTEND STORAGE BUCKET FOR AUDIO
-- ============================================================================
-- Update captures bucket to support audio MIME types
-- Note: Storage bucket already exists from Story 0.9, we're just extending it

-- Update allowed MIME types to include audio formats
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  -- Image formats (Story 0.9)
  'image/jpeg',
  'image/jpg',
  'image/png',
  -- Audio formats (Story 0.11)
  'audio/mpeg',      -- MP3
  'audio/mp4',       -- M4A
  'audio/x-m4a',     -- M4A (alternative MIME)
  'audio/wav',       -- WAV
  'audio/wave'       -- WAV (alternative MIME)
],
file_size_limit = 26214400  -- 25MB (up from 10MB for audio files)
WHERE id = 'captures';

COMMENT ON TABLE storage.buckets IS 'Updated to support both images (Story 0.9) and audio (Story 0.11). Max 25MB file size.';

-- ============================================================================
-- 2. ADD AUDIO DURATION TO CAPTURES TABLE
-- ============================================================================
-- Add duration_sec column to store audio/video duration

ALTER TABLE captures
ADD COLUMN IF NOT EXISTS duration_sec INT DEFAULT NULL;

COMMENT ON COLUMN captures.duration_sec IS 'Duration in seconds for audio/video captures. Used for STT cost calculation and playback UI. NULL for non-media captures.';

-- Create index for queries filtering by duration
CREATE INDEX IF NOT EXISTS idx_captures_duration ON captures(duration_sec) WHERE duration_sec IS NOT NULL;

-- ============================================================================
-- 3. ADD STT TRACKING TO AI_RUNS TABLE
-- ============================================================================
-- Add audio-specific tracking columns for Speech-to-Text operations

ALTER TABLE ai_runs
ADD COLUMN IF NOT EXISTS audio_duration_sec INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS confidence_score NUMERIC(3,2) DEFAULT NULL;

-- Add constraint to ensure confidence_score is between 0 and 1
ALTER TABLE ai_runs
DROP CONSTRAINT IF EXISTS check_confidence_score,
ADD CONSTRAINT check_confidence_score CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1));

COMMENT ON COLUMN ai_runs.audio_duration_sec IS 'Audio file duration in seconds (for STT operations). Used to calculate per-second cost for AssemblyAI and Whisper.';
COMMENT ON COLUMN ai_runs.confidence_score IS 'STT transcription confidence score (0-1.0). Higher = more accurate. <0.7 = user should review transcript.';

-- ============================================================================
-- 4. ADD STT PROVIDERS TO AI_PROVIDER ENUM
-- ============================================================================
-- Add AssemblyAI and Whisper as provider options

-- Add new enum values using ALTER TYPE
ALTER TYPE ai_provider ADD VALUE IF NOT EXISTS 'assemblyai';
ALTER TYPE ai_provider ADD VALUE IF NOT EXISTS 'whisper';

COMMENT ON TYPE ai_provider IS 'AI provider types: bedrock (primary), openai (fallback #1), anthropic (fallback #2), assemblyai (STT primary), whisper (STT fallback), deterministic (ultimate fallback), cache (no cost)';

-- ============================================================================
-- 5. ADD STT RATE LIMITING TO DAILY_AGGREGATES
-- ============================================================================
-- Add columns to track daily STT usage for rate limiting

ALTER TABLE daily_aggregates
ADD COLUMN IF NOT EXISTS stt_request_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS stt_duration_minutes NUMERIC(10,2) DEFAULT 0.0;

COMMENT ON COLUMN daily_aggregates.stt_request_count IS 'Number of STT transcription requests for the day. Rate limit: 50 requests/user/day (Story 0.11).';
COMMENT ON COLUMN daily_aggregates.stt_duration_minutes IS 'Total audio duration transcribed (minutes). Used for cost tracking and rate limiting.';

-- Create index for STT rate limiting queries
CREATE INDEX IF NOT EXISTS idx_daily_aggregates_stt ON daily_aggregates(user_id, local_date, stt_request_count);

-- ============================================================================
-- 6. ADD STT MODULE TO AI_MODULE ENUM
-- ============================================================================
-- Add 'stt' module type for Speech-to-Text operations

ALTER TYPE ai_module ADD VALUE IF NOT EXISTS 'stt';

COMMENT ON TYPE ai_module IS 'AI module types: onboarding, triad, recap, dream_self, weekly_insights, goal_breakdown, chat, stt (Story 0.11)';

-- ============================================================================
-- VERIFICATION QUERIES (Run these after migration)
-- ============================================================================
--
-- 1. Check storage bucket supports audio:
--    SELECT id, name, file_size_limit, allowed_mime_types FROM storage.buckets WHERE id = 'captures';
--
-- 2. Check captures table has duration column:
--    SELECT column_name, data_type, column_default FROM information_schema.columns
--    WHERE table_name = 'captures' AND column_name = 'duration_sec';
--
-- 3. Check ai_runs has STT columns:
--    SELECT column_name, data_type FROM information_schema.columns
--    WHERE table_name = 'ai_runs' AND column_name IN ('audio_duration_sec', 'confidence_score');
--
-- 4. Check daily_aggregates has STT columns:
--    SELECT column_name, data_type FROM information_schema.columns
--    WHERE table_name = 'daily_aggregates' AND column_name IN ('stt_request_count', 'stt_duration_minutes');
--
-- 5. Check ai_provider enum includes STT providers:
--    SELECT unnest(enum_range(NULL::ai_provider));
--
-- 6. Test audio upload (requires Supabase client):
--    -- Upload test audio file to captures/{user_id}/voice_test.m4a
--    -- Should succeed with new MIME types
--
-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================
-- To rollback this migration:
--
-- ALTER TABLE daily_aggregates DROP COLUMN IF EXISTS stt_request_count, DROP COLUMN IF EXISTS stt_duration_minutes;
-- ALTER TABLE ai_runs DROP COLUMN IF EXISTS audio_duration_sec, DROP COLUMN IF EXISTS confidence_score;
-- ALTER TABLE captures DROP COLUMN IF EXISTS duration_sec;
-- UPDATE storage.buckets SET allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png'], file_size_limit = 10485760 WHERE id = 'captures';
--
-- Note: Cannot easily remove enum values from ai_provider and ai_module once added.
--       This is a PostgreSQL limitation. Leave them in place if rollback needed.
-- ============================================================================
