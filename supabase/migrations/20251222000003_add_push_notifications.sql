-- Migration: Add push notification support
-- Purpose: Enable Expo Push Notifications for server-initiated check-ins (Story 6.1)
-- Date: 2025-12-22

-- Add push token column to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

-- Add index for efficient token lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_expo_push_token ON user_profiles(expo_push_token);

-- Comment for documentation
COMMENT ON COLUMN user_profiles.expo_push_token IS 'Expo push notification token for sending check-in notifications';
