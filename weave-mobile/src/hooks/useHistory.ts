/**
 * useHistory Hook (Epic 5: Progress Visualization - US-5.5)
 *
 * TanStack Query hook for fetching recent activity history
 *
 * Usage:
 * ```tsx
 * import { useHistory } from '@/hooks/useHistory';
 *
 * function HistorySection() {
 *   const { data, isLoading, isError, error, refetch } = useHistory(20);
 *
 *   if (isLoading) return <SkeletonLoader />;
 *   if (isError) return <ErrorState error={error} onRetry={refetch} />;
 *
 *   const historyItems = data?.data || [];
 *
 *   return (
 *     <FlatList
 *       data={historyItems}
 *       renderItem={({ item }) => <HistoryItem item={item} />}
 *       keyExtractor={(item) => item.id}
 *     />
 *   );
 * }
 * ```
 *
 * Features:
 * - Auto-fetches on mount
 * - 3-minute stale time (history updates frequently)
 * - Requires authentication (throws if no session)
 * - Returns standard TanStack Query response
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { fetchHistory, type HistoryResponse, type HistoryFilters } from '@/services/history';
import { getCurrentLocalDate } from '@/utils/dateUtils';

/**
 * Query key factory for history data
 */
export const historyQueryKeys = {
  all: ['history'] as const,
  byParams: (limit: number, filters?: HistoryFilters) =>
    [...historyQueryKeys.all, limit, filters] as const,
};

/**
 * Hook to fetch recent activity history
 *
 * @param limit - Number of items to return (default: 20, max: 100)
 * @param filters - Optional filters for timeframe and type
 * @returns TanStack Query result with history items
 *
 * - data: HistoryResponse with {data: HistoryItem[], meta: {...}}
 * - isLoading: true during initial fetch
 * - isError: true if fetch failed
 * - error: Error object if fetch failed
 * - refetch: Function to manually refetch history
 * - isFetching: true during any fetch (including refetch)
 */
export function useHistory(limit: number = 20, filters?: HistoryFilters) {
  const { session } = useAuth();
  const localDate = getCurrentLocalDate();

  // Merge localDate into filters for timezone accuracy
  const filtersWithDate: HistoryFilters = {
    ...filters,
    localDate,
  };

  return useQuery<HistoryResponse, Error>({
    queryKey: historyQueryKeys.byParams(limit, filtersWithDate),
    queryFn: async () => {
      if (!session?.access_token) {
        throw new Error('No active session - user must be authenticated');
      }

      return fetchHistory(session.access_token, limit, filtersWithDate);
    },
    enabled: !!session?.access_token, // Only run if authenticated
    staleTime: 3 * 60 * 1000, // 3 minutes (history updates frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    retry: false, // Don't retry in dev (configured in QueryClient for prod)
  });
}
