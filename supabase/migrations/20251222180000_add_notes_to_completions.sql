-- Add notes column to subtask_completions for optional completion notes
-- Story: Thread Flow - Users want to add context/proof when completing binds

ALTER TABLE subtask_completions
ADD COLUMN notes TEXT;

COMMENT ON COLUMN subtask_completions.notes IS 'Optional notes/context about the completion (e.g., "Ran 5k in 30min", "Finished Chapter 3")';
