# Story 2.1: Needles List View

**Epic:** 2 - Goal Management
**Story Points:** 3
**Status:** in-progress
**Priority:** P1 (Must Have)

---

## Story

As a **user who wants to manage my goals**,
I want to **see a list of all my active Needles (goals) with their progress**,
so that **I can track what I'm working toward and decide what to focus on**.

---

## Business Context

**Why This Matters:**
- **Goal visibility** - Users need to see their active goals at a glance to maintain focus
- **Progress transparency** - Showing consistency % and bind counts reinforces progress
- **3-goal limit enforcement** - Prevents overwhelm and maintains focus on what matters most
- **Gateway to goal management** - This screen is the entry point for viewing, editing, and archiving goals

**Success Metrics:**
- Screen loads in <1 second with goal data
- Users can identify their most/least consistent goal within 5 seconds
- 80%+ users successfully tap a goal to view details
- Zero confusion about 3-goal limit (clear messaging when limit reached)

---

## Acceptance Criteria

### AC1: Display Active Goals
**Given** a user navigates to the Needles List screen
**When** the screen loads
**Then** it must display:
- Up to 3 active goals (needles) from the `goals` table (where `status = 'active'`)
- Each goal card shows:
  - Goal title (bold, displayMd variant)
  - Consistency % (7-day rolling average from `daily_aggregates`)
  - Active binds count (count of associated `subtask_templates` where `is_active = true`)
  - Visual progress indicator (progress bar or circular progress)
- Goals sorted by: most recently updated first
- Empty state if no active goals (see AC6)

### AC2: Goal Card Interaction
**Given** a user views the goals list
**When** they tap on a goal card
**Then**:
- Navigate to Goal Detail View (Story 2.2)
- Pass `goal_id` as navigation parameter
- Show tap animation (scale 0.97 with spring) and haptic feedback (ImpactFeedbackStyle.Light)
- Transition animation is smooth (200ms ease-out)

### AC3: Add Goal Button
**Given** a user views the goals list
**When** the screen displays the "Add Goal" button
**Then**:
- Button is positioned at the bottom (fixed or floating)
- Button shows "Add Goal" text with icon (plus icon)
- **If** user has 3 active goals:
  - Button is disabled (opacity 0.5)
  - Button shows tooltip on tap: "You've reached the 3-goal limit. Archive a goal to add a new one."
- **If** user has <3 active goals:
  - Button is enabled and interactive
  - Tapping navigates to Create New Goal flow (Story 2.3a)

### AC4: Consistency Data Accuracy
**Given** a user views their goals
**When** the consistency % is displayed
**Then**:
- Consistency is calculated as: (completed binds in last 7 days) / (total expected bind instances in last 7 days) × 100
- Data is fetched from `daily_aggregates` table (pre-computed)
- If no data available (new goal <7 days old), show "—" or "New" instead of 0%
- Consistency updates reflect latest completion data (use TanStack Query with 5-minute staleTime)

### AC5: Performance Requirements
**Given** the app fetches goal data
**When** the screen renders
**Then**:
- Initial load completes in <1s (including API call)
- Use skeleton loaders during data fetch
- If data fetch fails, show error state with retry button (see AC7)
- Navigation from Dashboard → Needles List is instant (<200ms)

### AC6: Empty State
**Given** a new user or user with no active goals
**When** they view the Needles List screen
**Then**:
- Show empty state illustration (thread/weave visual)
- Display message: "You haven't set any goals yet. What do you want to achieve?"
- Show prominent "Create Your First Goal" button
- No goal cards visible

### AC7: Error Handling
**Given** the API call to fetch goals fails
**When** an error occurs (network timeout, server error)
**Then**:
- Show error message: "Couldn't load your goals. Check your connection and try again."
- Display "Retry" button
- Tapping "Retry" re-fetches data
- If cached data exists, show stale data with warning banner

### AC8: Accessibility
**Given** a user with accessibility needs
**When** using the Needles List screen
**Then**:
- All goal cards are screen reader accessible with meaningful labels
- Consistency % announced as "X percent consistency"
- "Add Goal" button has accessible label and disabled state announced
- Minimum 44x44 touch targets for all interactive elements
- Respects reduce motion settings

---

