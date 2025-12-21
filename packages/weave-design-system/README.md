# @weave/design-system

**Weave Design System** - Production-ready React Native component library built with Tamagui-inspired architecture, spring physics animations, and Atomic Design principles.

## 🎯 Overview

A complete rebuild of the Weave design system featuring:
- **70 production-ready components** organized by atomic design principles
- **220+ design tokens** (colors, typography, spacing, effects, animations)
- **Tamagui-inspired composable anatomy** (e.g., `<Button.Icon>`, `<Card.Header>`)
- **Spring physics animations** using React Native Reanimated
- **Runtime theme switching** (dark/light mode)
- **75%+ test coverage** with Jest and React Native Testing Library
- **Full TypeScript support** with comprehensive type definitions

## 📦 Installation

```bash
npm install @weave/design-system
# or
yarn add @weave/design-system
```

### Peer Dependencies

This package requires the following peer dependencies:

```bash
npm install react react-native react-native-reanimated react-native-gesture-handler
```

## 🚀 Quick Start

### 1. Wrap your app with ThemeProvider

```tsx
import { ThemeProvider } from '@weave/design-system';

export default function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}
```

### 2. Import and use components

```tsx
import { Button, Card, Text, Input, useTheme } from '@weave/design-system';

function MyScreen() {
  const { colors, spacing } = useTheme();

  return (
    <Card variant="glass" padding="lg">
      <Text variant="displayLg">Welcome to Weave</Text>
      <Text variant="textBase" color="secondary">
        Your journey begins here
      </Text>
      <Button onPress={handlePress}>Get Started</Button>
    </Card>
  );
}
```

## 📚 Component Catalog (70 components)

### Text & Typography (11 components)
- `Text` - Base text component with 14 variants
- `AnimatedText` - Animated text with spring physics
- `Heading`, `Title`, `Subtitle` - Semantic heading components
- `Body`, `BodySmall`, `Caption` - Body text variants
- `Label`, `Link`, `Mono` - Specialized text components

### Buttons (7 components)
- `Button` - Composable button with anatomy (`Button.Icon`, `Button.Text`, `Button.Spinner`)
- `PrimaryButton`, `SecondaryButton`, `GhostButton` - Semantic button variants
- `DestructiveButton`, `AIButton` - Specialized buttons
- `IconButton` - Icon-only button with press animation

### Form Components (10 components)
- `Input` - Text input with floating label animation
- `TextArea` - Auto-expanding text area
- `SearchInput` - Debounced search with icon
- `Checkbox`, `BindCheckbox` - Checkbox with optional confetti
- `Slider` - Gesture-controlled slider with snap points
- `Radio`, `RadioGroup` - Radio button group
- `Toggle` - Switch with spring physics
- `Select` - Dropdown with bottom sheet

### Cards (7 components)
- `Card` - Composable card (`Card.Header`, `Card.Content`, `Card.Footer`)
- `GlassCard`, `ElevatedCard`, `AICard` - Specialized cards
- `SuccessCard` - Celebration card with confetti
- `NeedleCard`, `InsightCard` - Weave-specific cards

### Specialized Components (6 components)
- `BindCard` - Task card with checkbox, streak, confetti
- `CaptureCard` - Proof card with thumbnail
- `Timer` - Pomodoro countdown timer with haptics
- `ConsistencyHeatmap` - GitHub-style contribution graph

### Navigation (3 components)
- `BottomTabBar` - Bottom navigation bar
- `HeaderBar` - Top header bar
- `BackButton` - Navigational back button

### Badges (6 components)
- `Badge`, `CountBadge`, `StatusDot` - Generic badges
- `StreakBadge`, `AIBadge`, `ConsistencyBadge` - Weave-specific badges

### Progress (2 components)
- `ProgressBar` - Linear progress with gradient
- `CircularProgress` - Circular progress arc

### Overlays (3 components)
- `Modal` - Full-screen modal with backdrop
- `BottomSheet` - Gesture-driven bottom sheet
- `Toast` - Auto-dismiss toast notifications

### Stat Cards (4 components)
- `StatCard`, `StatCardGrid` - Stat display cards
- `MiniStatCard`, `ProgressStatCard` - Compact stat cards

### Avatars (3 components)
- `Avatar`, `AvatarGroup`, `AvatarWithName` - User avatars

### Layout (3 components)
- `Tabs` - Composable tabs with animated indicator
- `Divider` - Separator line
- `ListItem` - Composable list item

