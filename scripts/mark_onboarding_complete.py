#!/usr/bin/env python3
"""
Mark test user onboarding as complete
"""

from supabase import create_client

# Local Supabase connection
SUPABASE_URL = "http://127.0.0.1:54321"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"  # Service role key

def main():
    print("🔧 Marking test user onboarding as complete...\n")

    # Initialize Supabase client
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    try:
        # Update user profile
        response = supabase.table("user_profiles").update({
            "onboarding_completed": True
        }).eq("auth_user_id", "f0f2ec6a-695b-4e61-bf84-ea9817824502").execute()

        if response.data:
            print(f"✅ Updated profile: {response.data[0]['id']}")
            print(f"   onboarding_completed: {response.data[0].get('onboarding_completed')}")
            print("\n🎉 Test user can now access main app without onboarding!")
        else:
            print("❌ Failed to update profile")
            return 1

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1

    return 0

if __name__ == "__main__":
    exit(main())
