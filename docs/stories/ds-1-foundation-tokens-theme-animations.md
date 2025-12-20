# Story DS.1: Foundation (Tokens + Theme + Animations)

**Status:** ready-for-dev

**Epic:** DS - Design System Rebuild
**Story Points:** 5
**Priority:** M (Must Have)
**Created:** 2025-12-20

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

---

## Story

As a **developer**,
I want **a comprehensive token system with runtime theme switching and spring-based animations**,
so that **I can build consistent UIs with dark/light modes, smooth animations, and OLED-optimized colors across all Weave app screens**.

---

## Business Context

This is the **foundational story** of Epic DS (Design System Rebuild). The existing design system at `src/design-system/` is "vibe-coded," buggy, and inconsistent. This story creates a **completely new standalone package** (`@weave/design-system`) from scratch with 220 tokens minimum (may expand as needed), runtime theme switching, and spring physics animations.

**Why This Matters:**
- **Blocks 58 downstream FRs** across all 8 product epics
- **Prevents design debt** - establishes patterns before building features
- **Enables rapid UI development** - developers never hardcode colors/spacing
- **OLED optimization** - dark-first aesthetic reduces battery drain
- **Accessibility baseline** - reduced motion support built-in

**Success Metric:** All future components use theme hooks; zero hardcoded colors/spacing values.

---

## Acceptance Criteria

### AC-1: 220 Tokens Minimum Organized by Category

**Required Token Categories:**

**1. Colors (60+ tokens):**
- [ ] **Scale-based colors:**
  - `dark[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]` (11 shades)
  - `accent[50-950]` (11 shades)
  - `violet[50-950]` (11 shades)
  - `amber[50-950]` (11 shades)
  - `rose[50-950]` (11 shades)
  - `emerald[50-950]` (11 shades)
- [ ] **Semantic colors:** `semantic.success`, `semantic.warning`, `semantic.error`, `semantic.info`
- [ ] **Background colors:** `background.primary`, `background.secondary`, `background.tertiary`, `background.elevated`
- [ ] **Text colors:** `text.primary`, `text.secondary`, `text.tertiary`, `text.disabled`, `text.inverse`
- [ ] **Border colors:** `border.primary`, `border.secondary`, `border.focus`, `border.error`
- [ ] **Heat map colors:** `heatMap.none`, `heatMap.minimal`, `heatMap.low`, `heatMap.medium`, `heatMap.high`
- [ ] **Gradients:** `weaveGradient.primary`, `weaveGradient.accent`, `gradients.sunset`, `gradients.ocean`, `gradients.aurora`

**2. Typography (45+ tokens):**
- [ ] **Font families:** `fontFamily.sans`, `fontFamily.mono`
- [ ] **Font sizes:** `fontSizes.xs`, `fontSizes.sm`, `fontSizes.md`, `fontSizes.lg`, `fontSizes.xl`, `fontSizes['2xl']`, `fontSizes['3xl']`, `fontSizes['4xl']`, `fontSizes['5xl']`
- [ ] **Font weights:** `fontWeights.light`, `fontWeights.normal`, `fontWeights.medium`, `fontWeights.semibold`, `fontWeights.bold`, `fontWeights.black`
- [ ] **Line heights:** `lineHeights.tight`, `lineHeights.snug`, `lineHeights.normal`, `lineHeights.relaxed`, `lineHeights.loose`
- [ ] **Letter spacing:** `letterSpacing.tight`, `letterSpacing.normal`, `letterSpacing.wide`
- [ ] **Display scale:** `display.xs`, `display.sm`, `display.md`, `display.lg`, `display.xl`, `display['2xl']`, `display['3xl']`
- [ ] **Label scale:** `label.xs`, `label.sm`, `label.md`, `label.lg`, `label.xl`
- [ ] **Mono scale:** `mono.xs`, `mono.sm`, `mono.md`, `mono.lg`

