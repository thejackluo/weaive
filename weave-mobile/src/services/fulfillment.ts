/**
 * Fulfillment API Service (Epic 5: Progress Visualization)
 *
 * Handles API communication for fulfillment trend data visualization
 */

import { getApiBaseUrl } from '@/utils/api';

/**
 * Fulfillment data point for a single day
 */
export interface FulfillmentDataPoint {
  date: string;
  fulfillment_score: number; // 0-10
  rolling_average_7d: number; // 7-day rolling average
}

/**
 * Fulfillment API response
 */
export interface FulfillmentResponse {
  data: FulfillmentDataPoint[];
  meta: {
    timeframe: '7d' | '2w' | '1m' | '90d';
    average_fulfillment: number;
    total_entries: number;
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
 * Fetch fulfillment trend data for chart visualization
 *
 * @param accessToken - JWT access token for authentication
 * @param timeframe - Time range: 7d, 2w, 1m, 90d (default: 7d)
 * @param localDate - User's local date in YYYY-MM-DD format (for timezone accuracy)
 * @returns Promise with fulfillment trend data
 * @throws Error if API call fails or returns error
 *
 * @example
 * ```ts
 * const response = await fetchFulfillmentData(accessToken, '7d', '2025-12-20');
 * // Returns: {data: [{date: '2025-12-20', fulfillment_score: 8, rolling_average_7d: 7.5}], meta: {...}}
 * ```
 */
export async function fetchFulfillmentData(
  accessToken: string,
  timeframe: '7d' | '2w' | '1m' | '90d' = '7d',
  localDate?: string
): Promise<FulfillmentResponse> {
  const baseUrl = getApiBaseUrl();
  let queryParams = `timeframe=${timeframe}`;
  if (localDate) {
    queryParams += `&local_date=${localDate}`;
  }

  const url = `${baseUrl}/api/stats/fulfillment?${queryParams}`;

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
        `Failed to fetch fulfillment data: ${response.status} ${response.statusText}`
    );
  }

  const data: FulfillmentResponse = await response.json();
  return data;
}
