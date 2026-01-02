/**
 * useInsights Hook (MVP AI Feature)
 *
 * Fetches AI-generated insights for Thread and Dashboard screens.
 * Uses TanStack Query for caching and automatic refetching.
 *
 * Thread insights: Refreshes every hour (updates as binds completed)
 * Dashboard insights: Refreshes every 24 hours (daily summary)
 */

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';

// ============================================================
// Types
// ============================================================

export interface ThreadInsights {
  todays_focus: {
    id: string;
    title: string;
    reason: string;
  } | null;
  streak_status: {
    current_streak: number;
    milestone_proximity: {
      milestone: number;
      days_away: number;
    } | null;
    message: string;
  };
  pattern_insight: {
    pattern_type: string;
    description: string;
    suggestion: string;
  } | null;
  quick_win: {
    id: string;
    title: string;
    reason: string;
  } | null;
  ai_message: string;
  generated_at: string;
}

export interface DashboardInsights {
  weekly_summary: string;
  patterns: string[];
  biggest_win: string;
  ai_message: string;
  generated_at: string;
}

// ============================================================
// Thread Insights Hook
// ============================================================

/**
 * Fetch AI-generated insights for Thread home screen.
 *
 * Returns:
 * - Today's focus bind
 * - Streak status with milestone warnings
 * - Pattern insights (time-of-day preferences)
 * - Quick win suggestion
 * - Sarcastic coach message
 *
 * **Caching:**
 * - Refreshes every 1 hour
 * - Stale-while-revalidate pattern
 * - Refetch on mount if stale
 *
 * **Personality:**
 * - Uses mvp_coach (sarcastic but supportive)
 * - Adjusts tone based on user's progress
 */
export function useThreadInsights() {
  return useQuery({
    queryKey: ['insights', 'thread'],
    queryFn: async (): Promise<ThreadInsights> => {
      const response = await apiClient.get('/api/insights/thread');
      return response.data.data; // Extract data from {data, meta} wrapper
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    cacheTime: 1000 * 60 * 60 * 2, // 2 hours
    refetchOnMount: 'always', // Always check for updates on mount
    refetchOnWindowFocus: false, // Don't refetch on every window focus
    retry: 2, // Retry failed requests 2 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

// ============================================================
// Dashboard Insights Hook
// ============================================================

/**
 * Fetch AI-generated insights for Dashboard screen.
 *
 * Returns:
 * - Weekly completion rate trend
 * - Pattern detection
 * - Biggest win this week
 * - AI-generated encouragement
 *
 * **Caching:**
 * - Refreshes every 24 hours
 * - Background updates daily
 *
 * **Personality:**
 * - Uses mvp_coach (sarcastic but supportive)
 *
 * **Status:** Coming soon (currently returns 501)
 */
export function useDashboardInsights() {
  return useQuery({
    queryKey: ['insights', 'dashboard'],
    queryFn: async (): Promise<DashboardInsights> => {
      const response = await apiClient.get('/api/insights/dashboard');
      return response.data.data; // Extract data from {data, meta} wrapper
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    cacheTime: 1000 * 60 * 60 * 48, // 48 hours
    refetchOnMount: false, // Don't refetch on every mount (expensive)
    refetchOnWindowFocus: false,
    retry: 1, // Only retry once (expensive operation)
    enabled: false, // Disable until dashboard insights are implemented (returns 501)
  });
}

// ============================================================
// Insight Invalidation Helpers
// ============================================================

/**
 * Invalidate insights cache (trigger refetch).
 *
 * **When to call:**
 * - After completing a bind
 * - After submitting journal entry
 * - After updating goals
 *
 * **Example:**
 * ```ts
 * import { invalidateInsights } from '@/hooks/useInsights';
 *
 * // After bind completion
 * await completeBind(bindId);
 * invalidateInsights(); // Refresh insights
 * ```
 */
export function invalidateInsights() {
  const { queryClient } = require('@tanstack/react-query');
  queryClient.invalidateQueries({ queryKey: ['insights'] });
}

/**
 * Prefetch thread insights (for navigation optimization).
 *
 * **When to call:**
 * - On app launch (preload thread screen data)
 * - Before navigating to thread screen
 *
 * **Example:**
 * ```ts
 * import { prefetchThreadInsights } from '@/hooks/useInsights';
 *
 * // On app launch
 * useEffect(() => {
 *   prefetchThreadInsights();
 * }, []);
 * ```
 */
export async function prefetchThreadInsights() {
  const { queryClient } = require('@tanstack/react-query');
  await queryClient.prefetchQuery({
    queryKey: ['insights', 'thread'],
    queryFn: async () => {
      const response = await apiClient.get('/api/insights/thread');
      return response.data.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
