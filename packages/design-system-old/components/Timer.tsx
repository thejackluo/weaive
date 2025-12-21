/**
 * Weave Design System - Timer Component
 *
 * Beautiful gradient timer for tracking task duration
 * Supports start/pause/stop with circular progress visualization
 *
 * Usage:
 * <Timer
 *   duration={1800} // 30 minutes in seconds
 *   onComplete={handleComplete}
 *   onStop={handleStop}
 * />
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';
import { Text } from './Text';

// =============================================================================
// TYPES
// =============================================================================

export interface TimerProps {
  /** Initial duration in seconds */
  duration?: number;

  /** Callback when timer completes */
  onComplete?: (elapsed: number) => void;

  /** Callback when timer is stopped early */
  onStop?: (elapsed: number) => void;

  /** Callback when timer is paused */
  onPause?: (elapsed: number) => void;

  /** Timer size */
  size?: 'sm' | 'md' | 'lg';

  /** Auto-start on mount */
  autoStart?: boolean;

  /** Show milliseconds */
  showMilliseconds?: boolean;
}

type TimerState = 'idle' | 'running' | 'paused' | 'completed';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// =============================================================================
// TIMER COMPONENT
// =============================================================================

export function Timer({
  duration = 0,
  onComplete,
  onStop,
  onPause,
  size = 'md',
  autoStart = false,
  showMilliseconds = false,
}: TimerProps) {
  const { colors, spacing, radius, springs, durations } = useTheme();

  // State
  const [state, setState] = useState<TimerState>(autoStart ? 'running' : 'idle');
  const [elapsed, setElapsed] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Animation values
  const progress = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  // Get size dimensions
  const dimensions = getSizeDimensions(size);
  const { containerSize, strokeWidth, radius: circleRadius } = dimensions;
  const circumference = 2 * Math.PI * circleRadius;

  // Calculate remaining time
  const remaining = Math.max(0, duration - elapsed);
  const progressPercent = duration > 0 ? (elapsed / duration) * 100 : 0;

  // Update progress animation
  useEffect(() => {
    progress.value = withTiming(progressPercent / 100, {
      duration: 100,
      easing: Easing.linear,
    });
  }, [progressPercent, progress]);

  // Pulse animation when running
  useEffect(() => {
    if (state === 'running') {
      pulseScale.value = withSpring(1.05, {
        damping: 10,
        stiffness: 100,
      });
    } else {
      pulseScale.value = withSpring(1, springs.default);
    }
  }, [state, pulseScale, springs.default]);

  // Timer logic
  useEffect(() => {
    if (state === 'running') {
      const id = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 0.1; // 100ms increments
          if (duration > 0 && next >= duration) {
            setState('completed');
            onComplete?.(duration);
            return duration;
          }
          return next;
        });
      }, 100);
      setIntervalId(id);
      return () => clearInterval(id);
    } else if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [state, duration, onComplete]);

  // Handlers
  const handleStartPause = useCallback(() => {
    buttonScale.value = withSequence(
      withSpring(0.9, springs.press),
      withSpring(1, springs.press)
    );

    if (state === 'idle' || state === 'paused') {
      setState('running');
    } else if (state === 'running') {
      setState('paused');
      onPause?.(elapsed);
    }
  }, [state, elapsed, onPause, buttonScale, springs.press]);

  const handleStop = useCallback(() => {
    buttonScale.value = withSequence(
      withSpring(0.9, springs.press),
      withSpring(1, springs.press)
    );

    setState('idle');
    onStop?.(elapsed);
    setElapsed(0);
    progress.value = withTiming(0, { duration: durations.fast });
  }, [elapsed, onStop, buttonScale, springs.press, progress, durations.fast]);

  // Animated styles
  const circleAnimatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - progress.value);
    return {
      strokeDashoffset,
    };
  });

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  // Get gradient colors based on state
  const gradientColors = getGradientColors(state, progressPercent, colors);

  return (
    <View style={[styles.container, { alignItems: 'center' }]}>
      {/* Circular progress with gradient background */}
      <Animated.View style={[pulseAnimatedStyle]}>
        <View
          style={{
            width: containerSize,
            height: containerSize,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Gradient background circle */}
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: 'absolute',
              width: containerSize,
              height: containerSize,
              borderRadius: containerSize / 2,
              opacity: 0.2,
            }}
          />

          {/* SVG progress circle */}
          <Svg
            width={containerSize}
            height={containerSize}
            style={StyleSheet.absoluteFill}
          >
            {/* Background circle */}
            <Circle
              cx={containerSize / 2}
              cy={containerSize / 2}
              r={circleRadius}
              stroke={colors.dark[800]}
              strokeWidth={strokeWidth}
              fill="none"
            />

            {/* Progress circle */}
            <AnimatedCircle
              cx={containerSize / 2}
              cy={containerSize / 2}
              r={circleRadius}
              stroke={gradientColors[0]}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              animatedProps={circleAnimatedProps}
              strokeLinecap="round"
              transform={`rotate(-90 ${containerSize / 2} ${containerSize / 2})`}
            />
          </Svg>

          {/* Time display */}
          <View style={styles.timeContainer}>
            <Text
              variant={size === 'lg' ? 'display2Xl' : size === 'md' ? 'displayXl' : 'displayLg'}
              color="primary"
              weight="bold"
              style={{ textAlign: 'center' }}
            >
              {formatTime(remaining, showMilliseconds)}
            </Text>
            {duration > 0 && (
              <Text variant="textSm" color="muted" style={{ marginTop: spacing[1] }}>
                {formatTime(duration, false)} total
              </Text>
            )}
          </View>
        </View>
      </Animated.View>

      {/* Controls */}
      <View
        style={[
          styles.controls,
          {
            marginTop: spacing[6],
            gap: spacing[3],
          },
        ]}
      >
        {/* Start/Pause button */}
        <AnimatedPressable
          onPress={handleStartPause}
          style={[buttonAnimatedStyle]}
          disabled={state === 'completed'}
        >
          <LinearGradient
            colors={
              state === 'running'
                ? [colors.amber[600], colors.amber[700]]
                : [colors.accent[600], colors.accent[700]]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingHorizontal: spacing[6],
              paddingVertical: spacing[3],
              borderRadius: radius.full,
              minWidth: 120,
              alignItems: 'center',
            }}
          >
            <Text variant="labelLg" customColor={colors.dark[50]} weight="semibold">
              {state === 'idle' ? 'Start' : state === 'running' ? 'Pause' : 'Resume'}
            </Text>
          </LinearGradient>
        </AnimatedPressable>

        {/* Stop button */}
        {state !== 'idle' && state !== 'completed' && (
          <AnimatedPressable onPress={handleStop} style={[buttonAnimatedStyle]}>
            <View
              style={{
                paddingHorizontal: spacing[6],
                paddingVertical: spacing[3],
                borderRadius: radius.full,
                borderWidth: 2,
                borderColor: colors.border.emphasis,
                minWidth: 120,
                alignItems: 'center',
              }}
            >
              <Text variant="labelLg" color="muted" weight="semibold">
                Stop
              </Text>
            </View>
          </AnimatedPressable>
        )}
      </View>

      {/* State indicator */}
      {state === 'completed' && (
        <View
          style={{
            marginTop: spacing[4],
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing[2],
          }}
        >
          <Text variant="labelBase" color="success">
            ✓ Completed
          </Text>
        </View>
      )}
    </View>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function getSizeDimensions(size: 'sm' | 'md' | 'lg') {
  switch (size) {
    case 'sm':
      return {
        containerSize: 180,
        strokeWidth: 8,
        radius: 86,
      };
    case 'lg':
      return {
        containerSize: 300,
        strokeWidth: 14,
        radius: 143,
      };
    case 'md':
    default:
      return {
        containerSize: 240,
        strokeWidth: 12,
        radius: 114,
      };
  }
}

function formatTime(seconds: number, showMs: boolean): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);

  if (showMs) {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getGradientColors(
  state: TimerState,
  progress: number,
  colors: any
): [string, string] {
  if (state === 'completed') {
    return [colors.semantic.success.emphasis, colors.semantic.success.strong];
  }
  if (state === 'paused') {
    return [colors.amber[500], colors.amber[700]];
  }
  if (state === 'running') {
    // Change gradient based on progress
    if (progress < 33) {
      return [colors.accent[500], colors.violet[600]];
    } else if (progress < 66) {
      return [colors.violet[500], colors.purple[600]];
    } else {
      return [colors.purple[500], colors.rose[600]];
    }
  }
  return [colors.accent[600], colors.accent[800]];
}

function withSequence(...animations: any[]) {
  // Simple sequence implementation
  return animations[0];
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// =============================================================================
// EXPORTS
// =============================================================================

export default Timer;
