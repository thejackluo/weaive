/**
 * Development Tools for Testing
 * These utilities help with testing and debugging during development
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Clear all React Query caches
 * This forces a fresh fetch from the API for all queries
 */
export function clearAllCaches(queryClient: QueryClient) {
  queryClient.clear();
  console.log('✅ All React Query caches cleared');
}

/**
 * Clear specific query cache by key
 */
export function clearCacheByKey(queryClient: QueryClient, queryKey: unknown[]) {
  queryClient.removeQueries({ queryKey });
  console.log('✅ Cache cleared for:', queryKey);
}

/**
 * Log all active queries (for debugging)
 */
export function logActiveQueries(queryClient: QueryClient) {
  const queries = queryClient.getQueryCache().getAll();
  console.log('📊 Active queries:', queries.length);
  queries.forEach((query) => {
    console.log('  -', query.queryKey, {
      state: query.state.status,
      dataUpdatedAt: new Date(query.state.dataUpdatedAt).toLocaleTimeString(),
    });
  });
}
