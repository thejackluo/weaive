/**
 * Tamagui Configuration
 *
 * Maps Weave design tokens to Tamagui's theme system.
 * This enables Tamagui primitives (Button, Text, Stack, etc.) to consume
 * Weave's custom design system through Tamagui's theme API.
 *
 * Architecture:
 * - Weave ThemeProvider (outer) controls dark/light mode
 * - TamaguiProvider (inner) consumes theme from Weave context
 * - Tamagui components automatically use mapped tokens
 * - Custom Weave components use useTheme() from @weave/design-system
 *
 * @packageDocumentation
 */

import { createTamagui, createTokens } from '@tamagui/core';
import { shorthands } from '@tamagui/shorthands';
import { themes as defaultThemes, tokens as defaultTokens } from '@tamagui/themes';
import { createAnimations } from '@tamagui/animations-moti';

// Import Weave tokens
import { colors, spacing, typography, borders, animations } from './tokens';

// =============================================================================
// TOKEN MAPPING: Weave → Tamagui
// =============================================================================

/**
 * Create Tamagui tokens from Weave design tokens
 *
 * Tamagui expects flat color palettes with numbered variants.
 * We map Weave's semantic color system to Tamagui's structure.
 */
const tamaguiTokens = createTokens({
  // Color tokens - map Weave color scales to Tamagui format
  color: {
    // Primary brand colors
    primary1: colors.primary[50],
    primary2: colors.primary[100],
    primary3: colors.primary[200],
    primary4: colors.primary[300],
    primary5: colors.primary[400],
    primary6: colors.primary[500], // Base primary
    primary7: colors.primary[600],
    primary8: colors.primary[700],
    primary9: colors.primary[800],
    primary10: colors.primary[900],

    // Amber accent
    amber1: colors.amber[50],
    amber2: colors.amber[100],
    amber3: colors.amber[200],
    amber4: colors.amber[300],
    amber5: colors.amber[400], // Base amber
    amber6: colors.amber[500],
    amber7: colors.amber[600],
    amber8: colors.amber[700],
    amber9: colors.amber[800],
    amber10: colors.amber[900],

    // Violet (AI accent)
    violet1: colors.violet[50],
    violet2: colors.violet[100],
    violet3: colors.violet[200],
    violet4: colors.violet[300],
    violet5: colors.violet[400], // Base violet
    violet6: colors.violet[500],
    violet7: colors.violet[600],
    violet8: colors.violet[700],
    violet9: colors.violet[800],
    violet10: colors.violet[900],

    // Rose (error/destructive)
    rose1: colors.rose[50],
    rose2: colors.rose[100],
    rose3: colors.rose[200],
    rose4: colors.rose[300],
    rose5: colors.rose[500], // Base rose
    rose6: colors.rose[600],
    rose7: colors.rose[700],
    rose8: colors.rose[800],
    rose9: colors.rose[900],

    // Emerald (success)
    emerald1: colors.emerald[50],
    emerald2: colors.emerald[100],
    emerald3: colors.emerald[200],
    emerald4: colors.emerald[300],
    emerald5: colors.emerald[400], // Base emerald
    emerald6: colors.emerald[500],
    emerald7: colors.emerald[600],
    emerald8: colors.emerald[700],
    emerald9: colors.emerald[800],

    // Grayscale (dark-first)
    gray1: colors.dark[50],
    gray2: colors.dark[100],
    gray3: colors.dark[200],
    gray4: colors.dark[300],
    gray5: colors.dark[400],
    gray6: colors.dark[500],
    gray7: colors.dark[600],
    gray8: colors.dark[700],
    gray9: colors.dark[800],
    gray10: colors.dark[900],
    gray11: colors.dark[950],

    // Semantic colors
    success: colors.success[500],
    warning: colors.warning[500],
    error: colors.error[500],
  },

  // Spacing tokens - map Weave spacing scale
  space: {
    0: spacing[0],
    0.5: spacing[0.5],
    1: spacing[1],
    1.5: spacing[1.5],
    2: spacing[2],
    2.5: spacing[2.5],
    3: spacing[3],
    3.5: spacing[3.5],
    4: spacing[4],
    5: spacing[5],
    6: spacing[6],
    7: spacing[7],
    8: spacing[8],
    9: spacing[9],
    10: spacing[10],
    11: spacing[11],
    12: spacing[12],
    14: spacing[14],
    16: spacing[16],
    20: spacing[20],
    24: spacing[24],
    28: spacing[28],
    32: spacing[32],
    36: spacing[36],
    40: spacing[40],
    44: spacing[44],
    48: spacing[48],
    52: spacing[52],
    56: spacing[56],
    60: spacing[60],
    64: spacing[64],
  },

  // Size tokens (use spacing for consistency)
  size: {
    0: spacing[0],
    1: spacing[1],
    2: spacing[2],
    3: spacing[3],
    4: spacing[4],
    5: spacing[5],
    6: spacing[6],
    8: spacing[8],
    10: spacing[10],
    12: spacing[12],
    16: spacing[16],
    20: spacing[20],
    24: spacing[24],
    32: spacing[32],
    40: spacing[40],
    48: spacing[48],
    56: spacing[56],
    64: spacing[64],
  },

  // Radius tokens - map Weave border radius
  radius: {
    0: borders.radius.none,
    1: borders.radius.sm,
    2: borders.radius.base,
    3: borders.radius.md,
    4: borders.radius.lg,
    5: borders.radius.xl,
    6: borders.radius['2xl'],
    7: borders.radius['3xl'],
    round: borders.radius.full,
  },

  // Z-index tokens (for stacking context)
  zIndex: {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
  },
});

