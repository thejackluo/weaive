# Data Synchronization Diagnosis - 2025-12-23

**Problem Statement:** Dashboard and Thread screens are not communicating. Needles created in Dashboard don't show binds in Thread, and bind completions don't update Dashboard consistency.

---

## Investigation Summary

**Status:** ✅ ROOT CAUSES IDENTIFIED

**Investigated by:** Claude Code (Dev Agent)
**Date:** 2025-12-23
**Investigation Method:** Code trace from frontend → API → database

---

## Root Causes (3 Issues Found)

### Issue 1: ❌ Q-Goals (Milestones) Creation Skipped

**Location:** `weave-api/app/api/goals/router.py:403-406`

**Current Code:**
```python
# Create Q-goals (milestones) if provided
# TODO: qgoals table doesn't exist yet - will be added in future migration
# For now, skip Q-goals creation
if goal_data.qgoals:
    logger.info(f"⚠️ Skipping Q-goals creation (table not yet implemented)")
```

**Problem:**
- CreateNeedleScreen sends `qgoals` in the request
- Backend **silently ignores** them (doesn't create any records)
- `qgoals` table **does not exist** in migrations
- GET /api/goals/{goal_id} TRIES to fetch qgoals (lines 254-266) but returns empty array

**Impact:**
- Milestones created during needle setup are lost
- NeedleDetailScreen shows no milestones (empty `goal.qgoals` array)

---

### Issue 2: ❌ Bind Instances NOT Created When Needle Created

**Location:** `weave-api/app/api/goals/router.py:408-430`

**Current Code:**
```python
# Create binds (subtask templates) if provided
if goal_data.binds:
    binds_inserts = []
    for bind in goal_data.binds:
        # ... creates subtask_templates ...
        binds_inserts.append({
            "user_id": user_id,
            "goal_id": goal_id,
            "title": bind.title,
            # ...
        })

    binds_response = supabase.table("subtask_templates").insert(binds_inserts).execute()
    logger.info(f"✅ Created {len(binds_response.data)} binds for goal {goal_id}")

# ⚠️ NO CODE TO CREATE SUBTASK_INSTANCES!
```

**Problem:**
- POST /api/goals creates `subtask_templates` (bind definitions)
- **BUT does NOT create `subtask_instances`** (today's tasks)
- GET /api/binds/today queries `subtask_instances` table (line 123)
- Result: **Empty list** (no instances exist)

**Why Thread Shows Nothing:**
- ThreadHomeScreen calls `useTodayBinds()` → GET /api/binds/today
- API returns empty array because no instances exist
- ThreadHomeScreen correctly displays empty state

**Impact:**
- Binds created with needles **never appear in Thread**
- User has no daily tasks to complete

---

### Issue 3: ⚠️ Bind Completion Doesn't Update Dashboard Queries

**Location:** `weave-mobile/src/hooks/useCompleteBind.ts:83-87`

**Current Code:**
```typescript
onSuccess: () => {
  // Invalidate today's binds query to refetch updated data
  const today = new Date().toISOString().split('T')[0];
  queryClient.invalidateQueries({ queryKey: bindsQueryKeys.today(today) });
},
```

**Problem:**
- useCompleteBind ONLY invalidates `bindsQueryKeys.today`
- Dashboard uses different queries:
  - `goalsQueryKeys.active()` - for needles list
  - `['userStats']` - for consistency/streak data
- These queries are **NOT invalidated** after bind completion

**Impact:**
- Complete bind in Thread → Dashboard shows stale data
- Consistency % doesn't update until page refresh
- Completed bind count doesn't update

---

## Current Data Flow (Broken)

```
User Creates Needle (Dashboard)
  ↓
POST /api/goals {title, description, qgoals: [...], binds: [...]}
  ↓
Backend creates:
  ✅ goals table record
  ✅ subtask_templates (bind definitions)
  ❌ qgoals table (SKIPPED - table doesn't exist)
  ❌ subtask_instances (NEVER CREATED)
  ↓
GET /api/binds/today
  ↓
Query subtask_instances WHERE scheduled_for_date = today
  ↓
Result: [] (empty - no instances exist)
  ↓
ThreadHomeScreen shows: "No binds for today"
```

```
User Completes Bind (Thread)
  ↓
POST /api/binds/{id}/complete
  ↓
Backend creates:
  ✅ subtask_completions record
  ✅ captures record (if photo_used)
  ↓
useCompleteBind invalidates:
  ✅ bindsQueryKeys.today(today)
  ❌ goalsQueryKeys.active() (NOT INVALIDATED)
  ❌ userStats query (NOT INVALIDATED)
  ↓
Dashboard shows: Stale data (old consistency %)
```

---

## What Works Correctly ✅

1. **ThreadHomeScreen uses real API** (not mock data)
   - Location: `weave-mobile/src/screens/ThreadHomeScreen.tsx:30`
   - Calls `useTodayBinds()` → GET /api/binds/today

2. **Bind completion saves to database**
   - Location: `weave-api/app/api/binds/router.py:373-420`
   - Creates `subtask_completions` record
   - Creates `captures` record if photo used

3. **Goals API returns correct data structure**
   - GET /api/goals returns goals with stats
   - GET /api/goals/{id} returns goal with binds (templates)

4. **RLS Security Working**
   - All queries use proper `auth.uid() → user_profiles` pattern
   - Users can only see their own data

---

## Minimal Fix Plan (2-3 Hours)

### Fix 1: Auto-Create Bind Instances (30 min)

**File:** `weave-api/app/api/goals/router.py`

**Add after line 430 (after creating bind templates):**

```python
# Auto-create bind instances for today
from datetime import date

today_date = date.today().isoformat()

for bind_template in binds_response.data:
    # Create subtask_instance for today
    instance_data = {
        "user_id": user_id,
        "goal_id": goal_id,
        "template_id": bind_template["id"],
        "scheduled_for_date": today_date,
        "status": "pending",
        "estimated_minutes": bind_template.get("default_estimated_minutes", 30),
    }

    supabase.table("subtask_instances").insert(instance_data).execute()

logger.info(f"✅ Created {len(binds_response.data)} instances for {today_date}")
```

**Result:** Binds now appear in Thread immediately after creation

---

### Fix 2: Add Dashboard Query Invalidation (15 min)

**File:** `weave-mobile/src/hooks/useCompleteBind.ts`

**Update onSuccess (line 83):**

```typescript
onSuccess: () => {
  // Invalidate today's binds query to refetch updated data
  const today = new Date().toISOString().split('T')[0];
  queryClient.invalidateQueries({ queryKey: bindsQueryKeys.today(today) });

  // ✅ ADD: Invalidate Dashboard queries
  queryClient.invalidateQueries({ queryKey: goalsQueryKeys.active() });
  queryClient.invalidateQueries({ queryKey: ['userStats'] });
},
```

**Also add import:**
```typescript
import { goalsQueryKeys } from './useActiveGoals';
```

**Result:** Dashboard updates immediately after bind completion

---

### Fix 3: Create Q-Goals Table Migration (1 hour)

**New File:** `supabase/migrations/20251223120000_create_qgoals_table.sql`

```sql
-- Story 2.3: Create Q-Goals (Milestones) Table
-- Quantifiable targets within a goal

CREATE TABLE qgoals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  metric_name VARCHAR(100),  -- e.g., "weight", "revenue", "miles_run"
  target_value DECIMAL(10, 2),  -- e.g., 180.0
  current_value DECIMAL(10, 2) DEFAULT 0,  -- e.g., 185.0
  unit VARCHAR(50),  -- e.g., "lbs", "USD", "miles"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (match other tables)
ALTER TABLE qgoals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_qgoals" ON qgoals
    FOR ALL
    USING (user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    ));

-- Indexes
CREATE INDEX idx_qgoals_goal_id ON qgoals(goal_id);
CREATE INDEX idx_qgoals_user_id ON qgoals(user_id);

-- Updated_at trigger
CREATE TRIGGER update_qgoals_updated_at
    BEFORE UPDATE ON qgoals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Update goals/router.py (line 403):**
```python
# Create Q-goals (milestones) if provided
if goal_data.qgoals:
    qgoals_inserts = []
    for qgoal in goal_data.qgoals:
        qgoals_inserts.append({
            "user_id": user_id,
            "goal_id": goal_id,
            "title": qgoal.title,
            "metric_name": qgoal.metric_name,
            "target_value": qgoal.target_value,
            "current_value": qgoal.current_value or 0,
            "unit": qgoal.unit,
        })

    qgoals_response = supabase.table("qgoals").insert(qgoals_inserts).execute()
    logger.info(f"✅ Created {len(qgoals_response.data)} qgoals for goal {goal_id}")
```

**Result:** Milestones saved and displayed in NeedleDetailScreen

---

### Fix 4: Verify Milestones Display (30 min)

**Check:** `weave-mobile/src/screens/NeedleDetailScreen.tsx`

**Current code (line 253-266 in goals/router.py shows qgoals ARE fetched):**
- GET /api/goals/{id} already returns `qgoals` array
- Frontend just needs to display them

**Add to NeedleDetailScreen after motivation section:**
```tsx
{/* Milestones Section */}
{goal.qgoals && goal.qgoals.length > 0 && (
  <View style={styles.section}>
    <Text variant="textBase" weight="semibold" style={styles.sectionTitle}>
      Milestones
    </Text>
    {goal.qgoals.map((qgoal) => (
      <Card key={qgoal.id} variant="glass" style={styles.milestoneCard}>
        <Text variant="textBase" weight="medium">
          {qgoal.title}
        </Text>
        <Text variant="textSm" color="secondary">
          {qgoal.current_value} / {qgoal.target_value} {qgoal.unit}
        </Text>
      </Card>
    ))}
  </View>
)}
```

**Result:** Milestones visible in needle detail view

---

## Testing Plan (30 min)

### Test 1: Create Needle → Binds Appear in Thread
1. Open Dashboard
2. Tap "Add Needle"
3. Fill out form with 2 binds
4. Submit needle
5. **Expected:** Navigate to Dashboard, then to Thread tab
6. **Verify:** Both binds appear in Thread home screen

### Test 2: Complete Bind → Dashboard Updates
1. Open Thread tab
2. Tap a bind
3. Complete it (with timer)
4. **Expected:** Navigate back to Thread
5. Tap Dashboard tab
6. **Verify:** Consistency % updates, bind shows as completed

### Test 3: View Needle → Milestones Visible
1. Open Dashboard
2. Tap a needle card
3. **Expected:** Needle detail screen opens
4. **Verify:** Milestones section shows all Q-goals with current/target values

---

## Rollout Strategy

### Phase 1: Backend (1 hour)
1. Create qgoals table migration
2. Apply migration to Supabase
3. Update POST /api/goals to save qgoals
4. Add instance generation after bind template creation
5. Test with Postman/curl

### Phase 2: Frontend (1 hour)
1. Add Dashboard query invalidation to useCompleteBind
2. Add milestones display to NeedleDetailScreen
3. Test full flow in simulator

### Phase 3: Validation (30 min)
1. Run all 3 test cases
2. Check logs for any errors
3. Verify data sync in both directions

---

## Success Criteria

- ✅ Create needle with 2 binds → Both binds appear in Thread TODAY
- ✅ Complete bind in Thread → Dashboard consistency updates immediately
- ✅ View needle detail → Milestones section shows Q-goals
- ✅ All changes made in <3 hours total implementation time
- ✅ No new tables/schemas beyond qgoals (minimal scope)

---

## Notes

- **No AI changes needed** - This is pure data flow fix
- **No route changes needed** - Frontend already using correct APIs
- **No UI redesign needed** - Just fill in missing data
- **RLS policies already exist** - Just apply same pattern to qgoals

This is a straightforward plumbing fix, not an architectural change.
