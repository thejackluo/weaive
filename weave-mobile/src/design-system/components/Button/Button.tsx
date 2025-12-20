/**
 * Button Component - Weave Design System
 *
 * A unique, thematic button with micro-interactions that embody identity transformation.
 * Features:
 * - Morphing glass effect on press
 * - Gradient shimmer on hover
 * - Haptic feedback
 * - Weave-pattern ripple animation
 * - Dynamic letter-spacing (tightens on press, mimicking "weaving")
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
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
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
  style?: ViewStyle;
  textStyle?: TextStyle;
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
  const { colors, spacing, radius: _radius, typography, springs } = useTheme();

  // Animation values
  const scale = useSharedValue(1);
  const shimmer = useSharedValue(0);
  const glassOpacity = useSharedValue(0.7);
  const letterSpacing = useSharedValue(typography.labelBase.letterSpacing || 0);
  const rippleScale = useSharedValue(0);

  // Handle press in
  const handlePressIn = useCallback(
    (event: any) => {
      if (!disabled && !loading) {
        // Haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Scale down slightly (like pressing into fabric)
        scale.value = withSpring(0.96, springs.press);

        // Increase glass effect (more transparent)
        glassOpacity.value = withTiming(0.9, { duration: 150 });

        // Tighten letter spacing (weaving tighter)
        letterSpacing.value = withTiming(-0.5, { duration: 150 });

        // Ripple animation from center
        rippleScale.value = withSpring(1, springs.quick);
      }
      onPressIn?.(event);
    },
    [disabled, loading, onPressIn, scale, glassOpacity, letterSpacing, rippleScale, springs]
  );

  // Handle press out
  const handlePressOut = useCallback(
    (event: any) => {
      if (!disabled && !loading) {
        // Scale back to normal
        scale.value = withSpring(1, springs.default);

        // Reset glass opacity
        glassOpacity.value = withTiming(0.7, { duration: 200 });

        // Reset letter spacing
        letterSpacing.value = withTiming(typography.labelBase.letterSpacing || 0, {
          duration: 200,
        });

        // Reset ripple
        rippleScale.value = withTiming(0, { duration: 300 });
      }
      onPressOut?.(event);
    },
    [
      disabled,
      loading,
      onPressOut,
      scale,
      glassOpacity,
      letterSpacing,
      rippleScale,
      springs,
      typography,
    ]
  );

  // Handle press
  const handlePress = useCallback(
    (event: any) => {
      if (!disabled && !loading) {
        // Success haptic
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Shimmer effect
        shimmer.value = withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0, { duration: 200 })
        );
      }
      onPress?.(event);
    },
    [disabled, loading, onPress, shimmer]
  );

  // Get variant styles
  const variantStyles = getVariantStyles(variant, colors);
  const sizeStyles = getSizeStyles(size, spacing);

  // Animated styles
  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const animatedGlassStyle = useAnimatedStyle(() => {
    return {
      opacity: glassOpacity.value,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      letterSpacing: letterSpacing.value,
    };
  });

  const animatedShimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmer.value, [0, 1], [-200, 200], Extrapolate.CLAMP);

    return {
      transform: [{ translateX }],
      opacity: shimmer.value * 0.5,
    };
  });

  const animatedRippleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: rippleScale.value }],
      opacity: 1 - rippleScale.value,
    };
  });

  const buttonStyle = [
    styles.button,
    variantStyles.button,
    sizeStyles.button,
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
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
      onPress={handlePress}
      disabled={disabled || loading}
      style={[animatedButtonStyle, buttonStyle]}
      {...pressableProps}
    >
      {/* Glass morphism layer */}
      <Animated.View style={[styles.glassLayer, variantStyles.glass, animatedGlassStyle]} />

      {/* Ripple effect */}
      <Animated.View
        style={[styles.ripple, { backgroundColor: variantStyles.ripple }, animatedRippleStyle]}
      />

      {/* Shimmer effect */}
      <Animated.View style={[styles.shimmer, animatedShimmerStyle]}>
        <View style={styles.shimmerGradient} />
      </Animated.View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <Animated.Text style={[innerTextStyle, animatedTextStyle]}>
          {loading ? 'Loading...' : children}
        </Animated.Text>

        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      {/* Weave pattern overlay (subtle) */}
      <View style={styles.weavePattern} pointerEvents="none">
        <WeavePatternSVG color={variantStyles.weaveColor} />
      </View>
    </AnimatedPressable>
  );
}

