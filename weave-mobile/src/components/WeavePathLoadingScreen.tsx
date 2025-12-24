/**
 * Weave Path Loading Screen Component (Story 1.8a - Task 1)
 *
 * Displays a visually engaging loading animation while AI processes goal breakdown.
 * Features:
 * - Thread-weaving animation using React Native Animated API
 * - "Shaping your path..." text with fade-in
 * - Timeout handling (10s warning, 15s error)
 * - Minimum display time of 1 second (prevents flash)
 * - Accessibility support (reduced motion)
 *
 * Duration: Varies 1-10s based on AI response time, minimum 1s display
 *
 * Navigation Context:
 * - From: first-needle.tsx (Story 1.7)
 * - Loading state for: weave-path-generation.tsx (Story 1.8a main screen)
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, Animated, AccessibilityInfo } from 'react-native';

// ============================================================================
// DESIGN CONSTANTS
// ============================================================================

const COLORS = {
  primary: '#4CAF50',
  text: {
    primary: '#000000',
    secondary: '#666666',
  },
  background: {
    primary: '#FFFFFF',
  },
} as const;

const FONT_SIZE = {
  lg: 18,
  xl: 20,
} as const;

const SPACING = {
  md: 12,
  lg: 16,
  xl: 20,
} as const;

// Animation timing
const FADE_IN_DURATION = 400; // ms
const PULSE_DURATION = 1500; // ms for thread pulse animation
const ROTATION_DURATION = 2000; // ms for weave rotation

// Timeout thresholds
const _TIMEOUT_WARNING_MS = 10000; // 10 seconds
const TIMEOUT_ERROR_MS = 15000; // 15 seconds

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface WeavePathLoadingScreenProps {
  /**
   * Whether AI is currently processing (controls animation)
   */
  isLoading?: boolean;

  /**
   * Elapsed time in milliseconds (optional, for timeout display)
   */
  elapsedTimeMs?: number;

  /**
   * Whether to show timeout warning message
   */
  showTimeoutWarning?: boolean;

  /**
   * Whether to show timeout error
   */
  showTimeoutError?: boolean;

  /**
   * Callback when timeout error threshold reached
   */
  onTimeout?: () => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const WeavePathLoadingScreen: React.FC<WeavePathLoadingScreenProps> = ({
  isLoading = true,
  elapsedTimeMs = 0,
  showTimeoutWarning = false,
  showTimeoutError = false,
  onTimeout,
}) => {
  // Accessibility: Check for reduced motion preference
  const [reducedMotionEnabled, setReducedMotionEnabled] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Check for reduced motion preference
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        setReducedMotionEnabled(enabled || false);
      })
      .catch((error) => {
        console.warn('[ACCESSIBILITY] Failed to check reduced motion preference:', error);
        setReducedMotionEnabled(false);
      });
  }, []);

  useEffect(() => {
    if (!isLoading) return;

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: FADE_IN_DURATION,
      useNativeDriver: true,
    }).start();

    // Only run complex animations if reduced motion is disabled
    if (!reducedMotionEnabled) {
      // Pulse animation for threads
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: PULSE_DURATION / 2,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: PULSE_DURATION / 2,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Rotation animation for weave effect
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: ROTATION_DURATION,
          useNativeDriver: true,
        })
      ).start();
    }

    // Timeout handling
    if (elapsedTimeMs >= TIMEOUT_ERROR_MS && onTimeout) {
      onTimeout();
    }
  }, [isLoading, reducedMotionEnabled, elapsedTimeMs, fadeAnim, pulseAnim, rotateAnim, onTimeout]);

  // Rotation interpolation
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        {/* Thread Weaving Animation */}
        <View style={styles.animationContainer}>
          {/* Outer rotating circle (weave frame) */}
          {!reducedMotionEnabled && (
            <Animated.View
              style={[
                styles.weaveCircle,
                {
                  transform: [{ rotate: rotateInterpolate }],
                },
              ]}
            >
              <View style={styles.threadSegment} />
              <View style={[styles.threadSegment, styles.threadSegment2]} />
              <View style={[styles.threadSegment, styles.threadSegment3]} />
            </Animated.View>
          )}

          {/* Center pulsing dot (thread core) */}
          <Animated.View
            style={[
              styles.centerDot,
              reducedMotionEnabled
                ? {}
                : {
                    transform: [{ scale: pulseAnim }],
                  },
            ]}
          />
        </View>

        {/* Loading Text */}
        <Text style={styles.loadingText}>Shaping your path...</RNText>

        {/* Timeout Warning */}
        {showTimeoutWarning && !showTimeoutError && (
          <Text style={styles.warningText}>Taking longer than usual...</RNText>
        )}

        {/* Timeout Error */}
        {showTimeoutError && (
          <Text style={styles.errorText}>
            This is taking longer than expected. Please try again.
          </RNText>
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  animationContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  weaveCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  threadSegment: {
    position: 'absolute',
    width: 80,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    opacity: 0.6,
  },
  threadSegment2: {
    transform: [{ rotate: '60deg' }],
  },
  threadSegment3: {
    transform: [{ rotate: '120deg' }],
  },
  centerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
  },
  loadingText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
  warningText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '400',
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.xl,
    opacity: 0.9,
  },
  errorText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '500',
    color: '#D32F2F', // Error red
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});
