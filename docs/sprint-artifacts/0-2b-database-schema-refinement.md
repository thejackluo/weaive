# Story 0.2b: Database Schema Refinement

**Status:** ready-for-dev
**Epic:** Epic 0 - Foundation
**Points:** 2
**Priority:** HIGH (Week 0 - Day 3-4)
**Depends On:** Story 0.2a (Database Schema Core)

---

## Story

**As a** development team,
**I want** to review, optimize, and validate the database schema for performance and data integrity,
**so that** we have a production-ready schema that supports all Sprint 1 queries efficiently with proper constraints and documentation.

---

## Acceptance Criteria

### AC 1: Schema Review Complete
- [ ] All tables reviewed against architecture.md requirements
- [ ] All columns have appropriate data types
- [ ] All missing NOT NULL constraints identified and added
- [ ] All missing DEFAULT values identified and added
- [ ] All CHECK constraints verified and documented

### AC 2: Composite Indexes Optimized
- [ ] Query patterns documented for all Sprint 1 features
- [ ] Composite indexes created for common query patterns:
  - `(user_id, scheduled_for_date)` on subtask_instances
  - `(user_id, local_date)` on subtask_completions
  - `(user_id, local_date)` on captures
  - `(user_id, local_date)` on journal_entries
  - `(user_id, status)` on goals
- [ ] Single-column indexes removed where composite indexes cover them
- [ ] Index usage verified with EXPLAIN ANALYZE

### AC 3: Data Classification Documented
- [ ] Canonical truth tables documented (immutable event logs)
- [ ] Derived data tables documented (recomputable)
- [ ] Editable by user tables documented
- [ ] Data classification added to schema documentation

### AC 4: Performance Baseline Established
- [ ] Query performance measured for top 10 queries
- [ ] Dashboard query (<100ms target)
- [ ] Today's binds query (<50ms target)
- [ ] Completion history query (<100ms target)
- [ ] Active goals query (<50ms target)
- [ ] Performance baseline documented in story notes

### AC 5: Schema Validation Checklist Complete
- [ ] All foreign keys have ON DELETE behavior defined
- [ ] All timestamps have DEFAULT NOW()
- [ ] All UUIDs use gen_random_uuid()
- [ ] All enum types are used correctly
- [ ] All unique constraints are intentional and documented
- [ ] No N+1 query patterns identified in Sprint 1 features

### AC 6: Missing Tables Added (If Needed)
- [ ] Evaluate if daily_aggregates is needed for MVP (defer to Sprint 2+ if performance is acceptable)
- [ ] Add any missing junction tables identified during review
- [ ] Document decision to defer or include each additional table

---

## Tasks / Subtasks

### Task 1: Schema Review Against Architecture (AC: 1)

#### Review user_profiles
- [ ] Verify timezone is NOT NULL (critical for local_date calculations)
- [ ] Add DEFAULT NOW() to created_at, updated_at
- [ ] Consider adding email column (or rely on Supabase Auth only?)
- [ ] Add CHECK constraint for timezone format validation (optional)

#### Review identity_docs
- [ ] Verify version starts at 1 (DEFAULT 1)
- [ ] Add CHECK constraint: version >= 1
- [ ] Consider adding updated_at timestamp
- [ ] Verify JSONB structure is documented

#### Review goals
- [ ] Verify max 3 active goals constraint exists (from 0.2a)
- [ ] Add DEFAULT NOW() to created_at, updated_at
- [ ] Add CHECK constraint: start_date <= target_date (if both exist)
- [ ] Consider adding deleted_at for soft delete pattern

#### Review subtask_templates
- [ ] Verify default_estimated_minutes has CHECK >= 0
- [ ] Add DEFAULT FALSE to is_archived
- [ ] Add DEFAULT 'user' to created_by
- [ ] Add updated_at timestamp

#### Review subtask_instances
- [ ] Verify scheduled_for_date is NOT NULL
- [ ] Add CHECK: estimated_minutes >= 0
- [ ] Add CHECK: actual_minutes >= 0 (if not null)
- [ ] Add CHECK: completed_at is NULL when status != 'done'
- [ ] Add DEFAULT 0 to sort_order

