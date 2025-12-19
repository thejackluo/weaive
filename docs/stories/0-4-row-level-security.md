# Story 0.4: Row-Level Security

**Story Key:** `0-4-row-level-security`
**Story ID:** 0.4
**Epic:** 0 (Foundation)
**Story Points:** 5
**Status:** ready-for-dev
**Dependencies:** 0-2a (Database Schema - Core Tables - `docs/stories/0-2a-database-schema-core.md`), 0-2b (Database Schema Refinement - `docs/stories/0-2b-database-schema-refinement.md`), 0-3 (Authentication Flow - `docs/stories/0-3-authentication-flow.md`)
**Created:** 2025-12-19

---

## Story Overview

**User Story:**
As a **development team**, I need **Row Level Security (RLS) policies implemented on all user-owned Supabase tables**, so that **users can only access their own data, ensuring database-level security isolation before alpha launch**.

**Business Value:**
- **Critical Security Foundation:** RLS provides defense-in-depth security at the database layer, protecting against application bugs or compromised JWTs
- **Compliance Requirement:** Required for GDPR, COPPA, and App Store privacy standards before any external users
- **Zero Trust Architecture:** Even if the application layer is compromised, users cannot access each other's data
- **Immutable Event Log Protection:** Special policies ensure `subtask_completions` table remains append-only (no UPDATE/DELETE)

**Why This Story Matters:**
This is **CRITICAL** blocker before alpha release. Without RLS, a single application bug could expose all user data.

---

## Prerequisites

Before starting this story, ensure:
- ✅ Supabase CLI v1.x+ installed locally (`supabase --version`)
- ✅ Local Supabase running (`supabase start`)
- ✅ Database migrations from Story 0.2a/0.2b applied
- ✅ Authentication flow from Story 0.3 working (able to create test users)
- ✅ Supabase project connection strings configured in `.env`

---

## Context & Background

### Epic Context
**Epic 0: Foundation** establishes project scaffolding, database, authentication, and security before feature development. Story 0.4 is the **security capstone** following:
- ✅ 0.1: Project Scaffolding (`docs/stories/0-1-project-scaffolding.md`) - Established `supabase/migrations/` folder
- 🔄 0.2a: Database Schema - Core Tables (`docs/stories/0-2a-database-schema-core.md`) - Created 13 user-owned tables with `user_id` foreign keys
- 🔄 0.2b: Database Schema Refinement - Added indexes and constraints
- 🔄 0.3: Authentication Flow (`docs/stories/0-3-authentication-flow.md`) - Implemented JWT authentication with `user_profiles.auth_user_id` linking pattern

### Architecture Alignment

**Security Requirements:** Full RLS specification in `docs/security-architecture.md` (lines 189-292). RLS is **Layer 4 of 5** in defense-in-depth: Network (TLS) → Auth (JWT) → API Authorization → **Database (RLS)** → Storage (Signed URLs).

**Data Classification:** Per `docs/architecture.md` - `subtask_completions` is **Canonical Truth** (immutable event log), requiring special INSERT-only policies.

### Previous Story Learnings

**From Story 0.2a/0.2b (Database Schema):**
- All user-owned tables have `user_id` column referencing `user_profiles(id)` (NOT `auth.uid()` directly)
- Composite indexes on `(user_id, local_date)` exist for fast user-scoped queries
- Foreign key constraints enforce referential integrity

**From Story 0.3 (Authentication Flow):**
- `auth.uid()` returns Supabase Auth UUID from JWT
- `user_profiles.auth_user_id` (TEXT) links to `auth.users(id)`
- `user_profiles.id` (UUID) is internal user ID used in all foreign keys

### RLS Pattern: auth.uid() → user_profiles.auth_user_id → user_profiles.id → user_id

**CRITICAL:** RLS policies check `auth.uid()` but tables use `user_profiles.id`. Lookup required:

```sql
USING (user_id IN (
    SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
))
```

**Why `::text` cast:** `auth.uid()` returns UUID type, `user_profiles.auth_user_id` is TEXT. Without cast, comparison fails silently (returns no rows). This is PostgreSQL strict type checking.

---

## Implementation Approach

### Subtasks

