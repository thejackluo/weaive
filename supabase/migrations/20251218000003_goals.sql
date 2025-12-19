-- Migration 003: goals
-- Purpose: Store user goals (Needles in UI terminology) with max 3 active constraint
-- Story: 0.2a - Database Schema (Core Tables)
-- Critical: Max 3 active goals enforced via trigger

-- Enum types
CREATE TYPE goal_status AS ENUM ('active', 'paused', 'completed', 'archived');
CREATE TYPE goal_priority AS ENUM ('low', 'med', 'high');

-- Goals table
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status goal_status DEFAULT 'active',
  priority goal_priority DEFAULT 'med',
  start_date DATE,
  target_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (start_date IS NULL OR target_date IS NULL OR start_date <= target_date)
);

-- Indexes
CREATE INDEX idx_goals_user_status ON goals(user_id, status);
CREATE INDEX idx_goals_user_created ON goals(user_id, created_at DESC);

-- CRITICAL CONSTRAINT: Max 3 active goals per user
CREATE OR REPLACE FUNCTION check_max_active_goals()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND (
    SELECT COUNT(*) FROM goals
    WHERE user_id = NEW.user_id AND status = 'active' AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
  ) >= 3 THEN
    RAISE EXCEPTION 'User can have maximum 3 active goals. Archive or complete an existing goal first.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_max_active_goals
  BEFORE INSERT OR UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION check_max_active_goals();

-- Comments for documentation
COMMENT ON TABLE goals IS 'User goals (called Needles in UI). Max 3 active enforced via trigger.';
COMMENT ON COLUMN goals.status IS 'active (max 3), paused, completed, archived. Users primarily interact with active goals.';
COMMENT ON CONSTRAINT check_max_active_goals ON goals IS 'CRITICAL BUSINESS RULE: Users can only have 3 active goals maximum to maintain focus.';
