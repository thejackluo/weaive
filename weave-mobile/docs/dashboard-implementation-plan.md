# Dashboard Flow Implementation Plan

**Epic Coverage:** Epic 2 (Goal Management) + Epic 5 (Progress Visualization)

**Strategy:** Page-based vertical slices - build complete features in cohesive chunks

**Reference Docs:**

- Page spec: `docs/pages/dashboard-page.md`
- PRD Epic 2: `docs/prd/epic-2-goal-management.md`
- PRD Epic 5: `docs/prd/epic-5-progress-visualization.md`

---

## Existing Infrastructure (Being Resourceful)

**This plan leverages existing scaffolding - we're NOT building from scratch!**

### ✅ Backend Already Implemented

**Database Schema (Story 0.2a, 0.2b):**

- ✅ `user_profiles` - Basic user info
- ✅ `goals` - With max 3 active constraint (DB trigger)
- ✅ `subtask_templates` (binds) - Habits/actions for goals
- ✅ `subtask_instances` - Scheduled instances
- ✅ `subtask_completions` - Canonical completion events (immutable)
- ✅ `journal_entries` - Daily reflections with fulfillment_score
- ✅ `daily_aggregates` - Pre-computed consistency data
- ✅ **All RLS policies enabled** (Story 0.4)

**API Endpoints Already Built:**

- ✅ `GET /api/goals?status=active&include_stats=true` - List goals with consistency_7d
- ✅ `POST /api/journal-entries` - Create journal entry
- ✅ `GET /api/journal-entries/today` - Get today's journal
- ✅ `PATCH /api/journal-entries/{journal_id}` - Update journal
- ✅ `GET /api/user/profile` - Basic profile (needs enhancement)

**Frontend Already Built (Chunk 1):**

- ✅ `DashboardScreen.tsx` - Main dashboard with needle cards
- ✅ `NeedleDetailScreen.tsx` - View/Edit goal details
- ✅ `useActiveGoals` hook - List goals with TanStack Query
- ✅ `useGoalById` hook - Fetch single goal
- ✅ `fetchActiveGoals` service - API call for list
- ✅ `fetchGoalById` service - API call for detail
- ✅ Design system - Text, Card, Button, theme tokens

### ❌ What Needs to be Created

**Backend API Endpoints (Add to existing routers):**

- ❌ `GET /api/goals/{goal_id}` - Single goal detail
- ❌ `POST /api/goals` - Create new goal
- ❌ `PATCH /api/goals/{goal_id}` - Update goal
- ❌ `PATCH /api/goals/{goal_id}/archive` - Archive goal
- ❌ `GET /api/daily-aggregates?start_date=X&end_date=Y` - Query consistency data
- ❌ `GET /api/journal-entries?start_date=X&end_date=Y` - Query fulfillment data
- ❌ `GET /api/user/stats` - Computed level, streak, character state
- ❌ `GET /api/history?limit=20` - Recent activities

**Frontend Components (Chunks 2-4):**

- ❌ Create Goal screen with AI assistance
- ❌ Mutation hooks (create, update, archive)
- ❌ Consistency heat map component
- ❌ Fulfillment chart component
- ❌ Weave character visualization
- ❌ History list component

**Key Principle:** Reuse existing patterns, RLS policies, query structures, and design system components. Don't recreate what's already there!

---

## Implementation Strategy

### Quality Gates (Per Chunk)

After implementing each chunk, follow this process:

1. **TypeScript Check** - `npx tsc --noEmit`
2. **Lint** - `npm run lint`
3. **Manual Testing** - Test all user flows on simulator
4. **Code Review** - `/bmad:bmm:workflows:code-review`
5. **Fix Issues** - Address review findings
6. **Commit** - Use semantic commit message
7. **Test Again** - Verify fixes work before moving to next chunk

### ATDD Strategy

**Use `/testarch-atdd` for:**

- ✅ US-2.3: Create New Goal (AI-Assisted) - Complex AI integration
- ✅ US-2.4: Edit Needle (Save API) - Business logic for mutations
- ✅ US-5.2: Overall Consistency Visualization - Complex data aggregation
- ✅ US-5.3: Average Fulfillment Chart - Charting logic

**Skip ATDD for:**

