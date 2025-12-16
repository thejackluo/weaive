/**
 * Weave Design System
 *
 * A dark-first, Opal-inspired design system for React Native
 * Elegant, minimalistic, and personal
 *
 * Usage:
 * import { ThemeProvider, useTheme, Button, Card, colors } from '@/design-system';
 *
 * // Wrap app with ThemeProvider
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 *
 * // Use components and hooks
 * const { colors, spacing } = useTheme();
 * <Button onPress={handlePress}>Continue</Button>
 */

// =============================================================================
// THEME
// =============================================================================

export {
  ThemeProvider,
  useTheme,
  useThemeMode,
  useColors,
  useSpacing,
  useTypography,
  useLayout,
  useShadows,
  useRadius,
  useAnimations,
} from './theme';

export type {
  Theme,
  ThemeMode,
  ThemeColors,
  ThemeContextValue,
} from './theme';

// =============================================================================
// TOKENS
// =============================================================================

export {
  // All tokens
  tokens,

  // Colors
  colors,
  dark,
  accent,
  violet,
  amber,
  rose,
  emerald,
  semantic,
  background,
  text,
  border,
  heatMap,
  weaveGradient,
  gradients,
  light,

  // Typography
  typography,
  fontFamily,
  fontSizes,
  fontWeights,
  lineHeights,
  lineHeightValues,
  letterSpacing,
  display,
  label,
  mono,

  // Spacing
  spacing,
  layout,
  gap,
  inset,

  // Effects
  effects,
  shadows,
  glows,
  glass,
  blur,
  opacity,

  // Borders
  borders,
  radius,
  componentRadius,
  borderWidth,

  // Animations
  animations,
  durations,
  timing,
  easings,
  motion,
  springs,
  presets,
  reducedMotion,
} from './tokens';

export type {
  Colors,
  DarkShade,
  AccentShade,
  Typography,
  Spacing,
  SpacingKey,
  Layout,
  Effects,
  ShadowKey,
  GlowKey,
  GlassKey,
  Radius,
  RadiusKey,
  BorderWidth,
  Animations,
  DurationKey,
  EasingKey,
  SpringKey,
  Tokens,
} from './tokens';

// =============================================================================
// COMPONENTS
// =============================================================================

export {
  // Text
  Text,
  AnimatedText,
  Heading,
  Title,
  Subtitle,
  Body,
  BodySmall,
  Caption,
  Label,
  Link,
  Mono,

  // Buttons
  Button,
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  DestructiveButton,
  AIButton,
  IconButton,

  // Cards
  Card,
  GlassCard,
  ElevatedCard,
  AICard,
  SuccessCard,
  NeedleCard,
  InsightCard,

  // Inputs
  Input,
  TextArea,
  SearchInput,

  // Selection
  Checkbox,
  BindCheckbox,

  // Badges
  Badge,
  CountBadge,
  StatusDot,
  StreakBadge,
  AIBadge,
  ConsistencyBadge,
} from './components';

export type {
  // Text
  TextProps,
  TextVariant,
  TextColor,

  // Buttons
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  IconButtonProps,

  // Cards
  CardProps,
  CardVariant,
  CardPadding,
  NeedleCardProps,
  InsightCardProps,
  InsightType,

  // Inputs
  InputProps,
  InputSize,
  TextAreaProps,
  SearchInputProps,

  // Selection
  CheckboxProps,
  CheckboxSize,
  BindCheckboxProps,

  // Badges
  BadgeProps,
  BadgeVariant,
  BadgeSize,
} from './components';
