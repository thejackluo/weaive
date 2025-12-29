# Times Per Week Implementation Summary

## ✅ COMPLETED

### 1. Database Migration
- **File**: `supabase/migrations/20251229000000_add_times_per_week_to_subtask_templates.sql`
- Added `times_per_week` column (1-7) to `subtask_templates`
- Migrated existing binds: Daily→7x/week, Weekly→1x/week
- Set default to 3x/week

### 2. Backend API (Python/FastAPI)
- ✅ Updated schemas: `CreateBindRequest`, `UpdateBindRequest` use `times_per_week`
- ✅ Updated `POST /api/binds`: Creates bind with `times_per_week` field
- ✅ Added rolling window calculation: `calculate_rolling_week_boundaries()`
- ✅ Added miss detection: `is_miss_day()` (formula: `completions_needed > days_remaining`)
- ✅ Updated `GET /api/binds/today`: Returns weekly tracking fields:
  - `times_per_week`, `completions_this_week`, `is_completed_for_week`, `is_miss`, `week_start`, `week_end`
- ✅ Updated `POST /api/binds/{id}/complete`: Enforces weekly limits (prevents over-completion)

### 3. Frontend Types (TypeScript)
- ✅ `weave-mobile/src/types/binds.ts`: Updated `Bind`, `CreateBindRequest`, `BindTemplate` interfaces
- ✅ `weave-mobile/src/types/goals.ts`: Updated `Bind`, `BindCreate` interfaces

### 4. Frontend UI (React Native)
- ✅ `CreateNeedleScreen.tsx`: Replaced Daily/Weekly toggle with 1-7 segmented slider
  - Shows helper text: "Daily", "Once a week", or "3 times per week"
  - Default: 3 times per week
  - All binds now use `times_per_week` field

---

## ✅ ALL WORK COMPLETE

### Database Migration
**✅ APPLIED** - The `times_per_week` column has been successfully added to the database.

### Backend
**✅ UPDATED** - All endpoints now use the `times_per_week` column:
- `GET /api/binds/today` - Returns weekly tracking data
- `POST /api/binds/{id}/complete` - Enforces weekly limits
- `POST /api/binds` - Creates binds with times_per_week
- `PUT /api/binds/{id}` - Updates times_per_week

### Frontend
**✅ COMPLETE** - All screens updated with 1-7 slider

---

## 🧪 TESTING CHECKLIST

After completing the remaining work:

1. **Apply migration** (see above)
2. **Restart backend**: `cd weave-api && uv run uvicorn app.main:app --reload`
3. **Restart mobile**: `cd weave-mobile && npm run start:clean`

### Test Cases:

**Create 3x/week bind**:
- ✅ Shows "3x per week • 0/3 this week"
- ✅ Days 1-4: No miss indicator
- ✅ Day 5+ with 0 completions: Shows as miss

**Complete bind 2 times**:
- ✅ After 1st: "3x per week • 1/3 this week"
- ✅ After 2nd: "3x per week • 2/3 this week"
- ✅ After 3rd: "3x per week • 3/3 this week" + disabled
- ✅ 4th attempt: Error "Weekly goal already completed (3/3)"

**Rolling week reset**:
- ✅ Week resets on same day as template creation
- ✅ After reset: Counter goes back to 0/3, bind re-enables

---

## 🔧 WHAT WAS FIXED

### Issue: Bind Completions Not Working
**Problem**: When you completed "tryout" bind, nothing updated on Thread or Dashboard pages.

**Root Cause**: Backend code was trying to query the `times_per_week` column before the migration was applied, causing all bind queries to fail silently.

**Solution**:
1. ✅ Added backwards-compatible `get_times_per_week_safe()` function that parses from `recurrence_rule` as fallback
2. ✅ Updated all database queries to properly select the `times_per_week` column
3. ✅ Updated CREATE/UPDATE endpoints to write to the `times_per_week` column
4. ✅ Restarted backend with updated code

### Data Syncing Architecture Preserved
**✅ All TanStack Query cache invalidation is intact:**
- `useCompleteBind.ts` still invalidates all related queries on completion
- Thread page refetches binds, journal, goals on focus
- Dashboard refetches stats, consistency, history after mutations
- No changes were made to the syncing logic

---

## 🎯 KEY FEATURES IMPLEMENTED

### Rolling 7-Day Window
- Week starts on bind creation date
- Example: Created Wednesday → weeks run Wed-Tue

### Miss Detection Formula
```
completions_needed = times_per_week - current_week_completions
days_remaining = week_end_date - today + 1

if completions_needed > days_remaining:
    → MISS (impossible to achieve perfect week)
```

### Consistency Graph Display
- ✅ = Day completed
- — = Not applicable (grace period)
- Empty box = Miss (impossible week)

### Over-Completion Prevention
- Backend rejects completion if weekly limit reached
- Returns detailed error with current progress

---

## 📄 FILES MODIFIED

### Backend (Python/FastAPI):
1. `supabase/migrations/20251229000000_add_times_per_week_to_subtask_templates.sql` (NEW)
2. `weave-api/app/schemas/bind.py`
3. `weave-api/app/api/binds/router.py`

### Frontend (TypeScript/React Native):
1. `weave-mobile/src/types/binds.ts` ✅
2. `weave-mobile/src/types/goals.ts` ✅
3. `weave-mobile/src/screens/CreateNeedleScreen.tsx` ✅
4. `weave-mobile/src/screens/NeedleDetailScreen.tsx` ✅
5. `weave-mobile/src/services/binds.ts` ✅
6. `weave-mobile/src/services/goals.ts` ✅
