/**
 * Weave Design System - Shadow & Effect Tokens
 *
 * Dark mode shadows are subtle - rely more on borders and elevation
 * Glass effects create the Opal-inspired premium feel
 *
 * Usage:
 * import { shadows, effects } from '@/design-system';
 * <View style={shadows.md} />
 */

import { ViewStyle } from 'react-native';
import { background, border } from './colors';

// =============================================================================
// SHADOW SCALE
// =============================================================================

// Note: Shadows are subtle on dark backgrounds - we use them sparingly
// and rely more on borders and background color hierarchy

export const shadows: Record<string, ViewStyle> = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  // Subtle lift - for cards, inputs
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },

  // Default shadow - elevated cards
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },

  // Pronounced shadow - dropdowns, floating elements
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },

  // Heavy shadow - modals, FAB
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },

  // Maximum shadow - popovers, tooltips
  '2xl': {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.45,
    shadowRadius: 30,
    elevation: 16,
  },

  // Inner shadow effect (simulated with border)
  inner: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
};

// =============================================================================
// GLOW EFFECTS
// =============================================================================

// Colored glows for emphasis (used sparingly)
export const glows: Record<string, ViewStyle> = {
  // Accent blue glow
  accent: {
    shadowColor: '#5B8DEF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },

  // AI/Violet glow
  ai: {
    shadowColor: '#9D71E8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },

  // Success glow
  success: {
    shadowColor: '#10D87E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },

  // Warning/Celebration glow
  amber: {
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },

  // Error glow
  error: {
    shadowColor: '#E85A7E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
};

// =============================================================================
// GLASS EFFECTS (Opal-inspired)
// =============================================================================

// Glass morphism styles - the signature Weave look
export const glass: Record<string, ViewStyle> = {
  // Standard glass card
  card: {
    backgroundColor: background.glass,
    borderWidth: 1,
    borderColor: border.glass,
  },

  // Elevated glass (more visible)
  elevated: {
    backgroundColor: 'rgba(26, 26, 31, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...shadows.md,
  },

  // Subtle glass (minimal)
  subtle: {
    backgroundColor: 'rgba(20, 20, 24, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },

  // Interactive glass (hover state simulation)
  interactive: {
    backgroundColor: 'rgba(26, 26, 31, 0.85)',
    borderWidth: 1,
    borderColor: border.glassHover,
  },

  // AI-themed glass
  ai: {
    backgroundColor: 'rgba(45, 27, 78, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(157, 113, 232, 0.2)',
  },

  // Success-themed glass
  success: {
    backgroundColor: 'rgba(4, 61, 36, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(16, 216, 126, 0.2)',
  },
};

// =============================================================================
// BLUR VALUES (for BackdropFilter when supported)
// =============================================================================

export const blur = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 20,
  '2xl': 40,
} as const;

// =============================================================================
// OPACITY SCALE
// =============================================================================

export const opacity = {
  0: 0,
  5: 0.05,
  10: 0.1,
  20: 0.2,
  25: 0.25,
  30: 0.3,
  40: 0.4,
  50: 0.5,
  60: 0.6,
  70: 0.7,
  75: 0.75,
  80: 0.8,
  90: 0.9,
  95: 0.95,
  100: 1,
} as const;

// =============================================================================
// COMBINED EFFECTS EXPORT
// =============================================================================

export const effects = {
  shadows,
  glows,
  glass,
  blur,
  opacity,
} as const;

export type Effects = typeof effects;
export type ShadowKey = keyof typeof shadows;
export type GlowKey = keyof typeof glows;
export type GlassKey = keyof typeof glass;
