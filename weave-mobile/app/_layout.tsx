/* global __DEV__, console */
import { Stack, ErrorBoundary } from 'expo-router';
import { Text, View } from 'react-native';
import '../global.css'; // Import NativeWind styles

/**
 * Custom error fallback component
 * Displays a user-friendly error message when the app crashes
 */
function ErrorFallback({ error, retry }: { error?: Error; retry: () => void }) {
  const errorMessage = error?.message || 'An unexpected error occurred';
  const errorStack = error?.stack || 'No stack trace available';

  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</Text>
      <Text className="text-gray-600 text-center mb-2">
        {errorMessage}
      </Text>
      <Text className="text-blue-600 font-semibold mt-4" onPress={retry}>
        Try Again
      </Text>
      {__DEV__ && (
        <View className="mt-6 p-4 bg-gray-100 rounded">
          <Text className="text-xs text-gray-800 font-mono">{errorStack}</Text>
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
 * - Provides the foundation for all app screens
 *
 * Note: Expo Router automatically provides error boundaries for each route.
 * Custom error handling can be configured per-route using the errorBoundary export.
 */
export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

/**
 * Export error boundary component for route-level error handling
 * Use this in individual routes by exporting: export const errorBoundary = ErrorFallback;
 */
export { ErrorFallback as ErrorBoundary };
