-- Migration: origin_stories RLS Policies
-- Purpose: Secure origin_stories table with Row Level Security
-- Story: 1.7 - Commitment Ritual & Origin Story (Backend Integration)
-- Context: Origin stories are IMMUTABLE - users can create once but never update/delete

-- Enable RLS on origin_stories table
ALTER TABLE origin_stories ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════
-- ORIGIN_STORIES POLICIES (IMMUTABLE PATTERN)
-- ═══════════════════════════════════════════════════════════════════════
-- Pattern: SELECT + INSERT only (no UPDATE or DELETE)
-- Origin story is immutable - represents user's starting point
-- One origin story per user (enforced by UNIQUE constraint on user_id)

-- SELECT policy: Users can view their own origin story
CREATE POLICY "users_select_own_origin_story" ON origin_stories
    FOR SELECT
    USING (user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    ));

-- INSERT policy: Users can create their own origin story (once)
CREATE POLICY "users_insert_own_origin_story" ON origin_stories
    FOR INSERT
    WITH CHECK (user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    ));

-- NO UPDATE POLICY = Immutable
-- Origin story cannot be edited once created

-- NO DELETE POLICY = Permanent
-- Origin story is permanent record of user's commitment

-- ═══════════════════════════════════════════════════════════════════════
-- COMMENTS
-- ═══════════════════════════════════════════════════════════════════════

COMMENT ON POLICY "users_select_own_origin_story" ON origin_stories IS
  'Users can view their own origin story. Uses auth.uid() → user_profiles.auth_user_id → user_profiles.id lookup.';

COMMENT ON POLICY "users_insert_own_origin_story" ON origin_stories IS
  'Users can create their origin story once. UNIQUE(user_id) constraint prevents duplicates. No UPDATE/DELETE = immutable.';
