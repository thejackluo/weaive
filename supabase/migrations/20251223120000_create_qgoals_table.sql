-- Story 2.3: Create Q-Goals (Milestones) Table
-- Quantifiable targets within a goal
-- Date: 2025-12-23

-- ============================================================================
-- Q-Goals Table
-- ============================================================================
-- Purpose: Store quantifiable milestones for goals (e.g., "Reach 180 lbs", "Save $5,000")
-- Pattern: Mutable records with updated_at trigger
-- RLS: User can only access their own qgoals

CREATE TABLE qgoals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  metric_name VARCHAR(100),  -- e.g., "weight", "revenue", "miles_run"
  target_value DECIMAL(10, 2),  -- e.g., 180.0
  current_value DECIMAL(10, 2) DEFAULT 0,  -- e.g., 185.0
  unit VARCHAR(50),  -- e.g., "lbs", "USD", "miles"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================
-- Pattern: auth.uid() → user_profiles.auth_user_id → user_profiles.id
-- User can only access their own qgoals

ALTER TABLE qgoals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_qgoals" ON qgoals
    FOR ALL
    USING (user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    ));

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX idx_qgoals_goal_id ON qgoals(goal_id);
CREATE INDEX idx_qgoals_user_id ON qgoals(user_id);
CREATE INDEX idx_qgoals_user_goal ON qgoals(user_id, goal_id);

-- ============================================================================
-- Triggers
-- ============================================================================

-- Updated_at trigger (use existing function from previous migrations)
CREATE TRIGGER update_qgoals_updated_at
    BEFORE UPDATE ON qgoals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE qgoals IS 'Quantifiable milestones within goals (e.g., weight targets, savings goals)';
COMMENT ON COLUMN qgoals.metric_name IS 'Name of the metric being tracked (e.g., weight, revenue)';
COMMENT ON COLUMN qgoals.target_value IS 'Target value to achieve';
COMMENT ON COLUMN qgoals.current_value IS 'Current progress toward target';
COMMENT ON COLUMN qgoals.unit IS 'Unit of measurement (e.g., lbs, USD, miles)';