**3. Spacing (25+ tokens):**
- [ ] **Spacing scale:** `spacing[0]` through `spacing[24]` (0px to 96px in logical increments: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96)
- [ ] **Layout tokens:** `layout.screenPadding`, `layout.cardPadding`
- [ ] **Gap tokens:** `gap.xs`, `gap.sm`, `gap.md`, `gap.lg`, `gap.xl`
- [ ] **Inset tokens:** `inset.xs`, `inset.sm`, `inset.md`, `inset.lg`, `inset.xl`

**4. Effects (35+ tokens):**
- [ ] **Shadows:** `shadows.sm`, `shadows.md`, `shadows.lg`, `shadows.xl`, `shadows.card`, `shadows.modal`
- [ ] **Glows (colored shadow tints):** `glows.sm`, `glows.md`, `glows.lg`
- [ ] **Glass effects (blur + opacity presets):** `glass.light`, `glass.medium`, `glass.heavy`
- [ ] **Blur values:** `blur.sm`, `blur.md`, `blur.lg`, `blur.xl`
- [ ] **Opacity scale:** `opacity[10, 20, 30, 40, 50, 60, 70, 80, 90]` (10% increments)

**5. Borders (20+ tokens):**
- [ ] **Border radius:** `radius.xs`, `radius.sm`, `radius.md`, `radius.lg`, `radius.xl`, `radius['2xl']`, `radius['3xl']`
- [ ] **Component-specific radius:** `componentRadius.button`, `componentRadius.card`, `componentRadius.input`, `componentRadius.modal`
- [ ] **Border widths:** `borderWidth.thin`, `borderWidth.regular`, `borderWidth.thick`

**6. Animations (35+ tokens):**
- [ ] **Durations:** `durations.instant` (0ms), `durations.fast` (150ms), `durations.normal` (300ms), `durations.slow` (500ms), `durations.slower` (800ms)
- [ ] **Easings:** `easings.easeInOut`, `easings.easeOut`, `easings.spring`
- [ ] **Spring presets (Reanimated withSpring config objects):**
  - `springs.gentle`: `{ damping: 15, stiffness: 150, mass: 0.8 }`
  - `springs.snappy`: `{ damping: 20, stiffness: 300, mass: 0.5 }`
  - `springs.bouncy`: `{ damping: 10, stiffness: 200, mass: 1.2 }`
  - `springs.stiff`: `{ damping: 25, stiffness: 400, mass: 0.4 }`
- [ ] **Motion presets:** `motion.fadeIn`, `motion.slideUp`, `motion.scale`, `motion.pressIn`
- [ ] **Reduced motion:** `reducedMotion.disable` (accessibility support)

**Validation:**
- [ ] All tokens exported from single `tokens/index.ts` file (minimum 220, may expand as needed)
- [ ] TypeScript types generated for all tokens (autocomplete in IDEs)
- [ ] Tokens organized into separate files by category: `colors.ts`, `typography.ts`, `spacing.ts`, `effects.ts`, `borders.ts`, `animations.ts`

---

### AC-2: ThemeProvider + Runtime Switching

- [ ] **ThemeProvider wrapper component:**
  - Accepts `mode` prop: `'dark'` | `'light'`
  - Default mode: `'dark'` (Weave is dark-first)
  - Wraps app and provides theme context to all children
  - Example: `<ThemeProvider mode="dark"><App /></ThemeProvider>`

- [ ] **useTheme() hook:**
  - Returns complete theme object: `{ colors, spacing, typography, layout, shadows, radius, animations, mode }`
  - Auto-updates when theme mode changes (no app reload required)
  - Example usage:
    ```typescript
    const { colors, spacing } = useTheme();
    <View style={{ backgroundColor: colors.background.primary, padding: spacing[4] }} />
    ```

- [ ] **useThemeMode() hook for toggling:**
  - Returns: `{ mode, setMode, toggleMode, isDark }`
  - `toggleMode()` function switches between dark/light
  - `isDark` boolean for conditional rendering
  - Example: `const { toggleMode, isDark } = useThemeMode();`

- [ ] **Specialized convenience hooks:**
  - `useColors()` - returns only colors object
  - `useSpacing()` - returns only spacing object
  - `useTypography()` - returns only typography object
  - `useAnimations()` - returns only animations object

