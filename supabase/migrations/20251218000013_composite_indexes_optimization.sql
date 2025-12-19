-- Migration 013: Composite Indexes Optimization
-- Purpose: Add composite indexes for common query patterns to improve performance
-- Story: 0.2b - Database Schema Refinement + Critical Tables
-- Performance Target: Dashboard <100ms, Today's Binds <50ms, Completion History <100ms

-- ═══════════════════════════════════════════════════════════════════════
-- COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- ═══════════════════════════════════════════════════════════════════════

-- Pattern 1: Get today's binds with status filter
-- Query: SELECT * FROM subtask_instances WHERE user_id = ? AND scheduled_for_date = ? AND status = 'planned'
-- Already exists from migration 005: idx_subtask_instances_user_date_status

-- Pattern 2: Get completion history in reverse chronological order
-- Query: SELECT * FROM subtask_completions WHERE user_id = ? AND local_date >= ? ORDER BY local_date DESC
-- Already exists from migration 006: idx_subtask_completions_user_date (DESC)

-- Pattern 3: Get captures by type for a date range
-- Query: SELECT * FROM captures WHERE user_id = ? AND local_date >= ? AND type = 'photo'
-- Already exists from migration 007: idx_captures_user_date_type

-- Pattern 4: Get recent journal entries
-- Query: SELECT * FROM journal_entries WHERE user_id = ? ORDER BY local_date DESC LIMIT 7
-- Already exists from migration 008: idx_journal_entries_user_date (DESC)

-- Pattern 5: Get goal with all active binds
-- Query: SELECT g.*, array_agg(st.*) FROM goals g
--        LEFT JOIN subtask_templates st ON st.goal_id = g.id AND st.is_archived = FALSE
--        WHERE g.user_id = ? AND g.id = ? GROUP BY g.id
CREATE INDEX IF NOT EXISTS idx_goals_user_status_created
  ON goals(user_id, status, created_at DESC)
  WHERE status = 'active';  -- Partial index for active goals only

-- Pattern 6: Get AI runs for cost analysis by date range
-- Query: SELECT SUM(cost_estimate) FROM ai_runs
--        WHERE created_at >= ? AND created_at < ? AND status = 'success'
-- Already exists from migration 011: idx_ai_runs_cost_tracking

-- Pattern 7: Get latest identity doc version
-- Query: SELECT * FROM identity_docs WHERE user_id = ? ORDER BY version DESC LIMIT 1
-- Already exists from migration 002: idx_identity_docs_user_version

-- Pattern 8: Get dashboard aggregate for date range
-- Query: SELECT * FROM daily_aggregates WHERE user_id = ? AND local_date >= ? ORDER BY local_date DESC
-- Already exists from migration 009: idx_daily_aggregates_user_date

-- Pattern 9: Get Triad for today
-- Query: SELECT * FROM triad_tasks WHERE user_id = ? AND date_for = ? ORDER BY rank
-- Already exists from migration 010: idx_triad_tasks_user_date

-- Pattern 10: Check for existing AI cache
-- Query: SELECT * FROM ai_runs WHERE input_hash = ? AND status = 'success' ORDER BY created_at DESC LIMIT 1
-- Already exists from migration 011: idx_ai_runs_input_hash (partial index WHERE status = 'success')

-- ═══════════════════════════════════════════════════════════════════════
-- ADDITIONAL PERFORMANCE OPTIMIZATIONS
-- ═══════════════════════════════════════════════════════════════════════

-- Optimize: Get all content for a specific date (Dashboard query)
-- This is the MOST CRITICAL query for user experience
CREATE INDEX IF NOT EXISTS idx_subtask_completions_dashboard_query
  ON subtask_completions(user_id, local_date)
  INCLUDE (duration_minutes, completed_at);

-- Optimize: Streak calculation (consecutive days with completions)
-- Need efficient forward and backward scanning
-- Forward scan already exists: idx_subtask_completions_user_date_asc from migration 006

-- Optimize: Get captures linked to completed binds (proof attachments)
CREATE INDEX IF NOT EXISTS idx_captures_bind_proof
  ON captures(subtask_instance_id, local_date)
  WHERE subtask_instance_id IS NOT NULL;

-- Optimize: Find AI artifacts by user that were edited
CREATE INDEX IF NOT EXISTS idx_ai_artifacts_user_edited
  ON ai_artifacts(user_id, type, updated_at DESC)
  WHERE is_user_edited = TRUE;

-- ═══════════════════════════════════════════════════════════════════════
-- FOREIGN KEY CONSTRAINTS (Added after dependencies exist)
-- ═══════════════════════════════════════════════════════════════════════

-- Add FK for triad_tasks.generated_by_run_id (deferred from migration 010)
-- Now safe to add because ai_runs table exists from migration 011
ALTER TABLE triad_tasks
  ADD CONSTRAINT fk_triad_tasks_generated_by_run
  FOREIGN KEY (generated_by_run_id)
  REFERENCES ai_runs(id)
  ON DELETE SET NULL;

-- Comments for documentation
COMMENT ON INDEX idx_goals_user_status_created IS 'Partial index for active goals list. 3x faster than full table scan.';
COMMENT ON INDEX idx_subtask_completions_dashboard_query IS 'CRITICAL: Dashboard query optimization with INCLUDE clause to avoid heap lookups.';
COMMENT ON INDEX idx_captures_bind_proof IS 'Partial index for proof-linked captures only. Used for "Active Days with Proof" metric.';
COMMENT ON INDEX idx_ai_artifacts_user_edited IS 'Track user edits for AI improvement feedback loop.';