- ❌ US-2.1, US-2.2 - Simple list/detail views
- ❌ US-2.5: Archive Goal - Straightforward API call
- ❌ US-5.1, US-5.4, US-5.5 - Display-only features

---

## Chunk 1: Needles Management (View Flow)

**Goal:** Complete read-only needle views with navigation

**Stories:**

- ✅ **US-2.1:** List Active Needles (Dashboard Tab)
- ✅ **US-2.2:** View Goal Details (Combined View/Edit Screen)

**Implementation Status:** ✅ COMPLETE (Frontend)

**⚠️ Known Gap:** Frontend calls `GET /api/goals/{goal_id}` but backend endpoint doesn't exist yet. Will implement in Chunk 2 Step 1 before testing mutations.

**Files Created:**

- `src/screens/DashboardScreen.tsx` - Dashboard with needle cards, consistency/fulfillment sections
- `src/screens/NeedleDetailScreen.tsx` - View/Edit combined screen with mock data
- `app/(tabs)/dashboard.tsx` - Dashboard route wrapper
- `app/needles/[id].tsx` - Dynamic route for needle detail

**Files Modified:**

- `src/hooks/useActiveGoals.ts` - Added `useGoalById` hook with typed response
- `src/services/goals.ts` - Added `fetchGoalById` function with typed response
- `src/types/goals.ts` - Added `GoalDetail`, `Milestone`, `Bind`, `GoalDetailResponse` types
- `weave-api/app/api/goals/router.py` - Backend GET /api/goals endpoint
- `weave-mobile/app/(tabs)/index.tsx` - Tab configuration updates
- `weave-mobile/global.css` - Global style updates
- `weave-mobile/src/design-system/tokens/colors.ts` - Color token updates

**Backend Leveraged:**

- `GET /api/goals?status=active&include_stats=true` - Used in DashboardScreen
- Database `goals` table with RLS policies - Enforces data access

**Testing Checklist:**

- [x] TypeScript compiles without errors
- [x] ESLint passes with no warnings
- [x] Dashboard loads and displays needle cards
- [x] Tapping needle card navigates to detail screen
- [x] Detail screen shows all sections (title, why, stats, milestones, binds)
- [x] Back button returns to Dashboard
- [x] Edit button toggles to edit mode
- [x] Edit mode shows editable fields and AI FAB
- [x] Done button saves changes (view mode updates with edited values)
- [x] Archive button shows confirmation dialog

**Code Review Fixes Applied (2025-12-21):**

✅ **Fixed Issues:**

1. **HIGH:** Removed 3 console.log statements from production code (NeedleDetailScreen.tsx)
2. **HIGH:** Fixed unsafe 'any' type - Added proper TypeScript types (GoalDetail, GoalDetailResponse, Milestone, Bind)
3. **HIGH:** Updated documentation with complete file list (added missing modified files)
4. **MEDIUM:** Replaced 6+ hardcoded hex colors with theme tokens (colors.text._, colors.border._)
5. **MEDIUM:** Wired up timeframe dropdown functionality (cycles through 7d/2w/1m/90d)
6. **MEDIUM:** Added skeleton loaders for needles loading state (3 placeholder cards)

📋 **Action Items for Chunk 2+:**

1. **Backend Endpoint (Chunk 2):** Implement GET /api/goals/{goal_id} endpoint before testing mutations
2. **Test Coverage (Chunk 5):** Add component tests for DashboardScreen and NeedleDetailScreen
3. **Add Goal Button (Chunk 2):** Implement FAB or bottom button for US-2.3 Create Goal flow
4. **Real Stats Data (Chunk 4):** Replace mock data (level, streak, consistency, fulfillment) with API calls
5. **Error Boundaries (Later):** Add React error boundaries at route level
6. **Documentation Location (Later):** Move dashboard-implementation-plan.md to docs/sprint-artifacts/

**Commit:**

```bash
git add .
git commit -m "feat(dashboard): implement Chunk 1 - Needles list and detail views (US-2.1, US-2.2)"
git push origin story/2.1
```

**Branch:** `story/2.1`

---

## Chunk 2: Goal Mutations (Write Flow)

**Goal:** Enable creating, editing, and archiving goals

**Stories:**

- **US-2.3:** Create New Goal (AI-Assisted)
- **US-2.4:** Edit Needle (Save API Implementation)
- **US-2.5:** Archive Goal (API Implementation)

