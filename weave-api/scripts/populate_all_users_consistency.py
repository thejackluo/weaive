"""
Quick script to populate 85% consistency for ALL users with binds

Much faster - populates data for all users instead of picking one
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
    load_dotenv(override=True)

from supabase import create_client

TARGET_CONSISTENCY = 0.85

def main():
    """Populate 85% consistency for all users with active binds"""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

    if not supabase_url or not supabase_key:
        print("❌ Missing SUPABASE credentials")
        sys.exit(1)

    supabase = create_client(supabase_url, supabase_key)

    # Get all active bind templates
    templates_response = supabase.table("subtask_templates").select("id, title, user_id").execute()

    if not templates_response.data:
        print("❌ No binds found")
        sys.exit(1)

    # Group by user
    from collections import defaultdict
    user_templates = defaultdict(list)
    for t in templates_response.data:
        if not t.get("is_archived", False):
            user_templates[t["user_id"]].append(t)

    print(f"✅ Found {len(user_templates)} users with binds")

    # Date range (last 7 days)
    today = datetime.now().date()
    dates = [(today - timedelta(days=i)).isoformat() for i in range(6, -1, -1)]

    total_added = 0

    # Process each user
    for user_id, templates in user_templates.items():
        try:
            # Ensure instances exist
            for date in dates:
                for template in templates:
                    # Check if instance exists
                    check = supabase.table("subtask_instances").select("id").eq("template_id", template["id"]).eq("scheduled_for_date", date).limit(1).execute()

                    if not check.data:
                        # Create instance
                        supabase.table("subtask_instances").insert({
                            "template_id": template["id"],
                            "user_id": user_id,
                            "scheduled_for_date": date,
                            "status": "planned",
                            "estimated_minutes": 30,
                        }).execute()

            # Get existing completions
            existing = supabase.table("subtask_completions").select("local_date, subtask_instances!inner(template_id)").eq("user_id", user_id).in_("local_date", dates).execute()

            existing_set = {(item["subtask_instances"]["template_id"], item["local_date"]) for item in existing.data}

            # Calculate target
            total_scheduled = len(templates) * len(dates)
            target = int(total_scheduled * TARGET_CONSISTENCY)
            needed = target - len(existing_set)

            if needed <= 0:
                continue

            # Get all instances for this user
            instances = supabase.table("subtask_instances").select("id, template_id, scheduled_for_date").eq("user_id", user_id).in_("scheduled_for_date", dates).execute()

            instances_map = {(i["template_id"], i["scheduled_for_date"]): i["id"] for i in instances.data}

            # Generate missing pairs
            missing = [
                (date, template)
                for date in dates
                for template in templates
                if (template["id"], date) not in existing_set and (template["id"], date) in instances_map
            ]

            random.shuffle(missing)
            to_add = missing[:needed]

            # Add completions
            for date, template in to_add:
                instance_id = instances_map[(template["id"], date)]
                supabase.table("subtask_completions").insert({
                    "user_id": user_id,
                    "subtask_instance_id": instance_id,
                    "local_date": date,
                    "completed_at": f"{date}T12:00:00Z",
                }).execute()
                total_added += 1

            print(f"✅ User {user_id[:8]}... : Added {len(to_add)} completions → {((len(existing_set) + len(to_add)) / total_scheduled * 100):.1f}%")

        except Exception as e:
            print(f"⚠️  User {user_id[:8]}... : Error - {e}")

    print(f"\n🎉 Done! Added {total_added} total completions across all users")


if __name__ == "__main__":
    main()
