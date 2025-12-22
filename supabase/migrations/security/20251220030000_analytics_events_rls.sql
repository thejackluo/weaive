-- Migration: Add Row Level Security to analytics_events
-- Purpose: Secure analytics events table with RLS policies
-- Security: INSERT only for own events, SELECT for service role only, NO UPDATE/DELETE (immutable)
-- Story: Security fixes from code review

-- Enable RLS on analytics_events table
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can INSERT their own analytics events
-- Allows authenticated users to log events with their user_id
-- Also allows pre-auth events with NULL user_id (for onboarding funnel tracking)
CREATE POLICY "users_insert_own_analytics" ON analytics_events
    FOR INSERT
    WITH CHECK (
        -- Allow NULL user_id for pre-auth events (anonymous tracking)
        user_id IS NULL
        OR
        -- Allow authenticated users to insert events with their own user_id
        user_id IN (
            SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
        )
    );

-- Policy 2: SELECT access restricted to service role only
-- Analytics data is internal-only (not exposed to end users via API)
-- Only backend services with service_role key can read analytics
CREATE POLICY "service_role_select_analytics" ON analytics_events
    FOR SELECT
    USING (
        -- Only allow service role (backend API with service key)
        auth.jwt() ->> 'role' = 'service_role'
    );

-- NO UPDATE OR DELETE POLICIES
-- Analytics events are immutable - no UPDATE or DELETE allowed
-- This prevents tampering with historical analytics data

-- Comments for documentation
COMMENT ON POLICY "users_insert_own_analytics" ON analytics_events IS
    'Allow users to insert their own analytics events. NULL user_id allowed for pre-auth tracking.';
COMMENT ON POLICY "service_role_select_analytics" ON analytics_events IS
    'Only service role can read analytics. End users cannot query their own analytics via RLS.';
