import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/design-system';
import '../global.css';

/**
 * Root layout component for Expo Router
 *
 * Provides the core navigation structure for the entire app using Stack navigation.
 *
 * Architecture:
 * - Stack-based navigation (supports both (onboarding) and (tabs) route groups)
 * - Global CSS imported for NativeWind/Tailwind support
 * - Headers hidden by default (screens can override if needed)
 * - Wrapped with ThemeProvider for design system support
 *
 * @returns Stack navigation component wrapped with ThemeProvider
 */
export default function RootLayout() {
  return (
    <ThemeProvider initialMode="dark">
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </ThemeProvider>
  );
}
