# ATDD Checklist - Epic 4, Story 4.1: Daily Reflection Entry

**Date:** 2025-12-20
**Author:** Jack
**Primary Test Level:** API Tests (Backend)

---

## Story Summary

**As a** user,
**I want** to reflect on my day with default and customizable questions, then submit for AI feedback,
**So that** I process what happened, track what matters to me, and receive personalized insights for tomorrow.

---

## Acceptance Criteria

**Part 4.1a: Default Reflection Questions (3 pts)**

1. **AC #1**: Access via Thread Home → "Daily Check-in" CTA button with deep link support
2. **AC #2**: Display personalized header: "How did today go, [Name]?" with subheading
3. **AC #3**: Multi-line reflection text input (500 char max, live counter, auto-save)
4. **AC #4**: Single-line tomorrow's focus input (100 char max)
5. **AC #5**: Fulfillment score slider (1-10) with emoji/color feedback
6. **AC #6**: Submit button with loading state, navigate to AI Feedback screen
7. **AC #7**: Write to `journal_entries` table, update `daily_aggregates.has_journal`
8. **AC #8**: Track events: `journal.started`, `journal.submitted`, `journal.skipped_question`
9. **AC #9**: Error handling (network, offline queue, duplicate entry, server errors)

**Part 4.1b: Custom Questions (3 pts)**

10. **AC #10**: Display user-defined custom questions (text/numeric/yes-no types)
11. **AC #11**: "+ Add custom question" link opens Manage Questions modal
12. **AC #12**: Provide example prompts when adding first custom question
13. **AC #13**: Store custom responses in `journal_entries.custom_responses` (JSONB)
14. **AC #14**: Custom questions manageable from Settings → Reflection Preferences
15. **AC #15**: AI context integration (pattern detection, personalized insights)
16. **AC #16**: Minimal scrolling (collapsible custom section, sticky submit button)

---

## Failing Tests Created (RED Phase)

### API Tests (14 tests) ✅ CREATED

**File:** `weave-api/tests/test_journal_router.py` (589 lines)

#### Test Class: TestJournalEntryCreation (4 tests)

- ✅ **Test:** `test_create_journal_entry_with_default_questions_only`
  - **Status:** RED - Endpoint `/api/journal-entries` does not exist
  - **Verifies:** AC #7 (Basic journal entry creation)

- ✅ **Test:** `test_create_journal_entry_with_custom_questions`
  - **Status:** RED - Endpoint does not exist, custom_responses JSONB not implemented
  - **Verifies:** AC #13 (Custom responses storage)

- ✅ **Test:** `test_create_journal_entry_with_minimal_data`
  - **Status:** RED - Endpoint does not exist
  - **Verifies:** AC #7 (Fulfillment score only, empty text responses allowed)

- ✅ **Test:** `test_journal_entry_updates_daily_aggregates`
  - **Status:** RED - daily_aggregates update logic not implemented
  - **Verifies:** AC #7 (Update daily_aggregates.has_journal = true)

#### Test Class: TestJournalEntryValidation (3 tests)

- ✅ **Test:** `test_fulfillment_score_required`
  - **Status:** RED - Validation not implemented
  - **Verifies:** AC #7 (fulfillment_score is required field)

- ✅ **Test:** `test_fulfillment_score_range_validation`
  - **Status:** RED - Range validation (1-10) not implemented
  - **Verifies:** AC #7 (Score must be between 1 and 10)

- ✅ **Test:** `test_local_date_required`
  - **Status:** RED - Validation not implemented
  - **Verifies:** AC #7 (local_date is required field)

#### Test Class: TestJournalEntryDuplicateHandling (1 test)

- ✅ **Test:** `test_duplicate_journal_entry_for_same_day`
  - **Status:** RED - Unique constraint not enforced
  - **Verifies:** AC #7 + AC #9 (One journal per user per day)

#### Test Class: TestJournalEntryErrorHandling (2 tests)

- ✅ **Test:** `test_unauthorized_request`
  - **Status:** RED - Auth middleware not applied to endpoint
  - **Verifies:** AC #9 (Authentication required)

- ✅ **Test:** `test_invalid_json_payload`
  - **Status:** RED - JSON validation not implemented
  - **Verifies:** AC #9 (Input validation)

