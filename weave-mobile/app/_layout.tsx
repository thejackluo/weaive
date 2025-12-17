import { Tabs } from 'expo-router';
import '../global.css'; // Import NativeWind styles

/**
 * Root layout for Expo Router
 *
 * This component:
 * - Imports global.css for NativeWind/Tailwind CSS support
 * - Sets up tab-based navigation structure
 * - Provides the foundation for all app screens
 */
export default function RootLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
