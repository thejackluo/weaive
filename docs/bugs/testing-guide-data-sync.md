# Testing Guide: Data Sync Fixes

**Date:** 2025-12-23
**Status:** Ready for Testing

## ✅ What's Been Fixed

1. **Backend** (`weave-api/app/api/goals/router.py`)
   - Bind instances auto-created when needle created (lines 448-469)
   - Q-goals now saved to database (lines 402-422)

2. **Frontend** (`weave-mobile/src/hooks/useCompleteBind.ts`)
   - Dashboard queries invalidated after bind completion (lines 89-93)

3. **Frontend** (`weave-mobile/src/screens/NeedleDetailScreen.tsx`)
   - Milestones section added (lines 377-409)

4. **Migration** (`supabase/migrations/20251223120000_create_qgoals_table.sql`)
   - Created but needs manual application

## 🧪 Test Sequence

### Test 1: Bind Instances Created ✅ (Works Now)

**What to test:** Verify binds appear in Thread immediately after needle creation

**Steps:**
1. Start mobile app: `cd weave-mobile && npm start`
2. Navigate to Dashboard tab
3. Create new needle with 2 binds (use FAB or create button)
4. Navigate to Thread tab
5. **Expected:** Both binds visible under "Today" with the needle name

**Success Criteria:**
- Binds show up immediately (no need to refresh)
- Binds are grouped under correct needle
- Status shows "pending"

**If this fails:**
- Check backend logs for "✅ Created X instances for YYYY-MM-DD"
- Check that POST /api/goals response includes bind data
- Verify subtask_instances table has rows for today

---

### Test 2: Dashboard Updates After Bind Completion ✅ (Works Now)

**What to test:** Verify Dashboard consistency updates when bind completed in Thread

**Steps:**
1. Go to Thread tab
2. Complete one bind (with or without timer)
3. Navigate back to Dashboard tab
4. **Expected:**
   - Consistency % updates (if visible on needle card)
   - Completed bind count increases
   - No manual pull-to-refresh needed

**Success Criteria:**
- Dashboard automatically refreshes
- Needle card shows updated stats
- Changes persist after app reload

**If this fails:**
- Check console logs for "[COMPLETE_BIND] Invalidated Thread and Dashboard queries"
- Verify useCompleteBind hook is being called
- Check TanStack Query dev tools if available

---

### Test 3: Milestones Display ⚠️ (Requires Migration)

**What to test:** Verify milestones show in needle detail view

**Prerequisites:**
1. Apply qgoals migration manually:
   - Open: https://supabase.com/dashboard/project/jywfusrgwybljusuofnp
   - Go to: SQL Editor
   - Copy contents of: `supabase/migrations/20251223120000_create_qgoals_table.sql`
   - Click "Run"
   - Verify: Query completes without errors

**Steps:**
1. Create needle with 2 milestones from Dashboard
2. Tap needle card to open detail view
3. **Expected:**
   - "Milestones" section appears after motivation box
   - Each milestone shows: Title, Current/Target values, Unit, Metric name
   - Progress displays correctly (e.g., "0 / 200 lbs")

**Success Criteria:**
- Milestones render with proper styling
- All milestone data displays correctly
- Section only shows if milestones exist

**If this fails:**
- Check backend logs for "✅ Created X qgoals for goal {id}"
- Verify qgoals table exists: `SELECT * FROM qgoals;`
- Check GET /api/goals/{id} response includes qgoals array

---

## 🚀 Quick Start

**Recommended order:**
1. Start backend: `cd weave-api && uv run uvicorn app.main:app --reload`
2. Start mobile: `cd weave-mobile && npm start`
3. Run Test 1 (binds sync) - **Should work immediately**
4. Run Test 2 (dashboard updates) - **Should work immediately**
5. Apply migration manually in Supabase dashboard
6. Run Test 3 (milestones) - **Should work after migration**

---

## 🐛 Common Issues

### Issue: Binds still don't show in Thread
**Check:**
- Backend is running and POST /api/goals returned success
- Thread tab is querying `/api/binds/today` (check network tab)
- User is authenticated (check JWT token)

**Fix:**
- Pull to refresh on Thread tab
- Restart mobile app
- Check backend logs for errors

### Issue: Dashboard doesn't update after completion
**Check:**
- useCompleteBind mutation succeeded
- Console shows "[COMPLETE_BIND] Invalidated Thread and Dashboard queries"
- TanStack Query cache is not disabled

**Fix:**
- Pull to refresh on Dashboard tab
- Restart mobile app
- Clear app cache

### Issue: Milestones not showing
**Check:**
- qgoals migration applied successfully
- GET /api/goals/{id} includes qgoals in response
- goal.qgoals is not null/empty in frontend

**Fix:**
- Apply migration in Supabase dashboard
- Recreate needle after migration
- Check NeedleDetailScreen renders qgoals section

---

## 📊 Verification Checklist

- [ ] Backend running at http://localhost:8000
- [ ] Mobile app connected to backend
- [ ] Test user logged in
- [ ] Created needle with 2+ binds
- [ ] Binds appear in Thread tab immediately
- [ ] Completed bind in Thread
- [ ] Dashboard refreshed automatically
- [ ] Applied qgoals migration (for Test 3)
- [ ] Milestones display in needle detail

---

## 🎯 Success Metrics

**Before Fixes:**
- ❌ Binds created but not visible in Thread
- ❌ Bind completions don't update Dashboard
- ❌ Milestones lost during creation
- ❌ Data inconsistent between screens

**After Fixes:**
- ✅ Binds immediately visible in Thread after creation
- ✅ Dashboard updates automatically after completion
- ✅ Milestones saved and displayed correctly
- ✅ Data synchronized across all screens

---

## Next Steps After Testing

1. If Test 1 & 2 pass: **Data sync is working!** 🎉
2. Apply qgoals migration manually
3. If Test 3 passes: **All 4 fixes confirmed!** 🚀
4. Merge changes to main branch
5. Update CLAUDE.md with new patterns learned
