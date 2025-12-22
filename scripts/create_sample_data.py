#!/usr/bin/env python3
"""
Create sample needles (goals) and binds (subtask instances) for testing
"""

import os
import sys
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "weave-api"))

from dotenv import load_dotenv
from supabase import create_client

env_path = Path(__file__).parent.parent / "weave-api" / ".env"
load_dotenv(env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

def create_sample_data(email: str):
    """Create sample goals and binds for a user"""
    print(f"🎯 Creating sample data for: {email}\n")

    sb = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Get user by email
    user = None
    users = sb.auth.admin.list_users()
    for u in users:
        if u.email == email:
            user = u
            break

    if not user:
        print(f"❌ User not found: {email}")
        return False

    # Get user profile
    profile = sb.table("user_profiles").select("*").eq("auth_user_id", user.id).single().execute()
    user_id = profile.data["id"]

    print(f"✅ Found user: {email}")
    print(f"   Profile ID: {user_id[:8]}...\n")

    today = date.today()

    # Create 3 sample goals (needles)
    goals_data = [
        {
            "user_id": user_id,
            "title": "Build a Fitness Habit",
            "status": "active",
            "target_date": (today + timedelta(days=90)).isoformat(),
            "description": "Exercise consistently and build lasting fitness habits"
        },
        {
            "user_id": user_id,
            "title": "Learn Spanish",
            "status": "active",
            "target_date": (today + timedelta(days=180)).isoformat(),
            "description": "Become conversational in Spanish"
        },
        {
            "user_id": user_id,
            "title": "Ship My Product",
            "status": "active",
            "target_date": (today + timedelta(days=60)).isoformat(),
            "description": "Launch MVP and get first 100 users"
        }
    ]

    print("🎯 Creating needles (goals)...")
    goals = []
    for goal_data in goals_data:
        goal = sb.table("goals").insert(goal_data).execute()
        goals.append(goal.data[0])
        print(f"   ✅ {goal.data[0]['title']}")

    print(f"\n📋 Creating binds (subtask instances) for today...")

    # Create subtask templates and instances for each goal
    binds_data = [
        # Fitness goal
        {
            "goal": goals[0],
            "template_title": "Morning workout - 30 min",
            "estimated_minutes": 30,
        },
        {
            "goal": goals[0],
            "template_title": "Evening stretch - 10 min",
            "estimated_minutes": 10,
        },
        # Spanish goal
        {
            "goal": goals[1],
            "template_title": "Duolingo practice - 15 min",
            "estimated_minutes": 15,
        },
        {
            "goal": goals[1],
            "template_title": "Watch Spanish YouTube video",
            "estimated_minutes": 20,
        },
        # Product goal
        {
            "goal": goals[2],
            "template_title": "Code new feature - 2 hours",
            "estimated_minutes": 120,
        },
        {
            "goal": goals[2],
            "template_title": "User interview",
            "estimated_minutes": 45,
        },
    ]

    for bind_data in binds_data:
        goal = bind_data["goal"]

        # Create template
        template = sb.table("subtask_templates").insert({
            "user_id": user_id,
            "goal_id": goal["id"],
            "title": bind_data["template_title"],
            "recurrence_rule": "FREQ=DAILY",
            "default_estimated_minutes": bind_data["estimated_minutes"]
        }).execute()

        # Create instance for today
        instance = sb.table("subtask_instances").insert({
            "user_id": user_id,
            "goal_id": goal["id"],
            "template_id": template.data[0]["id"],
            "scheduled_for_date": today.isoformat(),
            "status": "planned",
            "estimated_minutes": bind_data["estimated_minutes"]
        }).execute()

        print(f"   ✅ {bind_data['template_title']} (Goal: {goal['title']})")

    print(f"\n🎉 Sample data created!")
    print(f"\n📊 Summary:")
    print(f"   - 3 needles (goals)")
    print(f"   - 6 binds (today's tasks)")
    print(f"\n📱 Check your mobile app - binds should appear on Thread (Home) screen!")

    return True

if __name__ == "__main__":
    email = sys.argv[1] if len(sys.argv) > 1 else "test@gmail.com"
    success = create_sample_data(email)
    sys.exit(0 if success else 1)
