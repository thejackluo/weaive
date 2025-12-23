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
  subtitle: string; // Frequency context (e.g., "5x Per Week. Today's one of them.")
  needle_id: string | null; // Goal ID
  needle_title: string;
  needle_color: 'blue' | 'green' | 'red' | 'violet' | 'emerald';
  estimated_minutes: number;
  completed: boolean;
  has_proof: boolean;
  frequency: string; // Recurrence pattern
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
  error: {
    code: string;
    message: string;
  };
}