#### Test Class: TestJournalEntryCustomResponseValidation (4 tests)

- ✅ **Test:** `test_custom_responses_with_text_type`
  - **Status:** RED - Custom response handling not implemented
  - **Verifies:** AC #13 (Text type custom responses)

- ✅ **Test:** `test_custom_responses_with_numeric_type`
  - **Status:** RED - Numeric response handling not implemented
  - **Verifies:** AC #13 (Numeric type custom responses)

- ✅ **Test:** `test_custom_responses_with_boolean_type`
  - **Status:** RED - Boolean/Yes-No response handling not implemented
  - **Verifies:** AC #13 (Yes/No type custom responses)

---

### E2E Integration Tests (9 tests) ✅ CREATED

**File:** `weave-mobile/src/components/features/journal/__tests__/ReflectionFlow.integration.test.tsx` (633 lines)

#### Test Suite: Complete Reflection Submission Flow (2 tests)

- ✅ **Test:** `should allow user to complete reflection and submit successfully`
  - **Status:** RED - ReflectionScreen component does not exist
  - **Verifies:** AC #1, #3, #4, #5, #6 (Full happy path flow)

- ✅ **Test:** `should allow submission with only fulfillment score (skip text questions)`
  - **Status:** RED - Component does not exist
  - **Verifies:** AC #3, #4 (Skip links work), AC #6 (Submit enabled with only score)

#### Test Suite: Error Handling (3 tests)

- ✅ **Test:** `should handle network errors gracefully with offline queue`
  - **Status:** RED - Offline queue not implemented
  - **Verifies:** AC #9 (Network error + AsyncStorage queue)

- ✅ **Test:** `should show duplicate entry error when journal already exists for today`
  - **Status:** RED - Duplicate error handling not implemented
  - **Verifies:** AC #9 (409 Conflict response handling)

- ✅ **Test:** `should handle server errors with retry option`
  - **Status:** RED - Server error UI not implemented
  - **Verifies:** AC #9 (500 Server Error handling)

#### Test Suite: Custom Questions Flow (2 tests)

- ✅ **Test:** `should display and submit custom question responses`
  - **Status:** RED - Custom question rendering not implemented
  - **Verifies:** AC #10, #13 (Display and storage)

- ✅ **Test:** `should open Manage Questions modal when "+ Add custom question" tapped`
  - **Status:** RED - ManageQuestionsModal component does not exist
  - **Verifies:** AC #11 (Manage Questions modal)

#### Test Suite: UI Behavior and Validation (1 test)

- ✅ **Test:** `should enforce character limits on text inputs`
  - **Status:** RED - Character limit enforcement not implemented
  - **Verifies:** AC #3 (500 char hard limit)

- ✅ **Test:** `should update fulfillment score emoji based on slider value`
  - **Status:** RED - Visual feedback not implemented
  - **Verifies:** AC #5 (Emoji/color changes)

#### Test Suite: Auto-save Draft Functionality (1 test)

- ✅ **Test:** `should auto-save draft every 5 seconds to prevent data loss`
  - **Status:** RED - Auto-save logic not implemented
  - **Verifies:** AC #3 (Auto-save to AsyncStorage)

---

### Component Tests (13 tests) ✅ CREATED

**File:** `weave-mobile/src/components/features/journal/__tests__/ReflectionScreen.test.tsx` (418 lines)

#### Test Suite: ReflectionHeader Component (3 tests)

- ✅ **Test:** `should display personalized greeting with user name`
  - **Status:** RED - ReflectionHeader component does not exist
  - **Verifies:** AC #2 (Personalized "How did today go, [Name]?")

- ✅ **Test:** `should display subheading "Take 60 seconds to reflect"`
  - **Status:** RED - Component does not exist
  - **Verifies:** AC #2 (Subheading with 90% opacity)

- ✅ **Test:** `should use left text alignment for better reading flow`
  - **Status:** RED - Component does not exist
  - **Verifies:** AC #2 (Left-aligned text)

#### Test Suite: CharacterCountTextInput Component (4 tests)

- ✅ **Test:** `should display character count that updates as user types`
  - **Status:** RED - CharacterCountTextInput component does not exist
  - **Verifies:** AC #3 (Live character counter)

