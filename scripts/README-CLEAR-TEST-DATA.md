# Clear Test User Data - Quick Reference

## ✅ Working Solution

**File:** `scripts/clear-test-data-final.sql`

### How to Use:

1. **Open Supabase SQL Editor**:
   ```
   https://supabase.com/dashboard/project/jywfusrgwybljusuofnp/sql/new
   ```

2. **Copy the SQL file**:
   ```bash
   cat scripts/clear-test-data-final.sql
   ```

3. **Paste into SQL Editor and click "Run"**

4. **Expected Result**:
   ```
   status: "SUCCESS: All test data cleared!"
   remaining_completions: 0
   remaining_aggregates: 0
   remaining_journals: 0
   ```

5. **Clear Mobile Cache**:
   - Force quit the mobile app (swipe up in app switcher)
   - Restart the app
   - Dashboard should show: **Consistency: 0%** (or N/A)

---

## What It Does

Clears ALL data for test user (test.weave@anthropic.com):
- ✅ Goals and subtasks
- ✅ Completions (bypasses append-only trigger)
- ✅ Journal entries
- ✅ Daily aggregates
- ✅ Captures and AI artifacts
- ✅ Triad tasks

**Does NOT delete:**
- ❌ User profile (email, password, onboarding status)
- ❌ Auth credentials

---

## Technical Details

**The Key:** Uses `DISABLE TRIGGER USER` (not `ALL`) to:
- ✅ Disable user-defined triggers (append-only protection)
- ✅ Keep system triggers active (FK constraints)
- ✅ Avoid permission errors

**Before:**
```sql
-- ❌ FAILED - tried to disable system triggers
ALTER TABLE subtask_completions DISABLE TRIGGER ALL;
```

**After:**
```sql
-- ✅ WORKS - only disables user triggers
ALTER TABLE subtask_completions DISABLE TRIGGER USER;
```

---

## Why Not Use Python Script?

The Python scripts (`clear-test-data.py`, `apply-and-run-clear-function.py`) failed because:
1. Database functions can't use `ALTER TABLE` commands (security restriction)
2. `DISABLE TRIGGER` only works in direct SQL (not via RPC)
3. Supabase service role can't disable triggers via API

**Direct SQL in SQL Editor = Full admin permissions = Works!**

---

## Future: Reusable Function (Optional)

If you want to automate this, create a database function that uses `SECURITY DEFINER` to temporarily elevate permissions:

```sql
CREATE OR REPLACE FUNCTION admin_clear_user_data_v2(target_user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Disable user triggers
  EXECUTE 'ALTER TABLE subtask_completions DISABLE TRIGGER USER';

  -- Delete data...
  DELETE FROM subtask_completions WHERE user_id = target_user_id;
  -- ... (other deletes)

  -- Re-enable triggers
  EXECUTE 'ALTER TABLE subtask_completions ENABLE TRIGGER USER';

  RETURN jsonb_build_object('status', 'success');
END;
$$;
```

But for now, **direct SQL is simpler and works perfectly!**

---

## Quick Reference Card

```bash
# 1. Copy SQL
cat scripts/clear-test-data-final.sql

# 2. Open Supabase SQL Editor
open https://supabase.com/dashboard/project/jywfusrgwybljusuofnp/sql/new

# 3. Paste and run

# 4. Force quit mobile app and restart
```

---

**Last Updated:** December 24, 2025
**Test User:** test.weave@anthropic.com
**Profile ID:** a6fcb84c-2fa6-4ba9-a621-3a6d74f98009
