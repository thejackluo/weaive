/**
 * QueryClient Provider for TanStack Query
 *
 * Story 2.1: Needles List View
 * Provides React Query client for server state management
 *
 * Configuration:
 * - 5-minute stale time (per architecture docs)
 * - Retry disabled for development (enable in production)
 * - Cache time: 10 minutes
 */

import React from 'react';
import { QueryClient, QueryClientProvider as TanStackQueryClientProvider } from '@tanstack/react-query';

// Create QueryClient with app-wide configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes (per architecture)
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: __DEV__ ? false : 3, // No retry in dev, 3 retries in prod
      refetchOnWindowFocus: false, // Disable for mobile
      refetchOnReconnect: true, // Refetch on network reconnect
    },
  },
});

interface QueryClientProviderProps {
  children: React.ReactNode;
}

/**
 * Wraps app with TanStack Query provider
 *
 * Usage:
 * ```tsx
 * <QueryClientProvider>
 *   <App />
 * </QueryClientProvider>
 * ```
 */
export function QueryClientProvider({ children }: QueryClientProviderProps) {
  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
    </TanStackQueryClientProvider>
  );
}

// Export queryClient for direct access (e.g., in tests, manual invalidation)
export { queryClient };
