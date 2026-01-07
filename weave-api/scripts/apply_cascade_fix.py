import os
import sys
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ Error: Missing environment variables")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print("=" * 80)
print("Fixing CASCADE DELETE for user_profiles")
print("=" * 80)
print()

# Step 1: Count orphaned profiles before cleanup
orphaned_query = """
SELECT COUNT(*) as count FROM public.user_profiles
WHERE auth_user_id NOT IN (
    SELECT id::text FROM auth.users
);
"""

# Step 2: Clean up orphaned profiles
cleanup_query = """
DELETE FROM public.user_profiles
WHERE auth_user_id NOT IN (
    SELECT id::text FROM auth.users
);
"""

# Step 3: Check existing constraints
check_constraints_query = """
SELECT constraint_name, table_name
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
    AND table_name = 'user_profiles'
    AND constraint_name LIKE '%auth%';
"""

# Step 4: Drop existing FK constraint
drop_constraint_query = """
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_auth_user'
        AND table_name = 'user_profiles'
    ) THEN
        ALTER TABLE public.user_profiles DROP CONSTRAINT fk_auth_user;
        RAISE NOTICE 'Dropped existing fk_auth_user constraint';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'user_profiles_auth_user_id_fkey'
        AND table_name = 'user_profiles'
    ) THEN
        ALTER TABLE public.user_profiles DROP CONSTRAINT user_profiles_auth_user_id_fkey;
        RAISE NOTICE 'Dropped existing user_profiles_auth_user_id_fkey constraint';
    END IF;
END $$;
"""

# Step 5: Add new constraint with CASCADE
add_constraint_query = """
ALTER TABLE public.user_profiles
    ADD CONSTRAINT fk_auth_user_cascade
    FOREIGN KEY (auth_user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;
"""

# Step 6: Verify the constraint
verify_query = """
SELECT rc.constraint_name, rc.delete_rule
FROM information_schema.referential_constraints AS rc
WHERE rc.constraint_name = 'fk_auth_user_cascade';
"""

try:
    # Execute each step
    print("Step 1: Checking for orphaned profiles...")
    # Note: We can't execute raw SQL directly through supabase-py client easily
    # So let's count profiles and auth users separately
    
    profiles_response = supabase.table("user_profiles").select("auth_user_id", count="exact").execute()
    total_profiles = profiles_response.count
    print(f"   Total profiles: {total_profiles}")
    
    auth_users = supabase.auth.admin.list_users()
    total_auth_users = len(auth_users)
    print(f"   Total auth users: {total_auth_users}")
    print(f"   Potentially orphaned: {total_profiles - total_auth_users}")
    print()
    
    # For the SQL operations, we need to use raw SQL execution
    # Unfortunately, supabase-py doesn't provide easy raw SQL access
    # We'll need to create a SQL migration file instead
    
    print("⚠️  Cannot execute raw SQL through Supabase Python client")
    print("📝 Please run the migration manually:")
    print()
    print("Option 1: Using psql (if you have direct database access):")
    print("   psql <connection-string> < ../supabase/migrations/20260107160643_fix_cascade_delete_user_profiles.sql")
    print()
    print("Option 2: Using Supabase Studio:")
    print("   1. Go to https://supabase.com/dashboard/project/<your-project>/sql/new")
    print("   2. Copy the contents of: supabase/migrations/20260107160643_fix_cascade_delete_user_profiles.sql")
    print("   3. Paste and run")
    print()
    print("Option 3: Let me create a workaround using the REST API...")
    
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
