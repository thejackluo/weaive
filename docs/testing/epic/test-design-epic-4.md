# Test Design: Epic 4 - Reflection & Journaling

**Date:** 2025-12-20
**Author:** Jack
**Status:** Draft

---

## Executive Summary

**Scope:** Full test design for Epic 4 (Reflection & Journaling)

**Risk Summary:**

- Total risks identified: 11
- High-priority risks (≥6): 5
- Critical categories: PERF (R-001), BUS (R-002), DATA (R-003, R-005), SEC (R-004)

**Coverage Summary:**

- P0 scenarios: 17 tests (34 hours)
- P1 scenarios: 26 tests (26 hours)
- P2 scenarios: 13 tests (6.5 hours)
- **Total effort**: 66.5 hours (~8.3 days)

---

## Risk Assessment

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description                                  | Probability | Impact | Score | Mitigation                                          | Owner | Timeline |
| ------- | -------- | -------------------------------------------- | ----------- | ------ | ----- | --------------------------------------------------- | ----- | -------- |
| R-001   | PERF     | AI batch timeout exceeds 30s SLA             | 3           | 3      | 9     | 4-level fallback chain, 20s timeout, progress UI    | DEV   | Sprint 1 |
| R-002   | BUS      | AI feedback quality degradation              | 2           | 3      | 6     | Track rejection rate, A/B test prompts, edit UX     | AI    | Sprint 2 |
| R-003   | DATA     | Journal data loss on submission failure      | 2           | 3      | 6     | Optimistic UI, local storage draft, retry logic     | DEV   | Sprint 1 |
| R-004   | SEC      | Custom question injection attack (XSS/SQL)   | 2           | 3      | 6     | Sanitize inputs, parameterized queries, 200ch limit | DEV   | Sprint 1 |
| R-005   | DATA     | Concurrent journal submission race condition | 2           | 3      | 6     | DB unique constraint, idempotency key, UI disable   | DEV   | Sprint 1 |

### Medium-Priority Risks (Score 3-4)

| Risk ID | Category | Description                                | Probability | Impact | Score | Mitigation                                 | Owner |
| ------- | -------- | ------------------------------------------ | ----------- | ------ | ----- | ------------------------------------------ | ----- |
| R-006   | OPS      | AI rate limit exhaustion blocks all users  | 2           | 2      | 4     | Request queue, monitor at 80%, stagger jobs | OPS   |
| R-007   | PERF     | Past journal load degrades with >100 entries | 2           | 2      | 4     | Paginate (20/page), index, lazy load AI    | DEV   |
| R-008   | TECH     | Custom question schema evolution breaks data | 1           | 3      | 3     | Version schema, migration scripts, testing | DEV   |
| R-009   | BUS      | Recap summary misses recent activity       | 2           | 2      | 4     | Invalidate cache, refresh button, test edge cases | DEV   |

### Low-Priority Risks (Score 1-2)

| Risk ID | Category | Description                                | Probability | Impact | Score | Action                     |
| ------- | -------- | ------------------------------------------ | ----------- | ------ | ----- | -------------------------- |
| R-010   | BUS      | Fulfillment score slider UX confusion      | 2           | 1      | 2     | Add scale labels, tooltip  |
| R-011   | OPS      | AI edit history storage growth over time   | 1           | 2      | 2     | Archive >90 days, limit 10 versions |

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

