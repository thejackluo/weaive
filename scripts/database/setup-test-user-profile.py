#!/usr/bin/env python3
"""
Setup Test User Profile and Onboarding

Ensures test user has:
- User profile record in user_profiles table
- Onboarding marked as completed
- Basic initial data (optional sample goal)

Usage:
    cd weave-api && uv run python ../scripts/setup-test-user-profile.py
"""

import os
import sys
from datetime import datetime
from supabase import create_client, Client

TEST_USER_ID = "f55cabd7-ee5d-4109-af9e-6baa94726295"
TEST_EMAIL = "test.weave@anthropic.com"
TEST_PASSWORD = "Test1234!"

def main():
    # Load Supabase credentials
    env_path = os.path.join(os.path.dirname(__file__), "..", "weave-mobile", ".env")

    if not os.path.exists(env_path):
        print(f"❌ .env file not found at: {env_path}")
        sys.exit(1)

    # Parse .env file
    url = None
    key = None
    with open(env_path) as f:
        for line in f:
            if line.startswith("EXPO_PUBLIC_SUPABASE_URL"):
                url = line.split("=")[1].strip()
            elif line.startswith("EXPO_PUBLIC_SUPABASE_ANON_KEY"):
                key = line.split("=")[1].strip()

    if not url or not key:
        print("❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env")
        sys.exit(1)

    print("🔧 Connecting to Supabase...")
    supabase: Client = create_client(url, key)

    # Sign in as test user
    print(f"🔐 Signing in as test user...")
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        print(f"✅ Signed in successfully")

        # Update user metadata to mark onboarding complete
        user = auth_response.user
        onboarding_complete = user.user_metadata.get("onboarding_completed", False)
        print(f"   Onboarding status: {'✅ Complete' if onboarding_complete else '❌ Incomplete'}")

        if not onboarding_complete:
            print(f"📝 Marking onboarding as complete in user metadata...")
            supabase.auth.update_user({
                "data": {
                    "onboarding_completed": True
                }
            })
            print(f"✅ Onboarding marked complete!")

    except Exception as e:
        print(f"❌ Failed to sign in: {e}")
        print(f"   Have you confirmed the email address?")
        sys.exit(1)

    # Check if user profile exists
    print(f"🔍 Checking for user profile...")
    profile_exists = False
    profile_id = None
    try:
        response = supabase.table("user_profiles").select("*").eq("auth_user_id", TEST_USER_ID).execute()

        if response.data and len(response.data) > 0:
            profile_exists = True
            profile = response.data[0]
            profile_id = profile['id']
            print(f"✅ User profile exists")
            print(f"   Profile ID: {profile_id}")
            print(f"   Display Name: {profile.get('display_name', 'Not set')}")
            onboarding_complete = profile.get('onboarding_completed_at') is not None
            print(f"   Onboarding: {'✅ Complete' if onboarding_complete else '❌ Incomplete'}")

            # Update display name if not set
            if not profile.get('display_name'):
                print(f"📝 Setting display name...")
                now = datetime.utcnow().isoformat()
                update_data = {
                    "display_name": "Test User",
                    "updated_at": now,
                }
                supabase.table("user_profiles").update(update_data).eq("id", profile_id).execute()
                print(f"✅ Display name set!")
            return
    except Exception as e:
        print(f"⚠️  Error checking profile: {e}")
        print(f"   Creating new profile...")

    # Create user profile
    print(f"📝 Creating user profile...")
    try:
        now = datetime.utcnow().isoformat()
        profile_data = {
            "auth_user_id": TEST_USER_ID,
            "display_name": "Test User",
            "created_at": now,
            "updated_at": now,
        }

        response = supabase.table("user_profiles").insert(profile_data).execute()
        print(f"✅ User profile created successfully!")
        print(f"   Profile ID: {response.data[0]['id']}")
        print(f"   Display Name: Test User")

    except Exception as e:
        print(f"❌ Failed to create profile: {e}")
        sys.exit(1)

    print(f"\n✅ Test user is ready for development!")
    print(f"   Email: {TEST_EMAIL}")
    print(f"   Password: {TEST_PASSWORD}")

if __name__ == "__main__":
    main()
