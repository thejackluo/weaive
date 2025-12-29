# Consistency Calculation Logic

**Last Updated:** December 24, 2025
**Epic:** 5 - Progress Visualization
**API Endpoint:** `GET /api/stats/consistency`
**File:** `weave-api/app/api/stats.py`

---

## 🎯 Design Goal

Create a consistency metric that:
- ✅ **Stays high** to motivate users (don't penalize for incomplete today)
- ✅ **Accurately captures misses** (yesterday's incomplete tasks DO count)
- ✅ **Updates in real-time** as users complete tasks today
- ✅ **Doesn't drop at midnight** when a new day starts

---

## 🧮 "Count Today If You've Started" Strategy

### Core Logic

**Include a day in the calculation if:**
1. It's a past day (< today), OR
2. It's today AND user has completed at least one task today

**Exclude a day if:**
- It's today AND user hasn't completed anything yet

### Why This Works

| Scenario | Scheduled | Completed | Include Today? | Result |
|----------|-----------|-----------|----------------|--------|
| **Day 1: First reflection** | 1 | 1 | ✅ Yes (started) | 1/1 = **100%** |
| **Day 1: + Bind created** | 2 | 1 | ✅ Yes (started) | 1/2 = **50%** |
| **Day 2 morning (nothing yet)** | Day 1: 2, Day 2: 2 | Day 1: 1 | ❌ No (not started) | 1/2 = **50%** |
| **Day 2: After reflection** | Day 1: 2, Day 2: 2 | Day 1: 1, Day 2: 1 | ✅ Yes (started) | 2/4 = **50%** |
| **Day 2: After both tasks** | Day 1: 2, Day 2: 2 | Day 1: 1, Day 2: 2 | ✅ Yes (started) | 3/4 = **75%** |
| **Day 3 morning (nothing yet)** | Day 1: 2, Day 2: 2 | Day 1: 1, Day 2: 2 | ❌ No (not started) | 3/4 = **75%** |

**Key Insight:** The percentage stays stable at midnight, then updates as you complete tasks during the day.

---

## 📊 What Counts as a "Task"?

### Two Types:

1. **Binds (Subtask Completions)**
   - Scheduled: When `subtask_instances` are created
   - Completed: When marked complete in `subtask_completions`
   - Can be one-time or recurring (daily, weekly)
   - **Only schedule past days' binds** (< today) to avoid penalizing incomplete future binds

2. **Daily Reflections (Journal Entries)**
   - Scheduled: 1 per day from first activity forward (up to today)
   - Completed: When `journal_entries` record exists for that day
   - Always daily (every day counts)
   - **Schedule up to and including today** (daily habit should be done each day)

### Scheduled Count Formula

```python
# For each date from first_activity to today:
scheduled[date] = (
    binds_scheduled_for_date +   # Only past days (< today)
    1                              # Daily reflection (every day <= today)
)
```

### Completed Count Formula

```python
# For each date:
completed[date] = (
    bind_completions[date] +      # All completed binds
    journal_entries[date]          # 1 if reflection exists, 0 otherwise
)
```

---

## 🔄 Rolling Window Logic

### Start Date Calculation

The rolling window starts from the user's **first activity**:

```python
first_completion_date = min(subtask_completions.completed_at)
first_journal_date = min(journal_entries.local_date)

start_date = min(first_completion_date, first_journal_date)
```

**Why:** Don't penalize users for days before they started using the app.

### End Date Calculation

```python
end_date = start_date + (timeframe_days - 1)
```

**Example (7-day timeframe):**
- Start: Dec 20 (first activity)
- End: Dec 26 (7 days forward)
- Shows: Dec 20, 21, 22, 23, 24, 25, 26

**Future days:** Shown in heatmap (grayed out) but not scheduled for binds or counted in %.

---

## 🔢 Complete Calculation Example

**User Timeline:**
- **Dec 24 (Day 1):** First journal reflection submitted
- **Dec 24 (Day 1):** Creates goal with 1 daily bind
- **Dec 25 (Day 2):** Wakes up, checks app

### Calculation at Each Step:

#### 1️⃣ Dec 24, 8pm - After Reflection

```python
Rolling start: Dec 24 (first activity)
Date range: Dec 24 - Dec 30 (7 days)

Scheduled:
  Dec 24: 1 reflection (daily habit)
  Dec 25-30: 1 reflection each (not scheduled yet - future)
  Total: 1

Completed:
  Dec 24: 1 reflection
  Total: 1

Today has completions: True → Include Dec 24
Consistency: 1/1 = 100%
```

#### 2️⃣ Dec 24, 9pm - After Creating Bind

```python
Scheduled:
  Dec 24: 1 reflection + 1 bind = 2
  Total: 2

Completed:
  Dec 24: 1 reflection (bind not done yet)
  Total: 1

Today has completions: True → Include Dec 24
Consistency: 1/2 = 50%
```

#### 3️⃣ Dec 25, 8am - Morning Check

```python
Scheduled:
  Dec 24: 2 (past day - counted)
  Dec 25: 0 binds (today - excluded) + 1 reflection (today - included) = 1
  Total: 3

Completed:
  Dec 24: 1
  Dec 25: 0
  Total: 1

Today has completions: False → Exclude Dec 25
Consistency: 1/2 = 50% (same as yesterday)
```

#### 4️⃣ Dec 25, 8pm - After Reflection Only

```python
Scheduled:
  Dec 24: 2
  Dec 25: 1 reflection = 1
  Total: 3

Completed:
  Dec 24: 1
  Dec 25: 1 reflection
  Total: 2

Today has completions: True → Include Dec 25
Consistency: 2/3 = 66.7%
```

#### 5️⃣ Dec 25, 9pm - After Bind + Reflection

```python
Scheduled:
  Dec 24: 2
  Dec 25: 1 bind (now in past days) + 1 reflection = 2
  Total: 4

Completed:
  Dec 24: 1
  Dec 25: 2 (bind + reflection)
  Total: 3

Today has completions: True → Include Dec 25
Consistency: 3/4 = 75%
```

---

## 🛡️ Edge Cases

### Edge Case 1: No Activity Yet
```python
scheduled = 0
completed = 0
consistency = 0%  # Avoids division by zero
```

### Edge Case 2: First Day, No Completions Yet
```python
scheduled = 1 (today's reflection)
completed = 0
today_has_completions = False → Exclude today
consistency = 0/0 → 0%  # No past data
```

**Note:** This edge case is rare - user must create account but not do onboarding reflection.

### Edge Case 3: Bind Scheduled for Future
```python
# User schedules a one-time bind for Dec 30 (future)
# Dec 30 is NOT counted in scheduled (only past + today)
# Doesn't affect consistency until Dec 30 arrives
```

### Edge Case 4: Instance Deleted After Completion
```python
# Completion exists but instance is missing
# Logic ensures we still count the completion
if scheduled_date not in scheduled_by_date:
    scheduled_by_date[scheduled_date] = 0
if scheduled_by_date[scheduled_date] == 0:
    scheduled_by_date[scheduled_date] = completed_by_date[scheduled_date]
```

---

## 💻 Code Implementation

### File: `weave-api/app/api/stats.py`

### Key Functions:

#### 1. Find First Activity (Lines 99-153)
```python
# Find first bind completion
first_completion_response = supabase.table("subtask_completions")...

# Find first journal entry
first_journal_response = supabase.table("journal_entries")...

# Use earlier of the two
start_date_obj = min(first_completion_date, first_journal_date)
```

#### 2. Fetch Scheduled Binds - Past Only (Lines 188-200)
```python
# Only fetch instances for dates in the rolling window
instances_response = supabase.table("subtask_instances")
    .select("id, scheduled_for_date")
    .eq("user_id", user_id)
    .gte("scheduled_for_date", start_date)
    .lte("scheduled_for_date", end_date_obj.isoformat())
    .execute()
```

#### 3. Add Daily Reflections (Lines 244-254)
```python
# Schedule 1 reflection for each day from first activity to today
current_date = start_date_obj
today = date.today()
while current_date <= min(end_date_obj, today):
    date_str = current_date.isoformat()
    scheduled_by_date[date_str] += 1  # Add daily reflection
    current_date += timedelta(days=1)
```

#### 4. Check If Today Has Completions (Lines 269-271)
```python
today_has_completions = completed_by_date.get(today_str, 0) > 0
```

#### 5. Include Days Conditionally (Lines 293-307)
```python
include_day = date_str < today_str or (date_str == today_str and today_has_completions)

if include_day:
    total_scheduled += scheduled_count
    total_completed += completed_count
```

---

## 🧪 Testing Scenarios

### Test 1: Day 1 - First Reflection
```bash
# Prerequisites: Clear all data
# Action: Submit journal reflection
# Expected: 100% consistency
```

### Test 2: Day 1 - Create Bind (Don't Complete)
```bash
# Prerequisites: Test 1 complete
# Action: Create a goal with daily bind
# Expected: 50% consistency (1/2)
```

### Test 3: Day 2 Morning - Wake Up
```bash
# Prerequisites: Test 2 complete, wait for midnight
# Action: Open app (don't complete anything)
# Expected: 50% consistency (still showing Day 1 only)
```

### Test 4: Day 2 - Complete Reflection
```bash
# Prerequisites: Test 3 complete
# Action: Submit journal reflection
# Expected: 66.7% consistency (2/3)
# Note: Day 2 bind not yet included in scheduled (only reflection)
```

### Test 5: Day 2 - Complete Bind
```bash
# Prerequisites: Test 4 complete
# Action: Complete Day 2 bind
# Expected: 75% consistency (3/4)
# Note: Day 2 bind NOW counted (was completed)
```

### Test 6: Day 3 Morning - Wake Up
```bash
# Prerequisites: Test 5 complete, wait for midnight
# Action: Open app (don't complete anything)
# Expected: 75% consistency (Day 1-2 only, Day 3 excluded)
```

---

## 🔍 Debugging

### Enable Debug Logs

```python
# In weave-api/app/api/stats.py
# These print statements are already included:

📊 [CONSISTENCY] Found X completions in range
📊 [CONSISTENCY] Found X scheduled instances
📊 [CONSISTENCY] Found X journal reflections
📊 [CONSISTENCY] Today has completions: True/False
📊 [CONSISTENCY] Scheduled by date (with reflections): {...}
📊 [CONSISTENCY] Completed by date (with reflections): {...}
   ✓ Including 2025-12-24: 1/2
   ✗ Excluding 2025-12-25: 0/2 (today, no completions yet)
📊 [CONSISTENCY] Overall consistency: 50.0%
```

### Check Backend Logs

```bash
# Local development
cd weave-api && uv run uvicorn app.main:app --reload

# Production (Railway)
railway logs
```

### Verify Data in Database

```sql
-- Check scheduled instances
SELECT scheduled_for_date, COUNT(*) as count
FROM subtask_instances
WHERE user_id = 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009'
GROUP BY scheduled_for_date
ORDER BY scheduled_for_date;

-- Check completions
SELECT sc.completed_at::date as completion_date, COUNT(*) as count
FROM subtask_completions sc
WHERE sc.user_id = 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009'
GROUP BY completion_date
ORDER BY completion_date;

-- Check journal entries
SELECT local_date, COUNT(*) as count
FROM journal_entries
WHERE user_id = 'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009'
GROUP BY local_date
ORDER BY local_date;
```

---

## 🎨 UX Implications

### Dashboard Display

**Overall Consistency Card:**
```
Overall Consistency          7d ▼
     75%
    +5.2%

[Overall] [Needle] [Bind] [Thread]

    S  S  M  T  W  T  F
   19 20 21 22 23 24 25
Daily
Check-in  [✓][✓][✓][✓][✓][ ][ ]
```

**Interpretation:**
- **75%** = Your consistency for past completed days
- **Green days** = Tasks completed on those days
- **Gray days** = Future days (not yet occurred)
- **Empty today** = Haven't completed tasks yet today

### Real-Time Updates

As the user completes tasks throughout the day:

| Time | Action | Consistency Changes |
|------|--------|---------------------|
| 8am | Wake up | 75% (yesterday's score) |
| 9am | Submit reflection | 75% → 77% (today now included) |
| 11am | Complete bind | 77% → 80% (today's second task) |
| Midnight | Day rolls over | 80% stays at 80% (new day excluded until started) |

---

## 🔧 Implementation Details

### Scheduled Count Logic

```python
# Binds: Fetch ALL instances in rolling window
# (Future binds shown in heatmap but excluded from % until they occur)
instances = supabase.table("subtask_instances")
    .gte("scheduled_for_date", start_date)
    .lte("scheduled_for_date", end_date)
    .execute()

# Reflections: Schedule 1 per day from first activity to TODAY
# (Not future days - you can't complete a reflection for tomorrow)
current_date = start_date_obj
while current_date <= min(end_date_obj, today):
    scheduled_by_date[date_str] += 1  # +1 daily reflection
    current_date += timedelta(days=1)
```

**Key Difference:**
- Binds: Fetched from database (instances table)
- Reflections: Calculated (1 per day up to today)

### Completed Count Logic

```python
# Binds: Count completed instances
for completion in completions:
    scheduled_date = instance["scheduled_for_date"]
    completed_by_date[scheduled_date] += 1

# Reflections: Count journal entries
for journal_entry in journal_entries:
    local_date = journal_entry["local_date"]
    completed_by_date[local_date] += 1
```

### Conditional Inclusion Logic

```python
today_str = date.today().isoformat()
today_has_completions = completed_by_date.get(today_str, 0) > 0

for date_str in all_dates:
    scheduled_count = scheduled_by_date[date_str]
    completed_count = completed_by_date[date_str]

    # Include day if past OR (today with completions)
    include_day = date_str < today_str or (date_str == today_str and today_has_completions)

    if include_day:
        total_scheduled += scheduled_count
        total_completed += completed_count
```

---

## 📈 Example Timeline with Real Data

### User: Alex (Starts Dec 20)

**Goals:**
- Morning Workout (daily bind: "Exercise 30 min")
- Learn Python (daily bind: "Code for 1 hour")

**Activity Log:**

| Date | Binds Scheduled | Binds Done | Reflection Done | Scheduled | Completed | Include? | Running % |
|------|-----------------|------------|-----------------|-----------|-----------|----------|-----------|
| Dec 20 | 2 | 2 | ✅ | 3 | 3 | ✅ (past) | 3/3 = **100%** |
| Dec 21 | 2 | 1 | ✅ | 3 | 2 | ✅ (past) | 5/6 = **83%** |
| Dec 22 | 2 | 2 | ❌ | 3 | 2 | ✅ (past) | 7/9 = **78%** |
| Dec 23 | 2 | 0 | ❌ | 3 | 0 | ✅ (past) | 7/12 = **58%** |
| Dec 24 | 2 | 0 | 0 | 3 | 0 | ❌ (today, no completions) | 7/12 = **58%** |

**Dec 24, 9am:** Alex submits reflection

| Date | Binds Scheduled | Binds Done | Reflection Done | Scheduled | Completed | Include? | Running % |
|------|-----------------|------------|-----------------|-----------|-----------|----------|-----------|
| ... | ... | ... | ... | ... | ... | ... | ... |
| Dec 24 | 2 | 0 | ✅ | 3 | 1 | ✅ (today, has completions) | 8/15 = **53%** |

**Dec 24, 11am:** Alex completes both binds

| Date | Binds Scheduled | Binds Done | Reflection Done | Scheduled | Completed | Include? | Running % |
|------|-----------------|------------|-----------------|-----------|-----------|----------|-----------|
| ... | ... | ... | ... | ... | ... | ... | ... |
| Dec 24 | 2 | 2 | ✅ | 3 | 3 | ✅ (today, has completions) | 10/15 = **67%** |

**Dec 25, 12:01am:** Midnight rolls over

| Date | Binds Scheduled | Binds Done | Reflection Done | Scheduled | Completed | Include? | Running % |
|------|-----------------|------------|-----------------|-----------|-----------|----------|-----------|
| ... | ... | ... | ... | ... | ... | ... | ... |
| Dec 24 | 2 | 2 | ✅ | 3 | 3 | ✅ (past) | 10/15 = **67%** |
| Dec 25 | 2 | 0 | 0 | 3 | 0 | ❌ (today, no completions) | 10/15 = **67%** |

**Result:** Consistency stays at 67% overnight! No midnight drop. ✅

---

## ⚠️ Important Notes

### 1. Past Binds Always Count

Even if a bind is scheduled for a past day and you complete it late, it counts for the original scheduled date:

```python
# Dec 20 bind completed on Dec 24
completion.completed_at = "2025-12-24 10:00"
instance.scheduled_for_date = "2025-12-20"

# Counts toward Dec 20's consistency (not Dec 24)
completed_by_date["2025-12-20"] += 1
```

### 2. Today's Binds Excluded Until Completed

Today's **scheduled** binds are shown in the heatmap but NOT counted in the percentage until you complete at least one task today.

This prevents the "morning penalty" where your % drops before you've had a chance to complete tasks.

### 3. Journal Reflections Are Special

Unlike binds (which can be scheduled for any date), reflections are:
- Scheduled for EVERY day from first activity to today
- Expected to be completed each day
- Cannot be "scheduled" for future days (you can't reflect on tomorrow)

### 4. Consistency Delta Calculation

The delta (week-over-week change) should use the SAME logic:
- Previous period: Exclude the last day of that period
- Current period: Exclude today (unless today has completions)
- This ensures apples-to-apples comparison

---

## 🚀 Future Enhancements

### Option: "Partial Credit" for Today

Instead of all-or-nothing (include/exclude today), give partial credit:

```python
# If today is 50% complete (1/2 tasks), add 50% of today's weight
today_percentage = completed_by_date[today_str] / scheduled_by_date[today_str]
total_scheduled += scheduled_by_date[today_str] * today_percentage
total_completed += completed_by_date[today_str]
```

**Result:** More granular updates throughout the day.

### Option: Separate "Today's Progress" Metric

Show two metrics:
- **Overall Consistency:** Past days only (stable)
- **Today's Progress:** Today's tasks only (real-time)

---

## 📖 Related Documentation

- **API Implementation:** `weave-api/app/api/stats.py`
- **Frontend Integration:** `weave-mobile/src/services/consistency.ts`
- **Test Data Scripts:** `scripts/test-scenarios/add-goal-with-history.sql`
- **Epic Specification:** `docs/prd/epic-5-progress-visualization.md`
- **Story Specification:** `docs/stories/5-2-consistency-heat-map.md`

---

## 🔄 Changelog

| Date | Change | Reason |
|------|--------|--------|
| Dec 24, 2025 | Initial implementation | Binds only |
| Dec 24, 2025 | Added journal reflections | User requested journals count as binds |
| Dec 24, 2025 | Implemented "Count Today If Started" | Balance motivation with accuracy |

---

**This document captures the complete consistency calculation logic. Reference this when debugging percentage issues or making future changes to the algorithm.** 🎯
