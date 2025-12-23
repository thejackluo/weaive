/**
 * Title Component
 * Preset for titleMd variant
 */

import React from 'react';
import { Text } from './Text';
import { TextComponentProps } from './types';

/**
 * Title component (preset: titleMd)
 */
export function Title(props: Omit<TextComponentProps, 'variant'>) {
  return <Text {...props} variant="titleMd" />;
}

Title.displayName = 'Title';
