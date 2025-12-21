-- ═══════════════════════════════════════════════════════════════════════
-- SEED DATA for Weave Database
-- Purpose: Test data for development and validation
-- Story: 0.2b - Database Schema Refinement + Critical Tables
-- ═══════════════════════════════════════════════════════════════════════

-- Clean slate (in reverse dependency order)
TRUNCATE TABLE ai_artifacts CASCADE;
TRUNCATE TABLE ai_runs CASCADE;
TRUNCATE TABLE triad_tasks CASCADE;
TRUNCATE TABLE daily_aggregates CASCADE;
TRUNCATE TABLE journal_entries CASCADE;
TRUNCATE TABLE captures CASCADE;
TRUNCATE TABLE subtask_completions CASCADE;
TRUNCATE TABLE subtask_instances CASCADE;
TRUNCATE TABLE subtask_templates CASCADE;
TRUNCATE TABLE goals CASCADE;
TRUNCATE TABLE identity_docs CASCADE;
TRUNCATE TABLE user_profiles CASCADE;

-- ═══════════════════════════════════════════════════════════════════════
-- TEST USERS
-- ═══════════════════════════════════════════════════════════════════════

-- User 1: Alex (Consistent, high performer)
INSERT INTO user_profiles (id, auth_user_id, display_name, timezone, locale, created_at, last_active_at) VALUES
('11111111-1111-1111-1111-111111111111', 'auth_alex_123', 'Alex Chen', 'America/Los_Angeles', 'en-US', NOW() - INTERVAL '30 days', NOW());

-- User 2: Jordan (Inconsistent, needs improvement)
INSERT INTO user_profiles (id, auth_user_id, display_name, timezone, locale, created_at, last_active_at) VALUES
('22222222-2222-2222-2222-222222222222', 'auth_jordan_456', 'Jordan Smith', 'America/New_York', 'en-US', NOW() - INTERVAL '15 days', NOW() - INTERVAL '2 days');

-- User 3: Sam (New user, just onboarded)
INSERT INTO user_profiles (id, auth_user_id, display_name, timezone, locale, created_at, last_active_at) VALUES
('33333333-3333-3333-3333-333333333333', 'auth_sam_789', 'Sam Johnson', 'Europe/London', 'en-GB', NOW() - INTERVAL '2 days', NOW());

-- ═══════════════════════════════════════════════════════════════════════
-- IDENTITY DOCUMENTS (Versioned)
-- ═══════════════════════════════════════════════════════════════════════

-- Alex's identity (2 versions - user edited)
INSERT INTO identity_docs (id, user_id, version, json, created_at) VALUES
('1d111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 1,
 '{"archetype": "The Optimizer", "dream_self": "I want to be a senior engineer at a top tech company, leading projects that impact millions of users. I see myself mentoring junior developers and contributing to open source.", "motivations": ["Career growth", "Technical excellence", "Work-life balance", "Financial independence"], "constraints": ["Full-time job (40hrs/week)", "Family time on weekends", "Limited budget for courses"]}'::jsonb,
 NOW() - INTERVAL '30 days');

INSERT INTO identity_docs (id, user_id, version, json, created_at) VALUES
('1d111112-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 2,
 '{"archetype": "The Optimizer", "dream_self": "I want to be a senior engineer at a FAANG company, leading projects that impact millions of users. I see myself mentoring junior developers and contributing to open source. Most importantly, I want to build products that solve real problems.", "motivations": ["Career growth", "Technical excellence", "Work-life balance", "Financial independence", "Impact"], "constraints": ["Full-time job (40hrs/week)", "Family time on weekends", "Limited budget for courses"]}'::jsonb,
 NOW() - INTERVAL '20 days');

-- Jordan's identity (1 version - initial)
INSERT INTO identity_docs (id, user_id, version, json, created_at) VALUES
('2d222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 1,
 '{"archetype": "The Explorer", "dream_self": "I want to build my own startup and create a product people love. I want financial freedom and the ability to work from anywhere.", "motivations": ["Entrepreneurship", "Financial freedom", "Creative expression", "Independence"], "constraints": ["Solo founder - limited help", "Inconsistent schedule", "Distractions from social media"]}'::jsonb,
 NOW() - INTERVAL '15 days');

