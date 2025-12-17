import { Slot, ErrorBoundary, ErrorBoundaryProps } from 'expo-router';
import { Text, View, TouchableOpacity } from 'react-native';
import '../global.css'; // Import NativeWind styles

/**
 * Custom error fallback component
 * Displays a user-friendly error message when the app crashes
 */
function ErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-2xl font-bold text-red-600 mb-4">
        Oops! Something went wrong
      </Text>
      <Text className="text-gray-600 text-center mb-2">
        {error.message || 'An unexpected error occurred'}
      </Text>
      <TouchableOpacity onPress={retry} className="mt-4 px-6 py-3 bg-blue-600 rounded-lg">
        <Text className="text-white font-semibold">Try Again</Text>
      </TouchableOpacity>
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
 * - Sets up navigation structure with Slot
 * - Wraps app in ErrorBoundary for better debugging
 * - Provides the foundation for all app screens
 */
export default function RootLayout() {
  return (
    <ErrorBoundary
      catch={ErrorFallback}
      onError={(error: Error) => {
        // Log errors to console in development
        if (__DEV__) {
          console.error('App Error:', error);
        }
        // In production, you would send this to an error tracking service (Sentry, etc.)
      }}
    >
      <Slot />
    </ErrorBoundary>
  );
}

// Export ErrorBoundary for use in other parts of the app
export { ErrorBoundary };