- [ ] **Theme switches without app reload:**
  - Use React Context for theme state management
  - CSS custom properties for runtime theme switching (if needed for web compatibility)
  - All components re-render automatically when theme changes

**Validation:**
- [ ] Toggle dark/light mode in Storybook without reload
- [ ] All theme values accessible via hooks
- [ ] No hardcoded colors in consuming components

---

### AC-3: Tamagui-Inspired Theme Builder

- [ ] **Nested theme support:**
  - `<Theme name="violet">...</Theme>` component overrides accent color
  - `<Theme name="amber">...</Theme>` overrides to amber accent
  - Other theme names: `violet`, `amber`, `rose`, `emerald`, `ocean`, `sunset`, `aurora`
  - Nested themes inherit parent theme and override specific tokens

- [ ] **Color-matched shadows:**
  - Violet button → violet-tinted shadow glow
  - Amber button → amber-tinted shadow glow
  - Implementation: Shadow color automatically derived from accent color
  - Algorithm: Take accent color at 500 shade, apply 20% opacity, use as shadow tint

- [ ] **Theme inheritance:**
  - Child themes merge with parent themes (not replace)
  - Unspecified tokens inherit from parent
  - Example:
    ```typescript
    <Theme name="default"> // Uses default violet accent
      <Theme name="amber"> // Overrides only accent to amber
        <Button /> // Has amber accent but inherits all other tokens
      </Theme>
    </Theme>
    ```

**Validation:**
- [ ] Nested Theme components work correctly
- [ ] Button inside `<Theme name="violet">` has violet shadow glow
- [ ] Theme inheritance doesn't break parent theme

---

### AC-4: Animation Library (Reanimated)

- [ ] **Spring presets using Reanimated `withSpring()`:**
  - `springs.gentle`: Slow, smooth animations for large elements (cards, modals)
  - `springs.snappy`: Fast, crisp animations for buttons and interactions
  - `springs.bouncy`: Playful animations for celebrations and success states
  - `springs.stiff`: Very fast animations for micro-interactions
  - Each preset exports config object compatible with `withSpring(value, config)`

- [ ] **Motion presets for common animations:**
  - `motion.fadeIn`: Opacity 0 → 1 with spring
  - `motion.slideUp`: TranslateY 20 → 0 with spring
  - `motion.scale`: Scale 0.95 → 1 with spring
  - `motion.pressIn`: Scale 0.98 → 1 (button press feedback)
  - Each preset includes Reanimated worklet function

- [ ] **Accessibility: Reduced motion support:**
  - Check device `prefersReducedMotion` setting
  - If enabled: Disable all springs, use instant transitions (duration: 0)
  - Use `AccessibilityInfo.isReduceMotionEnabled()` from React Native
  - Export `useReducedMotion()` hook: returns boolean

- [ ] **Animation utilities:**
  - `useAnimatedValue(initialValue)` hook - wraps `useSharedValue`
  - `useSpringAnimation(config)` hook - applies spring preset
  - `createSpringAnimation(toValue, preset)` helper function

**Validation:**
- [ ] All spring presets run at 60fps on device
- [ ] Reduced motion setting disables animations
- [ ] Motion presets work with Reanimated worklets

---

## Do Not Block MVP On

The following items are targets but should NOT block story completion or MVP progress:
- **Exact token count:** 220 is target, 200-240 acceptable range
- **All gradient definitions:** `weaveGradient.primary` + `weaveGradient.accent` required; `gradients.sunset/ocean/aurora` optional (nice to have)
- **Complex motion presets:** `motion.fadeIn` required; `motion.slideUp/scale/pressIn` can defer to Story DS-2 if time-constrained
- **Perfect spring tuning:** Initial spring configs provided are starting points; fine-tuning can happen iteratively based on feel

---

## Tasks / Subtasks

