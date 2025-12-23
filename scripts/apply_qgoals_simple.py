"""
Apply qgoals migration to Supabase using psycopg2
"""
import os

# Database connection using Supabase pooler
# Password is from the dashboard: Settings -> Database -> Connection string
DB_PASSWORD = "TkyLIINyDRklETxyI5tKIg_q78AqcoD"  # From EXPO_PUBLIC_SUPABASE_KEY
PROJECT_REF = "jywfusrgwybljusuofnp"

# Read migration SQL
import os
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
migration_path = os.path.join(project_root, 'supabase/migrations/20251223120000_create_qgoals_table.sql')

with open(migration_path, 'r') as f:
    sql = f.read()

print("📄 Migration loaded")
print("🔌 Connecting to Supabase database...")

try:
    import psycopg2

    # Use pooler connection with service role format
    # Pooler format: user = postgres.{project_ref}
    conn = psycopg2.connect(
        host=f"aws-0-us-west-1.pooler.supabase.com",
        port=6543,  # Pooler port
        database="postgres",
        user=f"postgres.{PROJECT_REF}",
        password=DB_PASSWORD
    )

    print("✅ Connected to database")
    print("🚀 Applying migration...")

    cur = conn.cursor()
    cur.execute(sql)
    conn.commit()

    print("✅ Migration executed successfully!")

    # Verify table creation
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_name = 'qgoals'")
    result = cur.fetchone()

    if result:
        print(f"✅ Table '{result[0]}' exists in database")

        # Check columns
        cur.execute("""
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'qgoals'
            ORDER BY ordinal_position
        """)
        columns = cur.fetchall()
        print(f"📊 Table has {len(columns)} columns:")
        for col in columns:
            print(f"   - {col[0]}: {col[1]}")
    else:
        print("❌ Table not found after migration")

    cur.close()
    conn.close()

    print("\n✅ qgoals table is ready!")

except ImportError:
    print("❌ psycopg2 not installed")
    print("Run: uv add psycopg2-binary")
    exit(1)
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
    exit(1)
