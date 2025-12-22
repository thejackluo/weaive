/**
 * TypingIndicator - Animated Typing Dots (Story 6.1)
 *
 * Features:
 * - 3 bouncing dots with stagger delay
 * - Loop animation (500ms per cycle)
 * - Subtle scale + opacity changes
 * - Glassmorphism container
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

export default function TypingIndicator() {
  const dot1Scale = useSharedValue(1);
  const dot2Scale = useSharedValue(1);
  const dot3Scale = useSharedValue(1);

  useEffect(() => {
    // Bouncing animation with stagger
    const animation = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 300 }),
        withTiming(1, { duration: 300 })
      ),
      -1, // Infinite loop
      false
    );

    dot1Scale.value = animation;
    dot2Scale.value = withDelay(100, animation);
    dot3Scale.value = withDelay(200, animation);
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot1Scale.value }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot2Scale.value }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot3Scale.value }],
  }));

  return (
    <View style={styles.container}>
      <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, dot1Style]} />
          <Animated.View style={[styles.dot, dot2Style]} />
          <Animated.View style={[styles.dot, dot3Style]} />
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    marginVertical: 6,
  },
  blurContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(167, 139, 250, 0.15)', // Purple translucent
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#a78bfa', // Purple
  },
});