### Task 1: Set Up Package Structure (AC: #1)
- [ ] **1.1:** Create new package directory: `packages/weave-design-system/`
- [ ] **1.2:** Initialize package.json with:
  - Package name: `@weave/design-system`
  - Version: `0.1.0` (pre-release)
  - Main entry: `dist/index.js`
  - Types entry: `dist/index.d.ts`
  - Dependencies:
    - `react-native-reanimated: "^3.15.0"`
    - `react-native-gesture-handler: "^2.19.0"`
    - `@react-native-community/blur: "^4.4.1"` (for glass effects)
    - `expo-linear-gradient: "~13.0.2"` (for gradients)
  - PeerDependencies:
    - `react: "^19.0.0"`
    - `react-native: "^0.79.0"`
  - ⚠️ **Critical:** Ensure main app uses React 19 + React Native 0.79+ before installing this package. Version mismatches cause hard-to-debug errors.
- [ ] **1.3:** Set up TypeScript config (tsconfig.json) with strict mode
- [ ] **1.4:** Create source directory structure:
  ```
  packages/weave-design-system/
  ├── src/
  │   ├── tokens/
  │   │   ├── colors.ts
  │   │   ├── typography.ts
  │   │   ├── spacing.ts
  │   │   ├── effects.ts
  │   │   ├── borders.ts
  │   │   ├── animations.ts
  │   │   └── index.ts
  │   ├── theme/
  │   │   ├── ThemeProvider.tsx
  │   │   ├── ThemeContext.ts
  │   │   ├── useTheme.ts
  │   │   ├── useThemeMode.ts
  │   │   ├── useColors.ts
  │   │   ├── useSpacing.ts
  │   │   ├── useTypography.ts
  │   │   ├── useAnimations.ts
  │   │   ├── Theme.tsx
  │   │   └── index.ts
  │   ├── animations/
  │   │   ├── springs.ts
  │   │   ├── motions.ts
  │   │   ├── useAnimatedValue.ts
  │   │   ├── useSpringAnimation.ts
  │   │   ├── useReducedMotion.ts
  │   │   └── index.ts
  │   └── index.ts
  ├── package.json
  └── tsconfig.json
  ```
- [ ] **1.5:** Configure Metro bundler in root project:
  - Edit `metro.config.js` to add package resolution:
    ```javascript
    const path = require('path');
    module.exports = {
      watchFolders: [path.resolve(__dirname, 'packages')],
      resolver: {
        extraNodeModules: {
          '@weave/design-system': path.resolve(__dirname, 'packages/weave-design-system/src'),
        },
      },
    };
    ```
  - Edit root `tsconfig.json` to add path alias:
    ```json
    {
      "compilerOptions": {
        "paths": {
          "@weave/design-system": ["./packages/weave-design-system/src"]
        }
      }
    }
    ```
- [ ] **1.6:** Set up build process:
  - Install dev dependencies: `npm install -D typescript @types/react @types/react-native`
  - Add build scripts to package.json:
    ```json
    "scripts": {
      "build": "tsc",
      "dev": "tsc --watch",
      "clean": "rm -rf dist"
    }
    ```
  - Configure tsconfig.json with `outDir: "dist"`
  - Add `.gitignore` entry: `dist/`

---

### Task 2: Implement Design Tokens (AC: #1)
- [ ] **2.1:** Create `tokens/colors.ts` with all 60+ color tokens
  - Implement scale-based colors (dark[50-950], accent[50-950], violet, amber, rose, emerald)
  - Use these exact color values for consistency (or reference Figma design file):
    ```typescript
    export const dark = {
      50: '#F8F9FA',   100: '#E9ECEF',  200: '#DEE2E6',
      300: '#CED4DA',  400: '#ADB5BD',  500: '#6C757D',
      600: '#495057',  700: '#343A40',  800: '#212529',
      900: '#16181A',  950: '#0D0F10',
    };
    // Repeat pattern for accent, violet, amber, rose, emerald with brand colors
    ```
  - Implement semantic colors (success, warning, error, info)
  - Implement background, text, border color aliases
  - Implement heat map colors
  - Implement gradients using expo-linear-gradient:
    ```typescript
    import { LinearGradient } from 'expo-linear-gradient';
    export const weaveGradient = {
      primary: { colors: ['#A78BFA', '#EC4899'], start: [0, 0], end: [1, 1] },
      accent: { colors: ['#F59E0B', '#EF4444'], start: [0, 0], end: [1, 1] },
    };
    export const gradients = {
      sunset: { colors: ['#FCA5A5', '#FBBF24'], start: [0, 0], end: [1, 1] },
      ocean: { colors: ['#60A5FA', '#34D399'], start: [0, 0], end: [1, 1] },
      aurora: { colors: ['#A78BFA', '#4ADE80'], start: [0, 0], end: [0, 1] },
    };
    ```
