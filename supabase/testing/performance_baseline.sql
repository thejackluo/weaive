-- ═══════════════════════════════════════════════════════════════════════
-- PERFORMANCE BASELINE SCRIPT for Story 0.2
-- Purpose: Measure query performance for critical patterns
-- Story: 0.2b - Database Schema Refinement + Critical Tables (AC4)
-- Usage: psql <connection-string> -f performance_baseline.sql
--
-- Performance Targets (from Story 0.2b):
-- - Dashboard query (daily_aggregates): <10ms (P95)
-- - Today's binds query: <50ms (P95)
-- - Completion history: <100ms (P95)
-- - Other queries: <200ms (P95)
-- ═══════════════════════════════════════════════════════════════════════

\set ON_ERROR_STOP on
\timing on

-- Create temporary table for performance results
CREATE TEMP TABLE performance_results (
  query_pattern TEXT,
  target_ms NUMERIC,
  actual_ms NUMERIC,
  status TEXT,
  notes TEXT
);

\echo ''
\echo '═══════════════════════════════════════════════════════════════════════'
\echo 'WEAVE DATABASE PERFORMANCE BASELINE'
\echo 'Story 0.2: Database Schema Core + Refinement (Migrations 001-013)'
\echo '═══════════════════════════════════════════════════════════════════════'
\echo ''
\echo 'Testing 10 common query patterns with seed data...'
\echo ''

-- ═══════════════════════════════════════════════════════════════════════
-- PATTERN 1: Dashboard Query (CRITICAL - North Star metric)
-- ═══════════════════════════════════════════════════════════════════════

\echo '1. Dashboard Query (daily_aggregates) - Target: <10ms'

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
  local_date,
  completed_count,
  planned_count,
  consistency_percent,
  has_journal,
  has_proof,
  active_day_with_proof
FROM daily_aggregates
WHERE user_id = '11111111-1111-1111-1111-111111111111'
  AND local_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY local_date DESC;

-- Note: In production, extract execution time from EXPLAIN ANALYZE output
-- For baseline, we're using EXPLAIN ANALYZE to show query plan

INSERT INTO performance_results VALUES
('Dashboard (daily_aggregates)', 10, NULL, '⏱️  CHECK', 'See EXPLAIN ANALYZE output above. Should use idx_daily_aggregates_user_date index.');

\echo ''

-- ═══════════════════════════════════════════════════════════════════════
-- PATTERN 2: Today's Binds Query (High Priority)
-- ═══════════════════════════════════════════════════════════════════════

\echo '2. Today''s Binds Query - Target: <50ms'

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
  si.id,
  si.scheduled_for_date,
  si.status,
  si.title_override,
  st.title as template_title,
  st.estimated_duration_minutes,
  g.title as goal_title,
  g.id as goal_id
FROM subtask_instances si
LEFT JOIN subtask_templates st ON st.id = si.template_id
LEFT JOIN goals g ON g.id = st.goal_id
WHERE si.user_id = '11111111-1111-1111-1111-111111111111'
  AND si.scheduled_for_date = CURRENT_DATE
ORDER BY si.created_at;

INSERT INTO performance_results VALUES
('Today''s Binds', 50, NULL, '⏱️  CHECK', 'Should use idx_subtask_instances_user_date_status index. Check for sequential scans.');

\echo ''

-- ═══════════════════════════════════════════════════════════════════════
-- PATTERN 3: Goal with Subtasks (NO N+1)
-- ═══════════════════════════════════════════════════════════════════════

\echo '3. Goal with Subtasks (single query, no N+1) - Target: <200ms'

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
  g.id,
  g.title,
  g.description,
  g.status,
  g.priority,
  g.target_date,
  json_agg(
    json_build_object(
      'id', st.id,
      'title', st.title,
      'recurrence_pattern', st.recurrence_pattern,
      'estimated_duration_minutes', st.estimated_duration_minutes,
      'is_archived', st.is_archived
    ) ORDER BY st.created_at
  ) FILTER (WHERE st.id IS NOT NULL) as subtask_templates
FROM goals g
LEFT JOIN subtask_templates st ON st.goal_id = g.id AND st.is_archived = FALSE
WHERE g.user_id = '11111111-1111-1111-1111-111111111111'
  AND g.status = 'active'
GROUP BY g.id
ORDER BY g.priority DESC, g.created_at;

INSERT INTO performance_results VALUES
('Goal with Subtasks (json_agg)', 200, NULL, '⏱️  CHECK', 'Should avoid N+1 queries. Single query with LEFT JOIN and json_agg.');

