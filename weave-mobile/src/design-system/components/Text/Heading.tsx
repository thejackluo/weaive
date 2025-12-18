import React from 'react';
import { Text } from './Text';
import { TextProps } from './types';

export function Heading({ variant = 'displayLg', ...props }: Omit<TextProps, 'variant'> & { variant?: 'displayLg' | 'displayXl' | 'display2xl' }) {
  return <Text variant={variant} {...props} />;
}
