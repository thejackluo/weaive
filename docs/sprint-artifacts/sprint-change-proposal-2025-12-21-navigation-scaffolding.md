# Sprint Change Proposal - Navigation Scaffolding Epic

**Date:** 2025-12-21
**Proposal ID:** SCP-2025-12-21-001
**Change Scope:** Minor (Direct implementation by development team)
**Submitted By:** Jack (via Correct Course workflow)

---

## 1. Issue Summary

### Problem Statement

The current story breakdown treats each screen as part of a feature story, but navigation structure should be established upfront as infrastructure, not discovered incrementally. As we move from Epic 1 (Onboarding) to Epic 2 (Goal Management) and beyond, each epic would need to make routing decisions without a comprehensive navigation architecture.

### Context: When/How Discovered

- **Trigger:** Planning Epic 2 implementation
- **Discovery:** Realized stories describe features but don't specify where they live in navigation hierarchy
- **Evidence:**
  - Current routing exists but is ad-hoc: `(auth)`, `(onboarding)`, `(tabs)`
  - Epic 2-8 stories will need to decide routing patterns independently
  - No single source of truth for app's screen structure

### Issue Category

- ✅ **Architectural gap discovered during implementation**
- Infrastructure need identified before building features on top

---

## 2. Impact Analysis

### Epic Impact

**Epic 1 (Onboarding):**
- ✅ Can be completed as planned
- Already has routing structure in `(onboarding)` group
- No changes required

**Epic 2 (Goal Management):**
- ⚠️ Currently unclear where goal screens should live in nav hierarchy
- Will benefit from predefined navigation structure
- Stories 2.1-2.6 can focus on business logic, not routing decisions

**Epic 3-8:**
- ⚠️ Same issue across all remaining epics
- Each would need to make navigation decisions ad-hoc
- **Solution:** Predefine complete navigation structure now

### Story Impact

**Current Stories:**
- No changes to existing Epic 0 or Epic 1 stories
- All completed work remains valid

**Future Stories (Epic 2-8):**
- Will reference predefined routes from Epic 1.5
- Can focus on screen content implementation
- Navigation patterns already established

### Artifact Conflicts

**PRD (docs/prd.md):**
- ✅ No conflicts - PRD describes features, not navigation implementation
- MVP scope unchanged

**Architecture (docs/architecture/):**
- ⚠️ **Missing:** Complete navigation architecture documentation
- Current doc covers state management, data access, offline strategy
- **Needs:** New section on navigation patterns, screen hierarchy, tab structure

**UX Design (docs/ux-design.md):**
- ⚠️ **Missing:** Information architecture and navigation flows
- Individual screen designs exist
- **Needs:** Navigation relationships between screens documented

**Epics (docs/epics.md):**
- **Needs:** New Epic 1.5 entry between Epic 1 and Epic 2

### Technical Impact

**Code:**
- New route definitions in `weave-mobile/app/` directory structure
- Tab navigator structure in `(tabs)/_layout.tsx`
- Modal route definitions

**Infrastructure:**
- No infrastructure changes required
- Expo Router already supports file-based routing

**Deployment:**
- No deployment changes required

---

## 3. Recommended Approach

### Selected Path: Direct Adjustment

**Add Epic 1.5: App Navigation Scaffolding**