\echo ''

-- ═══════════════════════════════════════════════════════════════════════
-- PATTERN 4: Completion with Proof (LEFT JOIN)
-- ═══════════════════════════════════════════════════════════════════════

\echo '4. Completion with Proof - Target: <200ms'

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
  sc.id,
  sc.local_date,
  sc.duration_minutes,
  sc.completed_at,
  si.title_override,
  st.title as bind_title,
  json_agg(
    json_build_object(
      'id', c.id,
      'type', c.type,
      'content_text', c.content_text,
      'storage_path', c.storage_path
    )
  ) FILTER (WHERE c.id IS NOT NULL) as proof_captures
FROM subtask_completions sc
LEFT JOIN subtask_instances si ON si.id = sc.instance_id
LEFT JOIN subtask_templates st ON st.id = si.template_id
LEFT JOIN captures c ON c.subtask_instance_id = si.id AND c.local_date = sc.local_date
WHERE sc.user_id = '11111111-1111-1111-1111-111111111111'
  AND sc.local_date = CURRENT_DATE - INTERVAL '1 day'
GROUP BY sc.id, si.title_override, st.title
ORDER BY sc.completed_at;

INSERT INTO performance_results VALUES
('Completion with Proof', 200, NULL, '⏱️  CHECK', 'Should use idx_subtask_completions_user_date. No N+1 queries.');

\echo ''

-- ═══════════════════════════════════════════════════════════════════════
-- PATTERN 5: Streak Calculation (Recursive CTE)
-- ═══════════════════════════════════════════════════════════════════════

\echo '5. Streak Calculation (consecutive days) - Target: <100ms'

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
WITH RECURSIVE date_series AS (
  SELECT DISTINCT local_date
  FROM subtask_completions
  WHERE user_id = '11111111-1111-1111-1111-111111111111'
    AND local_date >= CURRENT_DATE - INTERVAL '90 days'
  ORDER BY local_date DESC
),
streak_calc AS (
  SELECT
    local_date,
    local_date as streak_start,
    1 as streak_length
  FROM date_series
  WHERE local_date = CURRENT_DATE - INTERVAL '1 day'

  UNION ALL

  SELECT
    ds.local_date,
    sc.streak_start,
    sc.streak_length + 1
  FROM date_series ds
  JOIN streak_calc sc ON ds.local_date = sc.streak_start - INTERVAL '1 day'
)
SELECT
  MAX(streak_length) as current_streak,
  MIN(streak_start) as streak_start_date
FROM streak_calc;

INSERT INTO performance_results VALUES
('Streak Calculation', 100, NULL, '⏱️  CHECK', 'Recursive CTE. Should use idx_subtask_completions_user_date_asc for forward scan.');

\echo ''

-- ═══════════════════════════════════════════════════════════════════════
-- PATTERN 6: Consistency Heatmap (Last 90 Days)
-- ═══════════════════════════════════════════════════════════════════════

\echo '6. Consistency Heatmap - Target: <200ms'

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
  local_date,
  completed_count,
  planned_count,
  CASE
    WHEN planned_count = 0 THEN 0
    ELSE ROUND((completed_count::NUMERIC / planned_count::NUMERIC) * 100)
  END as consistency_percent,
  active_day_with_proof
FROM daily_aggregates
WHERE user_id = '11111111-1111-1111-1111-111111111111'
  AND local_date >= CURRENT_DATE - INTERVAL '90 days'
ORDER BY local_date;

INSERT INTO performance_results VALUES
('Consistency Heatmap', 200, NULL, '⏱️  CHECK', 'Should use idx_daily_aggregates_user_date. Fast read from pre-computed aggregates.');

\echo ''

-- ═══════════════════════════════════════════════════════════════════════
-- PATTERN 7: AI Cache Lookup (input_hash)
-- ═══════════════════════════════════════════════════════════════════════

\echo '7. AI Cache Lookup - Target: <50ms'

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
  id,
  operation,
  model_used,
  response_tokens,
  cost_estimate,
  created_at
FROM ai_runs
WHERE input_hash = 'hash_alex_day1_completions_3_journal_yes'
  AND status = 'success'
ORDER BY created_at DESC
LIMIT 1;

INSERT INTO performance_results VALUES
('AI Cache Lookup', 50, NULL, '⏱️  CHECK', 'Should use partial index idx_ai_runs_input_hash WHERE status = ''success''.');

\echo ''

