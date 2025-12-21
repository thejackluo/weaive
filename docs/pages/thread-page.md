# Thread Page

**Navigation:** Bottom Tab (Main)
**Purpose:** Daily action loop - view and complete today's binds, submit daily reflection
**Epics Covered:** Epic 3 (Daily Actions & Proof), Epic 4 (Daily Reflection)

---

## Page Overview

The **Thread Page** is where users engage with their daily action loop. This is the most frequently accessed screen in the app, designed to answer the question: **"What should I do today?"**

### User Value Proposition
- See today's binds at a glance (grouped by needle/goal)
- Complete binds with integrated proof capture (photo, video, timer)
- Experience magical completion moments (confetti, affirmations, level progress)
- Submit daily reflection and set tomorrow's intention

### Navigation Pattern
- **Entry:** Bottom tab navigation (primary tab)
- **From Thread:**
  - Tap bind → Bind Screen (completion flow)
  - Profile icon → Profile Settings
  - Daily reflection prompt → Reflection Screen

---

## Wireframe Requirements

### Thread Home Screen Layout

**Header (Top):**
- **Left:** Streak counter + Weave logo (e.g., "2 🔥")
- **Center:** Time-based greeting with user's name (e.g., "good evening, eddie.")
- **Right:** Profile button (circular avatar)

**Calendar Widget:**
- Week view (Su-Sa format)
- Current day highlighted with white pill shape
- Shows dates for entire week (e.g., 23, 24, 25, 26, 27, 28, 29)
- Non-interactive (display only, no date selection)

**AI Insight Card:**
- Weave icon + daily contextual message
- Example: "finish up the figma wireframes for the app. you said you were gonna do it so don't embarrass yourself :)"
- **Interactive:** Card is clickable/tappable
- Visual indicator: Subtle styling (shadow, border, or subtle animation) to show it's tappable
- **Action:** Opens Weave AI modal with this insight as first message context

**Your Needles Section:**
- Header: "Your Needles"
- Display up to 3 needle cards
- **Each needle card shows:**
  - Color-coded vertical bar (left edge: blue, green, red for visual distinction)
  - Needle title (e.g., "Get Ripped")
  - "Why" motivation in smaller text (e.g., "Why: to auafarm mfs")
  - Completion status (right side: "0/2 Completed")
  - Dropdown chevron arrow (down when collapsed, up when expanded)

**Needle Dropdown Behavior (CRITICAL):**
- **Default state:** All needles visible, all collapsed
- **When user taps needle to expand:**
  - Selected needle expands to reveal binds
  - **Other needles hide completely** (only expanded needle visible on screen)
  - Chevron changes from down to up arrow
  - Binds appear below needle card
- **When user taps to collapse:**
  - Binds hide
  - Other needles reappear
  - Chevron returns to down arrow

**Bind Items (When Needle Expanded):**
- Circular checkbox (left)
  - **Uncompleted:** Empty circle, full color text
  - **Completed:** Checkmark in circle, grayed out or different visual treatment
- Bind title (e.g., "Workout")
- Subtitle with frequency context (e.g., "5x Per Week. Today's one of them.")
- **Tap anywhere on bind card** → Opens Bind Screen (US-3.3 flow)

**Your Thread Section:**
- Header: "Your Thread"
- Daily Check-In card:
  - Red dot indicator (top-left corner)
  - Timer display: "23:59 left to complete"
  - "Daily Check-In" title (center, large)
  - "Begin" button (white pill button, centered)
- **Timer behavior:**
  - Counts down to midnight (end of current day)
  - **Flexible window approach:** After midnight, shows "Yesterday's Check-In" prompt
  - Streak continues if completed within 24 hours of previous check-in
  - Uses US-5.5 streak resilience: 3 consecutive days recovers 1 missed day
  - Creates urgency without punishing users for missing by minutes
- **"Begin" button action** → Opens Daily Reflection flow (Epic 4)

**Bottom Navigation:**
- **Thread** (left icon, active state)
- **Weave AI** (center icon, Weave logo)
- **Track/Dashboard** (right icon, bar chart)

