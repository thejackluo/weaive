# Query Patterns

**Created:** 2025-12-18
**Story:** 0.2b - Database Schema Refinement + Critical Tables
**Purpose:** Recommended query patterns that avoid N+1 problems and leverage indexes

---

## Table of Contents

1. [Dashboard Query (Most Critical)](#dashboard-query-most-critical)
2. [Today's Binds Query](#todays-binds-query)
3. [Goal with Subtasks (No N+1)](#goal-with-subtasks-no-n1)
4. [Completion with Proof (No N+1)](#completion-with-proof-no-n1)
5. [Streak Calculation](#streak-calculation)
6. [Consistency Heatmap](#consistency-heatmap)
7. [AI Cache Lookup](#ai-cache-lookup)
8. [Latest Identity Doc](#latest-identity-doc)
9. [Triad for Today](#triad-for-today)
10. [Journal History](#journal-history)

---

## Dashboard Query (Most Critical)

**Use Case:** Load all data for "Thread (Home)" screen in single query
**Performance Target:** <100ms (P95)
**Index Used:** `idx_daily_aggregates_user_date`, composite indexes on all tables

### Approach 1: Using daily_aggregates (Recommended for MVP+)

```sql
-- Single query using pre-computed aggregates (FAST: <10ms)
SELECT
  -- Today's summary from aggregates
  da.completed_count,
  da.planned_count,
  da.has_journal,
  da.has_proof,
  da.active_day_with_proof,

  -- Current streak (requires calculation)
  (
    SELECT COUNT(*)
    FROM daily_aggregates streak_check
    WHERE streak_check.user_id = da.user_id
      AND streak_check.local_date <= da.local_date
      AND streak_check.local_date > da.local_date - INTERVAL '90 days'
      AND streak_check.completed_count > 0
      AND NOT EXISTS (
        SELECT 1 FROM daily_aggregates gap
        WHERE gap.user_id = streak_check.user_id
          AND gap.local_date > streak_check.local_date
          AND gap.local_date < da.local_date
          AND gap.completed_count = 0
      )
  ) as current_streak

FROM daily_aggregates da
WHERE da.user_id = $1 AND da.local_date = $2;
```

### Approach 2: Raw Aggregation (Fallback if daily_aggregates not yet populated)

```sql
-- Aggregate from raw tables (SLOWER: 50-100ms, but works without daily_aggregates)
SELECT
  -- Count binds
  (SELECT COUNT(*) FROM subtask_instances WHERE user_id = $1 AND scheduled_for_date = $2 AND status = 'done') as completed_count,
  (SELECT COUNT(*) FROM subtask_instances WHERE user_id = $1 AND scheduled_for_date = $2) as planned_count,

  -- Check journal
  (SELECT EXISTS(SELECT 1 FROM journal_entries WHERE user_id = $1 AND local_date = $2)) as has_journal,

  -- Check proof
  (SELECT EXISTS(
    SELECT 1 FROM captures c
    INNER JOIN subtask_instances si ON si.id = c.subtask_instance_id
    WHERE si.user_id = $1 AND si.scheduled_for_date = $2 AND c.local_date = $2
  )) as has_proof;
```

**Mobile Client (TanStack Query):**
```typescript
// hooks/useDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useDashboard(userId: string, localDate: string) {
  return useQuery({
    queryKey: ['dashboard', userId, localDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_aggregates')
        .select('*')
        .eq('user_id', userId)
        .eq('local_date', localDate)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Mobile optimization
  });
}
```

---

## Today's Binds Query

**Use Case:** Display list of binds for Thread (Home) screen
**Performance Target:** <50ms (P95)
**Index Used:** `idx_subtask_instances_user_date_status`

```sql
-- Get today's binds with goal context (FAST: <50ms)
SELECT
  si.id,
  si.title_override,
  st.title as template_title,
  COALESCE(si.title_override, st.title) as display_title,
  si.status,
  si.estimated_minutes,
  si.completed_at,
  si.sort_order,

  -- Goal info (LEFT JOIN in case bind is ad-hoc)
  g.id as goal_id,
  g.title as goal_title,
  g.status as goal_status

FROM subtask_instances si
LEFT JOIN subtask_templates st ON st.id = si.template_id
LEFT JOIN goals g ON g.id = si.goal_id

WHERE si.user_id = $1
  AND si.scheduled_for_date = $2

ORDER BY si.sort_order ASC, si.created_at ASC;
```

**Mobile Client:**
```typescript
// hooks/useTodaysBinds.ts
export function useTodaysBinds(userId: string, localDate: string) {
  return useQuery({
    queryKey: ['binds', 'today', userId, localDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subtask_instances')
        .select(`
          *,
          subtask_templates (title),
          goals (id, title, status)
        `)
        .eq('user_id', userId)
        .eq('scheduled_for_date', localDate)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data;
    },
    staleTime: 60 * 1000, // 1 minute (frequent updates expected)
  });
}
```

---

## Goal with Subtasks (No N+1)

**Use Case:** Goal detail screen showing all binds for that goal
**Performance Target:** <50ms (P95)
**Index Used:** `idx_subtask_templates_user_goal`

### Anti-pattern (Slow - N+1 Query)
```javascript
// ❌ BAD: N+1 query problem
const goal = await supabase.from('goals').select('*').eq('id', goalId).single();
const binds = await supabase.from('subtask_templates').select('*').eq('goal_id', goalId);
goal.binds = binds; // Now we made 2 queries
```

### Best Practice (Fast - Single Query)
```sql
-- PostgreSQL: Single query with json_agg
SELECT
  g.*,
  COALESCE(
    json_agg(
      json_build_object(
        'id', st.id,
        'title', st.title,
        'default_estimated_minutes', st.default_estimated_minutes,
        'difficulty', st.difficulty,
        'recurrence_rule', st.recurrence_rule,
        'created_by', st.created_by
      ) ORDER BY st.created_at DESC
    ) FILTER (WHERE st.id IS NOT NULL),
    '[]'::json
  ) as binds

FROM goals g
LEFT JOIN subtask_templates st ON st.goal_id = g.id AND st.is_archived = FALSE

WHERE g.user_id = $1 AND g.id = $2
GROUP BY g.id;
```

**Mobile Client (Supabase already handles this!):**
```typescript
// hooks/useGoalDetails.ts
export function useGoalDetails(userId: string, goalId: string) {
  return useQuery({
    queryKey: ['goal', goalId],
    queryFn: async () => {
      // Supabase PostgREST automatically does efficient JOIN
      const { data, error } = await supabase
        .from('goals')
        .select(`
          *,
          subtask_templates!goal_id (*)
        `)
        .eq('user_id', userId)
        .eq('id', goalId)
        .eq('subtask_templates.is_archived', false)
        .single();

      if (error) throw error;
      return data;
    },
  });
}
```

---

## Completion with Proof (No N+1)

**Use Case:** Display completed bind with attached proof/capture
**Performance Target:** <30ms (P95)
**Index Used:** `idx_captures_bind_proof`

```sql
-- Single query with LEFT JOIN for optional proof
SELECT
  si.id,
  si.title_override,
  st.title as template_title,
  si.status,
  si.completed_at,
  si.actual_minutes,

  -- Proof/capture (may be NULL if no proof attached)
  c.id as capture_id,
  c.type as capture_type,
  c.content_text,
  c.storage_key,
  c.created_at as proof_created_at

FROM subtask_instances si
LEFT JOIN subtask_templates st ON st.id = si.template_id
LEFT JOIN captures c ON c.subtask_instance_id = si.id

WHERE si.user_id = $1 AND si.id = $2;
```

**Mobile Client:**
```typescript
// hooks/useBindCompletion.ts
export function useBindCompletion(userId: string, bindId: string) {
  return useQuery({
    queryKey: ['bind', bindId, 'completion'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subtask_instances')
        .select(`
          *,
          subtask_templates (title),
          captures!subtask_instance_id (*)
        `)
        .eq('user_id', userId)
        .eq('id', bindId)
        .single();

      if (error) throw error;
      return data;
    },
  });
}
```

---

## Streak Calculation

**Use Case:** Calculate current streak (consecutive days with completions)
**Performance Target:** <100ms (P95) for 90-day window
**Index Used:** `idx_subtask_completions_user_date` (DESC and ASC)

```sql
-- Calculate current streak (consecutive days counting backwards from today)
WITH RECURSIVE streak_days AS (
  -- Base case: Start from today
  SELECT
    local_date,
    1 as day_num
  FROM subtask_completions
  WHERE user_id = $1
    AND local_date = $2  -- Today's date

  UNION ALL

  -- Recursive case: Add previous day if it has completions
  SELECT
    sc.local_date,
    sd.day_num + 1
  FROM streak_days sd
  INNER JOIN subtask_completions sc
    ON sc.user_id = $1
    AND sc.local_date = sd.local_date - INTERVAL '1 day'
  WHERE sd.day_num < 365  -- Safety limit: max 365 day streak
)
SELECT COALESCE(MAX(day_num), 0) as current_streak
FROM streak_days;
```

**Optimized Version (Using daily_aggregates):**
```sql
-- FASTER: Use daily_aggregates (pre-computed)
WITH RECURSIVE streak_days AS (
  SELECT
    local_date,
    1 as day_num
  FROM daily_aggregates
  WHERE user_id = $1
    AND local_date = $2
    AND completed_count > 0

  UNION ALL

  SELECT
    da.local_date,
    sd.day_num + 1
  FROM streak_days sd
  INNER JOIN daily_aggregates da
    ON da.user_id = $1
    AND da.local_date = sd.local_date - INTERVAL '1 day'
    AND da.completed_count > 0
  WHERE sd.day_num < 365
)
SELECT COALESCE(MAX(day_num), 0) as current_streak
FROM streak_days;
```

---

## Consistency Heatmap

**Use Case:** GitHub-style contribution graph (color intensity = completion %)
**Performance Target:** <100ms for 90 days (P95)
**Index Used:** `idx_daily_aggregates_user_date`

```sql
-- Get completion rate for each day in date range (FAST with daily_aggregates)
SELECT
  local_date,
  completed_count,
  planned_count,
  CASE
    WHEN planned_count = 0 THEN 0
    ELSE ROUND(100.0 * completed_count / planned_count)
  END as completion_percentage,
  has_journal,
  has_proof

FROM daily_aggregates
WHERE user_id = $1
  AND local_date >= $2  -- Start date (e.g., 90 days ago)
  AND local_date <= $3  -- End date (today)

ORDER BY local_date ASC;
```

**Mobile Client:**
```typescript
// hooks/useConsistencyHeatmap.ts
export function useConsistencyHeatmap(
  userId: string,
  startDate: string,
  endDate: string
) {
  return useQuery({
    queryKey: ['heatmap', userId, startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_aggregates')
        .select('*')
        .eq('user_id', userId)
        .gte('local_date', startDate)
        .lte('local_date', endDate)
        .order('local_date', { ascending: true });

      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (historical data changes rarely)
  });
}
```

---

## AI Cache Lookup

**Use Case:** Check if AI already generated output for this input (80%+ cache hit rate target)
**Performance Target:** <20ms (P95)
**Index Used:** `idx_ai_runs_input_hash` (partial index WHERE status = 'success')

```sql
-- Check for cached AI output
SELECT
  ar.id as run_id,
  ar.model,
  ar.created_at,
  aa.json as output

FROM ai_runs ar
INNER JOIN ai_artifacts aa ON aa.run_id = ar.id

WHERE ar.input_hash = $1  -- SHA256 hash of input parameters
  AND ar.status = 'success'
  AND aa.type = $2  -- e.g., 'triad', 'goal_tree'

ORDER BY ar.created_at DESC
LIMIT 1;
```

**Backend API (FastAPI):**
```python
# services/ai_service.py
import hashlib
import json

async def get_cached_ai_output(
    user_id: str,
    module: str,
    params: dict,
    artifact_type: str
) -> dict | None:
    """Check if AI output is cached. Returns cached output or None."""

    # Generate deterministic hash from input
    input_str = json.dumps(params, sort_keys=True)
    input_hash = hashlib.sha256(input_str.encode()).hexdigest()

    # Query cache
    result = await supabase.rpc('get_ai_cache', {
        'p_input_hash': input_hash,
        'p_artifact_type': artifact_type
    }).execute()

    if result.data and len(result.data) > 0:
        return result.data[0]['output']  # Cache hit!

    return None  # Cache miss - need to generate
```

---

## Latest Identity Doc

**Use Case:** Get user's current identity document (archetype, dream self, etc.)
**Performance Target:** <20ms (P95)
**Index Used:** `idx_identity_docs_user_version` (DESC)

```sql
-- Get latest identity doc version (FAST: index scan + LIMIT 1)
SELECT
  id,
  version,
  json,
  created_at

FROM identity_docs
WHERE user_id = $1

ORDER BY version DESC
LIMIT 1;
```

**Mobile Client:**
```typescript
// hooks/useIdentityDoc.ts
export function useIdentityDoc(userId: string) {
  return useQuery({
    queryKey: ['identity', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('identity_docs')
        .select('*')
        .eq('user_id', userId)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour (identity changes rarely)
  });
}
```

---

## Triad for Today

**Use Case:** Display AI-generated top 3 recommended binds for today
**Performance Target:** <30ms (P95)
**Index Used:** `idx_triad_tasks_user_date`

```sql
-- Get Triad (top 3 tasks) for today
SELECT
  id,
  rank,
  title,
  rationale,
  linked_subtask_instance_id,
  is_user_edited,
  created_at

FROM triad_tasks
WHERE user_id = $1
  AND date_for = $2

ORDER BY rank ASC;  -- Rank 1, 2, 3
```

**Mobile Client:**
```typescript
// hooks/useTriad.ts
export function useTriad(userId: string, date: string) {
  return useQuery({
    queryKey: ['triad', userId, date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('triad_tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('date_for', date)
        .order('rank', { ascending: true });

      if (error) throw error;
      return data;  // Should return exactly 3 tasks
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

---

## Journal History

**Use Case:** Display list of past journal entries
**Performance Target:** <50ms for 30 days (P95)
**Index Used:** `idx_journal_entries_user_date` (DESC)

```sql
-- Get recent journal entries
SELECT
  id,
  local_date,
  fulfillment_score,
  text,
  created_at,
  updated_at

FROM journal_entries
WHERE user_id = $1
  AND local_date >= $2  -- e.g., 30 days ago

ORDER BY local_date DESC;
```

**Mobile Client:**
```typescript
// hooks/useJournalHistory.ts
export function useJournalHistory(
  userId: string,
  daysBack: number = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  return useQuery({
    queryKey: ['journals', userId, daysBack],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('local_date', startDate.toISOString().split('T')[0])
        .order('local_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

---

## Performance Testing Queries

Use these queries to verify index usage and performance:

```sql
-- Check if query uses index (should see "Index Scan", not "Seq Scan")
EXPLAIN ANALYZE
SELECT * FROM subtask_instances
WHERE user_id = '<test-user-id>' AND scheduled_for_date = CURRENT_DATE;

-- Measure query timing
\timing on
SELECT * FROM daily_aggregates WHERE user_id = '<test-user-id>' AND local_date = CURRENT_DATE;
\timing off

-- Check index sizes and usage
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as size,
  idx_scan as times_used
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

---

## References

- [Story: docs/sprint-artifacts/0-2b-database-schema-refinement.md]
- [Data Classification: docs/data-classification.md]
- [Architecture: docs/architecture.md#query-patterns]
