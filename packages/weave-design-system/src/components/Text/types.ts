/**
 * Text Component Types
 * TypeScript interfaces for Text family components
 */

import { TextProps as RNTextProps } from 'react-native';

/**
 * Typography variant names
 */
export type TextVariant =
  | 'displayLg'
  | 'displayMd'
  | 'displaySm'
  | 'titleLg'
  | 'titleMd'
  | 'titleSm'
  | 'bodyLg'
  | 'bodyMd'
  | 'bodySm'
  | 'caption'
  | 'label';

/**
 * Monospace variant names
 */
export type MonoVariant = 'mono.xs' | 'mono.sm' | 'mono.md' | 'mono.lg';

/**
 * Text weight values
 */
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

/**
 * Text alignment
 */
export type TextAlign = 'left' | 'center' | 'right' | 'justify';

/**
 * Animation types for AnimatedText
 */
export type TextAnimation = 'fadeIn' | 'slideUp' | 'typewriter';

/**
 * Props for base Text component
 */
export interface TextComponentProps extends Omit<RNTextProps, 'style'> {
  /** Typography variant */
  variant?: TextVariant;
  /** Text color (theme token path like "text.primary" or raw color) */
  color?: string;
  /** Font weight */
  weight?: TextWeight;
  /** Text alignment */
  align?: TextAlign;
  /** Maximum number of lines */
  numberOfLines?: number;
  /** Ellipsize mode */
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  /** Children */
  children?: React.ReactNode;
}

/**
 * Props for AnimatedText component
 */
export interface AnimatedTextProps extends TextComponentProps {
  /** Animation type */
  animation?: TextAnimation;
  /** Animation delay in ms */
  delay?: number;
}

/**
 * Props for Heading component
 */
export interface HeadingProps extends Omit<TextComponentProps, 'variant'> {
  /** Heading level (1-6) */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Props for Link component
 */
export interface LinkProps extends Omit<TextComponentProps, 'onPress'> {
  /** Link destination */
  href?: string;
  /** Press handler */
  onPress?: () => void;
  /** Open link externally in browser */
  external?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Props for Mono component
 */
export interface MonoProps extends Omit<TextComponentProps, 'variant'> {
  /** Monospace variant */
  variant?: MonoVariant;
}
