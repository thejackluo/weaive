import React from 'react';
import { Text } from './Text';
import { TextProps } from './types';

export function Label(props: Omit<TextProps, 'variant'>) {
  return <Text variant="labelBase" {...props} />;
}
