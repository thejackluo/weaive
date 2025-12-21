/**
 * Goal Types (Story 2.1: Needles List View)
 *
 * Type definitions for goals (needles) in the Weave app
 */

/**
 * Goal status
 */
export type GoalStatus = 'active' | 'archived' | 'completed';

/**
 * Goal object from API
 */
export interface Goal {
  id: string;
  title: string;
  description?: string;
  status: GoalStatus;
  consistency_7d: number | null; // null for new goals (less than 7 days)
  active_binds_count: number;
  updated_at: string; // ISO 8601
  created_at: string; // ISO 8601
  user_id: string;
}

/**
 * Goals API Response (standard format: {data, meta})
 */
export interface GoalsResponse {
  data: Goal[];
  meta: {
    total: number;
    active_goal_limit: number; // Maximum active goals (3)
  };
}

/**
 * API Error Response
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
