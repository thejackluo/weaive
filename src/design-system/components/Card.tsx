/**
 * Weave Design System - Card Component
 *
 * Glass-effect cards with multiple variants
 * Opal-inspired premium feel
 *
 * Usage:
 * <Card>Content</Card>
 * <Card variant="glass" pressable onPress={handlePress}>Interactive</Card>
 */

import React, { useCallback } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../theme';

// =============================================================================
// TYPES
// =============================================================================

export type CardVariant =
  | 'default'
  | 'glass'
  | 'elevated'
  | 'outlined'
  | 'ai'
  | 'success'
  | 'subtle';

export type CardPadding = 'none' | 'compact' | 'default' | 'spacious';

export interface CardProps {
  /** Card variant */
  variant?: CardVariant;

  /** Internal padding */
  padding?: CardPadding;

  /** Make card pressable */
  pressable?: boolean;

  /** Press handler (requires pressable=true) */
  onPress?: () => void;

  /** Long press handler */
  onLongPress?: () => void;

  /** Disabled state (for pressable cards) */
  disabled?: boolean;

  /** Custom style */
  style?: ViewStyle;

  /** Children */
  children: React.ReactNode;

  /** Accessibility label */
  accessibilityLabel?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

export function Card({
  variant = 'default',
  padding = 'default',
  pressable = false,
  onPress,
  onLongPress,
  disabled = false,
  style,
  children,
  accessibilityLabel,
}: CardProps) {
  const { colors, radius, spacing, springs, glass, shadows } = useTheme();

  // Animation
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (!disabled) {
      scale.value = withSpring(0.98, springs.press);
    }
  }, [scale, springs.press, disabled]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springs.press);
  }, [scale, springs.press]);

  // Get variant styles
  const variantStyles = getVariantStyles(variant, colors, glass, shadows);

  // Get padding
  const paddingValue = getPaddingValue(padding, spacing);

  // Combined styles
  const cardStyle: ViewStyle = {
    ...variantStyles,
    borderRadius: radius.xl,
    padding: paddingValue,
  };

  // Render pressable or static
  if (pressable) {
    return (
      <AnimatedPressable
        onPress={disabled ? undefined : onPress}
        onLongPress={disabled ? undefined : onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        style={[cardStyle, disabled && styles.disabled, animatedStyle, style]}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedView style={[cardStyle, animatedStyle, style]}>
      {children}
    </AnimatedView>
  );
}

// =============================================================================
// STYLE HELPERS
// =============================================================================

function getVariantStyles(
  variant: CardVariant,
  colors: any,
  glass: any,
  shadows: any
): ViewStyle {
  switch (variant) {
    case 'glass':
      return {
        backgroundColor: colors.background.glass,
        borderWidth: 1,
        borderColor: colors.border.glass,
      };

    case 'elevated':
      return {
        backgroundColor: colors.background.elevated,
        ...shadows.md,
      };

    case 'outlined':
      return {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border.muted,
      };

    case 'ai':
      return {
        backgroundColor: 'rgba(45, 27, 78, 0.4)',
        borderWidth: 1,
        borderColor: 'rgba(157, 113, 232, 0.2)',
      };

    case 'success':
      return {
        backgroundColor: 'rgba(4, 61, 36, 0.4)',
        borderWidth: 1,
        borderColor: 'rgba(16, 216, 126, 0.2)',
      };

    case 'subtle':
      return {
        backgroundColor: colors.background.subtle,
      };

    case 'default':
    default:
      return {
        backgroundColor: colors.background.secondary,
        borderWidth: 1,
        borderColor: colors.border.subtle,
      };
  }
}

function getPaddingValue(padding: CardPadding, spacing: any): number {
  switch (padding) {
    case 'none':
      return 0;
    case 'compact':
      return spacing[3]; // 12px
    case 'spacious':
      return spacing[6]; // 24px
    case 'default':
    default:
      return spacing[4]; // 16px
  }
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
});

// =============================================================================
// SPECIALIZED CARDS
// =============================================================================

/** Glass effect card (Opal-inspired) */
export function GlassCard(props: Omit<CardProps, 'variant'>) {
  return <Card variant="glass" {...props} />;
}

/** Elevated card with shadow */
export function ElevatedCard(props: Omit<CardProps, 'variant'>) {
  return <Card variant="elevated" {...props} />;
}

/** AI-themed card */
export function AICard(props: Omit<CardProps, 'variant'>) {
  return <Card variant="ai" {...props} />;
}

/** Success-themed card */
export function SuccessCard(props: Omit<CardProps, 'variant'>) {
  return <Card variant="success" {...props} />;
}

// =============================================================================
// NEEDLE CARD (Goal Card)
// =============================================================================

export interface NeedleCardProps {
  /** Goal title */
  title: string;

  /** Consistency percentage */
  consistency: number;

  /** Number of active binds */
  bindsCount: number;

  /** Expanded state */
  expanded?: boolean;

  /** Press handler */
  onPress?: () => void;

  /** Children (expanded content) */
  children?: React.ReactNode;
}