1. **Enable RLS on all user-owned tables** (1 SP)
   - Create migration file: `supabase/migrations/$(date +%Y%m%d%H%M%S)_row_level_security.sql`
   - Run `ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;` on 13 tables
   - Verify RLS enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`

2. **Create RLS policies for user_profiles** (0.5 SP)
   - `users_select_own_profile` - Users can SELECT their own profile
   - `users_update_own_profile` - Users can UPDATE their own profile
   - `users_insert_own_profile` - Users can INSERT their own profile (onboarding)
   - NO DELETE policy (use soft delete with `archived_at`)

3. **Create RLS policies for mutable user data** (1 SP)
   - Apply "users_manage_own_data" pattern (see Implementation Notes) to 11 tables:
     - `identity_docs`, `goals`, `qgoals`, `subtask_templates`, `subtask_instances`
     - `captures`, `journal_entries`, `daily_aggregates`, `user_stats`, `triad_tasks`
     - `ai_runs`, `ai_artifacts`, `user_edits`, `event_log`
   - Policy: `FOR ALL` (SELECT/INSERT/UPDATE/DELETE) using standard USING clause

4. **Create special policy for subtask_completions (immutable)** (0.5 SP)
   - Per `docs/architecture.md` Data Classification: `subtask_completions` is **Canonical Truth** (immutable event log)
   - `users_select_own_completions` - FOR SELECT (can view own completions)
   - `users_insert_own_completions` - FOR INSERT (can create completions)
   - NO UPDATE or DELETE policies (enforces immutability)

5. **Create policy for badges (global read-only)** (0.25 SP)
   - `anyone_can_read_badges` - FOR SELECT using `true` (no restriction)
   - `service_role_manages_badges` - FOR ALL using `auth.role() = 'service_role'`

6. **Write comprehensive RLS tests** (1 SP)
   - Testing framework: Supabase CLI (`supabase test db`) with SQL test files in `supabase/tests/`
   - Test file: `supabase/tests/rls_policies.test.sql` (see Testing Strategy for examples)
   - Create 2 test users (User A, User B) in test setup
   - Run tests locally: `supabase test db`
   - Verify all 8 test scenarios pass (see Testing Strategy)

7. **Test RLS locally with manual verification** (0.5 SP)
   - Start local Supabase: `supabase start`
   - Create 2 test users via Supabase Studio (http://localhost:54323)
   - Get JWT tokens for both users
   - Run cross-user queries with different JWTs
   - Verify User A CANNOT access User B data
   - Document test results in story notes

8. **Create RLS penetration test script** (0.5 SP)
   - Script location: `scripts/test_rls_security.py`
   - Uses Python + Supabase client library
   - Automated script that attempts cross-user attacks (see Security Testing)
   - Run as part of CI/CD before merging to main
   - Log all attempts and verify 0 successful cross-user accesses

9. **Document RLS policies in security checklist** (0.25 SP)
   - Update `docs/security-architecture.md`:
     - Mark "RLS: COMPLETE" in Pre-Launch Checklist (line 2167)
     - Add table listing all 13 RLS-enabled tables in RLS section
     - Link to migration file: `supabase/migrations/YYYYMMDDHHMMSS_row_level_security.sql`
   - Update `docs/architecture.md`:
     - Add "RLS Quick Reference" section with policy pattern
     - Document `auth.uid() → user_profiles.id` lookup pattern
     - Note immutable tables policy approach

### Technical Decisions

**TD-0.4-1: Use `user_profiles.id` as FK, not `auth.uid()` directly**
- **Decision:** All foreign keys reference `user_profiles(id)`, RLS policies use `auth.uid() → user_profiles.auth_user_id` lookup
- **Rationale:** Consistent with existing schema (Story 0.2a); allows internal user ID to persist even if auth provider changes
- **Alternative considered:** Use `auth.uid()` directly as FK - rejected (requires schema migration)

**TD-0.4-2: Immutable completions enforced by RLS, not triggers**
- **Decision:** RLS has no UPDATE/DELETE policies for `subtask_completions`
- **Rationale:** Simpler than triggers, policy-based enforcement is declarative, easier to test
- **Alternative considered:** Database triggers to block UPDATE/DELETE - rejected (more complex, harder to test)

**TD-0.4-3: Test RLS with actual database queries, not mocks**
- **Decision:** RLS tests run against local Supabase with real queries using Supabase CLI test framework
- **Rationale:** RLS is database-level; mocking doesn't test actual enforcement. Need real PostgreSQL + JWT simulation.
- **Alternative considered:** Mock Supabase client - rejected (false confidence, misses edge cases)

---

## Testing Strategy

### Integration Tests

**File:** `supabase/tests/rls_policies.test.sql`
**Framework:** Supabase CLI (`supabase test db`) or pgTAP
**Run command:** `supabase test db` (runs all tests in `supabase/tests/`)

**Test Scenarios (All 8 must pass):**
1. ✅ User A can SELECT/INSERT/UPDATE their own data (goals, journals, etc.)
2. ✅ User A can SELECT (but not UPDATE/DELETE) their own `subtask_completions`
3. ✅ User A CANNOT SELECT User B's data (returns empty set, not error)
4. ✅ User A CANNOT INSERT with User B's `user_id` (fails RLS policy)
5. ✅ User A CANNOT UPDATE User B's data (fails RLS policy)
6. ✅ User A can SELECT badges (global read)
7. ✅ User A CANNOT INSERT/UPDATE badges (service_role only)
8. ✅ Service role CAN INSERT/UPDATE badges (using service_role key)

**Example Test (see `supabase/tests/rls_policies.test.sql` for full suite):**
```sql
-- Test User A can access own data
SELECT is(
  (SELECT COUNT(*) FROM goals WHERE user_id = (SELECT id FROM user_profiles WHERE auth_user_id = 'user-a-auth-id')),
  1,
  'User A can SELECT their own goals'
);

