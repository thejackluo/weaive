/**
 * IconButton Component
 * Button with only an icon (square aspect ratio)
 */

import React, { useCallback, useMemo } from 'react';
import { Pressable, View, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { springs, useReducedMotion, PRESS_SCALE } from '../../animations';
import { Icon } from '../Icon';
import { IconButtonProps, ButtonVariant, ButtonSize } from './types';

/**
 * Size mappings (square buttons)
 */
const sizeStyles: Record<ButtonSize, { size: number; iconSize: number }> = {
  sm: { size: 36, iconSize: 16 },
  md: { size: 44, iconSize: 20 },
  lg: { size: 52, iconSize: 24 },
};

/**
 * Variant style mappings (same as Button)
 */
function getVariantStyles(variant: ButtonVariant, theme: any) {
  const { colors } = theme;

  switch (variant) {
    case 'primary':
      return {
        backgroundColor: colors.accent.primary,
        iconColor: colors.dark[50],
        borderWidth: 0,
      };

    case 'secondary':
      return {
        backgroundColor: colors.bg.secondary,
        iconColor: colors.text.primary,
        borderWidth: 1,
        borderColor: colors.border.default,
      };

    case 'ghost':
      return {
        backgroundColor: 'transparent',
        iconColor: colors.text.primary,
        borderWidth: 0,
      };

    case 'destructive':
      return {
        backgroundColor: colors.error[500],
        iconColor: colors.dark[50],
        borderWidth: 0,
      };

    case 'ai':
      return {
        backgroundColor: colors.violet[500],
        iconColor: colors.dark[50],
        borderWidth: 0,
      };

    default:
      return {
        backgroundColor: colors.accent.primary,
        iconColor: colors.dark[50],
        borderWidth: 0,
      };
  }
}

/**
 * IconButton component (icon-only, square)
 *
 * @example
 * ```tsx
 * <IconButton icon="settings" variant="ghost" size="md" onPress={handlePress} />
 * ```
 */
export function IconButton({
  icon,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onPress,
  accessibilityLabel,
}: IconButtonProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const sizeStyle = sizeStyles[size];
  const variantStyle = getVariantStyles(variant, theme);

  const handlePressIn = useCallback(() => {
    if (disabled || loading || reducedMotion) return;
    scale.value = withSpring(PRESS_SCALE, springs.snappy);
  }, [disabled, loading, reducedMotion]);

  const handlePressOut = useCallback(() => {
    if (disabled || loading || reducedMotion) return;
    scale.value = withSpring(1, springs.snappy);
  }, [disabled, loading, reducedMotion]);

  const handlePress = useCallback(() => {
    if (disabled || loading) return;
    onPress?.();
  }, [disabled, loading, onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const containerStyle: ViewStyle = useMemo(
    () => ({
      width: sizeStyle.size,
      height: sizeStyle.size,
      borderRadius: theme.borders.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.5 : 1,
      ...variantStyle,
    }),
    [sizeStyle, variantStyle, disabled, theme]
  );

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || `${icon} button`}
      accessibilityState={{ disabled: disabled || loading }}
    >
      <Animated.View style={animatedStyle}>
        <View style={containerStyle}>
          <Icon name={icon} size={sizeStyle.iconSize} color={variantStyle.iconColor} />
        </View>
      </Animated.View>
    </Pressable>
  );
}

IconButton.displayName = 'IconButton';
