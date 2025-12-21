-- Migration 006: subtask_completions (IMMUTABLE EVENT LOG)
-- Purpose: Append-only completion events - canonical truth for all progress metrics
-- Story: 0.2a - Database Schema (Core Tables)
-- CRITICAL: This table is IMMUTABLE - NO UPDATE/DELETE operations allowed

CREATE TABLE subtask_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subtask_instance_id UUID NOT NULL REFERENCES subtask_instances(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL,  -- UTC timestamp of completion
  local_date DATE NOT NULL,  -- User's local date when completed (for streak/consistency calculations)
  duration_minutes INT CHECK (duration_minutes IS NULL OR duration_minutes >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes - CRITICAL for streak and consistency calculations
CREATE INDEX idx_subtask_completions_user_date ON subtask_completions(user_id, local_date DESC);
CREATE INDEX idx_subtask_completions_user_date_asc ON subtask_completions(user_id, local_date ASC);  -- For forward streak calcs
CREATE INDEX idx_subtask_completions_instance ON subtask_completions(subtask_instance_id);

-- ═══════════════════════════════════════════════════════════════════════
-- CRITICAL IMMUTABILITY PROTECTION
-- ═══════════════════════════════════════════════════════════════════════
-- This table is append-only. Completions are canonical truth and must never be modified.
-- All derived metrics (streaks, consistency %, badges) are calculated FROM this table.
-- Allowing UPDATE/DELETE would corrupt historical data and break trust.

CREATE OR REPLACE FUNCTION prevent_subtask_completion_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'subtask_completions is append-only. Cannot UPDATE or DELETE completion events. This is canonical truth for all progress metrics.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_update_subtask_completions
  BEFORE UPDATE ON subtask_completions
  FOR EACH ROW EXECUTE FUNCTION prevent_subtask_completion_modification();

CREATE TRIGGER prevent_delete_subtask_completions
  BEFORE DELETE ON subtask_completions
  FOR EACH ROW EXECUTE FUNCTION prevent_subtask_completion_modification();

-- Comments for documentation
COMMENT ON TABLE subtask_completions IS 'IMMUTABLE EVENT LOG - Canonical truth for all progress metrics. NO UPDATE/DELETE allowed.';
COMMENT ON COLUMN subtask_completions.local_date IS 'User''s local date when completed (using their timezone). Used for streaks and consistency heatmap.';
COMMENT ON COLUMN subtask_completions.completed_at IS 'UTC timestamp for audit trail. local_date is authoritative for metrics.';
COMMENT ON TRIGGER prevent_update_subtask_completions ON subtask_completions IS 'CRITICAL: Prevents data corruption. Completions are immutable historical facts.';
COMMENT ON TRIGGER prevent_delete_subtask_completions ON subtask_completions IS 'CRITICAL: Prevents data loss. All derived metrics depend on complete history.';
