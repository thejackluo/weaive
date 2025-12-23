/**
 * Day Details API Service
 *
 * Handles fetching detailed activity for a specific day
 * Used by DayDetailsModal in Dashboard
 */

import { getApiBaseUrl } from '@/utils/api';

/**
 * Bind completion for a specific day
 */
export interface DayBind {
  id: string;
  title: string;
  notes?: string;
  has_proof: boolean;
  completed_at: string;
  duration_minutes?: number;
  needle_title?: string;
}

/**
 * Journal entry for a specific day
 */
export interface DayJournal {
  id: string;
  fulfillment_score: number;
  default_responses?: {
    today_reflection?: string;
    tomorrow_focus?: string;
  };
  custom_responses?: Record<string, any>;
  created_at: string;
}

/**
 * Day details data
 */
export interface DayDetailsData {
  date: string;
  binds: DayBind[];
  journal?: DayJournal;
  total_completions: number;
}

/**
 * Day details API response
 */
export interface DayDetailsResponse {
  data: DayDetailsData;
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
 * Fetch detailed activity for a specific day
 *
 * @param accessToken - JWT access token for authentication
 * @param date - Date in YYYY-MM-DD format
 * @returns Promise with day details
 * @throws Error if API call fails or returns error
 *
 * @example
 * ```ts
 * const response = await fetchDayDetails(accessToken, '2025-12-20');
 * // Returns: {data: {date, binds: [...], journal: {...}, total_completions}, meta: {...}}
 * ```
 */
export async function fetchDayDetails(
  accessToken: string,
  date: string
): Promise<DayDetailsResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/stats/day/${date}`;

  console.log('[DAY_DETAILS_API] Fetching:', url);

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
    console.error('[DAY_DETAILS_API] Error:', response.status, errorData);
    throw new Error(
      errorData.error?.message ||
        `Failed to fetch day details: ${response.status} ${response.statusText}`
    );
  }

  const data: DayDetailsResponse = await response.json();
  console.log('[DAY_DETAILS_API] Success:', data);
  return data;
}
