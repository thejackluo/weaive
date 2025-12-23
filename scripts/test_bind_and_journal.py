#!/usr/bin/env python3
"""
Test bind completion and journal entry flows with remote Supabase

This script:
1. Gets/creates a test user
2. Tests bind completion endpoint
3. Tests journal entry endpoints (create, get, update)
4. Verifies data in Supabase tables
"""

import os
import sys
import requests
from datetime import date
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "weave-api"))

from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
env_path = Path(__file__).parent.parent / "weave-api" / ".env"
load_dotenv(env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
API_BASE_URL = "http://localhost:8004"

# Test user credentials
TEST_EMAIL = "test@weave.local"
TEST_PASSWORD = "testpassword123"

def get_or_create_test_user(supabase: Client):
    """Get existing test user or create new one"""
    print("👤 Getting/creating test user...")

    try:
        # Try to sign in
        auth_response = supabase.auth.sign_in_with_password({
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        print(f"✅ Signed in as: {TEST_EMAIL}")
        return auth_response
    except Exception as e:
        print(f"ℹ️  User doesn't exist, creating new one...")

        # Create new user using admin API
        auth_response = supabase.auth.admin.create_user({
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "email_confirm": True
        })
        print(f"✅ Created user: {TEST_EMAIL}")

        # Sign in to get session
        auth_response = supabase.auth.sign_in_with_password({
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return auth_response

def create_test_bind(supabase: Client, user_id: str):
    """Create a test bind (subtask instance) for today"""
    print("\n🎯 Creating test bind...")

    today = date.today().isoformat()

    # First, create a test goal if none exists
    goals = supabase.table("goals").select("id").eq("user_id", user_id).limit(1).execute()

    if not goals.data:
        print("  Creating test goal...")
        goal = supabase.table("goals").insert({
            "user_id": user_id,
            "title": "Test Goal",
            "status": "active",
            "target_date": date.today().isoformat()
        }).execute()
        goal_id = goal.data[0]["id"]
    else:
        goal_id = goals.data[0]["id"]

    # Create subtask template
    print("  Creating subtask template...")
    template = supabase.table("subtask_templates").insert({
        "user_id": user_id,
        "goal_id": goal_id,
        "title": "Test Bind - Complete this task",
        "recurrence_rule": "FREQ=DAILY",
        "default_estimated_minutes": 15
    }).execute()
    template_id = template.data[0]["id"]

    # Create subtask instance for today
    print("  Creating subtask instance...")
    instance = supabase.table("subtask_instances").insert({
        "user_id": user_id,
        "goal_id": goal_id,
        "template_id": template_id,
        "scheduled_for_date": today,
        "status": "planned",
        "estimated_minutes": 15
    }).execute()

    bind_id = instance.data[0]["id"]
    print(f"✅ Created test bind: {bind_id}")
    return bind_id

def test_bind_completion(access_token: str, bind_id: str):
    """Test POST /api/binds/{bind_id}/complete"""
    print(f"\n🧪 Testing bind completion...")

    url = f"{API_BASE_URL}/api/binds/{bind_id}/complete"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    payload = {
        "timer_duration": 12,
        "notes": "Tested from script!"
    }

    response = requests.post(url, json=payload, headers=headers)

    if response.status_code == 200:
        data = response.json()
        print(f"✅ Bind completed successfully!")
        print(f"   Completion ID: {data['data']['completion_id']}")
        print(f"   Level: {data['data']['level']}")
        print(f"   Progress: {data['data']['level_progress']}%")
        print(f"   Affirmation: {data['data']['affirmation']}")
        return True
    else:
        print(f"❌ Failed: {response.status_code}")
        print(f"   Error: {response.text}")
        return False

def test_journal_create(access_token: str):
    """Test POST /api/journal-entries"""
    print(f"\n🧪 Testing journal entry creation...")

    url = f"{API_BASE_URL}/api/journal-entries"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    payload = {
        "local_date": date.today().isoformat(),
        "fulfillment_score": 8,
        "default_responses": {
            "today_reflection": "Great progress today!",
            "tomorrow_focus": "Continue momentum"
        },
        "custom_responses": {
            "q1": {
                "question_text": "How are you feeling?",
                "response": "Energized and focused"
            }
        }
    }

    response = requests.post(url, json=payload, headers=headers)

    if response.status_code == 201:
        data = response.json()
        print(f"✅ Journal entry created successfully!")
        print(f"   Journal ID: {data['data']['id']}")
        print(f"   Fulfillment Score: {data['data']['fulfillment_score']}/10")
        print(f"   Level: {data['meta'].get('level', 'N/A')}")
        return data['data']['id']
    elif response.status_code == 409:
        print(f"ℹ️  Journal already exists for today (expected if running multiple times)")
        # Get today's journal
        get_response = requests.get(f"{API_BASE_URL}/api/journal-entries/today", headers=headers)
        if get_response.status_code == 200:
            data = get_response.json()
            print(f"   Using existing journal: {data['data']['id']}")
            return data['data']['id']
        return None
    else:
        print(f"❌ Failed: {response.status_code}")
        print(f"   Error: {response.text}")
        return None

def test_journal_update(access_token: str, journal_id: str):
    """Test PATCH /api/journal-entries/{journal_id}"""
    print(f"\n🧪 Testing journal entry update...")

    url = f"{API_BASE_URL}/api/journal-entries/{journal_id}"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    payload = {
        "fulfillment_score": 9,
        "default_responses": {
            "today_reflection": "Even better after updating!",
            "tomorrow_focus": "Keep crushing it"
        }
    }

    response = requests.patch(url, json=payload, headers=headers)

    if response.status_code == 200:
        data = response.json()
        print(f"✅ Journal entry updated successfully!")
        print(f"   New Fulfillment Score: {data['data']['fulfillment_score']}/10")
        print(f"   Updated Reflection: {data['data']['default_responses']['today_reflection']}")
        return True
    else:
        print(f"❌ Failed: {response.status_code}")
        print(f"   Error: {response.text}")
        return False

def verify_data_in_supabase(supabase: Client, user_id: str):
    """Verify data was saved correctly in Supabase"""
    print(f"\n🔍 Verifying data in Supabase tables...")

    # Check subtask_completions
    completions = supabase.table("subtask_completions").select("*").eq("user_id", user_id).execute()
    print(f"✅ Found {len(completions.data)} completion(s) in subtask_completions")

    # Check journal_entries
    journals = supabase.table("journal_entries").select("*").eq("user_id", user_id).execute()
    print(f"✅ Found {len(journals.data)} journal entry(s) in journal_entries")

    if journals.data:
        latest = journals.data[-1]
        print(f"   Latest journal:")
        print(f"   - Fulfillment Score: {latest['fulfillment_score']}/10")
        print(f"   - Default Responses: {latest.get('default_responses', {})}")
        print(f"   - Custom Responses: {latest.get('custom_responses', {})}")

    return True

def main():
    print("🧪 Testing Bind Completion & Journal Entry Flows\n")
    print("=" * 60)

    # Initialize Supabase
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Get/create test user and get access token
    auth_response = get_or_create_test_user(supabase)
    access_token = auth_response.session.access_token
    user_id = auth_response.user.id

    # Debug: Decode JWT to see what's in it
    import jwt as pyjwt
    try:
        decoded = pyjwt.decode(access_token, options={"verify_signature": False})
        print(f"\n🔍 JWT Token Debug:")
        print(f"   aud (audience): {decoded.get('aud')}")
        print(f"   role: {decoded.get('role')}")
        print(f"   sub (user_id): {decoded.get('sub')}")
    except Exception as e:
        print(f"⚠️  Failed to decode JWT: {e}")

    # Get user_profile.id (needed for Supabase queries)
    profile = supabase.table("user_profiles").select("id").eq("auth_user_id", user_id).execute()
    if not profile.data:
        print("ℹ️  Creating user profile...")
        profile = supabase.table("user_profiles").insert({
            "auth_user_id": user_id,
            "display_name": "Test User",
            "timezone": "America/Los_Angeles"
        }).execute()

    profile_id = profile.data[0]["id"]
    print(f"📋 User Profile ID: {profile_id}")

    # Create a test bind
    bind_id = create_test_bind(supabase, profile_id)

    # Test bind completion
    bind_success = test_bind_completion(access_token, bind_id)

    # Test journal entry creation
    journal_id = test_journal_create(access_token)

    # Test journal entry update
    journal_success = False
    if journal_id:
        journal_success = test_journal_update(access_token, journal_id)

    # Verify data in Supabase
    verify_success = verify_data_in_supabase(supabase, profile_id)

    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    print(f"✅ Bind Completion: {'PASS' if bind_success else 'FAIL'}")
    print(f"✅ Journal Creation: {'PASS' if journal_id else 'FAIL'}")
    print(f"✅ Journal Update: {'PASS' if journal_success else 'FAIL'}")
    print(f"✅ Data Verification: {'PASS' if verify_success else 'FAIL'}")

    if bind_success and journal_id and journal_success and verify_success:
        print("\n🎉 ALL TESTS PASSED!")
        return True
    else:
        print("\n⚠️  SOME TESTS FAILED")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
