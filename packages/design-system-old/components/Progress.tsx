/**
 * Weave Design System - Progress Components
 *
 * Linear and circular progress indicators
 * Animated fills with color-coded states
 *
 * Usage:
 * <ProgressBar value={75} max={100} />
 * <CircularProgress value={75} size={120} />
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../theme';
import { Text } from './Text';

// =============================================================================
// LINEAR PROGRESS BAR
// =============================================================================

export interface ProgressBarProps {
  /** Current value */
  value: number;

  /** Maximum value */
  max?: number;

  /** Progress color */
  color?: 'accent' | 'success' | 'warning' | 'error' | 'ai';

  /** Height of the bar */
  height?: number;

  /** Show percentage label */
  showLabel?: boolean;

  /** Indeterminate loading state */
  indeterminate?: boolean;

  /** Custom style */
  style?: ViewStyle;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function ProgressBar({
  value,
  max = 100,
  color = 'accent',
  height = 8,
  showLabel = false,
  indeterminate = false,
  style,
}: ProgressBarProps) {
  const { colors, radius, durations } = useTheme();

  // Animation value
  const progress = useSharedValue(0);
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  useEffect(() => {
    if (!indeterminate) {
      progress.value = withSpring(percentage, {
        damping: 20,
        stiffness: 90,
      });
    }
  }, [percentage, indeterminate]);

  // Animated style
  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  // Get color
  const barColor = getProgressColor(color, percentage, colors);

  return (
    <View style={style}>
      {/* Progress bar */}
      <View
        style={[
          styles.progressTrack,
          {
            height,
            backgroundColor: colors.dark[800],
            borderRadius: radius.full,
            overflow: 'hidden',
          },
        ]}
      >
        <AnimatedView
          style={[
            styles.progressFill,
            {
              backgroundColor: barColor,
              borderRadius: radius.full,
            },
            animatedStyle,
          ]}
        />
      </View>

      {/* Label */}
      {showLabel && !indeterminate && (
        <Text
          variant="labelSm"
          color="muted"
          style={{ marginTop: 4, alignSelf: 'flex-end' }}
        >
          {Math.round(percentage)}%
        </Text>
      )}
    </View>
  );
}

// =============================================================================
// CIRCULAR PROGRESS
// =============================================================================

export interface CircularProgressProps {
  /** Current value */
  value: number;

  /** Maximum value */
  max?: number;

  /** Size of the circle */
  size?: number;

  /** Stroke width */
  strokeWidth?: number;

  /** Progress color */
  color?: 'accent' | 'success' | 'warning' | 'error' | 'ai';

  /** Show percentage label in center */
  showLabel?: boolean;

  /** Custom style */
  style?: ViewStyle;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 12,
  color = 'accent',
  showLabel = true,
  style,
}: CircularProgressProps) {
  const { colors } = useTheme();

  // Calculate circle properties
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // Animation value
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(percentage, {
      damping: 20,
      stiffness: 90,
    });
  }, [percentage]);

  // Animated props for circle
  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset =
      circumference - (circumference * progress.value) / 100;

    return {
      strokeDashoffset,
    };
  });

  // Get color
  const strokeColor = getProgressColor(color, percentage, colors);

  return (
    <View style={[styles.circularContainer, { width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.dark[800]}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          animatedProps={animatedProps}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>

      {/* Center label */}
      {showLabel && (
        <View style={styles.circularLabel}>
          <Text variant="displayLg" color="primary" weight="bold">
            {Math.round(percentage)}
          </Text>
          <Text variant="textSm" color="muted">
            %
          </Text>
        </View>
      )}
    </View>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function getProgressColor(
  color: string,
  percentage: number,
  colors: any
): string {
  // Auto-color based on percentage if color is 'auto'
  if (color === 'auto') {
    if (percentage >= 80) return colors.semantic.success.emphasis;
    if (percentage >= 50) return colors.semantic.warning.emphasis;
    return colors.semantic.error.emphasis;
  }

  switch (color) {
    case 'success':
      return colors.semantic.success.emphasis;
    case 'warning':
      return colors.semantic.warning.emphasis;
    case 'error':
      return colors.semantic.error.emphasis;
    case 'ai':
      return colors.violet[500];
    case 'accent':
    default:
      return colors.accent[500];
  }
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  progressTrack: {
    position: 'relative',
  },
  progressFill: {
    height: '100%',
  },
  circularContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});

// =============================================================================
// EXPORTS
// =============================================================================

export default ProgressBar;
