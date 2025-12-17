# Story 0.2a: Database Schema (Core Tables)

**Status:** ready-for-dev
**Epic:** Epic 0 - Foundation
**Points:** 3
**Priority:** CRITICAL (Week 0 - Day 2-3)

---

## Story

**As a** development team,
**I want** to create the Supabase database with the 8 core tables, essential indexes, and migration infrastructure,
**so that** we have a production-ready database schema that supports all MVP features with proper constraints and performance optimization.

---

## Acceptance Criteria

### AC 1: Supabase Project Setup
- [ ] Supabase staging project created
- [ ] Supabase production project created (optional for Week 0, recommended Sprint 1)
- [ ] Project URLs and keys documented in `.env.example`
- [ ] Connection strings tested from both mobile and backend

### AC 2: Migration Files Created (8 Core Tables)
- [ ] `001_user_profiles.sql` - User profile and timezone
- [ ] `002_identity_docs.sql` - Identity document with versioning
- [ ] `003_goals.sql` - Goals with max 3 active constraint
- [ ] `004_subtask_templates.sql` - Reusable bind templates
- [ ] `005_subtask_instances.sql` - Scheduled binds for specific dates
- [ ] `006_subtask_completions.sql` - Immutable completion events (no UPDATE/DELETE triggers)
- [ ] `007_captures.sql` - Proof captures (photos, notes, timers)
- [ ] `008_journal_entries.sql` - Daily reflections with fulfillment scores

### AC 3: Essential Indexes Created
- [ ] Foreign key indexes on all `user_id` columns
- [ ] Composite index on `subtask_instances(user_id, scheduled_for_date)`
- [ ] Composite index on `subtask_completions(user_id, local_date)`
- [ ] Composite index on `captures(user_id, local_date)`
- [ ] Composite index on `journal_entries(user_id, local_date)`
- [ ] Unique constraint on `journal_entries(user_id, local_date)` - one journal per day
- [ ] Index on `goals(user_id, status)` for active goals query

### AC 4: Constraints and Data Integrity
- [ ] `user_profiles.timezone` is NOT NULL (critical for local_date calculations)
- [ ] `goals` max 3 active constraint implemented (CHECK or trigger)
- [ ] `subtask_completions` has trigger preventing UPDATE/DELETE (immutable)
- [ ] `journal_entries.fulfillment_score` CHECK constraint (1-10 range)
- [ ] All enum types created: `goal_status`, `goal_priority`, `subtask_status`, `capture_type`, etc.
- [ ] All foreign keys have ON DELETE CASCADE or ON DELETE SET NULL as appropriate

### AC 5: Migrations Run Successfully
- [ ] All 8 migrations apply cleanly on fresh database
- [ ] Migrations are idempotent (can run multiple times safely)
- [ ] Rollback works for each migration (down migrations created)
- [ ] Migration order is correct (dependencies resolved)
- [ ] No SQL syntax errors in any migration file

### AC 6: Schema Documentation
- [ ] All tables documented in `docs/architecture.md` or `docs/database-schema.md`
- [ ] Primary key, foreign key relationships mapped
- [ ] Indexes documented with query patterns they support
- [ ] Data classification documented (canonical vs. derived)
- [ ] Immutable tables clearly marked (`subtask_completions`)

### AC 7: Verification
- [ ] Can insert test data into all tables
- [ ] Foreign key relationships work correctly
- [ ] Unique constraints prevent duplicate data
- [ ] Enum types work correctly
- [ ] Timestamps default to NOW() correctly

---

## Tasks / Subtasks

### Task 1: Setup Supabase Projects (AC: 1)
- [ ] Create Supabase staging project via dashboard
- [ ] Copy project URL and anon key to `.env` files
- [ ] Test connection from mobile: `npx supabase status`
- [ ] Test connection from backend: `supabase.auth.get_session()`
- [ ] Document project URLs in README

### Task 2: Create Migration Infrastructure (AC: 2, 5)
- [ ] Initialize Supabase migrations locally: `npx supabase init`
- [ ] Configure `supabase/config.toml` with project settings
- [ ] Create migration file structure: `supabase/migrations/`
- [ ] Set up migration naming convention: `YYYYMMDDHHMMSS_description.sql`
- [ ] Create migration runner script for CI/CD

### Task 3: Write Core Table Migrations (AC: 2, 4)

