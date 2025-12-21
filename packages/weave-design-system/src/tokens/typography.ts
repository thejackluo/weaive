/**
 * Typography Tokens (45+ tokens)
 *
 * Font families, sizes, weights, line heights, and preset scales.
 *
 * @packageDocumentation
 */

export const typography = {
  fontFamily: {
    sans: 'System',
    mono: 'Menlo',
  },

  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
    '7xl': 72,
  },

  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    black: '900' as const,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },

  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },

  // Display scale (large headings)
  display: {
    xs: { fontSize: 36, fontWeight: '700' as const, lineHeight: 1.2 },
    sm: { fontSize: 48, fontWeight: '700' as const, lineHeight: 1.2 },
    md: { fontSize: 60, fontWeight: '700' as const, lineHeight: 1.1 },
    lg: { fontSize: 72, fontWeight: '800' as const, lineHeight: 1.1 },
    xl: { fontSize: 96, fontWeight: '800' as const, lineHeight: 1.0 },
    '2xl': { fontSize: 120, fontWeight: '900' as const, lineHeight: 1.0 },
    '3xl': { fontSize: 144, fontWeight: '900' as const, lineHeight: 1.0 },
  },

  // Label scale (UI labels, buttons, badges)
  label: {
    xs: { fontSize: 10, fontWeight: '500' as const, lineHeight: 1.4 },
    sm: { fontSize: 12, fontWeight: '500' as const, lineHeight: 1.4 },
    md: { fontSize: 14, fontWeight: '500' as const, lineHeight: 1.4 },
    lg: { fontSize: 16, fontWeight: '600' as const, lineHeight: 1.4 },
    xl: { fontSize: 18, fontWeight: '600' as const, lineHeight: 1.4 },
  },

  // Mono scale (code, data, metrics)
  mono: {
    xs: { fontSize: 11, fontWeight: '400' as const, fontFamily: 'Menlo' },
    sm: { fontSize: 13, fontWeight: '400' as const, fontFamily: 'Menlo' },
    md: { fontSize: 15, fontWeight: '400' as const, fontFamily: 'Menlo' },
    lg: { fontSize: 17, fontWeight: '400' as const, fontFamily: 'Menlo' },
  },
} as const;
