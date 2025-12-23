/**
 * Button Component Types
 */

import { ReactNode } from 'react';
import { IconName } from '../Icon/types';

/**
 * Button variants
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'ai' | 'unstyled';

/**
 * Button sizes
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Props for base Button component
 */
export interface ButtonProps {
  /** Button variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state (shows spinner) */
  loading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Press handler */
  onPress?: () => void;
  /** Children (use Button.Icon, Button.Text, Button.Spinner) */
  children?: ReactNode;
  /** Accessibility label */
  accessibilityLabel?: string;
}

/**
 * Props for IconButton component
 */
export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  /** Lucide icon name */
  icon: IconName;
}
