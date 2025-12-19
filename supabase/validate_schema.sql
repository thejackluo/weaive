-- ═══════════════════════════════════════════════════════════════════════
-- SCHEMA VALIDATION SCRIPT for Story 0.2
-- Purpose: Verify all database objects from migrations 001-013 exist and are correct
-- Story: 0.2b - Database Schema Refinement + Critical Tables (AC5)
-- Usage: psql <connection-string> -f validate_schema.sql
-- ═══════════════════════════════════════════════════════════════════════

\set ON_ERROR_STOP on

-- Create temporary table for validation results
CREATE TEMP TABLE validation_results (
  category TEXT,
  check_name TEXT,
  status TEXT,
  details TEXT
);

-- ═══════════════════════════════════════════════════════════════════════
-- SECTION 1: VALIDATE ENUMS
-- ═══════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  enum_exists BOOLEAN;
BEGIN
  -- Check goal_status enum
  SELECT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'goal_status'
  ) INTO enum_exists;

  IF enum_exists THEN
    INSERT INTO validation_results VALUES ('ENUMS', 'goal_status', '✅ PASS', 'Enum exists with values: active, completed, archived, paused');
  ELSE
    INSERT INTO validation_results VALUES ('ENUMS', 'goal_status', '❌ FAIL', 'Enum does not exist');
  END IF;

  -- Check subtask_status enum
  SELECT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'subtask_status'
  ) INTO enum_exists;

  IF enum_exists THEN
    INSERT INTO validation_results VALUES ('ENUMS', 'subtask_status', '✅ PASS', 'Enum exists with values: planned, in_progress, completed, skipped');
  ELSE
    INSERT INTO validation_results VALUES ('ENUMS', 'subtask_status', '❌ FAIL', 'Enum does not exist');
  END IF;

  -- Check capture_type enum
  SELECT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'capture_type'
  ) INTO enum_exists;

  IF enum_exists THEN
    INSERT INTO validation_results VALUES ('ENUMS', 'capture_type', '✅ PASS', 'Enum exists with values: photo, note, audio, timer');
  ELSE
    INSERT INTO validation_results VALUES ('ENUMS', 'capture_type', '❌ FAIL', 'Enum does not exist');
  END IF;

  -- Check artifact_type enum
  SELECT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'artifact_type'
  ) INTO enum_exists;

  IF enum_exists THEN
    INSERT INTO validation_results VALUES ('ENUMS', 'artifact_type', '✅ PASS', 'Enum exists with values: goal_tree, triad, recap, insight, message, weekly_summary');
  ELSE
    INSERT INTO validation_results VALUES ('ENUMS', 'artifact_type', '❌ FAIL', 'Enum does not exist');
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════
-- SECTION 2: VALIDATE TABLES
-- ═══════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  expected_tables TEXT[] := ARRAY[
    'user_profiles',
    'identity_docs',
    'goals',
    'subtask_templates',
    'subtask_instances',
    'subtask_completions',
    'captures',
    'journal_entries',
    'daily_aggregates',
    'triad_tasks',
    'ai_runs',
    'ai_artifacts'
  ];
  tbl TEXT;
  table_exists BOOLEAN;
BEGIN
  FOREACH tbl IN ARRAY expected_tables
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = tbl
    ) INTO table_exists;

    IF table_exists THEN
      INSERT INTO validation_results VALUES ('TABLES', tbl, '✅ PASS', 'Table exists');
    ELSE
      INSERT INTO validation_results VALUES ('TABLES', tbl, '❌ FAIL', 'Table does not exist');
    END IF;
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════════════
-- SECTION 3: VALIDATE CRITICAL COLUMNS
-- ═══════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  col_exists BOOLEAN;
  col_type TEXT;
  expected_type TEXT;