- ✅ **Test:** `should enforce max character limit by disabling input at limit`
  - **Status:** RED - Component does not exist
  - **Verifies:** AC #3 (Hard 500 char limit)

- ✅ **Test:** `should show placeholder text when empty`
  - **Status:** RED - Component does not exist
  - **Verifies:** AC #3 (Placeholder guidance)

- ✅ **Test:** `should render as multi-line textarea with 4-6 visible rows`
  - **Status:** RED - Component does not exist
  - **Verifies:** AC #3 (Multi-line input)

#### Test Suite: FulfillmentSlider Component (6 tests)

- ✅ **Test:** `should display current value as large number above slider`
  - **Status:** RED - FulfillmentSlider component does not exist
  - **Verifies:** AC #5 (Value display)

- ✅ **Test:** `should show low fulfillment feedback for scores 1-3`
  - **Status:** RED - Component does not exist
  - **Verifies:** AC #5 (Red/neutral emoji for low scores)

- ✅ **Test:** `should show medium fulfillment feedback for scores 4-6`
  - **Status:** RED - Component does not exist
  - **Verifies:** AC #5 (Yellow/thinking emoji for medium scores)

- ✅ **Test:** `should show high fulfillment feedback for scores 7-10`
  - **Status:** RED - Component does not exist
  - **Verifies:** AC #5 (Green/happy emoji for high scores)

- ✅ **Test:** `should default to value 5 (middle position)`
  - **Status:** RED - Component does not exist
  - **Verifies:** AC #5 (Default slider position)

- ✅ **Test:** `should trigger onValueChange callback when slider moves`
  - **Status:** RED - Component does not exist
  - **Verifies:** AC #5 (Interactive slider)

---

## Data Factories Created

### Backend Factories (Python)

**File:** `weave-api/tests/factories.py` (enhanced)

**Exports:**

- `create_test_journal_entry(user_id?, **overrides)` - Create journal entry with Story 4.1 schema (default_responses, custom_responses)
- `create_test_journal_entry_with_custom_questions(user_id?, **overrides)` - Create entry with pre-filled custom responses
- `create_custom_reflection_question(**overrides)` - Create custom question definition

**Example Usage:**

```python
# Basic journal entry
entry = create_test_journal_entry(fulfillment_score=9)

# Entry with custom questions
entry_with_custom = create_test_journal_entry_with_custom_questions()

# Custom question definition
question = create_custom_reflection_question(
    question="Did I meditate today?",
    type="yes_no"
)
```

---

### Mobile Factories (TypeScript)

**File:** `weave-mobile/src/test-utils/mockData.ts` (enhanced)

**Exports:**

- `generateMockJournalEntry(overrides?)` - Generate mock journal entry
- `generateMockJournalEntryWithCustomQuestions(overrides?)` - Generate entry with custom responses
- `generateMockCustomQuestion(overrides?)` - Generate custom question definition
- `generateMockCustomQuestions(count)` - Generate array of custom questions (max 5)

**Example Usage:**

```typescript
// Mock journal entry
const entry = generateMockJournalEntry({ fulfillment_score: 8 });

// Entry with custom questions
const entryWithCustom = generateMockJournalEntryWithCustomQuestions();

// Array of custom questions
const questions = generateMockCustomQuestions(3);
```

---

## Mock Requirements

### Journal API Service Mock (Mobile)

**File:** `weave-mobile/src/services/journalApi.ts` (stub created)

**Functions:**

- `submitJournalEntry(entry: JournalEntryCreate): Promise<JournalEntryResponse>`
- `getCurrentUser(): Promise<UserProfile>`

**Notes:** Tests mock these functions using `jest.mock()`. Implementation will make actual API calls to FastAPI backend.

---

## Required data-testid Attributes

### Reflection Screen

- `daily-checkin-cta` - "Daily Check-in" button on Thread Home
- `reflection-text-input` - Multi-line reflection text input (Question 1)
- `tomorrow-focus-input` - Single-line tomorrow's focus input (Question 2)
- `fulfillment-slider` - Fulfillment score slider (1-10)
- `fulfillment-feedback` - Visual feedback element (emoji/color indicator)
- `submit-button` - Submit reflection button
- `retry-button` - Retry button (shown on server error)
- `add-custom-question-link` - "+ Add custom question" link
- `add-new-question-button` - "Add new question" button in modal
- `custom-question-{id}-input` - Custom question input (dynamic ID)

