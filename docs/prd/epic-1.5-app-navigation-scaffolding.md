# Epic 1.5: Development Infrastructure

## Overview

**Goal:** Establish complete development infrastructure (frontend navigation, backend patterns, AI service standards) to accelerate Epic 2-8 implementation by 20-30%.

**Rationale:** Story 1.5.1 demonstrated that upfront standardization dramatically accelerates development. Epic 2-8 will require 40+ API endpoints, 12+ database models, and 15+ AI integrations. Without standardized patterns, each story involves redundant architectural decisions, inconsistent code, and higher maintenance burden.

**User Outcome:** Development team has:
1. **Frontend Infrastructure** - All routes defined with placeholder screens (Story 1.5.1)
2. **Backend Infrastructure** - API/model templates, scaffolding scripts, testing conventions (Story 1.5.2)
3. **AI Infrastructure** - Unified provider abstraction, cost tracking, rate limiting patterns (Story 1.5.3)

**Design Philosophy:**
- **Frontend:** Simple, clean 3-tab structure (Thread, AI Chat, Dashboard) with magical glassmorphism AI interface inspired by new Siri
- **Backend:** Consistent REST patterns, Pydantic schemas, FastAPI templates with minimal boilerplate
- **AI Services:** Single abstraction layer for text/image/audio AI with fallback chains and cost controls

---

## Story 1.5.1: Core Navigation Architecture

### Priority: M (Must Have)

**Estimate:** 8-10 story points
**Type:** Infrastructure

**As a** developer
**I want to** have complete app navigation structure defined
**So that** I can implement Epic 2-8 features without making routing decisions

---

### Overview / Rationale

Navigation structure is infrastructure (like database schema in Epic 0). Defining routing patterns and screen hierarchy before feature implementation prevents technical debt and enables cleaner Epic 2-8 implementation.

This story establishes:
1. **Simple 3-tab navigation** (Thread, AI Chat center, Dashboard)
2. **Magical center AI button** with glassmorphism blur effect
3. **All Epic 2-8 routes** as placeholder screens (stack navigation)
4. **Auth guards** for protected routes
5. **Testing flow** to jump directly to app during development
6. **Navigation documentation** for future story implementation

---

### Acceptance Criteria

#### Part 1: Tab Navigation (3 Tabs)

**Tab Bar Configuration:**
- [ ] Create `(tabs)/_layout.tsx` with 3-tab configuration
- [ ] **Tab 1 (Left): Thread**
  - Icon: home symbol
  - Label: "Thread"
  - Route: `(tabs)/index.tsx`
- [ ] **Tab 2 (Center): AI Chat**
  - Icon: sparkle or AI symbol
  - Label: "Coach"
  - Special center button (elevated, glowing)
  - Opens AI Chat overlay (not direct navigation)
- [ ] **Tab 3 (Right): Dashboard**
  - Icon: chart/graph symbol
  - Label: "Dashboard"
  - Route: `(tabs)/dashboard.tsx`
