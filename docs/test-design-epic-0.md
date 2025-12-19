# Test Design: Epic 0 - Foundation

**Date:** 2025-12-17
**Author:** Claude Code (TEA Agent)
**Status:** Draft
**Epic:** Epic 0 - Foundation (Week 0, 38 points)

---

## Executive Summary

**Scope:** Comprehensive test design for Epic 0 - Foundation

**Epic Overview:**
Epic 0 establishes the foundation for Weave MVP, including project scaffolding, database schema with 8 core tables, authentication, security (RLS), and infrastructure (CI/CD, error handling, AI abstraction). This is a **greenfield** project with **critical security and data integrity requirements**.

**Risk Summary:**
- Total risks identified: 18
- High-priority risks (≥6): 8
- Critical categories: **Security (SEC)**, **Data Integrity (DATA)**, **Technical (TECH)**

**Coverage Summary:**
- P0 scenarios: 12 (8 hours)
- P1 scenarios: 15 (12 hours)
- P2/P3 scenarios: 18 (10 hours)
- **Total effort**: 30 hours (~4 days)

**Key Insight:** Foundation testing is **risk-critical**. Defects in database schema, RLS, or authentication will compound across all 9 epics and 272 story points.

---

## Risk Assessment

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner | Timeline |
|---------|----------|-------------|-------------|--------|-------|------------|-------|----------|
| R-001 | SEC | Missing or incorrect RLS policies allow cross-user data access | 3 | 3 | 9 | RLS test suite with multi-user scenarios, manual penetration testing | TEA/DEV | Week 0 |
| R-002 | DATA | `subtask_completions` allows UPDATE/DELETE, violating immutability requirement | 2 | 3 | 6 | Trigger tests, attempt UPDATE/DELETE and verify rejection | TEA | Week 0 |
| R-003 | DATA | Goals max 3 active constraint missing or bypassable | 2 | 3 | 6 | Constraint tests, attempt to create 4th goal and verify rejection | TEA | Week 0 |
| R-004 | TECH | Foreign key cascades incorrectly configured, causing orphaned or lost data | 2 | 3 | 6 | Cascade behavior tests for all FK relationships | TEA | Week 0 |
| R-005 | SEC | Supabase service keys exposed in codebase or logs | 2 | 3 | 6 | Secret scanning, `.gitignore` verification, code review | DEV | Week 0 |
| R-006 | PERF | Missing indexes cause dashboard queries to exceed SLA (>100ms P95) | 3 | 2 | 6 | Load test with 100 concurrent users, measure P50/P95/P99 | TEA | Week 0 Day 4 |
| R-007 | DATA | Timezone missing or incorrect causes local_date calculation errors | 2 | 3 | 6 | Timezone tests across multiple TZ, verify NOT NULL constraint | TEA | Week 0 |
| R-008 | TECH | AI service fallback chain (OpenAI → Anthropic → Deterministic) not implemented | 2 | 3 | 6 | Fallback tests, simulate API failures and verify chain works | TEA | Week 0 Day 5 |

### Medium-Priority Risks (Score 3-4)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner |
|---------|----------|-------------|-------------|--------|-------|------------|-------|
| R-009 | TECH | Migration files not idempotent, causing failure on re-run | 2 | 2 | 4 | Idempotency tests, run migrations 2x and verify no errors | DEV |
| R-010 | PERF | N+1 query patterns in Sprint 1 features degrade performance | 2 | 2 | 4 | Query pattern review, EXPLAIN ANALYZE for top 10 queries | TEA |
| R-011 | OPS | CI/CD pipeline fails on fresh clone (environment issues) | 2 | 2 | 4 | E2E CI test with fresh environment, verify <15 min setup | DEV |
| R-012 | DATA | Unique constraints missing on `journal_entries(user_id, local_date)` | 1 | 3 | 3 | Uniqueness test, attempt duplicate journal entry | TEA |
| R-013 | TECH | TypeScript strict mode disabled or misconfigured | 1 | 2 | 2 | Linter tests, verify no `any` types in codebase | DEV |
| R-014 | BUS | Onboarding can be completed without setting up authentication | 1 | 3 | 3 | Auth flow test, verify unauthenticated requests blocked | TEA |

### Low-Priority Risks (Score 1-2)

| Risk ID | Category | Description | Probability | Impact | Score | Action |
|---------|----------|-------------|-------------|--------|-------|--------|
| R-015 | OPS | README documentation outdated or incomplete | 2 | 1 | 2 | Monitor |
| R-016 | TECH | Prettier/ESLint configs conflict, causing formatting wars | 1 | 2 | 2 | Monitor |
| R-017 | BUS | Default values incorrect for enum types | 1 | 2 | 2 | Monitor |
| R-018 | PERF | API documentation load time >3s at /docs endpoint | 1 | 1 | 1 | Monitor |

