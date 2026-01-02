/**
 * Typography Design Tokens
 *
 * Minimal aesthetic with SF Pro Display/Text (iOS) and Roboto (Android)
 * System fonts provide premium feel with zero bundle size
 */

import { TextStyle, Platform } from 'react-native';

// ============================================================================
// Font Families (System Fonts)
// ============================================================================
// iOS: SF Pro Display (headings), SF Pro Text (body)
// Android: Roboto
// Web: System font stack

export const fontFamilies = {
  // System defaults to SF Pro on iOS, Roboto on Android
  system: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }),
  // Monospace for code/technical content
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'Menlo, Monaco, "Courier New", monospace',
  }),
} as const;

// ============================================================================
// Base Typography Settings
// ============================================================================
export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

export const fontWeights = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
} as const;

export const lineHeights = {
  none: 1,
  tight: 1.2,
  snug: 1.3,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
} as const;

export const letterSpacing = {
  tighter: -0.5, // Tight, modern spacing for headings (like greeting)
  tight: -0.3, // Moderately tight for subheadings
  normal: -0.2, // Slightly tight for body text (premium feel)
  wide: 0, // Standard spacing (neutral)
  wider: 0.025,
  widest: 0.1,
} as const;

// ============================================================================
// Pre-composed Typography Styles
// ============================================================================
export const typography = {
  // Display Styles (Large Headlines) - SF Pro Display on iOS
  display2xl: {
    fontFamily: fontFamilies.system,
    fontSize: fontSizes['5xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['5xl'] * lineHeights.tight,
    letterSpacing: letterSpacing.tighter,
  } as TextStyle,

  displayXl: {
    fontFamily: fontFamilies.system,
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['4xl'] * lineHeights.tight,
    letterSpacing: letterSpacing.tighter,
  } as TextStyle,

  displayLg: {
    fontFamily: fontFamilies.system,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['2xl'] * lineHeights.snug,
    letterSpacing: letterSpacing.tighter,
  } as TextStyle,

  displayMd: {
    fontFamily: fontFamilies.system,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes.xl * lineHeights.snug,
    letterSpacing: letterSpacing.tighter,
  } as TextStyle,

  // Text Styles (Body Copy) - SF Pro Text on iOS
  textLg: {
    fontFamily: fontFamilies.system,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold, // Semibold for all text
    lineHeight: fontSizes.lg * lineHeights.normal,
    letterSpacing: letterSpacing.tight, // Tighter spacing
  } as TextStyle,

  textBase: {
    fontFamily: fontFamilies.system,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold, // Semibold for all text
    lineHeight: fontSizes.base * lineHeights.normal,
    letterSpacing: letterSpacing.tight, // Tighter spacing
  } as TextStyle,

  textSm: {
    fontFamily: fontFamilies.system,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold, // Semibold for all text
    lineHeight: fontSizes.sm * lineHeights.normal,
    letterSpacing: letterSpacing.tight, // Tighter spacing
  } as TextStyle,

  textXs: {
    fontFamily: fontFamilies.system,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold, // Semibold for all text
    lineHeight: fontSizes.xs * lineHeights.normal,
    letterSpacing: letterSpacing.tight, // Tighter spacing
  } as TextStyle,

  // Label Styles (UI Labels, Buttons)
  labelLg: {
    fontFamily: fontFamilies.system,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.base * lineHeights.none,
    letterSpacing: letterSpacing.tight,
  } as TextStyle,

  labelBase: {
    fontFamily: fontFamilies.system,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.sm * lineHeights.none,
    letterSpacing: letterSpacing.tight,
  } as TextStyle,

  labelSm: {
    fontFamily: fontFamilies.system,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.xs * lineHeights.none,
    letterSpacing: letterSpacing.tight,
  } as TextStyle,

  // Monospace (Code, Technical)
  monoBase: {
    fontFamily: fontFamilies.mono,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.sm * lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  monoSm: {
    fontFamily: fontFamilies.mono,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.xs * lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  // Raw token access
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacing,
  fontFamilies,
} as const;

// ============================================================================
// Type Exports
// ============================================================================
export type TypographyToken = typeof typography;
export type TypographyVariant =
  | 'display2xl'
  | 'displayXl'
  | 'displayLg'
  | 'displayMd'
  | 'textLg'
  | 'textBase'
  | 'textSm'
  | 'textXs'
  | 'labelLg'
  | 'labelBase'
  | 'labelSm'
  | 'monoBase'
  | 'monoSm';

export type FontSize = keyof typeof fontSizes;
export type FontWeight = keyof typeof fontWeights;
export type LineHeight = keyof typeof lineHeights;
export type LetterSpacing = keyof typeof letterSpacing;
