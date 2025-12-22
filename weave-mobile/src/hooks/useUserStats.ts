/**
 * useUserStats Hook (Epic 5: Progress Visualization - US-5.1, US-5.4)
 *
 * TanStack Query hook for fetching user statistics (level, streak, character state)
 *
 * Usage:
 * ```tsx
 * import { useUserStats } from '@/hooks/useUserStats';
 *
 * function DashboardHeader() {
 *   const { data, isLoading, isError, error, refetch } = useUserStats();
 *
 *   if (isLoading) return <SkeletonLoader />;
 *   if (isError) return <ErrorState error={error} onRetry={refetch} />;
 *
 *   const { level, current_streak, weave_character_state } = data?.data || {};
 *
 *   return (
 *     <>
 *       <Text>Level {level}</Text>
 *       <Text>{current_streak} 🔥</Text>
 *       <WeaveCharacter characterState={weave_character_state} />
 *     </>
 *   );
 * }
 * ```
 *
 * Features:
 * - Auto-fetches on mount
 * - 5-minute stale time (user stats change slowly)
 * - Requires authentication (throws if no session)
 * - Returns standard TanStack Query response
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { fetchUserStats, type UserStatsResponse } from '@/services/userStats';

/**
 * Query key factory for user stats
 */
export const userStatsQueryKeys = {
  all: ['userStats'] as const,
  stats: () => [...userStatsQueryKeys.all, 'stats'] as const,
};

/**
 * Hook to fetch user statistics
 *
 * @returns TanStack Query result with user stats data
 *
 * - data: UserStatsResponse with {data: {level, current_streak, weave_character_state, ...}, meta: {...}}
 * - isLoading: true during initial fetch
 * - isError: true if fetch failed
 * - error: Error object if fetch failed
 * - refetch: Function to manually refetch user stats
 * - isFetching: true during any fetch (including refetch)
 */
export function useUserStats() {
  const { session } = useAuth();

  return useQuery<UserStatsResponse, Error>({
    queryKey: userStatsQueryKeys.stats(),
    queryFn: async () => {
      if (!session?.access_token) {
        throw new Error('No active session - user must be authenticated');
      }

      return fetchUserStats(session.access_token);
    },
    enabled: !!session?.access_token, // Only run if authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes (user stats change slowly)
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    retry: false, // Don't retry in dev (configured in QueryClient for prod)
  });
}
