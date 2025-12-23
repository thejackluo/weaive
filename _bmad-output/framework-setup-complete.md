# Test Framework Setup - Complete

**Project:** Weave Mobile (React Native + Expo)
**Date:** 2025-12-23
**Framework:** Detox v20+ (React Native E2E)
**User:** Jack Luo

---

## ✅ Framework Scaffold Complete

**Primary Framework:** Detox (E2E for React Native)
**Secondary Framework:** Jest + React Testing Library (Component/API tests)

---

## Artifacts Created

### 1. **Detox Configuration**
- ✅ `.detoxrc.js` - Main Detox config
  - iOS simulator configurations (debug + release)
  - Android emulator configurations (debug + release)
  - Test runner: Jest with 120s timeout
  - Device targets: iPhone 15 Pro, Pixel 7 API 34

### 2. **Jest Configuration for E2E**
- ✅ `e2e/jest.config.js` - E2E-specific Jest config
  - Detox test environment
  - TypeScript support via ts-jest
  - 120s test timeout
  - Single worker (Detox requirement)

### 3. **Directory Structure**
```
weave-mobile/
├── e2e/                                # E2E test directory
│   ├── support/                        # Test infrastructure
│   │   ├── fixtures/                   # Fixtures with auto-cleanup
│   │   │   ├── index.ts                # Base fixture setup/teardown
│   │   │   └── factories/              # Data factories
│   │   │       ├── user.factory.ts     # User factory (faker-based)
│   │   │       └── goal.factory.ts     # Goal factory (faker-based)
│   │   ├── helpers/                    # Utility functions (empty, ready for use)
│   │   └── matchers/                   # Custom matchers (empty, ready for use)
│   ├── onboarding.test.ts              # Onboarding flow E2E tests
│   ├── goals.test.ts                   # Goal management E2E tests
│   ├── jest.config.js                  # Jest config for Detox
│   └── README.md                       # Complete E2E testing guide
├── .detoxrc.js                         # Detox configuration
├── .nvmrc                              # Node version (22.18.0)
└── .env.test.example                   # Test environment template
```

### 4. **Test Infrastructure**

**Fixture Architecture** (`e2e/support/fixtures/index.ts`):
- ✅ Base `TestFixture` class with factories
- ✅ `setupTest()` function (launches app + creates fixture)
- ✅ `teardownTest()` function (auto-cleanup)
- ✅ Exports Detox primitives (`device`, `element`, `by`, `expect`)

**Data Factories**:
- ✅ `UserFactory` - Creates test users via API
  - Uses @faker-js/faker for realistic data
  - Auto-tracks created users
  - Cleanup via API DELETE
- ✅ `GoalFactory` - Creates test goals via API
  - Faker-based titles/descriptions
  - Auto-tracks created goals
  - Cleanup via API DELETE

### 5. **Sample E2E Tests**

**Onboarding Flow** (`e2e/onboarding.test.ts`):
- ✅ Test: Complete welcome screen navigation
- ✅ Test: Select emotional state
- ✅ Test: Complete authentication + create account

**Goal Management** (`e2e/goals.test.ts`):
- ✅ Test: Create new goal
- ✅ Test: Display goal details

All tests follow **Given-When-Then** structure.

### 6. **Environment Configuration**
- ✅ `.env.test.example` - Template with:
  - `TEST_ENV`, `BASE_URL`, `API_URL`
  - Supabase test project config
  - Test user credentials
  - Feature flags
  - AI service keys (optional)

### 7. **Node Version**
- ✅ `.nvmrc` - Node 22.18.0 (current system version)

### 8. **Package.json Scripts**
- ✅ `test:e2e:ios` - Build + test on iOS simulator
- ✅ `test:e2e:ios:reuse` - Test on iOS (skip build, faster)
- ✅ `test:e2e:android` - Build + test on Android emulator
- ✅ `test:e2e:android:reuse` - Test on Android (skip build, faster)

### 9. **Documentation**
- ✅ `e2e/README.md` - Complete guide (50+ sections):
  - Setup instructions
  - Running tests (iOS + Android)
  - Architecture overview
  - Fixture pattern explanation
  - Data factory usage
  - Best practices (selectors, isolation, Given-When-Then)
  - Troubleshooting guide
  - CI/CD integration examples
  - Knowledge base references

---

## What Kind of Tests Can We Run?

### 1. **E2E Tests (Detox - New)**

