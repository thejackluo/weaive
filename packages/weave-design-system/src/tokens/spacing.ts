/**
 * Spacing Tokens (25+ tokens)
 *
 * Consistent spacing scale with layout, gap, and inset presets.
 *
 * @packageDocumentation
 */

export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
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
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,

  // Layout tokens (common screen/component padding)
  layout: {
    screenPadding: 16, // spacing[4]
    cardPadding: 12, // spacing[3]
  },

  // Gap tokens (space between elements)
  gap: {
    xs: 4, // spacing[1]
    sm: 8, // spacing[2]
    md: 12, // spacing[3]
    lg: 16, // spacing[4]
    xl: 24, // spacing[6]
  },

  // Inset tokens (internal padding)
  inset: {
    xs: 8, // spacing[2]
    sm: 12, // spacing[3]
    md: 16, // spacing[4]
    lg: 20, // spacing[5]
    xl: 24, // spacing[6]
  },
} as const;
