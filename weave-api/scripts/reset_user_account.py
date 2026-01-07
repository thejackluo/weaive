#!/usr/bin/env python3
"""
Reset User Account - Clean Slate

Deletes all user data while keeping the user_profiles record intact.
This allows the user to log in again with a clean slate.

Usage:
    PYTHONPATH=. uv run python scripts/reset_user_account.py <email>

Example:
    PYTHONPATH=. uv run python scripts/reset_user_account.py eddie@example.com
"""

import os
import sys
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Supabase connection
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def reset_user_account(email: str):
    """Reset user account data while keeping user_profiles intact."""

    print(f"\n{'='*80}")
    print(f"🔄 Resetting account for: {email}")
    print(f"{'='*80}\n")

    # Step 1: Get auth_user_id from Supabase Auth by email
    try:
        # Use admin API to list users (requires service role key)
        auth_response = supabase.auth.admin.list_users()

        # Find user with matching email
        auth_user = None
        for user in auth_response:
            if hasattr(user, 'email') and user.email == email:
                auth_user = user
                break

        if not auth_user:
            print(f"❌ No auth user found with email: {email}")
            return

        auth_user_id = str(auth_user.id)
        print(f"✅ Found auth user: {email}")
        print(f"   - auth_user_id: {auth_user_id}")

    except Exception as e:
        print(f"❌ Error fetching auth user: {e}")
        return

    # Step 2: Get user_profile.id from auth_user_id
    try:
        profile_response = (
            supabase.table("user_profiles")
            .select("id, display_name")
            .eq("auth_user_id", auth_user_id)
            .single()
            .execute()
        )

        if not profile_response.data:
            print(f"❌ No user profile found for auth_user_id: {auth_user_id}")
            return

        user_id = profile_response.data["id"]
        display_name = profile_response.data.get("display_name", email)

        print(f"✅ Found user profile: {display_name}")
        print(f"   - user_id: {user_id}")
        print()

    except Exception as e:
        print(f"❌ Error fetching user profile: {e}")
        return

    print(f"\n🗑️  Deleting user data...\n")

    # Delete from all user-owned tables
    # Order matters: Delete child records before parent records

    tables_to_clear = [
        ("ai_artifacts", "AI artifacts"),
        ("ai_runs", "AI runs"),
        ("triad_tasks", "Triad tasks"),
        ("captures", "Proof captures"),
        ("subtask_completions", "Bind completions"),  # Protected by trigger
        ("subtask_instances", "Bind instances"),      # Protected by trigger
        ("subtask_templates", "Bind templates"),
        ("journal_entries", "Journal entries"),
        ("daily_aggregates", "Daily aggregates"),
        ("goals", "Goals/Needles"),
        ("identity_docs", "Identity documents"),
    ]

    protected_tables = ["subtask_completions", "subtask_instances"]

    for table_name, description in tables_to_clear:
        try:
            result = supabase.table(table_name).delete().eq("user_id", user_id).execute()
            count = len(result.data) if result.data else 0
            print(f"   ✅ Deleted {count:3d} records from {description:20s} ({table_name})")
        except Exception as e:
            if table_name in protected_tables:
                print(f"   ⚠️  Skipped {table_name:30s} (protected by trigger)")
                print(f"      Note: Orphaned records won't appear in UI (parent records deleted)")
            else:
                print(f"   ⚠️  Error deleting from {table_name}: {e}")

    print(f"\n{'='*80}")
    print(f"✅ Account reset complete for {email}")
    print(f"   User can still log in with the same credentials")
    print(f"{'='*80}\n")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python scripts/reset_user_account.py <email>")
        sys.exit(1)
    
    email = sys.argv[1]
    reset_user_account(email)
