# Thread Page Implementation Plan

**Status:** 🚧 In Progress
**Phase:** Phase 1 Complete (Shell) → Phase 2 (Story-by-Story)
**Source:** `docs/pages/thread-page.md`

---

## Overview

This document provides a structured, quality-controlled approach to implementing the Thread Page. Follow the chunk-by-chunk process with clear commit points and quality gates.

**Process:** Pick Chunk → Build → Test → Review → Commit → Start Next Chunk

---

## 🏗️ Existing Scaffolding We're Leveraging

**IMPORTANT:** This implementation builds on existing architecture - we're NOT creating from scratch!

### ✅ Backend Infrastructure (Already Exists)

1. **Database Tables** (Story 0.2a - All created with RLS):
   - `subtask_instances` - scheduled binds table
   - `subtask_completions` - immutable event log (protected by triggers)
   - `captures` - proof storage (supports photo, timer, audio, text, link)
   - `goals`, `subtask_templates` - already used in goals router

2. **Dependencies** (`app/core/deps.py`):
   - `get_current_user()` - JWT verification ✅
   - `get_supabase_client()` - DB client ✅
   - RLS pattern: `auth.uid()` → `user_profiles.id` ✅

3. **Router Pattern** (`app/api/goals/router.py`):
   - Standard response: `{data: [...], meta: {...}}` ✅
   - RLS enforcement via user_id lookup ✅
   - Already queries subtask_templates (line 195) ✅

4. **API Registration** (`app/main.py`):
   - Router include pattern ✅
   - Error handlers ✅

### ✅ Frontend Infrastructure (Already Exists)

1. **TanStack Query Pattern** (`src/hooks/useActiveGoals.ts`):
   - Query key factories ✅
   - Stale time (5 min), cache time (10 min) ✅
   - Auth-gated queries ✅

2. **Service Layer** (`src/services/goals.ts`):
   - `fetchActiveGoals` function structure ✅
   - API base URL pattern ✅
   - Error handling ✅

3. **Types** (`src/types/goals.ts`):
   - Response types, error types ✅

4. **Design System** (Complete):
   - All components ✅
   - CountdownTimer ✅

### 📦 What We're Building (Following Existing Patterns)

**Chunk 1:** Binds router, service, hooks (following goals pattern exactly)
**Chunk 2:** Completion endpoint, upload utilities, UI components (new logic)
**Chunk 3:** Integration (connecting existing pieces)
**Chunk 4:** Journal history (following existing journal patterns)

**Key Principle:** Follow established patterns, don't reinvent. Query existing tables, use existing dependencies.

---

## Phase 1: Shell ✅ COMPLETE

**Completed:** 2025-12-21

**What was built:**
- ✅ Thread Home Screen layout (`src/screens/ThreadHomeScreen.tsx`)
- ✅ Header (streak, greeting, profile button)
- ✅ Week calendar widget (Su-Sa, current day highlighted)
- ✅ AI insight card (tappable, uses 'ai' variant)
- ✅ Needle cards with expand/collapse behavior (`src/components/thread/NeedleCard.tsx`)
- ✅ Bind items with checkboxes (`src/components/thread/BindItem.tsx`)
- ✅ Daily Check-In card with countdown timer
- ✅ Mock data structure (`src/data/mockThreadData.ts`)
- ✅ Navigation: settings works, bind screen placeholders
- ✅ TypeScript compiling, no errors

**Purpose:** Validate UX patterns, establish routing, see the full picture

**Files Created:**
- `weave-mobile/src/data/mockThreadData.ts`
- `weave-mobile/src/components/thread/BindItem.tsx`
- `weave-mobile/src/components/thread/NeedleCard.tsx`
- `weave-mobile/src/screens/ThreadHomeScreen.tsx`
- `weave-mobile/app/(tabs)/index.tsx` (updated to use ThreadHomeScreen)

---

## Phase 2: Story-by-Story Implementation

**Current Status:** Ready to start Chunk 1

---

## 🔵 CHUNK 1: Thread Home - Data Integration (US-3.1)

**Story:** US-3.1: View Today's Binds (Thread Home) - 5 pts
**Epic:** Epic 3 (Daily Actions & Proof)
**Status:** 📋 TODO
**Estimated Time:** 3-4 hours

### Acceptance Criteria (from thread-page.md lines 174-182)