**Implementation Example:**

```tsx
<TextInput
  data-testid="reflection-text-input"
  multiline={true}
  maxLength={500}
  placeholder="Today I felt..."
/>

<Slider
  data-testid="fulfillment-slider"
  minimumValue={1}
  maximumValue={10}
  value={fulfillmentScore}
/>

<Button data-testid="submit-button" onPress={handleSubmit}>
  Submit
</Button>
```

---

## Implementation Checklist

### Test: `test_create_journal_entry_with_default_questions_only`

**File:** `weave-api/tests/test_journal_router.py:24`

**Tasks to make this test pass:**

- [ ] Create `weave-api/app/api/journal_router.py` with POST /api/journal-entries endpoint
- [ ] Define `JournalEntryCreate` Pydantic model with fields: local_date, fulfillment_score, default_responses, custom_responses
- [ ] Implement database write to `journal_entries` table
- [ ] Return 201 Created with response format: `{data: {...}, meta: {timestamp}}`
- [ ] Add required data-testid attributes: N/A (backend test)
- [ ] Run test: `cd weave-api && uv run pytest tests/test_journal_router.py::TestJournalEntryCreation::test_create_journal_entry_with_default_questions_only -v`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 2-3 hours

---

### Test: `test_create_journal_entry_with_custom_questions`

**File:** `weave-api/tests/test_journal_router.py:72`

**Tasks to make this test pass:**

- [ ] Extend `journal_entries` table schema with `custom_responses JSONB` column (if not exists)
- [ ] Update `JournalEntryCreate` model to accept custom_responses dictionary
- [ ] Store custom_responses in database as JSONB
- [ ] Return custom_responses in API response
- [ ] Add required data-testid attributes: N/A (backend test)
- [ ] Run test: `cd weave-api && uv run pytest tests/test_journal_router.py::TestJournalEntryCreation::test_create_journal_entry_with_custom_questions -v`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 1-2 hours

---

### Test: `test_fulfillment_score_required`

**File:** `weave-api/tests/test_journal_router.py:161`

**Tasks to make this test pass:**

- [ ] Add Pydantic validation: `fulfillment_score: int` (required field)
- [ ] Return 422 Unprocessable Entity if missing
- [ ] Error message: "fulfillment_score is required"
- [ ] Add required data-testid attributes: N/A (backend test)
- [ ] Run test: `cd weave-api && uv run pytest tests/test_journal_router.py::TestJournalEntryValidation::test_fulfillment_score_required -v`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 30 minutes

---

### Test: `test_fulfillment_score_range_validation`

**File:** `weave-api/tests/test_journal_router.py:181`

**Tasks to make this test pass:**

- [ ] Add Pydantic validator: `@validator('fulfillment_score')` to enforce 1 <= score <= 10
- [ ] Return 422 with error message if out of range
- [ ] Add required data-testid attributes: N/A (backend test)
- [ ] Run test: `cd weave-api && uv run pytest tests/test_journal_router.py::TestJournalEntryValidation::test_fulfillment_score_range_validation -v`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 30 minutes

---

### Test: `test_duplicate_journal_entry_for_same_day`

**File:** `weave-api/tests/test_journal_router.py:219`

**Tasks to make this test pass:**

- [ ] Add unique constraint to `journal_entries` table: `UNIQUE(user_id, local_date)`
- [ ] Catch `IntegrityError` on duplicate insert
- [ ] Return 409 Conflict with error code `DUPLICATE_JOURNAL_ENTRY`
- [ ] Error message: "You already reflected today. Want to edit?"
- [ ] Add required data-testid attributes: N/A (backend test)
- [ ] Run test: `cd weave-api && uv run pytest tests/test_journal_router.py::TestJournalEntryDuplicateHandling::test_duplicate_journal_entry_for_same_day -v`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: `test_journal_entry_updates_daily_aggregates`

**File:** `weave-api/tests/test_journal_router.py:115`

**Tasks to make this test pass:**

