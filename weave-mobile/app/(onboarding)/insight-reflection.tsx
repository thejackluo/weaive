/**
 * Symptom Insight Screen (Dynamic Mirror)
 *
 * Story 1.3: Shows powerful reflection of user's symptoms based on selected painpoints
 * PRD US-1.3: Symptom Insight Screen
 *
 * Features:
 * - Display 1-2 symptom cards based on selection from Story 1.2
 * - Glass-paneled cards with subtle animations
 * - Fade-in for first card, slide-up for second (200ms delay)
 * - Reduced motion accessibility support
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, AccessibilityInfo } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  FadeIn,
  SlideInUp,
  FadeInDown,
  useAnimatedStyle as _useAnimatedStyle,
  withTiming as _withTiming,
  withDelay as _withDelay,
} from 'react-native-reanimated';

import { useOnboardingStore } from '@/stores/onboardingStore';
import {
  getSymptomContent,
  FALLBACK_SYMPTOM,
  type SymptomContent,
} from '@/constants/symptomContent';
import { trackSymptomInsightShown } from '@/services/analytics';

// =============================================================================
// COMPONENTS
// =============================================================================

interface SymptomCardProps {
  content: SymptomContent;
  index: number;
  reduceMotion: boolean;
}

/**
 * Glass-paneled symptom card with animations
 * Implements AC #3: Glass effect with shadows and gradients
 * Implements AC #4: Animations (fade-in, slide-up with 200ms delay)
 */
function SymptomCard({ content, index, reduceMotion }: SymptomCardProps) {
  console.log('[CARD] Rendering SymptomCard', index, 'with content:', content.id);

  // Animation configuration based on index
  const entering = reduceMotion
    ? undefined
    : index === 0
      ? FadeIn.duration(400)
      : SlideInUp.duration(400).delay(200);

  console.log(
    '[CARD] Animation config for card',
    index,
    ':',
    entering ? 'animated' : 'no animation'
  );

  return (
    <Animated.View
      entering={entering}
      style={{
        // All styling in style prop to avoid NativeWind re-render issues
        marginBottom: 16,
        borderRadius: 16,
        padding: 24,
        backgroundColor: '#ffffff',
        borderWidth: 2,
        borderColor: '#3b82f6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        minHeight: 150,
      }}
    >
      {/* Content */}
      <View style={{ position: 'relative', zIndex: 10 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '500',
            color: '#171717',
            marginBottom: 12,
          }}
          accessibilityRole="header"
        >
          {content.title}
        </Text>
        <Text
          style={{
            fontSize: 16,
            lineHeight: 24,
            color: '#404040',
            opacity: 0.9,
          }}
        >
          {content.text}
        </Text>
      </View>
    </Animated.View>
  );
}

/**
 * Continue CTA Button
 * Implements AC #3: Full-width button floating above safe area
 * Implements AC #4: Appears after cards are visible
 */
interface CTAButtonProps {
  onPress: () => void;
  reduceMotion: boolean;
  delayMs: number;
}

function CTAButton({ onPress, reduceMotion, delayMs }: CTAButtonProps) {
  const entering = reduceMotion ? undefined : FadeInDown.duration(300).delay(delayMs);

  return (
    <Animated.View entering={entering} style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
      <Pressable
        style={{
          backgroundColor: '#3b82f6',
          height: 56,
          borderRadius: 12,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={onPress}
        accessibilityLabel="Continue to next step"
        accessibilityRole="button"
      >
        <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>Next →</Text>
      </Pressable>
    </Animated.View>
  );
}

// =============================================================================
// MAIN SCREEN
// =============================================================================

export default function InsightReflectionScreen() {
  console.log('[MOUNT] InsightReflectionScreen mounted');

  // Get selected painpoints from store (from Story 1.2)
  const { selectedPainpoints } = useOnboardingStore();
  console.log('[STATE] selectedPainpoints from store:', selectedPainpoints);

  // Accessibility: Check if user has reduced motion enabled
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    console.log('[EFFECT] Checking reduce motion');
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      console.log('[A11Y] Reduce motion enabled:', enabled);
      setReduceMotion(enabled ?? false);
    });
  }, []);

  // Track analytics event when screen is shown (Story 1.3 - AC6)
  useEffect(() => {
    const trackEvent = async () => {
      try {
        await trackSymptomInsightShown(selectedPainpoints);
        console.log('[Analytics] Symptom insight shown event tracked');
      } catch (error) {
        console.error('[Analytics] Failed to track symptom insight:', error);
      }
    };

    if (selectedPainpoints.length > 0) {
      trackEvent();
    }
  }, [selectedPainpoints]);

  // Get symptom content based on selected painpoints
  // Implements AC #2: Dynamic copy mapping
  // Implements AC #7: Edge case handling (fallback for missing selection)
  const symptomContents =
    selectedPainpoints.length > 0 ? getSymptomContent(selectedPainpoints) : [FALLBACK_SYMPTOM];

  console.log('[RENDER] Symptom contents to render:', symptomContents);
  console.log('[RENDER] Number of cards:', symptomContents.length);

  // Debug: Log painpoints to help troubleshoot
  useEffect(() => {
    console.log('[EFFECT] Story 1.3 - Selected painpoints:', selectedPainpoints);
    console.log('[EFFECT] Story 1.3 - Symptom contents:', symptomContents);
    console.log('[EFFECT] Will render', symptomContents.length, 'cards');
  }, [selectedPainpoints, symptomContents]);

  // Calculate CTA delay based on number of cards
  // CTA appears after both cards are visible
  // Card 1: 0ms, Card 2: 200ms delay, CTA: +300ms after last card
  const ctaDelay = symptomContents.length === 2 ? 500 : 400;

  // Handle continue button
  const handleContinue = () => {
    // Navigate to Story 1.4: Weave Solution Screen
    // TODO: Track analytics event (Task 4, backend integration)
    // TODO: Store initial_symptoms in user_profiles (Task 4, backend integration)
    router.push('/(onboarding)/weave-solution');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ flex: 1 }}>
        {/* Header - Implements AC #1: Title "Why this feels so hard" */}
        <View style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 }}>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 28,
              fontWeight: '600',
              color: '#171717',
              letterSpacing: -0.5,
            }}
            accessibilityRole="header"
          >
            Why this feels so hard
          </Text>
        </View>

        {/* Symptom Cards */}
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16 }}
        >
          {/* Implements AC #1: Display 1-2 symptom cards */}
          {/* Implements AC #7: Handle 1 or 2 painpoints */}
          {symptomContents.map((content, index) => (
            <SymptomCard
              key={content.id}
              content={content}
              index={index}
              reduceMotion={reduceMotion}
            />
          ))}

          {/* Spacer for bottom CTA */}
          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Continue Button */}
        <CTAButton onPress={handleContinue} reduceMotion={reduceMotion} delayMs={ctaDelay} />
      </View>
    </SafeAreaView>
  );
}
