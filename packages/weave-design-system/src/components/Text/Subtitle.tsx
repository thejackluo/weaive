/**
 * Subtitle Component
 * Preset for titleSm variant
 */

import React from 'react';
import { Text } from './Text';
import { TextComponentProps } from './types';

/**
 * Subtitle component (preset: titleSm)
 */
export function Subtitle(props: Omit<TextComponentProps, 'variant'>) {
  return <Text {...props} variant="titleSm" />;
}

Subtitle.displayName = 'Subtitle';
