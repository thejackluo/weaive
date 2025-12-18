/**
 * Text Component - Foundation for all text rendering
 *
 * Uses NativeWind v5 for styling with theme integration
 * Provides consistent typography across the app
 *
 * @example
 * <Text variant="displayLg" color="primary">Heading</Text>
 * <Text variant="textBase" color="secondary">Body text</Text>
 * <Text customColor="#FF0000">Custom color</Text>
 */

import React from 'react';
import { Text as RNText } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { TextProps } from './types';
import { COMPONENT_NAMES } from '../../constants';

export function Text({
  variant = 'textBase',
  color = 'primary',
  customColor,
  align = 'left',
  weight,
  uppercase = false,
  style,
  children,
  ...restProps
}: TextProps) {
  const { colors, typography } = useTheme();

  // Get typography style
  const typographyStyle = typography[variant];

  // Get color
  const textColor = customColor || colors.text[color];

  // Get weight override
  const fontWeight = weight ? typography.fontWeights[weight] : typographyStyle.fontWeight;

  // Combine styles
  const combinedStyle = [
    typographyStyle,
    {
      color: textColor,
      textAlign: align,
      fontWeight,
      ...(uppercase && { textTransform: 'uppercase' as const }),
    },
    style,
  ];

  return (
    <RNText style={combinedStyle} {...restProps}>
      {children}
    </RNText>
  );
}

Text.displayName = COMPONENT_NAMES.TEXT;
