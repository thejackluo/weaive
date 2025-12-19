-- RLS Policies Test Suite
-- Story: 0.4 - Row Level Security
-- Framework: pgTAP (Supabase test framework)
-- Run: supabase test db

-- ═══════════════════════════════════════════════════════════════════════
-- TEST SETUP
-- ═══════════════════════════════════════════════════════════════════════

BEGIN;

-- Load pgTAP extension
SELECT plan(48); -- Total number of tests

-- Create test users in auth.users (simulating Supabase Auth)
-- Note: In real tests, this would be done via Supabase Auth API
-- For local testing, we'll create user_profiles with test auth_user_ids

-- Clean up any existing test data
DELETE FROM user_profiles WHERE auth_user_id IN ('00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000000b');

-- Create test User A
INSERT INTO user_profiles (id, auth_user_id, display_name, timezone)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-00000000000a',  -- UUID for test user A
  'Test User A',
  'America/Los_Angeles'
);

-- Create test User B
INSERT INTO user_profiles (id, auth_user_id, display_name, timezone)
VALUES (
  '00000000-0000-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-00000000000b',  -- UUID for test user B
  'Test User B',
  'America/New_York'
);

-- ═══════════════════════════════════════════════════════════════════════
-- TEST SCENARIO 1: User A can SELECT/INSERT/UPDATE their own data
-- ═══════════════════════════════════════════════════════════════════════

-- Simulate User A session
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub": "00000000-0000-0000-0000-00000000000a"}';

-- Test: User A can INSERT their own goal
INSERT INTO goals (id, user_id, title, status)
VALUES (
  '10000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'User A Goal',
  'active'
);

SELECT is(
  (SELECT COUNT(*) FROM goals WHERE id = '10000000-0000-0000-0000-000000000001'::uuid),
  1::bigint,
  'User A can INSERT their own goal'
);

-- Test: User A can SELECT their own goal
SELECT is(
  (SELECT title FROM goals WHERE id = '10000000-0000-0000-0000-000000000001'::uuid),
  'User A Goal',
  'User A can SELECT their own goal'
);

-- Test: User A can UPDATE their own goal
UPDATE goals SET title = 'User A Updated Goal'
WHERE id = '10000000-0000-0000-0000-000000000001'::uuid;

SELECT is(
  (SELECT title FROM goals WHERE id = '10000000-0000-0000-0000-000000000001'::uuid),
  'User A Updated Goal',
  'User A can UPDATE their own goal'
);

-- Test: User A can INSERT their own journal entry
INSERT INTO journal_entries (id, user_id, local_date, fulfillment_score)
VALUES (
  '20000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  '2025-12-19',
  8
);

SELECT is(
  (SELECT COUNT(*) FROM journal_entries WHERE id = '20000000-0000-0000-0000-000000000001'::uuid),
  1::bigint,
  'User A can INSERT their own journal entry'
);

-- Test: User A can INSERT their own identity doc
INSERT INTO identity_docs (id, user_id, doc_type, content)
VALUES (
  '30000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'archetype',
  '{"type": "builder"}'::jsonb
);

SELECT is(
  (SELECT COUNT(*) FROM identity_docs WHERE id = '30000000-0000-0000-0000-000000000001'::uuid),
  1::bigint,
  'User A can INSERT their own identity doc'
);

-- Reset role for next test
RESET role;
RESET request.jwt.claims;

-- ═══════════════════════════════════════════════════════════════════════
-- TEST SCENARIO 2: User A can SELECT but NOT UPDATE subtask_completions
-- ═══════════════════════════════════════════════════════════════════════

-- Simulate User A session
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub": "00000000-0000-0000-0000-00000000000a"}';

-- Test: User A can INSERT completion
INSERT INTO subtask_completions (
  id, user_id, subtask_instance_id, local_date, completed_at
)
VALUES (
  '40000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  NULL, -- No subtask_instance linked for this test
  '2025-12-19',
  NOW()
);

SELECT is(
  (SELECT COUNT(*) FROM subtask_completions WHERE id = '40000000-0000-0000-0000-000000000001'::uuid),
  1::bigint,
  'User A can INSERT their own completion'
);

-- Test: User A can SELECT completion
SELECT is(
  (SELECT local_date::text FROM subtask_completions WHERE id = '40000000-0000-0000-0000-000000000001'::uuid),
  '2025-12-19',
  'User A can SELECT their own completion'
);

-- Test: User A CANNOT UPDATE completion (immutable)
-- UPDATE will succeed but affect 0 rows because no UPDATE policy exists
UPDATE subtask_completions SET local_date = '2025-12-20'
WHERE id = '40000000-0000-0000-0000-000000000001'::uuid;

