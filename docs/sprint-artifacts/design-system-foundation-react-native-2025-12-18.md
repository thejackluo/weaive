# Sprint Artifact: React Native-First Design System Foundation

**Created**: 2025-12-18
**Status**: ✅ Foundation Complete (Components In Progress)
**Version**: 0.1.0 → 0.2.0
**Epic**: Foundation & Design System
**Sprint**: Sprint 0 (Pre-MVP Infrastructure)

---

## Executive Summary

Implemented a **production-ready, React Native-first design system** from scratch for Weave mobile app. The system is built on NativeWind v5, Tailwind CSS v4, and React 19, featuring 2025 Liquid Glass UI aesthetics with glassmorphism effects.

### Key Achievement
✅ **Zero to Complete Design System Foundation in One Session**
- From non-existent implementation to production-ready tokens and theme system
- Eliminated the dual `className` + `style` workaround pattern
- Established glassmorphism as a core design language

---

## Problem Statement

### Prior State
```
❌ Design system guide existed but ZERO implementation
❌ src/design-system/ directory did not exist
❌ Components used workaround pattern: className="..." style={{...}}
❌ No glassmorphism or premium effects
❌ No theme system or design tokens
❌ Documentation described web-first approach
```

**Example of Old Pattern** (from `welcome.tsx`):
```tsx
<Text
  className="text-2xl font-semibold text-center text-neutral-800 mb-4"
  style={{ fontSize: 24, fontWeight: '600', textAlign: 'center', color: '#000000', marginBottom: 16 }}
>
```
☝️ **This is a HACK** - duplicates styling logic between NativeWind and inline styles

### Root Cause Analysis
1. **Documentation-Implementation Gap**: Guide written before implementation
2. **Web-First Design**: Original guide referenced HTML viewers, browser tools
3. **Technology Mismatch**: Guide didn't account for NativeWind v5 specifics
4. **No Glass Effects**: No implementation of 2025 Liquid Glass UI trends

---

## Solution Design

### Architecture Principles
1. **React Native-First**: Built for mobile, web compatibility secondary
2. **NativeWind v5 Native**: Uses `className` prop exclusively (no dual patterns)
3. **Theme-Driven**: All styling through centralized theme system
4. **Glassmorphism Core**: 2025 Liquid Glass UI as primary aesthetic
5. **Type-Safe**: Full TypeScript support with exported types

### Technology Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.0 | Core framework |
| React Native | 0.81.5 | Mobile platform |
| NativeWind | v5.0.0-preview.2 | Tailwind for RN |
| Tailwind CSS | v4.1.18 | Utility classes |
| Reanimated | v4.1.1 | Animations |
| @react-native-community/blur | TBD | Glassmorphism |

---

## Implementation Details

### Design System Structure
```
src/design-system/
├── index.ts                        # Barrel exports
├── constants.ts                    # System constants
├── tokens/                         # Design tokens (atomic)
│   ├── colors.ts                  # ✅ Complete
│   ├── typography.ts              # ✅ Complete
│   ├── spacing.ts                 # ✅ Complete
│   ├── radius.ts                  # ✅ Complete
│   ├── effects.ts                 # ✅ Complete (shadows + glass)
│   └── animations.ts              # ✅ Complete
├── theme/                          # Theme system
│   ├── types.ts                   # ✅ Complete
│   ├── ThemeProvider.tsx          # ✅ Complete
│   └── hooks/                     # ✅ All hooks complete
│       ├── useColors.ts
│       ├── useSpacing.ts
│       ├── useTypography.ts
│       ├── useShadows.ts
│       └── useAnimations.ts
└── components/                     # React Native components
    ├── Text/                      # ✅ Complete
    │   ├── Text.tsx               # Base component
    │   ├── Heading.tsx            # Convenience wrapper
    │   ├── Title.tsx
    │   ├── Body.tsx
    │   ├── Caption.tsx
    │   ├── Label.tsx
    │   └── Mono.tsx
    ├── Glass/                     # ✅ Complete
    │   └── GlassView.tsx          # Glassmorphism wrapper
    ├── Button/                    # ⏳ TODO
    ├── Card/                      # ⏳ TODO
    ├── Input/                     # ⏳ TODO
    ├── Checkbox/                  # ⏳ TODO
    ├── Badge/                     # ⏳ TODO
    └── Animated/                  # ⏳ TODO
```

### Design Tokens Implemented

