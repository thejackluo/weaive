/**
 * Color Design Tokens - Dark-First, Opal-Inspired
 *
 * Based on the Weave brand color palette with semantic color system
 * Optimized for dark mode with light mode support
 */

export const colors = {
  // ============================================================================
  // Background Colors (Dark-First) - LIGHTER for better text contrast
  // ============================================================================
  background: {
    primary: '#09090B', // Main app background - Deep black
    secondary: '#18181B', // Card backgrounds - Much lighter for text visibility
    elevated: '#27272A', // Floating elements, modals - Lighter
    glass: 'rgba(39, 39, 42, 0.85)', // Glass effect - Lighter with more opacity
    overlay: 'rgba(9, 9, 11, 0.8)', // Modal overlays
  },

  // ============================================================================
  // Text Colors - MAXIMUM BRIGHTNESS for readability
  // ============================================================================
  text: {
    primary: '#FFFFFF', // High emphasis - Pure white for maximum contrast
    secondary: '#F5F5F5', // Normal body text - Near white, very bright
    muted: '#D4D4D4', // De-emphasized text - Bright gray, still very readable
    disabled: '#737373', // Disabled state - Medium gray
    ai: '#C4B5FD', // AI-generated content - Much brighter violet
    success: '#6EE7B7', // Success messages - Much brighter emerald
    error: '#FDA4AF', // Error messages - Much brighter rose
    warning: '#FCD34D', // Warning messages - Much brighter amber
    inverse: '#09090B', // Text on light backgrounds
  },

  // ============================================================================
  // Border Colors
  // ============================================================================
  border: {
    subtle: 'rgba(255, 255, 255, 0.05)', // Very subtle borders
    muted: 'rgba(255, 255, 255, 0.1)', // Default borders
    focus: 'rgba(91, 141, 239, 0.4)', // Focus states
    glass: 'rgba(255, 255, 255, 0.15)', // Glass effect borders
    error: 'rgba(232, 90, 126, 0.5)', // Error state borders
  },

  // ============================================================================
  // Accent Colors (Full Palettes)
  // ============================================================================
  // Primary Blue (Action, Interactive Elements)
  accent: {
    50: '#EEF4FF',
    100: '#D9E5FF',
    200: '#BCD4FF',
    300: '#8EBAFF',
    400: '#5994FF',
    500: '#5B8DEF', // Base - Primary action color
    600: '#2858E8',
    700: '#1E44D5',
    800: '#1F38AC',
    900: '#1E3388',
    950: '#172154',
  },

  // Soft Violet (AI, Dream Self, Magic)
  violet: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#9D71E8', // Base - AI theme color
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },

  // Warm Amber (Celebration, Progress, Warmth)
  amber: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F5A623', // Base - Celebration color
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Emerald (Success, Growth, Achievement)
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10D87E', // Base - Success color
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // Rose (Errors, Destructive Actions)
  rose: {
    50: '#FFF1F2',
    100: '#FFE4E6',
    200: '#FECDD3',
    300: '#FDA4AF',
    400: '#FB7185',
    500: '#E85A7E', // Base - Error color
    600: '#E11D48',
    700: '#BE123C',
    800: '#9F1239',
    900: '#881337',
  },

  // ============================================================================
  // Semantic Colors (For Quick Access)
  // ============================================================================
  semantic: {
    success: {
      base: '#10D87E',
      light: '#34D399',
      dark: '#059669',
      bg: 'rgba(16, 216, 126, 0.1)',
      border: 'rgba(16, 216, 126, 0.3)',
    },
    warning: {
      base: '#F5A623',
      light: '#FBBF24',
      dark: '#D97706',
      bg: 'rgba(245, 166, 35, 0.1)',
      border: 'rgba(245, 166, 35, 0.3)',
    },
    error: {
      base: '#E85A7E',
      light: '#FB7185',
      dark: '#BE123C',
      bg: 'rgba(232, 90, 126, 0.1)',
      border: 'rgba(232, 90, 126, 0.3)',
    },
    info: {
      base: '#5B8DEF',
      light: '#8EBAFF',
      dark: '#2858E8',
      bg: 'rgba(91, 141, 239, 0.1)',
      border: 'rgba(91, 141, 239, 0.3)',
    },
    ai: {
      base: '#9D71E8',
      light: '#A78BFA',
      dark: '#6D28D9',
      bg: 'rgba(157, 113, 232, 0.1)',
      border: 'rgba(157, 113, 232, 0.3)',
    },
  },

  // ============================================================================
  // Neutral Grays (For Subtle UI Elements)
  // ============================================================================
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0A0A0A',
  },

  // ============================================================================
  // Dark Theme Palette (Reference - maps to above)
  // ============================================================================
  dark: {
    100: '#FFFFFF', // → text.primary
    200: '#F5F5F5', // → text.secondary
    300: '#D4D4D4', // → text.muted
    400: '#A3A3A3',
    500: '#737373', // → text.disabled
    600: '#525252',
    700: '#27272A', // → background.elevated
    800: '#18181B', // → background.secondary
    850: '#0F0F12',
    900: '#09090B', // → background.primary
  },

  // ============================================================================
  // Light Theme Palette (For Future Light Mode)
  // ============================================================================
  light: {
    100: '#09090B', // → text on light bg
    200: '#27272A',
    300: '#3F3F46',
    400: '#71717F',
    500: '#A1A1AA',
    600: '#D4D4DC',
    700: '#ECECF1',
    800: '#F5F5F7',
    850: '#FAFAFA',
    900: '#FFFFFF',
  },
} as const;

// ============================================================================
// Type Exports
// ============================================================================
export type ColorToken = typeof colors;
export type BackgroundColor = keyof typeof colors.background;
export type TextColor = keyof typeof colors.text;
export type BorderColor = keyof typeof colors.border;
export type SemanticColor = keyof typeof colors.semantic;
