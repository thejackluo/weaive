-- Temporarily bypass immutability protections for testing
-- WARNING: Only use in development/testing environments

BEGIN;

-- Disable triggers
ALTER TABLE subtask_completions DISABLE TRIGGER prevent_update_subtask_completions;
ALTER TABLE subtask_completions DISABLE TRIGGER prevent_delete_subtask_completions;

-- Delete the most recent completion
DELETE FROM subtask_completions
WHERE id = (
  SELECT id FROM subtask_completions
  ORDER BY completed_at DESC
  LIMIT 1
)
RETURNING id, subtask_instance_id, completed_at;

-- Re-enable triggers
ALTER TABLE subtask_completions ENABLE TRIGGER prevent_update_subtask_completions;
ALTER TABLE subtask_completions ENABLE TRIGGER prevent_delete_subtask_completions;

COMMIT;

SELECT 'Completion cleared successfully for testing' as status;
