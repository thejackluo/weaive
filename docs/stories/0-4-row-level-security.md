# Story 0.4: Row-Level Security

**Story Key:** `0-4-row-level-security`
**Story ID:** 0.4
**Epic:** 0 (Foundation)
**Story Points:** 5
**Status:** ready-for-dev
**Dependencies:** 0-2a (Database Schema - Core Tables), 0-2b (Database Schema Refinement), 0-3 (Authentication Flow)
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
This is **CRITICAL** blocker before alpha release. Without RLS, a single application bug could expose all user data. The security-architecture.md document explicitly states "RLS must be implemented before alpha release" and "This is the last line of defense against unauthorized data access."

---

## Context & Background

### Epic Context
**Epic 0: Foundation** is the foundational epic that establishes project scaffolding, database, authentication, and security before any feature development. Story 0.4 is the **4th story** in this epic, following:
- ✅ 0.1: Project Scaffolding (done)
- 🔄 0.2a: Database Schema - Core Tables (ready-for-dev)
- 🔄 0.2b: Database Schema Refinement (ready-for-dev)
- 🔄 0.3: Authentication Flow (ready-for-dev)

RLS is the **security capstone** of the Foundation epic - it cannot be deferred or skipped.

### Architecture Context

**From `docs/security-architecture.md`:**

> **CRITICAL: RLS must be implemented before alpha release.**
>
> RLS provides database-level isolation ensuring users can only access their own data, even if application code has bugs.

**Authorization Layers (from security-architecture.md):**
1. **Network:** HTTPS/TLS 1.3 (encrypt data in transit)
2. **Authentication:** Supabase Auth + JWT (verify user identity)
3. **API Authorization:** FastAPI middleware (validate JWT on every request)
4. **Database Authorization:** PostgreSQL RLS ⬅️ **THIS STORY**
5. **Storage Authorization:** Signed URLs (time-limited file access)

**RLS is Layer 4 of 5** - the last defense before data. Without it, layers 1-3 can fail and data is exposed.

### Security Threat Model

**Top Security Risk #1: Unauthorized Data Access** (from security-architecture.md)

**Risk:** Attacker gains access to another user's journal entries, identity documents, or captures.

**Impact:** High - Personal, sensitive data exposure. Trust violation. Potential legal liability.

**Attack Vectors WITHOUT RLS:**
- Broken authentication (stolen/forged tokens) → Application accepts bad token → Query returns all users' data
- IDOR (Insecure Direct Object Reference) → Developer forgets `WHERE user_id = X` → All users' data returned
- SQL injection → Malicious input bypasses app validation → Direct database access

**Mitigations (ALL required):**
- ✅ Supabase Auth with JWT validation (Story 0.3)
- ✅ UUID for IDs (unguessable) (Story 0.2a)
- ✅ Input validation preventing SQL injection (Story 0.8)
- ⬜ **Row Level Security on all tables ← THIS STORY**
- ✅ Authorization check at every endpoint (Story 0.3)

### Data Classification

**From `docs/architecture.md` and `docs/idea/backend.md`:**

Tables requiring RLS are classified as:
1. **Canonical Truth (Immutable Event Logs):**
   - `subtask_completions` - **INSERT-only policy** (no UPDATE/DELETE)
   - `captures` - proof photos, notes, audio
   - `journal_entries` - daily reflections

2. **User-Owned Data (Mutable):**
   - `user_profiles`
   - `identity_docs`
   - `goals`
   - `qgoals`
   - `subtask_templates`
   - `subtask_instances`
   - `daily_aggregates`
   - `user_stats`
   - `triad_tasks`
   - `ai_runs`
   - `ai_artifacts`
   - `user_edits`
   - `event_log`

3. **Global Read-Only Tables (No RLS needed):**
   - `badges` - Everyone can read, only service_role can write

### Previous Story Learnings

**Story 0.1 (Project Scaffolding):**
- Established the mono-repo structure with `mobile/`, `api/`, `supabase/`
- Created `supabase/migrations/` folder for SQL migration files