-- Sam's identity (1 version - initial)
INSERT INTO identity_docs (id, user_id, version, json, created_at) VALUES
('3d333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 1,
 '{"archetype": "The Builder", "dream_self": "I want to master machine learning and build AI products that help people be more productive.", "motivations": ["Learning", "Building", "Problem-solving", "Recognition"], "constraints": ["Student schedule - 20hrs/week available", "No income yet", "Learning curve"]}'::jsonb,
 NOW() - INTERVAL '2 days');

-- ═══════════════════════════════════════════════════════════════════════
-- GOALS (Alex has 3 active - max allowed, Jordan has 2, Sam has 1)
-- ═══════════════════════════════════════════════════════════════════════

-- Alex's Goals (3 active - using hex-valid UUIDs starting with 16)
INSERT INTO goals (id, user_id, title, description, status, priority, target_date, created_at) VALUES
('16111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 'Get promoted to Senior Engineer',
 'Demonstrate technical leadership, mentor juniors, lead 2 major projects, contribute to architecture decisions.',
 'active', 'high', '2026-06-01', NOW() - INTERVAL '30 days');

INSERT INTO goals (id, user_id, title, description, status, priority, target_date, created_at) VALUES
('16111112-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 'Build strong daily exercise habit',
 'Exercise 5 days per week (30 min minimum). Improve energy levels and health.',
 'active', 'med', '2026-03-01', NOW() - INTERVAL '25 days');

INSERT INTO goals (id, user_id, title, description, status, priority, target_date, created_at) VALUES
('16111113-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 'Read 24 technical books this year',
 'Read 2 books per month to expand knowledge. Focus on systems design, leadership, and emerging tech.',
 'active', 'low', '2025-12-31', NOW() - INTERVAL '20 days');

-- Jordan's Goals (2 active)
INSERT INTO goals (id, user_id, title, description, status, priority, target_date, created_at) VALUES
('26222221-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
 'Launch MVP in 90 days',
 'Ship a working product with core features. Get first 100 users.',
 'active', 'high', '2026-03-15', NOW() - INTERVAL '15 days');

INSERT INTO goals (id, user_id, title, description, status, priority, target_date, created_at) VALUES
('26222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
 'Build consistent coding habit',
 'Code every day, even if just 30 minutes. Ship features regularly.',
 'active', 'high', '2026-02-01', NOW() - INTERVAL '10 days');

-- Sam's Goals (1 active)
INSERT INTO goals (id, user_id, title, description, status, priority, target_date, created_at) VALUES
('36333331-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
 'Complete ML course and build 3 projects',
 'Finish Andrew Ng''s course, build practical projects, understand fundamentals.',
 'active', 'high', '2026-05-01', NOW() - INTERVAL '2 days');

-- ═══════════════════════════════════════════════════════════════════════
-- SUBTASK TEMPLATES (Binds) - Reusable habits (17 = templates)
-- ═══════════════════════════════════════════════════════════════════════