| Requirement                                                 | Test Level | Risk Link | Test Count | Owner | Notes                     |
| ----------------------------------------------------------- | ---------- | --------- | ---------- | ----- | ------------------------- |
| Submit journal with valid 2 default questions              | E2E        | R-003     | 1          | QA    | Happy path, critical flow |
| Journal persists with correct user_id, local_date          | API        | R-003, R-005 | 1       | QA    | Data integrity            |
| Duplicate submission returns 409 error                      | API        | R-005     | 1          | QA    | Race condition prevention |
| Submit button disabled after click                          | Component  | R-005     | 1          | DEV   | UI protection             |
| Custom question input sanitized for XSS                     | API        | R-004     | 1          | QA    | Security critical         |
| Custom question with SQL keywords rejected                  | API        | R-004     | 1          | QA    | Injection prevention      |
| Custom question stored in user_profiles.preferences        | API        | R-008     | 1          | QA    | Schema correctness        |
| AI feedback generated within 30s of submit                  | E2E        | R-001     | 1          | QA    | SLA requirement           |
| AI feedback contains 3 cards (Affirming, Blocker, Plan)    | E2E        | R-002     | 1          | QA    | Feature correctness       |
| AI timeout (>20s) triggers deterministic fallback          | API        | R-001     | 1          | QA    | Fallback chain Level 3    |
| AI failure cascades to deterministic fallback              | API        | R-001     | 1          | QA    | Resilience                |
| AI artifacts saved with input_hash for caching             | API        | -         | 1          | DEV   | Performance               |
| Tomorrow's triad tasks written to triad_tasks table        | API        | -         | 1          | QA    | Data integrity            |
| Edit button opens text editor with current content         | Component  | -         | 1          | DEV   | Basic functionality       |
| Save edit stores in user_edits table (JSONPatch)          | API        | R-011     | 1          | QA    | Data format               |
| "Not true" marks artifact as rejected                      | API        | R-002     | 1          | QA    | Feedback loop             |
| Edited artifact marked with is_user_edited=true           | API        | -         | 1          | QA    | Flag persistence          |

**Total P0**: 17 tests, 34 hours

### P1 (High) - Run on PR to main

**Criteria**: Important features + Medium risk (3-4) + Common workflows

| Requirement                                                | Test Level | Risk Link | Test Count | Owner | Notes                    |
| ---------------------------------------------------------- | ---------- | --------- | ---------- | ----- | ------------------------ |
| Skip text field allowed (not required)                    | E2E        | -         | 1          | QA    | Business logic           |
| Fulfillment score slider accepts values 1-10              | Component  | R-010     | 1          | DEV   | Input validation         |
| Fulfillment score rejects values <1 or >10                | API        | -         | 1          | QA    | Backend validation       |
| Form preserves values on network error                    | E2E        | R-003     | 1          | QA    | Data loss prevention     |
| Journal submission triggers event_log entry               | API        | -         | 1          | QA    | Event tracking           |
| Add new custom question (numeric, yes/no, text)           | E2E        | -         | 1          | QA    | Feature coverage         |
| Edit existing custom question updates definition          | API        | R-008     | 1          | QA    | Schema evolution         |
| Delete custom question removes from preferences           | API        | R-008     | 1          | QA    | Cleanup                  |
| Custom question length limited to 200 chars               | API        | R-004     | 1          | QA    | Input validation         |
| Custom questions appear in journal entry form             | Component  | -         | 1          | DEV   | UI integration           |
| Recap shows binds completed today (count and list)        | E2E        | R-009     | 1          | QA    | Core feature             |
| Recap includes captures created today                     | API        | R-009     | 1          | QA    | Data completeness        |
| Recap uses fresh data (not stale cache)                   | API        | R-009     | 1          | QA    | Cache invalidation       |
| Recap with zero activity shows "No activity today"        | Component  | -         | 1          | DEV   | Empty state              |
| AI feedback links to ai_runs for traceability            | API        | -         | 1          | QA    | Audit trail              |
| "Weave is reflecting..." loading state shown              | Component  | -         | 1          | DEV   | User feedback            |
| Push notification sent when AI feedback ready             | E2E        | -         | 1          | QA    | Async completion         |
| Cached feedback returned for duplicate input_hash         | API        | R-001     | 1          | QA    | Cache hit                |
| AI rate limit exceeded falls back to Claude               | API        | R-006     | 1          | QA    | Fallback chain           |
| Edited artifact not overwritten by regeneration           | API        | -         | 1          | QA    | User control             |
| Edit history tracked (up to 10 versions)                  | API        | R-011     | 1          | QA    | History limits           |
| "Not true" rejection rate monitored (>20% alerts)         | Unit       | R-002     | 1          | DEV   | Quality metric           |
| Past journals list paginated (20 per page)                | API        | R-007     | 1          | QA    | Performance              |
| Tap entry loads full reflection + AI feedback             | E2E        | -         | 1          | QA    | Navigation               |
| Filter by date range (7/30/90 days)                       | E2E        | -         | 1          | QA    | User control             |
| Journal list indexed on (user_id, local_date DESC)       | Unit       | R-007     | 1          | DEV   | Query optimization       |

