/**
 * Design Tokens
 *
 * 220+ design tokens organized into separate category files:
 * - colors.ts: Primary, accent, semantic colors (60+ tokens)
 * - typography.ts: Font families, sizes, weights, scales (45+ tokens)
 * - spacing.ts: Spacing scale, layout, gaps (25+ tokens)
 * - borders.ts: Border widths and radii (20+ tokens)
 * - effects.ts: Shadows, glows, glass, blur, opacity (35+ tokens)
 * - animations.ts: Spring presets, durations, motion presets (35+ tokens)
 *
 * @packageDocumentation
 */

// Re-export all token categories from separate files
export * from './colors';
export * from './typography';
export * from './spacing';
export * from './borders';
export * from './effects';
export * from './animations';

// Legacy default export for convenience
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { borders } from './borders';
import { shadows, glows, glass, blur, opacity } from './effects';
import { animations } from './animations';

export const tokens = {
  colors,
  typography,
  spacing,
  borders,
  shadows,
  glows,
  glass,
  blur,
  opacity,
  animations,
} as const;

export type Tokens = typeof tokens;
