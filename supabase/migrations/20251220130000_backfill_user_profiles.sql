-- Backfill user_profiles for existing auth users
-- This fixes the 404 error when existing users try to submit identity bootup data
-- Date: 2025-12-20

INSERT INTO user_profiles (auth_user_id, timezone, locale)
SELECT
  id::text,
  'America/Los_Angeles',
  'en-US'
FROM auth.users
WHERE id::text NOT IN (SELECT auth_user_id FROM user_profiles)
ON CONFLICT (auth_user_id) DO NOTHING;