## Tasks / Subtasks

### Task 1: Create Needles List Screen Component (AC1, AC2)
- [x] Create `weave-mobile/app/(tabs)/needles/index.tsx` using Expo Router
- [x] Implement NativeWind styling with SafeAreaView
- [x] Create `GoalCard` component to display individual goal
  - [x] Goal title (bold text)
  - [x] Consistency % with visual progress bar
  - [x] Active binds count with icon
  - [x] Tap handler with navigation to detail view
- [x] Add goal list rendering with FlatList (optimized for small lists)
- [x] Sort goals by `updated_at DESC`

### Task 2: Implement API Integration (AC1, AC4)
- [x] Create TanStack Query hook: `useActiveGoals()`
  - [x] Fetch from `/api/goals?status=active&include_stats=true`
  - [x] Configure staleTime: 5 minutes
  - [x] Configure cacheTime: 10 minutes
- [x] API endpoint returns:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "title": "Run a marathon",
        "description": "...",
        "status": "active",
        "consistency_7d": 85.5,
        "active_binds_count": 3,
        "updated_at": "2025-01-15T10:30:00Z"
      }
    ],
    "meta": {
      "total": 2,
      "active_goal_limit": 3
    }
  }
  ```
- [x] Handle loading state with skeleton loaders
- [x] Handle error state with retry button

### Task 3: Backend API Endpoint (AC1, AC4)
- [x] Create `weave-api/app/api/goals/router.py`
- [x] Implement `GET /api/goals` endpoint
  - [x] Filter by `status = 'active'`
  - [x] Join with `daily_aggregates` for consistency data
  - [x] Count active subtask_templates for binds_count
  - [x] Enforce RLS (user can only see own goals)
  - [x] Return max 3 active goals
- [ ] Add unit tests for endpoint (PARTIAL - see review findings)
  - [x] Test with 0, 1, 2, 3 active goals
  - [ ] Test consistency calculation (TODO in test file)
  - [ ] Test RLS enforcement (TODO in test file)

### Task 4: Add Goal Button Logic (AC3)
- [x] Add floating action button or bottom button
- [x] Implement 3-goal limit check
  - [x] Disable button if `active_goals.length >= 3`
  - [x] Show tooltip on disabled button tap
- [x] Add navigation to Create Goal flow (Story 2.3a)
- [x] Add haptic feedback and animation

### Task 5: Empty State (AC6)
- [x] Create empty state component
- [ ] Add illustration (use existing design system assets) - Currently text-only
- [x] Add "Create Your First Goal" CTA
- [x] Show when `active_goals.length === 0`

### Task 6: Error Handling (AC7)
- [x] Implement error boundary for screen
- [x] Create error UI component with retry button
- [ ] Add offline detection with NetInfo (not implemented)
- [ ] Show stale data warning if offline (not implemented)

### Task 7: Testing & Validation (AC8)
- [x] Test with 0, 1, 2, 3 active goals (manual testing)
- [ ] Test tap navigation to detail view (Story 2.2 not implemented)
- [x] Test Add Goal button (enabled/disabled states)
- [x] Test consistency % display (various values)
- [x] Test empty state
- [x] Test error state and retry
- [ ] Test accessibility (VoiceOver on iOS) (not validated)
- [ ] Test performance (<1s load time) (not validated)

---

## Dev Agent Record

### Implementation Summary
Story 2.1 implemented the Needles List View with full backend API, frontend components, and initial test coverage. Core functionality complete with some items requiring follow-up (tooltip, comprehensive tests, accessibility validation).

### File List

**Frontend - New Files Created:**
- `weave-mobile/app/(tabs)/needles.tsx` - Route wrapper for Needles screen
- `weave-mobile/src/screens/NeedlesListScreen.tsx` - Main screen component with list, empty state, error state
- `weave-mobile/src/components/GoalCard.tsx` - Individual goal card component with tap animation
- `weave-mobile/src/components/GoalCardSkeleton.tsx` - Loading skeleton for goals
- `weave-mobile/src/hooks/useActiveGoals.ts` - TanStack Query hook for fetching goals
- `weave-mobile/src/services/goals.ts` - API service for goals endpoints
- `weave-mobile/src/types/goals.ts` - TypeScript types for Goal and GoalsResponse
- `weave-mobile/src/contexts/QueryClientProvider.tsx` - TanStack Query setup
- `weave-mobile/src/test-utils/factories/goal.factory.ts` - Test data factories
- `weave-mobile/src/test-utils/fixtures/needles.fixture.ts` - Test fixtures
- `weave-mobile/src/test-utils/mockData.ts` - Mock data for testing

**Frontend - Modified Files:**
- `weave-mobile/src/design-system/components/Card/Card.tsx` - Fixed animated style bug for non-pressable cards
- `weave-mobile/app/(tabs)/index.tsx` - Updated tab navigation
- `weave-mobile/app/_layout.tsx` - Root layout updates
- `weave-mobile/app/(onboarding)/welcome.tsx` - Minor updates

**Backend - New Files Created:**
- `weave-api/app/api/goals/` - Goals API module directory
- `weave-api/app/api/goals/router.py` - GET /api/goals endpoint with stats calculation
- `weave-api/tests/api/test_goals_list.py` - ATDD tests for goals endpoint
- `weave-api/tests/factories/` - Test factories directory
- `scripts/create_test_goals.py` - Utility script for creating test goals

**Backend - Modified Files:**
- `weave-api/app/main.py` - Added goals router to app

**Documentation:**
- `docs/stories/2-1-needles-list-view.md` - This story file
- `docs/stories/2-1-architecture-alignment.md` - Architecture validation
- `docs/stories/validation-report-2.1-20251220.md` - Validation report
- `_bmad-output/atdd-checklist-2.1.md` - ATDD checklist

### Change Log

**2025-12-21 - Code Review & Fixes (AI Review Agent)**
- Updated story status: `not_started` → `in-progress`
- Marked completed tasks with [x]
- Added Dev Agent Record section with comprehensive file list
- ✅ FIXED: AC3 tooltip - shows toast when tapping disabled "Add Goal" button
- ✅ FIXED: Removed all debug console.log() statements from production code
- ✅ FIXED: Error response format - added custom HTTPException handler for `{error: {code, message}}` format
- Documented known issues: theme system, test coverage gaps, accessibility validation pending

**2025-12-20 - Initial Implementation (Dev Agent)**
- Implemented frontend Needles List screen with all UI states
- Created backend GET /api/goals endpoint with stats calculation
- Added TanStack Query integration with proper caching
- Implemented skeleton loaders and error handling
- Fixed Card component animation bug
- Fixed text visibility with explicit colors (temporary fix)
- Created test goals script for development

### Known Issues & Follow-ups
1. **Theme System:** Text colors use hardcoded hex values instead of NativeWind tokens (needs global fix)
2. **Test Coverage:** Backend tests have TODOs for consistency calculation, RLS enforcement, N+1 query validation
3. **Frontend Tests:** No React Native component tests yet
4. **AC3 Tooltip:** Button disables but doesn't show tooltip on tap (needs Toast component)
5. **AC6 Illustration:** Empty state uses text only, no illustration
6. **AC8 Accessibility:** VoiceOver testing not performed
7. **AC5 Performance:** End-to-end load time not validated

---

## Technical Design

### Data Flow

```
Mobile App (Needles List Screen)
    │
    ├─► TanStack Query: useActiveGoals()
    │       │
    │       └─► GET /api/goals?status=active&include_stats=true
    │               │
    │               └─► FastAPI Router: goals.router.py
    │                       │
    │                       ├─► Query: goals table (status='active', RLS enforced)
    │                       ├─► Join: daily_aggregates (for consistency_7d)
    │                       └─► Count: subtask_templates (active_binds_count)
    │
    └─► Render: FlatList with GoalCard components
