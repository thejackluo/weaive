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
 * Milestone (Q-Goal) - Quantifiable subgoal
 */
export interface Milestone {
  id: string;
  title: string;
  target_value?: number;
  current_value?: number;
  unit?: string;
}

/**
 * Bind (Subtask Template) - Consistent action/habit
 */
export interface Bind {
  id: string;
  title: string;
  description?: string;
  frequency: string;
  recurrence_rule?: string; // iCal RRULE format (e.g., "FREQ=DAILY;INTERVAL=1")
  completedToday?: boolean;
}

/**
 * Memory - Image/photo associated with a goal
 */
export interface Memory {
  id: string;
  image_url: string;
  thumbnail_url?: string;
  created_at: string; // ISO 8601
}

/**
 * Goal Detail (extended Goal with milestones and binds)
 * Used in US-2.2: View Goal Details
 */
export interface GoalDetail extends Goal {
  milestones: Milestone[];
  binds: Bind[];
  qgoals?: Milestone[]; // Alias for milestones (Q-Goals)
  memories: Memory[];
  stats?: {
    consistency_7d: number | null;
    total_completions: number;
    current_streak: number;
  };
}

/**
 * Goal Detail API Response
 */
export interface GoalDetailResponse {
  data: GoalDetail;
  meta?: {
    timestamp: string;
  };
}

/**
 * API Error Response
 */
export interface ApiErrorResponse {
  error?: {
    code: string;
    message: string;
  };
  detail?: string; // FastAPI validation error format
}

/**
 * Q-Goal Creation Request
 */
export interface QGoalCreate {
  title: string;
  metric_name?: string;
  target_value?: number;
  current_value?: number;
  unit?: string;
}

/**
 * Bind Creation Request
 */
export interface BindCreate {
  title: string;
  description?: string;
  frequency_type: 'daily' | 'weekly' | 'custom';
  frequency_value: number; // 1-7
}

/**
 * Goal Creation Request (US-2.3: Create New Goal)
 */
export interface CreateGoalRequest {
  title: string;
  description?: string; // "Why it matters"
  qgoals?: QGoalCreate[];
  binds?: BindCreate[];
}

/**
 * Goal Update Request (US-2.4: Edit Needle)
 */
export interface UpdateGoalRequest {
  title?: string;
  description?: string;
  status?: 'active' | 'archived';
}
