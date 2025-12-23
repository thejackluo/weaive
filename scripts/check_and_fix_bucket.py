#!/usr/bin/env python3
"""
Check and fix goal-memories bucket permissions
"""
from supabase import create_client
import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env from weave-api directory
env_path = Path(__file__).parent.parent / "weave-api" / ".env"
load_dotenv(env_path)

# Remote Supabase connection
SUPABASE_URL = "https://jywfusrgwybljusuofnp.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_KEY:
    print("❌ SUPABASE_SERVICE_KEY not found in .env")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("Checking goal-memories bucket...")

# Check if bucket exists
try:
    buckets = supabase.storage.list_buckets()
    goal_memories_bucket = next((b for b in buckets if b.get('id') == 'goal-memories' or b.get('name') == 'goal-memories'), None)

    if goal_memories_bucket:
        print(f"✅ Bucket exists: {goal_memories_bucket}")
        print(f"   Public: {goal_memories_bucket.get('public')}")
    else:
        print("❌ Bucket does not exist")
        print("Creating bucket...")
        result = supabase.storage.create_bucket(
            'goal-memories',
            options={
                'public': True,
                'file_size_limit': 10485760,
                'allowed_mime_types': ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
            }
        )
        print(f"✅ Bucket created: {result}")

except Exception as e:
    print(f"❌ Error: {e}")

# Check storage policies
print("\nChecking storage policies...")
try:
    response = supabase.table('pg_policies').select('*').eq('tablename', 'objects').execute()
    policies = [p for p in response.data if 'goal-memories' in str(p)]
    print(f"Found {len(policies)} policies related to goal-memories")
    for policy in policies:
        print(f"  - {policy.get('policyname')}")
except Exception as e:
    print(f"Note: Could not check policies: {e}")

print("\n✅ Check complete. If bucket is public=true, images should be accessible.")
print("   If images still don't load, the issue may be with the storage policy requiring authentication.")
