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

### US-3.2: View Triad (AI Daily Plan)

**Priority:** M (Must Have)

**As a** user
**I want to** see AI-recommended top 3 Binds
**So that** I focus on what matters most

**Acceptance Criteria:**
- [ ] Display Triad at top of Thread (Home)
- [ ] **Note:** Triad IS the prioritized subset of Binds - same entity type, just AI-ranked
- [ ] Show yesterday's insight/intention summary (from AI)
- [ ] Triad Binds ranked: Easy win, Medium challenge, Important/difficult
- [ ] Each Bind shows rationale ("Why this bind")
- [ ] User can edit or dismiss Triad Binds

**AI Module:** Triad Planner

**Data Requirements:**
- Read from `triad_tasks` table (cached from last night)
- Read from `ai_artifacts` for insight

**Technical Notes:**
- Triad generated after journal submission (evening)
- No model call on Thread load (reads cache)
- Triad tasks reference existing `subtask_instances` - they are the same Binds, just highlighted

---

### US-3.3: Start and Complete Bind

**Priority:** M (Must Have)

**As a** user
**I want to** mark a Bind as started/completed
**So that** I track my progress toward my Needle (goal)

**Acceptance Criteria:**
- [ ] Tap Bind → Opens Bind Screen
- [ ] Bind Screen shows:
  - Needle context (why this matters)
  - Bind title and description
  - "Start Bind" primary button
  - Timer option (one tap start/stop)
  - Estimated duration
- [ ] Tap "Complete" → Mark Bind as done
- [ ] **Magical, delightful confetti animation** (classy, celebratory, makes user feel accomplished)
- [ ] Return to Thread with updated status
- [ ] Completion time: <30 seconds from open to done
- [ ] **Design Principle:** The entire experience should feel magical and delightful, not transactional

**Data Requirements:**
- Write to `subtask_completions` (immutable event log)
- Fields: `user_id`, `subtask_instance_id`, `completed_at`, `local_date`
- Trigger `event_log`: `subtask_completed`
- Update `daily_aggregates` (async worker)

**Technical Notes:**
- Completions are immutable (audit log)
- Stats recomputed from completions

---

### US-3.4: Attach Proof to Bind

**Priority:** M (Must Have)

**As a** user
**I want to** attach proof when completing a bind
**So that** I stay accountable and build evidence

**Acceptance Criteria:**
- [ ] After completing bind, prompt: "Add proof?" (optional)
- [ ] Proof options:
  - **Photo:** Camera capture or gallery upload
  - **Note:** Quick text (280 char max)
  - **Timer:** Auto-attached if timer was used
- [ ] Proof attached to completion
- [ ] Skip option (trust-based system)
- [ ] Attach proof in <10 seconds

**Data Requirements:**
- Write to `captures` table
- Write to `subtask_proofs` to link proof to completion
- Upload images to Supabase Storage

**Technical Notes:**
- Max image size: 10MB
- Allowed types: JPEG, PNG
- Proof is optional (trust-based)

---

### US-3.5: Quick Capture (Document)

**Priority:** M (Must Have)

**As a** user
**I want to** quickly capture memories and notes
**So that** I document my day beyond just binds

**Acceptance Criteria:**
- [ ] Access via floating menu → "Document"
- [ ] Fast capture sheet (not full notes app)
- [ ] Capture types:
  - **Photo:** One tap to camera
  - **Note:** Text input
  - **Voice:** Audio recording (MVP: optional, store as transcription)
- [ ] Optional: Link capture to specific bind
- [ ] If nothing captured yet today: "What's one thing you want to remember?"
- [ ] Capture time: <10 seconds

**Data Requirements:**
- Write to `captures` table
- Fields: `user_id`, `type`, `content`, `local_date`, `linked_subtask_id`
- Trigger `event_log`: `capture_created`
- Update `daily_aggregates.has_proof` = true

**Technical Notes:**
- Voice recording stored as audio file, transcription optional
- Captures contribute to "Active Day with Proof"

---

### US-3.6: Timer Tracking (Pomodoro-Style)

**Priority:** S (Should Have)

**As a** user
**I want to** track time spent on Binds with a focused timer experience
**So that** I have accurate records of my effort and stay in flow

**Acceptance Criteria:**
- [ ] **Pomodoro-feel timer experience:**
  - Set duration upfront (25 min default, customizable: 15/25/45/60 min options)
  - Focus mode UI (minimal distractions, clean visual)
  - Subtle but satisfying progress visualization (circle fill, progress bar)
  - Satisfying completion moment with sound/haptic feedback
- [ ] One-tap start timer from Bind Screen
- [ ] Running timer displays prominently
- [ ] Option to pause (with confirmation) or extend
- [ ] Timer duration auto-attached to completion as Proof
- [ ] Break reminder after completion (optional)

**Data Requirements:**
- Store timer data in `captures` (type: 'timer')
- Fields: `duration_seconds`, `started_at`, `ended_at`, `preset_duration`

**Technical Notes:**
- Timer should work even when app is backgrounded
- Local notifications for timer completion

---

### US-3.7: Dual Path Visualization

**Priority:** C (Could Have)

**As a** user
**I want to** see positive/negative trajectories
**So that** I'm motivated to stay on track when I'm feeling doubt

**Acceptance Criteria:**
- [ ] Triggered when user expresses difficulty or doubt (in chat/reflection)
- [ ] **Two components:**
  1. **Visual representation:** Animated paths diverging - one upward (growth), one downward (stagnation)
  2. **AI-generated personalized text:** From Tech Context Engine describing where each path leads based on user's specific Needles and patterns
- [ ] Example positive path: "In 30 days, you'll have completed 45 gym sessions and be 15% closer to your goal weight"
- [ ] Example negative path: "Without consistency, you'll be in the same place as last month"
- [ ] Dismissible but impactful

**AI Module:** Tech Context Engine (trajectory prediction)

**Data Requirements:**
- Read from user's completion history, Needle progress, fulfillment trends
- Generate personalized trajectory predictions

**Technical Notes:**
- Requires sentiment detection in chat/reflection to trigger
- AI generates text based on user's specific context, not generic

---

## Epic 3 Summary

| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| US-3.1 | View Today's Binds | M | 5 pts |
| US-3.2 | View Triad (AI-recommended) | M | 5 pts |
| US-3.3a | Bind Screen | M | 3 pts |
| US-3.3b | Bind Completion | M | 5 pts |
| US-3.4 | Attach Proof to Bind | M | 5 pts |
| US-3.5 | Quick Capture | M | 5 pts |
| US-3.6 | Timer Tracking | S | 5 pts |
| US-3.7 | Dual Path Visualization | C | 5 pts |

**Epic Total:** 38 story points

**Note:** US-3.2 increased to 5 pts to account for AI fallback chain complexity. US-3.3 split into 3.3a (Bind Screen) and 3.3b (Completion with confetti animation) for implementation clarity. US-3.7 revised down to 5 pts based on implementation assessment.

---
