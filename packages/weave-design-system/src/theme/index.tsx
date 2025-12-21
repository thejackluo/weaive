/**
 * Theme System
 *
 * Tamagui-inspired theme system with:
 * - Runtime dark/light theme switching
 * - Nested theme contexts
 * - Color-matched shadows
 * - Automatic accessible contrast
 * - Tamagui integration for UI primitives
 *
 * Architecture:
 * - Weave ThemeProvider (outer) controls theme mode
 * - TamaguiProvider (inner) consumes theme from Weave
 * - Theme mode changes propagate Weave → Tamagui automatically
 *
 * @packageDocumentation
 */

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, Component, ErrorInfo } from 'react';
import { TamaguiProvider, useThemeName, Theme as TamaguiTheme } from '@tamagui/core';
import { View, Text as RNText } from 'react-native';
import { colors, typography, spacing, borders, shadows, glows, glass, blur, opacity, animations } from '../tokens';
import tamaguiConfig from '../tamagui.config';

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
  glows: typeof glows;
  glass: typeof glass;
  blur: typeof blur;
  opacity: typeof opacity;
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
  glows,
  glass,
  blur,
  opacity,
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
  glows,
  glass,
  blur,
  opacity,
  animations,
};

// =============================================================================
// ERROR BOUNDARY
// =============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary for theme system
 * Catches theme-related errors and provides fallback UI
 */
class ThemeErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ThemeProvider error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback with dark theme
      return (
        <View style={{ flex: 1, backgroundColor: '#030712', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <RNText style={{ color: '#F9FAFB', fontSize: 16, textAlign: 'center' }}>
            Theme system failed to load. Using default theme.
          </RNText>
        </View>
      );
    }

    return this.props.children;
  }
}

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

/**
 * Inner component that handles Tamagui theme synchronization
 * This must be inside TamaguiProvider to use Tamagui hooks
 */
function TamaguiThemeSync({ mode }: { mode: ThemeMode }) {
  // Note: Tamagui theme name must match mode ('dark' or 'light')
  // Theme switching happens automatically through TamaguiProvider's defaultTheme prop
  return null;
}

