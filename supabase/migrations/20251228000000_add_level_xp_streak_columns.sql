-- Migration: Add Level, XP, and Streak columns to user_profiles
-- Created: 2025-12-28
-- Purpose: Support gamification system with 2x leveling progression

-- Add new columns to user_profiles table
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS total_xp INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS current_streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak INTEGER NOT NULL DEFAULT 0;

-- Add check constraints
ALTER TABLE user_profiles
  ADD CONSTRAINT total_xp_non_negative CHECK (total_xp >= 0),
  ADD CONSTRAINT level_range CHECK (level >= 1 AND level <= 15),
  ADD CONSTRAINT current_streak_non_negative CHECK (current_streak >= 0),
  ADD CONSTRAINT longest_streak_non_negative CHECK (longest_streak >= 0);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_level ON user_profiles(level);
CREATE INDEX IF NOT EXISTS idx_user_profiles_total_xp ON user_profiles(total_xp);

-- Add comment
COMMENT ON COLUMN user_profiles.total_xp IS 'Total XP accumulated (used to calculate level)';
COMMENT ON COLUMN user_profiles.level IS 'Current level (1-15, calculated from total_xp using 2x formula)';
COMMENT ON COLUMN user_profiles.current_streak IS 'Current consecutive days streak';
COMMENT ON COLUMN user_profiles.longest_streak IS 'Longest streak ever achieved';