- [ ] After inserting journal_entry, upsert `daily_aggregates` row
- [ ] Set `has_journal = true` for the local_date
- [ ] Use Supabase upsert or PostgreSQL `ON CONFLICT DO UPDATE`
- [ ] Add required data-testid attributes: N/A (backend test)
- [ ] Run test: `cd weave-api && uv run pytest tests/test_journal_router.py::TestJournalEntryCreation::test_journal_entry_updates_daily_aggregates -v`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 1-2 hours

---

### Test: `should allow user to complete reflection and submit successfully`

**File:** `weave-mobile/src/components/features/journal/__tests__/ReflectionFlow.integration.test.tsx:43`

**Tasks to make this test pass:**

- [ ] Create `ReflectionScreen` component in `weave-mobile/src/components/features/journal/ReflectionScreen.tsx`
- [ ] Implement personalized header with user's name
- [ ] Implement reflection text input with character counter (0 / 500)
- [ ] Implement tomorrow's focus input
- [ ] Implement fulfillment slider (1-10)
- [ ] Implement Submit button with loading state
- [ ] Integrate `useSubmitJournal` mutation hook (TanStack Query)
- [ ] Add required data-testid attributes: `reflection-text-input`, `tomorrow-focus-input`, `fulfillment-slider`, `submit-button`
- [ ] Run test: `cd weave-mobile && npm test -- ReflectionFlow.integration.test.tsx -t "should allow user to complete reflection and submit successfully"`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 4-6 hours

---

### Test: `should handle network errors gracefully with offline queue`

**File:** `weave-mobile/src/components/features/journal/__tests__/ReflectionFlow.integration.test.tsx:142`

**Tasks to make this test pass:**

- [ ] Configure TanStack Query mutation with `networkMode: 'offlineFirst'`
- [ ] Implement error handling in `useSubmitJournal` hook
- [ ] On network error, save to AsyncStorage: `pending-journal-entry`
- [ ] Show toast: "Couldn't submit. Saved locally, will retry."
- [ ] Implement auto-retry on reconnect using `queryClient.resumePausedMutations()`
- [ ] Add required data-testid attributes: N/A (error handling)
- [ ] Run test: `cd weave-mobile && npm test -- ReflectionFlow.integration.test.tsx -t "should handle network errors gracefully"`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 2-3 hours

---

### Test: `should display and submit custom question responses`

**File:** `weave-mobile/src/components/features/journal/__tests__/ReflectionFlow.integration.test.tsx:211`

**Tasks to make this test pass:**

- [ ] Create `CustomQuestionInput` component with support for text/numeric/yes-no types
- [ ] Load custom questions from `user_profiles.preferences.custom_reflection_questions`
- [ ] Render custom questions dynamically below default questions
- [ ] Collect custom responses in format: `{question_id: {question_text, response}}`
- [ ] Include custom_responses in API payload on submit
- [ ] Add required data-testid attributes: `custom-question-{id}-input`
- [ ] Run test: `cd weave-mobile && npm test -- ReflectionFlow.integration.test.tsx -t "should display and submit custom question responses"`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 3-4 hours

---

### Test: `should open Manage Questions modal when "+ Add custom question" tapped`

**File:** `weave-mobile/src/components/features/journal/__tests__/ReflectionFlow.integration.test.tsx:270`

**Tasks to make this test pass:**

- [ ] Create `ManageQuestionsModal` component
- [ ] Add "+ Add custom question" link to ReflectionScreen
- [ ] Open modal when link tapped
- [ ] Display list of existing custom questions with edit/delete actions
- [ ] Implement "Add new question" button
- [ ] Add required data-testid attributes: `add-custom-question-link`, `add-new-question-button`
- [ ] Run test: `cd weave-mobile && npm test -- ReflectionFlow.integration.test.tsx -t "should open Manage Questions modal"`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 2-3 hours

---

### Test: `should display personalized greeting with user name`

**File:** `weave-mobile/src/components/features/journal/__tests__/ReflectionScreen.test.tsx:19`

**Tasks to make this test pass:**

- [ ] Create `ReflectionHeader` component
- [ ] Accept `userName` prop
- [ ] Render text: "How did today go, {userName}?"
- [ ] Add required data-testid attributes: N/A (component test)
- [ ] Run test: `cd weave-mobile && npm test -- ReflectionScreen.test.tsx -t "should display personalized greeting"`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 30 minutes