```

### Database Queries

**Primary Query:**
```sql
SELECT
    g.id,
    g.title,
    g.description,
    g.status,
    g.updated_at,
    AVG(da.consistency_score) as consistency_7d,
    COUNT(DISTINCT st.id) as active_binds_count
FROM goals g
LEFT JOIN daily_aggregates da
    ON da.user_id = g.user_id
    AND da.goal_id = g.id
    AND da.local_date >= CURRENT_DATE - INTERVAL '7 days'
LEFT JOIN subtask_templates st
    ON st.goal_id = g.id
    AND st.is_active = true
WHERE g.user_id = :user_id
    AND g.status = 'active'
GROUP BY g.id
ORDER BY g.updated_at DESC
LIMIT 3;
```

### State Management

- **Server State:** TanStack Query (useActiveGoals hook)
- **Local UI State:** None required (stateless component)
- **Navigation State:** Expo Router handles navigation

### Performance Considerations

- Use FlatList for rendering (even though max 3 items, prepares for future)
- Skeleton loaders during initial fetch
- Optimistic updates when navigating back from detail view
- Cache invalidation on goal create/edit/archive actions

---

## Definition of Done

- [ ] All acceptance criteria pass
- [ ] All tasks completed
- [ ] Unit tests pass (backend endpoint)
- [ ] Component tests pass (mobile screen)
- [ ] Manual testing completed:
  - [ ] Tested with 0, 1, 2, 3 active goals
  - [ ] Verified consistency % accuracy
  - [ ] Verified 3-goal limit enforcement
  - [ ] Tested tap navigation
  - [ ] Tested Add Goal button states
  - [ ] Tested empty state
  - [ ] Tested error state
- [ ] Code review completed
- [ ] Accessibility verified (VoiceOver)
- [ ] Performance verified (<1s load time)
- [ ] No type errors (TypeScript, Python type hints)
- [ ] No linting errors
- [ ] Documentation updated (if new patterns introduced)

---

## Dependencies

**Blockers:**
- Epic 0: Foundation (database, auth, RLS)
- Story 1.7: First Commitment (user must have first goal from onboarding)

**Depends On:**
- `goals` table exists with proper schema
- `daily_aggregates` table exists with consistency data
- `subtask_templates` table exists
- TanStack Query configured in app
- NativeWind design system available
- Expo Router navigation configured

**Blocks:**
- Story 2.2: Goal Detail View (needs navigation from list)
- Story 2.3a: New Goal Input (needs Add Goal button)
- Story 2.4: Edit Goal (needs goal selection)
- Story 2.5: Archive Goal (needs goal selection)

---

## Notes

### Design Considerations

- **Visual Hierarchy:** Goals should feel like cards, not list items - use depth and shadow
- **Progress Visualization:** Consider circular progress indicator vs. linear progress bar (circular feels more premium)
- **3-Goal Limit Messaging:** Should feel like a feature, not a restriction ("Stay focused on what matters most")
- **Empty State:** Should be encouraging, not discouraging - "Your journey starts here"

### Future Enhancements (Out of Scope for Story 2.1)

- Drag-to-reorder goals (priority ordering)
- Filter goals by consistency (show struggling goals first)
- Search/filter archived goals
- Goal templates (quick-start goals)
- Share goal progress as image

### Related Stories

- Story 2.2: Goal Detail View (tapped from this list)
- Story 2.3a: New Goal Input (accessed via Add Goal button)
- Story 5.1: Dashboard Overview (Needles overview section shows summary)

---

## Validation Checklist

### Before Starting Implementation
- [ ] Story reviewed with team
- [ ] Design mockups reviewed (if available)
- [ ] API contract agreed upon
- [ ] Database schema confirmed
- [ ] Dependencies verified (database tables exist)

### During Implementation
- [ ] Following naming conventions (snake_case DB, camelCase TS)
- [ ] Using TanStack Query for server state (not Zustand)
- [ ] Following RLS patterns (auth.uid() lookup)
- [ ] Following API response format: `{data, error, meta}`
- [ ] No hardcoded values (use design system tokens)

### Before Marking Complete
- [ ] All ACs pass
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Accessibility verified
- [ ] Performance verified
- [ ] Code reviewed
- [ ] Merged to main branch

---

## Story Status

**Current Status:** not_started
**Assigned To:** TBD
**Started:** TBD
**Completed:** TBD
**Reviewed:** TBD

---

## References

- Epic 2: Goal Management (`docs/prd/epic-2-goal-management.md`)
- Architecture: Data Access Strategy (`docs/architecture/core-architectural-decisions.md`)
- Database Schema: goals, daily_aggregates, subtask_templates
- Design System: NativeWind components
- API Patterns: `docs/architecture/implementation-patterns-consistency-rules.md`
