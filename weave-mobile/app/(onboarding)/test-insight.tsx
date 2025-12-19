/**
 * Test Screen for Story 1.3: Insight Reflection
 *
 * Quick way to test the insight-reflection screen with different painpoint configurations
 * Navigate to: /onboarding/test-insight
 */

import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useOnboardingStore } from '@/stores/onboardingStore';

export default function TestInsightScreen() {
  const { setSelectedPainpoints } = useOnboardingStore();

  const testScenarios = [
    {
      title: 'Test: 1 Painpoint (Clarity)',
      painpoints: ['clarity'],
      description: 'Single card should show',
    },
    {
      title: 'Test: 1 Painpoint (Action)',
      painpoints: ['action'],
      description: 'Single card should show',
    },
    {
      title: 'Test: 2 Painpoints (Clarity + Action)',
      painpoints: ['clarity', 'action'],
      description: 'Two cards with staggered animation',
    },
    {
      title: 'Test: 2 Painpoints (Consistency + Alignment)',
      painpoints: ['consistency', 'alignment'],
      description: 'Two cards with staggered animation',
    },
    {
      title: 'Test: Empty Selection (Edge Case)',
      painpoints: [],
      description: 'Should show fallback text',
    },
  ];

  const handleTestScenario = (painpoints: string[]) => {
    setSelectedPainpoints(painpoints);
    router.push('/(onboarding)/insight-reflection');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-neutral-900 mb-2">Story 1.3 Test Screen</Text>
          <Text className="text-sm text-neutral-600">
            Select a test scenario to navigate to the Insight Reflection screen
          </Text>
        </View>

        {testScenarios.map((scenario, index) => (
          <Pressable
            key={index}
            className="mb-3 p-4 bg-blue-50 rounded-xl border border-blue-200 active:bg-blue-100"
            onPress={() => handleTestScenario(scenario.painpoints)}
          >
            <Text className="text-base font-semibold text-blue-900 mb-1">{scenario.title}</Text>
            <Text className="text-sm text-blue-700 mb-2">
              Painpoints:{' '}
              {scenario.painpoints.length === 0 ? 'None' : scenario.painpoints.join(', ')}
            </Text>
            <Text className="text-xs text-neutral-600">{scenario.description}</Text>
          </Pressable>
        ))}

        <View className="mt-6 p-4 bg-neutral-100 rounded-xl">
          <Text className="text-sm font-semibold text-neutral-900 mb-2">Testing Checklist:</Text>
          <Text className="text-xs text-neutral-700 mb-1">✓ Glass effect on cards</Text>
          <Text className="text-xs text-neutral-700 mb-1">✓ Fade-in animation for first card</Text>
          <Text className="text-xs text-neutral-700 mb-1">
            ✓ Slide-up animation for second card (200ms delay)
          </Text>
          <Text className="text-xs text-neutral-700 mb-1">✓ CTA button appears after cards</Text>
          <Text className="text-xs text-neutral-700 mb-1">
            ✓ Correct symptom text for each painpoint
          </Text>
          <Text className="text-xs text-neutral-700">
            ✓ Reduced motion support (check Settings → Accessibility)
          </Text>
        </View>

        <Pressable
          className="mt-4 p-3 bg-neutral-200 rounded-lg active:bg-neutral-300"
          onPress={() => router.push('/(onboarding)/emotional-state')}
        >
          <Text className="text-center text-sm font-medium text-neutral-800">
            Go to Story 1.2 (Full Flow)
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
