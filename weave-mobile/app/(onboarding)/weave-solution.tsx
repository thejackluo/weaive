/**
 * Weave Solution Screen (Dynamic "Here's What Changes Now")
 *
 * Story 1.4: Shows how Weave solves user's symptoms based on selected painpoints
 * PRD US-1.4: Weave Solution Screen
 *
 * Features:
 * - Display 1-2 solution cards based on selection from Story 1.2
 * - Glass-paneled cards with subtle animations
 * - Fade-in for first card, slide-up for second (150-200ms delay)
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
} from 'react-native-reanimated';

import { useOnboardingStore } from '@/stores/onboardingStore';
import {
  getSolutionContent,
  FALLBACK_SOLUTION,
  type SolutionContent
} from '@/constants/solutionContent';

// =============================================================================
// COMPONENTS
// =============================================================================

interface SolutionCardProps {
  content: SolutionContent;
  index: number;
  reduceMotion: boolean;
}

/**
 * Glass-paneled solution card with animations
 * Implements AC #3: Glass effect with shadows
 * Implements AC #4: Animations (fade-in, slide-up with 150-200ms delay)
 */
function SolutionCard({ content, index, reduceMotion }: SolutionCardProps) {
  // Animation configuration based on index
  const entering = reduceMotion
    ? undefined
    : index === 0
    ? FadeIn.duration(400)
    : SlideInUp.duration(400).delay(200);

  return (
    <Animated.View
      entering={entering}
      style={{
        // All styling in style prop to avoid NativeWind issues on iOS
        marginBottom: 16,
        borderRadius: 16,
        padding: 24,
        backgroundColor: '#ffffff',
        borderWidth: 2,
        borderColor: '#10b981',
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
            fontWeight: '600',
            color: '#171717',
            marginBottom: 12,
          }}
          accessibilityRole="header"
          accessibilityHint="Solution describing how Weave addresses your challenge"
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
 * Implements AC #5: CTA "Show me →"
 * Implements AC #4: Appears after cards are visible
 */
interface CTAButtonProps {
  onPress: () => void;
  reduceMotion: boolean;
  delayMs: number;
}

function CTAButton({ onPress, reduceMotion, delayMs }: CTAButtonProps) {
  const entering = reduceMotion
    ? undefined
    : FadeInDown.duration(300).delay(delayMs);

  return (
    <Animated.View entering={entering} style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
      <Pressable
        style={{
          backgroundColor: '#10b981',
          height: 56,
          borderRadius: 12,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={onPress}
        accessibilityLabel="Show me the app"
        accessibilityRole="button"
      >
        <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
          Show me →
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// =============================================================================
// MAIN SCREEN
// =============================================================================

export default function WeaveSolutionScreen() {
  // Get selected painpoints from store (from Story 1.2)
  const { selectedPainpoints } = useOnboardingStore();

  // Accessibility: Check if user has reduced motion enabled
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled ?? false);
    });
  }, []);

  // Get solution content based on selected painpoints
  // Implements AC #1: Dynamic copy mapping
  // Implements AC #7: Edge case handling (fallback for missing selection)
  let solutionContents: SolutionContent[];
  try {
    solutionContents = selectedPainpoints.length > 0
      ? getSolutionContent(selectedPainpoints)
      : [FALLBACK_SOLUTION];
  } catch (error) {
    console.error('Error getting solution content:', error);
    // Fallback to default solution if error occurs
    solutionContents = [FALLBACK_SOLUTION];
  }

  // Track analytics event when screen is shown (AC #6)
  useEffect(() => {
    // TODO: Implement analytics tracking when backend is ready
    // trackEvent('solution_screen_shown', {
    //   painpoints: selectedPainpoints,
    //   solution_count: solutionContents.length,
    //   timestamp: new Date().toISOString()
    // });
  }, []);

  // Calculate CTA delay based on number of cards
  // CTA appears after both cards are visible
  // Card 1: 0ms, Card 2: 200ms delay, CTA: +300ms after last card
  const ctaDelay = solutionContents.length === 2 ? 500 : 400;

  // Handle continue button
  const handleContinue = () => {
    try {
      // Store initial solution categories for future personalization (PRD line 650)
      // TODO: Implement when backend is ready
      // storeSolutionCategories(selectedPainpoints);

      // Navigate to Story 1.5: Authentication
      // TODO: Create authentication screen or update to existing screen
      router.push('/(onboarding)/authentication');
    } catch (error) {
      console.error('Error navigating from solution screen:', error);
      // Fallback: Stay on current screen, show error to user
      // TODO: Add error toast/modal when UI components ready
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0fdf4' }}>
      <View style={{ flex: 1 }}>
        {/* Header - Implements AC #1: Title "How Weave helps" */}
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
            How Weave helps
          </Text>
        </View>

        {/* Solution Cards */}
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16 }}
        >
          {/* Implements AC #1: Display 1-2 solution cards */}
          {/* Implements AC #7: Handle 1 or 2 painpoints */}
          {solutionContents.map((content, index) => (
            <SolutionCard
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
        <CTAButton
          onPress={handleContinue}
          reduceMotion={reduceMotion}
          delayMs={ctaDelay}
        />
      </View>
    </SafeAreaView>
  );
}
