/**
 * GlassView - Glassmorphism Effect Component
 *
 * Implements 2025 Liquid Glass UI using @react-native-community/blur
 * Provides frosted glass effect with blur and translucency
 *
 * @example
 * <GlassView variant="card">
 *   <Text>Content on glass</Text>
 * </GlassView>
 *
 * @requires @react-native-community/blur
 * @see https://github.com/Kureev/react-native-blur
 */

import React from 'react';
import { View, ViewProps, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { GlassVariant } from '../../tokens/effects';
import { COMPONENT_NAMES } from '../../constants';

// Optional blur import - gracefully degrades if not installed
let BlurView: any;
try {
  // @ts-ignore
  BlurView = require('@react-native-community/blur').BlurView;
} catch (e) {
  // BlurView not installed - will fall back to regular View
  console.warn(
    '@react-native-community/blur not installed. GlassView will render without blur effect. Install with: npm install @react-native-community/blur'
  );
}

export interface GlassViewProps extends Omit<ViewProps, 'style'> {
  /**
   * Glass variant from design system
   * @default 'card'
   */
  variant?: GlassVariant;

  /**
   * Custom blur amount (0-100)
   * Overrides variant blur amount
   */
  blurAmount?: number;

  /**
   * Disable blur effect (useful for debugging/testing)
   * @default false
   */
  disableBlur?: boolean;

  /**
   * Additional styles
   */
  style?: ViewProps['style'];
}

export function GlassView({
  variant = 'card',
  blurAmount,
  disableBlur = false,
  style,
  children,
  ...restProps
}: GlassViewProps) {
  const { glass, radius } = useTheme();

  const glassConfig = glass[variant];
  const finalBlurAmount = blurAmount || glassConfig.blurAmount;

  // On web or if BlurView is not available, use regular View with glass style
  if (Platform.OS === 'web' || !BlurView || disableBlur) {
    return (
      <View
        style={[
          glassConfig.style,
          {
            borderRadius: radius.xl,
            overflow: 'hidden',
          },
          style,
        ]}
        {...restProps}
      >
        {children}
      </View>
    );
  }

  // Native platforms with blur support
  return (
    <BlurView
      blurType={glassConfig.blurType}
      blurAmount={finalBlurAmount}
      style={[
        glassConfig.style,
        {
          borderRadius: radius.xl,
          overflow: 'hidden',
        },
        style,
      ]}
      {...restProps}
    >
      {children}
    </BlurView>
  );
}

GlassView.displayName = COMPONENT_NAMES.GLASS_VIEW;
