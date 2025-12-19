/**
 * Authentication Layout
 *
 * Story 0.3: Authentication Flow
 * Stack navigator for authentication screens (login, signup)
 *
 * Features:
 * - Stack-based navigation for auth flow
 * - No headers (each screen handles its own UI)
 * - Auto-redirect to tabs if user is already authenticated
 * - Wraps screens with necessary context providers
 *
 * Architecture:
 * - Uses Expo Router's Stack component
 * - Checks auth state and redirects if already logged in
 * - All screens in this group are unauthenticated routes
 *
 * Routes:
 * - /(auth)/login - Email/password login + OAuth
 * - /(auth)/signup - New user registration
 */

import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '@/design-system';

/**
 * Auth Layout Component
 * Provides Stack navigation for auth screens and handles redirect logic
 */
export default function AuthLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const { colors } = useTheme();

  /**
   * Redirect Logic:
   * - If user is authenticated and on auth screens → redirect to tabs
   * - If user is not authenticated → stay on auth screens
   */
  useEffect(() => {
    if (isLoading) return; // Wait for auth state to load

    const inAuthGroup = segments[0] === '(auth)';

    if (user && inAuthGroup) {
      // User is authenticated but on auth screens → redirect to tabs
      router.replace('/(tabs)');
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

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: colors.background.primary,
        },
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: 'Sign In',
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          title: 'Create Account',
        }}
      />
      {/* Privacy Policy and Terms of Service - no animation to avoid Reanimated React 19 bug */}
      <Stack.Screen
        name="privacy-policy"
        options={{
          title: 'Privacy Policy',
          animation: 'none', // Disable animation to avoid React Reanimated bug
        }}
      />
      <Stack.Screen
        name="terms-of-service"
        options={{
          title: 'Terms of Service',
          animation: 'none', // Disable animation to avoid React Reanimated bug
        }}
      />
    </Stack>
  );
}
