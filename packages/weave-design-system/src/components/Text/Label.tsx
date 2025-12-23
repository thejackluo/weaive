/**
 * Label Component
 * Preset for label variant
 */

import React from 'react';
import { Text } from './Text';
import { TextComponentProps } from './types';

/**
 * Label component (preset: label)
 */
export function Label(props: Omit<TextComponentProps, 'variant'>) {
  return <Text {...props} variant="label" />;
}

Label.displayName = 'Label';
