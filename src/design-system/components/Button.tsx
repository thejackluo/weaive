/**
 * Weave Design System - Button Component
 *
 * Beautiful, animated buttons with multiple variants
 * Press feedback with scale animation
 *
 * Usage:
 * <Button onPress={handlePress}>Continue</Button>
 * <Button variant="secondary" size="sm">Cancel</Button>
 */

import React, { useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../theme';
import { Text } from './Text';

// =============================================================================
// TYPES
// =============================================================================

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'destructive'
  | 'ai'
  | 'success';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  /** Button click handler */
  onPress?: () => void;

  /** Button variant */
  variant?: ButtonVariant;

  /** Button size */
  size?: ButtonSize;

  /** Disabled state */
  disabled?: boolean;

  /** Loading state */
  loading?: boolean;

  /** Full width button */
  fullWidth?: boolean;

  /** Left icon component */
  leftIcon?: React.ReactNode;

  /** Right icon component */
  rightIcon?: React.ReactNode;

  /** Custom style */
  style?: ViewStyle;

  /** Button text */
  children: React.ReactNode;

  /** Accessibility label */
  accessibilityLabel?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  children,
  accessibilityLabel,
}: ButtonProps) {
  const { colors, radius, spacing, springs, layout } = useTheme();

  // Animation value
  const scale = useSharedValue(1);

  // Animated style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Press handlers
  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, springs.press);
  }, [scale, springs.press]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springs.press);
  }, [scale, springs.press]);

  // Determine if button is interactive
  const isInteractive = !disabled && !loading;

  // Get variant styles
  const variantStyles = getVariantStyles(variant, colors, disabled);

  // Get size styles
  const sizeStyles = getSizeStyles(size, layout, spacing);

  return (
    <AnimatedPressable
      onPress={isInteractive ? onPress : undefined}
      onPressIn={isInteractive ? handlePressIn : undefined}
      onPressOut={isInteractive ? handlePressOut : undefined}
      disabled={!isInteractive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !isInteractive }}
      style={[
        styles.base,
        variantStyles.container,
        sizeStyles.container,
        { borderRadius: radius.lg },
        fullWidth && styles.fullWidth,
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.textColor}
        />
      ) : (
        <>
          {leftIcon && (
            <Animated.View style={[styles.icon, styles.iconLeft]}>
              {leftIcon}
            </Animated.View>
          )}

          <Text
            variant={size === 'sm' ? 'labelSm' : 'labelBase'}
            customColor={variantStyles.textColor}
            weight="medium"
          >
            {children}
          </Text>

          {rightIcon && (
            <Animated.View style={[styles.icon, styles.iconRight]}>
              {rightIcon}
            </Animated.View>
          )}
        </>
      )}
    </AnimatedPressable>
  );
}

// =============================================================================
// STYLE HELPERS
// =============================================================================

interface VariantStyles {
  container: ViewStyle;
  textColor: string;
}

function getVariantStyles(
  variant: ButtonVariant,
  colors: any,
  disabled: boolean
): VariantStyles {
  if (disabled) {
    return {
      container: {
        backgroundColor: colors.dark[800],
        borderWidth: 0,
      },
      textColor: colors.text.disabled,
    };
  }

  switch (variant) {
    case 'primary':
      return {
        container: {
          backgroundColor: colors.accent[500],
        },
        textColor: colors.dark[950],
      };

    case 'secondary':
      return {
        container: {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colors.accent[500],
        },
        textColor: colors.accent[400],
      };

    case 'ghost':
      return {
        container: {
          backgroundColor: 'transparent',
        },
        textColor: colors.text.secondary,
      };

    case 'destructive':
      return {
        container: {
          backgroundColor: colors.rose[600],
        },
        textColor: colors.dark[50],
      };

    case 'ai':
      return {
        container: {
          backgroundColor: colors.violet[600],
        },
        textColor: colors.dark[50],
      };

    case 'success':
      return {
        container: {
          backgroundColor: colors.emerald[600],
        },
        textColor: colors.dark[950],
      };

    default:
      return {
        container: {
          backgroundColor: colors.accent[500],
        },
        textColor: colors.dark[950],
      };
  }
}

interface SizeStyles {
  container: ViewStyle;
}

function getSizeStyles(
  size: ButtonSize,
  layout: any,
  spacing: any
): SizeStyles {
  switch (size) {
    case 'sm':
      return {
        container: {
          height: layout.button.height.sm,
          paddingHorizontal: layout.button.paddingHorizontal.sm,
          minWidth: layout.button.minWidth.sm,
        },
      };

    case 'lg':
      return {
        container: {
          height: layout.button.height.lg,
          paddingHorizontal: layout.button.paddingHorizontal.lg,
          minWidth: layout.button.minWidth.lg,
        },
      };

    case 'md':
    default:
      return {
        container: {
          height: layout.button.height.md,
          paddingHorizontal: layout.button.paddingHorizontal.md,
          minWidth: layout.button.minWidth.md,
        },
      };
  }
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

// =============================================================================
// VARIANTS
// =============================================================================

/** Primary action button */
export function PrimaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="primary" {...props} />;
}

/** Secondary action button */
export function SecondaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="secondary" {...props} />;
}

/** Ghost/text button */
export function GhostButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="ghost" {...props} />;
}

/** Destructive/danger button */
export function DestructiveButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="destructive" {...props} />;
}

/** AI-themed button */
export function AIButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="ai" {...props} />;
}

// =============================================================================
// ICON BUTTON
// =============================================================================

export interface IconButtonProps {
  /** Button click handler */
  onPress?: () => void;

  /** Icon component */
  icon: React.ReactNode;

  /** Button variant */
  variant?: ButtonVariant;

  /** Button size */
  size?: ButtonSize;

  /** Disabled state */
  disabled?: boolean;

  /** Custom style */
  style?: ViewStyle;

  /** Accessibility label */
  accessibilityLabel: string;
}

export function IconButton({
  onPress,
  icon,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  style,
  accessibilityLabel,
}: IconButtonProps) {
  const { colors, radius, layout, springs } = useTheme();

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.9, springs.press);
  }, [scale, springs.press]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springs.press);
  }, [scale, springs.press]);

  const isInteractive = !disabled;
  const variantStyles = getVariantStyles(variant, colors, disabled);

  const sizeValue = {
    sm: layout.touchTarget.min,
    md: layout.touchTarget.recommended,
    lg: 56,
  }[size];

  return (
    <AnimatedPressable
      onPress={isInteractive ? onPress : undefined}
      onPressIn={isInteractive ? handlePressIn : undefined}
      onPressOut={isInteractive ? handlePressOut : undefined}
      disabled={!isInteractive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          width: sizeValue,
          height: sizeValue,
          borderRadius: radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor:
            variant === 'ghost'
              ? 'transparent'
              : variantStyles.container.backgroundColor,
        },
        animatedStyle,
        style,
      ]}
    >
      {icon}
    </AnimatedPressable>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export default Button;
