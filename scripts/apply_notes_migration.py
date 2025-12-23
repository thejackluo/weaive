#!/usr/bin/env python3
"""
Apply migration to add notes column to subtask_completions
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "weave-api"))

from dotenv import load_dotenv
import psycopg2

env_path = Path(__file__).parent.parent / "weave-api" / ".env"
load_dotenv(env_path)

def main():
    print("🔧 Applying migration: Add notes to subtask_completions\n")

    # Build connection string for direct PostgreSQL access
    # Note: Supabase provides direct postgres connection
    # Format: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

    project_ref = "jywfusrgwybljusuofnp"
    # Get password from service key (it's the JWT, but for direct DB we need the DB password)

    print("⚠️  This requires direct PostgreSQL access.")
    print("   Please run this SQL manually in Supabase Dashboard:\n")
    print("   1. Go to: https://supabase.com/dashboard/project/jywfusrgwybljusuofnp/sql")
    print("   2. Click 'New Query'")
    print("   3. Paste and run:")
    print()
    print("   " + "=" * 60)
    print("   ALTER TABLE subtask_completions")
    print("   ADD COLUMN IF NOT EXISTS notes TEXT;")
    print("   " + "=" * 60)
    print()
    print("   4. Click 'Run'")
    print()
    print("✅ After running, the notes column will be available!")

if __name__ == "__main__":
    main()
