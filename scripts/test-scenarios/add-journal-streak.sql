-- ============================================================================
-- Test Scenario: Create 10-Day Journal Streak
-- ============================================================================
-- Adds journal entries for the past 10 days with varying fulfillment scores
-- Use this to test fulfillment tracking and journal UI
-- ============================================================================

INSERT INTO journal_entries (
  id,
  user_id,
  local_date,
  fulfillment_score,
  reflection_text,
  created_at
)
SELECT
  gen_random_uuid(),
  'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009',
  (CURRENT_DATE - i)::date,
  (6 + (RANDOM() * 4)::integer),  -- Random score 6-10
  CASE
    WHEN (RANDOM() * 10)::integer % 3 = 0 THEN 'Crushed my goals today! Feeling unstoppable.'
    WHEN (RANDOM() * 10)::integer % 3 = 1 THEN 'Solid progress on my projects. Kept the momentum going.'
    ELSE 'Productive day! Made consistent progress toward my dream self.'
  END,
  ((CURRENT_DATE - i) || ' 20:00:00')::timestamp
FROM generate_series(0, 9) AS i;

-- Verify
SELECT
  '10-day journal streak created!' as status,
  COUNT(*) as total_entries,
  AVG(fulfillment_score)::numeric(10,1) as avg_fulfillment,
  MIN(local_date) as earliest_entry,
  MAX(local_date) as latest_entry
FROM journal_entries
WHERE user_id = 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009';
