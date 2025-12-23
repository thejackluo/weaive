# Story DS.2: Core Primitives (Text, Buttons, Icons)

**Status:** in_progress

**Epic:** DS - Design System Rebuild  
**Story Points:** 6  
**Priority:** M (Must Have)  
**Created:** 2025-12-23  
**Depends On:** DS.1 (Foundation tokens completed)

---

## Story

As a **developer**,  
I want **foundational text, button, and icon components with variants and composable anatomy**,  
so that **I can build UIs with consistent typography, interactions, and spring-based animations across all Weave app screens**.

---

## Business Context

This is the **second story** of Epic DS (Design System Rebuild). With DS.1 foundation complete (220+ tokens, theme system, animations), we now build the core UI primitives that ALL other components will use.

**Why This Matters:**
- **19 components** that form the foundation of every screen
- **Composable anatomy** (Radix pattern) enables flexible layouts
- **Spring animations** provide premium, delightful interactions
- **Lucide icons** (100+ curated) for consistent iconography
- **Type-safe variants** prevent styling bugs

**Success Metric:** All future components use these primitives; zero standalone Text/Button implementations.

---

## Acceptance Criteria

### AC-1: Text Components (11 total)

**1. Base Text Component**
- [ ] Component: `Text.tsx` with variant system
- [ ] Props: `variant`, `color`, `weight`, `align`, `numberOfLines`, `ellipsizeMode`
- [ ] Variants: `displayLg`, `displayMd`, `displaySm`, `titleLg`, `titleMd`, `titleSm`, `bodyLg`, `bodyMd`, `bodySm`, `caption`, `label`
- [ ] Auto-applies typography tokens from DS-1
- [ ] Supports theme color tokens via `color` prop
- [ ] TypeScript types with prop intellisense

**2. AnimatedText Component**
- [ ] Component: `AnimatedText.tsx` extending Text
- [ ] Props: Same as Text + `animation` (`fadeIn` | `slideUp` | `typewriter`)
- [ ] Uses Reanimated `withSpring()` for entrance animations
- [ ] Respects reduced motion accessibility setting

**3. Heading Component**
- [ ] Component: `Heading.tsx` for semantic headings
- [ ] Props: `level` (1-6), `color`, `weight`
- [ ] Maps levels to display/title variants automatically
- [ ] Accessibility: proper heading semantics

**4-9. Convenience Text Components**
- [ ] `Title.tsx` - Preset for `variant="titleMd"`
- [ ] `Subtitle.tsx` - Preset for `variant="titleSm"`
- [ ] `Body.tsx` - Preset for `variant="bodyMd"`
- [ ] `BodySmall.tsx` - Preset for `variant="bodySm"`
- [ ] `Caption.tsx` - Preset for `variant="caption"`
- [ ] `Label.tsx` - Preset for `variant="label"`

**10. Link Component**
- [ ] Component: `Link.tsx` for interactive text
- [ ] Props: `href`, `onPress`, `external`, `disabled`
- [ ] Spring-based press animation (scale 1.0 → 0.98 → 1.0)
- [ ] Underline decoration
- [ ] External link opens in browser

**11. Mono Component**
- [ ] Component: `Mono.tsx` for monospace text
- [ ] Props: `variant` (mono.xs, mono.sm, mono.md, mono.lg), `color`
- [ ] Uses monospace font family from tokens

### AC-2: Button Components (7 total)

**1. Base Button Component**
- [ ] Component: `Button.tsx` with composable anatomy (Radix pattern)
- [ ] **Unstyled variant** for full customization
- [ ] **Styled variants:** `primary`, `secondary`, `ghost`, `destructive`, `ai`
- [ ] **Composable anatomy:**
  ```tsx
  <Button variant="primary" size="md" onPress={handlePress}>
    <Button.Icon name="sparkles" />
    <Button.Text>Generate</Button.Text>
    <Button.Spinner /> {/* Shows during loading */}
  </Button>
  ```
