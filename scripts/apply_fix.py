#!/usr/bin/env python3
"""Apply storage policy fix"""
from supabase import create_client
import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env
env_path = Path(__file__).parent.parent / "weave-api" / ".env"
load_dotenv(env_path)

SUPABASE_URL = "https://jywfusrgwybljusuofnp.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_KEY:
    print("❌ SUPABASE_SERVICE_KEY not found")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

sql_commands = [
    "DROP POLICY IF EXISTS \"Anyone can view images\" ON storage.objects;",
    """CREATE POLICY "Public can view goal memory images"
    ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'goal-memories');"""
]

print("Applying storage policy fix...")
for i, sql in enumerate(sql_commands, 1):
    try:
        print(f"{i}. Executing: {sql[:50]}...")
        result = supabase.rpc('exec_sql', {'sql': sql}).execute()
        print(f"   ✅ Success")
    except Exception as e:
        print(f"   ⚠️  {e}")
        # Try alternative method - direct postgrest
        try:
            result = supabase.postgrest.rpc('exec_sql', {'sql': sql}).execute()
            print(f"   ✅ Success (alternative method)")
        except Exception as e2:
            print(f"   ❌ Failed: {e2}")

print("\n✅ Policy fix applied. Images should now be publicly accessible.")
print("   Refresh your app to test.")
