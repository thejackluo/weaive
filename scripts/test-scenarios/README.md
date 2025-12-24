# Test Scenarios - Ready-to-Use SQL Scripts

Quick test data creation scripts for common scenarios.

## Available Scenarios

### 1. Goal with Completion History
**File:** `add-goal-with-history.sql`

**What it does:**
- Creates a goal: "Morning Workout"
- Adds daily subtask: "Exercise for 30 min"
- Creates 7 days of instances
- Marks 5/7 days as completed (71% consistency)

**Use for:**
- Testing heat map visualization
- Verifying consistency calculations
- Checking streak logic

**How to run:**
1. Open Supabase SQL Editor
2. Copy entire file
3. Replace `YOUR_GOAL_ID` and `YOUR_TEMPLATE_ID` with actual UUIDs from results
4. Run each section sequentially

---

### 2. Journal Streak
**File:** `add-journal-streak.sql`

**What it does:**
- Creates 10 journal entries (past 10 days)
- Random fulfillment scores (6-10)
- Varied reflection text

**Use for:**
- Testing fulfillment tracking
- Journal UI display
- Average fulfillment calculations

**How to run:**
1. Open Supabase SQL Editor
2. Copy and paste entire file
3. Click "Run"

---

## Quick Usage

### Supabase SQL Editor
```
https://supabase.com/dashboard/project/jywfusrgwybljusuofnp/sql/new
```

### Run All Scenarios at Once
```sql
-- Clear existing data first
\i scripts/clear-test-data-final.sql

-- Add goal with history
\i scripts/test-scenarios/add-goal-with-history.sql

-- Add journal streak
\i scripts/test-scenarios/add-journal-streak.sql
```

---

## Creating Your Own Scenarios

### Template

```sql
-- ============================================================================
-- Test Scenario: [Your Scenario Name]
-- ============================================================================
-- Description of what this does
-- ============================================================================

-- Your SQL here...

-- Verify
SELECT 'Success!' as status, COUNT(*) as rows_created
FROM your_table
WHERE user_id = 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009';
```

### Save in this directory
`scripts/test-scenarios/your-scenario-name.sql`

---

## Common Patterns

### Create Multiple Goals
```sql
INSERT INTO goals (id, user_id, title, status)
VALUES
  (gen_random_uuid(), 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009', 'Goal 1', 'active'),
  (gen_random_uuid(), 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009', 'Goal 2', 'active'),
  (gen_random_uuid(), 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009', 'Goal 3', 'completed');
```

### Create Date Range
```sql
-- Generate 30 days of data
SELECT generate_series(0, 29) AS day_offset;

-- Use in INSERT
INSERT INTO daily_aggregates (user_id, local_date, ...)
SELECT
  'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009',
  (CURRENT_DATE - i)::date,
  ...
FROM generate_series(0, 29) AS i;
```

### Random Data
```sql
-- Random integer 1-10
(1 + (RANDOM() * 9)::integer)

-- Random boolean
(RANDOM() > 0.5)

-- Random choice
CASE (RANDOM() * 3)::integer
  WHEN 0 THEN 'option_a'
  WHEN 1 THEN 'option_b'
  ELSE 'option_c'
END
```

---

## Pro Tips

1. **Always verify:** Add a `SELECT` at the end to confirm data was created
2. **Use transactions:** Wrap in `BEGIN; ... COMMIT;` to rollback on error
3. **Comment heavily:** Future you will thank you
4. **Version control:** Commit test scenarios to git for reuse

---

**See also:** `scripts/README-MANIPULATE-TEST-DATA.md` for comprehensive guide
