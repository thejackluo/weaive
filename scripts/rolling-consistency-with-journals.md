# Rolling Consistency with Journal Reflections

## ✅ What I Fixed

**Problem:** My initial implementation added 1 scheduled reflection for EVERY day in the range, breaking the "rolling" nature of consistency tracking.

**Solution:** Preserve the rolling consistency logic by starting from the user's FIRST activity (completion OR journal), not from an arbitrary date.

---

## 🔄 Rolling Consistency Logic

### Before (Binds Only):
```
1. Find user's first bind completion date
2. Start counting from that date (not today - 7 days)
3. Show N days forward from first activity
4. Calculate: (completed_binds / scheduled_binds) × 100
```

### After (Binds + Journals):
```
1. Find user's first bind completion date
2. Find user's first journal entry date
3. Start counting from EARLIER of the two (first activity)
4. From that date forward, count daily reflections as scheduled
5. Calculate: (completed_binds + journals) / (scheduled_binds + days) × 100
```

---

## 📊 Example Scenarios

### Scenario 1: Journal First, Then Binds
**Timeline:**
- Dec 20: First journal entry ← **Rolling starts here**
- Dec 21: Journal entry
- Dec 22: First bind completion + journal
- Dec 23: Bind completion + journal
- Dec 24: Journal entry (today)

**Calculation (7-day timeframe):**
```
Rolling start: Dec 20 (first activity)
Date range: Dec 20 - Dec 26 (7 days)

Scheduled:
  - Binds: 2 (Dec 22, Dec 23)
  - Reflections: 7 (Dec 20-26, one per day)
  - Total: 9

Completed:
  - Binds: 2
  - Journals: 5 (Dec 20, 21, 22, 23, 24)
  - Total: 7

Consistency: 7/9 = 77.8%
```

---

### Scenario 2: Binds First, Then Journals
**Timeline:**
- Dec 18: First bind completion ← **Rolling starts here**
- Dec 19: Bind completion
- Dec 20: Bind completion
- Dec 21: First journal entry
- Dec 22: Bind completion + journal
- Dec 23: Journal entry
- Dec 24: Journal entry (today)

**Calculation (7-day timeframe):**
```
Rolling start: Dec 18 (first activity)
Date range: Dec 18 - Dec 24 (7 days)

Scheduled:
  - Binds: 4 (Dec 18, 19, 20, 22)
  - Reflections: 7 (Dec 18-24, one per day)
  - Total: 11

Completed:
  - Binds: 4
  - Journals: 4 (Dec 21, 22, 23, 24)
  - Total: 8

Consistency: 8/11 = 72.7%
```

---

### Scenario 3: No Binds, Journals Only (Your Current Case)
**Timeline:**
- Dec 24: First journal entry ← **Rolling starts here**

**Calculation (7-day timeframe):**
```
Rolling start: Dec 24 (first activity)
Date range: Dec 24 - Dec 30 (7 days)

Scheduled:
  - Binds: 0
  - Reflections: 7 (Dec 24-30, one per day)
  - Total: 7

Completed:
  - Binds: 0
  - Journals: 1 (Dec 24)
  - Total: 1

Consistency: 1/7 = 14.3%
```

**Note:** Even though you only have 1 journal entry, the rolling window shows 7 days forward from your first activity, giving you 6 more days to complete reflections.

---

## 🔑 Key Differences from Before

| Aspect | Before | After |
|--------|--------|-------|
| **Start date** | First bind completion | Earlier of (first completion OR first journal) |
| **Scheduled reflections** | None | 1 per day from first activity forward |
| **Journal impact** | None (separate metric) | Counts toward consistency % |
| **Rolling behavior** | Only binds trigger rolling | Binds OR journals trigger rolling |

---

## 📝 Code Changes

**File:** `weave-api/app/api/stats.py`

### Change 1: Find First Journal Date (Lines 116-124)
```python
# Find user's first journal entry date (rolling consistency includes journals)
first_journal_response = (
    supabase.table("journal_entries")
    .select("local_date")
    .eq("user_id", user_id)
    .order("local_date", desc=False)
    .limit(1)
    .execute()
)
```

### Change 2: Use Earlier of First Activity (Lines 144-153)
```python
# Use the EARLIER of first completion or first journal (rolling from first activity)
if first_completion_date and first_journal_date:
    start_date_obj = min(first_completion_date, first_journal_date)
elif first_completion_date:
    start_date_obj = first_completion_date
elif first_journal_date:
    start_date_obj = first_journal_date
else:
    # No activity yet - use default timeframe (today - N days)
    start_date_obj = date.today() - timedelta(days=days - 1)
```

### Change 3: Add Daily Reflections (Lines 238-256)
```python
# Step 4: Add journal reflections to consistency calculation
# Each day in the range has 1 scheduled "daily reflection" task
# Each day with a journal entry counts as 1 completed task
current_date = start_date_obj
while current_date <= end_date_obj:
    date_str = current_date.isoformat()
    # Add 1 scheduled reflection for each day
    scheduled_by_date[date_str] += 1
    current_date += timedelta(days=1)

# Add journal entries as completions
for journal_entry in journal_entries:
    local_date = journal_entry.get("local_date")
    if local_date:
        completed_by_date[local_date] += 1
```

---

## 🧪 Testing

### Test 1: Verify Rolling Start Date
```bash
# Add journal entry today
# Check backend logs for: "Rolling start date: 2025-12-24"
# Should start from today, not 7 days ago
```

### Test 2: Add Past Journals
```sql
-- Add journals for past 6 days
INSERT INTO journal_entries (id, user_id, local_date, fulfillment_score, reflection_text, created_at)
SELECT
  gen_random_uuid(),
  'a6fcb84c-2fa6-4ba9-a621-3a6d74f98009',
  (CURRENT_DATE + i)::date,
  8,
  'Productive day!',
  ((CURRENT_DATE + i) || ' 20:00:00')::timestamp
FROM generate_series(1, 6) AS i;
```

**Expected:** Consistency should show 100% (7/7 reflections completed)

### Test 3: Add Bind Before Journal
```sql
-- Add a bind completion for Dec 20 (before your first journal)
-- This should shift the rolling start date to Dec 20
```

**Expected:** Rolling start date should move to Dec 20, consistency recalculated

---

## 🚀 Deploy

```bash
git add weave-api/app/api/stats.py
git commit -m "fix: preserve rolling consistency logic with journal reflections"
git push origin main
```

---

## 📖 Design Philosophy

**Rolling consistency** means:
- Start counting from when the user BEGINS using the app (first activity)
- Not from an arbitrary date (like today - 7 days)
- This prevents punishing users for days before they signed up
- As users accumulate more data, the rolling window shows their recent N days

**Including journals:**
- Daily reflection is a recurring task (like a daily bind)
- Scheduled for every day from first activity forward
- Counts toward overall consistency %
- Encourages both task completion AND reflection habits

---

**Result:** Your consistency metric now reflects BOTH action (completing binds) AND reflection (writing journals), while preserving the rolling window behavior! 🎉
