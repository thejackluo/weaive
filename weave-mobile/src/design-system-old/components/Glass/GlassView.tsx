/**
 * GlassView - Glassmorphism Effect Component
 *
 * Implements 2025 Liquid Glass UI using @react-native-community/blur
 * Built with NativeWind v5 and tailwind-variants
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
import { tv, VariantProps } from 'tailwind-variants';
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

/**
 * Glass variants using tailwind-variants
 * Defines background color, border, and opacity for each glass style
 */
const glassVariants = tv({
  base: 'rounded-2xl overflow-hidden',
  variants: {
    variant: {
      // Standard glass card - subtle blur for content cards
      card: 'bg-background-glass border border-border-default',

      // Elevated glass - more prominent blur with shadow
      elevated: 'bg-background-glass border border-border-strong shadow-lg',

      // AI-themed glass - violet tint for AI-related content
      ai: 'bg-[rgba(157,113,232,0.15)] border border-[rgba(157,113,232,0.25)]',

      // Success-themed glass - emerald tint for success states
      success: 'bg-[rgba(16,216,126,0.15)] border border-[rgba(16,216,126,0.25)]',

      // Subtle glass - minimal effect
      subtle: 'bg-[rgba(26,26,31,0.5)] border border-border-muted',

      // Navigation glass - strong blur for nav bars
      nav: 'bg-background-glass border-b border-border-default',

      // Overlay glass - modal/overlay backgrounds
      overlay: 'bg-background-overlay border border-border-muted',
    },
  },
  defaultVariants: {
    variant: 'card',
  },
});

/**
 * Blur amount configuration for each variant
 * Maps to blurAmount prop of BlurView (0-100 scale)
 */
const blurConfig = {
  card: 20,
  elevated: 30,
  ai: 25,
  success: 25,
  subtle: 10,
  nav: 40,
  overlay: 50,
} as const;

/**
 * Blur type configuration for each variant
 * iOS: 'dark' | 'light' | 'xlight'
 * Android uses blurAmount only
 */
const blurTypeConfig = {
  card: 'dark' as const,
  elevated: 'dark' as const,
  ai: 'dark' as const,
  success: 'dark' as const,
  subtle: 'dark' as const,
  nav: 'dark' as const,
  overlay: 'dark' as const,
};

export interface GlassViewProps
  extends Omit<ViewProps, 'style'>, VariantProps<typeof glassVariants> {
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
   * NativeWind className for additional styling
   */
  className?: string;
}

export function GlassView({
  variant = 'card',
  blurAmount,
  disableBlur = false,
  className,
  children,
  ...restProps
}: GlassViewProps) {
  const finalBlurAmount = blurAmount || blurConfig[variant!];
  const classes = glassVariants({ variant, className });

  // On web or if BlurView is not available, use regular View with glass style
  if (Platform.OS === 'web' || !BlurView || disableBlur) {
    return (
      <View className={classes} {...restProps}>
        {children}
      </View>
    );
  }

  // Native platforms with blur support
  // Note: BlurView doesn't support className, so we pass className to a wrapper View
  return (
    <View className={classes} {...restProps}>
      <BlurView
        blurType={blurTypeConfig[variant!]}
        blurAmount={finalBlurAmount}
        className="absolute inset-0"
      />
      <View className="relative">{children}</View>
    </View>
  );
}

GlassView.displayName = COMPONENT_NAMES.GLASS_VIEW;