#### Migration 001: user_profiles
```sql
-- 001_user_profiles.sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id TEXT UNIQUE NOT NULL,
  display_name TEXT,
  timezone TEXT NOT NULL,
  locale TEXT DEFAULT 'en-US',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ
);

CREATE INDEX idx_user_profiles_auth_id ON user_profiles(auth_user_id);
```

#### Migration 002: identity_docs
```sql
-- 002_identity_docs.sql
CREATE TABLE identity_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  version INT NOT NULL DEFAULT 1,
  json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, version)
);

CREATE INDEX idx_identity_docs_user_version ON identity_docs(user_id, version DESC);
```

#### Migration 003: goals
```sql
-- 003_goals.sql
CREATE TYPE goal_status AS ENUM ('active', 'paused', 'completed', 'archived');
CREATE TYPE goal_priority AS ENUM ('low', 'med', 'high');

CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status goal_status DEFAULT 'active',
  priority goal_priority DEFAULT 'med',
  start_date DATE,
  target_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_goals_user_status ON goals(user_id, status);

-- Constraint: Max 3 active goals per user
CREATE OR REPLACE FUNCTION check_max_active_goals()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND (
    SELECT COUNT(*) FROM goals
    WHERE user_id = NEW.user_id AND status = 'active' AND id != NEW.id
  ) >= 3 THEN
    RAISE EXCEPTION 'User can have maximum 3 active goals';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_max_active_goals
  BEFORE INSERT OR UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION check_max_active_goals();
```

#### Migration 004: subtask_templates
```sql
-- 004_subtask_templates.sql
CREATE TYPE created_by_type AS ENUM ('user', 'ai');

CREATE TABLE subtask_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  default_estimated_minutes INT NOT NULL,
  difficulty INT CHECK (difficulty >= 1 AND difficulty <= 15),
  recurrence_rule TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_by created_by_type DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subtask_templates_user_goal ON subtask_templates(user_id, goal_id);
```

#### Migration 005: subtask_instances
```sql
-- 005_subtask_instances.sql
CREATE TYPE subtask_status AS ENUM ('planned', 'done', 'skipped', 'snoozed');

CREATE TABLE subtask_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES subtask_templates(id) ON DELETE SET NULL,
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  scheduled_for_date DATE NOT NULL,
  status subtask_status DEFAULT 'planned',
  completed_at TIMESTAMPTZ,
  estimated_minutes INT NOT NULL,
  actual_minutes INT,
  title_override TEXT,
  notes TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subtask_instances_user_date ON subtask_instances(user_id, scheduled_for_date);
CREATE INDEX idx_subtask_instances_status ON subtask_instances(status);
```

#### Migration 006: subtask_completions (IMMUTABLE)
```sql
-- 006_subtask_completions.sql
CREATE TABLE subtask_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subtask_instance_id UUID NOT NULL REFERENCES subtask_instances(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL,
  local_date DATE NOT NULL,
  duration_minutes INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subtask_completions_user_date ON subtask_completions(user_id, local_date);
CREATE INDEX idx_subtask_completions_instance ON subtask_completions(subtask_instance_id);

-- CRITICAL: Prevent UPDATE/DELETE on completion events (immutable event log)
CREATE OR REPLACE FUNCTION prevent_subtask_completion_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'subtask_completions is append-only. Cannot UPDATE or DELETE completion events.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_update_subtask_completions
  BEFORE UPDATE ON subtask_completions
  FOR EACH ROW EXECUTE FUNCTION prevent_subtask_completion_modification();

CREATE TRIGGER prevent_delete_subtask_completions
  BEFORE DELETE ON subtask_completions
  FOR EACH ROW EXECUTE FUNCTION prevent_subtask_completion_modification();
```

#### Migration 007: captures
```sql
-- 007_captures.sql
CREATE TYPE capture_type AS ENUM ('text', 'photo', 'audio', 'timer', 'link');

CREATE TABLE captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type capture_type NOT NULL,
  content_text TEXT,
  storage_key TEXT,
  transcript_text TEXT,
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  subtask_instance_id UUID REFERENCES subtask_instances(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  local_date DATE NOT NULL
);

CREATE INDEX idx_captures_user_date ON captures(user_id, local_date);
CREATE INDEX idx_captures_type ON captures(type);
```

#### Migration 008: journal_entries
```sql
-- 008_journal_entries.sql
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  local_date DATE NOT NULL,
  fulfillment_score INT CHECK (fulfillment_score >= 1 AND fulfillment_score <= 10),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, local_date)
);

CREATE INDEX idx_journal_entries_user_date ON journal_entries(user_id, local_date);
```

