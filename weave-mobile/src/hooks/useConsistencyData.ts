/**
 * useConsistencyData Hook (Epic 5: Progress Visualization - US-5.2)
 *
 * TanStack Query hook for fetching consistency heat map data
 *
 * Usage:
 * ```tsx
 * import { useConsistencyData } from '@/hooks/useConsistencyData';
 *
 * function ConsistencyHeatmap() {
 *   const { data, isLoading, isError, error, refetch } = useConsistencyData('7d', 'overall');
 *
 *   if (isLoading) return <SkeletonLoader />;
 *   if (isError) return <ErrorState error={error} onRetry={refetch} />;
 *
 *   const consistencyData = data?.data || [];
 *   const { consistency_percentage } = data?.meta || { consistency_percentage: 0 };
 *
 *   return <HeatMapChart data={consistencyData} percentage={consistency_percentage} />;
 * }
 * ```
 *
 * Features:
 * - Auto-fetches on mount
 * - 2-minute stale time (stats data refreshes frequently)
 * - Requires authentication (throws if no session)
 * - Returns standard TanStack Query response
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { fetchConsistencyData, type ConsistencyResponse } from '@/services/consistency';

/**
 * Query key factory for consistency data
 */
export const consistencyQueryKeys = {
  all: ['consistency'] as const,
  byTimeframe: (timeframe: string, filterType: string, filterId?: string, startDate?: string) =>
    [...consistencyQueryKeys.all, timeframe, filterType, filterId, startDate] as const,
};

/**
 * Hook to fetch consistency heat map data
 *
 * @param timeframe - Time range: 7d, 2w, 1m, 90d (default: 7d)
 * @param filterType - Filter type: overall, needle, bind, thread (default: overall)
 * @param filterId - Optional goal/bind ID if filtering by needle or bind
 * @param startDate - Optional start date (YYYY-MM-DD) for dynamic navigation
 * @returns TanStack Query result with consistency data
 *
 * - data: ConsistencyResponse with {data: ConsistencyDataPoint[], meta: {...}}
 * - isLoading: true during initial fetch
 * - isError: true if fetch failed
 * - error: Error object if fetch failed
 * - refetch: Function to manually refetch consistency data
 * - isFetching: true during any fetch (including refetch)
 */
export function useConsistencyData(
  timeframe: '7d' | '2w' | '1m' | '90d' = '7d',
  filterType: 'overall' | 'needle' | 'bind' | 'thread' = 'overall',
  filterId?: string,
  startDate?: string
) {
  const { session } = useAuth();

  return useQuery<ConsistencyResponse, Error>({
    queryKey: consistencyQueryKeys.byTimeframe(timeframe, filterType, filterId, startDate),
    queryFn: async () => {
      if (!session?.access_token) {
        throw new Error('No active session - user must be authenticated');
      }

      return fetchConsistencyData(session.access_token, timeframe, filterType, filterId, startDate);
    },
    enabled: !!session?.access_token, // Only run if authenticated
    staleTime: 2 * 60 * 1000, // 2 minutes (stats data updates frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    retry: false, // Don't retry in dev (configured in QueryClient for prod)
  });
}