**Total P1**: 26 tests, 26 hours

### P2 (Medium) - Run nightly/weekly

**Criteria**: Secondary features + Low risk (1-2) + Edge cases

| Requirement                                              | Test Level | Risk Link | Test Count | Owner | Notes                     |
| -------------------------------------------------------- | ---------- | --------- | ---------- | ----- | ------------------------- |
| Empty journal submission shows validation error          | API        | -         | 1          | QA    | Edge case                 |
| Journal with only fulfillment score (no text) allowed   | API        | -         | 1          | QA    | Minimal valid input       |
| Long answer text (>5000 chars) truncated with warning   | API        | -         | 1          | QA    | Input sanitization        |
| Custom question with emoji characters accepted           | API        | -         | 1          | QA    | Unicode support           |
| Maximum 10 custom questions enforced                     | API        | -         | 1          | QA    | Resource limits           |
| Recap data refreshes on pull-to-refresh                  | E2E        | R-009     | 1          | QA    | User control              |
| Recap loading state shows skeleton                       | Component  | -         | 1          | DEV   | UX polish                 |
| AI feedback generation retried 3 times on failure        | API        | R-001     | 1          | QA    | Retry logic               |
| Progress indicator updates at 10s mark                   | Component  | R-001     | 1          | DEV   | UX polish                 |
| Old edit history archived after 90 days                  | Unit       | R-011     | 1          | DEV   | Retention policy          |
| Search by keyword (optional for MVP)                     | E2E        | -         | 1          | QA    | Nice-to-have              |
| Lazy load AI artifacts on entry expand                   | API        | R-007     | 1          | QA    | Performance optimization  |
| Journal list loads <1s with 100+ entries                 | E2E        | R-007     | 1          | QA    | Scale testing             |

**Total P2**: 13 tests, 6.5 hours

### P3 (Low) - Run on-demand

**Criteria**: Nice-to-have + Exploratory + Performance benchmarks

No P3 tests defined for Epic 4 MVP scope.

**Total P3**: 0 tests, 0 hours

---

## Execution Order

### Smoke Tests (<5 min)

**Purpose**: Fast feedback, catch build-breaking issues

- [ ] Submit journal with 2 default questions (E2E, 2min)
- [ ] Journal persists to database (API, 30s)
- [ ] AI feedback generated within 30s (E2E, 2min)

**Total**: 3 scenarios (~5min)

### P0 Tests (<10 min)

**Purpose**: Critical path validation

- [ ] Submit journal with valid 2 default questions (E2E)
- [ ] Journal persists with correct user_id, local_date (API)
- [ ] Duplicate submission returns 409 error (API)
- [ ] Submit button disabled after click (Component)
- [ ] Custom question input sanitized for XSS (API)
- [ ] Custom question with SQL keywords rejected (API)
- [ ] Custom question stored in preferences (API)
- [ ] AI feedback generated within 30s (E2E)
- [ ] AI feedback contains 3 cards (E2E)
- [ ] AI timeout triggers fallback (API)
- [ ] AI failure cascades to deterministic (API)
- [ ] AI artifacts saved with input_hash (API)
- [ ] Triad tasks written to table (API)
- [ ] Edit button opens editor (Component)
- [ ] Save edit stores in user_edits (API)
- [ ] "Not true" marks rejected (API)
- [ ] Edited artifact marked (API)

**Total**: 17 scenarios (~10min)

### P1 Tests (<30 min)

**Purpose**: Important feature coverage

- [ ] Skip text field allowed (E2E)
- [ ] Fulfillment score slider validates (Component)
- [ ] Score rejects invalid values (API)
- [ ] Form preserves on error (E2E)
- [ ] Event log triggered (API)
- [ ] Add custom question (E2E)
- [ ] Edit custom question (API)
- [ ] Delete custom question (API)
- [ ] Custom question length limit (API)
- [ ] Custom questions in form (Component)
- [ ] Recap shows binds (E2E)
- [ ] Recap includes captures (API)
- [ ] Recap uses fresh data (API)
- [ ] Recap empty state (Component)
- [ ] AI links to ai_runs (API)
- [ ] Loading state shown (Component)
- [ ] Push notification sent (E2E)
- [ ] Cache hit returns cached (API)
- [ ] Rate limit fallback (API)
- [ ] Edit not overwritten (API)
- [ ] Edit history tracked (API)
- [ ] Rejection rate monitored (Unit)
- [ ] Past journals paginated (API)
- [ ] Tap entry loads full (E2E)
- [ ] Date range filter (E2E)
- [ ] Journal list indexed (Unit)

