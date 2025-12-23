/**
 * Binds API Service
 *
 * Handles API communication for binds (subtask instances) management
 * Follows pattern from src/services/goals.ts
 */

import { getApiBaseUrl } from '@/utils/api';
import type { BindsResponse, ApiErrorResponse } from '@/types/binds';

/**
 * Fetch today's binds with needle context and completion status
 *
 * @param accessToken - JWT access token for authentication
 * @returns Promise with binds data and metadata
 * @throws Error if API call fails or returns error
 *
 * @example
 * ```ts
 * const response = await fetchTodayBinds(accessToken);
 * // Returns: {data: Bind[], meta: {local_date, total_binds, completed_count}}
 * ```
 */
export async function fetchTodayBinds(accessToken: string): Promise<BindsResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/binds/today`;

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
    console.error('[BINDS_SERVICE] API error:', response.status, errorData);
    throw new Error(
      errorData.error?.message || `Failed to fetch binds: ${response.status} ${response.statusText}`
    );
  }

  const data: BindsResponse = await response.json();
  return data;
}
