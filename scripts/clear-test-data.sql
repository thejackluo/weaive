-- Clear Test User Data (Run in Supabase SQL Editor)
-- User: test.weave@anthropic.com
-- Profile ID: a6fcb84c-2fa6-4ba9-a621-3a6d74f98009
--
-- This bypasses RLS policies and append-only triggers with admin privileges
--
-- Steps:
-- 1. Go to: https://supabase.com/dashboard/project/jywfusrgwybljusuofnp/sql/new
-- 2. Copy-paste this entire file
-- 3. Click "Run"
-- 4. Refresh your mobile app

DO $$
DECLARE
    test_profile_id UUID := 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009';
    deleted_count INT;
BEGIN
    RAISE NOTICE '🧹 Clearing test user data for profile: %', test_profile_id;

    -- 1. Daily aggregates
    DELETE FROM daily_aggregates WHERE user_id = test_profile_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '  ✓ Cleared % daily_aggregates', deleted_count;

    -- 2. Journal entries
    DELETE FROM journal_entries WHERE user_id = test_profile_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '  ✓ Cleared % journal_entries', deleted_count;

    -- 3. AI artifacts
    DELETE FROM ai_artifacts WHERE user_id = test_profile_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '  ✓ Cleared % ai_artifacts', deleted_count;

    -- 4. AI runs
    DELETE FROM ai_runs WHERE user_id = test_profile_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '  ✓ Cleared % ai_runs', deleted_count;

    -- 5. Triad tasks (if table exists)
    BEGIN
        DELETE FROM triad_tasks WHERE user_id = test_profile_id;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE '  ✓ Cleared % triad_tasks', deleted_count;
    EXCEPTION WHEN undefined_table THEN
        RAISE NOTICE '  ⚠️  triad_tasks table does not exist (skipped)';
    END;

    -- 6. Captures (references subtask_instances)
    DELETE FROM captures WHERE user_id = test_profile_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '  ✓ Cleared % captures', deleted_count;

    -- 7. Subtask completions (ADMIN ACCESS BYPASSES append-only trigger)
    DELETE FROM subtask_completions WHERE user_id = test_profile_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '  ✓ Cleared % subtask_completions (bypassed append-only trigger)', deleted_count;

    -- 8. Subtask instances
    DELETE FROM subtask_instances WHERE user_id = test_profile_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '  ✓ Cleared % subtask_instances', deleted_count;

    -- 9. Subtask templates (cascade from goals)
    DELETE FROM subtask_templates WHERE goal_id IN (
        SELECT id FROM goals WHERE user_id = test_profile_id
    );
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '  ✓ Cleared % subtask_templates', deleted_count;

    -- 10. Goals
    DELETE FROM goals WHERE user_id = test_profile_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '  ✓ Cleared % goals', deleted_count;

    -- 11. Identity docs (optional)
    DELETE FROM identity_docs WHERE user_id = test_profile_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '  ✓ Cleared % identity_docs', deleted_count;

    RAISE NOTICE '';
    RAISE NOTICE '✅ All test data cleared successfully!';
    RAISE NOTICE '📋 User profile remains intact for testing';
END $$;