**Implementation Plan:**

### Step 1: Backend API Endpoints (Create Missing Routes)

**✅ What Already Exists:**

- Database: `goals` table with all columns, max 3 active constraint, RLS policies
- `GET /api/goals?status=active&include_stats=true` - List goals (used in Chunk 1)

**❌ What Needs to be Created:**
Add these routes to `weave-api/app/api/goals/router.py`:

- `GET /api/goals/{goal_id}` - Get single goal with full details
- `POST /api/goals` - Create new goal (enforces 3-goal limit via DB trigger)
- `PATCH /api/goals/{goal_id}` - Update goal (title, description, etc.)
- `PATCH /api/goals/{goal_id}/archive` - Set status='archived'

**Implementation Notes:**

- Reuse existing RLS patterns from goals list endpoint
- Database trigger already enforces max 3 active goals
- Return standard `{data: ..., meta: ...}` format

### Step 2: US-2.3 - Create New Goal

**ATDD:** ✅ Run `/testarch-atdd` first (AI integration complexity)

**Files to Create/Modify:**

- `src/screens/CreateGoalScreen.tsx` - New screen
- `app/goals/create.tsx` - Route for create screen
- `src/services/goals.ts` - Add `createGoal(data, accessToken)` function
- `src/hooks/useActiveGoals.ts` - Add mutation hook `useCreateGoal()`

**Implementation Notes:**

- AI-assisted goal breakdown (title → Q-goals → Binds)
- Editable AI suggestions before saving
- Form validation (max 3 active goals)
- Loading states during AI generation
- Error handling for AI failures

**Testing Checklist:**

- [ ] FAB button on Dashboard opens create screen
- [ ] Title input works
- [ ] "Generate with AI" triggers goal breakdown
- [ ] Loading state shows during AI call
- [ ] AI suggestions are editable
- [ ] Save button creates goal via API
- [ ] Success: navigates to new goal detail
- [ ] Error: shows error message
- [ ] Enforces 3-goal limit

### Step 3: US-2.4 - Edit Needle (Save API)

**ATDD:** ✅ Run `/testarch-atdd` first (business logic)

**Files to Modify:**

- `src/screens/NeedleDetailScreen.tsx` - Wire up save functionality
- `src/services/goals.ts` - Add `updateGoal(goalId, updates, accessToken)`
- `src/hooks/useActiveGoals.ts` - Add mutation hook `useUpdateGoal()`

**Implementation Notes:**

- Replace console.log with real API call
- Update TanStack Query cache after save
- Show loading state on "Done" button
- Handle API errors gracefully
- Invalidate query cache to refetch

**Testing Checklist:**

- [ ] Edit mode allows title/why changes
- [ ] Done button saves to API
- [ ] Loading indicator during save
- [ ] Success: exits edit mode, shows updated data
- [ ] Error: shows error message, stays in edit mode
- [ ] Changes persist after navigating away and back

### Step 4: US-2.5 - Archive Goal

**Files to Modify:**

- `src/screens/NeedleDetailScreen.tsx` - Wire up archive functionality
- `src/services/goals.ts` - Add `archiveGoal(goalId, accessToken)`
- `src/hooks/useActiveGoals.ts` - Add mutation hook `useArchiveGoal()`

**Implementation Notes:**

- Replace console.log with real API call
- Soft delete (set `is_active: false` in DB)
- Invalidate active goals query cache
- Navigate back to Dashboard after success

**Testing Checklist:**

- [ ] Archive button shows confirmation
- [ ] "Cancel" dismisses dialog
- [ ] "Archive" calls API
- [ ] Success: navigates to Dashboard
- [ ] Dashboard no longer shows archived goal
- [ ] Error: shows error message, stays on detail

**Commit:**

```bash
git add .
git commit -m "feat(dashboard): implement Chunk 2 - Goal mutations (US-2.3, US-2.4, US-2.5)"
git push origin story/2.1
```

**Branch:** `story/2.1`

---

## Chunk 3: Progress Visualizations

**Goal:** Show user progress data with filters and charts

**Stories:**

- **US-5.2:** Overall Consistency Visualization
- **US-5.3:** Average Fulfillment Chart

**Implementation Plan:**

### Step 1: Backend Aggregation Endpoints (Create Query Routes)