**Total**: 26 scenarios (~30min)

### P2 Tests (<60 min)

**Purpose**: Full regression coverage

- [ ] Empty journal validation (API)
- [ ] Journal with only score (API)
- [ ] Long text truncated (API)
- [ ] Emoji in custom question (API)
- [ ] Max custom questions (API)
- [ ] Recap refresh (E2E)
- [ ] Recap skeleton (Component)
- [ ] AI retry 3 times (API)
- [ ] Progress at 10s (Component)
- [ ] Edit history archived (Unit)
- [ ] Keyword search (E2E)
- [ ] Lazy load artifacts (API)
- [ ] Journal list perf (E2E)

**Total**: 13 scenarios (~60min)

---

## Resource Estimates

### Test Development Effort

| Priority  | Count | Hours/Test | Total Hours | Notes                             |
| --------- | ----- | ---------- | ----------- | --------------------------------- |
| P0        | 17    | 2.0        | 34          | Complex setup, security, AI tests |
| P1        | 26    | 1.0        | 26          | Standard coverage                 |
| P2        | 13    | 0.5        | 6.5         | Simple scenarios, edge cases      |
| P3        | 0     | 0.25       | 0           | None for MVP                      |
| **Total** | **56** | **-**     | **66.5**    | **~8.3 days** (1 QA engineer)     |

### Test Level Breakdown

| Test Level | Count | Percentage | Notes                                    |
| ---------- | ----- | ---------- | ---------------------------------------- |
| E2E        | 15    | 27%        | Critical paths, user journeys            |
| API        | 32    | 57%        | Business logic, data integrity, security |
| Component  | 7     | 13%        | UI protection, input validation          |
| Unit       | 2     | 4%         | Query optimization, monitoring logic     |

### Prerequisites

**Test Data:**

- **Journal factory** (Faker-based)
  - Generates valid journal entries with random fulfillment scores
  - Creates custom question definitions
  - Auto-cleanup after test execution
- **User factory** (existing)
  - Creates test users with auth tokens
  - RLS policies enforced
- **AI mock responses**
  - Mock OpenAI/Claude responses for deterministic tests
  - Cache fallback responses for timeout scenarios
- **Completion fixtures** (for recap testing)
  - Pre-populate subtask_completions for "today"
  - Create capture records for recap display

**Tooling:**

- **Jest + React Native Testing Library** (mobile E2E and component tests)
- **Pytest + FastAPI TestClient** (backend API tests)
- **Playwright** (optional for web admin, not MVP critical)
- **@faker-js/faker** (test data generation)
- **nock** or **msw** (API mocking for AI providers)
- **Supabase local instance** (database tests with RLS)

**Environment:**

- **CI/CD:** GitHub Actions with test matrix (Node 20, Python 3.11)
- **Database:** Local Supabase instance for tests (Docker)
- **AI mocking:** Mock OpenAI/Claude responses (no real API calls in CI)
- **Test isolation:** Each test gets fresh DB state (transactions or cleanup hooks)

---

## Quality Gate Criteria

### Pass/Fail Thresholds

- **P0 pass rate**: 100% (no exceptions - blocking for merge)
- **P1 pass rate**: ≥95% (waivers required for failures - blocking for release)
- **P2 pass rate**: ≥90% (informational - non-blocking)
- **High-risk mitigations**: 100% complete or approved waivers (R-001 to R-005)

### Coverage Targets

- **Critical paths**: ≥80% (journal submission, AI feedback, edit flow)
- **Security scenarios**: 100% (R-004 XSS/SQL injection tests must pass)
- **Business logic**: ≥70% (custom questions, recap, past journals)
- **Edge cases**: ≥50% (empty states, validation errors)

### Non-Negotiable Requirements

