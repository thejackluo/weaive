/**
 * Consistency API Service (Epic 5: Progress Visualization)
 *
 * Handles API communication for consistency data visualization
 */

import { getApiBaseUrl } from '@/utils/api';

/**
 * Consistency data point for a single day
 */
export interface ConsistencyDataPoint {
  date: string;
  completion_percentage: number; // 0-100
  completed_count: number;
  total_count: number;
}

/**
 * Consistency API response
 */
export interface ConsistencyResponse {
  data: ConsistencyDataPoint[];
  meta: {
    timeframe: '7d' | '2w' | '1m' | '90d';
    filter_type: 'overall' | 'needle' | 'bind' | 'thread';
    consistency_percentage: number;
    total_days: number;
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
 * Fetch consistency data for heat map visualization
 *
 * @param accessToken - JWT access token for authentication
 * @param timeframe - Time range: 7d, 2w, 1m, 90d (default: 7d)
 * @param filterType - Filter type: overall, needle, bind, thread (default: overall)
 * @param filterId - Optional goal/bind ID if filtering by needle or bind
 * @returns Promise with consistency data
 * @throws Error if API call fails or returns error
 *
 * @example
 * ```ts
 * const response = await fetchConsistencyData(accessToken, '7d', 'overall');
 * // Returns: {data: [{date: '2025-12-20', completion_percentage: 75, ...}], meta: {...}}
 * ```
 */
export async function fetchConsistencyData(
  accessToken: string,
  timeframe: '7d' | '2w' | '1m' | '90d' = '7d',
  filterType: 'overall' | 'needle' | 'bind' | 'thread' = 'overall',
  filterId?: string
): Promise<ConsistencyResponse> {
  const baseUrl = getApiBaseUrl();

  // Build query params manually
  let queryParams = `timeframe=${timeframe}&filter_type=${filterType}`;
  if (filterId) {
    queryParams += `&filter_id=${filterId}`;
  }

  const url = `${baseUrl}/api/stats/consistency?${queryParams}`;

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
        `Failed to fetch consistency data: ${response.status} ${response.statusText}`
    );
  }

  const data: ConsistencyResponse = await response.json();
  return data;
}