**✅ What Already Exists:**

- Database: `daily_aggregates` table with completed_count, has_journal, has_proof, active_day_with_proof
- Database: `journal_entries` table with fulfillment_score (1-10)
- `POST /api/journal-entries` - Create entry ✅
- `GET /api/journal-entries/today` - Get today's entry ✅

**❌ What Needs to be Created:**
Add these query endpoints:

- `GET /api/daily-aggregates?start_date=X&end_date=Y` - Query aggregates for consistency chart
  - Optional `filter` param: overall (all completions), needle (by goal), bind (by subtask), thread (not yet defined)
- `GET /api/journal-entries?start_date=X&end_date=Y` - Query journal entries for fulfillment chart

**Implementation Notes:**

- Leverage existing RLS policies (user can only see their own data)
- Use date range filtering for performance
- Return arrays sorted by date ASC for chart rendering

### Step 2: US-5.2 - Overall Consistency Visualization

**ATDD:** ✅ Run `/testarch-atdd` first (complex aggregation)

**Files to Create/Modify:**

- `src/components/ConsistencyHeatmap.tsx` - 7-day table view
- `src/components/ConsistencyCalendar.tsx` - Month heat map (optional)
- `src/hooks/useConsistencyData.ts` - Fetch aggregated consistency data
- `src/services/consistency.ts` - API functions for consistency
- `src/screens/DashboardScreen.tsx` - Wire up components

**Implementation Notes:**

- Timeframe filter: 7d (table), 2w/1m/90d (heat map)
- Category filter: Overall, Needle, Bind, Thread
- Color-coded cells (green = high, yellow = medium, red = low)
- Tap cell → detailed breakdown (optional)
- AI Insight card (placeholder for now)

**Testing Checklist:**

- [ ] Timeframe dropdown works (7d, 2w, 1m, 90d)
- [ ] Filter tabs work (Overall, Needle, Bind, Thread)
- [ ] 7d shows table view with 7 days
- [ ] 2w+ shows heat map calendar
- [ ] Colors correctly reflect consistency %
- [ ] Loading state during data fetch
- [ ] Error state if API fails
- [ ] Percentage displayed prominently
- [ ] Trend indicator (+17%) shows correctly

### Step 3: US-5.3 - Average Fulfillment Chart

**ATDD:** ✅ Run `/testarch-atdd` first (charting logic)

**Files to Create/Modify:**

- `src/components/FulfillmentChart.tsx` - Line chart component
- `src/hooks/useFulfillmentData.ts` - Fetch journal entries
- `src/services/journal.ts` - API functions for journal data
- `src/screens/DashboardScreen.tsx` - Wire up chart

**Dependencies:**

- Install charting library: `npm install victory-native` or `npm install react-native-svg react-native-chart-kit`

**Implementation Notes:**

- X-axis: dates in selected timeframe
- Y-axis: fulfillment score (0-10)
- Line: 7-day rolling average
- Dots: daily scores
- Timeframe filter: 7d, 2w, 1m, 90d
- AI Insight card (placeholder for now)

**Testing Checklist:**

- [ ] Chart renders correctly
- [ ] 7-day rolling average line displays
- [ ] Daily dots appear on chart
- [ ] X-axis shows dates
- [ ] Y-axis shows 0-10 scale
- [ ] Timeframe filter changes data range
- [ ] Loading state during data fetch
- [ ] Error state if API fails
- [ ] Average displayed prominently (e.g., 7.7 / 10)

**Commit:**

```bash
git add .
git commit -m "feat(dashboard): implement Chunk 3 - Progress visualizations (US-5.2, US-5.3)"
git push origin story/2.1
```

**Branch:** `story/2.1`

---

## Chunk 4: Weave Character & Gamification

**Goal:** Display gamification elements (level, character, streaks)

**Stories:**

- **US-5.1:** Weave Character Visualization
- **US-5.4:** Streak & Level Display
- **US-5.5:** History Section

**Implementation Plan:**

### Step 1: Backend Endpoints (Implement User Stats)

**✅ What Already Exists:**

- Database: `user_profiles` table (basic fields only)
- Database: `subtask_completions` table (for streak calculation)
- Database: `daily_aggregates` table (for level calculation)
- `GET /api/user/profile` - Placeholder (returns basic user info only) ⚠️

