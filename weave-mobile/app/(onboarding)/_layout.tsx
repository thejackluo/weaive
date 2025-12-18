import React from 'react';
import { Stack } from 'expo-router';

/**
 * Onboarding Layout
 *
 * Stack navigator for the onboarding flow (Epic 1).
 * Provides consistent navigation behavior for all onboarding screens.
 *
 * Screens in this flow:
 * - welcome (Story 1.1)
 * - emotional-state-selection (Story 1.2)
 * - Additional onboarding screens (Stories 1.3-1.16)
 *
 * Navigation Configuration:
 * - Headers hidden (each screen handles its own header if needed)
 * - Slide from right animation for forward navigation
 *
 * @returns Stack navigator configured for onboarding
 */
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    />
  );
}