- [ ] Props: `variant`, `size` (`sm` | `md` | `lg`), `disabled`, `loading`, `onPress`, `fullWidth`
- [ ] **Spring press animation:**
  ```tsx
  const scale = useSharedValue(1)
  const handlePressIn = () => { scale.value = withSpring(0.95, springs.snappy) }
  const handlePressOut = () => { scale.value = withSpring(1, springs.snappy) }
  ```
- [ ] **Color-matched shadows:** Primary button (violet) → violet glow shadow
- [ ] Loading state shows spinner, disables press
- [ ] Disabled state: 50% opacity, no interaction

**2-6. Convenience Button Components**
- [ ] `PrimaryButton.tsx` - Preset with `variant="primary"`
- [ ] `SecondaryButton.tsx` - Preset with `variant="secondary"`
- [ ] `GhostButton.tsx` - Preset with `variant="ghost"`
- [ ] `DestructiveButton.tsx` - Preset with `variant="destructive"` (red accent)
- [ ] `AIButton.tsx` - Preset with `variant="ai"` (gradient background, sparkle icon, special glow)

**7. IconButton Component**
- [ ] Component: `IconButton.tsx` for icon-only buttons
- [ ] Props: `icon` (Lucide icon name), `size`, `variant`, `onPress`
- [ ] Square aspect ratio (size x size)
- [ ] Icon centered within button
- [ ] Same variants as base Button

### AC-3: Icon Wrapper Component (1 total)

**1. Icon Component**
- [ ] Component: `Icon.tsx` wrapping lucide-react-native
- [ ] Props: `name` (100+ curated Lucide icons), `size`, `color`, `strokeWidth`
- [ ] Themed colors: `color="text.primary"` maps to theme token
- [ ] Default size: 24px
- [ ] Default strokeWidth: 2
- [ ] TypeScript types for icon names (autocomplete)

### AC-4: Package Structure

```
packages/weave-design-system/src/
├── components/
│   ├── Text/
│   │   ├── Text.tsx               # Base component
│   │   ├── AnimatedText.tsx
│   │   ├── Heading.tsx
│   │   ├── Title.tsx
│   │   ├── Subtitle.tsx
│   │   ├── Body.tsx
│   │   ├── BodySmall.tsx
│   │   ├── Caption.tsx
│   │   ├── Label.tsx
│   │   ├── Link.tsx
│   │   ├── Mono.tsx
│   │   ├── types.ts               # TypeScript types
│   │   └── index.ts               # Barrel exports
│   ├── Button/
│   │   ├── Button.tsx             # Base component with composable anatomy
│   │   ├── PrimaryButton.tsx
│   │   ├── SecondaryButton.tsx
│   │   ├── GhostButton.tsx
│   │   ├── DestructiveButton.tsx
│   │   ├── AIButton.tsx
│   │   ├── IconButton.tsx
│   │   ├── types.ts
│   │   └── index.ts
│   ├── Icon/
│   │   ├── Icon.tsx
│   │   ├── types.ts
│   │   └── index.ts
│   └── index.ts                   # Export all
└── index.ts                       # Main entry point
```

### AC-5: Testing Requirements

**Unit Tests (Jest + React Native Testing Library):**
- [ ] Text component: variants, colors, truncation
- [ ] AnimatedText: animation triggers, accessibility
- [ ] Button: press interactions, loading state, disabled state
- [ ] Button composable anatomy: Icon, Text, Spinner render correctly
- [ ] IconButton: icon rendering, press feedback
- [ ] Link: onPress callback, external link handling
- [ ] Icon: color mapping, size variants

**Visual Regression Tests (Chromatic):**
- [ ] All 11 text variants in light + dark modes
- [ ] All 5 button variants in 3 sizes (sm, md, lg)
- [ ] Button states: default, pressed, loading, disabled
- [ ] IconButton in all variants
- [ ] Link: default, pressed, disabled

**Accessibility Tests:**
- [ ] Heading levels properly announced by screen readers
- [ ] Button labels read correctly
- [ ] Disabled buttons not focusable
- [ ] Link external state announced
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1 for text)

### AC-6: Documentation