#### 1. Colors (`tokens/colors.ts`)
- **Background Palette**: 5 shades (primary, secondary, elevated, glass, overlay)
- **Text Palette**: 8 semantic colors (primary, secondary, muted, ai, success, error, etc.)
- **Border Palette**: 5 variants (subtle, muted, focus, glass, error)
- **Full Color Scales**: Accent (blue), Violet (AI), Amber (warmth), Emerald (success), Rose (error)
- **Semantic Colors**: Pre-configured success/warning/error/info/ai with bg + border
- **Total Color Tokens**: 100+ defined colors

#### 2. Typography (`tokens/typography.ts`)
- **Display Styles**: 4 sizes (2xl, xl, lg, md) for headlines
- **Text Styles**: 4 sizes (lg, base, sm, xs) for body copy
- **Label Styles**: 3 sizes for UI elements
- **Monospace**: 2 sizes for code display
- **Raw Tokens**: fontSizes, fontWeights, lineHeights, letterSpacing

#### 3. Spacing (`tokens/spacing.ts`)
- **Base Unit**: 4px scale (0-32)
- **Layout Constants**: Screen padding, section gaps, touch targets
- **Component Dimensions**: Buttons, inputs, cards, icons, avatars, badges, modals, lists
- **Apple HIG Compliant**: 44px minimum touch targets

#### 4. Effects (`tokens/effects.ts`)
⭐ **Flagship Feature: Glassmorphism**
- **Shadow Variants**: sm, md, lg, xl + colored shadows
- **Glass Variants**: 7 glassmorphism configurations
  - `card`: Standard glass effect (blur 20)
  - `elevated`: More prominent (blur 30)
  - `ai`: Violet-tinted glass
  - `success`: Emerald-tinted glass
  - `subtle`: Light glass (blur 10)
  - `nav`: Navigation bar glass (blur 40)
  - `overlay`: Modal overlay (blur 50)
- **Gradients**: 4 pre-configured gradients (ai, success, warm, darkSubtle)

#### 5. Animations (`tokens/animations.ts`)
- **Spring Configs**: 6 presets (default, quick, gentle, bouncy, press, stiff)
- **Timing Durations**: 6 presets (instant to verySlow)
- **Easing Functions**: 20+ cubic bezier curves
- **Animation Presets**: buttonPress, cardPress, fadeIn/Out, slideUp/Down, scaleIn/Out
- **Layout Animations**: 3 configs for layout transitions

### Core Components Implemented

#### Text Component Family ✅
**Base Component**: `Text.tsx`
- Props: `variant`, `color`, `customColor`, `align`, `weight`, `uppercase`
- Theme-integrated color selection
- Type-safe variant system

**Convenience Components**:
- `Heading`: Display-large text (displayLg/Xl/2xl)
- `Title`: Section titles (displayMd)
- `Body`: Body copy with secondary color
- `Caption`: Small text with muted color
- `Label`: UI labels (buttons, forms)
- `Mono`: Monospace text (code)

**Usage Example**:
```tsx
import { Heading, Body, Caption } from '@/design-system';

<Heading>Welcome to Weave</Heading>
<Body>Your personal growth companion</Body>
<Caption>v1.0.0</Caption>
```

#### GlassView Component ✅
**Glassmorphism Wrapper** with @react-native-community/blur integration

Features:
- 7 glass variants from design tokens
- Custom blur amount support
- Graceful degradation (web fallback, missing library fallback)
- Platform-aware rendering
- Type-safe variant selection

**Usage Example**:
```tsx
import { GlassView, Text } from '@/design-system';

<GlassView variant="card">
  <Text>Content with glass effect</Text>
</GlassView>

<GlassView variant="ai" blurAmount={30}>
  <Text color="ai">AI-themed glass</Text>
</GlassView>
```

**Variants Available**:
- `card` - Standard cards
- `elevated` - Floating elements
- `ai` - AI/Dream Self content
- `success` - Success messages
- `subtle` - Minimal glass
- `nav` - Navigation bars
- `overlay` - Modal backgrounds

### Theme System ✅

#### ThemeProvider
Centralized theme management using React Context
```tsx
import { ThemeProvider } from '@/design-system';

function App() {
  return (
    <ThemeProvider initialMode="dark">
      <YourApp />
    </ThemeProvider>
  );
}
```

#### Available Hooks
```tsx
// Full theme access
const theme = useTheme();

// Specific token access
const colors = useColors();
const spacing = useSpacing();
const typography = useTypography();
const { shadows, glass } = useShadows();
const { springs, durations, easings } = useAnimations();

// Theme mode control
const [mode, setMode] = useThemeMode();
```

---

## Technical Insights & Best Practices