### Risk Category Legend

- **TECH**: Technical/Architecture (flaws, integration, scalability)
- **SEC**: Security (access controls, auth, data exposure)
- **PERF**: Performance (SLA violations, degradation, resource limits)
- **DATA**: Data Integrity (loss, corruption, inconsistency)
- **BUS**: Business Impact (UX harm, logic errors, revenue)
- **OPS**: Operations (deployment, config, monitoring)

---

## Test Coverage Plan

### P0 (Critical) - Run on every commit

**Criteria**: Blocks core journey + High risk (≥6) + No workaround

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
|-------------|------------|-----------|------------|-------|-------|
| RLS policies prevent cross-user access | API | R-001 | 3 | TEA | User A cannot read User B's goals, completions, journal |
| `subtask_completions` immutability enforced | Unit/API | R-002 | 2 | TEA | UPDATE/DELETE triggers rejection |
| Goals max 3 active constraint enforced | API | R-003 | 2 | TEA | 4th goal creation fails with clear error |
| Database migrations apply cleanly | Integration | R-004 | 1 | DEV | Fresh DB → all 8 migrations succeed |
| Timezone NOT NULL constraint enforced | Unit | R-007 | 2 | TEA | Verify user_profile requires timezone |
| Authentication blocks unauthenticated requests | API | R-014 | 2 | TEA | Verify JWT validation on protected endpoints |

**Total P0**: 12 tests, ~8 hours

### P1 (High) - Run on PR to main

**Criteria**: Important features + Medium risk (3-4) + Common workflows

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
|-------------|------------|-----------|------------|-------|-------|
| Foreign key cascades work correctly | Integration | R-004 | 4 | TEA | Delete goal → subtasks deleted/nulled appropriately |
| Indexes support Sprint 1 query patterns | Integration | R-006, R-010 | 3 | TEA | Measure query performance with EXPLAIN ANALYZE |
| AI fallback chain works end-to-end | Integration | R-008 | 2 | TEA | Simulate OpenAI failure → Anthropic called |
| Migrations are idempotent | Integration | R-009 | 2 | DEV | Run migrations 2x, verify no errors |
| Journal entries enforce unique constraint | API | R-012 | 1 | TEA | Duplicate (user_id, local_date) rejected |
| Environment secrets not exposed | Unit | R-005 | 2 | DEV | Verify `.env` in `.gitignore`, no keys in logs |
| Fresh clone runs in <15 minutes | E2E | R-011 | 1 | DEV | Clone → npm install → npx expo start succeeds |

**Total P1**: 15 tests, ~12 hours

### P2 (Medium) - Run nightly/weekly

**Criteria**: Secondary features + Low risk (1-2) + Edge cases

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
|-------------|------------|-----------|------------|-------|-------|
| TypeScript strict mode enabled | Unit | R-013 | 2 | DEV | No `any` types, strict null checks |
| All enum types work correctly | Unit | R-017 | 3 | DEV | Insert all enum values, verify acceptance |
| Default values set correctly | Unit | - | 4 | DEV | Verify NOW() timestamps, DEFAULT FALSE booleans |
| API documentation loads | Integration | R-018 | 1 | DEV | /docs endpoint returns 200, <3s load time |
| Load testing baseline (100 concurrent users) | Load | R-006 | 3 | TEA | P50/P95/P99 for top 5 queries |
| Rollback migrations work | Integration | - | 2 | DEV | Up → down migration succeeds |
| Error handling returns proper API format | Unit | - | 3 | DEV | `{error: {code, message}}` format |

**Total P2**: 18 tests, ~10 hours

### P3 (Low) - Run on-demand

**Criteria**: Nice-to-have + Exploratory + Performance benchmarks

| Requirement | Test Level | Test Count | Owner | Notes |
|-------------|------------|------------|-------|-------|
| README accuracy validation | Manual | 1 | DEV | Follow setup steps, verify <15 min |
| Prettier/ESLint consistency | Unit | 1 | DEV | Run formatters, verify no conflicts |
| Schema documentation completeness | Manual | 1 | TEA | Compare docs to actual schema |
| Slow query log configuration | Integration | 1 | TEA | Verify queries >100ms logged |

**Total P3**: 4 tests, ~2 hours

---

## Test Execution Order

### Smoke Tests (<2 min)

**Purpose**: Fast feedback, catch build-breaking issues

- [ ] Backend health endpoint returns 200 (5s)
- [ ] Mobile app builds without TypeScript errors (30s)
- [ ] Database connection successful from backend (10s)
- [ ] Supabase Auth service reachable (10s)

**Total**: 4 scenarios, ~1 minute

### P0 Tests (<10 min)

**Purpose**: Critical path validation - Foundation integrity

