/**
 * Body Component - Default body text
 * Convenience wrapper for Text with textBase variant
 *
 * @example
 * <Body>This is body text</Body>
 * <Body className="text-text-ai">Custom color body</Body>
 */

import React from 'react';
import { Text } from './Text';
import { TextProps } from './types';

export function Body(props: Omit<TextProps, 'variant'>) {
  return <Text variant="textBase" {...props} />;
}
