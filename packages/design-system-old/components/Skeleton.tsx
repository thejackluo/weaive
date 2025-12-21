/**
 * Weave Design System - Skeleton Loaders
 *
 * Beautiful animated skeleton loaders for async content
 * Shimmer gradient effect for polished loading states
 *
 * Usage:
 * <Skeleton width={200} height={20} />
 * <SkeletonCard />
 * <SkeletonText lines={3} />
 * <SkeletonAvatar size="lg" />
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';

// =============================================================================
// TYPES
// =============================================================================

export interface SkeletonProps {
  /** Width of skeleton */
  width?: number | string;

  /** Height of skeleton */
  height?: number | string;

  /** Border radius */
  borderRadius?: number;

  /** Custom style */
  style?: ViewStyle;

  /** Disable shimmer animation */
  disableShimmer?: boolean;
}

export interface SkeletonTextProps {
  /** Number of lines */
  lines?: number;

  /** Line height */
  lineHeight?: number;

  /** Gap between lines */
  gap?: number;

  /** Last line width percentage (for natural text appearance) */
  lastLineWidth?: number;
}

export interface SkeletonAvatarProps {
  /** Avatar size */
  size?: 'sm' | 'md' | 'lg' | 'xl';

  /** Shape */
  shape?: 'circle' | 'square';
}

export interface SkeletonCardProps {
  /** Card height */
  height?: number;

  /** Show avatar */
  showAvatar?: boolean;

  /** Number of text lines */
  textLines?: number;
}

// =============================================================================
// BASE SKELETON
// =============================================================================

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius,
  style,
  disableShimmer = false,
}: SkeletonProps) {
  const { colors, radius } = useTheme();

  // Shimmer animation
  const shimmerTranslate = useSharedValue(-1);

  React.useEffect(() => {
    if (!disableShimmer) {
      shimmerTranslate.value = withRepeat(
        withTiming(1, {
          duration: 1500,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    }
  }, [disableShimmer, shimmerTranslate]);

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: shimmerTranslate.value * 400,
        },
      ],
    };
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          backgroundColor: colors.dark[900],
          borderRadius: borderRadius ?? radius.md,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {!disableShimmer && (
        <Animated.View style={[StyleSheet.absoluteFill, shimmerStyle]}>
          <LinearGradient
            colors={[
              'transparent',
              colors.dark[800],
              colors.dark[700],
              colors.dark[800],
              'transparent',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
    </View>
  );
}

// =============================================================================
// SKELETON TEXT
// =============================================================================

export function SkeletonText({
  lines = 3,
  lineHeight = 16,
  gap = 8,
  lastLineWidth = 70,
}: SkeletonTextProps) {
  return (
    <View style={{ gap }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={lineHeight}
          width={index === lines - 1 ? `${lastLineWidth}%` : '100%'}
        />
      ))}
    </View>
  );
}

// =============================================================================
// SKELETON AVATAR
// =============================================================================

export function SkeletonAvatar({
  size = 'md',
  shape = 'circle',
}: SkeletonAvatarProps) {
  const dimensions = getAvatarSize(size);
  const borderRadius = shape === 'circle' ? dimensions / 2 : dimensions * 0.2;

  return (
    <Skeleton
      width={dimensions}
      height={dimensions}
      borderRadius={borderRadius}
    />
  );
}

// =============================================================================
// SKELETON CARD
// =============================================================================

export function SkeletonCard({
  height = 200,
  showAvatar = true,
  textLines = 3,
}: SkeletonCardProps) {
  const { spacing, radius } = useTheme();

  return (
    <View
      style={{
        padding: spacing[4],
        gap: spacing[3],
      }}
    >
      {/* Header with avatar and text */}
      {showAvatar && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing[3],
          }}
        >
          <SkeletonAvatar size="md" />
          <View style={{ flex: 1, gap: spacing[2] }}>
            <Skeleton width="60%" height={16} />
            <Skeleton width="40%" height={12} />
          </View>
        </View>
      )}

      {/* Image */}
      <Skeleton
        width="100%"
        height={height}
        borderRadius={radius.lg}
      />

      {/* Text content */}
      <SkeletonText lines={textLines} />
    </View>
  );
}

// =============================================================================
// SKELETON LIST ITEM
// =============================================================================

export interface SkeletonListItemProps {
  /** Show leading icon/avatar */
  showLeading?: boolean;

  /** Show trailing action */
  showTrailing?: boolean;

  /** Number of text lines */
  textLines?: number;
}

export function SkeletonListItem({
  showLeading = true,
  showTrailing = false,
  textLines = 2,
}: SkeletonListItemProps) {
  const { spacing } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
        paddingVertical: spacing[3],
      }}
    >
      {/* Leading */}
      {showLeading && <SkeletonAvatar size="sm" />}

      {/* Content */}
      <View style={{ flex: 1, gap: spacing[2] }}>
        <SkeletonText lines={textLines} lineHeight={14} gap={6} />
      </View>

      {/* Trailing */}
      {showTrailing && <Skeleton width={60} height={32} />}
    </View>
  );
}

// =============================================================================
// SKELETON BIND CARD
// =============================================================================

export function SkeletonBindCard() {
  const { spacing, radius } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing[4],
        gap: spacing[3],
      }}
    >
      {/* Checkbox */}
      <Skeleton width={24} height={24} borderRadius={radius.sm} />

      {/* Content */}
      <View style={{ flex: 1, gap: spacing[2] }}>
        <Skeleton width="80%" height={18} />
        <Skeleton width="40%" height={14} />
      </View>

      {/* Timer button */}
      <Skeleton width={32} height={32} borderRadius={16} />
    </View>
  );
}

// =============================================================================
// SKELETON STAT CARD
// =============================================================================

export function SkeletonStatCard() {
  const { spacing, radius, colors } = useTheme();

  return (
    <View
      style={{
        padding: spacing[5],
        backgroundColor: colors.background.elevated,
        borderRadius: radius.xl,
        gap: spacing[4],
      }}
    >
      {/* Icon */}
      <Skeleton width={48} height={48} borderRadius={radius.lg} />

      {/* Label */}
      <Skeleton width="50%" height={14} />

      {/* Value */}
      <Skeleton width="70%" height={32} />

      {/* Trend */}
      <Skeleton width="40%" height={12} />
    </View>
  );
}

// =============================================================================
// SKELETON PROGRESS CARD
// =============================================================================

export function SkeletonProgressCard() {
  const { spacing } = useTheme();

  return (
    <View
      style={{
        padding: spacing[4],
        gap: spacing[4],
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Skeleton width="60%" height={20} />
        <Skeleton width="15%" height={16} />
      </View>

      {/* Progress bar */}
      <Skeleton width="100%" height={8} />

      {/* Footer stats */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Skeleton width="30%" height={14} />
        <Skeleton width="30%" height={14} />
      </View>
    </View>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function getAvatarSize(size: 'sm' | 'md' | 'lg' | 'xl'): number {
  switch (size) {
    case 'sm':
      return 32;
    case 'lg':
      return 64;
    case 'xl':
      return 96;
    case 'md':
    default:
      return 48;
  }
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  skeleton: {
    position: 'relative',
  },
});

// =============================================================================
// EXPORTS
// =============================================================================

export default Skeleton;
