import { device, element, by, expect, setupTest, teardownTest } from './support/fixtures';

describe('Goal Management', () => {
  let fixture: any;
  let testUser: any;

  beforeEach(async () => {
    fixture = await setupTest();

    // Create and authenticate test user
    testUser = await fixture.userFactory.createUser();
    await element(by.id('email-input')).typeText(testUser.email);
    await element(by.id('password-input')).typeText(testUser.password);
    await element(by.id('login-button')).tap();
    await expect(element(by.id('dashboard-screen'))).toBeVisible();
  });

  afterEach(async () => {
    await teardownTest(fixture);
  });

  it('should create a new goal', async () => {
    // GIVEN: User is on dashboard
    await expect(element(by.id('dashboard-screen'))).toBeVisible();

    // WHEN: User taps "Add Goal" button
    await element(by.id('add-goal-fab')).tap();
    await expect(element(by.id('create-goal-screen'))).toBeVisible();

    // Fill in goal details
    await element(by.id('goal-title-input')).typeText('Learn TypeScript');
    await element(by.id('goal-description-input')).typeText(
      'Master TypeScript for better code quality'
    );
    await element(by.id('create-goal-button')).tap();

    // THEN: Goal appears in dashboard
    await expect(element(by.id('dashboard-screen'))).toBeVisible();
    await expect(element(by.text('Learn TypeScript'))).toBeVisible();
  });

  it('should display goal details when tapped', async () => {
    // GIVEN: User has an existing goal
    const goal = await fixture.goalFactory.createGoal(testUser.id, {
      title: 'Read 12 books',
      description: 'One book per month',
    });

    // Refresh dashboard
    await device.reloadReactNative();
    await expect(element(by.id('dashboard-screen'))).toBeVisible();

    // WHEN: User taps on goal card
    await element(by.id(`goal-card-${goal.id}`)).tap();

    // THEN: Goal detail screen appears
    await expect(element(by.id('goal-detail-screen'))).toBeVisible();
    await expect(element(by.text('Read 12 books'))).toBeVisible();
    await expect(element(by.text('One book per month'))).toBeVisible();
  });
});
