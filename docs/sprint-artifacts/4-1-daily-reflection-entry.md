# Story 4.1: Daily Reflection Entry

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want to **reflect on my day with default and customizable questions, then submit for AI feedback**,
So that **I process what happened, track what matters to me, and receive personalized insights for tomorrow**.

## Acceptance Criteria

### Part 4.1a: Default Reflection Questions (3 pts)

**Access & Navigation (AC #1)**
- [ ] Access via Thread Home → "Daily Check-in" CTA button
- [ ] CTA button prominently displayed on Thread (home screen)
- [ ] Deep link support: Navigate directly from evening notification to reflection screen
- [ ] Navigate to Reflection screen when CTA pressed
- [ ] Smooth transition animation (<300ms)

**Screen Header (AC #2)**
- [ ] Display personalized header: "How did today go, [Name]?" (inject `user_profiles.preferred_name`)
- [ ] Display subheading: "Take 60 seconds to reflect"
- [ ] Typography: Header semi-bold (text-lg or text-xl), subheading regular at 90% opacity (text-sm)
- [ ] Text alignment: Left (not center, better for reading flow)

**Default Question 1: Reflection Text (AC #3)**
- [ ] Display question label: "How do you feel about today? What worked well and what didn't?"
- [ ] Multi-line text input (textarea component, 4-6 rows visible)
- [ ] Placeholder text: "Today I felt... The highlight was... I struggled with..."
- [ ] Character count display: "0 / 500" (live update as user types)
- [ ] Min 50 characters encouraged (soft validation, not required)
- [ ] Max 500 characters enforced (hard limit, input disabled at 500)
- [ ] "Skip" link allowed (not encouraged, but permitted for low-friction)
- [ ] Auto-save draft to local state every 5 seconds (prevent data loss)

**Default Question 2: Tomorrow's Focus (AC #4)**
- [ ] Display question label: "What is the one thing you want to accomplish tomorrow?"
- [ ] Single-line text input (80-100 characters)
- [ ] Placeholder text: "Tomorrow I will..."
- [ ] Character count: "0 / 100"
- [ ] Min 10 characters encouraged
- [ ] Max 100 characters enforced
- [ ] "Skip" allowed but not encouraged

**Fulfillment Score Slider (AC #5)**
- [ ] Display label: "Overall, how fulfilled do you feel about today?"
- [ ] Slider component: Range 1-10
- [ ] Visual feedback: Emoji or color gradient changes as slider moves
  - 1-3: Low fulfillment (red/neutral emoji)
  - 4-6: Medium fulfillment (yellow/thinking emoji)
  - 7-10: High fulfillment (green/happy emoji)
- [ ] Default position: 5 (middle)
- [ ] Current value display: Large number above slider (e.g., "7")
- [ ] Required field (cannot be skipped)

**Submit & Loading (AC #6)**
- [ ] "Submit" button at bottom (full-width, fixed position)
- [ ] Button enabled when fulfillment score is set (text inputs can be empty)
- [ ] Button disabled during submission (loading state)
- [ ] Loading indicator + text: "Submitting your reflection..."
- [ ] On success: Navigate to AI Feedback Generation screen (Story 4.3)
- [ ] Trigger AI batch job for feedback generation + next-day Triad

**Data Storage (AC #7)**
- [ ] Write to `journal_entries` table on submit:
  - `user_id` (from session/auth)
  - `local_date` (today's date in YYYY-MM-DD format, user's timezone)
  - `fulfillment_score` (1-10 integer)
  - `default_responses` (JSONB object):
    ```json
    {
      "today_reflection": "...",  // Question 1 response
      "tomorrow_focus": "..."     // Question 2 response
    }
    ```
  - `created_at` (timestamp)
- [ ] Update `daily_aggregates.has_journal` = true for today
- [ ] Only ONE journal entry per day per user (enforce with unique constraint on `user_id + local_date`)
- [ ] If journal already exists for today, show "Edit today's reflection" instead of "Submit"

**Event Tracking (AC #8)**
- [ ] Track `journal.started` when screen loads
- [ ] Track `journal.submitted` when submission succeeds
- [ ] Track `journal.skipped_question` if user skips default questions
- [ ] Include metadata: `{date, fulfillment_score, questions_answered: [1, 2]}`

**Error Handling (AC #9)**
- [ ] Network error: Show toast "Couldn't submit. Saved locally, will retry."
- [ ] Store failed submission in AsyncStorage for retry on reconnect
- [ ] Offline mode: Allow submission (queue for sync when online)
- [ ] Server error (500): Show "Something went wrong. Try again?" with retry button
- [ ] Duplicate entry error: Show "You already reflected today. Want to edit?"

---

### Part 4.1b: Custom Questions (3 pts)

**Custom Questions Display (AC #10)**
- [ ] Display user-defined custom questions BELOW default questions
- [ ] Each custom question appears as a separate input field
- [ ] Question types supported:
  - **Text** (single line, 100 char max)
  - **Numeric** (slider 1-10)
  - **Yes/No** (toggle switch or radio buttons)
- [ ] Custom questions rendered dynamically from `user_profiles.preferences.custom_reflection_questions`

**Manage Custom Questions (AC #11)**
- [ ] Display "+ Add custom question" link at bottom of question list
- [ ] Tap to open "Manage Questions" modal/screen
- [ ] Modal displays:
  - List of existing custom questions (with edit/delete actions)
  - "Add new question" button
- [ ] Add question form:
  - Question text input (required, 10-100 chars)
  - Question type selector (Text / Numeric / Yes/No)
  - "Save" and "Cancel" buttons
- [ ] Edit question: Load existing question data, allow modification, save
- [ ] Delete question: Confirmation dialog ("Delete this tracking question?"), then remove from list
- [ ] Max 5 custom questions allowed (show toast if limit reached)

**Custom Question Examples (AC #12)**
- [ ] Provide example prompts when adding first custom question:
  - "Did I stick to my diet?"
  - "How many pages did I read?"
  - "Rate my energy level (1-10)"
  - "Did I exercise today?"
- [ ] User can select example or write their own

**Custom Responses Storage (AC #13)**
- [ ] Store custom question responses in `journal_entries.custom_responses` (JSONB):
  ```json
  {
    "question_id_1": {
      "question_text": "Did I stick to my diet?",
      "response": "Yes"
    },
    "question_id_2": {
      "question_text": "Rate my energy level",
      "response": 7
    }
  }
  ```
- [ ] Custom question definitions stored in `user_profiles.preferences.custom_reflection_questions`:
  ```json
  [
    {
      "id": "uuid-1",
      "question": "Did I stick to my diet?",
      "type": "yes_no",
      "created_at": "2025-12-20T10:00:00Z"
    },
    {
      "id": "uuid-2",
      "question": "Rate my energy level",
      "type": "numeric",
      "created_at": "2025-12-20T10:05:00Z"
    }
  ]
  ```

**Settings Integration (AC #14)**
- [ ] Custom questions also manageable from Settings → Reflection Preferences
- [ ] Changes to custom questions reflected immediately in reflection screen
- [ ] Deleting a custom question does NOT delete past responses (historical data preserved)

**AI Context Integration (AC #15)**
- [ ] Custom question responses passed to AI for pattern detection
- [ ] AI can reference custom tracking in feedback: "You've maintained your diet for 5 days straight!"
- [ ] Custom responses available in Tech Context Engine for personalized insights

**Minimal Scrolling Requirement (AC #16)**
- [ ] One screen, minimal scrolling even with 5 custom questions
- [ ] Default questions always visible at top
- [ ] Custom questions section collapsible (expand/collapse toggle)
- [ ] Fulfillment slider and Submit button always visible at bottom (sticky)

---

## Tasks / Subtasks

### Task 1: Reflection Screen UI (AC: #1-#6, #16)
- [ ] **Subtask 1.1**: Create ReflectionScreen component
  - File: `app/(tabs)/journal/reflection.tsx` or `app/(tabs)/thread/reflection.tsx`
  - Decide if reflection is separate tab or part of Thread tab navigation
- [ ] **Subtask 1.2**: Implement screen header with personalized greeting
  - Inject user's `preferred_name` from TanStack Query `useQuery(['user-profile'])`
- [ ] **Subtask 1.3**: Implement Default Question 1 (multi-line text input)
  - Use `TextInput` with `multiline={true}`, `numberOfLines={5}`
  - Character counter component (reusable)
- [ ] **Subtask 1.4**: Implement Default Question 2 (single-line text input)
  - Standard `TextInput` with `maxLength={100}`
- [ ] **Subtask 1.5**: Implement Fulfillment Score Slider
  - Use `@react-native-community/slider` or custom slider component
  - Emoji/color feedback based on value
- [ ] **Subtask 1.6**: Implement Submit button with loading state
  - Disable during submission
  - Show loading spinner + text
- [ ] **Subtask 1.7**: Implement auto-save draft logic
  - Save to AsyncStorage every 5 seconds
  - Restore draft on screen re-entry

### Task 2: Data Submission & API Integration (AC: #7-#9)
- [ ] **Subtask 2.1**: Create API endpoint `POST /api/journal-entries`
  - FastAPI route in `weave-api/app/api/journal_router.py`
  - Accepts: `{local_date, fulfillment_score, default_responses, custom_responses}`
  - Returns: `{data: {journal_id, created_at}, meta: {timestamp}}`
- [ ] **Subtask 2.2**: Implement Zod validation schema for request body
  - `fulfillment_score`: integer 1-10 (required)
  - `default_responses`: object with optional text fields
  - `custom_responses`: object with dynamic keys
- [ ] **Subtask 2.3**: Write to `journal_entries` table
  - Insert new row with user_id + local_date
  - Handle unique constraint violation (return 409 if duplicate)
- [ ] **Subtask 2.4**: Update `daily_aggregates.has_journal = true`
  - Upsert daily_aggregates row for today
- [ ] **Subtask 2.5**: Trigger AI batch job asynchronously
  - Call AI feedback generation service (Story 4.3)
  - Return 202 Accepted immediately (don't block on AI)
- [ ] **Subtask 2.6**: Implement error handling
  - Network errors: Offline queue with AsyncStorage
  - Server errors: User-friendly error messages
  - Duplicate entry: Prompt to edit existing entry

### Task 3: TanStack Query Integration (AC: #7-#9)
- [ ] **Subtask 3.1**: Create `useSubmitJournal` mutation hook
  - File: `weave-mobile/src/hooks/useJournal.ts`
  - Mutation function calls `POST /api/journal-entries`
- [ ] **Subtask 3.2**: Implement optimistic update
  - Update `daily_aggregates` query cache immediately
  - Show success feedback before server confirms
- [ ] **Subtask 3.3**: Implement error rollback
  - Revert optimistic update on mutation error
  - Show error toast with retry option
- [ ] **Subtask 3.4**: Implement offline queueing
  - Use TanStack Query `networkMode: 'offlineFirst'`
  - Persist mutation to AsyncStorage if offline
  - Auto-retry when connection restored
- [ ] **Subtask 3.5**: Invalidate related queries on success
  - Invalidate `['journal-entries']` query
  - Invalidate `['daily-aggregates', today]` query
  - Trigger refetch of dashboard data

### Task 4: Custom Questions Feature (AC: #10-#15)
- [ ] **Subtask 4.1**: Create "Manage Questions" modal component
  - File: `weave-mobile/src/components/features/journal/ManageQuestionsModal.tsx`
  - List existing questions with edit/delete actions
- [ ] **Subtask 4.2**: Implement Add Question form
  - Question text input
  - Type selector (Text / Numeric / Yes/No)
  - Save button writes to `user_profiles.preferences`
- [ ] **Subtask 4.3**: Implement Edit Question flow
  - Load existing question data
  - Allow modification
  - Save updates to preferences
- [ ] **Subtask 4.4**: Implement Delete Question flow
  - Confirmation dialog
  - Remove from preferences (preserve historical responses)
- [ ] **Subtask 4.5**: Render custom questions dynamically
  - Load from `user_profiles.preferences.custom_reflection_questions`
  - Render appropriate input component based on type
- [ ] **Subtask 4.6**: Store custom responses in journal entry
  - Structure: `{question_id: {question_text, response}}`
  - Include in `custom_responses` JSONB field

### Task 5: Settings Integration (AC: #14)
- [ ] **Subtask 5.1**: Add "Reflection Preferences" section to Settings screen
  - File: `app/(tabs)/settings/index.tsx`
  - Link to "Manage Custom Questions"
- [ ] **Subtask 5.2**: Sync custom questions between Reflection and Settings
  - Use TanStack Query for `user_profiles.preferences`
  - Changes reflect immediately across screens
- [ ] **Subtask 5.3**: Implement preferences update API
  - Endpoint: `PATCH /api/user-profiles/preferences`
  - Update `custom_reflection_questions` array

### Task 6: AI Context Integration (AC: #15)
- [ ] **Subtask 6.1**: Pass custom responses to AI feedback generator
  - Include in AI prompt context
  - Format: "User is tracking: [diet adherence, energy level]"
- [ ] **Subtask 6.2**: Enable AI pattern detection on custom questions
  - AI can identify trends: "You've rated your energy 8+ for 5 days"
  - Include in feedback insights
- [ ] **Subtask 6.3**: Add custom tracking to Tech Context Engine
  - Include custom question history in user context
  - Available for AI chat, weekly insights, etc.

### Task 7: Testing (All ACs)
- [ ] **Subtask 7.1**: Unit tests for validation logic
  - Test character limits, required fields
  - Test custom question type validation
- [ ] **Subtask 7.2**: Integration tests for API endpoint
  - Test successful submission
  - Test duplicate entry handling
  - Test custom questions storage
- [ ] **Subtask 7.3**: E2E test for reflection flow
  - Test complete reflection submission
  - Test offline queueing and sync
  - Test custom question CRUD operations
- [ ] **Subtask 7.4**: Test AI batch trigger
  - Verify AI feedback generation triggered on submit
  - Verify Triad generation for next day

---

## Dev Notes

### Mobile Architecture Patterns

**State Management:**
- TanStack Query for server state (`journal_entries`, `user_profiles`)
- useState for component-local state (form inputs, slider value)
- AsyncStorage for draft auto-save and offline queue

**API Integration:**
- Endpoint: `POST /api/journal-entries`
- Response format: `{data: {...}, meta: {timestamp}}`
- Error format: `{error: {code, message}}`

**Offline Support:**
- TanStack Query `networkMode: 'offlineFirst'`
- Mutations queue automatically when offline
- Persist to AsyncStorage using `@tanstack/query-async-storage-persister`
- Auto-sync on reconnect using `queryClient.resumePausedMutations()`

**Navigation:**
- Deep link from notification: `weave://journal/reflection`
- Navigate from Thread CTA: `router.push('/journal/reflection')`

### Backend Architecture Patterns

**FastAPI Endpoint Structure:**
```python
# weave-api/app/api/journal_router.py

@router.post("/journal-entries")
async def create_journal_entry(
    entry: JournalEntryCreate,
    user_id: str = Depends(get_current_user_id)
):
    # 1. Validate request (Zod/Pydantic)
    # 2. Check duplicate (user_id + local_date unique constraint)
    # 3. Write to journal_entries table
    # 4. Update daily_aggregates.has_journal = true
    # 5. Trigger AI batch job (async, non-blocking)
    # 6. Return 201 Created with journal_id
```

**Database Schema:**
```sql
-- journal_entries table
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  local_date DATE NOT NULL,
  fulfillment_score INTEGER CHECK (fulfillment_score >= 1 AND fulfillment_score <= 10) NOT NULL,
  default_responses JSONB,
  custom_responses JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, local_date)
);

-- Index for user queries
CREATE INDEX idx_journal_entries_user_date ON journal_entries(user_id, local_date DESC);
```

**AI Batch Job Trigger:**
- Call AI service: `POST /api/ai/generate-recap`
- Non-blocking (return 202 Accepted immediately)
- Push notification when AI feedback ready
- Fallback to template response if AI fails

### Testing Strategy

**Unit Tests (Mobile):**
- `ReflectionScreen.test.tsx`: Component rendering, form validation
- `useSubmitJournal.test.ts`: Mutation hook, optimistic updates

**Integration Tests (Backend):**
- `test_journal_router.py`: API endpoint, validation, database writes
- `test_ai_batch_trigger.py`: AI service invocation

**E2E Tests:**
- `journal-submission.test.ts`: Full flow from screen load to AI feedback

**Coverage Target:** >80% for journal feature (Story 4.1)

### Project Structure Notes

**Mobile Files:**
```
weave-mobile/
├── app/
│   ├── (tabs)/
│   │   ├── thread/
│   │   │   └── reflection.tsx         # Reflection screen (option 1: part of Thread tab)
│   │   └── journal/
│   │       ├── index.tsx               # Journal history (Story 4.5)
│   │       └── reflection.tsx          # Reflection screen (option 2: separate Journal tab)
├── src/
│   ├── components/
│   │   └── features/
│   │       └── journal/
│   │           ├── ReflectionScreen.tsx
│   │           ├── CustomQuestionInput.tsx
│   │           └── ManageQuestionsModal.tsx
│   ├── hooks/
│   │   └── useJournal.ts               # TanStack Query hooks
│   └── services/
│       └── journalApi.ts               # API client functions
```

**Backend Files:**
```
weave-api/
├── app/
│   ├── api/
│   │   └── journal_router.py           # Journal endpoints
│   ├── models/
│   │   └── journal.py                  # Pydantic models
│   ├── services/
│   │   └── ai_feedback_service.py      # AI batch job (Story 4.3)
│   └── tests/
│       └── test_journal_router.py      # Integration tests
```

### References

- [PRD: Epic 4 - Reflection & Journaling](docs/prd/epic-4-reflection-journaling.md)
- [Epics: Story 4.1a + 4.1b](docs/epics.md#epic-4-reflection--journaling-28-pts)
- [Architecture: State Management](docs/architecture/core-architectural-decisions.md#state-management-architecture)
- [Architecture: Offline Support](docs/architecture/core-architectural-decisions.md#offline-strategy)
- [Patterns: API Response Format](docs/architecture/implementation-patterns-consistency-rules.md#api-response-format)
- [Patterns: Naming Conventions](docs/architecture/implementation-patterns-consistency-rules.md#naming-patterns)
- [Story Example: 1.6 Name Entry](docs/stories/1-6-name-entry-weave-personality-identity-traits.md)

### Key Architectural Decisions

1. **Split Story Structure:** 4.1a (default questions, 3 pts) + 4.1b (custom questions, 3 pts) = 6 pts total
   - Allows incremental implementation: Default questions first, then add custom questions
   - Custom questions can be marked as "Should Have" if time-constrained

2. **AI Batch Trigger:** Reflection submission is the PRIMARY trigger for AI operations
   - Generates AI feedback (Story 4.3)
   - Generates next-day Triad (Story 3.2)
   - Must be async/non-blocking (202 Accepted response)

3. **Offline-First:** Users must be able to reflect offline (subway, elevator)
   - Use TanStack Query offline queue
   - Auto-sync on reconnect
   - Show clear offline indicator

4. **One Journal Per Day:** Unique constraint on `(user_id, local_date)`
   - If duplicate, offer "Edit today's reflection"
   - Prevents data inconsistency

5. **Custom Questions in JSONB:** Flexible schema for user-defined tracking
   - No rigid database columns (allows any number of custom questions)
   - AI can parse JSONB to detect patterns
   - Historical responses preserved even if question deleted

### Previous Story Learnings

From **Story 1.6 (Name Entry + Personality)**:
- ✅ Multi-step flows work well in single screen file (smooth transitions)
- ✅ Swipeable content (Weave Personality cards) performs smoothly with react-native-gesture-handler
- ✅ Batch write to database at end of flow (don't write after each step)
- ⚠️ Auto-focus input fields improves UX (apply to reflection text inputs)
- ⚠️ Validation feedback must be real-time (character counters, error states)

From **Story 1.5 (Authentication)**:
- ✅ Supabase Auth integration works smoothly
- ✅ JWT handling and session management patterns established
- ⚠️ Ensure refresh token logic handles expired sessions during reflection submission

From **Recent Commits** (devop: package dependencies, dev components):
- ✅ Dev environment setup stable (multi-port configs, dependencies fixed)
- ⚠️ Ensure any new dependencies (slider library) are compatible with current setup

---

## Dev Agent Record

### Context Reference

<!-- This story was generated by the BMAD create-story workflow with ultimate context engine analysis -->

### Agent Model Used

Claude Sonnet 4.5 (global.anthropic.claude-sonnet-4-5-20250929-v1:0)

### Debug Log References

- Workflow: `.bmad/bmm/workflows/4-implementation/create-story/workflow.yaml`
- Instructions: `.bmad/bmm/workflows/4-implementation/create-story/instructions.xml`

### Completion Notes List

- Epic 4 PRD analyzed: US-4.1a + US-4.1b combined into single story file
- Architecture patterns extracted: TanStack Query, offline support, API response format
- Previous story learnings incorporated: Multi-step flows, validation patterns
- Custom questions feature fully specified with CRUD operations and AI integration
- Testing strategy defined: Unit, integration, E2E tests with >80% coverage target
- **Status:** ready-for-dev (comprehensive context provided)

### File List

**To be created:**
- `weave-mobile/app/(tabs)/thread/reflection.tsx` OR `app/(tabs)/journal/reflection.tsx`
- `weave-mobile/src/components/features/journal/ReflectionScreen.tsx`
- `weave-mobile/src/components/features/journal/CustomQuestionInput.tsx`
- `weave-mobile/src/components/features/journal/ManageQuestionsModal.tsx`
- `weave-mobile/src/hooks/useJournal.ts`
- `weave-mobile/src/services/journalApi.ts`
- `weave-api/app/api/journal_router.py`
- `weave-api/app/models/journal.py`
- `weave-api/app/services/ai_feedback_service.py` (Story 4.3 dependency)
- `weave-api/app/tests/test_journal_router.py`
- `weave-mobile/src/components/features/journal/__tests__/ReflectionScreen.test.tsx`

**To be modified:**
- `weave-mobile/app/(tabs)/thread/index.tsx` (add "Daily Check-in" CTA button)
- `weave-mobile/app/(tabs)/settings/index.tsx` (add Reflection Preferences section)
- `weave-api/app/main.py` (register journal_router)

---

`★ Insight ─────────────────────────────────────`

**Comprehensive Context = Developer Success**

This story demonstrates the "Ultimate Context Engine" approach:
- **Exhaustive Analysis:** Pulled from PRD, epics, architecture, previous stories, and git history
- **Developer Guardrails:** Explicit naming conventions, API patterns, error handling, offline support
- **Learning from Past:** Incorporated lessons from Stories 1.5, 1.6 (validation, multi-step flows)
- **Testing Clarity:** Defined unit, integration, E2E tests with coverage targets
- **AI Integration:** Clear trigger points and fallback strategies for AI batch jobs

**Result:** Dev agent has EVERYTHING needed to implement without guesswork or rework.

`─────────────────────────────────────────────────`