#### Review subtask_completions (IMMUTABLE)
- [ ] Verify immutable triggers exist (from 0.2a)
- [ ] Verify completed_at is NOT NULL
- [ ] Verify local_date is NOT NULL
- [ ] Add CHECK: duration_minutes >= 0 (if not null)
- [ ] No DEFAULT needed (append-only, no updates)

#### Review captures
- [ ] Verify type is NOT NULL
- [ ] Add CHECK: content_text is not null when type = 'text'
- [ ] Add CHECK: storage_key is not null when type in ('photo', 'audio')
- [ ] Verify local_date is NOT NULL
- [ ] Add DEFAULT NOW() to created_at

#### Review journal_entries
- [ ] Verify fulfillment_score CHECK (1-10) exists
- [ ] Verify UNIQUE(user_id, local_date) exists
- [ ] Verify text is NOT NULL
- [ ] Add DEFAULT NOW() to created_at
- [ ] Consider adding updated_at for edits

### Task 2: Create Composite Indexes (AC: 2)

#### Analyze Query Patterns from Architecture
- [ ] Document top 10 queries from Sprint 1 features:
  1. Get today's binds for user
  2. Get completion history for user (last 30 days)
  3. Get captures for today
  4. Get journal entry for today
  5. Get active goals for user
  6. Get subtask instances for date range
  7. Get completions for streak calculation
  8. Get identity doc (latest version)
  9. Get goal with subtasks
  10. Get captures for goal

#### Create Migration for Composite Indexes
```sql
-- 009_optimize_indexes.sql

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_subtask_instances_user_date_status
  ON subtask_instances(user_id, scheduled_for_date, status);

CREATE INDEX IF NOT EXISTS idx_subtask_completions_user_date_desc
  ON subtask_completions(user_id, local_date DESC);

CREATE INDEX IF NOT EXISTS idx_captures_user_date_type
  ON captures(user_id, local_date, type);

CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date_desc
  ON journal_entries(user_id, local_date DESC);

CREATE INDEX IF NOT EXISTS idx_goals_user_status_created
  ON goals(user_id, status, created_at DESC);

-- Remove redundant single-column indexes if composite covers them
-- (Only if created in 0.2a - check first)
-- DROP INDEX IF EXISTS idx_subtask_instances_user_id;
-- DROP INDEX IF EXISTS idx_subtask_completions_user_id;
```

#### Verify Index Usage with EXPLAIN
- [ ] Run EXPLAIN ANALYZE on each of the top 10 queries
- [ ] Verify indexes are used (Index Scan, not Seq Scan)
- [ ] Document query plans in story notes
- [ ] Measure query execution time (target: <100ms)

### Task 3: Document Data Classification (AC: 3)

Create `docs/data-classification.md`:

```markdown
# Data Classification

## Canonical Truth (Immutable Event Logs)

**Purpose:** Source of truth for all derived metrics. Never UPDATE or DELETE.

| Table | Description | Why Immutable |
|-------|-------------|---------------|
| subtask_completions | Bind completion events | Audit trail, streak calculations, consistency metrics |

**Protection:** Triggers prevent UPDATE/DELETE operations.

## Derived Data (Recomputable)

**Purpose:** Pre-computed for performance. Can be regenerated from canonical truth.

| Table | Source Tables | Regeneration Trigger |
|-------|---------------|---------------------|
| daily_aggregates (future) | subtask_completions, captures, journal_entries | On completion/capture/journal submit |
| user_stats (future) | subtask_completions, daily_aggregates | Nightly batch job |

**Note:** Not yet implemented in MVP - add when dashboard >500ms.

## Editable by User

**Purpose:** User-controlled data that can be modified.

| Table | What Users Can Edit | Versioning |
|-------|-------------------|------------|
| goals | title, description, status, priority, dates | No versioning |
| subtask_templates | title, recurrence, is_archived | No versioning |
| subtask_instances | title_override, notes, status | No versioning |
| identity_docs | All fields via new version | Versioned (append-only) |
| journal_entries | text, fulfillment_score | Updated_at timestamp |
| captures | content_text (notes only) | No versioning |

## Read-Only (System Generated)

**Purpose:** System-generated data that users cannot directly edit.

| Table | Generated By | User Visibility |
|-------|-------------|-----------------|
| user_profiles | Supabase Auth + onboarding | Read-only (except display_name) |
| triad_tasks (future) | AI after journal submit | Read-only, regenerated daily |

## Security Classification

| Table | RLS Policy | Access Pattern |
|-------|-----------|----------------|
| All user-owned tables | user_id = auth.uid() | SELECT, INSERT, UPDATE, DELETE |
| subtask_completions | user_id = auth.uid() | SELECT, INSERT only (no UPDATE/DELETE) |

**Note:** RLS policies implemented in Story 0.4.
```

