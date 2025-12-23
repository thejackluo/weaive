#!/usr/bin/env python3
"""
Create a test user profile for local development

This script:
1. Creates a test user in Supabase Auth
2. Creates a corresponding user_profile row
3. Prints the credentials for use in the mobile app
"""

import os
from supabase import create_client, Client

# Local Supabase connection
SUPABASE_URL = "http://127.0.0.1:54321"
SUPABASE_KEY = "sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz"  # Service role key

# Test user credentials
TEST_EMAIL = "test@weave.local"
TEST_PASSWORD = "password123"
TEST_NAME = "Eddie"

def main():
    print("🔧 Creating test user profile for local development...\n")

    # Initialize Supabase client with service role key
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    try:
        # Step 1: Create auth user (or get existing)
        print(f"1. Creating auth user: {TEST_EMAIL}")
        try:
            auth_response = supabase.auth.admin.create_user({
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD,
                "email_confirm": True
            })
            auth_user_id = auth_response.user.id
            print(f"   ✅ Created auth user: {auth_user_id}")
        except Exception as e:
            if "already been registered" in str(e) or "duplicate" in str(e).lower():
                # User already exists, get their ID
                print(f"   ℹ️  User already exists, fetching ID...")
                # Sign in to get the user ID
                sign_in_response = supabase.auth.sign_in_with_password({
                    "email": TEST_EMAIL,
                    "password": TEST_PASSWORD
                })
                auth_user_id = sign_in_response.user.id
                print(f"   ✅ Found existing user: {auth_user_id}")
            else:
                raise e

        # Step 2: Check if user_profile already exists
        print(f"\n2. Checking for existing user_profile...")
        existing_profile = supabase.table("user_profiles")\
            .select("*")\
            .eq("auth_user_id", auth_user_id)\
            .execute()

        if existing_profile.data:
            print(f"   ℹ️  Profile already exists: {existing_profile.data[0]['id']}")
            profile_id = existing_profile.data[0]['id']
        else:
            # Create user_profile
            print(f"   Creating user_profile row...")
            profile_data = {
                "auth_user_id": auth_user_id,
                "display_name": TEST_NAME,
                "timezone": "America/Los_Angeles",
                "locale": "en-US"
            }
            profile_response = supabase.table("user_profiles").insert(profile_data).execute()
            profile_id = profile_response.data[0]['id']
            print(f"   ✅ Created profile: {profile_id}")

        # Step 3: Print success message with credentials
        print("\n" + "=" * 60)
        print("✅ SUCCESS! Test user profile created")
        print("=" * 60)
        print("\n📱 Use these credentials in your mobile app:")
        print(f"\n   Email:    {TEST_EMAIL}")
        print(f"   Password: {TEST_PASSWORD}")
        print(f"\n   Auth User ID: {auth_user_id}")
        print(f"   Profile ID:   {profile_id}")
        print("\n" + "=" * 60)
        print("\n💡 Next steps:")
        print("   1. Open your mobile app")
        print("   2. Login with the credentials above")
        print("   3. The app should now work without 500 errors")
        print("\n")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1

    return 0

if __name__ == "__main__":
    exit(main())
