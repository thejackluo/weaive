/**
 * Button Component
 * Composable button with Radix-style anatomy and spring animations
 */

import React, { ReactNode, useCallback, useMemo } from 'react';
import { Pressable, View, ActivityIndicator, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';
import { springs, useReducedMotion, PRESS_SCALE } from '../../animations';
import { Text } from '../Text';
import { Icon } from '../Icon';
import { IconName } from '../Icon/types';
import { ButtonProps, ButtonVariant, ButtonSize } from './types';

/**
 * Size mappings
 */
const sizeStyles: Record<ButtonSize, { height: number; paddingHorizontal: number; fontSize: number; iconSize: number }> = {
  sm: { height: 36, paddingHorizontal: 12, fontSize: 14, iconSize: 16 },
  md: { height: 44, paddingHorizontal: 16, fontSize: 16, iconSize: 20 },
  lg: { height: 52, paddingHorizontal: 20, fontSize: 18, iconSize: 24 },
};

/**
 * Variant style mappings
 */
function getVariantStyles(variant: ButtonVariant, theme: any) {
  const {colors} = theme;
  
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: colors.accent.primary,
        color: colors.dark[50],
        borderWidth: 0,
        shadowColor: colors.accent.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
      };
    
    case 'secondary':
      return {
        backgroundColor: colors.bg.secondary,
        color: colors.text.primary,
        borderWidth: 1,
        borderColor: colors.border.default,
        shadowOpacity: 0,
      };
    
    case 'ghost':
      return {
        backgroundColor: 'transparent',
        color: colors.text.primary,
        borderWidth: 0,
        shadowOpacity: 0,
      };
    
    case 'destructive':
      return {
        backgroundColor: colors.error[500],
        color: colors.dark[50],
        borderWidth: 0,
        shadowColor: colors.error[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
      };
    
    case 'ai':
      return {
        gradientColors: [colors.violet[500], colors.accent[500]],
        color: colors.dark[50],
        borderWidth: 0,
        shadowColor: colors.violet[400],
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 12,
      };
    
    case 'unstyled':
      return {
        backgroundColor: 'transparent',
        color: colors.text.primary,
        borderWidth: 0,
        shadowOpacity: 0,
      };
    
    default:
      return {
        backgroundColor: colors.accent.primary,
        color: colors.dark[50],
        borderWidth: 0,
        shadowOpacity: 0,
      };
  }
}

/**
 * Base Button component with composable anatomy
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onPress={handlePress}>
 *   <Button.Icon name="sparkles" />
 *   <Button.Text>Generate</Button.Text>
 * </Button>
 * ```
 */
export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  onPress,
  children,
  accessibilityLabel,
}: ButtonProps) {
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
      height: sizeStyle.height,
      paddingHorizontal: sizeStyle.paddingHorizontal,
      borderRadius: theme.borders.radius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing[2],
      width: fullWidth ? '100%' : undefined,
      opacity: disabled ? 0.5 : 1,
      ...variantStyle,
    }),
    [sizeStyle, variantStyle, fullWidth, disabled, theme]
  );

  const content = (
    <View style={containerStyle}>
      {loading ? <ActivityIndicator size="small" color={variantStyle.color} /> : children}
    </View>
  );

  const wrappedContent = variant === 'ai' && variantStyle.gradientColors ? (
    <LinearGradient
      colors={variantStyle.gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ ...containerStyle, backgroundColor: undefined }}
    >
      {loading ? <ActivityIndicator size="small" color={variantStyle.color} /> : children}
    </LinearGradient>
  ) : (
    content
  );

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: disabled || loading }}
    >
      <Animated.View style={animatedStyle}>{wrappedContent}</Animated.View>
    </Pressable>
  );
}

/**
 * Button.Icon - Icon part of composable anatomy
 */
Button.Icon = function ButtonIcon({ name, ...props }: { name: IconName }) {
  return <Icon name={name} size="sm" {...props} />;
};

/**
 * Button.Text - Text part of composable anatomy
 */
Button.Text = function ButtonText({ children, ...props }: { children: ReactNode }) {
  return (
    <Text variant="bodyMd" weight="semibold" {...props}>
      {children}
    </Text>
  );
};

/**
 * Button.Spinner - Spinner for loading state
 */
Button.Spinner = function ButtonSpinner() {
  return <ActivityIndicator size="small" />;
};

Button.displayName = 'Button';
