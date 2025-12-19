-- Migration 014: Row Level Security (RLS) Policies
-- Purpose: Implement database-level security isolation for all user-owned tables
-- Story: 0.4 - Row Level Security
-- Created: 2025-12-19

-- ═══════════════════════════════════════════════════════════════════════
-- CRITICAL SECURITY FOUNDATION
-- ═══════════════════════════════════════════════════════════════════════
-- RLS provides defense-in-depth security at the database layer.
-- Even if application layer is compromised, users CANNOT access each other's data.
--
-- Pattern: auth.uid() → user_profiles.auth_user_id → user_profiles.id → user_id
-- Why: Tables use user_profiles.id as FK (not auth.uid() directly)
-- Must cast: auth.uid()::text (UUID → TEXT) to match auth_user_id column type
-- ═══════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════
-- STEP 1: ENABLE RLS ON ALL USER-OWNED TABLES
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtask_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtask_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtask_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE captures ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE triad_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_artifacts ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════
-- STEP 2: USER_PROFILES POLICIES
-- ═══════════════════════════════════════════════════════════════════════
-- Pattern: Users can SELECT/INSERT/UPDATE their own profile
-- No DELETE policy (use soft delete with archived_at if needed)

CREATE POLICY "users_select_own_profile" ON user_profiles
    FOR SELECT
    USING (auth_user_id = auth.uid()::text);

CREATE POLICY "users_insert_own_profile" ON user_profiles
    FOR INSERT
    WITH CHECK (auth_user_id = auth.uid()::text);

CREATE POLICY "users_update_own_profile" ON user_profiles
    FOR UPDATE
    USING (auth_user_id = auth.uid()::text)
    WITH CHECK (auth_user_id = auth.uid()::text);

-- ═══════════════════════════════════════════════════════════════════════
-- STEP 3: MUTABLE USER DATA POLICIES (9 TABLES)
-- ═══════════════════════════════════════════════════════════════════════
-- Pattern: FOR ALL (SELECT/INSERT/UPDATE/DELETE)
-- Users can fully manage their own data in these tables

-- Identity Documents (archetype, dream self, motivations)
CREATE POLICY "users_manage_own_identity_docs" ON identity_docs
    FOR ALL
    USING (user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    ));

-- Goals (top-level user goals, max 3 active)
CREATE POLICY "users_manage_own_goals" ON goals
    FOR ALL
    USING (user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    ));

-- Subtask Templates (consistent habits/actions)
CREATE POLICY "users_manage_own_subtask_templates" ON subtask_templates
    FOR ALL
    USING (user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    ));

-- Subtask Instances (scheduled binds for specific dates)
CREATE POLICY "users_manage_own_subtask_instances" ON subtask_instances
    FOR ALL
    USING (user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    ));

-- Captures (photos, notes, audio proof)
CREATE POLICY "users_manage_own_captures" ON captures
    FOR ALL
    USING (user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    ));

-- Journal Entries (daily reflections)
CREATE POLICY "users_manage_own_journal_entries" ON journal_entries
    FOR ALL
    USING (user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    ));

-- Daily Aggregates (pre-computed stats)
CREATE POLICY "users_manage_own_daily_aggregates" ON daily_aggregates
    FOR ALL
    USING (user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    ));

-- Triad Tasks (AI-generated daily plans)
CREATE POLICY "users_manage_own_triad_tasks" ON triad_tasks
    FOR ALL
    USING (user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    ));

-- AI Runs (LLM operation tracking)
CREATE POLICY "users_manage_own_ai_runs" ON ai_runs
    FOR ALL
    USING (user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    ));

-- AI Artifacts (generated content)
CREATE POLICY "users_manage_own_ai_artifacts" ON ai_artifacts
    FOR ALL
    USING (user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    ));

-- ═══════════════════════════════════════════════════════════════════════
-- STEP 4: IMMUTABLE TABLE POLICY (subtask_completions)
-- ═══════════════════════════════════════════════════════════════════════
-- CRITICAL: subtask_completions is CANONICAL TRUTH (immutable event log)
-- Users can SELECT and INSERT, but NEVER UPDATE or DELETE
-- This enforces append-only behavior at database level

CREATE POLICY "users_select_own_completions" ON subtask_completions
    FOR SELECT
    USING (user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    ));

CREATE POLICY "users_insert_own_completions" ON subtask_completions
    FOR INSERT
    WITH CHECK (user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    ));

-- NO UPDATE OR DELETE POLICIES = Immutable table

-- ═══════════════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES
-- ═══════════════════════════════════════════════════════════════════════
-- Run these after migration to verify RLS is enabled:
--
-- -- Check RLS is enabled on all tables
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- AND tablename IN (
--   'user_profiles', 'identity_docs', 'goals', 'subtask_templates',
--   'subtask_instances', 'subtask_completions', 'captures', 'journal_entries',
--   'daily_aggregates', 'triad_tasks', 'ai_runs', 'ai_artifacts'
-- )
-- ORDER BY tablename;
--
-- -- List all RLS policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- ═══════════════════════════════════════════════════════════════════════
-- COMMENTS FOR DOCUMENTATION
-- ═══════════════════════════════════════════════════════════════════════

COMMENT ON POLICY "users_select_own_profile" ON user_profiles IS
  'Users can view their own profile using auth.uid() → auth_user_id lookup';

COMMENT ON POLICY "users_insert_own_profile" ON user_profiles IS
  'Users can create their own profile during onboarding';

COMMENT ON POLICY "users_update_own_profile" ON user_profiles IS
  'Users can update their own profile (display_name, timezone, etc.)';

COMMENT ON POLICY "users_select_own_completions" ON subtask_completions IS
  'Users can view their completion history';

COMMENT ON POLICY "users_insert_own_completions" ON subtask_completions IS
  'Users can create new completion events (append-only)';

-- Final note: subtask_completions has NO UPDATE/DELETE policies
-- This enforces immutability at the database layer per Architecture.md
