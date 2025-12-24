# E2E Testing with Detox

Complete end-to-end testing infrastructure for Weave mobile app using Detox.

---

## Setup

### 1. Install Dependencies

```bash
cd weave-mobile
npm install -D detox detox-cli ts-jest @types/jest
```

### 2. Install Detox CLI Globally (Optional)

```bash
npm install -g detox-cli
```

### 3. Configure Environment

```bash
cp .env.test.example .env.test
# Edit .env.test with your test environment values
```

### 4. Build iOS App (First Time)

```bash
detox build --configuration ios.sim.debug
```

### 5. Build Android App (First Time)

```bash
detox build --configuration android.emu.debug
```

---

## Running Tests

### iOS Simulator

```bash
# Run all E2E tests on iOS
detox test --configuration ios.sim.debug

# Run specific test file
detox test --configuration ios.sim.debug e2e/onboarding.test.ts

# Run with app already built (faster)
detox test --configuration ios.sim.debug --reuse

# Debug mode (see app UI)
detox test --configuration ios.sim.debug --debug-synchronization
```

### Android Emulator

```bash
# Run all E2E tests on Android
detox test --configuration android.emu.debug

# Run specific test file
detox test --configuration android.emu.debug e2e/goals.test.ts

# Run with app already built (faster)
detox test --configuration android.emu.debug --reuse
```

### Quick Test Commands

```bash
# Full rebuild + test (slow, use for CI)
npm run test:e2e:ios
npm run test:e2e:android

# Reuse existing build (fast, use for local development)
npm run test:e2e:ios:reuse
npm run test:e2e:android:reuse
```

---

## Architecture

### Directory Structure

```
e2e/
├── support/                    # Test infrastructure
│   ├── fixtures/               # Test fixtures with auto-cleanup
│   │   ├── index.ts            # Base fixture setup/teardown
│   │   └── factories/          # Data factories
│   │       ├── user.factory.ts # User factory with faker
│   │       └── goal.factory.ts # Goal factory with faker
│   ├── helpers/                # Utility functions
│   └── matchers/               # Custom Jest matchers
├── onboarding.test.ts          # Onboarding flow tests
├── goals.test.ts               # Goal management tests
├── journal.test.ts             # Journal entry tests
├── jest.config.js              # Jest configuration for Detox
└── README.md                   # This file
```

### Fixture Pattern

All tests use the **fixture pattern** with auto-cleanup:

```typescript
import { setupTest, teardownTest } from './support/fixtures';

describe('Feature', () => {
  let fixture: any;

  beforeEach(async () => {
    fixture = await setupTest();
  });

  afterEach(async () => {
    await teardownTest(fixture);
  });

  it('should test something', async () => {
    const user = await fixture.userFactory.createUser();
    // ... test logic
    // Cleanup happens automatically in afterEach
  });
});
```

### Data Factories

Use **@faker-js/faker** for realistic test data:

```typescript
const user = await fixture.userFactory.createUser({
  email: 'custom@example.com', // Override defaults
});

const goal = await fixture.goalFactory.createGoal(user.id, {
  title: 'Custom Goal Title',
});
```

All created data is **automatically cleaned up** after tests.

---

## Best Practices

### 1. Selector Strategy

Use `testID` prop for stable selectors:

```tsx
// Component
<Button testID="login-button">Login</Button>;

// Test
await element(by.id('login-button')).tap();
```

### 2. Test Isolation

Each test should:

- Create its own test data
- Not depend on other tests
- Clean up after itself (automatic with fixtures)

### 3. Waiting for Elements

Use `waitFor` for asynchronous UI updates:

```typescript
await waitFor(element(by.id('dashboard-screen')))
  .toBeVisible()
  .withTimeout(10000);
```

### 4. Given-When-Then Structure

Write tests in clear steps:

```typescript
it('should create a goal', async () => {
  // GIVEN: User is logged in
  await loginUser(testUser);

  // WHEN: User creates a new goal
  await element(by.id('add-goal-fab')).tap();
  await element(by.id('goal-title-input')).typeText('New Goal');
  await element(by.id('create-goal-button')).tap();

  // THEN: Goal appears in dashboard
  await expect(element(by.text('New Goal'))).toBeVisible();
});
```

### 5. Screenshot on Failure

Detox automatically captures screenshots on failure. Find them in:

```
artifacts/[test-name]/[timestamp].png
```

---

## Troubleshooting

### Build Failures

**iOS:**

```bash
# Clean Xcode build
cd ios && xcodebuild clean
cd .. && detox build --configuration ios.sim.debug
```

**Android:**

```bash
# Clean Gradle build
cd android && ./gradlew clean
cd .. && detox build --configuration android.emu.debug
```

### Test Timeouts

Increase timeout in `e2e/jest.config.js`:

```javascript
module.exports = {
  testTimeout: 180000, // 3 minutes
  // ...
};
```

### App Not Launching

```bash
# Rebuild app with fresh install
detox build --configuration ios.sim.debug
detox test --configuration ios.sim.debug --cleanup
```

### Simulator/Emulator Issues

**iOS:**

```bash
# Reset iOS simulator
xcrun simctl shutdown all
xcrun simctl erase all
```

**Android:**

```bash
# List emulators
emulator -list-avds

# Start specific emulator
emulator -avd Pixel_7_API_34
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [pull_request]

jobs:
  e2e-ios:
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: detox build --configuration ios.sim.release
      - run: detox test --configuration ios.sim.release --cleanup

  e2e-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: detox build --configuration android.emu.release
      - run: detox test --configuration android.emu.release --cleanup
```

---

## Knowledge Base References

This testing infrastructure follows patterns from:

- **fixture-architecture.md** - Fixture pattern with auto-cleanup
- **data-factories.md** - Faker-based factories with overrides
- **test-quality.md** - Deterministic tests, isolation, explicit assertions

See `_bmad/bmm/testarch/knowledge/` for full patterns.

---

## Next Steps

1. **Add More Test Files:**
   - `journal.test.ts` - Daily reflection tests
   - `ai-chat.test.ts` - AI coaching tests
   - `progress.test.ts` - Progress visualization tests

2. **Enhance Fixtures:**
   - Add `JournalFactory` for journal entries
   - Add `CaptureFactory` for proof images
   - Add `TriadFactory` for daily plans

3. **Add Helpers:**
   - `login.helper.ts` - Reusable login logic
   - `navigation.helper.ts` - Common navigation flows
   - `assertions.helper.ts` - Custom assertions

4. **CI/CD:**
   - Set up GitHub Actions workflow
   - Configure screenshot/video uploads on failure
   - Add test result reporting

---

**Generated by:** BMad Test Architect (TEA)
**Date:** 2025-12-23
**Framework:** Detox v20+ (React Native E2E)