BEGIN
  -- user_profiles.timezone (CRITICAL - must be NOT NULL)
  SELECT
    EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'user_profiles' AND column_name = 'timezone' AND is_nullable = 'NO'
    ),
    data_type
  INTO col_exists, col_type
  FROM information_schema.columns
  WHERE table_name = 'user_profiles' AND column_name = 'timezone';

  IF col_exists THEN
    INSERT INTO validation_results VALUES ('COLUMNS', 'user_profiles.timezone NOT NULL', '✅ PASS', 'Column exists and is NOT NULL (type: ' || col_type || ')');
  ELSE
    INSERT INTO validation_results VALUES ('COLUMNS', 'user_profiles.timezone NOT NULL', '❌ FAIL', 'Column is nullable or does not exist');
  END IF;

  -- identity_docs.version (CRITICAL - for versioning)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'identity_docs' AND column_name = 'version' AND data_type = 'integer'
  ) INTO col_exists;

  IF col_exists THEN
    INSERT INTO validation_results VALUES ('COLUMNS', 'identity_docs.version', '✅ PASS', 'Column exists with correct type (integer)');
  ELSE
    INSERT INTO validation_results VALUES ('COLUMNS', 'identity_docs.version', '❌ FAIL', 'Column does not exist or wrong type');
  END IF;

  -- subtask_completions columns (IMMUTABLE table)
  SELECT COUNT(*) = 6 INTO col_exists
  FROM information_schema.columns
  WHERE table_name = 'subtask_completions'
  AND column_name IN ('id', 'user_id', 'instance_id', 'local_date', 'duration_minutes', 'completed_at');

  IF col_exists THEN
    INSERT INTO validation_results VALUES ('COLUMNS', 'subtask_completions (all 6 columns)', '✅ PASS', 'All required columns exist');
  ELSE
    INSERT INTO validation_results VALUES ('COLUMNS', 'subtask_completions (all 6 columns)', '❌ FAIL', 'Missing one or more columns');
  END IF;

  -- daily_aggregates.active_day_with_proof (North Star metric)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_aggregates' AND column_name = 'active_day_with_proof' AND data_type = 'boolean'
  ) INTO col_exists;

  IF col_exists THEN
    INSERT INTO validation_results VALUES ('COLUMNS', 'daily_aggregates.active_day_with_proof', '✅ PASS', 'North Star metric column exists');
  ELSE
    INSERT INTO validation_results VALUES ('COLUMNS', 'daily_aggregates.active_day_with_proof', '❌ FAIL', 'North Star metric column missing');
  END IF;

  -- ai_runs.input_hash (CRITICAL - for caching)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_runs' AND column_name = 'input_hash' AND data_type = 'text'
  ) INTO col_exists;

  IF col_exists THEN
    INSERT INTO validation_results VALUES ('COLUMNS', 'ai_runs.input_hash', '✅ PASS', 'Cache key column exists');
  ELSE
    INSERT INTO validation_results VALUES ('COLUMNS', 'ai_runs.input_hash', '❌ FAIL', 'Cache key column missing');
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════
-- SECTION 4: VALIDATE CONSTRAINTS
-- ═══════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  constraint_exists BOOLEAN;
BEGIN
  -- UNIQUE constraint: user_profiles.auth_user_id
  SELECT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu USING (constraint_name)
    WHERE tc.table_name = 'user_profiles'
    AND tc.constraint_type = 'UNIQUE'
    AND ccu.column_name = 'auth_user_id'
  ) INTO constraint_exists;

  IF constraint_exists THEN
    INSERT INTO validation_results VALUES ('CONSTRAINTS', 'user_profiles.auth_user_id UNIQUE', '✅ PASS', 'UNIQUE constraint exists');
  ELSE
    INSERT INTO validation_results VALUES ('CONSTRAINTS', 'user_profiles.auth_user_id UNIQUE', '❌ FAIL', 'UNIQUE constraint missing');
  END IF;

  -- UNIQUE constraint: identity_docs(user_id, version)
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname LIKE '%identity_docs%'
    AND contype = 'u'
    AND array_length(conkey, 1) = 2
  ) INTO constraint_exists;

  IF constraint_exists THEN
    INSERT INTO validation_results VALUES ('CONSTRAINTS', 'identity_docs(user_id, version) UNIQUE', '✅ PASS', 'Composite UNIQUE constraint exists');
  ELSE
    INSERT INTO validation_results VALUES ('CONSTRAINTS', 'identity_docs(user_id, version) UNIQUE', '❌ FAIL', 'Composite UNIQUE constraint missing');
  END IF;

  -- UNIQUE constraint: journal_entries(user_id, local_date)
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname LIKE '%journal_entries%'
    AND contype = 'u'
    AND array_length(conkey, 1) = 2
  ) INTO constraint_exists;

  IF constraint_exists THEN
    INSERT INTO validation_results VALUES ('CONSTRAINTS', 'journal_entries(user_id, local_date) UNIQUE', '✅ PASS', 'One journal per day constraint exists');
  ELSE
    INSERT INTO validation_results VALUES ('CONSTRAINTS', 'journal_entries(user_id, local_date) UNIQUE', '❌ FAIL', 'One journal per day constraint missing');
  END IF;

  -- CHECK constraint: journal_entries.fulfillment_score (1-10)
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname LIKE '%journal_entries%'
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%fulfillment_score%'
  ) INTO constraint_exists;

  IF constraint_exists THEN
    INSERT INTO validation_results VALUES ('CONSTRAINTS', 'journal_entries.fulfillment_score CHECK', '✅ PASS', 'CHECK constraint exists (1-10 range)');
  ELSE
    INSERT INTO validation_results VALUES ('CONSTRAINTS', 'journal_entries.fulfillment_score CHECK', '❌ FAIL', 'CHECK constraint missing');
  END IF;

  -- CHECK constraint: triad_tasks.rank (1-3)
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname LIKE '%triad_tasks%'
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%rank%'
  ) INTO constraint_exists;

  IF constraint_exists THEN
    INSERT INTO validation_results VALUES ('CONSTRAINTS', 'triad_tasks.rank CHECK', '✅ PASS', 'CHECK constraint exists (1-3 range)');
  ELSE
    INSERT INTO validation_results VALUES ('CONSTRAINTS', 'triad_tasks.rank CHECK', '❌ FAIL', 'CHECK constraint missing');
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════
-- SECTION 5: VALIDATE INDEXES (Performance Critical)
-- ═══════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  index_exists BOOLEAN;
BEGIN
  -- Index: user_profiles.auth_user_id
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'user_profiles' AND indexname LIKE '%auth%'
  ) INTO index_exists;

  IF index_exists THEN
    INSERT INTO validation_results VALUES ('INDEXES', 'idx_user_profiles_auth_id', '✅ PASS', 'Auth lookup index exists');
  ELSE
    INSERT INTO validation_results VALUES ('INDEXES', 'idx_user_profiles_auth_id', '❌ FAIL', 'Auth lookup index missing');
  END IF;

  -- Index: identity_docs(user_id, version DESC)
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'identity_docs' AND indexname LIKE '%user_version%'
  ) INTO index_exists;

  IF index_exists THEN
    INSERT INTO validation_results VALUES ('INDEXES', 'idx_identity_docs_user_version', '✅ PASS', 'Latest version lookup index exists');
  ELSE
    INSERT INTO validation_results VALUES ('INDEXES', 'idx_identity_docs_user_version', '❌ FAIL', 'Latest version lookup index missing');
  END IF;

  -- Index: subtask_instances(user_id, scheduled_for_date, status)
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'subtask_instances' AND indexname LIKE '%user_date_status%'
  ) INTO index_exists;

  IF index_exists THEN
    INSERT INTO validation_results VALUES ('INDEXES', 'idx_subtask_instances_user_date_status', '✅ PASS', 'Today''s binds query index exists');
  ELSE
    INSERT INTO validation_results VALUES ('INDEXES', 'idx_subtask_instances_user_date_status', '❌ FAIL', 'Today''s binds query index missing - CRITICAL');
  END IF;

  -- Index: subtask_completions(user_id, local_date DESC)
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'subtask_completions' AND indexname LIKE '%user_date%'
  ) INTO index_exists;

  IF index_exists THEN
    INSERT INTO validation_results VALUES ('INDEXES', 'idx_subtask_completions_user_date', '✅ PASS', 'Completion history index exists');
  ELSE
    INSERT INTO validation_results VALUES ('INDEXES', 'idx_subtask_completions_user_date', '❌ FAIL', 'Completion history index missing - CRITICAL');
  END IF;

  -- Index: subtask_completions dashboard query (with INCLUDE)
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'subtask_completions' AND indexname LIKE '%dashboard%'
  ) INTO index_exists;

  IF index_exists THEN
    INSERT INTO validation_results VALUES ('INDEXES', 'idx_subtask_completions_dashboard_query', '✅ PASS', 'Dashboard optimization index exists (INCLUDE clause)');
  ELSE
    INSERT INTO validation_results VALUES ('INDEXES', 'idx_subtask_completions_dashboard_query', '❌ FAIL', 'Dashboard optimization index missing - CRITICAL');
  END IF;

  -- Index: daily_aggregates(user_id, local_date)
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'daily_aggregates' AND indexname LIKE '%user_date%'
  ) INTO index_exists;

  IF index_exists THEN
    INSERT INTO validation_results VALUES ('INDEXES', 'idx_daily_aggregates_user_date', '✅ PASS', 'Dashboard query index exists');
  ELSE
    INSERT INTO validation_results VALUES ('INDEXES', 'idx_daily_aggregates_user_date', '❌ FAIL', 'Dashboard query index missing - CRITICAL');
  END IF;

  -- Index: ai_runs.input_hash (partial index WHERE status = 'success')
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'ai_runs' AND indexname LIKE '%input_hash%'
  ) INTO index_exists;

  IF index_exists THEN
    INSERT INTO validation_results VALUES ('INDEXES', 'idx_ai_runs_input_hash (partial)', '✅ PASS', 'AI cache lookup index exists');
  ELSE
    INSERT INTO validation_results VALUES ('INDEXES', 'idx_ai_runs_input_hash (partial)', '❌ FAIL', 'AI cache lookup index missing - CRITICAL');
  END IF;

  -- Index: goals(user_id, status, created_at DESC) WHERE status = 'active'
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'goals' AND indexname LIKE '%user_status%'
  ) INTO index_exists;

  IF index_exists THEN
    INSERT INTO validation_results VALUES ('INDEXES', 'idx_goals_user_status_created (partial)', '✅ PASS', 'Active goals partial index exists');
  ELSE
    INSERT INTO validation_results VALUES ('INDEXES', 'idx_goals_user_status_created (partial)', '❌ FAIL', 'Active goals partial index missing');
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════
-- SECTION 6: VALIDATE TRIGGERS (Business Logic Enforcement)
-- ═══════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  trigger_exists BOOLEAN;
  function_exists BOOLEAN;