### Loading States (8 components)
- `Skeleton`, `SkeletonText`, `SkeletonAvatar` - Shimmer loaders
- `SkeletonCard`, `SkeletonListItem`, `SkeletonBindCard` - Preset skeletons
- `SkeletonStatCard`, `SkeletonProgressCard` - Specialized skeletons

### Empty States (10 components)
- `EmptyState` - Generic empty state
- `EmptyGoals`, `EmptyBinds`, `EmptyCaptures`, `EmptyJournal` - Weave-specific empty states
- `EmptySearch`, `EmptyNotifications` - Common empty states
- `ErrorState`, `NoConnectionState`, `ComingSoonState` - Error states

## 🎨 Design Tokens

### Colors (60+ tokens)
```tsx
const { colors } = useTheme();

colors.text.primary      // Primary text color
colors.text.secondary    // Secondary text color
colors.bg.primary        // Primary background
colors.border.default    // Border color
colors.accent.primary    // Primary accent (#3B72F6)
colors.accent.amber      // Highlight (#FBBF24)
colors.accent.violet     // AI accent (#A78BFA)
```

### Typography (45+ tokens)
```tsx
typography.display2xl    // 72px, bold
typography.displayLg     // 36px, bold
typography.textBase      // 16px, regular
typography.textSm        // 14px, regular
typography.labelBase     // 16px, medium
```

### Spacing (25+ tokens)
```tsx
spacing[1]   // 4px
spacing[2]   // 8px
spacing[4]   // 16px
spacing[8]   // 32px
spacing[16]  // 64px
```

### Animations (35+ presets)
```tsx
animations.springs.gentle   // Soft spring
animations.springs.snappy   // Quick spring
animations.springs.bouncy   // Playful bounce
```

## 🌈 Theme System

### Runtime Theme Switching

```tsx
import { useTheme, ThemeProvider } from '@weave/design-system';

function App() {
  return (
    <ThemeProvider initialTheme="dark">
      <YourApp />
    </ThemeProvider>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </Button>
  );
}
```

### Custom Themes

```tsx
import { createTheme } from '@weave/design-system';

const customTheme = createTheme({
  colors: {
    accent: {
      primary: '#FF6B6B',
      // ... other colors
    },
  },
});

<ThemeProvider theme={customTheme}>
  <App />
</ThemeProvider>
```

## 🔧 Composable Anatomy

Many components use a composable anatomy pattern inspired by Radix UI:

```tsx
// Button anatomy
<Button>
  <Button.Icon name="check" />
  <Button.Text>Save</Button.Text>
  <Button.Spinner visible={loading} />
</Button>

// Card anatomy
<Card>
  <Card.Header>
    <Text variant="displayMd">Title</Text>
  </Card.Header>
  <Card.Content>
    <Text>Content goes here</Text>
  </Card.Content>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>

// Tabs anatomy
<Tabs value={activeTab} onChange={setActiveTab}>
  <Tabs.List>
    <Tabs.Trigger value="one">Tab 1</Tabs.Trigger>
    <Tabs.Trigger value="two">Tab 2</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="one">Content 1</Tabs.Content>
  <Tabs.Content value="two">Content 2</Tabs.Content>
</Tabs>
```

## ✨ Animations

All interactive components use spring physics for natural, delightful animations:

```tsx
// Press animations
<Button onPress={onPress}>
  {/* Scales down on press with spring bounce */}
</Button>

// Gesture-driven animations
<Slider
  value={value}
  onChange={setValue}
  // Smooth dragging with snap-to-step
/>

// Entrance animations
<Modal visible={visible}>
  {/* Slides up with spring physics */}
</Modal>
```

## 📱 Responsive & Accessible

- **WCAG 2.1 Level AA compliant**
- **Screen reader support** - All components have accessibility labels
- **Keyboard navigation** - Focus management and tab order
- **Reduced motion support** - Respects `prefers-reduced-motion`
- **Minimum touch targets** - 44x44pt minimum

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📖 Documentation

- **Storybook:** Full component documentation with interactive examples
- **TypeScript:** Comprehensive type definitions and JSDoc comments
- **Architecture Guide:** `docs/dev/design-system-guide.md`

## 🔄 Migration from Old System

If migrating from `src/design-system/`:

```tsx
// Old import
import { Button } from '@/design-system/components';

// New import
import { Button } from '@weave/design-system';
```

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please see CONTRIBUTING.md for guidelines.

## 📝 Changelog

See CHANGELOG.md for version history and breaking changes.

---

Built with ❤️ by the Weave team
