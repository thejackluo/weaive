"""
Generate today's subtask_instances from active subtask_templates.

This script should normally run as a daily cron job, but can be run manually
to generate instances for today.
"""

import sys
from datetime import date, datetime
from pathlib import Path

# Add weave-api to path
sys.path.insert(0, str(Path(__file__).parent.parent / "weave-api"))

from app.core.config import settings
from supabase import create_client


def generate_todays_binds():
    """Generate subtask_instances for today from templates"""

    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    today = date.today().isoformat()

    print(f"🚀 Generating binds for {today}...")

    # IMPORTANT: Only get templates for ACTIVE goals (not archived)
    # Step 1: Get all active goal IDs
    active_goals_response = supabase.table('goals').select('id').eq('status', 'active').execute()
    active_goal_ids = [g['id'] for g in active_goals_response.data]

    if not active_goal_ids:
        print("⚠️  No active goals found. Skipping bind generation.")
        return

    print(f"✅ Found {len(active_goal_ids)} active goals")

    # Step 2: Get templates ONLY for active goals
    templates_response = supabase.table('subtask_templates').select(
        'id, title, goal_id, user_id, recurrence_rule, default_estimated_minutes'
    ).in_('goal_id', active_goal_ids).execute()

    templates = templates_response.data
    print(f"📝 Found {len(templates)} templates")

    # Filter templates that should generate an instance today
    daily_templates = []
    for template in templates:
        recurrence = template.get('recurrence_rule', '')
        # Simple check for DAILY recurrence (TODO: proper RRULE parsing)
        if 'DAILY' in recurrence or not recurrence:
            daily_templates.append(template)

    print(f"✅ {len(daily_templates)} templates should generate instances today")

    # Check if instances already exist for today
    existing_response = supabase.table('subtask_instances').select('template_id').eq(
        'scheduled_for_date', today
    ).execute()

    existing_template_ids = {i['template_id'] for i in existing_response.data}
    print(f"⏭️  {len(existing_template_ids)} instances already exist for today")

    # Generate instances for templates that don't have one yet
    instances_to_create = []
    for template in daily_templates:
        if template['id'] not in existing_template_ids:
            instance = {
                'user_id': template['user_id'],
                'goal_id': template['goal_id'],
                'template_id': template['id'],
                'scheduled_for_date': today,
                'status': 'planned',  # Valid enum: 'planned', not 'pending'
                'estimated_minutes': template.get('default_estimated_minutes', 30),
                'sort_order': 0,
            }
            instances_to_create.append(instance)

    if instances_to_create:
        print(f"➕ Creating {len(instances_to_create)} new instances...")

        # Insert in batches of 100
        batch_size = 100
        created_count = 0

        for i in range(0, len(instances_to_create), batch_size):
            batch = instances_to_create[i:i + batch_size]
            response = supabase.table('subtask_instances').insert(batch).execute()
            created_count += len(response.data)
            print(f"  ✅ Created batch {i//batch_size + 1}: {len(response.data)} instances")

        print(f"✅ Successfully created {created_count} instances for today!")
    else:
        print("✅ All instances for today already exist!")

    # Summary
    final_count_response = supabase.table('subtask_instances').select('*', count='exact').eq(
        'scheduled_for_date', today
    ).execute()

    print(f"\n📊 Summary:")
    print(f"   Total instances for {today}: {final_count_response.count}")


if __name__ == '__main__':
    generate_todays_binds()
