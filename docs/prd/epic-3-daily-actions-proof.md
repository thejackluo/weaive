# Epic 3: Daily Actions & Proof

## Overview

Users complete daily binds (habits/actions) and document proof. This is the core action loop that drives the North Star metric.

## User Stories

### US-3.1: View Today's Binds (Thread Home)

**Priority:** M (Must Have)

**As a** user
**I want to** see my tasks for today when I open the app
**So that** I know exactly what to do

**Acceptance Criteria:**
- [ ] Thread (Home) shows today's binds grouped by needle (goal)
- [ ] Each needle is a collapsible dropdown
- [ ] Binds show: title, estimated time, completion status
- [ ] Incomplete binds show empty checkbox
- [ ] Completed binds show checkmark with optional proof indicator
- [ ] If no active binds, show "next smallest win" nudge
- [ ] Answer "What should I do today?" in <10 seconds

**Data Requirements:**
- Read from `subtask_instances` for today (local_date)
- Read from `subtask_completions` for status
- Read from `goals` for needle context

**Technical Notes:**
- No AI call on this screen
- Use user's timezone for local_date

---

### US-3.3: Start and Complete Bind with Proof

**Priority:** M (Must Have)

**As a** user
**I want to** complete a Bind with integrated proof capture
**So that** I track progress and build evidence in one seamless flow

**Acceptance Criteria:**

**Bind Screen (Start):**
- [ ] Tap Bind → Opens Bind Screen
- [ ] Bind Screen shows:
  - Needle context (why this matters)
  - Bind title and description
  - "Start Bind" primary button
  - Estimated duration

**Proof Capture (During/After):**
- [ ] When user taps "Start Bind", show proof method options:
  - **Timer/Stopwatch icon:** Start focused timer (see US-3.4)
  - **Camera icon:** Open camera for photo/video capture
  - **Both:** User can use timer AND take photo/video
- [ ] User completes the bind using chosen method(s)
- [ ] Media (timer data, photos, videos) is automatically saved

**Completion Flow:**
- [ ] Mark Bind as complete
- [ ] **Magical, delightful confetti animation** (classy, celebratory, makes user feel accomplished)
- [ ] **Show Weave level progress bar increase** (visual feedback of growth - see US-5.4)
- [ ] **Display affirmation:** "You're getting closer to [Goal Name]!"
- [ ] **After celebration:** Prompt for optional description (280 char max)
- [ ] Skip option for description (trust-based)
- [ ] Return to Thread with updated status
- [ ] Total completion time: <30 seconds from open to done

**Data Requirements:**
- Write to `subtask_completions` (immutable event log)
  - Fields: `user_id`, `subtask_instance_id`, `completed_at`, `local_date`
- Write to `captures` table for proof
  - Types: 'timer', 'photo', 'video'
  - Fields: `user_id`, `type`, `content`, `local_date`, `linked_subtask_id`, `description`
- Upload media to Supabase Storage
- Trigger `event_log`: `subtask_completed`
- Update `daily_aggregates` (async worker)
- Update `user_stats` for level progress (see US-5.4)

**Technical Notes:**
- Completions are immutable (audit log)
- Max image size: 10MB
- Allowed types: JPEG, PNG, MP4 (video)
- Proof is optional but encouraged
- Level progress bar reflects same progression as US-5.4 Weave Character

**Design Principle:** The entire experience should feel magical and delightful, not transactional

---

### US-3.4: Timer Tracking (Integrated Proof)

**Priority:** M (Must Have)

**As a** user
**I want to** track time spent on Binds with a focused timer experience
**So that** I have accurate records of my effort and stay in flow

**Acceptance Criteria:**
- [ ] **Pomodoro-feel timer experience:**
  - Set duration upfront (25 min default, customizable: 15/25/45/60 min options)
  - Focus mode UI (minimal distractions, clean visual)
  - Subtle but satisfying progress visualization (circle fill, progress bar)
  - Satisfying completion moment with sound/haptic feedback
- [ ] Accessible via Timer/Stopwatch icon on Bind Screen (US-3.3)
- [ ] Running timer displays prominently
- [ ] Option to pause (with confirmation) or extend
- [ ] Timer duration auto-attached to completion as Proof
- [ ] Timer can be used alongside camera capture

**Data Requirements:**
- Store timer data in `captures` (type: 'timer')
- Fields: `duration_seconds`, `started_at`, `ended_at`, `preset_duration`, `linked_subtask_id`

**Technical Notes:**
- Timer should work even when app is backgrounded
- Local notifications for timer completion
- Timer data contributes to "Active Day with Proof"

## Epic 3 Summary

| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| US-3.1 | View Today's Binds | M | 5 pts |
| US-3.3 | Start and Complete Bind with Proof | M | 8 pts |
| US-3.4 | Timer Tracking (Integrated Proof) | M | 5 pts |

**Epic Total:** 18 story points

**Changes from Original:**
- Merged US-3.3, US-3.4, US-3.5, US-3.6 into integrated flow (US-3.3 + US-3.4)
- Removed US-3.2 (View Triad - AI-recommended)
- Removed US-3.5 (Quick Capture/Document)
- Removed US-3.7 (Dual Path Visualization)
- US-3.3 now 8 pts (includes proof capture, confetti, level progress, affirmation)
- US-3.4 promoted to M (Must Have) priority as integrated proof method

---
