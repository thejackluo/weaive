/**
 * Weave Design System - Component Exports
 *
 * All UI components with consistent styling
 *
 * Usage:
 * import { Button, Card, Text, Input } from '@/design-system/components';
 */

// Text components
export {
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
} from './Text';
export type { TextProps, TextVariant, TextColor } from './Text';

// Button components
export {
  Button,
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  DestructiveButton,
  AIButton,
  IconButton,
} from './Button';
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  IconButtonProps,
} from './Button';

// Card components
export {
  Card,
  GlassCard,
  ElevatedCard,
  AICard,
  SuccessCard,
  NeedleCard,
  InsightCard,
} from './Card';
export type {
  CardProps,
  CardVariant,
  CardPadding,
  NeedleCardProps,
  InsightCardProps,
  InsightType,
} from './Card';

// Input components
export {
  Input,
  TextArea,
  SearchInput,
} from './Input';
export type {
  InputProps,
  InputSize,
  TextAreaProps,
  SearchInputProps,
} from './Input';

// Checkbox components
export {
  Checkbox,
  BindCheckbox,
} from './Checkbox';
export type {
  CheckboxProps,
  CheckboxSize,
  BindCheckboxProps,
} from './Checkbox';

// Badge components
export {
  Badge,
  CountBadge,
  StatusDot,
  StreakBadge,
  AIBadge,
  ConsistencyBadge,
} from './Badge';
export type {
  BadgeProps,
  BadgeVariant,
  BadgeSize,
} from './Badge';