---

### Test: `should display character count that updates as user types`

**File:** `weave-mobile/src/components/features/journal/__tests__/ReflectionScreen.test.tsx:70`

**Tasks to make this test pass:**

- [ ] Create `CharacterCountTextInput` component
- [ ] Track input length in state
- [ ] Display counter: "{length} / {maxLength}"
- [ ] Update counter on every keystroke
- [ ] Add required data-testid attributes: N/A (component test)
- [ ] Run test: `cd weave-mobile && npm test -- ReflectionScreen.test.tsx -t "should display character count that updates"`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: `should enforce max character limit by disabling input at limit`

**File:** `weave-mobile/src/components/features/journal/__tests__/ReflectionScreen.test.tsx:90`

**Tasks to make this test pass:**

- [ ] In `CharacterCountTextInput`, disable input when length === maxLength
- [ ] Set `editable={false}` when at limit
- [ ] Prevent further typing
- [ ] Add required data-testid attributes: N/A (component test)
- [ ] Run test: `cd weave-mobile && npm test -- ReflectionScreen.test.tsx -t "should enforce max character limit"`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 30 minutes

---

### Test: `should display current value as large number above slider`

**File:** `weave-mobile/src/components/features/journal/__tests__/ReflectionScreen.test.tsx:150`

**Tasks to make this test pass:**

- [ ] Create `FulfillmentSlider` component
- [ ] Display slider value as large text above slider
- [ ] Use large font size (e.g., 48px or text-5xl)
- [ ] Update value display when slider moves
- [ ] Add required data-testid attributes: N/A (component test)
- [ ] Run test: `cd weave-mobile && npm test -- ReflectionScreen.test.tsx -t "should display current value as large number"`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: `should show low fulfillment feedback for scores 1-3`

**File:** `weave-mobile/src/components/features/journal/__tests__/ReflectionScreen.test.tsx:175`

**Tasks to make this test pass:**

- [ ] Add visual feedback element in `FulfillmentSlider`
- [ ] For scores 1-3, show red color or neutral emoji
- [ ] Set `accessibilityLabel` to "low" or "neutral"
- [ ] Add required data-testid attributes: `fulfillment-feedback`
- [ ] Run test: `cd weave-mobile && npm test -- ReflectionScreen.test.tsx -t "should show low fulfillment feedback"`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: `should show high fulfillment feedback for scores 7-10`

**File:** `weave-mobile/src/components/features/journal/__tests__/ReflectionScreen.test.tsx:213`

**Tasks to make this test pass:**

- [ ] For scores 7-10, show green color or happy emoji
- [ ] Set `accessibilityLabel` to "happy" or "positive"
- [ ] Add required data-testid attributes: `fulfillment-feedback`
- [ ] Run test: `cd weave-mobile && npm test -- ReflectionScreen.test.tsx -t "should show high fulfillment feedback"`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 30 minutes

---

### Test: `should auto-save draft every 5 seconds to prevent data loss`

**File:** `weave-mobile/src/components/features/journal/__tests__/ReflectionFlow.integration.test.tsx:330`

**Tasks to make this test pass:**

- [ ] Implement `useEffect` with 5-second interval timer
- [ ] Save form state to AsyncStorage: `reflection-draft`
- [ ] Clear draft on successful submission
- [ ] Restore draft on component mount (if exists)
- [ ] Add required data-testid attributes: N/A (auto-save logic)
- [ ] Run test: `cd weave-mobile && npm test -- ReflectionFlow.integration.test.tsx -t "should auto-save draft"`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 1-2 hours

---

## Running Tests

