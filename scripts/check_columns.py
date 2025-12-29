#!/usr/bin/env python3
"""Check if level/XP/streak columns exist on remote database"""

import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'weave-api'))

from dotenv import load_dotenv
load_dotenv()

from supabase import create_client

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

if not supabase_url or not supabase_key:
    print("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env")
    sys.exit(1)

supabase = create_client(supabase_url, supabase_key)

# Try to query the new columns
try:
    result = supabase.table("user_profiles").select("total_xp, level, current_streak, longest_streak").limit(1).execute()
    print(f"✅ Columns exist on remote! Sample: {result.data}")
except Exception as e:
    error_msg = str(e)
    if "column" in error_msg.lower() and "does not exist" in error_msg.lower():
        print(f"❌ Columns missing on remote database")
        print(f"Error: {error_msg}")
        sys.exit(1)
    else:
        print(f"⚠️ Unexpected error: {error_msg}")
        sys.exit(1)
