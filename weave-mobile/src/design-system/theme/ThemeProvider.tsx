/**
 * Theme Provider - Context-based theme system
 *
 * Provides theme tokens to all child components via React Context
 * Supports dark/light/system modes (currently dark-first)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Theme, ThemeMode, ThemeContextValue } from './types';
import { colors } from '../tokens/colors';
import { typography } from '../tokens/typography';
import { spacing, layout } from '../tokens/spacing';
import { radius } from '../tokens/radius';
import { shadows, glass, gradients } from '../tokens/effects';
import { springs, durations, easings } from '../tokens/animations';

// ============================================================================
// Theme Context
// ============================================================================
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ============================================================================
// Default Theme (Dark-First)
// ============================================================================
const createTheme = (mode: ThemeMode, systemColorScheme?: 'light' | 'dark'): Theme => {
  // Determine actual mode (resolve 'system')
  const resolvedMode = mode === 'system' ? (systemColorScheme || 'dark') : mode;

  // Currently, we only support dark mode
  // TODO: Implement light mode colors when needed
  return {
    mode: resolvedMode,
    colors,
    typography,
    spacing,
    layout,
    radius,
    shadows,
    glass,
    gradients,
    springs,
    durations,
    easings,
  };
};

// ============================================================================
// Theme Provider Component
// ============================================================================
export interface ThemeProviderProps {
  children: ReactNode;
  initialMode?: ThemeMode;
}

export function ThemeProvider({ children, initialMode = 'dark' }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const [theme, setTheme] = useState<Theme>(() => createTheme(mode, systemColorScheme || undefined));

  // Update theme when mode or system color scheme changes
  useEffect(() => {
    setTheme(createTheme(mode, systemColorScheme || undefined));
  }, [mode, systemColorScheme]);

  const value: ThemeContextValue = {
    ...theme,
    setMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ============================================================================
// useTheme Hook
// ============================================================================
/**
 * Access the full theme object
 *
 * @example
 * const { colors, spacing, typography } = useTheme();
 * const buttonStyle = {
 *   backgroundColor: colors.accent[500],
 *   padding: spacing[4],
 *   fontSize: typography.textBase.fontSize,
 * };
 */
export function useTheme(): Theme & { setMode: (mode: ThemeMode) => void } {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// ============================================================================
// useThemeMode Hook
// ============================================================================
/**
 * Get and set the current theme mode
 *
 * @example
 * const [mode, setMode] = useThemeMode();
 * <Button onPress={() => setMode('light')}>Switch to Light</Button>
 */
export function useThemeMode(): [ThemeMode, (mode: ThemeMode) => void] {
  const { mode, setMode } = useTheme();
  return [mode, setMode];
}
