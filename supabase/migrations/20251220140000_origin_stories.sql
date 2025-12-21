-- Migration: origin_stories
-- Purpose: Store user's origin story commitment (photo + voice recording)
-- Story: 1.7 - Commitment Ritual & Origin Story (Backend Integration)
-- Context: This is the user's "first bind" - a symbolic commitment action

-- Origin Stories table
-- This table is IMMUTABLE - records can be created but never updated or deleted
-- Origin story represents the user's starting point and commitment
CREATE TABLE origin_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Storage paths for uploaded assets
  photo_storage_key TEXT NOT NULL,  -- Supabase Storage path: origin_stories/{user_id}/photo.jpg
  audio_storage_key TEXT NOT NULL,  -- Supabase Storage path: origin_stories/{user_id}/commitment.aac

  -- Audio metadata
  audio_duration_seconds INT NOT NULL CHECK (audio_duration_seconds > 0 AND audio_duration_seconds <= 60),

  -- Narrative context (from Story 1.2 and 1.6)
  from_text TEXT NOT NULL,  -- Current struggle text (generated from painpoints)
  to_text TEXT NOT NULL,    -- Dream traits text (from identity traits)

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Ensure one origin story per user
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_origin_stories_user ON origin_stories(user_id);
CREATE INDEX idx_origin_stories_created ON origin_stories(created_at DESC);

-- Comments for documentation
COMMENT ON TABLE origin_stories IS 'Immutable origin story records - user''s first bind commitment with photo and voice recording. One per user.';
COMMENT ON COLUMN origin_stories.photo_storage_key IS 'Supabase Storage path for origin story photo. Format: origin_stories/{user_id}/photo_{timestamp}.jpg';
COMMENT ON COLUMN origin_stories.audio_storage_key IS 'Supabase Storage path for voice commitment. Format: origin_stories/{user_id}/audio_{timestamp}.aac';
COMMENT ON COLUMN origin_stories.audio_duration_seconds IS 'Duration of voice recording in seconds. Max 60 seconds enforced by app and constraint.';
COMMENT ON COLUMN origin_stories.from_text IS 'User''s current struggle narrative generated from painpoint selection in Story 1.2.';
COMMENT ON COLUMN origin_stories.to_text IS 'User''s aspirational identity traits from Story 1.6. Target future self.';

-- Add first_bind tracking fields to user_profiles if they don't exist
DO $$
BEGIN
  -- Add first_bind_completed_at if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'first_bind_completed_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN first_bind_completed_at TIMESTAMPTZ;
    COMMENT ON COLUMN user_profiles.first_bind_completed_at IS 'Timestamp when user completed their first bind (origin story). Used for progress tracking.';
  END IF;

  -- Add user_level if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'user_level'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN user_level INT DEFAULT 0 NOT NULL CHECK (user_level >= 0);
    COMMENT ON COLUMN user_profiles.user_level IS 'User''s current level in Weave visualization. Starts at 0, incremented by bind consistency.';
  END IF;
END $$;

-- Create index on first_bind_completed_at for analytics queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_first_bind ON user_profiles(first_bind_completed_at)
  WHERE first_bind_completed_at IS NOT NULL;

-- Create index on user_level for leaderboards/analytics
CREATE INDEX IF NOT EXISTS idx_user_profiles_level ON user_profiles(user_level);
