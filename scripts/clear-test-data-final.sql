-- ============================================================================
-- FINAL SOLUTION - Disable USER Triggers Only (not system triggers)
-- ============================================================================
-- System triggers (FK constraints) stay enabled, user triggers (append-only) disabled
-- ============================================================================

-- Step 1: Disable USER triggers on subtask_completions (excludes system FK triggers)
ALTER TABLE subtask_completions DISABLE TRIGGER USER;

-- Step 2: Delete data from all tables
DELETE FROM analytics_events
WHERE user_id = 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009';

DELETE FROM daily_aggregates
WHERE user_id = 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009';

DELETE FROM journal_entries
WHERE user_id = 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009';

DELETE FROM ai_artifacts
WHERE user_id = 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009';

DELETE FROM ai_runs
WHERE user_id = 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009';

DELETE FROM triad_tasks
WHERE user_id = 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009';

DELETE FROM captures
WHERE user_id = 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009';

-- NOW SAFE: Delete completions (user triggers disabled, FK constraints still enforced)
DELETE FROM subtask_completions
WHERE user_id = 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009';

DELETE FROM subtask_instances
WHERE user_id = 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009';

DELETE FROM subtask_templates
WHERE goal_id IN (
  SELECT id FROM goals
  WHERE user_id = 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009'
);

DELETE FROM goals
WHERE user_id = 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009';

DELETE FROM identity_docs
WHERE user_id = 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009';

-- Step 3: Re-enable USER triggers (restore append-only protection)
ALTER TABLE subtask_completions ENABLE TRIGGER USER;

-- Step 4: Update user profile timestamp
UPDATE user_profiles
SET updated_at = NOW()
WHERE id = 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009';

-- Step 5: Verify deletion
SELECT
  'SUCCESS: All test data cleared!' as status,
  NOW() as timestamp,
  (SELECT COUNT(*) FROM subtask_completions WHERE user_id = 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009') as remaining_completions,
  (SELECT COUNT(*) FROM daily_aggregates WHERE user_id = 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009') as remaining_aggregates,
  (SELECT COUNT(*) FROM journal_entries WHERE user_id = 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009') as remaining_journals;
