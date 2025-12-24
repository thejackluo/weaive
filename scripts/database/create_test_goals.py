#!/usr/bin/env python3
"""
Create test goals for the current authenticated user.

This script creates 3 example goals for Story 2.1 testing.
Goals persist across app relaunches since they're tied to your real auth user.

Usage:
    python scripts/create_test_goals.py <user_id>

Example:
    python scripts/create_test_goals.py 9970a1a5-e645-4dd5-a9e3-3a687a61ba61
"""

import os
import sys
from datetime import datetime, timedelta
from supabase import create_client, Client

def create_test_goals(user_id: str):
    """Create 3 example goals for the given user."""

    # Initialize Supabase client
    url = os.getenv("SUPABASE_URL", "https://jywfusrgwybljusuofnp.supabase.co")
    key = os.getenv("SUPABASE_SERVICE_KEY")

    if not key:
        print("❌ SUPABASE_SERVICE_KEY not set in environment")
        sys.exit(1)

    supabase: Client = create_client(url, key)

    # Verify user exists
    try:
        user_check = supabase.table("user_profiles").select("id, display_name").eq("id", user_id).single().execute()
        if not user_check.data:
            print(f"❌ User not found: {user_id}")
            sys.exit(1)

        display_name = user_check.data.get("display_name", "User")
        print(f"✅ Found user: {display_name} ({user_id})")
    except Exception as e:
        print(f"❌ Error checking user: {e}")
        sys.exit(1)

    # Check if user already has goals
    existing_goals = supabase.table("goals").select("id, title, status").eq("user_id", user_id).execute()
    if existing_goals.data:
        print(f"\n⚠️  User already has {len(existing_goals.data)} goal(s):")
        for goal in existing_goals.data:
            print(f"   - {goal['title']} (status: {goal['status']})")

        confirm = input("\nDelete existing goals and create new ones? (yes/no): ")
        if confirm.lower() != "yes":
            print("Aborted.")
            sys.exit(0)

        # Delete existing goals (and related data will cascade)
        for goal in existing_goals.data:
            supabase.table("goals").delete().eq("id", goal["id"]).execute()
        print("✅ Deleted existing goals")

    # Create 3 example goals
    now = datetime.utcnow().isoformat()

    goals_data = [
        {
            "user_id": user_id,
            "title": "Build a successful product",
            "description": "Launch MVP, get first 100 users, iterate based on feedback. Focus on solving a real problem.",
            "status": "active",
            "priority": "high",
            "target_date": (datetime.utcnow() + timedelta(days=90)).date().isoformat(),
            "created_at": now,
            "updated_at": now,
        },
        {
            "user_id": user_id,
            "title": "Build consistent daily habits",
            "description": "Exercise 5 days/week, read daily, journal regularly. Small wins compound.",
            "status": "active",
            "priority": "med",
            "target_date": (datetime.utcnow() + timedelta(days=60)).date().isoformat(),
            "created_at": now,
            "updated_at": now,
        },
        {
            "user_id": user_id,
            "title": "Learn new technical skills",
            "description": "Master React Native, FastAPI, and AI integration. Build production-ready apps.",
            "status": "active",
            "priority": "med",
            "target_date": (datetime.utcnow() + timedelta(days=120)).date().isoformat(),
            "created_at": now,
            "updated_at": now,
        },
    ]

    try:
        # Insert goals
        result = supabase.table("goals").insert(goals_data).execute()

        if result.data:
            print(f"\n✅ Created {len(result.data)} goals:")
            for goal in result.data:
                print(f"   - {goal['title']}")
                print(f"     ID: {goal['id']}")
                print(f"     Target: {goal['target_date']}")

            print(f"\n🎉 Success! Refresh your app to see the goals in the Needles screen.")
            print(f"\n💡 These goals are permanently saved and will persist across app relaunches.")
        else:
            print("❌ No goals were created")

    except Exception as e:
        print(f"❌ Error creating goals: {e}")
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python scripts/create_test_goals.py <user_id>")
        print("\nExample:")
        print("  python scripts/create_test_goals.py 9970a1a5-e645-4dd5-a9e3-3a687a61ba61")
        sys.exit(1)

    user_id = sys.argv[1]
    create_test_goals(user_id)
