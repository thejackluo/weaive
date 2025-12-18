/* global __DEV__, console */
import { Stack, ErrorBoundary } from 'expo-router';
import { Text, View } from 'react-native';
import '../global.css'; // Import NativeWind styles

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
 * Root layout for Expo Router
 *
 * This component:
 * - Imports global.css for NativeWind/Tailwind CSS support
 * - Sets up stack-based navigation structure
 * - Wraps app in ErrorBoundary for better debugging
 * - Provides the foundation for all app screens
 */
export default function RootLayout() {
  return (
    <ErrorBoundary
      errorComponent={ErrorFallback}
      onError={(error) => {
        // Log errors to console in development
        if (__DEV__) {
          console.error('App Error:', error);
        }
        // In production, you would send this to an error tracking service (Sentry, etc.)
      }}
    >
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ErrorBoundary>
  );
}

// Export ErrorBoundary for use in other parts of the app
export { ErrorBoundary };
