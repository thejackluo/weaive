---
document_type: 'ux-design'
project: 'Weave'
version: '1.0'
created: '2025-12-16'
status: 'active'
owner: 'Jack'
workflow_phase: 'planning'
last_updated: '2025-12-16'
platform: 'iOS (React Native)'
---

# Weave UX Design Specification

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Design System](#design-system)
   - [Color Palette](#color-palette)
   - [Typography](#typography)
   - [Spacing System](#spacing-system)
   - [Elevation & Shadows](#elevation--shadows)
   - [Border Radius](#border-radius)
   - [Iconography](#iconography)
3. [Component Library](#component-library)
4. [Navigation Architecture](#navigation-architecture)
5. [Screen Specifications](#screen-specifications)
6. [User Flows](#user-flows)
7. [Interaction Patterns](#interaction-patterns)
8. [Motion & Animation](#motion--animation)
9. [Accessibility](#accessibility)
10. [Responsive Design](#responsive-design)

---

## Design Philosophy

### Core Principles

**1. Clarity Over Complexity**
Every screen answers one question. Thread answers "What should I do?" Weave answers "How am I doing?" Users should never feel lost or overwhelmed.

**2. Trust Through Transparency**
All AI outputs are editable. All data is user-controlled. The system trusts users (no complex verification), and users trust the system (no hidden behaviors).

**3. Progress, Not Perfection**
Celebrate consistency over completion. Show streaks but also resilience. Recovery is part of the journey, not failure.

**4. Identity-Centered**
Every interaction reinforces who the user is becoming. The Dream Self isn't just a feature—it's the soul of the experience.

**5. Minimal Friction**
Complete a bind in <30 seconds. Document a capture in <10 seconds. The app gets out of the way of doing the work.

### Visual Philosophy

**Aesthetic:** Futuristic Minimal Productivity

Think: Opal app's calm elegance + Duolingo's approachable warmth + Notion's clean functionality

**Key Visual Attributes:**
- Calm, not urgent
- High-end, not flashy
- Glass + whitespace, not sci-fi clutter
- Purposeful, not decorative

### North Star Reminder

Every design decision should optimize for:

**Active Days with Proof** = User completes ≥1 bind + logs proof OR journal

The UX must constantly shepherd users toward:
1. Doing a bind (action)
2. Leaving proof (capture) or reflecting (check-in)

---

## Design System

### Color Palette

#### Primary Colors

```
Primary Blue (Action)
├── primary-50:   #EEF4FF
├── primary-100:  #D9E5FF
├── primary-200:  #BCD4FF
├── primary-300:  #8EBAFF
├── primary-400:  #5994FF
├── primary-500:  #3B72F6  ← Primary action color
├── primary-600:  #2858E8
├── primary-700:  #1E44D5
├── primary-800:  #1F38AC
├── primary-900:  #1E3388
└── primary-950:  #172154
```

#### Secondary Colors

```
Warm Amber (Progress/Success)
├── amber-50:     #FFFBEB
├── amber-100:    #FEF3C7
├── amber-200:    #FDE68A
├── amber-300:    #FCD34D
├── amber-400:    #FBBF24  ← Highlight/celebration
├── amber-500:    #F59E0B
├── amber-600:    #D97706
├── amber-700:    #B45309
├── amber-800:    #92400E
└── amber-900:    #78350F

Soft Violet (AI/Dream Self)
├── violet-50:    #F5F3FF
├── violet-100:   #EDE9FE
├── violet-200:   #DDD6FE
├── violet-300:   #C4B5FD
├── violet-400:   #A78BFA  ← AI accent
├── violet-500:   #8B5CF6
├── violet-600:   #7C3AED
├── violet-700:   #6D28D9
├── violet-800:   #5B21B6
└── violet-900:   #4C1D95
```

#### Semantic Colors

```
Success (Completion)
├── success-light:  #D1FAE5
├── success-base:   #10B981
└── success-dark:   #047857

Warning (Attention)
├── warning-light:  #FEF3C7
├── warning-base:   #F59E0B
└── warning-dark:   #B45309

Error (Critical)
├── error-light:    #FEE2E2
├── error-base:     #EF4444
└── error-dark:     #B91C1C

Info (Informational)
├── info-light:     #DBEAFE
├── info-base:      #3B82F6
└── info-dark:      #1D4ED8
```

#### Neutral Colors

```
Neutral Gray (Text & Backgrounds)
├── neutral-0:    #FFFFFF  ← Primary background
├── neutral-50:   #FAFAFA  ← Secondary background
├── neutral-100:  #F5F5F5  ← Tertiary background
├── neutral-200:  #E5E5E5  ← Borders
├── neutral-300:  #D4D4D4  ← Disabled states
├── neutral-400:  #A3A3A3  ← Placeholder text
├── neutral-500:  #737373  ← Secondary text
├── neutral-600:  #525252  ← Body text
├── neutral-700:  #404040  ← Primary text
├── neutral-800:  #262626  ← Headlines
├── neutral-900:  #171717  ← High emphasis
└── neutral-950:  #0A0A0A  ← Maximum contrast
```

#### Special Colors

```
Heat Map Gradient (Consistency Visualization)
├── heat-0:       #F5F5F5  ← No activity (0%)
├── heat-20:      #C7E9C0  ← Low (1-20%)
├── heat-40:      #74C476  ← Medium-low (21-40%)
├── heat-60:      #31A354  ← Medium (41-60%)
├── heat-80:      #006D2C  ← High (61-80%)
└── heat-100:     #00441B  ← Complete (81-100%)

Weave Gradient (Character Progression)
├── thread:       #E5E5E5  ← Starting state
├── strand:       #A78BFA  ← Early progress
├── cord:         #8B5CF6  ← Gaining momentum
├── braid:        #6D28D9  ← Strong consistency
└── weave:        #4C1D95  ← Mastery
```

#### Dark Mode Colors (Future)

```
Dark Backgrounds
├── dark-bg-primary:    #0A0A0A
├── dark-bg-secondary:  #171717
├── dark-bg-elevated:   #262626
└── dark-bg-card:       #1F1F1F

Dark Text
├── dark-text-primary:   #FAFAFA
├── dark-text-secondary: #A3A3A3
└── dark-text-muted:     #525252
```

---

### Typography

#### Font Family

```
Primary Font: SF Pro (iOS System Font)
├── Display:  SF Pro Display
├── Text:     SF Pro Text
└── Rounded:  SF Pro Rounded (optional, for friendly elements)

Fallback Stack: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif

Monospace (code/data): SF Mono, "Fira Code", monospace
```

#### Type Scale

```
Display (Headlines)
├── display-2xl:  36px / 40px / -0.02em / Bold (700)
├── display-xl:   30px / 36px / -0.02em / Bold (700)
├── display-lg:   24px / 32px / -0.01em / Semibold (600)
└── display-md:   20px / 28px / -0.01em / Semibold (600)

Text (Body)
├── text-lg:      18px / 28px / 0 / Regular (400)
├── text-base:    16px / 24px / 0 / Regular (400)  ← Default body
├── text-sm:      14px / 20px / 0 / Regular (400)
└── text-xs:      12px / 16px / 0 / Regular (400)

Labels (UI Elements)
├── label-lg:     16px / 24px / 0.01em / Medium (500)
├── label-base:   14px / 20px / 0.01em / Medium (500)  ← Buttons
├── label-sm:     12px / 16px / 0.02em / Medium (500)
└── label-xs:     10px / 14px / 0.02em / Medium (500)  ← Badges
```

#### Typography Usage

| Element | Style | Weight | Color |
|---------|-------|--------|-------|
| Page Title | display-xl | Bold | neutral-900 |
| Section Header | display-lg | Semibold | neutral-800 |
| Card Title | display-md | Semibold | neutral-800 |
| Body Text | text-base | Regular | neutral-600 |
| Secondary Text | text-sm | Regular | neutral-500 |
| Caption | text-xs | Regular | neutral-400 |
| Button Primary | label-base | Medium | neutral-0 (white) |
| Button Secondary | label-base | Medium | primary-600 |
| Navigation Label | label-sm | Medium | neutral-600 |
| Badge | label-xs | Medium | varies |

---

### Spacing System

#### Base Unit

```
Base Unit: 4px

Spacing Scale:
├── space-0:    0px
├── space-0.5:  2px
├── space-1:    4px
├── space-1.5:  6px
├── space-2:    8px
├── space-2.5:  10px
├── space-3:    12px
├── space-4:    16px   ← Default component padding
├── space-5:    20px
├── space-6:    24px   ← Card padding
├── space-8:    32px   ← Section spacing
├── space-10:   40px
├── space-12:   48px   ← Large section spacing
├── space-16:   64px
├── space-20:   80px
└── space-24:   96px   ← Screen edge to content (max)
```

#### Layout Spacing

```
Screen Margins
├── horizontal:  16px (space-4)
├── top:         Safe area + 16px
└── bottom:      Safe area + 16px

Card Internal Padding
├── compact:     12px (space-3)
├── default:     16px (space-4)
└── spacious:    24px (space-6)

List Item Spacing
├── tight:       8px (space-2)
├── default:     12px (space-3)
└── relaxed:     16px (space-4)

Section Spacing
├── within:      24px (space-6)
└── between:     32px (space-8)
```

---

### Elevation & Shadows

#### Shadow Scale

```css
/* Elevation 0 - Flat */
shadow-none: none;

/* Elevation 1 - Subtle lift (cards, inputs) */
shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

/* Elevation 2 - Default card */
shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
             0 1px 2px -1px rgba(0, 0, 0, 0.1);

/* Elevation 3 - Dropdown, elevated cards */
shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
           0 2px 4px -2px rgba(0, 0, 0, 0.1);

/* Elevation 4 - Modals, floating elements */
shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
           0 4px 6px -4px rgba(0, 0, 0, 0.1);

/* Elevation 5 - Floating action button */
shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
           0 8px 10px -6px rgba(0, 0, 0, 0.1);
```

#### Glass Effect (Cards)

```css
/* Glass Card (Opal-inspired) */
.glass-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

/* Glass Card - Elevated */
.glass-card-elevated {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
}
```

---

### Border Radius

```
Radius Scale:
├── radius-none:   0px
├── radius-sm:     4px      ← Badges, small chips
├── radius-base:   8px      ← Buttons, inputs
├── radius-md:     12px     ← Cards, dropdowns
├── radius-lg:     16px     ← Large cards, modals
├── radius-xl:     24px     ← Pills, floating elements
├── radius-2xl:    32px     ← Large floating elements
└── radius-full:   9999px   ← Circles, avatars
```

---

### Iconography

#### Icon System

```
Icon Library: SF Symbols (iOS) + Custom icons for brand elements

Icon Sizes:
├── icon-xs:    16px    ← Inline icons
├── icon-sm:    20px    ← List item icons
├── icon-base:  24px    ← Default UI icons
├── icon-md:    28px    ← Navigation icons
├── icon-lg:    32px    ← Feature icons
├── icon-xl:    40px    ← Empty state icons
└── icon-2xl:   48px    ← Hero icons
```

#### Core Icons (SF Symbols)

| Purpose | Symbol Name | Usage |
|---------|-------------|-------|
| Home | house.fill | Thread tab |
| Dashboard | chart.bar.fill | Weave tab |
| Add | plus.circle.fill | Create action |
| Chat | bubble.left.fill | Talk to Weave |
| Camera | camera.fill | Photo capture |
| Timer | timer | Time tracking |
| Check | checkmark.circle.fill | Completion |
| Edit | pencil | Edit action |
| Settings | gearshape.fill | Settings |
| Profile | person.crop.circle | User profile |
| Goal | target | Needle (goal) |
| Habit | repeat | Bind (habit) |
| Calendar | calendar | Date selection |
| Notification | bell.fill | Notifications |
| Streak | flame.fill | Streak indicator |
| Star | star.fill | Achievement |

#### Custom Brand Icons

| Icon | Purpose | Description |
|------|---------|-------------|
| Weave Logo | Brand | Stylized thread becoming weave pattern |
| Thread | Starting state | Simple single line |
| Strand | Level 2 | Two intertwined lines |
| Cord | Level 3 | Three intertwined lines |
| Braid | Level 4 | Complex pattern starting |
| Weave | Mastery | Full woven pattern |
| Dream Self | AI | Abstract human silhouette with glow |

---

## Component Library

### Buttons

#### Primary Button

```
Variants: default, loading, disabled

Sizing:
├── sm:   Height 32px, Padding 12px, Font label-sm
├── base: Height 44px, Padding 16px, Font label-base  ← Default
└── lg:   Height 52px, Padding 20px, Font label-lg

States:
├── default:  bg-primary-500, text-white
├── hover:    bg-primary-600
├── pressed:  bg-primary-700, scale(0.98)
├── disabled: bg-neutral-300, text-neutral-500
└── loading:  bg-primary-500, spinner overlay

Radius: radius-base (8px)
Shadow: shadow-sm
```

#### Secondary Button

```
States:
├── default:  bg-transparent, border-primary-500, text-primary-600
├── hover:    bg-primary-50
├── pressed:  bg-primary-100, scale(0.98)
├── disabled: border-neutral-300, text-neutral-400
└── loading:  spinner overlay
```

#### Ghost Button

```
States:
├── default:  bg-transparent, text-primary-600
├── hover:    bg-neutral-100
├── pressed:  bg-neutral-200
└── disabled: text-neutral-400
```

#### Destructive Button

```
States:
├── default:  bg-error-base, text-white
├── hover:    bg-error-dark
├── pressed:  bg-error-dark, scale(0.98)
└── disabled: bg-neutral-300
```

---

### Cards

#### Base Card

```
Structure:
├── Container: bg-white, radius-md, shadow-base, padding-4
├── Header (optional): display-md, border-bottom
├── Body: Content area
└── Footer (optional): Actions, border-top

Variants:
├── default:   Standard card with shadow
├── elevated:  shadow-lg, slightly larger padding
├── outlined:  border instead of shadow
└── glass:     Glass effect with blur
```

#### Needle Card (Goal)

```
Structure:
├── Collapse Header
│   ├── Goal icon (target)
│   ├── Goal title (display-md)
│   ├── Consistency badge (percentage)
│   └── Chevron indicator
├── Expanded Content
│   ├── List of binds for today
│   └── Progress indicator
└── Tap area: Full header

States:
├── collapsed: Shows header only
├── expanded:  Shows full content with animation
└── disabled:  Grayed out (no active binds today)

Animation: 300ms ease-out expand/collapse
```

#### Bind Card (Task)

```
Structure:
├── Checkbox (left)
├── Content (center)
│   ├── Bind title (text-base)
│   ├── Estimated time (text-xs, neutral-500)
│   └── Proof indicator (if attached)
└── Action (right): Chevron or timer icon

States:
├── incomplete: Empty checkbox, full opacity
├── complete:   Filled checkbox, strikethrough title
├── with-proof: Shows proof badge
└── tappable:   Press feedback

Tap Behavior: Opens Bind Detail screen
```

#### AI Insight Card

```
Structure:
├── Icon (violet-400)
├── Content
│   ├── Insight title (display-md)
│   ├── Insight body (text-sm)
│   └── Evidence/data point (text-xs, neutral-500)
└── Actions
    ├── "Helpful" button
    └── "Not true" button

Visual: Left border accent (violet-400), glass effect
```

---

### Inputs

#### Text Input

```
Structure:
├── Label (optional): label-sm, neutral-700
├── Input container: height 48px, radius-base
│   ├── Leading icon (optional)
│   ├── Input text
│   └── Trailing icon (optional)
├── Helper text: text-xs, neutral-500
└── Error text: text-xs, error-base

States:
├── default:   border-neutral-200, bg-white
├── focused:   border-primary-500, ring-2 ring-primary-100
├── error:     border-error-base, bg-error-light/10
├── disabled:  bg-neutral-100, text-neutral-400
└── readonly:  bg-neutral-50
```

#### Text Area

```
Same as Text Input, with:
├── Min height: 96px
├── Max height: 200px (expandable)
├── Resize handle (optional)
└── Character count (optional)
```

#### Slider

```
Structure:
├── Label: label-sm
├── Track: height 4px, radius-full
│   ├── Inactive track: neutral-200
│   └── Active track: primary-500
├── Thumb: 24px circle, shadow-md
└── Value display: text-sm

Range: Customizable (default 1-10)
Step: Customizable (default 1)
```

#### Selection Chips

```
Structure:
├── Chip group (horizontal scroll or wrap)
└── Chip item
    ├── Label: label-sm
    └── Optional icon

States:
├── unselected: bg-neutral-100, text-neutral-700
├── selected:   bg-primary-500, text-white
├── disabled:   bg-neutral-50, text-neutral-400
└── multi:      Can select multiple (checkbox style)
```

---

### Navigation

#### Bottom Tab Bar

```
Structure:
├── Container: height 84px (includes safe area), bg-white, shadow-lg (upward)
├── Tab items (2 tabs)
│   ├── Thread (Home)
│   └── Weave (Dashboard)
└── Floating action button (center-top overlap)

Tab Item:
├── Icon: icon-md (28px)
├── Label: label-xs
├── States: inactive (neutral-400), active (primary-500)
└── Tap area: Full height, min 44px width

Floating Button:
├── Size: 56px
├── Icon: plus
├── Position: Center, overlapping tab bar
├── Shadow: shadow-xl
└── Action: Opens action menu
```

#### Floating Action Menu

```
Trigger: Tap floating button in tab bar

Structure:
├── Backdrop: Semi-transparent black (0.4)
├── Menu container (bottom sheet style)
│   ├── "Talk to Weave" button
│   │   ├── Icon: bubble.left
│   │   └── Label: "Talk to Weave"
│   ├── "Document" button
│   │   ├── Icon: camera
│   │   └── Label: "Quick Capture"
│   └── Cancel button
└── Animation: Slide up with fade

Dismiss: Tap backdrop or Cancel
```

#### Top Navigation Bar

```
Structure:
├── Container: height 44px (plus safe area), bg-white/transparent
├── Leading (left)
│   ├── Back button (if applicable)
│   └── Page title (if no back)
├── Center
│   └── Title (if back button present)
└── Trailing (right)
    └── Action buttons (max 2)

Variants:
├── solid:       bg-white, border-bottom
├── transparent: bg-transparent (for scroll-under effect)
└── large-title: iOS large title style
```

---

### Modals & Sheets

#### Bottom Sheet

```
Structure:
├── Handle: 36px wide, 4px tall, radius-full, neutral-300
├── Header (optional)
│   ├── Title
│   └── Close button
├── Content: Scrollable
└── Actions (optional): Fixed at bottom

Sizing:
├── small:  40% screen height
├── medium: 60% screen height
├── large:  90% screen height
└── auto:   Fit content (max 90%)

Animation: Spring animation, 400ms
Dismiss: Drag down or tap backdrop
```

#### Alert Dialog

```
Structure:
├── Backdrop: Semi-transparent black (0.4)
├── Dialog container: max-width 320px, radius-lg
│   ├── Title: display-md, center
│   ├── Message: text-base, center
│   └── Actions: Horizontal button row
└── Animation: Scale + fade

Button Layout:
├── 2 buttons: Side by side
└── 3+ buttons: Stacked vertically
```

#### Full Screen Modal

```
Structure:
├── Top bar: Close button (left), Title (center), Action (right)
├── Content: Full screen scrollable
└── Bottom bar (optional): Fixed actions

Animation: Slide up from bottom
Dismiss: Close button or swipe down (if enabled)
```

---

### Lists

#### Simple List

```
Structure:
├── List container
└── List items
    ├── Leading (optional): Icon or avatar
    ├── Content
    │   ├── Title: text-base
    │   └── Subtitle (optional): text-sm, neutral-500
    └── Trailing (optional): Chevron, badge, or switch

Item Height: 56px (single line), 72px (two lines)
Separator: 1px neutral-200, inset from leading
```

#### Grouped List

```
Structure:
├── Group
│   ├── Header: label-sm, uppercase, neutral-500
│   ├── Items: Same as simple list
│   └── Footer (optional): text-xs, neutral-400
└── Gap between groups: space-6
```

---

### Progress Indicators

#### Linear Progress

```
Structure:
├── Track: height 4px, radius-full, neutral-200
└── Fill: radius-full, primary-500 (or semantic color)

Variants:
├── determinate: Fill width = percentage
├── indeterminate: Animated shimmer
└── buffer: Two-layer fill (buffer + progress)
```

#### Circular Progress

```
Sizes:
├── sm:    24px
├── base:  32px
├── lg:    48px
└── xl:    64px

Stroke Width: 3px (scales with size)
Animation: Clockwise rotation, ease-in-out
```

#### Consistency Heat Map

```
Structure:
├── Grid of cells (7 columns for week view)
├── Each cell: 12px square, radius-sm
├── Color: heat-0 to heat-100 based on percentage
└── Tooltip on tap: Date + completion percentage

Legend:
├── Position: Below grid
└── Shows: Color scale from "Less" to "More"
```

---

### Feedback & Status

#### Toast Notification

```
Structure:
├── Container: radius-lg, shadow-lg, padding-4
├── Icon (left): Semantic color
├── Message: text-sm
└── Action (optional): Ghost button

Position: Bottom center, 80px from bottom
Duration: 3 seconds (auto-dismiss)
Animation: Slide up + fade in

Variants:
├── success: success-base icon
├── error:   error-base icon
├── warning: warning-base icon
└── info:    info-base icon
```

#### Badge

```
Sizes:
├── sm:   16px height, label-xs
├── base: 20px height, label-sm
└── lg:   24px height, label-base

Variants:
├── default:  bg-neutral-100, text-neutral-700
├── primary:  bg-primary-100, text-primary-700
├── success:  bg-success-light, text-success-dark
├── warning:  bg-warning-light, text-warning-dark
├── error:    bg-error-light, text-error-dark
└── violet:   bg-violet-100, text-violet-700 (AI)

Dot Badge: 8px circle, positioned top-right
```

#### Empty State

```
Structure:
├── Illustration/Icon: icon-2xl, neutral-300
├── Title: display-md
├── Description: text-base, neutral-500
└── Action (optional): Primary button

Usage: When lists/screens have no content
Animation: Fade in on mount
```

---

## Navigation Architecture

**Implementation:** Epic 1.5, Story 1.5.1 - Core Navigation Architecture
**Status:** ✅ Implemented
**Last Updated:** 2025-12-21

### Information Architecture

```
App Structure (Story 1.5.1)
├── Tab Navigation (2 visible tabs + center AI button)
│   ├── Thread (Tab 1 - Left)
│   │   ├── Today's Binds (Epic 3)
│   │   ├── Daily Actions & Proof
│   │   ├── Bind Completion Cards
│   │   └── Stack Navigation →
│   │       ├── Bind Detail [id]
│   │       └── Attach Proof [id]
│   │
│   ├── AI Coach (Center Button - Glassmorphism Overlay)
│   │   ├── Magical blur background (iOS 18 Siri-inspired)
│   │   ├── Slide-up card interface
│   │   ├── Chat with AI Coach (Epic 6)
│   │   ├── Swipe-down to dismiss
│   │   └── Tap outside to close
│   │
│   └── Dashboard (Tab 2 - Right)
│       ├── Progress Visualization (Epic 5)
│       ├── Consistency Heatmap
│       ├── Fulfillment Trend
│       ├── Weave Character
│       └── Stack Navigation →
│           ├── Goals Management
│           ├── Settings
│           └── Profile
│
├── Stack Screens (15+ placeholder screens)
│   ├── Goals/ (Epic 2)
│   │   ├── index.tsx → Goals List
│   │   ├── [id].tsx → Goal Detail
│   │   ├── new.tsx → Create Goal (Modal)
│   │   └── edit/[id].tsx → Edit Goal (Modal)
│   │
│   ├── Binds/ (Epic 3)
│   │   ├── [id].tsx → Bind Detail
│   │   └── proof/[id].tsx → Attach Proof
│   │
│   ├── Journal/ (Epic 4)
│   │   ├── index.tsx → Daily Reflection
│   │   ├── history.tsx → Journal History
│   │   └── [date].tsx → Past Entry
│   │
│   ├── Captures/ (Epic 3)
│   │   ├── index.tsx → Capture Gallery
│   │   └── [id].tsx → Capture Detail
│   │
│   └── Settings/ (Epic 8)
│       ├── index.tsx → Settings Home
│       ├── identity.tsx → Edit Identity Document
│       └── subscription.tsx → Subscription Management
│
└── Auth & Onboarding Flows
    ├── (auth)/ → Login, Signup
    └── (onboarding)/ → Welcome, Identity, First Goal
```

### Navigation Patterns

| Pattern | Usage | Implementation | Examples |
|---------|-------|----------------|----------|
| **Tab Switch** | Main navigation | Tab bar, instant (<50ms) | Thread ↔ Dashboard |
| **Center Button** | AI Chat access | Floating button, glassmorphism overlay | AI Coach overlay |
| **Blur Overlay** | AI Chat modal | Backdrop blur + slide-up card | Siri-inspired design |
| **Stack Push** | Detail views | Slide from right (300ms) | Goal Detail, Bind Detail |
| **Modal Present** | Creation, editing | Slide from bottom (300ms) | New Goal, Edit Goal |
| **Swipe Down** | Dismiss overlays | Pan gesture, spring animation | Close AI Chat |
| **Tap Outside** | Quick dismiss | Pressable background | Close AI Chat |

### Primary User Flows

**1. Daily Action Completion**
```
Thread Tab → Bind Card → Bind Detail → Complete → Attach Proof (optional) → Back to Thread
```

**2. AI Coaching Session**
```
Any Screen → Center AI Button → AI Chat Overlay → Chat with Coach → Swipe Down to Dismiss
```

**3. Daily Reflection**
```
Dashboard → Journal → Daily Reflection → Answer Questions → AI Feedback → Complete
```

**4. Goal Management**
```
Dashboard → Goals → Goals List → Goal Detail → Edit/Archive
```

**5. Progress Review**
```
Dashboard → View Heat Map → View Fulfillment Chart → View Weave Character
```

### Glassmorphism AI Chat Design Spec

**Visual Design:**
- **Background:** Blur effect (expo-blur, intensity: 80, tint: dark)
- **Dim Overlay:** rgba(0, 0, 0, 0.5)
- **Card Background:** rgba(26, 26, 26, 0.98) with 3px purple glow border
- **Border Color:** rgba(167, 139, 250, 0.6) - purple accent
- **Shadow:** 0 -4px 32px rgba(167, 139, 250, 0.9)
- **Border Radius:** 24px (top corners only)
- **Height:** 70% of screen
- **Width:** 90% of screen

**Animation Timing:**
- **Open:** Fade-in blur (250ms) + slide-up card (300ms spring)
- **Close:** Fade-out blur (200ms) + slide-down card (200ms)
- **Gesture Dismiss:** Swipe down >100px or velocity >500px/s

**Interaction:**
- ✅ Tap center AI button to open
- ✅ Tap outside card to dismiss
- ✅ Swipe down on card to dismiss
- ✅ Android back button to dismiss
- ✅ Close button (top-right X icon)

---

## Screen Specifications

### S-01: Splash Screen

**Purpose:** App launch and loading

**Duration:** 2-3 seconds (or until data loaded)

**Layout:**
```
┌─────────────────────────┐
│                         │
│                         │
│                         │
│         [Logo]          │
│                         │
│    "See who you're      │
│      becoming."         │
│                         │
│                         │
│        [Spinner]        │
│                         │
└─────────────────────────┘
```

**Elements:**
- Weave logo: 80px, centered
- Tagline: text-base, neutral-500, below logo
- Loading spinner: 24px, primary-500, bottom

**Animation:** Logo fades in (500ms), spinner appears after 1s

---

### S-02: Welcome Screen (Onboarding)

**Purpose:** First screen for new users

**Layout:**
```
┌─────────────────────────┐
│                         │
│     [Illustration]      │
│                         │
│   "Turn vague goals     │
│    into daily wins,     │
│    proof, and a         │
│   stronger identity     │
│      in 10 days."       │
│                         │
│                         │
│   [Get Started Button]  │
│                         │
│    Already have an      │
│    account? Sign in     │
│                         │
└─────────────────────────┘
```

**Elements:**
- Illustration: 200px height, centered (thread → weave visual)
- Headline: display-xl, neutral-900, center
- Button: Primary, lg size, full width
- Sign in link: text-sm, primary-600

---

### S-03: Demographics (Onboarding)

**Purpose:** Collect basic user info

**Layout:**
```
┌─────────────────────────┐
│ [Back]      Step 1/4    │
├─────────────────────────┤
│                         │
│   "Tell us about        │
│     yourself"           │
│                         │
│   I am a...             │
│   ┌─────────────────┐   │
│   │ [Student      ] │   │
│   │ [Professional ] │   │
│   │ [Entrepreneur ] │   │
│   │ [Creative     ] │   │
│   │ [Other        ] │   │
│   └─────────────────┘   │
│                         │
│   Timezone              │
│   [Auto-detected: PST]  │
│                         │
│   I'm most productive   │
│   ○ Morning ○ Afternoon │
│   ○ Evening ○ Flexible  │
│                         │
│      [Continue]         │
│                         │
└─────────────────────────┘
```

**Elements:**
- Progress: Step indicator (1/4)
- Title: display-lg
- Selection: Single-select chips
- Timezone: Auto-detect with override dropdown
- Working hours: Radio group
- Button: Primary, disabled until selection

---

### S-04: Archetype Assessment (Onboarding)

**Purpose:** Determine user personality type

**Layout:**
```
┌─────────────────────────┐
│ [Back]      Step 2/4    │
├─────────────────────────┤
│                         │
│   Question 3 of 8       │
│   ═══════░░░░░░░░░      │
│                         │
│   "When you achieve     │
│    something, what      │
│    matters most?"       │
│                         │
│   ┌─────────────────┐   │
│   │ The visible     │   │
│   │ accomplishment  │   │
│   └─────────────────┘   │
│   ┌─────────────────┐   │
│   │ The learning    │   │
│   │ experience      │   │
│   └─────────────────┘   │
│   ┌─────────────────┐   │
│   │ How it helped   │   │
│   │ others          │   │
│   └─────────────────┘   │
│   ┌─────────────────┐   │
│   │ The personal    │   │
│   │ growth          │   │
│   └─────────────────┘   │
│                         │
└─────────────────────────┘
```

**Elements:**
- Progress bar: Linear, shows question progress
- Question: display-md, center
- Options: Tappable cards, single select
- Auto-advance: After selection, 300ms delay, next question

---

### S-05: Archetype Result (Onboarding)

**Purpose:** Show user their archetype

**Layout:**
```
┌─────────────────────────┐
│ [Back]      Step 2/4    │
├─────────────────────────┤
│                         │
│     [Archetype Icon]    │
│                         │
│     "The Achiever"      │
│                         │
│   You're driven by      │
│   visible progress and  │
│   accomplishments.      │
│   You thrive when you   │
│   can measure success.  │
│                         │
│   ┌─────────────────┐   │
│   │ "This sounds    │   │
│   │  like me"       │   │
│   └─────────────────┘   │
│                         │
│    Retake assessment    │
│                         │
│      [Continue]         │
│                         │
└─────────────────────────┘
```

**Elements:**
- Icon: Custom archetype icon, 64px
- Archetype name: display-xl
- Description: text-base, neutral-600
- Confirmation: Toggle/checkbox
- Retake: Ghost button
- Continue: Primary button

---

### S-06: Dream Self (Onboarding)

**Purpose:** Define user's ideal future self

**Layout:**
```
┌─────────────────────────┐
│ [Back]      Step 3/4    │
├─────────────────────────┤
│                         │
│   "Describe the person  │
│    you want to become"  │
│                         │
│   This becomes your AI  │
│   coach's voice.        │
│                         │
│   ┌─────────────────┐   │
│   │                 │   │
│   │ [Text area]     │   │
│   │                 │   │
│   │                 │   │
│   └─────────────────┘   │
│   124/500 characters    │
│                         │
│   Try these:            │
│   [Confident] [Focused] │
│   [Disciplined] [Calm]  │
│                         │
│      [Continue]         │
│                         │
└─────────────────────────┘
```

**Elements:**
- Title: display-lg
- Subtitle: text-sm, neutral-500
- Text area: 4 lines visible, 500 char max
- Character count: text-xs, neutral-400
- Suggestions: Tappable chips (append to text)
- Continue: Disabled until min 200 chars

---

### S-07: First Goal Setup (Onboarding)

**Purpose:** AI-assisted goal breakdown

**Layout:**
```
┌─────────────────────────┐
│ [Back]      Step 4/4    │
├─────────────────────────┤
│                         │
│   "What do you most     │
│    want to improve?"    │
│                         │
│   ┌─────────────────┐   │
│   │ Get fit         │   │
│   └─────────────────┘   │
│                         │
│   "Why is this          │
│    important to you?"   │
│                         │
│   ┌─────────────────┐   │
│   │ I want to feel  │   │
│   │ confident...    │   │
│   └─────────────────┘   │
│                         │
│   [Build My Roadmap]    │
│                         │
└─────────────────────────┘
```

**Loading State:**
```
┌─────────────────────────┐
│                         │
│     [AI Animation]      │
│                         │
│   "Building your        │
│    roadmap..."          │
│                         │
│   This takes about      │
│   30 seconds            │
│                         │
│   ═══════░░░░░░░░░      │
│                         │
└─────────────────────────┘
```

**Elements:**
- Goal input: Single line text
- Why input: Multi-line text area
- Button: Primary, triggers AI call
- Loading: Custom animation, progress bar

---

### S-08: Goal Breakdown Result (Onboarding)

**Purpose:** Show AI-generated goal structure

**Layout:**
```
┌─────────────────────────┐
│ [Back]                  │
├─────────────────────────┤
│                         │
│   "Here's your roadmap  │
│    to get fit"          │
│                         │
│   Q-Goals               │
│   ┌─────────────────┐   │
│   │ ✓ Strength      │   │
│   │   training 3x   │ ✏ │
│   │   per week      │   │
│   └─────────────────┘   │
│   ┌─────────────────┐   │
│   │ ✓ 120g protein  │   │
│   │   daily         │ ✏ │
│   └─────────────────┘   │
│                         │
│   Daily Habits          │
│   ┌─────────────────┐   │
│   │ ○ Morning gym   │   │
│   │   60 min        │ ✏ │
│   │   Mon,Wed,Fri   │   │
│   └─────────────────┘   │
│   ┌─────────────────┐   │
│   │ ○ Track protein │   │
│   │   5 min, daily  │ ✏ │
│   └─────────────────┘   │
│                         │
│   [+ Add another habit] │
│                         │
│   [Looks Good!]         │
│                         │
└─────────────────────────┘
```

**Elements:**
- Title: display-lg with goal name
- Q-goals: Editable cards with checkmarks
- Habits: Cards with frequency and duration
- Edit icon: Pencil, opens edit modal
- Add button: Ghost button
- Confirm: Primary button

---

### S-09: First Commitment (Onboarding)

**Purpose:** Seal commitment before starting

**Layout:**
```
┌─────────────────────────┐
│                         │
│     [Dream Self Icon]   │
│                         │
│   "Day 1 of your        │
│    10-day journey       │
│    begins now."         │
│                         │
│   Your first binds:     │
│   ┌─────────────────┐   │
│   │ ○ Morning gym   │   │
│   │ ○ Track protein │   │
│   │ ○ Evening walk  │   │
│   └─────────────────┘   │
│                         │
│                         │
│   ┌─────────────────┐   │
│   │                 │   │
│   │  Hold to        │   │
│   │  Commit         │   │
│   │                 │   │
│   └─────────────────┘   │
│                         │
│                         │
└─────────────────────────┘
```

**Elements:**
- Icon: Dream self visual, 80px
- Headline: display-lg
- Task list: Today's binds
- Commitment button: Large circle, hold interaction
- Hold progress: Ring fills over 2 seconds
- Haptic: Strong feedback on complete

---

### S-10: Thread (Home)

**Purpose:** Daily execution surface

**Layout:**
```
┌─────────────────────────┐
│ [Profile]  Thread  [•]  │
├─────────────────────────┤
│ Good morning! Yesterday │
│ you completed 4 binds.  │
│ Today's focus: gym.     │
├─────────────────────────┤
│                         │
│ Today's Priority        │
│ ┌─────────────────┐     │
│ │ 1. Track protein│ ✓   │
│ │ 2. Gym session  │     │
│ │ 3. Project work │     │
│ └─────────────────┘     │
│                         │
│ ▼ Get Fit (65%)         │
│ ┌─────────────────┐     │
│ │ ○ Morning gym   │  >  │
│ │ ○ Track protein │  >  │
│ └─────────────────┘     │
│                         │
│ ▼ Learn Spanish (42%)   │
│   (collapsed)           │
│                         │
│ ▼ Ship Side Project     │
│   (collapsed)           │
│                         │
├─────────────────────────┤
│ ┌─────────────────┐     │
│ │ Daily Check-in  │     │
│ │ Log moments and │  >  │
│ │ reflect         │     │
│ └─────────────────┘     │
├─────────────────────────┤
│ [Thread]  [+]  [Weave]  │
└─────────────────────────┘
```

**Elements:**
- Top bar: Profile icon (left), page title (center), notification indicator (right)
- AI insight: Glass card with yesterday's summary
- Triad: Numbered priority list
- Needles: Collapsible sections with consistency %
- Binds: Checkbox cards within needles
- Daily check-in: Large CTA card at bottom
- Tab bar: Thread (active), FAB, Weave

**Interactions:**
- Tap needle header: Expand/collapse
- Tap bind: Push to Bind Detail
- Tap Daily Check-in: Push to Reflection flow
- Tap FAB: Open action menu

---

### S-11: Bind Detail

**Purpose:** Complete a bind and add proof

**Layout:**
```
┌─────────────────────────┐
│ [X]     Morning Gym     │
├─────────────────────────┤
│                         │
│   Part of: Get Fit      │
│                         │
│   "This moves you       │
│   closer to being       │
│   someone who shows     │
│   up consistently."     │
│                         │
├─────────────────────────┤
│                         │
│   [  Start Timer  ]     │
│   or                    │
│   [  Mark Complete ]    │
│                         │
├─────────────────────────┤
│                         │
│   Add proof (optional)  │
│                         │
│   [Camera] [Note] [Skip]│
│                         │
├─────────────────────────┤
│                         │
│   Estimated: 60 min     │
│   Completed: 8 times    │
│                         │
└─────────────────────────┘
```

**Elements:**
- Close button: X icon (top left)
- Title: display-lg
- Goal context: text-sm, neutral-500
- AI quote: Italic text in glass card
- Timer button: Secondary, large
- Complete button: Primary, large
- Proof options: Icon buttons
- Stats: Footer with bind stats

**Completion Animation:**
- Confetti burst (2 seconds)
- Success toast
- Auto-navigate back (or to proof)

---

### S-12: Quick Capture

**Purpose:** Fast memory/proof capture

**Layout:**
```
┌─────────────────────────┐
│ [X]     Document        │
├─────────────────────────┤
│                         │
│   What do you want to   │
│   remember?             │
│                         │
│   ┌─────────────────┐   │
│   │                 │   │
│   │ [Camera View]   │   │
│   │                 │   │
│   └─────────────────┘   │
│                         │
│   [Photo] [Note] [Voice]│
│                         │
│   Link to bind:         │
│   [None ▼]              │
│                         │
│        [Save]           │
│                         │
└─────────────────────────┘
```

**Elements:**
- Close: X icon
- Title: display-md
- Camera preview: If photo mode
- Mode tabs: Photo, Note, Voice
- Link dropdown: Optional bind association
- Save: Primary button

**Photo Mode:**
- Full camera preview
- Capture button (shutter)
- Flash toggle
- Flip camera

**Note Mode:**
- Text area (280 char max)
- Character count

**Voice Mode:**
- Record button
- Duration display
- Playback controls

---

### S-13: Daily Reflection

**Purpose:** End-of-day check-in

**Layout:**
```
┌─────────────────────────┐
│ [X]     Reflect         │
├─────────────────────────┤
│                         │
│   Today's Summary       │
│   ┌─────────────────┐   │
│   │ ✓ 4/5 binds     │   │
│   │ ✓ 2 captures    │   │
│   │ • 2.5 hrs tracked│  │
│   └─────────────────┘   │
│                         │
├─────────────────────────┤
│                         │
│   How do you feel       │
│   about today?          │
│   ┌─────────────────┐   │
│   │ [Text area]     │   │
│   └─────────────────┘   │
│                         │
│   What's one thing      │
│   for tomorrow?         │
│   ┌─────────────────┐   │
│   │ [Text area]     │   │
│   └─────────────────┘   │
│                         │
│   How fulfilled?        │
│   1 ─────●───────── 10  │
│          7              │
│                         │
│      [Complete]         │
│                         │
└─────────────────────────┘
```

**Elements:**
- Summary card: Today's completions
- Question 1: Multi-line text
- Question 2: Single line text
- Fulfillment slider: 1-10 scale
- Complete: Primary button

**On Submit:**
- Show loading overlay
- Push to AI Feedback (when ready)
- Or toast "We'll notify you when ready"

---

### S-14: AI Feedback

**Purpose:** Show AI-generated insights

**Layout:**
```
┌─────────────────────────┐
│ [X]     Feedback        │
├─────────────────────────┤
│                         │
│   ┌─────────────────┐   │
│   │ ✨ Winning      │   │
│   │                 │   │
│   │ You've hit the  │   │
│   │ gym 8 days      │   │
│   │ straight. That's│   │
│   │ the disciplined │   │
│   │ you showing up. │   │
│   │           [Edit]│   │
│   └─────────────────┘   │
│                         │
│   ┌─────────────────┐   │
│   │ 🔍 Consider     │   │
│   │                 │   │
│   │ You skipped     │   │
│   │ project work    │   │
│   │ again. Is it    │   │
│   │ time to adjust  │   │
│   │ the scope?      │   │
│   │           [Edit]│   │
│   └─────────────────┘   │
│                         │
│   ┌─────────────────┐   │
│   │ 📋 Tomorrow     │   │
│   │                 │   │
│   │ 1. Track protein│   │
│   │ 2. Gym session  │   │
│   │ 3. Project work │   │
│   │           [Edit]│   │
│   └─────────────────┘   │
│                         │
│      [Done]             │
│                         │
└─────────────────────────┘
```

**Elements:**
- Insight cards: Glass effect, icon + content
- Each card: Edit button (bottom right)
- Card types: Winning (amber), Consider (violet), Tomorrow (primary)
- Done: Primary button, returns to Thread

---

### S-15: Weave Dashboard

**Purpose:** Progress visualization

**Layout:**
```
┌─────────────────────────┐
│ [Profile]  Weave   [•]  │
├─────────────────────────┤
│                         │
│   ┌─────────────────┐   │
│   │   [Weave Icon]  │   │
│   │    Level: Cord  │   │
│   │   142 binds     │   │
│   └─────────────────┘   │
│                         │
│   Dream: "Confident,    │
│   consistent person     │
│   who follows through"  │
│                         │
├─────────────────────────┤
│                         │
│   Consistency (65%)     │
│   [7d] [30d] [60d][90d] │
│   ┌─────────────────┐   │
│   │ [Heat Map Grid] │   │
│   │ ░░█░██░██░█░░░░ │   │
│   │ ██░██░░██░██░░░ │   │
│   │ ░██░█░██░░█░██░ │   │
│   └─────────────────┘   │
│   Less ░░░███ More      │
│                         │
│   Fulfillment (7.2 avg) │
│   ┌─────────────────┐   │
│   │ [Line Chart]    │   │
│   └─────────────────┘   │
│                         │
│   ┌─────────────────┐   │
│   │ 🔍 Pattern      │   │
│   │ Morning binds = │   │
│   │ higher fulfill- │   │
│   │ ment            │   │
│   └─────────────────┘   │
│                         │
├─────────────────────────┤
│ [Thread]  [+]  [Weave]  │
└─────────────────────────┘
```

**Elements:**
- Character: Weave level visualization
- Dream self: Quote from identity doc
- Time filter: Segmented control
- Heat map: Consistency grid
- Chart: Fulfillment trend line
- Insights: AI pattern cards

**Interactions:**
- Tap heat map cell: Navigate to that day
- Tap chart point: Navigate to that day
- Tap insight: Expand detail

---

### S-16: Talk to Weave (Chat)

**Purpose:** AI coaching conversation

**Layout:**
```
┌─────────────────────────┐
│ [X]   Talk to Weave     │
├─────────────────────────┤
│                         │
│   ┌─────────────────┐   │
│   │ Hey! You've been│   │
│   │ on a great      │   │
│   │ streak. What's  │   │
│   │ on your mind?   │   │
│   └─────────────────┘   │
│           AI            │
│                         │
│                         │
│   ┌─────────────────┐   │
│   │ I don't feel    │   │
│   │ motivated today │   │
│   └─────────────────┘   │
│                     You │
│                         │
│   ┌─────────────────┐   │
│   │ I get it. But   │   │
│   │ here's what I   │   │
│   │ see: you've     │   │
│   │ completed gym   │   │
│   │ 8 days straight.│   │
│   │ That's not      │   │
│   │ motivation—     │   │
│   │ that's          │   │
│   │ discipline...   │   │
│   └─────────────────┘   │
│           AI            │
│                         │
├─────────────────────────┤
│ [Plan day][I'm stuck]   │
│ [Edit goal][Explain]    │
├─────────────────────────┤
│ ┌─────────────────┐ [→] │
│ │ Type a message  │     │
│ └─────────────────┘     │
└─────────────────────────┘
```

**Elements:**
- Chat bubbles: AI (left, glass), User (right, primary-100)
- Quick chips: Common prompts
- Input: Text field with send button
- Streaming: AI responses stream in

**Interactions:**
- Tap chip: Send as message
- Send: Sends user message
- Long-press AI message: Edit/feedback options

---

### S-17: Needles Overview

**Purpose:** Goal management

**Layout:**
```
┌─────────────────────────┐
│ [<]   Your Needles      │
├─────────────────────────┤
│                         │
│   Max 3 active goals    │
│                         │
│   ┌─────────────────┐   │
│   │ 🎯 Get Fit      │   │
│   │ 65% consistency │   │
│   │ 3 binds active  │ > │
│   │ Started 12 days │   │
│   └─────────────────┘   │
│                         │
│   ┌─────────────────┐   │
│   │ 🎯 Learn Spanish│   │
│   │ 42% consistency │   │
│   │ 2 binds active  │ > │
│   │ Started 8 days  │   │
│   └─────────────────┘   │
│                         │
│   ┌─────────────────┐   │
│   │ 🎯 Ship Project │   │
│   │ 28% consistency │   │
│   │ 1 bind active   │ > │
│   │ Started 5 days  │   │
│   └─────────────────┘   │
│                         │
│   [+ Add New Goal]      │
│   (0 slots remaining)   │
│                         │
│   ── Archived ──        │
│   [View archived goals] │
│                         │
└─────────────────────────┘
```

**Elements:**
- Subtitle: Max goals reminder
- Goal cards: Title, consistency, binds, duration
- Add button: Disabled if 3 active
- Archived section: Collapsed by default

**Interactions:**
- Tap card: Push to Goal Detail
- Tap Add: Push to Create Goal (if available)

---

### S-18: Settings

**Purpose:** App configuration

**Layout:**
```
┌─────────────────────────┐
│ [<]     Settings        │
├─────────────────────────┤
│                         │
│   Account               │
│   ┌─────────────────┐   │
│   │ Identity Doc    │ > │
│   │ Subscription    │ > │
│   │ Notifications   │ > │
│   └─────────────────┘   │
│                         │
│   Preferences           │
│   ┌─────────────────┐   │
│   │ Timezone        │   │
│   │ PST (auto)      │ > │
│   ├─────────────────┤   │
│   │ Goal strictness │   │
│   │ Normal          │ > │
│   ├─────────────────┤   │
│   │ Nudging         │   │
│   │ ────●────── 7   │   │
│   └─────────────────┘   │
│                         │
│   Data                  │
│   ┌─────────────────┐   │
│   │ Export Data     │ > │
│   │ Delete Account  │ > │
│   └─────────────────┘   │
│                         │
│   About                 │
│   ┌─────────────────┐   │
│   │ Help & Support  │ > │
│   │ Privacy Policy  │ > │
│   │ Terms of Service│ > │
│   │ Version 1.0.0   │   │
│   └─────────────────┘   │
│                         │
│   [Sign Out]            │
│                         │
└─────────────────────────┘
```

**Elements:**
- Grouped lists: Account, Preferences, Data, About
- Slider: Nudging intensity
- Destructive actions: Red text (Delete, Sign Out)

---

## User Flows

### UF-01: Onboarding Flow

```
Start → Welcome → Demographics → Archetype Assessment
  → Archetype Result → Dream Self → First Goal Input
  → AI Loading → Goal Breakdown → First Commitment
  → Thread (Home)

Duration: 5-7 minutes
Exit Points: Each screen (with save progress)
Recovery: Resume from last completed step
```

**Success Criteria:**
- Completion rate >70%
- Time to first goal <5 minutes

---

### UF-02: Daily Morning Flow

```
Notification → Open App → Thread (Home)
  → View Triad → Expand Needle → Tap Bind
  → Bind Detail → Complete Bind → Add Proof (optional)
  → Return to Thread

Duration: <2 minutes
Goal: Complete first bind with minimal friction
```

---

### UF-03: Bind Completion Flow

```
Thread → Tap Bind Card → Bind Detail Screen
  → Option A: Start Timer → Do Activity → Stop Timer → Complete
  → Option B: Mark Complete (trust-based)
  → Proof Prompt → Photo/Note/Skip → Success Animation
  → Return to Thread

Duration: <30 seconds (excluding activity)
Key Metric: Completion time from tap to done
```

---

### UF-04: Evening Reflection Flow

```
Thread → Tap Daily Check-in → Recap Summary
  → Question 1 (feelings) → Question 2 (tomorrow)
  → Fulfillment Slider → Submit → Loading State
  → AI Feedback Screen → Review Insights → Done
  → Return to Thread (or push notification later)

Duration: 3-5 minutes
Key Metric: Journal completion rate
```

---

### UF-05: Recovery Flow (48h Inactivity)

```
Notification (Recovery) → Open App → Thread (Home)
  → Recovery Nudge (special state) → Single Easy Bind
  → Complete Bind → Celebration → Streak Resilience Message
  → Normal Thread State

Goal: Re-engage without shame
Key Metric: Recovery rate (users who return and complete)
```

---

### UF-06: Goal Creation Flow

```
Needles Overview → Tap Add Goal → Goal Input Screen
  → Enter Goal + Why → AI Processing → Goal Breakdown
  → Edit/Confirm → Return to Needles

Duration: 2-3 minutes
Blocker: Cannot proceed if 3 active goals
```

---

### UF-07: Chat Flow

```
Any Screen → Tap FAB → Floating Menu → "Talk to Weave"
  → Chat Screen → AI Greeting → User Message/Chip
  → AI Response (streaming) → Continue Conversation
  → Close → Return to Previous Screen

Rate Limit: 10 messages/hour
```

---

## Interaction Patterns

### IP-01: Collapsible Needle

**Trigger:** Tap needle header

**Animation:**
```
Collapsed State:
┌─────────────────────────┐
│ ▶ Get Fit (65%)         │
└─────────────────────────┘

Expanding (300ms ease-out):
┌─────────────────────────┐
│ ▼ Get Fit (65%)         │
├─────────────────────────┤
│ Content animates in     │
│ with height transition  │
└─────────────────────────┘

Expanded State:
┌─────────────────────────┐
│ ▼ Get Fit (65%)         │
├─────────────────────────┤
│ ○ Morning gym           │
│ ○ Track protein         │
└─────────────────────────┘
```

**Details:**
- Chevron rotates 90°
- Content fades in + height animates
- Other needles remain unchanged

---

### IP-02: Hold to Commit

**Trigger:** Press and hold commitment button

**Animation:**
```
Idle:
┌─────────────────────────┐
│         Hold to         │
│         Commit          │
└─────────────────────────┘

Pressing (progress ring):
    ╭───────────╮
   ╱     ▓▓     ╲
  │    Hold to   │
  │    Commit    │
   ╲     ░░     ╱
    ╰───────────╯

Complete (2s hold):
    ╭───────────╮
   ╱   ████████ ╲
  │      ✓       │
  │   Committed  │
   ╲   ████████ ╱
    ╰───────────╯
```

**Details:**
- Ring progress: 0-100% over 2 seconds
- Haptic: Light pulse at 50%, strong at 100%
- Release before complete: Reset with bounce
- Complete: Success state with checkmark

---

### IP-03: Swipe Actions

**Not used in MVP** (keeping interactions simple)

Future consideration for:
- Swipe to complete bind
- Swipe to archive

---

### IP-04: Pull to Refresh

**Trigger:** Pull down on scrollable screens

**Animation:**
```
Pulling:
    ↓ Release to refresh

Refreshing:
    [Spinner]

Complete:
    ✓ Updated
    (fade out)
```

**Screens:** Thread, Weave Dashboard, History

---

### IP-05: Press States

**All tappable elements:**
```
Default → Pressed → Released

Visual Changes:
- Buttons: Scale to 0.98, darker shade
- Cards: Scale to 0.99, subtle shadow change
- List items: Background tint

Duration: Press 100ms, release 200ms
```

---

### IP-06: Streaming Text

**For AI responses:**
```
Typing indicator:
│ ●●● │ (bouncing dots)

Streaming:
│ I get it. But here's what I... │
(characters appear 20ms apart)

Complete:
│ I get it. But here's what I see: │
│ you've completed gym 8 days...   │
```

---

## Motion & Animation

### Animation Principles

1. **Purpose:** Motion should inform, not decorate
2. **Speed:** Fast enough to feel responsive (200-400ms)
3. **Easing:** Natural curves (ease-out for entries, ease-in for exits)
4. **Consistency:** Same animations for same actions

### Animation Tokens

```
Duration:
├── instant:    0ms
├── fast:       150ms
├── normal:     300ms
├── slow:       500ms
└── deliberate: 800ms

Easing:
├── ease-out:     cubic-bezier(0.0, 0.0, 0.2, 1)   ← Entries
├── ease-in:      cubic-bezier(0.4, 0.0, 1, 1)     ← Exits
├── ease-in-out:  cubic-bezier(0.4, 0.0, 0.2, 1)   ← Movement
└── spring:       spring(1, 80, 10)                 ← Playful
```

### Screen Transitions

| Transition | Animation | Duration |
|------------|-----------|----------|
| Tab switch | Cross-fade | 150ms |
| Push | Slide from right | 300ms |
| Pop | Slide to right | 250ms |
| Modal open | Slide from bottom | 400ms |
| Modal close | Slide to bottom | 300ms |
| Sheet open | Slide up + fade | 400ms |
| Sheet close | Slide down + fade | 300ms |

### Micro-interactions

| Element | Trigger | Animation |
|---------|---------|-----------|
| Button press | Touch down | Scale 0.98, 100ms |
| Button release | Touch up | Scale 1.0, 200ms ease-out |
| Checkbox check | Tap | Bounce + checkmark draw |
| Toggle switch | Tap | Slide + color change, 200ms |
| Needle expand | Tap | Height expand, 300ms ease-out |
| Card appear | Mount | Fade in + slide up, 300ms |
| Toast | Trigger | Slide up + fade, 300ms |
| Completion | Success | Confetti burst, 2000ms |

### Confetti Animation

**Trigger:** Bind completion

**Spec:**
```
Particles: 50
Colors: [primary-400, amber-400, violet-400, success-base]
Origin: Center of screen
Duration: 2000ms
Spread: 360°
Gravity: 0.5
Fade: Last 500ms
```

---

## Accessibility

### WCAG 2.1 AA Compliance

**Text Contrast:**
- Regular text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

**Touch Targets:**
- Minimum: 44x44 points
- Recommended: 48x48 points
- Spacing: 8px minimum between targets

**Focus Indicators:**
- Visible focus ring on all interactive elements
- Ring: 2px primary-500, 2px offset

### Screen Reader Support

**Labels:**
- All images: `accessibilityLabel`
- Icons: Descriptive labels
- Buttons: Action description
- Inputs: Associated labels

**Hints:**
- Complex interactions: `accessibilityHint`
- Example: "Double-tap to expand needle"

**Roles:**
- Buttons: `button`
- Links: `link`
- Headings: `header`
- Lists: `list`, `listitem`

### Reduced Motion

**Respect system preference:**
```
if (prefersReducedMotion) {
  - Disable confetti
  - Reduce transitions to cross-fade
  - Disable parallax effects
  - Use instant duration for most animations
}
```

### Dynamic Type

**Support iOS Dynamic Type:**
- All text scales with system settings
- Layouts adapt to larger text
- Minimum: Body (16px)
- Maximum: Accessibility sizes supported

### Color Blindness

**Never rely on color alone:**
- Icons accompany color indicators
- Patterns in heat map (optional)
- Labels on charts

---

## Responsive Design

### Device Support

**Primary:** iPhone (iOS 15+)
- iPhone SE (3rd gen): 375x667
- iPhone 14: 390x844
- iPhone 14 Pro Max: 430x932
- iPhone 15 Pro: 393x852

### Safe Areas

**Always respect:**
- Top safe area (notch/dynamic island)
- Bottom safe area (home indicator)
- Keyboard avoidance

### Layout Adaptations

**Small screens (SE):**
- Reduce padding from 16px to 12px
- Smaller card titles
- Stack horizontal elements vertically if needed

**Large screens (Pro Max):**
- Max content width: 428px
- Center content on very wide screens
- More generous spacing

### Orientation

**Portrait only for MVP**
- Lock orientation to portrait
- Future: Support landscape for tablet

---

## Appendix

### Design File Structure

```
/design
├── /tokens
│   ├── colors.json
│   ├── typography.json
│   ├── spacing.json
│   └── shadows.json
├── /components
│   ├── buttons.fig
│   ├── cards.fig
│   ├── inputs.fig
│   ├── navigation.fig
│   └── feedback.fig
├── /screens
│   ├── onboarding.fig
│   ├── thread.fig
│   ├── weave.fig
│   ├── flows.fig
│   └── modals.fig
├── /assets
│   ├── icons/
│   ├── illustrations/
│   └── brand/
└── /prototypes
    ├── onboarding-flow.fig
    ├── daily-flow.fig
    └── reflection-flow.fig
```

### Implementation Notes

**React Native Components:**
- Use `react-native-reanimated` for animations
- Use `react-native-gesture-handler` for gestures
- Use `react-native-safe-area-context` for safe areas
- Use custom components over native where possible for consistency

**Styling Approach:**
- Use style objects (StyleSheet.create)
- Token-based values imported from constants
- Consistent naming convention

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-16 | Initial UX design specification |

---

**Document Status:** Active
**Next Review:** 2026-01-15
**Owner:** Jack
