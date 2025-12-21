# Dashboard Page

**Navigation:** Bottom Tab
**Purpose:** Manage needles (goals) and visualize progress
**Epics Covered:** Epic 2 (Goal Management), Epic 5 (Progress Visualization)

---

## Page Overview

The **Dashboard Page** is where users manage their goals (needles) and visualize their progress. This page answers: **"How am I doing?"** and **"What am I working toward?"**

### User Value Proposition
- View all active needles (goals) at a glance
- Add, edit, or archive needles (max 3 active)
- See consistency metrics and fulfillment trends
- Visualize progress through Weave character evolution
- Track streaks and milestones

### Navigation Pattern
- **Entry:** Bottom tab navigation
- **From Dashboard:**
  - Tap needle card → Goal Details Screen
  - "Add Goal" button → Goal Creation Flow (AI-assisted)
  - Profile icon → Profile Settings
  - Tap heat map date → Day Detail View

---

## Wireframe Requirements

**Key UI Elements Expected:**

### Top Section: "Emotional Mirror"
1. **Weave Level Visualization** - Mathematical curve showing progression
2. **Active Needles Summary** - Card-based list (max 3)
3. **Dream Self Reminder** - Identity document reference

### Bottom Section: "Data Mirror"
4. **Consistency Heat Map** - GitHub-style contribution graph
5. **Fulfillment Trend Chart** - Line chart with rolling average
6. **Streak Counter** - Current streak, longest streak

### Actions
7. **Add Goal Button** - FAB or prominent CTA (disabled if 3 active goals)
8. **Profile Icon** - Access to settings

**Interaction Patterns:**
- Scroll to view all sections
- Tap needle card → View/edit goal details
- Tap "Add Goal" → AI-assisted creation flow
- Tap heat map date → Navigate to day's journal entry
- Pull to refresh → Update metrics

---

## Stories Implementing This Page

### Epic 2: Goal Management

#### [US-2.1: View Goals List](#)
**Priority:** M (Must Have) | **Estimate:** 3 pts

**Acceptance Criteria:**
- [ ] Display up to 3 active goals (needles) with status
- [ ] Show consistency % for each goal
- [ ] Show active binds count per goal
- [ ] Tap goal to expand/view details
- [ ] "Add Goal" button (disabled if 3 active goals)
- [ ] Access from Weave Dashboard → Needles Overview

**Reference:** `docs/prd/epic-2-goal-management.md` (lines 9-32)

---

#### [US-2.2: View Goal Details](#)
**Priority:** M (Must Have) | **Estimate:** 5 pts

