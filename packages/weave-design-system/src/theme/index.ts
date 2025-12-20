/**
 * Theme System
 *
 * Tamagui-inspired theme system with:
 * - Runtime dark/light theme switching
 * - Nested theme contexts
 * - Color-matched shadows
 * - Automatic accessible contrast
 *
 * @packageDocumentation
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { colors, typography, spacing, borders, shadows, animations } from '../tokens';

// =============================================================================
// TYPES
// =============================================================================

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  colors: {
    // Backgrounds
    bg: {
      primary: string;
      secondary: string;
      tertiary: string;
      overlay: string;
      glass: string;
    };
    // Text colors
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      muted: string;
      placeholder: string;
      disabled: string;
      inverse: string;
      link: string;
      accent: string;
      ai: string;
      success: string;
      warning: string;
      error: string;
    };
    // Border colors
    border: {
      default: string;
      muted: string;
      accent: string;
      error: string;
    };
    // Accent colors
    accent: {
      primary: string;
      amber: string;
      violet: string;
    };
  };
  typography: typeof typography;
  spacing: typeof spacing;
  borders: typeof borders;
  shadows: typeof shadows;
  animations: typeof animations;
}

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
}

// =============================================================================
// DARK THEME (Default)
// =============================================================================

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    bg: {
      primary: colors.dark[950],
      secondary: colors.dark[900],
      tertiary: colors.dark[800],
      overlay: 'rgba(0, 0, 0, 0.8)',
      glass: 'rgba(17, 24, 39, 0.6)',
    },
    text: {
      primary: colors.dark[50],
      secondary: colors.dark[200],
      tertiary: colors.dark[400],
      muted: colors.dark[500],
      placeholder: colors.dark[600],
      disabled: colors.dark[700],
      inverse: colors.dark[900],
      link: colors.primary[400],
      accent: colors.primary[500],
      ai: colors.violet[400],
      success: colors.success[500],
      warning: colors.warning[500],
      error: colors.error[500],
    },
    border: {
      default: colors.dark[800],
      muted: colors.dark[900],
      accent: colors.primary[500],
      error: colors.error[500],
    },
    accent: {
      primary: colors.primary[500],
      amber: colors.amber[400],
      violet: colors.violet[400],
    },
  },
  typography,
  spacing,
  borders,
  shadows,
  animations,
};

// =============================================================================
// LIGHT THEME
// =============================================================================

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    bg: {
      primary: colors.dark[50],
      secondary: colors.dark[100],
      tertiary: colors.dark[200],
      overlay: 'rgba(0, 0, 0, 0.5)',
      glass: 'rgba(249, 250, 251, 0.8)',
    },
    text: {
      primary: colors.dark[900],
      secondary: colors.dark[700],
      tertiary: colors.dark[600],
      muted: colors.dark[500],
      placeholder: colors.dark[400],
      disabled: colors.dark[300],
      inverse: colors.dark[50],
      link: colors.primary[600],
      accent: colors.primary[600],
      ai: colors.violet[600],
      success: colors.success[500],
      warning: colors.warning[500],
      error: colors.error[500],
    },
    border: {
      default: colors.dark[200],
      muted: colors.dark[100],
      accent: colors.primary[500],
      error: colors.error[500],
    },
    accent: {
      primary: colors.primary[600],
      amber: colors.amber[500],
      violet: colors.violet[600],
    },
  },
  typography,
  spacing,
  borders,
  shadows,
  animations,
};

// =============================================================================
// CONTEXT
// =============================================================================

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// =============================================================================
// PROVIDER
// =============================================================================

export interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeMode;
  theme?: Theme;
}

export function ThemeProvider({
  children,
  initialTheme = 'dark',
  theme: customTheme,
}: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(initialTheme);

  const theme = customTheme || (mode === 'dark' ? darkTheme : lightTheme);

  const value: ThemeContextValue = {
    theme,
    mode,
    setTheme: setMode,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Access the current theme
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { colors, spacing } = useTheme();
 *
 *   return <View style={{ backgroundColor: colors.bg.primary }} />;
 * }
 * ```
 */
export function useTheme(): Theme & { mode: ThemeMode; setTheme: (mode: ThemeMode) => void } {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return {
    ...context.theme,
    mode: context.mode,
    setTheme: context.setTheme,
  };
}

/**
 * Create a custom theme by merging with base theme
 *
 * @example
 * ```tsx
 * const customTheme = createTheme({
 *   colors: {
 *     accent: {
 *       primary: '#FF6B6B',
 *     },
 *   },
 * });
 * ```
 */
export function createTheme(overrides: Partial<Theme>): Theme {
  return {
    ...darkTheme,
    ...overrides,
    colors: {
      ...darkTheme.colors,
      ...overrides.colors,
    },
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export { colors, typography, spacing, borders, shadows, animations };
