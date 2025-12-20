"""
Script to help diagnose why a user is getting 404 errors.
This decodes their JWT token and checks if their auth_user_id exists in user_profiles.
"""

import sys

import jwt
from supabase import create_client

from app.core.config import settings


def decode_jwt(token: str) -> dict:
    """Decode a JWT token without verification (for debugging)."""
    try:
        # Decode without verification first to see the payload
        unverified = jwt.decode(token, options={"verify_signature": False})
        print("✅ JWT decoded successfully (unverified)")
        print(f"   Payload: {unverified}")

        # Now try to verify the signature
        try:
            verified = jwt.decode(token, settings.SUPABASE_JWT_SECRET, algorithms=["HS256"])
            print("✅ JWT signature is valid")
            return verified
        except jwt.InvalidSignatureError:
            print("⚠️  JWT signature is INVALID (wrong secret or tampered token)")
            print("   Using unverified payload for diagnosis...")
            return unverified
        except jwt.ExpiredSignatureError:
            print("⚠️  JWT has EXPIRED")
            print("   Using expired payload for diagnosis...")
            return unverified

    except Exception as e:
        print(f"❌ Failed to decode JWT: {e}")
        sys.exit(1)


def check_user_profile(auth_user_id: str):
    """Check if a user_profile exists for this auth_user_id."""
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

    result = supabase.table('user_profiles').select('*').eq('auth_user_id', auth_user_id).execute()

    if result.data:
        profile = result.data[0]
        print("\n✅ USER PROFILE EXISTS!")
        print(f"   ID: {profile['id']}")
        print(f"   auth_user_id: {profile['auth_user_id']}")
        print(f"   preferred_name: {profile.get('preferred_name', 'None')}")
        print(f"   created_at: {profile['created_at']}")
        return True
    else:
        print("\n❌ USER PROFILE NOT FOUND")
        print(f"   auth_user_id '{auth_user_id}' does not exist in user_profiles table")
        print("\n🔍 Checking auth.users...")

        # Check if user exists in auth.users
        try:
            auth_result = supabase.auth.admin.get_user_by_id(auth_user_id)
            if auth_result:
                print(f"   ✅ User EXISTS in auth.users (email: {auth_result.user.email})")
                print("   ⚠️  But NO user_profile was created (trigger might have failed)")
                print("\n💡 SOLUTION: Create user_profile with migration:")
                print("      INSERT INTO user_profiles (auth_user_id, timezone, locale)")
                print(f"      VALUES ('{auth_user_id}', 'America/Los_Angeles', 'en-US');")
        except Exception:
            print("   ❌ User does NOT exist in auth.users either")
            print("   This JWT is for a non-existent user!")

        return False


def main():
    """Main diagnostic function."""
    print("="*60)
    print("🔍 User JWT Token Diagnostic Tool")
    print("="*60)

    if len(sys.argv) < 2:
        print("\n❌ Usage: python check_user_token.py <JWT_TOKEN>")
        print("\nTo get your JWT token from the mobile app:")
        print("1. Open mobile app and go to Settings or Profile")
        print("2. Add console.log to print: supabase.auth.session()?.access_token")
        print("3. Copy the token and paste it here")
        print("\nExample:")
        print("  python check_user_token.py eyJhbGci...")
        sys.exit(1)

    token = sys.argv[1]

    print(f"\n📝 Token (first 50 chars): {token[:50]}...")
    print(f"📝 Token length: {len(token)} characters")

    # Decode JWT
    print("\n" + "="*60)
    print("STEP 1: Decode JWT Token")
    print("="*60)
    payload = decode_jwt(token)

    # Extract auth_user_id
    auth_user_id = payload.get('sub')
    if not auth_user_id:
        print("❌ JWT does not contain 'sub' claim (auth_user_id)")
        sys.exit(1)

    print(f"\n✅ Extracted auth_user_id: {auth_user_id}")

    # Check user profile
    print("\n" + "="*60)
    print("STEP 2: Check User Profile in Database")
    print("="*60)
    profile_exists = check_user_profile(auth_user_id)

    # Summary
    print("\n" + "="*60)
    print("📊 DIAGNOSIS SUMMARY")
    print("="*60)

    if profile_exists:
        print("✅ JWT is valid and user_profile exists")
        print("✅ Identity bootup endpoint SHOULD work")
        print("\n🔍 If you're still getting 404 errors:")
        print("   1. Check mobile app is calling: http://localhost:8000/api/onboarding/identity-bootup")
        print("   2. Check mobile app is sending: Authorization: Bearer <token>")
        print("   3. Check backend logs for the request")
    else:
        print("❌ User profile is missing - THIS IS THE PROBLEM")
        print("\n💡 SOLUTION: Create the missing user_profile")
        print("   Run this SQL in Supabase SQL Editor:")
        print("\n   INSERT INTO user_profiles (auth_user_id, timezone, locale)")
        print(f"   VALUES ('{auth_user_id}', 'America/Los_Angeles', 'en-US');")


if __name__ == "__main__":
    main()
