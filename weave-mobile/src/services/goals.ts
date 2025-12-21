/**
 * Goals API Service (Story 2.1: Needles List View)
 *
 * Handles API communication for goals (needles) management
 */

import { getApiBaseUrl } from '@/utils/api';
import type { GoalsResponse, ApiErrorResponse } from '@/types/goals';

/**
 * Fetch active goals with stats
 *
 * @param accessToken - JWT access token for authentication
 * @returns Promise with goals data and metadata
 * @throws Error if API call fails or returns error
 *
 * @example
 * ```ts
 * const response = await fetchActiveGoals(accessToken);
 * // Returns: {data: Goal[], meta: {total: 2, active_goal_limit: 3}}
 * ```
 */
export async function fetchActiveGoals(accessToken: string): Promise<GoalsResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/goals?status=active&include_stats=true`;

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
    console.error('[GOALS_SERVICE] API error:', response.status, errorData);
    throw new Error(
      errorData.error?.message || `Failed to fetch goals: ${response.status} ${response.statusText}`
    );
  }

  const data: GoalsResponse = await response.json();
  return data;
}
