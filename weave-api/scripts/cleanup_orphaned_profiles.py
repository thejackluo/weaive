import os
import sys
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ Error: Missing environment variables")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print("=== CLEANING UP ORPHANED PROFILES ===\n")

# Get all auth users
auth_users = supabase.auth.admin.list_users()
auth_ids = [str(u.id) for u in auth_users]

# Get all profiles
profiles = supabase.table("user_profiles").select("id, auth_user_id, onboarding_completed").execute()

# Find orphaned
orphaned_profiles = [p for p in profiles.data if p['auth_user_id'] not in auth_ids]

if not orphaned_profiles:
    print("✅ No orphaned profiles found!")
    sys.exit(0)

print(f"Found {len(orphaned_profiles)} orphaned profiles:")
for profile in orphaned_profiles:
    print(f"  - ID: {profile['id']}, auth_user_id: {profile['auth_user_id']}, onboarding: {profile['onboarding_completed']}")

print("\nDeleting orphaned profiles...")

for profile in orphaned_profiles:
    user_id = profile['id']

    # Delete related data first
    print(f"\nCleaning up data for profile {user_id}...")

    # Delete in order (children first)
    tables = [
        "ai_artifacts",
        "ai_runs",
        "triad_tasks",
        "daily_aggregates",
        "subtask_templates",
        "subtask_instances",
        "goals",
        "identity_docs"
    ]

    for table in tables:
        try:
            result = supabase.table(table).delete().eq("user_id", user_id).execute()
            if result.data:
                print(f"  ✓ Deleted {len(result.data)} rows from {table}")
        except Exception as e:
            print(f"  ⚠️  Error deleting from {table}: {e}")

    # Finally delete the profile
    try:
        supabase.table("user_profiles").delete().eq("id", user_id).execute()
        print(f"  ✓ Deleted profile {user_id}")
    except Exception as e:
        print(f"  ❌ Error deleting profile: {e}")

print("\n✅ Cleanup complete!")
