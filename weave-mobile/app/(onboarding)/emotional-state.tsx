/**
 * Emotional State Selection Screen
 *
 * Step 1.2 of Onboarding: User selects emotional painpoint
 * PRD US-1.2: Painpoint Identification
 *
 * TODO: Add error boundary wrapper (global error handling story)
 */

import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { PainpointCard, Painpoint } from '@/components/onboarding/PainpointCard';
import { useOnboardingStore } from '@/stores/onboardingStore';

// =============================================================================
// DATA - From PRD US-1.2
// =============================================================================

const PAINPOINTS: Painpoint[] = [
  {
    id: 'clarity',
    title: 'Clarity',
    description: "I'm figuring out my direction",
    icon: 'lightbulb.fill',
  },
  {
    id: 'action',
    title: 'Action',
    description: "I think a lot but don't start",
    icon: 'figure.walk',
  },
  {
    id: 'consistency',
    title: 'Consistency',
    description: 'I start strong but fall off',
    icon: 'arrow.triangle.2.circlepath',
  },
  {
    id: 'alignment',
    title: 'Alignment',
    description: 'I feel ambitious but isolated',
    icon: 'person.badge.key.fill',
  },
];

// =============================================================================
// COMPONENT
// =============================================================================

export default function EmotionalStateScreen() {
  // Get selection from zustand store
  // Note: PRD specifies storing in user_profiles.json - will be handled by backend
  const { selectedPainpoints, setSelectedPainpoints } = useOnboardingStore();

  // Local state for confirmation flow
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Handle card press with PRD logic:
  // - User selects 1, sees confirmation
  // - Can optionally add second after confirmation
  const handleCardPress = useCallback(
    (id: string) => {
      const isCurrentlySelected = selectedPainpoints.includes(id);

      if (isCurrentlySelected) {
        // Deselect
        setSelectedPainpoints(selectedPainpoints.filter((p) => p !== id));
        if (selectedPainpoints.length === 1) {
          setShowConfirmation(false);
        }
      } else {
        // Select
        if (selectedPainpoints.length === 0) {
          // First selection - show confirmation
          setSelectedPainpoints([id]);
          setShowConfirmation(true);
        } else if (selectedPainpoints.length === 1) {
          // Second selection - allow it
          setSelectedPainpoints([...selectedPainpoints, id]);
        }
        // Max 2 selections
      }
    },
    [selectedPainpoints, setSelectedPainpoints]
  );

  // Handle continue button
  const handleContinue = useCallback(() => {
    // Navigate to next screen (US-1.3: Insight Reflection)
    // TODO: Send selected_painpoints to backend (lightweight API call)
    router.push('/(onboarding)/insight-reflection');
  }, []);

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
            Pick 1-2 that you're struggling with most right now
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

        {/* Confirmation Message */}
        {showConfirmation && selectedPainpoints.length === 1 && (
          <View className="items-center mt-6">
            <Text className="text-center text-sm text-neutral-600 mb-3">
              You can optionally add one more
            </Text>
          </View>
        )}

        {/* Continue Button */}
        <View className="w-full mt-6">
          <Pressable
            className={`h-12 rounded-lg w-full justify-center items-center ${
              selectedPainpoints.length >= 1
                ? 'bg-blue-500'
                : 'bg-gray-300'
            }`}
            onPress={handleContinue}
            disabled={selectedPainpoints.length === 0}
            accessibilityLabel="Continue to next step"
            accessibilityRole="button"
            accessibilityState={{ disabled: selectedPainpoints.length === 0 }}
          >
            <Text
              className={`text-base font-semibold ${
                selectedPainpoints.length >= 1 ? 'text-white' : 'text-gray-500'
              }`}
            >
              Continue
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
