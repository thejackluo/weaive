import React, { useEffect as _useEffect } from 'react';
import { Stack } from 'expo-router';
import { LogBox } from 'react-native';
import { ThemeProvider, SimpleToastContainer } from '../src/design-system';
import { AuthProvider } from '../src/contexts/AuthContext';
import { QueryClientProvider } from '../src/contexts/QueryClientProvider';
import { DevEnvironmentBanner } from '../src/components/DevEnvironmentBanner';
import '../global.css';

// Suppress Reanimated React 19 compatibility warning (known issue, fix pending upgrade)
LogBox.ignoreLogs([
  'You attempted to set the key `current`',
  'deepFreezeAndThrowOnMutationInDev',
  'immutable',
]);

/**
 * Root layout component for Expo Router
 *
 * Provides the core navigation structure for the entire app using Stack navigation.
 *
 * Architecture:
 * - Stack-based navigation (supports (auth), (onboarding), and (tabs) route groups)
 * - Global CSS imported for NativeWind/Tailwind support
 * - Headers hidden by default (screens can override if needed)
 * - Wrapped with ThemeProvider for design system support
 * - Wrapped with AuthProvider for authentication state management (Story 0.3)
 * - SimpleToastContainer for global toast notifications (Story 0.3)
 * - DevEnvironmentBanner for showing API endpoint in dev mode (multi-worktree setup)
 *
 * Provider Hierarchy:
 * - ThemeProvider (outermost) - Design system theme
 * - QueryClientProvider - TanStack Query for server state (Story 2.1)
 * - AuthProvider - Authentication state and methods
 * - Stack - Navigation structure
 * - SimpleToastContainer - Simple toast notification overlay (no animations)
 * - DevEnvironmentBanner - Dev-only overlay showing API base URL (top of screen)
 *
 * @returns Stack navigation component wrapped with providers
 */
export default function RootLayout() {
  return (
    <ThemeProvider initialMode="dark">
      <QueryClientProvider>
        <AuthProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
          <SimpleToastContainer />
          <DevEnvironmentBanner />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
