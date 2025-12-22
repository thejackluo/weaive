/**
 * User Stats API Service (Epic 5: Progress Visualization)
 *
 * Handles API communication for user statistics (level, streak, character state)
 */

import { getApiBaseUrl } from '@/utils/api';

/**
 * User statistics data
 */
export interface UserStatsData {
  level: number;
  current_streak: number;
  weave_character_state: 'strand' | 'thread' | 'weave';
  total_completions: number;
  total_active_days: number;
}

/**
 * User stats API response
 */
export interface UserStatsResponse {
  data: UserStatsData;
  meta: {
    timestamp: string;
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
 * Fetch user statistics (level, streak, character state)
 *
 * @param accessToken - JWT access token for authentication
 * @returns Promise with user stats data
 * @throws Error if API call fails or returns error
 *
 * @example
 * ```ts
 * const response = await fetchUserStats(accessToken);
 * // Returns: {data: {level: 5, current_streak: 12, weave_character_state: 'thread', ...}, meta: {...}}
 * ```
 */
export async function fetchUserStats(accessToken: string): Promise<UserStatsResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/user/stats`;

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
        `Failed to fetch user stats: ${response.status} ${response.statusText}`
    );
  }

  const data: UserStatsResponse = await response.json();
  return data;
}
