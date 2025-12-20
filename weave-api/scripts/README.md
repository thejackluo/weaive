# Backend Utility Scripts

This directory contains utility scripts for testing, debugging, and data management during development.

---

## 🧪 Testing & Validation Scripts

### `test_identity_bootup.py`

**Purpose:** Comprehensive backend API test for identity bootup endpoint

**What it does:**
- Tests POST `/api/onboarding/identity-bootup` with all existing user_profiles
- Generates valid JWT tokens for each test user
- Makes real API requests and validates responses
- Reports success/failure for each user

**Usage:**
```bash
cd weave-api
PYTHONPATH=/Users/eddielou/weavelight/weave-api uv run python scripts/test_identity_bootup.py
```

**Expected output:**
```
✅ Successful: 18/18
❌ Failed: 0/18
```

**When to use:**
- After backend code changes to verify API still works
- After database migrations to verify data integrity
- To validate all existing users can complete identity bootup

---

## 🔍 Debugging Scripts

### `check_user_token.py`

**Purpose:** JWT token analyzer and user profile checker

**What it does:**
- Decodes JWT tokens (with and without signature verification)
- Extracts `auth_user_id` from token payload
- Checks if user_profile exists in database for that auth_user_id
- Provides SQL to create missing profile if needed

**Usage:**
```bash
cd weave-api
PYTHONPATH=/Users/eddielou/weavelight/weave-api uv run python scripts/check_user_token.py <JWT_TOKEN>
```

**Example:**
```bash
# Get JWT token from mobile app console logs
uv run python scripts/check_user_token.py eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Expected output:**
```
=== STEP 1: Decode JWT Token ===
✅ JWT decoded successfully
   Payload: {...}
✅ JWT signature is valid

=== STEP 2: Check User Profile in Database ===
✅ USER PROFILE EXISTS!
   ID: 9970a1a5-e645-4dd5-a9e3-3a687a61ba61
   auth_user_id: 87f831eb-6568-44d1-8500-558de9f78074
```

**When to use:**
- User experiencing 401 Unauthorized or 404 Not Found errors
- Need to verify JWT token is valid
- Need to check if user_profile exists for an auth_user_id
- Troubleshooting authentication issues

---

## 🛠️ Data Management Scripts

### `create_user_profile.py`

**Purpose:** Interactive utility to manually create a user_profile for a specific user

**What it does:**
- Prompts for auth_user_id (from JWT token or auth.users table)
- Checks if user_profile already exists
- Creates user_profile with default values if missing

**Usage:**
```bash
cd weave-api
uv run python scripts/create_user_profile.py
```

**Example:**
```bash
$ uv run python scripts/create_user_profile.py
Enter the auth_user_id (from auth.users table or JWT token): 87f831eb-6568-44d1-8500-558de9f78074
✅ Created user_profile for 87f831eb-6568-44d1-8500-558de9f78074
   User ID: 9970a1a5-e645-4dd5-a9e3-3a687a61ba61
```

**When to use:**
- Single user experiencing 404 errors due to missing profile
- Quick fix during development/testing
- Creating test users manually

**⚠️ Note:** For production, use the migration or database trigger instead of this script.

---

### `backfill_user_profiles.py`

**Purpose:** Instructional script for backfilling missing user_profiles

**What it does:**
- Prints SQL to backfill user_profiles for all existing auth users
- Does NOT execute anything - just prints instructions

**Usage:**
```bash
cd weave-api
uv run python scripts/backfill_user_profiles.py
```

**Output:**
```
💡 To fix the 404 error:
   SQL:
   INSERT INTO user_profiles (auth_user_id, timezone)
   SELECT id::text, 'America/Los_Angeles'
   FROM auth.users
   WHERE id::text NOT IN (SELECT auth_user_id FROM user_profiles);

✨ Run this SQL in your Supabase SQL Editor to backfill all users!
```

**When to use:**
- Multiple existing auth users are missing user_profiles
- After fixing a broken database trigger
- Initial setup when adding user_profiles feature to existing project

**⚠️ Note:** Use the migration file `20251220130000_backfill_user_profiles.sql` instead for tracked database changes.

---

## 📊 Quick Reference

| Script | Purpose | Requires DB | Interactive | Production Safe |
|--------|---------|-------------|-------------|-----------------|
| `test_identity_bootup.py` | Test API endpoint | ✅ | ❌ | ✅ (read-only) |
| `check_user_token.py` | Debug JWT tokens | ✅ | ❌ | ✅ (read-only) |
| `create_user_profile.py` | Create single profile | ✅ | ✅ | ⚠️ (use migration in prod) |
| `backfill_user_profiles.py` | Print backfill SQL | ❌ | ❌ | ⚠️ (use migration in prod) |

---

## 🚨 Production Notes

**For production environments:**

1. **Use migrations, not scripts** for database changes:
   - `supabase/migrations/20251220130000_backfill_user_profiles.sql`

2. **Ensure database trigger is working** to auto-create profiles:
   ```sql
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS trigger AS $$
   BEGIN
     INSERT INTO public.user_profiles (auth_user_id, timezone, locale)
     VALUES (new.id::text, 'America/Los_Angeles', 'en-US')
     ON CONFLICT (auth_user_id) DO NOTHING;
     RETURN new;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW
     EXECUTE FUNCTION public.handle_new_user();
   ```

3. **Monitoring:** Set up alerts for 404/401 errors in identity bootup endpoint

4. **Testing:** Run `test_identity_bootup.py` in CI/CD after deployments

---

## 🔗 Related Documentation

- **Integration Tests:** `tests/integration/test_identity_bootup_integration.py`
- **API Endpoint:** `app/api/onboarding.py` (POST /api/onboarding/identity-bootup)
- **Service Layer:** `app/services/onboarding.py` (store_identity_bootup)
- **Data Models:** `app/models/onboarding.py` (IdentityBootupData)
- **Migrations:** `supabase/migrations/20251220000001_add_identity_bootup_fields.sql`
- **Debugging:** `_bmad-output/401-solution-story-1.6.md` (comprehensive troubleshooting guide)

---

## 💡 Tips

**Getting a JWT token from mobile app:**
1. Add debug button in mobile app (already done in identity-bootup.tsx)
2. Run `debugAuthState()` from mobile console
3. Copy the full JWT token from logs
4. Use with `check_user_token.py`

**Finding auth_user_id:**
- From JWT token: Use `check_user_token.py`
- From Supabase Dashboard: Go to Authentication → Users → Click user → Copy UUID
- From mobile app logs: Look for "auth_user_id" in debug output

**Common Issues:**
- **401 Unauthorized:** Invalid JWT signature → Check SUPABASE_JWT_SECRET matches
- **404 Not Found:** Missing user_profile → Use `create_user_profile.py` or migration
- **422 Validation Error:** Invalid trait names → Check backend allowed_traits list

---

## 🧹 Maintenance

**These scripts should be:**
- ✅ Version controlled (committed to git)
- ✅ Documented (this README)
- ✅ Reviewed when API changes
- ❌ NOT used in production (use migrations/triggers instead)

**Last Updated:** 2025-12-20 (Story 1.6 implementation)
