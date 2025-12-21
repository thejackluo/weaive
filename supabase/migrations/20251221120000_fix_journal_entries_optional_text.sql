-- Migration: Fix journal_entries text column to be optional
-- Purpose: Allow users to submit reflections with only fulfillment score (no text)
-- Story: 1.9 - First Daily Reflection (text input is optional, 50-500 chars OR empty)
-- Date: 2025-12-21
--
-- IDEMPOTENT: Safe to run multiple times (checks column existence before operations)
--
-- ROLLBACK INSTRUCTIONS:
-- To rollback this migration, run:
--   ALTER TABLE journal_entries RENAME COLUMN entry_text TO text;
--   ALTER TABLE journal_entries ALTER COLUMN text SET NOT NULL;
--   COMMENT ON COLUMN journal_entries.text IS 'Daily reflection text entry';

-- Make text column nullable (only if it exists and is NOT NULL)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'journal_entries'
      AND column_name = 'text'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE journal_entries ALTER COLUMN text DROP NOT NULL;
    RAISE NOTICE 'Dropped NOT NULL constraint from journal_entries.text';
  END IF;
END $$;

-- Rename text to entry_text (only if text column exists and entry_text doesn't)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'journal_entries' AND column_name = 'text'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'journal_entries' AND column_name = 'entry_text'
  ) THEN
    ALTER TABLE journal_entries RENAME COLUMN text TO entry_text;
    RAISE NOTICE 'Renamed journal_entries.text to entry_text';
  END IF;
END $$;

-- Update comment (safe to run multiple times)
COMMENT ON COLUMN journal_entries.entry_text IS 'Optional reflection text. Can be NULL if user only submits fulfillment score. Editable (uses updated_at).';

-- Note: The UNIQUE constraint (user_id, local_date) remains unchanged
-- Note: The fulfillment_score CHECK constraint (1-10) remains unchanged
