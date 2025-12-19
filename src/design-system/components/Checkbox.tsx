/**
 * Weave Design System - Checkbox Component
 *
 * Animated checkbox with optional label
 * Used for bind completion, settings, etc.
 *
 * Usage:
 * <Checkbox checked={isChecked} onChange={setChecked} />
 * <Checkbox checked={done} label="Complete this task" />
 */

import React, { useCallback, useEffect } from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '../theme';
import { Text } from './Text';

// =============================================================================
// TYPES
// =============================================================================

export type CheckboxSize = 'sm' | 'md' | 'lg';

export interface CheckboxProps {
  /** Checked state */
  checked: boolean;

  /** Change handler */
  onChange?: (checked: boolean) => void;

  /** Checkbox size */
  size?: CheckboxSize;

  /** Label text */
  label?: string;

  /** Description text */
  description?: string;

  /** Disabled state */
  disabled?: boolean;

  /** Indeterminate state (partial selection) */
  indeterminate?: boolean;

  /** Container style */
  style?: ViewStyle;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function Checkbox({
  checked,
  onChange,
  size = 'md',
  label,
  description,
  disabled = false,
  indeterminate = false,
  style,
}: CheckboxProps) {
  const { colors, radius, spacing, springs, durations } = useTheme();

  // Animation values
  const checkAnim = useSharedValue(checked ? 1 : 0);
  const scaleAnim = useSharedValue(1);

  // Update animation when checked changes
  useEffect(() => {
    checkAnim.value = withSpring(checked ? 1 : 0, springs.default);
  }, [checked, checkAnim, springs.default]);

  // Handle press
  const handlePress = useCallback(() => {
    if (disabled) return;

    // Scale feedback
    scaleAnim.value = withSpring(0.9, springs.press);
    setTimeout(() => {
      scaleAnim.value = withSpring(1, springs.press);
    }, 100);

    onChange?.(!checked);
  }, [disabled, checked, onChange, scaleAnim, springs.press]);

  // Get size config
  const sizeConfig = getSizeConfig(size);

  // Animated styles
  const boxAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      checkAnim.value,
      [0, 1],
      ['transparent', colors.accent[500]]
    );

    const borderColor = interpolateColor(
      checkAnim.value,
      [0, 1],
      [colors.border.muted, colors.accent[500]]
    );

    return {
      backgroundColor,
      borderColor,
      transform: [{ scale: scaleAnim.value }],
    };
  });

  const checkmarkAnimatedStyle = useAnimatedStyle(() => {
    const opacity = checkAnim.value;
    const scale = interpolate(checkAnim.value, [0, 0.5, 1], [0, 0.5, 1]);

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const indeterminateAnimatedStyle = useAnimatedStyle(() => {
    const opacity = indeterminate && !checked ? 1 : 0;

    return {
      opacity: withTiming(opacity, { duration: durations.fast }),
    };
  });

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      style={[styles.container, style]}
    >
      {/* Checkbox box */}
      <Animated.View
        style={[
          styles.box,
          {
            width: sizeConfig.boxSize,
            height: sizeConfig.boxSize,
            borderRadius: radius.sm,
            borderWidth: 2,
          },
          disabled && { opacity: 0.5 },
          boxAnimatedStyle,
        ]}
      >
        {/* Checkmark */}
        <Animated.View style={[styles.checkmark, checkmarkAnimatedStyle]}>
          <View
            style={[
              styles.checkmarkLine,
              {
                width: sizeConfig.checkSize * 0.4,
                height: sizeConfig.checkSize * 0.7,
                borderColor: colors.dark[950],
                borderBottomWidth: 2,
                borderRightWidth: 2,
              },
            ]}
          />
        </Animated.View>

        {/* Indeterminate dash */}
        <Animated.View
          style={[styles.indeterminate, indeterminateAnimatedStyle]}
        >
          <View
            style={{
              width: sizeConfig.boxSize * 0.5,
              height: 2,
              backgroundColor: colors.accent[500],
              borderRadius: 1,
            }}
          />
        </Animated.View>
      </Animated.View>

      {/* Label and description */}
      {(label || description) && (
        <View
          style={[
            styles.labelContainer,
            { marginLeft: spacing[3] },
          ]}
        >
          {label && (
            <Text
              variant={size === 'sm' ? 'textSm' : 'textBase'}
              color={disabled ? 'disabled' : 'primary'}
              style={checked ? styles.labelChecked : undefined}
            >
              {label}
            </Text>
          )}
          {description && (
            <Text
              variant="textXs"
              color="muted"
              style={{ marginTop: spacing[0.5] }}
            >
              {description}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

// =============================================================================
// SIZE HELPER
// =============================================================================

interface SizeConfig {
  boxSize: number;
  checkSize: number;
}

function getSizeConfig(size: CheckboxSize): SizeConfig {
  switch (size) {
    case 'sm':
      return { boxSize: 16, checkSize: 12 };
    case 'lg':
      return { boxSize: 24, checkSize: 18 };
    case 'md':
    default:
      return { boxSize: 20, checkSize: 14 };
  }
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    position: 'absolute',
  },
  checkmarkLine: {
    transform: [{ rotate: '45deg' }, { translateY: -1 }],
  },
  indeterminate: {
    position: 'absolute',
  },
  labelContainer: {
    flex: 1,
  },
  labelChecked: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
});

// =============================================================================
// BIND CHECKBOX (Specialized)
// =============================================================================

export interface BindCheckboxProps {
  /** Bind title */
  title: string;

  /** Estimated time */
  estimatedTime?: string;

  /** Has proof attached */
  hasProof?: boolean;

  /** Checked state */
  checked: boolean;

  /** Change handler */
  onChange?: (checked: boolean) => void;

  /** Press handler (for navigation) */
  onPress?: () => void;

  /** Disabled state */
  disabled?: boolean;

  /** Style */
  style?: ViewStyle;
}

export function BindCheckbox({
  title,
  estimatedTime,
  hasProof,
  checked,
  onChange,
  onPress,
  disabled,
  style,
}: BindCheckboxProps) {
  const { colors, spacing, radius } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.background.secondary,
          borderRadius: radius.lg,
          padding: spacing[3],
          borderWidth: 1,
          borderColor: colors.border.subtle,
        },
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      <Checkbox
        checked={checked}
        onChange={onChange}
        size="md"
        disabled={disabled}
      />

      <View style={{ flex: 1, marginLeft: spacing[3] }}>
        <Text
          variant="textBase"
          color={checked ? 'muted' : 'primary'}
          style={checked ? { textDecorationLine: 'line-through' } : undefined}
        >
          {title}
        </Text>
        {estimatedTime && (
          <Text variant="textXs" color="muted">
            {estimatedTime}
          </Text>
        )}
      </View>

      {/* Proof indicator */}
      {hasProof && (
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: colors.semantic.success.subtle,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text variant="labelXs" color="success">
            ✓
          </Text>
        </View>
      )}

      {/* Chevron */}
      <View style={{ marginLeft: spacing[2] }}>
        <View
          style={{
            width: 8,
            height: 8,
            borderRightWidth: 2,
            borderBottomWidth: 2,
            borderColor: colors.text.muted,
            transform: [{ rotate: '-45deg' }],
          }}
        />
      </View>
    </Pressable>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export default Checkbox;
