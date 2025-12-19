-- Migration: Auto-create user profiles on auth user creation
-- Story 0.3: Fix OAuth authentication user profile creation
-- Date: 2025-12-19
--
-- This migration ensures that when a user signs in via OAuth (Google, Apple)
-- or email authentication, a corresponding user_profiles row is automatically
-- created with sensible defaults.

-- ============================================================================
-- STEP 1: Create user_profiles table (skip if already exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id TEXT NOT NULL UNIQUE,
  timezone TEXT NOT NULL DEFAULT 'America/Los_Angeles',
  locale TEXT DEFAULT 'en-US',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  selected_painpoints TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Foreign key to auth.users
  CONSTRAINT fk_auth_user FOREIGN KEY (auth_user_id)
    REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_user_id
  ON public.user_profiles(auth_user_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at
  ON public.user_profiles(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read/update their own profile
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid()::text = auth_user_id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid()::text = auth_user_id);

-- RLS Policy: Allow service role to insert (for trigger)
CREATE POLICY "Service role can insert profiles"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- STEP 2: Create trigger function to auto-create user profile
-- ============================================================================

-- Function: Auto-create user profile when new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_timezone TEXT;
BEGIN
  -- Try to detect timezone from user metadata (if available)
  -- Fallback to America/Los_Angeles if not provided
  user_timezone := COALESCE(
    NEW.raw_user_meta_data->>'timezone',
    'America/Los_Angeles'
  );

  -- Insert new user profile with defaults
  INSERT INTO public.user_profiles (
    auth_user_id,
    timezone,
    locale,
    onboarding_completed,
    selected_painpoints,
    created_at,
    updated_at
  ) VALUES (
    NEW.id::text,
    user_timezone,
    COALESCE(NEW.raw_user_meta_data->>'locale', 'en-US'),
    FALSE,
    ARRAY[]::TEXT[],
    NOW(),
    NOW()
  )
  ON CONFLICT (auth_user_id) DO NOTHING; -- Prevent duplicates

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block auth user creation
    RAISE WARNING 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- ============================================================================
-- STEP 3: Create trigger on auth.users
-- ============================================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger that fires after new user is inserted
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STEP 4: Backfill existing users (optional - run if you have existing users)
-- ============================================================================

-- Uncomment this section if you have existing auth.users without profiles:
/*
INSERT INTO public.user_profiles (
  auth_user_id,
  timezone,
  locale,
  onboarding_completed,
  selected_painpoints,
  created_at,
  updated_at
)
SELECT
  u.id::text,
  COALESCE(u.raw_user_meta_data->>'timezone', 'America/Los_Angeles'),
  COALESCE(u.raw_user_meta_data->>'locale', 'en-US'),
  FALSE,
  ARRAY[]::TEXT[],
  u.created_at,
  NOW()
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id::text = p.auth_user_id
WHERE p.id IS NULL; -- Only insert where profile doesn't exist
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- After running this migration, verify it worked:

-- 1. Check if trigger exists:
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- 2. Check if function exists:
-- SELECT * FROM pg_proc WHERE proname = 'handle_new_user';

-- 3. Test by creating a new user and checking if profile was created:
-- SELECT u.id, u.email, p.*
-- FROM auth.users u
-- LEFT JOIN public.user_profiles p ON u.id::text = p.auth_user_id
-- ORDER BY u.created_at DESC
-- LIMIT 5;
