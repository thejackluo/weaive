/**
 * History API Service (Epic 5: Progress Visualization)
 *
 * Handles API communication for recent activity history
 */

import { getApiBaseUrl } from '@/utils/api';

/**
 * History activity item
 */
export interface HistoryItem {
  id: string;
  type: 'completion' | 'journal' | 'goal_created' | 'goal_archived' | 'weave_chat';
  timestamp: string;
  description: string;
  related_goal_id?: string | null;
  related_goal_title?: string | null;
}

/**
 * History API response
 */
export interface HistoryResponse {
  data: HistoryItem[];
  meta: {
    total: number;
    limit: number;
  };
}

/**
 * API error response format
 */
export interface ApiErrorResponse {
  error?: {
    code: string;
    message: string;
  };
}

/**
 * History filter options
 */
export interface HistoryFilters {
  timeframe?: 'days' | 'weeks' | 'months';
  type?: 'all' | 'threads' | 'binds' | 'weave_chats';
}

/**
 * Fetch recent activity history
 *
 * @param accessToken - JWT access token for authentication
 * @param limit - Number of items to return (default: 20, max: 100)
 * @param filters - Optional filters for timeframe and type
 * @returns Promise with history items
 * @throws Error if API call fails or returns error
 *
 * @example
 * ```ts
 * const response = await fetchHistory(accessToken, 20, { timeframe: 'weeks', type: 'binds' });
 * // Returns: {data: [{id: 'uuid', type: 'completion', timestamp: '...', description: '...'}], meta: {...}}
 * ```
 */
export async function fetchHistory(
  accessToken: string,
  limit: number = 20,
  filters?: HistoryFilters
): Promise<HistoryResponse> {
  const baseUrl = getApiBaseUrl();

  // Build query string manually (URLSearchParams not available in React Native)
  const queryParams: string[] = [`limit=${limit}`];

  // Add timeframe filter
  if (filters?.timeframe) {
    queryParams.push(`timeframe=${filters.timeframe}`);
  }

  // Add type filter
  if (filters?.type && filters.type !== 'all') {
    queryParams.push(`type=${filters.type}`);
  }

  const url = `${baseUrl}/api/stats/history?${queryParams.join('&')}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    // Parse error response
    const errorData: ApiErrorResponse = await response.json();
    throw new Error(
      errorData.error?.message ||
        `Failed to fetch history: ${response.status} ${response.statusText}`
    );
  }

  const data: HistoryResponse = await response.json();
  return data;
}