export function NeedleCard({
  title,
  consistency,
  bindsCount,
  expanded = false,
  onPress,
  children,
}: NeedleCardProps) {
  const { colors, spacing, radius } = useTheme();

  return (
    <Card
      variant="glass"
      padding="none"
      pressable
      onPress={onPress}
      style={{ overflow: 'hidden' }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: spacing[4],
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {/* Chevron */}
          <View
            style={{
              marginRight: spacing[3],
              transform: [{ rotate: expanded ? '90deg' : '0deg' }],
            }}
          >
            {/* Replace with actual icon */}
            <View
              style={{
                width: 8,
                height: 8,
                borderRightWidth: 2,
                borderBottomWidth: 2,
                borderColor: colors.text.muted,
                transform: [{ rotate: '45deg' }],
              }}
            />
          </View>

          {/* Title */}
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              {/* Icon placeholder */}
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  backgroundColor: colors.violet[900],
                  marginRight: spacing[2],
                }}
              />
              <View>
                <Animated.Text
                  style={{
                    color: colors.text.primary,
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  {title}
                </Animated.Text>
                <Animated.Text
                  style={{
                    color: colors.text.muted,
                    fontSize: 12,
                  }}
                >
                  {bindsCount} binds today
                </Animated.Text>
              </View>
            </View>
          </View>
        </View>

        {/* Consistency badge */}
        <View
          style={{
            backgroundColor:
              consistency >= 80
                ? colors.semantic.success.subtle
                : consistency >= 50
                ? colors.semantic.warning.subtle
                : colors.semantic.error.subtle,
            paddingHorizontal: spacing[2],
            paddingVertical: spacing[1],
            borderRadius: radius.sm,
          }}
        >
          <Animated.Text
            style={{
              color:
                consistency >= 80
                  ? colors.semantic.success.emphasis
                  : consistency >= 50
                  ? colors.semantic.warning.emphasis
                  : colors.semantic.error.emphasis,
              fontSize: 12,
              fontWeight: '600',
            }}
          >
            {consistency}%
          </Animated.Text>
        </View>
      </View>

      {/* Expanded content */}
      {expanded && children && (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border.subtle,
            padding: spacing[4],
          }}
        >
          {children}
        </View>
      )}
    </Card>
  );
}

// =============================================================================
// INSIGHT CARD (AI Card)
// =============================================================================

export type InsightType = 'winning' | 'consider' | 'tomorrow';

export interface InsightCardProps {
  /** Insight type */
  type: InsightType;

  /** Insight title */
  title: string;

  /** Insight content */
  content: string;

  /** Edit handler */
  onEdit?: () => void;

  /** Dismiss handler */
  onDismiss?: () => void;
}

export function InsightCard({
  type,
  title,
  content,
  onEdit,
  onDismiss,
}: InsightCardProps) {
  const { colors, spacing, radius } = useTheme();

  const typeConfig = {
    winning: {
      icon: '✨',
      bgColor: colors.semantic.ai.subtle,
      borderColor: 'rgba(157, 113, 232, 0.2)',
      accentColor: colors.violet[400],
    },
    consider: {
      icon: '🔍',
      bgColor: colors.semantic.warning.subtle,
      borderColor: 'rgba(245, 166, 35, 0.2)',
      accentColor: colors.amber[400],
    },
    tomorrow: {
      icon: '📋',
      bgColor: colors.semantic.info.subtle,
      borderColor: 'rgba(91, 141, 239, 0.2)',
      accentColor: colors.accent[400],
    },
  }[type];

  return (
    <View
      style={{
        backgroundColor: typeConfig.bgColor,
        borderWidth: 1,
        borderColor: typeConfig.borderColor,
        borderRadius: radius.xl,
        padding: spacing[4],
        borderLeftWidth: 3,
        borderLeftColor: typeConfig.accentColor,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: spacing[2],
        }}
      >
        <Animated.Text style={{ fontSize: 16, marginRight: spacing[2] }}>
          {typeConfig.icon}
        </Animated.Text>
        <Animated.Text
          style={{
            color: colors.text.primary,
            fontSize: 14,
            fontWeight: '600',
            flex: 1,
          }}
        >
          {title}
        </Animated.Text>
      </View>

      {/* Content */}
      <Animated.Text
        style={{
          color: colors.text.secondary,
          fontSize: 14,
          lineHeight: 20,
        }}
      >
        {content}
      </Animated.Text>

      {/* Actions */}
      {(onEdit || onDismiss) && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginTop: spacing[3],
            gap: spacing[2],
          }}
        >
          {onDismiss && (
            <Pressable onPress={onDismiss}>
              <Animated.Text
                style={{
                  color: colors.text.muted,
                  fontSize: 12,
                  fontWeight: '500',
                }}
              >
                Not true
              </Animated.Text>
            </Pressable>
          )}
          {onEdit && (
            <Pressable onPress={onEdit}>
              <Animated.Text
                style={{
                  color: typeConfig.accentColor,
                  fontSize: 12,
                  fontWeight: '500',
                }}
              >
                Edit
              </Animated.Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export default Card;
