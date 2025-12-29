/**
 * Binds API Types
 *
 * Types for today's binds (subtask instances) API
 * Follows pattern from src/types/goals.ts
 */

/**
 * Completion Details
 *
 * Details about a completed bind (from subtask_completions table)
 */
export interface CompletionDetails {
  completed_at: string; // ISO timestamp
  duration_minutes: number | null; // Timer duration if used
  notes: string | null; // Optional completion description (280 char max)
}

/**
 * Bind (Subtask Instance)
 *
 * A scheduled task/habit for a specific date
 */
export interface Bind {
  id: string;
  title: string;
  subtitle: string; // Progress context (e.g., "3x per week • 2/3 this week")
  needle_id: string | null; // Goal ID
  needle_title: string;
  needle_color: 'blue' | 'green' | 'red' | 'violet' | 'emerald';
  estimated_minutes: number;
  completed: boolean;
  has_proof: boolean;
  times_per_week: number; // Required completions per week (1-7)
  completions_this_week: number; // Current week's completions
  is_completed_for_week: boolean; // Whether weekly goal is reached
  is_miss: boolean; // Whether it's impossible to achieve perfect week
  week_start: string; // Rolling week start date (ISO)
  week_end: string; // Rolling week end date (ISO)
  scheduled_for_date: string; // ISO date
  status: 'planned' | 'done' | 'skipped' | 'snoozed';
  notes: string | null;
  completion_details: CompletionDetails | null; // Details if completed
}

/**
 * API Response: GET /api/binds/today
 */
export interface BindsResponse {
  data: Bind[];
  meta: {
    local_date: string; // ISO date
    total_binds: number;
    completed_count: number;
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
 * Create Bind Request (POST /api/binds)
 */
export interface CreateBindRequest {
  goal_id: string; // Goal ID this bind belongs to
  title: string; // Bind title
  description?: string; // Optional description
  times_per_week: number; // Number of times per week (1-7), default: 3
}

/**
 * Bind Template (from subtask_templates table)
 */
export interface BindTemplate {
  id: string;
  goal_id: string;
  title: string;
  default_estimated_minutes: number;
  times_per_week: number; // Number of times per week (1-7)
  recurrence_rule: string; // iCal RRULE format (deprecated, use times_per_week)
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * API Response: Single Bind Operation (create, update, delete)
 */
export interface BindResponse {
  success: boolean;
  data: BindTemplate;
  meta: {
    timestamp: string;
  };
}
