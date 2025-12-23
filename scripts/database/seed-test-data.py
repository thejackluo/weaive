#!/usr/bin/env python3
"""
Seed Test Account with Sample Data

Populates test.weave@anthropic.com with realistic sample data:
- 2 active goals with subtasks
- 30 days of completions
- 7 days of journal entries
- Realistic consistency and fulfillment patterns

Usage:
    cd weave-api && uv run python ../scripts/seed-test-data.py
"""

import os
import sys
from datetime import datetime, timedelta
import random
from supabase import create_client, Client

TEST_USER_ID = "f55cabd7-ee5d-4109-af9e-6baa94726295"
TEST_EMAIL = "test.weave@anthropic.com"
TEST_PASSWORD = "Test1234!"

def main():
    # Load Supabase credentials
    env_path = os.path.join(os.path.dirname(__file__), "..", "weave-mobile", ".env")

    if not os.path.exists(env_path):
        print(f"❌ .env file not found at: {env_path}")
        sys.exit(1)

    # Parse .env file
    url = None
    key = None
    with open(env_path) as f:
        for line in f:
            if line.startswith("EXPO_PUBLIC_SUPABASE_URL"):
                url = line.split("=")[1].strip()
            elif line.startswith("EXPO_PUBLIC_SUPABASE_ANON_KEY"):
                key = line.split("=")[1].strip()

    if not url or not key:
        print("❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env")
        sys.exit(1)

    print("🔧 Connecting to Supabase...")
    supabase: Client = create_client(url, key)

    # Sign in as test user
    print(f"🔐 Signing in as test user...")
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        print(f"✅ Signed in successfully")
    except Exception as e:
        print(f"❌ Failed to sign in: {e}")
        sys.exit(1)

    # Get user profile
    print(f"🔍 Fetching user profile...")
    profile_response = supabase.table("user_profiles").select("*").eq("auth_user_id", TEST_USER_ID).execute()

    if not profile_response.data or len(profile_response.data) == 0:
        print(f"❌ User profile not found. Run setup-test-user-profile.py first.")
        sys.exit(1)

    profile_id = profile_response.data[0]['id']
    print(f"✅ User profile found: {profile_id}")

    # Check if goals already exist
    existing_goals = supabase.table("goals").select("id, title").eq("user_id", profile_id).eq("status", "active").execute()

    if existing_goals.data and len(existing_goals.data) > 0:
        print(f"\n✅ Test data already exists:")
        for goal in existing_goals.data:
            print(f"   - {goal['title']}")
        print(f"\n💡 Test account is ready! Sign in with:")
        print(f"   Email: {TEST_EMAIL}")
        print(f"   Password: {TEST_PASSWORD}")
        return

    # Create Goal 1: Fitness
    print(f"\n📝 Creating sample goals...")
    now = datetime.utcnow().isoformat()

    goal1_data = {
        "user_id": profile_id,
        "title": "Get Fit & Healthy",
        "description": "Build consistent exercise habits and improve overall health",
        "status": "active",
        "created_at": now,
        "updated_at": now,
    }
    goal1 = supabase.table("goals").insert(goal1_data).execute().data[0]
    print(f"✅ Created goal: {goal1['title']} (ID: {goal1['id']})")

    # Create Goal 2: Learning
    goal2_data = {
        "user_id": profile_id,
        "title": "Learn Spanish",
        "description": "Practice Spanish daily to become conversational",
        "status": "active",
        "created_at": now,
        "updated_at": now,
    }
    goal2 = supabase.table("goals").insert(goal2_data).execute().data[0]
    print(f"✅ Created goal: {goal2['title']} (ID: {goal2['id']})")

    # Create subtasks for Goal 1
    print(f"\n📝 Creating subtasks...")
    subtask1_template = {
        "user_id": profile_id,
        "goal_id": goal1['id'],
        "title": "Morning Workout",
        "default_estimated_minutes": 30,
        "difficulty": 5,
        "created_at": now,
    }
    subtask1 = supabase.table("subtask_templates").insert(subtask1_template).execute().data[0]

    subtask2_template = {
        "user_id": profile_id,
        "goal_id": goal2['id'],
        "title": "Duolingo Practice",
        "default_estimated_minutes": 15,
        "difficulty": 3,
        "created_at": now,
    }
    subtask2 = supabase.table("subtask_templates").insert(subtask2_template).execute().data[0]

    print(f"✅ Created {2} subtask templates")

    # Create subtask instances for last 30 days
    print(f"\n📝 Creating subtask instances...")
    instances_created = 0
    for days_ago in range(30):
        date = datetime.utcnow() - timedelta(days=days_ago)
        local_date = date.strftime("%Y-%m-%d")

        # Workout subtask (5x per week - 70% chance per day)
        if random.random() < 0.70:
            is_done = random.random() < 0.80
            instance1 = supabase.table("subtask_instances").insert({
                "user_id": profile_id,
                "template_id": subtask1['id'],
                "goal_id": goal1['id'],
                "scheduled_for_date": local_date,
                "status": "done" if is_done else "planned",
                "estimated_minutes": 30,
                "completed_at": date.isoformat() if is_done else None,
                "created_at": date.isoformat(),
            }).execute().data[0]
            instances_created += 1

            # Complete some instances (80% completion rate)
            if instance1['status'] == "done":
                supabase.table("subtask_completions").insert({
                    "user_id": profile_id,
                    "subtask_instance_id": instance1['id'],
                    "local_date": local_date,
                    "completed_at": date.isoformat(),
                    "duration_minutes": random.randint(25, 35),
                }).execute()

        # Language learning (daily - 90% consistency)
        if random.random() < 0.90:
            is_done = random.random() < 0.85
            instance2 = supabase.table("subtask_instances").insert({
                "user_id": profile_id,
                "template_id": subtask2['id'],
                "goal_id": goal2['id'],
                "scheduled_for_date": local_date,
                "status": "done" if is_done else "planned",
                "estimated_minutes": 15,
                "completed_at": date.isoformat() if is_done else None,
                "created_at": date.isoformat(),
            }).execute().data[0]
            instances_created += 1

            # Complete (85% completion)
            if instance2['status'] == "done":
                supabase.table("subtask_completions").insert({
                    "user_id": profile_id,
                    "subtask_instance_id": instance2['id'],
                    "local_date": local_date,
                    "completed_at": date.isoformat(),
                    "duration_minutes": random.randint(10, 20),
                }).execute()

    print(f"✅ Created {instances_created} subtask instances with completions")

    # Create journal entries for last 7 days
    print(f"\n📝 Creating journal entries...")
    journal_prompts = [
        "What went well today?",
        "What challenged you?",
        "How do you feel about your progress?",
    ]

    for days_ago in range(7):
        date = datetime.utcnow() - timedelta(days=days_ago)
        local_date = date.strftime("%Y-%m-%d")

        # Random fulfillment score (6-9 range with slight variation)
        fulfillment = round(7 + random.uniform(-1, 2), 1)
        fulfillment = max(6.0, min(10.0, fulfillment))

        # Create journal entry
        entry_data = {
            "user_id": profile_id,
            "local_date": local_date,
            "fulfillment_score": int(fulfillment),
            "text": f"Sample journal entry for {local_date}. Feeling good about my progress! Kept up with workouts and Spanish practice.",
            "created_at": date.isoformat(),
        }
        supabase.table("journal_entries").insert(entry_data).execute()

    print(f"✅ Created 7 journal entries with fulfillment scores")

    print(f"\n✅ Test data seeding complete!")
    print(f"   Test Account: {TEST_EMAIL}")
    print(f"   Password: {TEST_PASSWORD}")
    print(f"   Goals: 2 active")
    print(f"   Subtasks: 2 templates, ~60 instances (30 days)")
    print(f"   Journal Entries: 7 days")
    print(f"\n🎉 Dashboard should now display realistic data!")

if __name__ == "__main__":
    main()
