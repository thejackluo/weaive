# Database Schema Deployment Errors - Story 0.2

## Summary
Multiple critical bugs in `seed.sql` and `validate_schema.sql` prevent successful database deployment and validation for Stories 0.2a and 0.2b.

## Environment
- **Database:** Supabase PostgreSQL 15
- **Branch:** `story/0.2`
- **Stories Affected:** 0.2a (Database Schema Core), 0.2b (Database Schema Refinement)
- **Discovered:** 2025-12-18

---

## Issue 1: seed.sql Column Name Mismatches ❌ HIGH PRIORITY

### Problem
`supabase/seed.sql` contains multiple column name and enum value mismatches that cause INSERT failures when deploying with `npx supabase db push`.

### Errors
```
ERROR: 42703: column "recurrence_pattern" of relation "subtask_templates" does not exist
ERROR: 42703: column "storage_path" of relation "captures" does not exist
ERROR: 42703: column "instance_id" of relation "subtask_completions" does not exist
ERROR: 22P02: invalid input value for enum goal_priority: "medium"
ERROR: 22P02: invalid input value for enum capture_type: "note"
```

### Root Cause
Seed data INSERT statements were written without systematically cross-referencing against migration CREATE TABLE statements. Column names were assumed/guessed rather than verified.

### Affected Tables

| Table | Wrong Column | Correct Column | Lines Affected |
|-------|--------------|----------------|----------------|
| **subtask_templates** | `recurrence_pattern` | `recurrence_rule` | 112, 123, 132 |
| **subtask_templates** | `estimated_duration_minutes` | `default_estimated_minutes` | 112, 123, 132 |
| **captures** | `storage_path` | `storage_key` | 196, 203 |
| **subtask_completions** | `instance_id` | `subtask_instance_id` | 175, 181, 188 |
| **goals** | `'medium'` (enum) | `'med'` | 79 |
| **captures** | `'note'` (enum) | `'text'` | 199, 204 |

### Steps to Reproduce
```bash
cd /path/to/weavelight
npx supabase db push
# Observe multiple column name errors
```

### Expected Behavior
All INSERT statements should use column names that exactly match migration schemas. Deployment should succeed without errors.

### Proposed Solution

1. **Immediate Fix (Manual):**
   - Change `recurrence_pattern` → `recurrence_rule` (3 places)
   - Change `estimated_duration_minutes` → `default_estimated_minutes` (3 places)
   - Change `storage_path` → `storage_key` (2 places)
   - Change `instance_id` → `subtask_instance_id` (3+ places)
   - Change `'medium'` → `'med'` (1 place)
   - Change `'note'` → `'text'` (2 places)

2. **Long-term Fix (Validation Script):**
   Create `scripts/validate-seed-columns.sql`:
   ```sql
   -- Extract INSERT column lists from seed.sql
   -- Compare against information_schema.columns
   -- Report mismatches before deployment
   ```

3. **Process Improvement:**
   - Always read migration files FIRST before writing seed data
   - Use grep/diff to verify column lists match
   - Add validation step to CI/CD pipeline

### Files to Modify
- `supabase/seed.sql` (lines 79, 112, 123, 132, 175, 181, 188, 196, 199, 203, 204)

---

## Issue 2: validate_schema.sql Type Mismatch ❌ MEDIUM PRIORITY

### Problem
The schema validation script fails with `invalid input syntax for type integer: "t"` because it tries to store a BOOLEAN in an INT variable.

### Error
```
ERROR: 22P02: invalid input syntax for type integer: "t"
CONTEXT: PL/pgSQL function inline_code_block line 20 at SQL statement
```

### Root Cause
Script uses pattern:
```sql
DECLARE fk_count INT;
SELECT EXISTS(SELECT 1 FROM ...) INTO fk_count;
```

But `EXISTS()` returns BOOLEAN (`'t'` or `'f'`), not INTEGER. PostgreSQL fails to coerce boolean to integer.

### Affected Code Location
`supabase/validate_schema.sql` - multiple DECLARE blocks

### Proposed Solution

**Wrong:**
```sql
DECLARE
  fk_count INT;
BEGIN
  SELECT EXISTS(SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
    AND table_name = 'subtask_templates')
  INTO fk_count;

  IF fk_count = 0 THEN  -- Wrong: comparing INT to boolean result
    RAISE WARNING 'No foreign keys found';
  END IF;
END;
```

**Correct:**
```sql
DECLARE
  fk_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
    AND table_name = 'subtask_templates')
  INTO fk_exists;

  IF NOT fk_exists THEN  -- Correct: boolean check
    RAISE WARNING 'No foreign keys found';
  END IF;
END;
```

