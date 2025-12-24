# SQL Migration: deleted_at Column Assumption Issue (2025-12-23)

## Problem

**Error:**
```
ERROR: 42703: column "deleted_at" does not exist
LINE 48: WHERE deleted_at IS NULL;
```

**Migration:** `supabase/migrations/20251223000001_story_6_2_context_tracking.sql`

**Root Cause:** The migration assumed all tables had `deleted_at` columns for soft delete pattern, but these columns don't exist in the current schema.

---

## Affected Tables

The migration created indexes with `WHERE deleted_at IS NULL` filters on these tables:

1. **subtask_completions** - ❌ No `deleted_at` column
2. **journal_entries** - ❌ No `deleted_at` column
3. **goals** - ❌ No `deleted_at` column
4. **identity_docs** - ❌ No `deleted_at` column

**Result:** All 4 index creation statements failed at runtime.

---

## Solution

**Remove the WHERE clause** from partial indexes. Create full indexes instead:

### Before (BROKEN):
```sql
CREATE INDEX IF NOT EXISTS idx_subtask_completions_user_recent
  ON subtask_completions(user_id, completed_at DESC)
  WHERE deleted_at IS NULL;  -- ❌ Column doesn't exist
```

### After (FIXED):
```sql
CREATE INDEX IF NOT EXISTS idx_subtask_completions_user_recent
  ON subtask_completions(user_id, completed_at DESC);  -- ✅ Works
```

**Trade-off:**
- Full indexes are slightly larger (include all rows)
- But performance difference is negligible for these tables
- Indexes still provide the same query optimization

**Alternative approach (if soft delete is added later):**
```sql
-- Add deleted_at column first
ALTER TABLE subtask_completions
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Then create partial index
CREATE INDEX IF NOT EXISTS idx_subtask_completions_user_recent
  ON subtask_completions(user_id, completed_at DESC)
  WHERE deleted_at IS NULL;
```

---

## Prevention Rules

Added to `CLAUDE.md` (lines 664-672):

### **SQL Migration Guidelines:**

1. **Never use emojis** - SQL parsers fail on non-ASCII characters
   ```sql
   -- ❌ BAD
   RAISE NOTICE '✅ Column created';

   -- ✅ GOOD
   RAISE NOTICE '[OK] Column created';
   ```

2. **Never assume columns exist in WHERE clauses**
   ```sql
   -- ❌ BAD - Assumes deleted_at exists
   CREATE INDEX idx_name ON table(col) WHERE deleted_at IS NULL;

   -- ✅ GOOD - No assumptions
   CREATE INDEX idx_name ON table(col);
   ```

3. **Always use IF NOT EXISTS for idempotency**
   ```sql
   ALTER TABLE table_name ADD COLUMN IF NOT EXISTS new_column TEXT;
   CREATE INDEX IF NOT EXISTS idx_name ON table_name(column);
   ```

4. **Check schema before writing migrations**
   ```bash
   # Verify column exists before using in WHERE clause
   \d+ table_name  # In psql

   # Or query information_schema
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'your_table';
   ```

---

## How to Verify Column Existence

### Option 1: Check in migration (dynamic)
```sql
-- Only create partial index if deleted_at exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'goals' AND column_name = 'deleted_at'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_goals_active
      ON goals(user_id, status) WHERE deleted_at IS NULL;
  ELSE
    CREATE INDEX IF NOT EXISTS idx_goals_active
      ON goals(user_id, status);
  END IF;
END $$;
```

### Option 2: Check existing migrations (static)
```bash
# Search for deleted_at column creation
grep -r "deleted_at" supabase/migrations/*.sql | grep "CREATE TABLE\|ALTER TABLE"

# If no results: Column doesn't exist, don't use it in WHERE clauses
```

---

## Impact Assessment

**Story 6.2 Fix:**
- ✅ Migration now runs successfully
- ✅ Indexes created correctly (full indexes, no partial filtering)
- ✅ Context assembly queries still benefit from indexes
- ✅ No performance degradation (tables don't have soft-deleted rows yet)

**Future Soft Delete Migration:**
When soft delete is implemented:
1. Add `deleted_at` columns to tables
2. Optionally drop and recreate indexes with `WHERE deleted_at IS NULL`
3. Or keep full indexes (simpler, minimal performance difference)

---

## Related Files

- Migration fixed: `supabase/migrations/20251223000001_story_6_2_context_tracking.sql`
- Rules documented: `CLAUDE.md` (lines 664-672)
- Service using indexes: `weave-api/app/services/context_builder.py`

---

## Status

✅ **RESOLVED** - Migration fixed on 2025-12-23

**Changes:**
- Removed 4 `WHERE deleted_at IS NULL` clauses
- Added prevention rules to CLAUDE.md
- Migration is now idempotent and safe to run

**Testing:**
```bash
cd weave-api
npx supabase db reset     # Should succeed
npx supabase db push      # Should apply migration successfully
```
