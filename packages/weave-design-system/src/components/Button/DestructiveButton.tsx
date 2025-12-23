/**
 * DestructiveButton Component
 * Preset with destructive variant (red accent)
 */

import React from 'react';
import { Button } from './Button';
import { ButtonProps } from './types';

/**
 * DestructiveButton (preset: variant="destructive")
 */
export function DestructiveButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="destructive" />;
}

DestructiveButton.displayName = 'DestructiveButton';
