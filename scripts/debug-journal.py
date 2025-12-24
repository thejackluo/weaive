#!/usr/bin/env python3
"""
Debug script to check journal_entries in Supabase
"""
import os
from supabase import create_client
from datetime import date

# Load from .env
supabase_url = "https://jywfusrgwybljusuofnp.supabase.co"
service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5d2Z1c3Jnd3libGp1c3VvZm5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjAxMzE1MCwiZXhwIjoyMDgxNTg5MTUwfQ.-dtaPlK9fbxn2-2ov7mLRz13GK1IkBL1KKsWFABrxpE"

supabase = create_client(supabase_url, service_key)

today = date.today().isoformat()
print(f"🗓️  Today's date: {today}")
print()

# Check journal entries for today
print("📝 Checking journal_entries for today...")
result = supabase.table("journal_entries").select("id, user_id, local_date, fulfillment_score, created_at").eq("local_date", today).execute()

if result.data:
    print(f"✅ Found {len(result.data)} journal entries for today:")
    for entry in result.data:
        print(f"   - ID: {entry['id']}")
        print(f"     User ID: {entry['user_id']}")
        print(f"     Date: {entry['local_date']}")
        print(f"     Score: {entry['fulfillment_score']}")
        print(f"     Created: {entry['created_at']}")
        print()
else:
    print("❌ No journal entries found for today")
    print()

# Check user profiles
print("👤 Checking user_profiles...")
profiles = supabase.table("user_profiles").select("id, auth_user_id, display_name").limit(5).execute()
if profiles.data:
    print(f"✅ Found {len(profiles.data)} user profiles:")
    for profile in profiles.data:
        print(f"   - Profile ID: {profile['id']}")
        print(f"     Auth User ID: {profile.get('auth_user_id', 'N/A')}")
        print(f"     Name: {profile.get('display_name', 'N/A')}")
        print()
