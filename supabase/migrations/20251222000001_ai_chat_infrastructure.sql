-- Migration: AI Chat Infrastructure (Story 6.1)
-- Purpose: AI chat interface with server-initiated conversations and tiered rate limiting
-- Created: 2025-12-22

-- ============================================================
-- PART 1: AI Chat Conversations Table
-- ============================================================
-- Tracks conversation threads (user-initiated or server-initiated)

CREATE TABLE IF NOT EXISTS ai_chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Conversation metadata
  initiated_by TEXT CHECK (initiated_by IN ('user', 'system')), -- Track who started conversation
  conversation_context JSONB, -- Store context like active goals, recent completions

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE ai_chat_conversations IS 'AI chat conversation threads (user or server-initiated)';
COMMENT ON COLUMN ai_chat_conversations.initiated_by IS 'Who started the conversation: user or system (server check-in)';
COMMENT ON COLUMN ai_chat_conversations.conversation_context IS 'Contextual data: active goals, recent completions, etc.';

-- ============================================================
-- PART 2: AI Chat Messages Table
-- ============================================================
-- Individual messages within conversations

CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_chat_conversations(id) ON DELETE CASCADE,

  -- Message content
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,

  -- Cost tracking
  tokens_used INT, -- For cost tracking

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE ai_chat_messages IS 'Individual messages within AI chat conversations';
COMMENT ON COLUMN ai_chat_messages.role IS 'Message role: user, assistant (AI), or system';
COMMENT ON COLUMN ai_chat_messages.tokens_used IS 'Total tokens used (input + output) for cost tracking';

-- ============================================================
-- PART 3: Indexes for Performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_ai_chat_conversations_user ON ai_chat_conversations(user_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_chat_conversations_initiated ON ai_chat_conversations(initiated_by) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_conversation ON ai_chat_messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_role ON ai_chat_messages(role) WHERE deleted_at IS NULL;

-- ============================================================
-- PART 4: User Profile Columns - Check-In Preferences
-- ============================================================
-- Hybrid timing system: base time with optional 10-15 min variation

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS checkin_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS checkin_timezone TEXT DEFAULT 'America/Los_Angeles',
ADD COLUMN IF NOT EXISTS checkin_deterministic BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_checkin_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN user_profiles.checkin_enabled IS 'Whether user wants server-initiated check-ins (default: true)';
COMMENT ON COLUMN user_profiles.checkin_timezone IS 'User timezone for check-in scheduling (IANA format)';
COMMENT ON COLUMN user_profiles.checkin_deterministic IS 'If true: exact same time daily. If false: ±10-15 min variation (default)';
COMMENT ON COLUMN user_profiles.last_checkin_at IS 'Timestamp of last server-initiated check-in (for debugging/rate limiting)';

-- ============================================================
-- PART 5: User Profile Columns - Tiered Rate Limiting
-- ============================================================
-- Tracks AI usage across ALL services (chat, Triad, journal, etc.)
-- Free tier: 10 premium + 40 free messages per day, 500/month cap
-- Pro tier: 2,500-5,000 messages/month

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS ai_premium_messages_today INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_free_messages_today INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_messages_this_month INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_messages_month_reset DATE DEFAULT CURRENT_DATE;

COMMENT ON COLUMN user_profiles.ai_premium_messages_today IS 'Premium model calls today (Claude Sonnet). Resets midnight user timezone.';
COMMENT ON COLUMN user_profiles.ai_free_messages_today IS 'Free model calls today (Haiku, GPT-4o-mini). Resets midnight user timezone.';
COMMENT ON COLUMN user_profiles.ai_messages_this_month IS 'Total AI messages this month (all models). Monthly cap enforcement.';
COMMENT ON COLUMN user_profiles.ai_messages_month_reset IS 'Date of last monthly reset. Used to trigger monthly counter reset on 1st.';

-- ============================================================
-- PART 6: Row Level Security (RLS)
-- ============================================================

-- Enable RLS on new tables
ALTER TABLE ai_chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own conversations
CREATE POLICY "users_manage_own_conversations" ON ai_chat_conversations
    FOR ALL
    USING (user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    ))
    WITH CHECK (user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    ));

-- Policy: Users can only access messages from their own conversations
CREATE POLICY "users_manage_own_messages" ON ai_chat_messages
    FOR ALL
    USING (conversation_id IN (
        SELECT id FROM ai_chat_conversations
        WHERE user_id IN (
            SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
        )
    ))
    WITH CHECK (conversation_id IN (
        SELECT id FROM ai_chat_conversations
        WHERE user_id IN (
            SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
        )
    ));

-- ============================================================
-- PART 7: Reset Functions (Daily & Monthly)
-- ============================================================

-- Function: Reset daily AI counters at midnight user timezone
CREATE OR REPLACE FUNCTION reset_daily_ai_counters()
RETURNS void AS $$
BEGIN
    UPDATE user_profiles
    SET ai_premium_messages_today = 0,
        ai_free_messages_today = 0
    WHERE ai_premium_messages_today > 0 OR ai_free_messages_today > 0;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION reset_daily_ai_counters IS 'Resets daily AI message counters at midnight. Called by backend cron job per-user timezone.';

-- Function: Reset monthly AI counter on 1st of month
CREATE OR REPLACE FUNCTION reset_monthly_ai_counters()
RETURNS void AS $$
BEGIN
    UPDATE user_profiles
    SET ai_messages_this_month = 0,
        ai_messages_month_reset = CURRENT_DATE
    WHERE EXTRACT(DAY FROM CURRENT_DATE) = 1
      AND ai_messages_month_reset < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION reset_monthly_ai_counters IS 'Resets monthly AI message counter on 1st of month. Called by backend cron job.';

-- Function: Atomically increment AI usage counters
CREATE OR REPLACE FUNCTION increment_ai_usage(
    p_user_id UUID,
    p_premium BOOLEAN
)
RETURNS void AS $$
BEGIN
    IF p_premium THEN
        -- Increment premium counter + monthly counter
        UPDATE user_profiles
        SET ai_premium_messages_today = ai_premium_messages_today + 1,
            ai_messages_this_month = ai_messages_this_month + 1
        WHERE id = p_user_id;
    ELSE
        -- Increment free counter + monthly counter
        UPDATE user_profiles
        SET ai_free_messages_today = ai_free_messages_today + 1,
            ai_messages_this_month = ai_messages_this_month + 1
        WHERE id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment_ai_usage IS 'Atomically increments AI usage counters after successful AI call. Called by TieredRateLimiter.';