### Task 4: Create Rollback Migrations (AC: 5)
- [ ] Create down migration for each table (reverse order: 008 → 001)
- [ ] Test rollback: apply all migrations, then rollback all
- [ ] Verify clean state after rollback (no orphaned tables/types)
- [ ] Document rollback procedure in README

### Task 5: Write Migration Runner (AC: 5)
- [ ] Create script to apply migrations: `scripts/run-migrations.sh`
- [ ] Add migration status checker: `scripts/check-migrations.sh`
- [ ] Add migration history table to track applied migrations
- [ ] Test migrations on fresh Supabase project

### Task 6: Seed Test Data (AC: 7)
- [ ] Create seed data script: `supabase/seed/test_data.sql`
- [ ] Create 1 test user with profile
- [ ] Create 2 test goals (1 active, 1 completed)
- [ ] Create 3 test subtask templates
- [ ] Create 5 test subtask instances for today
- [ ] Create 2 test completions
- [ ] Create 1 test journal entry
- [ ] Create 2 test captures
- [ ] Verify all foreign key relationships work

### Task 7: Schema Documentation (AC: 6)
- [ ] Create or update `docs/database-schema.md` with:
  - ER diagram (Mermaid format)
  - Table descriptions and purposes
  - Key query patterns and why indexes exist
  - Data classification (canonical vs. derived)
  - Immutable tables clearly marked
  - Enum type definitions
- [ ] Document migration process in README
- [ ] Add troubleshooting section for common migration errors

### Task 8: Integration Testing (AC: 7)
- [ ] Test Supabase client connection from mobile app
- [ ] Test Supabase client connection from backend API
- [ ] Run seed data script and verify data loads
- [ ] Test each CRUD operation (SELECT, INSERT, UPDATE, DELETE)
- [ ] Verify max 3 active goals constraint works
- [ ] Verify subtask_completions is truly immutable (UPDATE should fail)
- [ ] Verify unique constraint on journal_entries works
- [ ] Measure query performance baseline (document in story notes)

---

## Dev Notes

### Architecture Alignment

**Database Strategy (from Architecture Doc):**
- **8 Core Tables for MVP**: user_profiles, identity_docs, goals, subtask_templates, subtask_instances, subtask_completions, captures, journal_entries
- **No daily_aggregates yet**: Added in Story 0.2b or later when performance optimization is needed
- **RLS Policies**: **CRITICAL** - Must be implemented in Story 0.4 before alpha release
- **Append-Only Pattern**: `subtask_completions` is immutable - no UPDATE/DELETE ever

**Three-Layer Data Model:**
1. **Static Text DB**: user_profiles, identity_docs (low churn, high read)
2. **Dynamic Text DB**: goals, subtasks, captures, journals (high churn)
3. **Image Storage**: Supabase Storage for proof images (Story 0.9)

### Critical Constraints

**1. Max 3 Active Goals:**
- Enforced via trigger function `check_max_active_goals()`
- Prevents users from creating more than 3 active goals
- Trigger fires on INSERT and UPDATE

**2. Immutable Completions:**
- `subtask_completions` table has triggers preventing UPDATE/DELETE
- This is the canonical truth for user progress
- All stats (streaks, consistency) are derived from this table
- Error message: "subtask_completions is append-only. Cannot UPDATE or DELETE completion events."

**3. One Journal Per Day:**
- Unique constraint on `journal_entries(user_id, local_date)`
- Users can only have one journal entry per local date
- UPDATE existing journal, don't create duplicate

**4. Timezone Requirement:**
- `user_profiles.timezone` is NOT NULL
- Critical for converting UTC timestamps to user's local date
- Used for daily aggregates, streak calculations, journal uniqueness

### Naming Conventions

**Database Tables:**
- snake_case, plural: `user_profiles`, `subtask_completions`
- Foreign keys: `{table}_id` format: `user_id`, `goal_id`
- Timestamps: `created_at`, `updated_at`, `completed_at`
- Dates: `local_date`, `scheduled_for_date`, `start_date`

**Indexes:**
- Format: `idx_{table}_{columns}`
- Examples: `idx_subtask_completions_user_date`, `idx_goals_user_status`

**Enum Types:**
- snake_case with descriptive suffix
- Examples: `goal_status`, `subtask_status`, `capture_type`, `created_by_type`

