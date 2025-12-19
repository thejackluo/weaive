# Weave Design System

A dark-first, Opal-inspired design system for React Native. Elegant, minimalistic, and personal.

## Quick Start

```tsx
// 1. Wrap your app with ThemeProvider
import { ThemeProvider } from '@/design-system';

export default function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}

// 2. Use components and hooks
import { Button, Card, Text, useTheme } from '@/design-system';

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

## Design Philosophy

- **Dark-first**: Optimized for dark mode, with light mode support
- **Opal-inspired**: Glass effects, subtle gradients, premium feel
- **Personal**: Warm violet tones for AI, amber for celebration
- **Minimal friction**: Components designed for fast interactions

## Tokens

### Colors

```tsx
import { colors, useColors } from '@/design-system';

// Direct import
const bgColor = colors.background.primary; // #09090B

// Via hook (theme-aware)
const { colors } = useTheme();
const textColor = colors.text.primary;
```

**Color Categories:**
- `background` - App backgrounds (primary, secondary, elevated, glass)
- `text` - Text colors (primary, secondary, muted, accent, ai, success, error)
- `border` - Border colors (subtle, muted, focus, error)
- `semantic` - Success, warning, error, info, ai
- `accent` - Primary blue accent
- `violet` - AI/Dream Self accent
- `amber` - Celebration/streak accent
- `emerald` - Success accent
- `rose` - Error accent

### Typography

```tsx
import { Text, Heading, Body, Caption } from '@/design-system';

<Heading>Page Title</Heading>           // displayLg
<Text variant="displayMd">Section</Text> // 20px semibold
<Body>Regular body text</Body>          // 16px regular
<Caption color="muted">Helper</Caption>  // 12px muted
```

**Variants:**
- `display2xl`, `displayXl`, `displayLg`, `displayMd` - Headlines
- `textLg`, `textBase`, `textSm`, `textXs` - Body text
- `labelLg`, `labelBase`, `labelSm`, `labelXs` - UI labels
- `monoBase`, `monoSm` - Monospace

### Spacing

```tsx
import { spacing, layout } from '@/design-system';

// Base unit: 4px
spacing[4]  // 16px
spacing[6]  // 24px

// Layout constants
layout.screenPaddingHorizontal  // 16px
layout.cardPadding.default      // 16px
layout.button.height.md         // 44px
```

### Shadows & Glass

```tsx
import { shadows, glass } from '@/design-system';

// Shadow styles
<View style={shadows.md} />

// Glass effect (Opal-style)
<View style={glass.card} />
<View style={glass.elevated} />
<View style={glass.ai} />
```

### Animations

```tsx
import { durations, springs, easings } from '@/design-system';
import { withSpring, withTiming } from 'react-native-reanimated';

// Timing animations
withTiming(1, { duration: durations.normal, easing: easings.easeOut })

// Spring animations
withSpring(1, springs.default)
withSpring(0.97, springs.press)  // Button press feedback
```

## Components

### Button

```tsx
import { Button, PrimaryButton, IconButton } from '@/design-system';

<Button onPress={handlePress}>Continue</Button>
<Button variant="secondary" size="sm">Cancel</Button>
<Button variant="ai" loading>Processing...</Button>
<Button variant="destructive">Delete</Button>

<IconButton
  icon={<MyIcon />}
  onPress={handlePress}
  accessibilityLabel="Close"
/>
```

**Variants:** `primary`, `secondary`, `ghost`, `destructive`, `ai`, `success`
**Sizes:** `sm`, `md`, `lg`

### Card

```tsx
import { Card, GlassCard, NeedleCard, InsightCard } from '@/design-system';

// Basic cards
<Card>Default card</Card>
<Card variant="glass">Glass effect</Card>
<Card variant="elevated">With shadow</Card>
<Card variant="ai">AI-themed</Card>

// Pressable card
<Card pressable onPress={handlePress}>
  Tap me
</Card>

// Goal card (Needle)
<NeedleCard
  title="Get Fit"
  consistency={65}
  bindsCount={3}
  expanded={isExpanded}
  onPress={toggleExpand}
>
  {/* Expanded content */}
</NeedleCard>

