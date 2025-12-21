/**
 * Daily Reflection Introduction Screen (Story 1.8c)
 *
 * Introduces daily reflections as a core feature after user completes goal breakdown.
 * Features:
 * - Single-screen introduction
 * - Explains the role of daily reflections
 * - Sets expectations for the daily check-in experience
 * - AsyncStorage flag to prevent re-display (one-time only during onboarding)
 *
 * Navigation:
 * - From: weave-path-generation.tsx (Story 1.8a) - After goal acceptance
 * - To: first-daily-reflection.tsx (Story 1.9)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  AccessibilityInfo,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// DESIGN CONSTANTS
// ============================================================================

const COLORS = {
  primary: '#4CAF50',
  text: {
    primary: '#1a1a1a',
    secondary: '#333333',
    tertiary: '#666666',
  },
  background: {
    primary: '#FFFFFF',
  },
} as const;

const FONT_SIZE = {
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 26,
} as const;

const SPACING = {
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

const ICON_SIZE = 80;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DailyReflectionIntro() {
  const router = useRouter();

  // Animation state
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  // Accessibility: Check for reduced motion preference
  const [_reducedMotionEnabled, setReducedMotionEnabled] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        setReducedMotionEnabled(enabled || false);

        // Animate entrance if reduced motion is disabled
        if (!enabled) {
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              tension: 50,
              friction: 7,
              useNativeDriver: true,
            }),
          ]).start();
        } else {
          // Skip animation if reduced motion is enabled
          fadeAnim.setValue(1);
          scaleAnim.setValue(1);
        }
      })
      .catch((error) => {
        console.warn('[ACCESSIBILITY] Failed to check reduced motion preference:', error);
        setReducedMotionEnabled(false);
        // Default: show animation
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]).start();
      });

    // TODO (Story 0-4): Track analytics event 'daily_reflection_intro_viewed'
    // Example: analytics.track('daily_reflection_intro_viewed', {
    //   user_id: userId,
    //   timestamp: new Date().toISOString(),
    //   first_needle_created: true
    // });

    if (__DEV__) {
      console.log('[DAILY_REFLECTION_INTRO] Screen viewed');
    }
  }, [fadeAnim, scaleAnim]);

  /**
   * Handle CTA button press
   * - Marks intro as seen in AsyncStorage
   * - Navigates to Story 1.9 (First Daily Reflection)
   */
  const handleContinue = async () => {
    try {
      // Mark intro as seen (prevents re-display)
      await AsyncStorage.setItem('daily_reflection_intro_seen', 'true');

      // TODO (Story 0-4): Track analytics event 'daily_reflection_intro_completed'
      // Example: analytics.track('daily_reflection_intro_completed', {
      //   user_id: userId,
      //   timestamp: new Date().toISOString(),
      //   first_needle_created: true
      // });

      if (__DEV__) {
        console.log('[DAILY_REFLECTION_INTRO] User continued to first reflection');
      }

      // Navigate to Story 1.9 (First Daily Reflection)
      router.push('/(onboarding)/first-daily-reflection');

      // Accessible announcement for screen readers
      AccessibilityInfo.announceForAccessibility('Navigating to your first daily reflection.');
    } catch (error) {
      console.error('[DAILY_REFLECTION_INTRO] Failed to save AsyncStorage flag:', error);
      // Continue navigation even if AsyncStorage fails
      router.push('/(onboarding)/first-daily-reflection');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Icon - Journal/Reflection */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.icon} accessibilityLabel="Journal icon">
            📝
          </Text>
        </Animated.View>

        {/* Title */}
        <Text style={styles.title}>One more thing: your daily check-ins</Text>

        {/* Body Text - 3 Paragraphs */}
        <View style={styles.bodyContainer}>
          <Text style={styles.bodyText}>
            Completing binds is one way to strengthen your commitment. Daily reflection is the
            other.
          </Text>

          <Text style={[styles.bodyText, styles.bodyTextSpacing]}>
            Each evening, Weave will ask: How did today go? What's on your mind? What matters
            tomorrow?
          </Text>

          <Text style={[styles.bodyText, styles.bodyTextSpacing]}>
            Your honest answers help Weave understand you better — and shape tomorrow's path with
            you.
          </Text>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          onPress={handleContinue}
          style={styles.ctaButton}
          accessibilityRole="button"
          accessibilityLabel="Got it, let's begin"
          accessibilityHint="Continue to your first daily reflection"
        >
          <Text style={styles.ctaButtonText}>Got it — let's begin</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  icon: {
    fontSize: ICON_SIZE,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
    lineHeight: 32,
  },
  bodyContainer: {
    marginBottom: 48,
  },
  bodyText: {
    fontSize: FONT_SIZE.md + 1, // 17px
    lineHeight: 26,
    color: COLORS.text.secondary,
    opacity: 0.9,
    textAlign: 'left',
  },
  bodyTextSpacing: {
    marginTop: SPACING.xl,
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 48, // Accessibility: minimum touch target
  },
  ctaButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
