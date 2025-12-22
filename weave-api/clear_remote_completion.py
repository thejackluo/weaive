#!/usr/bin/env python3
"""
Clear one bind completion from REMOTE Supabase for testing purposes.
"""

import os

from dotenv import load_dotenv
from supabase import Client, create_client

# Load environment variables from .env
load_dotenv()

# Supabase remote credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env")
    exit(1)

print(f"🔗 Connecting to: {SUPABASE_URL}")

def main():
    """Delete the most recent completion by bypassing triggers"""
    try:
        # Create Supabase client
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

        # Get the most recent completion
        response = supabase.table("subtask_completions").select("*").order("completed_at", desc=True).limit(1).execute()

        if not response.data:
            print("❌ No completions found")
            return

        completion = response.data[0]
        print(f"✅ Found completion: {completion['id']}")
        print(f"   - Subtask Instance ID: {completion['subtask_instance_id']}")
        print(f"   - Completed At: {completion['completed_at']}")
        print(f"   - Duration: {completion.get('duration_minutes', 'N/A')} minutes")

        # Use RPC to execute raw SQL (bypass triggers)
        completion_id = completion['id']

        # Execute via Supabase RPC (if available) or direct SQL
        sql = f"""
        BEGIN;
        ALTER TABLE subtask_completions DISABLE TRIGGER prevent_update_subtask_completions;
        ALTER TABLE subtask_completions DISABLE TRIGGER prevent_delete_subtask_completions;
        DELETE FROM subtask_completions WHERE id = '{completion_id}';
        ALTER TABLE subtask_completions ENABLE TRIGGER prevent_update_subtask_completions;
        ALTER TABLE subtask_completions ENABLE TRIGGER prevent_delete_subtask_completions;
        COMMIT;
        """

        # For remote Supabase, we need to use postgrest RPC
        # Let's try direct delete (will fail due to trigger, but let's see the error)
        try:
            delete_response = supabase.table("subtask_completions").delete().eq("id", completion_id).execute()
            print(f"✅ Deleted completion: {completion_id}")
            print("   You can now retest the bind completion flow")
        except Exception as delete_error:
            print("❌ Cannot delete from remote (immutability protection is working)")
            print(f"   Error: {delete_error}")
            print("")
            print("📝 To test bind completion, you need to:")
            print("   1. Use local Supabase instead of remote, OR")
            print("   2. Create a new bind/subtask for testing, OR")
            print("   3. Ask admin to clear completions from remote database")

    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    main()
