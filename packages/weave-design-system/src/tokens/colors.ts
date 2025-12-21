/**
 * Color Tokens (60+ tokens)
 *
 * Primary, accent, semantic colors and gradients.
 * Based on Weave brand colors and Opal-inspired dark theme.
 *
 * @packageDocumentation
 */

/**
 * Primary color palette
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
