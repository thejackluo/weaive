# Story 1.2: Emotional State Selection (Front-End Only)

Status: ready-for-dev

**Epic:** 1 - Onboarding (Optimized Hybrid Flow) | **Phase:** PHASE 1 - Emotional Hook (Pre-Auth, 45s max)
**Story Points:** 3 | **Priority:** P1 | **Focus:** Front-End Only

---

## Story

As a **new user in the onboarding flow**,
I want **to select 1-2 emotional painpoints from 4 cards (Clarity, Action, Consistency, Alignment)**,
so that **the app understands my starting emotional state and can personalize my experience**.

---

## Acceptance Criteria

### Functional Requirements (FR-1.2)

1. **Display 4 Painpoint Cards**
   - Show 4 cards with labels: "Clarity", "Action", "Consistency", "Alignment"
   - Each card has an icon, title, and brief description (1 sentence)
   - Cards are visually distinct and tappable
   - Use glass card effect (Opal-inspired) for visual appeal

2. **Selection Interaction**
   - User can select 1-2 cards (multi-select, minimum 1, maximum 2)
   - First tap: Card becomes selected (visual state change)
   - Second tap on same card: Deselect
   - Attempting to select 3rd card: Disable other cards or show inline message "Choose up to 2"
   - Selected state: Border highlight, subtle scale animation, check icon overlay

3. **Smooth Transitions**
   - Card tap: Smooth scale animation (0.98 → 1.0, 150ms ease-out)
   - Selection state change: Fade in check icon (200ms)
   - Between screens: Slide transition (forward direction)

4. **Continue Button**
   - Disabled until at least 1 card selected
   - Enabled state: Primary button (bg-primary-500)
   - Tapping Continue: Navigate to next screen (Story 1.3: Insight Reflection)
   - **Frontend stores selection temporarily** (no backend call in this story, per user request)

5. **Performance**
   - Screen loads in <2s
   - Selection interaction feels instant (<100ms response)
   - Total time on screen: <15s typical user

### Non-Functional Requirements

- **Accessibility:** Cards have accessible labels, minimum touch target 44x44pt
- **Responsive:** Works on iPhone X to iPhone 15 Pro Max (5.8" - 6.7"), single column on screens <375px
- **Design System:** Use existing design system components (Card, Button, Text)
- **TypeScript:** Strict typing for state and props
- **Safe Area:** Proper safe area handling for notch/dynamic island

---

## Tasks / Subtasks

