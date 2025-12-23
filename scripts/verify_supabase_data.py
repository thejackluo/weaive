#!/usr/bin/env python3
"""
Verify data in remote Supabase dashboard

Shows recent records from key tables to confirm data is saving correctly
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "weave-api"))

from dotenv import load_dotenv
from supabase import create_client, Client

env_path = Path(__file__).parent.parent / "weave-api" / ".env"
load_dotenv(env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

def main():
    print("🔍 Verifying Data in Remote Supabase\n")
    print("=" * 60)

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Check user_profiles
    profiles = supabase.table("user_profiles").select("*").execute()
    print(f"\n👤 USER PROFILES ({len(profiles.data)} total)")
    for profile in profiles.data[:5]:  # Show first 5
        print(f"   - {profile['display_name']} (ID: {profile['id'][:8]}...)")

    # Check goals
    goals = supabase.table("goals").select("*").execute()
    print(f"\n🎯 GOALS ({len(goals.data)} total)")
    for goal in goals.data[:5]:
        print(f"   - {goal['title']} (Status: {goal['status']})")

    # Check subtask_instances
    instances = supabase.table("subtask_instances").select("*").order("created_at", desc=True).limit(5).execute()
    print(f"\n📋 SUBTASK INSTANCES (showing recent 5)")
    for instance in instances.data:
        print(f"   - {instance.get('title_override') or 'Untitled'} (Status: {instance['status']}, Date: {instance['scheduled_for_date']})")

    # Check subtask_completions
    completions = supabase.table("subtask_completions").select("*").order("completed_at", desc=True).limit(5).execute()
    print(f"\n✅ SUBTASK COMPLETIONS (showing recent 5)")
    for completion in completions.data:
        print(f"   - Completed at: {completion['completed_at'][:19]}, Duration: {completion.get('duration_minutes', 'N/A')} min")

    # Check journal_entries
    journals = supabase.table("journal_entries").select("*").order("created_at", desc=True).limit(5).execute()
    print(f"\n📖 JOURNAL ENTRIES (showing recent 5)")
    for journal in journals.data:
        print(f"   - Date: {journal['local_date']}, Fulfillment: {journal['fulfillment_score']}/10")
        print(f"     Reflection: {journal.get('default_responses', {}).get('today_reflection', 'N/A')[:50]}...")

    print("\n" + "=" * 60)
    print("✅ Data verification complete!")
    print(f"\n📊 Summary:")
    print(f"   - {len(profiles.data)} user profiles")
    print(f"   - {len(goals.data)} goals")
    print(f"   - {len(supabase.table('subtask_instances').select('id', count='exact').execute().data)} subtask instances")
    print(f"   - {len(completions.data)} completions")
    print(f"   - {len(journals.data)} journal entries")

if __name__ == "__main__":
    main()
