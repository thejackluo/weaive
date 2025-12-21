/**
 * Effect Tokens (35+ tokens)
 *
 * Shadows, glows, glass effects, blur, and opacity scale.
 *
 * @packageDocumentation
 */

/**
 * Shadow presets (elevation scale)
 */
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
