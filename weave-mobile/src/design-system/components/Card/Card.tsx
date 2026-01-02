/**
 * Card Component - Minimal Black/White Design
 *
 * iOS 17-inspired cards with generous rounded corners
 * Stoic aesthetic: clean, purposeful, no decoration
 */

import React from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';
import type { CardVariant, CardPadding } from './types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface CardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  pressable?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({
  variant = 'default',
  padding = 'default',
  pressable = false,
  onPress,
  children,
  style,
}: CardProps) {
  const { colors, spacing, radius, springs } = useTheme();

  const scale = useSharedValue(1);

  const variantStyles = getVariantStyles(variant, colors);
  const paddingValue = getPaddingValue(padding, spacing);

  const handlePressIn = () => {
    if (pressable) {
      scale.value = withSpring(0.98, springs.press);
    }
  };

  const handlePressOut = () => {
    if (pressable) {
      scale.value = withSpring(1, springs.default);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const Component = pressable ? AnimatedPressable : View;
  const componentProps = pressable
    ? { onPressIn: handlePressIn, onPressOut: handlePressOut, onPress }
    : {};

  return (
    <Component
      style={[
        styles.card,
        variantStyles,
        { padding: paddingValue, borderRadius: radius.xl }, // iOS 17 style (24px)
        pressable && animatedStyle,
        style,
      ]}
      {...componentProps}
    >
      {/* Content - no decorative overlays for minimal aesthetic */}
      {children}
    </Component>
  );
}

function getVariantStyles(variant: CardVariant, colors: any) {
  const variants = {
    // Default: Dark gray card on black background
    default: {
      backgroundColor: colors.background.secondary, // #1A1A1A
      borderWidth: 1,
      borderColor: colors.border.subtle, // Very subtle border
    },
    // Elevated: Slightly lighter with shadow
    elevated: {
      backgroundColor: colors.background.elevated, // #2A2A2A
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 6,
      borderWidth: 0,
    },
    // Outlined: Transparent with visible border
    outlined: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.border.muted,
    },
    // Subtle: Very slight variation from background
    subtle: {
      backgroundColor: colors.background.subtle, // #0F0F0F
      borderWidth: 1,
      borderColor: colors.border.subtle,
    },
    // Glass: Kept for backwards compatibility (maps to default)
    glass: {
      backgroundColor: colors.background.secondary,
      borderWidth: 1,
      borderColor: colors.border.muted,
    },
    // Success: Green tint for positive states
    success: {
      backgroundColor: colors.semantic.success.bg,
      borderWidth: 1,
      borderColor: colors.semantic.success.border,
    },
    // AI: Maps to default (no violet in minimal design)
    ai: {
      backgroundColor: colors.background.secondary,
      borderWidth: 1,
      borderColor: colors.border.muted,
    },
  };

  return variants[variant];
}

function getPaddingValue(padding: CardPadding, spacing: any) {
  const paddings: Record<CardPadding, number> = {
    none: 0,
    sm: spacing[2],
    compact: spacing[3],
    default: spacing[4],
    spacious: spacing[6],
  };
  return paddings[padding];
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    overflow: 'hidden',
  },
});