### Steps to Reproduce
```bash
cd /path/to/weavelight
psql $DATABASE_URL -f supabase/validate_schema.sql
# Observe type mismatch error
```

### Files to Modify
- `supabase/validate_schema.sql` (all DECLARE blocks with `fk_count INT`)

---

## Issue 3: Performance Validation Not Completed ⚠️ HIGH PRIORITY

### Problem
Story 0.2b AC #4 requires comprehensive performance baseline establishment with P50/P95/P99 percentiles, but this has not been done.

### Missing Tests
- [ ] Dashboard query performance (target: P50 < 50ms, P95 < 100ms, P99 < 200ms)
- [ ] Today's binds query (target: P50 < 20ms, P95 < 50ms, P99 < 100ms)
- [ ] Completion history query (target: P50 < 50ms, P95 < 100ms, P99 < 150ms)
- [ ] Active goals query (target: P50 < 20ms, P95 < 50ms, P99 < 100ms)
- [ ] Journal entry query (target: P50 < 10ms, P95 < 25ms, P99 < 50ms)
- [ ] RLS overhead testing (<10ms added latency per query)
- [ ] Load testing with 100 concurrent users
- [ ] Performance baseline documentation (`docs/performance-baseline-week0.md`)

### Impact
- Cannot verify NFR-P2 requirement (dashboard load time < 1 second)
- Cannot validate that composite indexes are effective
- No baseline for future performance regression testing
- **Story 0.2b AC #4 not satisfied** - story should not be marked "done"

### Proposed Solution

1. **Create Performance Test Script:**
   ```sql
   -- scripts/performance-test.sql
   -- Generate realistic test data: 100 users, 90 days history, ~300 completions/user
   -- Run each query 100 times
   -- Collect timing data
   ```

2. **Measure Percentiles:**
   ```bash
   # Run performance test
   psql $DATABASE_URL -f scripts/performance-test.sql > timings.txt

   # Calculate percentiles
   python scripts/calculate-percentiles.py timings.txt
   ```

3. **Document Baseline:**
   Create `docs/performance-baseline-week0.md` with:
   - Test environment details
   - Query performance table (P50/P95/P99 for each query)
   - RLS overhead measurements
   - Load test results
   - Optimization notes

4. **Validate Targets:**
   - Verify all queries meet P95 targets
   - Identify queries exceeding targets
   - Create optimization plan if needed

### Files to Create
- `scripts/performance-test.sql`
- `scripts/calculate-percentiles.py`
- `docs/performance-baseline-week0.md`

---

## Acceptance Criteria for Closure

### Issue 1 (seed.sql):
- [ ] All column names in seed.sql match migration schemas
- [ ] All enum values match enum definitions
- [ ] `npx supabase db push` succeeds without errors
- [ ] All seed data loads successfully
- [ ] Validation script created to prevent future mismatches

### Issue 2 (validate_schema.sql):
- [ ] All `fk_count INT` changed to `fk_exists BOOLEAN`
- [ ] All integer comparisons changed to boolean checks
- [ ] Script runs successfully without errors
- [ ] All validation checks pass

### Issue 3 (Performance):
- [ ] Performance test script created with realistic data
- [ ] P50/P95/P99 measured for all queries
- [ ] RLS overhead measured (<10ms target)
- [ ] Load test completed (100 concurrent users)
- [ ] Performance baseline documented
- [ ] All queries meet P95 targets OR optimization plan created

---

## Priority & Timeline

**Priority:** HIGH - Blocks deployment and Sprint 1 readiness

**Estimated Effort:**
- Issue 1 (seed.sql fixes): 30-45 minutes
- Issue 2 (validate_schema.sql fixes): 15-30 minutes
- Issue 3 (performance validation): 2-3 hours
- **Total:** 3-4 hours

**Recommended Timeline:**
1. Fix Issue 1 & 2 immediately (blocks deployment)
2. Run performance validation before Sprint 1 starts
3. Document baseline before moving to Story 0.3

---

## Related Documentation

- Story 0.2a: `docs/sprint-artifacts/0-2a-database-schema-core.md`
- Story 0.2b: `docs/sprint-artifacts/0-2b-database-schema-refinement.md`
- Migration Files: `supabase/migrations/202512180000*.sql`
- Architecture: `docs/architecture.md#performance-requirements`

---

## Labels
`bug`, `database`, `high-priority`, `story-0.2`, `blocks-deployment`

---

## Assignee
TBD

---

## Notes
- These issues were discovered during deployment testing on 2025-12-18
- Both stories (0.2a, 0.2b) are marked "done" but have unresolved issues
- Recommend updating story status to "blocked" until resolved
- All fixes should be made on `story/0.2` branch before merging to main
