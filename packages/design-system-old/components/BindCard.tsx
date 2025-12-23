/**
 * Weave Design System - BindCard Component
 *
 * Displays a single habit/action (Bind) with completion tracking
 * Includes checkbox, title, estimated time, proof indicator, and timer
 *
 * Usage:
 * <BindCard
 *   title="Morning gym session"
 *   estimatedTime="60 min"
 *   completed={false}
 *   hasProof={true}
 *   onToggle={handleToggle}
 *   onPress={handlePress}
 *   onTimer={handleTimer}
 * />
 */

import React, { useCallback } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../theme';
import { Text } from './Text';

// =============================================================================
// TYPES
// =============================================================================

export interface BindCardProps {
  /** Bind title */
  title: string;

  /** Estimated time to complete */
  estimatedTime?: string;

  /** Completion state */
  completed: boolean;

  /** Toggle completion handler */
  onToggle: (completed: boolean) => void;

  /** Card press handler (navigate to detail) */
  onPress?: () => void;

  /** Timer button handler */
  onTimer?: () => void;

  /** Has proof attached (photo/note) */
  hasProof?: boolean;

  /** Optional description */
  description?: string;

  /** Disabled state */
  disabled?: boolean;

  /** Custom style */
  style?: ViewStyle;
}

// =============================================================================
// COMPONENT
// =============================================================================

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function BindCard({
  title,
  estimatedTime,
  completed,
  onToggle,
  onPress,
  onTimer,
  hasProof = false,
  description,
  disabled = false,
  style,
}: BindCardProps) {
  const { colors, radius, spacing, springs, layout } = useTheme();

  // Animation values
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(completed ? 1 : 0);
  const checkOpacity = useSharedValue(completed ? 1 : 0);

  // Animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkOpacity.value,
  }));

  // Handlers
  const handlePressIn = useCallback(() => {
    if (!disabled) {
      scale.value = withSpring(0.98, springs.press);
    }
  }, [scale, springs.press, disabled]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springs.press);
  }, [scale, springs.press]);

  const handleToggle = useCallback(() => {
    if (disabled) return;

    const newCompleted = !completed;
    onToggle(newCompleted);

    // Animate checkbox
    if (newCompleted) {
      // Completion animation - bouncy celebration
      checkOpacity.value = withTiming(1, { duration: 150 });
      checkScale.value = withSequence(
        withSpring(1.2, springs.bouncy),
        withSpring(1, springs.default)
      );

      // Card celebration pulse
      scale.value = withSequence(
        withSpring(1.02, springs.bouncy),
        withSpring(1, springs.default)
      );
    } else {
      // Uncomplete animation - simple fade out
      checkOpacity.value = withTiming(0, { duration: 150 });
      checkScale.value = withTiming(0, { duration: 150 });
    }
  }, [completed, onToggle, disabled, checkOpacity, checkScale, scale, springs]);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || !onPress}
      style={[
        styles.container,
        {
          backgroundColor: completed
            ? colors.semantic.success.subtle
            : colors.background.secondary,
          borderWidth: 1,
          borderColor: completed
            ? colors.semantic.success.border
            : colors.border.subtle,
          borderRadius: radius.lg,
          padding: spacing[4],
          opacity: disabled ? 0.5 : 1,
        },
        cardAnimatedStyle,
        style,
      ]}
    >
      {/* Main content row */}
      <View style={styles.mainRow}>
        {/* Checkbox */}
        <Pressable
          onPress={handleToggle}
          disabled={disabled}
          hitSlop={8}
          style={[
            styles.checkbox,
            {
              width: layout.touchTarget.min,
              height: layout.touchTarget.min,
              borderRadius: radius.md,
              borderWidth: 2,
              borderColor: completed
                ? colors.semantic.success.emphasis
                : colors.border.muted,
              backgroundColor: completed
                ? colors.semantic.success.emphasis
                : 'transparent',
            },
          ]}
        >
          {/* Checkmark */}
          <Animated.View style={[styles.checkmark, checkAnimatedStyle]}>
            <View
              style={{
                width: 12,
                height: 6,
                borderLeftWidth: 2,
                borderBottomWidth: 2,
                borderColor: colors.dark[950],
                transform: [{ rotate: '-45deg' }],
              }}
            />
          </Animated.View>
        </Pressable>

        {/* Content */}
        <View style={styles.content}>
          {/* Title */}
          <Text
            variant="textBase"
            color={completed ? 'muted' : 'primary'}
            weight="medium"
            style={completed && styles.strikethrough}
          >
            {title}
          </Text>

          {/* Description */}
          {description && (
            <Text
              variant="textSm"
              color="muted"
              style={{ marginTop: spacing[1] }}
            >
              {description}
            </Text>
          )}

          {/* Metadata row */}
          <View style={[styles.metadataRow, { marginTop: spacing[2] }]}>
            {/* Estimated time */}
            {estimatedTime && (
              <View style={styles.metadataItem}>
                {/* Clock icon placeholder */}
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    borderWidth: 1.5,
                    borderColor: colors.text.muted,
                    marginRight: spacing[1],
                  }}
                />
                <Text variant="textXs" color="muted">
                  {estimatedTime}
                </Text>
              </View>
            )}

            {/* Proof indicator */}
            {hasProof && (
              <View style={styles.metadataItem}>
                {/* Camera icon placeholder */}
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    backgroundColor: colors.semantic.success.emphasis,
                    marginRight: spacing[1],
                  }}
                />
                <Text variant="textXs" color="success">
                  Proof
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Timer button */}
        {onTimer && (
          <Pressable
            onPress={onTimer}
            disabled={disabled}
            style={[
              styles.timerButton,
              {
                width: layout.touchTarget.min,
                height: layout.touchTarget.min,
                borderRadius: radius.full,
                backgroundColor: colors.dark[800],
                borderWidth: 1,
                borderColor: colors.border.muted,
              },
            ]}
          >
            {/* Timer icon placeholder */}
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: colors.text.secondary,
              }}
            />
          </Pressable>
        )}
      </View>
    </AnimatedPressable>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkmark: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});

// =============================================================================
// EXPORTS
// =============================================================================

export default BindCard;
