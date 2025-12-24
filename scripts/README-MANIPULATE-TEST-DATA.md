# Manipulate Test User Data - Complete Guide

## Test User Info
- **Email:** test.weave@anthropic.com
- **Password:** Test1234!
- **Profile ID:** `a6fcb84c-2fa6-4ba9-a621-3a6d74f98009`
- **Auth User ID:** `f55cabd7-ee5d-4109-af9e-6baa94726295`

---

## Method 1: Supabase SQL Editor (Recommended for Complex Operations)

**URL:** https://supabase.com/dashboard/project/jywfusrgwybljusuofnp/sql/new

**Advantages:**
- ✅ Full admin permissions (bypasses RLS)
- ✅ Can manipulate append-only tables
- ✅ Supports transactions and complex queries
- ✅ See immediate results

### Example: Add a Goal with Subtasks

```sql
-- Insert a new goal
INSERT INTO goals (id, user_id, title, description, status, target_date)
VALUES (
  gen_random_uuid(),
  'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009',
  'Build a Side Project',
  'Launch my app in 10 days',
  'active',
  (CURRENT_DATE + INTERVAL '10 days')::date
)
RETURNING id, title;

-- Use the returned ID to create subtasks
-- (Replace 'YOUR_GOAL_ID' with the UUID from above)
INSERT INTO subtask_templates (id, goal_id, title, description, category, recurrence_pattern)
VALUES
  (gen_random_uuid(), 'YOUR_GOAL_ID', 'Write code for 1 hour', 'Focus on core features', 'habit', 'daily'),
  (gen_random_uuid(), 'YOUR_GOAL_ID', 'Test on real device', 'Deploy to TestFlight', 'one_time', 'once');
```

### Example: Add Completions (Bypassing Append-Only)

```sql
-- Temporarily disable append-only protection
ALTER TABLE subtask_completions DISABLE TRIGGER USER;

-- Add completions for yesterday
INSERT INTO subtask_completions (
  id, user_id, subtask_instance_id, completed_at,
  local_date, was_today, timer_seconds, proof_type
)
VALUES (
  gen_random_uuid(),
  'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009',
  'YOUR_SUBTASK_INSTANCE_ID',  -- Get from subtask_instances table
  CURRENT_TIMESTAMP - INTERVAL '1 day',
  (CURRENT_DATE - INTERVAL '1 day')::date,
  false,
  1500,  -- 25 minutes
  'timer'
);

-- Re-enable protection
ALTER TABLE subtask_completions ENABLE TRIGGER USER;

-- Verify
SELECT * FROM subtask_completions
WHERE user_id = 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009'
ORDER BY completed_at DESC
LIMIT 5;
```

### Example: Add Journal Entries

```sql
INSERT INTO journal_entries (
  id, user_id, local_date,
  fulfillment_score, reflection_text,
  created_at
)
VALUES (
  gen_random_uuid(),
  'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009',
  CURRENT_DATE - INTERVAL '1 day',
  8,  -- Fulfillment score 0-10
  'Today was productive! Completed all my goals and felt energized.',
  CURRENT_TIMESTAMP - INTERVAL '1 day'
);
```

### Example: Update Daily Aggregates

```sql
INSERT INTO daily_aggregates (
  id, user_id, local_date,
  total_scheduled, total_completed,
  completion_percentage, streak_days,
  created_at, updated_at
)
VALUES (
  gen_random_uuid(),
  'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009',
  CURRENT_DATE - INTERVAL '1 day',
  5,  -- 5 tasks scheduled
  4,  -- 4 completed
  80.0,  -- 80% completion rate
  7,  -- 7 day streak
  CURRENT_TIMESTAMP - INTERVAL '1 day',
  CURRENT_TIMESTAMP - INTERVAL '1 day'
)
ON CONFLICT (user_id, local_date)
DO UPDATE SET
  total_scheduled = EXCLUDED.total_scheduled,
  total_completed = EXCLUDED.total_completed,
  completion_percentage = EXCLUDED.completion_percentage,
  streak_days = EXCLUDED.streak_days,
  updated_at = EXCLUDED.updated_at;
```

---

## Method 2: Supabase Table Editor (Best for Simple Edits)

**URL:** https://supabase.com/dashboard/project/jywfusrgwybljusuofnp/editor

