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
    950: '#2E1065',
  },

  // Rose (error/destructive accent)
  rose: {
    50: '#FFF1F2',
    100: '#FFE4E6',
    200: '#FECDD3',
    300: '#FDA4AF',
    400: '#FB7185',
    500: '#F43F5E', // Primary rose
    600: '#E11D48',
    700: '#BE123C',
    800: '#9F1239',
    900: '#881337',
    950: '#4C0519',
  },

  // Emerald (success/growth accent)
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399', // Primary emerald
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
    950: '#022C22',
  },

  // Accent (customizable theme accent)
  accent: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8', // Primary accent
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
    950: '#082F49',
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

  // Heat map colors (for consistency visualization)
  heatMap: {
    none: '#374151', // dark[700] - no activity
    minimal: '#3B82F6', // blue - 1 day
    low: '#10B981', // emerald - 2-3 days
    medium: '#F59E0B', // amber - 4-5 days
    high: '#EF4444', // rose - 6-7 days
  },

  // Gradients (for backgrounds, cards, special effects)
  weaveGradient: {
    primary: {
      colors: ['#A78BFA', '#EC4899'], // violet to pink
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    accent: {
      colors: ['#F59E0B', '#EF4444'], // amber to rose
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
  },

  gradients: {
    sunset: {
      colors: ['#FCA5A5', '#FBBF24'], // rose to amber
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    ocean: {
      colors: ['#60A5FA', '#34D399'], // blue to emerald
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    aurora: {
      colors: ['#A78BFA', '#4ADE80'], // violet to green
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
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

  // Layout tokens (common screen/component padding)
  layout: {
    screenPadding: 16, // spacing[4]
    cardPadding: 12, // spacing[3]
  },

  // Gap tokens (space between elements)
  gap: {
    xs: 4, // spacing[1]
    sm: 8, // spacing[2]
    md: 12, // spacing[3]
    lg: 16, // spacing[4]
    xl: 24, // spacing[6]
  },

  // Inset tokens (internal padding)
  inset: {
    xs: 8, // spacing[2]
    sm: 12, // spacing[3]
    md: 16, // spacing[4]
    lg: 20, // spacing[5]
    xl: 24, // spacing[6]
  },
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

  // Component-specific radius (semantic)
  componentRadius: {
    button: 12, // radius.md
    card: 16, // radius.lg
    input: 8, // radius.base
    modal: 20, // radius.xl
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
// EFFECT TOKENS (35+ tokens)
// =============================================================================

/**
 * Glow effects (colored shadow tints for accent colors)
 * Used for emphasis, AI elements, and interactive states
 */
export const glows = {
  sm: {
    shadowColor: '#3B72F6', // primary[500]
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  md: {
    shadowColor: '#A78BFA', // violet[400]
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  lg: {
    shadowColor: '#EC4899', // pink
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  // Colored glow variants
  primary: {
    shadowColor: '#3B72F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  violet: {
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  amber: {
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  rose: {
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  emerald: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

/**
 * Glass effect presets (blur + opacity)
 * Used for glassmorphism, modals, overlays
 * Requires @react-native-community/blur
 */
export const glass = {
  light: {
    blurAmount: 10,
    blurType: 'light' as const,
    opacity: 0.7,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  medium: {
    blurAmount: 20,
    blurType: 'regular' as const,
    opacity: 0.8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  heavy: {
    blurAmount: 30,
    blurType: 'dark' as const,
    opacity: 0.9,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  // Tinted glass variants
  tinted: {
    primary: {
      blurAmount: 20,
      blurType: 'regular' as const,
      opacity: 0.85,
      backgroundColor: 'rgba(59, 114, 246, 0.1)', // primary[500]
    },
    violet: {
      blurAmount: 20,
      blurType: 'regular' as const,
      opacity: 0.85,
      backgroundColor: 'rgba(167, 139, 250, 0.1)', // violet[400]
    },
    amber: {
      blurAmount: 20,
      blurType: 'regular' as const,
      opacity: 0.85,
      backgroundColor: 'rgba(251, 191, 36, 0.1)', // amber[400]
    },
  },
} as const;

/**
 * Blur radius values
 * Used for backdrop filters, glass effects, depth
 */
export const blur = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 40,
  '3xl': 64,
} as const;

/**
 * Opacity scale (0-100 in 10% increments)
 * Used for overlays, disabled states, transparency
 */
export const opacity = {
  0: 0,
  5: 0.05,
  10: 0.1,
  20: 0.2,
  30: 0.3,
  40: 0.4,
  50: 0.5,
  60: 0.6,
  70: 0.7,
  80: 0.8,
  90: 0.9,
  95: 0.95,
  100: 1,
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
    stiff: {
      damping: 25,
      stiffness: 400,
    },
  },

  // Motion presets (common animations with timing/spring configs)
  motionPresets: {
    // Fade animations
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
      duration: 250,
      easing: [0, 0, 0.2, 1], // easeOut
    },
    fadeOut: {
      from: { opacity: 1 },
      to: { opacity: 0 },
      duration: 200,
      easing: [0.4, 0, 1, 1], // easeIn
    },

    // Slide animations
    slideUp: {
      from: { transform: [{ translateY: 20 }], opacity: 0 },
      to: { transform: [{ translateY: 0 }], opacity: 1 },
      duration: 300,
      easing: [0, 0, 0.2, 1], // easeOut
    },
    slideDown: {
      from: { transform: [{ translateY: -20 }], opacity: 0 },
      to: { transform: [{ translateY: 0 }], opacity: 1 },
      duration: 300,
      easing: [0, 0, 0.2, 1], // easeOut
    },
    slideLeft: {
      from: { transform: [{ translateX: 20 }], opacity: 0 },
      to: { transform: [{ translateX: 0 }], opacity: 1 },
      duration: 300,
      easing: [0, 0, 0.2, 1], // easeOut
    },
    slideRight: {
      from: { transform: [{ translateX: -20 }], opacity: 0 },
      to: { transform: [{ translateX: 0 }], opacity: 1 },
      duration: 300,
      easing: [0, 0, 0.2, 1], // easeOut
    },

    // Scale animations
    scale: {
      from: { transform: [{ scale: 0.95 }], opacity: 0 },
      to: { transform: [{ scale: 1 }], opacity: 1 },
      duration: 200,
      easing: [0, 0, 0.2, 1], // easeOut
    },
    scaleIn: {
      from: { transform: [{ scale: 0.9 }] },
      to: { transform: [{ scale: 1 }] },
      spring: {
        damping: 15,
        stiffness: 250,
      },
    },
    scaleOut: {
      from: { transform: [{ scale: 1 }] },
      to: { transform: [{ scale: 0.95 }] },
      duration: 150,
      easing: [0.4, 0, 1, 1], // easeIn
    },

    // Press/interaction animations
    pressIn: {
      to: { transform: [{ scale: 0.97 }] },
      duration: 100,
      easing: [0, 0, 0.2, 1], // easeOut
    },
    pressOut: {
      to: { transform: [{ scale: 1 }] },
      spring: {
        damping: 15,
        stiffness: 250,
      },
    },

    // Rotate animations
    rotate: {
      from: { transform: [{ rotate: '0deg' }] },
      to: { transform: [{ rotate: '360deg' }] },
      duration: 500,
      easing: [0, 0, 1, 1], // linear
    },
    rotateIn: {
      from: { transform: [{ rotate: '-10deg' }], opacity: 0 },
      to: { transform: [{ rotate: '0deg' }], opacity: 1 },
      duration: 300,
      easing: [0, 0, 0.2, 1], // easeOut
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
  glows,
  glass,
  blur,
  opacity,
  animations,
} as const;

export type Tokens = typeof tokens;
