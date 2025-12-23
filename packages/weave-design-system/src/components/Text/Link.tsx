/**
 * Link Component
 * Interactive text link with spring animation
 */

import React, { useCallback } from 'react';
import { Pressable, Linking } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Text } from './Text';
import { LinkProps } from './types';
import { springs, useReducedMotion } from '../../animations';

/**
 * Link component with press animation and external link handling
 *
 * @example
 * ```tsx
 * <Link href="https://example.com" external>
 *   Visit Website
 * </Link>
 * ```
 */
export function Link({
  href,
  onPress,
  external = false,
  disabled = false,
  color = 'text.link',
  children,
  ...textProps
}: LinkProps) {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const handlePress = useCallback(async () => {
    if (disabled) return;

    if (onPress) {
      onPress();
    } else if (href && external) {
      const canOpen = await Linking.canOpenURL(href);
      if (canOpen) {
        await Linking.openURL(href);
      }
    }
  }, [href, onPress, external, disabled]);

  const handlePressIn = useCallback(() => {
    if (disabled || reducedMotion) return;
    scale.value = withSpring(0.98, springs.snappy);
  }, [disabled, reducedMotion]);

  const handlePressOut = useCallback(() => {
    if (disabled || reducedMotion) return;
    scale.value = withSpring(1, springs.snappy);
  }, [disabled, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole="link"
      accessibilityState={{ disabled }}
    >
      <Animated.View style={animatedStyle}>
        <Text
          {...textProps}
          color={disabled ? 'text.disabled' : color}
          style={{ textDecorationLine: 'underline' }}
        >
          {children}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

Link.displayName = 'Link';
