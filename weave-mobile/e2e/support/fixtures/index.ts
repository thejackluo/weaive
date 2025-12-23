import { device, element, by, expect as detoxExpect } from 'detox';
import { UserFactory } from './factories/user.factory';
import { GoalFactory } from './factories/goal.factory';

/**
 * Base Test Fixture
 * 
 * Provides factories with auto-cleanup for Detox E2E tests
 */
export class TestFixture {
  userFactory: UserFactory;
  goalFactory: GoalFactory;

  constructor() {
    this.userFactory = new UserFactory();
    this.goalFactory = new GoalFactory();
  }

  async cleanup() {
    await this.userFactory.cleanup();
    await this.goalFactory.cleanup();
  }
}

/**
 * Setup function for tests - use in beforeEach
 */
export async function setupTest(): Promise<TestFixture> {
  await device.launchApp({ newInstance: true });
  return new TestFixture();
}

/**
 * Teardown function for tests - use in afterEach
 */
export async function teardownTest(fixture: TestFixture) {
  await fixture.cleanup();
}

export { device, element, by, detoxExpect as expect };
