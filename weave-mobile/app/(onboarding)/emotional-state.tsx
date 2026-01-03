/**
 * Emotional State Selection Screen
 *
 * Step 1.2 of Onboarding: User selects emotional painpoint
 * PRD US-1.2: Painpoint Identification
 *
 * TODO: Add error boundary wrapper (global error handling story)
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { PainpointCard, Painpoint } from '@/components/onboarding/PainpointCard';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useTheme, Heading, Body, Button } from '@/design-system';

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
  const { colors, spacing } = useTheme();

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
  const handleContinue = useCallback(async () => {
    // Save selected painpoints to AsyncStorage for Story 1.7
    try {
      await AsyncStorage.setItem(
        'onboarding_data',
        JSON.stringify({
          selected_painpoints: selectedPainpoints,
        })
      );
    } catch (error) {
      console.error('[EMOTIONAL_STATE] Failed to save painpoints:', error);
    }

    // Navigate to next screen (US-1.3: Insight Reflection)
    // TODO: Send selected_painpoints to backend (lightweight API call)
    router.push('/(onboarding)/insight-reflection');
  }, [selectedPainpoints]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <ScrollView
        contentContainerStyle={{ paddingVertical: spacing[6], paddingHorizontal: spacing[4] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: spacing[6] }}>
          <Heading
            variant="displayLg"
            style={{
              color: colors.text.primary,
              textAlign: 'center',
              marginBottom: spacing[2],
            }}
          >
            What's holding you back?
          </Heading>
          <Body
            style={{
              color: colors.text.secondary,
              textAlign: 'center',
            }}
          >
            Pick 1-2 that you're struggling with most right now
          </Body>
        </View>

        {/* Painpoint Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing[3] }}>
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
          <View style={{ alignItems: 'center', marginTop: spacing[6] }}>
            <Body
              style={{
                color: colors.text.muted,
                textAlign: 'center',
                marginBottom: spacing[3],
              }}
            >
              You can optionally add one more
            </Body>
          </View>
        )}

        {/* Continue Button */}
        <View style={{ width: '100%', marginTop: spacing[6] }}>
          <Button
            variant="primary"
            onPress={handleContinue}
            disabled={selectedPainpoints.length === 0}
          >
            Continue
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
