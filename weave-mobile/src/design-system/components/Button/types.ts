/**
 * Button Component Types
 */

import { PressableProps } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'ai' | 'success';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  /**
   * Button variant from design system
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Button size
   * @default 'md'
   */
  size?: ButtonSize;

  /**
   * Full width button
   */
  fullWidth?: boolean;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Loading state (shows spinner)
   */
  loading?: boolean;

  /**
   * Icon to show on the left
   */
  leftIcon?: React.ReactNode;

  /**
   * Icon to show on the right
   */
  rightIcon?: React.ReactNode;

  /**
   * Button text content
   */
  children?: React.ReactNode;

  /**
   * NativeWind className
   */
  className?: string;
}