**Interaction Patterns:**
- Scroll to view all sections (header, calendar, AI insight, needles, check-in)
- Tap needle card → Expand/collapse with hide others behavior
- Tap bind → Opens Bind Screen
- Tap AI insight → Opens Weave AI modal
- Tap Daily Check-In "Begin" → Opens Reflection flow
- Tap profile icon → Opens Profile & Settings page

---

### Bind Screen (Start Bind) Layout

**Header:**
- Back button (left, circular)
- Bind title: "Workout" (center, large)
- Week completion calendar (below title)
  - Shows 7 days (M, T, W, T, F, S, S with dates)
  - Completed days: Checkmark inside circle
  - Uncompleted days: Empty dark circle

**AI Context Message Card:**
- Weave icon + motivational context
- Example: "Remember, you are doing this to get ripped so you can auafarm some mfs. Lock in."
- Links bind back to needle goal

**Choose Accountability Section:**
- Header: "Choose Accountability"
- Two large buttons side-by-side:
  - **Timer button** (left, primary white button with clock icon)
  - **Photo button** (right, dark button with camera icon)
- User can select one or both methods

**Weave Level Progress Section:**
- Weave character icon (left)
- Text: "Completing this bind will strengthen your weave!"
- Level indicator: "Level 2"
- Horizontal progress bar (partially filled based on current progress)

**Start Bind Button:**
- Large white pill button at bottom
- Text: "Start Bind"
- Primary call-to-action

**Bottom Navigation:** (same as Thread Home)

**Interaction Flow:**
1. User selects Timer and/or Photo for accountability
2. User taps "Start Bind" button
3. **If Timer selected:**
   - Opens Pomodoro-style timer with duration presets (15/25/45/60 min)
   - Focus mode UI (minimal distractions, clean visual)
   - Timer runs in background if user leaves app
   - Completion triggers confetti flow
4. **If Photo selected:**
   - Opens native camera
   - User captures photo/video as proof
   - Media uploaded to Supabase Storage
5. **After completion:**
   - **Magical confetti animation** (classy, celebratory)
   - **Affirmation:** "You're getting closer to [Needle Name]!"
   - **Level progress bar increases visually**
   - Prompt for optional description (280 char max, trust-based, skippable)
   - Return to Thread Home with bind marked complete
   - Total flow: <30 seconds from start to done

---

## Stories Implementing This Page

### Epic 3: Daily Actions & Proof

#### [US-3.1: View Today's Binds (Thread Home)](#)
**Priority:** M (Must Have) | **Estimate:** 5 pts

**Acceptance Criteria:**
- [ ] Thread (Home) shows today's binds grouped by needle (goal)
- [ ] Each needle is a collapsible dropdown
- [ ] Binds show: title, estimated time, completion status
- [ ] Incomplete binds show empty checkbox
- [ ] Completed binds show checkmark with optional proof indicator
- [ ] If no active binds, show "next smallest win" nudge
- [ ] Answer "What should I do today?" in <10 seconds

**Reference:** `docs/prd/epic-3-daily-actions-proof.md` (lines 9-35)

---

#### [US-3.3: Start and Complete Bind with Proof](#)
**Priority:** M (Must Have) | **Estimate:** 8 pts

**Acceptance Criteria:**
- **Bind Screen (Start):**
  - Tap Bind → Opens Bind Screen
  - Shows: Needle context, bind title/description, "Start Bind" button, estimated duration

- **Proof Capture (During/After):**
  - Timer/Stopwatch icon → Start focused timer (see US-3.4)
  - Camera icon → Open camera for photo/video capture
  - User can use timer AND camera together

- **Completion Flow:**
  - Mark Bind as complete
  - **Magical confetti animation** (classy, celebratory)
  - **Show Weave level progress bar increase** (visual feedback)
  - **Display affirmation:** "You're getting closer to [Goal Name]!"
  - Prompt for optional description (280 char max)
  - Skip option for description (trust-based)
  - Return to Thread with updated status
  - Total completion time: <30 seconds from open to done

**Reference:** `docs/prd/epic-3-daily-actions-proof.md` (lines 37-93)

---

#### [US-3.4: Timer Tracking (Integrated Proof)](#)
**Priority:** M (Must Have) | **Estimate:** 5 pts