// Variant styles
function getVariantStyles(variant: ButtonVariant, colors: any) {
  const variants = {
    primary: {
      button: {
        backgroundColor: colors.accent[500],
        borderWidth: 0,
      },
      glass: {
        backgroundColor: `${colors.accent[400]}40`,
      },
      text: {
        color: colors.text.inverse,
        fontWeight: '600' as const,
      },
      ripple: `${colors.accent[300]}80`,
      weaveColor: `${colors.accent[200]}20`,
    },
    secondary: {
      button: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.accent[500],
      },
      glass: {
        backgroundColor: `${colors.accent[500]}10`,
      },
      text: {
        color: colors.accent[500],
        fontWeight: '500' as const,
      },
      ripple: `${colors.accent[500]}40`,
      weaveColor: `${colors.accent[500]}10`,
    },
    ghost: {
      button: {
        backgroundColor: 'transparent',
        borderWidth: 0,
      },
      glass: {
        backgroundColor: `${colors.text.primary}08`,
      },
      text: {
        color: colors.text.primary,
        fontWeight: '500' as const,
      },
      ripple: `${colors.text.primary}20`,
      weaveColor: `${colors.text.primary}05`,
    },
    destructive: {
      button: {
        backgroundColor: colors.rose[500],
        borderWidth: 0,
      },
      glass: {
        backgroundColor: `${colors.rose[400]}40`,
      },
      text: {
        color: colors.text.inverse,
        fontWeight: '600' as const,
      },
      ripple: `${colors.rose[300]}80`,
      weaveColor: `${colors.rose[200]}20`,
    },
    ai: {
      button: {
        backgroundColor: colors.violet[500],
        borderWidth: 0,
      },
      glass: {
        backgroundColor: `${colors.violet[400]}40`,
      },
      text: {
        color: colors.text.inverse,
        fontWeight: '600' as const,
      },
      ripple: `${colors.violet[300]}80`,
      weaveColor: `${colors.violet[200]}20`,
    },
    success: {
      button: {
        backgroundColor: colors.emerald[500],
        borderWidth: 0,
      },
      glass: {
        backgroundColor: `${colors.emerald[400]}40`,
      },
      text: {
        color: colors.text.inverse,
        fontWeight: '600' as const,
      },
      ripple: `${colors.emerald[300]}80`,
      weaveColor: `${colors.emerald[200]}20`,
    },
  };

  return variants[variant];
}

// Size styles
function getSizeStyles(size: ButtonSize, spacing: any) {
  const sizes = {
    sm: {
      button: {
        height: 40, // Increased from 36 to prevent text cutoff
        paddingHorizontal: spacing[3],
        paddingVertical: 2, // Add vertical padding for better text alignment
        borderRadius: 10,
      },
      text: {
        fontSize: 12,
        lineHeight: 16, // Explicit line height for consistent text rendering
      },
    },
    md: {
      button: {
        height: 48, // Increased from 44 to prevent text cutoff
        paddingHorizontal: spacing[4],
        paddingVertical: 2, // Add vertical padding for better text alignment
        borderRadius: 12,
      },
      text: {
        fontSize: 14,
        lineHeight: 20, // Explicit line height for consistent text rendering
      },
    },
    lg: {
      button: {
        height: 60, // Increased from 56 to prevent text cutoff
        paddingHorizontal: spacing[6],
        paddingVertical: 2, // Add vertical padding for better text alignment
        borderRadius: 14,
      },
      text: {
        fontSize: 16,
        lineHeight: 24, // Explicit line height for consistent text rendering
      },
    },
  };

  return sizes[size];
}

// Weave pattern SVG component (simplified for now, will be enhanced)
function WeavePatternSVG({ color }: { color: string }) {
  return (
    <View style={{ opacity: 0.3 }}>
      {/* This will be replaced with actual SVG curves */}
      <View style={[styles.weaveLineHorizontal, { backgroundColor: color }]} />
      <View style={[styles.weaveLineVertical, { backgroundColor: color }]} />
    </View>
  );
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
  glassLayer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  ripple: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    width: 200,
    height: '100%',
  },
  shimmerGradient: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  weavePattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
    pointerEvents: 'none',
  },
  weaveLineHorizontal: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: 1,
    transform: [{ scaleX: 1.2 }],
  },
  weaveLineVertical: {
    position: 'absolute',
    left: '40%',
    top: 0,
    bottom: 0,
    width: 1,
    transform: [{ scaleY: 1.2 }],
  },
});
