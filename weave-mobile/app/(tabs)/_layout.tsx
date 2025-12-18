import { Stack } from 'expo-router';

/**
 * Tabs Layout
 *
 * Main navigation structure for authenticated users after onboarding.
 * Currently uses Stack layout as placeholder.
 *
 * Future Implementation:
 * - Replace Stack with Tabs component when main app screens are implemented
 * - Expected tabs: Thread (Home), Weave (Progress), Dream Self (AI Chat), Profile
 *
 * @returns Stack navigator (will become Tabs navigator in future stories)
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
