/**
 * Typography Design Tokens
 *
 * Pre-composed typography styles for consistent text rendering
 * Based on iOS San Francisco and Android Roboto system fonts
 */

import { TextStyle } from 'react-native';

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
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
} as const;

export const letterSpacing = {
  tighter: -0.05,
  tight: -0.025,
  normal: 0,
  wide: 0.025,
  wider: 0.05,
  widest: 0.1,
} as const;

// ============================================================================
// Pre-composed Typography Styles
// ============================================================================
export const typography = {
  // Display Styles (Large Headlines)
  display2xl: {
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['4xl'] * lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  } as TextStyle,

  displayXl: {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['3xl'] * lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  } as TextStyle,

  displayLg: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes['2xl'] * lineHeights.normal,
    letterSpacing: letterSpacing.tight,
  } as TextStyle,

  displayMd: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.xl * lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  // Text Styles (Body Copy)
  textLg: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.lg * lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  textBase: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.base * lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  textSm: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.sm * lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  textXs: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.xs * lineHeights.normal,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,

  // Label Styles (UI Labels, Buttons)
  labelLg: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.base * lineHeights.none,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,

  labelBase: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.sm * lineHeights.none,
    letterSpacing: letterSpacing.wide,
  } as TextStyle,

  labelSm: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.xs * lineHeights.none,
    letterSpacing: letterSpacing.wider,
  } as TextStyle,

  // Monospace (Code, Technical)
  monoBase: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.sm * lineHeights.normal,
    letterSpacing: letterSpacing.normal,
    fontFamily: 'monospace',
  } as TextStyle,

  monoSm: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.xs * lineHeights.normal,
    letterSpacing: letterSpacing.normal,
    fontFamily: 'monospace',
  } as TextStyle,

  // Raw token access
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacing,
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