SELECT is(
  (SELECT local_date::text FROM subtask_completions WHERE id = '40000000-0000-0000-0000-000000000001'::uuid),
  '2025-12-19',
  'User A CANNOT UPDATE completion (date unchanged - immutable)'
);

RESET role;
RESET request.jwt.claims;

-- ═══════════════════════════════════════════════════════════════════════
-- TEST SCENARIO 3: User A CANNOT SELECT User B's data
-- ═══════════════════════════════════════════════════════════════════════

-- Create User B data (as admin/service role)
INSERT INTO goals (id, user_id, title, status)
VALUES (
  '10000000-0000-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-000000000002'::uuid,
  'User B Goal',
  'active'
);

INSERT INTO journal_entries (id, user_id, local_date, fulfillment_score)
VALUES (
  '20000000-0000-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-000000000002'::uuid,
  '2025-12-19',
  7
);

-- Simulate User A session
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub": "00000000-0000-0000-0000-00000000000a"}';

-- Test: User A CANNOT SELECT User B's goal
SELECT is(
  (SELECT COUNT(*) FROM goals WHERE id = '10000000-0000-0000-0000-000000000002'::uuid),
  0::bigint,
  'User A CANNOT SELECT User B goal (returns empty)'
);

-- Test: User A CANNOT SELECT User B's journal
SELECT is(
  (SELECT COUNT(*) FROM journal_entries WHERE id = '20000000-0000-0000-0000-000000000002'::uuid),
  0::bigint,
  'User A CANNOT SELECT User B journal (returns empty)'
);

-- Test: User A can only see their own goals
SELECT is(
  (SELECT COUNT(*) FROM goals),
  1::bigint,
  'User A sees only their own goal (1 of 2 total)'
);

RESET role;
RESET request.jwt.claims;

-- ═══════════════════════════════════════════════════════════════════════
-- TEST SCENARIO 4: User A CANNOT INSERT with User B's user_id
-- ═══════════════════════════════════════════════════════════════════════

-- Simulate User A session
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub": "00000000-0000-0000-0000-00000000000a"}';

-- Test: User A attempts to INSERT goal with User B's user_id (should fail)
-- pgTAP doesn't have throws_ok for policies, so we check row count after attempt
DO $$
BEGIN
  INSERT INTO goals (id, user_id, title, status)
  VALUES (
    '10000000-0000-0000-0000-000000000099'::uuid,
    '00000000-0000-0000-0000-000000000002'::uuid, -- User B's ID
    'Malicious Goal',
    'active'
  );
EXCEPTION WHEN OTHERS THEN
  NULL; -- Swallow error (expected)
END;
$$;

-- Verify the malicious goal was NOT created
SELECT is(
  (SELECT COUNT(*) FROM goals WHERE id = '10000000-0000-0000-0000-000000000099'::uuid),
  0::bigint,
  'User A CANNOT INSERT goal with User B user_id (RLS blocks)'
);

RESET role;
RESET request.jwt.claims;

-- ═══════════════════════════════════════════════════════════════════════
-- TEST SCENARIO 5: User A CANNOT UPDATE User B's data
-- ═══════════════════════════════════════════════════════════════════════

-- Simulate User A session
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub": "00000000-0000-0000-0000-00000000000a"}';

-- Test: User A attempts to UPDATE User B's goal (should affect 0 rows)
UPDATE goals SET title = 'Hacked Goal'
WHERE id = '10000000-0000-0000-0000-000000000002'::uuid; -- User B's goal

-- Verify User B's goal unchanged (check as admin)
RESET role;
RESET request.jwt.claims;

SELECT is(
  (SELECT title FROM goals WHERE id = '10000000-0000-0000-0000-000000000002'::uuid),
  'User B Goal',
  'User A CANNOT UPDATE User B goal (unchanged)'
);

-- ═══════════════════════════════════════════════════════════════════════
-- TEST SCENARIO 6: User A CANNOT DELETE User B's data
-- ═══════════════════════════════════════════════════════════════════════

-- Simulate User A session
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub": "00000000-0000-0000-0000-00000000000a"}';

-- Test: User A attempts to DELETE User B's journal (should affect 0 rows)
DELETE FROM journal_entries WHERE id = '20000000-0000-0000-0000-000000000002'::uuid;

RESET role;
RESET request.jwt.claims;

-- Verify User B's journal still exists
SELECT is(
  (SELECT COUNT(*) FROM journal_entries WHERE id = '20000000-0000-0000-0000-000000000002'::uuid),
  1::bigint,
  'User A CANNOT DELETE User B journal (still exists)'
);

-- ═══════════════════════════════════════════════════════════════════════
-- TEST SCENARIO 7: Verify RLS is enabled on all tables
-- ═══════════════════════════════════════════════════════════════════════

