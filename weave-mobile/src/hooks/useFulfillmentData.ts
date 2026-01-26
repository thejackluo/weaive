/**
 * useFulfillmentData Hook (Epic 5: Progress Visualization - US-5.3)
 *
 * TanStack Query hook for fetching fulfillment trend chart data
 *
 * Usage:
 * ```tsx
 * import { useFulfillmentData } from '@/hooks/useFulfillmentData';
 *
 * function FulfillmentChart() {
 *   const { data, isLoading, isError, error, refetch } = useFulfillmentData('7d');
 *
 *   if (isLoading) return <SkeletonLoader />;
 *   if (isError) return <ErrorState error={error} onRetry={refetch} />;
 *
 *   const fulfillmentData = data?.data || [];
 *   const { average_fulfillment } = data?.meta || { average_fulfillment: 0 };
 *
 *   return <LineChart data={fulfillmentData} average={average_fulfillment} />;
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
import { fetchFulfillmentData, type FulfillmentResponse } from '@/services/fulfillment';
import { getCurrentLocalDate } from '@/utils/dateUtils';

/**
 * Query key factory for fulfillment data
 */
export const fulfillmentQueryKeys = {
  all: ['fulfillment'] as const,
  byTimeframe: (timeframe: string, localDate?: string) => [...fulfillmentQueryKeys.all, timeframe, localDate] as const,
};

/**
 * Hook to fetch fulfillment trend chart data
 *
 * @param timeframe - Time range: 7d, 2w, 1m, 90d (default: 7d)
 * @returns TanStack Query result with fulfillment data
 *
 * - data: FulfillmentResponse with {data: FulfillmentDataPoint[], meta: {...}}
 * - isLoading: true during initial fetch
 * - isError: true if fetch failed
 * - error: Error object if fetch failed
 * - refetch: Function to manually refetch fulfillment data
 * - isFetching: true during any fetch (including refetch)
 */
export function useFulfillmentData(timeframe: '7d' | '2w' | '1m' | '90d' = '7d') {
  const { session } = useAuth();
  const localDate = getCurrentLocalDate();

  return useQuery<FulfillmentResponse, Error>({
    queryKey: fulfillmentQueryKeys.byTimeframe(timeframe, localDate),
    queryFn: async () => {
      if (!session?.access_token) {
        throw new Error('No active session - user must be authenticated');
      }

      return fetchFulfillmentData(session.access_token, timeframe, localDate);
    },
    enabled: !!session?.access_token, // Only run if authenticated
    staleTime: 2 * 60 * 1000, // 2 minutes (stats data updates frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    retry: false, // Don't retry in dev (configured in QueryClient for prod)
  });
}