**❌ What Needs to be Created:**
Enhance or create:

- `GET /api/user/stats` - Computed stats endpoint returning:
  - `level`: int (calculated from total active_day_with_proof count)
  - `current_streak`: int (consecutive days with completions)
  - `weave_character_state`: string ("strand" | "thread" | "weave") based on level
  - `total_completions`: int
  - `total_active_days`: int
- Optionally enhance `GET /api/user/profile` to include stats
- `GET /api/history?limit=20` - Recent activities (completions, journal entries)

**Implementation Notes:**

- Level = f(total active_day_with_proof) - compute from daily_aggregates
- Streak = consecutive days from subtask_completions/daily_aggregates
- Character state: Strand (L1-3), Thread (L4-7), Weave (L8+)
- Don't store these in DB - compute on-demand (can add caching later)

### Step 2: US-5.1 - Weave Character Visualization

**Files to Create/Modify:**

- `src/components/WeaveCharacter.tsx` - SVG-based character (or static image)
- `src/hooks/useUserProfile.ts` - Fetch user profile data
- `src/screens/DashboardScreen.tsx` - Replace placeholder circle

**Implementation Notes:**

- Character evolves based on consistency (Strand → Thread → Weave)
- Level 1-3: Strand (simple line)
- Level 4-7: Thread (woven lines)
- Level 8+: Weave (complex pattern)
- Animated transitions (optional)

**Testing Checklist:**

- [ ] Character renders in header center
- [ ] Character matches user level
- [ ] Different visuals for Strand/Thread/Weave
- [ ] Tapping character shows level explanation (optional)

### Step 3: US-5.4 - Streak & Level Display

**Files to Modify:**

- `src/screens/DashboardScreen.tsx` - Replace mock data with real profile data

**Implementation Notes:**

- Level: "Level X" text on left
- Streak: "X 🔥" badge on right
- Fetch from user profile API

**Testing Checklist:**

- [ ] Level displays correctly
- [ ] Streak displays with fire emoji
- [ ] Updates when user completes actions
- [ ] Profile button navigates to settings

### Step 4: US-5.5 - History Section

**Files to Create/Modify:**

- `src/components/HistoryList.tsx` - List of recent activities
- `src/hooks/useHistory.ts` - Fetch history data
- `src/services/history.ts` - API functions
- `src/screens/DashboardScreen.tsx` - Wire up history component

**Implementation Notes:**

- Show last 10 items (completions, journal entries, goal updates)
- Each item: date, type, brief description
- "See All" button to view full history (optional)
- Empty state: "No entries found"

**Testing Checklist:**

- [ ] History items display correctly
- [ ] Sorted by most recent first
- [ ] Empty state shows when no history
- [ ] Loading state during fetch
- [ ] Error state if API fails

**Commit:**

```bash
git add .
git commit -m "feat(dashboard): implement Chunk 4 - Weave character and gamification (US-5.1, US-5.4, US-5.5)"
git push origin story/2.1
```

**Branch:** `story/2.1`

---

## Final Integration Testing

After all chunks are complete, run comprehensive end-to-end testing:

### Complete Dashboard Flow Test

1. **Launch app** → Dashboard loads
2. **View needles** → See all active goals (max 3)
3. **Tap needle** → Navigate to detail screen
4. **View details** → See stats, milestones, binds
5. **Edit needle** → Toggle to edit mode, modify title/why
6. **Save changes** → Changes persist
7. **Back to Dashboard** → See updated needle
8. **Create new goal** → Tap FAB, AI generates breakdown
9. **Edit AI suggestions** → Modify before saving
10. **Save new goal** → Appears in needles list
11. **View consistency** → Filter by timeframe and category
12. **View fulfillment** → See chart with rolling average
13. **Check character** → Matches user level
14. **Check streak** → Displays current streak
15. **View history** → See recent activities
16. **Archive goal** → Confirm and verify removal

### Performance Checks

- [ ] All screens load within 2 seconds
- [ ] No lag when scrolling Dashboard
- [ ] Charts render smoothly
- [ ] No console errors or warnings
- [ ] Memory usage stays reasonable

### API Error Handling

- [ ] Network offline → Shows error messages
- [ ] API returns 500 → Shows user-friendly error
- [ ] Invalid data → Graceful fallback
- [ ] Timeout → Retry or error message

