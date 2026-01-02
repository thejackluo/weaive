/**
 * Color Design Tokens - Minimal Black/White/Gray
 *
 * MVP aesthetic: Stoic-inspired minimalism
 * - Black, white, and shades of gray for all UI elements
 * - Green: positive indicators (completion, increases)
 * - Red: negative indicators (incomplete, decreases, action required)
 */

export const colors = {
  // ============================================================================
  // Background Colors (Black/White/Gray)
  // ============================================================================
  background: {
    primary: '#000000', // Pure black background
    secondary: '#1A1A1A', // Card backgrounds (dark gray)
    elevated: '#2A2A2A', // Elevated cards, modals
    subtle: '#0F0F0F', // Very subtle variation
    white: '#FFFFFF', // White backgrounds (for inverse cards)
  },

  // ============================================================================
  // Text Colors (White/Gray)
  // ============================================================================
  text: {
    primary: '#FFFFFF', // High emphasis - Pure white
    secondary: '#E5E5E5', // Normal body text - Light gray
    muted: '#A3A3A3', // De-emphasized text - Medium gray
    disabled: '#525252', // Disabled state - Dark gray
    inverse: '#000000', // Text on white backgrounds
  },

  // ============================================================================
  // Border Colors
  // ============================================================================
  border: {
    subtle: 'rgba(255, 255, 255, 0.06)', // Very subtle borders
    muted: 'rgba(255, 255, 255, 0.1)', // Default borders
    strong: 'rgba(255, 255, 255, 0.2)', // Prominent borders
  },

  // ============================================================================
  // Semantic Colors - Green (Positive) & Red (Negative) ONLY
  // ============================================================================
  semantic: {
    // Green - Positive indicators (vibrant emerald-forest green)
    success: {
      base: '#059669', // Vibrant emerald-forest green (completion, increase)
      light: '#10B981', // Lighter vibrant emerald
      dark: '#047857', // Darker emerald-forest
      bg: 'rgba(5, 150, 105, 0.15)', // Emerald background tint
      border: 'rgba(5, 150, 105, 0.4)', // Emerald border
      // Gradient stops for visual interest
      gradientStart: '#10B981', // Lighter emerald (top/start)
      gradientEnd: '#047857', // Darker emerald (bottom/end)
    },
    // Red - Negative indicators
    error: {
      base: '#EF4444', // Standard red (incomplete, decrease, action required)
      light: '#F87171', // Lighter red
      dark: '#DC2626', // Darker red
      bg: 'rgba(239, 68, 68, 0.1)', // Red background tint
      border: 'rgba(239, 68, 68, 0.3)', // Red border
    },
  },

  // ============================================================================
  // Green Palette - For Consistency Graph (vibrant emerald-forest shades)
  // ============================================================================
  green: {
    50: '#ECFDF5', // Lightest emerald tint
    100: '#D1FAE5', // Very light emerald
    200: '#A7F3D0', // Light emerald
    300: '#6EE7B7', // Medium-light emerald
    400: '#34D399', // Medium vibrant emerald
    500: '#059669', // Base vibrant emerald-forest
    600: '#047857', // Dark emerald-forest
    700: '#065F46', // Darker emerald-forest
    800: '#064E3B', // Very dark emerald-forest
    900: '#022C22', // Darkest emerald-forest
  },

  // ============================================================================
  // Red Palette - For Negative Indicators
  // ============================================================================
  red: {
    50: '#FEF2F2', // Lightest red
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // Base red
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D', // Darkest red
  },

  // ============================================================================
  // Neutral Grays (Full spectrum)
  // ============================================================================
  neutral: {
    0: '#FFFFFF', // Pure white
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
    1000: '#000000', // Pure black
  },

  // ============================================================================
  // Legacy/Deprecated (kept for backwards compatibility, map to gray)
  // ============================================================================
  // These are kept to prevent breaking existing code, but should map to grayscale
  accent: {
    50: '#F5F5F5',
    100: '#E5E5E5',
    200: '#D4D4D4',
    300: '#A3A3A3',
    400: '#737373',
    500: '#FFFFFF', // Map accent[500] to white (for buttons)
    600: '#E5E5E5',
    700: '#D4D4D4',
    800: '#A3A3A3',
    900: '#737373',
    950: '#525252',
  },

  // Map violet/amber/emerald/rose to grayscale for backwards compatibility
  violet: {
    50: '#F5F5F5',
    100: '#E5E5E5',
    200: '#D4D4D4',
    300: '#A3A3A3',
    400: '#737373',
    500: '#525252',
    600: '#404040',
    700: '#262626',
    800: '#171717',
    900: '#0A0A0A',
  },

  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#059669', // Vibrant emerald-forest for semantic usage
    600: '#047857',
    700: '#065F46',
    800: '#064E3B',
    900: '#022C22',
  },

  rose: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // Keep red for semantic usage
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  amber: {
    50: '#F5F5F5',
    100: '#E5E5E5',
    200: '#D4D4D4',
    300: '#A3A3A3',
    400: '#737373',
    500: '#525252',
    600: '#404040',
    700: '#262626',
    800: '#171717',
    900: '#0A0A0A',
  },

  // Keep dark/light palettes for theme switching
  dark: {
    100: '#FFFFFF',
    200: '#F5F5F5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#2A2A2A',
    800: '#1A1A1A',
    850: '#0F0F0F',
    900: '#000000',
  },

  light: {
    100: '#000000',
    200: '#171717',
    300: '#262626',
    400: '#404040',
    500: '#737373',
    600: '#A3A3A3',
    700: '#D4D4D4',
    800: '#E5E5E5',
    850: '#F5F5F5',
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