BEGIN
  -- Trigger: enforce_max_active_goals (goals table)
  SELECT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'enforce_max_active_goals'
  ) INTO trigger_exists;

  SELECT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'check_max_active_goals'
  ) INTO function_exists;

  IF trigger_exists AND function_exists THEN
    INSERT INTO validation_results VALUES ('TRIGGERS', 'enforce_max_active_goals', '✅ PASS', 'Max 3 active goals trigger exists and function defined');
  ELSE
    INSERT INTO validation_results VALUES ('TRIGGERS', 'enforce_max_active_goals', '❌ FAIL', 'Max 3 active goals trigger or function missing - CRITICAL');
  END IF;

  -- Trigger: prevent_update_subtask_completions (IMMUTABLE)
  SELECT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'prevent_update_subtask_completions'
  ) INTO trigger_exists;

  SELECT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'prevent_subtask_completion_modification'
  ) INTO function_exists;

  IF trigger_exists AND function_exists THEN
    INSERT INTO validation_results VALUES ('TRIGGERS', 'prevent_update_subtask_completions', '✅ PASS', 'Immutability trigger (UPDATE) exists - CRITICAL');
  ELSE
    INSERT INTO validation_results VALUES ('TRIGGERS', 'prevent_update_subtask_completions', '❌ FAIL', 'Immutability trigger (UPDATE) missing - CRITICAL');
  END IF;

  -- Trigger: prevent_delete_subtask_completions (IMMUTABLE)
  SELECT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'prevent_delete_subtask_completions'
  ) INTO trigger_exists;

  IF trigger_exists THEN
    INSERT INTO validation_results VALUES ('TRIGGERS', 'prevent_delete_subtask_completions', '✅ PASS', 'Immutability trigger (DELETE) exists - CRITICAL');
  ELSE
    INSERT INTO validation_results VALUES ('TRIGGERS', 'prevent_delete_subtask_completions', '❌ FAIL', 'Immutability trigger (DELETE) missing - CRITICAL');
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════
-- SECTION 7: VALIDATE FOREIGN KEY RELATIONSHIPS
-- ═══════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  fk_count INT;
BEGIN
  -- Count foreign keys pointing to user_profiles (should be 11 tables)
  SELECT COUNT(*) INTO fk_count
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu USING (constraint_name)
  JOIN information_schema.constraint_column_usage ccu USING (constraint_name)
  WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'user_profiles';

  IF fk_count >= 10 THEN
    INSERT INTO validation_results VALUES ('FOREIGN_KEYS', 'References to user_profiles', '✅ PASS', fk_count || ' tables reference user_profiles (expected ~11)');
  ELSE
    INSERT INTO validation_results VALUES ('FOREIGN_KEYS', 'References to user_profiles', '❌ FAIL', 'Only ' || fk_count || ' tables reference user_profiles (expected ~11)');
  END IF;

  -- Check specific critical FK: subtask_instances -> subtask_templates
  SELECT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu USING (constraint_name)
    JOIN information_schema.constraint_column_usage ccu USING (constraint_name)
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'subtask_instances'
    AND ccu.table_name = 'subtask_templates'
  ) INTO fk_count;

  IF fk_count > 0 THEN
    INSERT INTO validation_results VALUES ('FOREIGN_KEYS', 'subtask_instances -> subtask_templates', '✅ PASS', 'FK relationship exists');
  ELSE
    INSERT INTO validation_results VALUES ('FOREIGN_KEYS', 'subtask_instances -> subtask_templates', '❌ FAIL', 'FK relationship missing - CRITICAL');
  END IF;

  -- Check specific critical FK: subtask_completions -> subtask_instances
  SELECT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu USING (constraint_name)
    JOIN information_schema.constraint_column_usage ccu USING (constraint_name)
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'subtask_completions'
    AND ccu.table_name = 'subtask_instances'
  ) INTO fk_count;

  IF fk_count > 0 THEN
    INSERT INTO validation_results VALUES ('FOREIGN_KEYS', 'subtask_completions -> subtask_instances', '✅ PASS', 'FK relationship exists (nullable)');
  ELSE
    INSERT INTO validation_results VALUES ('FOREIGN_KEYS', 'subtask_completions -> subtask_instances', '❌ FAIL', 'FK relationship missing');
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════
-- FINAL REPORT
-- ═══════════════════════════════════════════════════════════════════════

