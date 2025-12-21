-- Migration 004: subtask_templates
-- Purpose: Reusable subtask/bind templates that can generate instances
-- Story: 0.2a - Database Schema (Core Tables)
-- UI Terminology: "Binds" - consistent daily actions toward goals

-- Enum for creator tracking
CREATE TYPE created_by_type AS ENUM ('user', 'ai');

-- Subtask templates table
CREATE TABLE subtask_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,  -- Can be unlinked if goal deleted
  title TEXT NOT NULL,
  default_estimated_minutes INT NOT NULL CHECK (default_estimated_minutes >= 0),
  difficulty INT CHECK (difficulty >= 1 AND difficulty <= 15),  -- 1=easy, 15=very hard
  recurrence_rule TEXT,  -- iCal RRULE format for recurring tasks
  is_archived BOOLEAN DEFAULT FALSE,
  created_by created_by_type DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subtask_templates_user_goal ON subtask_templates(user_id, goal_id);
CREATE INDEX idx_subtask_templates_user_archived ON subtask_templates(user_id, is_archived) WHERE is_archived = FALSE;

-- Comments for documentation
COMMENT ON TABLE subtask_templates IS 'Reusable bind templates. Can be created by user or AI. Generates subtask_instances for specific dates.';
COMMENT ON COLUMN subtask_templates.recurrence_rule IS 'iCal RRULE format (e.g., FREQ=DAILY;INTERVAL=1). Used to auto-generate instances.';
COMMENT ON COLUMN subtask_templates.difficulty IS 'Subjective difficulty 1-15. Used by AI for workload balancing when generating Triad.';
COMMENT ON COLUMN subtask_templates.created_by IS 'Tracks if user created manually or AI generated during goal breakdown.';
