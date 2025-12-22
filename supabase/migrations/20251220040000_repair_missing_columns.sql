-- REPAIR MIGRATION: Add missing columns to user_profiles
-- Date: 2025-12-20
-- Issue: Previous migrations used CREATE TABLE IF NOT EXISTS which doesn't add columns to existing tables
-- This migration properly adds all missing columns that should have been added earlier

-- ============================================================================
-- Add missing columns from Story 0.3 (onboarding)
-- ============================================================================

-- Add onboarding_completed (from 20251219120000_auto_create_user_profiles.sql)
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.user_profiles.onboarding_completed IS 'Whether user has completed onboarding flow (Story 0.3). Used to determine if user should see onboarding or main app.';

-- Add selected_painpoints (from 20251219120000_auto_create_user_profiles.sql)
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS selected_painpoints TEXT[] DEFAULT ARRAY[]::TEXT[];

COMMENT ON COLUMN public.user_profiles.selected_painpoints IS 'Array of painpoint IDs selected during onboarding (Story 1.2). Used for personalization and targeting.';

-- ============================================================================
-- Add missing column from Story 4.1 (custom questions)
-- ============================================================================

-- Add preferences (from 20251220000001_story_4_1_journal_schema_update.sql)
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.user_profiles.preferences IS 'User preferences including custom_reflection_questions array. Story 4.1 AC #13. Format: {"custom_reflection_questions": [{"id": "uuid", "question": "string", "type": "text|numeric|yes_no", "created_at": "ISO8601"}]}';

-- ============================================================================
-- Verification
-- ============================================================================

-- You can verify the columns were added by running:
-- SELECT column_name, data_type, column_default, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'user_profiles'
-- AND column_name IN ('onboarding_completed', 'selected_painpoints', 'preferences')
-- ORDER BY column_name;
