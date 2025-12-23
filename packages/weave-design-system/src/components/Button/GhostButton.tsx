/**
 * GhostButton Component
 * Preset with ghost variant
 */

import React from 'react';
import { Button } from './Button';
import { ButtonProps } from './types';

/**
 * GhostButton (preset: variant="ghost")
 */
export function GhostButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="ghost" />;
}

GhostButton.displayName = 'GhostButton';
