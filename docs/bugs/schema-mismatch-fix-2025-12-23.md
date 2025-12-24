# Schema Mismatch Fixes - 2025-12-23

**Problem:** Needles created with binds, but binds not appearing in Thread tab

**Root Cause:** Code was using wrong enum values and querying non-existent columns

---

## Issues Found

### Issue 1: Wrong subtask_status Enum Value ❌

**Error from logs:**
```
ERROR: invalid input value for enum subtask_status: "pending"
```

**Problem:**
- Code used: `"status": "pending"`
- Database enum has: `'planned', 'done', 'skipped', 'snoozed'`
- Result: subtask_instances INSERT failed silently

**Fix:** `weave-api/app/api/goals/router.py:459`
```python
# Before:
"status": "pending",

# After:
"status": "planned",  # subtask_status enum: 'planned', 'done', 'skipped', 'snoozed'
```

---

### Issue 2: Non-Existent Column in Query ❌

**Error from logs:**
```
ERROR: column subtask_templates.description does not exist
```

**Problem:**
- Code queried: `"description, frequency_type, frequency_value"`
- Database schema only has: `title, default_estimated_minutes, recurrence_rule` (no description)
- Result: Binds query failed, empty array returned

**Fix:** `weave-api/app/api/goals/router.py:272`
```python
# Before:
.select("id, goal_id, title, description, frequency_type, frequency_value, is_archived, created_at, updated_at")

# After:
.select("id, goal_id, title, default_estimated_minutes, recurrence_rule, is_archived, created_at, updated_at")
```

---

## Database Schema Reference

### subtask_status Enum
```sql
CREATE TYPE subtask_status AS ENUM ('planned', 'done', 'skipped', 'snoozed');
```

### subtask_templates Table
```sql
CREATE TABLE subtask_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,  -- ✅ EXISTS
  default_estimated_minutes INT NOT NULL CHECK (default_estimated_minutes >= 0),  -- ✅ EXISTS
  difficulty INT CHECK (difficulty >= 1 AND difficulty <= 15),
  recurrence_rule TEXT,  -- ✅ EXISTS (iCal RRULE format)
  is_archived BOOLEAN DEFAULT FALSE,
  created_by created_by_type DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ❌ NO description column
-- ❌ NO frequency_type column
-- ❌ NO frequency_value column
```

---

## Testing Steps

1. **Create a new needle with 2 binds** (from Dashboard)
2. **Navigate to Thread tab**
3. **Expected result:** Both binds should now appear immediately under today's date

---

## What Was Blocking the Original Fix

The fix from earlier session added instance creation logic, but:
1. Used wrong enum value `"pending"` → INSERT failed
2. Queried wrong columns → Binds fetch failed

Both errors were wrapped in try-except, so:
- POST /api/goals returned 201 Created ✅
- But subtask_instances were NOT created ❌
- And binds array was empty ❌

---

## Status After Fix

✅ Backend auto-reloaded with corrected code
✅ subtask_status enum value fixed ('planned' not 'pending')
✅ subtask_templates query columns fixed (no description)
⏳ Ready for testing

---

## Next Steps

1. Test: Create new needle with 2 binds
2. Verify: Binds appear in Thread tab immediately
3. Complete remaining fixes:
   - Apply qgoals migration (for milestones)
   - Test Dashboard invalidation after completion
