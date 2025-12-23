/**
 * Heading Component
 * Semantic heading component (h1-h6)
 */

import React from 'react';
import { Text } from './Text';
import { HeadingProps } from './types';
import { TextVariant } from './types';

/**
 * Map heading level to typography variant
 */
const levelToVariant: Record<number, TextVariant> = {
  1: 'displayLg',
  2: 'displayMd',
  3: 'displaySm',
  4: 'titleLg',
  5: 'titleMd',
  6: 'titleSm',
};

/**
 * Semantic Heading component
 * Maps heading levels (1-6) to appropriate typography variants
 *
 * @example
 * ```tsx
 * <Heading level={1} color="text.primary">
 *   Page Title
 * </Heading>
 * ```
 */
export function Heading({
  level = 2,
  children,
  ...textProps
}: HeadingProps) {
  const variant = levelToVariant[level];

  return (
    <Text
      {...textProps}
      variant={variant}
      accessibilityRole="header"
      accessibilityLevel={level}
    >
      {children}
    </Text>
  );
}

Heading.displayName = 'Heading';
