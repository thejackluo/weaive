/**
 * Border Radius Design Tokens
 *
 * Consistent rounded corners across components
 */

export const radius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999, // Perfect circles and pills
} as const;

// ============================================================================
// Type Exports
// ============================================================================
export type RadiusToken = typeof radius;
export type RadiusKey = keyof typeof radius;
