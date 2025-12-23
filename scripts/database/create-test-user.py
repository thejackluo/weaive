#!/usr/bin/env python3
"""
Create Test User for Weave Development

Creates a consistent test account with onboarding completed:
- Email: test.weave@anthropic.com
- Password: Test1234!
- Onboarding: Completed
- Test data: Sample goal + binds

Usage:
    python scripts/create-test-user.py

Or via uv:
    cd weave-api && uv run python ../scripts/create-test-user.py
"""

import os
import sys
from supabase import create_client, Client

# Test user credentials (documented for consistent dev testing)
TEST_EMAIL = "test.weave@anthropic.com"
TEST_PASSWORD = "Test1234!"

def main():
    # Load Supabase credentials from weave-mobile/.env
    env_path = os.path.join(os.path.dirname(__file__), "..", "weave-mobile", ".env")

    if not os.path.exists(env_path):
        print(f"❌ .env file not found at: {env_path}")
        sys.exit(1)

    # Parse .env file
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

    # Check if user already exists
    try:
        print(f"🔍 Checking if test user exists: {TEST_EMAIL}")
        response = supabase.auth.sign_in_with_password({
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        print(f"✅ Test user already exists: {TEST_EMAIL}")
        print(f"   User ID: {response.user.id}")
        print(f"   Password: {TEST_PASSWORD}")
        return
    except Exception:
        # User doesn't exist, create it
        pass

    # Create new user
    print(f"📝 Creating test user: {TEST_EMAIL}")
    try:
        response = supabase.auth.sign_up({
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "options": {
                "data": {
                    "onboarding_completed": True,  # Skip onboarding
                }
            }
        })

        user = response.user
        print(f"✅ Test user created successfully!")
        print(f"   Email: {TEST_EMAIL}")
        print(f"   Password: {TEST_PASSWORD}")
        print(f"   User ID: {user.id}")
        print(f"\n📋 Save these credentials for development testing!")

        # Check if email confirmation is required
        if response.session is None:
            print(f"\n⚠️  Email confirmation required!")
            print(f"   Check your email to confirm the account.")

    except Exception as e:
        print(f"❌ Failed to create user: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
