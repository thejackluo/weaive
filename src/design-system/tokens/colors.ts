/**
 * Weave Design System - Color Tokens
 *
 * Aesthetic: Dark, minimalistic, elegant - inspired by Opal
 * Feels premium, personal, and understanding
 *
 * Usage:
 * import { colors } from '@/design-system';
 * <View style={{ backgroundColor: colors.background.primary }} />
 */

// =============================================================================
// BASE PALETTE
// =============================================================================

// Deep Dark Backgrounds (Primary palette - Opal-inspired)
export const dark = {
  950: '#09090B', // Deepest black - primary background
  900: '#0F0F12', // Card backgrounds
  850: '#141418', // Elevated surfaces
  800: '#1A1A1F', // Elevated cards
  750: '#212127', // Borders, dividers
  700: '#2A2A32', // Subtle highlights
  600: '#3F3F4A', // Disabled states
  500: '#52525E', // Muted elements
  400: '#71717F', // Secondary text
  300: '#A1A1AD', // Primary text (muted)
  200: '#D4D4DC', // Primary text
  100: '#ECECF1', // High emphasis text
  50: '#FAFAFA',  // Maximum contrast
} as const;

// Accent Blue (Actions, links, focus states)
// Softer, more elegant than typical blue
export const accent = {
  950: '#0C1929',
  900: '#132641',
  800: '#1E3A5F',
  700: '#2952A3',
  600: '#3B6BC9',
  500: '#5B8DEF', // Primary accent
  400: '#7BA5F5',
  300: '#9FBDFA',
  200: '#C3D5FC',
  100: '#E1EBFE',
  50: '#F0F5FF',
} as const;

// Warm Violet (AI, Dream Self, personal elements)
// Creates that "understanding" feeling
export const violet = {
  950: '#1A0B2E',
  900: '#2D1B4E',
  800: '#44297A',
  700: '#5B3A9E',
  600: '#7C52CC',
  500: '#9D71E8', // AI accent - warm and personal
  400: '#B794F6',
  300: '#CFBAFC',
  200: '#E4D7FD',
  100: '#F3EDFE',
  50: '#FAF7FF',
} as const;

// Warm Amber (Success, celebration, warmth)
// Adds humanity and warmth to the dark interface
export const amber = {
  950: '#1C1106',
  900: '#382008',
  800: '#5C3D0E',
  700: '#8A5A11',
  600: '#C27D14',
  500: '#F5A623', // Celebration, streaks
  400: '#FBBF24',
  300: '#FCD34D',
  200: '#FDE68A',
  100: '#FEF3C7',
  50: '#FFFBEB',
} as const;

// Rose (Gentle errors, important notices)
// Softer than red, more elegant
export const rose = {
  950: '#1C0A0F',
  900: '#3B1520',
  800: '#5E1F30',
  700: '#8B2E47',
  600: '#BE3D5E',
  500: '#E85A7E', // Error, critical
  400: '#F27A98',
  300: '#F9A3B7',
  200: '#FCCDD7',
  100: '#FEE7EC',
  50: '#FFF5F7',
} as const;

// Emerald (Success, completion)
export const emerald = {
  950: '#021F13',
  900: '#043D24',
  800: '#065F38',
  700: '#08894F',
  600: '#0AB568',
  500: '#10D87E', // Success, completion
  400: '#3EE89B',
  300: '#72F2B6',
  200: '#A7F8D2',
  100: '#D5FCE9',
  50: '#EDFEF5',
} as const;

// =============================================================================
// SEMANTIC COLORS
// =============================================================================

export const semantic = {
  success: {
    muted: emerald[950],
    subtle: emerald[900],
    base: emerald[500],
    emphasis: emerald[400],
  },
  warning: {
    muted: amber[950],
    subtle: amber[900],
    base: amber[500],
    emphasis: amber[400],
  },
  error: {
    muted: rose[950],
    subtle: rose[900],
    base: rose[500],
    emphasis: rose[400],
  },
  info: {
    muted: accent[950],
    subtle: accent[900],
    base: accent[500],
    emphasis: accent[400],
  },
  ai: {
    muted: violet[950],
    subtle: violet[900],
    base: violet[500],
    emphasis: violet[400],
  },
} as const;

// =============================================================================
// FUNCTIONAL COLORS
// =============================================================================

