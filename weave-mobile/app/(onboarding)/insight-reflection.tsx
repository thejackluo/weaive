/**
 * Symptom Insight Screen (Dynamic Mirror)
 *
 * Story 1.3: Shows powerful reflection of user's symptoms based on selected painpoints
 * PRD US-1.3: Symptom Insight Screen
 *
 * Features:
 * - Display 1-3 symptom cards in swipeable carousel
 * - One card at a time with pagination dots
 * - Icons representing each symptom
 * - Next button appears after viewing all cards
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SymbolView } from 'expo-symbols';

import { useOnboardingStore } from '@/stores/onboardingStore';
import {
  getSymptomContent,
  FALLBACK_SYMPTOM,
  type SymptomContent,
} from '@/constants/symptomContent';
import { trackSymptomInsightShown } from '@/services/analytics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// =============================================================================
// COMPONENTS
// =============================================================================

interface SymptomCardProps {
  content: SymptomContent;
}

/**
 * Individual symptom card with icon and text
 */
function SymptomCard({ content }: SymptomCardProps) {
  return (
    <View
      style={{
        width: SCREEN_WIDTH,
        paddingHorizontal: 24,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: '100%',
          borderRadius: 20,
          padding: 32,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          minHeight: 400,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Icon */}
        <View style={{ marginBottom: 24 }}>
          <SymbolView
            name={content.icon as any}
            size={64}
            tintColor="#FFFFFF"
          />
        </View>

        {/* Title */}
        <Text
          style={{
            fontSize: 32,
            fontWeight: '700',
            color: '#FFFFFF',
            marginBottom: 24,
            textAlign: 'center',
            letterSpacing: -1,
          }}
          accessibilityRole="header"
        >
          {content.title}
        </Text>

        {/* Description */}
        <Text
          style={{
            fontSize: 17,
            lineHeight: 26,
            color: '#A3A3A3',
            textAlign: 'center',
            fontWeight: '400',
          }}
        >
          {content.text}
        </Text>
      </View>
    </View>
  );
}

/**
 * Pagination dots
 */
interface PaginationDotsProps {
  total: number;
  activeIndex: number;
}

function PaginationDots({ total, activeIndex }: PaginationDotsProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 24,
      }}
    >
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={{
            width: index === activeIndex ? 24 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: index === activeIndex ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)',
          }}
        />
      ))}
    </View>
  );
}

/**
 * Continue CTA Button
 */
interface CTAButtonProps {
  onPress: () => void;
  disabled: boolean;
}

function CTAButton({ onPress, disabled }: CTAButtonProps) {
  return (
    <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
      <Pressable
        style={{
          backgroundColor: disabled ? 'rgba(255, 255, 255, 0.3)' : '#FFFFFF',
          height: 56,
          borderRadius: 12,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        accessibilityLabel="Continue to next step"
        accessibilityRole="button"
      >
        <Text style={{ color: disabled ? 'rgba(0, 0, 0, 0.4)' : '#000000', fontSize: 16, fontWeight: '600' }}>
          Next →
        </Text>
      </Pressable>
    </View>
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

  // State for carousel
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewedIndices, setViewedIndices] = useState<Set<number>>(new Set([0]));
  const flatListRef = useRef<FlatList>(null);

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
  const symptomContents =
    selectedPainpoints.length > 0 ? getSymptomContent(selectedPainpoints) : [FALLBACK_SYMPTOM];

  console.log('[RENDER] Symptom contents to render:', symptomContents);
  console.log('[RENDER] Number of cards:', symptomContents.length);

  // Handle scroll to track viewed cards
  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
    setViewedIndices((prev) => new Set(prev).add(index));
  };

  // Check if all cards have been viewed
  const allCardsViewed = viewedIndices.size === symptomContents.length;

  // Handle continue button
  const handleContinue = () => {
    router.push('/(onboarding)/weave-solution');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 32 }}>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 28,
              fontWeight: '700',
              color: '#FFFFFF',
              letterSpacing: -0.5,
            }}
            accessibilityRole="header"
          >
            Why this feels so hard
          </Text>
        </View>

        {/* Swipeable Cards */}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <FlatList
            ref={flatListRef}
            data={symptomContents}
            renderItem={({ item }) => <SymptomCard content={item} />}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
            snapToAlignment="center"
          />
        </View>

        {/* Pagination Dots */}
        <PaginationDots total={symptomContents.length} activeIndex={currentIndex} />

        {/* Continue Button - Always visible, disabled until all cards viewed */}
        <CTAButton onPress={handleContinue} disabled={!allCardsViewed} />
      </View>
    </SafeAreaView>
  );
}
