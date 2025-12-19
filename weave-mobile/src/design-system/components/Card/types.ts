import { ViewProps, StyleProp, ViewStyle } from 'react-native';

export type CardVariant =
  | 'default'
  | 'glass'
  | 'elevated'
  | 'outlined'
  | 'ai'
  | 'success'
  | 'subtle';

export type CardPadding = 'none' | 'sm' | 'compact' | 'default' | 'spacious';

export interface CardProps extends Omit<ViewProps, 'style'> {
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

  /**
   * Inline style prop (supports arrays and objects)
   */
  style?: StyleProp<ViewStyle>;
}