// =============================================================================
// ANIMATION CONFIGURATION
// =============================================================================

/**
 * Create Reanimated animations using Weave spring presets
 *
 * Tamagui's animations API integrates with React Native Reanimated.
 * We map Weave's spring physics to Tamagui animation configs.
 */
const tamaguiAnimations = createAnimations({
  // Weave spring presets
  gentle: {
    type: 'spring',
    damping: animations.springs.gentle.damping,
    stiffness: animations.springs.gentle.stiffness,
    mass: 0.8,
  },
  snappy: {
    type: 'spring',
    damping: animations.springs.snappy.damping,
    stiffness: animations.springs.snappy.stiffness,
    mass: 0.5,
  },
  bouncy: {
    type: 'spring',
    damping: animations.springs.bouncy.damping,
    stiffness: animations.springs.bouncy.stiffness,
    mass: 1.2,
  },
  stiff: {
    type: 'spring',
    damping: animations.springs.stiff.damping,
    stiffness: animations.springs.stiff.stiffness,
    mass: 0.4,
  },

  // Timing presets
  fast: {
    type: 'timing',
    duration: animations.durations.fast,
  },
  normal: {
    type: 'timing',
    duration: animations.durations.base,
  },
  slow: {
    type: 'timing',
    duration: animations.durations.slow,
  },
});

// =============================================================================
// THEME CONFIGURATION
// =============================================================================

/**
 * Create Tamagui themes (dark and light)
 *
 * These themes map Weave's semantic color system to Tamagui's theme structure.
 * Tamagui components consume these theme values automatically.
 */
