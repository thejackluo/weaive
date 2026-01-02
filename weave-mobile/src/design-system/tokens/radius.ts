/**
 * Border Radius Design Tokens
 *
 * iOS 17-inspired rounded corners for minimal aesthetic
 * Default card radius: 24-28px for soft, modern feel
 */

export const radius = {
  none: 0,
  xs: 6, // Small elements
  sm: 10, // Buttons, inputs
  md: 16, // Medium components
  lg: 20, // Large cards
  xl: 24, // Primary card radius (iOS 17 style)
  '2xl': 28, // Extra large cards
  '3xl': 32, // Maximum rounded for special cards
  full: 9999, // Perfect circles and pills
} as const;

// ============================================================================
// Type Exports
// ============================================================================
export type RadiusToken = typeof radius;
export type RadiusKey = keyof typeof radius;