### Task 4: Performance Baseline (AC: 4)

#### Create Performance Test Script
```sql
-- scripts/performance-baseline.sql

-- Ensure test data exists (at least 30 days of history)
-- Run with: psql -f scripts/performance-baseline.sql

\timing on

-- Query 1: Get today's binds for user
EXPLAIN ANALYZE
SELECT * FROM subtask_instances
WHERE user_id = '<test-user-id>'
  AND scheduled_for_date = CURRENT_DATE;

-- Query 2: Get completion history (last 30 days)
EXPLAIN ANALYZE
SELECT * FROM subtask_completions
WHERE user_id = '<test-user-id>'
  AND local_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY local_date DESC;

-- Query 3: Get active goals
EXPLAIN ANALYZE
SELECT * FROM goals
WHERE user_id = '<test-user-id>'
  AND status = 'active';

-- Query 4: Get captures for today
EXPLAIN ANALYZE
SELECT * FROM captures
WHERE user_id = '<test-user-id>'
  AND local_date = CURRENT_DATE;

-- Query 5: Get journal entry for today
EXPLAIN ANALYZE
SELECT * FROM journal_entries
WHERE user_id = '<test-user-id>'
  AND local_date = CURRENT_DATE;

-- Query 6: Dashboard query (today's binds + completions + captures + journal)
EXPLAIN ANALYZE
SELECT
  (SELECT COUNT(*) FROM subtask_instances WHERE user_id = '<test-user-id>' AND scheduled_for_date = CURRENT_DATE) as total_binds,
  (SELECT COUNT(*) FROM subtask_completions WHERE user_id = '<test-user-id>' AND local_date = CURRENT_DATE) as completed_binds,
  (SELECT COUNT(*) FROM captures WHERE user_id = '<test-user-id>' AND local_date = CURRENT_DATE) as total_captures,
  (SELECT EXISTS(SELECT 1 FROM journal_entries WHERE user_id = '<test-user-id>' AND local_date = CURRENT_DATE)) as has_journal;

\timing off
```

#### Document Performance Results
- [ ] Run performance test script
- [ ] Record execution times in story notes
- [ ] Verify all queries meet targets:
  - Dashboard: <100ms
  - Today's binds: <50ms
  - Completion history: <100ms
  - Active goals: <50ms
- [ ] Document any queries that exceed targets
- [ ] Create optimization plan for slow queries

### Task 5: Schema Validation Checklist (AC: 5)

#### Create Validation Script
```sql
-- scripts/validate-schema.sql

-- Check 1: All foreign keys have ON DELETE behavior
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- Check 2: All timestamps have defaults
SELECT
  table_name,
  column_name,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND data_type IN ('timestamp with time zone', 'timestamp without time zone')
  AND column_name IN ('created_at', 'updated_at', 'completed_at')
ORDER BY table_name, column_name;

-- Check 3: All UUIDs use gen_random_uuid()
SELECT
  table_name,
  column_name,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND data_type = 'uuid'
  AND column_name = 'id'
ORDER BY table_name;

-- Check 4: All NOT NULL constraints
SELECT
  table_name,
  column_name,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name IN ('user_id', 'timezone', 'local_date', 'completed_at', 'type', 'text')
ORDER BY table_name, column_name;

-- Check 5: All CHECK constraints
SELECT
  tc.table_name,
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.constraint_type = 'CHECK'
ORDER BY tc.table_name;
```

#### Manual Validation
- [ ] Run validation script and review results
- [ ] Verify all foreign keys have appropriate ON DELETE behavior
- [ ] Verify all timestamps have DEFAULT NOW()
- [ ] Verify all UUIDs use gen_random_uuid()
- [ ] Verify all critical columns are NOT NULL
- [ ] Document any exceptions or decisions

