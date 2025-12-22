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

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { fetchActiveGoals, fetchGoalById } from '@/services/goals';
import type { GoalsResponse, GoalDetailResponse } from '@/types/goals';

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
