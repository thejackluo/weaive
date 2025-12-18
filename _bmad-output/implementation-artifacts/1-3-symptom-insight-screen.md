# Story 1.3: Symptom Insight Screen (Dynamic Mirror)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **new user**,
I want to **see a short, powerful reflection of the symptoms I'm experiencing based on my selected painpoint(s)**,
So that **I feel deeply understood and motivated to continue with onboarding**.

## Acceptance Criteria

### Functional Requirements

1. **Content Display**
   - [ ] Display 1-2 short, high-impact paragraphs describing the user's symptom(s)
   - [ ] If user selected ONE painpoint: Show single symptom card
   - [ ] If user selected TWO painpoints: Show both symptom cards stacked with soft separation
   - [ ] No solutions appear on this screen (solutions are in Story 1.4)
   - [ ] Title at top: "Why this feels so hard"

2. **Dynamic Copy Mapping**
   - [ ] **Clarity symptoms:** "You want direction, but nothing feels aligned. You've reflected, journaled, thought deeply — yet you're still on autopilot. Deep down, you do have an idea of the life you want. You're just scared to start, because choosing a direction feels like closing every other door."
   - [ ] **Action symptoms:** "Your mind runs laps while your actions stay still. You overthink, perfect, plan, and wait for the 'right moment' — but the moment never arrives. Starting feels overwhelming, so hesitation becomes your default."
   - [ ] **Consistency symptoms:** "You start strong, fall off, and repeat the cycle again and again. It's not that 'life gets in the way' — it's that you don't see progress fast enough to believe it's working. One missed day breaks everything, and motivation collapses with it."
   - [ ] **Community symptoms:** "You're ambitious in a place that isn't. You feel misunderstood, unsupported, and tired of pushing alone. You've tried getting others to grow with you, but they didn't get it — and shrinking yourself to match them feels wrong."

3. **Visual Design**
   - [ ] Glass-paneled cards with:
     - Soft shadow
     - Subtle animated thread-lines in background (very faint)
     - Light vertical gradient (transparent → subtle highlight)
   - [ ] Typography:
     - Title: Semi-bold
     - Body: Medium weight, 90% opacity for clean minimalism
   - [ ] CTA Button: "Next →" full-width, floating above safe area
   - [ ] Page transitions: fade-in + slight upward drift (150-200ms)

4. **Animations** (if two painpoints selected)
   - [ ] Card 1 fades in first
   - [ ] Card 2 slides upward after 200ms delay
   - [ ] CTA appears only after both cards are visible
   - [ ] Animations respect reduced motion accessibility settings

5. **Performance**
   - [ ] Screen loads and displays <10 seconds
   - [ ] All content is local/static - NO API calls
   - [ ] Deterministic mapping based on selected painpoints from previous screen

6. **Data & Analytics**
   - [ ] Track `symptom_insight_shown` event with selected categories
   - [ ] Store selected categories in `user_profiles.json.initial_symptoms`
   - [ ] Event payload: `{ categories: ['clarity'], timestamp: ISO8601 }`