- [ ] **2.2:** Create `tokens/typography.ts` with all 45+ typography tokens
  - Font families (sans, mono)
  - Font sizes (xs → 5xl)
  - Font weights (light → black)
  - Line heights (tight → loose)
  - Letter spacing (tight, normal, wide)
  - Preset scales: display (xs-3xl), label (xs-xl), mono (xs-lg)
- [ ] **2.3:** Create `tokens/spacing.ts` with all 25+ spacing tokens
  - Spacing scale (0-24 with logical increments)
  - Layout tokens (screenPadding, cardPadding)
  - Gap tokens (xs, sm, md, lg, xl)
  - Inset tokens (xs, sm, md, lg, xl)
- [ ] **2.4:** Create `tokens/effects.ts` with all 35+ effect tokens
  - Shadows (sm, md, lg, xl, card, modal)
  - Glows (colored shadow tints)
  - Glass effects implementation using @react-native-community/blur:
    ```typescript
    import { BlurView } from '@react-native-community/blur';
    export const glass = {
      light: { blurType: 'light', blurAmount: 10, opacity: 0.7 },
      medium: { blurType: 'light', blurAmount: 20, opacity: 0.5 },
      heavy: { blurType: 'dark', blurAmount: 30, opacity: 0.3 },
    };
    ```
  - Blur values (sm, md, lg, xl)
  - Opacity scale (10-90 in 10% increments)
- [ ] **2.5:** Create `tokens/borders.ts` with all 20+ border tokens
  - Border radius scale (xs → 3xl)
  - Component-specific radius (button, card, input, modal)
  - Border widths (thin, regular, thick)
- [ ] **2.6:** Create `tokens/animations.ts` with all 35+ animation tokens
  - Durations (instant, fast, normal, slow, slower)
  - Easings (easeInOut, easeOut, spring)
  - Spring presets with Reanimated config objects
  - Motion preset names (implementation in animations/ folder)
  - Reduced motion flag
- [ ] **2.7:** Create `tokens/index.ts` master export file
  - Export all token categories
  - Type all exports for IDE autocomplete

---

### Task 3: Implement Theme System (AC: #2, #3)
- [ ] **3.1:** Create `theme/ThemeContext.ts`
  - Define ThemeMode type: `'dark' | 'light'`
  - Define Theme interface with all token categories
  - Create React Context: `ThemeContext` and `ThemeModeContext`
- [ ] **3.2:** Create `theme/ThemeProvider.tsx`
  - Accept `mode` prop (default: 'dark')
  - Provide theme object with colors, spacing, typography, animations, etc.
  - Provide mode state and setMode function
  - Use React.useMemo to prevent unnecessary re-renders
- [ ] **3.3:** Create `theme/useTheme.ts` hook
  - Access ThemeContext
  - Return complete theme object + mode
  - Throw error if used outside ThemeProvider
- [ ] **3.4:** Create `theme/useThemeMode.ts` hook
  - Access ThemeModeContext
  - Return `{ mode, setMode, toggleMode, isDark }`
  - `toggleMode` implementation: `setMode(mode === 'dark' ? 'light' : 'dark')`
- [ ] **3.5:** Create specialized hooks:
  - `theme/useColors.ts` - returns colors only
  - `theme/useSpacing.ts` - returns spacing only
  - `theme/useTypography.ts` - returns typography only
  - `theme/useAnimations.ts` - returns animations only
- [ ] **3.6:** Create `theme/Theme.tsx` nested theme component
  - Accept `name` prop: `'violet' | 'amber' | 'rose' | 'emerald' | 'ocean' | 'sunset' | 'aurora'`
  - Override accent color based on name
  - Inherit all other tokens from parent theme
  - Implement color-matched shadow algorithm:
    ```typescript
    function getColorMatchedShadow(accentColor: string): string {
      // If accentColor is hex, convert to rgba with 20% opacity
      // Example: '#A78BFA' → 'rgba(167, 139, 250, 0.2)'
      return convertHexToRgba(accentColor, 0.2);
    }
    ```

