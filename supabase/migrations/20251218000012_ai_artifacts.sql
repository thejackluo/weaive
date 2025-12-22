-- Migration 012: ai_artifacts (HIGH PRIORITY FOR EDITABLE AI)
-- Purpose: Store editable AI outputs (goal trees, insights, Triads)
-- Story: 0.2b - Database Schema Refinement + Critical Tables
-- Why Required: Architecture principle "Editable by default - Every AI-generated plan can be edited by users"

-- Enum for artifact types
CREATE TYPE artifact_type AS ENUM (
  'goal_tree',       -- AI-generated goal breakdown (goal + Q-goals + binds)
  'triad',           -- Tomorrow's top 3 recommended binds
  'recap',           -- Daily recap/insights after reflection
  'insight',         -- Individual insight card
  'message',         -- Chat message response
  'weekly_summary'   -- Weekly pattern analysis
);

-- AI artifacts table
CREATE TABLE ai_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES ai_runs(id) ON DELETE CASCADE,  -- Which AI run generated this
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type artifact_type NOT NULL,
  json JSONB NOT NULL,  -- Schema-validated AI output (structure depends on type)
  is_user_edited BOOLEAN DEFAULT FALSE,  -- Did user modify AI's output?
  edit_count INT DEFAULT 0,  -- How many times user edited this
  supersedes_id UUID REFERENCES ai_artifacts(id) ON DELETE SET NULL,  -- If this is v2 of another artifact
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()  -- Last edit timestamp
);

-- Indexes
CREATE INDEX idx_ai_artifacts_user_type ON ai_artifacts(user_id, type, created_at DESC);
CREATE INDEX idx_ai_artifacts_run ON ai_artifacts(run_id);
CREATE INDEX idx_ai_artifacts_supersedes ON ai_artifacts(supersedes_id) WHERE supersedes_id IS NOT NULL;

-- Comments for documentation
COMMENT ON TABLE ai_artifacts IS 'Editable AI outputs. Users can modify any AI suggestion. Tracks edit history and versions.';
COMMENT ON COLUMN ai_artifacts.json IS 'Structure varies by type. goal_tree: {goal, qgoals[], binds[]}. insight: {text, category, helpful_score}.';
COMMENT ON COLUMN ai_artifacts.is_user_edited IS 'True if user modified AI output. Used for feedback loop - what do users change most?';
COMMENT ON COLUMN ai_artifacts.edit_count IS 'Number of times user edited. High count = AI needs improvement for this artifact type.';
COMMENT ON COLUMN ai_artifacts.supersedes_id IS 'If AI regenerated artifact, this points to previous version. Enables version history.';

-- Example JSON structures for reference:
COMMENT ON COLUMN ai_artifacts.type IS 'goal_tree: {goal: {title, description}, qgoals: [{metric, target}], binds: [{title, frequency}]}
insight: {text: "You skip gym on Fridays", category: "pattern", helpful: null}
triad: {tasks: [{rank: 1, title: "Morning run", rationale: "You feel great after"}]}
message: {text: "Based on your Dream Self...", context_used: ["goals", "recent_completions"]}';