-- ═══════════════════════════════════════════════════════════════════════
-- PATTERN 8: Latest Identity Doc (Versioned)
-- ═══════════════════════════════════════════════════════════════════════

\echo '8. Latest Identity Doc - Target: <20ms'

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
  version,
  archetype,
  dream_self,
  motivations,
  constraints,
  created_at
FROM identity_docs
WHERE user_id = '11111111-1111-1111-1111-111111111111'
ORDER BY version DESC
LIMIT 1;

INSERT INTO performance_results VALUES
('Latest Identity Doc', 20, NULL, '⏱️  CHECK', 'Should use idx_identity_docs_user_version with ORDER BY version DESC.');

\echo ''

-- ═══════════════════════════════════════════════════════════════════════
-- PATTERN 9: Triad for Today
-- ═══════════════════════════════════════════════════════════════════════

\echo '9. Triad for Today - Target: <20ms'

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
  rank,
  title,
  rationale,
  is_user_edited
FROM triad_tasks
WHERE user_id = '11111111-1111-1111-1111-111111111111'
  AND date_for = CURRENT_DATE
ORDER BY rank;

INSERT INTO performance_results VALUES
('Triad for Today', 20, NULL, '⏱️  CHECK', 'Should use idx_triad_tasks_user_date. Returns 3 rows max.');

\echo ''

-- ═══════════════════════════════════════════════════════════════════════
-- PATTERN 10: Journal History (Last 7 Days)
-- ═══════════════════════════════════════════════════════════════════════

\echo '10. Journal History - Target: <50ms'

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
  local_date,
  text,
  fulfillment_score,
  created_at
FROM journal_entries
WHERE user_id = '11111111-1111-1111-1111-111111111111'
  AND local_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY local_date DESC;

INSERT INTO performance_results VALUES
('Journal History', 50, NULL, '⏱️  CHECK', 'Should use idx_journal_entries_user_date with DESC ordering.');

\echo ''

-- ═══════════════════════════════════════════════════════════════════════
-- ADDITIONAL CHECKS: Index Usage Analysis
-- ═══════════════════════════════════════════════════════════════════════

\echo '─────────────────────────────────────────────────────────────────────'
\echo 'INDEX USAGE ANALYSIS'
\echo '─────────────────────────────────────────────────────────────────────'
\echo ''

-- Show table sizes
\echo 'Table Sizes:'
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

\echo ''

-- Show index sizes
\echo 'Index Sizes:'
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(schemaname||'.'||indexname)) AS size
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(schemaname||'.'||indexname) DESC;

\echo ''

-- ═══════════════════════════════════════════════════════════════════════
-- FINAL REPORT
-- ═══════════════════════════════════════════════════════════════════════

\echo ''
\echo '═══════════════════════════════════════════════════════════════════════'
\echo 'PERFORMANCE BASELINE SUMMARY'
\echo '═══════════════════════════════════════════════════════════════════════'
\echo ''

SELECT
  query_pattern,
  target_ms || ' ms' as target,
  COALESCE(actual_ms::TEXT || ' ms', 'N/A') as actual,
  status,
  notes
FROM performance_results
ORDER BY target_ms;

\echo ''
\echo '─────────────────────────────────────────────────────────────────────'
\echo 'INTERPRETATION GUIDE'
\echo '─────────────────────────────────────────────────────────────────────'
\echo ''
\echo '1. Check EXPLAIN ANALYZE output above for each query'
\echo '2. Look for "Index Scan" (good) vs "Seq Scan" (bad for large tables)'
\echo '3. Verify "Execution Time" meets target milliseconds'
\echo '4. With seed data (small dataset), most queries will be <1ms'
\echo '5. Real performance test requires 10K+ rows per table'
\echo ''
\echo 'Critical Indexes to Verify:'
\echo '  - idx_daily_aggregates_user_date (dashboard query)'
\echo '  - idx_subtask_instances_user_date_status (today''s binds)'
\echo '  - idx_subtask_completions_user_date (completion history)'
\echo '  - idx_subtask_completions_dashboard_query (with INCLUDE clause)'
\echo '  - idx_ai_runs_input_hash (AI cache, partial index)'
\echo ''
\echo 'If you see "Seq Scan" on large tables, indexes may be missing or not used.'
\echo 'Run "ANALYZE <table_name>;" to update statistics and re-test.'
\echo ''
\echo '═══════════════════════════════════════════════════════════════════════'

-- Clean up
DROP TABLE performance_results;

\timing off
