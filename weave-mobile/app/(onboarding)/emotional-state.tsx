/**
 * Emotional State Selection Screen
 *
 * Step 1.2 of Onboarding: User selects 1-2 emotional painpoints
 * Stores selection in zustand onboarding store
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
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
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            What's holding you back?
          </Text>
          <Text style={styles.subtitle}>
            Choose 1-2 areas you want to improve
          </Text>
        </View>

        {/* Painpoint Grid */}
        <View style={styles.grid}>
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
          <View style={styles.validationContainer}>
            <Text style={styles.validationText}>
              Choose up to 2
            </Text>
          </View>
        )}

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={[
              styles.button,
              !canContinue && styles.buttonDisabled,
            ]}
            disabled={!canContinue}
            onPress={handleContinue}
            accessibilityLabel="Continue to next step"
            accessibilityRole="button"
            accessibilityState={{ disabled: !canContinue }}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#525252',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  validationContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  validationText: {
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 14,
    color: '#DC2626',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 24,
  },
  button: {
    backgroundColor: '#3B72F6',
    height: 48,
    borderRadius: 8,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#E5E5E5',
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
