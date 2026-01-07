#!/usr/bin/env python3
"""
Quick script to check user account data for debugging.
Checks auth users, profiles, and onboarding state.
"""
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

email = input("Enter email to check (or press Enter for eddie.lou24@gmail.com): ").strip()
if not email:
    email = "eddie.lou24@gmail.com"

print(f"\n=== CHECKING USER: {email} ===\n")

# Check auth.users
auth_users = supabase.auth.admin.list_users()
auth_user = None
for user in auth_users:
    if hasattr(user, 'email') and user.email == email:
        auth_user = user
        break

if not auth_user:
    print(f"  ❌ No auth.users record found for {email}")
    sys.exit(0)

print(f"  ✅ Auth User ID: {auth_user.id}")

# Check user_profiles
profile_response = supabase.table("user_profiles").select("*").eq("auth_user_id", str(auth_user.id)).execute()

if not profile_response.data:
    print("  ❌ No user_profile found")
    sys.exit(0)

profile = profile_response.data[0]
print(f"  ✅ Profile ID: {profile['id']}")
print(f"  📝 Onboarding Completed: {profile.get('onboarding_completed', 'N/A')}")
print(f"  📅 Created: {profile.get('created_at', 'N/A')}")

# Note: in_app_onboarding_state and tutorial_complete_shown are stored in AsyncStorage on device
# They are NOT stored in the database
print("\n  ℹ️  Tutorial state is stored in device AsyncStorage, not in database:")
print("     - @weave:in_app_onboarding_state")
print("     - @weave:tutorial_complete_shown")
print("\n  To reset tutorial: Sign out from the app (clears AsyncStorage flags)")
