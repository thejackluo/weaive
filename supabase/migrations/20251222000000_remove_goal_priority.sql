-- Remove goal_priority field (outdated feature)
-- Migration: 20251222000000_remove_goal_priority

-- Drop the priority column from goals table
ALTER TABLE goals DROP COLUMN IF EXISTS priority;

-- Drop the goal_priority enum type
DROP TYPE IF EXISTS goal_priority;

-- Add comment documenting removal
COMMENT ON TABLE goals IS 'User goals (needles). Priority field removed 2025-12-22 as outdated feature.';
