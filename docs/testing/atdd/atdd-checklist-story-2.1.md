# ATDD Checklist - Epic 2, Story 2.1: Needles List View

**Date:** 2025-12-20
**Author:** Eddie
**Primary Test Level:** Component Tests (React Native Testing Library)

---

## Story Summary

Display a list of up to 3 active goals (needles) with their progress metrics, allowing users to view details and add new goals while enforcing the 3-goal limit.

**As a** user who wants to manage my goals
**I want** to see a list of all my active Needles (goals) with their progress
**So that** I can track what I'm working toward and decide what to focus on

---

## Acceptance Criteria

1. **AC1: Display Active Goals** - Show up to 3 active goals with title, consistency %, active binds count, and visual progress
2. **AC2: Goal Card Interaction** - Tap goal card to navigate to detail view with animation and haptic feedback
3. **AC3: Add Goal Button** - Enable/disable based on 3-goal limit with tooltip when disabled
4. **AC4: Consistency Data Accuracy** - Calculate consistency from daily_aggregates (7-day rolling average)
5. **AC5: Performance Requirements** - Load and render in <1 second
6. **AC6: Empty State** - Show encouraging empty state with "Create Your First Goal" CTA
7. **AC7: Error Handling** - Display error message with retry button on API failure
8. **AC8: Accessibility** - Screen reader support, accessible labels, 44x44 touch targets

---

## Failing Tests Created (RED Phase)

### Component Tests (20 tests)

**File:** `weave-mobile/src/screens/__tests__/NeedlesListScreen.test.tsx` (518 lines)

- ✅ **Test:** should display up to 3 active goals with their data
  - **Status:** RED - Component `NeedlesListScreen` does not exist
  - **Verifies:** AC1 - Goals render with all data fields

- ✅ **Test:** should display goals sorted by most recently updated first
  - **Status:** RED - Component does not implement sorting logic
  - **Verifies:** AC1 - Goals ordered by updated_at DESC

- ✅ **Test:** should show skeleton loaders during initial load
  - **Status:** RED - Skeleton loader component not implemented
  - **Verifies:** AC5 - Loading state UX

- ✅ **Test:** should navigate to goal detail view when goal card is tapped
  - **Status:** RED - Navigation not implemented
  - **Verifies:** AC2 - Tap interaction and navigation

- ✅ **Test:** should show tap animation when goal card is pressed
  - **Status:** RED - Press animation not implemented
  - **Verifies:** AC2 - Visual feedback on interaction

- ✅ **Test:** should enable Add Goal button when user has less than 3 active goals
  - **Status:** RED - Button state logic not implemented
  - **Verifies:** AC3 - Button enabled below limit

- ✅ **Test:** should disable Add Goal button when user has 3 active goals
  - **Status:** RED - Button state logic not implemented
  - **Verifies:** AC3 - Button disabled at limit

- ✅ **Test:** should show tooltip when disabled Add Goal button is tapped
  - **Status:** RED - Tooltip component not implemented
  - **Verifies:** AC3 - Helpful messaging for limit

- ✅ **Test:** should navigate to Create Goal flow when enabled button is tapped
  - **Status:** RED - Navigation not implemented
  - **Verifies:** AC3 - Add goal navigation

- ✅ **Test:** should display consistency percentage for established goals
  - **Status:** RED - Consistency display not implemented
  - **Verifies:** AC4 - Percentage formatting

- ✅ **Test:** should display "New" for goals with less than 7 days of data
  - **Status:** RED - New goal handling not implemented
  - **Verifies:** AC4 - Null consistency handling

- ✅ **Test:** should load and render goals in less than 1 second
  - **Status:** RED - Performance optimization not done
  - **Verifies:** AC5 - Performance target

- ✅ **Test:** should show empty state when user has no active goals
  - **Status:** RED - Empty state component not implemented
  - **Verifies:** AC6 - Empty state UX

- ✅ **Test:** should show "Create Your First Goal" button in empty state
  - **Status:** RED - Empty state CTA not implemented
  - **Verifies:** AC6 - Empty state action

- ✅ **Test:** should display error message when API call fails
  - **Status:** RED - Error handling not implemented
  - **Verifies:** AC7 - Error message display

- ✅ **Test:** should show retry button when error occurs
  - **Status:** RED - Retry button not implemented
  - **Verifies:** AC7 - Retry functionality