**What:** Full user journeys on real devices/simulators
**When to Use:**
- Critical user flows (onboarding, authentication, goal creation)
- Multi-screen workflows
- Navigation testing
- Gesture interactions (swipes, taps, long-press)
- Full app integration testing

**Examples:**
```typescript
// Test complete onboarding flow
it('should complete onboarding and create account', async () => {
  await element(by.id('get-started-button')).tap();
  await element(by.id('emotion-stuck')).tap();
  // ... complete flow
  await expect(element(by.id('dashboard-screen'))).toBeVisible();
});

// Test goal creation with API cleanup
it('should create and display goal', async () => {
  const user = await fixture.userFactory.createUser();
  await loginUser(user);
  await element(by.id('add-goal-fab')).tap();
  await element(by.id('goal-title-input')).typeText('New Goal');
  await element(by.id('create-goal-button')).tap();
  await expect(element(by.text('New Goal'))).toBeVisible();
  // Auto-cleanup happens in afterEach
});
```

**Test Files to Create:**
- `e2e/onboarding.test.ts` ✅ (already created)
- `e2e/goals.test.ts` ✅ (already created)
- `e2e/journal.test.ts` (next: daily reflection flows)
- `e2e/ai-chat.test.ts` (next: AI coaching interactions)
- `e2e/progress.test.ts` (next: progress visualization)
- `e2e/authentication.test.ts` (next: login/logout flows)

### 2. **Component Tests (Jest + RTL - Existing)**

**What:** Test React Native components in isolation
**When to Use:**
- UI component behavior (buttons, forms, modals)
- State management within components
- Props and event handling
- Accessibility testing
- Visual regression (with snapshots)

**Examples:**
```typescript
// Test button component
it('should disable button when loading', () => {
  const { getByTestId } = render(<Button loading={true}>Submit</Button>);
  expect(getByTestId('submit-button')).toBeDisabled();
});

// Test form validation
it('should show error for invalid email', async () => {
  const { getByTestId, findByText } = render(<LoginForm />);
  fireEvent.changeText(getByTestId('email-input'), 'invalid-email');
  fireEvent.press(getByTestId('submit-button'));
  expect(await findByText('Invalid email format')).toBeTruthy();
});
```

**Test Files (You Create):**
- `src/components/__tests__/VoiceRecorder.test.tsx` (exists)
- `src/hooks/__tests__/useAIChat.test.ts` (next: Story 1.5.3)
- `src/hooks/__tests__/useImageAnalysis.test.ts` (next: Story 1.5.3)
- `src/screens/__tests__/NeedlesListScreen.test.tsx` (exists)

### 3. **API Integration Tests (Jest - Backend)**

**What:** Test FastAPI endpoints with real database
**When to Use:**
- Backend business logic
- API contracts (request/response format)
- Database integration
- AI provider fallback chains
- Cost tracking + rate limiting

**Examples:**
```typescript
// Test AI text generation endpoint
it('should generate text with GPT-4o-mini', async () => {
  const response = await request(app)
    .post('/api/ai/generate')
    .send({
      messages: [{ role: 'user', content: 'Hello' }],
      context: { operation_type: 'chat' },
    });
  
  expect(response.status).toBe(200);
  expect(response.body.data.text).toBeDefined();
  expect(response.body.data.provider).toBe('gpt-4o-mini');
});

// Test rate limiting
it('should return 429 when rate limit exceeded', async () => {
  // Hit endpoint 11 times (limit: 10)
  for (let i = 0; i < 11; i++) {
    const response = await request(app).post('/api/ai/generate').send(payload);
    if (i === 10) {
      expect(response.status).toBe(429);
      expect(response.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
    }
  }
});
```

**Test Files (Backend - weave-api/tests/):**
- `tests/test_ai_service.py` (exists)
- `tests/test_vision_service.py` (exists)
- `tests/test_stt_service.py` (exists)
- `tests/test_goals_list.py` (exists)

### 4. **Unit Tests (Jest - Utilities/Helpers)**

**What:** Test pure functions, utilities, business logic
**When to Use:**
- Pure functions (no side effects)
- Data transformations
- Validation logic
- Utility functions
- Type guards

**Examples:**
```typescript
// Test data transformation
it('should format date for display', () => {
  const date = new Date('2025-12-23');
  expect(formatDateForDisplay(date)).toBe('Dec 23, 2025');
});

// Test validation logic
it('should validate goal title length', () => {
  expect(validateGoalTitle('Valid Title')).toBe(true);
  expect(validateGoalTitle('A')).toBe(false); // Too short
  expect(validateGoalTitle('A'.repeat(101))).toBe(false); // Too long
});
```

