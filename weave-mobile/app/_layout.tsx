import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/design-system';
import { AuthProvider } from '../src/contexts/AuthContext';
import '../global.css';

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
 *
 * Provider Hierarchy:
 * - ThemeProvider (outermost) - Design system theme
 * - AuthProvider - Authentication state and methods
 * - Stack - Navigation structure
 *
 * @returns Stack navigation component wrapped with providers
 */
export default function RootLayout() {
  return (
    <ThemeProvider initialMode="dark">
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
