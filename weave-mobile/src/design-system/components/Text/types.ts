/**
 * Text Component Types
 */

import { TextProps as RNTextProps } from 'react-native';
import { TypographyVariant } from '../../tokens/typography';
import { TextColor } from '../../tokens/colors';

export interface TextProps extends Omit<RNTextProps, 'style'> {
  /**
   * Typography variant from design system
   * @default 'textBase'
   */
  variant?: TypographyVariant;

  /**
   * Text color from theme
   * Use this for semantic colors (primary, secondary, muted, etc.)
   */
  color?: TextColor;

  /**
   * Custom hex color (overrides color prop)
   * Use sparingly - prefer semantic colors
   */
  customColor?: string;

  /**
   * Text alignment
   */
  align?: 'left' | 'center' | 'right';

  /**
   * Font weight override
   */
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';

  /**
   * Transform text to uppercase
   */
  uppercase?: boolean;

  /**
   * Additional React Native style
   */
  style?: RNTextProps['style'];
}
