/**
 * ATDD Tests for Story 2.1: Needles List View
 *
 * Status: RED Phase (All tests should fail initially)
 * Epic: 2 - Goal Management
 *
 * These tests define the expected behavior of the Needles List screen.
 * Tests are written in Given-When-Then format for clarity.
 *
 * Generated: 2025-12-20
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NeedlesListScreen } from '../NeedlesListScreen';

// Create a new QueryClient for each test to ensure isolation
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries in tests
        gcTime: 0, // Disable caching in tests (formerly cacheTime)
      },
    },
  });

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockNavigate,
    navigate: mockNavigate,
  }),
}));

// Mock the useActiveGoals hook (will be implemented)
jest.mock('../../hooks/useActiveGoals', () => ({
  useActiveGoals: jest.fn(),
}));

import { useActiveGoals } from '../../hooks/useActiveGoals';
const mockUseActiveGoals = useActiveGoals as jest.MockedFunction<typeof useActiveGoals>;

describe('NeedlesListScreen - Story 2.1', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    mockNavigate.mockClear();
    jest.clearAllMocks();
  });

  /**
   * AC1: Display Active Goals
   */
  describe('AC1: Display Active Goals', () => {
    test('should display up to 3 active goals with their data', async () => {
      // GIVEN: User has 2 active goals with consistency data
      const mockGoals = [
        {
          id: 'goal-1',
          title: 'Run a marathon',
          description: 'Train for and complete a marathon',
          status: 'active',
          consistency_7d: 85.5,
          active_binds_count: 3,
          updated_at: '2025-01-15T10:30:00Z',
        },
        {
          id: 'goal-2',
          title: 'Learn Spanish',
          description: 'Become conversational in Spanish',
          status: 'active',
          consistency_7d: 72.0,
          active_binds_count: 2,
          updated_at: '2025-01-14T08:00:00Z',
        },
      ];

      mockUseActiveGoals.mockReturnValue({
        data: { data: mockGoals, meta: { total: 2, active_goal_limit: 3 } },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      // WHEN: Screen renders
      const { getByTestId, getByText } = render(
        <QueryClientProvider client={queryClient}>
          <NeedlesListScreen />
        </QueryClientProvider>
      );

      // THEN: Both goals are displayed with their data
      await waitFor(() => {
        expect(getByText('Run a marathon')).toBeTruthy();
        expect(getByText('Learn Spanish')).toBeTruthy();
        expect(getByText('85.5%')).toBeTruthy(); // Consistency
        expect(getByText('72.0%')).toBeTruthy(); // Consistency
        expect(getByText('3 binds')).toBeTruthy();
        expect(getByText('2 binds')).toBeTruthy();
      });
    });

    test('should display goals sorted by most recently updated first', async () => {
      // GIVEN: User has goals with different update times
      const mockGoals = [
        {
          id: 'goal-new',
          title: 'New Goal',
          status: 'active',
          consistency_7d: 50,
          active_binds_count: 1,
          updated_at: '2025-01-15T10:00:00Z', // Most recent
        },
        {
          id: 'goal-old',
          title: 'Old Goal',
          status: 'active',
          consistency_7d: 80,
          active_binds_count: 2,
          updated_at: '2025-01-10T10:00:00Z', // Older
        },
      ];

      mockUseActiveGoals.mockReturnValue({
        data: { data: mockGoals, meta: { total: 2, active_goal_limit: 3 } },
        isLoading: false,
        isError: false,
      } as any);

      // WHEN: Screen renders
      const { getAllByTestId } = render(
        <QueryClientProvider client={queryClient}>
          <NeedlesListScreen />
        </QueryClientProvider>
      );

      // THEN: Goals appear in order with most recent first
      await waitFor(() => {
        const goalCards = getAllByTestId(/^goal-card-/);
        expect(goalCards[0]).toHaveProperty('testID', 'goal-card-goal-new');
        expect(goalCards[1]).toHaveProperty('testID', 'goal-card-goal-old');
      });
    });

    test('should show skeleton loaders during initial load', () => {
      // GIVEN: Data is loading
      mockUseActiveGoals.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      } as any);

      // WHEN: Screen renders
      const { getByTestId } = render(
        <QueryClientProvider client={queryClient}>
          <NeedlesListScreen />
        </QueryClientProvider>
      );

      // THEN: Skeleton loader is visible
      expect(getByTestId('goals-skeleton-loader')).toBeTruthy();
    });
  });

  /**
   * AC2: Goal Card Interaction
   */
  describe('AC2: Goal Card Interaction', () => {
    test('should navigate to goal detail view when goal card is tapped', async () => {
      // GIVEN: User has an active goal
      const mockGoals = [
        {
          id: 'goal-1',
          title: 'Run a marathon',
          status: 'active',
          consistency_7d: 85.5,
          active_binds_count: 3,
          updated_at: '2025-01-15T10:30:00Z',
        },
      ];

      mockUseActiveGoals.mockReturnValue({
        data: { data: mockGoals, meta: { total: 1, active_goal_limit: 3 } },
        isLoading: false,
        isError: false,
      } as any);

      // WHEN: User taps on the goal card
      const { getByTestId } = render(
        <QueryClientProvider client={queryClient}>
          <NeedlesListScreen />
        </QueryClientProvider>
      );

      await waitFor(() => {
        const goalCard = getByTestId('goal-card-goal-1');
        fireEvent.press(goalCard);
      });

      // THEN: Navigation to detail view is triggered with goal_id
      expect(mockNavigate).toHaveBeenCalledWith('/needles/goal-1');
    });

    test('should show tap animation when goal card is pressed', async () => {
      // GIVEN: User has an active goal
      const mockGoals = [
        {
          id: 'goal-1',
          title: 'Run a marathon',
          status: 'active',
          consistency_7d: 85.5,
          active_binds_count: 3,
          updated_at: '2025-01-15T10:30:00Z',
        },
      ];

      mockUseActiveGoals.mockReturnValue({
        data: { data: mockGoals, meta: { total: 1, active_goal_limit: 3 } },
        isLoading: false,
        isError: false,
      } as any);

      // WHEN: User presses on the goal card
      const { getByTestId } = render(
        <QueryClientProvider client={queryClient}>
          <NeedlesListScreen />
        </QueryClientProvider>
      );

      await waitFor(() => {
        const goalCard = getByTestId('goal-card-goal-1');
        fireEvent(goalCard, 'pressIn');
      });

      // THEN: Card shows pressed state (visual feedback)
      const goalCard = getByTestId('goal-card-goal-1');
      expect(goalCard.props.accessibilityState).toEqual({ pressed: true });
    });
  });

  /**
   * AC3: Add Goal Button
   */
  describe('AC3: Add Goal Button', () => {
    test('should enable Add Goal button when user has less than 3 active goals', async () => {
      // GIVEN: User has 2 active goals (less than limit)
      const mockGoals = [
        { id: 'goal-1', title: 'Goal 1', status: 'active', consistency_7d: 80, active_binds_count: 2, updated_at: '2025-01-15T10:00:00Z' },
        { id: 'goal-2', title: 'Goal 2', status: 'active', consistency_7d: 70, active_binds_count: 1, updated_at: '2025-01-14T10:00:00Z' },
      ];

      mockUseActiveGoals.mockReturnValue({
        data: { data: mockGoals, meta: { total: 2, active_goal_limit: 3 } },
        isLoading: false,
        isError: false,
      } as any);

      // WHEN: Screen renders
      const { getByTestId } = render(
        <QueryClientProvider client={queryClient}>
          <NeedlesListScreen />
        </QueryClientProvider>
      );

      // THEN: Add Goal button is enabled
      await waitFor(() => {
        const addButton = getByTestId('add-goal-button');
        expect(addButton.props.accessibilityState).not.toEqual({ disabled: true });
      });
    });

    test('should disable Add Goal button when user has 3 active goals', async () => {
      // GIVEN: User has 3 active goals (at limit)
      const mockGoals = [
        { id: 'goal-1', title: 'Goal 1', status: 'active', consistency_7d: 80, active_binds_count: 2, updated_at: '2025-01-15T10:00:00Z' },
        { id: 'goal-2', title: 'Goal 2', status: 'active', consistency_7d: 70, active_binds_count: 1, updated_at: '2025-01-14T10:00:00Z' },
        { id: 'goal-3', title: 'Goal 3', status: 'active', consistency_7d: 90, active_binds_count: 3, updated_at: '2025-01-13T10:00:00Z' },
      ];

      mockUseActiveGoals.mockReturnValue({
        data: { data: mockGoals, meta: { total: 3, active_goal_limit: 3 } },
        isLoading: false,
        isError: false,
      } as any);

      // WHEN: Screen renders
      const { getByTestId } = render(
        <QueryClientProvider client={queryClient}>
          <NeedlesListScreen />
        </QueryClientProvider>
      );

      // THEN: Add Goal button is disabled
      await waitFor(() => {
        const addButton = getByTestId('add-goal-button');
        expect(addButton.props.accessibilityState).toEqual({ disabled: true });
      });
    });

    test('should show tooltip when disabled Add Goal button is tapped', async () => {
      // GIVEN: User has 3 active goals (button disabled)
      const mockGoals = [
        { id: 'goal-1', title: 'Goal 1', status: 'active', consistency_7d: 80, active_binds_count: 2, updated_at: '2025-01-15T10:00:00Z' },
        { id: 'goal-2', title: 'Goal 2', status: 'active', consistency_7d: 70, active_binds_count: 1, updated_at: '2025-01-14T10:00:00Z' },
        { id: 'goal-3', title: 'Goal 3', status: 'active', consistency_7d: 90, active_binds_count: 3, updated_at: '2025-01-13T10:00:00Z' },
      ];

      mockUseActiveGoals.mockReturnValue({
        data: { data: mockGoals, meta: { total: 3, active_goal_limit: 3 } },
        isLoading: false,
        isError: false,
      } as any);

      // WHEN: User taps disabled button
      const { getByTestId, getByText } = render(
        <QueryClientProvider client={queryClient}>
          <NeedlesListScreen />
        </QueryClientProvider>
      );

      await waitFor(() => {
        const addButton = getByTestId('add-goal-button');
        fireEvent.press(addButton);
      });

      // THEN: Tooltip message is displayed
      await waitFor(() => {
        expect(
          getByText("You've reached the 3-goal limit. Archive a goal to add a new one.")
        ).toBeTruthy();
      });
    });

    test('should navigate to Create Goal flow when enabled button is tapped', async () => {
      // GIVEN: User has 1 active goal (button enabled)
      const mockGoals = [
        { id: 'goal-1', title: 'Goal 1', status: 'active', consistency_7d: 80, active_binds_count: 2, updated_at: '2025-01-15T10:00:00Z' },
      ];

      mockUseActiveGoals.mockReturnValue({
        data: { data: mockGoals, meta: { total: 1, active_goal_limit: 3 } },
        isLoading: false,
        isError: false,
      } as any);

      // WHEN: User taps Add Goal button
      const { getByTestId } = render(
        <QueryClientProvider client={queryClient}>
          <NeedlesListScreen />
        </QueryClientProvider>
      );

      await waitFor(() => {
        const addButton = getByTestId('add-goal-button');
        fireEvent.press(addButton);
      });

      // THEN: Navigation to Create Goal flow is triggered
      expect(mockNavigate).toHaveBeenCalledWith('/needles/create');
    });
  });

  /**
   * AC4: Consistency Data Accuracy
   */
  describe('AC4: Consistency Data Accuracy', () => {
    test('should display consistency percentage for established goals', async () => {
      // GIVEN: Goal has 7+ days of data
      const mockGoals = [
        {
          id: 'goal-1',
          title: 'Run a marathon',
          status: 'active',
          consistency_7d: 85.5,
          active_binds_count: 3,
          updated_at: '2025-01-15T10:30:00Z',
        },
      ];

      mockUseActiveGoals.mockReturnValue({
        data: { data: mockGoals, meta: { total: 1, active_goal_limit: 3 } },
        isLoading: false,
        isError: false,
      } as any);

      // WHEN: Screen renders
      const { getByText } = render(
        <QueryClientProvider client={queryClient}>
          <NeedlesListScreen />
        </QueryClientProvider>
      );

      // THEN: Consistency percentage is displayed
      await waitFor(() => {
        expect(getByText('85.5%')).toBeTruthy();
      });
    });

    test('should display "New" for goals with less than 7 days of data', async () => {
      // GIVEN: Goal is new (no consistency data)
      const mockGoals = [
        {
          id: 'goal-1',
          title: 'New Goal',
          status: 'active',
          consistency_7d: null,
          active_binds_count: 0,
          updated_at: '2025-01-15T10:30:00Z',
        },
      ];

      mockUseActiveGoals.mockReturnValue({
        data: { data: mockGoals, meta: { total: 1, active_goal_limit: 3 } },
        isLoading: false,
        isError: false,
      } as any);

      // WHEN: Screen renders
      const { getByText } = render(
        <QueryClientProvider client={queryClient}>
          <NeedlesListScreen />
        </QueryClientProvider>
      );

      // THEN: "New" label is displayed instead of percentage
      await waitFor(() => {
        expect(getByText('New')).toBeTruthy();
      });
    });
  });

  /**
   * AC5: Performance Requirements
   */
  describe('AC5: Performance Requirements', () => {
    test('should load and render goals in less than 1 second', async () => {
      // GIVEN: User has active goals
      const mockGoals = [
        { id: 'goal-1', title: 'Goal 1', status: 'active', consistency_7d: 80, active_binds_count: 2, updated_at: '2025-01-15T10:00:00Z' },
      ];

      mockUseActiveGoals.mockReturnValue({
        data: { data: mockGoals, meta: { total: 1, active_goal_limit: 3 } },
        isLoading: false,
        isError: false,
      } as any);

      // WHEN: Screen renders
      const startTime = Date.now();
      const { getByText } = render(
        <QueryClientProvider client={queryClient}>
          <NeedlesListScreen />
        </QueryClientProvider>
      );

      // THEN: Content appears within 1 second
      await waitFor(
        () => {
          expect(getByText('Goal 1')).toBeTruthy();
          const renderTime = Date.now() - startTime;
          expect(renderTime).toBeLessThan(1000);
        },
        { timeout: 1000 }
      );
    });
  });

  /**
   * AC6: Empty State
   */
  describe('AC6: Empty State', () => {
    test('should show empty state when user has no active goals', async () => {
      // GIVEN: User has no active goals
      mockUseActiveGoals.mockReturnValue({
        data: { data: [], meta: { total: 0, active_goal_limit: 3 } },
        isLoading: false,
        isError: false,
      } as any);

      // WHEN: Screen renders
      const { getByTestId, getByText } = render(
        <QueryClientProvider client={queryClient}>
          <NeedlesListScreen />
        </QueryClientProvider>
      );

      // THEN: Empty state is displayed
      await waitFor(() => {
        expect(getByTestId('empty-state')).toBeTruthy();
        expect(getByText("You haven't set any goals yet. What do you want to achieve?")).toBeTruthy();
      });
    });

    test('should show "Create Your First Goal" button in empty state', async () => {
      // GIVEN: User has no active goals
      mockUseActiveGoals.mockReturnValue({
        data: { data: [], meta: { total: 0, active_goal_limit: 3 } },
        isLoading: false,
        isError: false,
      } as any);

      // WHEN: Screen renders
      const { getByTestId } = render(
        <QueryClientProvider client={queryClient}>
          <NeedlesListScreen />
        </QueryClientProvider>
      );

      // THEN: Create First Goal button is visible
      await waitFor(() => {
        expect(getByTestId('create-first-goal-button')).toBeTruthy();
      });
    });
  });

  /**
   * AC7: Error Handling
   */
  describe('AC7: Error Handling', () => {
    test('should display error message when API call fails', async () => {
      // GIVEN: API call fails
      mockUseActiveGoals.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Network error'),
      } as any);

      // WHEN: Screen renders
      const { getByTestId, getByText } = render(
        <QueryClientProvider client={queryClient}>
          <NeedlesListScreen />
        </QueryClientProvider>
      );

      // THEN: Error message is displayed
      await waitFor(() => {
        expect(getByTestId('error-state')).toBeTruthy();
        expect(getByText("Couldn't load your goals. Check your connection and try again.")).toBeTruthy();
      });
    });

    test('should show retry button when error occurs', async () => {
      // GIVEN: API call fails
      mockUseActiveGoals.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Network error'),
        refetch: jest.fn(),
      } as any);

      // WHEN: Screen renders
      const { getByTestId } = render(
        <QueryClientProvider client={queryClient}>
          <NeedlesListScreen />
        </QueryClientProvider>
      );

      // THEN: Retry button is visible
      await waitFor(() => {
        expect(getByTestId('retry-button')).toBeTruthy();
      });
    });

    test('should trigger refetch when retry button is tapped', async () => {
      // GIVEN: API call failed and retry button is visible
      const mockRefetch = jest.fn();
      mockUseActiveGoals.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Network error'),
        refetch: mockRefetch,
      } as any);

      // WHEN: User taps retry button
      const { getByTestId } = render(
        <QueryClientProvider client={queryClient}>
          <NeedlesListScreen />
        </QueryClientProvider>
      );

      await waitFor(() => {
        const retryButton = getByTestId('retry-button');
        fireEvent.press(retryButton);
      });

      // THEN: Refetch is triggered
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  /**
   * AC8: Accessibility
   */
  describe('AC8: Accessibility', () => {
    test('should have accessible labels for all goal cards', async () => {
      // GIVEN: User has active goals
      const mockGoals = [
        {
          id: 'goal-1',
          title: 'Run a marathon',
          status: 'active',
          consistency_7d: 85.5,
          active_binds_count: 3,
          updated_at: '2025-01-15T10:30:00Z',
        },
      ];

      mockUseActiveGoals.mockReturnValue({
        data: { data: mockGoals, meta: { total: 1, active_goal_limit: 3 } },
        isLoading: false,
        isError: false,
      } as any);

      // WHEN: Screen renders
      const { getByTestId } = render(
        <QueryClientProvider client={queryClient}>
          <NeedlesListScreen />
        </QueryClientProvider>
      );

      // THEN: Goal card has meaningful accessibility label
      await waitFor(() => {
        const goalCard = getByTestId('goal-card-goal-1');
        expect(goalCard.props.accessibilityLabel).toContain('Run a marathon');
        expect(goalCard.props.accessibilityLabel).toContain('85.5 percent consistency');
      });
    });

    test('should have accessible label for Add Goal button', async () => {
      // GIVEN: User has 1 active goal
      const mockGoals = [
        { id: 'goal-1', title: 'Goal 1', status: 'active', consistency_7d: 80, active_binds_count: 2, updated_at: '2025-01-15T10:00:00Z' },
      ];

      mockUseActiveGoals.mockReturnValue({
        data: { data: mockGoals, meta: { total: 1, active_goal_limit: 3 } },
        isLoading: false,
        isError: false,
      } as any);

      // WHEN: Screen renders
      const { getByTestId } = render(
        <QueryClientProvider client={queryClient}>
          <NeedlesListScreen />
        </QueryClientProvider>
      );

      // THEN: Button has clear accessibility label
      await waitFor(() => {
        const addButton = getByTestId('add-goal-button');
        expect(addButton.props.accessibilityLabel).toBe('Add new goal');
      });
    });

    test('should announce disabled state for Add Goal button when at limit', async () => {
      // GIVEN: User has 3 active goals
      const mockGoals = [
        { id: 'goal-1', title: 'Goal 1', status: 'active', consistency_7d: 80, active_binds_count: 2, updated_at: '2025-01-15T10:00:00Z' },
        { id: 'goal-2', title: 'Goal 2', status: 'active', consistency_7d: 70, active_binds_count: 1, updated_at: '2025-01-14T10:00:00Z' },
        { id: 'goal-3', title: 'Goal 3', status: 'active', consistency_7d: 90, active_binds_count: 3, updated_at: '2025-01-13T10:00:00Z' },
      ];

      mockUseActiveGoals.mockReturnValue({
        data: { data: mockGoals, meta: { total: 3, active_goal_limit: 3 } },
        isLoading: false,
        isError: false,
      } as any);

      // WHEN: Screen renders
      const { getByTestId } = render(
        <QueryClientProvider client={queryClient}>
          <NeedlesListScreen />
        </QueryClientProvider>
      );

      // THEN: Button announces disabled state
      await waitFor(() => {
        const addButton = getByTestId('add-goal-button');
        expect(addButton.props.accessibilityState).toEqual({ disabled: true });
        expect(addButton.props.accessibilityHint).toContain('3-goal limit reached');
      });
    });
  });
});