// Background colors (dark-first)
export const background = {
  // Core backgrounds
  primary: dark[950],      // Main app background
  secondary: dark[900],    // Card backgrounds
  tertiary: dark[850],     // Elevated surfaces
  elevated: dark[800],     // Floating elements

  // Interactive backgrounds
  subtle: dark[750],       // Subtle highlight
  muted: dark[700],        // Input backgrounds

  // Overlay backgrounds
  overlay: 'rgba(9, 9, 11, 0.8)',      // Modal overlays
  overlayLight: 'rgba(9, 9, 11, 0.5)', // Light overlays

  // Glass effect (Opal-style)
  glass: 'rgba(20, 20, 24, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
} as const;

// Text colors
export const text = {
  primary: dark[100],      // High emphasis - headings
  secondary: dark[200],    // Normal body text
  tertiary: dark[300],     // Muted text
  muted: dark[400],        // Very muted
  placeholder: dark[500],  // Placeholder text
  disabled: dark[600],     // Disabled text

  // Inverse (for light backgrounds)
  inverse: dark[950],
  inverseSecondary: dark[900],

  // Link and accent text
  link: accent[500],
  accent: accent[400],
  ai: violet[400],
  success: emerald[400],
  warning: amber[400],
  error: rose[400],
} as const;

// Border colors
export const border = {
  subtle: dark[800],       // Very subtle borders
  muted: dark[750],        // Default borders
  base: dark[700],         // Visible borders
  emphasis: dark[600],     // High contrast borders

  // Interactive borders
  focus: accent[500],
  focusRing: accent[600],
  error: rose[500],
  success: emerald[500],

  // Glass borders
  glass: 'rgba(255, 255, 255, 0.08)',
  glassHover: 'rgba(255, 255, 255, 0.12)',
} as const;

// =============================================================================
// GRADIENTS
// =============================================================================

// Heat Map Gradient (Consistency Visualization)
export const heatMap = {
  0: dark[800],           // No activity
  20: '#1A3D2E',          // Low
  40: '#2D5E4A',          // Medium-low
  60: '#3D8066',          // Medium
  80: '#4EA383',          // High
  100: '#10D87E',         // Complete
} as const;

// Weave Progression (Character levels)
export const weaveGradient = {
  thread: dark[600],       // Starting state
  strand: violet[700],     // Early progress
  cord: violet[600],       // Gaining momentum
  braid: violet[500],      // Strong consistency
  weave: violet[400],      // Mastery
} as const;

// Premium gradients (for special elements)
export const gradients = {
  // Primary action gradient
  primary: ['#5B8DEF', '#3B6BC9'],

  // AI/Dream Self gradient (warm, personal)
  ai: ['#9D71E8', '#7C52CC'],
  aiSubtle: ['rgba(157, 113, 232, 0.15)', 'rgba(124, 82, 204, 0.05)'],

  // Success/Celebration gradient
  success: ['#10D87E', '#0AB568'],
  celebration: ['#F5A623', '#FBBF24'],

  // Premium glow effects
  glowBlue: 'rgba(91, 141, 239, 0.25)',
  glowViolet: 'rgba(157, 113, 232, 0.25)',
  glowAmber: 'rgba(245, 166, 35, 0.25)',

  // Card gradients
  cardHighlight: ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0)'],
} as const;

// =============================================================================
// LIGHT MODE (Optional - for future use)
// =============================================================================

export const light = {
  background: {
    primary: '#FFFFFF',
    secondary: '#FAFAFA',
    tertiary: '#F5F5F5',
    elevated: '#FFFFFF',
  },
  text: {
    primary: dark[900],
    secondary: dark[700],
    tertiary: dark[500],
    muted: dark[400],
  },
  border: {
    subtle: '#E5E5E5',
    muted: '#D4D4D4',
    base: '#A3A3A3',
  },
} as const;

// =============================================================================
// COMBINED EXPORT
// =============================================================================

export const colors = {
  // Base palettes
  dark,
  accent,
  violet,
  amber,
  rose,
  emerald,

  // Semantic
  semantic,

  // Functional
  background,
  text,
  border,

  // Gradients & special
  heatMap,
  weaveGradient,
  gradients,

  // Light mode (future)
  light,
} as const;

export type Colors = typeof colors;
export type DarkShade = keyof typeof dark;
export type AccentShade = keyof typeof accent;
