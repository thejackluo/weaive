/**
 * Theme System Types
 */

import { ColorToken } from '../tokens/colors';
import { TypographyToken } from '../tokens/typography';
import { SpacingToken, LayoutToken } from '../tokens/spacing';
import { RadiusToken } from '../tokens/radius';
import { ShadowToken, GlassToken, GradientToken } from '../tokens/effects';
import { SpringConfig, Duration, EasingConfig } from '../tokens/animations';

// ============================================================================
// Theme Mode
// ============================================================================
export type ThemeMode = 'light' | 'dark' | 'system';

// ============================================================================
// Complete Theme Object
// ============================================================================
export interface Theme {
  mode: ThemeMode;
  colors: ColorToken;
  typography: TypographyToken;
  spacing: SpacingToken;
  layout: LayoutToken;
  radius: RadiusToken;
  shadows: ShadowToken;
  glass: GlassToken;
  gradients: GradientToken;
  springs: SpringConfig;
  durations: Duration;
  easings: EasingConfig;
}

// ============================================================================
// Theme Context Value
// ============================================================================
export interface ThemeContextValue extends Theme {
  setMode: (mode: ThemeMode) => void;
}
