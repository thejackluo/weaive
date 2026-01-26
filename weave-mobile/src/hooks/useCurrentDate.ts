/**
 * useCurrentDate Hook
 *
 * Returns the current date in YYYY-MM-DD format.
 * This hook INTENTIONALLY has no memoization - it recalculates on every render.
 * This ensures TanStack Query keys update when the date changes.
 *
 * Usage:
 * ```tsx
 * const today = useCurrentDate();
 * // Returns: "2025-01-10"
 * ```
 *
 * Why no useMemo?
 * - We WANT this to recalculate frequently
 * - Ensures query keys update when date changes (e.g., midnight rollover)
 * - Fixes issue where app left open overnight shows stale data
 *
 * Date Change Detection:
 * - Checks every minute for midnight rollover (while app is active)
 * - Checks on app foreground (when coming back from background)
 * - This ensures the date updates even if app was backgrounded overnight
 */

import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export function useCurrentDate(): string {
  // State that triggers re-render when date changes
  const [, setForceUpdate] = useState(0);

  // Track the last known date to detect changes
  const lastDateRef = useRef<string>('');

  // Helper to get current local date string
  const getCurrentDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Check if date has changed and trigger update if so
  const checkAndUpdateDate = (source: string) => {
    const currentDate = getCurrentDateString();
    if (lastDateRef.current && lastDateRef.current !== currentDate) {
      console.log(`[useCurrentDate] 📅 Date changed (${source}): ${lastDateRef.current} → ${currentDate}`);
      setForceUpdate(prev => prev + 1);
    }
    lastDateRef.current = currentDate;
  };

  // Initialize lastDateRef on mount
  useEffect(() => {
    lastDateRef.current = getCurrentDateString();
  }, []);

  // Listen for app state changes (background → foreground)
  // This catches the case where app was backgrounded overnight
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkAndUpdateDate('app-foreground');
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  // Update every minute to catch midnight rollover while app is active
  useEffect(() => {
    const interval = setInterval(() => {
      checkAndUpdateDate('interval-check');
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Always return current LOCAL date (no caching)
  // CRITICAL: Must use local date, NOT UTC date
  // This ensures query keys match the user's timezone
  return getCurrentDateString();
}
