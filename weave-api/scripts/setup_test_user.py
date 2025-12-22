"""
Setup test user with completed onboarding.
This script finds test.weave@anthropic.com and marks them as onboarding_completed=True.

Run with: uv run python scripts/setup_test_user.py
"""
import os

from supabase import create_client

# Test user email
TEST_USER_EMAIL = "test.weave@anthropic.com"

# Load .env
print("Loading environment variables...")
with open('.env') as f:
    for line in f:
        if '=' in line and not line.strip().startswith('#'):
            key, value = line.strip().split('=', 1)
            os.environ[key] = value

supabase = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_KEY"]
)

print(f"\n🔍 Looking for auth user: {TEST_USER_EMAIL}")

# Step 1: Find the auth user by email using admin API
try:
    # Note: This requires the service role key
    response = supabase.auth.admin.list_users()

    test_user = None
    for user in response:
        if user.email == TEST_USER_EMAIL:
            test_user = user
            break

    if not test_user:
        print(f"❌ Auth user not found: {TEST_USER_EMAIL}")
        print("   Please create this user first via signup.")
        exit(1)

    auth_user_id = str(test_user.id)
    print(f"✅ Found auth user: {auth_user_id}")
    print(f"   Email: {test_user.email}")
    print(f"   Created: {test_user.created_at}")

except Exception as e:
    print(f"❌ Error querying auth users: {e}")
    print("   Trying alternative approach...")

    # Alternative: Query user_profiles to find a match
    # This won't work if the user has no profile yet
    auth_user_id = None

# Step 2: Check if user_profile exists
print("\n🔍 Checking for user_profile...")
existing = supabase.table("user_profiles").select("*").eq("auth_user_id", auth_user_id).execute()

if existing.data:
    # Profile exists - update it
    profile_id = existing.data[0]['id']
    current_status = existing.data[0].get('onboarding_completed', False)

    print("✅ User profile exists:")
    print(f"   Profile ID: {profile_id}")
    print(f"   Current onboarding status: {current_status}")

    if current_status:
        print("\n✅ User already has onboarding_completed=True!")
    else:
        print("\n🔄 Updating onboarding_completed to True...")
        update_result = supabase.table("user_profiles").update({
            "onboarding_completed": True,
            "updated_at": "now()"
        }).eq("id", profile_id).execute()

        if update_result.data:
            print("✅ Updated user profile!")
            print("   onboarding_completed: True")
        else:
            print(f"❌ Failed to update: {update_result}")
else:
    # Profile doesn't exist - create it
    print("⚠️  No user_profile found - creating new profile...")

    create_result = supabase.table("user_profiles").insert({
        "auth_user_id": auth_user_id,
        "timezone": "America/Los_Angeles",
        "locale": "en-US",
        "onboarding_completed": True,  # Skip onboarding for test user
        "selected_painpoints": [],
    }).execute()

    if create_result.data:
        print("✅ Created new user_profile!")
        print(f"   Profile ID: {create_result.data[0]['id']}")
        print("   onboarding_completed: True")
    else:
        print(f"❌ Failed to create profile: {create_result}")

print("\n🎉 Test user setup complete!")
print(f"\nNow try logging in with: {TEST_USER_EMAIL}")
