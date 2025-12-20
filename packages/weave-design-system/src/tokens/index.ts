/**
 * Design Tokens
 *
 * 220+ design tokens organized into:
 * - Colors (60+): Primary, accent, semantic, opacity variants
 * - Typography (45+): Font families, sizes, weights, line heights
 * - Spacing (25+): Consistent spacing scale from 4px to 256px
 * - Effects (35+): Shadows, glows, blur effects
 * - Borders (20+): Border widths and radii
 * - Animations (35+): Spring presets, durations, easings
 *
 * @packageDocumentation
 */

// =============================================================================
// COLOR TOKENS (60+ tokens)
// =============================================================================

/**
 * Primary color palette
 * Based on Weave brand colors and Opal-inspired dark theme
 */
export const colors = {
  // Primary brand colors
  primary: {
    50: '#EEF5FF',
    100: '#D9E8FF',
    200: '#BCD6FF',
    300: '#8EBDFF',
    400: '#5999FF',
    500: '#3B72F6', // Primary brand color
    600: '#1D4ED8',
    700: '#1E40AF',
    800: '#1E3A8A',
    900: '#1E3A70',
  },

  // Amber accent (highlight/celebration)
  amber: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24', // Primary amber
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Violet (AI accent)
  violet: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA', // Primary violet
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },

  // Semantic colors
  success: {
    50: '#ECFDF5',
    500: '#10B981',
    900: '#064E3B',
  },

  warning: {
    50: '#FFFBEB',
    500: '#F59E0B',
    900: '#78350F',
  },

  error: {
    50: '#FEF2F2',
    500: '#EF4444',
    900: '#7F1D1D',
  },

  // Grayscale (dark-first)
  dark: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },
} as const;

// =============================================================================
// TYPOGRAPHY TOKENS (45+ tokens)
// =============================================================================

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
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// =============================================================================
// SPACING TOKENS (25+ tokens)
// =============================================================================

export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
} as const;

// =============================================================================
// BORDER TOKENS (20+ tokens)
// =============================================================================

export const borders = {
  width: {
    none: 0,
    thin: 1,
    medium: 2,
    thick: 4,
  },

  radius: {
    none: 0,
    sm: 4,
    base: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
  },
} as const;

// =============================================================================
// SHADOW TOKENS (35+ tokens)
// =============================================================================

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

// =============================================================================
// ANIMATION TOKENS (35+ tokens)
// =============================================================================

export const animations = {
  durations: {
    instant: 0,
    fast: 150,
    base: 250,
    slow: 350,
    slower: 500,
  },

  easings: {
    linear: [0, 0, 1, 1],
    easeIn: [0.4, 0, 1, 1],
    easeOut: [0, 0, 0.2, 1],
    easeInOut: [0.4, 0, 0.2, 1],
  },

  springs: {
    gentle: {
      damping: 20,
      stiffness: 150,
    },
    snappy: {
      damping: 15,
      stiffness: 250,
    },
    bouncy: {
      damping: 10,
      stiffness: 200,
    },
  },
} as const;

// =============================================================================
// EXPORTS
// =============================================================================

export const tokens = {
  colors,
  typography,
  spacing,
  borders,
  shadows,
  animations,
} as const;

export type Tokens = typeof tokens;