---

## Final Commit & PR

After all chunks pass integration testing:

```bash
# Final quality checks
npx tsc --noEmit
npm run lint
npm run format

# Commit any final fixes
git add .
git commit -m "chore(dashboard): final polish and testing for Epic 2+5"
git push origin story/2.1

# Create PR to main
gh pr create --base main --title "feat(dashboard): Complete Dashboard flow (Epic 2 + 5)" --body "$(cat <<'EOF'
## Summary
Complete implementation of Dashboard flow covering Epic 2 (Goal Management) and Epic 5 (Progress Visualization).

## Implemented Features
- ✅ View active needles (goals)
- ✅ View/edit needle details
- ✅ Create new goals with AI assistance
- ✅ Edit and archive goals
- ✅ Overall consistency visualization with filters
- ✅ Average fulfillment chart
- ✅ Weave character display (level-based)
- ✅ Streak and level indicators
- ✅ Recent activity history

## Testing
- ✅ TypeScript compilation passes
- ✅ Linting passes
- ✅ Manual testing completed on iOS simulator
- ✅ Code review completed
- ✅ All acceptance criteria met

## Screenshots
[Add screenshots of key screens]

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Progress Tracking

### Chunk Status

| Chunk                                | Status      | Stories                | Commit                 | Date       |
| ------------------------------------ | ----------- | ---------------------- | ---------------------- | ---------- |
| **Chunk 1: Needles Management**      | ✅ COMPLETE | US-2.1, US-2.2         | Code review fixes done | 2025-12-22 |
| **Chunk 2: Goal Mutations**          | ✅ COMPLETE | US-2.3, US-2.4, US-2.5 | Code review fixes done | 2025-12-22 |
| **Chunk 3: Progress Visualizations** | ✅ COMPLETE | US-5.2, US-5.3         | Code review fixes done | 2025-12-22 |
| **Chunk 4: Weave Character**         | ✅ COMPLETE | US-5.1, US-5.4, US-5.5 | Code review fixes done | 2025-12-22 |
| **Final Integration**                | ⏳ PENDING  | All                    | Ready for commit       | -          |

### Blockers / Notes

- **Chunk 1-4:** ✅ All Complete. All backend endpoints implemented, all frontend components built.

- **Package Changes:**
  - ✅ Added `victory-native@41.20.2` for FulfillmentChart component

- **Code Review Fixes Applied (2025-12-22):**
  - ✅ Fixed FORCE_SAMPLE_DATA flags (set to false for production)
  - ✅ Removed all console.error statements from service files
  - ✅ Added loading state to Archive button
  - ✅ Added client-side validation for goal title (empty check + max 200 chars)
  - ✅ Confirmed URLSearchParams workaround (manual query string building)

- **Remaining Low-Priority Items:**
  - Test coverage: Create component tests for DashboardScreen, NeedleDetailScreen, ConsistencyHeatmap, FulfillmentChart
  - Error boundaries: Add React error boundaries at route level
  - Q-goals backend: Complete implementation (currently TODOed in backend)

---

## Quick Reference

### Commands

```bash
# Start dev server
npm start

# TypeScript check
npx tsc --noEmit

# Lint
npm run lint

# Format
npm run format

# Code review
/bmad:bmm:workflows:code-review

# ATDD (for complex stories)
/testarch-atdd
```

### Key Files

| File                                 | Purpose               |
| ------------------------------------ | --------------------- |
| `src/screens/DashboardScreen.tsx`    | Main dashboard layout |
| `src/screens/NeedleDetailScreen.tsx` | View/Edit needle      |
| `src/hooks/useActiveGoals.ts`        | Goal data hooks       |
| `src/services/goals.ts`              | Goal API functions    |
| `app/needles/[id].tsx`               | Dynamic route         |

### Architecture Reminders

- **Server state:** Use TanStack Query (not Zustand)
- **Design system:** Import from `@/design-system`
- **API format:** `{ data: ..., meta: ... }` or `{ error: ... }`
- **Naming:** snake_case DB, camelCase TS, PascalCase components
- **No hardcoded styles:** Always use design system tokens

---

**Last Updated:** 2025-12-21
**Current Sprint:** Story 2.1 - Dashboard Implementation
**Branch:** `story/2.1`