- [ ] RLS Test 1: User A cannot read User B's goals (API)
- [ ] RLS Test 2: User A cannot read User B's completions (API)
- [ ] RLS Test 3: User A cannot read User B's journal entries (API)
- [ ] Immutability Test 1: UPDATE `subtask_completions` rejected (API)
- [ ] Immutability Test 2: DELETE `subtask_completions` rejected (API)
- [ ] Goals Constraint Test 1: 4th active goal creation fails (API)
- [ ] Goals Constraint Test 2: Archive goal allows new goal creation (API)
- [ ] Migration Test: All 8 migrations apply cleanly (Integration)
- [ ] Timezone Test 1: User profile requires timezone (NOT NULL) (Unit)
- [ ] Timezone Test 2: Local_date calculations work across timezones (Unit)
- [ ] Auth Test 1: Unauthenticated request to /goals blocked (API)
- [ ] Auth Test 2: Invalid JWT rejected (API)

**Total**: 12 scenarios, ~8 minutes

### P1 Tests (<30 min)

**Purpose**: Important feature coverage - Infrastructure validation

- [ ] FK Cascade Test 1: Delete goal → subtasks set goal_id NULL (Integration)
- [ ] FK Cascade Test 2: Delete user → all user data cascades (Integration)
- [ ] FK Cascade Test 3: Delete subtask_template → instances unaffected (Integration)
- [ ] FK Cascade Test 4: Verify no orphaned data after cascades (Integration)
- [ ] Index Test 1: `subtask_instances(user_id, scheduled_for_date)` used by query planner (EXPLAIN)
- [ ] Index Test 2: `goals(user_id, status)` used for active goals query (EXPLAIN)
- [ ] Index Test 3: All composite indexes have <50ms P95 on 10K rows (Load)
- [ ] AI Fallback Test 1: OpenAI fails → Anthropic called (Integration)
- [ ] AI Fallback Test 2: Both fail → Deterministic response (Integration)
- [ ] Idempotency Test 1: Run migrations 2x, no errors (Integration)
- [ ] Idempotency Test 2: Verify data unchanged after 2nd run (Integration)
- [ ] Journal Unique Test: Duplicate (user_id, local_date) rejected (API)
- [ ] Secret Test 1: `.env` in `.gitignore` (Unit)
- [ ] Secret Test 2: No API keys in console.log statements (Unit)
- [ ] Fresh Clone Test: Clone → install → run in <15 min (E2E)

**Total**: 15 scenarios, ~25 minutes

### P2/P3 Tests (<60 min)

**Purpose**: Full regression coverage - Edge cases and performance

- [ ] TypeScript strict tests (2 scenarios)
- [ ] Enum type tests (3 scenarios)
- [ ] Default value tests (4 scenarios)
- [ ] API docs load test (1 scenario)
- [ ] Load testing baseline (3 scenarios)
- [ ] Rollback migration tests (2 scenarios)
- [ ] Error format tests (3 scenarios)
- [ ] P3: Manual validation tests (4 scenarios)

**Total**: 22 scenarios, ~50 minutes

---

## Test Infrastructure Requirements

### Required Before Testing Begins

1. **Test Database:**
   - [ ] Separate Supabase test project created
   - [ ] Test project URL in `.env.test`
   - [ ] Migrations can run against test DB
   - [ ] Seed data scripts for multi-user scenarios

2. **Test Framework:**
   - [ ] Jest configured for backend unit tests
   - [ ] Supertest configured for API integration tests
   - [ ] Test factories for user, goal, subtask, journal creation
   - [ ] Cleanup utilities (truncate tables between tests)

3. **RLS Testing:**
   - [ ] Multi-user test setup (User A, User B fixtures)
   - [ ] Helper to switch authenticated user context
   - [ ] RLS policy validation utilities

4. **Performance Testing:**
   - [ ] Artillery or k6 for load testing
   - [ ] Seed scripts for 10K rows per table
   - [ ] Query performance assertion helpers (P50/P95/P99)

---

## Sprint 1 Feature Support Validation

Epic 0 must support these Sprint 1 features:

### Epic 1: Onboarding & Identity
- [ ] `user_profiles` table supports all required fields
- [ ] `identity_docs` table supports versioning
- [ ] Authentication flow validates JWT correctly

### Epic 3: Daily Actions
- [ ] `subtask_instances` supports scheduled_for_date queries
- [ ] `subtask_completions` immutability enforced
- [ ] `captures` table supports photo/note proof

### Epic 5: Progress Dashboard
- [ ] Composite indexes support consistency queries
- [ ] `journal_entries` unique constraint prevents duplicates
- [ ] Performance targets met for dashboard queries

**Validation Tests:**
- [ ] Simulate Sprint 1 query patterns against test data
- [ ] Verify all queries meet performance SLAs
- [ ] Confirm no missing tables or columns

---

## Definition of Done for Epic 0 Testing