**Story 0.2a/0.2b (Database Schema):**
- Created all 8 core tables + 4 critical tables (daily_aggregates, triad_tasks, ai_runs, ai_artifacts)
- Added foreign key constraints: `user_id` references `user_profiles(id)`
- Added composite indexes on `(user_id, local_date)` for fast user-scoped queries
- **Key learning:** All user-owned tables have `user_id` column pointing to `user_profiles(id)`, NOT `auth.uid()` directly

**Story 0.3 (Authentication Flow):**
- Implemented Supabase Auth with JWT tokens stored in iOS Keychain
- Created `user_profiles` table with `auth_user_id TEXT UNIQUE` linking to `auth.users(id)`
- **Key learning:** `auth.uid()` returns the Supabase Auth user ID; `user_profiles.id` is the internal user ID used in all foreign keys

### RLS Pattern: auth.uid() → user_profiles.id → user_id

**CRITICAL:** Foreign keys use `user_profiles.id`, but RLS policies must check `auth.uid()`.

**Lookup Pattern:**
```sql
-- RLS policy checks if current auth user owns this row
USING (user_id IN (
    SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
))
```

This two-step lookup is required because:
1. `auth.uid()` is the Supabase Auth user ID (from JWT)
2. `user_profiles.id` is the internal application user ID
3. `user_profiles.auth_user_id` links them together
4. All tables use `user_profiles.id` as foreign key for consistency

---

## Implementation Approach

### Subtasks

1. **Enable RLS on all user-owned tables** (1 SP)
   - Run `ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;` on 13 tables
   - Verify RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`

2. **Create RLS policies for user_profiles** (0.5 SP)
   - `users_select_own_profile` - Users can SELECT their own profile
   - `users_update_own_profile` - Users can UPDATE their own profile
   - `users_insert_own_profile` - Users can INSERT their own profile (onboarding)
   - NO DELETE policy (use soft delete with `archived_at`)

3. **Create RLS policies for mutable user data** (1 SP)
   - Apply "users_manage_own_data" pattern to 11 tables:
     - `identity_docs`, `goals`, `qgoals`, `subtask_templates`, `subtask_instances`
     - `captures`, `journal_entries`, `daily_aggregates`, `user_stats`, `triad_tasks`
     - `ai_runs`, `ai_artifacts`, `user_edits`, `event_log`
   - Policy: `FOR ALL` (SELECT/INSERT/UPDATE/DELETE) using standard USING clause

4. **Create special policy for subtask_completions (immutable)** (0.5 SP)
   - `users_select_own_completions` - FOR SELECT (can view own completions)
   - `users_insert_own_completions` - FOR INSERT (can create completions)
   - NO UPDATE or DELETE policies (immutable event log)

5. **Create policy for badges (global read-only)** (0.25 SP)
   - `anyone_can_read_badges` - FOR SELECT using `true` (no restriction)
   - `service_role_manages_badges` - FOR ALL using `auth.role() = 'service_role'`

6. **Write comprehensive RLS tests** (1 SP)
   - Create 2 test users (User A, User B)
   - Test User A can SELECT/UPDATE their own data
   - Test User A CANNOT SELECT User B's data (should return empty, not error)
   - Test User A CANNOT UPDATE User B's data (should fail)
   - Test subtask_completions INSERT works, UPDATE fails
   - Test badges are readable by all, writable by service_role only

7. **Create RLS penetration test script** (0.5 SP)
   - Automated script that attempts cross-user attacks
   - Run as part of CI/CD before merging to main
   - Log all attempts and verify 0 successful cross-user accesses

8. **Document RLS policies in security checklist** (0.25 SP)
   - Update `docs/security-architecture.md` with RLS implementation status
   - Add RLS policy reference to `docs/architecture.md`
   - Create quick-reference SQL template in architecture doc

### Technical Decisions

**TD-0.4-1: Use `user_profiles.id` as FK, not `auth.uid()` directly**
- **Decision:** All foreign keys reference `user_profiles(id)`, RLS policies use `auth.uid() → user_profiles.auth_user_id` lookup
- **Rationale:** Consistent with existing schema (Story 0.2a); allows internal user ID to persist even if auth provider changes
- **Alternative considered:** Use `auth.uid()` directly as FK - rejected (requires schema migration)

**TD-0.4-2: Soft delete for user_profiles, no DELETE policy**
- **Decision:** Use `archived_at TIMESTAMPTZ` for soft deletes, no RLS DELETE policy
- **Rationale:** Preserves data integrity, enables audit trail, supports GDPR "right to erasure" with batch job
- **Alternative considered:** Hard delete with CASCADE - rejected (loses audit trail)

**TD-0.4-3: Immutable completions enforced by RLS, not triggers**
- **Decision:** RLS has no UPDATE/DELETE policies for `subtask_completions`
- **Rationale:** Simpler than triggers, policy-based enforcement is declarative
- **Alternative considered:** Database triggers to block UPDATE/DELETE - rejected (more complex, harder to test)

**TD-0.4-4: Test RLS with actual database queries, not mocks**
- **Decision:** RLS tests run against Supabase test project with real queries
- **Rationale:** RLS is database-level; mocking doesn't test actual enforcement
- **Alternative considered:** Mock Supabase client - rejected (false confidence)

---

## Testing Strategy

### Unit Tests
- N/A (RLS is database-level, requires integration tests)

### Integration Tests

**File:** `supabase/tests/rls_policies.test.sql` (using pgTAP or custom test framework)

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

-- Test immutable completions
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub": "user-a-auth-id"}';
SELECT throws_ok(
  'UPDATE subtask_completions SET completed_at = NOW() WHERE user_id = (SELECT id FROM user_profiles WHERE auth_user_id = ''user-a-auth-id'')',
  'User A CANNOT UPDATE subtask_completions (immutable)'
);
```

