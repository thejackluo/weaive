-- Migration 009: daily_aggregates (CRITICAL FOR PERFORMANCE)
-- Purpose: Pre-computed daily stats for dashboard performance (<10ms target)
-- Story: 0.2b - Database Schema Refinement + Critical Tables
-- Why Required: Dashboard queries would take 200ms+ without this table

CREATE TABLE daily_aggregates (
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  local_date DATE NOT NULL,

  -- Completion metrics
  completed_count INT DEFAULT 0,  -- Number of binds completed this day
  planned_count INT DEFAULT 0,  -- Number of binds scheduled for this day

  -- Content metrics
  has_journal BOOLEAN DEFAULT FALSE,  -- Did user complete daily reflection?
  has_proof BOOLEAN DEFAULT FALSE,  -- Did user attach proof/capture to any bind?
  capture_count INT DEFAULT 0,  -- Total captures for the day

  -- North Star metric
  active_day_with_proof BOOLEAN DEFAULT FALSE,  -- ≥1 bind completed + (proof OR journal)

  -- Timestamps
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (user_id, local_date)
);

-- Indexes - CRITICAL for dashboard performance
CREATE INDEX idx_daily_aggregates_user_date ON daily_aggregates(user_id, local_date DESC);
CREATE INDEX idx_daily_aggregates_active_days ON daily_aggregates(user_id, local_date) WHERE active_day_with_proof = TRUE;

-- Comments for documentation
COMMENT ON TABLE daily_aggregates IS 'Pre-computed daily stats. Dramatically improves dashboard performance from 200ms+ to <10ms.';
COMMENT ON COLUMN daily_aggregates.active_day_with_proof IS 'NORTH STAR METRIC: User completed ≥1 bind AND (logged memory/proof OR journal). Tracks meaningful engagement.';
COMMENT ON COLUMN daily_aggregates.completed_count IS 'Count from subtask_completions for this user_id + local_date. Updated on bind completion.';
COMMENT ON COLUMN daily_aggregates.has_journal IS 'True if journal_entries exists for this user_id + local_date. Updated on journal submission.';
COMMENT ON COLUMN daily_aggregates.has_proof IS 'True if any captures linked to binds completed today. Updated on capture creation.';
