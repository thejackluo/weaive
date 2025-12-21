/**
 * Caption Component - Small helper text
 * Convenience wrapper for Text with textXs variant
 *
 * @example
 * <Caption>Helper text</Caption>
 * <Caption color="success">Success message</Caption>
 */

import React from 'react';
import { Text } from './Text';
import { TextProps } from './types';

export function Caption({ color = 'muted', ...props }: Omit<TextProps, 'variant'>) {
  return <Text variant="textXs" color={color} {...props} />;
}
