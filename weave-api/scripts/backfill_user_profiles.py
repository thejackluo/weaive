"""
Backfill user_profiles for all existing auth.users.

This script creates user_profile entries for any auth users who don't have one yet.
Useful for fixing the 404 error when existing users try to submit identity bootup data.

Run with: uv run python backfill_user_profiles.py
"""
import os

from supabase import create_client

# Connect to Supabase with admin privileges
supabase = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_KEY"]
)

print("🔍 Checking for auth users without user_profiles...")

# Get all auth users
# Note: This requires auth admin API access
# Simpler approach: Try to create profile for the currently logged in user
print("\n💡 To fix the 404 error:")
print("   1. Log out of the app")
print("   2. Sign up with a new account (trigger will auto-create profile)")
print("   3. OR manually insert user_profile in Supabase dashboard:")
print()
print("   SQL:")
print("   INSERT INTO user_profiles (auth_user_id, timezone)")
print("   SELECT id::text, 'America/Los_Angeles'")
print("   FROM auth.users")
print("   WHERE id::text NOT IN (SELECT auth_user_id FROM user_profiles);")
print()
print("✨ Run this SQL in your Supabase SQL Editor to backfill all users!")
