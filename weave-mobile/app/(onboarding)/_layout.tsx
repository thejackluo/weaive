import React from 'react';
import { Stack } from 'expo-router';

/**
 * Onboarding Layout
 *
 * Stack navigator for onboarding flow
 * Screens: welcome, emotional-state-selection, etc.
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