---

### Task 4: Implement Animation System (AC: #4)
- [ ] **4.1:** Create `animations/springs.ts`
  - Define TypeScript interface for spring configs:
    ```typescript
    export interface SpringConfig {
      damping: number;
      stiffness: number;
      mass: number;
    }

    export const springs: Record<string, SpringConfig> = {
      gentle: { damping: 15, stiffness: 150, mass: 0.8 },
      snappy: { damping: 20, stiffness: 300, mass: 0.5 },
      bouncy: { damping: 10, stiffness: 200, mass: 1.2 },
      stiff: { damping: 25, stiffness: 400, mass: 0.4 },
    };
    ```
  - Export spring preset objects compatible with Reanimated `withSpring()`
- [ ] **4.2:** Create `animations/motions.ts`
  - Implement motion presets as Reanimated worklet functions
  - `motion.fadeIn(sharedValue)` - animates opacity 0 → 1
  - `motion.slideUp(sharedValue)` - animates translateY 20 → 0
  - `motion.scale(sharedValue)` - animates scale 0.95 → 1
  - `motion.pressIn(sharedValue)` - animates scale 0.98 → 1
- [ ] **4.3:** Create `animations/useReducedMotion.ts` hook
  - Import AccessibilityInfo: `import { AccessibilityInfo } from 'react-native';`
  - Check `AccessibilityInfo.isReduceMotionEnabled()` from React Native
  - Return boolean: `true` if reduced motion enabled
  - Use React.useEffect to listen for changes
  - Handle API failure gracefully:
    ```typescript
    const [reducedMotion, setReducedMotion] = useState(false);
    try {
      const isEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      setReducedMotion(isEnabled ?? false); // Default to false if undefined
    } catch (error) {
      setReducedMotion(false); // Fail-safe: enable animations
    }
    ```
- [ ] **4.4:** Create `animations/useAnimatedValue.ts` hook
  - Wrapper around Reanimated's `useSharedValue`
  - Automatically respects reduced motion setting
  - Returns shared value for animations
- [ ] **4.5:** Create `animations/useSpringAnimation.ts` hook
  - Accept preset name: `'gentle' | 'snappy' | 'bouncy' | 'stiff'`
  - Return function: `(toValue) => withSpring(toValue, presetConfig)`
  - Disable animation if reduced motion enabled

---

### Task 5: Testing & Documentation (AC: all)
- [ ] **5.1:** Write unit tests for theme hooks (75% coverage target)
  - Test ThemeProvider with different modes
  - Test useTheme returns correct theme object
  - Test useThemeMode toggle functionality
  - Test nested Theme components
- [ ] **5.2:** Create Storybook stories for theme system
  - Story: ThemeProvider with dark/light toggle
  - Story: Nested Theme component with different accent colors
  - Story: Token showcase (all tokens displayed)
  - Story: Animation spring presets comparison
  - ⚠️ **Note:** Full Storybook setup happens in Story DS-9. This task creates story files only; they may not render until DS-9 is complete.
- [ ] **5.3:** Validate animations on real device (not just simulator)
  - Use React Native Performance Monitor to verify 60fps:
    - Shake device → "Show Perf Monitor"
    - All animations must show: JS FPS: 60, UI FPS: 60
    - If FPS drops below 55, optimize animation config
  - Test all spring presets run at 60fps
  - Test reduced motion disables animations
  - Test motion presets (fadeIn, slideUp, scale, pressIn)
- [ ] **5.4:** Create token documentation
  - README.md with usage examples
  - Token reference table (name, value, usage)
  - Migration guide from old design system
- [ ] **5.5:** Publish package locally:
  - Run `npm pack` in package directory to create tarball
  - Install in main app: `npm install ../packages/weave-design-system`
  - Verify import works: `import { useTheme } from '@weave/design-system'`
  - Test basic theme hook functionality in main app

---

## Dev Notes

### Architecture Patterns & Constraints

