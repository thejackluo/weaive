-- Migration: analytics_events
-- Purpose: Track user analytics events for product insights
-- Story: 1.1 - Welcome & Vision Hook (Analytics tracking)

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,  -- Nullable for pre-auth events
  event_name TEXT NOT NULL,                                     -- e.g., 'onboarding_started', 'auth_completed'
  event_data JSONB DEFAULT '{}'::jsonb,                        -- Flexible metadata storage
  session_id TEXT,                                              -- Optional session tracking
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),                 -- When event occurred
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id) WHERE session_id IS NOT NULL;

-- Composite index for common query pattern: events by user over time
CREATE INDEX idx_analytics_events_user_time ON analytics_events(user_id, timestamp DESC);

-- Comments for documentation
COMMENT ON TABLE analytics_events IS 'Stores user analytics events for product insights and funnel analysis';
COMMENT ON COLUMN analytics_events.user_id IS 'Optional - NULL for pre-authentication events';
COMMENT ON COLUMN analytics_events.event_name IS 'Event identifier (e.g., onboarding_started, auth_completed)';
COMMENT ON COLUMN analytics_events.event_data IS 'JSONB for flexible metadata (device_type, os_version, etc.)';
COMMENT ON COLUMN analytics_events.timestamp IS 'When the event occurred (client-provided or server time)';
