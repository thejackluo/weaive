"""
Diagnostic script to test identity bootup endpoint with real user data.
This helps us understand why 404 errors are occurring.
"""

from datetime import datetime, timedelta, timezone

import jwt
import requests
from supabase import create_client

from app.core.config import settings


def create_test_jwt_for_existing_user(auth_user_id: str) -> str:
    """Create a valid JWT token for an existing auth_user_id."""
    payload = {
        "sub": auth_user_id,
        "email": f"test-{auth_user_id[:8]}@example.com",
        "role": "authenticated",
        "aud": "authenticated",
        "iat": int(datetime.now(timezone.utc).timestamp()),
        "exp": int((datetime.now(timezone.utc) + timedelta(hours=1)).timestamp()),
    }
    return jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")


def test_identity_bootup_with_user(auth_user_id: str, user_index: int):
    """Test identity bootup endpoint with a specific auth_user_id."""
    print(f"\n{'='*60}")
    print(f"🧪 Test {user_index}: auth_user_id = {auth_user_id}")
    print(f"{'='*60}")

    # Create JWT token
    token = create_test_jwt_for_existing_user(auth_user_id)
    print("✅ Generated JWT token")

    # Test data
    test_data = {
        "preferred_name": f"TestUser{user_index}",
        "core_personality": "supportive_direct",
        "identity_traits": ["Disciplined", "Focused", "Resilient"]
    }

    # Call API
    print("📡 Calling POST /api/onboarding/identity-bootup...")
    response = requests.post(
        "http://localhost:8000/api/onboarding/identity-bootup",
        json=test_data,
        headers={"Authorization": f"Bearer {token}"}
    )

    print(f"📊 Response Status: {response.status_code}")

    if response.status_code == 200:
        print(f"✅ SUCCESS! User {user_index} identity bootup worked!")
        print(f"Response: {response.json()}")
        return True
    else:
        print(f"❌ FAILED with {response.status_code}")
        print(f"Response: {response.text}")
        return False


def main():
    """Test identity bootup with all existing users."""
    print("🔍 Fetching all user_profiles from database...")

    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    profiles = supabase.table('user_profiles').select('id, auth_user_id, preferred_name').order('created_at').execute()

    print(f"Found {len(profiles.data)} user profiles")
    print("\n" + "="*60)
    print("Testing identity bootup endpoint with each user...")
    print("="*60)

    success_count = 0
    failed_auth_user_ids = []

    for i, profile in enumerate(profiles.data, 1):
        auth_user_id = profile['auth_user_id']

        # Skip if already has preferred_name (already went through bootup)
        if profile.get('preferred_name'):
            print(f"\n⏭️  Skipping user {i} (already has preferred_name: {profile['preferred_name']})")
            continue

        success = test_identity_bootup_with_user(auth_user_id, i)

        if success:
            success_count += 1
        else:
            failed_auth_user_ids.append(auth_user_id)

    print("\n" + "="*60)
    print("📊 SUMMARY")
    print("="*60)
    print(f"✅ Successful: {success_count}/{len(profiles.data)}")
    print(f"❌ Failed: {len(failed_auth_user_ids)}/{len(profiles.data)}")

    if failed_auth_user_ids:
        print("\n❌ Failed auth_user_ids:")
        for auth_id in failed_auth_user_ids:
            print(f"   - {auth_id}")


if __name__ == "__main__":
    main()
