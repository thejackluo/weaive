-- Migration 005: subtask_instances
-- Purpose: Scheduled subtasks/binds for specific dates (derived from templates or ad-hoc)
-- Story: 0.2a - Database Schema (Core Tables)
-- UI: Today's Binds - this is the main list users see daily

-- Enum for instance status
CREATE TYPE subtask_status AS ENUM ('planned', 'done', 'skipped', 'snoozed');

-- Subtask instances table
CREATE TABLE subtask_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES subtask_templates(id) ON DELETE SET NULL,  -- Can be null for ad-hoc tasks
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  scheduled_for_date DATE NOT NULL,  -- The date this bind is scheduled for
  status subtask_status DEFAULT 'planned',
  completed_at TIMESTAMPTZ,  -- When user marked it done (can be different day than scheduled)
  estimated_minutes INT NOT NULL CHECK (estimated_minutes >= 0),
  actual_minutes INT CHECK (actual_minutes IS NULL OR actual_minutes >= 0),
  title_override TEXT,  -- If user edited the title for this specific instance
  notes TEXT,
  sort_order INT DEFAULT 0,  -- For user-defined ordering within a day
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (status != 'done' OR completed_at IS NOT NULL)  -- If done, must have completion time
);

-- Indexes - CRITICAL for performance (most frequent query: get today's binds)
CREATE INDEX idx_subtask_instances_user_date ON subtask_instances(user_id, scheduled_for_date);
CREATE INDEX idx_subtask_instances_user_date_status ON subtask_instances(user_id, scheduled_for_date, status);
CREATE INDEX idx_subtask_instances_template ON subtask_instances(template_id);
CREATE INDEX idx_subtask_instances_goal ON subtask_instances(goal_id);

-- Comments for documentation
COMMENT ON TABLE subtask_instances IS 'Daily scheduled binds. Query by (user_id, scheduled_for_date) for "Today''s Binds" screen.';
COMMENT ON COLUMN subtask_instances.scheduled_for_date IS 'The local date this bind is planned for (uses user timezone).';
COMMENT ON COLUMN subtask_instances.completed_at IS 'UTC timestamp when completed. May be different day than scheduled_for_date if done late.';
COMMENT ON COLUMN subtask_instances.title_override IS 'Allows user to customize bind title for this specific day without changing template.';
COMMENT ON INDEX idx_subtask_instances_user_date IS 'PRIMARY QUERY PATTERN: Get today''s binds for dashboard. Must be FAST (<50ms).';
