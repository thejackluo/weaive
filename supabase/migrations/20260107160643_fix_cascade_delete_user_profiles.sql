-- Migration: Fix CASCADE delete for user_profiles
-- Purpose: Ensure user_profiles are deleted when auth.users are deleted
-- Date: 2026-01-07

-- ============================================================================
-- STEP 1: Clean up orphaned profiles first
-- ============================================================================

-- Delete user_profiles that have no matching auth.users record
DELETE FROM public.user_profiles
WHERE auth_user_id NOT IN (
    SELECT id::text FROM auth.users
);

-- ============================================================================
-- STEP 2: Drop existing foreign key constraint (if it exists)
-- ============================================================================

-- First, check if the constraint exists and drop it
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_auth_user'
        AND table_name = 'user_profiles'
    ) THEN
        ALTER TABLE public.user_profiles DROP CONSTRAINT fk_auth_user;
        RAISE NOTICE '[OK] Dropped existing fk_auth_user constraint';
    ELSE
        RAISE NOTICE '[INFO] No existing fk_auth_user constraint found';
    END IF;
END $$;

-- Also check for any other foreign key constraints on auth_user_id
DO $$
DECLARE
    constraint_record RECORD;
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
    END LOOP;
END $$;

-- ============================================================================
-- STEP 3: Recreate foreign key with ON DELETE CASCADE
-- ============================================================================

-- Add the constraint back with proper CASCADE delete
ALTER TABLE public.user_profiles
    ADD CONSTRAINT fk_auth_user_cascade
    FOREIGN KEY (auth_user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- ============================================================================
-- STEP 4: Verify the constraint
-- ============================================================================

-- Check that the constraint was created successfully
DO $$
BEGIN
    RAISE NOTICE '[OK] Created fk_auth_user_cascade with ON DELETE CASCADE';

    IF EXISTS (
        SELECT 1 FROM information_schema.referential_constraints
        WHERE constraint_name = 'fk_auth_user_cascade'
        AND delete_rule = 'CASCADE'
    ) THEN
        RAISE NOTICE '[OK] Constraint verified - CASCADE delete is enabled';
    ELSE
        RAISE WARNING '[WARN] Could not verify CASCADE delete';
    END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- After running this migration, you can verify with:
-- SELECT tc.constraint_name, tc.table_name, rc.delete_rule
-- FROM information_schema.table_constraints AS tc
-- JOIN information_schema.referential_constraints AS rc
--     ON tc.constraint_name = rc.constraint_name
-- WHERE tc.table_name = 'user_profiles' AND tc.constraint_type = 'FOREIGN KEY';
