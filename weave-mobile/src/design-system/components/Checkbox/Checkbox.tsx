/**
 * Checkbox Component - Weave Design System
 *
 * A unique checkbox with identity-transforming animations.
 * Features:
 * - Morphing from circle to woven square on check
 * - Particle burst celebration
 * - Haptic feedback
 * - Color transition representing progress
 * - Weave pattern reveals on check
 */

import React, { useCallback, useEffect } from 'react';
import { Pressable, View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeProvider';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md',
  style,
  accessibilityLabel,
}: CheckboxProps) {
  const { colors, spacing, springs } = useTheme();

  // Animation values
  const checkProgress = useSharedValue(checked ? 1 : 0);
  const scale = useSharedValue(1);
  const borderRadius = useSharedValue(size === 'sm' ? 4 : size === 'lg' ? 8 : 6);
  const rotation = useSharedValue(0);
  const particleScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  // Update check progress when checked prop changes
  useEffect(() => {
    if (checked) {
      // Morphing animation: circle → square with weave pattern
      borderRadius.value = withSpring(size === 'sm' ? 4 : size === 'lg' ? 8 : 6, springs.default);
      checkProgress.value = withSpring(1, springs.quick);
      rotation.value = withSpring(360, springs.default);

      // Particle burst
      particleScale.value = withSequence(
        withSpring(1.2, springs.bouncy),
        withTiming(0, { duration: 400 })
      );

      // Glow effect
      glowOpacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(300, withTiming(0, { duration: 400 }))
      );
    } else {
      // Morph to circle when unchecked
      borderRadius.value = withSpring(50, springs.default);
      checkProgress.value = withSpring(0, springs.quick);
      rotation.value = withSpring(0, springs.default);
      particleScale.value = 0;
      glowOpacity.value = 0;
    }
  }, [checked, borderRadius, checkProgress, rotation, particleScale, glowOpacity, size, springs]);

  const handlePress = useCallback(() => {
    if (!disabled) {
      // Haptic feedback
      if (!checked) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Scale animation
      scale.value = withSequence(withSpring(0.9, springs.press), withSpring(1, springs.default));

      onChange(!checked);
    }
  }, [checked, disabled, onChange, scale, springs]);

  const sizeValue = size === 'sm' ? 20 : size === 'lg' ? 32 : 24;

  // Animated styles
  const animatedCheckboxStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolate(checkProgress.value, [0, 1], [0, 1], Extrapolate.CLAMP);

    return {
      transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
      backgroundColor: backgroundColor > 0.5 ? colors.accent[500] : colors.background.elevated,
      borderRadius: borderRadius.value,
    };
  });

  const animatedCheckStyle = useAnimatedStyle(() => {
    return {
      opacity: checkProgress.value,
      transform: [{ scale: checkProgress.value }, { rotate: `${rotation.value * 0.5}deg` }],
    };
  });

  const animatedParticleStyle = useAnimatedStyle(() => {
    return {
      opacity: particleScale.value,
      transform: [{ scale: particleScale.value }],
    };
  });

  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value * 0.6,
    };
  });

  return (
    <View style={[styles.container, style]}>
      <AnimatedPressable
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={accessibilityLabel || label || 'Checkbox'}
        style={[
          styles.checkbox,
          {
            width: sizeValue,
            height: sizeValue,
            borderColor: checked ? colors.accent[500] : colors.border.muted,
            borderWidth: checked ? 0 : 2,
          },
          animatedCheckboxStyle,
          disabled && styles.disabled,
        ]}
      >
        {/* Glow effect */}
        <Animated.View
          style={[
            styles.glow,
            {
              width: sizeValue * 1.8,
              height: sizeValue * 1.8,
              backgroundColor: colors.accent[500],
            },
            animatedGlowStyle,
          ]}
        />

        {/* Checkmark (Weave pattern) */}
        <Animated.View style={[styles.checkmark, animatedCheckStyle]}>
          <WeaveCheckmark color={colors.text.inverse} size={sizeValue} />
        </Animated.View>

        {/* Particle burst */}
        {checked && (
          <Animated.View style={[styles.particles, animatedParticleStyle]}>
            {[...Array(6)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.particle,
                  {
                    backgroundColor: colors.accent[300],
                    transform: [{ rotate: `${i * 60}deg` }, { translateX: sizeValue * 0.8 }],
                  },
                ]}
              />
            ))}
          </Animated.View>
        )}
      </AnimatedPressable>

      {label && (
        <View style={styles.labelContainer}>
          <Animated.Text
            style={[
              styles.label,
              {
                color: disabled ? colors.text.disabled : colors.text.secondary,
                marginLeft: spacing[2],
              },
            ]}
          >
            {label}
          </Animated.Text>
        </View>
      )}
    </View>
  );
}

// Weave checkmark SVG (simplified for now)
function WeaveCheckmark({ color, size }: { color: string; size: number }) {
  return (
    <View style={styles.checkmarkContainer}>
      {/* Simplified checkmark - will be enhanced with actual SVG paths */}
      <View
        style={[
          styles.checkmarkLine1,
          {
            backgroundColor: color,
            width: size * 0.15,
            height: size * 0.4,
          },
        ]}
      />
      <View
        style={[
          styles.checkmarkLine2,
          {
            backgroundColor: color,
            width: size * 0.15,
            height: size * 0.7,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  disabled: {
    opacity: 0.4,
  },
  glow: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0,
  },
  checkmark: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  checkmarkLine1: {
    borderRadius: 2,
    transform: [{ rotate: '45deg' }, { translateY: 2 }],
    marginRight: -2,
  },
  checkmarkLine2: {
    borderRadius: 2,
    transform: [{ rotate: '-45deg' }],
  },
  particles: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
  },
});