### Data Classification

**Canonical Truth (Never Edit Directly):**
- `subtask_completions` - Append-only completion events
- These tables are the source of truth for all derived metrics

**Derived Data (Recomputable):**
- Streaks (calculated from subtask_completions)
- Consistency percentages (calculated from daily aggregates)
- Badges and ranks (calculated from milestones)
- **Note:** daily_aggregates table will be added in Story 0.2b for performance

**Editable by User:**
- `goals` - Users can edit title, description, status
- `subtask_templates` - Users can edit title, recurrence
- `identity_docs` - Versioned, users can edit and create new versions
- `journal_entries` - Users can edit their journal text

### Performance Considerations

**Query Patterns Supported by Indexes:**
1. "Get today's binds for user" → `idx_subtask_instances_user_date`
2. "Get completion history for user" → `idx_subtask_completions_user_date`
3. "Get active goals for user" → `idx_goals_user_status`
4. "Get captures for date" → `idx_captures_user_date`
5. "Get journal for date" → `idx_journal_entries_user_date`

**Composite Indexes:**
- `(user_id, scheduled_for_date)` on subtask_instances - Most common query pattern
- `(user_id, local_date)` on subtask_completions - For streak/consistency calculations
- `(user_id, status)` on goals - For active goals query

**Why These Indexes:**
- Dashboard loads today's binds: needs `user_id + scheduled_for_date` index
- Consistency heatmap: needs `user_id + local_date` on completions
- Active goals list: needs `user_id + status = 'active'` index

### Security Considerations

**RLS Policies (Story 0.4 - CRITICAL):**
- **NOT implemented in this story** - Story 0.4 will add RLS policies
- All user-owned tables need RLS: users can only access their own data
- Special policy for `subtask_completions`: INSERT-only (no UPDATE/DELETE)
- Cross-user access tests must pass before alpha release

**Current State (Week 0):**
- No RLS policies yet - OK for local development
- API endpoints will enforce user_id checks (Story 0.3)
- **MUST NOT** deploy to production without RLS (Story 0.4)

### Integration Points

**Upcoming Stories:**
- **Story 0.2b**: Database Schema Refinement - Add daily_aggregates, optimize indexes
- **Story 0.3**: Authentication Flow - Connect Supabase Auth to user_profiles
- **Story 0.4**: Row Level Security (RLS) - **CRITICAL** security layer before alpha
- **Story 0.6**: AI Service Abstraction - Will read from goals, identity_docs
- **Story 0.9**: Image Upload Error Handling - Will use captures table

**Mobile Integration (Story 1.1+):**
- TanStack Query will fetch data from these tables
- Supabase client configured in Story 0.1
- Direct Supabase queries for simple CRUD (auth, profile)

**Backend Integration (Story 1.1+):**
- FastAPI endpoints will read/write these tables
- AI operations will read identity_docs, goals for context
- Journal submission will write to journal_entries

### Known Limitations

**MVP Scope Decisions:**
- No `daily_aggregates` table yet (added in Story 0.2b when needed)
- No `user_stats` table yet (added in Sprint 2+ for dashboard)
- No `qgoals` table (optional, may add in Sprint 2+)
- No `triad_tasks` table (added in Sprint 2 when Triad feature is implemented)
- No RLS policies yet (**CRITICAL** - added in Story 0.4)

**Why Start Simple:**
- 8 core tables support all Sprint 1 features
- Can add derived tables (daily_aggregates) when performance requires it
- Keeps initial schema manageable and testable

### Migration Strategy

**Supabase CLI Migration Workflow:**
```bash
# Initialize Supabase locally (one time)
npx supabase init

# Create new migration
npx supabase migration new schema_core_tables

# Apply migrations locally
npx supabase db reset

# Apply migrations to staging
npx supabase db push --db-url $STAGING_DB_URL

# Apply migrations to production (Sprint 1+)
npx supabase db push --db-url $PRODUCTION_DB_URL
```

**Migration File Naming:**
- Format: `YYYYMMDDHHMMSS_descriptive_name.sql`
- Example: `20251217120000_create_core_tables.sql`
- Migrations run in chronological order

**Rollback Strategy:**
- Create down migrations for each table
- Test rollback on staging before production deploy
- Keep rollback migrations in separate directory: `supabase/migrations/down/`

### Testing Standards

