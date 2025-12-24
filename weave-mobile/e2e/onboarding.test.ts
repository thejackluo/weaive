import { element, by, expect, setupTest, teardownTest } from './support/fixtures';

describe('Onboarding Flow', () => {
  let fixture: any;

  beforeEach(async () => {
    fixture = await setupTest();
  });

  afterEach(async () => {
    await teardownTest(fixture);
  });

  it('should complete welcome screen and navigate to emotional state', async () => {
    // GIVEN: User opens app for first time
    await expect(element(by.id('welcome-screen'))).toBeVisible();

    // WHEN: User taps "Get Started" button
    await element(by.id('get-started-button')).tap();

    // THEN: Emotional state selection screen appears
    await expect(element(by.id('emotional-state-screen'))).toBeVisible();
    await expect(element(by.text('How are you feeling?'))).toBeVisible();
  });

  it('should select emotional state and navigate to insight', async () => {
    // GIVEN: User is on emotional state screen
    await element(by.id('get-started-button')).tap();
    await expect(element(by.id('emotional-state-screen'))).toBeVisible();

    // WHEN: User selects "Stuck" emotion
    await element(by.id('emotion-stuck')).tap();

    // THEN: Insight reflection screen appears
    await expect(element(by.id('insight-reflection-screen'))).toBeVisible();
  });

  it('should complete authentication and create account', async () => {
    // GIVEN: User has completed onboarding steps
    // Navigate through onboarding flow...
    await element(by.id('get-started-button')).tap();
    await element(by.id('emotion-stuck')).tap();
    await element(by.id('continue-button')).tap();

    // WHEN: User reaches authentication
    await expect(element(by.id('authentication-screen'))).toBeVisible();

    const testUser = await fixture.userFactory.createUser({
      email: 'test@example.com',
      password: 'SecurePass123!',
    });

    await element(by.id('email-input')).typeText(testUser.email);
    await element(by.id('password-input')).typeText(testUser.password);
    await element(by.id('signup-button')).tap();

    // THEN: User navigates to dashboard
    await expect(element(by.id('dashboard-screen'))).toBeVisible();
  });
});