**Acceptance Criteria:**
- [ ] Display goal title, description, created date
- [ ] Show "Why it matters" (user's motivation)
- [ ] List Q-goals with progress indicators
- [ ] List associated binds with completion stats
- [ ] Show consistency % (7-day, 30-day)
- [ ] Actions: Edit goal, Archive goal, Add bind

**Reference:** `docs/prd/epic-2-goal-management.md` (lines 35-55)

---

#### [US-2.3: Create New Goal (AI-Assisted)](#)
**Priority:** M (Must Have) | **Estimate:** 8 pts

**Acceptance Criteria:**
- [ ] Text input for new goal
- [ ] Probing question: "Why is this goal important to you?"
- [ ] AI generates Q-goals and suggested binds
- [ ] User can edit all AI suggestions
- [ ] Enforce max 3 active goals (show error if limit reached)
- [ ] Create goal and associated data on confirm

**AI Module:** Onboarding Coach (reused)

**Technical Notes:**
- Same AI module as onboarding
- Cache with input_hash (8 hour TTL)

**Reference:** `docs/prd/epic-2-goal-management.md` (lines 57-83)

---

#### [US-2.4: Edit Needle](#)
**Priority:** M (Must Have) | **Estimate:** 5 pts

**Acceptance Criteria:**
- [ ] Edit Needle title and description
- [ ] Edit "Why it matters"
- [ ] Add/remove/edit Binds (subtasks)
- [ ] Q-goals are internal only - not shown in user edit UI
- [ ] Confirm changes and save
- [ ] **Change Warning (Thoughtfully Balanced):**
  - Show impact summary: "This will affect your 12-day streak tracking"
  - Require brief justification text: "Why are you making this change?"
  - Visual friction: hold-to-confirm interaction
  - Respects user's strictness mode setting

**Reference:** `docs/prd/epic-2-goal-management.md` (lines 85-115)

---

#### [US-2.5: Archive Goal](#)
**Priority:** M (Must Have) | **Estimate:** 3 pts

**Acceptance Criteria:**
- [ ] Confirmation dialog: "Are you sure? You can reactivate later."
- [ ] Archive sets goal status to 'archived'
- [ ] Archived goals don't count toward 3-goal limit
- [ ] Archived goals visible in History (read-only)
- [ ] Option to reactivate if <3 active goals

**Reference:** `docs/prd/epic-2-goal-management.md` (lines 117-136)

---

### Epic 5: Progress Visualization

#### [US-5.1: Weave Dashboard Overview](#)
**Priority:** M (Must Have) | **Estimate:** 5 pts

**Acceptance Criteria:**
- [ ] Weave (Dashboard) tab accessible from main navigation
- [ ] Top: "Emotional Mirror"
  - Weave level/rank visualization
  - Active needles (goals) summary
  - Dream self reminder
- [ ] Bottom: "Data Mirror"
  - Consistency % with heat map
  - Average fulfillment chart
- [ ] AI insights displayed (from weekly analysis)
- [ ] No AI call on dashboard load (reads pre-computed data)

**Reference:** `docs/prd/epic-5-progress-visualization.md` (lines 9-40)

---

#### [US-5.2: Consistency Heat Map](#)
**Priority:** M (Must Have) | **Estimate:** 5 pts

**Acceptance Criteria:**
- [ ] GitHub-style contribution graph
- [ ] Color intensity = completion percentage (not binary)
- [ ] Filter by timeframe: 7 days, 30 days, 60 days, 90 days
- [ ] Filter by: Overall, specific needle, specific bind type
- [ ] Tap date → Navigate to that day's entry overview
- [ ] Moving averages smooth volatility (not weekly resets)

**Reference:** `docs/prd/epic-5-progress-visualization.md` (lines 42-66)

---

#### [US-5.3: Fulfillment Trend Chart](#)
**Priority:** M (Must Have) | **Estimate:** 5 pts

**Acceptance Criteria:**
- [ ] Line chart showing fulfillment score (1-10) over time
- [ ] Filter by timeframe: 7 days, 30 days, 60 days, 90 days
- [ ] Show 7-day rolling average (smoothed line)
- [ ] Tap point → Navigate to that day's entry
- [ ] Show "overall average" indicator

**Reference:** `docs/prd/epic-5-progress-visualization.md` (lines 68-87)

---

#### [US-5.4: Weave Character Progression](#)
**Priority:** S (Should Have) | **Estimate:** 8 pts

**Acceptance Criteria:**
- [ ] **Mathematical curve visualization** that increases in complexity as user progresses
  - Starts simple (single thread line)
  - Becomes more intertwined and beautiful over time (weave pattern)
  - Visual complexity directly tied to progress metrics
- [ ] Character visualization evolves based on:
  - Total Binds completed
  - Current streak
  - Consistency percentage
- [ ] Milestone-based progression (not daily changes - feels earned)
- [ ] Levels/ranks: Thread → Strand → Cord → Braid → Weave
- [ ] Each level has distinctly more complex mathematical curve pattern
- [ ] Show current level and progress to next
- [ ] Animation when leveling up (special moment)

**Rank Thresholds:**
| Rank | Binds Required | Consistency Req | Visual Complexity |
|------|---------------|-----------------|-------------------|
| Thread | 0 | - | Single line |
| Strand | 20 | 30% | 2-3 intertwined lines |
| Cord | 50 | 50% | 4-5 intertwined lines |
| Braid | 100 | 65% | Complex weave pattern |
| Weave | 200 | 80% | Intricate, beautiful weave |

**Technical Notes:**
- Mathematical curves can be generated using parametric equations
- Consider using SVG or Lottie animations for smooth rendering

**Reference:** `docs/prd/epic-5-progress-visualization.md` (lines 89-130)

---

#### [US-5.5: Streak Tracking](#)
**Priority:** M (Must Have) | **Estimate:** 3 pts

**Acceptance Criteria:**
- [ ] Display current active streak (days)
- [ ] Display longest streak ever
- [ ] Define "streak day" = Active Day with Proof
- [ ] Show "streak resilience" metric (recovery rate after misses)
- [ ] Streak freeze: 3 consecutive days recovers 1 missed day

**Reference:** `docs/prd/epic-5-progress-visualization.md` (lines 132-156)

---

## Page Completion Criteria

This page is considered **complete** when:
1. ✅ Users can view all active needles (max 3)
2. ✅ Users can add new goals with AI assistance
3. ✅ Users can edit or archive existing goals
4. ✅ Consistency heat map displays with date drill-down
5. ✅ Fulfillment trend chart shows 7-day rolling average
6. ✅ Weave character progression visualizes level
7. ✅ Streak counter displays current and longest streak
8. ✅ Profile icon navigates to settings

---

## Technical Implementation Notes

### Data Sources
- **Active Needles:** `goals` (status = 'active')
- **Goal Details:** `goals`, `qgoals`, `subtask_templates`
- **Completion Stats:** `subtask_completions`
- **Overall Metrics:** `user_stats`
- **Heat Map Data:** `daily_aggregates`
- **Fulfillment Data:** `journal_entries.fulfillment_score`
- **AI Insights:** `ai_artifacts` (type: 'insight')
- **Dream Self:** `identity_docs`

### State Management
- **Server State (TanStack Query):** Goals, stats, aggregates
- **UI State (Zustand):** Selected timeframe, expanded goal
- **Local State (useState):** Form inputs, filter selections

### Key Patterns
- **Max 3 Active Goals:** Enforced at UI and API level
- **AI-Assisted Creation:** Reuses Onboarding Coach module
- **Pre-Computed Metrics:** No AI calls on page load
- **Cache Invalidation:** Invalidate queries after goal creation/edit
- **Optimistic Updates:** Update UI immediately, rollback on error

### Performance Considerations
- Dashboard data is read-only (no mutations)
- Heat map computed on read from `daily_aggregates`
- AI insights pre-generated by weekly cron job
- Lazy load goal details (only fetch when expanded)

---

## Design System Components

**Expected Components:**
- `Card` (variants: "glass", "elevated")
- `Text` (variants: displayLg, displayMd, bodyMd, labelSm)
- `Button` (variants: primary, secondary, ghost)
- `ProgressBar` (for level progress)
- `LineChart` (for fulfillment trend)
- `HeatMap` (custom component for consistency visualization)
- `WeaveCharacter` (custom component for level visualization)

**Tokens:**
- Colors: `brandPrimary`, `neutral.surface`, `success.default`, `warning.default`
- Spacing: `spacing.md`, `spacing.lg`, `spacing.xl`
- Typography: `fonts.body`, `fonts.display`

---

## Open Questions for Wireframe Review

When reviewing wireframes, clarify:
1. **Needle Card Design:** Horizontal or vertical layout? Show binds count?
2. **Add Goal Button:** FAB (floating action button) or inline CTA?
3. **Heat Map Placement:** Above or below fulfillment chart?
4. **Weave Character:** Top of page or separate modal?
5. **Timeframe Filters:** Tabs, dropdown, or segmented control?
6. **Empty State:** If no goals, show onboarding nudge or direct "Add Goal" CTA?
7. **AI Insights:** Inline cards or dedicated section?

---

## Related Documentation

- **Functional Requirements:**
  - `docs/prd/epic-2-goal-management.md`
  - `docs/prd/epic-5-progress-visualization.md`
- **Data Model:** `docs/idea/backend.md` (lines 200-800 for schema)
- **API Patterns:** `docs/architecture/implementation-patterns-consistency-rules.md`
- **Design System:** `docs/dev/design-system-guide.md`
- **AI System:** `docs/idea/ai.md` (Onboarding Coach module)

---

**Last Updated:** 2025-12-21
**Status:** ✅ Ready for wireframe mapping
