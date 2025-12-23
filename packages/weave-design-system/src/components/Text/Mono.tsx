/**
 * Mono Component
 * Monospace text for code and technical content
 */

import React, { useMemo } from 'react';
import { Text as TamaguiText } from 'tamagui';
import { useTheme } from '../../theme';
import { MonoProps, MonoVariant } from './types';

/**
 * Monospace variant mappings
 */
const monoVariantStyles: Record<MonoVariant, { fontSize: number; lineHeight: number }> = {
  'mono.xs': { fontSize: 11, lineHeight: 16 },
  'mono.sm': { fontSize: 13, lineHeight: 18 },
  'mono.md': { fontSize: 14, lineHeight: 20 },
  'mono.lg': { fontSize: 16, lineHeight: 24 },
};

/**
 * Monospace text component for code and technical content
 *
 * @example
 * ```tsx
 * <Mono variant="mono.md" color="text.primary">
 *   const x = 42;
 * </Mono>
 * ```
 */
export function Mono({
  variant = 'mono.md',
  color = 'text.primary',
  align = 'left',
  numberOfLines,
  ellipsizeMode,
  children,
  ...props
}: MonoProps) {
  const theme = useTheme();

  // Resolve color from theme tokens or use raw value
  const resolvedColor = useMemo(() => {
    if (color.includes('.')) {
      const path = color.split('.');
      let value: any = theme.colors;
      for (const key of path) {
        value = value?.[key];
      }
      return value || color;
    }
    return color;
  }, [color, theme.colors]);

  const variantStyle = monoVariantStyles[variant];

  const style = useMemo(
    () => ({
      fontFamily: 'Courier New',
      fontSize: variantStyle.fontSize,
      lineHeight: variantStyle.lineHeight,
      fontWeight: '400',
      color: resolvedColor,
      textAlign: align,
    }),
    [variantStyle, resolvedColor, align]
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

Mono.displayName = 'Mono';
