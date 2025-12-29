-- ============================================================================
-- Test Scenario: Add Goal with 7-Day Completion History
-- ============================================================================
-- Creates a goal with daily subtask and 5/7 completions (71% consistency)
-- Use this to test heat maps and consistency visualization
-- ============================================================================

-- Step 1: Create a goal
WITH new_goal AS (
  INSERT INTO goals (id, user_id, title, description, status, target_date)
  VALUES (
    gen_random_uuid(),
    'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009',
    'Morning Workout',
    'Exercise daily to build consistency',
    'active',
    (CURRENT_DATE + INTERVAL '10 days')::date
  )
  RETURNING id, title
)
SELECT id as goal_id, title FROM new_goal;

-- ⚠️  IMPORTANT: Copy the goal_id from the result above
-- Then run the rest of this script, replacing 'YOUR_GOAL_ID' with the actual UUID

-- Step 2: Create a daily subtask
WITH new_template AS (
  INSERT INTO subtask_templates (id, goal_id, title, description, category, recurrence_pattern)
  VALUES (
    gen_random_uuid(),
    'YOUR_GOAL_ID',  -- ← REPLACE THIS
    'Exercise for 30 min',
    'Cardio or strength training',
    'habit',
    'daily'
  )
  RETURNING id, title
)
SELECT id as template_id, title FROM new_template;

-- ⚠️  IMPORTANT: Copy the template_id from the result above
-- Replace 'YOUR_TEMPLATE_ID' below

-- Step 3: Create instances for past 7 days
WITH new_instances AS (
  INSERT INTO subtask_instances (id, user_id, template_id, instance_date, status)
  SELECT
    gen_random_uuid(),
    'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009',
    'YOUR_TEMPLATE_ID',  -- ← REPLACE THIS
    (CURRENT_DATE - i)::date,
    'pending'
  FROM generate_series(0, 6) AS i
  RETURNING id, instance_date
)
SELECT * FROM new_instances ORDER BY instance_date;

-- Step 4: Mark 5 out of 7 days as completed (skip day 2 and day 5)
ALTER TABLE subtask_completions DISABLE TRIGGER USER;

INSERT INTO subtask_completions (id, user_id, subtask_instance_id, completed_at, local_date, was_today, timer_seconds, proof_type)
SELECT
  gen_random_uuid(),
  'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009',
  si.id,
  (si.instance_date || ' 08:00:00')::timestamp,
  si.instance_date,
  false,
  1800,  -- 30 minutes
  'timer'
FROM subtask_instances si
WHERE si.user_id = 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009'
  AND si.template_id = 'YOUR_TEMPLATE_ID'  -- ← REPLACE THIS
  AND si.instance_date >= CURRENT_DATE - 6
  AND si.instance_date NOT IN (CURRENT_DATE - 2, CURRENT_DATE - 5);  -- Skip 2 days

ALTER TABLE subtask_completions ENABLE TRIGGER USER;

-- Step 5: Verify
SELECT
  'Created goal with 5/7 completions (71% consistency)' as status,
  COUNT(*) as total_completions
FROM subtask_completions
WHERE user_id = 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009'
  AND local_date >= CURRENT_DATE - 6;