**Why This Approach:**
- ✅ Low effort (1-2 stories, ~8-13 points)
- ✅ Low risk (additive change, doesn't break existing work)
- ✅ High value (enables cleaner implementation of Epic 2-8)
- ✅ Minimal timeline impact (1-2 days)
- ✅ Aligns with best practice (infrastructure before features)

### Effort Estimate

- **Story Points:** 8-13 points (1-2 stories)
- **Time:** 1-2 days
- **Complexity:** Low-Medium

### Risk Assessment

- **Risk Level:** Low
- **Risks Identified:**
  - Minimal - additive change only
  - No breaking changes to existing code
- **Mitigation:**
  - Keep scaffolding lightweight (routes + placeholders only)
  - Don't implement business logic in scaffolding story

### Timeline Impact

- **Sprint Impact:** Can be absorbed into current sprint if capacity available
- **Epic 2 Start Date:** Delayed by 1-2 days (acceptable)
- **MVP Date:** No impact - net neutral (prevents future routing refactors)

---

## 4. Detailed Change Proposals

### Change 1: Add Epic 1.5 to Epic List (docs/epics.md)

**Location:** docs/epics.md, after Epic 1 section

**OLD:**
```markdown
### Epic 1: Onboarding (Optimized Hybrid Flow) (51 pts)
[... Epic 1 content ...]

---

### Epic 2: Needle/Goal Management (27 pts)
```

**NEW:**
```markdown
### Epic 1: Onboarding (Optimized Hybrid Flow) (51 pts)
[... Epic 1 content ...]

---

### Epic 1.5: App Navigation Scaffolding (10 pts)
**User Outcome:** Development team has a complete navigation structure with all routes defined, enabling parallel feature development without routing conflicts.

**FRs Covered:** Supports all future epics (Epic 2-8)

**Why This Epic:** Navigation is infrastructure - like database schema in Epic 0, the routing structure should be defined upfront before building features on top of it.

**Stories:**

- **Story 1.5.1: Core Navigation Structure** (5 pts)
  - Define complete app route hierarchy in Expo Router
  - Create tab navigator structure: Home (Thread), Dashboard (Weave), Journal, Coach (AI Chat), Profile
  - Establish modal patterns for creating/editing content
  - Create placeholder screens for all Epic 2-8 routes
  - **AC:** All routes defined; navigation between major sections works; placeholder screens render
  - **DoD:** Navigation architecture documented; all routes accessible via tabs/stack navigation

- **Story 1.5.2: Navigation Architecture Documentation** (5 pts)
  - Document complete screen hierarchy and navigation flows
  - Create navigation architecture diagram
  - Document deep linking strategy for notifications
  - Define navigation patterns: tabs vs stacks vs modals
  - **AC:** Architecture doc updated; UX doc updated with information architecture
  - **DoD:** Navigation decisions documented for Epic 2-8 implementation

**Epic 1.5 Total: 10 points**

---

### Epic 2: Needle/Goal Management (27 pts)
```

**Rationale:** Adds Epic 1.5 between Epic 1 and Epic 2 as infrastructure layer

---

### Change 2: Add Navigation Section to Architecture (docs/architecture/core-architectural-decisions.md)

**Location:** docs/architecture/core-architectural-decisions.md, new section after "Offline Strategy"

**NEW SECTION:**
```markdown
## Navigation Architecture

**Navigation Framework:** Expo Router v5 (file-based routing)

### App Structure

```
app/
├── _layout.tsx                 # Root layout (providers)
├── index.tsx                   # Entry point (auth routing)
├── (auth)/                     # Auth flow (stack)
│   ├── login.tsx
│   ├── signup.tsx
│   ├── privacy-policy.tsx
│   └── terms-of-service.tsx
├── (onboarding)/              # Onboarding flow (stack)
│   ├── welcome.tsx
│   ├── emotional-state.tsx
│   ├── authentication.tsx
│   ├── identity-bootup.tsx
│   ├── identity-traits.tsx
│   ├── first-needle.tsx
│   └── weave-path-generation.tsx
└── (tabs)/                    # Main app (tab navigator)
    ├── _layout.tsx            # Tab navigation config
    ├── index.tsx              # Home/Thread (Daily Binds)
    ├── dashboard.tsx          # Weave Dashboard (Progress)
    ├── journal.tsx            # Daily Reflection
    ├── coach.tsx              # AI Chat (Dream Self Advisor)
    ├── profile.tsx            # Settings & Profile
    ├── goals/                 # Goal Management (stack)
    │   ├── index.tsx          # Goals List
    │   ├── [id].tsx           # Goal Detail
    │   ├── new.tsx            # Create Goal (modal)
    │   └── edit/[id].tsx      # Edit Goal (modal)
    ├── binds/                 # Bind Screens (stack)
    │   ├── [id].tsx           # Bind Detail/Completion
    │   └── proof/[id].tsx     # Attach Proof
    ├── captures/              # Capture Gallery (stack)
    │   ├── index.tsx          # Gallery View
    │   └── [id].tsx           # Capture Detail
    └── settings/              # Settings (stack)
        ├── index.tsx          # Settings Home
        ├── identity.tsx       # Edit Identity Document
        └── subscription.tsx   # Subscription Management
```

### Navigation Patterns

| Pattern | When to Use | Examples |
|---------|-------------|----------|
| **Stack** | Linear flows, hierarchical content | Goal Detail → Edit Goal, Bind → Attach Proof |
| **Tabs** | Top-level sections, frequent switching | Home, Dashboard, Journal, Coach, Profile |
| **Modal** | Creating new content, non-disruptive actions | Create Goal, Quick Capture, Edit settings |

### Tab Structure

**5 Primary Tabs:**

1. **Home** (`index.tsx`) - Thread view (Today's Binds + Triad)
2. **Dashboard** (`dashboard.tsx`) - Weave visualization (Progress + Stats)
3. **Journal** (`journal.tsx`) - Daily Reflection entry + history
4. **Coach** (`coach.tsx`) - AI Chat interface
5. **Profile** (`profile.tsx`) - Settings, Identity, Subscription

### Deep Linking Strategy

**Notification → Screen routing:**

```typescript
// Morning Intention → Home (Today's Binds)
weave://home

// Bind Reminder → Specific Bind
weave://binds/[bind-id]

// Evening Reflection → Journal
weave://journal

// Streak Recovery → Home with AI Chat preloaded
weave://home?openChat=true

// Milestone Celebration → Dashboard
weave://dashboard?highlightBadge=[badge-id]
```

### Route Guards

**Auth Check:**
```typescript
// app/index.tsx
if (!isAuthenticated) {
  return <Redirect href="/(auth)/login" />;
}
if (!onboardingComplete) {
  return <Redirect href="/(onboarding)/welcome" />;
}
return <Redirect href="/(tabs)" />;
```

**Implementation:** Epic 1.5 establishes this structure; Epic 2-8 populate screens
```

**Rationale:** Documents complete navigation architecture for Epic 2-8 implementation

---

### Change 3: Add Information Architecture to UX Design (docs/ux-design.md)

**Location:** docs/ux-design.md, new section after "Design Principles"

**NEW SECTION:**
```markdown
## Information Architecture

### Screen Hierarchy

```
App Root
├── Auth Flow
│   ├── Login
│   ├── Signup
│   ├── Privacy Policy
│   └── Terms of Service
├── Onboarding Flow
│   ├── Welcome & Vision Hook
│   ├── Emotional State Selection
│   ├── Symptom Insight
│   ├── Weave Solution
│   ├── Authentication
│   ├── Name Entry & Personality
│   ├── Identity Traits
│   ├── Commitment Ritual
│   ├── First Needle Creation
│   ├── First Reflection
│   ├── Dashboard Introduction
│   └── Trial Framing & Handoff
└── Main App (Tabs)
    ├── Home (Thread)
    │   ├── Today's Binds
    │   ├── Triad Display
    │   └── Bind Detail → Completion → Proof
    ├── Dashboard (Weave)
    │   ├── Progress Overview
    │   ├── Consistency Heat Map
    │   ├── Fulfillment Chart
    │   ├── Streak Tracking
    │   └── Badge Gallery
    ├── Journal
    │   ├── Daily Reflection Entry
    │   ├── Recap Summary
    │   ├── AI Feedback
    │   └── Journal History
    ├── Coach (AI Chat)
    │   ├── Chat Interface
    │   ├── Quick Action Chips
    │   └── Weekly Insights
    └── Profile
        ├── Profile Overview
        ├── Goals Management
        │   ├── Goals List
        │   ├── Goal Detail
        │   ├── Create Goal
        │   └── Edit Goal
        ├── Settings
        │   ├── General Settings
        │   ├── Identity Document
        │   ├── Notification Preferences
        │   └── Subscription Management
        └── Help & Support
```

### Navigation Flows

**Primary User Flows:**

1. **Daily Completion Flow:**
   - Home → View Today's Binds → Tap Bind → Complete → Add Proof → Back to Home

2. **Reflection Flow:**
   - Journal Tab → Today's Recap → Reflection Questions → AI Feedback → View Triad

3. **Goal Management Flow:**
   - Profile → Goals → Goal Detail → Edit/Archive

4. **AI Coaching Flow:**
   - Coach Tab → Chat Interface → Ask Question → Receive Guidance

5. **Progress Review Flow:**
   - Dashboard → View Stats → Tap Heat Map → See Day Detail → Back to Dashboard

### Navigation Transitions

- **Tab Switching:** Instant (no animation)
- **Stack Push:** Slide from right (iOS standard)
- **Modal Present:** Slide from bottom
- **Stack Pop:** Slide to right
- **Modal Dismiss:** Slide to bottom

**Implementation:** Epic 1.5 defines this structure
```

**Rationale:** Documents information architecture to complement screen designs

---

### Change 4: Update Epic Dependency Map (docs/epics.md)

**Location:** docs/epics.md, "Epic Dependency Flow" section

**OLD:**
```
                    Epic 0 (Foundation)
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
     Epic 1 (Onboarding)   │          Epic 8 (Settings)
          │                │
          ▼                │
     Epic 2 (Goals) ◄──────┘
```

**NEW:**
```
                    Epic 0 (Foundation)
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
     Epic 1 (Onboarding)   │          Epic 8 (Settings)
          │                │
          ▼                │
     Epic 1.5 (Navigation Scaffolding)
          │                │
          ▼                │
     Epic 2 (Goals) ◄──────┘
```

**Rationale:** Shows Epic 1.5 as infrastructure dependency for Epic 2+

---

### Change 5: Update Epic Summary Table (docs/epics.md)

**Location:** docs/epics.md, "Epic Summary Table" section

**OLD:**
```markdown
| Epic | Name | Story Points | Priority FRs (M) | Dependencies | Phase |
|------|------|--------------|------------------|--------------|-------|
| 0 | Foundation | 40 | 7 | None (True Foundation) | `[MVP]` |
| 1 | Onboarding & Identity | 52 | 8 | Epic 0 | `[MVP]` (core) + `[v1.2]` (full) |
| 2 | Needle/Goal Management | 27 | 5 | Epic 0, 1 | `[v1.2]` |
```

**NEW:**
```markdown
| Epic | Name | Story Points | Priority FRs (M) | Dependencies | Phase |
|------|------|--------------|------------------|--------------|-------|
| 0 | Foundation | 40 | 7 | None (True Foundation) | `[MVP]` |
| 1 | Onboarding & Identity | 52 | 8 | Epic 0 | `[MVP]` (core) + `[v1.2]` (full) |
| 1.5 | App Navigation Scaffolding | 10 | Infrastructure | Epic 0, 1 | `[MVP]` |
| 2 | Needle/Goal Management | 27 | 5 | Epic 0, 1, 1.5 | `[v1.2]` |
```

**Rationale:** Adds Epic 1.5 to summary; updates Epic 2 dependencies

---

### Change 6: Create Epic 1.5 PRD File (NEW)

**Location:** docs/prd/epic-1.5-app-navigation-scaffolding.md (NEW FILE)

**Content:** See detailed PRD in Appendix A below

**Rationale:** Provides complete epic specification for implementation

---

## 5. Implementation Handoff

### Change Scope Classification

**Classification:** Minor

**Rationale:**
- Additive change only (no breaking changes)
- Can be implemented by development team directly
- Low risk, straightforward implementation
- 1-2 story effort (~10 points)

### Handoff Recipients

**Primary:** Development Team (Jack)

**Responsibilities:**
- Implement Story 1.5.1: Core Navigation Structure
- Implement Story 1.5.2: Navigation Architecture Documentation
- Update architecture and UX design documents
- Create placeholder screens for Epic 2-8 routes

### Implementation Tasks

1. ✅ **Review this proposal** - Confirm approach and acceptance criteria
2. 🔨 **Implement Story 1.5.1** - Create navigation structure and placeholders
3. 📝 **Implement Story 1.5.2** - Document navigation architecture
4. ✅ **Update epics.md** - Add Epic 1.5 entry and update dependencies
5. ✅ **Update architecture docs** - Add navigation section
6. ✅ **Update UX docs** - Add information architecture section
7. ✅ **Test navigation flow** - Verify all routes accessible
8. ✅ **Code review** - Review navigation structure before Epic 2 starts

### Success Criteria

**Navigation Structure:**
- ✅ All Epic 2-8 routes defined (placeholder screens)
- ✅ Tab navigation works (5 tabs accessible)
- ✅ Deep linking foundation established
- ✅ No console warnings for route conflicts

**Documentation:**
- ✅ Navigation architecture section added to architecture docs
- ✅ Information architecture section added to UX docs
- ✅ Screen hierarchy diagram created
- ✅ Navigation patterns documented

**Epic Integration:**
- ✅ Epic 1.5 added to epics.md
- ✅ Dependency map updated
- ✅ Epic 2 stories can reference predefined routes

### Timeline

- **Story 1.5.1:** 1 day (5 points)
- **Story 1.5.2:** 0.5-1 day (5 points)
- **Total:** 1.5-2 days

---

## 6. Approval

### Proposal Review

**Review Status:** ⏳ Pending user approval

**Questions for User:**
1. Does this approach align with your vision?
2. Should Epic 1.5 be added to current sprint or next sprint?
3. Any additional navigation requirements not captured?

### Approval Decision

**Approved:** ☐ Yes  ☐ No  ☐ Needs revision

**Approval Date:** _________________

**Approved By:** _________________

**Notes:**

---

## Appendix A: Epic 1.5 PRD (Complete Specification)

### Epic 1.5: App Navigation Scaffolding

#### Overview

**Goal:** Establish complete app navigation architecture with all routes defined upfront, enabling parallel feature development without routing conflicts.

**Rationale:** Navigation structure is infrastructure (like database schema in Epic 0). Defining routing patterns and screen hierarchy before feature implementation prevents technical debt and enables cleaner Epic 2-8 implementation.

---

#### Story 1.5.1: Core Navigation Structure

**Priority:** M (Must Have)

**As a** developer
**I want to** have all app routes defined with placeholder screens
**So that** I can implement feature screens without making navigation decisions

**Acceptance Criteria:**

**Route Definitions:**
- [ ] Create `(tabs)/_layout.tsx` with 5 tab configuration:
  - Tab 1: Home (Thread) - icon: home, label: "Home"
  - Tab 2: Dashboard (Weave) - icon: chart, label: "Dashboard"
  - Tab 3: Journal - icon: book, label: "Journal"
  - Tab 4: Coach - icon: chat, label: "Coach"
  - Tab 5: Profile - icon: user, label: "Profile"
- [ ] Tab bar uses design system colors and icons
- [ ] Active tab indicator matches brand color (#3B72F6)

**Home Tab Routes:**
- [ ] Create `(tabs)/index.tsx` - Thread Home (Today's Binds)
- [ ] Create `(tabs)/binds/[id].tsx` - Bind Detail/Completion screen
- [ ] Create `(tabs)/binds/proof/[id].tsx` - Attach Proof screen

**Dashboard Tab Routes:**
- [ ] Create `(tabs)/dashboard.tsx` - Weave Dashboard overview
- [ ] Create `(tabs)/dashboard/heatmap.tsx` - Consistency Heat Map
- [ ] Create `(tabs)/dashboard/streaks.tsx` - Streak Detail

**Journal Tab Routes:**
- [ ] Create `(tabs)/journal.tsx` - Daily Reflection entry
- [ ] Create `(tabs)/journal/history.tsx` - Journal History list
- [ ] Create `(tabs)/journal/[date].tsx` - Past Journal Entry view

**Coach Tab Routes:**
- [ ] Create `(tabs)/coach.tsx` - AI Chat interface
- [ ] Create `(tabs)/coach/insights.tsx` - Weekly Insights view

**Profile Tab Routes:**
- [ ] Create `(tabs)/profile.tsx` - Profile overview
- [ ] Create `(tabs)/profile/goals/index.tsx` - Goals List (Epic 2)
- [ ] Create `(tabs)/profile/goals/[id].tsx` - Goal Detail
- [ ] Create `(tabs)/profile/goals/new.tsx` - Create Goal (modal)
- [ ] Create `(tabs)/profile/goals/edit/[id].tsx` - Edit Goal (modal)
- [ ] Create `(tabs)/profile/settings/index.tsx` - Settings home
- [ ] Create `(tabs)/profile/settings/identity.tsx` - Edit Identity Document
- [ ] Create `(tabs)/profile/settings/subscription.tsx` - Subscription Management

**Placeholder Screen Requirements:**
- [ ] Each placeholder screen displays:
  - Screen title (centered)
  - "Coming Soon" text
  - Epic reference (e.g., "Epic 2: Goal Management")
  - Story reference (e.g., "Story 2.1: View Goals List")
- [ ] Back navigation works correctly
- [ ] Modal screens have close/dismiss button
- [ ] Design system components used (Card, Text)

**Navigation Behavior:**
- [ ] Tab switching is instant (no animation lag)
- [ ] Stack navigation uses iOS slide transition
- [ ] Modal presentation slides from bottom
- [ ] Deep links resolve to correct screen (tested with test URLs)
- [ ] No navigation warnings in console

**Technical Requirements:**
- [ ] Use Expo Router file-based routing
- [ ] Tab icons from `@expo/vector-icons` or design system
- [ ] Tab bar hidden on modal screens
- [ ] Auth guard redirects to `(auth)/login` if not authenticated
- [ ] Onboarding guard redirects to `(onboarding)/welcome` if incomplete

**Data Requirements:**
- No data operations in placeholder screens
- Navigation state managed by Expo Router

**DoD:**
- All 20+ placeholder screens created and accessible
- Tab navigation works smoothly
- Stack navigation works for all nested routes
- Modal presentation/dismissal works correctly
- No console warnings or errors
- Screenshot of tab bar + all 5 tabs attached to PR

**Story Points:** 5

---

#### Story 1.5.2: Navigation Architecture Documentation

**Priority:** M (Must Have)

**As a** developer implementing Epic 2-8 stories
**I want to** have navigation architecture documented
**So that** I know where to place screens and what patterns to follow

**Acceptance Criteria:**

**Architecture Documentation:**
- [ ] Add "Navigation Architecture" section to `docs/architecture/core-architectural-decisions.md`
- [ ] Document complete route hierarchy (see Change Proposal #2 above)
- [ ] Document 3 navigation patterns: Stack, Tabs, Modals
- [ ] Document when to use each pattern
- [ ] Provide tab structure specification
- [ ] Document deep linking strategy with URL examples
- [ ] Document route guard patterns (auth, onboarding)
- [ ] Include code examples for navigation usage

**UX Documentation:**
- [ ] Add "Information Architecture" section to `docs/ux-design.md`
- [ ] Document screen hierarchy with tree diagram
- [ ] Document 5 primary user flows:
  - Daily Completion Flow
  - Reflection Flow
  - Goal Management Flow
  - AI Coaching Flow
  - Progress Review Flow
- [ ] Document navigation transitions (animation types)

**Visual Documentation:**
- [ ] Create navigation architecture diagram (Excalidraw or similar)
- [ ] Show screen relationships and navigation flows
- [ ] Highlight tab structure vs stack navigation
- [ ] Show modal presentation points

**Epic Integration:**
- [ ] Update `docs/epics.md` with Epic 1.5 entry
- [ ] Update epic dependency diagram
- [ ] Update epic summary table
- [ ] Add Epic 1.5 to story blocking dependencies

**Implementation Guide:**
- [ ] Document how future stories should reference routes
- [ ] Provide example: "Implement screen at `(tabs)/profile/goals/index.tsx`"
- [ ] Document navigation API usage patterns
- [ ] Document how to handle deep links in stories

**DoD:**
- Architecture doc updated with navigation section
- UX doc updated with information architecture
- Navigation diagram created and saved
- epics.md updated with Epic 1.5
- PR includes documentation screenshots
- At least 1 Epic 2 story references new navigation docs (validation)

**Story Points:** 5

---

## Appendix B: Route Naming Conventions

**File-based routing patterns:**

- `index.tsx` - Default route for directory (e.g., `profile/index.tsx` → `/profile`)
- `[id].tsx` - Dynamic route parameter (e.g., `goals/[id].tsx` → `/goals/123`)
- `[...slug].tsx` - Catch-all route (e.g., `docs/[...slug].tsx` → `/docs/a/b/c`)
- `(group)/` - Route group (not in URL, just organization)
- `_layout.tsx` - Layout wrapper for child routes

**Examples:**
```
(tabs)/profile/goals/[id].tsx        → /profile/goals/123
(tabs)/journal/[date].tsx            → /journal/2025-12-21
(tabs)/binds/[id].tsx                → /binds/bind-uuid
(tabs)/profile/settings/index.tsx   → /profile/settings
```

---

## Summary

This proposal adds **Epic 1.5: App Navigation Scaffolding** (10 points) between Epic 1 (Onboarding) and Epic 2 (Goal Management) to establish complete navigation architecture upfront before feature implementation.

**Key Benefits:**
- ✅ Prevents navigation technical debt
- ✅ Enables parallel feature development
- ✅ Single source of truth for app structure
- ✅ Aligns with architectural best practice (infrastructure first)

**Impact:**
- Minimal (1-2 day timeline addition)
- Low risk (additive change only)
- High value (cleaner Epic 2-8 implementation)

**Next Steps:**
1. User reviews and approves proposal
2. Development team implements Story 1.5.1 and 1.5.2
3. Epic 2 implementation begins with clear navigation structure in place

---

**End of Sprint Change Proposal**
