/**
 * Weave Design System - Typography Tokens
 *
 * Aesthetic: Clean, modern, readable on dark backgrounds
 * Uses SF Pro on iOS (system font)
 *
 * Usage:
 * import { typography, fontSizes } from '@/design-system';
 * <Text style={typography.displayLg}>Heading</Text>
 */

import { Platform, TextStyle } from 'react-native';

// =============================================================================
// FONT FAMILIES
// =============================================================================

export const fontFamily = {
  // iOS uses SF Pro automatically via system font
  // Android uses Roboto automatically
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  semibold: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium', // Android doesn't have semibold
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'System',
  }),
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),
} as const;

// =============================================================================
// FONT SIZES
// =============================================================================

export const fontSizes = {
  // Display sizes (headlines)
  '2xl': 36,
  xl: 30,
  lg: 24,
  md: 20,

  // Text sizes (body)
  base: 16,
  sm: 14,
  xs: 12,
  '2xs': 10,
} as const;

// =============================================================================
// LINE HEIGHTS
// =============================================================================

export const lineHeights = {
  tight: 1.1,    // For large display text
  snug: 1.25,    // For headings
  normal: 1.5,   // For body text
  relaxed: 1.625, // For longer paragraphs
  loose: 2,      // For extra spacing
} as const;

// Computed line heights (font size * multiplier)
export const lineHeightValues = {
  '2xl': 40,  // 36 * 1.1
  xl: 36,     // 30 * 1.2
  lg: 32,     // 24 * 1.33
  md: 28,     // 20 * 1.4
  base: 24,   // 16 * 1.5
  sm: 20,     // 14 * 1.43
  xs: 16,     // 12 * 1.33
  '2xs': 14,  // 10 * 1.4
} as const;

// =============================================================================
// LETTER SPACING
// =============================================================================

export const letterSpacing = {
  tighter: -0.05,  // -5%
  tight: -0.025,   // -2.5%
  normal: 0,       // 0%
  wide: 0.025,     // 2.5%
  wider: 0.05,     // 5%
  widest: 0.1,     // 10%
} as const;

// =============================================================================
// FONT WEIGHTS
// =============================================================================

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const;

// =============================================================================
// TYPOGRAPHY STYLES (Pre-composed)
// =============================================================================

// Display styles (for headings and titles)
export const display: Record<string, TextStyle> = {
  '2xl': {
    fontSize: fontSizes['2xl'],
    lineHeight: lineHeightValues['2xl'],
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.tight,
  },
  xl: {
    fontSize: fontSizes.xl,
    lineHeight: lineHeightValues.xl,
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.tight,
  },
  lg: {
    fontSize: fontSizes.lg,
    lineHeight: lineHeightValues.lg,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.tight,
  },
  md: {
    fontSize: fontSizes.md,
    lineHeight: lineHeightValues.md,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.normal,
  },
};

// Text styles (for body content)
export const text: Record<string, TextStyle> = {
  lg: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: fontWeights.regular,
    letterSpacing: letterSpacing.normal,
  },
  base: {
    fontSize: fontSizes.base,
    lineHeight: lineHeightValues.base,
    fontWeight: fontWeights.regular,
    letterSpacing: letterSpacing.normal,
  },
  sm: {
    fontSize: fontSizes.sm,
    lineHeight: lineHeightValues.sm,
    fontWeight: fontWeights.regular,
    letterSpacing: letterSpacing.normal,
  },
  xs: {
    fontSize: fontSizes.xs,
    lineHeight: lineHeightValues.xs,
    fontWeight: fontWeights.regular,
    letterSpacing: letterSpacing.normal,
  },
};

// Label styles (for buttons, navigation, UI elements)
export const label: Record<string, TextStyle> = {
  lg: {
    fontSize: fontSizes.base,
    lineHeight: lineHeightValues.base,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.wide,
  },
  base: {
    fontSize: fontSizes.sm,
    lineHeight: lineHeightValues.sm,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.wide,
  },
  sm: {
    fontSize: fontSizes.xs,
    lineHeight: lineHeightValues.xs,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.wider,
  },
  xs: {
    fontSize: fontSizes['2xs'],
    lineHeight: lineHeightValues['2xs'],
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.wider,
  },
};

// Mono styles (for code, numbers, data)
export const mono: Record<string, TextStyle> = {
  base: {
    fontFamily: fontFamily.mono,
    fontSize: fontSizes.sm,
    lineHeight: lineHeightValues.sm,
    fontWeight: fontWeights.regular,
  },
  sm: {
    fontFamily: fontFamily.mono,
    fontSize: fontSizes.xs,
    lineHeight: lineHeightValues.xs,
    fontWeight: fontWeights.regular,
  },
};

// =============================================================================
// COMBINED TYPOGRAPHY OBJECT
// =============================================================================

export const typography = {
  // Pre-composed styles
  display2xl: display['2xl'],
  displayXl: display.xl,
  displayLg: display.lg,
  displayMd: display.md,

  textLg: text.lg,
  textBase: text.base,
  textSm: text.sm,
  textXs: text.xs,

  labelLg: label.lg,
  labelBase: label.base,
  labelSm: label.sm,
  labelXs: label.xs,

  monoBase: mono.base,
  monoSm: mono.sm,

  // Raw values
  fontFamily,
  fontSizes,
  fontWeights,
  lineHeights,
  lineHeightValues,
  letterSpacing,
} as const;

export type Typography = typeof typography;
