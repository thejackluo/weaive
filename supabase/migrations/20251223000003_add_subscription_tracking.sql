-- Story 9.4: App Store Readiness - Add subscription tracking columns
-- Manual migration required (apply via Supabase Dashboard or CLI)
--
-- INSTRUCTIONS:
-- 1. Open Supabase Dashboard → SQL Editor
-- 2. Run this migration
-- 3. Verify columns added: SELECT * FROM user_profiles LIMIT 1;

-- Add columns for tracking subscription expiry and product info
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_product_id TEXT;

-- Add index for expiry lookups (for cron jobs that downgrade expired subscriptions)
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_expires
ON user_profiles(subscription_expires_at)
WHERE subscription_tier = 'pro';

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.subscription_expires_at IS 'Subscription expiry date (null = no expiry or free tier)';
COMMENT ON COLUMN user_profiles.subscription_product_id IS 'Apple product ID (e.g., com.weavelight.app.pro.monthly)';

-- Verify migration
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND column_name LIKE '%subscription%'
ORDER BY ordinal_position;
