/**
 * Weave Design System - Avatar Component
 *
 * Beautiful avatar component with gradient fallbacks
 * Supports images, initials, icons, and status indicators
 *
 * Usage:
 * <Avatar src="https://..." size="lg" />
 * <Avatar initials="JD" size="md" gradientColors={['#3b82f6', '#8b5cf6']} />
 * <Avatar icon={<UserIcon />} status="online" />
 */

import React from 'react';
import { View, Image, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';
import { Text } from './Text';

// =============================================================================
// TYPES
// =============================================================================

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarShape = 'circle' | 'square';
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

export interface AvatarProps {
  /** Image source URL */
  src?: string;

  /** Initials to display (if no image) */
  initials?: string;

  /** Icon component (if no image or initials) */
  icon?: React.ReactNode;

  /** Avatar size */
  size?: AvatarSize;

  /** Avatar shape */
  shape?: AvatarShape;

  /** Status indicator */
  status?: AvatarStatus;

  /** Gradient colors for fallback background */
  gradientColors?: [string, string];

  /** Custom style */
  style?: ViewStyle;

  /** Image style */
  imageStyle?: ImageStyle;

  /** Alt text for accessibility */
  alt?: string;

  /** Press handler */
  onPress?: () => void;
}

// =============================================================================
// AVATAR
// =============================================================================

export function Avatar({
  src,
  initials,
  icon,
  size = 'md',
  shape = 'circle',
  status,
  gradientColors,
  style,
  imageStyle,
  alt,
  onPress,
}: AvatarProps) {
  const { colors, radius } = useTheme();

  const dimensions = getSizeDimensions(size);
  const borderRadius = shape === 'circle' ? dimensions / 2 : dimensions * 0.2;

  // Default gradient based on initials or random
  const defaultGradient = gradientColors || getDefaultGradient(initials || '', colors);

  return (
    <View
      style={[
        styles.container,
        {
          width: dimensions,
          height: dimensions,
        },
        style,
      ]}
    >
      {/* Avatar content */}
      <View
        style={{
          width: dimensions,
          height: dimensions,
          borderRadius,
          overflow: 'hidden',
        }}
        accessibilityLabel={alt || `Avatar ${initials || ''}`}
        accessibilityRole="image"
      >
        {src ? (
          // Image avatar
          <Image
            source={{ uri: src }}
            style={[
              {
                width: dimensions,
                height: dimensions,
              },
              imageStyle,
            ]}
            accessibilityLabel={alt}
          />
        ) : (
          // Gradient fallback
          <LinearGradient
            colors={defaultGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: dimensions,
              height: dimensions,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {initials ? (
              <Text
                variant={getTextVariant(size)}
                customColor={colors.dark[50]}
                weight="semibold"
              >
                {initials.slice(0, 2).toUpperCase()}
              </Text>
            ) : icon ? (
              icon
            ) : (
              // Default user icon
              <Text variant={getTextVariant(size)} customColor={colors.dark[50]}>
                👤
              </Text>
            )}
          </LinearGradient>
        )}
      </View>

      {/* Status indicator */}
      {status && (
        <View
          style={[
            styles.statusIndicator,
            {
              width: getStatusSize(size),
              height: getStatusSize(size),
              backgroundColor: getStatusColor(status, colors),
              borderRadius: getStatusSize(size) / 2,
              borderWidth: 2,
              borderColor: colors.background.primary,
              bottom: 0,
              right: 0,
            },
          ]}
        />
      )}
    </View>
  );
}

// =============================================================================
// AVATAR GROUP
// =============================================================================

export interface AvatarGroupProps {
  /** Array of avatar props */
  avatars: AvatarProps[];

  /** Maximum avatars to show */
  max?: number;

  /** Avatar size */
  size?: AvatarSize;

  /** Overlap amount in pixels */
  overlap?: number;

  /** Show count badge for remaining avatars */
  showCount?: boolean;

  /** Custom style */
  style?: ViewStyle;
}

export function AvatarGroup({
  avatars,
  max = 5,
  size = 'md',
  overlap = 8,
  showCount = true,
  style,
}: AvatarGroupProps) {
  const { colors, radius, spacing } = useTheme();

  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = Math.max(0, avatars.length - max);
  const dimensions = getSizeDimensions(size);

  return (
    <View style={[styles.groupContainer, style]}>
      {visibleAvatars.map((avatarProps, index) => (
        <View
          key={index}
          style={{
            marginLeft: index > 0 ? -overlap : 0,
            zIndex: visibleAvatars.length - index,
          }}
        >
          <Avatar {...avatarProps} size={size} />
        </View>
      ))}

      {/* Remaining count badge */}
      {showCount && remainingCount > 0 && (
        <LinearGradient
          colors={[colors.dark[800], colors.dark[900]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: dimensions,
            height: dimensions,
            borderRadius: dimensions / 2,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: -overlap,
            borderWidth: 2,
            borderColor: colors.background.primary,
          }}
        >
          <Text
            variant={getTextVariant(size)}
            customColor={colors.dark[300]}
            weight="semibold"
          >
            +{remainingCount}
          </Text>
        </LinearGradient>
      )}
    </View>
  );
}

// =============================================================================
// AVATAR WITH NAME
// =============================================================================

export interface AvatarWithNameProps extends AvatarProps {
  /** Name to display */
  name: string;

  /** Secondary text (username, role, etc.) */
  subtitle?: string;

  /** Layout direction */
  direction?: 'horizontal' | 'vertical';
}

export function AvatarWithName({
  name,
  subtitle,
  direction = 'horizontal',
  ...avatarProps
}: AvatarWithNameProps) {
  const { spacing } = useTheme();

  return (
    <View
      style={{
        flexDirection: direction === 'horizontal' ? 'row' : 'column',
        alignItems: direction === 'horizontal' ? 'center' : 'center',
        gap: spacing[2],
      }}
    >
      <Avatar {...avatarProps} />
      <View style={{ alignItems: direction === 'horizontal' ? 'flex-start' : 'center' }}>
        <Text variant="labelBase" color="primary" weight="medium">
          {name}
        </Text>
        {subtitle && (
          <Text variant="textSm" color="muted">
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function getSizeDimensions(size: AvatarSize): number {
  switch (size) {
    case 'xs':
      return 24;
    case 'sm':
      return 32;
    case 'lg':
      return 64;
    case 'xl':
      return 80;
    case '2xl':
      return 128;
    case 'md':
    default:
      return 48;
  }
}

function getTextVariant(size: AvatarSize): any {
  switch (size) {
    case 'xs':
      return 'labelXs';
    case 'sm':
      return 'labelSm';
    case 'lg':
      return 'textLg';
    case 'xl':
      return 'displaySm';
    case '2xl':
      return 'displayMd';
    case 'md':
    default:
      return 'labelBase';
  }
}

function getStatusSize(size: AvatarSize): number {
  switch (size) {
    case 'xs':
      return 6;
    case 'sm':
      return 8;
    case 'lg':
      return 14;
    case 'xl':
      return 16;
    case '2xl':
      return 20;
    case 'md':
    default:
      return 12;
  }
}

function getStatusColor(status: AvatarStatus, colors: any): string {
  switch (status) {
    case 'online':
      return colors.semantic.success.emphasis;
    case 'offline':
      return colors.dark[600];
    case 'away':
      return colors.semantic.warning.emphasis;
    case 'busy':
      return colors.semantic.error.emphasis;
  }
}

function getDefaultGradient(initials: string, colors: any): [string, string] {
  // Generate gradient based on initials hash for consistency
  const hash = initials
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const gradients: Array<[string, string]> = [
    [colors.accent[600], colors.violet[600]],
    [colors.violet[600], colors.purple[600]],
    [colors.purple[600], colors.rose[600]],
    [colors.rose[600], colors.accent[600]],
    [colors.accent[500], colors.cyan[500]],
    [colors.cyan[500], colors.teal[500]],
    [colors.teal[500], colors.emerald[500]],
    [colors.amber[500], colors.orange[500]],
  ];

  return gradients[hash % gradients.length];
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  statusIndicator: {
    position: 'absolute',
  },
  groupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

// =============================================================================
// EXPORTS
// =============================================================================

export default Avatar;
