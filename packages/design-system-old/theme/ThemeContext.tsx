/**
 * Weave Design System - Theme Context
 *
 * Provides theme values throughout the app
 * Supports dark mode (default) with light mode option for future
 *
 * Usage:
 * const { colors, spacing } = useTheme();
 */

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { tokens, Tokens } from '../tokens';
import {
  colors,
  background,
  text,
  border,
  semantic,
  gradients,
  light,
} from '../tokens/colors';

// =============================================================================
// TYPES
// =============================================================================

export type ThemeMode = 'dark' | 'light' | 'system';

export interface ThemeColors {
  // Backgrounds
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
    subtle: string;
    muted: string;
    overlay: string;
    glass: string;
    glassBorder: string;
  };
  // Text
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
  // Borders
  border: {
    subtle: string;
    muted: string;
    base: string;
    emphasis: string;
    focus: string;
    error: string;
    success: string;
    glass: string;
  };
  // Semantic
  semantic: typeof semantic;
  // Gradients
  gradients: typeof gradients;
  // Raw palettes
  accent: typeof colors.accent;
  violet: typeof colors.violet;
  amber: typeof colors.amber;
  emerald: typeof colors.emerald;
  rose: typeof colors.rose;
  dark: typeof colors.dark;
}

export interface Theme extends Omit<Tokens, 'colors'> {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
}

export interface ThemeContextValue {
  theme: Theme;
  setMode: (mode: ThemeMode) => void;
}

// =============================================================================
// DEFAULT VALUES
// =============================================================================

const darkThemeColors: ThemeColors = {
  background: {
    primary: background.primary,
    secondary: background.secondary,
    tertiary: background.tertiary,
    elevated: background.elevated,
    subtle: background.subtle,
    muted: background.muted,
    overlay: background.overlay,
    glass: background.glass,
    glassBorder: background.glassBorder,
  },
  text: {
    primary: text.primary,
    secondary: text.secondary,
    tertiary: text.tertiary,
    muted: text.muted,
    placeholder: text.placeholder,
    disabled: text.disabled,
    inverse: text.inverse,
    link: text.link,
    accent: text.accent,
    ai: text.ai,
    success: text.success,
    warning: text.warning,
    error: text.error,
  },
  border: {
    subtle: border.subtle,
    muted: border.muted,
    base: border.base,
    emphasis: border.emphasis,
    focus: border.focus,
    error: border.error,
    success: border.success,
    glass: border.glass,
  },
  semantic,
  gradients,
  accent: colors.accent,
  violet: colors.violet,
  amber: colors.amber,
  emerald: colors.emerald,
  rose: colors.rose,
  dark: colors.dark,
};

const lightThemeColors: ThemeColors = {
  background: {
    primary: light.background.primary,
    secondary: light.background.secondary,
    tertiary: light.background.tertiary,
    elevated: light.background.elevated,
    subtle: '#F0F0F0',
    muted: '#E5E5E5',
    overlay: 'rgba(0, 0, 0, 0.5)',
    glass: 'rgba(255, 255, 255, 0.85)',
    glassBorder: 'rgba(0, 0, 0, 0.08)',
  },
  text: {
    primary: light.text.primary,
    secondary: light.text.secondary,
    tertiary: light.text.tertiary,
    muted: light.text.muted,
    placeholder: colors.dark[500],
    disabled: colors.dark[400],
    inverse: colors.dark[50],
    link: colors.accent[600],
    accent: colors.accent[600],
    ai: colors.violet[600],
    success: colors.emerald[600],
    warning: colors.amber[600],
    error: colors.rose[600],
  },
  border: {
    subtle: light.border.subtle,
    muted: light.border.muted,
    base: light.border.base,
    emphasis: colors.dark[500],
    focus: colors.accent[500],
    error: colors.rose[500],
    success: colors.emerald[500],
    glass: 'rgba(0, 0, 0, 0.08)',
  },
  semantic,
  gradients,
  accent: colors.accent,
  violet: colors.violet,
  amber: colors.amber,
  emerald: colors.emerald,
  rose: colors.rose,
  dark: colors.dark,
};

// =============================================================================
// CONTEXT
// =============================================================================

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// =============================================================================
// PROVIDER
// =============================================================================

interface ThemeProviderProps {
  children: ReactNode;
  initialMode?: ThemeMode;
}

export function ThemeProvider({
  children,
  initialMode = 'dark', // Default to dark mode for Weave
}: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = React.useState<ThemeMode>(initialMode);

  const theme = useMemo<Theme>(() => {
    // Determine if we should use dark mode
    const isDark =
      mode === 'dark' ||
      (mode === 'system' && systemColorScheme !== 'light');

    const themeColors = isDark ? darkThemeColors : lightThemeColors;

    return {
      mode,
      isDark,
      colors: themeColors,
      typography: tokens.typography,
      spacing: tokens.spacing,
      layout: tokens.layout,
      gap: tokens.gap,
      inset: tokens.inset,
      effects: tokens.effects,
      shadows: tokens.shadows,
      glows: tokens.glows,
      glass: tokens.glass,
      blur: tokens.blur,
      opacity: tokens.opacity,
      borders: tokens.borders,
      radius: tokens.radius,
      componentRadius: tokens.componentRadius,
      borderWidth: tokens.borderWidth,
      animations: tokens.animations,
      durations: tokens.durations,
      timing: tokens.timing,
      easings: tokens.easings,
      motion: tokens.motion,
      springs: tokens.springs,
    };
  }, [mode, systemColorScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setMode }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

export function useTheme(): Theme {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    // Return default dark theme if used outside provider (for convenience)
    return {
      mode: 'dark',
      isDark: true,
      colors: darkThemeColors,
      typography: tokens.typography,
      spacing: tokens.spacing,
      layout: tokens.layout,
      gap: tokens.gap,
      inset: tokens.inset,
      effects: tokens.effects,
      shadows: tokens.shadows,
      glows: tokens.glows,
      glass: tokens.glass,
      blur: tokens.blur,
      opacity: tokens.opacity,
      borders: tokens.borders,
      radius: tokens.radius,
      componentRadius: tokens.componentRadius,
      borderWidth: tokens.borderWidth,
      animations: tokens.animations,
      durations: tokens.durations,
      timing: tokens.timing,
      easings: tokens.easings,
      motion: tokens.motion,
      springs: tokens.springs,
    };
  }

  return context.theme;
}

export function useThemeMode(): [ThemeMode, (mode: ThemeMode) => void] {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }

  return [context.theme.mode, context.setMode];
}

// =============================================================================
// CONVENIENCE HOOKS
// =============================================================================

export function useColors(): ThemeColors {
  return useTheme().colors;
}

export function useSpacing() {
  return useTheme().spacing;
}

export function useTypography() {
  return useTheme().typography;
}

export function useLayout() {
  return useTheme().layout;
}

export function useShadows() {
  return useTheme().shadows;
}

export function useRadius() {
  return useTheme().radius;
}

export function useAnimations() {
  return useTheme().animations;
}