- [ ] Tab bar uses design system colors
- [ ] Active tab indicator matches brand color (#3B72F6)
- [ ] Tab bar height: 49px (iOS standard)
- [ ] Tab bar positioned at bottom with safe area insets

---

#### Part 2: Center AI Button with Blur Effect

**Center Button Design:**
- [ ] Circular button, diameter: 56px (larger than standard tab icons)
- [ ] Positioned centered horizontally in tab bar
- [ ] Elevated above tab bar with shadow
  - `shadowOffset: { width: 0, height: 4 }`
  - `shadowOpacity: 0.3`
  - `shadowRadius: 8`
- [ ] Optional glow effect: Gradient glow or subtle pulsing animation
- [ ] Icon: AI symbol, sparkle, or custom Weave logo
- [ ] Tappable area extends 8px beyond visual bounds (better thumb UX)
- [ ] Hover/press state: Scale slightly (0.95x) with haptic feedback

**AI Chat Overlay (Glassmorphism):**
- [ ] Tap center button → Opens AI Chat overlay
- [ ] **Background Effect:**
  - Current screen blurs (blur radius: 20px)
  - Dim overlay: `rgba(0, 0, 0, 0.6)`
  - Blur + dim animation: 200ms ease-out
- [ ] **AI Chat Card:**
  - Translucent background: `rgba(255, 255, 255, 0.1)` (dark mode)
  - Backdrop blur: 20px (frosted glass effect)
  - Border: `1px solid rgba(255, 255, 255, 0.2)`
  - Border radius: 24px
  - Shadow: `0 8px 32px rgba(0, 0, 0, 0.3)` (depth)
  - Width: 90% of screen width
  - Height: 60% of screen height
  - Position: Center/bottom of screen
  - Padding: 20px
- [ ] **Animation:**
  - Entrance: Fade-in blur + slide-up card (300ms ease-out)
  - Exit: Fade-out blur + slide-down card (200ms ease-in)
- [ ] **Dismissal:**
  - Tap outside chat card → Dismiss
  - Swipe down on card → Dismiss
  - Back button on card → Dismiss
  - Hardware back button (Android) → Dismiss

**Technical Implementation:**
- [ ] Use `expo-blur` (`BlurView` component) for background blur
- [ ] Use `react-native-reanimated` for smooth animations (`useSharedValue`, `withSpring`, `withTiming`)
- [ ] Use `Modal` component with `transparent` background
- [ ] Use `react-native-gesture-handler` for swipe-to-dismiss (`PanGestureHandler`)
- [ ] Z-index layering: Tab bar (1) < Center button (10) < Blur overlay (100) < AI Chat card (101)

**Placeholder AI Chat Content:**
- [ ] Title: "AI Chat Interface"
- [ ] Subtitle: "Epic 6: AI Coaching"
- [ ] Placeholder text: "This page has not been developed"
- [ ] Close/dismiss button (top-right X icon)
- [ ] Design matches glassmorphism aesthetic

---

#### Part 3: Tab Content Screens (Placeholder)

**Tab 1: Thread (app/(tabs)/index.tsx)**
- [ ] Title: "Thread" (large, bold, black text)
- [ ] Subtitle: "Today's Binds"
- [ ] Epic reference: "Epic 3: Daily Actions & Proof"
- [ ] Placeholder text: "This page has not been developed"
- [ ] Design: Card layout with design system components (Card, Text)
- [ ] Background: Design system background color

**Tab 2: AI Chat (app/(tabs)/ai-chat.tsx)**
- [ ] Accessed via center button only (not direct tab navigation)
- [ ] See "Part 2: Center AI Button" for complete spec
- [ ] Glassmorphism card interface

**Tab 3: Dashboard (app/(tabs)/dashboard.tsx)**
- [ ] Title: "Dashboard" (large, bold, black text)
- [ ] Subtitle: "Weave Progress"
- [ ] Epic reference: "Epic 5: Progress Visualization"
- [ ] Placeholder text: "This page has not been developed"
- [ ] Design: Card layout with design system components
- [ ] Background: Design system background color

---

#### Part 4: Stack Screens (Placeholder Screens)

**Template for All Placeholder Screens:**
```tsx
// Example: (tabs)/goals/index.tsx
import { View } from 'react-native';
import { Card, Text } from '@/design-system';

export default function GoalsListPlaceholder() {
  return (
    <View className="flex-1 bg-background p-4">
      <Card variant="glass" className="p-6">
        <Text variant="displayLg" className="text-foreground mb-2">
          Goals List
        </Text>
        <Text variant="bodyMd" className="text-muted mb-4">
          Epic 2: Needle/Goal Management
        </Text>
        <Text variant="bodySm" className="text-muted mb-4">
          Story 2.1: View Goals List
        </Text>
        <Text variant="bodySm" className="text-muted">
          This page has not been developed
        </Text>
      </Card>
    </View>
  );
}
```

**Goals Screens (Epic 2):**
- [ ] `(tabs)/goals/index.tsx` - "Goals List" (Epic 2, Story 2.1)
- [ ] `(tabs)/goals/[id].tsx` - "Goal Detail" (Epic 2, Story 2.2)
- [ ] `(tabs)/goals/new.tsx` - "Create Goal" (Epic 2, Story 2.3) - Modal presentation
- [ ] `(tabs)/goals/edit/[id].tsx` - "Edit Goal" (Epic 2, Story 2.4) - Modal presentation

**Bind Screens (Epic 3):**
- [ ] `(tabs)/binds/[id].tsx` - "Bind Detail" (Epic 3, Story 3.3a)
- [ ] `(tabs)/binds/proof/[id].tsx` - "Attach Proof" (Epic 3, Story 3.4)

**Journal Screens (Epic 4):**
- [ ] `(tabs)/journal/index.tsx` - "Daily Reflection" (Epic 4, Story 4.1a)
- [ ] `(tabs)/journal/history.tsx` - "Journal History" (Epic 4, Story 4.5)
- [ ] `(tabs)/journal/[date].tsx` - "Past Entry" (Epic 4, Story 4.5)

**Capture Screens (Epic 3):**
- [ ] `(tabs)/captures/index.tsx` - "Capture Gallery" (Epic 3, Story 3.5)
- [ ] `(tabs)/captures/[id].tsx` - "Capture Detail" (Epic 3, Story 3.5)

**Settings Screens (Epic 8):**
- [ ] `(tabs)/settings/index.tsx` - "Settings Home" (Epic 8, Story 8.3)
- [ ] `(tabs)/settings/identity.tsx` - "Edit Identity Document" (Epic 8, Story 8.2)
- [ ] `(tabs)/settings/subscription.tsx` - "Subscription Management" (Epic 8, Story 8.4)

**Placeholder Screen Requirements:**
- [ ] All screens use consistent template (see example above)
- [ ] Page title in large, bold text (Text variant="displayLg")
- [ ] Epic reference: "Epic X: [Epic Name]"
- [ ] Story reference: "Story X.Y: [Story Name]"
- [ ] Placeholder text: "This page has not been developed"
- [ ] Clean card layout using design system Card component
- [ ] Background uses design system background color
- [ ] Stack screens have back button in navigation header
- [ ] Modal screens have close/dismiss button (top-right X icon)
- [ ] All screens are navigable (can open and close correctly)

---

#### Part 5: Auth Guards

**Route Guard Implementation:**

**app/index.tsx:**
```typescript
import { useEffect } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  // Wait for auth check to complete
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Check 1: Authentication
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Check 2: Onboarding completion
  const onboardingComplete = user?.onboarding_completed_at != null;
  if (!onboardingComplete) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  // All checks passed - go to main app
  return <Redirect href="/(tabs)" />;
}
```

**Requirements:**
- [ ] Redirect to `(auth)/login` if not authenticated
- [ ] Redirect to `(onboarding)/welcome` if onboarding incomplete
- [ ] Redirect to `(tabs)` if all checks pass
- [ ] Show loading screen while auth state is being checked (prevent flash)
- [ ] Protected routes wrapped with auth check
- [ ] Unauthenticated users cannot access main app

**Testing Mode (Development Only):**
- [ ] Environment variable: `EXPO_PUBLIC_DEV_SKIP_AUTH=true`
- [ ] When enabled: Skip auth checks, go directly to `(tabs)`
- [ ] When disabled or in production: Full auth guards enabled
- [ ] Testing mode clearly indicated with banner at top of screen

**Implementation:**
```typescript
// For testing only
if (__DEV__ && process.env.EXPO_PUBLIC_DEV_SKIP_AUTH === 'true') {
  return <Redirect href="/(tabs)" />;
}
```

---

#### Part 6: Navigation Behavior & UX

**Performance:**
- [ ] Tab switching is instant (<50ms response)
- [ ] No animation lag or jank (maintain 60fps)
- [ ] Smooth blur animation on AI Chat open/close

**Navigation Animations:**
- [ ] Tab switch: Instant (no animation between tabs)
- [ ] Stack push: Slide from right (iOS standard, 300ms)
- [ ] Stack pop: Slide to right (iOS standard, 250ms)
- [ ] Modal present: Slide from bottom (300ms ease-out)
- [ ] Modal dismiss: Slide to bottom (250ms ease-in)
- [ ] AI Chat open: Fade-in blur (200ms) + slide-up card (300ms)
- [ ] AI Chat dismiss: Fade-out blur + slide-down card (200ms)

**Gestures:**
- [ ] Swipe back on stack screens (iOS edge swipe gesture)
- [ ] Swipe down to dismiss modals
- [ ] Swipe down to dismiss AI Chat
- [ ] Tap outside AI Chat card to dismiss

**Edge Cases:**
- [ ] Prevent double-tapping center button (debounce 300ms)
- [ ] Handle Android hardware back button correctly
- [ ] Prevent navigation while animation in progress
- [ ] Handle deep links that target non-existent routes (404 handling)

**Console:**
- [ ] No navigation warnings
- [ ] No route conflicts
- [ ] No key prop warnings
- [ ] No layout shift warnings

---

#### Part 7: Documentation Updates

**Architecture Documentation (docs/architecture/core-architectural-decisions.md):**
- [ ] Add new section: "Navigation Architecture"
- [ ] Document 3-tab structure with diagram
- [ ] Document center AI button behavior
- [ ] Document glassmorphism design specs
- [ ] Document route hierarchy (complete file tree)
- [ ] Document navigation patterns (tabs vs stack vs modal)
- [ ] Document auth guard implementation
- [ ] Provide code examples for navigation usage

**UX Design Documentation (docs/ux-design.md):**
- [ ] Add new section: "Information Architecture"
- [ ] Document screen hierarchy with tree diagram
- [ ] Document 5 primary user flows (Daily Completion, AI Coaching, Reflection, Goal Management, Progress Review)
- [ ] Document glassmorphism AI chat visual design
- [ ] Document navigation transitions and animations
- [ ] Include design rationale for 3-tab structure

**Epic Documentation (docs/epics.md):**
- [ ] Add Epic 1.5 entry after Epic 1 section
- [ ] Update epic dependency flow diagram
- [ ] Update epic summary table (add Epic 1.5 row)
- [ ] Update Epic 2 dependencies to include Epic 1.5

**Navigation Diagram (Optional but Recommended):**
- [ ] Create visual diagram of complete screen hierarchy
- [ ] Show navigation relationships between screens
- [ ] Highlight tab structure vs stack navigation
- [ ] Show modal presentation points
- [ ] Save as image in docs/diagrams/ folder

---

### Definition of Done

**Functionality:**
- [ ] 3 tabs implemented and functional (Thread, AI Chat center, Dashboard)
- [ ] Center AI button opens chat with background blur effect
- [ ] AI Chat glassmorphism card displays correctly
- [ ] All 15+ placeholder screens created and accessible
- [ ] Navigation between screens works smoothly
- [ ] Auth guards functional (redirect to login if not authenticated)
- [ ] Testing flow works (can bypass auth with env variable)

**UX:**
- [ ] Tab switching is instant (<50ms)
- [ ] Blur effect is smooth and performant
- [ ] AI Chat animation feels magical (slide-up + fade-in)
- [ ] Dismiss gestures work intuitively
- [ ] No UI jank or stuttering
- [ ] Design matches Weave's aesthetic (clean, minimal, magical)

**Technical:**
- [ ] No console warnings or errors
- [ ] No route conflicts
- [ ] No navigation issues (back button, deep links)
- [ ] Performance: 60fps maintained during animations
- [ ] Memory: No leaks from blur effect or modals

**Documentation:**
- [ ] Architecture docs updated with navigation section
- [ ] UX docs updated with information architecture
- [ ] epics.md updated with Epic 1.5
- [ ] All changes committed and pushed

**Code Review:**
- [ ] Code reviewed and approved
- [ ] PR includes screenshots:
  - Tab bar with 3 tabs
  - Center AI button design
  - AI Chat with blur effect
  - Sample placeholder screens
- [ ] PR description links to this story

---

### Technical Implementation Notes

#### File Structure

```
app/
├── (tabs)/
│   ├── _layout.tsx              # 3-tab configuration + center button logic
│   ├── index.tsx                # Tab 1: Thread (Today's Binds)
│   ├── ai-chat.tsx              # Tab 2: AI Chat (glassmorphism overlay)
│   ├── dashboard.tsx            # Tab 3: Dashboard (Progress)
│   │
│   ├── goals/                   # Goals Management (Stack)
│   │   ├── index.tsx            # Goals List
│   │   ├── [id].tsx             # Goal Detail
│   │   ├── new.tsx              # Create Goal (Modal)
│   │   └── edit/[id].tsx        # Edit Goal (Modal)
│   │
│   ├── binds/                   # Bind Screens (Stack)
│   │   ├── [id].tsx             # Bind Detail/Completion
│   │   └── proof/[id].tsx       # Attach Proof
│   │
│   ├── journal/                 # Journal Screens (Stack)
│   │   ├── index.tsx            # Daily Reflection Entry
│   │   ├── history.tsx          # Journal History List
│   │   └── [date].tsx           # Past Entry Detail
│   │
│   ├── captures/                # Capture Screens (Stack)
│   │   ├── index.tsx            # Capture Gallery
│   │   └── [id].tsx             # Capture Detail
│   │
│   └── settings/                # Settings Screens (Stack)
│       ├── index.tsx            # Settings Home
│       ├── identity.tsx         # Edit Identity Document
│       └── subscription.tsx     # Subscription Management
```

#### Dependencies

**Required Packages:**
```bash
# Already installed
npm install expo-router react-native-reanimated

# New for this story
npm install expo-blur
npm install react-native-gesture-handler
```

**Package Versions:**
- `expo-blur`: Latest compatible with SDK 53
- `react-native-reanimated`: ^3.x (already installed)
- `react-native-gesture-handler`: ^2.x (already installed with Expo)

#### Glassmorphism Styles Reference

```typescript
// Example style object for glassmorphism
const glassStyles = StyleSheet.create({
  aiChatCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    padding: 20,
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
});

// Using expo-blur
<BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}>
  {/* AI Chat Card */}
</BlurView>
```

#### Center Button Implementation Approach

**Option 1: Custom Tab Bar (Recommended)**
```typescript
// (tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { CenterAIButton } from '@/components/navigation/CenterAIButton';

export default function TabLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarStyle: { height: 49 },
          // ... other options
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Thread" }} />
        <Tabs.Screen
          name="ai-chat"
          options={{
            href: null, // Hide from tab bar
          }}
        />
        <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
      </Tabs>
      <CenterAIButton />
    </>
  );
}
```

**Option 2: Custom tabBar Function**
```typescript
// Render custom tab bar with center button integrated
tabBar={(props) => <CustomTabBar {...props} />}
```

Choose Option 1 for simplicity unless custom tab bar is needed for other reasons.

---

### Data Requirements

**None** - This story is purely UI/navigation structure with no database operations.

**Future Stories:** Epic 2-8 stories will populate these screens with actual data and business logic.

---

### Testing Checklist

**Navigation Testing:**
- [ ] Can switch between all 3 tabs
- [ ] Center button opens AI Chat overlay
- [ ] AI Chat blur effect works (background blurs)
- [ ] Can dismiss AI Chat by tapping outside
- [ ] Can dismiss AI Chat by swiping down
- [ ] All placeholder screens render without errors
- [ ] Can navigate to all 15+ placeholder screens
- [ ] Back navigation works correctly
- [ ] Modal presentation/dismissal works

**Auth Guard Testing:**
- [ ] Unauthenticated user redirected to login
- [ ] User without onboarding redirected to welcome
- [ ] Authenticated + onboarded user sees main app
- [ ] Testing mode bypasses auth when enabled

**Performance Testing:**
- [ ] Tab switching is instant (<50ms)
- [ ] Blur animation is smooth (no stuttering)
- [ ] No memory leaks from blur effect
- [ ] App remains responsive during animations
- [ ] 60fps maintained during all transitions

**Edge Case Testing:**
- [ ] Double-tap center button doesn't cause issues
- [ ] Android hardware back button works correctly
- [ ] Deep links resolve correctly
- [ ] No console warnings or errors
- [ ] Placeholder screens don't crash when navigated to

---

### Story Points Breakdown

| Task | Estimate | Rationale |
|------|----------|-----------|
| 3-tab navigation setup | 2 pts | Configure Expo Router tabs |
| Center AI button + blur effect | 3 pts | Custom button, glassmorphism, animations |
| 15+ placeholder screens | 2 pts | Template-based, repetitive |
| Auth guards | 1 pt | Straightforward logic |
| Documentation updates | 1-2 pts | Update 3 files + diagrams |

**Total: 8-10 story points**

---

### Success Metrics

**Completion Rate:**
- Story completed within 1-2 days
- All acceptance criteria met
- DoD checklist 100% complete

**Quality:**
- Zero console warnings or errors
- Smooth animations (60fps)
- No navigation bugs reported

**Developer Experience:**
- Epic 2-8 stories can reference clear route paths
- No confusion about where to place screens
- Navigation architecture questions resolved

---

## Story 1.5.2: Backend API/Model Standardization

### Priority: S (Should Have)

**Estimate:** 5-6 story points
**Type:** Infrastructure

**As a** developer
**I want to** have standardized backend patterns and templates
**So that** I can implement Epic 2-8 APIs without architectural decisions

---

### Overview / Rationale

Backend standardization prevents pattern divergence across 40+ API endpoints and 12+ database models in Epic 2-8. Like Story 1.5.1 established navigation templates, this story establishes backend templates, enabling developers to scaffold new APIs in minutes instead of hours.

This story establishes:
1. **API Endpoint Templates** - FastAPI router patterns with auth, validation, error handling
2. **Database Model Conventions** - SQLAlchemy BaseModel with timestamps, soft delete
3. **Pydantic Schema Standards** - Request/response models with consistent naming
4. **Service Layer Decision Tree** - When to create service classes vs inline logic
5. **Error Handling Patterns** - Standard error codes (VALIDATION_ERROR, NOT_FOUND, etc.)
6. **Testing Conventions** - Pytest fixtures, integration test patterns
7. **Scaffolding Scripts** - Generate new API endpoints from templates

---

### Acceptance Criteria

#### AC-1: API Endpoint Standardization

**REST Naming Conventions:**
- [ ] Document REST resource naming: `GET /api/{resources}`, `POST /api/{resources}`, `GET /api/{resources}/{id}`
- [ ] Document query parameter patterns: `?user_id=xxx&local_date=2025-12-21` (snake_case)
- [ ] Document HTTP status codes: 200 (success), 201 (created), 400 (validation), 401 (auth), 404 (not found), 429 (rate limit), 500 (server error)

**FastAPI Router Template:**
- [ ] Create template file: `scripts/templates/api_router_template.py`
- [ ] Include: Auth dependency injection, Pydantic request/response models, error handling, logging
- [ ] Example endpoints: GET list, GET by ID, POST create, PUT update, DELETE (soft delete)

**Response Wrapper Format:**
- [ ] All success responses: `{"data": {...}, "meta": {"timestamp": "..."}}`
- [ ] All error responses: `{"error": {"code": "...", "message": "...", "retryable": bool}}`
- [ ] All list responses: `{"data": [...], "meta": {"total": N, "page": 1, "per_page": 20}}`

#### AC-2: Database Model Standardization

**SQLAlchemy Base Model:**
- [ ] Create `BaseModel` class with common fields: `id` (UUID), `created_at`, `updated_at`, `deleted_at` (soft delete)
- [ ] Document table naming: `snake_case`, plural (e.g., `user_profiles`, `journal_entries`)
- [ ] Document column naming: `snake_case` (e.g., `user_id`, `local_date`, `scheduled_for_date`)
- [ ] Document foreign key naming: `{table}_id` (e.g., `user_id`, `goal_id`)
- [ ] Document index naming: `idx_{table}_{columns}` (e.g., `idx_completions_user_date`)

**Soft Delete Pattern:**
- [ ] Document soft delete convention: Set `deleted_at` timestamp instead of hard DELETE
- [ ] Document query filtering: Exclude `deleted_at IS NOT NULL` records by default
- [ ] Provide soft delete mixin class

#### AC-3: Pydantic Schema Conventions

**Request/Response Models:**
- [ ] Naming pattern: `{Resource}Create`, `{Resource}Update`, `{Resource}Response`
- [ ] Example: `GoalCreate`, `GoalUpdate`, `GoalResponse`
- [ ] Document field validation patterns (min/max length, regex, custom validators)
- [ ] Document nested model patterns for related entities

**Template File:**
- [ ] Create `scripts/templates/pydantic_schema_template.py`
- [ ] Include: Create schema, update schema, response schema with relationships

#### AC-4: Service Layer Decision Tree

**Decision Tree:**
- [ ] **Inline logic** (default): Simple CRUD, <20 lines, single table operations
- [ ] **Service class**: Complex business logic, multi-table transactions, >20 lines, reusable across endpoints
- [ ] Document when NOT to create services (avoid premature abstraction)

**Service Template (when needed):**
- [ ] Create `scripts/templates/service_template.py`
- [ ] Include: Async methods, error handling, transaction management

#### AC-5: Error Handling Patterns

**Standard Error Codes:**
- [ ] Document error codes: `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `RATE_LIMIT_EXCEEDED`, `INTERNAL_ERROR`
- [ ] Create error response utility: `format_error_response(code, message, retryable=False)`
- [ ] Document HTTP status mapping: 400 → VALIDATION_ERROR, 404 → NOT_FOUND, 429 → RATE_LIMIT_EXCEEDED

**Error Handling Middleware:**
- [ ] Create FastAPI exception handlers for common errors
- [ ] Log errors with request context (user_id, endpoint, timestamp)

#### AC-6: Testing Patterns

**Pytest Fixtures:**
- [ ] Document fixture naming: `user_fixture`, `goal_fixture`, `subtask_fixture`
- [ ] Create reusable fixtures in `tests/conftest.py`
- [ ] Document test database setup/teardown

**Integration Test Template:**
- [ ] Create `tests/test_example_api.py` demonstrating integration test pattern
- [ ] Include: Auth setup, API calls, response validation, cleanup
- [ ] Document coverage targets: 80%+ for services, 60%+ for routes

#### AC-7: Scaffolding Scripts

**API Scaffolding Script:**
- [ ] Create `scripts/generate_api.py` to scaffold new API endpoints
- [ ] Input: Resource name (e.g., "goal")
- [ ] Output: Router file, Pydantic schemas, test file (with TODO placeholders)
- [ ] Usage: `python scripts/generate_api.py goal` → generates `api/routers/goals.py`, `api/schemas/goal.py`, `tests/test_goals_api.py`

#### AC-8: Documentation

**Backend Patterns Guide:**
- [ ] Create `docs/dev/backend-patterns-guide.md`
- [ ] Sections: API Patterns, Model Conventions, Pydantic Schemas, Error Handling, Testing, Service Layer Decision Tree
- [ ] Include 2-3 complete examples (simple CRUD, complex multi-table operation)
- [ ] Link from CLAUDE.md standardization section

**Update Architecture Docs:**
- [ ] Update `docs/architecture/implementation-patterns-consistency-rules.md` with backend standardization reference
- [ ] Add section: "Backend Standardization (Story 1.5.2)" with link to patterns guide

---

### Story Points Breakdown

| Task | Estimate | Rationale |
|------|----------|-----------|
| API templates + docs | 2 pts | FastAPI router template, response format standardization |
| Model/schema templates | 1 pt | BaseModel, Pydantic templates |
| Error handling + service patterns | 1 pt | Error codes, decision tree |
| Testing conventions + fixtures | 1 pt | Pytest fixtures, integration test template |
| Backend patterns guide | 1-2 pts | Comprehensive developer documentation |

**Total: 5-6 story points**

---

## Story 1.5.3: AI Services Standardization (Text/Image/Audio)

### Priority: S (Should Have)

**Estimate:** 4-5 story points
**Type:** Infrastructure

**As a** developer
**I want to** have unified AI service patterns across text, image, and audio
**So that** I can implement Epic 2-8 AI features with consistent cost tracking and error handling

---

### Overview / Rationale

Stories 0.6 (AI Service), 0.9 (Image Service), and 0.11 (Voice STT) implemented text, image, and audio AI integrations separately. This story extracts common patterns into a unified abstraction (`AIProviderBase`), ensuring all future AI integrations follow consistent patterns for:
- Provider fallback chains (Primary → Secondary → Graceful degradation)
- Cost tracking (unified logging to `ai_runs` table)
- Rate limiting (check `daily_aggregates` before AI calls)
- Error handling (standard loading states, retry logic)
- Frontend hooks (React Native hooks for all AI modalities)

**Epic 2-8 Benefits:**
- 15+ AI integrations use single pattern
- Cost tracking automatic for all modalities
- Rate limiting enforced consistently
- Frontend developers use standard hooks (`useAIChat`, `useImageAnalysis`, `useVoiceTranscription`)

---

### Acceptance Criteria

#### AC-1: Unified AI Provider Abstraction

**AIProviderBase Abstract Class:**
- [ ] Create `weave-api/app/services/ai_provider_base.py`
- [ ] Abstract methods: `call_ai(input, context) -> dict`, `estimate_cost(input) -> float`, `get_provider_name() -> str`
- [ ] Common methods: `log_to_ai_runs(operation_type, input_tokens, output_tokens, cost_usd, duration_ms)`, `check_rate_limit(user_id, operation_type)`

**Provider Implementation Pattern:**
- [ ] All AI providers inherit from `AIProviderBase`
- [ ] Implement fallback chain: Primary provider → Secondary provider → Graceful degradation (return None or default)
- [ ] Document provider initialization (API keys, config)

#### AC-2: Text AI Standardization

**Text AI Providers:**
- [ ] Primary: OpenAI GPT-4o-mini ($0.15/$0.60 per MTok) - 90% of text generation
- [ ] Secondary: Claude 3.7 Sonnet ($3.00/$15.00 per MTok) - Complex reasoning, fallback
- [ ] Tertiary: Deterministic/cached responses (when both providers fail)

**Text AI Pattern:**
- [ ] Document when to use GPT-4o-mini vs Claude (routine vs complex reasoning)
- [ ] Standard request format: `{"messages": [...], "context": {...}}`
- [ ] Standard response format: `{"text": "...", "provider": "gpt-4o-mini", "tokens_used": {...}, "cost_usd": 0.0025}`

#### AC-3: Image AI Standardization

**Image AI Providers:**
- [ ] Primary: Gemini 3.0 Flash (~$0.0005 per image) - Proof validation, OCR, classification
- [ ] Secondary: GPT-4o Vision ($5/MTok, ~$0.02 per image) - Fallback for complex analysis
- [ ] Tertiary: Store image without AI analysis (graceful degradation)

**Image AI Pattern:**
- [ ] Standard request: `{"image_url": "...", "prompt": "Analyze this image...", "operations": ["proof_validation", "ocr", "classification"]}`
- [ ] Standard response: `{"proof_validated": bool, "extracted_text": "...", "categories": [...], "quality_score": int, "provider": "gemini-3-flash"}`

#### AC-4: Audio AI Standardization

**Audio AI Providers:**
- [ ] Primary: AssemblyAI ($0.15/hr) - Speech-to-text transcription
- [ ] Secondary: OpenAI Whisper API ($0.006/min = $0.36/hr) - Fallback for edge cases
- [ ] Tertiary: Store audio without transcript (manual transcription later)

**Audio AI Pattern:**
- [ ] Standard request: `{"audio_file": bytes, "format": "m4a", "language": "en"}`
- [ ] Standard response: `{"transcript": "...", "confidence": 0.94, "duration_sec": 45.2, "provider": "assemblyai"}`

#### AC-5: Cost Tracking Standardization

**Unified Cost Logging:**
- [ ] All AI calls log to `ai_runs` table with:
  - `operation_type`: "text_generation", "image_analysis", "transcription"
  - `provider`: "gpt-4o-mini", "gemini-3-flash", "assemblyai"
  - `input_tokens` (or `image_count`, `audio_duration_sec`)
  - `output_tokens`
  - `model`: Specific model name
  - `cost_usd`: Calculated per-provider pricing
  - `duration_ms`: API call latency

**Cost Calculation:**
- [ ] Document per-provider pricing: GPT-4o-mini ($0.15/$0.60/MTok), Gemini ($0.02/image), AssemblyAI ($0.15/hr)
- [ ] Create cost calculator utility: `calculate_cost(provider, input, output)`

#### AC-6: Rate Limiting Patterns

**Rate Limit Checks:**
- [ ] Before text AI: Check `daily_aggregates.ai_text_count` (10 calls/hour per user)
- [ ] Before image AI: Check `daily_aggregates.ai_vision_count` (5 analyses/day per user)
- [ ] Before audio AI: Check `daily_aggregates.transcription_count` (50 transcriptions/day per user)

**Rate Limit Enforcement:**
- [ ] HTTP 429 response: `{"error": {"code": "RATE_LIMIT_EXCEEDED", "message": "Daily limit reached (5/5 images)", "retryAfter": 22980}}`
- [ ] Include `Retry-After` header (seconds until midnight user timezone)

#### AC-7: Hooks & Frontend Integration

**React Native Hooks:**
- [ ] Create `weave-mobile/src/hooks/useAIChat.ts` - Text generation with loading/error states
- [ ] Create `weave-mobile/src/hooks/useImageAnalysis.ts` - Image upload + analysis
- [ ] Create `weave-mobile/src/hooks/useVoiceTranscription.ts` - Audio upload + transcription

**Hook Pattern:**
```typescript
const { generate, isGenerating, error } = useAIChat();
const result = await generate({ prompt: "...", context: {...} });
```

**Loading States:**
- [ ] Standard loading messages: "Generating...", "Analyzing image...", "Transcribing audio..."
- [ ] Standard error messages: "AI service unavailable. Try again.", "Daily limit reached."

#### AC-8: Documentation

**AI Services Guide:**
- [ ] Create `docs/dev/ai-services-guide.md`
- [ ] Sections: Provider Abstraction, Text AI Patterns, Image AI Patterns, Audio AI Patterns, Cost Tracking, Rate Limiting, Frontend Hooks
- [ ] Include provider decision tree (when to use which provider)
- [ ] Include complete integration examples for all 3 modalities
- [ ] Link from CLAUDE.md standardization section

**Update Architecture Docs:**
- [ ] Update `docs/architecture/core-architectural-decisions.md` with unified AI architecture section
- [ ] Add section: "Unified AI Service Architecture (Story 1.5.3)" with provider fallback diagram

---

### Story Points Breakdown

| Task | Estimate | Rationale |
|------|----------|-----------|
| AIProviderBase abstraction | 1 pt | Abstract class, common methods |
| Provider standardization (text/image/audio) | 2 pts | Extract patterns from Stories 0.6, 0.9, 0.11 |
| React Native hooks | 1 pt | 3 hooks with loading/error states |
| AI services guide | 1-2 pts | Comprehensive developer documentation |

**Total: 4-5 story points**

---

## Epic 1.5 Summary

| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| 1.5.1 | Core Navigation Architecture | M | 8-10 pts |
| 1.5.2 | Backend API/Model Standardization | S | 5-6 pts |
| 1.5.3 | AI Services Standardization (Text/Image/Audio) | S | 4-5 pts |

**Epic Total:** 17-21 story points (3 infrastructure stories)

**Key Deliverables:**
- **Story 1.5.1:** 3-tab navigation structure (Thread, AI Chat, Dashboard), magical glassmorphism AI Chat with blur effect, 15+ placeholder screens for Epic 2-8, auth guards, navigation documentation
- **Story 1.5.2:** Backend API/model templates, FastAPI router scaffolding, Pydantic schema standards, error handling patterns, testing conventions, `docs/dev/backend-patterns-guide.md`
- **Story 1.5.3:** Unified `AIProviderBase` abstraction, text/image/audio AI standardization, cost tracking patterns, rate limiting, React Native AI hooks, `docs/dev/ai-services-guide.md`

**ROI:** 20-30% velocity improvement for Epic 2-8 stories (40+ future stories benefit from standardization)

**Deferred to Post-MVP:**
- Radial menu animation (fancy fan-out options)
- Advanced AI Chat interactions
- Polish and visual refinements

---

## Dependencies

**Epic 1.5 depends on:**
- ✅ Epic 0: Foundation (complete) - Stories 0.6, 0.9, 0.11 provide AI implementations that Story 1.5.3 standardizes

**Epic 1.5 blocks:**
- Epic 2-8: Feature Development (need navigation routes, backend patterns, AI service standards)

**Epic 1.5 provides:**
- **Story 1.5.1:** Frontend navigation scaffolding (routes, screens, auth guards)
- **Story 1.5.2:** Backend development templates (API patterns, model conventions, testing standards)
- **Story 1.5.3:** AI integration patterns (unified provider abstraction, cost tracking, rate limiting)

**Can run in parallel with:**
- Nothing (infrastructure must be complete before Epic 2-8 begins)

---

## Notes

**Design Inspiration:**
- New Siri (iOS 18) - Glassmorphism, non-disruptive overlay
- Arc Browser - Clean center button design
- Linear App - Simple 3-tab structure, focus on core actions

**Why 3 Tabs:**
- Keeps UI uncluttered and focused
- Each tab represents core pillar: Action, Insight, Progress
- All other functionality accessed via stack navigation (discoverable, not primary)
- Aligns with mobile UX best practices (3-5 tabs maximum)

**Why Center AI Button:**
- Makes AI Chat feel special and prominent
- Differentiation from standard productivity apps
- Glassmorphism effect creates "magical" feeling
- Non-disruptive overlay keeps user in context

**Technical Considerations:**
- Blur effect can be performance-intensive on older devices
- Test on iPhone X and newer (target hardware)
- Provide fallback if blur not supported (dim overlay only)
- Ensure animations don't block main thread

---