-- Alex's Binds
INSERT INTO subtask_templates (id, goal_id, user_id, title, recurrence_rule, default_estimated_minutes, is_archived, created_at) VALUES
('17111111-1111-1111-1111-111111111111', '16111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 'Code review 2+ PRs', 'daily', 30, FALSE, NOW() - INTERVAL '30 days'),
('17111112-1111-1111-1111-111111111111', '16111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 'Lead daily standup', 'weekly:mon,wed,fri', 15, FALSE, NOW() - INTERVAL '30 days'),
('17111113-1111-1111-1111-111111111111', '16111112-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 'Morning run (30 min)', 'daily', 30, FALSE, NOW() - INTERVAL '25 days'),
('17111114-1111-1111-1111-111111111111', '16111113-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 'Read technical book (30 pages)', 'daily', 45, FALSE, NOW() - INTERVAL '20 days');

-- Jordan's Binds
INSERT INTO subtask_templates (id, goal_id, user_id, title, recurrence_rule, default_estimated_minutes, is_archived, created_at) VALUES
('27222221-2222-2222-2222-222222222222', '26222221-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
 'Ship 1 feature or fix 3 bugs', 'daily', 120, FALSE, NOW() - INTERVAL '15 days'),
('27222222-2222-2222-2222-222222222222', '26222221-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
 'Talk to 2 potential users', 'weekly:mon,thu', 30, FALSE, NOW() - INTERVAL '15 days'),
('27222223-2222-2222-2222-222222222222', '26222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
 'Code for 30 minutes', 'daily', 30, FALSE, NOW() - INTERVAL '10 days');

-- Sam's Binds
INSERT INTO subtask_templates (id, goal_id, user_id, title, recurrence_rule, default_estimated_minutes, is_archived, created_at) VALUES
('37333331-3333-3333-3333-333333333333', '36333331-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
 'Complete 1 ML course module', 'daily', 60, FALSE, NOW() - INTERVAL '2 days'),
('37333332-3333-3333-3333-333333333333', '36333331-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
 'Code ML exercises', 'daily', 45, FALSE, NOW() - INTERVAL '2 days');

-- ═══════════════════════════════════════════════════════════════════════
-- SUBTASK INSTANCES (Scheduled binds - 11 = instances)
-- ═══════════════════════════════════════════════════════════════════════

-- Alex's instances - 2 days ago (all done - perfect day)
INSERT INTO subtask_instances (id, template_id, user_id, goal_id, scheduled_for_date, status, estimated_minutes, completed_at, created_at) VALUES
('11111101-1111-1111-1111-111111111111', '17111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '16111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '2 days', 'done', 30, NOW() - INTERVAL '2 days' + INTERVAL '10 hours', NOW() - INTERVAL '2 days'),
('11111102-1111-1111-1111-111111111111', '17111112-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '16111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '2 days', 'done', 15, NOW() - INTERVAL '2 days' + INTERVAL '14 hours', NOW() - INTERVAL '2 days'),
('11111103-1111-1111-1111-111111111111', '17111113-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '16111112-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '2 days', 'done', 30, NOW() - INTERVAL '2 days' + INTERVAL '7 hours', NOW() - INTERVAL '2 days'),
('11111104-1111-1111-1111-111111111111', '17111114-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '16111113-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '2 days', 'done', 45, NOW() - INTERVAL '2 days' + INTERVAL '22 hours', NOW() - INTERVAL '2 days');

-- Alex's instances - Yesterday (all done)
INSERT INTO subtask_instances (id, template_id, user_id, goal_id, scheduled_for_date, status, estimated_minutes, completed_at, created_at) VALUES
('11111111-1111-1111-1111-111111111111', '17111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '16111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '1 day', 'done', 30, NOW() - INTERVAL '1 day' + INTERVAL '9 hours', NOW() - INTERVAL '1 day'),
('11111112-1111-1111-1111-111111111111', '17111113-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '16111112-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '1 day', 'done', 30, NOW() - INTERVAL '1 day' + INTERVAL '6 hours', NOW() - INTERVAL '1 day'),
('11111113-1111-1111-1111-111111111111', '17111114-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '16111113-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '1 day', 'done', 45, NOW() - INTERVAL '1 day' + INTERVAL '21 hours', NOW() - INTERVAL '1 day');

-- Alex's instances - Today (planned)
INSERT INTO subtask_instances (id, template_id, user_id, goal_id, scheduled_for_date, status, estimated_minutes, created_at) VALUES
('11111121-1111-1111-1111-111111111111', '17111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '16111111-1111-1111-1111-111111111111', CURRENT_DATE, 'planned', 30, NOW()),
('11111122-1111-1111-1111-111111111111', '17111112-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '16111111-1111-1111-1111-111111111111', CURRENT_DATE, 'planned', 15, NOW()),
('11111123-1111-1111-1111-111111111111', '17111113-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '16111112-1111-1111-1111-111111111111', CURRENT_DATE, 'planned', 30, NOW()),
('11111124-1111-1111-1111-111111111111', '17111114-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '16111113-1111-1111-1111-111111111111', CURRENT_DATE, 'planned', 45, NOW());

-- Jordan's instances - Yesterday (1 done, 1 skipped)
INSERT INTO subtask_instances (id, template_id, user_id, goal_id, scheduled_for_date, status, estimated_minutes, completed_at, created_at) VALUES
('21222211-2222-2222-2222-222222222222', '27222221-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '26222221-2222-2222-2222-222222222222', CURRENT_DATE - INTERVAL '1 day', 'done', 120, NOW() - INTERVAL '1 day' + INTERVAL '14 hours', NOW() - INTERVAL '1 day'),
('21222212-2222-2222-2222-222222222222', '27222223-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '26222222-2222-2222-2222-222222222222', CURRENT_DATE - INTERVAL '1 day', 'skipped', 30, NULL, NOW() - INTERVAL '1 day');

-- Jordan's instances - Today (planned)
INSERT INTO subtask_instances (id, template_id, user_id, goal_id, scheduled_for_date, status, estimated_minutes, created_at) VALUES
('21222221-2222-2222-2222-222222222222', '27222221-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '26222221-2222-2222-2222-222222222222', CURRENT_DATE, 'planned', 120, NOW()),
('21222222-2222-2222-2222-222222222222', '27222223-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '26222222-2222-2222-2222-222222222222', CURRENT_DATE, 'planned', 30, NOW());

-- Sam's instances - Today (planned)
INSERT INTO subtask_instances (id, template_id, user_id, goal_id, scheduled_for_date, status, estimated_minutes, created_at) VALUES
('31333331-3333-3333-3333-333333333333', '37333331-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '36333331-3333-3333-3333-333333333333', CURRENT_DATE, 'planned', 60, NOW()),
('31333332-3333-3333-3333-333333333333', '37333332-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '36333331-3333-3333-3333-333333333333', CURRENT_DATE, 'planned', 45, NOW());

-- ═══════════════════════════════════════════════════════════════════════
-- SUBTASK COMPLETIONS (IMMUTABLE) - Canonical truth (1c = completions)
-- ═══════════════════════════════════════════════════════════════════════

-- Alex's completions (yesterday - 3 binds completed)
INSERT INTO subtask_completions (id, user_id, subtask_instance_id, local_date, duration_minutes, completed_at) VALUES
('1c111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '1 day', 35, NOW() - INTERVAL '1 day' + INTERVAL '9 hours'),
('1c111112-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '11111112-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '1 day', 32, NOW() - INTERVAL '1 day' + INTERVAL '6 hours'),
('1c111113-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '11111113-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '1 day', 50, NOW() - INTERVAL '1 day' + INTERVAL '21 hours');

-- Alex's completions (2 days ago - 4 binds completed - perfect day)
INSERT INTO subtask_completions (id, user_id, subtask_instance_id, local_date, duration_minutes, completed_at) VALUES
('1c111121-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '11111101-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '2 days', 30, NOW() - INTERVAL '2 days' + INTERVAL '10 hours'),
('1c111122-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '11111102-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '2 days', 15, NOW() - INTERVAL '2 days' + INTERVAL '14 hours'),
('1c111123-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '11111103-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '2 days', 30, NOW() - INTERVAL '2 days' + INTERVAL '7 hours'),
('1c111124-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '11111104-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '2 days', 45, NOW() - INTERVAL '2 days' + INTERVAL '22 hours');

-- Jordan's completions (yesterday - only 1 bind completed)
INSERT INTO subtask_completions (id, user_id, subtask_instance_id, local_date, duration_minutes, completed_at) VALUES
('2c222211-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '21222211-2222-2222-2222-222222222222', CURRENT_DATE - INTERVAL '1 day', 90, NOW() - INTERVAL '1 day' + INTERVAL '14 hours');

-- ═══════════════════════════════════════════════════════════════════════
-- CAPTURES (Proof and memory - 19 = captures)
-- ═══════════════════════════════════════════════════════════════════════

-- Alex's captures (proof-linked and standalone)
INSERT INTO captures (id, user_id, subtask_instance_id, local_date, type, content_text, storage_key, created_at) VALUES
('19111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '11111112-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '1 day', 'photo',
 'Post-run selfie - feeling great!', 'captures/alex/2025-12-17/morning-run.jpg', NOW() - INTERVAL '1 day' + INTERVAL '6 hours 5 minutes'),
('19111112-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', NULL, CURRENT_DATE - INTERVAL '1 day', 'text',
 'Great insight from the book: "Systems thinking is about seeing patterns, not just events."', NULL, NOW() - INTERVAL '1 day' + INTERVAL '21 hours 30 minutes');

-- Jordan's captures (standalone note)
INSERT INTO captures (id, user_id, subtask_instance_id, local_date, type, content_text, storage_key, created_at) VALUES
('29222211-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', NULL, CURRENT_DATE - INTERVAL '1 day', 'text',
 'Had a breakthrough on the authentication flow. Users need passwordless login.', NULL, NOW() - INTERVAL '1 day' + INTERVAL '16 hours');

-- ═══════════════════════════════════════════════════════════════════════
-- JOURNAL ENTRIES (Daily reflection - 14 = journals)
-- ═══════════════════════════════════════════════════════════════════════

-- Alex's journals (consistent reflections)
INSERT INTO journal_entries (id, user_id, local_date, text, fulfillment_score, created_at) VALUES
('14111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '1 day',
 'Solid day. Completed morning run and code reviews. The book on systems design is fascinating. Feeling 8/10 fulfilled. Tomorrow I want to focus on leading the standup with more clarity.',
 8, NOW() - INTERVAL '1 day' + INTERVAL '22 hours'),
('14111112-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '2 days',
 'Amazing day! Hit all my binds. Morning energy was high. Led standup well, team seemed engaged. Book insights are clicking. 9/10 fulfilled.',
 9, NOW() - INTERVAL '2 days' + INTERVAL '23 hours');

-- Jordan's journal (inconsistent - skipped yesterday)
INSERT INTO journal_entries (id, user_id, local_date, text, fulfillment_score, created_at) VALUES
('24222211-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', CURRENT_DATE - INTERVAL '2 days',
 'Finally shipped a feature! Feels good to see progress. Need to be more consistent with coding daily. Got distracted by social media again. 6/10 fulfilled.',
 6, NOW() - INTERVAL '2 days' + INTERVAL '21 hours');

-- ═══════════════════════════════════════════════════════════════════════
-- DAILY AGGREGATES (Pre-computed stats - 1a = aggregates)
-- ═══════════════════════════════════════════════════════════════════════

-- Alex's aggregates (high consistency)
INSERT INTO daily_aggregates (user_id, local_date, completed_count, planned_count, capture_count, has_journal, has_proof, active_day_with_proof, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '1 day', 3, 3, 2, TRUE, TRUE, TRUE, NOW() - INTERVAL '1 day' + INTERVAL '22 hours'),
('11111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '2 days', 4, 4, 1, TRUE, FALSE, TRUE, NOW() - INTERVAL '2 days' + INTERVAL '23 hours'),
('11111111-1111-1111-1111-111111111111', CURRENT_DATE, 0, 4, 0, FALSE, FALSE, FALSE, NOW());

-- Jordan's aggregates (inconsistent)
INSERT INTO daily_aggregates (user_id, local_date, completed_count, planned_count, capture_count, has_journal, has_proof, active_day_with_proof, updated_at) VALUES
('22222222-2222-2222-2222-222222222222', CURRENT_DATE - INTERVAL '1 day', 1, 2, 0, FALSE, FALSE, TRUE, NOW() - INTERVAL '1 day' + INTERVAL '16 hours'),
('22222222-2222-2222-2222-222222222222', CURRENT_DATE - INTERVAL '2 days', 1, 3, 0, TRUE, FALSE, TRUE, NOW() - INTERVAL '2 days' + INTERVAL '21 hours'),
('22222222-2222-2222-2222-222222222222', CURRENT_DATE, 0, 2, 0, FALSE, FALSE, FALSE, NOW());

-- Sam's aggregates (new user)
INSERT INTO daily_aggregates (user_id, local_date, completed_count, planned_count, capture_count, has_journal, has_proof, active_day_with_proof, updated_at) VALUES
('33333333-3333-3333-3333-333333333333', CURRENT_DATE, 0, 2, 0, FALSE, FALSE, FALSE, NOW());

-- ═══════════════════════════════════════════════════════════════════════
-- TRIAD TASKS (AI-generated daily plan - 13 = triad)
-- ═══════════════════════════════════════════════════════════════════════

-- Alex's Triad for today
INSERT INTO triad_tasks (id, user_id, date_for, rank, title, rationale, is_user_edited, created_at) VALUES
('13111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', CURRENT_DATE, 1,
 'Morning run (30 min)', 'You have a 95% completion rate for morning runs. Starting the day with exercise sets a positive tone.', FALSE, NOW() - INTERVAL '1 day' + INTERVAL '22 hours'),
('13111112-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', CURRENT_DATE, 2,
 'Code review 2+ PRs', 'Critical for your promotion goal. You consistently complete this and it demonstrates technical leadership.', FALSE, NOW() - INTERVAL '1 day' + INTERVAL '22 hours'),
('13111113-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', CURRENT_DATE, 3,
 'Lead daily standup', 'Scheduled for today (Mon/Wed/Fri pattern). Great opportunity to practice leadership.', FALSE, NOW() - INTERVAL '1 day' + INTERVAL '22 hours');

-- Jordan's Triad for today
INSERT INTO triad_tasks (id, user_id, date_for, rank, title, rationale, is_user_edited, created_at) VALUES
('23222221-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', CURRENT_DATE, 1,
 'Ship 1 feature or fix 3 bugs', 'You completed this yesterday! Building momentum. Your MVP deadline is approaching.', FALSE, NOW() - INTERVAL '2 days' + INTERVAL '21 hours'),
('23222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', CURRENT_DATE, 2,
 'Code for 30 minutes', 'You skipped this yesterday. Even 30 minutes builds the habit. Start small and build consistency.', FALSE, NOW() - INTERVAL '2 days' + INTERVAL '21 hours'),
('23222223-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', CURRENT_DATE, 3,
 'Journal for 5 minutes', 'You skipped yesterday. Reflection helps you stay on track and identify patterns.', TRUE, NOW() - INTERVAL '2 days' + INTERVAL '21 hours 15 minutes');

-- Sam's Triad for today (first day)
INSERT INTO triad_tasks (id, user_id, date_for, rank, title, rationale, is_user_edited, created_at) VALUES
('33333331-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', CURRENT_DATE, 1,
 'Complete 1 ML course module', 'Your top goal is ML mastery. Start with your first module to build momentum.', FALSE, NOW() - INTERVAL '1 hour'),
('33333332-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', CURRENT_DATE, 2,
 'Code ML exercises', 'Hands-on practice reinforces learning. Even 30 minutes makes a difference.', FALSE, NOW() - INTERVAL '1 hour'),
('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', CURRENT_DATE, 3,
 'Journal - reflect on what you learned', 'Capture insights early. Helps with retention and builds the habit.', FALSE, NOW() - INTERVAL '1 hour');

-- ═══════════════════════════════════════════════════════════════════════
-- AI RUNS (Cost tracking and caching - 1a = ai_runs)
-- ═══════════════════════════════════════════════════════════════════════

-- Alex's AI runs (Triad generation)
INSERT INTO ai_runs (id, user_id, module, model, prompt_version, input_hash, status, cost_estimate, input_tokens, output_tokens, execution_time_ms, provider, created_at, completed_at) VALUES
('1a111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 'triad', 'gpt-4o-mini', 'triad-v1.0', 'hash_alex_day1_completions_3_journal_yes', 'success', 0.015, 1200, 450, 3000, 'openai', NOW() - INTERVAL '1 day' + INTERVAL '22 hours', NOW() - INTERVAL '1 day' + INTERVAL '22 hours' + INTERVAL '3 seconds'),
('1a111112-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 'recap', 'gpt-4o-mini', 'recap-v1.0', 'hash_alex_day1_journal_8', 'success', 0.012, 1000, 380, 2000, 'openai', NOW() - INTERVAL '1 day' + INTERVAL '22 hours' + INTERVAL '5 minutes', NOW() - INTERVAL '1 day' + INTERVAL '22 hours' + INTERVAL '5 minutes' + INTERVAL '2 seconds');

-- Jordan's AI runs (Triad generation - reused cached result)
INSERT INTO ai_runs (id, user_id, module, model, prompt_version, input_hash, status, cost_estimate, input_tokens, output_tokens, execution_time_ms, provider, created_at, completed_at) VALUES
('2a222221-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
 'triad', 'gpt-4o-mini', 'triad-v1.0', 'hash_jordan_day2_completions_1_journal_no', 'success', 0.016, 1300, 470, 3000, 'openai', NOW() - INTERVAL '2 days' + INTERVAL '21 hours', NOW() - INTERVAL '2 days' + INTERVAL '21 hours' + INTERVAL '3 seconds');

-- Sam's AI runs (Onboarding - Claude Sonnet for quality)
INSERT INTO ai_runs (id, user_id, module, model, prompt_version, input_hash, status, cost_estimate, input_tokens, output_tokens, execution_time_ms, provider, created_at, completed_at) VALUES
('3a333331-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
 'goal_breakdown', 'claude-3.7-sonnet', 'goal-breakdown-v1.0', 'hash_sam_onboarding_ml_goal', 'success', 0.085, 2000, 1200, 5000, 'anthropic', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '5 seconds'),
('3a333332-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
 'triad', 'gpt-4o-mini', 'triad-v1.0', 'hash_sam_day1_new_user', 'success', 0.014, 1100, 420, 3000, 'openai', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour' + INTERVAL '3 seconds');

-- ═══════════════════════════════════════════════════════════════════════
-- AI ARTIFACTS (Editable AI outputs - 1f = artifacts)
-- ═══════════════════════════════════════════════════════════════════════

-- Alex's artifacts (Triad + Recap)
INSERT INTO ai_artifacts (id, run_id, user_id, type, json, is_user_edited, edit_count, created_at) VALUES
('1f111111-1111-1111-1111-111111111111', '1a111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 'triad',
 '{"tasks": [{"rank": 1, "title": "Morning run (30 min)", "rationale": "You have a 95% completion rate for morning runs. Starting the day with exercise sets a positive tone."}, {"rank": 2, "title": "Code review 2+ PRs", "rationale": "Critical for your promotion goal. You consistently complete this and it demonstrates technical leadership."}, {"rank": 3, "title": "Lead daily standup", "rationale": "Scheduled for today (Mon/Wed/Fri pattern). Great opportunity to practice leadership."}]}'::jsonb,
 FALSE, 0, NOW() - INTERVAL '1 day' + INTERVAL '22 hours'),
('1f111112-1111-1111-1111-111111111111', '1a111112-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 'recap',
 '{"summary": "Excellent day! You completed all 3 binds and maintained your consistency streak.", "insights": ["Morning runs are your strongest habit - 95% completion rate", "Your leadership in code reviews is noticed by the team", "Book reading sessions are most successful in the evening"], "celebration": "🔥 7-day streak! You are demonstrating the consistency needed for senior engineer role."}'::jsonb,
 FALSE, 0, NOW() - INTERVAL '1 day' + INTERVAL '22 hours' + INTERVAL '5 minutes');

-- Jordan's artifact (Triad - user edited rank 3)
INSERT INTO ai_artifacts (id, run_id, user_id, type, json, is_user_edited, edit_count, created_at, updated_at) VALUES
('2f222221-2222-2222-2222-222222222222', '2a222221-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
 'triad',
 '{"tasks": [{"rank": 1, "title": "Ship 1 feature or fix 3 bugs", "rationale": "You completed this yesterday! Building momentum. Your MVP deadline is approaching."}, {"rank": 2, "title": "Code for 30 minutes", "rationale": "You skipped this yesterday. Even 30 minutes builds the habit. Start small and build consistency."}, {"rank": 3, "title": "Journal for 5 minutes", "rationale": "You skipped yesterday. Reflection helps you stay on track and identify patterns."}]}'::jsonb,
 TRUE, 1, NOW() - INTERVAL '2 days' + INTERVAL '21 hours', NOW() - INTERVAL '2 days' + INTERVAL '21 hours' + INTERVAL '15 minutes');

-- Sam's artifacts (Goal breakdown + first Triad)
INSERT INTO ai_artifacts (id, run_id, user_id, type, json, is_user_edited, edit_count, created_at) VALUES
('3f333331-3333-3333-3333-333333333333', '3a333331-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
 'goal_tree',
 '{"goal": {"title": "Complete ML course and build 3 projects", "description": "Finish Andrew Ng course, build practical projects, understand fundamentals"}, "qgoals": [{"metric": "Course modules completed", "target": "15 modules"}, {"metric": "Projects built", "target": "3 working projects"}, {"metric": "Study consistency", "target": "5 days/week"}], "binds": [{"title": "Complete 1 ML course module", "frequency": "daily", "estimated_minutes": 60}, {"title": "Code ML exercises", "frequency": "daily", "estimated_minutes": 45}]}'::jsonb,
 FALSE, 0, NOW() - INTERVAL '2 days'),
('3f333332-3333-3333-3333-333333333333', '3a333332-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
 'triad',
 '{"tasks": [{"rank": 1, "title": "Complete 1 ML course module", "rationale": "Your top goal is ML mastery. Start with your first module to build momentum."}, {"rank": 2, "title": "Code ML exercises", "rationale": "Hands-on practice reinforces learning. Even 30 minutes makes a difference."}, {"rank": 3, "title": "Journal - reflect on what you learned", "rationale": "Capture insights early. Helps with retention and builds the habit."}]}'::jsonb,
 FALSE, 0, NOW() - INTERVAL '1 hour');

-- ═══════════════════════════════════════════════════════════════════════
-- VALIDATION QUERIES (Run these to verify seed data)
-- ═══════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  RAISE NOTICE 'Running validation checks...';

  -- Verify all users have identity docs
  IF (SELECT COUNT(*) FROM user_profiles) != (SELECT COUNT(DISTINCT user_id) FROM identity_docs) THEN
    RAISE EXCEPTION 'Mismatch: Not all users have identity docs';
  END IF;

  -- Verify max 3 active goals constraint
  IF EXISTS (SELECT user_id FROM goals WHERE status = 'active' GROUP BY user_id HAVING COUNT(*) > 3) THEN
    RAISE EXCEPTION 'Constraint violation: User has more than 3 active goals';
  END IF;

  -- Output summary
  RAISE NOTICE '✅ Seed data loaded successfully!';
  RAISE NOTICE 'Users: %', (SELECT COUNT(*) FROM user_profiles);
  RAISE NOTICE 'Goals: %', (SELECT COUNT(*) FROM goals);
  RAISE NOTICE 'Binds (templates): %', (SELECT COUNT(*) FROM subtask_templates);
  RAISE NOTICE 'Scheduled binds (instances): %', (SELECT COUNT(*) FROM subtask_instances);
  RAISE NOTICE 'Completions: %', (SELECT COUNT(*) FROM subtask_completions);
  RAISE NOTICE 'Captures: %', (SELECT COUNT(*) FROM captures);
  RAISE NOTICE 'Journal entries: %', (SELECT COUNT(*) FROM journal_entries);
  RAISE NOTICE 'Daily aggregates: %', (SELECT COUNT(*) FROM daily_aggregates);
  RAISE NOTICE 'Triad tasks: %', (SELECT COUNT(*) FROM triad_tasks);
  RAISE NOTICE 'AI runs: %', (SELECT COUNT(*) FROM ai_runs);
  RAISE NOTICE 'AI artifacts: %', (SELECT COUNT(*) FROM ai_artifacts);
END $$;
