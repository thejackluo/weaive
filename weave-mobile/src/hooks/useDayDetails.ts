/**
 * useDayDetails Hook
 *
 * TanStack Query hook for fetching detailed activity for a specific day
 * Used by DayDetailsModal
 *
 * Usage:
 * ```tsx
 * import { useDayDetails } from '@/hooks/useDayDetails';
 *
 * function DayDetailsModal({ date, visible }) {
 *   const { data, isLoading, isError, error } = useDayDetails(date, visible);
 *
 *   if (isLoading) return <Loading />;
 *   if (isError) return <Error message={error.message} />;
 *
 *   const { binds, journal, total_completions } = data?.data || {};
 *   return <DayDetails binds={binds} journal={journal} />;
 * }
 * ```
 *
 * Features:
 * - Auto-fetches when modal opens (enabled by visible prop)
 * - 5-minute stale time (historical data rarely changes)
 * - Requires authentication (throws if no session)
 * - Returns standard TanStack Query response
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { fetchDayDetails, type DayDetailsResponse } from '@/services/dayDetails';

/**
 * Query key factory for day details
 */
export const dayDetailsQueryKeys = {
  all: ['dayDetails'] as const,
  byDate: (date: string) => [...dayDetailsQueryKeys.all, date] as const,
};

/**
 * Hook to fetch detailed activity for a specific day
 *
 * @param date - Date in YYYY-MM-DD format
 * @param enabled - Whether to run the query (typically tied to modal visibility)
 * @returns TanStack Query result with day details
 *
 * - data: DayDetailsResponse with {data: {date, binds, journal, total_completions}, meta: {...}}
 * - isLoading: true during initial fetch
 * - isError: true if fetch failed
 * - error: Error object if fetch failed
 * - refetch: Function to manually refetch day details
 * - isFetching: true during any fetch (including refetch)
 */
export function useDayDetails(date: string, enabled: boolean = true) {
  const { session } = useAuth();

  return useQuery<DayDetailsResponse, Error>({
    queryKey: dayDetailsQueryKeys.byDate(date),
    queryFn: async () => {
      if (!session?.access_token) {
        throw new Error('No active session - user must be authenticated');
      }

      return fetchDayDetails(session.access_token, date);
    },
    enabled: enabled && !!session?.access_token, // Only run if modal is open and authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes (historical data rarely changes)
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    retry: false, // Don't retry in dev (configured in QueryClient for prod)
  });
}