SELECT is(
  (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles'),
  TRUE,
  'RLS enabled on user_profiles'
);

SELECT is(
  (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'identity_docs'),
  TRUE,
  'RLS enabled on identity_docs'
);

SELECT is(
  (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'goals'),
  TRUE,
  'RLS enabled on goals'
);

SELECT is(
  (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subtask_templates'),
  TRUE,
  'RLS enabled on subtask_templates'
);

SELECT is(
  (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subtask_instances'),
  TRUE,
  'RLS enabled on subtask_instances'
);

SELECT is(
  (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subtask_completions'),
  TRUE,
  'RLS enabled on subtask_completions'
);

SELECT is(
  (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'captures'),
  TRUE,
  'RLS enabled on captures'
);

SELECT is(
  (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'journal_entries'),
  TRUE,
  'RLS enabled on journal_entries'
);

SELECT is(
  (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'daily_aggregates'),
  TRUE,
  'RLS enabled on daily_aggregates'
);

SELECT is(
  (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'triad_tasks'),
  TRUE,
  'RLS enabled on triad_tasks'
);

SELECT is(
  (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_runs'),
  TRUE,
  'RLS enabled on ai_runs'
);

SELECT is(
  (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_artifacts'),
  TRUE,
  'RLS enabled on ai_artifacts'
);

-- ═══════════════════════════════════════════════════════════════════════
-- TEST SCENARIO 8: Verify policy counts
-- ═══════════════════════════════════════════════════════════════════════

-- user_profiles should have 3 policies (SELECT, INSERT, UPDATE)
SELECT is(
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_profiles'),
  3::bigint,
  'user_profiles has 3 policies (SELECT, INSERT, UPDATE)'
);

-- subtask_completions should have 2 policies (SELECT, INSERT - NO UPDATE/DELETE)
SELECT is(
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'subtask_completions'),
  2::bigint,
  'subtask_completions has 2 policies (SELECT, INSERT only - immutable)'
);

-- Mutable tables should have 1 policy each (FOR ALL)
SELECT is(
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'goals'),
  1::bigint,
  'goals has 1 policy (FOR ALL)'
);

SELECT is(
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'identity_docs'),
  1::bigint,
  'identity_docs has 1 policy (FOR ALL)'
);

SELECT is(
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'journal_entries'),
  1::bigint,
  'journal_entries has 1 policy (FOR ALL)'
);

SELECT is(
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'captures'),
  1::bigint,
  'captures has 1 policy (FOR ALL)'
);

SELECT is(
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'subtask_templates'),
  1::bigint,
  'subtask_templates has 1 policy (FOR ALL)'
);

SELECT is(
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'subtask_instances'),
  1::bigint,
  'subtask_instances has 1 policy (FOR ALL)'
);

SELECT is(
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'daily_aggregates'),
  1::bigint,
  'daily_aggregates has 1 policy (FOR ALL)'
);

SELECT is(
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'triad_tasks'),
  1::bigint,
  'triad_tasks has 1 policy (FOR ALL)'
);

SELECT is(
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_runs'),
  1::bigint,
  'ai_runs has 1 policy (FOR ALL)'
);

SELECT is(
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_artifacts'),
  1::bigint,
  'ai_artifacts has 1 policy (FOR ALL)'
);

-- ═══════════════════════════════════════════════════════════════════════
-- Additional cross-user tests for other tables
-- ═══════════════════════════════════════════════════════════════════════

-- Test: User B can see their own data but not User A's
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub": "00000000-0000-0000-0000-00000000000b"}';

SELECT is(
  (SELECT COUNT(*) FROM goals),
  1::bigint,
  'User B sees only their own goal'
);

SELECT is(
  (SELECT title FROM goals WHERE user_id = '00000000-0000-0000-0000-000000000002'::uuid),
  'User B Goal',
  'User B can access their own goal'
);

-- User B cannot see User A's identity doc
SELECT is(
  (SELECT COUNT(*) FROM identity_docs),
  0::bigint,
  'User B cannot see User A identity doc'
);

RESET role;
RESET request.jwt.claims;

-- ═══════════════════════════════════════════════════════════════════════
-- TEST CLEANUP
-- ═══════════════════════════════════════════════════════════════════════

-- Clean up test data
DELETE FROM subtask_completions WHERE user_id IN (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000002'::uuid
);

DELETE FROM journal_entries WHERE user_id IN (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000002'::uuid
);

DELETE FROM goals WHERE user_id IN (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000002'::uuid
);

DELETE FROM identity_docs WHERE user_id IN (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000002'::uuid
);

DELETE FROM user_profiles WHERE auth_user_id IN ('test-user-a', 'test-user-b');

-- Finish test suite
SELECT * FROM finish();

ROLLBACK;
