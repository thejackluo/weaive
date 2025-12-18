import React from 'react';
import { Text } from './Text';
import { TextProps } from './types';

export function Body(props: Omit<TextProps, 'variant' | 'color'>) {
  return <Text variant="textBase" color="secondary" {...props} />;
}
