/**
 * useActiveGoals Hook (Story 2.1: Needles List View)
 *
 * TanStack Query hook for fetching active goals with stats
 *
 * Usage:
 * ```tsx
 * import { useActiveGoals } from '@/hooks/useActiveGoals';
 *
 * function NeedlesListScreen() {
 *   const { data, isLoading, isError, error, refetch } = useActiveGoals();
 *
 *   if (isLoading) return <SkeletonLoader />;
 *   if (isError) return <ErrorState error={error} onRetry={refetch} />;
 *
 *   const goals = data?.data || [];
 *   const { total, active_goal_limit } = data?.meta || { total: 0, active_goal_limit: 3 };
 *
 *   return (
 *     <FlatList
 *       data={goals}
 *       renderItem={({ item }) => <GoalCard goal={item} />}
 *     />
 *   );
 * }
 * ```
 *
 * Features:
 * - Auto-fetches on mount
 * - 5-minute stale time (per architecture)
 * - Requires authentication (throws if no session)
 * - Returns standard TanStack Query response
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import {
  fetchActiveGoals,
  fetchGoalById,
  createGoal,
  updateGoal,
  archiveGoal,
} from '@/services/goals';
import type {
  GoalsResponse,
  GoalDetailResponse,
  CreateGoalRequest,
  UpdateGoalRequest,
} from '@/types/goals';
import { consistencyQueryKeys } from './useConsistencyData';
import { bindsQueryKeys } from './useTodayBinds';

/**
 * Query key factory for goals
 */
export const goalsQueryKeys = {
  all: ['goals'] as const,
  active: () => [...goalsQueryKeys.all, 'active'] as const,
  archived: () => [...goalsQueryKeys.all, 'archived'] as const,
  byId: (id: string) => [...goalsQueryKeys.all, id] as const,
};

/**
 * Hook to fetch active goals with stats
 *
 * @returns TanStack Query result with goals data
 *
 * - data: GoalsResponse with {data: Goal[], meta: {total, active_goal_limit}}
 * - isLoading: true during initial fetch
 * - isError: true if fetch failed
 * - error: Error object if fetch failed
 * - refetch: Function to manually refetch goals
 * - isFetching: true during any fetch (including refetch)
 */
export function useActiveGoals() {
  const { session } = useAuth();

  return useQuery<GoalsResponse, Error>({
    queryKey: goalsQueryKeys.active(),
    queryFn: async () => {
      if (!session?.access_token) {
        throw new Error('No active session - user must be authenticated');
      }

      return fetchActiveGoals(session.access_token);
    },
    enabled: !!session?.access_token, // Only run if authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes (per architecture)
    gcTime: 10 * 60 * 1000, // 10 minutes cache (formerly cacheTime)
    retry: false, // Don't retry in dev (configured in QueryClient for prod)
  });
}

/**
 * Hook to fetch single goal by ID with full details
 *
 * @param goalId - Goal ID to fetch
 * @returns TanStack Query result with goal detail data
 *
 * Includes: title, description, stats (consistency, completions, streak), qgoals, binds
 */
export function useGoalById(goalId: string) {
  const { session } = useAuth();

  return useQuery<GoalDetailResponse, Error>({
    queryKey: goalsQueryKeys.byId(goalId),
    queryFn: async () => {
      if (!session?.access_token) {
        throw new Error('No active session - user must be authenticated');
      }

      return fetchGoalById(goalId, session.access_token);
    },
    enabled: !!session?.access_token && !!goalId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    retry: false,
  });
}

/**
 * Hook to create a new goal (US-2.3: Create New Goal)
 *
 * @returns TanStack Query mutation for creating goals
 *
 * Usage:
 * ```tsx
 * const createMutation = useCreateGoal();
 *
 * createMutation.mutate({
 *   title: 'Get Ripped',
 *   description: 'to auafarm mfs',
 *   qgoals: [{title: 'Reach 180 lbs', target_value: 180, unit: 'lbs'}],
 *   binds: [{title: 'Workout', frequency_type: 'weekly', frequency_value: 5}]
 * }, {
 *   onSuccess: (data) => console.log('Created goal:', data),
 *   onError: (error) => console.error('Failed:', error)
 * });
 * ```
 */
export function useCreateGoal() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalData: CreateGoalRequest) => {
      if (!session?.access_token) {
        throw new Error('No active session - user must be authenticated');
      }

      return createGoal(goalData, session.access_token);
    },
    onSuccess: () => {
      // Invalidate active goals query to refetch the list
      queryClient.invalidateQueries({ queryKey: goalsQueryKeys.active() });
    },
  });
}

/**
 * Hook to update an existing goal (US-2.4: Edit Needle)
 *
 * @returns TanStack Query mutation for updating goals
 *
 * Usage:
 * ```tsx
 * const updateMutation = useUpdateGoal();
 *
 * updateMutation.mutate({
 *   goalId: 'goal-123',
 *   data: { title: 'Updated Title', description: 'New description' }
 * }, {
 *   onSuccess: (data) => console.log('Updated goal:', data),
 *   onError: (error) => console.error('Failed:', error)
 * });
 * ```
 */
export function useUpdateGoal() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ goalId, data }: { goalId: string; data: UpdateGoalRequest }) => {
      if (!session?.access_token) {
        throw new Error('No active session - user must be authenticated');
      }

      return updateGoal(goalId, data, session.access_token);
    },
    onSuccess: (data, variables) => {
      // Invalidate both the list and the specific goal query
      queryClient.invalidateQueries({ queryKey: goalsQueryKeys.active() });
      queryClient.invalidateQueries({ queryKey: goalsQueryKeys.byId(variables.goalId) });
    },
  });
}

/**
 * Hook to archive a goal (US-2.5: Archive Goal)
 *
 * @returns TanStack Query mutation for archiving goals
 *
 * Usage:
 * ```tsx
 * const archiveMutation = useArchiveGoal();
 *
 * archiveMutation.mutate('goal-123', {
 *   onSuccess: () => console.log('Goal archived'),
 *   onError: (error) => console.error('Failed:', error)
 * });
 * ```
 */
export function useArchiveGoal() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalId: string) => {
      if (!session?.access_token) {
        throw new Error('No active session - user must be authenticated');
      }

      return archiveGoal(goalId, session.access_token);
    },
    onSuccess: async (data, goalId) => {
      // Refetch goals list and invalidate the specific goal
      await queryClient.refetchQueries({ queryKey: goalsQueryKeys.active() });
      queryClient.invalidateQueries({ queryKey: goalsQueryKeys.byId(goalId) });

      // Invalidate Thread page (today's binds) - removes archived goal's binds
      queryClient.invalidateQueries({ queryKey: bindsQueryKeys.all });

      // Invalidate Consistency page - recalculates without archived goal's completions
      queryClient.invalidateQueries({ queryKey: consistencyQueryKeys.all });

      // Also invalidate binds grid (7d view)
      queryClient.invalidateQueries({ queryKey: ['bindsGrid'] });
    },
  });
}
