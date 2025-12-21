# Sprint Change Proposal - Navigation Scaffolding Epic

**Date:** 2025-12-21
**Proposal ID:** SCP-2025-12-21-001
**Change Scope:** Minor (Direct implementation by development team)
**Submitted By:** Jack (via Correct Course workflow)
**Status:** ✅ **APPROVED** (with revisions)

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
- 3-tab navigator structure in `(tabs)/_layout.tsx`
- Stack screens for all other pages (not tabs)
- Auth guards for protected routes

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
- ✅ Low effort (1 unified story, 8-10 points)
- ✅ Low risk (additive change, doesn't break existing work)
- ✅ High value (enables cleaner implementation of Epic 2-8)
- ✅ Minimal timeline impact (1-2 days)
- ✅ Aligns with best practice (infrastructure before features)

### Effort Estimate

- **Story Points:** 8-10 points (1 unified story)
- **Time:** 1-2 days
- **Complexity:** Low-Medium

### Risk Assessment

- **Risk Level:** Low
- **Risks Identified:**
  - Minimal - additive change only
  - No breaking changes to existing code
- **Mitigation:**
  - Keep implementation simple (3 tabs + placeholder screens)
  - Focus on structure over polish for MVP

### Timeline Impact

- **Sprint Impact:** Can be absorbed into current sprint
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

### Epic 1.5: App Navigation Scaffolding (8-10 pts)

**User Outcome:** Development team has a complete navigation structure with all routes defined, enabling parallel feature development without routing conflicts.

**FRs Covered:** Supports all future epics (Epic 2-8)

**Why This Epic:** Navigation is infrastructure - like database schema in Epic 0, the routing structure should be defined upfront before building features on top of it.

**Design Philosophy:** Simple, clean 3-tab structure (Thread, AI Chat, Dashboard) with magical glassmorphism AI interface.

**Story:**

- **Story 1.5.1: Core Navigation Architecture** (8-10 pts)
  - Define 3-tab navigation: Thread (left), AI Chat (center with blur), Dashboard (right)
  - Create placeholder screens for all Epic 2-8 routes (stack screens, NOT tabs)
  - Implement center AI button with background blur effect
  - Establish auth guards (redirect to login if not authenticated)
  - Enable testing flow (can jump directly to main app)
  - Document navigation architecture and screen hierarchy
  - **AC:** 3 tabs work; AI Chat opens with blur; all placeholder screens accessible; auth guards functional
  - **DoD:** Navigation structure complete; documentation updated; can test full app flow

**Epic 1.5 Total: 8-10 points** (1 unified story)

**Deferred to Post-MVP:**
- Radial menu animation (fancy fan-out options around center button)
- Advanced AI Chat interactions
- Polish and refinements

---

### Epic 2: Needle/Goal Management (27 pts)
```

**Rationale:** Adds Epic 1.5 between Epic 1 and Epic 2 as infrastructure layer with simplified scope

---

### Change 2: Add Navigation Section to Architecture (docs/architecture/core-architectural-decisions.md)

**Location:** docs/architecture/core-architectural-decisions.md, new section after "Offline Strategy"

**NEW SECTION:**
```markdown
## Navigation Architecture

**Navigation Framework:** Expo Router v5 (file-based routing)

### Tab Structure (3 Tabs)

**Primary Navigation:**

```
┌─────────────────────────────────────────────┐
│                                             │
│  [Thread]       🤖        [Dashboard]      │
│    icon      CENTER          icon          │
│             AI CHAT                         │
│           (with blur)                       │
└─────────────────────────────────────────────┘
```

1. **Tab 1 (Left): Thread** - Today's Binds, Daily action hub
2. **Tab 2 (Center): AI Chat** - Special center button with glassmorphism blur effect
3. **Tab 3 (Right): Dashboard** - Weave progress visualization

**Design Note:** All other screens (Goals, Settings, Journal History, etc.) are accessed as **stack screens** from within these 3 tabs, NOT as separate tabs.

### Center AI Button Behavior

**Tap center button:**
- Background: Current screen blurs + dims (backdrop-filter blur)
- AI Chat: Glassmorphism floating card appears
- Interface: Similar to new Siri - translucent, frosted glass effect
- Dismiss: Tap outside or swipe down to close
- **Deferred (Post-MVP):** Radial menu with fan-out options

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
└── (tabs)/                    # Main app (3 tabs)
    ├── _layout.tsx            # Tab navigation config (3 tabs)
    ├── index.tsx              # Tab 1: Thread (Today's Binds)
    ├── ai-chat.tsx            # Tab 2: AI Chat (center with blur)
    ├── dashboard.tsx          # Tab 3: Dashboard (Progress)
    ├── goals/                 # Goals (stack screens, NOT tabs)
    │   ├── index.tsx          # Goals List
    │   ├── [id].tsx           # Goal Detail
    │   ├── new.tsx            # Create Goal (modal)
    │   └── edit/[id].tsx      # Edit Goal (modal)
    ├── binds/                 # Bind Screens (stack)
    │   ├── [id].tsx           # Bind Detail/Completion
    │   └── proof/[id].tsx     # Attach Proof
    ├── journal/               # Journal (stack)
    │   ├── index.tsx          # Daily Reflection Entry
    │   ├── history.tsx        # Journal History
    │   └── [date].tsx         # Past Entry View
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
| **Tabs (3)** | Top-level sections | Thread, AI Chat, Dashboard |
| **Stack** | Sub-navigation from tabs | Goals List → Goal Detail, Settings sections |
| **Modal** | Creating/editing content | Create Goal, Edit Goal, Quick Capture |

### Glassmorphism AI Chat Design

**Visual Properties:**
- Translucent background: `rgba(255, 255, 255, 0.1)` (dark mode)
- Backdrop filter: `blur(20px)`
- Border: `1px solid rgba(255, 255, 255, 0.2)`
- Border radius: `24px`
- Shadow: `0 8px 32px rgba(0, 0, 0, 0.3)`

**Chat Bubbles:**
- Each message is individual glass card
- User messages: Right-aligned, slight blue tint
- AI messages: Left-aligned, slight purple tint
- Smooth fade-in animation on new message

**Implementation Libraries:**
- `@react-native-community/blur` or `expo-blur` for backdrop blur
- `react-native-reanimated` for smooth animations
- Design system glassmorphism components

### Placeholder Screens

**All Epic 2-8 screens initially show:**
- Page title in black text (e.g., "Goals List")
- Placeholder message: "This page has not been developed"
- Clean, minimal design using design system components
- Back navigation functional

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

**Testing Flow:**
- Can bypass onboarding during development
- Direct access to main app with 3 tabs
- All placeholder screens navigable for testing

**Implementation:** Epic 1.5 establishes this structure; Epic 2-8 populate screens with real content
```

**Rationale:** Documents complete navigation architecture with simplified 3-tab structure and glassmorphism AI interface

---

### Change 3: Add Information Architecture to UX Design (docs/ux-design.md)

**Location:** docs/ux-design.md, new section after "Design Principles"

**NEW SECTION:**
```markdown
## Information Architecture

### Primary Navigation (3 Tabs)

**Philosophy:** Keep primary navigation simple and focused on the three core pillars of Weave:
1. **Action** (Thread - Today's Binds)
2. **Insight** (AI Chat - Your coach)
3. **Progress** (Dashboard - Your transformation)

All other functionality accessed as stack screens from within these tabs.

### Screen Hierarchy

```
App Root
├── Auth Flow (Stack)
│   ├── Login
│   ├── Signup
│   ├── Privacy Policy
│   └── Terms of Service
├── Onboarding Flow (Stack)
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
└── Main App (3 Tabs)
    ├── Tab 1: Thread (Home)
    │   ├── Today's Binds
    │   ├── Triad Display
    │   └── Bind Detail → Completion → Proof (Stack)
    ├── Tab 2: AI Chat (Center with Blur)
    │   ├── Chat Interface (Glassmorphism)
    │   ├── Quick Action Chips
    │   └── Weekly Insights
    └── Tab 3: Dashboard
        ├── Progress Overview
        ├── Consistency Heat Map
        ├── Fulfillment Chart
        ├── Streak Tracking
        └── Badge Gallery
```

**Accessed from Tabs (Stack Screens):**
```
├── Goals Management (from Profile/Settings)
│   ├── Goals List
│   ├── Goal Detail
│   ├── Create Goal (Modal)
│   └── Edit Goal (Modal)
├── Journal (from Thread or dedicated access)
│   ├── Daily Reflection Entry
│   ├── Recap Summary
│   ├── AI Feedback
│   └── Journal History
├── Captures (from Thread or Profile)
│   ├── Gallery View
│   └── Capture Detail
└── Settings (from Profile/Menu)
    ├── Profile Overview
    ├── Identity Document
    ├── General Settings
    ├── Notification Preferences
    └── Subscription Management
```

### Navigation Flows

**Primary User Flows:**

1. **Daily Completion Flow:**
   - Thread Tab → View Today's Binds → Tap Bind → Complete → Add Proof → Back to Thread

2. **AI Coaching Flow:**
   - Tap Center Button → AI Chat Opens (with blur) → Ask Question → Receive Guidance → Dismiss

3. **Reflection Flow:**
   - Journal (from Thread or menu) → Today's Recap → Reflection Questions → AI Feedback → View Triad

4. **Goal Management Flow:**
   - Settings/Profile → Goals → Goal Detail → Edit/Archive

5. **Progress Review Flow:**
   - Dashboard Tab → View Stats → Tap Heat Map → See Day Detail → Back to Dashboard

### Glassmorphism AI Chat Design

**Visual Language:**
- **Inspired by:** New Siri, iOS 18 design language, modern frosted glass aesthetics
- **Effect:** Background blurs, creating sense of depth and focus
- **Colors:** Translucent with subtle gradients, light borders
- **Animation:** Smooth slide-up on open, fade-out on dismiss

**User Experience:**
- **Non-disruptive:** Overlays current screen (doesn't navigate away)
- **Contextual:** User doesn't lose their place
- **Dismissible:** Tap outside or swipe down to close
- **Magical:** Feels futuristic and premium

### Navigation Transitions

- **Tab Switching:** Instant (no animation)
- **Stack Push:** Slide from right (iOS standard)
- **Modal Present:** Slide from bottom
- **AI Chat Open:** Fade-in background blur + slide-up chat card
- **AI Chat Dismiss:** Fade-out blur + slide-down chat card

**Implementation:** Epic 1.5 defines this structure
```

**Rationale:** Documents information architecture with focus on simple 3-tab structure and glassmorphism AI experience

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
| 1.5 | Navigation Scaffolding | 8-10 | Infrastructure | Epic 0, 1 | `[MVP]` |
| 2 | Needle/Goal Management | 27 | 5 | Epic 0, 1, 1.5 | `[v1.2]` |
```

**Rationale:** Adds Epic 1.5 to summary; updates Epic 2 dependencies

---

## 5. Implementation Handoff

### Change Scope Classification

**Classification:** Minor

**Rationale:**
- Additive change only (no breaking changes)
- Can be implemented by development team directly
- Low risk, straightforward implementation
- 1 unified story (~8-10 points)

### Handoff Recipients

**Primary:** Development Team (Jack)

**Responsibilities:**
- Implement Story 1.5.1: Core Navigation Architecture (unified story)
- Create 3-tab navigation structure
- Implement center AI button with blur effect
- Create placeholder screens for all Epic 2-8 routes
- Set up auth guards
- Update documentation (architecture + UX design)

### Implementation Tasks

1. ✅ **Review this proposal** - Confirm approach and acceptance criteria
2. 🔨 **Implement Story 1.5.1** - Create complete navigation structure
   - 3-tab layout (Thread, AI Chat center, Dashboard)
   - Center AI button with glassmorphism blur effect
   - Placeholder screens for all Epic 2-8 routes (stack screens)
   - Auth guards for protected routes
   - Testing flow (can jump to main app)
3. 📝 **Update Documentation**
   - Add navigation section to architecture docs
   - Add information architecture to UX docs
   - Update epics.md with Epic 1.5
4. ✅ **Test navigation flow** - Verify all routes accessible
5. ✅ **Code review** - Review navigation structure before Epic 2 starts

### Success Criteria

**Navigation Structure:**
- ✅ 3 tabs work: Thread, AI Chat (center), Dashboard
- ✅ Center AI button opens chat with background blur effect
- ✅ All Epic 2-8 routes defined as placeholder screens
- ✅ Auth guards redirect to login if not authenticated
- ✅ Can test full app navigation flow
- ✅ No console warnings for route conflicts

**Placeholder Screens:**
- ✅ Show page title (black text)
- ✅ Show "This page has not been developed" message
- ✅ Clean, minimal design using design system
- ✅ Back navigation works correctly

**Documentation:**
- ✅ Navigation architecture section added to architecture docs
- ✅ Information architecture section added to UX docs
- ✅ Screen hierarchy documented
- ✅ Glassmorphism AI chat design documented

**Epic Integration:**
- ✅ Epic 1.5 added to epics.md
- ✅ Dependency map updated
- ✅ Epic 2 stories can reference predefined routes

### Timeline

- **Story 1.5.1 (Unified):** 1-2 days (8-10 points)
- **Total:** 1-2 days

### Technical Requirements

**Dependencies:**
```bash
npm install @react-native-community/blur
# or
npm install expo-blur

npm install react-native-reanimated
```

**Files to Create/Modify:**
- `app/(tabs)/_layout.tsx` - 3-tab configuration
- `app/(tabs)/index.tsx` - Thread tab
- `app/(tabs)/ai-chat.tsx` - AI Chat tab (with blur)
- `app/(tabs)/dashboard.tsx` - Dashboard tab
- `app/(tabs)/goals/`, `binds/`, `journal/`, `captures/`, `settings/` - Placeholder screens
- `docs/architecture/core-architectural-decisions.md` - Add navigation section
- `docs/ux-design.md` - Add information architecture
- `docs/epics.md` - Add Epic 1.5

---

## 6. Approval

### Proposal Review

**Review Status:** ✅ **APPROVED** (with revisions)

**Revisions Made:**
1. ✅ Simplified to 3 tabs only (Thread, AI Chat center, Dashboard)
2. ✅ Combined 2 stories into 1 unified story (8-10 points)
3. ✅ Center button opens AI Chat with blur (no radial menu for MVP)
4. ✅ All other pages are stack screens, NOT tabs
5. ✅ Placeholder screens show "This page has not been developed"
6. ✅ Testing flow enabled to jump directly to app

**Deferred to Post-MVP:**
- ❌ Radial menu animation (fancy fan-out options)
- ❌ Advanced AI Chat polish and interactions

### Approval Decision

**Approved:** ✅ **YES**

**Approval Date:** 2025-12-21

**Approved By:** Jack

**Notes:**
- Keep it simple for MVP - 3 tabs, blur effect, placeholder screens
- Focus on structure over polish
- Radial menu can be added post-MVP when time allows

---

## Appendix A: Story 1.5.1 - Complete Specification

### Story 1.5.1: Core Navigation Architecture

**Priority:** M (Must Have)
**Estimate:** 8-10 story points
**Type:** Infrastructure

**As a** developer
**I want to** have complete app navigation structure defined
**So that** I can implement Epic 2-8 features without making routing decisions

---

### Acceptance Criteria

#### Part 1: Tab Navigation (3 Tabs)

- [ ] Create `(tabs)/_layout.tsx` with 3-tab configuration:
  - **Tab 1 (Left):** Thread - icon: home, label: "Thread"
  - **Tab 2 (Center):** AI Chat - icon: sparkle/AI, label: "Coach" (special center button)
  - **Tab 3 (Right):** Dashboard - icon: chart, label: "Dashboard"
- [ ] Tab bar uses design system colors
- [ ] Active tab indicator matches brand color (#3B72F6)
- [ ] Tab bar height matches iOS standards (49px)
- [ ] Center button is elevated above tab bar (z-index)

#### Part 2: Center AI Button with Blur Effect

**Center Button Design:**
- [ ] Circular button, diameter: 56px (larger than tab icons)
- [ ] Centered horizontally in tab bar
- [ ] Elevated with shadow: `shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8`
- [ ] Optional: Subtle glow effect (gradient glow or pulsing animation)
- [ ] Icon: AI symbol or sparkle
- [ ] Tappable area extends slightly beyond visual bounds for better UX

**Tap Behavior:**
- [ ] Tap center button → Opens AI Chat overlay
- [ ] Background: Current screen blurs + dims
  - Blur strength: 20px
  - Dim overlay: `rgba(0, 0, 0, 0.6)`
- [ ] AI Chat: Glassmorphism card appears
  - Translucent background: `rgba(255, 255, 255, 0.1)` in dark mode
  - Backdrop filter: `blur(20px)`
  - Border: `1px solid rgba(255, 255, 255, 0.2)`
  - Border radius: `24px`
  - Shadow for depth
  - Smooth slide-up animation (300ms ease-out)
- [ ] Dismiss: Tap outside chat card OR swipe down
- [ ] Dismiss animation: Fade-out blur + slide-down chat (200ms)

**Technical Implementation:**
- [ ] Use `@react-native-community/blur` or `expo-blur` for background blur
- [ ] Use `react-native-reanimated` for smooth animations
- [ ] Modal overlay with `Modal` component or custom overlay
- [ ] Gesture handler for swipe-to-dismiss (`react-native-gesture-handler`)

#### Part 3: Tab Content Screens

**Tab 1: Thread (app/(tabs)/index.tsx)**
- [ ] Placeholder screen titled "Thread"
- [ ] Subtitle: "Today's Binds" (Epic 3)
- [ ] Shows: "This page has not been developed"
- [ ] Clean design with design system components

**Tab 2: AI Chat (app/(tabs)/ai-chat.tsx)**
- [ ] Opened via center button (not directly navigable as tab)
- [ ] Glassmorphism card interface
- [ ] Placeholder: "AI Chat Interface" (Epic 6)
- [ ] Shows: "This page has not been developed"
- [ ] Back/dismiss button works

**Tab 3: Dashboard (app/(tabs)/dashboard.tsx)**
- [ ] Placeholder screen titled "Dashboard"
- [ ] Subtitle: "Weave Progress" (Epic 5)
- [ ] Shows: "This page has not been developed"
- [ ] Clean design with design system components

#### Part 4: Stack Screens (Placeholder Screens)

**Goals Screens (Epic 2):**
- [ ] `(tabs)/goals/index.tsx` - "Goals List"
- [ ] `(tabs)/goals/[id].tsx` - "Goal Detail"
- [ ] `(tabs)/goals/new.tsx` - "Create Goal" (modal)
- [ ] `(tabs)/goals/edit/[id].tsx` - "Edit Goal" (modal)

**Bind Screens (Epic 3):**
- [ ] `(tabs)/binds/[id].tsx` - "Bind Detail"
- [ ] `(tabs)/binds/proof/[id].tsx` - "Attach Proof"

**Journal Screens (Epic 4):**
- [ ] `(tabs)/journal/index.tsx` - "Daily Reflection"
- [ ] `(tabs)/journal/history.tsx` - "Journal History"
- [ ] `(tabs)/journal/[date].tsx` - "Past Entry"

**Capture Screens (Epic 3):**
- [ ] `(tabs)/captures/index.tsx` - "Capture Gallery"
- [ ] `(tabs)/captures/[id].tsx` - "Capture Detail"

**Settings Screens (Epic 8):**
- [ ] `(tabs)/settings/index.tsx` - "Settings"
- [ ] `(tabs)/settings/identity.tsx` - "Identity Document"
- [ ] `(tabs)/settings/subscription.tsx` - "Subscription"

**Placeholder Screen Requirements:**
- [ ] All placeholder screens use same template:
  - Page title in large, bold black text
  - Epic reference: "Epic X: [Epic Name]"
  - Story reference: "Story X.Y: [Story Name]"
  - Placeholder text: "This page has not been developed"
  - Clean card layout with design system components
  - Back button in header (for stack screens)
  - Modal screens have close/dismiss button
- [ ] Navigation works correctly (can navigate to and from all screens)

#### Part 5: Auth Guards

**Route Guard Logic:**
- [ ] Implement in `app/index.tsx`
- [ ] Check 1: User authenticated?
  - If NO → Redirect to `(auth)/login`
  - If YES → Continue to Check 2
- [ ] Check 2: Onboarding complete?
  - If NO → Redirect to `(onboarding)/welcome`
  - If YES → Redirect to `(tabs)` (main app)
- [ ] Protected routes wrapped with auth check
- [ ] Redirect happens before screen renders (no flash)

**Testing Mode:**
- [ ] Environment variable or dev flag to bypass auth for testing
- [ ] Can jump directly to `(tabs)` during development
- [ ] Auth guards re-enable for production builds

#### Part 6: Navigation Behavior

- [ ] Tab switching is instant (no animation lag)
- [ ] Stack navigation uses iOS slide transition
- [ ] Modal presentation slides from bottom
- [ ] Back navigation works correctly on all stack screens
- [ ] Modal dismiss works with gesture and button
- [ ] Deep links resolve to correct screen (test with `weave://binds/123`)
- [ ] No navigation warnings in console
- [ ] No route conflicts

#### Part 7: Documentation

- [ ] Update `docs/architecture/core-architectural-decisions.md`:
  - Add "Navigation Architecture" section
  - Document 3-tab structure
  - Document center AI button with blur
  - Document route hierarchy
  - Document navigation patterns
- [ ] Update `docs/ux-design.md`:
  - Add "Information Architecture" section
  - Document screen hierarchy
  - Document glassmorphism AI chat design
  - Document navigation flows
- [ ] Update `docs/epics.md`:
  - Add Epic 1.5 entry
  - Update dependency map
  - Update epic summary table
- [ ] Create navigation diagram (optional but recommended)

---

### Definition of Done

- [ ] 3 tabs implemented and functional
- [ ] Center AI button opens chat with background blur effect
- [ ] All 15+ placeholder screens created and accessible
- [ ] Auth guards functional (redirect to login if not authenticated)
- [ ] Testing flow works (can jump to main app for development)
- [ ] Navigation behavior smooth (no lag, correct animations)
- [ ] No console warnings or errors
- [ ] Documentation updated (architecture + UX design + epics)
- [ ] Code reviewed and merged
- [ ] Screenshot of tab bar + AI chat blur effect attached to PR

---

### Technical Notes

**File Structure:**
```
app/
├── (tabs)/
│   ├── _layout.tsx           # 3-tab config + center button
│   ├── index.tsx             # Thread tab
│   ├── ai-chat.tsx           # AI Chat (opened from center button)
│   ├── dashboard.tsx         # Dashboard tab
│   ├── goals/
│   │   ├── index.tsx
│   │   ├── [id].tsx
│   │   ├── new.tsx
│   │   └── edit/[id].tsx
│   ├── binds/
│   │   ├── [id].tsx
│   │   └── proof/[id].tsx
│   ├── journal/
│   │   ├── index.tsx
│   │   ├── history.tsx
│   │   └── [date].tsx
│   ├── captures/
│   │   ├── index.tsx
│   │   └── [id].tsx
│   └── settings/
│       ├── index.tsx
│       ├── identity.tsx
│       └── subscription.tsx
```

**Dependencies:**
```bash
npm install @react-native-community/blur
npm install react-native-reanimated
npm install react-native-gesture-handler
```

**Glassmorphism Styles (Example):**
```typescript
const glassStyles = {
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: 24,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.2)',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.3,
  shadowRadius: 32,
};
```

---

### Story Points Breakdown

- **Tab Navigation Setup:** 2 pts
- **Center AI Button + Blur Effect:** 3 pts
- **Placeholder Screens (15+):** 2 pts
- **Auth Guards:** 1 pt
- **Documentation:** 1-2 pts

**Total:** 8-10 story points

---

## Appendix B: Route Naming Conventions

**File-based routing patterns:**

- `index.tsx` - Default route for directory (e.g., `goals/index.tsx` → `/goals`)
- `[id].tsx` - Dynamic route parameter (e.g., `goals/[id].tsx` → `/goals/123`)
- `[...slug].tsx` - Catch-all route (e.g., `docs/[...slug].tsx` → `/docs/a/b/c`)
- `(group)/` - Route group (not in URL, just organization)
- `_layout.tsx` - Layout wrapper for child routes

**Examples:**
```
(tabs)/goals/[id].tsx                → /goals/123
(tabs)/journal/[date].tsx            → /journal/2025-12-21
(tabs)/binds/[id].tsx                → /binds/bind-uuid
(tabs)/settings/index.tsx           → /settings
```

---

## Summary

This proposal adds **Epic 1.5: App Navigation Scaffolding** (8-10 points, 1 unified story) between Epic 1 (Onboarding) and Epic 2 (Goal Management) to establish complete navigation architecture upfront.

**Key Changes from Original:**
- ✅ **Simplified:** 3 tabs only (Thread, AI Chat center, Dashboard)
- ✅ **Unified:** Combined 2 stories into 1 (8-10 points)
- ✅ **Focused:** Center button with blur effect (no radial menu for MVP)
- ✅ **Clear:** All other pages are stack screens, NOT tabs

**Key Benefits:**
- ✅ Prevents navigation technical debt
- ✅ Enables parallel feature development
- ✅ Single source of truth for app structure
- ✅ Magical glassmorphism AI interface differentiates Weave from competitors
- ✅ Simple, clean 3-tab structure for MVP

**Impact:**
- Minimal (1-2 day timeline addition)
- Low risk (additive change only)
- High value (cleaner Epic 2-8 implementation)

**Next Steps:**
1. ✅ User approved proposal (DONE)
2. 🔨 Implement Story 1.5.1 (Core Navigation Architecture)
3. ✅ Epic 2 implementation begins with clear navigation structure

---

**End of Sprint Change Proposal**
