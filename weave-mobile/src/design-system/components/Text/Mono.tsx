import React from 'react';
import { Text } from './Text';
import { TextProps } from './types';

export function Mono(props: Omit<TextProps, 'variant'>) {
  return <Text variant="monoBase" {...props} />;
}
