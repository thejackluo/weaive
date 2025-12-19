/**
 * Weave Design System - Text Component
 *
 * Typography component with built-in variants
 * Automatically uses theme colors
 *
 * Usage:
 * <Text variant="displayLg">Heading</Text>
 * <Text variant="textBase" color="secondary">Body text</Text>
 */

import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleSheet,
  TextStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useTheme } from '../theme';

// =============================================================================
// TYPES
// =============================================================================

export type TextVariant =
  | 'display2xl'
  | 'displayXl'
  | 'displayLg'
  | 'displayMd'
  | 'textLg'
  | 'textBase'
  | 'textSm'
  | 'textXs'
  | 'labelLg'
  | 'labelBase'
  | 'labelSm'
  | 'labelXs'
  | 'monoBase'
  | 'monoSm';

export type TextColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'muted'
  | 'placeholder'
  | 'disabled'
  | 'inverse'
  | 'link'
  | 'accent'
  | 'ai'
  | 'success'
  | 'warning'
  | 'error';

export interface TextProps extends Omit<RNTextProps, 'style'> {
  /** Typography variant */
  variant?: TextVariant;

  /** Text color from theme */
  color?: TextColor;

  /** Custom color (overrides color prop) */
  customColor?: string;

  /** Text alignment */
  align?: 'left' | 'center' | 'right';

  /** Font weight override */
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';

  /** Make text uppercase */
  uppercase?: boolean;

  /** Custom style */
  style?: TextStyle;

  /** Children */
  children: React.ReactNode;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function Text({
  variant = 'textBase',
  color = 'primary',
  customColor,
  align,
  weight,
  uppercase,
  style,
  children,
  ...props
}: TextProps) {
  const { colors, typography } = useTheme();

  // Get variant styles
  const variantStyle = typography[variant] as TextStyle;

  // Get color
  const textColor = customColor || colors.text[color];

  // Build style object
  const computedStyle: TextStyle = {
    ...variantStyle,
    color: textColor,
    ...(align && { textAlign: align }),
    ...(weight && { fontWeight: getFontWeight(weight) }),
    ...(uppercase && { textTransform: 'uppercase' }),
  };

  return (
    <RNText style={[computedStyle, style]} {...props}>
      {children}
    </RNText>
  );
}

// =============================================================================
// ANIMATED VERSION
// =============================================================================

export const AnimatedText = Animated.createAnimatedComponent(Text);

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getFontWeight(
  weight: 'regular' | 'medium' | 'semibold' | 'bold'
): TextStyle['fontWeight'] {
  switch (weight) {
    case 'regular':
      return '400';
    case 'medium':
      return '500';
    case 'semibold':
      return '600';
    case 'bold':
      return '700';
    default:
      return '400';
  }
}

// =============================================================================
// CONVENIENCE COMPONENTS
// =============================================================================

/** Large display heading */
export function Heading({
  children,
  ...props
}: Omit<TextProps, 'variant'>) {
  return (
    <Text variant="displayLg" {...props}>
      {children}
    </Text>
  );
}

/** Page title */
export function Title({
  children,
  ...props
}: Omit<TextProps, 'variant'>) {
  return (
    <Text variant="displayMd" {...props}>
      {children}
    </Text>
  );
}

/** Section subtitle */
export function Subtitle({
  children,
  color = 'secondary',
  ...props
}: Omit<TextProps, 'variant'>) {
  return (
    <Text variant="textBase" color={color} {...props}>
      {children}
    </Text>
  );
}

/** Body text */
export function Body({
  children,
  color = 'secondary',
  ...props
}: Omit<TextProps, 'variant'>) {
  return (
    <Text variant="textBase" color={color} {...props}>
      {children}
    </Text>
  );
}

/** Small body text */
export function BodySmall({
  children,
  color = 'tertiary',
  ...props
}: Omit<TextProps, 'variant'>) {
  return (
    <Text variant="textSm" color={color} {...props}>
      {children}
    </Text>
  );
}

/** Caption/helper text */
export function Caption({
  children,
  color = 'muted',
  ...props
}: Omit<TextProps, 'variant'>) {
  return (
    <Text variant="textXs" color={color} {...props}>
      {children}
    </Text>
  );
}

/** Label text */
export function Label({
  children,
  color = 'secondary',
  ...props
}: Omit<TextProps, 'variant'>) {
  return (
    <Text variant="labelBase" color={color} {...props}>
      {children}
    </Text>
  );
}

/** Link text */
export function Link({
  children,
  ...props
}: Omit<TextProps, 'variant' | 'color'>) {
  return (
    <Text variant="textBase" color="link" {...props}>
      {children}
    </Text>
  );
}

/** Monospace text */
export function Mono({
  children,
  color = 'secondary',
  ...props
}: Omit<TextProps, 'variant'>) {
  return (
    <Text variant="monoBase" color={color} {...props}>
      {children}
    </Text>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export default Text;
