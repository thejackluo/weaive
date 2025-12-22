/**
 * Goals API Service (Story 2.1, 2.2, 2.3, 2.4, 2.5: Full Goal Management)
 *
 * Handles API communication for goals (needles) management
 */

import { getApiBaseUrl } from '@/utils/api';
import type {
  GoalsResponse,
  GoalDetailResponse,
  ApiErrorResponse,
  CreateGoalRequest,
  UpdateGoalRequest,
} from '@/types/goals';

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
    throw new Error(
      errorData.error?.message || `Failed to fetch goals: ${response.status} ${response.statusText}`
    );
  }

  const data: GoalsResponse = await response.json();
  return data;
}

/**
 * Fetch single goal by ID with details
 *
 * @param goalId - Goal ID
 * @param accessToken - JWT access token for authentication
 * @returns Promise with goal detail data
 * @throws Error if API call fails or returns error
 *
 * @example
 * ```ts
 * const goalDetail = await fetchGoalById('goal-123', accessToken);
 * // Returns: {data: {id, title, description, stats, milestones, binds}}
 * ```
 */
export async function fetchGoalById(
  goalId: string,
  accessToken: string
): Promise<GoalDetailResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/goals/${goalId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json();
    throw new Error(
      errorData.error?.message || `Failed to fetch goal: ${response.status} ${response.statusText}`
    );
  }

  const data: GoalDetailResponse = await response.json();
  return data;
}

/**
 * Create a new goal (US-2.3: Create New Goal - AI-Assisted)
 *
 * @param goalData - Goal creation data
 * @param accessToken - JWT access token for authentication
 * @returns Promise with created goal data
 * @throws Error if API call fails or returns error
 *
 * @example
 * ```ts
 * const newGoal = await createGoal({
 *   title: 'Get Ripped',
 *   description: 'to auafarm mfs',
 *   qgoals: [{title: 'Reach 180 lbs', target_value: 180, unit: 'lbs'}],
 *   binds: [{title: 'Workout', frequency_type: 'weekly', frequency_value: 5}]
 * }, accessToken);
 * ```
 */
export async function createGoal(
  goalData: CreateGoalRequest,
  accessToken: string
): Promise<GoalDetailResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/goals`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(goalData),
  });

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json();
    throw new Error(
      errorData.error?.message ||
        errorData.detail ||
        `Failed to create goal: ${response.status} ${response.statusText}`
    );
  }

  const data: GoalDetailResponse = await response.json();
  return data;
}

/**
 * Update an existing goal (US-2.4: Edit Needle)
 *
 * @param goalId - Goal ID
 * @param goalData - Goal update data
 * @param accessToken - JWT access token for authentication
 * @returns Promise with updated goal data
 * @throws Error if API call fails or returns error
 *
 * @example
 * ```ts
 * const updatedGoal = await updateGoal('goal-123', {
 *   title: 'Updated Goal Title',
 *   description: 'New description'
 * }, accessToken);
 * ```
 */
export async function updateGoal(
  goalId: string,
  goalData: UpdateGoalRequest,
  accessToken: string
): Promise<GoalDetailResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/goals/${goalId}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(goalData),
  });

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json();
    throw new Error(
      errorData.error?.message ||
        errorData.detail ||
        `Failed to update goal: ${response.status} ${response.statusText}`
    );
  }

  const data: GoalDetailResponse = await response.json();
  return data;
}

/**
 * Archive a goal (US-2.5: Archive Goal)
 *
 * @param goalId - Goal ID
 * @param accessToken - JWT access token for authentication
 * @returns Promise with archived goal data
 * @throws Error if API call fails or returns error
 *
 * @example
 * ```ts
 * const archivedGoal = await archiveGoal('goal-123', accessToken);
 * // Sets goal status to 'archived'
 * ```
 */
export async function archiveGoal(
  goalId: string,
  accessToken: string
): Promise<GoalDetailResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/goals/${goalId}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json();
    throw new Error(
      errorData.error?.message ||
        errorData.detail ||
        `Failed to archive goal: ${response.status} ${response.statusText}`
    );
  }

  const data: GoalDetailResponse = await response.json();
  return data;
}
