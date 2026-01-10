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
 */

import { useState, useEffect } from 'react';

export function useCurrentDate(): string {
  // State that triggers re-render when date changes
  const [, setForceUpdate] = useState(0);

  // Update every minute to catch midnight rollover
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      // Only update at midnight (00:00)
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        console.log('[useCurrentDate] 🕐 Midnight detected - triggering date update');
        setForceUpdate(prev => prev + 1);
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Always return current date (no caching)
  return new Date().toISOString().split('T')[0];
}