---

## Test Coverage Strategy

| Test Type | Purpose | Speed | Confidence | Ratio |
|-----------|---------|-------|------------|-------|
| **E2E (Detox)** | Critical user journeys | Slow (30s-2min/test) | Highest | 10-15 tests |
| **Component (Jest)** | UI behavior + hooks | Fast (100ms-1s/test) | High | 50-100 tests |
| **API (Jest)** | Backend logic | Medium (500ms-5s/test) | High | 30-50 tests |
| **Unit (Jest)** | Pure functions | Fastest (<100ms/test) | Medium | 100+ tests |

**Pyramid Strategy:**
- Wide base: Many fast unit tests
- Middle: Moderate component + API tests
- Narrow top: Few critical E2E tests

---

## Next Steps

### 1. **Install Detox Dependencies**

```bash
cd weave-mobile
npm install -D detox detox-cli ts-jest
```

### 2. **Configure Test Environment**

```bash
cp .env.test.example .env.test
# Edit .env.test with your test Supabase project + API URL
```

### 3. **Build and Run E2E Tests**

**iOS:**
```bash
# First time: build app
detox build --configuration ios.sim.debug

# Run tests
detox test --configuration ios.sim.debug

# Faster (reuse build)
npm run test:e2e:ios:reuse
```

**Android:**
```bash
# First time: build app
detox build --configuration android.emu.debug

# Run tests
detox test --configuration android.emu.debug

# Faster (reuse build)
npm run test:e2e:android:reuse
```

### 4. **Add testID Props to Components**

For E2E tests to work, add `testID` props:

```tsx
// Before
<Button onPress={handleLogin}>Login</Button>

// After
<Button testID="login-button" onPress={handleLogin}>
  Login
</Button>
```

### 5. **Create More Test Files**

**Recommended Priority:**
1. `e2e/authentication.test.ts` - Login/logout flows
2. `e2e/journal.test.ts` - Daily reflection
3. `src/hooks/__tests__/useAIChat.test.ts` - AI hooks (Story 1.5.3)
4. `e2e/ai-chat.test.ts` - AI coaching E2E

### 6. **Run ATDD Workflow for Story 1.5.3**

Now that framework is set up, you can run:

```bash
/testarch-atdd
```

This will generate failing tests for Story 1.5.3 (AI Services Standardization).

---

## Knowledge Base References Applied

- **fixture-architecture.md** - Fixture pattern with auto-cleanup
- **data-factories.md** - Faker-based factories with overrides
- **test-quality.md** - Deterministic tests, isolation, explicit assertions
- **test-levels-framework.md** - E2E vs Component vs API vs Unit decision tree

Full knowledge base: `_bmad/bmm/testarch/knowledge/`

---

## CI/CD Integration (Future)

Once tests are stable, add to GitHub Actions:

```yaml
name: E2E Tests
on: [pull_request]
jobs:
  e2e-ios:
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: detox build --configuration ios.sim.release
      - run: detox test --configuration ios.sim.release
```

---

## Framework Comparison Summary

### Detox (E2E - What We Built)
✅ **Pros:**
- Native React Native support
- Real device/simulator testing
- Deterministic synchronization (waits for React Native bridge)
- Video/screenshot artifacts
- Works with Expo

✅ **Best For:**
- Full app integration tests
- Navigation flows
- Gesture interactions
- Critical user journeys

❌ **Cons:**
- Slower than component tests
- Requires simulator/emulator
- More complex setup

### Jest + RTL (Component - Already Have)
✅ **Pros:**
- Fast (runs in Node.js)
- Great for component logic
- Easy to mock dependencies
- Integrates with existing Jest setup

✅ **Best For:**
- Component behavior
- Hooks testing
- State management
- Form validation

❌ **Cons:**
- No real UI rendering
- Can't test navigation
- Mocked environment (not real app)

### Combined Strategy (Recommended)
- **Detox:** 10-15 critical E2E tests (happy paths, edge cases)
- **Jest + RTL:** 50-100 component/hook tests (UI logic, state)
- **Pytest:** 30-50 API tests (backend logic, cost tracking)
- **Jest:** 100+ unit tests (pure functions, utilities)

---

**Framework Setup Complete** ✅

Ready to run `/testarch-atdd` for Story 1.5.3 AI Services Standardization!

---

**Generated by:** BMad Test Architect (TEA)
**Workflow:** `testarch-framework`
**Date:** 2025-12-23