**Advantages:**
- ✅ Visual interface (no SQL needed)
- ✅ Great for viewing data
- ✅ Quick edits to individual fields

**Disadvantages:**
- ❌ RLS policies may block edits
- ❌ Can't manipulate append-only tables (subtask_completions)
- ❌ No bulk operations

### Steps:
1. Click "Table Editor" in left sidebar
2. Select table (e.g., `goals`)
3. Filter by user_id: `a6fcb84c-2fa6-4ba9-a621-3a6d74f98009`
4. Click "Insert row" or click a cell to edit
5. Click "Save"

**Use for:**
- Viewing current data
- Quick edits to goals/subtasks
- Checking data after API calls

---

## Method 3: Python Scripts (Best for Complex Test Scenarios)

**Advantages:**
- ✅ Programmatic data generation
- ✅ Repeatable test scenarios
- ✅ Can use Supabase service key (bypasses RLS)

### Template Script

```python
#!/usr/bin/env python3
"""
Add Test Data - Example Template
"""
import os
from datetime import date, timedelta
from supabase import create_client, Client

# Test user constants
TEST_USER_ID = "a6fcb84c-2fa6-4ba9-a621-3a6d74f98009"

def main():
    # Load .env from weave-api
    env_path = os.path.join(os.path.dirname(__file__), "..", "weave-api", ".env")

    url = None
    service_key = None

    with open(env_path) as f:
        for line in f:
            if line.startswith("SUPABASE_URL"):
                url = line.split("=")[1].strip()
            elif line.startswith("SUPABASE_SERVICE_KEY"):
                service_key = line.split("=")[1].strip()

    # Connect with service role (bypasses RLS)
    supabase: Client = create_client(url, service_key)

    # Example: Add a goal
    goal_response = supabase.table("goals").insert({
        "user_id": TEST_USER_ID,
        "title": "Learn Python",
        "description": "Master Python in 10 days",
        "status": "active",
        "target_date": str(date.today() + timedelta(days=10))
    }).execute()

    goal_id = goal_response.data[0]["id"]
    print(f"✅ Created goal: {goal_id}")

    # Example: Add subtasks
    subtask_response = supabase.table("subtask_templates").insert([
        {
            "goal_id": goal_id,
            "title": "Code for 1 hour",
            "category": "habit",
            "recurrence_pattern": "daily"
        },
        {
            "goal_id": goal_id,
            "title": "Read Python docs",
            "category": "one_time",
            "recurrence_pattern": "once"
        }
    ]).execute()

    print(f"✅ Created {len(subtask_response.data)} subtasks")

    # Example: Add journal entry
    journal_response = supabase.table("journal_entries").insert({
        "user_id": TEST_USER_ID,
        "local_date": str(date.today() - timedelta(days=1)),
        "fulfillment_score": 7,
        "reflection_text": "Productive day! Made good progress on my goals."
    }).execute()

    print(f"✅ Created journal entry")

if __name__ == "__main__":
    main()
```

**Save as:** `scripts/add-test-data.py`

**Run:**
```bash
cd weave-api && uv run python ../scripts/add-test-data.py
```

---

## Method 4: API Endpoints (Best for Testing Backend)

**Advantages:**
- ✅ Tests actual API endpoints
- ✅ Validates business logic
- ✅ Ensures frontend will work

### Using curl

```bash
# Get JWT token first
curl -X POST https://jywfusrgwybljusuofnp.supabase.co/auth/v1/token?grant_type=password \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.weave@anthropic.com",
    "password": "Test1234!"
  }'

# Use token to create a goal
curl -X POST https://weave-api-production.railway.app/api/goals \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Launch App",
    "description": "Ship MVP in 10 days",
    "target_date": "2025-12-31"
  }'
```

### Using Python requests

```python
import requests

# Get JWT token
auth_response = requests.post(
    "https://jywfusrgwybljusuofnp.supabase.co/auth/v1/token?grant_type=password",
    json={"email": "test.weave@anthropic.com", "password": "Test1234!"},
    headers={"apikey": "YOUR_ANON_KEY"}
)
token = auth_response.json()["access_token"]

# Create goal via API
goal_response = requests.post(
    "https://weave-api-production.railway.app/api/goals",
    json={
        "title": "Launch App",
        "description": "Ship MVP in 10 days",
        "target_date": "2025-12-31"
    },
    headers={"Authorization": f"Bearer {token}"}
)

print(goal_response.json())
```

