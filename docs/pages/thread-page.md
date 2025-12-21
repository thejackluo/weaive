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

**Key UI Elements Expected:**
1. **Today's Date & Day Indicator** - Clear temporal context
2. **Binds List** - Grouped by needle (collapsible dropdowns)
3. **Bind Items** - Checkbox, title, estimated time, optional proof indicator
4. **Daily Reflection Card** - Evening prompt or completed status
5. **Profile Icon** - Access to settings (top-right or menu)
6. **Empty State** - "Next smallest win" nudge if no active binds

**Interaction Patterns:**
- Swipe/scroll to view all binds
- Tap checkbox → Opens Bind Screen
- Tap needle header → Expand/collapse group
- Tap reflection card → Opens Reflection Screen

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
