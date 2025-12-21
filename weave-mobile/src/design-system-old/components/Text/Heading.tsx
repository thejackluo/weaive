/**
 * Heading Component - Large display text
 * Convenience wrapper for Text with display variants
 *
 * @example
 * <Heading variant="display2xl">Large Heading</Heading>
 * <Heading>Default displayLg</Heading>
 */

import React from 'react';
import { Text } from './Text';
import { TextProps } from './types';

export function Heading({
  variant = 'displayLg',
  ...props
}: Omit<TextProps, 'variant'> & { variant?: 'displayLg' | 'displayXl' | 'display2xl' }) {
  return <Text variant={variant} {...props} />;
}
