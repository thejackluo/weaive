# Implementation Strategy

**Document Type:** Implementation Guide
**Status:** ✅ Active
**Last Updated:** 2025-12-21

---

## Overview

This document defines the **page-based implementation strategy** for Weave, replacing the traditional epic-by-epic sequential approach with a more intuitive, cohesive model organized around user-facing screens.

### TL;DR

**Old Approach:** Implement Epic 1 → Epic 2 → Epic 3... (no clear cohesion)
**New Approach:** Implement complete pages (Thread, Dashboard, Weave AI, Profile) that group related epics into vertical slices

**Navigation Model:** Bottom tab navigation (3 main tabs) + profile/settings

---

## Why Page-Based Implementation?

### Problems with Epic-by-Epic Sequential Implementation

❌ **No Clear Cohesion**
- Features scattered across multiple screens
- Hard to understand "what am I building?"
- No intuitive grouping of related functionality

❌ **Incomplete Deliverables**
- Implementing Epic 2 alone doesn't give users a complete experience
- Features are half-built across different screens
- Hard to test user flows

❌ **Poor Wireframe Alignment**
- Wireframes naturally align with pages, not epics
- Requires mental mapping: "This wireframe covers parts of Epic 2, 3, and 5"
- Increases cognitive load for developers

❌ **Sequential Bottleneck**
- Teams must wait for previous epic to complete
- Limited parallelization opportunities
- Slows down overall development

### Benefits of Page-Based Implementation

✅ **Complete Vertical Slices**
- Each page is a fully functional unit
- Clear "done" state: page completion criteria met
- Users can interact with complete features

✅ **Natural Cohesion**
- Features grouped by user intent and screen
- Intuitive answer to "what am I building?"
- Related functionality stays together

✅ **Wireframe-Friendly**
- Wireframes map directly to pages
- Designer intent is preserved
- Easier collaboration between design and engineering

✅ **Parallel Development**
- Multiple teams can work on different pages simultaneously
- Reduces dependencies between teams
- Faster overall delivery

✅ **Testable Units**
- Each page has clear acceptance criteria
- User flows can be tested end-to-end
- QA can verify complete experiences

---

## Page Architecture

### Navigation Structure

```
Bottom Tab Navigation (3 tabs)
├── Thread Page (Primary Tab)
│   ├── Epic 3: Daily Actions & Proof
│   └── Epic 4: Daily Reflection
│
├── Dashboard Page
│   ├── Epic 2: Goal Management
│   └── Epic 5: Progress Visualization
│
└── Weave AI Page
    └── Epic 6: AI Coaching

Profile & Settings (Accessible from Thread/Dashboard)
├── Epic 7: Notifications
└── Epic 8: Settings & Profile
```

---

## Page Definitions

### 1. Thread Page

**Navigation:** Bottom Tab (Primary)
**User Question:** "What should I do today?"
**Epics:** Epic 3 + 4

**Purpose:**
- View today's binds (habits/actions)
- Complete binds with proof (photo, video, timer)
- Submit daily reflection (fulfillment + journal)

**Key Features:**
- Binds list (grouped by needle)
- Completion flow (with confetti, affirmation, level progress)
- Timer tracking (Pomodoro-feel)
- Daily reflection card

**Completion Criteria:**
1. Users can view today's binds grouped by needle
2. Users can complete binds with proof (timer, photo, video)
3. Completion flow includes confetti, affirmation, level progress
4. Users can submit daily reflection (fulfillment + journal)
5. Empty states handled gracefully
6. Profile icon navigates to settings

**Detailed Documentation:** [`docs/pages/thread-page.md`](pages/thread-page.md)

---

### 2. Dashboard Page

**Navigation:** Bottom Tab
**User Question:** "How am I doing?" + "What am I working toward?"
**Epics:** Epic 2 + 5

**Purpose:**
- Manage needles (goals) - add, view, edit, archive
- Visualize progress - heat map, trends, streaks
- Track Weave character evolution

**Key Features:**
- Active needles list (max 3)
- Add/edit/archive goal flows (AI-assisted)
- Consistency heat map (GitHub-style)
- Fulfillment trend chart (7-day rolling average)
- Weave character progression (mathematical curves)
- Streak counter (current + longest)

**Completion Criteria:**
1. Users can view all active needles (max 3)
2. Users can add new goals with AI assistance
3. Users can edit or archive existing goals
4. Consistency heat map displays with date drill-down
5. Fulfillment trend chart shows 7-day rolling average
6. Weave character progression visualizes level
7. Streak counter displays current and longest streak
8. Profile icon navigates to settings

