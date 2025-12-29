#!/usr/bin/env python3
"""
Add Test Goal - Quick Data Creation Script

Creates a goal with daily subtask and optional completion history.
Useful for testing consistency tracking and UI states.

Usage:
    cd weave-api && uv run python ../scripts/add-test-goal.py
"""

import os
import sys
from datetime import date, timedelta
from supabase import create_client, Client

TEST_USER_ID = "a6fcb84c-2fa6-4ba9-a621-3a6d74f98009"

def main():
    # Load .env
    env_path = os.path.join(os.path.dirname(__file__), "..", "weave-api", ".env")
    if not os.path.exists(env_path):
        print("❌ .env file not found")
        sys.exit(1)

    url = None
    service_key = None

    with open(env_path) as f:
        for line in f:
            if line.startswith("SUPABASE_URL"):
                url = line.split("=")[1].strip()
            elif line.startswith("SUPABASE_SERVICE_KEY"):
                service_key = line.split("=")[1].strip()

    if not url or not service_key:
        print("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY")
        sys.exit(1)

    print("🔧 Connecting to Supabase with service role...")
    supabase: Client = create_client(url, service_key)

    # Step 1: Create goal
    print("\n📝 Creating goal...")
    goal_response = supabase.table("goals").insert({
        "user_id": TEST_USER_ID,
        "title": "Morning Workout",
        "description": "Exercise daily to build consistency",
        "status": "active",
        "target_date": str(date.today() + timedelta(days=10))
    }).execute()

    goal_id = goal_response.data[0]["id"]
    print(f"✅ Created goal: {goal_id}")

    # Step 2: Create daily subtask
    print("\n📋 Creating daily subtask...")
    template_response = supabase.table("subtask_templates").insert({
        "goal_id": goal_id,
        "title": "Exercise for 30 min",
        "description": "Cardio or strength training",
        "category": "habit",
        "recurrence_pattern": "daily"
    }).execute()

    template_id = template_response.data[0]["id"]
    print(f"✅ Created subtask template: {template_id}")

    # Step 3: Create instances for past 7 days
    print("\n📅 Creating instances for past 7 days...")
    instances = []
    for i in range(7):
        instance_date = date.today() - timedelta(days=i)
        instances.append({
            "user_id": TEST_USER_ID,
            "template_id": template_id,
            "instance_date": str(instance_date),
            "status": "pending"
        })

    instance_response = supabase.table("subtask_instances").insert(instances).execute()
    print(f"✅ Created {len(instance_response.data)} instances")

    # Step 4: Mark 5 out of 7 as completed (skip day 2 and day 5)
    print("\n✅ Marking 5/7 days as completed...")
    completions = []
    skip_days = {2, 5}  # Skip these days

    for i, instance in enumerate(instance_response.data):
        if i not in skip_days:
            instance_date = instance["instance_date"]
            completions.append({
                "user_id": TEST_USER_ID,
                "subtask_instance_id": instance["id"],
                "completed_at": f"{instance_date} 08:00:00",
                "local_date": instance_date,
                "was_today": False,
                "timer_seconds": 1800,  # 30 minutes
                "proof_type": "timer"
            })

    # Use RPC to bypass append-only trigger
    # (Or manually run: ALTER TABLE subtask_completions DISABLE TRIGGER USER)
    try:
        completion_response = supabase.table("subtask_completions").insert(completions).execute()
        print(f"✅ Created {len(completion_response.data)} completions")
    except Exception as e:
        print(f"⚠️  Failed to create completions: {e}")
        print("\n💡 If you see 'append-only table' error, run this SQL manually:")
        print("   ALTER TABLE subtask_completions DISABLE TRIGGER USER;")
        print("   Then re-run this script")
        print("   Then: ALTER TABLE subtask_completions ENABLE TRIGGER USER;")

    # Summary
    print("\n" + "="*60)
    print("✅ SUCCESS - Test goal created!")
    print("="*60)
    print(f"Goal: Morning Workout")
    print(f"Subtask: Exercise for 30 min (daily)")
    print(f"Completion rate: 5/7 days (71%)")
    print("\n📱 Check the mobile app Dashboard to see the new goal!")

if __name__ == "__main__":
    main()
