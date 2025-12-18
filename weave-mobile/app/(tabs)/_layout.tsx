import { Stack } from 'expo-router';

/**
 * Tabs Layout
 * 
 * Main navigation tabs for authenticated users
 * Uses Stack layout for now (can be changed to Tabs when tab navigation is needed)
 */
export default function TabsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
