/**
 * PrimaryButton Component
 * Preset with primary variant
 */

import React from 'react';
import { Button } from './Button';
import { ButtonProps } from './types';

/**
 * PrimaryButton (preset: variant="primary")
 */
export function PrimaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="primary" />;
}

PrimaryButton.displayName = 'PrimaryButton';
