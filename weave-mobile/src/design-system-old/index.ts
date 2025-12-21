/**
 * Weave Design System - Clean Slate
 *
 * Starting from zero - building one component at a time
 * Current status: Theme tokens only, NO components yet
 */

// ============================================================================
// Theme System (Foundation)
// ============================================================================
export { ThemeProvider, useTheme, useThemeMode } from './theme/ThemeProvider';
export type { Theme, ThemeMode } from './theme/types';

// ============================================================================
// Design Tokens (Foundation)
// ============================================================================
export { colors } from './tokens/colors';
export { typography } from './tokens/typography';
export { spacing, layout } from './tokens/spacing';
export { radius } from './tokens/radius';
export { shadows, glass } from './tokens/effects';
export { springs, durations, easings } from './tokens/animations';

// ============================================================================
// Hooks (Foundation)
// ============================================================================
export { useColors } from './theme/hooks/useColors';
export { useSpacing } from './theme/hooks/useSpacing';
export { useTypography } from './theme/hooks/useTypography';
export { useShadows } from './theme/hooks/useShadows';
export { useAnimations } from './theme/hooks/useAnimations';

// ============================================================================
// Components - Building one at a time
// ============================================================================
// NONE YET - Starting from scratch
// Will add: Button, Card, Checkbox (in that order)

// ============================================================================
// Constants
// ============================================================================
export * from './constants';
