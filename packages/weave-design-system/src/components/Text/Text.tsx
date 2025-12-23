/**
 * Text Component
 * Base text component with typography variants and theme integration
 */

import React, { useMemo } from 'react';
import { Text as TamaguiText, styled } from 'tamagui';
import { useTheme } from '../../theme';
import { TextComponentProps, TextVariant, TextWeight } from './types';

/**
 * Typography variant mappings to token values
 */
const variantStyles: Record<TextVariant, { fontSize: number; lineHeight: number; letterSpacing: number }> = {
  displayLg: { fontSize: 57, lineHeight: 64, letterSpacing: -0.25 },
  displayMd: { fontSize: 45, lineHeight: 52, letterSpacing: 0 },
  displaySm: { fontSize: 36, lineHeight: 44, letterSpacing: 0 },
  titleLg: { fontSize: 32, lineHeight: 40, letterSpacing: 0 },
  titleMd: { fontSize: 28, lineHeight: 36, letterSpacing: 0 },
  titleSm: { fontSize: 24, lineHeight: 32, letterSpacing: 0 },
  bodyLg: { fontSize: 18, lineHeight: 28, letterSpacing: 0.15 },
  bodyMd: { fontSize: 16, lineHeight: 24, letterSpacing: 0.15 },
  bodySm: { fontSize: 14, lineHeight: 20, letterSpacing: 0.1 },
  caption: { fontSize: 12, lineHeight: 16, letterSpacing: 0.4 },
  label: { fontSize: 11, lineHeight: 16, letterSpacing: 0.5 },
};

/**
 * Font weight mappings
 */
const weightStyles: Record<TextWeight, string> = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

/**
 * Base Text component with variant system
 *
 * @example
 * ```tsx
 * <Text variant="titleMd" color="text.primary">
 *   Hello World
 * </Text>
 * ```
 */
export function Text({
  variant = 'bodyMd',
  color = 'text.primary',
  weight = 'regular',
  align = 'left',
  numberOfLines,
  ellipsizeMode,
  children,
  ...props
}: TextComponentProps) {
  const theme = useTheme();

  // Resolve color from theme tokens or use raw value
  const resolvedColor = useMemo(() => {
    if (color.includes('.')) {
      // Theme token path like "text.primary"
      const path = color.split('.');
      let value: any = theme.colors;
      for (const key of path) {
        value = value?.[key];
      }
      return value || color;
    }
    return color;
  }, [color, theme.colors]);

  const variantStyle = variantStyles[variant];

  const style = useMemo(
    () => ({
      fontFamily: 'System',
      fontSize: variantStyle.fontSize,
      lineHeight: variantStyle.lineHeight,
      letterSpacing: variantStyle.letterSpacing,
      fontWeight: weightStyles[weight],
      color: resolvedColor,
      textAlign: align,
    }),
    [variantStyle, weight, resolvedColor, align]
  );

  return (
    <TamaguiText
      {...props}
      style={style}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
    >
      {children}
    </TamaguiText>
  );
}

Text.displayName = 'Text';
