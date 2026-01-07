-- Migration: Fix CASCADE delete for user_profiles using trigger
-- Purpose: Ensure user_profiles are deleted when auth.users are deleted
--          BUT prevent cascade to append-only tables
-- Date: 2026-01-07
-- Method: Trigger-based (no column type changes needed)

-- ============================================================================
-- STEP 1: Fix foreign keys on append-only tables (NO CASCADE)
-- ============================================================================
-- Problem: When we delete subtask_instances, it tries to CASCADE delete
-- subtask_completions, which is blocked by trigger.
-- Solution: Change FK to RESTRICT so deletion is blocked if completions exist.

-- Fix subtask_completions.subtask_instance_id FK (should be RESTRICT not CASCADE)
DO $$
BEGIN
    -- Drop existing constraint if it has CASCADE
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'subtask_completions_subtask_instance_id_fkey'
        AND table_name = 'subtask_completions'
    ) THEN
        ALTER TABLE public.subtask_completions
            DROP CONSTRAINT subtask_completions_subtask_instance_id_fkey;
        RAISE NOTICE '[OK] Dropped existing FK on subtask_completions';
    END IF;

    -- Recreate with RESTRICT (prevents deletion of parent if children exist)
    ALTER TABLE public.subtask_completions
        ADD CONSTRAINT subtask_completions_subtask_instance_id_fkey
        FOREIGN KEY (subtask_instance_id)
        REFERENCES public.subtask_instances(id)
        ON DELETE RESTRICT;

    RAISE NOTICE '[OK] Recreated FK with RESTRICT (no cascade to completions)';
END $$;

-- ============================================================================
-- STEP 2: Clean up orphaned profiles (now safe from cascade issues)
-- ============================================================================

DO $$
DECLARE
    orphaned_count INTEGER;
BEGIN
    -- Count orphaned profiles
    SELECT COUNT(*) INTO orphaned_count
    FROM public.user_profiles
    WHERE auth_user_id NOT IN (SELECT id::text FROM auth.users);

    RAISE NOTICE '[INFO] Found % orphaned profiles to clean up', orphaned_count;

    -- Clean up in order (children first)
    DELETE FROM public.ai_artifacts
    WHERE user_id IN (
        SELECT id FROM public.user_profiles
        WHERE auth_user_id NOT IN (SELECT id::text FROM auth.users)
    );

    DELETE FROM public.ai_runs
    WHERE user_id IN (
        SELECT id FROM public.user_profiles
        WHERE auth_user_id NOT IN (SELECT id::text FROM auth.users)
    );

    DELETE FROM public.triad_tasks
    WHERE user_id IN (
        SELECT id FROM public.user_profiles
        WHERE auth_user_id NOT IN (SELECT id::text FROM auth.users)
    );

    DELETE FROM public.daily_aggregates
    WHERE user_id IN (
        SELECT id FROM public.user_profiles
        WHERE auth_user_id NOT IN (SELECT id::text FROM auth.users)
    );

    -- Delete templates that have no instances
    DELETE FROM public.subtask_templates
    WHERE user_id IN (
        SELECT id FROM public.user_profiles
        WHERE auth_user_id NOT IN (SELECT id::text FROM auth.users)
    )
    AND id NOT IN (
        SELECT DISTINCT template_id FROM public.subtask_instances
        WHERE template_id IS NOT NULL
    );

    -- Delete instances that have NO completions
    DELETE FROM public.subtask_instances
    WHERE user_id IN (
        SELECT id FROM public.user_profiles
        WHERE auth_user_id NOT IN (SELECT id::text FROM auth.users)
    )
    AND id NOT IN (
        SELECT DISTINCT subtask_instance_id FROM public.subtask_completions
        WHERE subtask_instance_id IS NOT NULL
    );

    DELETE FROM public.goals
    WHERE user_id IN (
        SELECT id FROM public.user_profiles
        WHERE auth_user_id NOT IN (SELECT id::text FROM auth.users)
    );

    DELETE FROM public.identity_docs
    WHERE user_id IN (
        SELECT id FROM public.user_profiles
        WHERE auth_user_id NOT IN (SELECT id::text FROM auth.users)
    );

    -- Delete orphaned profiles (keep those that have completions)
    DELETE FROM public.user_profiles
    WHERE auth_user_id NOT IN (SELECT id::text FROM auth.users)
    AND id NOT IN (
        SELECT DISTINCT user_id FROM public.subtask_completions
        WHERE user_id IS NOT NULL
    );

    RAISE NOTICE '[OK] Cleaned up orphaned profiles (some may remain with completions)';
END $$;

-- ============================================================================
-- STEP 3: Create trigger function for CASCADE delete
-- ============================================================================
-- This trigger will automatically delete user_profiles when auth.users is deleted
-- Without needing to change auth_user_id column type

-- Drop existing trigger and function if they exist
DO $$
BEGIN
    DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
    DROP FUNCTION IF EXISTS cleanup_user_profile();

    RAISE NOTICE '[OK] Dropped existing trigger/function if present';
END $$;

-- Create trigger function
CREATE OR REPLACE FUNCTION cleanup_user_profile()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Delete user_profile when auth.users row is deleted
    DELETE FROM public.user_profiles WHERE auth_user_id = OLD.id::text;

    RAISE NOTICE '[OK] Deleted user_profile for auth_user_id: %', OLD.id::text;
    RETURN OLD;
END;
$$;

-- Attach trigger to auth.users table
DO $$
BEGIN
    CREATE TRIGGER on_auth_user_deleted
        BEFORE DELETE ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION cleanup_user_profile();

    RAISE NOTICE '[OK] Created trigger on auth.users to auto-delete user_profiles';
END $$;

-- ============================================================================
-- STEP 4: Verify it worked
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.triggers
        WHERE trigger_name = 'on_auth_user_deleted'
        AND event_object_schema = 'auth'
        AND event_object_table = 'users'
    ) THEN
        RAISE NOTICE '[SUCCESS] Trigger-based CASCADE delete is enabled!';
        RAISE NOTICE '[INFO] Future auth.users deletions will auto-delete user_profiles';
    ELSE
        RAISE WARNING '[WARN] Could not verify trigger creation';
    END IF;
END $$;
