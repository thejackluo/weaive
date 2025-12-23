# Needle Creation & Management Flow - Implementation Plan

**Date:** 2025-12-23
**Status:** Pending SM Validation
**Epic:** Epic 2 (Goal Management) + Epic 3 (Daily Action Loop)
**Stories:** US-2.1, US-2.2, US-2.3, US-3.1

---

## Executive Summary

Complete redesign of needle (goal) creation and management flow to integrate AI-driven clarification, milestone-based progression, and cohesive bind tracking across Thread and Dashboard.

**Key Changes:**
- 2-card creation flow with mandatory AI clarification
- Milestone-based bind progression (frequency changes as user advances)
- Weekly bind tracking (5x/week = show daily until 5 completed)
- Milestone progress prompts after bind completion
- Unified navigation structure (`/goals/*` routes, "Needles" UI terminology)


---

## Current State Analysis

### What Works
- ✅ Basic needle creation with AI suggestions (mock data)
- ✅ Needle detail view with tap-to-edit fields
- ✅ Bind tracking in Thread home screen
- ✅ Memory upload to Supabase Storage (max 10 per needle)
- ✅ Archive functionality

### What's Broken/Inconsistent
- ❌ Dual route structure (`/goals/*` and `/needles/*`)
- ❌ AI clarification step missing (jumps straight to plan generation)
- ❌ No progression timeline visualization
- ❌ Q-Goals not displayed in detail view
- ❌ Bind frequency changes not supported
- ❌ Milestone progress tracking disconnected from bind completion
- ❌ Weekly reset logic not implemented

---

## Target State Vision

### User Journey: Creating a Needle

**Card 1: Preliminary Information**
1. User taps "Add Needle" from Dashboard
2. Screen shows:
   - Title: "New Needle"
   - Input: "What's your goal?"
   - Input: "Why does it matter?"
   - Button: "Continue"
3. User fills both fields and taps "Continue"
4. **AI overlay opens from center button**
5. AI asks clarifying questions in chat format
6. User answers until AI decides it has enough context
7. AI auto-triggers "Generating Plan..." (overlay stays open with loading state)

**Card 2: Generated Plan**
1. Overlay closes, Card 2 appears with:
   - **Goal + Why** (AI-suggested phrasing, editable)
   - **Milestones** (quantifiable targets with current/target values)
   - **Progression Timeline** (bind frequencies change per milestone)
   - **Binds** (with frequency for each milestone phase)
2. User can:
   - Edit any field directly
   - Click "Make Changes" to save edits (stays on page)
   - Summon AI from center button to ask questions
   - Click "Accept Needle" to finalize and create
3. On "Accept Needle":
   - Needle saved to database
   - Binds appear in Thread home screen **today**
   - Navigate back to Dashboard

### User Journey: Viewing/Editing a Needle

1. User taps needle card from Dashboard
2. Full-screen detail view shows:
   - Goal + Why (tap-to-edit, auto-save on blur)
   - Milestones (current/target values, editable)
   - Progression Timeline (visual roadmap)
   - Binds (with frequencies per milestone)
   - **Memories section** (photo gallery, max 10, optional milestone tagging)
   - Archive button (bottom)
3. User can edit any field → auto-saves on blur
4. User can add memories → photo picker with optional milestone tag
5. User can archive needle → binds removed from Thread/Dashboard

### Bind Completion Flow (Thread)

1. User sees bind card in Thread: "Workout - 3/5 completed this week"
2. User completes bind (with timer, photo, notes)
3. **Milestone progress prompt appears:**
   - "Did you hit a new max? Update your milestone progress"
   - User can update (e.g., 185 lbs → 190 lbs) or skip
4. System checks: Did user reach milestone target?
   - If YES → Auto-advance to next milestone → Bind frequencies update
   - If NO → Continue current milestone
