/**
 * Weave Design System - Token Exports
 *
 * Central export point for all design tokens
 *
 * Usage:
 * import { colors, typography, spacing } from '@/design-system/tokens';
 */

// Color tokens
export * from './colors';

// Typography tokens
export * from './typography';

// Spacing tokens
export * from './spacing';

// Shadow and effect tokens
export * from './shadows';

// Border radius tokens
export * from './radius';

// Animation tokens
export * from './animations';

// =============================================================================
// COMBINED THEME OBJECT
// =============================================================================

import { colors } from './colors';
import { typography } from './typography';
import { spacing, layout, gap, inset } from './spacing';
import { effects, shadows, glows, glass, blur, opacity } from './shadows';
import { borders, radius, componentRadius, borderWidth } from './radius';
import { animations, durations, timing, easings, motion, springs } from './animations';

/**
 * Complete theme object containing all design tokens
 * Use this for theme provider or accessing all tokens at once
 */
export const tokens = {
  colors,
  typography,
  spacing,
  layout,
  gap,
  inset,
  effects,
  shadows,
  glows,
  glass,
  blur,
  opacity,
  borders,
  radius,
  componentRadius,
  borderWidth,
  animations,
  durations,
  timing,
  easings,
  motion,
  springs,
} as const;

export type Tokens = typeof tokens;

// =============================================================================
// QUICK ACCESS EXPORTS
// =============================================================================

// Most commonly used exports for convenience
export {
  // Colors
  colors,

  // Typography
  typography,

  // Spacing
  spacing,
  layout,

  // Effects
  shadows,
  glass,

  // Borders
  radius,

  // Animations
  durations,
  springs,
};
