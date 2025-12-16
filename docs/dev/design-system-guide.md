# Weave Design System - Developer Guide

> A comprehensive guide to using the Weave design system in your React Native application

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Core Concepts](#core-concepts)
4. [Design Tokens](#design-tokens)
5. [Components](#components)
6. [Patterns & Best Practices](#patterns--best-practices)
7. [Previewing the Design System](#previewing-the-design-system)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The Weave design system is a **dark-first, Opal-inspired** design system built for React Native. It provides:

- **Design Tokens**: Colors, typography, spacing, shadows, animations
- **Theme System**: Centralized theme management with React Context
- **Pre-built Components**: Buttons, cards, inputs, badges, and more
- **Consistent API**: All components follow the same patterns and conventions

### Design Philosophy

- **Dark-first**: Optimized for dark mode with light mode support
- **Opal-inspired**: Glass effects, subtle gradients, premium feel
- **Personal**: Warm violet tones for AI, amber for celebration
- **Minimal friction**: Components designed for fast interactions

---

## Getting Started

### 1. Setup Theme Provider

Wrap your app with `ThemeProvider` to enable the design system:

```tsx
// App.tsx
import { ThemeProvider } from '@/design-system';

export default function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}
```

### 2. Import Components

Import components and hooks from the design system:

```tsx
import {
  // Components
  Button,
  Card,
  Text,
  Input,

  // Hooks
  useTheme,

  // Tokens (optional)
  colors,
  spacing,
} from '@/design-system';
```

### 3. Use Components

```tsx
function MyScreen() {
  const { colors, spacing } = useTheme();

  return (
    <Card variant="glass">
      <Text variant="displayLg">Welcome to Weave</Text>
      <Button onPress={handlePress}>Get Started</Button>
    </Card>
  );
}
```

---

## Core Concepts

### Theme System

The theme system uses React Context to provide design tokens to all components.

#### Available Hooks

```tsx
// Get full theme object
const theme = useTheme();
const { colors, spacing, typography, radius, shadows, springs } = theme;

// Get specific tokens
const colors = useColors();
const spacing = useSpacing();
const typography = useTypography();
const { shadows, glass } = useShadows();
const { springs, durations } = useAnimations();
```

#### Theme Mode

```tsx
import { useThemeMode } from '@/design-system';

function Settings() {
  const [mode, setMode] = useThemeMode();

  return (
    <Button onPress={() => setMode('light')}>
      Switch to Light Mode
    </Button>
  );
}
```

**Available modes**: `'dark'`, `'light'`, `'system'` (default: `'dark'`)

---

## Design Tokens

### Colors

#### Color Palettes

```tsx
import { colors } from '@/design-system';

// Background colors
colors.background.primary    // #09090B - Main app background
colors.background.secondary  // #0F0F12 - Card backgrounds
colors.background.elevated   // #1A1A1F - Floating elements
colors.background.glass      // rgba(...) - Glass effect

// Text colors
colors.text.primary      // #ECECF1 - High emphasis
colors.text.secondary    // #D4D4DC - Normal body
colors.text.muted        // #71717F - De-emphasized
colors.text.ai           // Violet - AI content
colors.text.success      // Emerald - Success states
colors.text.error        // Rose - Error states

// Accent colors
colors.accent[500]       // #5B8DEF - Primary accent
colors.violet[500]       // #9D71E8 - AI/Dream Self
colors.amber[500]        // #F5A623 - Celebration/Warmth
colors.emerald[500]      // #10D87E - Success
colors.rose[500]         // #E85A7E - Errors
```

#### Semantic Colors

```tsx
colors.semantic.success.base      // Success green
colors.semantic.warning.base      // Warning amber
colors.semantic.error.base        // Error rose
colors.semantic.ai.base           // AI violet
```

#### Border Colors

```tsx
colors.border.subtle    // Very subtle borders
colors.border.muted     // Default borders
colors.border.focus     // Focus states
colors.border.glass     // Glass effect borders
```

### Typography

#### Pre-composed Styles

```tsx
import { typography } from '@/design-system';

// Display styles (headlines)
typography.display2xl    // 36px Bold - Hero headlines
typography.displayXl     // 30px Bold - Page titles
typography.displayLg     // 24px Semibold - Section headers
typography.displayMd     // 20px Semibold - Subsections

// Text styles (body)
typography.textLg        // 18px Regular - Large body
typography.textBase      // 16px Regular - Default body
typography.textSm        // 14px Regular - Secondary info
typography.textXs        // 12px Regular - Captions

// Label styles (UI)
typography.labelBase     // 14px Medium - Buttons, tabs
typography.labelSm       // 12px Medium - Small UI

// Monospace
typography.monoBase      // 14px Mono - Code
```

#### Raw Typography Tokens

```tsx
typography.fontSizes.base        // 16
typography.fontWeights.semibold  // '600'
typography.lineHeights.normal    // 1.5
typography.letterSpacing.tight   // -0.025
```

### Spacing

#### Spacing Scale

Base unit: **4px**

```tsx
import { spacing } from '@/design-system';

spacing[1]   // 4px   - Tight spacing
spacing[2]   // 8px   - Close spacing
spacing[3]   // 12px  - Default spacing
spacing[4]   // 16px  - Comfortable spacing
spacing[6]   // 24px  - Relaxed spacing
spacing[8]   // 32px  - Large spacing
spacing[12]  // 48px  - Section breaks
spacing[16]  // 64px  - Major spacing
```

#### Layout Constants

```tsx
import { layout } from '@/design-system';

// Screen padding
layout.screenPaddingHorizontal   // 16px

// Component dimensions
layout.button.height.md          // 44px
layout.input.height.md           // 44px
layout.touchTarget.min           // 44px (Apple HIG)
layout.icon.md                   // 24px

// Card padding
layout.cardPadding.compact       // 12px
layout.cardPadding.default       // 16px
layout.cardPadding.spacious      // 24px
```

### Shadows & Effects

```tsx
import { shadows, glass } from '@/design-system';

// Shadow styles
<View style={shadows.sm} />   // Subtle shadow
<View style={shadows.md} />   // Medium shadow
<View style={shadows.lg} />   // Large shadow

// Glass effects
<View style={glass.card} />      // Card glass effect
<View style={glass.elevated} />  // Elevated glass
<View style={glass.ai} />        // AI-themed glass
```

### Border Radius

```tsx
import { radius } from '@/design-system';

radius.sm    // 6px  - Small elements
radius.md    // 8px  - Input fields
radius.lg    // 12px - Buttons
radius.xl    // 16px - Cards
radius.full  // 9999px - Pills, avatars
```

### Animations

```tsx
import { springs, durations, easings } from '@/design-system';
import { withSpring, withTiming } from 'react-native-reanimated';

// Spring animations
withSpring(value, springs.default)   // Default spring
withSpring(0.97, springs.press)      // Button press

// Timing animations
withTiming(value, {
  duration: durations.normal,  // 200ms
  easing: easings.easeOut,
})
```

---

## Components

### Text Components

#### Text

Base text component with variants:

```tsx
<Text variant="displayLg" color="primary">
  Heading
</Text>

<Text variant="textBase" color="secondary">
  Body text
</Text>

<Text variant="labelBase" weight="medium" uppercase>
  Button Label
</Text>

<Text customColor="#FF0000">
  Custom color text
</Text>
```

**Props**:
- `variant`: Typography variant (see typography section)
- `color`: Theme color name or `customColor` for hex
- `align`: `'left'` | `'center'` | `'right'`
- `weight`: `'regular'` | `'medium'` | `'semibold'` | `'bold'`
- `uppercase`: Boolean

#### Convenience Components

```tsx
<Heading>Page Title</Heading>              // displayLg
<Title>Section Title</Title>               // displayMd
<Body>Paragraph text</Body>                // textBase, secondary
<Caption color="muted">Helper text</Caption> // textXs, muted
<Label>Form Label</Label>                  // labelBase
<Mono>const code = true;</Mono>            // monoBase
```

### Button Components

#### Button

```tsx
<Button
  variant="primary"
  size="md"
  onPress={handlePress}
  disabled={false}
  loading={false}
  fullWidth={false}
  leftIcon={<Icon />}
  rightIcon={<Icon />}
>
  Button Text
</Button>
```

**Variants**:
- `primary` - Main actions (blue)
- `secondary` - Secondary actions (outlined)
- `ghost` - Tertiary actions (transparent)
- `destructive` - Dangerous actions (red)
- `ai` - AI-related actions (violet)
- `success` - Success actions (green)

**Sizes**: `'sm'` | `'md'` | `'lg'`

#### Specialized Buttons

```tsx
<PrimaryButton onPress={handleSubmit}>
  Submit
</PrimaryButton>

<SecondaryButton onPress={handleCancel}>
  Cancel
</SecondaryButton>

<GhostButton onPress={handleMore}>
  Learn More
</GhostButton>

<DestructiveButton onPress={handleDelete}>
  Delete Account
</DestructiveButton>

<AIButton onPress={handleAI}>
  Generate with AI
</AIButton>
```

#### IconButton

```tsx
<IconButton
  icon={<CloseIcon />}
  onPress={handleClose}
  variant="ghost"
  size="md"
  accessibilityLabel="Close"
/>
```

### Card Components

#### Card

```tsx
<Card
  variant="default"
  padding="default"
  pressable={false}
  onPress={handlePress}
>
  <Text>Card content</Text>
</Card>
```

**Variants**:
- `default` - Standard card
- `glass` - Glass effect (Opal-style)
- `elevated` - With shadow
- `outlined` - Border only
- `ai` - AI-themed
- `success` - Success-themed
- `subtle` - Very subtle

**Padding**: `'none'` | `'compact'` | `'default'` | `'spacious'`

#### Specialized Cards

```tsx
<GlassCard>
  Glass effect card
</GlassCard>

<ElevatedCard>
  Card with shadow
</ElevatedCard>

<AICard>
  AI-themed content
</AICard>

<SuccessCard>
  Success message
</SuccessCard>
```

#### NeedleCard (Goal Card)

```tsx
<NeedleCard
  title="Get Fit & Strong"
  consistency={75}
  bindsCount={3}
  expanded={isExpanded}
  onPress={() => setExpanded(!isExpanded)}
>
  {/* Expanded content */}
  <Text>Goal details...</Text>
</NeedleCard>
```

#### InsightCard (AI Insight)

```tsx
<InsightCard
  type="winning"     // 'winning' | 'consider' | 'tomorrow'
  title="You're crushing it!"
  content="8 days of consistency on morning routine..."
  onEdit={handleEdit}
  onDismiss={handleDismiss}
/>
```

### Input Components

#### Input

```tsx
<Input
  label="Email"
  placeholder="you@example.com"
  value={email}
  onChangeText={setEmail}
  error={emailError}
  helperText="We'll never share your email"
  disabled={false}
  secureTextEntry={false}
/>
```

#### TextArea

```tsx
<TextArea
  label="Reflection"
  placeholder="How do you feel about today?"
  value={reflection}
  onChangeText={setReflection}
  lines={4}
  maxLength={500}
/>
```

#### SearchInput

```tsx
<SearchInput
  value={query}
  onChangeText={setQuery}
  onClear={() => setQuery('')}
  placeholder="Search..."
/>
```

### Checkbox Components

#### Checkbox

```tsx
<Checkbox
  checked={isChecked}
  onChange={setChecked}
  label="I agree to the terms"
  disabled={false}
/>
```

#### BindCheckbox (Task Completion)

```tsx
<BindCheckbox
  title="Morning gym session"
  estimatedTime="60 min"
  hasProof={true}
  checked={isComplete}
  onChange={toggleComplete}
  onPress={navigateToDetail}
/>
```

### Badge Components

#### Badge

```tsx
<Badge variant="default" size="md">
  Badge Text
</Badge>
```

**Variants**:
- `default` - Neutral gray
- `primary` - Blue accent
- `secondary` - Outlined
- `success` - Green
- `warning` - Amber
- `error` - Rose
- `ai` - Violet

**Sizes**: `'sm'` | `'md'` | `'lg'`

#### Specialized Badges

```tsx
<ConsistencyBadge percentage={75} />
// Auto-colors: Green (80+), Amber (50-79), Rose (<50)

<StreakBadge count={12} />
// Shows: 🔥 12

<AIBadge />
// Shows: ✨ AI

<StatusDot status="success" />
// Colored dot indicator
```

---

## Patterns & Best Practices

### 1. Always Use Theme Hooks

**✅ Good:**
```tsx
function MyComponent() {
  const { colors, spacing } = useTheme();

  return (
    <View style={{
      backgroundColor: colors.background.secondary,
      padding: spacing[4],
    }}>
      <Text>Hello</Text>
    </View>
  );
}
```

**❌ Bad:**
```tsx
function MyComponent() {
  return (
    <View style={{
      backgroundColor: '#0F0F12',  // Hardcoded
      padding: 16,                 // Hardcoded
    }}>
      <Text>Hello</Text>
    </View>
  );
}
```

### 2. Use Semantic Color Names

**✅ Good:**
```tsx
<Text style={{ color: colors.text.primary }}>
  Main heading
</Text>
```

**❌ Bad:**
```tsx
<Text style={{ color: colors.dark[100] }}>
  Main heading
</Text>
```

### 3. Prefer Pre-built Components

**✅ Good:**
```tsx
<Button onPress={handleSubmit}>Submit</Button>
```

**❌ Bad:**
```tsx
<Pressable
  onPress={handleSubmit}
  style={{
    backgroundColor: '#5B8DEF',
    padding: 12,
    borderRadius: 12,
  }}
>
  <Text style={{ color: '#09090B' }}>Submit</Text>
</Pressable>
```

### 4. Use Spacing Tokens

**✅ Good:**
```tsx
const { spacing } = useTheme();

<View style={{
  marginBottom: spacing[4],
  gap: spacing[3],
}} />
```

**❌ Bad:**
```tsx
<View style={{
  marginBottom: 16,
  gap: 12,
}} />
```

### 5. Consistent Layout Patterns

#### Screen Layout

```tsx
function MyScreen() {
  const { colors, spacing } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <ScrollView contentContainerStyle={{ padding: spacing[4] }}>
        {/* Content */}
      </ScrollView>
    </SafeAreaView>
  );
}
```

#### Card Stack

```tsx
<View style={{ gap: spacing[4] }}>
  <Card>Content 1</Card>
  <Card>Content 2</Card>
  <Card>Content 3</Card>
</View>
```

#### Form Layout

```tsx
<Card padding="spacious">
  <Input label="Name" value={name} onChangeText={setName} />
  <View style={{ height: spacing[4] }} />
  <Input label="Email" value={email} onChangeText={setEmail} />
  <View style={{ height: spacing[6] }} />
  <Button onPress={handleSubmit}>Submit</Button>
</Card>
```

### 6. Animations

```tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';

function AnimatedCard() {
  const { springs } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, springs.press);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springs.press);
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
    >
      <Card>Animated content</Card>
    </AnimatedPressable>
  );
}
```

### 7. Accessibility

All components have built-in accessibility:

```tsx
<Button
  onPress={handlePress}
  accessibilityLabel="Submit form"
  accessibilityHint="Submits your information"
>
  Submit
</Button>

<IconButton
  icon={<CloseIcon />}
  onPress={handleClose}
  accessibilityLabel="Close modal"  // Required!
/>
```

### 8. Dark Mode Testing

Always test components on dark backgrounds:

```tsx
// Test with different background shades
<View style={{ backgroundColor: colors.background.primary }}>
  <YourComponent />
</View>

<View style={{ backgroundColor: colors.background.elevated }}>
  <YourComponent />
</View>
```

---

## Previewing the Design System

### Option 1: React Native Showcase (In-App)

View all components in your running app:

```tsx
import { DesignSystemShowcase } from '@/design-system/DesignSystemShowcase';

// Add to your navigation or debug menu
<DesignSystemShowcase />
```

**Features**:
- Interactive components
- Live state changes
- Real device rendering
- Full React Native capabilities

### Option 2: HTML Viewer (Quick Reference)

Open in your browser for quick reference:

```bash
# Open in browser
open src/design-system/design-system-viewer.html
```

**Features**:
- Instant loading
- No build required
- Color palette preview
- Typography scales
- Static examples

---

## Troubleshooting

### Theme not working

**Problem**: Components don't have proper styling

**Solution**: Ensure `ThemeProvider` wraps your app:

```tsx
// App.tsx or _layout.tsx
import { ThemeProvider } from '@/design-system';

export default function RootLayout() {
  return (
    <ThemeProvider>
      {/* Your app */}
    </ThemeProvider>
  );
}
```

### TypeScript errors

**Problem**: Type errors with component props

**Solution**: Import types explicitly:

```tsx
import { ButtonProps, CardVariant } from '@/design-system';
```

### Colors not updating

**Problem**: Colors remain the same when theme mode changes

**Solution**: Use `useTheme()` hook, not direct imports:

```tsx
// ✅ Good
const { colors } = useTheme();

// ❌ Bad
import { colors } from '@/design-system';
```

### Animations not working

**Problem**: Animations don't run

**Solution**: Ensure `react-native-reanimated` is properly installed:

```bash
npm install react-native-reanimated
```

Add to `babel.config.js`:
```js
module.exports = {
  plugins: ['react-native-reanimated/plugin'],
};
```

---

## Quick Reference

### Common Imports

```tsx
// Components
import {
  Button,
  Card,
  Text,
  Input,
  Badge,
  Checkbox,
} from '@/design-system';

// Hooks
import {
  useTheme,
  useColors,
  useSpacing,
} from '@/design-system';

// Tokens (direct)
import {
  colors,
  spacing,
  typography,
  radius,
} from '@/design-system';
```

### Common Patterns

```tsx
// Screen with theme
function Screen() {
  const { colors, spacing } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <ScrollView contentContainerStyle={{ padding: spacing[4] }}>
        <Card>
          <Heading>Title</Heading>
          <Body>Content</Body>
          <Button onPress={handlePress}>Action</Button>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

// Form
<Card padding="spacious">
  <Input label="Name" {...nameProps} />
  <View style={{ height: spacing[4] }} />
  <TextArea label="Notes" {...notesProps} />
  <View style={{ height: spacing[6] }} />
  <Button onPress={handleSubmit}>Submit</Button>
</Card>

// List
<View style={{ gap: spacing[3] }}>
  {items.map(item => (
    <Card key={item.id} pressable onPress={() => handleSelect(item)}>
      <Text>{item.name}</Text>
    </Card>
  ))}
</View>
```

---

## Additional Resources

- **Main README**: `src/design-system/README.md` - Full API reference
- **Component Examples**: `src/design-system/DesignSystemShowcase.tsx`
- **HTML Preview**: `src/design-system/design-system-viewer.html`
- **Token Files**: `src/design-system/tokens/`

---

**Questions?** Check the component source files for detailed JSDoc comments and TypeScript types.

Built for Weave - "See who you're becoming."
