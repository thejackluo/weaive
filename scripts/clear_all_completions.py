#!/usr/bin/env python3
"""
Clear all bind completions and captures for testing purposes.
Deletes all records from subtask_completions and captures tables.
"""

from supabase import create_client, Client

# Supabase local credentials
SUPABASE_URL = "http://127.0.0.1:54321"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"  # service_role key

def main():
    """Delete all completions and captures using service_role (bypasses RLS)"""
    try:
        # Create Supabase client with service_role key (bypasses RLS)
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

        print("🗑️  Clearing all completions and captures...")

        # Count existing records
        completions_count = len(supabase.table("subtask_completions").select("id").execute().data)
        captures_count = len(supabase.table("captures").select("id").execute().data)

        print(f"   Found {completions_count} completions and {captures_count} captures")

        # Delete all captures first (no foreign key constraints from completions)
        if captures_count > 0:
            supabase.table("captures").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
            print(f"   ✅ Deleted {captures_count} captures")

        # Delete all completions
        if completions_count > 0:
            supabase.table("subtask_completions").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
            print(f"   ✅ Deleted {completions_count} completions")

        print("✅ Database cleared for fresh testing")

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
