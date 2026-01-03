"""
Script to populate historical consistency data for testing

Adds subtask_completions for previous days to achieve target consistency percentage
"""

import os
import sys
from datetime import datetime, timedelta
import random
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
env_path = Path(__file__).parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(env_path)
    print(f"✅ Loaded environment from {env_path}")
else:
    print(f"⚠️  .env file not found at {env_path}")

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase import create_client


def main():
    """Populate historical consistency data"""
    # Get Supabase credentials from environment
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

    # Debug: print what we got
    print(f"Debug: SUPABASE_URL = {supabase_url[:50] if supabase_url else 'None'}")
    print(f"Debug: SUPABASE_SERVICE_KEY = {'***' if supabase_key else 'None'}")

    if not supabase_url or not supabase_key:
        print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
        # Try loading again with override
        from dotenv import load_dotenv
        load_dotenv(override=True)
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

        if not supabase_url or not supabase_key:
            print("❌ Still not loaded after retry")
            sys.exit(1)
        else:
            print("✅ Loaded on retry")

    # Create Supabase client
    supabase = create_client(supabase_url, supabase_key)

    # Target consistency percentage
    TARGET_CONSISTENCY = 0.85

    print("🎯 Target consistency: 85%")
    print("=" * 60)

    # Get user profiles
    users_response = supabase.table("user_profiles").select("*").execute()

    if not users_response.data:
        print("❌ No users found in database")
        sys.exit(1)

    # More efficient: Query all templates with user info in one go
    all_templates_response = (
        supabase.table("subtask_templates")
        .select("id, title, user_id, user_profiles!inner(display_name)")
        .execute()
    )

    # Group by user_id
    from collections import defaultdict
    user_binds_map = defaultdict(list)

    for t in all_templates_response.data:
        user_binds_map[t["user_id"]].append(t)

    if not user_binds_map:
        print("❌ No binds found in database")
        sys.exit(1)

    # Find user with most binds
    users_with_binds = [
        {
            "user_id": uid,
            "bind_count": len(binds),
            "bind_names": [b.get("title", "Unknown") for b in binds[:5]],
            "display_name": binds[0]["user_profiles"]["display_name"] if binds else "Unknown"
        }
        for uid, binds in user_binds_map.items()
    ]

    users_with_binds.sort(key=lambda x: x["bind_count"], reverse=True)

    print(f"\n📊 Top 5 users with binds:")
    for i, uwb in enumerate(users_with_binds[:5], 1):
        print(f"   {i}. {uwb['display_name']} ({uwb['bind_count']} binds): {', '.join(uwb['bind_names'][:3])}")

    # Use the user with most binds
    selected = users_with_binds[0]
    user_id = selected["user_id"]
    print(f"\n👤 Using user: {selected['display_name']} (ID: {user_id}, {selected['bind_count']} binds)")

    # Get full user profile
    user = supabase.table("user_profiles").select("*").eq("id", user_id).single().execute().data

    # Get active subtask templates (binds) for this user
    # Note: is_archived might be NULL for some records, so we check for both False and NULL
    templates_response = (
        supabase.table("subtask_templates")
        .select("*")
        .eq("user_id", user_id)
        .execute()
    )

    if not templates_response.data:
        print("❌ No binds found for user at all")
        sys.exit(1)

    # Filter out archived templates (is_archived = True)
    templates = [t for t in templates_response.data if not t.get("is_archived", False)]

    if not templates:
        print(f"❌ No active binds found (total binds: {len(templates_response.data)}, all archived)")
        sys.exit(1)

    print(f"📝 Found {len(templates)} active binds:")
    for t in templates:
        # Try different field names (name, title, display_name, etc.)
        bind_name = t.get('name') or t.get('title') or t.get('display_name') or t.get('id', 'Unknown')
        print(f"   - {bind_name}")

    # Calculate date range (last 7 days including today)
    today = datetime.now().date()
    dates = [(today - timedelta(days=i)).isoformat() for i in range(6, -1, -1)]

    print(f"\n📅 Date range: {dates[0]} to {dates[-1]}")

    # Get or create subtask_instances for each template and date
    print(f"\n🔍 Checking for existing instances...")

    instances_map = {}  # (template_id, date) -> instance_id

    for date in dates:
        for template in templates:
            # Check if instance exists for this template+date
            instance_response = (
                supabase.table("subtask_instances")
                .select("id")
                .eq("template_id", template["id"])
                .eq("user_id", user_id)
                .eq("scheduled_for_date", date)
                .limit(1)
                .execute()
            )

            if instance_response.data:
                instance_id = instance_response.data[0]["id"]
            else:
                # Create instance
                new_instance = (
                    supabase.table("subtask_instances")
                    .insert({
                        "template_id": template["id"],
                        "user_id": user_id,
                        "scheduled_for_date": date,
                        "status": "planned",
                        "estimated_minutes": 30,  # Default estimate
                    })
                    .execute()
                )
                instance_id = new_instance.data[0]["id"]

            instances_map[(template["id"], date)] = instance_id

    print(f"✅ Prepared {len(instances_map)} instances")

    # Get existing completions for these dates
    existing_response = (
        supabase.table("subtask_completions")
        .select("local_date, subtask_instance_id, subtask_instances!inner(template_id)")
        .eq("user_id", user_id)
        .in_("local_date", dates)
        .execute()
    )

    existing_completions = {
        (item["subtask_instances"]["template_id"], item["local_date"])
        for item in existing_response.data
    }

    print(f"✅ Existing completions: {len(existing_completions)}")

    # Calculate total scheduled and target completions
    total_scheduled = len(templates) * len(dates)
    target_completions = int(total_scheduled * TARGET_CONSISTENCY)

    print(f"\n📊 Calculation:")
    print(f"   Total scheduled: {total_scheduled} (binds: {len(templates)} × days: {len(dates)})")
    print(f"   Target completions: {target_completions} ({TARGET_CONSISTENCY:.0%})")
    print(f"   Already completed: {len(existing_completions)}")
    print(f"   Need to add: {max(0, target_completions - len(existing_completions))}")

    # Generate all possible (date, template) pairs
    all_pairs = [(date, template) for date in dates for template in templates]

    # Filter out existing completions
    missing_pairs = [
        (date, template)
        for date, template in all_pairs
        if (template["id"], date) not in existing_completions
    ]

    # Calculate how many more completions we need
    completions_needed = target_completions - len(existing_completions)

    if completions_needed <= 0:
        print(f"\n✨ Already at {TARGET_CONSISTENCY:.0%} consistency!")
        actual_consistency = (len(existing_completions) / total_scheduled) * 100
        print(f"   Current: {actual_consistency:.1f}%")
        return

    # Randomly select completions to add (to achieve target consistency)
    random.shuffle(missing_pairs)
    pairs_to_complete = missing_pairs[:completions_needed]

    print(f"\n📝 Adding {len(pairs_to_complete)} completions...")

    # Create completions
    added_count = 0
    for date, template in pairs_to_complete:
        try:
            # Get instance ID from map
            instance_id = instances_map[(template["id"], date)]

            # Create subtask_completions entry
            completion_data = {
                "user_id": user_id,
                "subtask_instance_id": instance_id,
                "local_date": date,
                "completed_at": f"{date}T12:00:00Z",  # Noon UTC for historical data
            }

            supabase.table("subtask_completions").insert(completion_data).execute()
            added_count += 1

            # Progress indicator
            if added_count % 5 == 0:
                print(f"   Added {added_count}/{len(pairs_to_complete)}...")

        except Exception as e:
            bind_name = template.get('title') or template.get('name') or template.get('id', 'Unknown')
            print(f"   ⚠️  Failed to add completion for {bind_name} on {date}: {e}")

    print(f"\n✅ Successfully added {added_count} completions!")

    # Calculate final consistency
    final_completions = len(existing_completions) + added_count
    final_consistency = (final_completions / total_scheduled) * 100

    print(f"\n🎉 Final consistency: {final_consistency:.1f}%")
    print(f"   Total completions: {final_completions}/{total_scheduled}")


if __name__ == "__main__":
    main()
