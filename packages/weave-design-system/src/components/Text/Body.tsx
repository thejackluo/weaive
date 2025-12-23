/**
 * Body Component
 * Preset for bodyMd variant
 */

import React from 'react';
import { Text } from './Text';
import { TextComponentProps } from './types';

/**
 * Body component (preset: bodyMd)
 */
export function Body(props: Omit<TextComponentProps, 'variant'>) {
  return <Text {...props} variant="bodyMd" />;
}

Body.displayName = 'Body';
