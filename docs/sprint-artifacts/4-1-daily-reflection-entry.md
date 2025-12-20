# Story 4.1: Daily Reflection Entry

Status: ready-for-dev

<!-- Validation Report Applied: 2025-12-20 - All critical and important issues addressed -->

## Story

As a **user**,
I want to **reflect on my day with default and customizable questions, then submit for AI feedback**,
So that **I process what happened, track what matters to me, and receive personalized insights for tomorrow**.

## Story Points: 7 pts

**Breakdown:**
- Part 4.1a: Default Reflection Questions (3 pts)
- Part 4.1b: Custom Questions (3 pts)
- Part 4.1c: Countdown Timer (1 pt)

## Acceptance Criteria

### Part 4.1a: Default Reflection Questions (3 pts)

**Access & Navigation (AC #1) - REVISED FOR PARALLEL DEVELOPMENT**
- [ ] **PLACEHOLDER NAVIGATION:** Since app tabs (Story 3.1) not yet implemented, use temporary navigation:
  - Create direct navigation from Settings → "Daily Reflection (Test)" button
  - OR navigate directly from app launch for development testing
  - **When Story 3.1 complete:** Replace with Thread Home → "Daily Check-in" CTA button
- [ ] Deep link support: `weave://thread/reflection` (prepare for production)
- [ ] Navigate to Reflection screen when navigation triggered
- [ ] Smooth transition animation (<300ms)
- [ ] **NOTE:** AC #1 will be updated when Story 3.1 (Thread Home) is complete

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
- [ ] Max 500 characters enforced using React Native `TextInput` `maxLength={500}` prop (typing disabled at limit)
- [ ] "Skip" link allowed (not encouraged, but permitted for low-friction)
- [ ] Auto-save draft to AsyncStorage every 5 seconds (prevent data loss)

**Default Question 2: Tomorrow's Focus (AC #4)**
- [ ] Display question label: "What is the one thing you want to accomplish tomorrow?"
- [ ] Single-line text input (80-100 characters)
- [ ] Placeholder text: "Tomorrow I will..."
- [ ] Character count: "0 / 100"
- [ ] Min 10 characters encouraged
- [ ] Max 100 characters enforced using `maxLength={100}` prop
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
- [ ] Button text changes based on mode:
  - **Create mode:** "Submit" button at bottom (full-width, fixed position)
  - **Edit mode:** "Update Reflection" button (same position)
- [ ] Button enabled when fulfillment score is set (text inputs can be empty)
- [ ] Button disabled during submission (loading state)
- [ ] Loading indicator + text:
  - Create mode: "Submitting your reflection..."
  - Edit mode: "Updating your reflection..."
- [ ] On success: Navigate to AI Feedback Generation screen (Story 4.3)
- [ ] Trigger AI batch job for feedback generation + next-day Triad

**Data Storage (AC #7)**
- [ ] Write to `journal_entries` table on submit:
  - `user_id` (from session/auth)
  - `local_date` (today's date in YYYY-MM-DD format, calculated using timezone strategy - see Dev Notes)
  - `fulfillment_score` (1-10 integer)
  - `default_responses` (JSONB object):
    ```json
    {
      "today_reflection": "...",  // Question 1 response
      "tomorrow_focus": "..."     // Question 2 response
    }
    ```
  - `created_at` (timestamp)
  - `updated_at` (timestamp, auto-updated on PATCH)
- [ ] Update `daily_aggregates.has_journal` = true for today
- [ ] Only ONE journal entry per day per user (enforce with unique constraint on `user_id + local_date`)

**Edit Existing Journal Entry (AC #17) - NEW**
- [ ] On reflection screen mount, check if journal already exists for today:
  - Call `GET /api/journal-entries/today` endpoint
  - If 200 OK: Load existing journal data and enter EDIT MODE
  - If 404 Not Found: Enter CREATE MODE (default)
- [ ] EDIT MODE behavior:
  - Pre-populate all form fields with existing data:
    - Default Question 1: `default_responses.today_reflection`
    - Default Question 2: `default_responses.tomorrow_focus`
    - Fulfillment slider: `fulfillment_score`
    - Custom questions: `custom_responses` (if any)
  - Change button text from "Submit" to "Update Reflection"
  - Change loading text to "Updating your reflection..."
- [ ] On update submit:
  - Call `PATCH /api/journal-entries/{journal_id}` endpoint
  - Maintain same validation rules as create
  - Update `updated_at` timestamp
  - Show success toast: "Reflection updated"

**Event Tracking (AC #8)**
- [ ] Track `journal.started` when screen loads (include metadata: `{mode: 'create' | 'edit'}`)
- [ ] Track `journal.submitted` when submission succeeds (create mode)
- [ ] Track `journal.updated` when update succeeds (edit mode)
- [ ] Track `journal.skipped_question` if user skips default questions
- [ ] Include metadata: `{date, fulfillment_score, questions_answered: [1, 2], mode: 'create' | 'edit'}`

**Error Handling (AC #9)**
- [ ] Network error: Show toast "Couldn't submit. Saved locally, will retry."
- [ ] Store failed submission in AsyncStorage for retry on reconnect
- [ ] Offline mode: Allow submission (queue for sync when online)
- [ ] Server error (500): Show "Something went wrong. Try again?" with retry button
- [ ] Duplicate entry error (409): Should not occur if edit mode implemented correctly

---

### Part 4.1b: Custom Questions (3 pts)

**Custom Questions Display (AC #10)**
- [ ] Display user-defined custom questions BELOW default questions
- [ ] Each custom question appears as a separate input field
- [ ] Question types supported:
  - **Text** (single line, 100 char max using `maxLength={100}`)
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

### Part 4.1c: 24-Hour Countdown Timer (1 pt)

**Countdown Timer Display (AC #18) - NEW**
- [ ] Display 24-hour countdown timer on Thread Home screen (when Story 3.1 complete)
  - **For Story 4.1 implementation:** Create reusable CountdownTimer component that can be embedded later
  - Component file: `weave-mobile/src/components/features/journal/CountdownTimer.tsx`
- [ ] Timer shows time remaining until day reset (midnight in user's local timezone)
- [ ] Timer updates every minute (not every second to save battery)
- [ ] Display format: "23h 45m until day resets" OR "45m left" OR "Reflect now!"
- [ ] Timer turns red/urgent when < 1 hour remaining
- [ ] Tap timer navigates to reflection screen (deep link)
- [ ] Timer calculation uses timezone strategy (see Dev Notes)
- [ ] **Integration point:** When Story 3.1 (Thread Home) is implemented, embed CountdownTimer component in Thread Home header

---

## Tasks / Subtasks

### Task 0: Database Migrations (NEW - AC #7, #17)
- [x] **Subtask 0.1**: Create database migration for journal_entries table
  - **Migration file:** `supabase/migrations/20251220000001_story_4_1_journal_schema_update.sql`
  - **Story tracking comment:** Added header comment in migration
  - Updated existing journal_entries table schema:
    - Dropped old `text` column
    - Added `default_responses JSONB` for structured questions
    - Added `custom_responses JSONB` for user-defined questions
    - Made `fulfillment_score` NOT NULL (Story 4.1 requirement)
  - Migration tested: ✅ Applied successfully via `npx supabase db reset`

- [x] **Subtask 0.2**: Verify user_profiles.preferences column exists
  - Verified `user_profiles` table was missing `preferences JSONB` column
  - Added to migration:
    ```sql
    ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;
    ```
  - Added comment: 'User preferences including custom_reflection_questions array. Story 4.1 AC #13.'
  - ✅ Tested and verified column added successfully

### Task 1: Reflection Screen UI (AC: #1-#6, #16, #17, #18)
- [ ] **Subtask 1.1**: Create ReflectionScreen component with navigation decision
  - **ARCHITECTURAL DECISION:** Place reflection in placeholder location during Story 4.1 development
  - **Development file:** `app/(tabs)/settings/reflection.tsx` (temporary testing location)
  - **Production file:** `app/(tabs)/thread/reflection.tsx` (when Story 3.1 complete - move file here)
  - **Rationale:**
    - Settings tab exists from onboarding (can use for testing)
    - Thread tab will be created in Story 3.1 (Epic 3)
    - Easy file move when Thread tab is ready
  - **Deep link:** `weave://thread/reflection` (prepare for production even if using temp location)
  - Component handles both CREATE and EDIT modes based on existing journal check

- [ ] **Subtask 1.2**: Implement screen header with personalized greeting
  - Inject user's `preferred_name` from TanStack Query `useQuery(['user-profile'])`

- [ ] **Subtask 1.3**: Implement Default Question 1 (multi-line text input)
  - Use `TextInput` with `multiline={true}`, `numberOfLines={5}`, `maxLength={500}`
  - Character counter component (reusable)

- [ ] **Subtask 1.4**: Implement Default Question 2 (single-line text input)
  - Standard `TextInput` with `maxLength={100}`

- [ ] **Subtask 1.5**: Implement Fulfillment Score Slider
  - Use `@react-native-community/slider` or custom slider component
  - Emoji/color feedback based on value

- [ ] **Subtask 1.6**: Implement Submit/Update button with loading state
  - Button text changes based on mode (Submit vs Update)
  - Disable during submission
  - Show loading spinner + text

- [ ] **Subtask 1.7**: Implement auto-save draft logic
  - Save to AsyncStorage every 5 seconds
  - Restore draft on screen re-entry
  - Clear draft after successful submission

- [ ] **Subtask 1.8**: Implement edit mode detection
  - On screen mount, call GET /api/journal-entries/today
  - If journal exists: Pre-populate all fields, enable edit mode
  - If no journal: Use empty form, enable create mode

- [ ] **Subtask 1.9**: Create CountdownTimer component (reusable)
  - File: `weave-mobile/src/components/features/journal/CountdownTimer.tsx`
  - Calculate time until midnight in user's local timezone
  - Update display every minute
  - Support tap navigation to reflection screen
  - **Note:** This component will be embedded in Thread Home when Story 3.1 is complete

### Task 2: Data Submission & API Integration (AC: #7-#9, #17)
- [ ] **Subtask 2.1**: Create API endpoint `POST /api/journal-entries`
  - FastAPI route in `weave-api/app/api/journal_router.py`
  - Accepts: `{local_date, fulfillment_score, default_responses, custom_responses}`
  - Returns: `{data: {journal_id, created_at, updated_at}, meta: {timestamp}}`

- [ ] **Subtask 2.2**: Create API endpoint `GET /api/journal-entries/today` (NEW)
  - Returns today's journal entry if exists
  - Returns 404 if no journal entry for today
  - Response format: `{data: {id, local_date, fulfillment_score, default_responses, custom_responses, created_at, updated_at}, meta: {timestamp}}`

- [ ] **Subtask 2.3**: Create API endpoint `PATCH /api/journal-entries/{journal_id}` (NEW)
  - Accepts: `{fulfillment_score?, default_responses?, custom_responses?}` (all optional, partial update)
  - Updates existing journal entry
  - Automatically updates `updated_at` timestamp
  - Returns: `{data: {journal_id, updated_at}, meta: {timestamp}}`

- [ ] **Subtask 2.4**: Implement Pydantic validation schema for request body
  - `fulfillment_score`: integer 1-10 (required for POST, optional for PATCH)
  - `default_responses`: object with optional text fields
  - `custom_responses`: object with dynamic keys
  - Models file: `weave-api/app/models/journal.py`
    - `JournalEntryCreate` (for POST)
    - `JournalEntryUpdate` (for PATCH)
    - `JournalEntryResponse` (for all responses)

- [ ] **Subtask 2.5**: Write to `journal_entries` table (CREATE)
  - Insert new row with user_id + local_date
  - Handle unique constraint violation (return 409 if duplicate - should not occur with edit mode)

- [ ] **Subtask 2.6**: Update existing journal entry (EDIT)
  - Update row by journal_id
  - Verify user_id matches (authorization check)
  - Update only provided fields (partial update)
  - Auto-update `updated_at` timestamp

- [ ] **Subtask 2.7**: Update `daily_aggregates.has_journal = true`
  - Upsert daily_aggregates row for today (both create and update operations)

- [ ] **Subtask 2.8**: Trigger AI batch job asynchronously
  - Call AI feedback generation service (Story 4.3)
  - Return 202 Accepted immediately (don't block on AI)
  - Trigger on both CREATE and UPDATE operations

- [ ] **Subtask 2.9**: Implement error handling
  - Network errors: Offline queue with AsyncStorage
  - Server errors: User-friendly error messages
  - Authorization errors: 403 if user tries to edit someone else's journal

### Task 3: TanStack Query Integration (AC: #7-#9, #17)
- [ ] **Subtask 3.1**: Create `useSubmitJournal` mutation hook
  - File: `weave-mobile/src/hooks/useJournal.ts`
  - Mutation function calls `POST /api/journal-entries`

- [ ] **Subtask 3.2**: Create `useUpdateJournal` mutation hook (NEW)
  - Same file: `weave-mobile/src/hooks/useJournal.ts`
  - Mutation function calls `PATCH /api/journal-entries/{id}`

- [ ] **Subtask 3.3**: Create `useGetTodayJournal` query hook (NEW)
  - Same file: `weave-mobile/src/hooks/useJournal.ts`
  - Query function calls `GET /api/journal-entries/today`
  - Returns null if 404, journal data if 200

- [ ] **Subtask 3.4**: Implement optimistic update
  - Update `daily_aggregates` query cache immediately
  - Show success feedback before server confirms

- [ ] **Subtask 3.5**: Implement error rollback
  - Revert optimistic update on mutation error
  - Show error toast with retry option

- [ ] **Subtask 3.6**: Implement offline queueing
  - Use TanStack Query `networkMode: 'offlineFirst'`
  - Persist mutation to AsyncStorage if offline
  - Auto-retry when connection restored

- [ ] **Subtask 3.7**: Invalidate related queries on success
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
  - Test successful submission (POST)
  - Test retrieve today's journal (GET)
  - Test update journal (PATCH)
  - Test duplicate entry handling
  - Test custom questions storage

- [ ] **Subtask 7.3**: E2E test for reflection flow
  - Test complete reflection submission (create mode)
  - Test edit existing reflection (edit mode)
  - Test offline queueing and sync
  - Test custom question CRUD operations

- [ ] **Subtask 7.4**: Test AI batch trigger
  - Verify AI feedback generation triggered on submit
  - Verify Triad generation for next day

- [ ] **Subtask 7.5**: Edge case tests
  - **NOTE:** Additional edge case tests documented in ATDD test design docs
  - See `docs/test-design.md` for full list of edge cases not written yet
  - Priority edge cases for Story 4.1:
    - Journal already exists → GET retrieves existing → form pre-populates (edit mode)
    - Offline submission → airplane mode → submission queued → reconnect → auto-sync
    - 5 custom questions exist → attempt 6th → show toast "Max 5 questions"
    - Character limit enforcement → type 500 chars → typing disabled at 500
    - Timezone edge case → user near midnight → journal saves to correct local_date
    - Edit after AI feedback generated → verify updated journal triggers new AI batch

---

## Dev Notes

### Mobile Architecture Patterns

**State Management:**
- TanStack Query for server state (`journal_entries`, `user_profiles`)
- useState for component-local state (form inputs, slider value)
- AsyncStorage for draft auto-save and offline queue

**API Integration:**
- Endpoints:
  - `POST /api/journal-entries` (create)
  - `GET /api/journal-entries/today` (retrieve today's journal)
  - `PATCH /api/journal-entries/{id}` (update)
- Response format: `{data: {...}, meta: {timestamp}}`
- Error format: `{error: {code, message}}`

**Offline Support:**
- TanStack Query `networkMode: 'offlineFirst'`
- Mutations queue automatically when offline
- Persist to AsyncStorage using `@tanstack/query-async-storage-persister`
- Auto-sync on reconnect using `queryClient.resumePausedMutations()`

**Navigation Strategy (Parallel Development):**
- **Story 4.1 (Current):** Use placeholder navigation from Settings tab
  - File location: `app/(tabs)/settings/reflection.tsx` (temporary)
  - Allows testing without dependency on Story 3.1
- **Story 3.1 (Future):** Thread Home will be created with proper CTA button
  - File location: `app/(tabs)/thread/reflection.tsx` (production)
  - Move reflection.tsx file from settings to thread when Story 3.1 complete
- **Deep link:** `weave://thread/reflection` (use production path even during placeholder phase)
- **Integration:** When Story 3.1 is done, embed CountdownTimer component in Thread Home

### Timezone Handling Strategy

**Critical for AC #7 (local_date calculation) and AC #18 (countdown timer):**

**Primary Strategy:** Use device timezone
```typescript
// Get device timezone
import { getTimeZone } from 'react-native-localize';
const deviceTimezone = getTimeZone(); // e.g., "America/New_York"

// Calculate local_date for today
import { format, utcToZonedTime } from 'date-fns-tz';
const now = new Date();
const zonedDate = utcToZonedTime(now, deviceTimezone);
const localDate = format(zonedDate, 'yyyy-MM-dd'); // "2025-12-20"
```

**Fallback Strategy:** Use stored user preference
- If `react-native-localize` unavailable, use `user_profiles.timezone` from onboarding
- If neither available, default to UTC (log warning)

**Future Enhancement:** Detect timezone changes
- Prompt user if device timezone differs from stored `user_profiles.timezone`
- "Looks like you're in a different timezone. Update your settings?"

**Countdown Timer Calculation:**
```typescript
// Calculate time until midnight in user's local timezone
import { addDays, startOfDay } from 'date-fns';
const zonedNow = utcToZonedTime(new Date(), deviceTimezone);
const nextMidnight = startOfDay(addDays(zonedNow, 1));
const msUntilMidnight = nextMidnight.getTime() - zonedNow.getTime();

// Format display
const hoursLeft = Math.floor(msUntilMidnight / (1000 * 60 * 60));
const minutesLeft = Math.floor((msUntilMidnight % (1000 * 60 * 60)) / (1000 * 60));
const displayText = hoursLeft > 0
  ? `${hoursLeft}h ${minutesLeft}m until day resets`
  : `${minutesLeft}m left`;
```

**Edge Case Handling:**
- User near midnight (< 1 minute): Show "Reflect now!" instead of countdown
- Timer turns red when < 1 hour remaining (urgent visual cue)

### Backend Architecture Patterns

**FastAPI Endpoint Structure:**
```python
# weave-api/app/api/journal_router.py

@router.post("/journal-entries")
async def create_journal_entry(
    entry: JournalEntryCreate,
    user_id: str = Depends(get_current_user_id)
):
    # 1. Validate request (Pydantic)
    # 2. Check duplicate (user_id + local_date unique constraint)
    # 3. Write to journal_entries table
    # 4. Update daily_aggregates.has_journal = true
    # 5. Trigger AI batch job (async, non-blocking)
    # 6. Return 201 Created with journal_id

@router.get("/journal-entries/today")
async def get_today_journal_entry(
    user_id: str = Depends(get_current_user_id)
):
    # 1. Calculate today's local_date using user's timezone
    # 2. Query journal_entries WHERE user_id = X AND local_date = today
    # 3. If found: Return 200 OK with journal data
    # 4. If not found: Return 404 Not Found

@router.patch("/journal-entries/{journal_id}")
async def update_journal_entry(
    journal_id: str,
    entry: JournalEntryUpdate,
    user_id: str = Depends(get_current_user_id)
):
    # 1. Validate request (Pydantic, partial update)
    # 2. Verify journal belongs to user (authorization)
    # 3. Update only provided fields
    # 4. Auto-update updated_at timestamp
    # 5. Update daily_aggregates.has_journal = true (idempotent)
    # 6. Trigger AI batch job (async, non-blocking)
    # 7. Return 200 OK with updated journal_id
```

**Database Schema:**
```sql
-- Migration: YYYYMMDDHHMMSS_story_4_1_journal_entries.sql
-- Story 4.1: Daily Reflection Entry
-- Created: 2025-12-20
-- Updates Epic 0 schema with journal functionality

CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  local_date DATE NOT NULL,
  fulfillment_score INTEGER CHECK (fulfillment_score >= 1 AND fulfillment_score <= 10) NOT NULL,
  default_responses JSONB,
  custom_responses JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),  -- Track edit history
  UNIQUE(user_id, local_date)
);

-- Index for user queries
CREATE INDEX idx_journal_entries_user_date ON journal_entries(user_id, local_date DESC);

-- Verify user_profiles.preferences column exists (for custom questions)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;
```

**AI Batch Job Trigger:**
- Call AI service: `POST /api/ai/generate-recap`
- Non-blocking (return 202 Accepted immediately)
- Push notification when AI feedback ready
- Fallback to template response if AI fails
- Trigger on BOTH create and update operations

### Testing Strategy

**Unit Tests (Mobile):**
- `ReflectionScreen.test.tsx`: Component rendering, form validation, mode switching
- `useJournal.test.ts`: Mutation hooks, query hooks, optimistic updates
- `CountdownTimer.test.tsx`: Timezone calculations, display formatting

**Integration Tests (Backend):**
- `test_journal_router.py`:
  - POST endpoint: validation, database writes, AI trigger
  - GET endpoint: today's journal retrieval, 404 handling
  - PATCH endpoint: partial updates, authorization, timestamp update
- `test_ai_batch_trigger.py`: AI service invocation

**E2E Tests:**
- `journal-submission.test.ts`: Full flow from screen load to AI feedback
- `journal-edit.test.ts`: Edit existing journal flow
- `journal-offline.test.ts`: Offline submission and sync

**Coverage Target:** >80% for journal feature (Story 4.1)

**Additional Test Cases:** See `docs/test-design.md` for comprehensive edge case list not yet written.

### Project Structure Notes

**Mobile Files:**
```
weave-mobile/
├── app/
│   ├── (tabs)/
│   │   ├── settings/
│   │   │   └── reflection.tsx         # TEMPORARY: Story 4.1 development
│   │   ├── thread/
│   │   │   └── reflection.tsx         # PRODUCTION: Move here when Story 3.1 complete
│   │   └── journal/
│   │       └── index.tsx               # Journal history (Story 4.5)
├── src/
│   ├── components/
│   │   └── features/
│   │       └── journal/
│   │           ├── ReflectionScreen.tsx
│   │           ├── CustomQuestionInput.tsx
│   │           ├── ManageQuestionsModal.tsx
│   │           └── CountdownTimer.tsx   # NEW: Reusable countdown component
│   ├── hooks/
│   │   └── useJournal.ts               # TanStack Query hooks (submit, update, getTodayJournal)
│   └── services/
│       └── journalApi.ts               # API client functions
```

**Backend Files:**
```
weave-api/
├── app/
│   ├── api/
│   │   └── journal_router.py           # Journal endpoints (POST, GET, PATCH)
│   ├── models/
│   │   └── journal.py                  # Pydantic models (Create, Update, Response)
│   ├── services/
│   │   └── ai_feedback_service.py      # AI batch job (Story 4.3)
│   └── tests/
│       └── test_journal_router.py      # Integration tests
├── supabase/
│   └── migrations/
│       └── YYYYMMDDHHMMSS_story_4_1_journal_entries.sql  # Story 4.1 migration
```

### References

- [PRD: Epic 4 - Reflection & Journaling](docs/prd/epic-4-reflection-journaling.md)
- [Epics: Story 4.1a + 4.1b + 4.1c](docs/epics.md#epic-4-reflection--journaling-28-pts)
- [Architecture: State Management](docs/architecture/core-architectural-decisions.md#state-management-architecture)
- [Architecture: Offline Support](docs/architecture/core-architectural-decisions.md#offline-strategy)
- [Patterns: API Response Format](docs/architecture/implementation-patterns-consistency-rules.md#api-response-format)
- [Patterns: Naming Conventions](docs/architecture/implementation-patterns-consistency-rules.md#naming-patterns)
- [Story Example: 1.6 Name Entry](docs/stories/1-6-name-entry-weave-personality-identity-traits.md)
- [Test Design: Additional Edge Cases](docs/test-design.md)

### Key Architectural Decisions

1. **Split Story Structure:** 4.1a (default questions, 3 pts) + 4.1b (custom questions, 3 pts) + 4.1c (countdown timer, 1 pt) = **7 pts total**
   - Allows incremental implementation: Default questions first, then add custom questions, then add countdown timer
   - Custom questions can be marked as "Should Have" if time-constrained

2. **Edit Flow Implementation:** Separate endpoints for create (POST) and update (PATCH)
   - GET endpoint checks for existing journal on screen mount
   - Form automatically switches between create and edit modes
   - Edit mode pre-populates all fields with existing data

3. **Placeholder Navigation Strategy:** Parallel development without Story 3.1 dependency
   - Story 4.1: Place reflection screen in Settings tab temporarily
   - Story 3.1: Create Thread tab with proper navigation
   - Post-Story 3.1: Move reflection.tsx from settings to thread folder

4. **Database Migrations with Story Tracking:** Clear migration history
   - Each migration file includes comment header noting which story it's from
   - Makes debugging and rollback easier
   - Example: `-- Migration for Story 4.1: Daily Reflection Entry`

5. **Timezone Handling:** Device-first with fallback to stored preference
   - Primary: Use React Native device timezone detection
   - Fallback: Use `user_profiles.timezone` from onboarding
   - Future: Prompt user when timezone changes detected

6. **AI Batch Trigger:** Reflection submission is the PRIMARY trigger for AI operations
   - Generates AI feedback (Story 4.3)
   - Generates next-day Triad (Story 3.2)
   - Must be async/non-blocking (202 Accepted response)
   - Triggers on BOTH create and update operations

7. **Offline-First:** Users must be able to reflect offline (subway, elevator)
   - Use TanStack Query offline queue
   - Auto-sync on reconnect
   - Show clear offline indicator

8. **One Journal Per Day:** Unique constraint on `(user_id, local_date)`
   - Edit mode replaces create if journal exists
   - Prevents data inconsistency

9. **Custom Questions in JSONB:** Flexible schema for user-defined tracking
   - No rigid database columns (allows any number of custom questions)
   - AI can parse JSONB to detect patterns
   - Historical responses preserved even if question deleted

10. **Countdown Timer as Reusable Component:**
    - Built during Story 4.1 but designed for future integration
    - When Story 3.1 complete, simply import and embed in Thread Home
    - Self-contained with timezone calculation logic

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
- ⚠️ Ensure any new dependencies (slider library, date-fns-tz, react-native-localize) are compatible with current setup

---

## Dev Agent Record

### Context Reference

<!-- This story was generated by the BMAD create-story workflow with ultimate context engine analysis -->
<!-- Validation applied: 2025-12-20 - All critical and important issues addressed -->

### Agent Model Used

Claude Sonnet 4.5 (global.anthropic.claude-sonnet-4-5-20250929-v1:0)

### Debug Log References

- Workflow: `.bmad/bmm/workflows/4-implementation/create-story/workflow.yaml`
- Instructions: `.bmad/bmm/workflows/4-implementation/create-story/instructions.xml`
- Validation Report: Applied 2025-12-20

### Completion Notes List

- Epic 4 PRD analyzed: US-4.1a + US-4.1b + US-4.1c (countdown timer) combined into single story file
- Architecture patterns extracted: TanStack Query, offline support, API response format, timezone handling
- Previous story learnings incorporated: Multi-step flows, validation patterns
- Custom questions feature fully specified with CRUD operations and AI integration
- **Edit flow specified:** GET/PATCH endpoints for updating existing journals
- **Placeholder navigation:** Parallel development strategy without Story 3.1 dependency
- **Database migrations:** Story tracking comments added to migration files
- **Countdown timer:** Implemented as reusable component for future Thread Home integration
- **Timezone strategy:** Device-first with stored preference fallback
- Testing strategy defined: Unit, integration, E2E tests with >80% coverage target
- **Additional test cases:** Documented in ATDD docs (`docs/test-design.md`)
- **Status:** ready-for-dev (validation applied, comprehensive context provided)

### Validation Fixes Applied

1. ✅ **Critical Issue #1:** Edit flow specification added (AC #17, GET/PATCH endpoints, pre-population logic)
2. ✅ **Critical Issue #2:** Placeholder navigation strategy (AC #1 revised, no dependency on Story 3.1)
3. ✅ **Critical Issue #3:** Navigation architecture decision made (placeholder in settings, production in thread)
4. ✅ **Critical Issue #4:** Database migrations with story tracking (Task 0, migration file format)
5. ✅ **Important Issue #6:** Countdown timer added (AC #18, Part 4.1c, +1 pt)
6. ✅ **Important Issue #7:** Timezone handling strategy documented (Dev Notes section)
7. ✅ **Minor Issue #9:** Additional test cases noted in ATDD docs reference

**Final Story Points:** 7 pts (3 + 3 + 1)

### File List

**To be created:**
- `app/(tabs)/settings/reflection.tsx` (TEMPORARY - Story 4.1 development)
- `app/(tabs)/thread/reflection.tsx` (PRODUCTION - move here when Story 3.1 complete)
- `weave-mobile/src/components/features/journal/ReflectionScreen.tsx`
- `weave-mobile/src/components/features/journal/CustomQuestionInput.tsx`
- `weave-mobile/src/components/features/journal/ManageQuestionsModal.tsx`
- `weave-mobile/src/components/features/journal/CountdownTimer.tsx` (NEW - reusable component)
- `weave-mobile/src/hooks/useJournal.ts` (submit, update, getTodayJournal hooks)
- `weave-mobile/src/services/journalApi.ts`
- `weave-api/app/api/journal_router.py` (POST, GET, PATCH endpoints)
- `weave-api/app/models/journal.py` (Create, Update, Response models)
- `weave-api/app/services/ai_feedback_service.py` (Story 4.3 dependency)
- `weave-api/app/tests/test_journal_router.py`
- `weave-mobile/src/components/features/journal/__tests__/ReflectionScreen.test.tsx`
- `supabase/migrations/YYYYMMDDHHMMSS_story_4_1_journal_entries.sql` (NEW)

**To be modified:**
- `app/(tabs)/settings/index.tsx` (add temporary "Daily Reflection (Test)" button + Reflection Preferences section)
- `weave-api/app/main.py` (register journal_router)
- `docs/test-design.md` (add Story 4.1 edge cases to ATDD documentation)

**To be moved (when Story 3.1 complete):**
- Move `app/(tabs)/settings/reflection.tsx` → `app/(tabs)/thread/reflection.tsx`
- Update `app/(tabs)/thread/index.tsx` (add "Daily Check-in" CTA button, embed CountdownTimer)

---

`★ Insight ─────────────────────────────────────`

**Validation-Driven Story Enhancement**

This story demonstrates the power of systematic validation:
- **Before validation:** 6 pts, missing edit flow, unclear dependencies
- **After validation:** 7 pts, full CRUD operations, parallel development strategy

**Key Improvements:**
1. **Edit Flow:** Transformed "show edit button" into full GET/PATCH specification
2. **Parallel Development:** Eliminated Story 3.1 dependency with placeholder navigation
3. **Migration Tracking:** Added story comments to migration files for better traceability
4. **Timezone Strategy:** Concrete implementation plan instead of vague "use user's timezone"
5. **Countdown Timer:** Proactive addition of epic requirement that was initially missed

**Result:** Developer can implement confidently without making architectural decisions during coding.

`─────────────────────────────────────────────────`
