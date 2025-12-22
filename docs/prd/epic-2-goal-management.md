# Epic 2: Goal Management

## Overview

Users can create, view, edit, and archive goals (needles), with AI assistance for goal breakdown. Maximum 3 active goals enforced.

## User Stories

### US-2.1: View Goals List

**Priority:** M (Must Have)

**As a** user
**I want to** see all my active goals
**So that** I can track what I'm working toward

**Acceptance Criteria:**
- [ ] Display up to 3 active goals (needles) with status
- [ ] Show consistency % for each goal
- [ ] Show active binds count per goal
- [ ] Tap goal to expand/view details
- [ ] "Add Goal" button (disabled if 3 active goals)
- [ ] Access from Weave Dashboard → Needles Overview

**Data Requirements:**
- Read from `goals` table (status = 'active')
- Read from `daily_aggregates` for consistency

**Technical Notes:**
- No AI call on this screen
- Enforce max 3 active goals at UI and API level

---

### US-2.2: View Goal Details

**Priority:** M (Must Have)

**As a** user
**I want to** see full details of a goal
**So that** I can understand my progress and adjust binds

**Acceptance Criteria:**
- [ ] Display goal title, description, created date
- [ ] Show "Why it matters" (user's motivation)
- [ ] List Q-goals with progress indicators
- [ ] List associated binds with completion stats
- [ ] Show consistency % (7-day, 30-day)
- [ ] Actions: Edit goal, Archive goal, Add bind

**Data Requirements:**
- Read from `goals`, `qgoals`, `subtask_templates`
- Read from `subtask_completions` for stats

---

### US-2.3: Create New Goal (AI-Assisted)

**Priority:** M (Must Have)

**As a** user
**I want to** add a new goal with AI assistance
**So that** I can expand what I'm working on

**Acceptance Criteria:**
- [ ] Text input for new goal
- [ ] Probing question: "Why is this goal important to you?"
- [ ] AI generates Q-goals and suggested binds
- [ ] User can edit all AI suggestions
- [ ] Enforce max 3 active goals (show error if limit reached)
- [ ] Create goal and associated data on confirm

**AI Module:** Onboarding Coach (reused)

**Data Requirements:**
- Write to `goals`, `qgoals`, `subtask_templates`
- Create `ai_runs` record

**Technical Notes:**
- Same AI module as onboarding
- Cache with input_hash (8 hour TTL)

---

### US-2.4: Edit Needle

**Priority:** M (Must Have)

**As a** user
**I want to** edit my Needle (goal) details
**So that** I can refine my approach as I learn

**Acceptance Criteria:**
- [ ] Edit Needle title and description
- [ ] Edit "Why it matters"
- [ ] Add/remove/edit Binds (subtasks)
- [ ] Q-goals are internal only - not shown in user edit UI
- [ ] Confirm changes and save
- [ ] **Change Warning (Thoughtfully Balanced):**
  - Not too easy to change (prevents impulsive pivots)
  - Not too hard (doesn't create friction for legitimate refinement)
  - Options based on strictness mode:
    - Show impact summary: "This will affect your 12-day streak tracking"
    - Require brief justification text: "Why are you making this change?"
    - Visual friction: hold-to-confirm interaction

**Data Requirements:**
- Update `goals`, `subtask_templates`
- Track edit history (version chain)
- Store change justification if required

**Technical Notes:**
- Editing a goal may invalidate cached AI outputs
- Change warning respects user's strictness mode setting (Normal/Strict/None)

---

### US-2.5: Archive Goal

**Priority:** M (Must Have)

**As a** user
**I want to** archive a goal I no longer want to pursue
**So that** I can focus on other priorities

**Acceptance Criteria:**
- [ ] Confirmation dialog: "Are you sure? You can reactivate later."
- [ ] Archive sets goal status to 'archived'
- [ ] Archived goals don't count toward 3-goal limit
- [ ] Archived goals visible in History (read-only)
- [ ] Option to reactivate if <3 active goals

**Data Requirements:**
- Update `goals.status` = 'archived'
- Update `goals.archived_at`

## Epic 2 Summary

| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| US-2.1 | View Goals List | M | 3 pts |
| US-2.2 | View Goal Details | M | 5 pts |
| US-2.3 | Create New Goal (AI) | M | 8 pts |
| US-2.4 | Edit Goal | M | 5 pts |
| US-2.5 | Archive Goal | M | 3 pts |

**Epic Total:** 24 story points

**Changes from Original:**
- Removed US-2.6 (Goal Change Strictness) - strictness mode integrated into US-2.4

---