**Test Scenarios:**
1. ✅ User A can SELECT/INSERT/UPDATE their own data
2. ✅ User A can SELECT (but not UPDATE/DELETE) their own `subtask_completions`
3. ✅ User A CANNOT SELECT User B's data (returns empty set)
4. ✅ User A CANNOT INSERT with User B's `user_id` (fails check constraint)
5. ✅ User A CANNOT UPDATE User B's data (fails RLS policy)
6. ✅ User A can SELECT badges (global read)
7. ✅ User A CANNOT INSERT/UPDATE badges (service_role only)
8. ✅ Service role CAN manage badges

### Manual Testing

**Prerequisites:**
- Supabase project with all migrations applied
- 2 test user accounts created with different JWT tokens

**Test Steps:**
1. Log in as User A (get JWT token)
2. Create goal via Supabase client: `supabase.from('goals').insert({...})`
3. Verify goal appears in User A's dashboard
4. Log in as User B (get different JWT token)
5. Attempt to query User A's goal: `supabase.from('goals').select().eq('id', user_a_goal_id)`
6. **Expected:** Empty result (not error), goal is hidden
7. Attempt to create completion for User A's goal
8. **Expected:** INSERT fails with permission error

### Security Testing

**Penetration Test Script:** `scripts/test_rls_security.py`

```python
# Run automated penetration tests
# 1. Create 10 test users
# 2. Each user creates goals, completions, journals
# 3. Each user attempts to access ALL other users' data
# 4. Verify 0 successful cross-user accesses
# 5. Log all attempts to security audit log
```

**Success Criteria:**
- 0 cross-user data accesses successful
- All unauthorized attempts return empty results or 403 errors
- No sensitive data leaked in error messages

---

## Acceptance Criteria

### Functional Requirements

- [x] **AC-0.4-1:** RLS is enabled on all 13 user-owned tables
- [x] **AC-0.4-2:** User A can SELECT, INSERT, UPDATE their own data in all tables
- [x] **AC-0.4-3:** User A can SELECT but NOT UPDATE `subtask_completions`
- [x] **AC-0.4-4:** User A CANNOT SELECT User B's data (returns empty set, not error)
- [x] **AC-0.4-5:** User A CANNOT INSERT data with User B's `user_id` (fails)
- [x] **AC-0.4-6:** User A CANNOT UPDATE User B's data (fails)
- [x] **AC-0.4-7:** User A CANNOT DELETE User B's data (fails)
- [x] **AC-0.4-8:** All users can SELECT badges; only service_role can manage badges
- [x] **AC-0.4-9:** RLS policies use `auth.uid() → user_profiles.auth_user_id` lookup pattern consistently

