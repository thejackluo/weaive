/**
 * Weave Design System - Spacing Tokens
 *
 * Base unit: 4px
 * Consistent spacing creates visual harmony
 *
 * Usage:
 * import { spacing, layout } from '@/design-system';
 * <View style={{ padding: spacing[4], marginBottom: spacing[6] }} />
 */

// =============================================================================
// SPACING SCALE
// =============================================================================

// Base unit: 4px
export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
} as const;

// =============================================================================
// LAYOUT CONSTANTS
// =============================================================================

export const layout = {
  // Screen padding
  screenPaddingHorizontal: spacing[4],  // 16px
  screenPaddingVertical: spacing[4],    // 16px

  // Card internal padding
  cardPadding: {
    compact: spacing[3],   // 12px
    default: spacing[4],   // 16px
    spacious: spacing[6],  // 24px
  },

  // Section spacing
  sectionSpacing: {
    within: spacing[6],    // 24px - between elements in a section
    between: spacing[8],   // 32px - between sections
    large: spacing[12],    // 48px - major section breaks
  },

  // List item spacing
  listItemSpacing: {
    tight: spacing[2],     // 8px
    default: spacing[3],   // 12px
    relaxed: spacing[4],   // 16px
  },

  // Component spacing
  componentGap: {
    xs: spacing[1],        // 4px - very tight
    sm: spacing[2],        // 8px - tight
    md: spacing[3],        // 12px - default
    lg: spacing[4],        // 16px - relaxed
    xl: spacing[6],        // 24px - very relaxed
  },

  // Input dimensions
  input: {
    height: {
      sm: 36,
      md: 44,
      lg: 52,
    },
    paddingHorizontal: spacing[4],  // 16px
    paddingVertical: spacing[3],    // 12px
  },

  // Button dimensions
  button: {
    height: {
      sm: 32,
      md: 44,
      lg: 52,
    },
    paddingHorizontal: {
      sm: spacing[3],   // 12px
      md: spacing[4],   // 16px
      lg: spacing[5],   // 20px
    },
    minWidth: {
      sm: 64,
      md: 80,
      lg: 120,
    },
  },

  // Touch targets (accessibility)
  touchTarget: {
    min: 44,     // Minimum touch target (Apple HIG)
    recommended: 48,
  },

  // Icon sizes
  icon: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    '2xl': 40,
    '3xl': 48,
  },

  // Avatar sizes
  avatar: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    '2xl': 80,
  },

  // Navigation
  navigation: {
    tabBarHeight: 84,        // Includes safe area
    topBarHeight: 44,        // Excludes safe area
    floatingButtonSize: 56,
  },

  // Modal/Sheet
  modal: {
    maxWidth: 428,           // Max content width
    borderRadius: 24,
  },
  sheet: {
    handleWidth: 36,
    handleHeight: 4,
  },

  // Safe areas (defaults, use useSafeAreaInsets in practice)
  safeArea: {
    top: 47,    // Approximate for notch devices
    bottom: 34, // Home indicator
  },
} as const;

// =============================================================================
// GAP UTILITIES
// =============================================================================

// Common gap patterns for flexbox layouts
export const gap = {
  row: {
    xs: { gap: spacing[1] },
    sm: { gap: spacing[2] },
    md: { gap: spacing[3] },
    lg: { gap: spacing[4] },
    xl: { gap: spacing[6] },
  },
  column: {
    xs: { rowGap: spacing[1] },
    sm: { rowGap: spacing[2] },
    md: { rowGap: spacing[3] },
    lg: { rowGap: spacing[4] },
    xl: { rowGap: spacing[6] },
  },
} as const;

// =============================================================================
// INSET UTILITIES
// =============================================================================

// Common padding patterns
export const inset = {
  none: {
    padding: 0,
  },
  xs: {
    padding: spacing[1],
  },
  sm: {
    padding: spacing[2],
  },
  md: {
    padding: spacing[3],
  },
  lg: {
    padding: spacing[4],
  },
  xl: {
    padding: spacing[6],
  },
  '2xl': {
    padding: spacing[8],
  },
  // Horizontal only
  horizontal: {
    sm: { paddingHorizontal: spacing[2] },
    md: { paddingHorizontal: spacing[4] },
    lg: { paddingHorizontal: spacing[6] },
  },
  // Vertical only
  vertical: {
    sm: { paddingVertical: spacing[2] },
    md: { paddingVertical: spacing[4] },
    lg: { paddingVertical: spacing[6] },
  },
  // Screen inset (with safe areas handled separately)
  screen: {
    paddingHorizontal: spacing[4],
  },
} as const;

export type Spacing = typeof spacing;
export type SpacingKey = keyof typeof spacing;
export type Layout = typeof layout;