-- Test User A CANNOT access User B data
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub": "user-a-auth-id"}';
SELECT is(
  (SELECT COUNT(*) FROM goals WHERE user_id = (SELECT id FROM user_profiles WHERE auth_user_id = 'user-b-auth-id')),
  0,
  'User A CANNOT SELECT User B goals'
);
```

### Manual Testing

**Prerequisites:**
- Local Supabase running (`supabase start`)
- 2 test users created in Supabase Studio (http://localhost:54323)

**Step-by-Step Test Procedure:**
1. **Setup:** Create User A and User B in Supabase Studio → Authentication
2. **User A Session:**
   - Log in as User A via mobile app or Supabase client
   - Get JWT token (inspect network request or use `supabase.auth.getSession()`)
   - Create goal: `supabase.from('goals').insert({ title: 'User A Goal', user_id: userA.id })`
   - Verify goal visible: `supabase.from('goals').select('*')`
3. **User B Session:**
   - Log in as User B (different JWT token)
   - Attempt to query User A's goal: `supabase.from('goals').select().eq('id', userA_goal_id)`
   - **Expected Result:** Empty array `[]` (not error, not User A's goal)
   - Attempt to update User A's goal: `supabase.from('goals').update({ title: 'Hacked' }).eq('id', userA_goal_id)`
   - **Expected Result:** 0 rows updated, no error (RLS silently blocks)
4. **Cross-User Completion Test:**
   - User B attempts: `supabase.from('subtask_completions').insert({ user_id: userA.id, ... })`
   - **Expected Result:** INSERT fails (CHECK constraint or RLS policy violation)
5. **Immutable Test:**
   - User A creates completion
   - User A attempts UPDATE: `supabase.from('subtask_completions').update({ completed_at: new Date() })`
   - **Expected Result:** 0 rows updated (no UPDATE policy exists)
6. **Service Role Test:**
   - Use service_role key
   - Verify CAN insert/update badges
   - **Expected Result:** Success

### Security Testing

**Penetration Test Script:** `scripts/test_rls_security.py`
**Language:** Python with Supabase client library
**Purpose:** Automated adversarial testing - attempts cross-user attacks

**Script Logic:**
```python
# 1. Create 10 test users with Supabase Auth
# 2. Each user creates: 2 goals, 5 completions, 3 journal entries
# 3. Each user attempts to access ALL other users' data via:
#    - Direct ID queries
#    - Enumeration attacks
#    - Batch queries
# 4. Verify 0 successful cross-user accesses (all return empty or error)
# 5. Log all attempts to `security_audit.log`
# 6. Exit code 0 if all attempts blocked, 1 if any succeed
```

**Success Criteria:**
- 0 cross-user data accesses successful
- All unauthorized attempts return empty results or 403 errors
- No sensitive data leaked in error messages

---

## Acceptance Criteria

### Functional Requirements

- [ ] **AC-0.4-1:** RLS is enabled on all 13 user-owned tables
- [ ] **AC-0.4-2:** User A can SELECT, INSERT, UPDATE their own data in all tables
- [ ] **AC-0.4-3:** User A can SELECT but NOT UPDATE `subtask_completions`
- [ ] **AC-0.4-4:** User A CANNOT SELECT User B's data (returns empty set, not error)
- [ ] **AC-0.4-5:** User A CANNOT INSERT data with User B's `user_id` (fails)
- [ ] **AC-0.4-6:** User A CANNOT UPDATE User B's data (fails)
- [ ] **AC-0.4-7:** User A CANNOT DELETE User B's data (fails)
- [ ] **AC-0.4-8:** All users can SELECT badges; only service_role can manage badges
- [ ] **AC-0.4-9:** RLS policies use `auth.uid() → user_profiles.auth_user_id` lookup pattern consistently

### Technical Requirements

- [ ] **AC-0.4-10:** RLS tests pass locally (`supabase test db`) - Note: CI/CD workflow creation is follow-up task
- [ ] **AC-0.4-11:** Penetration test script (`scripts/test_rls_security.py`) runs without errors
- [ ] **AC-0.4-12:** Security checklist updated in `docs/security-architecture.md` (line 2167 marked complete, RLS tables listed)
- [ ] **AC-0.4-13:** RLS policy quick-reference added to `docs/architecture.md`

### Definition of Done

- [ ] All RLS policies created and enabled
- [ ] All RLS tests pass (automated + manual)
- [ ] Penetration test shows 0 successful unauthorized accesses
- [ ] Code reviewed by security-focused reviewer
- [ ] Documentation updated (security-architecture.md, architecture.md)
- [ ] Merged to `main` branch

---

## Success Metrics

**Immediate Validation:**
- RLS Coverage: 13/13 user-owned tables enabled
- Test Coverage: 8/8 test scenarios pass
- Penetration Test: 0 successful cross-user accesses
- Performance: Measure dashboard queries with `EXPLAIN ANALYZE`:
  - `SELECT * FROM goals WHERE user_id = X` <50ms (baseline + RLS overhead ~5-10ms)
  - `SELECT * FROM daily_aggregates WHERE user_id = X AND local_date = Y` <50ms

---

## Risk Assessment

**Key Risks & Mitigations:**
- **RLS policy bugs → data leakage:** Comprehensive test suite + penetration testing before alpha
- **Performance overhead → slow queries:** Benchmark dashboard queries; existing composite indexes should keep overhead <10ms
- **Forgetting RLS on new tables:** Document in architecture + future CI/CD check
- **Policy typos → unauthorized access:** Peer review all policies + automated testing
- **Test false positives:** Test with REAL database queries (not mocks) using Supabase CLI

---

## Implementation Notes

### RLS Quick Reference

**Standard User-Owned Table Policy (apply to 11 tables):**
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_data" ON table_name
    FOR ALL
    USING (user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    ));
```

