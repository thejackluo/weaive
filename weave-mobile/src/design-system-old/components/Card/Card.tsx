/**
 * Card Component - Weave Design System
 *
 * Glass-effect cards with animated borders and depth layers
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
        { padding: paddingValue, borderRadius: radius.xl },
        animatedStyle,
        style,
      ]}
      {...componentProps}
    >
      {/* Glass blur layer */}
      {variant === 'glass' && <View style={[StyleSheet.absoluteFill, styles.glassLayer]} />}

      {/* Content */}
      <View style={styles.content}>{children}</View>

      {/* Subtle weave pattern overlay */}
      <View style={styles.weaveOverlay} pointerEvents="none">
        <View style={[styles.weaveLine, { backgroundColor: variantStyles.weaveColor }]} />
        <View
          style={[
            styles.weaveLine,
            styles.weaveLineVertical,
            { backgroundColor: variantStyles.weaveColor },
          ]}
        />
      </View>
    </Component>
  );
}

function getVariantStyles(variant: CardVariant, colors: any) {
  const variants = {
    default: {
      backgroundColor: colors.background.secondary,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      weaveColor: `${colors.text.primary}05`,
    },
    glass: {
      backgroundColor: colors.background.glass,
      borderWidth: 1,
      borderColor: colors.border.glass,
      weaveColor: `${colors.accent[500]}10`,
    },
    elevated: {
      backgroundColor: colors.background.elevated,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 0,
      weaveColor: `${colors.text.primary}05`,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.border.muted,
      weaveColor: `${colors.text.primary}03`,
    },
    ai: {
      backgroundColor: colors.semantic.ai.bg,
      borderWidth: 1,
      borderColor: colors.semantic.ai.border,
      weaveColor: `${colors.violet[500]}15`,
    },
    success: {
      backgroundColor: colors.semantic.success.bg,
      borderWidth: 1,
      borderColor: colors.semantic.success.border,
      weaveColor: `${colors.emerald[500]}15`,
    },
    subtle: {
      backgroundColor: colors.background.primary,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      weaveColor: `${colors.text.primary}03`,
    },
  };

  return variants[variant];
}

function getPaddingValue(padding: CardPadding, spacing: any) {
  const paddings = {
    none: 0,
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
  glassLayer: {
    opacity: 0.7,
  },
  content: {
    zIndex: 1,
  },
  weaveOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
    pointerEvents: 'none',
  },
  weaveLine: {
    position: 'absolute',
    top: '35%',
    left: 0,
    right: 0,
    height: 1,
  },
  weaveLineVertical: {
    top: 0,
    bottom: 0,
    left: '45%',
    width: 1,
    height: undefined,
  },
});
