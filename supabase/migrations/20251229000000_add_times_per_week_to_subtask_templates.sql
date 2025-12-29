-- Migration: Add times_per_week to subtask_templates
-- Purpose: Replace daily/weekly frequency with flexible "N times per week" (1-7)
-- Story: Weekly bind frequency with rolling 7-day windows
-- Date: 2025-12-29

-- Add times_per_week column (1-7 times per week)
ALTER TABLE subtask_templates
ADD COLUMN times_per_week INTEGER DEFAULT 7 CHECK (times_per_week >= 1 AND times_per_week <= 7);

-- Migrate existing binds:
-- - FREQ=DAILY → 7 times per week
-- - FREQ=WEEKLY → 1 time per week
UPDATE subtask_templates
SET times_per_week = 7
WHERE recurrence_rule ILIKE '%DAILY%';

UPDATE subtask_templates
SET times_per_week = 1
WHERE recurrence_rule ILIKE '%WEEKLY%';

-- Set default for any unmigrated binds
UPDATE subtask_templates
SET times_per_week = 3
WHERE times_per_week IS NULL;

-- Make column NOT NULL after migration
ALTER TABLE subtask_templates
ALTER COLUMN times_per_week SET NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN subtask_templates.times_per_week IS 'Number of times per week this bind should be completed (1-7). Uses rolling 7-day window from template creation date.';

-- Note: recurrence_rule is kept for backwards compatibility but will be deprecated
-- New binds should use times_per_week as the source of truth