- [ ] Thread (Home) shows today's binds grouped by needle (goal)
- [ ] Each needle is a collapsible dropdown
- [ ] Binds show: title, estimated time, completion status
- [ ] Incomplete binds show empty checkbox
- [ ] Completed binds show checkmark with optional proof indicator
- [ ] Answer "What should I do today?" in <10 seconds

### Build Tasks

#### Backend API (weave-api/)

1. **Create Binds Router** (`app/api/binds/router.py`)
   - **FOLLOW PATTERN:** Copy structure from `app/api/goals/router.py`
   - **LEVERAGE:** Use existing `get_current_user`, `get_supabase_client` dependencies
   - **QUERY EXISTING TABLE:** `subtask_instances` (already created in Story 0.2a)
   - Endpoint: `GET /api/binds/today`
   - Query today's `subtask_instances` for authenticated user
   - Filter by `scheduled_for_date = today` (use user's local date)
   - Include needle context (LEFT JOIN with `goals`)
   - Include completion status (LEFT JOIN with `subtask_completions`)
   - Include proof indicators (LEFT JOIN with `captures`)
   - RLS enforced via `user_id` lookup (same pattern as goals router line 66-82)
   - Return format:
     ```json
     {
       "data": [
         {
           "id": "bind-id",
           "title": "Workout",
           "subtitle": "5x Per Week. Today's one of them.",
           "needle_id": "goal-id",
           "needle_title": "Get Ripped",
           "needle_color": "blue",
           "estimated_minutes": 45,
           "completed": false,
           "has_proof": false,
           "frequency": "5x Per Week"
         }
       ],
       "meta": {
         "local_date": "2025-12-21",
         "total_binds": 6,
         "completed_count": 2
       }
     }
     ```

2. **Register Router** (`app/main.py`)
   - **FOLLOW PATTERN:** Line 113 shows goals router registration
   - Import binds router: `from app.api import binds`
   - Include in app: `app.include_router(binds.router, tags=["binds"])`

3. **No New Dependencies Needed**
   - ✅ `get_current_user` exists in `app/core/deps.py`
   - ✅ `get_supabase_client` exists in `app/core/deps.py`
   - ✅ Date handling: use Python's `date.today()` from `datetime` module

#### Frontend Hooks (weave-mobile/)

4. **Create Binds Service** (`src/services/binds.ts`)
   - **FOLLOW PATTERN:** Copy structure from `src/services/goals.ts`
   - **LEVERAGE:** Use existing `getApiBaseUrl()` helper
   - Function: `fetchTodayBinds(accessToken: string)`
   - API call to `GET /api/binds/today`
   - Error handling (same pattern as goals.ts lines 35-42)
   - Type: `BindsResponse`

5. **Create Binds Types** (`src/types/binds.ts`)
   - **FOLLOW PATTERN:** Copy structure from `src/types/goals.ts`
   - `Bind` interface (matches API response format)
   - `BindsResponse` interface: `{data: Bind[], meta: {...}}`
   - `ApiErrorResponse` (check if exists, reuse if so)

6. **Create useTodayBinds Hook** (`src/hooks/useTodayBinds.ts`)
   - **FOLLOW PATTERN:** Copy structure from `src/hooks/useActiveGoals.ts`
   - **LEVERAGE:** Existing TanStack Query setup
   - Query key: `['binds', 'today', localDate]`
   - Stale time: 1 minute (binds update frequently)
   - Cache time: 5 minutes
   - Requires authentication: `enabled: !!session?.access_token`

#### Frontend Integration

7. **Update ThreadHomeScreen** (`src/screens/ThreadHomeScreen.tsx`)
   - Replace mock data with `useTodayBinds()` hook
   - Handle loading state (skeleton or spinner)
   - Handle error state (error card with retry)
   - Handle empty state (no active needles → nudge to create goal)
   - Map real data to NeedleCard components
   - Verify expand/collapse still works

8. **Remove Mock Data** (optional, keep for now)
   - Keep `mockThreadData.ts` for reference
   - Comment out or conditionally use for development

### Test Cycle

```bash
# 1. Backend Tests
cd weave-api
uv run pytest tests/test_binds.py -v

# 2. Start Backend
uv run uvicorn app.main:app --reload

# 3. TypeScript Check
cd weave-mobile
npx tsc --noEmit

# 4. Lint Check
npm run lint

# 5. Start Mobile
npm start

# 6. Manual Testing Checklist
```

**Manual Test Checklist:**
- [ ] Thread Home loads without errors
- [ ] Binds grouped by needle correctly
- [ ] Expand/collapse works with real data
- [ ] Completed binds show checkmark
- [ ] Empty state shows when no binds
- [ ] Error state shows on API failure
- [ ] Retry button works on error
- [ ] Performance: <10 seconds to see binds
- [ ] Navigation to settings works

### Quality Gates

```bash
# Before committing, run all checks:

# 1. TypeScript
cd weave-mobile && npx tsc --noEmit

# 2. Lint
npm run lint

# 3. Backend tests
cd weave-api && uv run pytest -v

# 4. Manual verification (all ACs checked above)

# 5. Code Review (optional for Chunk 1, recommended for Chunk 2+)
# /bmad:bmm:workflows:code-review
```

### Commit Point

**When all ACs verified and quality gates passed:**

```bash
git add .
git commit -m "feat(thread): implement US-3.1 view today's binds

- Add GET /api/binds/today endpoint with needle context
- Create useTodayBinds hook with TanStack Query
- Replace mock data in ThreadHomeScreen
- Add loading, error, and empty states
- Verify expand/collapse works with real data

Acceptance Criteria: All 7 verified
Epic: 3 (Daily Actions & Proof)
Story Points: 5"

git push origin thread-flow
```

### Notes

- **ATDD:** ❌ Not needed - simple read/display, shell already built
- **Estimated Time:** 3-4 hours (2 hrs backend, 1-2 hrs frontend)
- **Blockers:** None - foundation (auth, RLS, goals) already exists
- **Dependencies:** Requires goals and subtask_instances to exist (created during onboarding)

---

## 🔴 CHUNK 2: Bind Completion Flow (US-3.3, US-3.4)

**Stories:**
- US-3.3: Start and Complete Bind with Proof - 8 pts
- US-3.4: Timer Tracking (Integrated Proof) - 5 pts

**Epic:** Epic 3 (Daily Actions & Proof)
**Status:** 📋 TODO (Start after Chunk 1 complete)
**Estimated Time:** 10-12 hours

### Why These Stories Together?

Timer (US-3.4) is part of the proof flow (US-3.3). They're tightly coupled and should be built together for coherent UX.

### Acceptance Criteria

**US-3.3 (from thread-page.md lines 188-208):**

**Bind Screen (Start):**
- [ ] Tap Bind → Opens Bind Screen
- [ ] Shows: Needle context, bind title/description, "Start Bind" button, estimated duration

**Proof Capture (During/After):**
- [ ] Timer/Stopwatch icon → Start focused timer (see US-3.4)
- [ ] Camera icon → Open camera for photo/video capture
- [ ] User can use timer AND camera together

**Completion Flow:**
- [ ] Mark Bind as complete
- [ ] **Magical confetti animation** (classy, celebratory)
- [ ] **Show Weave level progress bar increase** (visual feedback)
- [ ] **Display affirmation:** "You're getting closer to [Goal Name]!"
- [ ] Prompt for optional description (280 char max)
- [ ] Skip option for description (trust-based)
- [ ] Return to Thread with updated status
- [ ] Total completion time: <30 seconds from open to done

**US-3.4 (from thread-page.md lines 210-228):**

**Pomodoro-feel timer experience:**
- [ ] Set duration upfront (25 min default, customizable: 15/25/45/60 min)
- [ ] Focus mode UI (minimal distractions, clean visual)
- [ ] Subtle progress visualization (circle fill, progress bar)
- [ ] Satisfying completion with sound/haptic feedback
- [ ] Accessible via Timer/Stopwatch icon on Bind Screen
- [ ] Running timer displays prominently
- [ ] Option to pause (with confirmation) or extend
- [ ] Timer duration auto-attached to completion as Proof
- [ ] Timer can be used alongside camera capture
- [ ] Timer works even when app is backgrounded

### Build Tasks

#### Phase 2a: Bind Screen (Start)

1. **Create BindScreen Component** (`src/screens/BindScreen.tsx`)
   - Route: `app/(tabs)/thread/bind/[id].tsx`
   - Receives bind ID from navigation params
   - Fetch bind details (use same `useTodayBinds` or create `useBindDetail`)
   - Show needle context (AI message: "Remember, you are doing this to [goal] so you can [why]. Lock in.")
   - Bind title (large, centered)
   - Week completion calendar (7 days, M-Sa, checkmarks for completed)
   - Accountability section (Timer + Photo buttons)
   - Weave level progress preview (character + progress bar)
   - "Start Bind" button (large, primary)

2. **Add Navigation**
   - Update `NeedleCard.tsx` → `handleBindPress` → navigate to bind screen
   - Use Expo Router: `router.push(`/(tabs)/thread/bind/${bind.id}`)`

#### Phase 2b: Timer Flow

3. **Create PomodoroTimer Component** (`src/components/thread/PomodoroTimer.tsx`)
   - Duration presets: 15, 25, 45, 60 minutes
   - Focus mode UI (minimal, clean, full-screen)
   - Circle progress indicator (react-native-svg or Reanimated)
   - Time display (MM:SS countdown)
   - Pause button (with confirmation: "Are you sure?")
   - Extend button (+5 min increments)
   - Completion: vibration + sound (Expo Haptics + Audio)
   - Background timer support:
     - Use Expo Notifications for background tracking
     - Store timer state in AsyncStorage
     - Send local notification when timer completes
   - Return timer duration on completion

4. **Timer Navigation Flow**
   - Bind Screen → Tap Timer icon → Select preset → Timer runs → Completion
   - Pass callback to receive duration on completion

#### Phase 2c: Photo/Video Capture

5. **Create ProofCapture Component** (`src/components/thread/ProofCapture.tsx`)
   - **NEW FUNCTIONALITY:** No existing upload pattern found
   - Use Expo ImagePicker + Camera APIs
   - Request camera permissions
   - Capture photo or video (max 10MB)
   - Compress image (reduce to 1920px max dimension)
   - Preview captured media
   - Confirm/Retake options
   - Upload to Supabase Storage:
     - **Bucket:** `proof-captures` (create if doesn't exist)
     - **Path pattern:** `{user_id}/captures/{uuid}.{ext}`
     - Store `storage_key` in `captures` table (table already exists)
   - Return capture metadata (file URL, type, size)

6. **Photo Navigation Flow**
   - Bind Screen → Tap Camera icon → Camera opens → Capture → Preview → Confirm → Completion

#### Phase 2d: Completion Flow (The Magic ✨)

7. **Create CompletionCelebration Component** (`src/components/thread/CompletionCelebration.tsx`)
   - Confetti animation (use `react-native-confetti-cannon` or custom with Reanimated)
   - Affirmation text: "You're getting closer to [Needle Name]!"
   - Level progress bar (animated increase)
   - Optional description input (TextInput, 280 char max, skippable)
   - "Skip" and "Done" buttons
   - Auto-dismiss after 5 seconds if user doesn't interact

8. **Backend: Complete Bind Endpoint** (`app/api/binds/router.py`)
   - **LEVERAGE EXISTING TABLES:** All tables already exist from Story 0.2a
   - **IMPORTANT:** `subtask_completions` is immutable (protected by triggers) - INSERT only
   - Endpoint: `POST /api/binds/{bind_id}/complete`
   - Request body:
     ```json
     {
       "proof_type": "timer" | "photo" | "video",
       "proof_data": {
         "duration_minutes": 45,  // for timer
         "capture_url": "...",     // for photo/video
         "capture_type": "image/jpeg"
       },
       "description": "Optional 280 char description",
       "local_date": "2025-12-21"
     }
     ```
   - **INSERT** into `subtask_completions` table (columns: subtask_instance_id, user_id, completed_at, local_date, duration_minutes)
   - **INSERT** into `captures` table if photo/video (columns: user_id, type, storage_key, subtask_instance_id, local_date)
   - **UPDATE** `daily_aggregates` (increment completed_count, set active_day_with_proof=true)
   - Calculate new level progress (query total completions count)
   - Return:
     ```json
     {
       "data": {
         "completion_id": "...",
         "level": 2,
         "level_progress": 38,  // % to next level
         "affirmation": "You're getting closer to Get Ripped!"
       },
       "meta": {
         "timestamp": "2025-12-21T10:30:00Z"
       }
     }
     ```

9. **Frontend: useCompleteBinding Mutation** (`src/hooks/useCompleteBinding.ts`)
   - TanStack Query mutation
   - Optimistic update (mark bind complete immediately)
   - On success: invalidate `['binds', 'today']` query
   - On error: rollback optimistic update
   - Show success toast or keep completion modal

10. **Integrate Completion Flow**
    - Bind Screen → User selects Timer/Photo → Completes task → CompletionCelebration shows
    - Pass proof data to `useCompleteBinding` mutation
    - Show celebration with affirmation + level progress
    - Navigate back to Thread Home (updated with completed bind)

### Test Cycle

```bash
# 1. Backend Tests
cd weave-api
uv run pytest tests/test_binds.py -v
# Should include tests for:
# - Complete bind with timer proof
# - Complete bind with photo proof
# - Complete bind with both timer + photo
# - Verify immutable completions (no UPDATE/DELETE)
# - Verify daily_aggregates updated

# 2. TypeScript Check
cd weave-mobile
npx tsc --noEmit

# 3. Lint
npm run lint

# 4. Manual Testing
npm start
```

**Manual Test Checklist:**

**Bind Screen:**
- [ ] Navigate from Thread Home to Bind Screen
- [ ] Bind details display correctly
- [ ] Week calendar shows completion history
- [ ] AI context message displays
- [ ] Timer and Photo buttons selectable (both can be active)

**Timer Flow:**
- [ ] Tap Timer → Duration presets shown
- [ ] Select preset → Timer starts
- [ ] Timer displays countdown prominently
- [ ] Pause works (with confirmation)
- [ ] Extend works (+5 min)
- [ ] Timer runs in background (lock phone, wait, unlock)
- [ ] Timer completion triggers vibration + sound
- [ ] Timer duration passed to completion

**Photo Flow:**
- [ ] Tap Camera → Permissions requested (first time)
- [ ] Camera opens correctly
- [ ] Capture photo → Preview shown
- [ ] Retake works
- [ ] Confirm → Upload to Supabase
- [ ] File URL returned

**Completion Flow:**
- [ ] Complete bind → Confetti animation plays
- [ ] Affirmation shows correct needle name
- [ ] Level progress bar animates increase
- [ ] Optional description input works
- [ ] Skip button works
- [ ] Done button completes flow
- [ ] Navigate back to Thread Home
- [ ] Bind marked complete with checkmark
- [ ] Proof indicator shows (if photo/video)
- [ ] **Total time: <30 seconds from Bind Screen open to Thread Home return**

**Edge Cases:**
- [ ] Complete bind with timer only
- [ ] Complete bind with photo only
- [ ] Complete bind with timer + photo
- [ ] Network error during completion (rollback works)
- [ ] Camera permission denied (fallback shown)
- [ ] Upload fails (retry or skip option)

### Quality Gates

```bash
# Before committing, run all checks:

# 1. TypeScript
cd weave-mobile && npx tsc --noEmit

# 2. Lint
npm run lint

# 3. Backend tests
cd weave-api && uv run pytest -v

# 4. Manual verification (all ACs checked above)

# 5. Code Review (HIGHLY RECOMMENDED for this chunk)
/bmad:bmm:workflows:code-review
# This is complex, multi-step flow - review will catch issues
```

### ATDD Recommended

**Run before building:**

```bash
/bmad:bmm:workflows:testarch-atdd
# Provide context:
# - Story US-3.3 and US-3.4
# - Complex multi-step flow: bind screen → timer/photo → completion → celebration
# - State management: optimistic updates, rollback on error
# - Proof handling: timer duration, photo upload, combined proof
# - Immutable completions table
```

ATDD will generate test scenarios for:
- Timer background behavior
- Photo upload failure recovery
- Optimistic update rollback
- Completion flow timing
- Cache invalidation

### Commit Points

**Commit Strategy: Break into 4 commits for clarity**

**Commit 1: Bind Screen**
```bash
git add .
git commit -m "feat(thread): add bind screen with accountability selection (US-3.3)

- Create BindScreen component with needle context
- Add week completion calendar visualization
- Implement accountability selection (Timer + Photo)
- Add Weave level progress preview
- Navigate from Thread Home to Bind Screen

Partial completion of US-3.3 (Bind Screen only)"
```

**Commit 2: Timer Flow**
```bash
git add .
git commit -m "feat(thread): implement pomodoro timer (US-3.4)

- Create PomodoroTimer component with duration presets
- Add focus mode UI with circle progress
- Implement pause/extend functionality
- Add background timer support with notifications
- Include vibration + sound on completion

Acceptance Criteria: All 10 verified for US-3.4"
```

**Commit 3: Photo Capture**
```bash
git add .
git commit -m "feat(thread): add photo/video capture for proof (US-3.3)

- Create ProofCapture component with Expo Camera
- Implement image compression (max 1920px)
- Add upload to Supabase Storage
- Include preview and retake functionality
- Handle camera permissions

Partial completion of US-3.3 (Photo flow)"
```

**Commit 4: Completion Celebration**
```bash
git add .
git commit -m "feat(thread): implement completion celebration flow (US-3.3)

- Add POST /api/binds/{id}/complete endpoint
- Create useCompleteBinding mutation with optimistic updates
- Build CompletionCelebration component with confetti
- Implement affirmation and level progress animation
- Add optional description input (280 char)
- Integrate full flow: bind → proof → celebration → thread home
- Verify total completion time <30 seconds

Acceptance Criteria: All 8 verified for US-3.3
Epic: 3 (Daily Actions & Proof)
Story Points: 8 (US-3.3) + 5 (US-3.4) = 13 total"

git push origin thread-flow
```

### Notes

- **ATDD:** ✅ **YES** - Complex, multi-step, state management, proof handling
- **Estimated Time:** 10-12 hours
  - Bind Screen: 2 hrs
  - Timer: 3-4 hrs (background support is tricky)
  - Photo: 2 hrs
  - Completion: 3-4 hrs (backend + frontend + animation)
- **Blockers:** None - depends on Chunk 1 (binds data)
- **Critical:** Test timer in background thoroughly (lock phone, switch apps)
- **UX Note:** <30 second completion time is critical - measure with stopwatch

---

## 🟢 CHUNK 3: Daily Reflection Integration (US-4.1)

**Story:** US-4.1: Submit Daily Reflection
**Epic:** Epic 4 (Daily Reflection)
**Status:** ⚠️ PARTIALLY DONE (Story 4.1 implemented, needs integration)
**Estimated Time:** 1-2 hours

### Acceptance Criteria

- [ ] Daily Check-In card navigates to reflection screen
- [ ] Completing reflection removes red dot from check-in card
- [ ] Countdown timer resets at midnight
- [ ] Timer shows "Yesterday's Check-In" after midnight (flexible window)
- [ ] Streak calculation follows US-5.5 resilience rules
- [ ] Check-in card state updates when reflection submitted

### Build Tasks

1. **Verify Reflection Flow** (already exists from Story 4.1)
   - Check `app/(tabs)/settings/reflection.tsx` route works
   - Verify reflection submission endpoint works
   - Test fulfillment score, journal entry, tomorrow's intention

2. **Update ThreadHomeScreen**
   - Fetch user's journal entry for today
   - Update `hasCompletedReflection` state based on real data
   - Remove red dot when reflection exists
   - Ensure "Begin" button navigation works

3. **Create useHasReflectionToday Hook** (`src/hooks/useHasReflectionToday.ts`)
   - Query `journal_entries` for today's date
   - Return boolean: has reflection or not
   - Stale time: 30 seconds (frequent checks)

4. **Test Countdown Timer Edge Cases**
   - Test timer at 11:59 PM → midnight rollover
   - Verify "Yesterday's Check-In" message after midnight
   - Test flexible window (can still complete yesterday's within 24 hrs)

### Test Cycle

```bash
# 1. Manual Testing
npm start

# Test checklist:
# - Daily Check-In shows red dot when no reflection
# - Tap "Begin" → Navigate to reflection screen
# - Complete reflection
# - Return to Thread Home
# - Red dot removed
# - Check-in card updates status
# - Test at 11:59 PM (change device time)
# - Test after midnight (shows "Yesterday's Check-In")
```

### Quality Gates

```bash
# 1. TypeScript
cd weave-mobile && npx tsc --noEmit

# 2. Lint
npm run lint

# 3. Manual verification (all ACs checked)
```

### Commit Point

```bash
git add .
git commit -m "feat(thread): integrate daily reflection with thread home (US-4.1)

- Add useHasReflectionToday hook
- Update Daily Check-In card state based on real data
- Remove red dot when reflection completed
- Verify countdown timer midnight rollover
- Test flexible window (yesterday's check-in)

Acceptance Criteria: All 6 verified
Epic: 4 (Daily Reflection)
Story Points: N/A (integration only)"

git push origin thread-flow
```

### Notes

- **ATDD:** ❌ Not needed - already implemented, just integration testing
- **Estimated Time:** 1-2 hours (mostly testing edge cases)
- **Blockers:** None - Story 4.1 already complete
- **Critical:** Test midnight rollover thoroughly

---

## 🟡 CHUNK 4: Journal History (US-4.2, US-4.3)

**Stories:**
- US-4.2: View Past Journal Entries
- US-4.3: Edit Journal Entry

**Epic:** Epic 4 (Daily Reflection)
**Status:** 📋 TODO (Future - not critical for MVP)
**Estimated Time:** 4-5 hours

### Why These Stories Together?

Both access journal history, similar navigation patterns, complementary features.

### Acceptance Criteria

**US-4.2: View Past Journal Entries**
- [ ] Navigate from Profile/Settings to Journal History
- [ ] Show list of past journal entries (sorted by date, newest first)
- [ ] Each entry shows: date, fulfillment score, preview of reflection
- [ ] Tap entry → View full journal entry
- [ ] Empty state: "No journal entries yet. Start your first reflection!"

**US-4.3: Edit Journal Entry**
- [ ] View journal entry detail screen
- [ ] If entry < 24 hours old: Show "Edit" button
- [ ] If entry > 24 hours old: Read-only, no edit button
- [ ] Edit mode: Allow editing fulfillment score, reflection text, tomorrow's intention
- [ ] Save changes → Update `journal_entries` table
- [ ] Show confirmation toast on save

### Build Tasks

1. **Create JournalHistoryScreen** (`src/screens/JournalHistoryScreen.tsx`)
   - Route: `app/(tabs)/settings/journal-history.tsx`
   - Fetch past journal entries (paginated, last 30 days)
   - FlatList with entry cards
   - Each card: date, fulfillment score (emoji), preview text
   - Tap → Navigate to detail screen
   - Empty state component

2. **Create JournalEntryDetailScreen** (`src/screens/JournalEntryDetailScreen.tsx`)
   - Route: `app/(tabs)/settings/journal-history/[id].tsx`
   - Fetch single journal entry by ID
   - Show full reflection text, fulfillment score, tomorrow's intention
   - If < 24 hours: Show "Edit" button
   - If > 24 hours: Read-only view
   - Edit mode: Enable inputs, "Save" button

3. **Backend: Edit Endpoint** (`app/api/journal_router.py`)
   - Check if endpoint exists: `PATCH /api/journal-entries/{id}`
   - Verify edit restriction: < 24 hours
   - Update entry, return updated data

4. **Add Navigation**
   - Settings screen → "Journal History" menu item
   - Journal History → Entry Detail
   - Entry Detail → Edit mode → Save → Back to History

### Test Cycle

```bash
# 1. Manual Testing
npm start

# Test checklist:
# - Navigate to Journal History from Settings
# - View list of past entries (create 3-5 test entries first)
# - Tap entry → Detail screen shows
# - Verify read-only for old entries (>24 hrs)
# - Verify edit button for recent entries (<24 hrs)
# - Edit entry → Save → Verify update
# - Empty state shows when no entries
```

### Quality Gates

```bash
# 1. TypeScript
cd weave-mobile && npx tsc --noEmit

# 2. Lint
npm run lint

# 3. Backend tests
cd weave-api && uv run pytest tests/test_journal.py -v

# 4. Manual verification
```

### Commit Point

```bash
git add .
git commit -m "feat(thread): add journal history and editing (US-4.2, US-4.3)

- Create JournalHistoryScreen with past entries list
- Add JournalEntryDetailScreen with view/edit modes
- Implement 24-hour edit restriction
- Add navigation from Settings to Journal History
- Include empty state for no entries

Acceptance Criteria: All verified for US-4.2 and US-4.3
Epic: 4 (Daily Reflection)
Story Points: TBD"

git push origin thread-flow
```

### Notes

- **ATDD:** ❌ Not needed - simple CRUD with time-based restriction
- **Estimated Time:** 4-5 hours
- **Blockers:** None
- **Priority:** Low - not critical for MVP, can defer
- **Future Enhancement:** Add search/filter by date range

---

## Summary: Chunk Completion Checklist

### Chunk 1: Data Integration 🔵
- [ ] Backend: `GET /api/binds/today` endpoint
- [ ] Frontend: `useTodayBinds` hook
- [ ] Replace mock data in ThreadHomeScreen
- [ ] All 7 ACs verified
- [ ] Quality gates passed
- [ ] Committed: `feat(thread): implement US-3.1 view today's binds`

### Chunk 2: Bind Completion 🔴
- [ ] Bind Screen with accountability selection
- [ ] PomodoroTimer component with background support
- [ ] ProofCapture component with upload
- [ ] CompletionCelebration with confetti + affirmation
- [ ] Backend: `POST /api/binds/{id}/complete` endpoint
- [ ] Frontend: `useCompleteBinding` mutation
- [ ] All ACs verified for US-3.3 and US-3.4
- [ ] Quality gates + code review passed
- [ ] ATDD tests written and passing
- [ ] 4 commits: bind screen, timer, photo, completion

### Chunk 3: Reflection Integration 🟢
- [ ] `useHasReflectionToday` hook
- [ ] Daily Check-In card state updates
- [ ] Red dot removal when reflection completed
- [ ] Countdown timer edge cases tested
- [ ] All 6 ACs verified
- [ ] Quality gates passed
- [ ] Committed: `feat(thread): integrate daily reflection`

### Chunk 4: Journal History 🟡 (Future)
- [ ] JournalHistoryScreen with past entries
- [ ] JournalEntryDetailScreen with view/edit
- [ ] 24-hour edit restriction enforced
- [ ] Navigation from Settings
- [ ] All ACs verified for US-4.2 and US-4.3
- [ ] Quality gates passed
- [ ] Committed: `feat(thread): add journal history and editing`

---

## Page Completion Criteria (from thread-page.md lines 249-257)

This page is considered **complete** when:
1. ✅ Users can view today's binds grouped by needle
2. ✅ Users can complete binds with proof (timer, photo, video)
3. ✅ Completion flow includes confetti, affirmation, level progress
4. ✅ Users can submit daily reflection (fulfillment + journal)
5. ✅ Empty states handled gracefully
6. ✅ Profile icon navigates to settings

**Current Progress:**
- Phase 1 (Shell): ✅ Complete
- Chunk 1 (Data Integration): 📋 TODO
- Chunk 2 (Bind Completion): 📋 TODO
- Chunk 3 (Reflection Integration): 📋 TODO
- Chunk 4 (Journal History): 📋 Future (optional for MVP)

---

## Quality Standards

### Code Review Triggers

Run `/bmad:bmm:workflows:code-review` for:
- ✅ Chunk 2 (complex, multi-step, critical UX)
- ⚠️ Chunk 1 (optional, but recommended for backend API)
- ❌ Chunk 3 (simple integration)
- ❌ Chunk 4 (simple CRUD)

### ATDD Triggers

Run `/bmad:bmm:workflows:testarch-atdd` for:
- ✅ US-3.3 (Complete Bind with Proof) - Multi-step, proof handling
- ✅ US-3.4 (Timer Tracking) - Background timer, state management
- ❌ US-3.1 (View Today's Binds) - Simple read
- ❌ US-4.1 (Daily Reflection) - Already implemented
- ❌ US-4.2, US-4.3 (Journal History) - Simple CRUD

### Performance Targets

- **Thread Home load:** <10 seconds from mount to binds visible
- **Bind completion flow:** <30 seconds from Bind Screen open to Thread Home return
- **Timer background:** Must work when app backgrounded/locked
- **Cache invalidation:** Must trigger immediately after completion

---

## Next Steps

**Start with Chunk 1 (Data Integration)** 🔵

This is the foundation for everything else. Once complete, you can:
1. Test the full Thread Home with real data
2. Create goals/binds in onboarding and see them in Thread
3. Build Chunk 2 (Bind Completion) with real binds to complete

**Commands to begin:**

```bash
# 1. Create feature branch (if not already on thread-flow)
git checkout -b thread-flow

# 2. Review Chunk 1 tasks above
# Focus on: Backend API → Frontend Hook → Integration

# 3. Start building
cd weave-api
# Create app/api/binds/router.py

# 4. Track progress
# Update this document as you complete tasks
```

---

**Document Version:** 1.0
**Last Updated:** 2025-12-21
**Author:** Claude (Sonnet 4.5)
**Status:** Ready for implementation
