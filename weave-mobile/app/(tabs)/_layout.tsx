import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '@/design-system';

/**
 * Tabs Layout
 *
 * Story 0.3: Protected route group for authenticated users
 *
 * Main navigation structure for authenticated users after onboarding.
 * Currently uses Stack layout as placeholder.
 *
 * Security:
 * - Requires authentication to access any tab screens
 * - Redirects to login if user is not authenticated
 * - Shows loading screen while checking auth state
 *
 * Future Implementation:
 * - Replace Stack with Tabs component when main app screens are implemented
 * - Expected tabs: Thread (Home), Weave (Progress), Dream Self (AI Chat), Profile
 *
 * @returns Stack navigator with auth guard (will become Tabs navigator in future stories)
 */
export default function TabsLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const { colors } = useTheme();

  /**
   * Auth Guard:
   * - If user is not authenticated and on tabs screens → redirect to login
   * - If user is authenticated → allow access to tabs
   */
  useEffect(() => {
    if (isLoading) return; // Wait for auth state to load

    const inTabsGroup = segments[0] === '(tabs)';

    if (!user && inTabsGroup) {
      // User is NOT authenticated but trying to access tabs → redirect to login
      router.replace('/(auth)/login');
    }
  }, [user, isLoading, segments, router]);

  /**
   * Show loading screen while checking auth state
   */
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background.primary,
        }}
      >
        <ActivityIndicator size="large" color={colors.accent[500]} />
      </View>
    );
  }

  /**
   * If user is not authenticated, don't render tabs
   * Redirect will happen in useEffect above
   */
  if (!user) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
