# BMAD Testing Framework Guide

A practical guide to using BMAD's testing workflows for building high-quality test suites in Weave.

---

## Table of Contents

1. [Philosophy](#philosophy)
2. [Why BMAD Testing for Pre-MVP](#why-bmad-testing-for-pre-mvp)
3. [The Five Testing Workflows](#the-five-testing-workflows)
4. [Workflow Execution Sequence](#workflow-execution-sequence)
5. [Detailed Workflow Guides](#detailed-workflow-guides)
6. [Practical Examples for Weave](#practical-examples-for-weave)
7. [Best Practices](#best-practices)
8. [Common Pitfalls](#common-pitfalls)
9. [Quality Gates and Success Criteria](#quality-gates-and-success-criteria)

---

## Philosophy

BMAD testing isn't about generating 10,000 tests or achieving 100% code coverage. It's about:

- **Testing the right things** - Focus on high-risk features, not every line of code
- **Writing tests first** - Design your API/interface *before* implementing it
- **Building systematically** - Follow a proven discipline rather than ad-hoc testing
- **Enabling confidence** - Know what's actually protected and what isn't

**Core principle:** Bad tests (brittle, unmaintainable, low-confidence) are worse than no tests. BMAD workflows help you write *good* tests by forcing you to think about *what* to test before you write *how* to test it.

---

## Why BMAD Testing for Pre-MVP

Weave is **pre-MVP**, which means:

| Situation | Why BMAD Matters |
|-----------|-----------------|
| **No code yet** | BMAD test workflows help you plan tests *before* writing features |
| **Architecture decisions matter** | System-level testability review (testarch-test-design) catches issues early |
| **Limited resources** | Risk-based prioritization (P0/P1/P2/P3) ensures you test what matters most |
| **Building quickly** | TDD discipline (testarch-atdd) prevents bugs that take 10x longer to debug |
| **Quality signal** | Tests become the source of truth for "does this work?" |

---

## The Five Testing Workflows

BMAD provides five workflows for testing, designed to run in sequence:

| # | Workflow | Phase | Purpose | Output |
|---|----------|-------|---------|--------|
| 1 | **testarch-test-design** | Solutioning (Phase 3) or Implementation (Phase 4) | Plan what to test, identify risks, assign priorities | `test-design-system.md` or `test-design-epic-{n}.md` |
| 2 | **testarch-atdd** | Sprint Start | Write failing tests before implementation (TDD) | Failing test files in repo |
| 3 | **testarch-automate** | Mid-Sprint | Add edge cases and deeper coverage after initial features | Additional test files |
| 4 | **testarch-framework** | Sprint 0 or Early Sprint 1 | Set up test infrastructure (tools, config, fixtures) | Test framework scaffolding |
| 5 | **testarch-ci** | Before Release | Automate test execution in CI/CD pipeline | CI configuration, test gates |

---

## Workflow Execution Sequence

### **Typical Timeline**

```
Phase 3 (Solutioning):
  ├─ Run: testarch-test-design (system-level)
  │   Output: test-design-system.md → Validates architecture is testable
  │
  └─ Gate Check: "Can we test this design?"

Phase 4 (Implementation):
  ├─ Sprint 0:
  │   ├─ Run: testarch-framework
  │   │   Output: Playwright config, pytest fixtures, test directories
  │   └─ Run: testarch-ci (optional, can defer)
  │       Output: GitHub Actions or CI config
  │
  └─ Sprint 1+ (Per Epic):
      ├─ Run: testarch-test-design (epic-level)
      │   Output: test-design-epic-{n}.md → Guides which tests to write
      │
      ├─ Run: testarch-atdd
      │   Output: Failing tests matching acceptance criteria
      │
      ├─ Implement feature (make tests pass)
      │
      ├─ Run: testarch-automate (optional)
      │   Output: Additional edge case tests
      │
      └─ Run: testarch-ci (before merge)
          Output: Validate all tests pass, quality gates met
```

---

## Detailed Workflow Guides

### 1. testarch-test-design (Planning Phase)

**When to run:** Before implementing an epic (or once per sprint for a feature)

**What it does:**
- Analyzes acceptance criteria
- Identifies risks (TECH, SEC, PERF, DATA, BUS, OPS)
- Scores each risk (probability × impact)
- Assigns test priorities (P0=critical, P1=high, P2=medium, P3=low)
- Recommends test levels (E2E, API, Component, Unit)

**Output:** A test design document that tells you:
- What to test (broken down by requirement)
- How risky each requirement is
- How many tests you need for each area
- How to prioritize your testing effort

**To run:**
```bash
/bmad:bmm:workflows:testarch-test-design
```

**Example output structure:**

```markdown
# Test Design: Epic 1 - User Authentication

## Risk Assessment

| Risk ID | Category | Description | Probability | Impact | Score | Priority |
|---------|----------|-------------|-------------|--------|-------|----------|
| R-001   | SEC      | Invalid JWT allows access | 2 | 3 | 6 | P0 |
| R-002   | TECH     | Token refresh fails | 1 | 2 | 2 | P2 |

## Coverage Plan

| Requirement | Test Level | Priority | Test Count | Hours |
|-------------|------------|----------|-----------|-------|
| Valid login | E2E | P0 | 3 | 6 |
| Invalid password | API | P1 | 2 | 4 |
| Token expiry | API | P1 | 2 | 4 |

## Quality Gates
- P0 pass rate: 100%
- P1 pass rate: ≥95%
- High-risk items mitigated: 100%
```

**Key outputs from this workflow:**
- Total number of test scenarios needed
- Risk-based prioritization (which tests to write first)
- Estimated effort (hours to test this epic)
- Which test level to use (E2E, API, Component, Unit)

---

### 2. testarch-atdd (Acceptance Test-Driven Development)

**When to run:** At the start of sprint work on an epic

**What it does:**
- Converts acceptance criteria → failing tests
- Generates test files with proper structure
- Uses TDD discipline: Red → Green → Refactor
- Links tests back to risks from test-design

**Output:** Failing test files that you'll make pass during development

**To run:**
```bash
/bmad:bmm:workflows:testarch-atdd
```

**Example:** For "User can login with email and password"

```typescript
// tests/auth.login.spec.ts (FAILING - Written first)

test('Login with valid credentials', async ({ page }) => {
  // Given: I'm on the login page
  await page.goto('/login');

  // When: I enter valid email and password
  await page.fill('[data-testid="email"]', 'user@example.com');
  await page.fill('[data-testid="password"]', 'correct-password');
  await page.click('[data-testid="login-button"]');

  // Then: I'm redirected to dashboard
  await expect(page).toHaveURL('/dashboard');
});

test('Login with invalid password shows error', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'user@example.com');
  await page.fill('[data-testid="password"]', 'wrong-password');
  await page.click('[data-testid="login-button"]');

  // Then: Error message appears
  await expect(page.locator('[data-testid="error"]')).toBeVisible();
});
```

**The TDD cycle:**
```
1. Red:     Run tests → All fail (code doesn't exist yet)
2. Green:   Implement minimum code → All pass
3. Refactor: Clean up code → Tests still pass
```

**Key principle:** You write tests *before* implementation. This:
- Forces you to think about the interface/API first
- Ensures your code is testable (tight coupling makes tests fail)
- Catches design issues before implementation

---

### 3. testarch-automate (Expand Coverage)

**When to run:** After initial feature implementation (mid-epic)

**What it does:**
- Adds edge cases and error handling tests
- Covers scenarios not in acceptance criteria
- Adds performance and security-specific tests
- Targets coverage gaps identified during implementation

**Output:** Additional test files for edge cases

**To run:**
```bash
/bmad:bmm:workflows:testarch-automate
```

**Example: After basic login tests, add:**

```typescript
test('Login fails with non-existent user', async ({ page }) => {
  // Error handling
});

test('Login handles network timeout gracefully', async ({ page }) => {
  // Resilience
});

test('Password field masks input', async ({ page }) => {
  // Security
});

test('Login endpoint rate limits after 5 failed attempts', async ({ page }) => {
  // Brute force protection
});
```

**When to skip:** If your P0 tests are solid and this is low-risk code, skip edge cases for now. Focus on the critical paths first.

---

### 4. testarch-framework (Infrastructure Setup)

**When to run:** Once per project (Sprint 0) before writing many tests

**What it does:**
- Sets up Playwright (for E2E) or pytest (for API/unit)
- Creates test fixtures and helpers
- Configures test data factories
- Sets up test environment configuration

**Output:** Test framework scaffolding

**To run:**
```bash
/bmad:bmm:workflows:testarch-framework
```

**What it creates:**

```
tests/
├── fixtures/           # Test data
│   ├── users.ts
│   └── auth.ts
├── helpers/            # Reusable utilities
│   ├── login-helper.ts
│   └── api-client.ts
├── config/
│   ├── playwright.config.ts
│   └── test-env.ts
└── e2e/
    └── auth.spec.ts
```

**Critical for:**
- Consistent test data (factories instead of hardcoding)
- Reusable helpers (don't repeat login code in every test)
- Environment management (dev, staging, production-like)
- Auto-cleanup (tests don't leave garbage behind)

---

### 5. testarch-ci (Continuous Integration)

**When to run:** Before first release or when setting up CI/CD

**What it does:**
- Configures GitHub Actions (or your CI platform)
- Sets up test gates (P0 must pass, P1≥95%, etc.)
- Defines test execution order (smoke → P0 → P1 → P2/P3)
- Sets up test reporting and artifacts

**Output:** CI configuration files (.github/workflows/test.yml)

**To run:**
```bash
/bmad:bmm:workflows:testarch-ci
```

**Example gate structure:**

```yaml
test-gates:
  smoke:
    timeout: 5 minutes
    requirement: MUST_PASS  # Block merge if fails

  p0:
    timeout: 10 minutes
    requirement: MUST_PASS  # Block merge if fails
    pass-rate: 100%

  p1:
    timeout: 30 minutes
    requirement: WARN_IF_FAILS  # Alert but don't block
    pass-rate: 95%

  p2-p3:
    timeout: 60 minutes
    requirement: OPTIONAL  # Run but don't block
```

---

## Practical Examples for Weave

### Example 1: Testing Goal Creation (Epic: Goal Management)

**Phase 4, Sprint 1: Implementing "User can create a goal"**

#### Step 1: Run testarch-test-design

```
Requirement: User can create a goal with title, description, target date

Risks identified:
- R-001 (SEC): Invalid user can create goals for other users → Score 6 (P0)
- R-002 (DATA): Goal not saved if database connection fails → Score 6 (P0)
- R-003 (BUS): User creates >3 goals → Score 4 (P1)

Test coverage plan:
- E2E: Create goal flow (P0) - 3 tests
- API: Create goal endpoint (P0) - 5 tests
- Unit: Goal validation (P1) - 4 tests
- Total: 12 tests, 16 hours
```

#### Step 2: Run testarch-atdd

```typescript
// tests/api/goals.create.spec.ts (FAILING)

describe('POST /api/goals', () => {
  test('Create goal with valid data', async ({ request }) => {
    const response = await request.post('/api/goals', {
      data: {
        title: 'Learn Rust',
        description: 'Master systems programming',
        targetDate: '2025-12-31'
      }
    });

    expect(response.status()).toBe(201);
    expect(response.json()).toHaveProperty('id');
  });

  test('Prevent unauthorized user from creating goals', async ({ request }) => {
    const response = await request.post('/api/goals', {
      data: { /* ... */ },
      headers: { 'Authorization': 'Bearer invalid-token' }
    });

    expect(response.status()).toBe(401);
  });

  test('Prevent user from exceeding 3 active goals', async ({ request }) => {
    // Create 3 goals first
    for (let i = 0; i < 3; i++) {
      await request.post('/api/goals', { data: { /* ... */ } });
    }

    // 4th should fail
    const response = await request.post('/api/goals', {
      data: { /* ... */ }
    });

    expect(response.status()).toBe(422);
    expect(response.json()).toHaveProperty('error.code', 'GOAL_LIMIT_REACHED');
  });
});
```

#### Step 3: Implement

```typescript
// api/app/routers/goals.py

@router.post('/api/goals', status_code=201)
async def create_goal(user: User = Depends(get_current_user), goal: GoalCreate = Body(...)):
    # Check limit
    existing = await db.query('SELECT COUNT(*) FROM goals WHERE user_id = ?', user.id)
    if existing >= 3:
        raise HTTPException(status_code=422, detail='Goal limit reached')

    # Save to database
    goal_id = await db.execute(
        'INSERT INTO goals (user_id, title, description, target_date) VALUES (?, ?, ?, ?)',
        user.id, goal.title, goal.description, goal.target_date
    )

    return {'id': goal_id}
```

#### Step 4: Run testarch-automate

```typescript
// Additional edge case tests

test('Create goal with empty title fails', async ({ request }) => {
  const response = await request.post('/api/goals', {
    data: { title: '', description: 'Test' }
  });
  expect(response.status()).toBe(422);
});

test('Create goal with future date works', async ({ request }) => {
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 1);

  const response = await request.post('/api/goals', {
    data: {
      title: 'Future Goal',
      targetDate: futureDate.toISOString()
    }
  });
  expect(response.status()).toBe(201);
});

test('Create goal handles database timeout gracefully', async ({ request }) => {
  // Mock database timeout
  sinon.stub(db, 'execute').rejects(new TimeoutError());

  const response = await request.post('/api/goals', {
    data: { /* ... */ }
  });

  expect(response.status()).toBe(503); // Service Unavailable
});
```

#### Step 5: Gate check

```
Before merging PR:
✅ P0 tests pass: 100% (8/8)
✅ P1 tests pass: 100% (4/4)
✅ High-risk item R-001 mitigated: JWT validation added
✅ Coverage: 92% of goal creation code
```

---

### Example 2: Testing Subtask Completion (Epic: Task Management)

**What the test-design workflow tells you:**

```markdown
# Test Design: Epic 2 - Subtask Completion

## Risk Assessment

| Risk | Category | Description | Score | Priority |
|------|----------|-------------|-------|----------|
| R-001 | DATA | Completion event not persisted | 9 (3×3) | P0 |
| R-002 | BUS | Streak doesn't update on completion | 6 (2×3) | P0 |
| R-003 | TECH | Race condition if user completes twice | 6 (2×3) | P1 |

## Coverage Plan

Test Levels:
- E2E: Full completion flow (capture → submit) - P0
- API: POST /api/completions endpoint - P0
- Unit: Streak calculation logic - P1

Data Setup:
- Fixtures: Pre-created users, subtasks, dates
- Factories: Create test data on-demand
- Cleanup: Delete test data after each test

Test Count: 18 tests, 24 hours
```

**What testarch-atdd generates:**

```typescript
// tests/api/completions.spec.ts

describe('POST /api/subtask-completions', () => {
  let testUser: User;
  let testSubtask: Subtask;

  beforeEach(async () => {
    testUser = await createTestUser();
    testSubtask = await createTestSubtask(testUser.id);
  });

  afterEach(async () => {
    await cleanupTestData(testUser.id);
  });

  test('Record subtask completion creates immutable event', async ({ request }) => {
    const response = await request.post('/api/subtask-completions', {
      data: {
        subtask_id: testSubtask.id,
        local_date: '2025-12-17',
        note: 'Completed the task'
      }
    });

    expect(response.status()).toBe(201);
    expect(response.json()).toEqual({
      id: expect.any(String),
      subtask_id: testSubtask.id,
      completed_at: expect.any(String),
      note: 'Completed the task'
    });

    // Verify immutability: cannot update
    const updateResponse = await request.patch(
      `/api/subtask-completions/${response.json().id}`,
      { data: { note: 'Changed note' } }
    );
    expect(updateResponse.status()).toBe(405); // Method Not Allowed
  });

  test('Completion updates user streak', async ({ request }) => {
    // Initial streak = 0
    let userStats = await getUser(testUser.id);
    expect(userStats.current_streak).toBe(0);

    // Complete a subtask
    await request.post('/api/subtask-completions', {
      data: { subtask_id: testSubtask.id, local_date: '2025-12-17' }
    });

    // Streak should be 1
    userStats = await getUser(testUser.id);
    expect(userStats.current_streak).toBe(1);
  });

  test('Prevent duplicate completions on same day', async ({ request }) => {
    // First completion succeeds
    const first = await request.post('/api/subtask-completions', {
      data: { subtask_id: testSubtask.id, local_date: '2025-12-17' }
    });
    expect(first.status()).toBe(201);

    // Second completion same day fails
    const second = await request.post('/api/subtask-completions', {
      data: { subtask_id: testSubtask.id, local_date: '2025-12-17' }
    });
    expect(second.status()).toBe(409); // Conflict
  });
});
```

---

## Best Practices

### 1. **Use Risk Scores to Prioritize Testing**

```
❌ Wrong: "We need 100% code coverage"
✅ Right: "High-risk areas (score ≥6) must be P0 with 100% pass rate"

Example:
- Auth validation (R-001, score 9) → Test heavily (P0)
- UI styling (low-risk) → Test lightly or skip (P3)
```

### 2. **Write Tests Before Implementation**

```
❌ Wrong: Write feature, then write tests
✅ Right: Write tests (they fail), then implement (tests pass)

Benefits:
- Tests drive API design (you design for testability)
- You can't "forget" to test (tests were already written)
- Implementation is simple: "make the test pass"
```

### 3. **Use Test Helpers to DRY Up Code**

```typescript
❌ Wrong: Repeat login logic in every test
await page.goto('/login');
await page.fill('[data-testid="email"]', 'user@example.com');
await page.fill('[data-testid="password"]', 'password');
await page.click('[data-testid="login-button"]');

✅ Right: Create helper
await loginAs(page, 'user@example.com', 'password');
```

### 4. **Use Test Fixtures for Consistent Data**

```typescript
❌ Wrong: Create test data inline
const userId = Math.random().toString(); // Unreliable

✅ Right: Use factories
const testUser = await createTestUser({ email: 'test@example.com' });
```

### 5. **Isolate Tests - No Dependencies Between Tests**

```typescript
❌ Wrong: Test B depends on Test A running first
describe('User flow', () => {
  test('Step 1: Create account', () => { /* ... */ });
  test('Step 2: Login', () => { /* depends on Step 1 */ });
});

✅ Right: Each test is independent
describe('Create account', () => {
  beforeEach(() => { createTestUser(); });
  test('Valid creation succeeds', () => { /* ... */ });
});

describe('Login', () => {
  beforeEach(() => { createTestUser(); });
  test('Valid login succeeds', () => { /* ... */ });
});
```

---

## Common Pitfalls

### 1. **"Let's Auto-Generate All Tests"**

❌ **Problem:** You generate 5,000 tests that pass but don't actually test anything

✅ **Solution:** Use test-design to identify *what* to test. Write tests by hand. Use AI to help with boilerplate/repetition.

---

### 2. **Testing Implementation Details Instead of Behavior**

❌ **Wrong:**
```typescript
test('createGoal calls db.execute with correct SQL', () => {
  // Brittle: fails if you refactor SQL
  expect(mockDb.execute).toHaveBeenCalledWith(
    'INSERT INTO goals ...'
  );
});
```

✅ **Right:**
```typescript
test('Creating a goal saves it and returns id', async () => {
  const response = await createGoal({ title: 'Learn Rust' });
  expect(response.id).toBeDefined();

  // Verify it was actually saved
  const saved = await getGoal(response.id);
  expect(saved.title).toBe('Learn Rust');
});
```

---

### 3. **Flaky Tests (Timeouts, Race Conditions)**

❌ **Problem:**
```typescript
test('Modal appears', () => {
  click(button);
  expect(modal).toBeVisible();  // Flaky: timing issues
});
```

✅ **Solution:**
```typescript
test('Modal appears', async ({ page }) => {
  await page.click('[data-testid="button"]');
  // Playwright auto-waits for element to be visible
  await expect(page.locator('[data-testid="modal"]')).toBeVisible();
});
```

---

### 4. **Shared Test State**

❌ **Problem:**
```typescript
let userId;

test('Create user', async () => {
  userId = await createUser(); // Pollutes global state
});

test('Get user', async () => {
  // Depends on userId from previous test
  const user = await getUser(userId);
});
```

✅ **Solution:**
```typescript
test('Create and get user', async () => {
  const userId = await createUser();
  const user = await getUser(userId);
  expect(user).toBeDefined();
});
```

---

### 5. **Skipping the Test-Design Workflow**

❌ **Problem:** You jump to writing tests without understanding:
- What risks you're trying to mitigate
- Which tests are actually critical (P0 vs P3)
- How much effort this will take
- What test levels make sense

✅ **Solution:** Always run testarch-test-design first. It takes 30 minutes and saves hours of wrong-direction testing.

---

## Quality Gates and Success Criteria

### Release Criteria (Before shipping)

```yaml
Test Gates:
  P0 Tests:
    pass_rate: 100%
    timeout: 10 minutes
    blocking: true

  P1 Tests:
    pass_rate: "≥ 95%"
    timeout: 30 minutes
    blocking: false  # Warn but don't block

  High-Risk Mitigations:
    mitigated: 100%
    blocking: true

  Test Coverage:
    target: "≥ 80% of critical paths"
    blocking: false

Code Quality:
  Type Safety: No `any` types in test code
  Linting: ESLint/Pylint pass
  No Secrets: No API keys in test files
```

### Sprint Success Criteria

```
✅ Epic is "done" when:
1. test-design document complete
2. testarch-atdd tests written (all failing initially)
3. Feature implemented (all testarch-atdd tests passing)
4. testarch-automate edge cases added (optional)
5. P0 pass rate = 100%
6. P1 pass rate ≥ 95%
7. No high-risk items unmitigated
```

---

## Quick Reference: Which Workflow to Use When

| Situation | Workflow | Command |
|-----------|----------|---------|
| Starting to plan an epic | testarch-test-design | `/bmad:bmm:workflows:testarch-test-design` |
| Ready to write tests | testarch-atdd | `/bmad:bmm:workflows:testarch-atdd` |
| Tests written, need more coverage | testarch-automate | `/bmad:bmm:workflows:testarch-automate` |
| Setting up test infrastructure | testarch-framework | `/bmad:bmm:workflows:testarch-framework` |
| Setting up CI/CD | testarch-ci | `/bmad:bmm:workflows:testarch-ci` |

---

## Honest Recommendations for Weave

1. **Sprint 0 (Before implementation starts):**
   - Run `testarch-framework` once to set up Playwright + pytest
   - Run `testarch-ci` to configure quality gates

2. **Per Epic (Before starting work):**
   - Run `testarch-test-design` → Understand what to test
   - Run `testarch-atdd` → Get failing tests
   - Implement feature → Make tests pass
   - Optional: Run `testarch-automate` for edge cases

3. **Before releasing:**
   - Ensure P0 tests = 100% pass
   - Ensure P1 tests ≥ 95% pass
   - Verify high-risk items are mitigated

---

## Playwright Integration in BMAD

BMAD has **first-class Playwright support** for E2E and component testing:

### What Playwright Provides

- **Web/React Native Web**: E2E testing with full browser automation
- **Mobile**: Can test mobile-optimized websites and PWAs
- **Cross-browser**: Run tests on Chromium, Firefox, WebKit
- **Auto-waiting**: Waits for elements to be ready (eliminates flaky timeouts)
- **Network inspection**: Capture API calls, mock responses
- **Visual testing**: Screenshots and visual regression detection

### Playwright + BMAD Workflows

**In testarch-test-design:**
- Recommends Playwright for "E2E (End-to-End)" test level
- Suggests using Playwright for critical user journeys
- Recommends for testing across browsers

**In testarch-atdd:**
- Generates Playwright test skeletons
- Uses Playwright syntax for page interactions
- Sets up test data and cleanup hooks

**In testarch-framework:**
- Creates `playwright.config.ts` with:
  - Browser configuration (Chromium, Firefox, WebKit)
  - Test timeout and retry settings
  - Base URL and environment config
  - Screenshots/videos on failure
  - Test reporter setup

**Optional: MCP Browser Exploration (Advanced)**
- If Playwright MCP tools available, can auto-explore brownfield apps
- Captures screenshots, network requests, console errors
- Helps discover test scenarios without documentation

### Playwright Best Practices (For Weave)

For **React Native web** + **FastAPI backend**:

```typescript
// tests/setup.ts - Global setup
import { chromium } from '@playwright/test';

async function globalSetup() {
  // Start backend test server
  // Seed test database
  // Set up test environment
}

export default globalSetup;
```

```typescript
// tests/auth.spec.ts - E2E test
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Each test starts fresh
    await page.goto('http://localhost:3000');
  });

  test('User can login', async ({ page }) => {
    // Type into input
    await page.fill('[data-testid="email"]', 'user@example.com');

    // Click button
    await page.click('[data-testid="login-button"]');

    // Wait for navigation (Playwright auto-waits)
    await expect(page).toHaveURL('/dashboard');

    // Verify element visible
    await expect(page.locator('[data-testid="welcome"]')).toBeVisible();
  });

  test('Network request is made with correct auth header', async ({ page }) => {
    // Intercept network requests
    const requestPromise = page.waitForRequest(
      request => request.url().includes('/api/goals')
    );

    await page.click('[data-testid="fetch-goals"]');

    const request = await requestPromise;
    expect(request.headers()['authorization']).toContain('Bearer');
  });

  test('API error is handled gracefully', async ({ page }) => {
    // Mock API to return error
    await page.route('/api/goals', route =>
      route.abort('failed')
    );

    await page.click('[data-testid="fetch-goals"]');

    // Verify error message shown
    await expect(page.locator('[data-testid="error"]'))
      .toContainText('Failed to load goals');
  });
});
```

```typescript
// tests/fixtures/auth-fixture.ts - Reusable login helper
export async function loginAs(page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('[data-testid="email"]', email);
  await page.fill('[data-testid="password"]', password);
  await page.click('[data-testid="login-button"]');

  // Wait for successful redirect
  await page.waitForURL('/dashboard');
}
```

```typescript
// tests/goals.spec.ts - Using the helper
import { loginAs } from './fixtures/auth-fixture';

test('User can create a goal after login', async ({ page }) => {
  // Reuse the login helper instead of repeating
  await loginAs(page, 'test@example.com', 'password');

  await page.click('[data-testid="create-goal"]');
  await page.fill('[data-testid="goal-title"]', 'Learn Rust');
  await page.click('[data-testid="save-goal"]');

  await expect(page.locator('text=Learn Rust')).toBeVisible();
});
```

### Playwright Configuration for Weave

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Running Playwright Tests with BMAD

```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test tests/auth.spec.ts

# Run with UI (visual debugging)
npx playwright test --ui

# Run headless (CI mode)
npx playwright test --headed=false

# Record test (interactive recording)
npx playwright codegen http://localhost:3000
```

---

## Additional Resources

- **Test Design Workflow Details:** `.bmad/bmm/workflows/testarch/test-design/instructions.md`
- **ATDD Workflow Details:** `.bmad/bmm/workflows/testarch/atdd/instructions.md`
- **Risk Assessment Framework:** `.bmad/bmm/testarch/risk-governance.md`
- **Test Levels Decision Matrix:** `.bmad/bmm/testarch/test-levels-framework.md`
- **Playwright Official Docs:** https://playwright.dev
- **Playwright React Native Testing:** https://playwright.dev/docs/experimental-features

---

## Questions or Issues?

This framework is designed to be practical. If something doesn't make sense:
- Review the relevant BMAD workflow documentation
- Check concrete examples in your test files
- Run party-mode for multi-perspective discussion: `/bmad:core:workflows:party-mode`

Good luck building Weave! 🚀
