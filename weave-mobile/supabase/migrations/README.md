# Supabase Migrations

This directory contains SQL migrations for the Weave mobile app's Supabase database.

## How to Apply Migrations

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard
2. Select your project
3. Navigate to: **SQL Editor** (left sidebar)
4. Click **+ New Query**
5. Copy and paste the contents of the migration file
6. Click **Run** (or press `Cmd/Ctrl + Enter`)
7. Verify the migration succeeded (no errors in the output)

### Option 2: Via Supabase CLI

```bash
# Navigate to project root
cd weave-mobile

# Initialize Supabase (first time only)
npx supabase init

# Link to your project
npx supabase link --project-ref YOUR_PROJECT_REF

# Apply migration
npx supabase db push --migration-name 20251219_auto_create_user_profiles
```

## Current Migrations

### 20251219_auto_create_user_profiles.sql

**Purpose:** Automatically create user profiles when users sign in via OAuth

**What it does:**
- Creates `user_profiles` table (if it doesn't exist)
- Creates database trigger to auto-create profiles on new auth users
- Enables Row Level Security (RLS) policies
- Handles timezone auto-detection from user metadata

**Status:** ✅ Ready to apply

**Test verification:**
```sql
-- After running migration, verify it worked:

-- 1. Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- 2. Check if function exists
SELECT * FROM pg_proc WHERE proname = 'handle_new_user';

-- 3. Check user profiles are being created
SELECT u.id, u.email, p.auth_user_id, p.timezone, p.created_at
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id::text = p.auth_user_id
ORDER BY u.created_at DESC
LIMIT 5;
```

## Migration Best Practices

1. **Always test migrations in a development/staging environment first**
2. **Back up your database before running migrations in production**
3. **Read the migration SQL carefully before running**
4. **Verify the migration succeeded using the test queries**
5. **Monitor your app logs after applying migrations**

## Rollback

If you need to rollback the `20251219_auto_create_user_profiles` migration:

```sql
-- Drop the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Optionally drop the table (WARNING: This deletes all user profiles!)
-- DROP TABLE IF EXISTS public.user_profiles CASCADE;
```

## Troubleshooting

### Error: "relation user_profiles already exists"

This is safe to ignore if your table already exists. The migration uses `CREATE TABLE IF NOT EXISTS`.

### Error: "trigger already exists"

Run the rollback commands above, then re-run the migration.

### Error: "permission denied for schema public"

You may need to run the migration as a Supabase admin user. Use the Supabase Dashboard SQL Editor (which runs as service_role).

### Profiles not being created automatically

1. Check if trigger exists (see test verification queries above)
2. Check Supabase logs for errors
3. Verify RLS policies are not blocking inserts
4. The app-side fallback will create profiles anyway if the trigger fails
