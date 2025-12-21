/**
 * Needles List Fixtures
 *
 * Test fixtures for Needles List screen testing.
 * Provides reusable test setup with auto-cleanup.
 *
 * Follows fixture-architecture.md patterns from TEA knowledge base.
 *
 * Generated: 2025-12-20
 */

/**
 * Mock implementation of useActiveGoals hook
 *
 * This fixture provides a mocked version of the useActiveGoals hook
 * that can be configured for different test scenarios.
 *
 * @example
 * // In test file:
 * import { mockUseActiveGoals } from '@/test-utils/fixtures/needles.fixture';
 *
 * test('should display goals', () => {
 *   mockUseActiveGoals.mockReturnValue({
 *     data: { data: [createGoal()], meta: { total: 1, active_goal_limit: 3 } },
 *     isLoading: false,
 *     isError: false,
 *   });
 *   // ... render and assert
 * });
 */

import { createGoal, createGoals, Goal } from '../factories/goal.factory';

/**
 * Creates mock response for successful goals fetch
 */
export const createSuccessResponse = (goals: Goal[]) => ({
  data: goals,
  meta: {
    total: goals.length,
    active_goal_limit: 3,
  },
});

/**
 * Creates mock response for loading state
 */
export const createLoadingResponse = () => ({
  data: undefined,
  isLoading: true,
  isError: false,
  error: null,
});

/**
 * Creates mock response for error state
 */
export const createErrorResponse = (errorMessage: string = 'Network error') => ({
  data: undefined,
  isLoading: false,
  isError: true,
  error: new Error(errorMessage),
  refetch: jest.fn(),
});

/**
 * Creates mock response for empty state (no goals)
 */
export const createEmptyResponse = () => ({
  data: [],
  meta: {
    total: 0,
    active_goal_limit: 3,
  },
});

/**
 * Fixture: Goals at limit (3 active goals)
 */
export const goalsAtLimitFixture = () => {
  const goals = createGoals(3);
  return {
    data: createSuccessResponse(goals),
    isLoading: false,
    isError: false,
    error: null,
  };
};

/**
 * Fixture: Goals below limit (1-2 active goals)
 */
export const goalsBelowLimitFixture = () => {
  const goals = createGoals(1);
  return {
    data: createSuccessResponse(goals),
    isLoading: false,
    isError: false,
    error: null,
  };
};

/**
 * Fixture: Empty goals (no active goals)
 */
export const emptyGoalsFixture = () => ({
  data: createEmptyResponse(),
  isLoading: false,
  isError: false,
  error: null,
});

/**
 * Fixture: Loading state
 */
export const loadingGoalsFixture = () => createLoadingResponse();

/**
 * Fixture: Error state
 */
export const errorGoalsFixture = (errorMessage?: string) => createErrorResponse(errorMessage);

/**
 * Test helper: Setup mock navigation
 *
 * @example
 * const mockNavigate = setupMockNavigation();
 * // ... test navigation
 * expect(mockNavigate).toHaveBeenCalledWith('/needles/goal-1');
 */
export const setupMockNavigation = () => {
  const mockNavigate = jest.fn();
  jest.mock('expo-router', () => ({
    useRouter: () => ({
      push: mockNavigate,
      navigate: mockNavigate,
    }),
  }));
  return mockNavigate;
};

/**
 * Test helper: Create QueryClient for tests
 *
 * Creates isolated QueryClient with disabled caching for tests
 */
export const createTestQueryClient = () => {
  const { QueryClient } = require('@tanstack/react-query');
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });
};
