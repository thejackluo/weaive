/**
 * GlassView - Web Implementation
 *
 * Web version without native blur dependency
 * Uses CSS backdrop-filter instead (supported in modern browsers)
 *
 * @example
 * <GlassView variant="card">
 *   <Text>Content on glass</Text>
 * </GlassView>
 */

import React from 'react';
import { View, ViewProps } from 'react-native';
import { tv, VariantProps } from 'tailwind-variants';
import { COMPONENT_NAMES } from '../../constants';

/**
 * Glass variants using tailwind-variants
 * Web version uses backdrop-blur from Tailwind CSS
 */
const glassVariants = tv({
  base: 'rounded-2xl overflow-hidden backdrop-blur-md',
  variants: {
    variant: {
      // Standard glass card - subtle blur for content cards
      card: 'bg-background-glass border border-border-default',

      // Elevated glass - more prominent blur with shadow
      elevated: 'bg-background-glass border border-border-strong shadow-lg backdrop-blur-lg',

      // AI-themed glass - violet tint for AI-related content
      ai: 'bg-[rgba(157,113,232,0.15)] border border-[rgba(157,113,232,0.25)] backdrop-blur-lg',

      // Success-themed glass - emerald tint for success states
      success: 'bg-[rgba(16,216,126,0.15)] border border-[rgba(16,216,126,0.25)] backdrop-blur-lg',

      // Subtle glass - minimal effect
      subtle: 'bg-[rgba(26,26,31,0.5)] border border-border-muted backdrop-blur-sm',

      // Navigation glass - strong blur for nav bars
      nav: 'bg-background-glass border-b border-border-default backdrop-blur-xl',

      // Overlay glass - modal/overlay backgrounds
      overlay: 'bg-background-overlay border border-border-muted backdrop-blur-2xl',
    },
  },
  defaultVariants: {
    variant: 'card',
  },
});

export interface GlassViewProps
  extends Omit<ViewProps, 'style'>, VariantProps<typeof glassVariants> {
  /**
   * Custom blur amount (ignored on web, uses CSS classes)
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
  disableBlur: _disableBlur = false,
  className,
  children,
  ...restProps
}: GlassViewProps) {
  const classes = glassVariants({ variant, className });

  return (
    <View className={classes} {...restProps}>
      {children}
    </View>
  );
}

GlassView.displayName = COMPONENT_NAMES.GLASS_VIEW;
