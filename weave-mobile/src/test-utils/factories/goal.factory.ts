/**
 * Goal Factory - Data factory for testing
 *
 * Generates random goal data using faker for deterministic tests.
 * Follows data-factories.md patterns from TEA knowledge base.
 *
 * Generated: 2025-12-20
 */

// TODO: Install @faker-js/faker
// npm install --save-dev @faker-js/faker

// import { faker } from '@faker-js/faker';

/**
 * Creates a single goal with optional overrides
 *
 * @param overrides - Partial goal object to override default values
 * @returns Complete goal object with all required fields
 *
 * @example
 * const goal = createGoal({ title: 'Custom Goal' });
 * const newGoal = createGoal({ consistency_7d: null }); // New goal without data
 */
export const createGoal = (overrides: Partial<Goal> = {}): Goal => {
  // TODO: Replace with faker after installation
  const defaultGoal: Goal = {
    id: `goal-${Math.random().toString(36).substring(7)}`,
    title: 'Sample Goal',
    description: 'Sample goal description',
    status: 'active',
    consistency_7d: Math.floor(Math.random() * 100),
    active_binds_count: Math.floor(Math.random() * 5) + 1,
    updated_at: new Date().toISOString(),
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  return { ...defaultGoal, ...overrides };
};

/**
 * Creates multiple goals with optional count
 *
 * @param count - Number of goals to create (default: 3)
 * @returns Array of goal objects
 *
 * @example
 * const threeGoals = createGoals(3);
 * const manyGoals = createGoals(10);
 */
export const createGoals = (count: number = 3): Goal[] => {
  return Array.from({ length: count }, (_, index) =>
    createGoal({
      title: `Goal ${index + 1}`,
      // Stagger updated_at so they have different timestamps
      updated_at: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
    })
  );
};

/**
 * Creates a new goal (without 7-day consistency data)
 *
 * @param overrides - Partial goal object
 * @returns Goal with null consistency (represents new goal)
 */
export const createNewGoal = (overrides: Partial<Goal> = {}): Goal => {
  return createGoal({
    consistency_7d: null,
    active_binds_count: 0,
    created_at: new Date().toISOString(),
    ...overrides,
  });
};

/**
 * Creates goals at the 3-goal limit
 *
 * @returns Array of exactly 3 active goals
 */
export const createGoalsAtLimit = (): Goal[] => {
  return createGoals(3);
};

/**
 * Creates goals below the 3-goal limit
 *
 * @returns Array of 1-2 active goals
 */
export const createGoalsBelowLimit = (): Goal[] => {
  return createGoals(Math.floor(Math.random() * 2) + 1); // 1 or 2 goals
};

// Type definitions
export interface Goal {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'archived' | 'completed';
  consistency_7d: number | null; // null for new goals
  active_binds_count: number;
  updated_at: string; // ISO 8601
  created_at: string; // ISO 8601
}

/**
 * TODO: After installing faker, replace implementations:
 *
 * import { faker } from '@faker-js/faker';
 *
 * export const createGoal = (overrides: Partial<Goal> = {}): Goal => {
 *   const defaultGoal: Goal = {
 *     id: faker.string.uuid(),
 *     title: faker.lorem.words(3),
 *     description: faker.lorem.sentence(),
 *     status: 'active',
 *     consistency_7d: faker.number.int({ min: 0, max: 100 }),
 *     active_binds_count: faker.number.int({ min: 1, max: 5 }),
 *     updated_at: faker.date.recent().toISOString(),
 *     created_at: faker.date.past().toISOString(),
 *   };
 *
 *   return { ...defaultGoal, ...overrides };
 * };
 */