**Package Architecture:**
- **Standalone package:** This is a new package at `packages/weave-design-system/`, NOT editing `src/design-system/`
- **Old system deprecation:** `src/design-system/` is deprecated and will be removed after migration
- **Import path:** All imports use `@weave/design-system` (configured in package.json)
- **No dependencies on main app:** Design system must be self-contained

**Technology Stack (from Architecture Document):**
- **React Native:** Core UI framework (Expo SDK 53, React 19)
- **TypeScript:** Strict mode enabled, no `any` types
- **Reanimated:** v3+ for all animations (use `withSpring()`, not Animated API)
- **React Context:** For theme state management (no Redux/Zustand needed for design system)

**Token Architecture (Tamagui-Inspired):**
- **Scale-based tokens:** Colors use 50-950 scale (not 100-900)
- **Semantic aliases:** Map scale tokens to semantic names (e.g., `text.primary` → `dark[100]`)
- **Dark-first:** Default theme is dark mode (OLED optimization)
- **Runtime theming:** Theme changes without reload (not CSS variables for React Native)

**Animation Standards:**
- **All animations use Reanimated:** No React Native Animated API
- **Spring physics only:** Use `withSpring()`, not `withTiming()`
- **60fps requirement:** All animations must run on UI thread
- **Reduced motion support:** Mandatory accessibility requirement

**Code Quality Standards:**
- **75% test coverage:** Enforced in CI (will be set up in Story DS-9)
- **No hardcoded values:** All values must come from tokens
- **TypeScript strict mode:** No implicit any, strict null checks
- **Prop types:** All component props must be typed

---

### Source Tree Components to Touch

**New Files to Create:**
```
packages/weave-design-system/
├── src/
│   ├── tokens/
│   │   ├── colors.ts          [NEW - 60+ color tokens]
│   │   ├── typography.ts      [NEW - 45+ typography tokens]
│   │   ├── spacing.ts         [NEW - 25+ spacing tokens]
│   │   ├── effects.ts         [NEW - 35+ effect tokens]
│   │   ├── borders.ts         [NEW - 20+ border tokens]
│   │   ├── animations.ts      [NEW - 35+ animation tokens]
│   │   └── index.ts           [NEW - master export]
│   ├── theme/
│   │   ├── ThemeProvider.tsx  [NEW - theme wrapper]
│   │   ├── ThemeContext.ts    [NEW - React Context]
│   │   ├── useTheme.ts        [NEW - main theme hook]
│   │   ├── useThemeMode.ts    [NEW - mode toggle hook]
│   │   ├── useColors.ts       [NEW - colors hook]
│   │   ├── useSpacing.ts      [NEW - spacing hook]
│   │   ├── useTypography.ts   [NEW - typography hook]
│   │   ├── useAnimations.ts   [NEW - animations hook]
│   │   ├── Theme.tsx          [NEW - nested theme component]
│   │   └── index.ts           [NEW - export all hooks]
│   ├── animations/
│   │   ├── springs.ts         [NEW - spring presets]
│   │   ├── motions.ts         [NEW - motion presets]
│   │   ├── useAnimatedValue.ts [NEW - shared value hook]
│   │   ├── useSpringAnimation.ts [NEW - spring hook]
│   │   ├── useReducedMotion.ts [NEW - accessibility hook]
│   │   └── index.ts           [NEW - export all]
│   └── index.ts               [NEW - package main export]
├── package.json               [NEW - package config]
├── tsconfig.json              [NEW - TypeScript config]
└── README.md                  [NEW - documentation]
```

**Files to NOT Touch:**
- `src/design-system/*` - Old system, leave untouched for now (migration in future stories)
- Main app files - Design system is standalone package

---

### Testing Standards Summary

**Unit Testing (Jest + React Native Testing Library):**
- **Target coverage:** 75% (enforced in CI in Story DS-9)
- **Test all hooks:** useTheme, useThemeMode, useColors, useSpacing, etc.
- **Test ThemeProvider:** Different mode props, context propagation
- **Test nested themes:** Theme inheritance, accent overrides
- **Mock Reanimated:** Use `jest.mock('react-native-reanimated')` for unit tests