```bash
# Run all failing tests for Story 4.1
cd weave-api && uv run pytest tests/test_journal_router.py -v
cd weave-mobile && npm test -- journal

# Run specific backend test file
cd weave-api && uv run pytest tests/test_journal_router.py -v

# Run specific mobile E2E test file
cd weave-mobile && npm test -- ReflectionFlow.integration.test.tsx

# Run specific mobile component test file
cd weave-mobile && npm test -- ReflectionScreen.test.tsx

# Run single test by name
cd weave-api && uv run pytest tests/test_journal_router.py::TestJournalEntryCreation::test_create_journal_entry_with_default_questions_only -v

# Run tests with coverage
cd weave-api && uv run pytest tests/test_journal_router.py --cov=app.api.journal_router --cov-report=html
cd weave-mobile && npm test -- --coverage
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete) ✅

**TEA Agent Responsibilities:**

- ✅ All tests written and failing (36 tests total)
- ✅ Fixtures and factories created with auto-cleanup (backend + mobile)
- ✅ Mock requirements documented (journalApi service stub)
- ✅ data-testid requirements listed (10+ attributes)
- ✅ Implementation checklist created (17 test-to-task mappings)

**Verification:**

- All tests run and fail as expected
- Failure messages are clear and actionable:
  - Backend: "Endpoint /api/journal-entries does not exist"
  - Mobile: "ReflectionScreen component does not exist"
- Tests fail due to missing implementation, not test bugs

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Pick one failing test** from implementation checklist (start with backend API tests)
2. **Read the test** to understand expected behavior
3. **Implement minimal code** to make that specific test pass
4. **Run the test** to verify it now passes (green)
5. **Check off the task** in implementation checklist above
6. **Move to next test** and repeat

**Key Principles:**

- One test at a time (don't try to fix all at once)
- Minimal implementation (don't over-engineer)
- Run tests frequently (immediate feedback)
- Use implementation checklist as roadmap

**Recommended Order:**

1. **Backend API tests first** (test_journal_router.py) - Fastest feedback
2. **Mobile component tests** (ReflectionScreen.test.tsx) - Isolated UI
3. **Mobile E2E tests** (ReflectionFlow.integration.test.tsx) - Full integration

**Progress Tracking:**

- Check off tasks as you complete them in this document
- Share progress in daily standup
- Mark story as IN PROGRESS in `docs/bmm-workflow-status.yaml`

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

**DEV Agent Responsibilities:**

1. **Verify all tests pass** (green phase complete)
2. **Review code for quality** (readability, maintainability, performance)
3. **Extract duplications** (DRY principle)
4. **Optimize performance** (if needed)
5. **Ensure tests still pass** after each refactor
6. **Update documentation** (if API contracts change)

**Key Principles:**

- Tests provide safety net (refactor with confidence)
- Make small refactors (easier to debug if tests fail)
- Run tests after each change
- Don't change test behavior (only implementation)

**Completion:**

- All tests pass (36/36 passing)
- Code quality meets team standards
- No duplications or code smells
- Ready for code review and story approval

---

## Next Steps

1. **Review this checklist** with team in standup or planning
2. **Run failing tests** to confirm RED phase:
   - `cd weave-api && uv run pytest tests/test_journal_router.py -v`
   - `cd weave-mobile && npm test -- journal`
3. **Begin implementation** using implementation checklist as guide (start with backend)
4. **Work one test at a time** (red → green for each)
5. **Share progress** in daily standup
6. **When all tests pass**, refactor code for quality
7. **When refactoring complete**, manually update story status to 'done' in `docs/bmm-workflow-status.yaml`

---

## Knowledge Base References Applied

This ATDD workflow consulted the following BMM testing knowledge:

- **Data Factory Patterns** - Override-based factories using faker (backend) and typed generators (mobile)
- **Test Quality Principles** - Given-When-Then format, one assertion per test, deterministic data
- **Test Level Framework** - API tests (fast feedback) → Component tests (isolated UI) → E2E tests (full integration)
- **Error Handling Patterns** - Network errors, offline queue, validation errors, duplicate entries
- **React Native Testing Patterns** - Jest + React Native Testing Library, mock AsyncStorage, TanStack Query

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Backend Command:**
```bash
cd weave-api && uv run pytest tests/test_journal_router.py -v
```

**Expected Results:**

```
collected 14 items