### Task 6: N+1 Query Pattern Analysis (AC: 5)

#### Identify Potential N+1 Patterns in Sprint 1
- [ ] **Dashboard Query**: Loading today's binds + completions + captures + journal
  - Risk: Separate query for each entity type
  - Solution: Single query with subselects or JOINs
  - Status: Verify query plan

- [ ] **Goal with Subtasks**: Loading goal + all associated subtasks
  - Risk: Load goal, then loop through subtasks
  - Solution: Single query with JOIN or array_agg
  - Status: Document recommended query pattern

- [ ] **Bind Completion Flow**: Load bind instance + linked capture
  - Risk: Load instance, then load capture separately
  - Solution: Single query with LEFT JOIN
  - Status: Document recommended query pattern

#### Document Query Patterns
Create `docs/query-patterns.md`:

```markdown
# Recommended Query Patterns

## Dashboard Query (No N+1)
```sql
-- Good: Single query with subselects
SELECT
  (SELECT json_agg(si.*) FROM subtask_instances si WHERE si.user_id = $1 AND si.scheduled_for_date = $2) as binds,
  (SELECT json_agg(sc.*) FROM subtask_completions sc WHERE sc.user_id = $1 AND sc.local_date = $2) as completions,
  (SELECT json_agg(c.*) FROM captures c WHERE c.user_id = $1 AND c.local_date = $2) as captures,
  (SELECT row_to_json(je.*) FROM journal_entries je WHERE je.user_id = $1 AND je.local_date = $2) as journal;
```

## Goal with Subtasks (No N+1)
```sql
-- Good: Single query with JOIN and json_agg
SELECT
  g.*,
  COALESCE(json_agg(st.* ORDER BY st.sort_order) FILTER (WHERE st.id IS NOT NULL), '[]') as subtasks
FROM goals g
LEFT JOIN subtask_templates st ON st.goal_id = g.id AND st.is_archived = false
WHERE g.user_id = $1 AND g.id = $2
GROUP BY g.id;
```

## Completion with Proof (No N+1)
```sql
-- Good: Single query with LEFT JOIN
SELECT
  si.*,
  c.id as capture_id,
  c.type as capture_type,
  c.content_text,
  c.storage_key
FROM subtask_instances si
LEFT JOIN subtask_proofs sp ON sp.subtask_instance_id = si.id
LEFT JOIN captures c ON c.id = sp.capture_id
WHERE si.user_id = $1 AND si.id = $2;
```
```

### Task 7: Missing Tables Evaluation (AC: 6)

#### Evaluate daily_aggregates Table
- [ ] **Current State**: Not created in Story 0.2a
- [ ] **Purpose**: Pre-computed daily stats for dashboard performance
- [ ] **Decision Criteria**: Add if dashboard query >100ms with realistic data
- [ ] **Test**: Run dashboard query with 90 days of data for 100 test users
- [ ] **Recommendation**:
  - If <100ms: Defer to Sprint 2+ (post-MVP)
  - If >100ms: Add in this story

**Schema (if needed):**
```sql
-- 010_daily_aggregates.sql (optional)
CREATE TABLE daily_aggregates (
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  local_date DATE NOT NULL,
  completed_count INT DEFAULT 0,
  has_journal BOOLEAN DEFAULT FALSE,
  has_proof BOOLEAN DEFAULT FALSE,
  active_day_with_proof BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, local_date)
);

CREATE INDEX idx_daily_aggregates_user_date ON daily_aggregates(user_id, local_date DESC);
```

#### Evaluate user_stats Table
- [ ] **Purpose**: User-level aggregated stats (current streak, rank, total completions)
- [ ] **Recommendation**: Defer to Sprint 2+ (when Progress Dashboard is implemented)
- [ ] **Rationale**: Not needed until Epic 5 (Progress Visualization)

#### Evaluate subtask_proofs Junction Table
- [ ] **Purpose**: Link captures to subtask instances as proof
- [ ] **Decision**: Include if Proof feature is Sprint 1 (Epic 3)
- [ ] **Check**: Review Sprint 1 stories - is proof attachment included?
- [ ] **Recommendation**: Add if needed for Sprint 1

