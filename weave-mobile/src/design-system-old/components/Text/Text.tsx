/**
 * Text Component - Foundation for all text rendering
 *
 * Built with NativeWind v5 and Tailwind CSS v4
 * Uses tailwind-variants for type-safe variant management
 *
 * @example
 * <Text variant="displayLg" color="primary">Heading</Text>
 * <Text variant="textBase" color="secondary">Body text</Text>
 * <Text className="text-rose-500">Custom styling</Text>
 */

import React from 'react';
import { Text as RNText } from 'react-native';
import { tv } from 'tailwind-variants';
import { TextProps } from './types';
import { COMPONENT_NAMES } from '../../constants';

/**
 * Text variants using tailwind-variants
 * Maps typography scale to Tailwind classes
 */
const textVariants = tv({
  base: 'font-sans', // Base font family
  variants: {
    variant: {
      // Display variants (large headings)
      display2xl: 'text-[72px] leading-[1.1] font-bold tracking-tight',
      displayXl: 'text-[60px] leading-[1.15] font-bold tracking-tight',
      displayLg: 'text-[48px] leading-[1.2] font-bold tracking-tight',
      displayMd: 'text-4xl leading-[1.25] font-semibold tracking-tight',

      // Text variants (body text)
      textLg: 'text-lg leading-[1.5] font-normal',
      textBase: 'text-base leading-[1.5] font-normal',
      textSm: 'text-sm leading-[1.45] font-normal',
      textXs: 'text-xs leading-[1.4] font-normal',

      // Label variant (buttons, form labels)
      labelBase: 'text-sm leading-[1.45] font-medium tracking-wide',

      // Mono variant (code snippets)
      monoBase: 'text-[13px] leading-[1.5] font-mono',
    },
    color: {
      primary: 'text-text-primary',
      secondary: 'text-text-secondary',
      muted: 'text-text-muted',
      disabled: 'text-text-disabled',
      ai: 'text-text-ai',
      success: 'text-text-success',
      error: 'text-text-error',
      warning: 'text-text-warning',
    },
    weight: {
      light: 'font-light',
      regular: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
    uppercase: {
      true: 'uppercase',
    },
  },
  defaultVariants: {
    variant: 'textBase',
    color: 'primary',
    align: 'left',
  },
});

export function Text({
  variant = 'textBase',
  color = 'primary',
  align = 'left',
  weight,
  uppercase,
  className,
  children,
  ...restProps
}: TextProps) {
  // Generate className string using tailwind-variants
  const classes = textVariants({
    variant,
    color,
    align,
    weight,
    uppercase,
    className,
  });

  return (
    <RNText className={classes} {...restProps}>
      {children}
    </RNText>
  );
}

Text.displayName = COMPONENT_NAMES.TEXT;
