/**
 * SecondaryButton Component
 * Preset with secondary variant
 */

import React from 'react';
import { Button } from './Button';
import { ButtonProps } from './types';

/**
 * SecondaryButton (preset: variant="secondary")
 */
export function SecondaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="secondary" />;
}

SecondaryButton.displayName = 'SecondaryButton';