**Schema (if needed):**
```sql
-- 011_subtask_proofs.sql (if needed)
CREATE TABLE subtask_proofs (
  subtask_instance_id UUID NOT NULL REFERENCES subtask_instances(id) ON DELETE CASCADE,
  capture_id UUID NOT NULL REFERENCES captures(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (subtask_instance_id, capture_id)
);
```

### Task 8: Documentation Updates (AC: 3)

- [ ] Update `docs/database-schema.md` with data classification
- [ ] Create `docs/data-classification.md` (from Task 3)
- [ ] Create `docs/query-patterns.md` (from Task 6)
- [ ] Update `README.md` with schema validation instructions
- [ ] Document performance baseline in story notes
- [ ] Add troubleshooting section for common schema issues

---

## Dev Notes

### Architecture Alignment

**Performance Requirements (from Architecture Doc):**
- Dashboard load time: <1 second (NFR-P2)
- Bind completion response: <500ms (NFR-P3)
- Dashboard reads from pre-computed aggregates when needed (not raw completions)

**Data Classification (from Architecture Doc):**
- Canonical truth: `subtask_completions` (immutable)
- Derived views: `daily_aggregates` (recomputable)
- Editable by user: goals, subtasks, identity_docs

**Query Optimization Strategy:**
- Composite indexes for common query patterns
- Avoid N+1 queries with JOINs and json_agg
- Pre-compute aggregates only when performance requires it
- Target: All queries <100ms for 90 days of user data

### Critical Decisions

**1. When to Add daily_aggregates:**
- **Threshold**: Dashboard query >100ms with realistic data
- **Realistic data**: 90 days of history, 100 test users
- **Test approach**: Use pgbench or custom load test script
- **Decision**: Defer to Sprint 2+ if performance is acceptable

**2. Index Strategy:**
- **Composite indexes**: Cover multiple columns in common queries
- **Order matters**: Most selective column first (user_id, then date)
- **DESC for dates**: Support ORDER BY local_date DESC (recent first)
- **Remove redundant**: Drop single-column indexes if composite covers them

**3. Constraint Strategy:**
- **NOT NULL**: Only for truly required fields (user_id, timezone, local_date)
- **CHECK**: For business rules (fulfillment_score 1-10, max 3 active goals)
- **DEFAULT**: For timestamps (NOW()), booleans (FALSE), enums ('active')
- **UNIQUE**: For business invariants (one journal per user per day)

### Performance Testing Strategy

**Load Test Data:**
```sql
-- Generate 90 days of realistic test data
DO $$
DECLARE
  test_user_id UUID;
  test_goal_id UUID;
  test_date DATE;
BEGIN
  -- Create test user
  INSERT INTO user_profiles (auth_user_id, display_name, timezone)
  VALUES ('test-user-1', 'Test User', 'America/Los_Angeles')
  RETURNING id INTO test_user_id;

  -- Create test goals
  INSERT INTO goals (user_id, title, status)
  VALUES (test_user_id, 'Test Goal 1', 'active')
  RETURNING id INTO test_goal_id;

  -- Create 90 days of completions
  FOR i IN 0..89 LOOP
    test_date := CURRENT_DATE - INTERVAL '1 day' * i;

    -- 3-5 completions per day
    FOR j IN 1..floor(random() * 3 + 3) LOOP
      INSERT INTO subtask_completions (user_id, subtask_instance_id, completed_at, local_date)
      VALUES (test_user_id, gen_random_uuid(), NOW(), test_date);
    END LOOP;
  END LOOP;
END $$;
```

### Testing Standards

**Performance Targets:**
- Dashboard query: <100ms (target: <50ms)
- Today's binds: <50ms (target: <25ms)
- Completion history: <100ms (target: <50ms)
- Active goals: <50ms (target: <10ms)

**How to Measure:**
1. Run `EXPLAIN ANALYZE` on each query
2. Look for "Execution Time" in output
3. Verify "Index Scan" not "Seq Scan"
4. Document query plan in story notes

**What to Optimize:**
- If Seq Scan: Add missing index
- If >100ms: Consider composite index or pre-computed aggregate
- If multiple queries: Consider JOIN instead of separate calls

### Integration Points

**Story 0.2a (Depends On):**
- Core tables must be created first
- Migrations 001-008 applied successfully
- Seed data script works

