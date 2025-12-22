/**
 * useImageList - TanStack Query hook for fetching images with pagination
 * Story: 0.9 - AI-Powered Image Service
 * Architecture: Story 1.5.1 (useInfiniteQuery for pagination)
 */

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getUserCaptures } from '../services/imageCapture';
import { Capture, CaptureType } from '../types/captures';

interface ImageFilters {
  goalId?: string;
  subtaskInstanceId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ImagePage {
  data: (Capture & { signed_url: string })[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    has_next: boolean;
  };
}

/**
 * Hook: Fetch images with infinite scroll pagination
 *
 * Features:
 * - Infinite scroll: Automatic pagination with FlatList onEndReached
 * - Date range filtering: Filter by start/end dates
 * - Goal/subtask filtering: Filter by goal_id or subtask_instance_id
 * - Cache management: 5-minute stale time, auto-refetch on mount
 *
 * Usage:
 * ```tsx
 * const { data, fetchNextPage, hasNextPage, isLoading } = useImageList({
 *   goalId: 'goal-uuid',
 *   startDate: '2025-12-01',
 *   endDate: '2025-12-31',
 * });
 *
 * // In FlatList:
 * <FlatList
 *   data={data?.pages.flatMap(page => page.data)}
 *   onEndReached={hasNextPage ? fetchNextPage : undefined}
 * />
 * ```
 */
export function useImageList(filters: ImageFilters = {}) {
  return useInfiniteQuery<ImagePage, Error>({
    queryKey: ['images', filters],

    queryFn: async ({ pageParam = 1 }) => {
      // Fetch images with pagination from API
      const response = await getUserCaptures(
        undefined, // localDate (not used for range queries)
        'photo' as CaptureType,
        filters.goalId,
        filters.subtaskInstanceId,
        filters.startDate, // Pass date range filters
        filters.endDate,
        pageParam as number,
        20
      );

      // API now returns pagination metadata directly
      return response;
    },

    // Get next page number if more data exists
    getNextPageParam: (lastPage) => {
      return lastPage.meta.has_next ? lastPage.meta.page + 1 : undefined;
    },

    // Initial page
    initialPageParam: 1,

    // Stale time: 5 minutes (images don't change often)
    staleTime: 5 * 60 * 1000,

    // Refetch on mount if stale
    refetchOnMount: true,

    // Refetch on window focus (when user returns to app)
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook: Fetch single day's images (optimized for daily view)
 *
 * Usage:
 * ```tsx
 * const { data, isLoading } = useDailyImages('2025-12-21');
 * ```
 */
export function useDailyImages(localDate: string) {
  return useQuery<Capture[], Error>({
    queryKey: ['images', 'daily', localDate],

    queryFn: async () => {
      const response = await getUserCaptures(localDate, 'photo' as CaptureType);
      return response.data; // Return just the captures array
    },

    // Longer stale time for daily images (unlikely to change after the day)
    staleTime: 10 * 60 * 1000, // 10 minutes

    enabled: !!localDate, // Only fetch if date is provided
  });
}

/**
 * Hook: Get image count for a goal (for badges/UI)
 *
 * Usage:
 * ```tsx
 * const { data: count } = useImageCount('goal-uuid');
 * ```
 */
export function useImageCount(goalId?: string) {
  return useQuery<number, Error>({
    queryKey: ['images', 'count', goalId],

    queryFn: async () => {
      const response = await getUserCaptures(undefined, 'photo' as CaptureType, goalId);
      return response.meta.total; // Return total count from metadata
    },

    staleTime: 2 * 60 * 1000, // 2 minutes

    enabled: !!goalId,
  });
}