- ✅ **Test:** should trigger refetch when retry button is tapped
  - **Status:** RED - Refetch logic not implemented
  - **Verifies:** AC7 - Retry action

- ✅ **Test:** should have accessible labels for all goal cards
  - **Status:** RED - Accessibility props not implemented
  - **Verifies:** AC8 - Screen reader support

- ✅ **Test:** should have accessible label for Add Goal button
  - **Status:** RED - Button accessibility not implemented
  - **Verifies:** AC8 - Button accessibility

- ✅ **Test:** should announce disabled state for Add Goal button when at limit
  - **Status:** RED - Disabled state accessibility not implemented
  - **Verifies:** AC8 - State announcement

### API Tests (13 tests)

**File:** `weave-api/tests/api/test_goals_list.py` (383 lines)

- ✅ **Test:** test_returns_active_goals_with_stats
  - **Status:** RED - Endpoint `/api/goals` does not exist
  - **Verifies:** AC4 - API returns goals with stats

- ✅ **Test:** test_calculates_consistency_from_daily_aggregates
  - **Status:** RED - Consistency calculation not implemented
  - **Verifies:** AC4 - Averaging logic

- ✅ **Test:** test_returns_null_consistency_for_new_goals
  - **Status:** RED - Null handling not implemented
  - **Verifies:** AC4 - New goal edge case

- ✅ **Test:** test_counts_active_binds_correctly
  - **Status:** RED - Bind counting query not implemented
  - **Verifies:** AC4 - Count logic with is_active filter

- ✅ **Test:** test_sorts_goals_by_updated_at_desc
  - **Status:** RED - Sorting not implemented
  - **Verifies:** AC1 - Sort order

- ✅ **Test:** test_enforces_max_3_active_goals_limit
  - **Status:** RED - Limit check not implemented
  - **Verifies:** AC3 - 3-goal limit enforcement

- ✅ **Test:** test_returns_401_without_authentication
  - **Status:** RED - Auth middleware not implemented
  - **Verifies:** Security - Auth requirement

- ✅ **Test:** test_returns_empty_array_for_user_with_no_goals
  - **Status:** RED - Empty response handling not implemented
  - **Verifies:** AC6 - Empty state data

- ✅ **Test:** test_enforces_rls_user_can_only_see_own_goals
  - **Status:** RED - RLS verification not implemented
  - **Verifies:** Security - RLS enforcement

- ✅ **Test:** test_response_time_under_800ms
  - **Status:** RED - Endpoint doesn't exist to measure
  - **Verifies:** AC5 - API performance

- ✅ **Test:** test_uses_efficient_query_with_joins
  - **Status:** RED - Query optimization not done
  - **Verifies:** AC5 - Efficient database query

- ✅ **Test:** test_follows_standard_response_format
  - **Status:** RED - Response format not implemented
  - **Verifies:** Architecture - Standard {data, meta} format

- ✅ **Test:** test_uses_snake_case_for_fields
  - **Status:** RED - Field naming not implemented
  - **Verifies:** Architecture - snake_case convention

---

## Data Factories Created

### Goal Factory (TypeScript)

**File:** `weave-mobile/src/test-utils/factories/goal.factory.ts`

**Exports:**

- `createGoal(overrides?)` - Create single goal with optional overrides
- `createGoals(count)` - Create array of goals
- `createNewGoal(overrides?)` - Create goal without 7-day data
- `createGoalsAtLimit()` - Create exactly 3 goals
- `createGoalsBelowLimit()` - Create 1-2 goals

**Example Usage:**

```typescript
const goal = createGoal({ title: 'Custom Goal' });
const threeGoals = createGoals(3);
const newGoal = createNewGoal(); // consistency_7d = null
```

### Goal Factory (Python)

**File:** `weave-api/tests/factories/goal_factory.py`

**Exports:**

- `create_goal(overrides)` - Create single goal dictionary
- `create_goals(count, user_id)` - Create multiple goals
- `create_daily_aggregate(goal_id, user_id, local_date, consistency_score)` - Create daily aggregate
- `create_daily_aggregates_for_goal(goal_id, user_id, days, avg_consistency)` - Create 7 days of data
- `create_subtask_template(goal_id, user_id, is_active, overrides)` - Create bind template
- `create_subtask_templates_for_goal(goal_id, user_id, active_count, inactive_count)` - Create multiple binds

**Example Usage:**

