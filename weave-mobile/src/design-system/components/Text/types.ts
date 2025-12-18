/**
 * Text Component Types - NativeWind v5
 */

import { TextProps as RNTextProps } from 'react-native';

export type TypographyVariant =
  | 'display2xl'
  | 'displayXl'
  | 'displayLg'
  | 'displayMd'
  | 'textLg'
  | 'textBase'
  | 'textSm'
  | 'textXs'
  | 'labelBase'
  | 'monoBase';

export type TextColor =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'disabled'
  | 'ai'
  | 'success'
  | 'error'
  | 'warning';

export interface TextProps extends Omit<RNTextProps, 'style'> {
  /**
   * Typography variant from design system
   * @default 'textBase'
   */
  variant?: TypographyVariant;

  /**
   * Text color from theme
   * Use this for semantic colors (primary, secondary, muted, etc.)
   * For custom colors, use className prop (e.g., className="text-rose-500")
   * @default 'primary'
   */
  color?: TextColor;

  /**
   * Text alignment
   * @default 'left'
   */
  align?: 'left' | 'center' | 'right';

  /**
   * Font weight override
   */
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold';

  /**
   * Transform text to uppercase
   */
  uppercase?: boolean;

  /**
   * NativeWind className for additional styling
   * Merged with variant styles
   * @example className="text-rose-500 font-bold"
   */
  className?: string;
}
