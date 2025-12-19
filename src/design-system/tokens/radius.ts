/**
 * Weave Design System - Border Radius Tokens
 *
 * Generous radii create soft, approachable feel
 * Consistent with iOS design language
 *
 * Usage:
 * import { radius } from '@/design-system';
 * <View style={{ borderRadius: radius.lg }} />
 */

// =============================================================================
// RADIUS SCALE
// =============================================================================

export const radius = {
  none: 0,
  xs: 4,      // Small badges, chips
  sm: 6,      // Subtle rounding
  md: 8,      // Buttons, small cards
  lg: 12,     // Cards, inputs
  xl: 16,     // Large cards, modals
  '2xl': 20,  // Bottom sheets
  '3xl': 24,  // Large elements
  '4xl': 32,  // Pills, floating elements
  full: 9999, // Circles, fully rounded
} as const;

// =============================================================================
// COMPONENT-SPECIFIC RADII
// =============================================================================

export const componentRadius = {
  // Buttons
  button: {
    sm: radius.md,    // 8px
    md: radius.lg,    // 12px
    lg: radius.xl,    // 16px
    pill: radius.full,
  },

  // Cards
  card: {
    sm: radius.lg,    // 12px
    md: radius.xl,    // 16px
    lg: radius['2xl'], // 20px
  },

  // Inputs
  input: {
    sm: radius.md,    // 8px
    md: radius.lg,    // 12px
    lg: radius.xl,    // 16px
  },

  // Badges
  badge: {
    sm: radius.xs,    // 4px
    md: radius.sm,    // 6px
    pill: radius.full,
  },

  // Avatars (always circular)
  avatar: radius.full,

  // Modals & Sheets
  modal: radius['3xl'],    // 24px
  sheet: radius['3xl'],    // 24px
  sheetHandle: radius.full,

  // Progress indicators
  progress: radius.full,
  progressTrack: radius.full,

  // Heat map cells
  heatMapCell: radius.xs,  // 4px

  // Navigation
  tabBar: radius['2xl'],
  floatingButton: radius.full,

  // Checkboxes
  checkbox: radius.sm,     // 6px
  checkboxChecked: radius.sm,

  // Tooltips
  tooltip: radius.lg,      // 12px

  // Toast notifications
  toast: radius.xl,        // 16px
} as const;

// =============================================================================
// BORDER WIDTH
// =============================================================================

export const borderWidth = {
  none: 0,
  hairline: 0.5,  // StyleSheet.hairlineWidth equivalent
  thin: 1,
  base: 1.5,
  thick: 2,
  heavy: 3,
} as const;

// =============================================================================
// COMBINED EXPORT
// =============================================================================

export const borders = {
  radius,
  componentRadius,
  borderWidth,
} as const;

export type Radius = typeof radius;
export type RadiusKey = keyof typeof radius;
export type BorderWidth = typeof borderWidth;
