import { Slot } from 'expo-router';
import { Text, View, TouchableOpacity } from 'react-native';
import '../global.css'; // Import NativeWind styles

/**
 * Custom error fallback component for expo-router ErrorBoundary
 * Automatically used when errors occur in the app
 */
export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</Text>
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
 * - Renders all child routes via Slot
 * - ErrorBoundary is exported separately and used automatically by expo-router
 */
export default function RootLayout() {
  // Log global errors in development
  if (__DEV__) {
    const originalError = console.error;
    console.error = (...args) => {
      originalError(...args);
    };
  }

  return <Slot />;
}
