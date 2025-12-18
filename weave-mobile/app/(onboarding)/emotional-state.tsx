/**
 * Emotional State Selection Screen
 *
 * Step 1.2 of Onboarding: User selects 1-2 emotional painpoints
 * Stores selection in zustand onboarding store
 * NativeWind v5 styling
 */

import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { PainpointCard, Painpoint } from '@/components/onboarding/PainpointCard';
import { useOnboardingStore } from '@/stores/onboardingStore';

// =============================================================================
// DATA
// =============================================================================

const PAINPOINTS: Painpoint[] = [
  {
    id: 'clarity',
    title: 'Clarity',
    description: 'I know what I want but struggle to define clear goals',
    icon: 'lightbulb.fill',
  },
  {
    id: 'action',
    title: 'Action',
    description: 'I have goals but struggle to take consistent action',
    icon: 'figure.walk',
  },
  {
    id: 'consistency',
    title: 'Consistency',
    description: 'I start strong but lose momentum over time',
    icon: 'arrow.triangle.2.circlepath',
  },
  {
    id: 'alignment',
    title: 'Alignment',
    description: "My actions don't reflect who I want to become",
    icon: 'person.badge.key.fill',
  },
];

// =============================================================================
// COMPONENT
// =============================================================================

export default function EmotionalStateScreen() {
  // Get selection from zustand store
  const { selectedPainpoints, setSelectedPainpoints } = useOnboardingStore();

  // Local state for validation message
  const [showValidation, setShowValidation] = useState(false);

  // Handle card press with multi-select logic (max 2)
  const handleCardPress = useCallback(
    (id: string) => {
      const isCurrentlySelected = selectedPainpoints.includes(id);

      if (isCurrentlySelected) {
        // Deselect: Remove from array
        setSelectedPainpoints(selectedPainpoints.filter((p) => p !== id));
        setShowValidation(false);
      } else {
        // Select: Check if we can add more
        if (selectedPainpoints.length >= 2) {
          // Show validation message
          setShowValidation(true);
          return;
        }

        // Add to array
        setSelectedPainpoints([...selectedPainpoints, id]);
        setShowValidation(false);
      }
    },
    [selectedPainpoints, setSelectedPainpoints]
  );

  // Handle continue button
  const handleContinue = useCallback(() => {
    // Navigate to next screen (Story 1.3: Insight Reflection)
    router.push('/onboarding/insight-reflection');
  }, []);

  // Check if continue button should be enabled
  const canContinue = selectedPainpoints.length >= 1 && selectedPainpoints.length <= 2;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="py-6 px-4 pb-10"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center mb-6">
          <Text className="text-center text-[28px] font-semibold text-neutral-800 mb-2 tracking-tight">
            What's holding you back?
          </Text>
          <Text className="text-center text-base text-neutral-600">
            Choose 1-2 areas you want to improve
          </Text>
        </View>

        {/* Painpoint Grid */}
        <View className="flex-row flex-wrap justify-between gap-3">
          {PAINPOINTS.map((painpoint) => (
            <PainpointCard
              key={painpoint.id}
              painpoint={painpoint}
              isSelected={selectedPainpoints.includes(painpoint.id)}
              onPress={handleCardPress}
            />
          ))}
        </View>

        {/* Validation Message */}
        {showValidation && (
          <View className="items-center mt-3">
            <Text className="text-center font-medium text-sm text-red-600">
              Choose up to 2
            </Text>
          </View>
        )}

        {/* Continue Button */}
        <View className="w-full mt-6">
          <Pressable
            className={`h-12 rounded-lg w-full justify-center items-center ${
              canContinue ? 'bg-blue-500' : 'bg-gray-200 opacity-50'
            }`}
            disabled={!canContinue}
            onPress={handleContinue}
            accessibilityLabel="Continue to next step"
            accessibilityRole="button"
            accessibilityState={{ disabled: !canContinue }}
          >
            <Text className="text-white text-base font-semibold">
              Continue
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
