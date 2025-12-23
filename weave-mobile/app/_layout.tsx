import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { LogBox } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, SimpleToastContainer } from '../src/design-system';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { DevEnvironmentBanner } from '../src/components/DevEnvironmentBanner';
import { initJournalApi } from '../src/services/journalApi';
import '../global.css';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://6376c2a36a9e23ca22646f5d5024e6ac@o4507389087580160.ingest.us.sentry.io/4510585166888960',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

// Create QueryClient instance (singleton)
// Story 4.1: Added for journal and user preferences queries
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1, // Retry once on failure (offline-friendly)
      refetchOnWindowFocus: false, // Mobile doesn't have window focus concept
    },
    mutations: {
      retry: 1,
    },
  },
});

// Suppress Reanimated React 19 compatibility warning (known issue, fix pending upgrade)
LogBox.ignoreLogs([
  'You attempted to set the key `current`',
  'deepFreezeAndThrowOnMutationInDev',
  'immutable',
]);

/**
 * Initialize API services with AuthContext
 * Must be inside AuthProvider to access getAuthToken
 */
function ApiInitializer({ children }: { children: React.ReactNode }) {
  const { getAuthToken } = useAuth();

  useEffect(() => {
    // Initialize journalApi with shared auth token getter
    // Reduces duplicate supabase.auth.getSession() calls
    initJournalApi(getAuthToken);
  }, [getAuthToken]);

  return <>{children}</>;
}

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
 * - Wrapped with QueryClientProvider for TanStack Query (Story 4.1)
 * - ApiInitializer for connecting auth to API services
 * - SimpleToastContainer for global toast notifications (Story 0.3)
 * - DevEnvironmentBanner for showing API endpoint in dev mode (multi-worktree setup)
 *
 * Provider Hierarchy:
 * - ThemeProvider (outermost) - Design system theme
 * - QueryClientProvider - TanStack Query for server state (Story 2.1)
 * - AuthProvider - Authentication state and methods
 * - QueryClientProvider - TanStack Query for server state management (Story 4.1)
 * - ApiInitializer - Connects AuthContext to API services
 * - Stack - Navigation structure
 * - SimpleToastContainer - Simple toast notification overlay (no animations)
 * - DevEnvironmentBanner - Dev-only overlay showing API base URL (top of screen)
 *
 * @returns Stack navigation component wrapped with providers
 */
export default Sentry.wrap(function RootLayout() {
  return (
    <ThemeProvider initialMode="dark">
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <ApiInitializer>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
            <SimpleToastContainer />
            <DevEnvironmentBanner />
          </ApiInitializer>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
});