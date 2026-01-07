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

emails_to_check = ["elou@college.harvard.edu", "eddie.lou24@gmail.com"]

print("=== CHECKING USER ACCOUNTS ===\n")

for email in emails_to_check:
    print(f"\n📧 {email}")
    print("-" * 60)

    # Check auth.users
    auth_users = supabase.auth.admin.list_users()
    auth_user = None
    for user in auth_users:
        if hasattr(user, 'email') and user.email == email:
            auth_user = user
            break

    if not auth_user:
        print("  ❌ No auth.users record found")
        continue

    print(f"  ✅ Auth User ID: {auth_user.id}")

    # Check user_profiles
    profile_response = supabase.table("user_profiles").select("*").eq("auth_user_id", str(auth_user.id)).execute()

    if not profile_response.data:
        print("  ❌ No user_profile found")
        continue

    profile = profile_response.data[0]
    print(f"  ✅ Profile ID: {profile['id']}")
    print(f"  📝 Onboarding Completed: {profile['onboarding_completed']}")
    print(f"  📅 Created: {profile['created_at']}")
    print(f"  📅 Updated: {profile['updated_at']}")

    # Check if they have any goals
    goals = supabase.table("goals").select("id, title, status").eq("user_id", profile['id']).execute()
    print(f"  🎯 Goals: {len(goals.data)}")
    if goals.data:
        for goal in goals.data:
            print(f"     - {goal['title']} ({goal['status']})")

    # Check if they have completions
    completions = supabase.table("subtask_completions").select("id", count="exact").eq("user_id", profile['id']).execute()
    print(f"  ✓ Completions: {completions.count}")
