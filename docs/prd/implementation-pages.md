# Implementation Pages

## Overview

This section provides a **page-based implementation strategy** that organizes epics by user-facing screens. Instead of implementing epic-by-epic sequentially, this approach groups related epics into complete, cohesive pages that can be built as vertical slices.

**Navigation Model:** Bottom tab navigation (3 main tabs) + profile/settings

### Why Page-Based Implementation?

**Traditional Epic-by-Epic Approach:**
- ❌ No clear cohesion that's intuitive to build
- ❌ Features scattered across multiple screens
- ❌ Hard to test complete user flows
- ❌ No clear "done" state for a deliverable

**Page-Based Approach:**
- ✅ **Complete vertical slices** - Each page is a fully functional unit
- ✅ **Natural cohesion** - Related features grouped by user intent
- ✅ **Testable deliverables** - Clear acceptance criteria for page completion
- ✅ **Parallel development** - Teams can work on different pages simultaneously
- ✅ **Intuitive for wireframe mapping** - Wireframes naturally align with pages

---

## Page-to-Epic Mapping

### Thread Page (Epic 3 + 4)

**Navigation:** Bottom Tab (Primary)
**User Goal:** "What should I do today?"

**Includes:**
- Epic 3: Daily Actions & Proof (view binds, complete binds, proof capture)
- Epic 4: Daily Reflection (fulfillment score, journal entry, tomorrow's intention)

**Detailed Documentation:** [`docs/pages/thread-page.md`](../pages/thread-page.md)

**Key Stories:**
- US-3.1: View Today's Binds
- US-3.3: Start and Complete Bind with Proof (confetti, affirmation, level progress)
- US-3.4: Timer Tracking (Integrated Proof)
- US-4.1: Submit Daily Reflection (pending story documentation)

---

### Dashboard Page (Epic 2 + 5)

**Navigation:** Bottom Tab
**User Goal:** "How am I doing?" + "What am I working toward?"

**Includes:**
- Epic 2: Goal Management (add, view, edit, archive needles)
- Epic 5: Progress Visualization (heat map, fulfillment trend, Weave character, streaks)

**Detailed Documentation:** [`docs/pages/dashboard-page.md`](../pages/dashboard-page.md)

**Key Stories:**
- US-2.1: View Goals List
- US-2.2: View Goal Details
- US-2.3: Create New Goal (AI-Assisted)
- US-2.4: Edit Needle
- US-2.5: Archive Goal
- US-5.1: Weave Dashboard Overview
- US-5.2: Consistency Heat Map
- US-5.3: Fulfillment Trend Chart
- US-5.4: Weave Character Progression
- US-5.5: Streak Tracking

---

### Weave AI Page (Epic 6)

**Navigation:** Bottom Tab OR Floating Menu
**User Goal:** "I need coaching/guidance/help"

**Includes:**
- Epic 6: AI Coaching (chat interface, contextual responses, weekly insights)

**Detailed Documentation:** [`docs/pages/weave-ai-page.md`](../pages/weave-ai-page.md)

**Key Stories:**
- US-6.1: Access AI Chat
- US-6.2: Contextual AI Responses
- US-6.3: Edit AI Chat Responses
- US-6.4: AI Weekly Insights

---

### Profile & Settings (Epic 7 + 8)

**Navigation:** Profile Icon (accessible from Thread or Dashboard)
**User Goal:** "Control my experience and account"

**Includes:**
- Epic 7: Notifications (preferences, scheduling, notification types)
- Epic 8: Settings & Profile (account management, subscription, logout)

**Detailed Documentation:** [`docs/pages/profile-settings.md`](../pages/profile-settings.md)

**Key Stories:**
- US-7.1: Morning Intention Notification
- US-7.2: Bind Reminder Notifications
- US-7.3: Evening Reflection Prompt
- US-7.4: Streak Recovery Notification
- US-7.6: Notification Preferences
- US-8.1: Profile Overview
- US-8.3: General Settings
- US-8.4: Subscription Management
- US-8.5: Help and Support
- US-8.6: Logout and Account Security

---

## Implementation Strategy

### Wireframe-Guided Development

**Process:**
1. **User provides wireframe** for a page (e.g., Thread, Dashboard, Weave AI)
2. **User explains navigation:** "This screen shows X, when user taps Y, navigate to Z"
3. **Reference the page document:** Use it to understand functional requirements
4. **Claude implements:** Using wireframe for UX/layout + page doc for acceptance criteria
5. **Build → Test → Iterate:** Complete vertical slices end-to-end

**What matters from wireframes:**
- ✅ Visual layout and component hierarchy
- ✅ Navigation patterns (tabs, modals, screens)
- ✅ Primary user interactions (taps, swipes, forms)
- ✅ Screen organization and information architecture

**What matters from page documents:**
- ✅ Functional requirements and acceptance criteria
- ✅ Data model and API contracts
- ✅ Business logic and validation rules
- ✅ Edge cases and error handling

**What Claude maintains:**
- ✅ Consistency with existing architecture (three-layer data model, RLS patterns, API format)
- ✅ Reuse of design system components and tokens
- ✅ Following established patterns (state management, naming conventions)
- ✅ Checking both wireframe AND story acceptance criteria

---

## Development Order (Optional)

While pages can be developed in **parallel**, here's a suggested order if working sequentially:

1. **Dashboard Page** (Epic 2 + 5)
   - Gives users something to see/manage
   - Establishes goal creation flow
   - Progress visualizations provide motivation

2. **Thread Page** (Epic 3 + 4)
   - The daily action loop
   - Completion flow with proof capture
   - Daily reflection habit

3. **Weave AI Page** (Epic 6)
   - Coaching on top of existing data
   - Requires user to have goals and completions

4. **Profile & Settings** (Epic 7 + 8)
   - Polish and settings
   - Notification configuration
   - Account management

**Note:** This order is NOT prescriptive. Choose based on team capacity and priorities.

---

## Page Documents Reference

All detailed page documents are located in `docs/pages/`:

- [`docs/pages/thread-page.md`](../pages/thread-page.md)
- [`docs/pages/dashboard-page.md`](../pages/dashboard-page.md)
- [`docs/pages/weave-ai-page.md`](../pages/weave-ai-page.md)
- [`docs/pages/profile-settings.md`](../pages/profile-settings.md)

Each page document includes:
- Page overview and user value proposition
- Wireframe requirements and UI elements
- All stories implementing the page (with links to epic docs)
- Page completion criteria
- Technical implementation notes
- Design system components
- Open questions for wireframe review

---

## Related Documentation

- **Epic Details:** See individual epic files in this directory (e.g., `epic-2-goal-management.md`)
- **Architecture:** `docs/architecture/` (patterns, decisions, consistency rules)
- **Data Model:** `docs/idea/backend.md` (database schema)
- **Design System:** `docs/dev/design-system-guide.md`
- **Implementation Strategy:** `docs/implementation-strategy.md` (comprehensive guide)

---

**Last Updated:** 2025-12-21
**Status:** ✅ Active implementation strategy
