/**
 * Weave Design System - Stat Card Components
 *
 * Beautiful stat cards with gradient effects
 * Perfect for dashboards and metrics display
 *
 * Usage:
 * <StatCard
 *   label="Active Goals"
 *   value="3"
 *   icon="🎯"
 *   trend={{ value: 12, direction: 'up' }}
 *   gradientColors={['#3b82f6', '#8b5cf6']}
 * />
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';
import { Text } from './Text';

// =============================================================================
// TYPES
// =============================================================================

export interface TrendIndicator {
  /** Trend value (percentage or absolute) */
  value: number;

  /** Trend direction */
  direction: 'up' | 'down' | 'neutral';

  /** Label for trend */
  label?: string;
}

export interface StatCardProps {
  /** Stat label */
  label: string;

  /** Stat value */
  value: string | number;

  /** Icon or emoji */
  icon?: string | React.ReactNode;

  /** Trend indicator */
  trend?: TrendIndicator;

  /** Gradient colors */
  gradientColors?: [string, string];

  /** Size */
  size?: 'sm' | 'md' | 'lg';

  /** Custom style */
  style?: ViewStyle;

  /** Press handler */
  onPress?: () => void;

  /** Loading state */
  loading?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// =============================================================================
// STAT CARD
// =============================================================================

export function StatCard({
  label,
  value,
  icon,
  trend,
  gradientColors,
  size = 'md',
  style,
  onPress,
  loading = false,
}: StatCardProps) {
  const { colors, spacing, radius, shadows, springs } = useTheme();

  const scale = useSharedValue(1);

  const dimensions = getSizeDimensions(size);
  const defaultGradient: [string, string] = [colors.accent[900], colors.violet[900]];
  const gradient = gradientColors || defaultGradient;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.97, springs.press);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springs.press);
  };

  const Container = onPress ? AnimatedPressable : View;

  return (
    <Container
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, style]}
    >
      <View
        style={{
          backgroundColor: colors.background.elevated,
          borderRadius: radius.xl,
          padding: dimensions.padding,
          ...shadows.lg,
          borderWidth: 1,
          borderColor: colors.border.subtle,
        }}
      >
        {/* Gradient accent */}
        <LinearGradient
          colors={[...gradient, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
            opacity: 0.1,
          }}
        />

        {/* Content */}
        <View style={{ gap: spacing[3] }}>
          {/* Icon */}
          {icon && (
            <View
              style={{
                width: dimensions.iconSize,
                height: dimensions.iconSize,
              }}
            >
              <LinearGradient
                colors={gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: dimensions.iconSize,
                  height: dimensions.iconSize,
                  borderRadius: radius.lg,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {typeof icon === 'string' ? (
                  <Text variant={size === 'lg' ? 'displaySm' : 'textLg'}>{icon}</Text>
                ) : (
                  icon
                )}
              </LinearGradient>
            </View>
          )}

          {/* Label */}
          <Text variant={size === 'lg' ? 'textBase' : 'textSm'} color="muted">
            {label}
          </Text>

          {/* Value */}
          <Text
            variant={
              size === 'lg' ? 'display2Xl' : size === 'md' ? 'displayXl' : 'displayLg'
            }
            color="primary"
            weight="bold"
          >
            {loading ? '—' : value}
          </Text>

          {/* Trend */}
          {trend && !loading && (
            <View style={styles.trendContainer}>
              <View
                style={[
                  styles.trendBadge,
                  {
                    backgroundColor: getTrendColor(trend.direction, colors, true),
                    paddingHorizontal: spacing[2],
                    paddingVertical: spacing[1],
                    borderRadius: radius.full,
                  },
                ]}
              >
                <Text
                  variant="labelXs"
                  customColor={getTrendColor(trend.direction, colors, false)}
                  weight="semibold"
                >
                  {getTrendIcon(trend.direction)} {Math.abs(trend.value)}%
                </Text>
              </View>
              {trend.label && (
                <Text variant="textXs" color="muted">
                  {trend.label}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </Container>
  );
}

// =============================================================================
// STAT CARD GRID
// =============================================================================

export interface StatCardGridProps {
  /** Array of stat card props */
  stats: StatCardProps[];

  /** Number of columns */
  columns?: 2 | 3 | 4;

  /** Gap between cards */
  gap?: number;

  /** Custom style */
  style?: ViewStyle;
}

export function StatCardGrid({
  stats,
  columns = 2,
  gap,
  style,
}: StatCardGridProps) {
  const { spacing } = useTheme();
  const cardGap = gap ?? spacing[3];

  return (
    <View
      style={[
        styles.gridContainer,
        {
          gap: cardGap,
        },
        style,
      ]}
    >
      {stats.map((stat, index) => (
        <View
          key={index}
          style={{
            flex: 1,
            minWidth: `${100 / columns - 2}%`,
            maxWidth: `${100 / columns}%`,
          }}
        >
          <StatCard {...stat} />
        </View>
      ))}
    </View>
  );
}

// =============================================================================
// MINI STAT CARD
// =============================================================================

export interface MiniStatCardProps {
  /** Stat label */
  label: string;

  /** Stat value */
  value: string | number;

  /** Trend indicator */
  trend?: TrendIndicator;

  /** Custom style */
  style?: ViewStyle;
}

export function MiniStatCard({ label, value, trend, style }: MiniStatCardProps) {
  const { colors, spacing, radius } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: colors.background.elevated,
          borderRadius: radius.lg,
          padding: spacing[3],
          borderWidth: 1,
          borderColor: colors.border.subtle,
        },
        style,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Label and value */}
        <View style={{ gap: spacing[1] }}>
          <Text variant="textSm" color="muted">
            {label}
          </Text>
          <Text variant="displaySm" color="primary" weight="bold">
            {value}
          </Text>
        </View>

        {/* Trend */}
        {trend && (
          <View
            style={[
              styles.trendBadge,
              {
                backgroundColor: getTrendColor(trend.direction, colors, true),
                paddingHorizontal: spacing[2],
                paddingVertical: spacing[1],
                borderRadius: radius.full,
              },
            ]}
          >
            <Text
              variant="labelXs"
              customColor={getTrendColor(trend.direction, colors, false)}
              weight="semibold"
            >
              {getTrendIcon(trend.direction)} {Math.abs(trend.value)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// =============================================================================
// PROGRESS STAT CARD
// =============================================================================

export interface ProgressStatCardProps {
  /** Stat label */
  label: string;

  /** Current value */
  value: number;

  /** Maximum value */
  max: number;

  /** Icon */
  icon?: string | React.ReactNode;

  /** Gradient colors */
  gradientColors?: [string, string];

  /** Custom style */
  style?: ViewStyle;
}

export function ProgressStatCard({
  label,
  value,
  max,
  icon,
  gradientColors,
  style,
}: ProgressStatCardProps) {
  const { colors, spacing, radius, shadows } = useTheme();

  const percentage = Math.min(100, (value / max) * 100);
  const defaultGradient: [string, string] = [colors.accent[600], colors.violet[600]];
  const gradient = gradientColors || defaultGradient;

  return (
    <View
      style={[
        {
          backgroundColor: colors.background.elevated,
          borderRadius: radius.xl,
          padding: spacing[4],
          ...shadows.lg,
          borderWidth: 1,
          borderColor: colors.border.subtle,
        },
        style,
      ]}
    >
      <View style={{ gap: spacing[4] }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
            {icon && (
              <View
                style={{
                  width: 32,
                  height: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {typeof icon === 'string' ? <Text variant="textLg">{icon}</Text> : icon}
              </View>
            )}
            <Text variant="textBase" color="primary" weight="medium">
              {label}
            </Text>
          </View>
          <Text variant="displaySm" color="primary" weight="bold">
            {percentage.toFixed(0)}%
          </Text>
        </View>

        {/* Progress bar with gradient */}
        <View
          style={{
            height: 8,
            backgroundColor: colors.dark[900],
            borderRadius: radius.full,
            overflow: 'hidden',
          }}
        >
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              width: `${percentage}%`,
              height: '100%',
            }}
          />
        </View>

        {/* Footer stats */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Text variant="textSm" color="muted">
            {value} / {max}
          </Text>
          <Text variant="textSm" color="muted">
            {max - value} remaining
          </Text>
        </View>
      </View>
    </View>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

interface SizeDimensions {
  padding: number;
  iconSize: number;
}

function getSizeDimensions(size: 'sm' | 'md' | 'lg'): SizeDimensions {
  switch (size) {
    case 'sm':
      return {
        padding: 12,
        iconSize: 32,
      };
    case 'lg':
      return {
        padding: 24,
        iconSize: 56,
      };
    case 'md':
    default:
      return {
        padding: 16,
        iconSize: 48,
      };
  }
}

function getTrendColor(
  direction: 'up' | 'down' | 'neutral',
  colors: any,
  background: boolean
): string {
  if (background) {
    switch (direction) {
      case 'up':
        return colors.semantic.success.subtle;
      case 'down':
        return colors.semantic.error.subtle;
      case 'neutral':
        return colors.dark[900];
    }
  } else {
    switch (direction) {
      case 'up':
        return colors.semantic.success.emphasis;
      case 'down':
        return colors.semantic.error.emphasis;
      case 'neutral':
        return colors.dark[400];
    }
  }
}

function getTrendIcon(direction: 'up' | 'down' | 'neutral'): string {
  switch (direction) {
    case 'up':
      return '↑';
    case 'down':
      return '↓';
    case 'neutral':
      return '→';
  }
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

// =============================================================================
// EXPORTS
// =============================================================================

export default StatCard;
