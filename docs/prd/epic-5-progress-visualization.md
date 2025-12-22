# Epic 5: Progress Visualization

## Overview

Users view their progress through the Weave Dashboard, including consistency metrics, fulfillment trends, and identity progression.

## User Stories

### US-5.1: Weave Dashboard Overview

**Priority:** M (Must Have)

**As a** user
**I want to** see my overall progress at a glance
**So that** I understand how I'm doing

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

**Data Requirements:**
- Read from `user_stats` for overall metrics
- Read from `daily_aggregates` for heat map
- Read from `goals` for active needles
- Read from `identity_docs` for dream self
- Read from `ai_artifacts` (type: 'insight') for AI insights

**Technical Notes:**
- All data pre-computed by workers
- Dashboard is read-only (no mutations)

---

### US-5.2: Consistency Heat Map

**Priority:** M (Must Have)

**As a** user
**I want to** see my consistency as a visual heat map
**So that** I can spot patterns in my behavior

**Acceptance Criteria:**
- [ ] GitHub-style contribution graph
- [ ] Color intensity = completion percentage (not binary)
- [ ] Filter by timeframe: 7 days, 30 days, 60 days, 90 days
- [ ] Filter by: Overall, specific needle, specific bind type
- [ ] Tap date → Navigate to that day's entry overview
- [ ] Moving averages smooth volatility (not weekly resets)

**Data Requirements:**
- Read from `daily_aggregates` for each date
- Compute percentage: `binds_completed / binds_scheduled`

**Technical Notes:**
- Heat map computed on read from aggregates
- No real-time recalculation

---

### US-5.3: Fulfillment Trend Chart

**Priority:** M (Must Have)

**As a** user
**I want to** see my fulfillment over time
**So that** I can track my emotional progress

**Acceptance Criteria:**
- [ ] Line chart showing fulfillment score (1-10) over time
- [ ] Filter by timeframe: 7 days, 30 days, 60 days, 90 days
- [ ] Show 7-day rolling average (smoothed line)
- [ ] Tap point → Navigate to that day's entry
- [ ] Show "overall average" indicator

**Data Requirements:**
- Read from `journal_entries.fulfillment_score`
- Compute rolling average from `daily_aggregates`

---

### US-5.4: Weave Character Progression

**Priority:** S (Should Have)

**As a** user
**I want to** see a visual representation of my growth
**So that** I feel my progress is tangible

**Acceptance Criteria:**
- [ ] **Mathematical curve visualization** that increases in complexity and intricacy as user progresses
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

**Data Requirements:**
- Read from `user_stats.total_binds_completed`
- Read from `user_stats.current_streak`
- Compute rank from thresholds

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

---

### US-5.5: Streak Tracking

**Priority:** M (Must Have)

**As a** user
**I want to** see my current and longest streak
**So that** I'm motivated to maintain consistency

**Acceptance Criteria:**
- [ ] Display current active streak (days)
- [ ] Display longest streak ever
- [ ] Define "streak day" = Active Day with Proof
- [ ] Show "streak resilience" metric (recovery rate after misses)
- [ ] Streak freeze: 3 consecutive days recovers 1 missed day

**Data Requirements:**
- Read from `user_stats.current_streak`
- Read from `user_stats.longest_streak`
- Compute from `daily_aggregates.is_active_day`

**Technical Notes:**
- Streak calculated by worker on completion events
- Streak resilience = (streaks recovered / streaks broken)

---


## Epic 5 Summary

| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| US-5.1 | Dashboard Overview | M | 5 pts |
| US-5.2 | Consistency Heat Map | M | 5 pts |
| US-5.3 | Fulfillment Trend Chart | M | 5 pts |
| US-5.4 | Weave Character Progression | S | 8 pts |
| US-5.5 | Streak Tracking | M | 3 pts |

**Epic Total:** 26 story points

**Changes from Original:**
- Removed US-5.6 (Badge System)
- Removed US-5.7 (Day 10 Snapshot)
- Note: US-5.4 level progress bar is referenced in US-3.3 completion flow

---
