-- Migration 010: triad_tasks (CRITICAL FOR REFLECTION WORKFLOW)
-- Purpose: Store AI-generated 3-task plan for tomorrow (The Triad)
-- Story: 0.2b - Database Schema Refinement + Critical Tables
-- Why Required: Without this, evening reflection workflow (Epic 4) cannot be completed

CREATE TABLE triad_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  date_for DATE NOT NULL,  -- The date this Triad is FOR (tomorrow when generated)
  rank INT NOT NULL CHECK (rank >= 1 AND rank <= 3),  -- Position in Triad: 1st, 2nd, 3rd priority
  title TEXT NOT NULL,  -- AI-generated task title (can be edited by user)
  rationale TEXT,  -- AI's reasoning: "Why this bind is recommended today"
  linked_subtask_instance_id UUID REFERENCES subtask_instances(id) ON DELETE SET NULL,  -- If Triad links to existing bind
  generated_by_run_id UUID,  -- Track which AI run created this (FK added in migration 013)
  is_user_edited BOOLEAN DEFAULT FALSE,  -- Did user modify AI's suggestion?
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- ONE Triad per user per day (3 tasks with ranks 1-3)
  UNIQUE(user_id, date_for, rank)
);

-- Indexes
CREATE INDEX idx_triad_tasks_user_date ON triad_tasks(user_id, date_for DESC);
CREATE INDEX idx_triad_tasks_run ON triad_tasks(generated_by_run_id);

-- Comments for documentation
COMMENT ON TABLE triad_tasks IS 'AI-generated top 3 recommended binds for tomorrow. Generated during evening reflection. Editable by user.';
COMMENT ON COLUMN triad_tasks.date_for IS 'The date this Triad is FOR. Generated night before (e.g., Dec 17 reflection generates Triad for Dec 18).';
COMMENT ON COLUMN triad_tasks.rank IS 'Priority order 1-3. 1 = highest priority. UNIQUE constraint ensures exactly 3 tasks per user per day.';
COMMENT ON COLUMN triad_tasks.rationale IS 'AI explanation like "You usually feel great after workouts" or "This aligns with your Dream Self goal".';
COMMENT ON COLUMN triad_tasks.linked_subtask_instance_id IS 'If Triad references existing scheduled bind. NULL if AI suggests new task.';
COMMENT ON CONSTRAINT triad_tasks_user_id_date_for_rank_key ON triad_tasks IS 'BUSINESS RULE: Exactly 3 tasks per user per day (ranks 1, 2, 3).';
