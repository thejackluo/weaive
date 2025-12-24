#!/usr/bin/env python3
"""Check specific user profile"""
from supabase import create_client

supabase_url = "https://jywfusrgwybljusuofnp.supabase.co"
service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5d2Z1c3Jnd3libGp1c3VvZm5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjAxMzE1MCwiZXhwIjoyMDgxNTg5MTUwfQ.-dtaPlK9fbxn2-2ov7mLRz13GK1IkBL1KKsWFABrxpE"

supabase = create_client(supabase_url, service_key)

user_id = "a6fcb84c-2fa6-4ba9-a621-3a6d74f98009"

print(f"🔍 Searching for profile with user_profiles.id = {user_id}...")
result = supabase.table("user_profiles").select("*").eq("id", user_id).execute()

if result.data:
    print(f"✅ Found profile:")
    profile = result.data[0]
    print(f"   ID: {profile['id']}")
    print(f"   Auth User ID: {profile.get('auth_user_id', 'N/A')}")
    print(f"   Display Name: {profile.get('display_name', 'N/A')}")
    print(f"   Email: {profile.get('email', 'N/A')}")
else:
    print("❌ Profile not found!")
    print()
    print("⚠️  This means the journal_entries row has an orphaned user_id!")
    print("    The entry exists but references a non-existent user profile.")
