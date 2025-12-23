/**
 * AIButton Component
 * Preset with AI variant (gradient, sparkle, special glow)
 */

import React from 'react';
import { Button } from './Button';
import { ButtonProps } from './types';

/**
 * AIButton (preset: variant="ai" with gradient and sparkle icon)
 *
 * @example
 * ```tsx
 * <AIButton size="lg" onPress={handleGenerate}>
 *   <Button.Icon name="sparkles" />
 *   <Button.Text>Generate with AI</Button.Text>
 * </AIButton>
 * ```
 */
export function AIButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="ai" />;
}

AIButton.displayName = 'AIButton';