**Detailed Documentation:** [`docs/pages/dashboard-page.md`](pages/dashboard-page.md)

---

### 3. Weave AI Page

**Navigation:** Bottom Tab OR Floating Menu
**User Question:** "I need coaching/guidance/help"
**Epics:** Epic 6

**Purpose:**
- AI coaching chat interface
- Contextual guidance based on user data
- Weekly insights and pattern analysis

**Key Features:**
- Chat interface with streaming responses
- Quick action chips ("Plan my day", "I'm stuck")
- Contextual AI responses (references user's actual data)
- Edit/regenerate AI responses
- Weekly insights (pre-generated)

**Completion Criteria:**
1. Users can access AI chat from bottom tab or floating menu
2. Chat interface displays message bubbles with streaming responses
3. Quick action chips provide contextual prompts
4. AI responses reference user's actual data (goals, progress, identity)
5. Users can edit or regenerate AI responses
6. Rate limiting (10 messages/hour) enforced
7. Dream Self voice is consistent and personalized

**Detailed Documentation:** [`docs/pages/weave-ai-page.md`](pages/weave-ai-page.md)

---

### 4. Profile & Settings

**Navigation:** Profile Icon (from Thread or Dashboard)
**User Question:** "Control my experience and account"
**Epics:** Epic 7 + 8

**Purpose:**
- Manage notifications (preferences, timing)
- Control account settings (data export, delete account)
- View/upgrade subscription
- Access help and support

**Key Features:**
- Profile overview (name, email, photo)
- Notification preferences (toggles, timing)
- App settings (data export, delete account)
- Subscription management (view plan, upgrade)
- Help and support (FAQ, contact)
- Logout (secure)

**Completion Criteria:**
1. Users can access profile overview from Thread or Dashboard
2. Users can manage notification preferences (toggles, timing)
3. Users can export data and delete account
4. Users can view and upgrade subscription plans
5. Users can access help resources and contact support
6. Users can logout securely
7. All notifications respect user preferences and quiet hours

**Detailed Documentation:** [`docs/pages/profile-settings.md`](pages/profile-settings.md)

---

## Wireframe-Guided Development

### Process Flow

```
1. User provides wireframe (Figma screenshot or export)
   ↓
2. User explains navigation and interactions
   "This screen shows X, when user taps Y, navigate to Z"
   ↓
3. Claude references page document for functional requirements
   ↓
4. Claude implements using:
   - Wireframe → UX/layout/visual design
   - Page document → Acceptance criteria/business logic
   - Architecture docs → Patterns/consistency
   ↓
5. Build → Test → Iterate
   Complete vertical slice end-to-end
```

### What Matters from Wireframes

✅ **Visual Layout**
- Component hierarchy (header, cards, lists, buttons)
- Screen organization (sections, spacing, grouping)
- Information architecture (what goes where)

✅ **Navigation Patterns**
- Tab navigation structure
- Modal vs. full-screen navigation
- Drawer/menu interactions
- Deep linking from notifications

✅ **Primary User Interactions**
- Tap targets (buttons, cards, list items)
- Swipe gestures (dismiss, navigate)
- Form inputs (text, toggles, pickers)
- Pull-to-refresh, scroll behaviors

✅ **Visual Design**
- Color usage (primary, secondary, accent)
- Typography (display, body, label)
- Iconography (consistent style)
- Spacing and padding

### What Matters from Page Documents

✅ **Functional Requirements**
- Acceptance criteria for each story
- Business logic and validation rules
- Edge cases and error handling
- Success/failure states

✅ **Data Model**
- Database tables and relationships
- API endpoints and contracts
- Response formats (success/error)
- Data validation rules

✅ **Business Logic**
- Max 3 active goals enforcement
- Completion tracking (immutable event logs)
- Streak calculation logic
- AI caching and rate limiting

✅ **Technical Patterns**
- State management approach (TanStack Query, Zustand, useState)
- RLS patterns for data access
- Three-layer data model (static, dynamic, storage)
- API response format standard

### What Claude Maintains

✅ **Architecture Consistency**
- Three-layer data model (static text, dynamic text, image storage)
- RLS patterns (auth.uid() → user_profiles.id lookup)
- API response format (data/error/meta structure)
- Immutable event logs (subtask_completions, captures, journal_entries)

✅ **Design System Usage**
- Reuse existing components (Button, Card, Text, etc.)
- Follow design tokens (colors, spacing, typography)
- Consistent patterns (naming, file structure)

✅ **Code Quality**
- Naming conventions (snake_case DB, camelCase TS)
- Type safety (TypeScript, Zod validation)
- Error handling (try-catch, fallbacks)
- Performance (lazy loading, caching, optimistic updates)

---

## Development Order

While pages can be developed **in parallel**, here's a suggested order if working sequentially:

### Option A: Dashboard-First (Recommended)

**1. Dashboard Page** (Epic 2 + 5)
- Establishes goal creation flow (foundational)
- Progress visualizations provide motivation
- Users can see their Weave character

**2. Thread Page** (Epic 3 + 4)
- Daily action loop (core engagement)
- Completion flow with proof capture
- Daily reflection habit

**3. Weave AI Page** (Epic 6)
- Coaching on top of existing data
- Requires user to have goals and completions
- Enhances existing features

**4. Profile & Settings** (Epic 7 + 8)
- Polish and settings
- Notification configuration
- Account management

### Option B: Thread-First (Alternative)

**1. Thread Page** (Epic 3 + 4)
- Core engagement loop first
- Immediate user value
- Requires dummy goals initially

**2. Dashboard Page** (Epic 2 + 5)
- Replace dummy goals with real goal management
- Add progress visualizations
- Complete the data loop

**3. Weave AI Page** (Epic 6)
- Coaching and guidance
- Weekly insights

**4. Profile & Settings** (Epic 7 + 8)
- Polish and settings

### Option C: Parallel Development (Maximum Speed)

**Team 1:** Dashboard Page (Epic 2 + 5)
**Team 2:** Thread Page (Epic 3 + 4)
**Team 3:** Weave AI Page (Epic 6)
**Team 4:** Profile & Settings (Epic 7 + 8)

**Coordination Required:**
- Shared design system (components, tokens)
- API contracts defined upfront
- Database schema finalized (already done in Epic 0)
- Regular sync meetings (daily standups)

**Note:** This order is NOT prescriptive. Choose based on team capacity, priorities, and user feedback.

---

## Implementation Checklist

### Before Starting a Page

- [ ] Read the page document (`docs/pages/[page-name].md`)
- [ ] Review wireframes (Figma screenshots or exports)
- [ ] Check related epic files for detailed story requirements
- [ ] Verify database schema is ready (migrations applied)
- [ ] Confirm API endpoints are defined (or plan to create them)
- [ ] Review design system components available

### During Implementation

- [ ] Follow wireframe for layout and visual design
- [ ] Check acceptance criteria for each story
- [ ] Use design system components (never hardcode styles)
- [ ] Follow naming conventions (snake_case DB, camelCase TS)
- [ ] Implement error handling and loading states
- [ ] Add optimistic updates for better UX
- [ ] Test on iOS simulator (primary target)

### After Completing a Page

- [ ] Verify all page completion criteria are met
- [ ] Run tests (mobile linting, backend pytest if applicable)
- [ ] Test user flows end-to-end
- [ ] Check for empty states and error states
- [ ] Review with wireframe to ensure visual consistency
- [ ] Document any deviations or open questions
- [ ] Update sprint artifacts if significant decisions were made

---

## Key Principles

### 1. Complete Vertical Slices

Each page should be **fully functional** before moving to the next. Don't leave half-built features.

**Good:**
- Dashboard page with all 5 stories complete (US-2.1 through US-2.5, US-5.1 through US-5.5)
- User can add goals, view progress, and navigate back to Thread

**Bad:**
- Dashboard page with only US-2.1 (view goals) complete
- User can see goals but can't add or edit them
- "Coming soon" placeholders everywhere

### 2. Wireframe Alignment

The implemented page should **match the wireframe** for layout and interactions.

**Good:**
- Needle cards match wireframe design
- Add Goal FAB positioned as shown
- Heat map uses GitHub-style visualization

**Bad:**
- Completely different layout from wireframe
- Missing visual elements (FAB, profile icon)
- Different navigation pattern than designed

### 3. Story Acceptance Criteria

All acceptance criteria for stories on the page must be met.

**Good:**
- US-3.3 includes confetti animation, affirmation, and level progress
- Timer has Pomodoro-feel with 15/25/45/60 min presets
- Completion flow is <30 seconds

**Bad:**
- No confetti animation (skipped because "hard")
- Timer has generic countdown (no presets)
- Completion flow takes 2 minutes (too many steps)

### 4. Architecture Consistency

Follow established patterns for data access, state management, and API responses.

**Good:**
- Use TanStack Query for server data (goals, completions)
- Follow API response format (data/error/meta)
- RLS patterns (auth.uid() → user_profiles.id lookup)

**Bad:**
- Use Zustand for server data (should be TanStack Query)
- Custom API response format (breaks consistency)
- Direct auth.uid() comparison (RLS pattern violation)

---

## Common Pitfalls

### 1. Scope Creep

**Problem:** Adding features beyond the page document

**Example:**
- Page doc specifies max 3 active goals
- Developer adds "goal templates" feature (not in requirements)
- Increases complexity without user validation

**Solution:** Stick to the page document. If you see a gap, ask the user first.

### 2. Over-Engineering

**Problem:** Adding unnecessary abstraction or complexity

**Example:**
- Creating a "goal service layer" with 10 methods for simple CRUD
- Adding caching layer for data that's already cached by TanStack Query
- Building a configuration system for hardcoded values

**Solution:** Keep it simple. Only abstract when you see duplication or clear benefit.

### 3. Wireframe Deviation

**Problem:** Implementing a different design than the wireframe

**Example:**
- Wireframe shows card-based list, developer uses plain list
- Wireframe shows FAB, developer uses inline button
- Wireframe shows 3-column layout, developer uses 2-column

**Solution:** Match the wireframe. If you think the wireframe is wrong, ask the user.

### 4. Incomplete Acceptance Criteria

**Problem:** Skipping acceptance criteria because they seem optional

**Example:**
- US-3.3 specifies confetti animation, developer skips it
- US-5.4 specifies mathematical curves, developer uses static image
- US-7.2 specifies 3-level escalation, developer sends same message 3 times

**Solution:** All acceptance criteria are mandatory unless explicitly marked "S (Should Have)" or "N (Nice to Have)".

---

## Documentation Reference

### Page Documents

All detailed page documents are in `docs/pages/`:
- [`thread-page.md`](pages/thread-page.md) - Epic 3 + 4
- [`dashboard-page.md`](pages/dashboard-page.md) - Epic 2 + 5
- [`weave-ai-page.md`](pages/weave-ai-page.md) - Epic 6
- [`profile-settings.md`](pages/profile-settings.md) - Epic 7 + 8

### Epic Documents

All epic-level requirements are in `docs/prd/`:
- [`epic-2-goal-management.md`](prd/epic-2-goal-management.md)
- [`epic-3-daily-actions-proof.md`](prd/epic-3-daily-actions-proof.md)
- [`epic-5-progress-visualization.md`](prd/epic-5-progress-visualization.md)
- [`epic-6-ai-coaching.md`](prd/epic-6-ai-coaching.md)
- [`epic-7-notifications.md`](prd/epic-7-notifications.md)
- [`epic-8-settings-profile.md`](prd/epic-8-settings-profile.md)

### Architecture Documents

Architecture docs are in `docs/architecture/`:
- [`core-architectural-decisions.md`](architecture/core-architectural-decisions.md)
- [`implementation-patterns-consistency-rules.md`](architecture/implementation-patterns-consistency-rules.md)
- [`index.md`](architecture/index.md) - Table of contents

### Other Key Documents

- **Data Model:** `docs/idea/backend.md` (lines 200-800)
- **Design System:** `docs/dev/design-system-guide.md`
- **Git Workflow:** `docs/dev/git-workflow-guide.md`
- **CLAUDE.md:** Root-level guide for Claude Code

---

## Summary

**Old Way:**
- Epic 1 → Epic 2 → Epic 3... (sequential, no cohesion)

**New Way:**
- Thread Page (Epic 3 + 4) → Dashboard Page (Epic 2 + 5) → Weave AI Page (Epic 6) → Profile & Settings (Epic 7 + 8)
- OR develop pages in parallel for maximum speed

**Key Benefits:**
1. ✅ Complete vertical slices (fully functional pages)
2. ✅ Natural cohesion (features grouped by user intent)
3. ✅ Wireframe-friendly (direct mapping)
4. ✅ Parallel development (reduce dependencies)
5. ✅ Testable units (clear acceptance criteria)

**Next Steps:**
1. Review wireframes with user
2. Choose development order (sequential or parallel)
3. Start implementing first page
4. Test and iterate
5. Move to next page

---

**Last Updated:** 2025-12-21
**Status:** ✅ Active implementation strategy
