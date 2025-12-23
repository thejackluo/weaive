/**
 * BodySmall Component
 * Preset for bodySm variant
 */

import React from 'react';
import { Text } from './Text';
import { TextComponentProps } from './types';

/**
 * BodySmall component (preset: bodySm)
 */
export function BodySmall(props: Omit<TextComponentProps, 'variant'>) {
  return <Text {...props} variant="bodySm" />;
}

BodySmall.displayName = 'BodySmall';