**Storybook Stories:**
- [ ] Text: All 11 variants with interactive controls
- [ ] AnimatedText: Animation showcase (fadeIn, slideUp, typewriter)
- [ ] Button: All variants, sizes, states
- [ ] Button composable anatomy examples
- [ ] IconButton: All variants
- [ ] Link: With/without href, external links
- [ ] Icon: Icon gallery (100+ icons), size/color controls

**README Updates:**
- [ ] Usage examples for each component
- [ ] Composable anatomy guide
- [ ] Spring animation customization guide
- [ ] Lucide icon integration guide

### AC-7: Integration with DS-1 Foundation

- [ ] All text components use typography tokens from DS-1
- [ ] All buttons use color tokens from DS-1
- [ ] All animations use spring configs from DS-1
- [ ] Button shadows use effect tokens from DS-1
- [ ] Icons use size/spacing tokens from DS-1

---

## Technical Implementation Notes

### Text Component Architecture

**Base Text with Variant System:**
```tsx
import { Text as RNText } from 'react-native';
import { useTheme } from '../../theme';

export const Text = ({ variant = 'bodyMd', color, ...props }) => {
  const { typography, colors } = useTheme();
  
  // Apply typography variant
  const variantStyle = typography[variant];
  
  // Apply color token
  const textColor = color ? colors.text[color] : colors.text.primary;
  
  return (
    <RNText style={[variantStyle, { color: textColor }]} {...props} />
  );
};
```

### Button Component with Composable Anatomy

**Button Architecture (Radix pattern):**
```tsx
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

export const Button = ({ variant, size, children, onPress, ...props }) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));
  
  const handlePressIn = () => {
    scale.value = withSpring(0.95, springs.snappy);
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, springs.snappy);
  };
  
  return (
    <Animated.View style={[styles[variant], animatedStyle]}>
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
        {children}
      </Pressable>
    </Animated.View>
  );
};

// Composable sub-components
Button.Icon = ({ name, ...props }) => <Icon name={name} {...props} />;
Button.Text = ({ children }) => <Text variant="label">{children}</Text>;
Button.Spinner = () => <ActivityIndicator />;
```

### Icon Component with Lucide Integration

**Icon Wrapper:**
```tsx
import { icons } from 'lucide-react-native';
import { useTheme } from '../../theme';

export const Icon = ({ name, size = 24, color = 'text.primary', strokeWidth = 2, ...props }) => {
  const { colors } = useTheme();
  const IconComponent = icons[name];
  
  // Map color token to hex
  const iconColor = color.includes('.') 
    ? colors[color.split('.')[0]][color.split('.')[1]] 
    : color;
  
  return <IconComponent size={size} color={iconColor} strokeWidth={strokeWidth} {...props} />;
};
```

---

## Dependencies

**NPM Packages Required:**
```json
{
  "dependencies": {
    "lucide-react-native": "^0.263.0",
    "react-native-reanimated": "^4.1.1"
  }
}
```

---

## Definition of Done

- [ ] All 19 components implemented and exported
- [ ] 75% test coverage maintained
- [ ] All Storybook stories created
- [ ] Visual regression tests passing
- [ ] Accessibility tests passing
- [ ] Documentation complete (README + examples)
- [ ] Type-safe prop interfaces with JSDoc comments
- [ ] Zero TypeScript errors in strict mode
- [ ] Peer review approved
- [ ] Merged to main branch

---

## Out of Scope

- Form components (Input, Checkbox, etc.) → DS.3
- Layout components (Card, Badge, Avatar, etc.) → DS.4
- Feedback components (Modal, Toast, BottomSheet) → DS.5
- Data visualization components → DS.6
- Weave-specific components → DS.7

---

**References:**
- PRD: `docs/prd.md` (lines 2708-2784)
- DS-1 Foundation: `docs/stories/ds-1-foundation-tokens-theme-animations.md`
- Radix UI Patterns: https://www.radix-ui.com/primitives/docs/guides/composition
- Lucide Icons: https://lucide.dev/icons/

---

**Created:** 2025-12-23  
**Ready for Development:** Yes (DS-1 complete)