// AI Insight card
<InsightCard
  type="winning"  // 'winning' | 'consider' | 'tomorrow'
  title="You're on a streak!"
  content="8 days of gym consistency..."
  onEdit={handleEdit}
/>
```

### Input

```tsx
import { Input, TextArea, SearchInput } from '@/design-system';

<Input
  label="Email"
  placeholder="Enter your email"
  error={emailError}
  helperText="We'll never share your email"
/>

<TextArea
  label="Reflection"
  placeholder="How do you feel about today?"
  lines={4}
/>

<SearchInput
  value={query}
  onChangeText={setQuery}
  onClear={() => setQuery('')}
  placeholder="Search..."
/>
```

### Checkbox

```tsx
import { Checkbox, BindCheckbox } from '@/design-system';

// Basic checkbox
<Checkbox
  checked={isChecked}
  onChange={setChecked}
  label="I agree to the terms"
/>

// Bind completion checkbox
<BindCheckbox
  title="Morning gym session"
  estimatedTime="60 min"
  hasProof={true}
  checked={isComplete}
  onChange={toggleComplete}
  onPress={navigateToDetail}
/>
```

### Badge

```tsx
import { Badge, ConsistencyBadge, StreakBadge, AIBadge } from '@/design-system';

<Badge>Default</Badge>
<Badge variant="success">Complete</Badge>
<Badge variant="ai" size="sm">AI</Badge>

// Specialized badges
<ConsistencyBadge percentage={65} />  // Auto-colors based on value
<StreakBadge count={12} />            // 🔥 12
<AIBadge />                           // AI badge
<StatusDot status="success" />        // Colored dot
```

### Text

```tsx
import { Text, Heading, Body, Caption, Label } from '@/design-system';

<Heading>Page Title</Heading>
<Text variant="displayMd" color="primary">Section Header</Text>
<Body>Regular paragraph text with secondary color by default.</Body>
<Caption color="muted">Helper text or timestamps</Caption>
<Label>Form Label</Label>
<Text color="ai">AI-generated content</Text>
<Text color="success">Success message</Text>
```

## Hooks

```tsx
import {
  useTheme,
  useColors,
  useSpacing,
  useTypography,
  useLayout,
  useShadows,
  useRadius,
  useAnimations,
} from '@/design-system';

// Full theme object
const theme = useTheme();
const { colors, spacing, typography } = theme;

// Individual hooks for specific needs
const colors = useColors();
const spacing = useSpacing();
const { shadows, glass } = useShadows();
const { springs, durations } = useAnimations();
```

## Theme Modes

```tsx
import { ThemeProvider, useThemeMode } from '@/design-system';

// Set initial mode
<ThemeProvider initialMode="dark">
  <App />
</ThemeProvider>

// Change mode programmatically
function Settings() {
  const [mode, setMode] = useThemeMode();

  return (
    <Button onPress={() => setMode('light')}>
      Switch to Light Mode
    </Button>
  );
}
```

**Modes:** `'dark'` (default), `'light'`, `'system'`

## File Structure

```
src/design-system/
├── tokens/
│   ├── colors.ts       # Color palette
│   ├── typography.ts   # Font scales
│   ├── spacing.ts      # Spacing system
│   ├── shadows.ts      # Shadows & effects
│   ├── radius.ts       # Border radius
│   ├── animations.ts   # Animation tokens
│   └── index.ts
├── theme/
│   ├── ThemeContext.tsx # Provider & hooks
│   └── index.ts
├── components/
│   ├── Text.tsx
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Checkbox.tsx
│   ├── Badge.tsx
│   └── index.ts
├── index.ts            # Main exports
└── README.md
```

## Dependencies

Required peer dependencies:

```json
{
  "react-native-reanimated": "^3.x",
  "react-native-safe-area-context": "^4.x"
}
```

## Best Practices

1. **Always use theme hooks** instead of direct imports when possible
2. **Use semantic color names** (`colors.text.primary`) over raw values
3. **Prefer pre-built components** over custom styling
4. **Use spacing tokens** for consistent layout
5. **Test on dark backgrounds** - our primary mode

## Accessibility

- All interactive components have proper `accessibilityRole`
- Touch targets are minimum 44x44 points
- Color contrast meets WCAG AA standards
- Support for reduced motion preferences

---

Built for Weave - "See who you're becoming."
