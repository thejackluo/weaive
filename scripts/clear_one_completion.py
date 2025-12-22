#!/usr/bin/env python3
"""
Clear one bind completion for testing purposes.
Deletes the most recent completion from subtask_completions table.
"""

import os
from supabase import create_client, Client

# Supabase local credentials
SUPABASE_URL = "http://127.0.0.1:54321"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"  # service_role key

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

        # Use raw SQL to bypass triggers (service_role can execute raw SQL)
        completion_id = completion['id']

        # Execute raw SQL to disable triggers, delete, and re-enable
        sql = f"""
        BEGIN;
        ALTER TABLE subtask_completions DISABLE TRIGGER prevent_update_subtask_completions;
        ALTER TABLE subtask_completions DISABLE TRIGGER prevent_delete_subtask_completions;
        DELETE FROM subtask_completions WHERE id = '{completion_id}';
        ALTER TABLE subtask_completions ENABLE TRIGGER prevent_update_subtask_completions;
        ALTER TABLE subtask_completions ENABLE TRIGGER prevent_delete_subtask_completions;
        COMMIT;
        """

        # Execute via HTTP API (using service role key)
        import requests

        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json"
            },
            json={"query": sql}
        )

        if response.status_code == 200:
            print(f"✅ Deleted completion: {completion_id}")
            print("   You can now retest the bind completion flow")
        else:
            print(f"❌ Failed to delete completion: {response.status_code}")
            print(f"   Response: {response.text}")

    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    main()
