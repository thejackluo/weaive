#!/usr/bin/env python3
"""
Add sample binds for testing Thread flow
Creates a goal, template, and today's instance for testing
"""

import os
import sys
from datetime import date
from pathlib import Path

# Add parent directory to path so we can import from weave-api
sys.path.insert(0, str(Path(__file__).parent.parent / 'weave-api'))

from supabase import create_client, Client

# Load environment variables from weave-api/.env
env_path = Path(__file__).parent.parent / 'weave-api' / '.env'
from dotenv import load_dotenv
load_dotenv(env_path)

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ Missing Supabase credentials in .env")
    sys.exit(1)

# Get user ID from command line or use default
user_email = sys.argv[1] if len(sys.argv) > 1 else None

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print("🔍 Finding user profile...")

# Get user_id from user_profiles
if user_email:
    # Look up by email in auth.users, then get user_profile
    auth_response = supabase.auth.admin.list_users()
    user = next((u for u in auth_response if u.email == user_email), None)

    if not user:
        print(f"❌ User not found with email: {user_email}")
        sys.exit(1)

    auth_user_id = user.id
    print(f"✓ Found auth user: {auth_user_id}")
else:
    # Get the first user profile
    profiles_response = supabase.table('user_profiles').select('id, auth_user_id').limit(1).execute()

    if not profiles_response.data:
        print("❌ No user profiles found. Please create a user first.")
        sys.exit(1)

    auth_user_id = profiles_response.data[0]['auth_user_id']
    print(f"✓ Using first user: {auth_user_id}")

# Get user_profile.id from auth_user_id
profile_response = supabase.table('user_profiles').select('id').eq('auth_user_id', auth_user_id).single().execute()

if not profile_response.data:
    print(f"❌ User profile not found for auth_user_id: {auth_user_id}")
    sys.exit(1)

user_id = profile_response.data['id']
print(f"✓ Found user_profile.id: {user_id}")

# Check if user has an active goal
goals_response = supabase.table('goals').select('id, title').eq('user_id', user_id).eq('status', 'active').limit(1).execute()

if goals_response.data:
    goal = goals_response.data[0]
    goal_id = goal['id']
    print(f"✓ Using existing goal: {goal['title']}")
else:
    # Create a sample goal
    print("📝 Creating sample goal: 'Get Ripped'")
    goal_data = {
        'user_id': user_id,
        'title': 'Get Ripped',
        'why': 'to be healthy and strong',
        'status': 'active',
        'target_consistency_days': 90,
    }
    goal_response = supabase.table('goals').insert(goal_data).execute()
    goal_id = goal_response.data[0]['id']
    print(f"✓ Created goal: {goal_id}")

# Create sample subtask template
print("📝 Creating sample bind template: 'Workout'")
template_data = {
    'user_id': user_id,
    'goal_id': goal_id,
    'title': 'Workout',
    'default_estimated_minutes': 45,
    'difficulty': 8,
    'recurrence_rule': 'FREQ=DAILY;INTERVAL=1',  # Daily recurrence
    'created_by': 'user',
}
template_response = supabase.table('subtask_templates').insert(template_data).execute()
template_id = template_response.data[0]['id']
print(f"✓ Created template: {template_id}")

# Create today's instance
today = date.today().isoformat()
print(f"📝 Creating today's bind instance for {today}")
instance_data = {
    'user_id': user_id,
    'template_id': template_id,
    'goal_id': goal_id,
    'scheduled_for_date': today,
    'status': 'planned',
    'estimated_minutes': 45,
    'sort_order': 1,
}
instance_response = supabase.table('subtask_instances').insert(instance_data).execute()
instance_id = instance_response.data[0]['id']
print(f"✓ Created instance: {instance_id}")

print("\n✅ Sample bind created successfully!")
print("\n📱 Now you can test:")
print("   1. Refresh Thread Home → See 'Workout' bind")
print("   2. Tap bind → Open BindScreen")
print("   3. Use timer → Track time")
print("   4. Complete bind → Check completion flow")