\echo ''
\echo '═══════════════════════════════════════════════════════════════════════'
\echo 'WEAVE DATABASE SCHEMA VALIDATION REPORT'
\echo 'Story 0.2: Database Schema Core + Refinement (Migrations 001-013)'
\echo '═══════════════════════════════════════════════════════════════════════'
\echo ''

-- Print results grouped by category
SELECT
  category,
  check_name,
  status,
  details
FROM validation_results
ORDER BY
  CASE category
    WHEN 'ENUMS' THEN 1
    WHEN 'TABLES' THEN 2
    WHEN 'COLUMNS' THEN 3
    WHEN 'CONSTRAINTS' THEN 4
    WHEN 'INDEXES' THEN 5
    WHEN 'TRIGGERS' THEN 6
    WHEN 'FOREIGN_KEYS' THEN 7
  END,
  check_name;

\echo ''
\echo '─────────────────────────────────────────────────────────────────────'
\echo 'SUMMARY'
\echo '─────────────────────────────────────────────────────────────────────'

-- Summary statistics
SELECT
  category,
  COUNT(*) FILTER (WHERE status LIKE '✅%') as passed,
  COUNT(*) FILTER (WHERE status LIKE '❌%') as failed,
  COUNT(*) as total
FROM validation_results
GROUP BY category
ORDER BY
  CASE category
    WHEN 'ENUMS' THEN 1
    WHEN 'TABLES' THEN 2
    WHEN 'COLUMNS' THEN 3
    WHEN 'CONSTRAINTS' THEN 4
    WHEN 'INDEXES' THEN 5
    WHEN 'TRIGGERS' THEN 6
    WHEN 'FOREIGN_KEYS' THEN 7
  END;

\echo ''

-- Overall status
DO $$
DECLARE
  total_checks INT;
  failed_checks INT;
BEGIN
  SELECT COUNT(*) INTO total_checks FROM validation_results;
  SELECT COUNT(*) INTO failed_checks FROM validation_results WHERE status LIKE '❌%';

  IF failed_checks = 0 THEN
    RAISE NOTICE '✅ ALL VALIDATION CHECKS PASSED (%/%)', total_checks, total_checks;
    RAISE NOTICE 'Schema is ready for Story 0.2 completion.';
  ELSE
    RAISE WARNING '❌ % CHECKS FAILED (%/%)', failed_checks, total_checks - failed_checks, total_checks;
    RAISE WARNING 'Please review failed checks above and fix migrations.';
  END IF;
END $$;

\echo ''
\echo '═══════════════════════════════════════════════════════════════════════'

-- Clean up
DROP TABLE validation_results;
