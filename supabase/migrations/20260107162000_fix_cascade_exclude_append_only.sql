-- Migration: Fix CASCADE delete for user_profiles
-- Purpose: Ensure user_profiles are deleted when auth.users are deleted
--          BUT prevent cascade to append-only tables
-- Date: 2026-01-07

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
-- STEP 3: Drop existing FK constraint on user_profiles.auth_user_id
-- ============================================================================

DO $$
DECLARE
    constraint_record RECORD;
    dropped_count INTEGER := 0;
BEGIN
    FOR constraint_record IN
        SELECT tc.constraint_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = 'user_profiles'
            AND kcu.column_name = 'auth_user_id'
    LOOP
        EXECUTE format('ALTER TABLE public.user_profiles DROP CONSTRAINT %I', constraint_record.constraint_name);
        RAISE NOTICE '[OK] Dropped constraint: %', constraint_record.constraint_name;
        dropped_count := dropped_count + 1;
    END LOOP;

    IF dropped_count = 0 THEN
        RAISE NOTICE '[INFO] No existing foreign key constraints found';
    END IF;
END $$;

-- ============================================================================
-- STEP 4: Migrate auth_user_id from TEXT to UUID
-- ============================================================================
-- Problem: auth_user_id is TEXT but auth.users.id is UUID
-- Solution: Convert column type to UUID for proper FK constraint

-- First, verify all existing auth_user_id values are valid UUIDs
DO $$
DECLARE
    invalid_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO invalid_count
    FROM public.user_profiles
    WHERE auth_user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

    IF invalid_count > 0 THEN
        RAISE EXCEPTION '[ERROR] Found % invalid UUID values in auth_user_id', invalid_count;
    END IF;

    RAISE NOTICE '[OK] All auth_user_id values are valid UUIDs';
END $$;

-- Convert column type from TEXT to UUID
DO $$
BEGIN
    ALTER TABLE public.user_profiles
        ALTER COLUMN auth_user_id TYPE UUID USING auth_user_id::uuid;

    RAISE NOTICE '[OK] Converted auth_user_id from TEXT to UUID';
END $$;

-- ============================================================================
-- STEP 5: Create CASCADE delete constraint
-- ============================================================================

ALTER TABLE public.user_profiles
    ADD CONSTRAINT fk_auth_user_cascade
    FOREIGN KEY (auth_user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- ============================================================================
-- STEP 6: Verify it worked
-- ============================================================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.referential_constraints
        WHERE constraint_name = 'fk_auth_user_cascade'
        AND delete_rule = 'CASCADE'
    ) THEN
        RAISE NOTICE '[SUCCESS] CASCADE delete is enabled!';
        RAISE NOTICE '[INFO] Future auth.users deletions will auto-delete user_profiles';
    ELSE
        RAISE WARNING '[WARN] Could not verify CASCADE delete';
    END IF;
END $$;
