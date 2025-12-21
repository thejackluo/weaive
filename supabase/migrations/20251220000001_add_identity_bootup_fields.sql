-- Migration: Add Story 1.6 Identity Bootup Fields
-- Purpose: Store user's name, personality, and identity traits from onboarding
-- Story: 1.6 - Name Entry, Weave Personality Selection & Identity Traits

-- Add Story 1.6 columns to user_profiles table
ALTER TABLE user_profiles
  ADD COLUMN preferred_name VARCHAR(50),
  ADD COLUMN core_personality VARCHAR(20) CHECK (core_personality IN ('supportive_direct', 'tough_warm')),
  ADD COLUMN personality_selected_at TIMESTAMPTZ,
  ADD COLUMN identity_traits JSONB;

-- Comments for documentation
COMMENT ON COLUMN user_profiles.preferred_name IS 'User''s preferred name or nickname (Step 1 of Story 1.6)';
COMMENT ON COLUMN user_profiles.core_personality IS 'Selected Weave personality type: supportive_direct or tough_warm (Step 2 of Story 1.6)';
COMMENT ON COLUMN user_profiles.personality_selected_at IS 'Timestamp when user selected their Weave personality (Step 2 of Story 1.6)';
COMMENT ON COLUMN user_profiles.identity_traits IS 'Array of 3-5 identity traits user wants to grow into (Step 3 of Story 1.6). Example: ["Disciplined", "Focused", "Resilient"]';

-- Index for personality queries (if needed for analytics)
CREATE INDEX idx_user_profiles_personality ON user_profiles(core_personality) WHERE core_personality IS NOT NULL;
