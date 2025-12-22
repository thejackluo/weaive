#!/usr/bin/env python3
"""
Skip onboarding for a user by email
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "weave-api"))

from dotenv import load_dotenv
from supabase import create_client

# Load remote Supabase config
env_path = Path(__file__).parent.parent / "weave-api" / ".env"
load_dotenv(env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

def skip_onboarding(email: str):
    """Mark user as having completed onboarding"""
    print(f"🔧 Skipping onboarding for: {email}\n")

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    try:
        # Get auth user by email
        print(f"1. Looking up user by email...")
        # Sign in to get user info (admin API)
        users = supabase.auth.admin.list_users()

        user = None
        for u in users:
            if u.email == email:
                user = u
                break

        if not user:
            print(f"❌ User not found with email: {email}")
            return False

        auth_user_id = user.id
        print(f"✅ Found user: {auth_user_id}")

        # Get user profile
        print(f"\n2. Getting user profile...")
        profile_response = supabase.table("user_profiles").select("*").eq("auth_user_id", auth_user_id).execute()

        if not profile_response.data:
            print(f"❌ No user profile found for auth_user_id: {auth_user_id}")
            return False

        profile = profile_response.data[0]
        print(f"✅ Found profile: {profile['id']}")
        print(f"   Current onboarding_completed: {profile.get('onboarding_completed', False)}")

        # Update onboarding_completed
        print(f"\n3. Marking onboarding as complete...")
        update_response = supabase.table("user_profiles").update({
            "onboarding_completed": True
        }).eq("id", profile['id']).execute()

        if update_response.data:
            print(f"✅ Updated profile!")
            print(f"   onboarding_completed: {update_response.data[0].get('onboarding_completed')}")
            print("\n🎉 User can now access main app without onboarding!")
            return True
        else:
            print("❌ Failed to update profile")
            return False

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # Get email from command line or use default
    email = sys.argv[1] if len(sys.argv) > 1 else input("Enter user email: ").strip()

    if not email:
        print("❌ Email required")
        sys.exit(1)

    success = skip_onboarding(email)
    sys.exit(0 if success else 1)
