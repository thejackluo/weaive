"""
Apply qgoals migration directly to Supabase
Temporary script to work around migration ordering issues
"""
import os
from supabase import create_client, Client

# Read Supabase credentials from environment
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables")
    print("Run: source .env")
    exit(1)

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Read migration SQL
migration_path = "supabase/migrations/20251223120000_create_qgoals_table.sql"
with open(migration_path, 'r') as f:
    sql = f.read()

print(f"📄 Reading migration: {migration_path}")
print(f"🔌 Connecting to: {SUPABASE_URL}")

try:
    # Execute SQL using Supabase RPC (raw SQL execution)
    # Note: Supabase Python SDK doesn't have direct SQL execution
    # We'll need to use psycopg2 instead
    import psycopg2
    from urllib.parse import urlparse

    # Parse Supabase URL to get database connection details
    # Supabase format: https://[project-ref].supabase.co
    # Database format: postgres://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

    project_ref = SUPABASE_URL.replace("https://", "").replace(".supabase.co", "")

    # Extract password from service key (it's embedded in the JWT for direct connections)
    # For Supabase, we need to use the pooler connection
    db_host = f"db.{project_ref}.supabase.co"
    db_port = 5432
    db_name = "postgres"
    db_user = "postgres"

    # The service key is actually the password for direct connections
    # But we need the actual postgres password from Supabase dashboard
    print("\n⚠️  Direct SQL execution requires database password from Supabase dashboard")
    print("Go to: Settings → Database → Connection string")
    print("Get the password and set it as SUPABASE_DB_PASSWORD")

    db_password = os.getenv("SUPABASE_DB_PASSWORD")
    if not db_password:
        print("\n❌ Missing SUPABASE_DB_PASSWORD")
        print("Get it from Supabase dashboard: Settings → Database")
        exit(1)

    # Connect to database
    print(f"🔌 Connecting to PostgreSQL: {db_host}:{db_port}/{db_name}")
    conn = psycopg2.connect(
        host=db_host,
        port=db_port,
        database=db_name,
        user=db_user,
        password=db_password
    )

    print("✅ Connected to database")
    print("🚀 Applying migration...")

    # Execute migration
    cur = conn.cursor()
    cur.execute(sql)
    conn.commit()

    print("✅ Migration applied successfully!")

    # Verify table creation
    cur.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'qgoals'")
    result = cur.fetchone()

    if result and result[0] > 0:
        print("✅ qgoals table exists in database")
    else:
        print("❌ qgoals table not found after migration")

    # Close connection
    cur.close()
    conn.close()

    print("\n✅ All done! qgoals table is ready.")

except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
    exit(1)
