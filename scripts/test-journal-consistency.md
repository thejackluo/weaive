# Test Journal Reflections in Consistency

## What Changed

**Overall Consistency** now includes journal reflections as if they were a daily bind:

### Before:
- Consistency = `(bind_completions / scheduled_binds) × 100`
- Journal reflections only showed in "Daily Check-in" heatmap
- 0 binds = 0% consistency (even with journal entries)

### After:
- Consistency = `((bind_completions + journal_reflections) / (scheduled_binds + days_in_range)) × 100`
- Each day counts as 1 "scheduled daily reflection"
- Each journal entry counts as 1 completed task
- Journal reflections now contribute to Overall Consistency %

---

## Example Calculation

**Scenario:** 7-day timeframe with no binds, 1 journal reflection today

### Before:
```
scheduled_binds = 0
bind_completions = 0
consistency = 0 / 0 = 0%
```

### After:
```
scheduled_binds = 0
scheduled_reflections = 7 days × 1 = 7
total_scheduled = 0 + 7 = 7

bind_completions = 0
journal_reflections = 1 (today)
total_completed = 0 + 1 = 1

consistency = 1 / 7 = 14.3%
```

---

## How to Test

### Step 1: Clear existing data (optional)
```bash
# Run in Supabase SQL Editor
cat scripts/clear-test-data-final.sql
```

### Step 2: Submit a journal reflection
1. Open mobile app
2. Go to Journal tab
3. Submit a reflection for today

### Step 3: Check Dashboard
1. Go to Dashboard tab
2. **Expected:** Overall Consistency should show > 0%
3. For 7-day timeframe with 1 reflection: **~14%** (1/7)
4. Daily Check-in heatmap should show checkmark for today

### Step 4: Add more reflections
```sql
-- Run in Supabase SQL Editor to add 6 more days of reflections
INSERT INTO journal_entries (id, user_id, local_date, fulfillment_score, reflection_text, created_at)
SELECT
  gen_random_uuid(),
  'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009',
  (CURRENT_DATE - i)::date,
  (6 + (RANDOM() * 4)::integer),
  'Productive day!',
  ((CURRENT_DATE - i) || ' 20:00:00')::timestamp
FROM generate_series(1, 6) AS i;
```

**Expected:** Consistency should now show **100%** (7/7 reflections)

### Step 5: Add binds to test combined calculation
```bash
cd weave-api && uv run python ../scripts/add-test-goal.py
```

This adds:
- 5 bind completions over 7 days
- Combined with 7 journal reflections
- **Expected:** (5 + 7) / (7 + 7) = 12/14 = **85.7% consistency**

---

## API Changes

### GET /api/stats/consistency

**Response format (unchanged):**
```json
{
  "data": [
    {
      "date": "2025-12-24",
      "completion_percentage": 100,
      "completed_count": 2,  // 1 bind + 1 journal
      "total_count": 2       // 1 scheduled bind + 1 daily reflection
    }
  ],
  "meta": {
    "consistency_percentage": 85.7,  // Now includes journal reflections
    "consistency_delta": 10.5,       // Delta also includes journals
    "total_scheduled": 14,           // Binds + daily reflections
    "total_completed": 12            // Bind completions + journal entries
  }
}
```

---

## Backend Logic

**File:** `weave-api/app/api/stats.py`

**Key changes:**
1. Fetch `journal_entries` for date range (line 182-193)
2. Add 1 "scheduled reflection" per day in range (line 218-226)
3. Add journal entries to completion count (line 228-232)
4. Include journals in delta calculation (line 350-365)

**Debug output:**
```
📊 [CONSISTENCY] Found 5 completions in range
📊 [CONSISTENCY] Found 7 scheduled instances
📊 [CONSISTENCY] Found 7 journal reflections
📊 [CONSISTENCY] Scheduled by date (with reflections): {'2025-12-18': 2, '2025-12-19': 2, ...}
📊 [CONSISTENCY] Completed by date (with reflections): {'2025-12-18': 2, '2025-12-19': 1, ...}
```

---

## Edge Cases

### No binds, no journals
- Scheduled: 7 days × 1 reflection = 7
- Completed: 0
- **Consistency: 0%**

### No binds, full journal streak
- Scheduled: 7 × 1 = 7
- Completed: 7 journals
- **Consistency: 100%**

### Binds only, no journals
- Scheduled: 7 binds + 7 reflections = 14
- Completed: 7 binds + 0 journals = 7
- **Consistency: 50%**

### Full completion (binds + journals)
- Scheduled: 7 binds + 7 reflections = 14
- Completed: 7 binds + 7 journals = 14
- **Consistency: 100%**

---

## Deployment

Backend changes are in `app/api/stats.py`. Deploy to Railway:

```bash
# Automatic deployment (if GitHub Actions configured)
git add weave-api/app/api/stats.py
git commit -m "feat: include journal reflections in consistency calculation"
git push origin main

# Manual deployment (if needed)
cd weave-api && railway up
```

**Mobile app:** No changes needed - uses existing consistency API.

---

## Rollback (if needed)

Revert the changes to `app/api/stats.py`:

```bash
git revert <commit-hash>
git push origin main
```

Or restore original logic:
1. Remove journal query (lines 182-193)
2. Remove journal inclusion in scheduled/completed counts (lines 218-232)
3. Remove journal from delta calculation (lines 350-365)