---

## Common Test Scenarios

### Scenario 1: Create a Goal with 7-Day Completion History

```sql
-- 1. Create goal
INSERT INTO goals (id, user_id, title, status, target_date)
VALUES (gen_random_uuid(), 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009', 'Morning Workout', 'active', CURRENT_DATE + 7)
RETURNING id;

-- 2. Create subtask template (use goal ID from above)
INSERT INTO subtask_templates (id, goal_id, title, category, recurrence_pattern)
VALUES (gen_random_uuid(), 'YOUR_GOAL_ID', 'Exercise for 30 min', 'habit', 'daily')
RETURNING id;

-- 3. Create instances for past 7 days (use template ID)
INSERT INTO subtask_instances (id, user_id, template_id, instance_date, status)
SELECT
  gen_random_uuid(),
  'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009',
  'YOUR_TEMPLATE_ID',
  (CURRENT_DATE - i)::date,
  'pending'
FROM generate_series(0, 6) AS i;

-- 4. Mark 5 out of 7 days as completed
ALTER TABLE subtask_completions DISABLE TRIGGER USER;

INSERT INTO subtask_completions (id, user_id, subtask_instance_id, completed_at, local_date, was_today)
SELECT
  gen_random_uuid(),
  'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009',
  si.id,
  (si.instance_date || ' 08:00:00')::timestamp,
  si.instance_date,
  false
FROM subtask_instances si
WHERE si.user_id = 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009'
  AND si.instance_date >= CURRENT_DATE - 6
  AND si.instance_date != CURRENT_DATE - 1  -- Skip 2 days
  AND si.instance_date != CURRENT_DATE - 4
LIMIT 5;

ALTER TABLE subtask_completions ENABLE TRIGGER USER;

-- Result: 5/7 days completed = ~71% consistency
```

### Scenario 2: Test Max 3 Active Goals Limit

```sql
-- Try to add 4 goals (should fail with trigger error)
INSERT INTO goals (id, user_id, title, status)
VALUES
  (gen_random_uuid(), 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009', 'Goal 1', 'active'),
  (gen_random_uuid(), 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009', 'Goal 2', 'active'),
  (gen_random_uuid(), 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009', 'Goal 3', 'active'),
  (gen_random_uuid(), 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009', 'Goal 4', 'active');  -- Should fail!
```

### Scenario 3: Create Journal Streak

```sql
-- Add journal entries for past 10 days
INSERT INTO journal_entries (id, user_id, local_date, fulfillment_score, reflection_text, created_at)
SELECT
  gen_random_uuid(),
  'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009',
  (CURRENT_DATE - i)::date,
  (RANDOM() * 4 + 6)::integer,  -- Random score 6-10
  'Productive day!',
  (CURRENT_DATE - i || ' 20:00:00')::timestamp
FROM generate_series(0, 9) AS i;
```

---

## Quick Reference Card

| Task | Best Method | Notes |
|------|-------------|-------|
| Add goals/subtasks | SQL Editor or Python | Respects FK constraints |
| Add completions | SQL Editor | Must disable trigger |
| View current data | Table Editor | Visual interface |
| Test API endpoints | curl/requests | Tests full stack |
| Complex scenarios | Python script | Repeatable |
| Bulk operations | SQL Editor | Fast and flexible |

---

## Important Notes

### Append-Only Tables (Can't Edit/Delete Normally)
- `subtask_completions`
- `journal_entries` (by convention)
- `captures` (by convention)

**To manipulate:** Disable trigger first:
```sql
ALTER TABLE subtask_completions DISABLE TRIGGER USER;
-- ... your changes ...
ALTER TABLE subtask_completions ENABLE TRIGGER USER;
```

### Foreign Key Order (Must Respect)
1. `user_profiles` (parent)
2. `goals` (requires user_id)
3. `subtask_templates` (requires goal_id)
4. `subtask_instances` (requires template_id)
5. `subtask_completions` (requires instance_id)

### RLS Bypass
- **SQL Editor:** Automatically bypasses RLS (runs as admin)
- **Table Editor:** May be blocked by RLS policies
- **Python with service_role:** Bypasses RLS
- **Python with user JWT:** Enforces RLS (good for testing)

---

**Pro Tip:** Create reusable SQL snippets and save them in `scripts/test-scenarios/` for common test setups!
