import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { LogBox } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, SimpleToastContainer } from '../src/design-system';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { InAppOnboardingProvider } from '../src/contexts/InAppOnboardingContext';
import { DevEnvironmentBanner } from '../src/components/DevEnvironmentBanner';
import { initJournalApi } from '../src/services/journalApi';
import apiClient from '../src/services/apiClient';
import {
  registerForPushNotificationsAsync,
  savePushTokenToBackend,
  setupNotificationListeners,
} from '../src/services/notificationService';
import '../global.css';
// Sentry error tracking enabled for TestFlight crash debugging
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
  const { getAuthToken, user } = useAuth();

  useEffect(() => {
    // Initialize journalApi with shared auth token getter
    // Reduces duplicate supabase.auth.getSession() calls
    initJournalApi(getAuthToken);

    // 🔓 Enable admin mode for unlimited rate limits (DEVELOPMENT ONLY)
    // ✅ FIX: Only enable in development, use env var for key
    if (__DEV__) {
      const devAdminKey = process.env.EXPO_PUBLIC_DEV_ADMIN_KEY;
      if (devAdminKey) {
        apiClient.enableAdminMode(devAdminKey);
        console.log('[ROOT_LAYOUT] ✅ Admin mode enabled for testing');
      }
    }
  }, [getAuthToken]);

  // 📬 Initialize push notifications (Story 6.1)
  // Separate useEffect to run ONCE on mount (not every getAuthToken change)
  // CRITICAL: Fully wrapped in try-catch to prevent app crashes
  useEffect(() => {
    let cleanupListeners: (() => void) | null = null;

    (async () => {
      try {
        console.log('[ROOT_LAYOUT] 🚀 Initializing push notifications...');

        // Setup notification listeners first (no async, less likely to fail)
        try {
          cleanupListeners = setupNotificationListeners();
          console.log('[ROOT_LAYOUT] ✅ Notification listeners setup');
        } catch (listenerError) {
          console.error('[ROOT_LAYOUT] ⚠️ Failed to setup notification listeners:', listenerError);
          // Continue anyway - this shouldn't block app startup
        }

        // Register for push notifications and get token
        const pushToken = await registerForPushNotificationsAsync();

        if (pushToken) {
          // Save token to backend
          await savePushTokenToBackend(pushToken);
          console.log('[ROOT_LAYOUT] ✅ Push notifications registered and saved');
        } else {
          console.log(
            '[ROOT_LAYOUT] ⚠️ Push notifications not available (simulator or permissions denied)'
          );
        }
      } catch (error) {
        console.error('[ROOT_LAYOUT] ❌ Error initializing push notifications:', error);
        console.error('[ROOT_LAYOUT] 🔍 Error details:', error);
        // App will continue to work without push notifications
      }
    })();

    // Cleanup on unmount
    return () => {
      try {
        if (cleanupListeners) {
          cleanupListeners();
        }
      } catch (cleanupError) {
        console.error('[ROOT_LAYOUT] ⚠️ Error cleaning up notification listeners:', cleanupError);
      }
    };
  }, []); // Empty array = run once on mount

  // 🚀 Eager prefetch AI conversations when user is authenticated (Story 6.2)
  // This ensures conversations are loaded BEFORE user navigates to AI Chat
  useEffect(() => {
    if (user) {
      console.log('[ROOT_LAYOUT] 🔄 Prefetching AI conversations...');

      // Prefetch conversations list
      queryClient
        .prefetchQuery({
          queryKey: ['ai-conversations'],
          queryFn: async () => {
            const response = await apiClient.get('/api/ai-chat/conversations');
            return response.data.data || [];
          },
        })
        .then(() => {
          console.log('[ROOT_LAYOUT] ✅ AI conversations prefetched');
        })
        .catch((error) => {
          console.error('[ROOT_LAYOUT] ❌ Failed to prefetch conversations:', error);
        });

      // Prefetch usage stats
      queryClient
        .prefetchQuery({
          queryKey: ['ai-usage'],
          queryFn: async () => {
            const response = await apiClient.get('/api/ai/usage');
            return response.data.data;
          },
        })
        .then(() => {
          console.log('[ROOT_LAYOUT] ✅ AI usage stats prefetched');
        })
        .catch((error) => {
          console.error('[ROOT_LAYOUT] ❌ Failed to prefetch usage stats:', error);
        });
    }
  }, [user]);

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
 * - Sentry error boundary for crash tracking (TestFlight debugging)
 *
 * Provider Hierarchy:
 * - Sentry.wrap (outermost) - Error boundary for crash tracking
 * - ThemeProvider - Design system theme
 * - QueryClientProvider - TanStack Query for server state (Story 2.1)
 * - AuthProvider - Authentication state and methods
 * - InAppOnboardingProvider - In-app tutorial state management
 * - QueryClientProvider - TanStack Query for server state management (Story 4.1)
 * - ApiInitializer - Connects AuthContext to API services
 * - Stack - Navigation structure
 * - SimpleToastContainer - Simple toast notification overlay (no animations)
 * - DevEnvironmentBanner - Dev-only overlay showing API base URL (top of screen)
 *
 * @returns Stack navigation component wrapped with providers
 */
function RootLayout() {
  return (
    <ThemeProvider initialMode="dark">
      <AuthProvider>
        <InAppOnboardingProvider>
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
        </InAppOnboardingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Wrap with Sentry error boundary to catch and report all crashes
export default Sentry.wrap(RootLayout);