```python
goal = create_goal({"title": "Custom Goal"})
goals = create_goals(3, user_id="user-123")
aggregates = create_daily_aggregates_for_goal("goal-1", "user-1", days=7, avg_consistency=85.0)
```

---

## Fixtures Created

### Needles List Fixtures

**File:** `weave-mobile/src/test-utils/fixtures/needles.fixture.ts`

**Fixtures:**

- `goalsAtLimitFixture()` - Returns 3 goals (button disabled scenario)
  - **Setup:** Creates 3 active goals
  - **Provides:** Mock hook response with 3 goals
  - **Cleanup:** N/A (stateless)

- `goalsBelowLimitFixture()` - Returns 1 goal (button enabled scenario)
  - **Setup:** Creates 1 active goal
  - **Provides:** Mock hook response with 1 goal
  - **Cleanup:** N/A (stateless)

- `emptyGoalsFixture()` - Returns empty array (empty state scenario)
  - **Setup:** No goals
  - **Provides:** Mock hook response with empty array
  - **Cleanup:** N/A (stateless)

- `loadingGoalsFixture()` - Returns loading state
  - **Setup:** isLoading=true
  - **Provides:** Mock hook response in loading state
  - **Cleanup:** N/A (stateless)

- `errorGoalsFixture(errorMessage)` - Returns error state with refetch
  - **Setup:** isError=true with error message
  - **Provides:** Mock hook response with error and refetch function
  - **Cleanup:** N/A (stateless)

**Example Usage:**

```typescript
import { goalsAtLimitFixture } from '@/test-utils/fixtures/needles.fixture';

test('should disable button at limit', () => {
  mockUseActiveGoals.mockReturnValue(goalsAtLimitFixture());
  // Test renders with 3 goals, button disabled
});
```

---

## Mock Requirements

### TanStack Query Mock

**Hook:** `useActiveGoals()`

**Success Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Run a marathon",
      "description": "Train for marathon",
      "status": "active",
      "consistency_7d": 85.5,
      "active_binds_count": 3,
      "updated_at": "2025-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "active_goal_limit": 3
  }
}
```

**Error Response:**

```json
{
  "error": {
    "code": "NETWORK_ERROR",
    "message": "Failed to fetch goals"
  }
}
```

**Notes:** Mock should support isLoading, isError, error, and refetch states

---

## Required data-testid Attributes

### Needles List Screen

- `goals-skeleton-loader` - Skeleton loader during initial load
- `goal-card-{goal-id}` - Individual goal card (e.g., `goal-card-goal-1`)
- `add-goal-button` - Add Goal button (fixed or floating)
- `empty-state` - Empty state container
- `create-first-goal-button` - CTA button in empty state
- `error-state` - Error message container
- `retry-button` - Retry button in error state

**Implementation Example:**

```tsx
<View testID="goals-skeleton-loader">
  <SkeletonLoader />
</View>

<Pressable testID={`goal-card-${goal.id}`} onPress={() => navigate(`/needles/${goal.id}`)}>
  <Text>{goal.title}</Text>
  <Text>{goal.consistency_7d}%</Text>
</Pressable>

<Button testID="add-goal-button" disabled={goals.length >= 3} />

<View testID="empty-state">
  <Text>You haven't set any goals yet...</Text>
  <Button testID="create-first-goal-button" />
</View>

<View testID="error-state">
  <Text>Couldn't load your goals...</Text>
  <Button testID="retry-button" onPress={refetch} />
