import { ViewProps } from 'react-native';

export type CardVariant =
  | 'default'
  | 'glass'
  | 'elevated'
  | 'outlined'
  | 'ai'
  | 'success'
  | 'subtle';

export type CardPadding = 'none' | 'compact' | 'default' | 'spacious';

export interface CardProps extends ViewProps {
  /**
   * Card variant from design system
   * @default 'default'
   */
  variant?: CardVariant;

  /**
   * Card padding
   * @default 'default'
   */
  padding?: CardPadding;

  /**
   * Whether the card is pressable
   */
  pressable?: boolean;

  /**
   * Callback when card is pressed (only works if pressable is true)
   */
  onPress?: () => void;

  /**
   * Card content
   */
  children?: React.ReactNode;

  /**
   * NativeWind className
   */
  className?: string;
}
