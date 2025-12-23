-- Migration: Add subscription_tier to user_profiles
-- Purpose: Support tiered rate limiting for AI features (Story 6.1)
-- Date: 2025-12-22
-- Note: AI usage counter columns already added by 20251222000001_ai_chat_infrastructure.sql

-- Add subscription_tier column (only thing missing from first migration)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'admin'));

-- Index for efficient tier lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_tier ON user_profiles(subscription_tier);

-- Comment for documentation
COMMENT ON COLUMN user_profiles.subscription_tier IS 'User subscription level: free (default), pro (paid), admin (unlimited)';
