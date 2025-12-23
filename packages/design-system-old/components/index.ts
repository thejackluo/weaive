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
  // AnimatedText removed - createAnimatedComponent doesn't work with barrel exports
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

// Specialized Cards
export { BindCard } from './BindCard';
export type { BindCardProps } from './BindCard';
export { CaptureCard } from './CaptureCard';
export type { CaptureCardProps, CaptureType } from './CaptureCard';

// Progress components
export { ProgressBar, CircularProgress } from './Progress';
export type { ProgressBarProps, CircularProgressProps } from './Progress';

// Heatmap component
export { ConsistencyHeatmap } from './ConsistencyHeatmap';
export type { ConsistencyHeatmapProps, DayData } from './ConsistencyHeatmap';

// Navigation components
export {
  BottomTabBar,
  HeaderBar,
  BackButton,
} from './Navigation';
export type {
  Tab,
  BottomTabBarProps,
  HeaderBarProps,
  BackButtonProps,
} from './Navigation';

// Overlay components
export { Modal, BottomSheet, Toast } from './Overlays';
export type {
  ModalProps,
  BottomSheetProps,
  ToastProps,
  ToastConfig,
  ToastType,
} from './Overlays';

// Timer component
export { Timer } from './Timer';
export type { TimerProps } from './Timer';

// Skeleton loaders
export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonListItem,
  SkeletonBindCard,
  SkeletonStatCard,
  SkeletonProgressCard,
} from './Skeleton';
export type {
  SkeletonProps,
  SkeletonTextProps,
  SkeletonAvatarProps,
  SkeletonCardProps,
  SkeletonListItemProps,
} from './Skeleton';

// Empty state components
export {
  EmptyState,
  EmptyGoals,
  EmptyBinds,
  EmptyCaptures,
  EmptyJournal,
  EmptySearch,
  EmptyNotifications,
  ErrorState,
  NoConnectionState,
  ComingSoonState,
} from './EmptyState';
export type {
  EmptyStateProps,
  EmptyStateAction,
  EmptyGoalsProps,
  EmptyBindsProps,
  EmptyCapturesProps,
  EmptyJournalProps,
  EmptySearchProps,
  ErrorStateProps,
  NoConnectionStateProps,
  ComingSoonStateProps,
} from './EmptyState';

// Avatar components
export { Avatar, AvatarGroup, AvatarWithName } from './Avatar';
export type {
  AvatarProps,
  AvatarSize,
  AvatarShape,
  AvatarStatus,
  AvatarGroupProps,
  AvatarWithNameProps,
} from './Avatar';

// Stat card components
export {
  StatCard,
  StatCardGrid,
  MiniStatCard,
  ProgressStatCard,
} from './StatCard';
export type {
  StatCardProps,
  TrendIndicator,
  StatCardGridProps,
  MiniStatCardProps,
  ProgressStatCardProps,
} from './StatCard';