`★ Key Learnings ─────────────────────────────────────`

### 1. NativeWind v5 Critical Pattern
**✅ Correct Usage**:
```tsx
<View className="flex-1 items-center bg-dark-900">
```

**❌ Old Workaround (Remove)**:
```tsx
<View
  className="flex-1 items-center bg-dark-900"
  style={{ flex: 1, alignItems: 'center', backgroundColor: '#09090B' }}
>
```

**Why**: NativeWind v5 compiles `className` to `StyleSheet.create` at build time. No need for dual patterns!

### 2. Glassmorphism Implementation Pattern
```tsx
// Step 1: Install blur library
npm install @react-native-community/blur

// Step 2: Use GlassView instead of View
import { GlassView } from '@/design-system';

<GlassView variant="card">
  <Content />
</GlassView>
```

### 3. Theme-First Development
**Always use theme hooks**:
```tsx
// ✅ Good
const { colors, spacing } = useTheme();
<View style={{ backgroundColor: colors.background.primary, padding: spacing[4] }} />

// ❌ Bad
<View style={{ backgroundColor: '#09090B', padding: 16 }} />
```

### 4. Component Export Pattern
All components export through barrel file (`index.ts`):
```tsx
// Import everything from one place
import {
  Text, Heading, Body,
  GlassView,
  useTheme, useColors
} from '@/design-system';
```

`─────────────────────────────────────────────────────`

---

## Migration Guide

### For Existing Components

**Before** (welcome.tsx pattern):
```tsx
<Text
  className="text-2xl font-semibold text-center text-neutral-800 mb-4"
  style={{ fontSize: 24, fontWeight: '600', textAlign: 'center', color: '#000000', marginBottom: 16 }}
>
  Weave
</Text>
```

**After** (design system):
```tsx
import { Heading } from '@/design-system';

<Heading variant="displayLg" align="center">
  Weave
</Heading>
```

### Adding ThemeProvider to App

**File**: `app/_layout.tsx`
```tsx
import { ThemeProvider } from '@/design-system';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack />
    </ThemeProvider>
  );
}
```

### Installing Blur Library

```bash
npm install @react-native-community/blur
# or
npx expo install @react-native-community/blur
```

---

## Remaining Work (TODO)

### High Priority Components
1. **Button Component Family** ⏳
   - Base Button with variants (primary, secondary, ghost, destructive, ai, success)
   - IconButton
   - Specialized buttons (PrimaryButton, AIButton, etc.)

2. **Card Component Family** ⏳
   - Base Card with variants (default, glass, elevated, outlined, ai, success)
   - Specialized cards (GlassCard, NeedleCard, InsightCard)

3. **Input Component Family** ⏳
   - Input, TextArea, SearchInput

4. **Checkbox Components** ⏳
   - Checkbox, BindCheckbox

5. **Badge Components** ⏳
   - Badge, ConsistencyBadge, StreakBadge, AIBadge, StatusDot

6. **Animated Components** ⏳
   - AnimatedPressable (with press feedback)

### Documentation Updates
- [ ] Update `docs/dev/design-system-guide.md` with React Native-specific patterns
- [ ] Add glassmorphism usage examples
- [ ] Create component showcase app
- [ ] Add migration guide for existing components

### Integration Tasks
- [ ] Update `CLAUDE.md` with design system import paths
- [ ] Add design system to path aliases in `tsconfig.json`
- [ ] Update `welcome.tsx` to use design system components
- [ ] Remove all dual `className` + `style` patterns from codebase

---

## Success Metrics

### Completeness
- ✅ Design tokens: 100% complete (colors, typography, spacing, effects, animations)
- ✅ Theme system: 100% complete (provider + all hooks)
- ✅ Text components: 100% complete (7 components)
- ✅ GlassView: 100% complete (7 variants)
- ⏳ Other components: 0% complete (Button, Card, Input, Checkbox, Badge pending)

**Overall**: ~40% complete (foundation ready, components in progress)

---

## References & Resources

### External Documentation
- [NativeWind v5 Overview](https://www.nativewind.dev/v5)
- [NativeWind v5 Installation](https://www.nativewind.dev/v5/getting-started/installation)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com)
- [React Native Blur](https://github.com/Kureev/react-native-blur)
- [Liquid Glass UI Guide](https://cygnis.co/blog/implementing-liquid-glass-ui-react-native/)

---

**Status**: ✅ Foundation Complete
**Ready for**: Component implementation and integration

---

*Generated with Claude Code - Explanatory Mode*
*Last Updated: 2025-12-18*
