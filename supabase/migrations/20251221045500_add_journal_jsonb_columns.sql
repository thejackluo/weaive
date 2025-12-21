-- Migration: Add JSONB columns for Story 4.1 - Daily Reflection Entry
-- Created: 2025-12-21
-- Adds default_responses and custom_responses JSONB columns to journal_entries
-- Adds preferences JSONB column to user_profiles

-- ============================================================================
-- journal_entries table updates
-- ============================================================================

-- Drop old text column if it exists (replaced with JSONB structure)
ALTER TABLE journal_entries DROP COLUMN IF EXISTS text;

-- Add default_responses JSONB column for two default reflection questions
-- Structure: {"today_reflection": "...", "tomorrow_focus": "..."}
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS default_responses JSONB;

-- Add custom_responses JSONB column for user-defined tracking questions
-- Structure: {"question_id": {"question_text": "...", "response": <any>}}
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS custom_responses JSONB;

-- Make fulfillment_score NOT NULL (Story 4.1 AC #5 requires daily rating)
ALTER TABLE journal_entries ALTER COLUMN fulfillment_score SET NOT NULL;

-- Update table and column comments
COMMENT ON TABLE journal_entries IS
  'Daily reflections (Story 4.1). One per user per day (UNIQUE constraint). Supports default + custom questions. Triggers AI batch: feedback + Triad generation.';

COMMENT ON COLUMN journal_entries.default_responses IS
  'JSONB: {today_reflection: string, tomorrow_focus: string}. Story 4.1 default questions.';

COMMENT ON COLUMN journal_entries.custom_responses IS
  'JSONB: {question_id: {question_text: string, response: any}}. User-defined tracking questions.';

COMMENT ON COLUMN journal_entries.fulfillment_score IS
  'Daily fulfillment rating 1-10 (required). Used for trend chart and pattern detection.';

-- ============================================================================
-- user_profiles table updates
-- ============================================================================

-- Add preferences column for storing custom reflection questions
-- Structure: {"custom_reflection_questions": [...]}
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN user_profiles.preferences IS
  'User preferences including custom_reflection_questions array. Story 4.1 AC #13.';
