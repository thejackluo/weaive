import os
import sys
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ Error: Missing environment variables")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print("=== CHECKING CASCADE DELETE STATUS ===\n")

# Check auth users
print("AUTH USERS:")
auth_users = supabase.auth.admin.list_users()
for user in auth_users:
    print(f"  Email: {user.email}, ID: {user.id}")

# Check user profiles
print("\nUSER PROFILES:")
profiles = supabase.table("user_profiles").select("auth_user_id, onboarding_completed, created_at").execute()
for profile in profiles.data:
    print(f"  auth_user_id: {profile['auth_user_id']}, onboarding: {profile['onboarding_completed']}")

# Check for orphaned profiles
print("\nORPHANED PROFILES (no matching auth user):")
orphaned_found = False
for profile in profiles.data:
    auth_id = profile['auth_user_id']
    found = any(str(u.id) == auth_id for u in auth_users)
    if not found:
        orphaned_found = True
        print(f"  ⚠️  auth_user_id={auth_id}, onboarding={profile['onboarding_completed']}")

if not orphaned_found:
    print("  ✅ No orphaned profiles found!")

# Check trigger exists
print("\n=== CHECKING TRIGGER ===")
print("Run this in Supabase SQL Editor to verify trigger:")
print("""
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_deleted';
""")