**Story 0.3 (Authentication):**
- Will connect Supabase Auth to user_profiles table
- user_profiles.auth_user_id links to Supabase auth.users.id

**Story 0.4 (RLS Policies):**
- Will add security policies to all tables
- Performance may change after RLS enabled (test again)

**Sprint 1 (Features):**
- All Sprint 1 queries must meet performance targets
- No N+1 query patterns in feature implementation
- Query patterns documented guide developers

### Known Limitations

**MVP Scope Decisions:**
- No daily_aggregates unless performance requires it
- No user_stats (defer to Sprint 2+ for Progress Dashboard)
- No complex analytics queries (PostHog for that)
- No full-text search (not needed for MVP)

**Why Start Simple:**
- Premature optimization is root of all evil
- Add daily_aggregates only when dashboard >100ms
- Measure first, optimize second
- Keep schema simple and maintainable

### Quick Verification Commands

**Check Index Usage:**
```sql
EXPLAIN ANALYZE
SELECT * FROM subtask_instances
WHERE user_id = '<test-user-id>' AND scheduled_for_date = CURRENT_DATE;
-- Look for "Index Scan using idx_subtask_instances_user_date"
```

**Check Query Performance:**
```sql
\timing on
SELECT COUNT(*) FROM subtask_completions WHERE user_id = '<test-user-id>';
\timing off
-- Should be <50ms
```

**Check Index Sizes:**
```sql
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

### References

- [Source: docs/epics.md#story-02b-database-schema-refinement]
- [Source: docs/architecture.md#performance-requirements]
- [Source: docs/idea/backend.md#query-patterns]
- [Previous Story: docs/sprint-artifacts/0-2a-database-schema-core.md]
- [Related: docs/architecture.md#mvp-vs-scale-architecture-strategy]

---

## Dev Agent Record

### Context Reference

<!-- This story was created by the enhanced create-story workflow -->
<!-- All context from epics, architecture, backend docs, and Story 0.2a has been analyzed -->

### Previous Story Intelligence

**From Story 0.2a (Database Schema Core):**

1. **8 Core Tables Created:**
   - user_profiles, identity_docs, goals, subtask_templates
   - subtask_instances, subtask_completions, captures, journal_entries

2. **Critical Constraints:**
   - Max 3 active goals (trigger function)
   - Immutable completions (UPDATE/DELETE triggers)
   - One journal per day (unique constraint)
   - Timezone NOT NULL (required for local_date)

3. **Basic Indexes:**
   - Foreign key indexes on all user_id columns
   - Single-column indexes on common columns
   - Ready for composite index optimization

4. **Migration Infrastructure:**
   - Migrations 001-008 created
   - Rollback migrations tested
   - Seed data script works

**What This Story Adds:**
- Composite indexes for query optimization
- Performance baseline measurement
- Data classification documentation
- Query pattern guidelines
- Schema validation checklist

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Implementation Notes

**Day 3-4 Focus:** Optimize schema for performance and validate for production readiness.

**Time Estimate:**
- Schema review: 45-60 minutes
- Composite indexes: 30-45 minutes
- Performance testing: 45-60 minutes
- Data classification docs: 30-45 minutes
- Query pattern docs: 30-45 minutes
- Schema validation: 30-45 minutes
- **Total:** 3-5 hours

**Success Metrics:**
- All queries meet performance targets (<100ms)
- No N+1 query patterns in Sprint 1 features
- Data classification clearly documented
- Performance baseline established
- Schema validation checklist complete

### Completion Checklist

Before marking this story as done:
- [ ] All 6 acceptance criteria verified
- [ ] Composite indexes created and tested
- [ ] Performance baseline documented
- [ ] Data classification doc created
- [ ] Query patterns doc created
- [ ] Schema validation script runs successfully
- [ ] All queries meet performance targets
- [ ] No N+1 patterns identified
- [ ] Code reviewed (Story 0.2b → code-review workflow)

---

**Story Status:** ready-for-dev ✅

**Ultimate Context Engine Analysis:** ✅ Complete

All architecture, performance requirements, and Story 0.2a learnings have been analyzed. The developer has everything needed for schema optimization and validation.

**Next Action:** Implement on same branch as Story 0.2a, then run validation workflow.