**Integration Testing:**
- **Storybook validation:** Visual testing for theme switching
- **Device testing:** Validate animations on real device (60fps requirement)
- **Reduced motion:** Test accessibility settings disable animations

**Test File Organization:**
```
packages/weave-design-system/
└── src/
    ├── tokens/
    │   └── __tests__/
    │       ├── colors.test.ts
    │       ├── typography.test.ts
    │       └── ...
    ├── theme/
    │   └── __tests__/
    │       ├── ThemeProvider.test.tsx
    │       ├── useTheme.test.ts
    │       └── ...
    └── animations/
        └── __tests__/
            ├── springs.test.ts
            └── ...
```

---

### Project Structure Notes

**Alignment with Unified Project Structure:**

This story creates a **new standalone package** following the monorepo pattern:
- **Location:** `packages/weave-design-system/` (sibling to future `packages/mobile-app/`)
- **Package name:** `@weave/design-system` (scoped package under `@weave` org)
- **Import pattern:** `import { Button } from '@weave/design-system'` (configured in main app's package.json)

**Path Aliases (Metro Bundler):**
- Metro config in main app must map `@weave/design-system` → `packages/weave-design-system/src/index.ts`
- This is already configured per CLAUDE.md

**Module Naming Conventions:**
- **Token files:** Lowercase (colors.ts, typography.ts)
- **Component files:** PascalCase (ThemeProvider.tsx, Theme.tsx)
- **Hook files:** camelCase starting with 'use' (useTheme.ts, useColors.ts)
- **Index files:** Always lowercase (index.ts, index.tsx)

**Detected Conflicts or Variances:**
- **Old design system:** `src/design-system/` exists but is deprecated
- **Resolution:** Create new package, do NOT modify old system
- **Migration plan:** Future stories will migrate components one by one

---

### References

**Source Documents:**
- **[Epic Context]** docs/epics.md → Epic DS: Design System Rebuild (lines 725-778)
- **[Story Requirements]** docs/epics.md → Story DS-1 (lines 738-741)
- **[Acceptance Criteria]** docs/prd.md → US-DS-1 (lines 2279-2348)
- **[Architecture Constraints]** docs/architecture.md → Technology Stack (React Native + TypeScript)
- **[Design System Guide]** docs/dev/design-system-guide.md → Usage patterns and conventions
- **[Package Structure]** CLAUDE.md → Design System section (lines 100-140)

**External Technical References:**
- **Reanimated withSpring():** https://docs.swmansion.com/react-native-reanimated/docs/animations/withSpring
- **Tamagui themes:** https://tamagui.dev/docs/core/theme (inspiration for nested themes)
- **React Context:** https://react.dev/reference/react/useContext
- **AccessibilityInfo:** https://reactnative.dev/docs/accessibilityinfo (reduced motion)

**Cross-Story Dependencies:**
- **Blocks:** Story DS-2 (Text, Buttons, Icons need theme tokens)
- **Blocks:** Story DS-3 through DS-10 (all components need tokens + theme)
- **Blocks:** Epic 1 (Onboarding needs design system components)

---

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled during implementation_

### Completion Notes List

- [ ] All 220+ tokens exported and typed
- [ ] Theme switches without reload in Storybook
- [ ] Nested Theme components work correctly
- [ ] All spring presets run at 60fps on device
- [ ] Reduced motion disables animations
- [ ] Unit tests pass with 75% coverage
- [ ] Package published locally and importable from main app

### File List

_To be filled during implementation with format: `[NEW|MODIFIED] path/to/file.ts`_

---

**🎯 Ultimate Story Context Created by Bob (Scrum Master)**

This story provides **everything the developer needs** for flawless implementation:
✅ **Comprehensive acceptance criteria** with 220+ specific tokens
✅ **Detailed tasks breakdown** with 23 subtasks
✅ **Architecture guardrails** (Reanimated, TypeScript strict, no old design system edits)
✅ **File structure blueprint** with exact paths
✅ **Testing standards** (75% coverage, device validation)
✅ **Cross-story dependencies** documented

**No ambiguity. No improvisation. Just clear, executable guidance.**
