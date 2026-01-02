/**
 * CircularProgress - A circular progress ring component
 * Shows a green ring that fills based on completion percentage
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { Text } from '@/design-system';
import { useTheme } from '@/design-system/theme/ThemeProvider';

interface CircularProgressProps {
  percentage: number; // 0-100
  size?: number; // Diameter of the circle
  strokeWidth?: number; // Thickness of the ring
  label: string; // Main label (e.g., "13%")
  sublabel?: string; // Optional sublabel (e.g., "1/8 tasks")
}

export function CircularProgress({
  percentage,
  size = 160,
  strokeWidth = 8,
  label,
  sublabel,
}: CircularProgressProps) {
  const { colors } = useTheme();

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Subtle pulse animation for the ring
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    // Gentle pulse effect
    pulseScale.value = withRepeat(
      withSequence(withTiming(1.02, { duration: 2000 }), withTiming(1, { duration: 2000 })),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <Animated.View style={[styles.container, { width: size, height: size }, animatedStyle]}>
      {/* Inner shadow circle for depth */}
      <View
        style={[
          styles.innerShadow,
          {
            width: size - strokeWidth * 2,
            height: size - strokeWidth * 2,
            borderRadius: (size - strokeWidth * 2) / 2,
          },
        ]}
      />

      {/* SVG Circular Progress Ring */}
      <Svg width={size} height={size} style={styles.svg}>
        {/* Gradient Definition */}
        <Defs>
          <RadialGradient id="emeraldGradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors.semantic.success.gradientStart} stopOpacity="1" />
            <Stop offset="100%" stopColor={colors.semantic.success.gradientEnd} stopOpacity="1" />
          </RadialGradient>
        </Defs>

        {/* Background Circle (subtle gray) */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress Circle Glow (behind main ring) */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#emeraldGradient)"
          strokeWidth={strokeWidth + 2}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          opacity={0.3}
        />

        {/* Progress Circle (emerald gradient) */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#emeraldGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Center Text */}
      <View style={styles.textContainer}>
        <Text
          style={{
            fontSize: 48,
            fontWeight: '500',
            color: colors.text.primary,
            letterSpacing: -2,
            lineHeight: 48,
            textShadowColor: 'rgba(0, 0, 0, 0.4)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
          }}
        >
          {label}
        </Text>
        {sublabel && (
          <Text
            style={{
              fontSize: 11,
              fontWeight: '600', // Lighter weight for secondary info
              color: colors.text.muted,
              marginTop: 4,
              letterSpacing: -0.3,
              textShadowColor: 'rgba(0, 0, 0, 0.3)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}
          >
            {sublabel}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerShadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  svg: {
    position: 'absolute',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});
