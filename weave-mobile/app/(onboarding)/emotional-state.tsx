/**
 * Emotional State Selection Screen
 *
 * Step 1.2 of Onboarding: User selects emotional painpoint
 * PRD US-1.2: Painpoint Identification
 *
 * TODO: Add error boundary wrapper (global error handling story)
 */

import React, { useCallback, useState, useEffect } from 'react';
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
];

// =============================================================================
// COMPONENT
// =============================================================================

export default function EmotionalStateScreen() {
  const { colors, spacing } = useTheme();

  // State for user's name
  const [userName, setUserName] = useState<string>('');

  // Load user's name from AsyncStorage
  useEffect(() => {
    const loadUserName = async () => {
      try {
        const onboardingDataStr = await AsyncStorage.getItem('onboarding_data');
        if (onboardingDataStr) {
          const data = JSON.parse(onboardingDataStr);
          if (data.preferred_name) {
            setUserName(data.preferred_name);
          }
        }
      } catch (error) {
        console.error('[EMOTIONAL_STATE] Failed to load user name:', error);
      }
    };
    loadUserName();
  }, []);

  // Get selection from zustand store
  // Note: PRD specifies storing in user_profiles.json - will be handled by backend
  const { selectedPainpoints, setSelectedPainpoints } = useOnboardingStore();

  // Handle card press - allow all three selections
  const handleCardPress = useCallback(
    (id: string) => {
      const isCurrentlySelected = selectedPainpoints.includes(id);

      if (isCurrentlySelected) {
        // Deselect
        setSelectedPainpoints(selectedPainpoints.filter((p) => p !== id));
      } else {
        // Select - allow up to 3 selections
        if (selectedPainpoints.length < 3) {
          setSelectedPainpoints([...selectedPainpoints, id]);
        }
      }
    },
    [selectedPainpoints, setSelectedPainpoints]
  );

  // Handle continue button
  const handleContinue = useCallback(async () => {
    // Save selected painpoints to AsyncStorage for Story 1.7
    // Merge with existing data (preserve user's name)
    try {
      const existingDataStr = await AsyncStorage.getItem('onboarding_data');
      const existingData = existingDataStr ? JSON.parse(existingDataStr) : {};

      await AsyncStorage.setItem(
        'onboarding_data',
        JSON.stringify({
          ...existingData,
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
        <View style={{ alignItems: 'center', marginBottom: spacing[8], marginTop: spacing[4] }}>
          <Heading
            variant="display2xl"
            style={{
              color: colors.text.primary,
              textAlign: 'center',
              fontSize: 28,
              fontWeight: '700',
            }}
          >
            {userName ? `What's holding you back, ${userName}?` : "What's holding you back?"}
          </Heading>
        </View>

        {/* Painpoint Stack */}
        <View style={{ width: '100%' }}>
          {PAINPOINTS.map((painpoint, index) => (
            <View key={painpoint.id} style={{ marginBottom: index < PAINPOINTS.length - 1 ? spacing[3] : 0 }}>
              <PainpointCard
                painpoint={painpoint}
                isSelected={selectedPainpoints.includes(painpoint.id)}
                onPress={handleCardPress}
                style={{ width: '100%' }}
              />
            </View>
          ))}
        </View>

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
