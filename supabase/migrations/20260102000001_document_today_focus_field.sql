-- Migration: Document today_focus field in default_responses JSONB
-- Created: 2026-01-02
-- Updates schema comment to reflect new today_focus field for manual daily focus edits

-- Update comment to document all three fields in default_responses
COMMENT ON COLUMN journal_entries.default_responses IS
  'JSONB: {today_reflection: string, tomorrow_focus: string, today_focus: string}.
   - today_reflection: User''s reflection on today (Story 4.1)
   - tomorrow_focus: User''s planned focus for tomorrow (Story 4.1)
   - today_focus: Manual override of today''s focus (replaces yesterday''s tomorrow_focus)';

-- No ALTER TABLE needed - JSONB already supports arbitrary keys
-- This migration only updates documentation for clarity
