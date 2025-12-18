/* global __DEV__, console */
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { Text, View } from 'react-native';
import '../global.css';
import { useEffect } from 'react';
import * as React from 'react';

/**
 * Custom error fallback component
 * Displays a user-friendly error message when the app crashes
 */
function ErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</Text>
      <Text className="text-gray-600 text-center mb-2">
        {error.message || 'An unexpected error occurred'}
      </Text>
      <Text className="text-blue-600 font-semibold mt-4" onPress={retry}>
        Try Again
      </Text>
      {__DEV__ && (
        <View className="mt-6 p-4 bg-gray-100 rounded">
          <Text className="text-xs text-gray-800 font-mono">{error.stack}</Text>
        </View>
      )}
    </View>
  );
}

/**
 * Expo Router Error Boundary
 * Automatically catches errors in any route and displays the ErrorFallback component
 */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log errors to console in development
    if (__DEV__) {
      console.error('[Weave] Error Boundary caught error:', error);
    }
    // In production, you would send this to an error tracking service (Sentry, etc.)
  }, [error]);

  return <ErrorFallback error={error} retry={retry} />;
}

/**
 * Root layout for Expo Router
 *
 * This component:
 * - Imports global.css for NativeWind/Tailwind CSS support
 * - Sets up navigation structure with Stack
 * - Provides error boundary protection (via exported ErrorBoundary above)
 * - Serves as the foundation for all app screens
 */
export default function RootLayout() {
  useEffect(() => {
    // Log React version on mount for debugging
    if (__DEV__) {
      console.log(`[Weave] React version: ${React.version}`);
      console.log('[Weave] App mounted successfully');
    }
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
