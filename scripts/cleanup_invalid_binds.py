"""
Cleanup script to remove invalid binds (orphaned or from archived goals).

This ensures only ACTIVE goals show binds on the Thread page.
"""

import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "weave-api"))

from app.core.config import settings
from supabase import create_client


def cleanup_invalid_binds():
    """Remove binds for archived goals and orphaned templates"""

    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    today = date.today().isoformat()

    print(f"🧹 Cleaning up invalid binds for {today}...")

    # Step 1: Get all ACTIVE goal IDs
    active_goals_response = supabase.table('goals').select('id').eq('status', 'active').execute()
    active_goal_ids = [g['id'] for g in active_goals_response.data]

    print(f"✅ Found {len(active_goal_ids)} active goals")

    # Step 2: Delete binds with NULL goal_id (orphaned)
    orphaned_response = supabase.table('subtask_instances').delete().eq(
        'scheduled_for_date', today
    ).is_('goal_id', 'null').execute()

    orphaned_count = len(orphaned_response.data) if orphaned_response.data else 0
    print(f"🗑️  Deleted {orphaned_count} orphaned binds (no goal)")

    # Step 3: Delete binds for archived/deleted goals
    # Get all today's binds with goals
    all_binds = supabase.table('subtask_instances').select('id, goal_id').eq(
        'scheduled_for_date', today
    ).not_.is_('goal_id', 'null').execute()

    archived_bind_ids = []
    for bind in all_binds.data:
        if bind['goal_id'] not in active_goal_ids:
            archived_bind_ids.append(bind['id'])

    if archived_bind_ids:
        # Delete in batches
        for bind_id in archived_bind_ids:
            supabase.table('subtask_instances').delete().eq('id', bind_id).execute()

        print(f"🗑️  Deleted {len(archived_bind_ids)} binds from archived/deleted goals")
    else:
        print("✅ No archived goal binds to delete")

    # Step 4: Verify remaining binds
    remaining_response = supabase.table('subtask_instances').select(
        '*', count='exact'
    ).eq('scheduled_for_date', today).execute()

    print(f"\n📊 Summary:")
    print(f"   Remaining binds for {today}: {remaining_response.count}")
    print(f"   All remaining binds belong to {len(active_goal_ids)} active goals ✅")

    # Show breakdown by goal
    print(f"\n📋 Binds by active goal:")
    for goal_id in active_goal_ids:
        goal_response = supabase.table('goals').select('title').eq('id', goal_id).single().execute()
        goal_title = goal_response.data['title']

        binds_count = supabase.table('subtask_instances').select(
            '*', count='exact'
        ).eq('goal_id', goal_id).eq('scheduled_for_date', today).execute().count

        print(f"   - {goal_title}: {binds_count} binds")


if __name__ == '__main__':
    cleanup_invalid_binds()