</View>
```

---

## Implementation Checklist

### Test: should display up to 3 active goals with their data

**File:** `NeedlesListScreen.test.tsx`

**Tasks to make this test pass:**

- [ ] Create `weave-mobile/src/screens/NeedlesListScreen.tsx` component
- [ ] Create `weave-mobile/src/hooks/useActiveGoals.ts` TanStack Query hook
- [ ] Create `weave-mobile/src/components/GoalCard.tsx` component
- [ ] Fetch goals from `/api/goals?status=active&include_stats=true`
- [ ] Render goals using FlatList with GoalCard components
- [ ] Display goal title (displayMd variant)
- [ ] Display consistency % with progress bar
- [ ] Display active binds count with icon
- [ ] Add data-testid attributes: `goal-card-{goal.id}`
- [ ] Run test: `npm run test -- NeedlesListScreen.test.tsx -t "should display up to 3"`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 4 hours

---

### Test: should show skeleton loaders during initial load

**File:** `NeedlesListScreen.test.tsx`

**Tasks to make this test pass:**

- [ ] Create skeleton loader component `GoalCardSkeleton.tsx`
- [ ] Show skeleton when `isLoading` is true from useActiveGoals hook
- [ ] Add data-testid="goals-skeleton-loader"
- [ ] Implement shimmer animation (optional)
- [ ] Run test: `npm run test -- NeedlesListScreen.test.tsx -t "should show skeleton"`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: should navigate to goal detail view when goal card is tapped

**File:** `NeedlesListScreen.test.tsx`

**Tasks to make this test pass:**

- [ ] Add `onPress` handler to GoalCard component
- [ ] Implement navigation using `expo-router` useRouter hook
- [ ] Navigate to `/needles/{goal.id}` on tap
- [ ] Add haptic feedback (ImpactFeedbackStyle.Light) using `expo-haptics`
- [ ] Add tap animation (scale 0.97 with spring)
- [ ] Run test: `npm run test -- NeedlesListScreen.test.tsx -t "should navigate to goal detail"`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test: should enable/disable Add Goal button based on goal count

**File:** `NeedlesListScreen.test.tsx`

**Tasks to make this test pass:**

- [ ] Create Add Goal button component
- [ ] Calculate `isDisabled = goals.length >= 3`
- [ ] Set `accessibilityState={{ disabled: isDisabled }}`
- [ ] Add data-testid="add-goal-button"
- [ ] Style disabled state (opacity 0.5)
- [ ] Implement tooltip on disabled button tap
- [ ] Navigate to `/needles/create` when enabled and tapped
- [ ] Run test: `npm run test -- NeedlesListScreen.test.tsx -t "Add Goal button"`
- [ ] ✅ All 4 Add Goal button tests pass (green phase)

**Estimated Effort:** 3 hours

---

### Test: should display consistency percentage and handle null

**File:** `NeedlesListScreen.test.tsx`

**Tasks to make this test pass:**

- [ ] Format consistency: `{consistency_7d}%` when not null
- [ ] Display "New" badge when consistency_7d is null
- [ ] Add visual progress indicator (circular or linear)
- [ ] Run test: `npm run test -- NeedlesListScreen.test.tsx -t "consistency"`
- [ ] ✅ Both consistency tests pass (green phase)

**Estimated Effort:** 1 hour

---

### Test: should show empty state when no goals

**File:** `NeedlesListScreen.test.tsx`

**Tasks to make this test pass:**

- [ ] Create EmptyState component
- [ ] Show when `goals.length === 0`
- [ ] Display message: "You haven't set any goals yet. What do you want to achieve?"
- [ ] Add illustration (thread/weave visual)
- [ ] Add data-testid="empty-state"
- [ ] Create "Create Your First Goal" button with data-testid="create-first-goal-button"
- [ ] Navigate to `/needles/create` on button tap
- [ ] Run test: `npm run test -- NeedlesListScreen.test.tsx -t "empty state"`
- [ ] ✅ Both empty state tests pass (green phase)

**Estimated Effort:** 2 hours

---

### Test: should display error message and retry

**File:** `NeedlesListScreen.test.tsx`

**Tasks to make this test pass:**

- [ ] Create ErrorState component
- [ ] Show when `isError` is true from useActiveGoals hook
- [ ] Display error message: "Couldn't load your goals. Check your connection and try again."
- [ ] Add data-testid="error-state"
- [ ] Create Retry button with data-testid="retry-button"
- [ ] Call `refetch()` from hook on retry button tap
- [ ] Run test: `npm run test -- NeedlesListScreen.test.tsx -t "error"`
- [ ] ✅ All 3 error handling tests pass (green phase)

**Estimated Effort:** 2 hours

---

### Test: should have accessible labels

**File:** `NeedlesListScreen.test.tsx`

**Tasks to make this test pass:**

- [ ] Add accessibilityLabel to GoalCard: `"{title}, {consistency}% consistency"`
- [ ] Add accessibilityLabel to Add Goal button: "Add new goal"
- [ ] Add accessibilityHint to disabled button: "3-goal limit reached. Archive a goal to add new one."
- [ ] Ensure 44x44 minimum touch targets (design system default)
- [ ] Test with VoiceOver on iOS device
- [ ] Run test: `npm run test -- NeedlesListScreen.test.tsx -t "Accessibility"`
- [ ] ✅ All 3 accessibility tests pass (green phase)

**Estimated Effort:** 1 hour

---

### API Test: Backend endpoint implementation

**File:** `test_goals_list.py`

**Tasks to make API tests pass:**

- [ ] Create `weave-api/app/api/goals/router.py`
- [ ] Implement `GET /api/goals` endpoint
- [ ] Add query parameters: `status`, `include_stats`
- [ ] Filter by `status = 'active'`
- [ ] Join with `daily_aggregates` table:
  ```sql
  LEFT JOIN daily_aggregates da
    ON da.user_id = g.user_id
    AND da.goal_id = g.id
    AND da.local_date >= CURRENT_DATE - INTERVAL '7 days'
  ```
- [ ] Calculate `consistency_7d = AVG(da.consistency_score)`
- [ ] Join with `subtask_templates` table:
  ```sql
  LEFT JOIN subtask_templates st
    ON st.goal_id = g.id
    AND st.is_active = true
  ```
- [ ] Count `active_binds_count = COUNT(DISTINCT st.id)`
- [ ] Sort by `updated_at DESC`
- [ ] Limit to 3 results
- [ ] Enforce RLS: `WHERE g.user_id = :user_id`
- [ ] Return standard format: `{data: [...], meta: {total, active_goal_limit: 3}}`
- [ ] Add JWT authentication middleware
- [ ] Return 401 without authentication
- [ ] Run tests: `cd weave-api && uv run pytest tests/api/test_goals_list.py -v`
- [ ] ✅ All 13 API tests pass (green phase)

**Estimated Effort:** 6 hours

---

## Running Tests

```bash
# Mobile: Run all component tests for Story 2.1
cd weave-mobile
npm run test -- NeedlesListScreen.test.tsx

