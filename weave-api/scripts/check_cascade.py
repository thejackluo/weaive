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

# List all users
print("=== AUTH USERS ===")
auth_users = supabase.auth.admin.list_users()
for user in auth_users:
    print(f"Email: {user.email}, auth_user_id: {user.id}")

print("\n=== USER PROFILES ===")
profiles = supabase.table("user_profiles").select("auth_user_id, onboarding_completed, created_at").execute()
for profile in profiles.data:
    print(f"auth_user_id: {profile['auth_user_id']}, onboarding: {profile['onboarding_completed']}, created: {profile['created_at']}")

print("\n=== ORPHANED PROFILES (no matching auth user) ===")
for profile in profiles.data:
    auth_id = profile['auth_user_id']
    found = any(str(u.id) == auth_id for u in auth_users)
    if not found:
        print(f"⚠️  ORPHANED: auth_user_id={auth_id}, onboarding={profile['onboarding_completed']}")
        print(f"    This profile has no matching auth.users record!")
