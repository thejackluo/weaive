/**
 * Caption Component
 * Preset for caption variant
 */

import React from 'react';
import { Text } from './Text';
import { TextComponentProps } from './types';

/**
 * Caption component (preset: caption)
 */
export function Caption(props: Omit<TextComponentProps, 'variant'>) {
  return <Text {...props} variant="caption" />;
}

Caption.displayName = 'Caption';
