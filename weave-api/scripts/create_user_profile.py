"""
Quick script to create user_profile for an existing auth user.
Run with: uv run python create_user_profile.py
"""

import os

from supabase import create_client

# Get user's auth_user_id from frontend logs or ask user
AUTH_USER_ID = input("Enter the auth_user_id (from auth.users table or JWT token): ").strip()

if not AUTH_USER_ID:
    print("❌ No auth_user_id provided")
    exit(1)

# Connect to Supabase
supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])

# Check if user_profile already exists
existing = supabase.table("user_profiles").select("*").eq("auth_user_id", AUTH_USER_ID).execute()

if existing.data:
    print(f"✅ User profile already exists for {AUTH_USER_ID}")
    print(f"   User ID: {existing.data[0]['id']}")
    exit(0)

# Create user_profile
result = (
    supabase.table("user_profiles")
    .insert(
        {
            "auth_user_id": AUTH_USER_ID,
            "timezone": "America/Los_Angeles",
            "locale": "en-US",
        }
    )
    .execute()
)

if result.data:
    print(f"✅ Created user_profile for {AUTH_USER_ID}")
    print(f"   User ID: {result.data[0]['id']}")
else:
    print(f"❌ Failed to create user_profile: {result}")