const tamaguiThemes = {
  dark: {
    // Background colors
    background: colors.dark[950], // Darkest for OLED
    backgroundHover: colors.dark[900],
    backgroundPress: colors.dark[800],
    backgroundFocus: colors.dark[900],
    backgroundStrong: colors.dark[800],
    backgroundTransparent: 'rgba(0, 0, 0, 0)',

    // Text colors
    color: colors.dark[50], // Primary text (light on dark)
    colorHover: colors.dark[100],
    colorPress: colors.dark[200],
    colorFocus: colors.dark[100],
    colorTransparent: 'rgba(249, 250, 251, 0)',

    // Border colors
    borderColor: colors.dark[800],
    borderColorHover: colors.dark[700],
    borderColorPress: colors.dark[600],
    borderColorFocus: colors.primary[500],

    // Accent colors (interactive elements)
    color1: colors.primary[50],
    color2: colors.primary[100],
    color3: colors.primary[200],
    color4: colors.primary[300],
    color5: colors.primary[400],
    color6: colors.primary[500], // Base accent
    color7: colors.primary[600],
    color8: colors.primary[700],
    color9: colors.primary[800],
    color10: colors.primary[900],

    // Shadow colors
    shadowColor: colors.dark[950],
    shadowColorHover: colors.dark[900],
    shadowColorPress: colors.dark[800],
    shadowColorFocus: colors.primary[500],
  },

  light: {
    // Background colors
    background: colors.dark[50], // Lightest for light mode
    backgroundHover: colors.dark[100],
    backgroundPress: colors.dark[200],
    backgroundFocus: colors.dark[100],
    backgroundStrong: colors.dark[200],
    backgroundTransparent: 'rgba(255, 255, 255, 0)',

    // Text colors
    color: colors.dark[900], // Primary text (dark on light)
    colorHover: colors.dark[800],
    colorPress: colors.dark[700],
    colorFocus: colors.dark[800],
    colorTransparent: 'rgba(17, 24, 39, 0)',

    // Border colors
    borderColor: colors.dark[200],
    borderColorHover: colors.dark[300],
    borderColorPress: colors.dark[400],
    borderColorFocus: colors.primary[500],

    // Accent colors (interactive elements)
    color1: colors.primary[50],
    color2: colors.primary[100],
    color3: colors.primary[200],
    color4: colors.primary[300],
    color5: colors.primary[400],
    color6: colors.primary[500], // Base accent
    color7: colors.primary[600],
    color8: colors.primary[700],
    color9: colors.primary[800],
    color10: colors.primary[900],

    // Shadow colors
    shadowColor: colors.dark[900],
    shadowColorHover: colors.dark[800],
    shadowColorPress: colors.dark[700],
    shadowColorFocus: colors.primary[500],
  },
};

// =============================================================================
// TAMAGUI CONFIG
// =============================================================================

/**
 * Main Tamagui configuration
 *
 * This config is passed to TamaguiProvider and enables all Tamagui features:
 * - Token-based styling
 * - Runtime theme switching
 * - Responsive design utilities
 * - Animation system integration
 * - Shorthands for common CSS properties
 */
export const config = createTamagui({
  animations: tamaguiAnimations,
  shouldAddPrefersColorThemes: false, // Weave controls theme mode
  themeClassNameOnRoot: false, // Not needed for React Native
  shorthands,
  fonts: {
    // Map Weave typography to Tamagui font system
    heading: {
      family: typography.fontFamily.sans,
      size: {
        1: typography.fontSize.xs,
        2: typography.fontSize.sm,
        3: typography.fontSize.base,
        4: typography.fontSize.lg,
        5: typography.fontSize.xl,
        6: typography.fontSize['2xl'],
        7: typography.fontSize['3xl'],
        8: typography.fontSize['4xl'],
        9: typography.fontSize['5xl'],
        10: typography.fontSize['6xl'],
      },
      weight: {
        1: typography.fontWeight.regular,
        4: typography.fontWeight.medium,
        6: typography.fontWeight.semibold,
        7: typography.fontWeight.bold,
      },
      lineHeight: {
        1: typography.lineHeight.tight,
        2: typography.lineHeight.normal,
        3: typography.lineHeight.relaxed,
      },
      letterSpacing: {
        1: typography.letterSpacing.tight,
        2: typography.letterSpacing.normal,
        3: typography.letterSpacing.wide,
      },
    },
    body: {
      family: typography.fontFamily.sans,
      size: {
        1: typography.fontSize.xs,
        2: typography.fontSize.sm,
        3: typography.fontSize.base,
        4: typography.fontSize.lg,
        5: typography.fontSize.xl,
        6: typography.fontSize['2xl'],
      },
      weight: {
        1: typography.fontWeight.regular,
        4: typography.fontWeight.medium,
        6: typography.fontWeight.semibold,
      },
      lineHeight: {
        1: typography.lineHeight.tight,
        2: typography.lineHeight.normal,
        3: typography.lineHeight.relaxed,
      },
    },
    mono: {
      family: typography.fontFamily.mono,
      size: {
        1: typography.mono.xs.fontSize,
        2: typography.mono.sm.fontSize,
        3: typography.mono.md.fontSize,
        4: typography.mono.lg.fontSize,
      },
      weight: {
        1: typography.fontWeight.regular,
      },
    },
  },
  themes: tamaguiThemes,
  tokens: tamaguiTokens,
  media: {
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: 'none' },
    pointerCoarse: { pointer: 'coarse' },
  },
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type TamaguiConfig = typeof config;

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends TamaguiConfig {}
}

export default config;