5. Weekly counter resets Sunday midnight (user's timezone)

---

## Technical Architecture

### Database Schema Changes

#### 1. Update `goals` table (already exists)
```sql
-- No changes needed, existing columns sufficient:
-- id, user_id, title, description, emoji, status, created_at, updated_at
```

#### 2. Update `qgoals` table (quantifiable goals / milestones)
```sql
-- Add columns to support phase tracking
ALTER TABLE qgoals ADD COLUMN phase_order INTEGER DEFAULT 1;
ALTER TABLE qgoals ADD COLUMN is_current_phase BOOLEAN DEFAULT false;

-- Existing columns:
-- id, goal_id, title, target_value, current_value, unit, created_at, updated_at
```

#### 3. Update `subtask_templates` table (bind definitions)
```sql
-- Add columns to support milestone-based progression
ALTER TABLE subtask_templates ADD COLUMN milestone_id UUID REFERENCES qgoals(id);
ALTER TABLE subtask_templates ADD COLUMN progression_rules JSONB;

-- progression_rules structure:
-- {
--   "milestones": [
--     {"milestone_id": "uuid-1", "frequency_type": "weekly", "frequency_value": 3},
--     {"milestone_id": "uuid-2", "frequency_type": "weekly", "frequency_value": 5}
--   ]
-- }

-- Existing columns:
-- id, goal_id, title, description, frequency_type, frequency_value, created_at, updated_at
```

#### 4. Update `subtask_instances` table (daily bind tasks)
```sql
-- Add columns to support weekly tracking
ALTER TABLE subtask_instances ADD COLUMN week_start_date DATE;
ALTER TABLE subtask_instances ADD COLUMN weekly_target_count INTEGER DEFAULT 1;
ALTER TABLE subtask_instances ADD COLUMN weekly_completed_count INTEGER DEFAULT 0;

-- Existing columns:
-- id, template_id, user_id, local_date, is_completed, created_at, updated_at
```

#### 5. New table: `milestone_progress_history`
```sql
CREATE TABLE milestone_progress_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID REFERENCES qgoals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  old_value DECIMAL(10, 2),
  new_value DECIMAL(10, 2),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  bind_completion_id UUID REFERENCES subtask_completions(id) -- optional link
);

-- Index for quick lookups
CREATE INDEX idx_milestone_progress_milestone_user ON milestone_progress_history(milestone_id, user_id);
```

#### 6. Update `goal_memories` table (already exists)
```sql
-- Add optional milestone tagging
ALTER TABLE goal_memories ADD COLUMN milestone_id UUID REFERENCES qgoals(id);

-- Existing columns:
-- id, goal_id, user_id, image_url, created_at
```

---

### Backend API Changes

#### 1. Update `POST /api/goals` (Create Goal)

**Current Request:**
```typescript
{
  title: string;
  description: string;
  qgoals: Array<{title, target_value, current_value, unit}>;
  binds: Array<{title, frequency_type, frequency_value}>;
}
```

**New Request:**
```typescript
{
  title: string;
  description: string;
  ai_clarification_transcript: string; // Full AI conversation log
  milestones: Array<{
    title: string;
    target_value: number;
    current_value: number;
    unit: string;
    phase_order: number; // 1, 2, 3...
    is_current_phase: boolean; // First milestone = true
  }>;
  binds: Array<{
    title: string;
    description?: string;
    progression_rules: {
      milestones: Array<{
        milestone_id: string; // Temp ID (e.g., "milestone-1")
        frequency_type: "daily" | "weekly";
        frequency_value: number;
      }>;
    };
  }>;
}
```

**New Response:**
```typescript
{
  data: {
    id: string;
    title: string;
    description: string;
    milestones: Array<Milestone>;
    binds: Array<Bind>;
  };
  meta: { timestamp: string; };
}
```

**Implementation:**
1. Create goal record
2. Create milestones with phase_order (1, 2, 3...)
3. Set first milestone as current_phase = true
4. Create bind templates with progression_rules (replace temp milestone IDs with real UUIDs)
5. **Auto-generate bind instances for today** (call new instance generation logic)
6. Return complete goal with all relationships

---

#### 2. New `POST /api/goals/{goal_id}/milestones/{milestone_id}/progress` (Update Milestone Progress)

**Request:**
```typescript
{
  new_value: number;
  bind_completion_id?: string; // If triggered by bind completion
}
```

**Response:**
```typescript
{
  data: {
    milestone: Milestone;
    advanced_to_next_milestone: boolean;
    next_milestone?: Milestone;
  };
  meta: { timestamp: string; };
}
```

**Implementation:**
1. Update qgoal.current_value
2. Log to milestone_progress_history
3. Check if current_value >= target_value
4. If YES:
   - Set current milestone is_current_phase = false
   - Set next milestone is_current_phase = true
   - Update all bind templates' active frequencies (based on new milestone)
   - Invalidate future bind instances (regenerate with new frequencies)
5. Return milestone + advancement status

---

#### 3. New `GET /api/binds/today` Enhancement

**Current Response:**
```typescript
{
  data: Array<{
    id: string;
    title: string;
    is_completed: boolean;
    needle: { id, title, emoji };
  }>;
}
```

**New Response:**
```typescript
{
  data: Array<{
    id: string;
    title: string;
    is_completed: boolean;
    weekly_completed_count: number;
    weekly_target_count: number;
    needle: { id, title, emoji };
    current_milestone: { id, title, current_value, target_value, unit };
  }>;
}
```

**Implementation:**
1. Fetch subtask_instances for today
2. Join with templates to get progression_rules
3. Join with qgoals to get current_phase milestone
4. Calculate weekly_completed_count (count completions since last Sunday)
5. Return enriched bind data

---

#### 4. Update `POST /api/binds/{bind_id}/complete`

**Current Request:**
```typescript
{
  notes?: string;
  duration_seconds?: number;
  proof_photo_url?: string;
}
```

**New Request:** (same)

**New Response:**
```typescript
{
  data: {
    completion: SubtaskCompletion;
    should_prompt_milestone_update: boolean;
    milestone?: Milestone; // If prompt should be shown
  };
  meta: { timestamp: string; };
}
```

**Implementation:**
1. Create subtask_completion record
2. Update subtask_instance.weekly_completed_count += 1
3. Check if weekly_completed_count >= weekly_target_count → mark week as complete
4. **Check if this bind is linked to a milestone:**
   - If YES → return should_prompt_milestone_update: true + milestone data
   - If NO → return should_prompt_milestone_update: false
5. Return completion + prompt flag

---

#### 5. New Background Job: `generate_bind_instances_for_week`

**Trigger:** Run every Sunday at 12:01 AM (user's timezone)

**Logic:**
1. For each user:
   - Get all active bind templates
   - For each template:
     - Get current milestone (is_current_phase = true)
     - Get frequency for current milestone from progression_rules
     - If frequency_type = "weekly":
       - Create 1 instance with weekly_target_count = frequency_value
       - Set week_start_date = today (Sunday)
       - Instance repeats daily until weekly_target_count reached
     - If frequency_type = "daily":
       - Create 7 instances (one per day)
2. Delete old instances (older than 2 weeks)

---

### Frontend Changes

#### 1. Update `CreateNeedleScreen.tsx`

**Current:** 3 steps (Input → AI Generating → Review)

**New:** 2 cards (Input with AI Clarification → Review with Edit/Save)

**Card 1: Preliminary Information**
- Component: `CreateNeedleCard1`
- Fields:
  - TextInput: "What's your goal?"
  - TextInput: "Why does it matter?" (multiline)
- Button: "Continue" (disabled until both filled)
- On Continue:
  - Open AI overlay from center button
  - Pass goal + why to AI as initial context
  - AI chat interface appears with clarifying questions
  - User answers in chat
  - AI decides when done → auto-triggers "Generating Plan..."
  - AI overlay shows loading state: "Generating Plan..."
  - Call backend AI endpoint: `POST /api/ai/generate-goal-plan`
  - On success: Close AI overlay, navigate to Card 2

**Card 2: Generated Plan**
- Component: `CreateNeedleCard2`
- Sections:
  1. **Goal + Why** (TextInput, editable)
  2. **Milestones** (List of cards, editable)
     - Each milestone: title, current_value, target_value, unit
     - Tap to edit inline
  3. **Progression Timeline** (Visual roadmap)
     - Horizontal timeline showing milestone phases
     - Each phase shows bind frequencies (e.g., "Milestone 1: 3x/week → Milestone 2: 5x/week")
  4. **Binds** (List of cards, editable)
     - Each bind: title, description, progression_rules
     - Show frequency per milestone (e.g., "Workout: 3x/week → 5x/week → 6x/week")
- Buttons:
  - "Make Changes" (appears when user edits anything)
    - Saves current state to local state (not DB yet)
    - Button text changes to "Make Changes" (can be clicked multiple times)
  - "Accept Needle" (always visible)
    - Saves everything to backend via `POST /api/goals`
    - Navigates back to Dashboard
- AI Overlay Access:
  - Center button always accessible
  - User can summon AI to ask questions while editing

**New Components Needed:**
- `MilestoneCard` - Editable milestone with current/target values
- `ProgressionTimeline` - Visual roadmap of milestone phases
- `BindCardWithProgression` - Bind card showing frequency changes per milestone

---

#### 2. Update `NeedleDetailScreen.tsx`

**Current Layout:**
1. Needle name (tap-to-edit)
2. Motivation box (tap-to-edit)
3. Binds list
4. Memories section
5. Archive button

**New Layout:** (Match Card 2 from creation flow)
1. Needle name (tap-to-edit, auto-save on blur)
2. Motivation box (tap-to-edit, auto-save on blur)
3. **Milestones section** (NEW)
   - Show all milestones with current/target values
   - Highlight current active milestone
   - Tap value to edit → auto-save on blur
4. **Progression Timeline** (NEW)
   - Visual roadmap (same as Card 2)
5. Binds list (with progression per milestone)
6. Memories section (with optional milestone tagging)
   - Add Memory button → Photo picker
   - Optional: "Tag to milestone" dropdown
   - Display: Grid of photos, grouped by milestone (optional)
7. Archive button

**Auto-save behavior:** All edits save on blur (no "Save" button)

---

#### 3. Update `ThreadHomeScreen.tsx`

**Current:** Shows today's binds grouped by needle

**New:** Show weekly progress for each bind

**Bind Card Display:**
- Title: "Workout"
- Subtitle: "Get Ripped" (needle name)
- **Progress Badge:** "3/5 completed this week"
- Status indicators:
  - If weekly_completed_count >= weekly_target_count: ✅ (green checkmark)
  - Else: Show progress bar (3/5)
- Tap → Navigate to BindScreen for completion

**Data Source:** `GET /api/binds/today` (returns weekly_completed_count + weekly_target_count)

---

#### 4. Update `BindScreen.tsx` (Completion Flow)

**Current Flow:**
1. User completes bind (timer, photo, notes)
2. Celebration animation
3. Navigate back to Thread

**New Flow:**
1. User completes bind (timer, photo, notes)
2. Call `POST /api/binds/{id}/complete`
3. Check response: `should_prompt_milestone_update`
4. **If true:**
   - Show milestone progress prompt modal:
     - "Did you hit a new max?"
     - Display milestone: "Bench Press: 185 lbs → 200 lbs"
     - TextInput for new value
     - Buttons: "Update" | "Skip"
   - If "Update" → Call `POST /api/goals/{goal_id}/milestones/{milestone_id}/progress`
   - Check response: `advanced_to_next_milestone`
   - If true → Show celebration: "You reached Milestone 1! 🎉"
5. **If false:** Skip prompt
6. Show completion celebration animation
7. Navigate back to Thread

**New Component:** `MilestoneProgressPrompt` - Modal for updating milestone after bind completion

---

#### 5. Update Navigation (Route Consolidation)

**Current Routes:**
- `app/(tabs)/goals/` (placeholders)
- `app/needles/` (implemented)

**New Routes:** (Remove `/needles/*`, consolidate to `/goals/*`)
- `app/(tabs)/goals/index.tsx` → NeedlesListScreen
- `app/goals/create.tsx` → CreateNeedleScreen (2-card flow)
- `app/goals/[id].tsx` → NeedleDetailScreen (updated layout)

**Update References:**
- DashboardScreen: `/needles/create` → `/goals/create`
- NeedlesListScreen: `/needles/create` → `/goals/create`
- ThreadHomeScreen: `/needles/${id}` → `/goals/${id}`
- All Grep for `/needles/` and replace with `/goals/`

**UI Terminology:** Keep "Needles" in all user-facing text (buttons, titles, labels)

---

## AI Integration Points

### 1. Goal Clarification Conversation

**Endpoint:** `POST /api/ai/clarify-goal`

**Request:**
```typescript
{
  goal: string;
  why: string;
  conversation_history?: Array<{role: "user" | "assistant", content: string}>;
}
```

**Response:**
```typescript
{
  data: {
    clarification_needed: boolean;
    next_question?: string;
    ready_to_generate: boolean;
  };
}
```

**AI Prompt:**
```
You are a goal-setting coach helping a user clarify their goal.

User's goal: "{goal}"
Why it matters: "{why}"

Your job: Ask 2-4 clarifying questions to understand:
1. Is this goal measurable? What does success look like?
2. What's the timeline? (e.g., 10 days, 3 months, 1 year)
3. Are there any constraints? (e.g., budget, time, equipment)
4. What's their starting point? (e.g., current skill level, resources)

When you have enough context, respond with: "ready_to_generate: true"
```

---

### 2. Goal Plan Generation

**Endpoint:** `POST /api/ai/generate-goal-plan`

**Request:**
```typescript
{
  goal: string;
  why: string;
  clarification_transcript: string; // Full conversation from step 1
}
```

**Response:**
```typescript
{
  data: {
    title: string; // AI-suggested phrasing
    description: string; // AI-suggested why
    milestones: Array<{
      title: string;
      target_value: number;
      current_value: number;
      unit: string;
      phase_order: number;
    }>;
    binds: Array<{
      title: string;
      description: string;
      progression_rules: {
        milestones: Array<{
          milestone_id: string; // Temp ID
          frequency_type: "daily" | "weekly";
          frequency_value: number;
        }>;
      };
    }>;
  };
}
```

**AI Prompt:**
```
Based on the conversation, generate a structured goal plan.

Goal: "{goal}"
Why: "{why}"
Clarification: "{transcript}"

Generate:
1. Rephrased goal title (concise, motivating)
2. Rephrased why (1-2 sentences, emotional hook)
3. 2-4 milestones (quantifiable targets with progression)
4. 3-5 binds (consistent actions with frequency progression per milestone)

Format: JSON response matching schema above
```

---

## Testing Strategy

### Backend Tests

**Unit Tests:**
- `test_create_goal_with_milestones_and_progression` - Create goal with full data
- `test_update_milestone_progress_advances_phase` - Verify auto-advancement
- `test_weekly_bind_instance_generation` - Verify Sunday reset logic
- `test_bind_completion_triggers_milestone_prompt` - Check prompt flag

**Integration Tests:**
- `test_complete_needle_creation_flow` - End-to-end creation
- `test_milestone_advancement_updates_bind_frequencies` - Phase transition
- `test_weekly_reset_clears_completed_count` - Sunday reset

### Frontend Tests

**Component Tests:**
- `CreateNeedleCard1.test.tsx` - Input validation, AI overlay trigger
- `CreateNeedleCard2.test.tsx` - Edit/save behavior, Accept Needle
- `ProgressionTimeline.test.tsx` - Visual rendering of milestone phases
- `MilestoneProgressPrompt.test.tsx` - Update/skip behavior

**E2E Tests:**
- `create-needle-flow.e2e.tsx` - Full creation flow (mock AI)
- `complete-bind-with-milestone-update.e2e.tsx` - Bind → prompt → advancement
- `weekly-bind-tracking.e2e.tsx` - Verify 5x/week shows daily until complete

---

## Rollout Plan

### Phase 1: Backend Foundation (Days 1-2)
1. Database migrations (milestones, progression_rules, weekly tracking)
2. Update `POST /api/goals` to accept new schema
3. Implement `POST /api/goals/{goal_id}/milestones/{milestone_id}/progress`
4. Enhance `GET /api/binds/today` with weekly tracking
5. Update `POST /api/binds/{bind_id}/complete` with milestone prompt flag
6. Write backend tests

### Phase 2: Frontend Creation Flow (Days 3-4)
1. Refactor `CreateNeedleScreen` to 2-card flow
2. Build `CreateNeedleCard1` with AI overlay integration
3. Build `CreateNeedleCard2` with progression timeline
4. Create new components: `MilestoneCard`, `ProgressionTimeline`, `BindCardWithProgression`
5. Integrate with backend APIs (use mock AI for now)

### Phase 3: Frontend Detail View (Day 5)
1. Update `NeedleDetailScreen` to match Card 2 layout
2. Add milestones section with edit capability
3. Add progression timeline visualization
4. Update memories section with optional milestone tagging
5. Test auto-save behavior

### Phase 4: Thread Integration (Day 6)
1. Update `ThreadHomeScreen` to show weekly progress
2. Update `BindScreen` with milestone progress prompt
3. Create `MilestoneProgressPrompt` modal component
4. Test bind completion → prompt → advancement flow

### Phase 5: Navigation Consolidation (Day 7)
1. Remove `/needles/*` routes
2. Update all route references to `/goals/*`
3. Verify all navigation works end-to-end
4. Update sitemap screen

### Phase 6: AI Integration (Day 8)
1. Implement `POST /api/ai/clarify-goal` endpoint
2. Implement `POST /api/ai/generate-goal-plan` endpoint
3. Replace mock AI calls with real API
4. Test full AI conversation flow

### Phase 7: Background Jobs (Day 9)
1. Implement `generate_bind_instances_for_week` cron job
2. Test weekly reset logic (Sunday midnight, timezone-aware)
3. Verify old instance cleanup

### Phase 8: Testing & Polish (Day 10)
1. Run all backend tests
2. Run all frontend tests
3. E2E testing of complete flow
4. Bug fixes and polish
5. Documentation updates

---

## Success Criteria

### Functional Requirements
- ✅ User can create needle with AI clarification (mandatory)
- ✅ User can edit generated plan before accepting
- ✅ Bind frequencies change based on milestone progression
- ✅ Binds show weekly progress (X/Y completed this week)
- ✅ Weekly counter resets Sunday midnight (timezone-aware)
- ✅ User prompted to update milestone after bind completion
- ✅ Milestone auto-advances when target reached
- ✅ Memories can be tagged to milestones (optional)
- ✅ All routes use `/goals/*` (UI says "Needles")

### Non-Functional Requirements
- ⚡ Card 1 → AI overlay opens in <500ms
- ⚡ Plan generation completes in <5 seconds
- ⚡ Needle detail screen loads in <1 second
- 🎨 Progression timeline is visually clear and intuitive
- 📱 All screens responsive on iOS/Android
- ♿ Accessibility labels on all interactive elements

---

## Risks & Mitigations

### Risk 1: AI Clarification Takes Too Long
**Mitigation:** Add "Skip AI" escape hatch (but discourage with warning)

### Risk 2: Weekly Reset Fails Across Timezones
**Mitigation:** Use user's timezone from profile, fallback to UTC

### Risk 3: Bind Instance Generation Overload
**Mitigation:** Process users in batches (1000 at a time), queue-based processing

### Risk 4: Progression Timeline UI Too Complex
**Mitigation:** Start with simple horizontal timeline, iterate based on feedback

### Risk 5: Milestone Auto-Advancement Bugs
**Mitigation:** Add manual override: "Go back to previous milestone" button

---

## Open Questions for SM Review

1. Should we add a "Skip AI Clarification" option for advanced users?
2. Is 10-day rollout realistic, or should we compress/extend?
3. Should we version the API (`/api/v2/goals`) or update in-place?
4. Do we need migration script for existing needles to new schema?
5. Should we A/B test AI clarification (some users skip, some mandatory)?

---

## References

- **Architecture Docs:** `docs/architecture/core-architectural-decisions.md`
- **Backend Patterns:** `docs/stories/1-5-2-backend-standardization.md`
- **AI Services Guide:** `docs/dev/ai-service-integration-guide.md`
- **Database Schema:** `docs/idea/backend.md` (lines 200-800)
- **Epic 2 PRD:** `docs/prd/epic-2-goal-management.md`
- **Epic 3 PRD:** `docs/prd/epic-3-daily-action-loop.md`

---

**Next Step:** SM Agent Validation → Backend Implementation → Frontend Implementation → Testing → Deploy
