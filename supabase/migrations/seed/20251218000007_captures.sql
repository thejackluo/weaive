-- Migration 007: captures
-- Purpose: Store proof/memory captures (photos, notes, audio, timers, links)
-- Story: 0.2a - Database Schema (Core Tables)
-- UI: Quick Capture, Proof attachments after bind completion

-- Enum for capture types
CREATE TYPE capture_type AS ENUM ('text', 'photo', 'audio', 'timer', 'link');

-- Captures table
CREATE TABLE captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type capture_type NOT NULL,
  content_text TEXT,  -- For 'text' and 'link' types
  storage_key TEXT,  -- Supabase Storage key for 'photo' and 'audio' files
  transcript_text TEXT,  -- For 'audio' type - transcription from speech-to-text
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  subtask_instance_id UUID REFERENCES subtask_instances(id) ON DELETE SET NULL,
  local_date DATE NOT NULL,  -- User's local date when captured
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Validation constraints
  CHECK (
    (type = 'text' AND content_text IS NOT NULL) OR
    (type = 'link' AND content_text IS NOT NULL) OR
    (type IN ('photo', 'audio') AND storage_key IS NOT NULL) OR
    (type = 'timer' AND content_text IS NOT NULL)  -- Timer stores duration as text
  )
);

-- Indexes
CREATE INDEX idx_captures_user_date ON captures(user_id, local_date DESC);
CREATE INDEX idx_captures_user_date_type ON captures(user_id, local_date, type);
CREATE INDEX idx_captures_goal ON captures(goal_id);
CREATE INDEX idx_captures_subtask ON captures(subtask_instance_id);
CREATE INDEX idx_captures_type ON captures(type);

-- Comments for documentation
COMMENT ON TABLE captures IS 'Proof/memory storage for Quick Capture and bind completion proof. Links to goals/binds optionally.';
COMMENT ON COLUMN captures.type IS 'text (notes), photo (image proof), audio (voice memo), timer (pomodoro duration), link (URL)';
COMMENT ON COLUMN captures.storage_key IS 'Supabase Storage path like user_id/captures/uuid.jpg. Only for photo/audio types.';
COMMENT ON COLUMN captures.transcript_text IS 'AI-generated transcription for audio captures. Enables search and AI context.';
COMMENT ON COLUMN captures.goal_id IS 'Optional link to goal. NULL for general Quick Capture memories.';
COMMENT ON COLUMN captures.subtask_instance_id IS 'Optional link to bind. Set when capture is proof of completion.';