**Manual Testing Checklist:**
1. Apply all migrations on fresh Supabase project
2. Run seed data script
3. Test SELECT queries for each table
4. Test INSERT operations with valid data
5. Test foreign key relationships (cascade deletes)
6. Test unique constraints (try duplicate journal entries)
7. Test CHECK constraints (try fulfillment_score = 11)
8. Test immutable protection (try UPDATE on subtask_completions)
9. Test max active goals constraint (try creating 4th active goal)
10. Test rollback (down migrations)

**Automated Testing (Story 0.7):**
- Integration tests for schema validation
- Constraint tests (max goals, immutable completions)
- Performance baseline tests (query timing)

### Quick Verification Commands

**Check Table Exists:**
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

**Check Indexes:**
```sql
SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';
```

**Check Constraints:**
```sql
SELECT conname, contype FROM pg_constraint WHERE connamespace = 'public'::regnamespace;
```

**Test Immutable Protection:**
```sql
-- This should FAIL with error message
UPDATE subtask_completions SET duration_minutes = 60 WHERE id = '<some-id>';
```

**Test Max 3 Active Goals:**
```sql
-- Create 3 active goals, then try 4th (should FAIL)
INSERT INTO goals (user_id, title, status) VALUES
  ('<user-id>', 'Goal 1', 'active'),
  ('<user-id>', 'Goal 2', 'active'),
  ('<user-id>', 'Goal 3', 'active'),
  ('<user-id>', 'Goal 4', 'active'); -- This should fail
```

### References

- [Source: docs/epics.md#story-02a-database-schema-core-tables]
- [Source: docs/idea/backend.md#database-schema]
- [Source: docs/architecture.md#mvp-database-8-core-tables]
- [Source: CLAUDE.md#data-classification-critical]
- [Source: CLAUDE.md#naming-conventions]
- [Previous Story: docs/sprint-artifacts/0-1-project-scaffolding.md]

---

## Dev Agent Record

### Context Reference

<!-- This story was created by the enhanced create-story workflow -->
<!-- All context from epics, architecture, backend docs, and PRD has been analyzed and included above -->

### Previous Story Intelligence

**From Story 0.1 (Project Scaffolding):**

1. **Environment Setup:**
   - Supabase environment variables already in `.env.example`
   - Mobile: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - Backend: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`

2. **Project Structure:**
   - Mobile: `weave-mobile/` with Expo SDK 54
   - Backend: `weave-api/` with FastAPI + uv
   - Both apps running: Mobile on 8082, Backend on 8000

3. **Dependencies Installed:**
   - Mobile: `@supabase/supabase-js` already installed
   - Backend: `supabase` Python package already installed
   - Ready to connect to database immediately

4. **Learnings from Story 0.1:**
   - Use uv for backend dependencies (not pip)
   - Port 8081 was in use, used 8082 for mobile
   - TypeScript strict mode enabled
   - ESLint 9 with new flat config format

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Implementation Notes

**Day 2-3 Focus:** Create production-ready database schema that supports all Sprint 1 features.

**Time Estimate:**
- Supabase project setup: 15-30 minutes
- Write 8 migration files: 1-2 hours
- Create rollback migrations: 30-45 minutes
- Write seed data script: 30-45 minutes
- Testing and verification: 45-60 minutes
- Documentation: 30-45 minutes
- **Total:** 4-6 hours

**Success Metrics:**
- All 8 tables created with correct schema
- All constraints enforced (max 3 goals, immutable completions, unique journal)
- Migrations apply cleanly on fresh database
- Rollback works correctly
- Seed data loads successfully
- Foreign key relationships work
- Query performance is fast (<100ms for typical queries)

### Completion Checklist

Before marking this story as done:
- [ ] All 7 acceptance criteria verified
- [ ] All 8 tables exist in Supabase
- [ ] Max 3 active goals constraint tested and works
- [ ] Immutable completions trigger tested and works
- [ ] Unique journal constraint tested and works
- [ ] Seed data script runs successfully
- [ ] Schema documentation complete
- [ ] Migration runner script works
- [ ] Code reviewed (Story 0.2a → code-review workflow)

---

**Story Status:** ready-for-dev ✅

**Ultimate Context Engine Analysis:** ✅ Complete

All architecture, epics, backend schema, and previous story context has been thoroughly analyzed and included. The developer has everything needed for flawless implementation.

**Next Action:** Run `/bmad:bmm:workflows:dev-story` to implement this story.