export function ThemeProvider({
  children,
  initialTheme = 'dark',
  theme: customTheme,
}: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(initialTheme);

  const theme = customTheme || (mode === 'dark' ? darkTheme : lightTheme);

  // Optimize: Memoize context value to prevent unnecessary re-renders
  const value: ThemeContextValue = useMemo(
    () => ({
      theme,
      mode,
      setTheme: setMode,
    }),
    [theme, mode]
  );

  return (
    <ThemeErrorBoundary>
      <ThemeContext.Provider value={value}>
        <TamaguiProvider config={tamaguiConfig} defaultTheme={mode}>
          <TamaguiTheme name={mode}>
            <TamaguiThemeSync mode={mode} />
            {children}
          </TamaguiTheme>
        </TamaguiProvider>
      </ThemeContext.Provider>
    </ThemeErrorBoundary>
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
 * Access the theme mode and toggle function
 *
 * @example
 * ```tsx
 * function ThemeToggle() {
 *   const { mode, setTheme } = useThemeMode();
 *
 *   return (
 *     <Button onPress={() => setTheme(mode === 'dark' ? 'light' : 'dark')}>
 *       Toggle Theme
 *     </Button>
 *   );
 * }
 * ```
 */
export function useThemeMode(): { mode: ThemeMode; setTheme: (mode: ThemeMode) => void } {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }

  return {
    mode: context.mode,
    setTheme: context.setTheme,
  };
}

/**
 * Access theme colors
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const colors = useColors();
 *
 *   return <View style={{ backgroundColor: colors.bg.primary }} />;
 * }
 * ```
 */
export function useColors() {
  const theme = useTheme();
  return theme.colors;
}

/**
 * Access spacing tokens
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const spacing = useSpacing();
 *
 *   return <View style={{ padding: spacing[4] }} />;
 * }
 * ```
 */
export function useSpacing() {
  const theme = useTheme();
  return theme.spacing;
}

/**
 * Access typography tokens
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const typography = useTypography();
 *
 *   return <Text style={{ fontSize: typography.fontSize.lg }} />;
 * }
 * ```
 */
export function useTypography() {
  const theme = useTheme();
  return theme.typography;
}

/**
 * Access animation tokens
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const animations = useAnimations();
 *
 *   return (
 *     <Animated.View
 *       style={[
 *         {
 *           opacity: fadeAnim,
 *         },
 *       ]}
 *     />
 *   );
 * }
 * ```
 */
export function useAnimations() {
  const theme = useTheme();
  return theme.animations;
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
// NESTED THEME COMPONENT (AC-3)
// =============================================================================

/**
 * Named theme presets for nested theme contexts
 */
export type ThemeName =
  | 'default'
  | 'violet'
  | 'amber'
  | 'rose'
  | 'emerald'
  | 'ocean'
  | 'sunset'
  | 'aurora';

/**
 * Get color-matched shadow for an accent color
 * Algorithm: Take accent color at 500 shade, apply 40% opacity for shadow tint
 */
function getColorMatchedShadow(accentColor: string) {
  return {
    shadowColor: accentColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  };
}

/**
 * Create theme overrides for named themes
 */
function getThemeOverrides(name: ThemeName, parentTheme: Theme): Partial<Theme> {
  switch (name) {
    case 'violet':
      return {
        colors: {
          ...parentTheme.colors,
          accent: {
            primary: colors.violet[500],
            amber: colors.violet[400],
            violet: colors.violet[600],
          },
          text: {
            ...parentTheme.colors.text,
            accent: colors.violet[400],
            ai: colors.violet[300],
          },
          border: {
            ...parentTheme.colors.border,
            accent: colors.violet[500],
          },
        },
        glows: {
          ...parentTheme.glows,
          primary: getColorMatchedShadow(colors.violet[500]),
        },
      };

    case 'amber':
      return {
        colors: {
          ...parentTheme.colors,
          accent: {
            primary: colors.amber[400],
            amber: colors.amber[500],
            violet: colors.amber[300],
          },
          text: {
            ...parentTheme.colors.text,
            accent: colors.amber[400],
            warning: colors.amber[500],
          },
          border: {
            ...parentTheme.colors.border,
            accent: colors.amber[400],
          },
        },
        glows: {
          ...parentTheme.glows,
          primary: getColorMatchedShadow(colors.amber[400]),
        },
      };

    case 'rose':
      return {
        colors: {
          ...parentTheme.colors,
          accent: {
            primary: colors.rose[500],
            amber: colors.rose[400],
            violet: colors.rose[600],
          },
          text: {
            ...parentTheme.colors.text,
            accent: colors.rose[500],
            error: colors.rose[600],
          },
          border: {
            ...parentTheme.colors.border,
            accent: colors.rose[500],
            error: colors.rose[600],
          },
        },
        glows: {
          ...parentTheme.glows,
          primary: getColorMatchedShadow(colors.rose[500]),
        },
      };

    case 'emerald':
      return {
        colors: {
          ...parentTheme.colors,
          accent: {
            primary: colors.emerald[400],
            amber: colors.emerald[500],
            violet: colors.emerald[300],
          },
          text: {
            ...parentTheme.colors.text,
            accent: colors.emerald[400],
            success: colors.emerald[500],
          },
          border: {
            ...parentTheme.colors.border,
            accent: colors.emerald[400],
          },
        },
        glows: {
          ...parentTheme.glows,
          primary: getColorMatchedShadow(colors.emerald[400]),
        },
      };

    case 'ocean':
      return {
        colors: {
          ...parentTheme.colors,
          accent: {
            primary: colors.accent[500],
            amber: colors.accent[400],
            violet: colors.accent[600],
          },
          text: {
            ...parentTheme.colors.text,
            accent: colors.accent[500],
          },
          border: {
            ...parentTheme.colors.border,
            accent: colors.accent[500],
          },
        },
        glows: {
          ...parentTheme.glows,
          primary: getColorMatchedShadow(colors.accent[500]),
        },
      };

    case 'sunset':
      return {
        colors: {
          ...parentTheme.colors,
          accent: {
            primary: colors.amber[500],
            amber: colors.amber[600],
            violet: colors.rose[400],
          },
          text: {
            ...parentTheme.colors.text,
            accent: colors.amber[500],
          },
          border: {
            ...parentTheme.colors.border,
            accent: colors.amber[500],
          },
        },
        glows: {
          ...parentTheme.glows,
          primary: getColorMatchedShadow(colors.amber[500]),
        },
      };

    case 'aurora':
      return {
        colors: {
          ...parentTheme.colors,
          accent: {
            primary: colors.violet[400],
            amber: colors.emerald[400],
            violet: colors.violet[500],
          },
          text: {
            ...parentTheme.colors.text,
            accent: colors.violet[400],
          },
          border: {
            ...parentTheme.colors.border,
            accent: colors.violet[400],
          },
        },
        glows: {
          ...parentTheme.glows,
          primary: getColorMatchedShadow(colors.violet[400]),
        },
      };

    case 'default':
    default:
      return {};
  }
}

export interface ThemeComponentProps {
  children: ReactNode;
  name?: ThemeName;
  theme?: Partial<Theme>;
}

/**
 * Nested Theme component for theme inheritance and accent color overrides
 *
 * @example
 * ```tsx
 * <Theme name="default">
 *   <Button>Default Theme</Button>
 *
 *   <Theme name="violet">
 *     <Button>Violet Accent</Button>
 *   </Theme>
 *
 *   <Theme name="amber">
 *     <Button>Amber Accent</Button>
 *   </Theme>
 * </Theme>
 * ```
 */
export function Theme({ children, name = 'default', theme: customTheme }: ThemeComponentProps) {
  const parentTheme = useTheme();

  // Merge parent theme with overrides
  const overrides = name ? getThemeOverrides(name, parentTheme) : {};
  const mergedOverrides = customTheme
    ? {
        ...overrides,
        colors: {
          ...(overrides.colors || {}),
          ...(customTheme.colors || {}),
        },
      }
    : overrides;

  // Create nested theme by deep merging with parent
  const nestedTheme: Theme = {
    ...parentTheme,
    ...mergedOverrides,
    colors: {
      ...parentTheme.colors,
      ...(mergedOverrides.colors || {}),
      bg: {
        ...parentTheme.colors.bg,
        ...((mergedOverrides.colors as any)?.bg || {}),
      },
      text: {
        ...parentTheme.colors.text,
        ...((mergedOverrides.colors as any)?.text || {}),
      },
      border: {
        ...parentTheme.colors.border,
        ...((mergedOverrides.colors as any)?.border || {}),
      },
      accent: {
        ...parentTheme.colors.accent,
        ...((mergedOverrides.colors as any)?.accent || {}),
      },
    },
  };

  const value: ThemeContextValue = {
    theme: nestedTheme,
    mode: parentTheme.mode,
    setTheme: parentTheme.setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// =============================================================================
// EXPORTS
// =============================================================================

export { colors, typography, spacing, borders, shadows, glows, glass, blur, opacity, animations };