7. **Edge Cases**
   - [ ] Gracefully handle 1 or 2 selected painpoints (never more)
   - [ ] Handle missing painpoint selection (shouldn't happen, but show default: "Let's explore what you're working through")

## Tasks / Subtasks

### Task 1: UI Implementation (AC: #1, #3, #7)
- [ ] **Subtask 1.1**: Create SymptomInsightScreen component in `app/(auth)/onboarding/symptom-insight.tsx`
- [ ] **Subtask 1.2**: Implement glass-paneled Card component with shadows and gradients
- [ ] **Subtask 1.3**: Add background thread-lines animation (subtle, very faint)
- [ ] **Subtask 1.4**: Implement responsive layout (safe area, full-width CTA)
- [ ] **Subtask 1.5**: Add typography styles (semi-bold title, medium body at 90% opacity)
- [ ] **Subtask 1.6**: Implement "Next →" CTA button fixed at bottom

### Task 2: Animation Implementation (AC: #4)
- [ ] **Subtask 2.1**: Implement fade-in animation for first card
- [ ] **Subtask 2.2**: Implement slide-up animation for second card (200ms delay)
- [ ] **Subtask 2.3**: Sequence CTA appearance after both cards render
- [ ] **Subtask 2.4**: Add reduced motion accessibility check (`useReducedMotion` hook)
- [ ] **Subtask 2.5**: Test animations on iOS device/simulator

### Task 3: Content Mapping Logic (AC: #2)
- [ ] **Subtask 3.1**: Create `symptomContent.ts` with deterministic painpoint → symptom text mapping
- [ ] **Subtask 3.2**: Implement logic to read selected painpoints from navigation params or context
- [ ] **Subtask 3.3**: Map painpoints to corresponding symptom text (4 categories)
- [ ] **Subtask 3.4**: Handle 1 vs 2 painpoint display logic
- [ ] **Subtask 3.5**: Add default fallback text for edge cases

### Task 4: Data Tracking & Storage (AC: #6)
- [ ] **Subtask 4.1**: Implement analytics tracking for `symptom_insight_shown` event
- [ ] **Subtask 4.2**: Store `initial_symptoms` in Supabase `user_profiles.json` field
- [ ] **Subtask 4.3**: Pass painpoint categories as event payload
- [ ] **Subtask 4.4**: Verify data persists correctly to database

### Task 5: Navigation & Integration (AC: #5, #7)
- [ ] **Subtask 5.1**: Wire up navigation from Story 1.2 (Emotional State Selection) with painpoint params
- [ ] **Subtask 5.2**: Wire up "Next →" CTA to navigate to Story 1.4 (Weave Solution Screen)
- [ ] **Subtask 5.3**: Test complete flow: 1.2 → 1.3 → 1.4
- [ ] **Subtask 5.4**: Verify painpoint data flows correctly through navigation

## Dev Notes

### Architecture Context

**Tech Stack:**
- React Native 0.79 with Expo SDK 53
- React 19
- Expo Router v5 (file-based routing)
- NativeWind (Tailwind CSS for React Native)
- TypeScript (strict mode)

**File Location:**
- Component: `mobile/app/(auth)/onboarding/symptom-insight.tsx`
- Content mapping: `mobile/lib/onboardingContent.ts` or inline
- Shared components: `mobile/components/ui/` (if creating reusable glass card)

**State Management:**
- Navigation params via Expo Router
- Local component state with `useState` for animations
- No server state (all content is static)

**Data Storage:**
- Store in Supabase: `user_profiles` table, `json` field `initial_symptoms`
- Format: `{ "initial_symptoms": ["clarity", "action"] }`

### Technical Requirements

1. **Styling Framework**: Use NativeWind (Tailwind classes)
   ```tsx
   <View className="bg-gray-900/10 backdrop-blur-lg rounded-2xl shadow-lg">
   ```

2. **Animations**: Use React Native Animated API or Reanimated (if already installed)
   ```tsx
   import { Animated } from 'react-native';
   // OR
   import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
   ```

3. **Typography**: Use system fonts (SF Pro on iOS)
   ```tsx
   <Text className="font-semibold text-xl">Why this feels so hard</Text>
   <Text className="font-medium text-base opacity-90">Symptom text...</Text>
   ```

4. **Reduced Motion**: Respect accessibility settings
   ```tsx
   import { AccessibilityInfo } from 'react-native';
   const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);
   ```

### Architecture Compliance

**Naming Conventions:**
- Component file: `PascalCase` → `SymptomInsightScreen.tsx` or use route file `symptom-insight.tsx`
- Functions: `camelCase` → `getSymptomText()`, `handleNext()`
- TypeScript types: `PascalCase` → `SymptomContent`, `Painpoint`

**Data Patterns:**
- Static content (no API calls, no caching needed)
- Store painpoints in snake_case in database: `initial_symptoms`
- Use camelCase in TypeScript: `initialSymptoms`

**Navigation:**
- Use Expo Router file-based routing
- Navigate with `router.push('/onboarding/weave-solution')` or similar
- Pass params via search params or context

### Source References

- **PRD**: `docs/prd.md` lines 490-568 (US-1.3: Symptom Insight Screen)
- **Epics**: `docs/epics.md` lines 485-486 (Story 1.3)
- **Architecture**: `docs/architecture.md` lines 446-485 (Styling, State Management)
- **Design System**: NativeWind for styling
- **Copy Source**: PRD lines 507-536 (exact symptom text for 4 categories)

### Project Structure Notes

```
mobile/
├── app/
│   └── (auth)/
│       └── onboarding/
│           ├── emotional-state.tsx       # Story 1.2 (previous)
│           ├── symptom-insight.tsx       # ← THIS STORY (1.3)
│           └── weave-solution.tsx        # Story 1.4 (next)
├── components/
│   └── ui/
│       ├── GlassCard.tsx                # Reusable glass card (optional)
│       └── AnimatedCard.tsx             # Animated wrapper (optional)
├── lib/
│   ├── onboardingContent.ts             # Symptom text mapping
│   └── supabase.ts                      # Supabase client
└── types/
    └── onboarding.ts                    # Painpoint, SymptomContent types
```

### Testing Requirements

1. **Unit Tests** (co-located `*.test.tsx`)
   - Test symptom text mapping for all 4 categories
   - Test 1 painpoint vs 2 painpoints display logic
   - Test edge case: missing painpoint selection

2. **Component Tests** (React Native Testing Library)
   - Render test: Component renders without crashing
   - Content test: Correct symptom text displays for given painpoints
   - Navigation test: "Next →" button navigates to correct screen
   - Animation test: Verify animations trigger (if not mocked)

3. **Integration Tests**
   - Full flow: Story 1.2 → 1.3 → 1.4
   - Data persistence: Verify `initial_symptoms` saves to Supabase

4. **Accessibility Tests**
   - Reduced motion: Verify animations disabled when reduce motion is on
   - Screen reader: Verify content is readable

### Previous Story Intelligence

**Story 1.2: Emotional State Selection** (previous)
- User selects 1-2 painpoints from 4 cards: Clarity, Action, Consistency, Alignment
- Sends `selected_painpoints` to backend (lightweight)
- Stores in `user_profiles.json.initial_painpoints`
- Smooth transitions with micro-animations

**Key Learnings:**
- Painpoint selection uses card-based UI with animations
- Data stored in Supabase `user_profiles` JSON field
- Navigation uses Expo Router
- Follow same animation patterns for consistency

**Data Flow:**
1. User selects painpoints in Story 1.2
2. Navigation passes painpoints to Story 1.3 (this story)
3. Story 1.3 displays corresponding symptoms
4. Story 1.3 stores symptoms and navigates to Story 1.4

### Implementation Notes

**Animation Library Choice:**
- If **Reanimated** is already installed: Use `FadeIn`, `SlideInUp` (simpler)
- If **not installed**: Use React Native `Animated` API (no extra dependencies)
- Check `package.json` before implementation

**Content Strategy:**
- Hardcode symptom text in `symptomContent.ts` (no CMS needed for MVP)
- Use TypeScript const object for type safety:
  ```tsx
  const SYMPTOM_TEXT: Record<Painpoint, string> = {
    clarity: "You want direction, but...",
    action: "Your mind runs laps...",
    // etc.
  };
  ```

**Performance:**
- No API calls = instant load
- Animations are lightweight (single fade-in, slide-up)
- Total interaction time <10s (AC requirement)

**Design Fidelity:**
- Glass effect: Use `backdrop-blur` + semi-transparent background
- Thread-lines: Subtle SVG pattern or CSS gradient (very faint, not distracting)
- Keep minimalist: Focus on typography and whitespace

### Potential Issues & Mitigations

| Issue | Mitigation |
|-------|-----------|
| Animation jank on low-end devices | Use `useNativeDriver: true`, test on real device |
| Glass effect not rendering | Fallback to solid background with transparency |
| Reduced motion not respected | Always check `AccessibilityInfo.isReduceMotionEnabled()` |
| Painpoint data not passing through navigation | Use Zustand store or React Context as fallback |
| Text overflow on small screens | Use `numberOfLines` and `ellipsizeMode` props |

### Definition of Done

- [ ] Component renders correctly with 1 painpoint
- [ ] Component renders correctly with 2 painpoints
- [ ] Animations work smoothly (fade-in, slide-up, 200ms delay)
- [ ] Reduced motion accessibility respected
- [ ] "Next →" button navigates to Story 1.4
- [ ] Analytics event `symptom_insight_shown` tracked
- [ ] Data stored in `user_profiles.initial_symptoms`
- [ ] All 4 symptom texts display correctly
- [ ] Unit tests pass (>=80% coverage)
- [ ] Integration test passes (1.2 → 1.3 → 1.4 flow)
- [ ] Tested on iOS simulator and real device
- [ ] Code review complete
- [ ] Meets <10s completion time requirement

## Dev Agent Record

### Agent Model Used

_To be filled during implementation_

### Debug Log References

_To be filled during implementation_

### Completion Notes List

_To be filled during implementation_

### File List

_To be filled during implementation_
