# Supabase CLI Complete Guide

**Last Updated:** 2025-12-19
**Project:** Weave Mobile App
**Author:** Consolidated from Stories 0.2a, 0.4, and project docs

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Installation & Setup](#installation--setup)
3. [Local Development Workflow](#local-development-workflow)
4. [Working with Migrations](#working-with-migrations)
5. [Seeding Data](#seeding-data)
6. [Row Level Security (RLS)](#row-level-security-rls)
7. [Testing & Validation](#testing--validation)
8. [Cloud Deployment](#cloud-deployment)
9. [Common Commands Reference](#common-commands-reference)
10. [Troubleshooting](#troubleshooting)

---

## Overview

Supabase CLI allows you to develop and test your database locally using **npx** (no Docker Desktop required for basic usage, though Docker is needed for `supabase start`).

### Key Workflows Supported

| Workflow | Tool | Docker Required? |
|----------|------|------------------|
| **Push migrations to cloud** | `npx supabase db push` | ❌ No |
| **Generate TypeScript types** | `npx supabase gen types` | ❌ No |
| **Link to cloud project** | `npx supabase link` | ❌ No |
| **Run local Supabase (full stack)** | `npx supabase start` | ✅ Yes (Docker Desktop) |
| **Reset local database** | `npx supabase db reset` | ✅ Yes (Docker Desktop) |
| **Run tests locally** | `npx supabase test db` | ✅ Yes (Docker Desktop) |

### What You Can Do WITHOUT Docker

1. ✅ Push migrations to Supabase Cloud
2. ✅ Generate TypeScript types from your schema
3. ✅ Link local project to cloud project
4. ✅ Create new migration files
5. ✅ View migration status

### What Requires Docker

1. ❌ Running local Supabase instance (`supabase start`)
2. ❌ Resetting local database (`supabase db reset`)
3. ❌ Running local tests (`supabase test db`)

---

## Installation & Setup

### Prerequisites

```bash
# Node.js 18+ required
node --version

# npx comes with Node.js (no separate install needed)
npx --version
```

### Initialize Supabase in Your Project

```bash
# Navigate to project root
cd weavelight

# Initialize Supabase (creates supabase/ directory)
npx supabase init

# This creates:
# - supabase/config.toml (configuration)
# - supabase/migrations/ (migration files)
# - supabase/seed.sql (seed data)
```

**What gets created:**
- `supabase/config.toml` - Configuration file
- `supabase/migrations/` - Directory for SQL migrations
- `supabase/.gitignore` - Ignores local state

---

## Local Development Workflow

### Option 1: Cloud-Only Development (No Docker)

**Best for:** Quick testing, CI/CD, avoiding Docker overhead

```bash
# 1. Create Supabase project at https://supabase.com

# 2. Link your local project
npx supabase link --project-ref YOUR_PROJECT_REF

# 3. Push migrations to cloud
npx supabase db push

# 4. Test directly against cloud database
# (Use Supabase Studio dashboard or SQL Editor)
```

**Pros:**
- ✅ No Docker required
- ✅ Faster iteration (no local startup time)
- ✅ Test on real cloud infrastructure

**Cons:**
- ❌ Uses production/staging database (not isolated)
- ❌ Requires internet connection
- ❌ Harder to reset to clean state

### Option 2: Local Development with Docker

**Best for:** Isolated testing, offline development, full feature access

```bash
# 1. Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop/

# 2. Start Docker Desktop
# (Wait for green "Engine running" status)

# 3. Start local Supabase
npx supabase start

# This starts:
# - PostgreSQL database (port 54322)
# - PostgREST API (port 54321)
# - Supabase Studio (port 54323)
# - Realtime server
# - Auth server
# - Storage server

# 4. Access local Studio
open http://localhost:54323

# 5. Reset database (apply migrations + seed)
npx supabase db reset
```

**Pros:**
- ✅ Fully isolated environment
- ✅ Fast reset to clean state
- ✅ Offline development
- ✅ Free (no cloud usage)

**Cons:**
- ❌ Requires Docker Desktop
- ❌ Uses ~2GB RAM
- ❌ Slower startup (~30 seconds)

---

## Working with Migrations

### Creating a New Migration

```bash
# Auto-generate migration name with timestamp
npx supabase migration new add_user_badges

# Creates: supabase/migrations/20251219120000_add_user_badges.sql
```

### Migration File Structure

**Naming Convention:** `YYYYMMDDHHMMSS_descriptive_name.sql`

**Example:** `20251218000001_user_profiles.sql`

```sql
-- Migration: user_profiles table
-- Story: 0.2a - Database Schema Core
-- Date: 2025-12-18

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id TEXT UNIQUE NOT NULL,
  display_name TEXT,
  timezone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_auth_id ON user_profiles(auth_user_id);

-- Comments for future developers
COMMENT ON TABLE user_profiles IS 'User profiles linked to Supabase Auth';
COMMENT ON COLUMN user_profiles.timezone IS 'User timezone (CRITICAL for local_date calculations)';
```

### Applying Migrations

#### To Local Database (Docker)

```bash
# Apply all pending migrations
npx supabase db reset

# Or push only new migrations (no reset)
npx supabase db push --local
```

#### To Cloud Database

```bash
# Push all pending migrations to cloud
npx supabase db push

# Dry run (preview changes)
npx supabase db push --dry-run
```

### Checking Migration Status

```bash
# Show applied vs pending migrations
npx supabase migration list

# Output:
#   ✅ 20251218000001_user_profiles.sql (applied)
#   ✅ 20251218000002_identity_docs.sql (applied)
#   ⏳ 20251218000003_goals.sql (pending)
```

### Rolling Back Migrations

**⚠️ WARNING:** Supabase CLI doesn't support automatic rollbacks. You must create down migrations manually.

**Rollback Pattern:**

```sql
-- DOWN MIGRATION (manual)
-- File: supabase/migrations/down/20251218000001_user_profiles_rollback.sql

DROP TABLE IF EXISTS user_profiles CASCADE;
DROP INDEX IF EXISTS idx_user_profiles_auth_id;
```

**To rollback:**
1. Run down migration via Supabase Dashboard SQL Editor
2. Delete migration file from `supabase/migrations/`
3. Re-push: `npx supabase db push`

---

## Seeding Data

### Seed File Location

**File:** `supabase/seed.sql`

**Auto-loaded by:** Configured in `supabase/config.toml` (line 63):

```toml
# supabase/config.toml
[db.seed]
sql_paths = ["./seed.sql"]  # Auto-runs seed.sql on db reset
```

### Creating Test Data

**Example seed.sql:**

```sql
-- Seed Data for Story 0.2
-- 3 test users with realistic relationships

-- User 1: Alex Chen (high consistency)
INSERT INTO user_profiles (id, auth_user_id, display_name, timezone)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'alex_auth_id', 'Alex Chen', 'America/Los_Angeles');

-- User 2: Jordan Smith (inconsistent)
INSERT INTO user_profiles (id, auth_user_id, display_name, timezone)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'jordan_auth_id', 'Jordan Smith', 'America/New_York');

-- User 3: Sam Johnson (new user)
INSERT INTO user_profiles (id, auth_user_id, display_name, timezone)
VALUES
  ('33333333-3333-3333-3333-333333333333', 'sam_auth_id', 'Sam Johnson', 'Europe/London');

-- Goals for Alex
INSERT INTO goals (id, user_id, title, status) VALUES
  ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Get Jacked', 'active'),
  ('a2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Launch Startup', 'active'),
  ('a3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Read 12 Books', 'active');

-- Subtask templates (binds)
INSERT INTO subtask_templates (id, user_id, goal_id, title, default_estimated_minutes) VALUES
  ('b1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Morning workout', 45),
  ('b2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 'Code for 2 hours', 120);

-- Completions (IMMUTABLE)
INSERT INTO subtask_completions (id, subtask_instance_id, user_id, completed_at, local_date, duration_minutes)
VALUES
  ('c1111111-1111-1111-1111-111111111111', 'i1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', NOW(), CURRENT_DATE, 45);
```

### Loading Seed Data

#### Local (Docker)

```bash
# Seed data auto-loads on db reset
npx supabase db reset
```

#### Cloud (Manual)

```bash
# Option 1: Via Supabase Dashboard
# 1. Copy contents of seed.sql
# 2. Paste into SQL Editor
# 3. Click "Run"

# Option 2: Via psql (for automation)
# See docs/dev/psql-setup-guide.md for installation and setup
psql $DATABASE_URL -f supabase/seed.sql
```

### Seed Data Best Practices

1. **Use Fixed UUIDs for test data** (easier debugging)
2. **Create 3 test users minimum** (isolation testing)
3. **Include realistic relationships** (foreign keys, dates)
4. **Test edge cases** (empty states, max constraints)
5. **Document test users** (purpose, behavior)

---

## Row Level Security (RLS)

### Why RLS Matters

RLS is **database-level security** that ensures users can only access their own data, even if application code is buggy.

**Defense Layers:**
1. Network (TLS)
2. Auth (JWT)
3. API Authorization
4. **Database RLS** ← You are here
5. Storage (Signed URLs)

### Enabling RLS on Tables

```sql
-- Enable RLS on a table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

### Creating RLS Policies

#### Pattern 1: User-Owned Data (Standard)

**Use for:** goals, journals, completions, captures

```sql
CREATE POLICY "users_manage_own_data" ON goals
    FOR ALL
    USING (user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    ));
```

**Why the lookup?**
- `auth.uid()` returns Supabase Auth UUID from JWT
- Tables use `user_profiles.id` as foreign key (not `auth.uid()`)
- RLS must look up: `auth.uid() → user_profiles.auth_user_id → user_profiles.id`

**Why `::text` cast?**
- `auth.uid()` returns UUID type
- `user_profiles.auth_user_id` is TEXT type
- Without cast, PostgreSQL type mismatch causes silent failure (0 rows)

#### Pattern 2: Immutable Tables (Append-Only)

**Use for:** subtask_completions (canonical truth)

```sql
-- SELECT: Users can view own completions
CREATE POLICY "users_select_own" ON subtask_completions
    FOR SELECT
    USING (user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text));

-- INSERT: Users can create completions
CREATE POLICY "users_insert_own" ON subtask_completions
    FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text));

-- NO UPDATE/DELETE policies (enforces immutability)
```

#### Pattern 3: Global Read-Only

**Use for:** badges, achievements, app configuration

```sql
-- Anyone can read
CREATE POLICY "anyone_can_read" ON badges
    FOR SELECT
    USING (true);

-- Only service_role can manage
CREATE POLICY "service_role_manages" ON badges
    FOR ALL
    USING (auth.role() = 'service_role');
```

### Testing RLS Policies

#### Manual Testing (Supabase Studio)

```sql
-- Test 1: User A can access own data
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub": "alex_auth_id"}';

SELECT * FROM goals WHERE user_id = '11111111-1111-1111-1111-111111111111';
-- Expected: Returns Alex's goals

-- Test 2: User A CANNOT access User B data
SELECT * FROM goals WHERE user_id = '22222222-2222-2222-2222-222222222222';
-- Expected: Returns empty set (not error)

-- Test 3: User A CANNOT UPDATE completions
UPDATE subtask_completions SET duration_minutes = 999 WHERE user_id = '11111111-1111-1111-1111-111111111111';
-- Expected: 0 rows updated (no UPDATE policy exists)
```

#### Automated Testing (pgTAP)

**File:** `supabase/tests/rls_policies.test.sql`

```sql
-- Test User A can SELECT own data
BEGIN;
SELECT plan(2);

SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub": "alex_auth_id"}';

SELECT is(
  (SELECT COUNT(*)::int FROM goals WHERE user_id = '11111111-1111-1111-1111-111111111111'),
  3,
  'User A can SELECT their own goals'
);

SELECT is(
  (SELECT COUNT(*)::int FROM goals WHERE user_id = '22222222-2222-2222-2222-222222222222'),
  0,
  'User A CANNOT SELECT User B goals'
);

SELECT * FROM finish();
ROLLBACK;
```

**Run tests:**

```bash
# Local (Docker)
npx supabase test db

# Cloud (via Supabase Dashboard)
# Copy test file into SQL Editor and run
```

### RLS Performance Considerations

**Query overhead:** RLS adds 5-10ms to queries (negligible with proper indexes)

**Optimization tips:**
1. **Use composite indexes** on `(user_id, other_column)`
2. **Avoid complex policy logic** (keep lookups simple)
3. **Cache user_id lookups** (Supabase does this automatically)
4. **Test with EXPLAIN ANALYZE** to verify index usage

```sql
-- Check if RLS uses index
EXPLAIN ANALYZE
SELECT * FROM goals WHERE user_id = '11111111-1111-1111-1111-111111111111';

-- Expected: Index Scan on idx_goals_user_id
-- NOT: Seq Scan on goals
```

---

## Testing & Validation

### Schema Validation Script

**File:** `supabase/validate_schema.sql`

**What it checks:**
- ✅ All tables exist
- ✅ All indexes exist
- ✅ All foreign keys exist
- ✅ All triggers exist (immutability, max goals)
- ✅ All enum types exist
- ✅ All constraints exist (UNIQUE, CHECK, NOT NULL)

**Run validation:**

```bash
# Local (Docker)
# See docs/dev/psql-setup-guide.md for psql installation
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/validate_schema.sql

# Cloud
# Option 1: Via psql (automation-friendly)
psql $DATABASE_URL -f supabase/validate_schema.sql

# Option 2: Via Supabase Dashboard SQL Editor
# Copy contents into SQL Editor and run
```

**Expected output:**

```
═══════════════════════════════════════════════════════════════════════
WEAVE DATABASE SCHEMA VALIDATION REPORT
═══════════════════════════════════════════════════════════════════════

CATEGORY       | CHECK_NAME                           | STATUS    | DETAILS
---------------|--------------------------------------|-----------|------------------
ENUMS          | goal_status                          | ✅ PASS  | Enum exists
TABLES         | user_profiles                        | ✅ PASS  | Table exists
TRIGGERS       | prevent_update_subtask_completions   | ✅ PASS  | Immutability trigger

✅ ALL VALIDATION CHECKS PASSED (40/40)
```

### Performance Testing

**File:** `supabase/performance_baseline.sql`

**What it tests:**
- Dashboard query (daily_aggregates)
- Today's binds query (subtask_instances)
- Completion history (subtask_completions)
- Active goals query
- Journal entry lookup
- AI cache lookup (ai_runs)
- Streak calculation (recursive CTE)

**Run performance test:**

```bash
# Local (Docker)
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/performance_baseline.sql

# Cloud
# Copy contents into Supabase Dashboard SQL Editor
```

**Check for:**
- ✅ Uses Index Scan (not Seq Scan)
- ✅ Execution time < target (see story 0.2b)
- ✅ Query plan includes correct index

**Example output:**

```sql
═══════════════════════════════════════════════════════════════════════
PERFORMANCE BASELINE REPORT
═══════════════════════════════════════════════════════════════════════

Query 1: Dashboard Query (daily_aggregates)
Index Scan using idx_daily_aggregates_user_date on daily_aggregates
  (cost=0.15..8.17 rows=1 width=100) (actual time=0.015..0.016 rows=3 loops=1)
Planning Time: 0.123 ms
Execution Time: 0.041 ms
✅ PASS: Uses correct index, execution < 10ms target
```

### Business Rules Testing

**Test max 3 active goals:**

```sql
-- Should succeed (user has 2 active goals)
INSERT INTO goals (user_id, title, status) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Goal 3', 'active');

-- Should FAIL (user now has 3 active goals)
INSERT INTO goals (user_id, title, status) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Goal 4', 'active');
-- Expected error: "Maximum 3 active goals allowed"
```

**Test immutable completions:**

```sql
-- Should FAIL (completions are append-only)
UPDATE subtask_completions SET duration_minutes = 999 WHERE id = '...';
-- Expected error: "subtask_completions is append-only. Cannot UPDATE."

DELETE FROM subtask_completions WHERE id = '...';
-- Expected error: "subtask_completions is append-only. Cannot DELETE."
```

---

## Cloud Deployment

### Linking to Cloud Project

```bash
# Get project ref from Supabase dashboard
# (Format: abcdefghijklmnop)

npx supabase link --project-ref YOUR_PROJECT_REF

# You'll be prompted for database password
# (Find in Supabase Dashboard → Settings → Database)
```

### Pushing Migrations to Production

```bash
# Dry run first (preview changes)
npx supabase db push --dry-run

# If looks good, push for real
npx supabase db push

# Verify migrations applied
npx supabase migration list
```

### Generating TypeScript Types

```bash
# Generate types from cloud database
npx supabase gen types typescript --project-id YOUR_PROJECT_REF > lib/database.types.ts

# Use in your app
import { Database } from '@/lib/database.types';

type Goal = Database['public']['Tables']['goals']['Row'];
```

### Environment-Specific Workflows

**Development:**
```bash
# Use local database
npx supabase start
npx supabase db reset
```

**Staging:**
```bash
# Push to staging project
npx supabase link --project-ref STAGING_PROJECT_REF
npx supabase db push
```

**Production:**
```bash
# Push to production project
npx supabase link --project-ref PROD_PROJECT_REF
npx supabase db push

# Generate types
npx supabase gen types typescript --project-id PROD_PROJECT_REF > lib/database.types.ts
```

---

## Common Commands Reference

### Project Management

```bash
# Initialize Supabase in project
npx supabase init

# Link to cloud project
npx supabase link --project-ref YOUR_PROJECT_REF

# Check current status
npx supabase status
```

### Database Operations

```bash
# Start local Supabase (requires Docker)
npx supabase start

# Stop local Supabase
npx supabase stop

# Reset local database (apply migrations + seed)
npx supabase db reset

# Push migrations to cloud
npx supabase db push

# Dry run (preview changes)
npx supabase db push --dry-run
```

### Migration Management

```bash
# Create new migration
npx supabase migration new migration_name

# List migrations status
npx supabase migration list

# Check for schema diff
npx supabase db diff --schema public
```

### Type Generation

```bash
# Generate TypeScript types
npx supabase gen types typescript --project-id YOUR_PROJECT_REF > lib/database.types.ts

# Generate types from local database
npx supabase gen types typescript --local > lib/database.types.ts
```

### Testing

```bash
# Run database tests (requires Docker)
npx supabase test db

# Run specific test file
npx supabase test db --file supabase/tests/rls_policies.test.sql
```

### Debugging

```bash
# View Supabase logs
npx supabase logs

# View database logs
npx supabase logs db

# View API logs
npx supabase logs api
```

---

## Troubleshooting

### Issue: "Cannot connect to Docker daemon"

**Error:**
```
Error: Cannot connect to the Docker daemon at unix:///var/run/docker.sock
```

**Solution:**
1. Open Docker Desktop
2. Wait for green "Engine running" status
3. Retry command

**Alternative (no Docker):**
- Use cloud-only workflow: `npx supabase db push`

---

### Issue: "Migration already exists"

**Error:**
```
Error: migration 20251218000001_user_profiles.sql already exists
```

**Solution:**
```bash
# Check migration status
npx supabase migration list

# If already applied, skip or rename new migration
npx supabase migration new user_profiles_v2
```

---

### Issue: "Relation already exists"

**Error:**
```
Error: relation "user_profiles" already exists
```

**Solution:**
```bash
# Option 1: Reset database (DELETES ALL DATA)
npx supabase db reset --force

# Option 2: Use IF NOT EXISTS in migrations
CREATE TABLE IF NOT EXISTS user_profiles (...);
```

---

### Issue: "Invalid JWT token"

**Error:**
```
Error: Invalid JWT token
```

**Solution:**
```bash
# Re-link project (refreshes credentials)
npx supabase link --project-ref YOUR_PROJECT_REF

# Or get new access token
npx supabase login
```

---

### Issue: "Performance test shows Seq Scan"

**Error:**
```
Seq Scan on subtask_completions (cost=0.00..35.50 rows=10 width=50)
```

**Solution:**
```sql
-- Update table statistics
ANALYZE subtask_completions;
ANALYZE daily_aggregates;
ANALYZE subtask_instances;

-- Re-run performance test
```

---

### Issue: "RLS policies not working"

**Error:**
```
User A can see User B's data
```

**Solution:**
```sql
-- 1. Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- 2. Check policy exists
SELECT * FROM pg_policies WHERE tablename = 'goals';

-- 3. Test with correct JWT claims
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub": "user_auth_id"}';
```

---

### Issue: "Type generation fails"

**Error:**
```
Error: Could not find schema public
```

**Solution:**
```bash
# Ensure migrations are applied
npx supabase db push

# Verify tables exist
npx supabase db diff --schema public

# Try local generation (if using Docker)
npx supabase gen types typescript --local > lib/database.types.ts
```

---

## Quick Reference Card

### Most Common Workflows

**Local development:**
```bash
npx supabase start      # Start local Supabase
npx supabase db reset   # Apply migrations + seed
open http://localhost:54323  # Open Studio UI
```

**Cloud deployment:**
```bash
npx supabase link --project-ref ABC123
npx supabase db push    # Push migrations
npx supabase gen types typescript --project-id ABC123 > lib/database.types.ts
```

**Migration workflow:**
```bash
npx supabase migration new add_feature
# Edit: supabase/migrations/YYYYMMDDHHMMSS_add_feature.sql
npx supabase db reset   # Test locally
npx supabase db push    # Deploy to cloud
```

**Testing workflow:**
```bash
npx supabase db reset   # Fresh state

# Option 1: Use automation script (recommended)
.\scripts\validate-database.ps1   # Windows PowerShell
./scripts/validate-database.sh    # Linux/macOS

# Option 2: Manual psql commands
# See docs/dev/psql-setup-guide.md for installation
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/validate_schema.sql
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/performance_baseline.sql
```

---

## Additional Resources

### Official Documentation
- **Supabase CLI Docs:** https://supabase.com/docs/guides/cli
- **Local Development:** https://supabase.com/docs/guides/cli/local-development
- **RLS Guide:** https://supabase.com/docs/guides/auth/row-level-security

### Project Documentation
- **Database Schema:** `docs/supabase/docs-database-schema.md`
- **Data Classification:** `docs/supabase/docs-data-classification.md`
- **Query Patterns:** `docs/supabase/docs-query-patterns.md`
- **Story 0.2a (Core Tables):** `docs/stories/0-2a-database-schema-core.md`
- **Story 0.4 (RLS):** `docs/stories/0-4-row-level-security.md`

### Related Guides
- **psql Setup & Automation:** `docs/dev/psql-setup-guide.md` - Install and use psql for automation
- **Architecture Decisions:** `docs/architecture.md`
- **Security Model:** `docs/security-architecture.md`
- **Git Workflow:** `docs/dev/git-workflow-guide.md`

---

**Last Updated:** 2025-12-19
**Maintained by:** Weave Development Team
**Questions?** Check `supabase/README.md` or project documentation