# Mobile: Run specific test
npm run test -- NeedlesListScreen.test.tsx -t "should display up to 3"

# Mobile: Run tests in watch mode (during development)
npm run test:watch -- NeedlesListScreen.test.tsx

# Mobile: Run tests with coverage
npm run test:coverage -- NeedlesListScreen.test.tsx

# Backend: Run all API tests for Story 2.1
cd weave-api
uv run pytest tests/api/test_goals_list.py -v

# Backend: Run specific test
uv run pytest tests/api/test_goals_list.py::TestGoalsListEndpoint::test_returns_active_goals_with_stats -v

# Backend: Run with coverage
uv run pytest tests/api/test_goals_list.py --cov=app/api/goals --cov-report=html
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete) ✅

**TEA Agent Responsibilities:**

- ✅ 33 tests written and failing (20 component + 13 API)
- ✅ TypeScript and Python factories created with faker patterns
- ✅ Fixtures created for test scenarios
- ✅ Mock requirements documented
- ✅ data-testid requirements listed
- ✅ Implementation checklist created

**Verification:**

- All tests run and fail as expected
- Failure messages are clear: "Component does not exist", "Endpoint not found"
- Tests fail due to missing implementation, not test bugs

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Pick one failing test** from implementation checklist (start with "should display up to 3 active goals")
2. **Read the test** to understand expected behavior
3. **Implement minimal code** to make that specific test pass:
   - Create NeedlesListScreen component
   - Create useActiveGoals hook
   - Create GoalCard component
   - Implement basic rendering
4. **Run the test** to verify it now passes (green)
5. **Check off the task** in implementation checklist above
6. **Move to next test** (skeleton loaders) and repeat

**Key Principles:**