- [ ] **Task 1: Create PainpointCard Component** (AC: #1, #2)
  - [ ] 1.1: Define TypeScript interface for PainpointCard props
  - [ ] 1.2: **REUSE existing Card component** from `src/design-system/components/Card.tsx` with `variant="glass"` and `pressable={true}` - DO NOT build from scratch
  - [ ] 1.3: Add icon using `expo-symbols` or Ionicons, title, and description layout
  - [ ] 1.4: Implement selection state (primary border, check icon overlay with fade animation, elevated shadow)
  - [ ] 1.5: Add haptic feedback on **selection state change only** (toggle) - `Light` for select, `Medium` for deselect

- [ ] **Task 2: Build EmotionalStateScreen** (AC: #1, #2, #4)
  - [ ] 2.1: Create screen with SafeAreaView wrapper, header and instructions
  - [ ] 2.2: Render 4 PainpointCard components in responsive grid (Flexbox `flexWrap`, each card `width: '48%'`, `gap: spacing[3]`, single column on <375px)
  - [ ] 2.3: Implement multi-select logic (max 2 cards) using zustand onboarding store
  - [ ] 2.4: Add inline validation Text component for 3rd card attempt ("Choose up to 2")
  - [ ] 2.5: Manage selection state in zustand store (`src/stores/onboardingStore.ts`)

- [ ] **Task 3: Add Continue Button Logic** (AC: #4)
  - [ ] 3.1: Render Continue button from design system (disabled by default)
  - [ ] 3.2: Enable button when 1-2 cards selected
  - [ ] 3.3: Store selected painpoints in zustand onboarding store
  - [ ] 3.4: Navigate to Story 1.3 via `router.push('/onboarding/insight-reflection')`

- [ ] **Task 4: Implement Animations** (AC: #3)
  - [ ] 4.1: Card tap animation (built into Card component - already done)
  - [ ] 4.2: Add check icon fade-in animation (`opacity: useSharedValue(0)` → 1 via `withTiming(200ms)`)
  - [ ] 4.3: Add screen transition animation (Expo Router default slide)

- [ ] **Task 5: Test & Polish** (AC: #5)
  - [ ] 5.1: Test on iPhone SE, 14, 15 Pro Max (responsive grid + single column)
  - [ ] 5.2: Verify accessibility (VoiceOver labels, selection state announcements)
  - [ ] 5.3: Test edge cases (rapid taps, selecting/deselecting, 3rd card validation)
  - [ ] 5.4: Performance profiling (<2s load, instant interactions, 60 FPS animations)
  - [ ] 5.5: Verify haptic feedback timing (only on toggle, not every press)
  - [ ] 5.6: Test safe area on notched devices (iPhone X+)

---

## Dev Notes

### Architecture Context

**Tech Stack:**
- **Mobile:** React Native 0.79 (via Expo SDK 53), React 19, TypeScript (strict mode)
- **Routing:** Expo Router v5 (file-based routing)
- **Styling:** NativeWind (Tailwind CSS for React Native) + Custom design system
- **State:** zustand for onboarding state (per architecture.md), useState for local UI state only
- **Animations:** React Native Reanimated 3 (already integrated in Card component)
- **Safe Area:** `react-native-safe-area-context` with SafeAreaView wrapper

**Design System:**
- **Location:** `src/design-system/`
- **Components Available:** Card (with glass variant!), Button, Text, Input, Badge, Checkbox
- **Tokens:** `src/design-system/tokens/` - colors, typography, spacing, shadows, radius, animations
- **Theme:** `useTheme()` hook provides all tokens

**State Management Strategy:**
- **Zustand store:** Create `src/stores/onboardingStore.ts` for onboarding flow state
- **Local useState:** Only for transient UI state (e.g., animation values)
- **DO NOT use Context API** - architecture specifies zustand for shared UI state

### Component Structure

```
EmotionalStateScreen (SafeAreaView)
├── Header (Text: displayXl, "What's holding you back?")
├── Subtitle (Text: textBase, "Choose 1-2 areas you want to improve")
├── PainpointGrid (Flexbox: flexWrap, gap spacing[3])
│   ├── PainpointCard (Clarity) - Card variant="glass" pressable
│   ├── PainpointCard (Action) - Card variant="glass" pressable
│   ├── PainpointCard (Consistency) - Card variant="glass" pressable
│   └── PainpointCard (Alignment) - Card variant="glass" pressable
├── ValidationMessage (Text: textSm, error color, if attempting 3rd)
└── ContinueButton (Button variant="primary", fullWidth, disabled until 1-2 selected)
```

### Critical Implementation Details

**1. REUSE Card Component (DO NOT BUILD FROM SCRATCH)**
```typescript
import { Card } from '@/design-system/components/Card';

// Card already has:
// - variant="glass" for glass effect
// - pressable={true} for tappability
// - Built-in scale animation (0.98 on press)
// - useTheme() integration
// - Accessibility support

<Card
  variant="glass"
  pressable
  onPress={handleCardPress}
  style={isSelected ? selectedStyle : {}}
>
  {/* Your content */}
</Card>
```

**2. Icon Rendering (SF Symbols)**
Install `expo-symbols` for SF Symbol support:
```bash
npx expo install expo-symbols
```

Usage:
```typescript
import SymbolView from 'expo-symbols';

<SymbolView
  name={painpoint.icon} // e.g., "lightbulb.fill"
  size={24}
  tintColor={colors.primary[500]}
/>
```

**3. Check Icon for Selection**
Use Ionicons from `@expo/vector-icons` (pre-installed with Expo):
```typescript
import { Ionicons } from '@expo/vector-icons';

<Ionicons
  name="checkmark-circle"
  size={24}
  color={colors.primary[500]}
  style={{ opacity: checkOpacity }} // Animated value
/>
```

**4. Grid Layout (Responsive)**
```typescript
<View style={{
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: spacing[3], // 12px
  justifyContent: 'space-between',
}}>
  {PAINPOINTS.map((painpoint) => (
    <PainpointCard
      key={painpoint.id}
      painpoint={painpoint}
      style={{
        width: screenWidth < 375 ? '100%' : '48%', // Single column on small screens
      }}
    />
  ))}
</View>
```

**5. Zustand Store Setup**
```typescript
// src/stores/onboardingStore.ts
import { create } from 'zustand';

interface OnboardingStore {
  selectedPainpoints: string[];
  setSelectedPainpoints: (painpoints: string[]) => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  selectedPainpoints: [],
  setSelectedPainpoints: (painpoints) => set({ selectedPainpoints: painpoints }),
}));
```

**6. Safe Area Implementation**
```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView style={{ flex: 1, paddingHorizontal: spacing[4] }}>
  {/* Screen content */}
</SafeAreaView>
```

**7. Haptic Feedback (Selection Toggle Only)**
```typescript
import * as Haptics from 'expo-haptics';

const handleCardPress = (id: string) => {
  const isCurrentlySelected = selectedPainpoints.includes(id);

  // Trigger haptic ONLY on state change
  if (isCurrentlySelected) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Deselect
  } else {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Select
  }

  // Update state...
};
```

### Painpoint Card Data

```typescript
interface Painpoint {
  id: string;
  title: string;
  description: string;
  icon: string; // SF Symbol name for SymbolView
}

const PAINPOINTS: Painpoint[] = [
  {
    id: 'clarity',
    title: 'Clarity',
    description: 'I know what I want but struggle to define clear goals',
    icon: 'lightbulb.fill',
  },
  {
    id: 'action',
    title: 'Action',
    description: 'I have goals but struggle to take consistent action',
    icon: 'figure.walk',
  },
  {
    id: 'consistency',
    title: 'Consistency',
    description: 'I start strong but lose momentum over time',
    icon: 'arrow.triangle.2.circlepath',
  },
  {
    id: 'alignment',
    title: 'Alignment',
    description: 'My actions don't reflect who I want to become',
    icon: 'person.badge.key.fill',
  },
];
```

### Design System Usage

Use design system tokens via `useTheme()` hook. Reference `src/design-system/tokens/` for all values:

- **Colors:** `colors.primary[500]`, `colors.primary[600]`, `colors.neutral[800]`, `colors.neutral[600]`
- **Typography:** `typography.displayXl`, `typography.textBase`, `typography.displayMd`, `typography.textSm`
- **Spacing:** `spacing[4]` (16px), `spacing[3]` (12px), `spacing[6]` (24px)
- **Shadows:** `shadow.base` (default), `shadow.md` (selected)
- **Radius:** `radius.md` (12px cards), `radius.base` (8px buttons)
- **Glass effect:** Already built into Card variant="glass"

### Animation Specifications

**Card Tap Animation:** Already built into Card component - no additional code needed.

**Check Icon Fade:** Use `opacity: useSharedValue(0)` fading to 1 on selection via `withTiming(200ms)`.

### File Structure

```
mobile/app/(onboarding)/emotional-state.tsx
mobile/components/onboarding/PainpointCard.tsx
mobile/stores/onboardingStore.ts (create if not exists)
```

### Integration Points

**Inputs:**
- None (first screen after welcome in onboarding)

**Outputs:**
- `selectedPainpoints: string[]` → Stored in zustand onboarding store
- Example: `['clarity', 'action']`

**Navigation:**
- **From:** Story 1.1 (Welcome Screen) or direct link
- **To:** Story 1.3 (Insight Reflection) via `router.push('/onboarding/insight-reflection')`

### Accessibility Requirements

- Each PainpointCard: `accessibilityLabel="Clarity painpoint. Double tap to select"`
- Selected state: `accessibilityLabel="Clarity painpoint. Selected. Double tap to deselect"`
- Continue button: `accessibilityLabel="Continue to next step"`
- Disabled Continue: `accessibilityHint="Select at least one painpoint first"`
- All interactive elements: Minimum 44x44pt touch target

### Performance Optimization

- Use `React.memo` for PainpointCard component to prevent unnecessary re-renders
- Use `useCallback` for event handlers to prevent function recreation
- Card component animations run on UI thread (60 FPS) via Reanimated

### Edge Cases

1. **User taps Continue without selecting:** Button disabled state prevents this
2. **User navigates back:** Zustand store preserves selection state automatically
3. **Screens <375px width:** Grid switches to single column layout
4. **Attempting 3rd card:** Show inline validation message, prevent selection
5. **Rapid taps:** Built-in debouncing from Card component prevents issues

---

## Project Structure Notes

### Alignment with Unified Project Structure

**Current Location:**
- `mobile/` directory is not yet created (as per Project Scaffolding - Story 0.1)
- Design system exists at `src/design-system/`
- Use existing design system via relative imports until Project Scaffolding clarifies structure

**Expected Paths (Post-Scaffolding):**
- Screen: `mobile/app/(onboarding)/emotional-state.tsx`
- Component: `mobile/components/onboarding/PainpointCard.tsx`
- Store: `mobile/stores/onboardingStore.ts`

**Naming Conventions:**
- Component files: PascalCase (`PainpointCard.tsx`)
- Screen files: kebab-case (`emotional-state.tsx`)
- Store files: camelCase (`onboardingStore.ts`)
- Const arrays: UPPER_SNAKE_CASE (`PAINPOINTS`)
- Component functions: PascalCase (`EmotionalStateScreen`)
- Variables/functions: camelCase (`selectedPainpoints`, `handleCardPress`)

---

## References

### Critical Source Documents

- **[Source: docs/epics.md#Epic-1-Story-1.2]** - Story requirements and acceptance criteria
- **[Source: docs/ux-design.md#Color-Palette]** - Primary colors, glass effect specifications
- **[Source: docs/architecture.md#State-Management]** - Zustand for shared UI state, useState for local

### Design System Components (REUSE THESE)

- **[File: src/design-system/components/Card.tsx]** - Base Card with glass variant, pressable, built-in animations
- **[File: src/design-system/components/Button.tsx]** - Primary button with disabled state
- **[File: src/design-system/components/Text.tsx]** - Typography components

### Technical Libraries

- **expo-symbols:** SF Symbol rendering (`npx expo install expo-symbols`)
- **@expo/vector-icons:** Ionicons for check icon (pre-installed)
- **react-native-safe-area-context:** SafeAreaView (pre-installed with Expo)
- **zustand:** State management (`npm install zustand` if not installed)

---

## Dev Agent Record

### Agent Model Used

_To be filled by Dev agent executing this story_

### Debug Log References

_To be filled during implementation_

### Completion Notes List

_To be filled after implementation:_
- Components created and reused from design system
- Zustand store setup and integration
- Icon library chosen (expo-symbols vs Ionicons)
- Grid responsive behavior tested
- Safe area handling verified
- Haptic feedback timing confirmed
- Performance benchmarks

### File List

_To be filled after implementation with actual file paths created_

---

**🎯 Story Ready for Dev! Front-end focus only - comprehensive context provided to prevent common implementation mistakes.**
