-- Migration 001: user_profiles
-- Purpose: Store user profile information and timezone (critical for local_date calculations)
-- Story: 0.2a - Database Schema (Core Tables)

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id TEXT UNIQUE NOT NULL,
  display_name TEXT,
  timezone TEXT NOT NULL,  -- CRITICAL: Required for local_date calculations
  locale TEXT DEFAULT 'en-US',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_user_profiles_auth_id ON user_profiles(auth_user_id);

-- Comments for documentation
COMMENT ON TABLE user_profiles IS 'User profile information linked to Supabase Auth. Timezone is critical for converting UTC to local dates.';
COMMENT ON COLUMN user_profiles.auth_user_id IS 'Links to Supabase auth.users.id - must match authenticated user';
COMMENT ON COLUMN user_profiles.timezone IS 'IANA timezone (e.g., America/Los_Angeles). NOT NULL - required for all date calculations.';
COMMENT ON COLUMN user_profiles.last_active_at IS 'Used for return states (UX-R) - triggers compassionate re-engagement after 48h';
