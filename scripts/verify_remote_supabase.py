#!/usr/bin/env python3
"""
Verify remote Supabase connection and keys

Run this after updating .env files with remote keys
"""

import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / "weave-api"))

from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from weave-api/.env
env_path = Path(__file__).parent.parent / "weave-api" / ".env"
load_dotenv(env_path)

def main():
    print("🔍 Verifying Remote Supabase Configuration\n")

    # Check environment variables
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
    jwt_secret = os.getenv("SUPABASE_JWT_SECRET")

    print(f"📍 SUPABASE_URL: {supabase_url}")
    print(f"🔑 SUPABASE_SERVICE_KEY: {supabase_key[:20]}..." if supabase_key else "❌ NOT SET")
    print(f"🔐 SUPABASE_JWT_SECRET: {jwt_secret[:20]}..." if jwt_secret else "❌ NOT SET")
    print()

    # Check for placeholder values
    if not supabase_url or "127.0.0.1" in supabase_url or "localhost" in supabase_url:
        print("❌ ERROR: SUPABASE_URL is not set to remote instance")
        return False

    if not supabase_key or "REPLACE_WITH" in supabase_key or "demo" in supabase_key:
        print("❌ ERROR: SUPABASE_SERVICE_KEY is not set or is a placeholder")
        print("   Get it from: https://supabase.com/dashboard/project/jywfusrgwybljusuofnp/settings/api")
        return False

    if not jwt_secret or "REPLACE_WITH" in jwt_secret or "super-secret" in jwt_secret:
        print("❌ ERROR: SUPABASE_JWT_SECRET is not set or is a placeholder")
        print("   Get it from: https://supabase.com/dashboard/project/jywfusrgwybljusuofnp/settings/api")
        return False

    # Test connection
    print("🔌 Testing connection to remote Supabase...")
    try:
        supabase: Client = create_client(supabase_url, supabase_key)

        # Try to query user_profiles table (should work with service role)
        response = supabase.table("user_profiles").select("id").limit(1).execute()

        print(f"✅ Connection successful! Found {len(response.data)} user profiles")
        print("\n🎉 All checks passed! Remote Supabase is configured correctly.")
        return True

    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        print("\nPossible issues:")
        print("  1. Service role key is incorrect")
        print("  2. Network connectivity issue")
        print("  3. RLS policies blocking access (shouldn't happen with service role)")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
