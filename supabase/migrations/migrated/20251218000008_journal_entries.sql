-- Migration 008: journal_entries
-- Purpose: Daily reflection/journal entries with fulfillment scores
-- Story: 0.2a - Database Schema (Core Tables)
-- UI: Daily Reflection - triggers AI feedback and next day's Triad generation

CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  local_date DATE NOT NULL,  -- User's local date for this journal entry
  fulfillment_score INT CHECK (fulfillment_score >= 1 AND fulfillment_score <= 10),
  text TEXT NOT NULL,  -- User's reflection text
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),  -- Allows user to edit their reflection

  -- ONE journal per user per day
  UNIQUE(user_id, local_date)
);

-- Indexes
CREATE INDEX idx_journal_entries_user_date ON journal_entries(user_id, local_date DESC);

-- Comments for documentation
COMMENT ON TABLE journal_entries IS 'Daily reflections. One per user per day (UNIQUE constraint). Triggers AI batch: feedback + Triad generation.';
COMMENT ON COLUMN journal_entries.local_date IS 'User''s local date. UNIQUE with user_id - users can only have one journal per day.';
COMMENT ON COLUMN journal_entries.fulfillment_score IS 'Daily fulfillment rating 1-10. Used for trend chart and pattern detection.';
COMMENT ON COLUMN journal_entries.text IS 'User''s reflection text. Can include default + custom questions. Editable (uses updated_at).';
COMMENT ON CONSTRAINT journal_entries_user_id_local_date_key ON journal_entries IS 'BUSINESS RULE: One journal per user per day. Use UPDATE for edits, not INSERT.';
