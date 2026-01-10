/**
 * useTodayBinds Hook (Chunk 1: View Today's Binds - US-3.1)
 *
 * TanStack Query hook for fetching today's binds with needle context
 * Follows pattern from src/hooks/useActiveGoals.ts
 *
 * Usage:
 * ```tsx
 * import { useTodayBinds } from '@/hooks/useTodayBinds';
 *
 * function ThreadHomeScreen() {
 *   const { data, isLoading, isError, error, refetch } = useTodayBinds();
 *
 *   if (isLoading) return <SkeletonLoader />;
 *   if (isError) return <ErrorState error={error} onRetry={refetch} />;
 *
 *   const binds = data?.data || [];
 *   const { local_date, total_binds, completed_count } = data?.meta || {};
 *
 *   return (
 *     <FlatList
 *       data={binds}
 *       renderItem={({ item }) => <BindItem bind={item} />}
 *     />
 *   );
 * }
 * ```
 *
 * Features:
 * - Auto-fetches on mount
 * - 1-minute stale time (binds update frequently)
 * - Requires authentication (throws if no session)
 * - Returns standard TanStack Query response
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { fetchTodayBinds } from '@/services/binds';
import type { BindsResponse } from '@/types/binds';
import { useCurrentDate } from './useCurrentDate';

/**
 * Query key factory for binds
 */
export const bindsQueryKeys = {
  all: ['binds'] as const,
  today: (localDate: string) => [...bindsQueryKeys.all, 'today', localDate] as const,
  byId: (id: string) => [...bindsQueryKeys.all, id] as const,
};

/**
 * Hook to fetch today's binds with needle context and completion status
 *
 * @returns TanStack Query result with binds data
 *
 * - data: BindsResponse with {data: Bind[], meta: {local_date, total_binds, completed_count}}
 * - isLoading: true during initial fetch
 * - isError: true if fetch failed
 * - error: Error object if fetch failed
 * - refetch: Function to manually refetch binds
 * - isFetching: true during any fetch (including refetch)
 */
export function useTodayBinds() {
  const { session } = useAuth();

  // Get today's date for query key (ensures fresh fetch on date change)
  // Uses reactive hook that updates at midnight
  const today = useCurrentDate(); // YYYY-MM-DD

  return useQuery<BindsResponse, Error>({
    queryKey: bindsQueryKeys.today(today),
    queryFn: async () => {
      if (!session?.access_token) {
        throw new Error('No active session - user must be authenticated');
      }

      return fetchTodayBinds(session.access_token);
    },
    enabled: !!session?.access_token, // Only run if authenticated
    staleTime: 1 * 60 * 1000, // 1 minute (binds update frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes cache (formerly cacheTime)
    retry: false, // Don't retry in dev (configured in QueryClient for prod)
  });
}
