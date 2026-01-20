/**
 * Binds API Service
 *
 * Handles API communication for binds (subtask templates) management
 * Follows pattern from src/services/goals.ts
 */

import { getApiBaseUrl } from '@/utils/api';
import type {
  BindsResponse,
  ApiErrorResponse,
  CreateBindRequest,
  BindResponse,
} from '@/types/binds';

/**
 * Fetch today's binds with needle context and completion status
 *
 * @param accessToken - JWT access token for authentication
 * @param localDate - User's local date in YYYY-MM-DD format (ensures timezone-accurate fetch)
 * @returns Promise with binds data and metadata
 * @throws Error if API call fails or returns error
 *
 * @example
 * ```ts
 * const today = new Date().toISOString().split('T')[0]; // "2026-01-20"
 * const response = await fetchTodayBinds(accessToken, today);
 * // Returns: {data: Bind[], meta: {local_date, total_binds, completed_count}}
 * ```
 */
export async function fetchTodayBinds(
  accessToken: string,
  localDate: string
): Promise<BindsResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/binds/today?local_date=${localDate}`;

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

/**
 * Create a new bind for a goal
 *
 * @param bindData - Bind creation data
 * @param accessToken - JWT access token for authentication
 * @returns Promise with created bind data
 * @throws Error if API call fails or returns error
 *
 * @example
 * ```ts
 * const newBind = await createBind({
 *   goal_id: 'goal-123',
 *   title: 'Workout',
 *   times_per_week: 3
 * }, accessToken);
 * ```
 */
export async function createBind(
  bindData: CreateBindRequest,
  accessToken: string
): Promise<BindResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/binds`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(bindData),
  });

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json();
    console.error('[BINDS_SERVICE] Create error:', response.status, errorData);
    throw new Error(
      errorData.error?.message ||
        errorData.detail ||
        `Failed to create bind: ${response.status} ${response.statusText}`
    );
  }

  const data: BindResponse = await response.json();
  return data;
}

/**
 * Complete a bind (mark as done with optional timer/proof/notes)
 *
 * @param bindId - Bind instance ID
 * @param accessToken - JWT access token for authentication
 * @param localDate - User's local date in YYYY-MM-DD format (ensures timezone-accurate completion)
 * @param timerDuration - Optional timer duration in minutes
 * @param photoUsed - Whether photo accountability was used
 * @param notes - Optional completion notes (500 char max)
 * @returns Promise with completion data
 * @throws Error if API call fails or returns error
 *
 * @example
 * ```ts
 * const today = new Date().toISOString().split('T')[0];
 * const result = await completeBind('bind-123', accessToken, today, 25, true, 'Felt great!');
 * ```
 */
export async function completeBind(
  bindId: string,
  accessToken: string,
  localDate: string,
  timerDuration?: number,
  photoUsed?: boolean,
  notes?: string
): Promise<any> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/binds/${bindId}/complete`;

  const body: {
    timer_duration?: number;
    photo_used?: boolean;
    notes?: string;
    local_date: string;
  } = {
    local_date: localDate,
  };

  if (timerDuration !== undefined) {
    body.timer_duration = timerDuration;
  }
  if (photoUsed !== undefined) {
    body.photo_used = photoUsed;
  }
  if (notes !== undefined) {
    body.notes = notes;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json();
    console.error('[BINDS_SERVICE] Complete error:', response.status, errorData);
    throw new Error(
      errorData.error?.message ||
        errorData.detail ||
        `Failed to complete bind: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data;
}

/**
 * Delete a bind (soft delete by setting is_archived=true)
 *
 * @param bindId - Bind ID
 * @param accessToken - JWT access token for authentication
 * @returns Promise with archived bind data
 * @throws Error if API call fails or returns error
 *
 * @example
 * ```ts
 * const archivedBind = await deleteBind('bind-123', accessToken);
 * // Sets bind is_archived to true
 * ```
 */
export async function deleteBind(bindId: string, accessToken: string): Promise<BindResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/binds/${bindId}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json();
    console.error('[BINDS_SERVICE] Delete error:', response.status, errorData);
    throw new Error(
      errorData.error?.message ||
        errorData.detail ||
        `Failed to delete bind: ${response.status} ${response.statusText}`
    );
  }

  const data: BindResponse = await response.json();
  return data;
}