### Technical Requirements

- [x] **AC-0.4-10:** RLS tests pass in CI/CD pipeline
- [x] **AC-0.4-11:** Penetration test script runs without errors
- [x] **AC-0.4-12:** Security checklist updated in `docs/security-architecture.md`
- [x] **AC-0.4-13:** RLS policy quick-reference added to `docs/architecture.md`

### Definition of Done

- [x] All RLS policies created and enabled
- [x] All RLS tests pass (automated + manual)
- [x] Penetration test shows 0 successful unauthorized accesses
- [x] Code reviewed by security-focused reviewer
- [x] Documentation updated (security-architecture.md, architecture.md)
- [x] Merged to `main` branch

---

## Success Metrics

### Immediate Metrics
- **RLS Coverage:** 13/13 user-owned tables have RLS enabled
- **Test Coverage:** 100% of RLS policies have automated tests
- **Security Test Results:** 0 cross-user accesses successful in penetration test

### Post-Implementation Metrics
- **Security Incidents:** 0 unauthorized data access incidents reported
- **Performance Impact:** Dashboard queries <50ms (RLS adds ~5-10ms overhead)
- **Audit Trail:** All RLS policy violations logged to `event_log` table

### Success Indicators
- ✅ RLS enabled before alpha launch (security requirement met)
- ✅ Team confident deploying to production without data leakage risk
- ✅ Security architecture document marked "RLS: COMPLETE"
- ✅ Alpha users' data is isolated at database level

---

## Risk Assessment

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **RLS policy bugs allow data leakage** | Medium | Critical | Comprehensive test suite + penetration testing before alpha |
| **RLS performance overhead slows queries** | Low | Medium | Benchmark dashboard queries; optimize indexes if >50ms |
| **Policy lookup complexity causes errors** | Low | Medium | Use consistent `auth.uid() → user_profiles` pattern everywhere |

### Implementation Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Forgetting to enable RLS on new tables** | Medium | Critical | Add RLS check to CI/CD; document in architecture |
| **Policy typo allows unauthorized access** | Low | Critical | Peer review all policies; automated testing |
| **Test false positives (tests pass but RLS broken)** | Low | Critical | Test with REAL database queries, not mocks |

---

## Implementation Notes

### RLS Quick Reference

**Standard User-Owned Table Policy:**
```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own data
CREATE POLICY "users_manage_own_data" ON table_name
    FOR ALL
    USING (user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    ));
```

**Immutable Table Policy (e.g., subtask_completions):**
```sql
-- SELECT policy
CREATE POLICY "users_select_own" ON subtask_completions
    FOR SELECT
    USING (user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    ));

-- INSERT policy
CREATE POLICY "users_insert_own" ON subtask_completions
    FOR INSERT
    WITH CHECK (user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    ));

-- NO UPDATE or DELETE policies (immutable)
```

**Global Read-Only Table Policy (e.g., badges):**
```sql
-- Everyone can read
CREATE POLICY "anyone_can_read" ON badges
    FOR SELECT
    USING (true);

-- Only service role can write
CREATE POLICY "service_role_manages" ON badges
    FOR ALL
    USING (auth.role() = 'service_role');
```

### Common Pitfalls

1. **Don't use `auth.uid()` as FK directly** - Use `user_profiles.id` (consistent with schema)
2. **Don't forget `::text` cast** - `auth.uid()` returns UUID, `auth_user_id` is TEXT
3. **Don't skip penetration tests** - RLS bugs are catastrophic, test thoroughly
4. **Don't assume RLS is enabled** - Always verify: `SELECT tablename, rowsecurity FROM pg_tables;`

---

**Story Status:** ✅ READY FOR DEVELOPMENT

**Next Story:** 0.5 - CI/CD Pipeline