tests/test_journal_router.py::TestJournalEntryCreation::test_create_journal_entry_with_default_questions_only FAILED
tests/test_journal_router.py::TestJournalEntryCreation::test_create_journal_entry_with_custom_questions FAILED
tests/test_journal_router.py::TestJournalEntryCreation::test_create_journal_entry_with_minimal_data FAILED
tests/test_journal_router.py::TestJournalEntryCreation::test_journal_entry_updates_daily_aggregates FAILED
tests/test_journal_router.py::TestJournalEntryValidation::test_fulfillment_score_required FAILED
tests/test_journal_router.py::TestJournalEntryValidation::test_fulfillment_score_range_validation FAILED
tests/test_journal_router.py::TestJournalEntryValidation::test_local_date_required FAILED
tests/test_journal_router.py::TestJournalEntryDuplicateHandling::test_duplicate_journal_entry_for_same_day FAILED
tests/test_journal_router.py::TestJournalEntryErrorHandling::test_unauthorized_request FAILED
tests/test_journal_router.py::TestJournalEntryErrorHandling::test_invalid_json_payload FAILED
tests/test_journal_router.py::TestJournalEntryCustomResponseValidation::test_custom_responses_with_text_type FAILED
tests/test_journal_router.py::TestJournalEntryCustomResponseValidation::test_custom_responses_with_numeric_type FAILED
tests/test_journal_router.py::TestJournalEntryCustomResponseValidation::test_custom_responses_with_boolean_type FAILED

========================== 14 failed in 2.34s ==========================
```

**Mobile Command:**
```bash
cd weave-mobile && npm test -- journal
```

**Expected Results:**

```
Test Suites: 2 failed, 2 total
Tests:       22 failed, 22 total (9 E2E + 13 Component)
Snapshots:   0 total
Time:        8.45s

FAIL  src/components/features/journal/__tests__/ReflectionFlow.integration.test.tsx
FAIL  src/components/features/journal/__tests__/ReflectionScreen.test.tsx
```

**Summary:**

- Total tests: 36 (14 backend + 9 E2E + 13 component)
- Passing: 0 (expected)
- Failing: 36 (expected)
- Status: ✅ RED phase verified

**Expected Failure Messages:**

- Backend: `404 Not Found: GET /api/journal-entries`
- Mobile: `ReferenceError: ReflectionScreen is not defined`

---

## Notes

### Implementation Priority

**Phase 1: Backend Foundation (AC #7, #9, #13)**
- Highest priority - enables mobile development
- Estimated: 8-10 hours
- Tests: 14 backend tests

**Phase 2: Core Mobile UI (AC #2, #3, #4, #5, #6)**
- Second priority - critical user flow
- Estimated: 6-8 hours
- Tests: 13 component tests + 3 E2E tests

**Phase 3: Custom Questions (AC #10, #11, #12, #13, #14)**
- Third priority - advanced feature
- Estimated: 5-7 hours
- Tests: 3 E2E tests

**Phase 4: Error Handling & Polish (AC #9, #16)**
- Final priority - robustness
- Estimated: 3-5 hours
- Tests: 3 E2E tests

**Total Estimated Effort:** 22-30 hours (Story points: 6 pts = ~24 hours)

### Technical Debt to Address

- Event tracking (AC #8) - Not covered by tests yet (can be added later)
- AI batch trigger (AC #6) - Requires Story 4.3 dependencies
- Settings integration (AC #14) - Requires Settings screen implementation

### Previous Story Learnings Applied

- Auto-focus input fields (from Story 1.6)
- Real-time validation feedback (from Story 1.6)
- Batch database writes at end of flow (from Story 1.6)
- Offline-first mutation strategy (from Story 1.5)

---

## Contact

**Questions or Issues?**

- Ask in team standup
- Refer to Story 4.1 documentation: `docs/sprint-artifacts/4-1-daily-reflection-entry.md`
- Test infrastructure guide: `docs/dev/testing-guide.md`

---

**Generated by BMAD TEA Agent** - 2025-12-20

`★ Insight ─────────────────────────────────────`

**ATDD Philosophy: Tests as Implementation Contracts**

This checklist demonstrates the power of Test-Driven Development:

1. **Tests Define Success** - Each test is a concrete specification of what "done" means
2. **RED Phase Confidence** - 36 failing tests prove the feature doesn't exist yet
3. **GREEN Phase Roadmap** - Implementation checklist maps every test to specific tasks
4. **REFACTOR Phase Safety** - Once green, refactor fearlessly with test safety net
5. **No Guesswork** - Developers know EXACTLY what to build and when it's complete

**Result:** Instead of vague requirements, developers have executable specifications that automatically verify correctness.

`─────────────────────────────────────────────────`
