/**
 * Weave Design System - React Native First
 *
 * A comprehensive design system built for React Native with:
 * - NativeWind v5 + Tailwind CSS v4
 * - React 19.1.0
 * - Glassmorphism effects
 * - Dark-first Opal-inspired aesthetics
 *
 * @see docs/dev/design-system-guide.md
 */

// ============================================================================
// Theme System
// ============================================================================
export { ThemeProvider, useTheme, useThemeMode } from './theme/ThemeProvider';
export type { Theme, ThemeMode } from './theme/types';

// ============================================================================
// Design Tokens
// ============================================================================
export { colors } from './tokens/colors';
export { typography } from './tokens/typography';
export { spacing, layout } from './tokens/spacing';
export { radius } from './tokens/radius';
export { shadows, glass } from './tokens/effects';
export { springs, durations, easings } from './tokens/animations';

// ============================================================================
// Hooks
// ============================================================================
export { useColors } from './theme/hooks/useColors';
export { useSpacing } from './theme/hooks/useSpacing';
export { useTypography } from './theme/hooks/useTypography';
export { useShadows } from './theme/hooks/useShadows';
export { useAnimations } from './theme/hooks/useAnimations';

// ============================================================================
// Text Components
// ============================================================================
export { Text } from './components/Text/Text';
export { Heading } from './components/Text/Heading';
export { Title } from './components/Text/Title';
export { Body } from './components/Text/Body';
export { Caption } from './components/Text/Caption';
export { Label } from './components/Text/Label';
export { Mono } from './components/Text/Mono';
export type { TextProps } from './components/Text/types';

// ============================================================================
// Button Components
// ============================================================================
// TODO: Implement Button components
// export { Button } from './components/Button/Button';
// export { PrimaryButton } from './components/Button/PrimaryButton';
// export { SecondaryButton } from './components/Button/SecondaryButton';
// export { GhostButton } from './components/Button/GhostButton';
// export { DestructiveButton } from './components/Button/DestructiveButton';
// export { AIButton } from './components/Button/AIButton';
// export { SuccessButton } from './components/Button/SuccessButton';
// export { IconButton } from './components/Button/IconButton';
// export type { ButtonProps, ButtonVariant, ButtonSize } from './components/Button/types';

// ============================================================================
// Card Components
// ============================================================================
// TODO: Implement Card components
// export { Card } from './components/Card/Card';
// export { GlassCard } from './components/Card/GlassCard';
// export { ElevatedCard } from './components/Card/ElevatedCard';
// export { AICard } from './components/Card/AICard';
// export { SuccessCard } from './components/Card/SuccessCard';
// export { NeedleCard } from './components/Card/NeedleCard';
// export { InsightCard } from './components/Card/InsightCard';
// export type { CardProps, CardVariant, CardPadding } from './components/Card/types';

// ============================================================================
// Input Components
// ============================================================================
// TODO: Implement Input components
// export { Input } from './components/Input/Input';
// export { TextArea } from './components/Input/TextArea';
// export { SearchInput } from './components/Input/SearchInput';
// export type { InputProps, TextAreaProps, SearchInputProps } from './components/Input/types';

// ============================================================================
// Checkbox Components
// ============================================================================
// TODO: Implement Checkbox components
// export { Checkbox } from './components/Checkbox/Checkbox';
// export { BindCheckbox } from './components/Checkbox/BindCheckbox';
// export type { CheckboxProps, BindCheckboxProps } from './components/Checkbox/types';

// ============================================================================
// Badge Components
// ============================================================================
// TODO: Implement Badge components
// export { Badge } from './components/Badge/Badge';
// export { ConsistencyBadge } from './components/Badge/ConsistencyBadge';
// export { StreakBadge } from './components/Badge/StreakBadge';
// export { AIBadge } from './components/Badge/AIBadge';
// export { StatusDot } from './components/Badge/StatusDot';
// export type { BadgeProps, BadgeVariant, BadgeSize } from './components/Badge/types';

// ============================================================================
// Utility Components
// ============================================================================
export { GlassView } from './components/Glass/GlassView';
// TODO: Implement AnimatedPressable
// export { AnimatedPressable } from './components/Animated/AnimatedPressable';

// ============================================================================
// Constants
// ============================================================================
export * from './constants';
