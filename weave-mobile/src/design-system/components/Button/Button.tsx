/**
 * Button Component - Minimal Black/White Design
 *
 * Stoic aesthetic: clean, purposeful, no unnecessary decoration
 * Features:
 * - Simple scale animation on press
 * - Haptic feedback (purposeful interaction)
 * - iOS 17-style rounded corners
 */

import React, { useCallback } from 'react';
import {
  Pressable,
  Text as _Text,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  PressableProps,
  StyleProp,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeProvider';
import type { ButtonVariant, ButtonSize } from './types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  style,
  textStyle,
  onPressIn,
  onPressOut,
  onPress,
  ...pressableProps
}: ButtonProps) {
  const { colors, spacing, typography, springs } = useTheme();

  // Simple scale animation
  const scale = useSharedValue(1);

  // Handle press in
  const handlePressIn = useCallback(
    (event: any) => {
      if (!disabled && !loading) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        scale.value = withSpring(0.96, springs.press);
      }
      onPressIn?.(event);
    },
    [disabled, loading, onPressIn, scale, springs]
  );

  // Handle press out
  const handlePressOut = useCallback(
    (event: any) => {
      if (!disabled && !loading) {
        scale.value = withSpring(1, springs.default);
      }
      onPressOut?.(event);
    },
    [disabled, loading, onPressOut, scale, springs]
  );

  // Get variant styles
  const variantStyles = getVariantStyles(variant, colors);
  const sizeStyles = getSizeStyles(size, spacing);

  // Animated styles
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const buttonStyle = [
    styles.button,
    variantStyles.button,
    sizeStyles.button,
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    styles.buttonShadow, // Add subtle shadow for depth
    style,
  ];

  const innerTextStyle = [
    typography.labelBase,
    variantStyles.text,
    sizeStyles.text,
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled || loading}
      style={[animatedButtonStyle, buttonStyle]}
      {...pressableProps}
    >
      {/* Content */}
      <View style={styles.contentContainer}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <Animated.Text style={innerTextStyle}>{loading ? 'Loading...' : children}</Animated.Text>

        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
    </AnimatedPressable>
  );
}

// Variant styles - Minimal black/white/gray
function getVariantStyles(variant: ButtonVariant, colors: any) {
  const variants = {
    // Primary: White button with black text
    primary: {
      button: {
        backgroundColor: colors.neutral[0], // White
        borderWidth: 0,
      },
      text: {
        color: colors.text.inverse, // Black
        fontWeight: '700' as const,
      },
    },
    // Secondary: Outlined white border, white text
    secondary: {
      button: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.neutral[0], // White border
      },
      text: {
        color: colors.text.primary, // White text
        fontWeight: '700' as const,
      },
    },
    // Ghost: Transparent with white text
    ghost: {
      button: {
        backgroundColor: 'transparent',
        borderWidth: 0,
      },
      text: {
        color: colors.text.primary,
        fontWeight: '700' as const,
      },
    },
    // Destructive: Red for delete actions
    destructive: {
      button: {
        backgroundColor: colors.red[500],
        borderWidth: 0,
      },
      text: {
        color: colors.neutral[0], // White
        fontWeight: '700' as const,
      },
    },
    // Success: Green for positive actions (maps to primary green button when needed)
    success: {
      button: {
        backgroundColor: colors.green[500],
        borderWidth: 0,
      },
      text: {
        color: colors.neutral[1000], // Black
        fontWeight: '700' as const,
      },
    },
    // AI: Maps to primary (no special color in minimal design)
    ai: {
      button: {
        backgroundColor: colors.neutral[0],
        borderWidth: 0,
      },
      text: {
        color: colors.text.inverse,
        fontWeight: '700' as const,
      },
    },
  };

  return variants[variant];
}

// Size styles - iOS 17 rounded corners
function getSizeStyles(size: ButtonSize, spacing: any) {
  const sizes = {
    sm: {
      button: {
        height: 40,
        paddingHorizontal: spacing[3],
        borderRadius: 10, // iOS 17 style
      },
      text: {
        fontSize: 13,
        lineHeight: 16,
      },
    },
    md: {
      button: {
        height: 48,
        paddingHorizontal: spacing[5],
        borderRadius: 12, // iOS 17 style
      },
      text: {
        fontSize: 15,
        lineHeight: 20,
      },
    },
    lg: {
      button: {
        height: 56,
        paddingHorizontal: spacing[6],
        borderRadius: 14, // iOS 17 style
      },
      text: {
        fontSize: 17,
        lineHeight: 24,
      },
    },
  };

  return sizes[size];
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.4,
  },
  disabledText: {
    opacity: 0.6,
  },
  buttonShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});
