#!/usr/bin/env python3
"""
Clear today's journal entry for testing
"""

from supabase import create_client
from datetime import date

# Local Supabase connection
SUPABASE_URL = "http://127.0.0.1:54321"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"

def main():
    print("🗑️  Clearing today's journal entry...\n")

    # Initialize Supabase client
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    try:
        # Get today's date
        today = date.today().isoformat()

        # Delete journal entry for today
        response = supabase.table("journal_entries").delete().eq("local_date", today).execute()

        if response.data:
            print(f"✅ Deleted {len(response.data)} journal entry(s) for {today}")
            for entry in response.data:
                print(f"   - Journal ID: {entry['id']}")
        else:
            print(f"ℹ️  No journal entries found for {today}")

        print("\n🎉 You can now create a fresh reflection!")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1

    return 0

if __name__ == "__main__":
    exit(main())
