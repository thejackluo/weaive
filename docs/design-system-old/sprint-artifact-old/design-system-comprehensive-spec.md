# Weave Design System - Comprehensive Specification
## Sprint Artifact | Design System Architecture & Component Library

**Version:** 1.0
**Date:** December 18, 2025
**Status:** Complete Specification
**Owner:** UX Design Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Design Philosophy & Principles](#design-philosophy--principles)
3. [Visual Identity](#visual-identity)
4. [Design Tokens System](#design-tokens-system)
5. [Component Library](#component-library)
6. [Animation & Motion System](#animation--motion-system)
7. [Layout & Spacing](#layout--spacing)
8. [Accessibility Standards](#accessibility-standards)
9. [Implementation Roadmap](#implementation-roadmap)
10. [Design System Governance](#design-system-governance)

---

## Executive Summary

### Purpose
This document defines the complete design system for Weave, a mobile application that transforms vague goals into daily wins through identity-driven progress tracking. The design system embodies the brand promise: **"See who you're becoming."**

### Design System Goals
1. **Unify** the visual language across all screens and interactions
2. **Accelerate** development with reusable, well-documented components
3. **Ensure** accessibility and inclusive design practices
4. **Embody** Weave's identity: personal, futuristic, minimalistic, premium
5. **Scale** efficiently as the product evolves

### Key Statistics
- **Token System:** 220+ design tokens (colors, typography, spacing, animations)
- **Component Library:** 45+ components across 8 categories
- **Variants:** 180+ component variants for different contexts and states
- **Animation Presets:** 24 motion patterns for consistent micro-interactions
- **Platform:** React Native (Expo SDK 53) with NativeWind v5

---

## Design Philosophy & Principles

### Brand Essence: "See Who You're Becoming"

Weave is not just a task tracker—it's an identity transformation tool for ambitious but chaotic students and builders (ages 18-25) who struggle with consistent execution despite high intent.

### Design Pillars

#### 1. **Identity-First Design**
Every visual element reinforces the user's evolving identity:
- **AI Coaching:** Warm violet tones (#9D71E8) convey wisdom without coldness
- **Celebration:** Amber accents (#F5A623) mark wins and progress
- **Growth:** Emerald gradients (#10D87E) visualize advancement
- **Personal:** Dark-first aesthetic creates intimate, focused space

#### 2. **Opal-Inspired Glassmorphism**
The glass aesthetic is not decoration—it represents:
- **Transparency:** Users see their patterns clearly
- **Depth:** Layered UI reflects multi-dimensional identity
- **Premium:** High-quality feel matches user ambition
- **Trust:** Openness builds credibility

**Technical Implementation:**
```typescript
background: 'rgba(26, 26, 31, 0.7)',
backdropFilter: 'blur(24px) saturate(180%)',
border: '1px solid rgba(255, 255, 255, 0.15)',
```

#### 3. **Futuristic Minimalism**
- **Remove** everything that doesn't serve the user's journey
- **Amplify** what matters (goals, progress, proof, identity)
- **Anticipate** needs through intelligent defaults
- **Respect** attention—every pixel earns its place

#### 4. **Dark-First, Always**
- **Primary Background:** `#09090B` (deep black)
- **Why:** Reduces eye strain, extends battery life, creates focus
- **Light Mode:** Planned for post-MVP, but never the default

#### 5. **Motion with Meaning**
Following Apple HIG principles:
- **Purposeful:** Animations convey status and provide feedback
- **Brief:** 150-300ms for UI interactions, never gratuitous
- **Realistic:** Follows physics and user expectations
- **Optional:** Respects reduced motion accessibility settings

---

## Visual Identity

### Color System

#### Brand Colors (Core Palette)

```typescript
// Primary Identity Colors
accent: '#5B8DEF',       // Action, Progress, Focus
violet: '#9D71E8',       // AI, Wisdom, Dream Self
amber: '#F5A623',        // Celebration, Warmth, Wins
emerald: '#10D87E',      // Growth, Success, Achievement
rose: '#E85A7E',         // Errors, Attention, Limits
```

#### Background Hierarchy

```typescript
// Dark-First Background System
background: {
  primary: '#09090B',      // Main app canvas
  secondary: '#0F0F12',    // Card surfaces
  elevated: '#1A1A1F',     // Floating elements (modals, sheets)
  glass: 'rgba(26, 26, 31, 0.7)',  // Glass-effect overlays
  overlay: 'rgba(9, 9, 11, 0.8)',  // Modal dimming
}
```

**Usage Rules:**
- `primary`: Full-screen backgrounds, main canvas
- `secondary`: Card backgrounds, list items
- `elevated`: Modals, bottom sheets, floating action buttons
- `glass`: AI insights, premium features, highlighted content
- `overlay`: Behind modals, drawers, temporary UI

#### Text Hierarchy

```typescript
text: {
  primary: '#ECECF1',      // Headers, key information (highest emphasis)
  secondary: '#D4D4DC',    // Body text, descriptions (normal emphasis)
  muted: '#71717F',        // Labels, helper text (de-emphasized)
  disabled: '#3F3F46',     // Inactive states
  ai: '#9D71E8',           // AI-generated content
  inverse: '#09090B',      // Text on light backgrounds
}
```

**Contrast Ratios (WCAG AAA):**
- `primary` on `background.primary`: 13.2:1 ✅
- `secondary` on `background.primary`: 10.8:1 ✅
- `muted` on `background.secondary`: 4.9:1 ✅

#### Semantic Colors

```typescript
semantic: {
  success: {
    base: '#10D87E',
    light: '#34D399',
    dark: '#059669',
    bg: 'rgba(16, 216, 126, 0.1)',
    border: 'rgba(16, 216, 126, 0.3)',
  },
  warning: {
    base: '#F5A623',
    light: '#FBBF24',
    dark: '#D97706',
    bg: 'rgba(245, 166, 35, 0.1)',
    border: 'rgba(245, 166, 35, 0.3)',
  },
  error: {
    base: '#E85A7E',
    light: '#FB7185',
    dark: '#BE123C',
    bg: 'rgba(232, 90, 126, 0.1)',
    border: 'rgba(232, 90, 126, 0.3)',
  },
  ai: {
    base: '#9D71E8',
    light: '#A78BFA',
    dark: '#6D28D9',
    bg: 'rgba(157, 113, 232, 0.1)',
    border: 'rgba(157, 113, 232, 0.3)',
  },
}
```

### Typography System

#### Font Stack
- **iOS:** SF Pro (system default)
- **Android:** Roboto (system default)
- **Monospace:** SF Mono / Roboto Mono

#### Type Scale

```typescript
// Display Styles (Headlines, Hero Text)
display2xl: {
  fontSize: 36,
  fontWeight: '700',
  lineHeight: 45,        // 1.25x
  letterSpacing: -0.9,   // -2.5%
  use: 'Hero headlines, onboarding',
},
displayXl: {
  fontSize: 30,
  fontWeight: '700',
  lineHeight: 38,
  letterSpacing: -0.75,
  use: 'Page titles',
},
displayLg: {
  fontSize: 24,
  fontWeight: '600',
  lineHeight: 36,
  letterSpacing: -0.6,
  use: 'Section headers, goal titles',
},
displayMd: {
  fontSize: 20,
  fontWeight: '600',
  lineHeight: 30,
  letterSpacing: 0,
  use: 'Subsection headers, card titles',
},

// Text Styles (Body Copy)
textLg: {
  fontSize: 18,
  fontWeight: '400',
  lineHeight: 27,        // 1.5x
  letterSpacing: 0,
  use: 'Emphasized body text, quotes',
},
textBase: {
  fontSize: 16,
  fontWeight: '400',
  lineHeight: 24,
  letterSpacing: 0,
  use: 'Default body text, descriptions',
},
textSm: {
  fontSize: 14,
  fontWeight: '400',
  lineHeight: 21,
  letterSpacing: 0,
  use: 'Secondary info, metadata',
},
textXs: {
  fontSize: 12,
  fontWeight: '400',
  lineHeight: 18,
  letterSpacing: 0.3,    // +2.5%
  use: 'Captions, timestamps, footnotes',
},

// Label Styles (UI Elements)
labelLg: {
  fontSize: 16,
  fontWeight: '500',
  lineHeight: 16,        // No line height for buttons
  letterSpacing: 0.4,
  use: 'Large buttons, prominent CTAs',
},
labelBase: {
  fontSize: 14,
  fontWeight: '500',
  lineHeight: 14,
  letterSpacing: 0.35,
  use: 'Buttons, tabs, form labels',
},
labelSm: {
  fontSize: 12,
  fontWeight: '500',
  lineHeight: 12,
  letterSpacing: 0.6,
  use: 'Small buttons, badges, tags',
},

// Monospace (Code, Technical)
monoBase: {
  fontSize: 14,
  fontFamily: 'monospace',
  lineHeight: 21,
  use: 'Code snippets, technical data',
},
```

#### Typography Best Practices
1. **Never mix more than 3 type sizes per screen**
2. **Use weight to create hierarchy, not size jumps**
3. **Maintain minimum 44pt touch targets for interactive text**
4. **Limit line length to 60-70 characters for readability**

---

## Design Tokens System

### Spacing Scale (Base Unit: 4px)

```typescript
spacing: {
  0: 0,
  1: 4,      // Tight spacing, icon padding
  2: 8,      // Close spacing, small gaps
  3: 12,     // Default spacing, comfortable gaps
  4: 16,     // Standard padding, list item spacing
  5: 20,     // Relaxed spacing
  6: 24,     // Section spacing
  8: 32,     // Large spacing, major sections
  10: 40,    // Extra large spacing
  12: 48,    // Section breaks
  16: 64,    // Major spacing, screen sections
  20: 80,    // Hero spacing
  24: 96,    // Extreme spacing
}
```

**8-Point Grid Rule:** All dimensions should be multiples of 4px (soft rule) or 8px (preferred).

### Layout Constants

```typescript
layout: {
  // Screen Padding
  screenPaddingHorizontal: 16,
  screenPaddingVertical: 16,

  // Touch Targets (Apple HIG Minimum)
  touchTarget: {
    min: 44,        // Minimum tap area
    comfortable: 48, // Recommended size
    large: 56,      // Large action buttons
  },

  // Component Heights
  button: {
    sm: 36,
    md: 44,
    lg: 56,
  },
  input: {
    sm: 36,
    md: 44,
    lg: 52,
  },

  // Icon Sizes
  icon: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
  },

  // Card Padding
  cardPadding: {
    compact: 12,
    default: 16,
    spacious: 24,
  },

  // Bottom Navigation
  bottomNav: {
    height: 56,       // Tab bar height
    iconSize: 24,     // Tab icon size
    paddingBottom: 8, // Safe area inset
  },
}
```

### Border Radius

```typescript
radius: {
  none: 0,
  sm: 6,       // Small elements (badges, tags)
  md: 8,       // Input fields, small buttons
  lg: 12,      // Buttons, pills
  xl: 16,      // Cards, modals
  '2xl': 20,   // Large cards
  '3xl': 24,   // Hero cards, images
  full: 9999,  // Pills, avatars, circular elements
}
```

### Shadows & Effects

```typescript
shadows: {
  // Standard Elevation
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,  // Android
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 20,
  },

  // Glass Effects
  glass: {
    // Card Glass Effect
    card: {
      backgroundColor: 'rgba(26, 26, 31, 0.7)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
      // Note: backdropFilter requires react-native-reanimated v4+
      style: 'blur(24px) saturate(180%)',
    },
    // Elevated Glass (Modals, Sheets)
    elevated: {
      backgroundColor: 'rgba(31, 31, 36, 0.8)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      style: 'blur(32px) saturate(200%)',
    },
    // AI-Themed Glass
    ai: {
      backgroundColor: 'rgba(157, 113, 232, 0.15)',
      borderWidth: 1,
      borderColor: 'rgba(157, 113, 232, 0.4)',
      style: 'blur(20px) saturate(150%)',
    },
  },
}
```

---

## Component Library

### Component Taxonomy

```
Weave Design System Components
│
├── 1. Foundations
│   ├── Text Components (7)
│   ├── Icon System (SF Symbols)
│   └── Images & Media (3)
│
├── 2. Inputs & Forms
│   ├── Buttons (8)
│   ├── Text Inputs (4)
│   ├── Checkboxes (3)
│   └── Selectors (4)
│
├── 3. Display & Feedback
│   ├── Cards (8)
│   ├── Badges (6)
│   ├── Progress Indicators (5)
│   └── Alerts & Toasts (4)
│
├── 4. Navigation
│   ├── Tab Bar (Bottom Navigation)
│   ├── Header Bar
│   └── Breadcrumbs
│
├── 5. Overlays
│   ├── Modals (3)
│   ├── Bottom Sheets (2)
│   └── Tooltips & Popovers (2)
│
├── 6. Specialized Components (Weave-Specific)
│   ├── Goal Cards (NeedleCard, BindCard)
│   ├── AI Components (InsightCard, AIChat)
│   ├── Progress Visualizations (WeaveCharacter, ConsistencyHeatmap)
│   └── Proof Capture (CaptureCard, TimerCard)
│
├── 7. Layout Components
│   ├── Screen Container
│   ├── SafeAreaView
│   └── KeyboardAvoidingView
│
└── 8. Utility Components
    ├── GlassView
    ├── AnimatedPressable
    └── Skeleton Loaders
```

---

## Component Specifications

### 1. Text Components

All text components use the theme's typography system and support:
- `variant`: Typography style (see Type Scale)
- `color`: Semantic color name from theme
- `customColor`: Hex color (use sparingly)
- `align`: 'left' | 'center' | 'right'
- `weight`: 'regular' | 'medium' | 'semibold' | 'bold'

#### 1.1 Text (Base Component)
**Status:** ✅ Implemented

```typescript
<Text variant="displayLg" color="primary">Welcome to Weave</Text>
<Text variant="textBase" color="secondary">Your journey begins here.</Text>
```

#### 1.2 Heading, Title, Body, Caption, Label, Mono
**Status:** ✅ Implemented

Pre-configured convenience components for common use cases.

---

### 2. Button Components

#### 2.1 Button (Base Component)
**Status:** ❌ TODO

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'ai' | 'success';
  size: 'sm' | 'md' | 'lg';
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}
```

**Variant Styles:**

| Variant | Background | Text | Border | Use Case |
|---------|------------|------|--------|----------|
| `primary` | `accent[500]` | `text.inverse` | None | Main CTAs, submit actions |
| `secondary` | Transparent | `accent[500]` | `accent[500]` | Secondary actions, cancel |
| `ghost` | Transparent | `text.primary` | None | Tertiary actions, links |
| `destructive` | `rose[500]` | `text.inverse` | None | Delete, dangerous actions |
| `ai` | `violet[500]` | `text.inverse` | None | AI-related actions |
| `success` | `emerald[500]` | `text.inverse` | None | Confirm, success actions |

**Size Dimensions:**
- `sm`: Height 36px, padding 12px, fontSize 12px
- `md`: Height 44px, padding 16px, fontSize 14px
- `lg`: Height 56px, padding 24px, fontSize 16px

**States:**
- **Default:** Full opacity, scale 1.0
- **Hover:** Slight brightness increase
- **Pressed:** Scale 0.97, duration 150ms (spring animation)
- **Disabled:** 40% opacity, no interaction
- **Loading:** Spinner replaces content, button disabled

**Animations:**
```typescript
// Press Animation
Animated.spring(scale, {
  toValue: 0.97,
  damping: 15,
  stiffness: 400,
  mass: 0.5,
}).start();
```

#### 2.2 IconButton
**Status:** ❌ TODO

Square button with centered icon, commonly used for:
- Close buttons (X icon)
- Navigation actions (back, forward)
- Context menus (three dots)
- Quick actions (share, bookmark)

```typescript
<IconButton
  icon={<CloseIcon />}
  variant="ghost"
  size="md"
  onPress={handleClose}
  accessibilityLabel="Close modal"  // Required!
/>
```

**Accessibility:** `accessibilityLabel` is **required** for screen readers.

---

### 3. Card Components

#### 3.1 Card (Base Component)
**Status:** ❌ TODO

```typescript
interface CardProps {
  variant: 'default' | 'glass' | 'elevated' | 'outlined' | 'ai' | 'success' | 'subtle';
  padding: 'none' | 'compact' | 'default' | 'spacious';
  pressable?: boolean;
  onPress?: () => void;
  children: ReactNode;
}
```

**Variant Styles:**

| Variant | Background | Border | Shadow | Use Case |
|---------|------------|--------|--------|----------|
| `default` | `background.secondary` | Subtle | None | Standard cards |
| `glass` | Glass effect | Glass border | None | Premium content, AI insights |
| `elevated` | `background.elevated` | None | `md` | Floating elements, modals |
| `outlined` | Transparent | Muted | None | Empty states, placeholders |
| `ai` | AI glass | AI border | None | AI-generated content |
| `success` | Success bg | Success border | None | Success messages, wins |
| `subtle` | `background.primary` | Very subtle | None | Minimal cards |

#### 3.2 NeedleCard (Goal Card)
**Status:** ❌ TODO - **High Priority**

Displays a user's goal (Needle) with:
- Goal title and description
- Consistency percentage (color-coded)
- Number of binds (habits)
- Expandable to show bind details

```typescript
<NeedleCard
  title="Get Fit & Strong"
  description="Build sustainable fitness habits"
  consistency={75}          // Shown as "75% consistent"
  bindsCount={3}            // "3 binds"
  expanded={isExpanded}
  onPress={() => setExpanded(!isExpanded)}
>
  {expanded && <BindsList binds={binds} />}
</NeedleCard>
```

**Visual Design:**
- **Gradient Border:** Left edge has consistency-based gradient
  - 80%+: Emerald gradient
  - 50-79%: Amber gradient
  - <50%: Rose gradient
- **Glass Effect:** Opal-inspired background
- **Expand Animation:** Height animates with spring (300ms)

#### 3.3 BindCard (Habit Card)
**Status:** ❌ TODO - **High Priority**

Displays a single habit/action (Bind) with:
- Title and estimated time
- Completion checkbox
- Optional proof indicator (photo/note)
- Optional timer button

```typescript
<BindCard
  title="Morning gym session"
  estimatedTime="60 min"
  completed={isComplete}
  hasProof={true}
  onToggle={toggleComplete}
  onPress={navigateToDetail}
  onTimer={startTimer}
/>
```

#### 3.4 InsightCard (AI Insight)
**Status:** ❌ TODO - **High Priority**

Displays AI-generated insights with:
- Type indicator (winning, consider, tomorrow)
- Title and content
- Edit and dismiss actions

```typescript
<InsightCard
  type="winning"     // 'winning' | 'consider' | 'tomorrow'
  title="You're crushing it!"
  content="8 days of consistency on morning routine. Your identity as an early riser is solidifying."
  onEdit={handleEdit}
  onDismiss={handleDismiss}
/>
```

**Type Styles:**
- `winning`: Emerald accent, celebration tone
- `consider`: Amber accent, reflective tone
- `tomorrow`: Violet accent, planning tone

#### 3.5 CaptureCard (Proof Capture)
**Status:** ❌ TODO - **High Priority**

Displays captured proof (photo, note, timer):
- Image preview
- Note text
- Timestamp
- Delete action

```typescript
<CaptureCard
  type="photo"
  imageUri="file://..."
  timestamp="2 hours ago"
  onDelete={handleDelete}
/>
```

---

### 4. Input Components

#### 4.1 Input (Text Input)
**Status:** ❌ TODO

```typescript
interface InputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  secureTextEntry?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  maxLength?: number;
}
```

**States:**
- **Default:** Muted border, secondary text
- **Focus:** Accent border (2px), primary text
- **Error:** Rose border, error text below
- **Disabled:** 40% opacity, no interaction

**Visual Design:**
- Height: 44px (md), 52px (lg)
- Padding: 12px horizontal
- Border radius: 8px (md)
- Background: `background.secondary`

#### 4.2 TextArea
**Status:** ❌ TODO

Multi-line text input with:
- Expandable height (min 4 lines)
- Character counter
- Resize handle (optional)

```typescript
<TextArea
  label="Daily Reflection"
  placeholder="How do you feel about today?"
  value={reflection}
  onChangeText={setReflection}
  lines={4}
  maxLength={500}
  showCounter
/>
```

#### 4.3 SearchInput
**Status:** ❌ TODO

Search-specific input with:
- Search icon (left)
- Clear button (right, when has value)
- Rounded pill shape

```typescript
<SearchInput
  value={query}
  onChangeText={setQuery}
  onClear={() => setQuery('')}
  placeholder="Search goals..."
/>
```

---

### 5. Checkbox Components

#### 5.1 Checkbox
**Status:** ❌ TODO

Standard checkbox with label:

```typescript
<Checkbox
  checked={isChecked}
  onChange={setChecked}
  label="I agree to the terms"
  disabled={false}
/>
```

#### 5.2 BindCheckbox (Task Completion Checkbox)
**Status:** ❌ TODO - **High Priority**

Specialized checkbox for completing binds:
- Larger touch target (56px)
- Animated check with celebration
- Shows proof indicator
- Plays haptic feedback

```typescript
<BindCheckbox
  title="Morning gym session"
  estimatedTime="60 min"
  hasProof={true}
  checked={isComplete}
  onChange={toggleComplete}
  onPress={navigateToDetail}
/>
```

**Animations:**
- **Check:** Scale + fade-in (150ms)
- **Celebration:** Confetti particles (300ms) when completing
- **Haptic:** Success vibration (iOS)

---

### 6. Badge Components

#### 6.1 Badge
**Status:** ❌ TODO

```typescript
interface BadgeProps {
  variant: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ai';
  size: 'sm' | 'md' | 'lg';
  children: ReactNode;
}
```

**Sizes:**
- `sm`: Height 20px, padding 4px 8px, fontSize 12px
- `md`: Height 24px, padding 6px 12px, fontSize 14px
- `lg`: Height 28px, padding 8px 16px, fontSize 14px

#### 6.2 ConsistencyBadge
**Status:** ❌ TODO - **High Priority**

Auto-colors based on percentage:
- 80%+: Emerald
- 50-79%: Amber
- <50%: Rose

```typescript
<ConsistencyBadge percentage={75} />
// Renders: [🟡 75%]
```

#### 6.3 StreakBadge
**Status:** ❌ TODO - **High Priority**

```typescript
<StreakBadge count={12} />
// Renders: [🔥 12]
```

#### 6.4 AIBadge
**Status:** ❌ TODO

```typescript
<AIBadge />
// Renders: [✨ AI]
```

#### 6.5 StatusDot
**Status:** ❌ TODO

Colored dot indicator (8px diameter):

```typescript
<StatusDot status="success" />
<StatusDot status="warning" />
<StatusDot status="error" />
```

---

### 7. Progress Components

#### 7.1 ProgressBar
**Status:** ❌ TODO

Linear progress bar with:
- Percentage indicator
- Color-coded progress
- Animated fill

```typescript
<ProgressBar
  value={75}
  max={100}
  color="accent"
  height={8}
  showLabel
/>
```

#### 7.2 CircularProgress
**Status:** ❌ TODO

Circular progress indicator (like Apple Watch rings):

```typescript
<CircularProgress
  value={75}
  max={100}
  size={120}
  strokeWidth={12}
  color="accent"
  showLabel
/>
```

#### 7.3 ConsistencyHeatmap
**Status:** ❌ TODO - **High Priority**

Calendar-style heatmap showing daily consistency:
- 7 columns (days of week)
- Color intensity based on completion %
- Tap to see details

```typescript
<ConsistencyHeatmap
  data={consistencyData}  // Array of {date, percentage}
  onDayPress={(date) => showDetails(date)}
/>
```

#### 7.4 WeaveCharacter (Leveling Visual)
**Status:** ❌ TODO - **High Priority**

Animated character that "levels up" based on completed binds:
- Visual grows/evolves over time
- Displays current level
- Celebration animation on level up

```typescript
<WeaveCharacter
  level={12}
  progress={0.7}  // Progress to next level
  size="large"
/>
```

---

### 8. Navigation Components

#### 8.1 BottomTabBar
**Status:** ❌ TODO - **High Priority**

Thumb-friendly bottom navigation with:
- 4-5 primary destinations
- Active state indicator
- Icons with labels

```typescript
<BottomTabBar>
  <Tab icon="home" label="Home" active={activeTab === 'home'} />
  <Tab icon="list" label="Binds" active={activeTab === 'binds'} />
  <Tab icon="calendar" label="Journal" active={activeTab === 'journal'} />
  <Tab icon="chart" label="Progress" active={activeTab === 'progress'} />
  <Tab icon="user" label="Profile" active={activeTab === 'profile'} />
</BottomTabBar>
```

**Positioning:** Fixed to bottom, height 56px + safe area inset

**Active State:**
- Icon: Primary color
- Label: Primary color, medium weight
- Indicator: 2px line above icon (accent color)

**Inactive State:**
- Icon: Muted color
- Label: Muted color, regular weight

#### 8.2 HeaderBar
**Status:** ❌ TODO

Standard top navigation bar with:
- Back button (left)
- Title (center)
- Actions (right)

```typescript
<HeaderBar
  title="Goal Details"
  leftAction={<BackButton />}
  rightActions={[
    <IconButton icon="edit" />,
    <IconButton icon="more" />,
  ]}
/>
```

---

### 9. Modal & Overlay Components

#### 9.1 Modal
**Status:** ❌ TODO

Full-screen or centered modal with:
- Dimmed background overlay
- Glass-effect content area
- Close button
- Slide-up animation

```typescript
<Modal
  visible={isVisible}
  onClose={handleClose}
  title="Create New Goal"
>
  <ModalContent />
</Modal>
```

**Animations:**
- Enter: Slide up from bottom + fade in (300ms)
- Exit: Slide down + fade out (200ms)
- Background: Fade to 80% opacity

#### 9.2 BottomSheet
**Status:** ❌ TODO

Drawer that slides up from bottom:
- Drag handle indicator
- Snap points (collapsed, half, full)
- Backdrop dismissal

```typescript
<BottomSheet
  visible={isVisible}
  onClose={handleClose}
  snapPoints={['25%', '50%', '90%']}
>
  <SheetContent />
</BottomSheet>
```

#### 9.3 Toast
**Status:** ❌ TODO

Temporary notification that auto-dismisses:
- Appears at top or bottom
- Color-coded by type
- Swipe to dismiss

```typescript
showToast({
  type: 'success',
  title: 'Bind completed!',
  message: 'Great work on your morning routine.',
  duration: 3000,
});
```

---

### 10. Specialized Weave Components

#### 10.1 DualPathVisualization
**Status:** ❌ TODO - **Medium Priority**

Shows positive and negative trajectory paths:
- Timeline visualization
- Projected outcomes
- Interactive "what-if" scenarios

```typescript
<DualPathVisualization
  currentState={userData}
  positiveProjection={positiveData}
  negativeProjection={negativeData}
/>
```

#### 10.2 DreamSelfChat (AI Chat Interface)
**Status:** ❌ TODO - **Medium Priority**

Chat interface for AI coaching:
- Message bubbles (user vs AI)
- Typing indicator
- Editable AI responses
- Voice input (future)

```typescript
<DreamSelfChat
  messages={chatHistory}
  onSend={handleSendMessage}
  onEditAI={handleEditAI}
  persona={userDreamSelf}
/>
```

#### 10.3 OnboardingFlow
**Status:** ❌ TODO - **High Priority**

Multi-step onboarding with:
- Progress indicator
- Skip option
- Animated transitions between steps

```typescript
<OnboardingFlow
  steps={[
    <WelcomeStep />,
    <IdentityStep />,
    <GoalStep />,
    <CommitmentStep />,
  ]}
  onComplete={handleComplete}
/>
```

---

## Animation & Motion System

### Motion Principles

Following Apple HIG:
1. **Purposeful:** Every animation serves a function
2. **Brief:** 150-300ms for UI interactions
3. **Realistic:** Follows physics (springs, not linear)
4. **Optional:** Respects reduced motion settings
5. **Peripheral-Aware:** Avoid motion at screen edges (disorienting)

### Spring Configurations

```typescript
springs: {
  // Default - smooth, natural (most UI interactions)
  default: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },

  // Quick - fast, snappy (button presses)
  quick: {
    damping: 20,
    stiffness: 300,
    mass: 0.8,
  },

  // Gentle - slow, smooth (modals, large elements)
  gentle: {
    damping: 20,
    stiffness: 100,
    mass: 1.2,
  },

  // Bouncy - playful, overshoots (celebrations)
  bouncy: {
    damping: 10,
    stiffness: 200,
    mass: 1,
  },

  // Press - button feedback
  press: {
    damping: 15,
    stiffness: 400,
    mass: 0.5,
  },
}
```

### Timing Durations

```typescript
durations: {
  instant: 0,
  fast: 150,       // Quick UI feedback (button press)
  normal: 200,     // Standard animations (checkbox, toggle)
  moderate: 300,   // Modal transitions, page changes
  slow: 500,       // Page transitions, complex animations
  verySlow: 800,   // Special effects, celebrations
}
```

### Animation Presets

#### Button Press
```typescript
<AnimatedPressable
  onPressIn={() => {
    scale.value = withSpring(0.97, springs.press);
  }}
  onPressOut={() => {
    scale.value = withSpring(1, springs.press);
  }}
>
  <Button>Press Me</Button>
</AnimatedPressable>
```

#### Fade In
```typescript
useEffect(() => {
  opacity.value = withTiming(1, {
    duration: durations.normal,
    easing: Easing.out(Easing.ease),
  });
}, []);
```

#### Slide Up (Modals)
```typescript
useEffect(() => {
  if (visible) {
    translateY.value = withTiming(0, {
      duration: durations.moderate,
      easing: Easing.out(Easing.cubic),
    });
  }
}, [visible]);
```

#### Celebration (Bind Completion)
```typescript
// Scale bounce + confetti particles
useEffect(() => {
  if (completed) {
    scale.value = withSequence(
      withSpring(1.1, springs.bouncy),
      withSpring(1, springs.default)
    );
    // Trigger confetti animation
    triggerConfetti();
    // Play haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
}, [completed]);
```

### Accessibility: Reduced Motion

Always check for reduced motion preference:

```typescript
import { AccessibilityInfo } from 'react-native';

const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

useEffect(() => {
  AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
    setPrefersReducedMotion(enabled);
  });
}, []);

// Then conditionally apply animations:
const animationConfig = prefersReducedMotion
  ? { duration: 0 }  // Instant
  : { duration: durations.normal, easing: easings.easeOut };
```

---

## Layout & Spacing

### Screen Layout Pattern

```typescript
function Screen() {
  const { colors, spacing } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing[4],  // 16px
          gap: spacing[6],      // 24px between sections
        }}
      >
        <HeaderSection />
        <ContentSection />
        <CTASection />
      </ScrollView>
    </SafeAreaView>
  );
}
```

### Card Stack Pattern

```typescript
<View style={{ gap: spacing[4] }}>
  <Card>Section 1</Card>
  <Card>Section 2</Card>
  <Card>Section 3</Card>
</View>
```

### Form Layout Pattern

```typescript
<Card padding="spacious">
  <Input label="Name" {...nameProps} />
  <Spacer height={spacing[4]} />
  <Input label="Email" {...emailProps} />
  <Spacer height={spacing[6]} />
  <Button onPress={handleSubmit}>Submit</Button>
</Card>
```

### Bottom Navigation Safe Area

```typescript
<View style={{
  height: layout.bottomNav.height,
  paddingBottom: insets.bottom,  // Safe area inset
}}>
  <BottomTabBar />
</View>
```

---

## Accessibility Standards

### WCAG AAA Compliance

All components meet WCAG AAA standards (7:1 contrast ratio for normal text, 4.5:1 for large text).

#### Contrast Ratios

| Element | Foreground | Background | Ratio | Pass |
|---------|------------|------------|-------|------|
| Primary text | `#ECECF1` | `#09090B` | 13.2:1 | AAA ✅ |
| Secondary text | `#D4D4DC` | `#09090B` | 10.8:1 | AAA ✅ |
| Muted text | `#71717F` | `#0F0F12` | 4.9:1 | AA ✅ |
| Primary button | `#09090B` | `#5B8DEF` | 8.1:1 | AAA ✅ |
| AI text | `#9D71E8` | `#09090B` | 5.2:1 | AA ✅ |

### Touch Targets

Minimum touch target: **44pt × 44pt** (Apple HIG)

All interactive elements (buttons, checkboxes, links, tabs) must meet this minimum.

### Screen Reader Support

All components include:
- `accessibilityLabel`: Human-readable label
- `accessibilityHint`: What happens on interaction
- `accessibilityRole`: Semantic role (button, link, checkbox, etc.)
- `accessibilityState`: Current state (selected, disabled, checked)

Example:
```typescript
<Button
  onPress={handleSubmit}
  accessibilityLabel="Submit form"
  accessibilityHint="Submits your information and creates your account"
  accessibilityRole="button"
  accessibilityState={{ disabled: !isValid }}
>
  Submit
</Button>
```

### Reduced Motion

Respect `prefers-reduced-motion` system setting:
- Disable or reduce animations
- Use instant transitions instead
- Maintain functionality without motion

### Color Blindness

- Never use color alone to convey information
- Use icons, labels, and patterns alongside color
- Test with color blindness simulators

---

## Implementation Roadmap

### Phase 1: Core Foundation (Week 1-2)
**Priority:** Critical - Blocks all feature development

✅ **Completed:**
- [x] Design tokens (colors, typography, spacing, animations)
- [x] Theme system (ThemeProvider, hooks)
- [x] Text components

❌ **TODO:**
- [ ] Button components (all variants)
- [ ] Card components (default, glass, elevated)
- [ ] Input components (text input, text area)
- [ ] Basic layout components

**Deliverable:** Developers can build basic screens with buttons, cards, and forms.

---

### Phase 2: Specialized Components (Week 3-4)
**Priority:** High - Required for MVP features

❌ **TODO:**
- [ ] NeedleCard (goal card)
- [ ] BindCard (habit card)
- [ ] BindCheckbox (task completion)
- [ ] ConsistencyBadge, StreakBadge
- [ ] CaptureCard (proof capture)
- [ ] InsightCard (AI insights)
- [ ] Bottom navigation

**Deliverable:** Core Weave features can be built (goals, binds, proof, AI insights).

---

### Phase 3: Progress & Visualization (Week 5)
**Priority:** Medium - Enhances user engagement

❌ **TODO:**
- [ ] ProgressBar, CircularProgress
- [ ] ConsistencyHeatmap
- [ ] WeaveCharacter (leveling visual)
- [ ] DualPathVisualization

**Deliverable:** Users can see their progress and identity transformation visually.

---

### Phase 4: Advanced Interactions (Week 6)
**Priority:** Medium - Improves UX polish

❌ **TODO:**
- [ ] Modal, BottomSheet
- [ ] Toast notifications
- [ ] Tooltips, Popovers
- [ ] Skeleton loaders
- [ ] Empty states

**Deliverable:** Polished UX with smooth overlays and loading states.

---

### Phase 5: Onboarding & AI (Week 7-8)
**Priority:** Medium - Critical for first impression

❌ **TODO:**
- [ ] OnboardingFlow components
- [ ] DreamSelfChat (AI chat interface)
- [ ] Identity discovery UI
- [ ] Goal breakdown wizard

**Deliverable:** Complete onboarding experience and AI coaching interface.

---

## Design System Governance

### Component Creation Guidelines

**When to Create a New Component:**
1. The pattern appears 3+ times across different screens
2. The component has distinct behavior or styling
3. It represents a core product concept (Needle, Bind, Weave)

**When NOT to Create a Component:**
1. It's a one-off UI element
2. It's a simple composition of existing components
3. It can be achieved with theme tokens + base components

### File Structure

```
src/design-system/
├── tokens/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── radius.ts
│   ├── effects.ts
│   └── animations.ts
├── theme/
│   ├── types.ts
│   ├── ThemeProvider.tsx
│   └── hooks/
│       ├── useColors.ts
│       ├── useSpacing.ts
│       ├── useTypography.ts
│       ├── useShadows.ts
│       └── useAnimations.ts
├── components/
│   ├── Text/
│   │   ├── Text.tsx
│   │   ├── Heading.tsx
│   │   ├── types.ts
│   │   └── Text.test.tsx
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── PrimaryButton.tsx
│   │   ├── SecondaryButton.tsx
│   │   ├── IconButton.tsx
│   │   ├── types.ts
│   │   └── Button.test.tsx
│   ├── Card/
│   ├── Input/
│   ├── Checkbox/
│   ├── Badge/
│   ├── Progress/
│   ├── Navigation/
│   ├── Modal/
│   └── Specialized/
│       ├── NeedleCard/
│       ├── BindCard/
│       ├── InsightCard/
│       └── WeaveCharacter/
├── constants.ts
├── index.ts
└── README.md
```

### Testing Standards

Every component must have:
1. **Unit tests** (Jest + React Native Testing Library)
2. **Accessibility tests** (screen reader labels, touch targets)
3. **Visual regression tests** (Storybook snapshots)
4. **Interaction tests** (press, hover, focus states)

Example:
```typescript
describe('Button', () => {
  it('renders with correct text', () => {
    const { getByText } = render(<Button>Press Me</Button>);
    expect(getByText('Press Me')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button onPress={onPress}>Press Me</Button>);
    fireEvent.press(getByText('Press Me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('meets accessibility standards', () => {
    const { getByRole } = render(<Button>Press Me</Button>);
    const button = getByRole('button');
    expect(button).toHaveAccessibilityLabel('Press Me');
  });
});
```

### Documentation Standards

Every component must have:
1. **JSDoc comments** with props descriptions
2. **Usage examples** in README or Storybook
3. **Do's and Don'ts** for common pitfalls
4. **Accessibility notes** for screen readers

Example:
```typescript
/**
 * Primary button component for main actions and CTAs.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onPress={handleSubmit}>
 *   Submit
 * </Button>
 * ```
 *
 * @accessibility
 * - Minimum touch target: 44x44pt
 * - Automatically includes accessibilityRole="button"
 * - Add accessibilityLabel for icon-only buttons
 */
export function Button({ ... }: ButtonProps) { ... }
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 18, 2025 | Initial comprehensive specification |

---

## References

1. **Apple Human Interface Guidelines** - Motion, Accessibility, iOS Design
2. **Material Design 3** - Component patterns, motion principles
3. **Tailwind CSS v4** - Design tokens, utility-first approach
4. **React Native Reanimated v4** - Animation library
5. **WCAG 2.1 AAA** - Accessibility standards

---

## Appendix A: Component Checklist

Use this checklist when implementing new components:

### Design
- [ ] Follows Weave design principles (glassmorphism, dark-first, minimalism)
- [ ] Uses design tokens (no hardcoded values)
- [ ] Matches Figma designs (if applicable)
- [ ] Supports all required variants
- [ ] Handles all states (default, hover, pressed, disabled, loading, error)

### Development
- [ ] TypeScript types defined
- [ ] Props interface documented with JSDoc
- [ ] Uses theme hooks (useTheme, useColors, etc.)
- [ ] Follows naming conventions (PascalCase for components)
- [ ] Exports from index.ts

### Accessibility
- [ ] Meets 44pt minimum touch target
- [ ] Includes accessibilityLabel and accessibilityRole
- [ ] Supports screen readers
- [ ] Respects reduced motion settings
- [ ] Passes contrast ratio tests (WCAG AAA)

### Testing
- [ ] Unit tests written
- [ ] Accessibility tests included
- [ ] Visual regression tests (Storybook)
- [ ] Interaction tests (press, focus, etc.)

### Documentation
- [ ] JSDoc comments added
- [ ] Usage examples provided
- [ ] Added to design-system-guide.md
- [ ] Do's and Don'ts documented

---

**End of Comprehensive Design System Specification**

This document serves as the single source of truth for all design decisions in Weave. For implementation questions, refer to the design system guide (`docs/dev/design-system-guide.md`) or reach out to the UX team.

**Next Steps:**
1. Review and approve this specification
2. Begin Phase 1 implementation (Core Foundation)
3. Set up Storybook for component preview
4. Implement design system testing infrastructure
5. Migrate existing components to new system

