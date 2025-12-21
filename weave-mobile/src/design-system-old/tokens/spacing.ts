/**
 * Spacing & Layout Design Tokens
 *
 * Base unit: 4px
 * Consistent spacing scale for margins, padding, and gaps
 */

// ============================================================================
// Spacing Scale (Base 4px)
// ============================================================================
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
} as const;

// ============================================================================
// Layout Constants (Common UI Dimensions)
// ============================================================================
export const layout = {
  // Screen Layout
  screenPaddingHorizontal: spacing[4], // 16px
  screenPaddingVertical: spacing[6], // 24px
  sectionGap: spacing[8], // 32px
  cardGap: spacing[4], // 16px

  // Touch Targets (Apple HIG & Material Design)
  touchTarget: {
    min: 44, // Minimum tap target (Apple HIG)
    comfortable: 48, // Comfortable tap target (Material)
  },

  // Button Dimensions
  button: {
    height: {
      sm: 36,
      md: 44,
      lg: 52,
    },
    paddingHorizontal: {
      sm: spacing[3], // 12px
      md: spacing[4], // 16px
      lg: spacing[6], // 24px
    },
    gap: spacing[2], // Gap between icon and text (8px)
  },

  // Input Dimensions
  input: {
    height: {
      sm: 36,
      md: 44,
      lg: 52,
    },
    paddingHorizontal: spacing[3], // 12px
    paddingVertical: spacing[2], // 8px
  },

  // Card Padding
  cardPadding: {
    none: 0,
    compact: spacing[3], // 12px
    default: spacing[4], // 16px
    spacious: spacing[6], // 24px
  },

  // Icon Sizes
  icon: {
    xs: 12,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  },

  // Avatar Sizes
  avatar: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  },

  // Badge Dimensions
  badge: {
    height: {
      sm: 20,
      md: 24,
      lg: 28,
    },
    paddingHorizontal: {
      sm: spacing[2], // 8px
      md: spacing[2], // 8px
      lg: spacing[3], // 12px
    },
  },

  // Modal/Sheet
  modal: {
    maxWidth: 480,
    borderRadius: spacing[4], // 16px
    padding: spacing[6], // 24px
  },

  // List Item
  listItem: {
    minHeight: 56,
    paddingHorizontal: spacing[4], // 16px
    paddingVertical: spacing[3], // 12px
    gap: spacing[3], // 12px
  },
} as const;

// ============================================================================
// Type Exports
// ============================================================================
export type SpacingToken = typeof spacing;
export type SpacingKey = keyof typeof spacing;
export type LayoutToken = typeof layout;