**Acceptance Criteria:**
- **Pomodoro-feel timer experience:**
  - Set duration upfront (25 min default, customizable: 15/25/45/60 min)
  - Focus mode UI (minimal distractions, clean visual)
  - Subtle progress visualization (circle fill, progress bar)
  - Satisfying completion with sound/haptic feedback
- Accessible via Timer/Stopwatch icon on Bind Screen
- Running timer displays prominently
- Option to pause (with confirmation) or extend
- Timer duration auto-attached to completion as Proof
- Timer can be used alongside camera capture
- Timer works even when app is backgrounded

**Reference:** `docs/prd/epic-3-daily-actions-proof.md` (lines 95-123)

---

### Epic 4: Daily Reflection

**Note:** Epic 4 stories are not yet documented in separate epic file. These should cover:
- Evening reflection prompt (integrated with Epic 7 notifications)
- Fulfillment score (1-10 scale)
- Daily journal entry (what went well, what was hard, tomorrow's intention)
- AI-generated recap of the day (optional, respects user preferences)

**Placeholder for future story documentation:**
- US-4.1: Submit Daily Reflection
- US-4.2: View Past Journal Entries
- US-4.3: Edit Journal Entry

---

## Page Completion Criteria

This page is considered **complete** when:
1. ✅ Users can view today's binds grouped by needle
2. ✅ Users can complete binds with proof (timer, photo, video)
3. ✅ Completion flow includes confetti, affirmation, level progress
4. ✅ Users can submit daily reflection (fulfillment + journal)
5. ✅ Empty states handled gracefully
6. ✅ Profile icon navigates to settings

---

## Technical Implementation Notes

### Data Sources
- **Binds List:** `subtask_instances` (filtered by today's local_date)
- **Completion Status:** `subtask_completions`
- **Needle Context:** `goals` (active only)
- **Proof Data:** `captures` (type: timer, photo, video)
- **Daily Reflection:** `journal_entries`

### State Management
- **Server State (TanStack Query):** Binds, completions, goals
- **UI State (Zustand):** Expanded needle groups, selected bind
- **Local State (useState):** Form inputs, timer state

### Key Patterns
- **Immutable Event Log:** `subtask_completions` is append-only
- **Proof Storage:** Media uploaded to Supabase Storage, metadata in `captures`
- **Cache Invalidation:** Invalidate queries after completion
- **Optimistic Updates:** Update UI immediately, rollback on error

### Performance Considerations
- No AI calls on page load (read from pre-computed data)
- Lazy load bind details (only fetch when expanded)
- Image compression for photo uploads (max 10MB)
- Timer runs in background via local notifications

---

## Design System Components

**Expected Components:**
- `Card` (variant: "glass" for binds)
- `Text` (variants: displayLg, bodyMd, labelSm)
- `Button` (variants: primary, secondary, ghost)
- `Checkbox` (custom component for completion status)
- `ProgressBar` (for level progress)
- `ConfettiAnimation` (custom component for celebration)

**Tokens:**
- Colors: `brandPrimary`, `neutral.surface`, `success.default`
- Spacing: `spacing.md`, `spacing.lg`
- Typography: `fonts.body`, `fonts.display`

---

## Open Questions for Wireframe Review

When reviewing wireframes, clarify:
1. **Bind Grouping:** Are needles always expanded, or collapsible by default?
2. **Completion Indicator:** What visual style for completed binds (checkmark, color change, strikethrough)?
3. **Reflection Card Placement:** Top of page, bottom, or floating?
4. **Empty State:** Show "Add Goal" CTA, or nudge to complete setup?
5. **Timer UI:** Modal, full-screen, or inline within Bind Screen?
6. **Confetti Animation:** Subtle or bold? (Reference any examples)

---

## Related Documentation

- **Functional Requirements:** `docs/prd/epic-3-daily-actions-proof.md`
- **Data Model:** `docs/idea/backend.md` (lines 200-800 for schema)
- **API Patterns:** `docs/architecture/implementation-patterns-consistency-rules.md`
- **Design System:** `docs/dev/design-system-guide.md`

---

**Last Updated:** 2025-12-21
**Status:** ✅ Ready for wireframe mapping