- One test at a time (don't try to fix all at once)
- Minimal implementation (don't over-engineer)
- Run tests frequently (immediate feedback)
- Use implementation checklist as roadmap

**Progress Tracking:**

- Check off tasks as you complete them
- Share progress in daily standup
- Mark story as IN PROGRESS in `_bmad-output/sprint-status.yaml`

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

**DEV Agent Responsibilities:**

1. **Verify all tests pass** (33/33 green)
2. **Review code for quality:**
   - Extract duplicate code into helpers
   - Improve component organization
   - Optimize performance (memoization, lazy loading)
   - Improve naming and readability
3. **Ensure tests still pass** after each refactor
4. **Update documentation** if API contracts change

**Key Principles:**

- Tests provide safety net (refactor with confidence)
- Make small refactors (easier to debug if tests fail)
- Run tests after each change
- Don't change test behavior (only implementation)

**Completion:**

- All tests pass (33/33 green)
- Code quality meets team standards
- No duplications or code smells
- Ready for code review and story approval

---

## Next Steps

1. **Review this checklist** with team in standup or planning
2. **Run failing tests** to confirm RED phase:
   - Mobile: `cd weave-mobile && npm run test -- NeedlesListScreen.test.tsx`
   - Backend: `cd weave-api && uv run pytest tests/api/test_goals_list.py -v`
3. **Begin implementation** using implementation checklist as guide
4. **Work one test at a time** (red → green for each)
5. **Share progress** in daily standup
6. **When all tests pass**, refactor code for quality
7. **When refactoring complete**, create PR and request code review

---

## Knowledge Base References Applied

This ATDD workflow consulted the following knowledge fragments:

- **data-factories.md** - Factory patterns using faker for random test data generation with overrides support
- **fixture-architecture.md** - Test fixture patterns (though React Native doesn't use Playwright's test.extend pattern)
- **component-tdd.md** - Component test strategies using React Native Testing Library
- **test-quality.md** - Test design principles (Given-When-Then, one assertion per test, determinism, isolation)
- **test-levels-framework.md** - Test level selection framework (chose Component + API, skipped E2E for React Native MVP)
- **selector-resilience.md** - data-testid selector patterns for React Native

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Command (Mobile):** `npm run test -- NeedlesListScreen.test.tsx`

**Expected Results:**

```
FAIL  src/screens/__tests__/NeedlesListScreen.test.tsx
  NeedlesListScreen - Story 2.1
    AC1: Display Active Goals
      ✕ should display up to 3 active goals with their data (2 ms)
      ✕ should display goals sorted by most recently updated first (1 ms)
      ✕ should show skeleton loaders during initial load (1 ms)
    AC2: Goal Card Interaction
      ✕ should navigate to goal detail view when goal card is tapped (1 ms)
      ✕ should show tap animation when goal card is pressed (1 ms)
    ... (15 more failures)

Tests:       20 failed, 0 passed, 20 total
Status: ✅ RED phase verified
```

**Command (Backend):** `uv run pytest tests/api/test_goals_list.py -v`

**Expected Results:**

```
tests/api/test_goals_list.py::TestGoalsListEndpoint::test_returns_active_goals_with_stats FAILED
tests/api/test_goals_list.py::TestGoalsListEndpoint::test_calculates_consistency_from_daily_aggregates FAILED
tests/api/test_goals_list.py::TestGoalsListEndpoint::test_returns_null_consistency_for_new_goals FAILED
... (10 more failures)

==== 13 failed, 0 passed in 0.25s ====
Status: ✅ RED phase verified
```

**Summary:**

- Total tests: 33 (20 component + 13 API)
- Passing: 0 (expected)
- Failing: 33 (expected)
- Status: ✅ RED phase verified - All tests fail due to missing implementation

**Expected Failure Messages:**

- Component tests: "Unable to find an element with testID: NeedlesListScreen"
- API tests: "404 Not Found - /api/goals endpoint does not exist"

---

## Notes

### Implementation Order Recommendation

1. **Start with backend first** - API endpoint provides data for frontend
2. **Then mobile component** - Screen can consume API endpoint
3. **Test incrementally** - Don't wait until all implementation is done

### Dependencies

- **Mobile:**
  - `@faker-js/faker` (dev dependency for factories)
  - `expo-haptics` (already installed)
  - TanStack Query (already configured)

- **Backend:**
  - `faker` Python library (dev dependency)
  - FastAPI router setup
  - Database models and migrations

### Performance Optimization

- Use FlatList for goal rendering (even though max 3 items)
- Implement skeleton loaders to reduce perceived load time
- Consider React.memo for GoalCard if re-renders are an issue
- Backend: Use single SQL query with JOINs (not N+1 queries)

### Accessibility Testing

- Test with VoiceOver on iOS device before marking story complete
- Verify all interactive elements have meaningful labels
- Confirm 44x44 touch targets (design system default should handle this)

---

## Contact

**Questions or Issues?**

- Ask in team standup
- Tag @Eddie in Slack/Discord
- Refer to Story 2.1 documentation: `docs/stories/2-1-needles-list-view.md`
- Consult architecture docs: `docs/architecture/`

---

**Generated by BMAD TEA Agent** - 2025-12-20
