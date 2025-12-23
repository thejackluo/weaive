#!/usr/bin/env python3
"""
Apply Story 0.9 migrations programmatically
Applies captures storage bucket and AI vision columns
"""

import sys
from pathlib import Path

def execute_migration(migration_file: Path) -> bool:
    """Execute a migration file using PostgreSQL"""
    print(f"\n[*] Reading migration: {migration_file.name}")

    with open(migration_file, 'r', encoding='utf-8') as f:
        sql = f.read()

    print(f"[+] Loaded {len(sql)} characters of SQL")

    try:
        import psycopg2

        # Local Supabase connection (default for development)
        conn_params = {
            'host': '127.0.0.1',
            'port': 54322,
            'database': 'postgres',
            'user': 'postgres',
            'password': 'postgres'
        }

        print(f"[*] Connecting to local Supabase database...")
        conn = psycopg2.connect(**conn_params)
        conn.autocommit = True
        cursor = conn.cursor()

        print(f"[+] Connected, executing migration...")

        # Execute the entire migration
        try:
            cursor.execute(sql)
            print(f"[SUCCESS] Migration completed: {migration_file.name}")
            result = True
        except psycopg2.errors.DuplicateObject as e:
            print(f"[SKIP] Already applied (objects exist): {e}")
            result = True  # Not an error if already applied
        except psycopg2.Error as e:
            print(f"[ERROR] Migration failed: {e}")
            result = False
        finally:
            cursor.close()
            conn.close()

        return result

    except ImportError:
        print("\n[ERROR] psycopg2 not installed.")
        print("Install it with: pip install psycopg2-binary")
        print("Or: uv add psycopg2-binary")
        return False
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Apply Story 0.9 migrations"""
    print("=" * 70)
    print("Story 0.9 Migration Application")
    print("=" * 70)

    # Migration files for Story 0.9
    migrations_dir = Path(__file__).parent.parent / "supabase" / "migrations"
    migrations = [
        migrations_dir / "20251221000001_captures_storage_bucket.sql",
        migrations_dir / "20251221000003_ai_vision_columns.sql",
    ]

    # Check if migrations exist
    for m in migrations:
        if not m.exists():
            print(f"\n[ERROR] Migration file not found: {m}")
            return 1

    # Apply each migration
    success_count = 0
    for migration_file in migrations:
        if execute_migration(migration_file):
            success_count += 1

    # Summary
    print("\n" + "=" * 70)
    print(f"[SUCCESS] Applied {success_count}/{len(migrations)} migrations successfully")
    print("=" * 70)

    if success_count == len(migrations):
        print("\n[SUCCESS] All Story 0.9 migrations applied!")
        print("\nNext steps:")
        print("  1. Restart your backend: cd weave-api && uv run uvicorn app.main:app --reload")
        print("  2. Test image upload from mobile app")
        print("  3. Check Storage bucket: http://127.0.0.1:54323 -> Storage -> captures")
        return 0
    else:
        print("\n[WARNING] Some migrations failed - check errors above")
        return 1

if __name__ == "__main__":
    sys.exit(main())
