/**
 * Weave Design System - Badge Component
 *
 * Small labels for status, counts, and notifications
 *
 * Usage:
 * <Badge>New</Badge>
 * <Badge variant="success">Complete</Badge>
 * <Badge variant="ai" size="sm">AI</Badge>
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

// =============================================================================
// TYPES
// =============================================================================

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'ai'
  | 'outline';

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  /** Badge variant */
  variant?: BadgeVariant;

  /** Badge size */
  size?: BadgeSize;

  /** Dot indicator only (no text) */
  dot?: boolean;

  /** Custom style */
  style?: ViewStyle;

  /** Badge content */
  children?: React.ReactNode;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  style,
  children,
}: BadgeProps) {
  const { colors, radius, spacing } = useTheme();

  // Get variant styles
  const variantStyles = getVariantStyles(variant, colors);

  // Get size styles
  const sizeStyles = getSizeStyles(size, spacing, dot);

  // Dot only
  if (dot) {
    return (
      <View
        style={[
          styles.dot,
          {
            backgroundColor: variantStyles.backgroundColor,
            width: sizeStyles.dotSize,
            height: sizeStyles.dotSize,
            borderRadius: radius.full,
          },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderRadius: radius.sm,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
          minHeight: sizeStyles.minHeight,
        },
        style,
      ]}
    >
      <Text
        variant={sizeStyles.textVariant}
        customColor={variantStyles.textColor}
        weight="medium"
      >
        {children}
      </Text>
    </View>
  );
}

// =============================================================================
// STYLE HELPERS
// =============================================================================

interface VariantStyles {
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
}

function getVariantStyles(variant: BadgeVariant, colors: any): VariantStyles {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: colors.accent[900],
        textColor: colors.accent[400],
      };

    case 'secondary':
      return {
        backgroundColor: colors.dark[800],
        textColor: colors.text.secondary,
      };

    case 'success':
      return {
        backgroundColor: colors.semantic.success.subtle,
        textColor: colors.semantic.success.emphasis,
      };

    case 'warning':
      return {
        backgroundColor: colors.semantic.warning.subtle,
        textColor: colors.semantic.warning.emphasis,
      };

    case 'error':
      return {
        backgroundColor: colors.semantic.error.subtle,
        textColor: colors.semantic.error.emphasis,
      };

    case 'ai':
      return {
        backgroundColor: colors.semantic.ai.subtle,
        textColor: colors.semantic.ai.emphasis,
      };

    case 'outline':
      return {
        backgroundColor: 'transparent',
        textColor: colors.text.secondary,
        borderColor: colors.border.muted,
      };

    case 'default':
    default:
      return {
        backgroundColor: colors.dark[800],
        textColor: colors.text.tertiary,
      };
  }
}

interface SizeStyles {
  paddingHorizontal: number;
  paddingVertical: number;
  minHeight: number;
  dotSize: number;
  textVariant: 'labelXs' | 'labelSm' | 'labelBase';
}

function getSizeStyles(
  size: BadgeSize,
  spacing: any,
  dot: boolean
): SizeStyles {
  switch (size) {
    case 'sm':
      return {
        paddingHorizontal: spacing[1.5],
        paddingVertical: spacing[0.5],
        minHeight: 16,
        dotSize: 6,
        textVariant: 'labelXs',
      };

    case 'lg':
      return {
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[1],
        minHeight: 24,
        dotSize: 10,
        textVariant: 'labelBase',
      };

    case 'md':
    default:
      return {
        paddingHorizontal: spacing[2],
        paddingVertical: spacing[0.5],
        minHeight: 20,
        dotSize: 8,
        textVariant: 'labelSm',
      };
  }
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  dot: {},
});

// =============================================================================
// SPECIALIZED BADGES
// =============================================================================

/** Notification count badge */
export function CountBadge({
  count,
  max = 99,
  ...props
}: Omit<BadgeProps, 'children'> & { count: number; max?: number }) {
  const displayCount = count > max ? `${max}+` : count.toString();

  if (count <= 0) return null;

  return (
    <Badge variant="error" size="sm" {...props}>
      {displayCount}
    </Badge>
  );
}

/** Status dot */
export function StatusDot({
  status,
  size = 'md',
  style,
}: {
  status: 'success' | 'warning' | 'error' | 'default';
  size?: BadgeSize;
  style?: ViewStyle;
}) {
  const variantMap: Record<string, BadgeVariant> = {
    success: 'success',
    warning: 'warning',
    error: 'error',
    default: 'default',
  };

  return <Badge variant={variantMap[status]} size={size} dot style={style} />;
}

/** Streak badge with fire icon */
export function StreakBadge({
  count,
  style,
}: {
  count: number;
  style?: ViewStyle;
}) {
  const { colors, spacing } = useTheme();

  if (count <= 0) return null;

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.semantic.warning.subtle,
          paddingHorizontal: spacing[2],
          paddingVertical: spacing[1],
          borderRadius: 6,
        },
        style,
      ]}
    >
      <Text variant="labelSm" customColor={colors.amber[400]}>
        🔥 {count}
      </Text>
    </View>
  );
}

/** AI badge */
export function AIBadge({ style }: { style?: ViewStyle }) {
  return (
    <Badge variant="ai" size="sm" style={style}>
      AI
    </Badge>
  );
}

/** Consistency badge */
export function ConsistencyBadge({
  percentage,
  style,
}: {
  percentage: number;
  style?: ViewStyle;
}) {
  let variant: BadgeVariant = 'error';
  if (percentage >= 80) variant = 'success';
  else if (percentage >= 50) variant = 'warning';

  return (
    <Badge variant={variant} style={style}>
      {percentage}%
    </Badge>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export default Badge;
