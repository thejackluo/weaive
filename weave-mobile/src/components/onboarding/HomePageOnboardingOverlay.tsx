/**
 * HomePageOnboardingOverlay - Interactive multi-step onboarding tour for home page
 *
 * Step 1: Show intro popup "This is your Home Page"
 * Step 2: Dismiss popup, highlight first bind with spotlight, user clicks bind
 * Step 3: After bind interaction, show "Complete your binds" popup
 * Step 4: Highlight daily check-in button, user clicks it
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { Text } from '@/design-system';
import { useTheme } from '@/design-system/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type TourStep = 'intro' | 'highlight_bind' | 'bind_completed' | 'highlight_checkin';

interface HomePageOnboardingOverlayProps {
  visible: boolean;
  currentStep: TourStep;
  checkinPosition?: { x: number; y: number; width: number; height: number };
  onNext: () => void;
  onCheckinClick: () => void;
}

export function HomePageOnboardingOverlay({
  visible,
  currentStep,
  checkinPosition,
  onNext,
  onCheckinClick,
}: HomePageOnboardingOverlayProps) {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const shimmerAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Shimmer animation for check-in highlight (same as bind highlighting)
  useEffect(() => {
    if (currentStep === 'highlight_checkin') {
      const shimmer = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      );
      shimmer.start();
      return () => shimmer.stop();
    }
  }, [currentStep]);

  if (!visible) {
    return null;
  }

  const handleNextClick = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNext();
  };

  // Step 1: Intro popup
  if (currentStep === 'intro') {
    return (
      <View style={styles.overlay}>
        {/* Semi-transparent backdrop */}
        <View style={styles.darkBackdrop} />

        {/* Top-positioned Tooltip */}
        <Animated.View
          style={[
            styles.topTooltipContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View
            style={[
              styles.tooltip,
              {
                backgroundColor: colors.background.secondary,
                borderColor: '#FFFFFF',
                borderWidth: 2,
              },
            ]}
          >
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="home" size={32} color="#FFFFFF" />
            </View>

            {/* Message */}
            <Text
              variant="textLg"
              weight="semibold"
              style={[styles.message, { color: colors.text.primary }]}
            >
              This is your Home Page
            </Text>

            {/* Description */}
            <Text
              variant="textBase"
              style={[styles.description, { color: colors.text.secondary }]}
            >
              Where you'll see your tasks for the day
            </Text>

            {/* Next Button */}
            <Pressable
              onPress={handleNextClick}
              style={[styles.button, { backgroundColor: '#FFFFFF' }]}
            >
              <Text
                variant="textBase"
                weight="semibold"
                style={{ color: '#000000' }}
              >
                Next
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#000000" />
            </Pressable>
          </View>
        </Animated.View>
      </View>
    );
  }

  // Step 2: Highlight first bind with shimmer (handled by BindItem component)
  // Interaction blocking is handled at component level (disabled props)
  if (currentStep === 'highlight_bind') {
    return (
      <View style={styles.overlay} pointerEvents="box-none">
        {/* Dimmed visual overlay - purely visual */}
        <View style={styles.dimmedBackdrop} pointerEvents="none" />
      </View>
    );
  }

  // Step 3: bind_completed removed - popup now shows on bind screen itself

  // Step 4: Highlight daily check-in button (no tooltip yet - shows after click)
  if (currentStep === 'highlight_checkin') {
    // Don't render anything if position not available yet
    if (!checkinPosition) {
      return (
        <View style={styles.overlay} pointerEvents="box-none">
          <View style={styles.dimmedBackdrop} pointerEvents="none" />
        </View>
      );
    }

    return (
      <View style={styles.overlay} pointerEvents="box-none">
        {/* Dimmed visual overlay - lighter and allows scroll */}
        <View style={styles.dimmedBackdrop} pointerEvents="none" />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  darkBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  blockingBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  dimmedBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  centeredTooltipContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: SCREEN_HEIGHT * 0.25,
  },
  topTooltipContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 100,
  },
  tooltip: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  blockingArea: {
    // Transparent blocking area - intercepts taps but allows scroll
    backgroundColor: 'transparent',
  },
  clickableArea: {
    // Transparent clickable area over highlighted element
  },
});
