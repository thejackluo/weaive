/**
 * Weave Solution Screen (Dynamic "Here's What Changes Now")
 *
 * Story 1.4: Shows how Weave solves user's symptoms based on selected painpoints
 * PRD US-1.4: Weave Solution Screen
 *
 * Features:
 * - Display 1-3 solution cards in swipeable carousel
 * - One card at a time with pagination dots
 * - Icons representing each solution
 * - Next button appears after viewing all cards
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, Pressable, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useOnboardingStore } from '@/stores/onboardingStore';
import {
  getSolutionContent,
  FALLBACK_SOLUTION,
  type SolutionContent,
} from '@/constants/solutionContent';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// =============================================================================
// COMPONENTS
// =============================================================================

interface SolutionCardProps {
  content: SolutionContent;
  showButton: boolean;
}

/**
 * Individual solution card with screenshot and text
 */
function SolutionCard({ content, showButton }: SolutionCardProps) {
  // Map screenshot filenames to require statements
  const screenshotMap: Record<string, any> = {
    'solution-screenshot-1.png': require('../../assets/images/solution-screenshot-1.png'),
    'solution-screenshot-4.png': require('../../assets/images/solution-screenshot-4.png'),
    'solution-screenshot-5.png': require('../../assets/images/solution-screenshot-5.png'),
    'solution-screenshot-6.png': require('../../assets/images/solution-screenshot-6.png'),
    'solution-screenshot-7.png': require('../../assets/images/solution-screenshot-7.png'),
    'solution-screenshot-8.png': require('../../assets/images/solution-screenshot-8.png'),
    'IMG_2656.jpg': require('../../assets/images/IMG_2656.jpg'),
    'IMG_2657.png': require('../../assets/images/IMG_2657.png'),
    'IMG_2658.png': require('../../assets/images/IMG_2658.png'),
  };

  // Check if dual screenshots (side by side)
  const isDualScreenshot = Array.isArray(content.screenshot);
  const screenshots: string[] = isDualScreenshot ? content.screenshot : [content.screenshot];

  return (
    <View
      style={{
        width: SCREEN_WIDTH,
        paddingHorizontal: 32,
        alignItems: 'center',
        paddingTop: showButton ? 20 : 0,
      }}
    >
      {/* App Screenshot(s) */}
      <View
        style={{
          flexDirection: isDualScreenshot ? 'row' : 'column',
          gap: isDualScreenshot ? 12 : 0,
          width: isDualScreenshot ? '95%' : (showButton ? '60%' : '65%'),
          marginBottom: showButton ? 24 : 32,
        }}
      >
        {screenshots.map((screenshot, index) => (
          <View
            key={screenshot}
            style={{
              flex: isDualScreenshot ? 1 : undefined,
              width: isDualScreenshot ? undefined : '100%',
              aspectRatio: 0.46,
              borderRadius: 20,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.2)',
            }}
          >
            <Image
              source={screenshotMap[screenshot]}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>
        ))}
      </View>

      {/* Title */}
      <Text
        style={{
          fontSize: 28,
          fontWeight: '700',
          color: '#FFFFFF',
          marginBottom: 12,
          textAlign: 'center',
          letterSpacing: -0.5,
        }}
        accessibilityRole="header"
      >
        {content.title}
      </Text>

      {/* Description */}
      <Text
        style={{
          fontSize: 16,
          lineHeight: 24,
          color: '#A3A3A3',
          textAlign: 'center',
          fontWeight: '400',
          maxWidth: 300,
        }}
      >
        {content.text}
      </Text>
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
        accessibilityLabel="Show me the app"
        accessibilityRole="button"
      >
        <Text style={{ color: disabled ? 'rgba(0, 0, 0, 0.4)' : '#000000', fontSize: 16, fontWeight: '600' }}>
          Show me →
        </Text>
      </Pressable>
    </View>
  );
}

// =============================================================================
// MAIN SCREEN
// =============================================================================

export default function WeaveSolutionScreen() {
  // Get selected painpoints from store (from Story 1.2)
  const { selectedPainpoints } = useOnboardingStore();

  // State for carousel
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewedIndices, setViewedIndices] = useState<Set<number>>(new Set([0]));
  const flatListRef = useRef<FlatList>(null);

  // Get solution content based on selected painpoints
  let solutionContents: SolutionContent[];
  try {
    solutionContents =
      selectedPainpoints.length > 0 ? getSolutionContent(selectedPainpoints) : [FALLBACK_SOLUTION];
  } catch (error) {
    console.error('Error getting solution content:', error);
    solutionContents = [FALLBACK_SOLUTION];
  }

  // Handle scroll to track viewed cards
  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
    setViewedIndices((prev) => new Set(prev).add(index));
  };

  // Check if all cards have been viewed
  const allCardsViewed = viewedIndices.size === solutionContents.length;

  // Handle continue button
  const handleContinue = () => {
    try {
      // Navigate to main app - user is already authenticated from authentication screen
      router.push('/(tabs)');
    } catch (error) {
      console.error('Error navigating from solution screen:', error);
    }
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
            How Weave helps
          </Text>
        </View>

        {/* Swipeable Cards */}
        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={solutionContents}
            renderItem={({ item }) => <SolutionCard content={item} showButton={allCardsViewed} />}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
            snapToAlignment="start"
            extraData={allCardsViewed}
          />
        </View>

        {/* Pagination Dots */}
        <PaginationDots total={solutionContents.length} activeIndex={currentIndex} />

        {/* Continue Button - Always visible, disabled until all cards viewed */}
        <CTAButton onPress={handleContinue} disabled={!allCardsViewed} />
      </View>
    </SafeAreaView>
  );
}