- [ ] All P0 tests passing (12/12)
- [ ] All P1 tests passing (15/15)
- [ ] >80% P2 tests passing (15/18)
- [ ] No high-priority risks (score ≥6) unmitigated
- [ ] RLS policies validated with multi-user penetration tests
- [ ] Database performance baseline documented (P50/P95/P99)
- [ ] Test infrastructure ready for Sprint 1 (factories, fixtures)
- [ ] Fresh clone validated by 2+ team members (<15 min setup)

---

## Test Scenarios by Story

### Story 0.1: Project Scaffolding (DONE ✅)

**Validation:**
- [ ] Mobile app builds and runs on iOS simulator
- [ ] Backend API accessible at http://localhost:8000/docs
- [ ] ESLint and Ruff linters pass
- [ ] Fresh clone runs in <15 min (P1-015)

### Story 0.2a: Database Schema Core (READY-FOR-DEV)

**P0 Tests:**
- [ ] All 8 migrations apply cleanly (P0-004)
- [ ] `subtask_completions` immutability (P0-001, P0-002)
- [ ] Goals max 3 active constraint (P0-005, P0-006)
- [ ] Timezone NOT NULL constraint (P0-009, P0-010)

**P1 Tests:**
- [ ] Foreign key cascades (P1-001 to P1-004)
- [ ] Migrations idempotent (P1-009, P1-010)
- [ ] Journal unique constraint (P1-011)

### Story 0.2b: Database Schema Refinement (READY-FOR-DEV)

**P1 Tests:**
- [ ] Index performance validation (P1-005 to P1-007)
- [ ] Query pattern review (P1-007, P2-005)

**P2 Tests:**
- [ ] Load testing baseline (P2-005)
- [ ] Performance targets documented

### Story 0.3: Authentication Flow (BACKLOG)

**P0 Tests:**
- [ ] Unauthenticated requests blocked (P0-011, P0-012)

**P1 Tests:**
- [ ] JWT validation end-to-end
- [ ] Token refresh flow

### Story 0.4: Row Level Security (BACKLOG, CRITICAL)

**P0 Tests:**
- [ ] RLS Test 1: User A cannot read User B's goals (P0-001)
- [ ] RLS Test 2: User A cannot read User B's completions (P0-002)
- [ ] RLS Test 3: User A cannot read User B's journal entries (P0-003)

**Critical:** This is the **highest priority** test for security. Must be completed before Sprint 1 alpha release.

### Story 0.6: AI Service Abstraction (BACKLOG)

**P1 Tests:**
- [ ] AI Fallback Test 1: OpenAI → Anthropic (P1-007)
- [ ] AI Fallback Test 2: Both fail → Deterministic (P1-008)

---

## Test Execution Timeline

| Day | Focus | Tests | Owner |
|-----|-------|-------|-------|
| Week 0 Day 2-3 | Story 0.2a (Database Core) | P0: Migrations, Immutability, Constraints | TEA |
| Week 0 Day 3-4 | Story 0.2b (Schema Refinement) | P1: Indexes, Performance | TEA |
| Week 0 Day 4-5 | Story 0.3 (Auth) + 0.4 (RLS) | P0: Auth, RLS | TEA |
| Week 0 Day 5 | Story 0.6 (AI Abstraction) | P1: AI Fallback | TEA |
| Week 1 | Sprint 1 Prep | P2: Load Testing, Edge Cases | TEA |

---

## Knowledge Base References Applied

This test design consulted the following TEA knowledge fragments:

- **fixture-architecture.md** - Test fixture patterns with setup/teardown
- **data-factories.md** - Factory patterns for user, goal, subtask test data
- **test-quality.md** - Test design principles (isolation, determinism, assertions)
- **selector-resilience.md** - API test patterns (status codes, error formats)
- **timing-debugging.md** - Async testing patterns (database operations)

---

## Notes

### Critical Path Dependencies

1. **Story 0.2a MUST complete before 0.2b** - Can't optimize schema that doesn't exist
2. **Story 0.4 (RLS) is CRITICAL** - Blocks Sprint 1 alpha release
3. **Performance baseline (0.2b) needed before Sprint 1** - Prevents performance regressions

### Known Limitations

- **No E2E mobile tests yet** - Story 0.7 (Test Infrastructure) will add Detox/Maestro
- **Load testing limited to 100 concurrent users** - MVP target is 10K users, but Week 0 baseline sufficient
- **No chaos engineering** - Deferred to Sprint 3+ (network failures, database failover)

### Future Test Expansion

- **Sprint 1:** Add E2E mobile tests for onboarding flow
- **Sprint 2:** Add AI cost tracking and prompt injection tests
- **Sprint 3:** Add load testing up to 1K concurrent users
- **Sprint 6:** Add alpha user acceptance testing

---

**Generated by BMad TEA Agent** - 2025-12-17