**Immutable Table (subtask_completions only):**
```sql
CREATE POLICY "users_select_own" ON subtask_completions
    FOR SELECT
    USING (user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text));

CREATE POLICY "users_insert_own" ON subtask_completions
    FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text));
-- NO UPDATE/DELETE policies
```

**Global Read-Only (badges only):**
```sql
CREATE POLICY "anyone_can_read" ON badges FOR SELECT USING (true);
CREATE POLICY "service_role_manages" ON badges FOR ALL USING (auth.role() = 'service_role');
```

For additional policy patterns, see `docs/security-architecture.md` (lines 189-292).

### Emergency Rollback Plan

If RLS breaks production queries:
1. **Immediate:** Disable RLS on affected table: `ALTER TABLE X DISABLE ROW LEVEL SECURITY;`
2. **Investigate:** Check RLS policy syntax and test locally
3. **Fix:** Correct policy and re-enable: `ALTER TABLE X ENABLE ROW LEVEL SECURITY;`
4. **Verify:** Run test suite before redeploying

### Common Pitfalls

1. **Don't use `auth.uid()` as FK directly** - Use `user_profiles.id` (consistent with existing schema from Story 0.2a)
2. **Don't forget `::text` cast** - `auth.uid()` returns UUID, `auth_user_id` is TEXT. Without cast, PostgreSQL type mismatch causes silent failure (returns 0 rows instead of error)
3. **Don't skip penetration tests** - RLS bugs are catastrophic (full data breach), test thoroughly with adversarial mindset
4. **Don't assume RLS is enabled** - Always verify after migration: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`

---

**Next Story:** 0.5 - CI/CD Pipeline
