-- Clear all completions and captures for testing
-- WARNING: Only use in development/testing environments

BEGIN;

-- Disable triggers on subtask_completions
ALTER TABLE subtask_completions DISABLE TRIGGER prevent_update_subtask_completions;
ALTER TABLE subtask_completions DISABLE TRIGGER prevent_delete_subtask_completions;

-- Delete all captures first (no dependency from completions)
DELETE FROM captures;

-- Delete all completions
DELETE FROM subtask_completions;

-- Re-enable triggers
ALTER TABLE subtask_completions ENABLE TRIGGER prevent_update_subtask_completions;
ALTER TABLE subtask_completions ENABLE TRIGGER prevent_delete_subtask_completions;

COMMIT;

SELECT 'All completions and captures cleared successfully for testing' as status;