- [ ] All P0 tests pass (17/17)
- [ ] No high-risk (≥6) items unmitigated (R-001 to R-005 addressed)
- [ ] Security tests (SEC category) pass 100% (R-004 injection tests)
- [ ] Performance targets met (PERF category: R-001 AI <30s, R-007 load <1s)
- [ ] Data integrity tests pass 100% (R-003, R-005 no data loss, no race conditions)

---

## Mitigation Plans

### R-001: AI Batch Timeout Exceeds 30s SLA (Score: 9)

**Mitigation Strategy:**
- Implement 4-level fallback chain:
  - Level 1: GPT-4o-mini (primary, 20s timeout)
  - Level 2: Claude Sonnet (secondary, 5s additional)
  - Level 3: Deterministic template by goal category (instant)
  - Level 4: Generic static fallback (instant)
- Show progress indicator at 10s: "Still processing your reflection..."
- Cache deterministic templates by goal type (fitness, productivity, learning)
- Set circuit breaker: if OpenAI fails >3 times in 5min, skip to Level 2

**Owner:** Backend Dev Team
**Timeline:** Sprint 1 (Week 1-2)
**Status:** Planned
**Verification:**
- P0 test: AI timeout triggers fallback within 30s total
- Load test: 100 concurrent journal submissions complete <30s (p95)
- Monitor: Alert if >5% of AI runs exceed 25s

### R-002: AI Feedback Quality Degradation (Score: 6)

**Mitigation Strategy:**
- Track "Not true" rejection rate per insight type (Affirming, Blocker, Plan)
- Alert if rejection rate >20% in any category over 24h window
- A/B test prompt variations (control vs experimental)
- Feed user edits into prompt improvement loop (weekly analysis)
- Provide edit functionality (US-4.4) as pressure relief valve
- Quarterly review of AI quality metrics with product team

**Owner:** AI/ML Team
**Timeline:** Sprint 2 (Week 3-4)
**Status:** Planned
**Verification:**
- P1 test: "Not true" rejection rate monitored (alert logic)
- Manual test: 10 sample journal entries reviewed by PM for quality
- Metric: Rejection rate <15% after 2 weeks of prompt tuning

### R-003: Journal Data Loss on Submission Failure (Score: 6)

**Mitigation Strategy:**
- Optimistic UI: Save draft to AsyncStorage before API call
- Retry logic with exponential backoff (1s, 2s, 4s - 3 attempts total)
- Show clear state transitions: "Saving..." → "Saved ✓" → "Failed to save ✗"
- Preserve form values on error, pre-fill retry form
- Test with network throttling (slow 3G) and offline mode
- Log failed submissions to Sentry with full context

**Owner:** Mobile Dev Team
**Timeline:** Sprint 1 (Week 1-2)
**Status:** Planned
**Verification:**
- P0 test: Form preserves values on network error
- P1 test: Retry succeeds after initial failure
- Manual test: Simulate network failure mid-submission (Charles Proxy)
- Zero tolerance: No user reports of data loss in first 100 users

### R-004: Custom Question Injection Attack (Score: 6)

**Mitigation Strategy:**
- Sanitize all custom question inputs:
  - Strip HTML tags: `<script>`, `<iframe>`, `<object>`
  - Reject SQL keywords: `DROP`, `DELETE`, `UPDATE`, `INSERT`
  - Escape special characters: `'`, `"`, `;`, `--`
- Use parameterized queries (Supabase client auto-parameterizes)
- Limit custom question length: 200 chars max (frontend + backend validation)
- Validate question format: alphanumeric + basic punctuation only
- Run automated OWASP ZAP scan on journal endpoints
- Penetration test with OWASP Top 10 payloads

**Owner:** Security Lead + Backend Dev
**Timeline:** Sprint 1 (Week 1-2)
**Status:** Planned
**Verification:**
- P0 test: XSS payload rejected (e.g., `<script>alert(1)</script>`)
- P0 test: SQL injection rejected (e.g., `'; DROP TABLE journal_entries;--`)
- Security scan: OWASP ZAP reports 0 high/critical findings
- Penetration test: Manual XSS/SQL injection attempts fail

### R-005: Concurrent Journal Submission Race Condition (Score: 6)

