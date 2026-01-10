/**
 * useAppStateRefresh Hook
 *
 * Safety net that invalidates queries when the app comes to foreground.
 * Handles edge cases like:
 * - App left in background overnight
 * - Device clock changes
 * - iOS keeping app in memory for extended periods
 *
 * Usage (root level only):
 * ```tsx
 * // In app/_layout.tsx
 * useAppStateRefresh();
 * ```
 *
 * Why this is needed:
 * - Even with reactive query keys, there are edge cases
 * - iOS can keep apps alive for 12+ hours in background
 * - User changes device date/timezone while app is open
 * - Ensures fresh data when app returns to foreground
 */

import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

export function useAppStateRefresh() {
  const queryClient = useQueryClient();
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // Detect transition from background/inactive to active (foreground)
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('[useAppStateRefresh] 🔄 App came to foreground - invalidating date-dependent queries');

        // Invalidate all date-dependent queries
        queryClient.invalidateQueries({ queryKey: ['binds'] });
        queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
        queryClient.invalidateQueries({ queryKey: ['userStats'] });
        queryClient.invalidateQueries({ queryKey: ['consistency'] });
        queryClient.invalidateQueries({ queryKey: ['daily-aggregates'] });
        queryClient.invalidateQueries({ queryKey: ['bindsGrid'] });

        console.log('[useAppStateRefresh] ✅ Queries invalidated - will refetch on next access');
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [queryClient]);
}
