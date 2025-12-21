import React from 'react';
import { Text } from './Text';
import { TextProps } from './types';

export function Title(props: Omit<TextProps, 'variant'>) {
  return <Text variant="displayMd" {...props} />;
}