**Mitigation Strategy:**
- Database: Add unique constraint on (user_id, local_date) in journal_entries table
- API: Return 409 Conflict if duplicate detected, with message "Already submitted today"
- Mobile: Disable submit button after first click, show loading spinner
- Backend: Use idempotency key (hash of user_id + local_date + timestamp)
- AI batch: Deduplicate AI runs by idempotency key before processing
- Test with automated double-tap simulation (50ms interval)

**Owner:** Backend Dev + Mobile Dev
**Timeline:** Sprint 1 (Week 1-2)
**Status:** Planned
**Verification:**
- P0 test: Duplicate submission returns 409 error
- P0 test: Submit button disabled after click
- Load test: 2 concurrent submissions → only 1 succeeds, 1 gets 409
- Database: Unique constraint prevents duplicate rows

---

## Assumptions and Dependencies

### Assumptions

1. **AI Provider SLA:** OpenAI and Claude maintain <10s p95 response time for recap generation
2. **User Behavior:** Users submit journal once per day, not multiple times
3. **Custom Questions:** Users create <10 custom questions on average
4. **Journal Volume:** 10K users × 1 journal/day = 10K AI runs/day (peak: 3K/hour at 9pm)
5. **Recap Complexity:** Today's recap queries <50 completions, <10 captures per user (fast query)

### Dependencies

1. **Supabase RLS:** Row Level Security policies deployed for journal_entries, user_edits tables - Required by Sprint 1
2. **AI Providers:** OpenAI API key (GPT-4o-mini) + Anthropic API key (Claude Sonnet) - Required by Sprint 1
3. **AsyncStorage:** React Native AsyncStorage configured for draft persistence - Required by Sprint 1
4. **Push Notifications:** Expo Push configured for AI feedback ready notifications - Required by Sprint 2
5. **Event Logging:** event_log table with journal.submitted event schema - Required by Sprint 1

### Risks to Plan

- **Risk**: OpenAI or Claude experience multi-hour outage during testing
  - **Impact**: Cannot test AI feedback generation (US-4.3)
  - **Contingency**: Use mocked AI responses for tests, defer live AI testing to staging
- **Risk**: Database migration fails to add unique constraint on (user_id, local_date)
  - **Impact**: R-005 mitigation incomplete, race conditions possible
  - **Contingency**: Add application-level check before DB insert (slower but safe)
- **Risk**: Mobile AsyncStorage not working on iOS simulator (known issue)
  - **Impact**: Cannot test draft persistence (R-003 mitigation)
  - **Contingency**: Test on physical device or use alternative storage (SecureStore)

---

## Approval

**Test Design Approved By:**

- [ ] Product Manager: _______ Date: _______
- [ ] Tech Lead: _______ Date: _______
- [ ] QA Lead: _______ Date: _______

**Comments:**

---

## Appendix

### Knowledge Base References

- `risk-governance.md` - Risk classification framework (6 categories, automated scoring)
- `probability-impact.md` - Risk scoring methodology (probability × impact matrix)
- `test-levels-framework.md` - Test level selection (E2E vs API vs Component vs Unit)
- `test-priorities-matrix.md` - P0-P3 prioritization (risk-based mapping, time budgets)

### Related Documents

- PRD: `docs/prd/epic-4-reflection-journaling.md`
- Epic: Epic 4 (28 story points)
- Architecture: `docs/architecture/core-architectural-decisions.md`
- Security: `docs/prd/security-privacy-requirements.md`
- NFRs: `docs/prd/non-functional-requirements.md`

### Test Framework Setup

**Mobile (React Native):**

```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native

# Run mobile tests
npm test

# Run with coverage
npm test -- --coverage
```

**Backend (FastAPI):**

```bash
# Install testing dependencies
uv add --dev pytest pytest-asyncio httpx faker

# Run backend tests
uv run pytest

# Run with coverage
uv run pytest --cov=app --cov-report=html
```

**Database (Supabase RLS):**

```bash
# Start local Supabase
npx supabase start

# Run RLS tests
npx supabase test db

# Apply migrations
npx supabase db push
```

---

**Generated by**: BMad TEA Agent - Test Architect Module
**Workflow**: `.bmad/bmm/testarch/test-design`
**Version**: 4.0 (BMad v6)
