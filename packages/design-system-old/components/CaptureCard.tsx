/**
 * Weave Design System - CaptureCard Component
 *
 * Displays captured proof (photo, note, timer, audio)
 * Shows preview, timestamp, and delete action
 *
 * Usage:
 * <CaptureCard
 *   type="photo"
 *   imageUri="file://..."
 *   timestamp="2 hours ago"
 *   onDelete={handleDelete}
 *   onPress={handlePress}
 * />
 */

import React, { useCallback } from 'react';
import {
  View,
  Image,
  Pressable,
  StyleSheet,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../theme';
import { Text } from './Text';

// =============================================================================
// TYPES
// =============================================================================

export type CaptureType = 'photo' | 'note' | 'timer' | 'audio';

export interface CaptureCardProps {
  /** Type of capture */
  type: CaptureType;

  /** Timestamp (relative or absolute) */
  timestamp: string;

  /** Image URI (for photo type) */
  imageUri?: string;

  /** Note text (for note type) */
  noteText?: string;

  /** Timer duration (for timer type) */
  timerDuration?: string;

  /** Audio duration (for audio type) */
  audioDuration?: string;

  /** Delete handler */
  onDelete?: () => void;

  /** Press handler (view full content) */
  onPress?: () => void;

  /** Custom style */
  style?: ViewStyle;
}

// =============================================================================
// COMPONENT
// =============================================================================

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CaptureCard({
  type,
  timestamp,
  imageUri,
  noteText,
  timerDuration,
  audioDuration,
  onDelete,
  onPress,
  style,
}: CaptureCardProps) {
  const { colors, radius, spacing, springs, shadows } = useTheme();

  // Animation values
  const scale = useSharedValue(1);
  const deleteOpacity = useSharedValue(1);

  // Animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: deleteOpacity.value,
  }));

  // Handlers
  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, springs.press);
  }, [scale, springs.press]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springs.press);
  }, [scale, springs.press]);

  const handleDelete = useCallback(() => {
    // Fade out animation before delete
    deleteOpacity.value = withTiming(0, { duration: 200 }, (finished) => {
      if (finished && onDelete) {
        onDelete();
      }
    });
  }, [deleteOpacity, onDelete]);

  // Get type config
  const typeConfig = getTypeConfig(type, colors);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={onPress ? handlePressIn : undefined}
      onPressOut={onPress ? handlePressOut : undefined}
      disabled={!onPress}
      style={[
        styles.container,
        {
          backgroundColor: colors.background.secondary,
          borderWidth: 1,
          borderColor: colors.border.subtle,
          borderRadius: radius.xl,
          ...shadows.sm,
        },
        cardAnimatedStyle,
        style,
      ]}
    >
      {/* Header */}
      <View style={[styles.header, { padding: spacing[3] }]}>
        {/* Type indicator */}
        <View style={styles.typeRow}>
          <View
            style={[
              styles.typeIcon,
              {
                backgroundColor: typeConfig.bgColor,
                borderRadius: radius.sm,
                padding: spacing[1.5],
                marginRight: spacing[2],
              },
            ]}
          >
            <Text variant="labelXs" customColor={typeConfig.iconColor}>
              {typeConfig.icon}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text variant="labelSm" color="primary" weight="medium">
              {typeConfig.label}
            </Text>
            <Text variant="textXs" color="muted">
              {timestamp}
            </Text>
          </View>
        </View>

        {/* Delete button */}
        {onDelete && (
          <Pressable
            onPress={handleDelete}
            hitSlop={8}
            style={[
              styles.deleteButton,
              {
                width: 32,
                height: 32,
                borderRadius: radius.full,
                backgroundColor: colors.dark[800],
              },
            ]}
          >
            <Text variant="labelSm" color="error">
              ×
            </Text>
          </Pressable>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Photo */}
        {type === 'photo' && imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={[
              styles.image,
              {
                borderRadius: radius.lg,
                backgroundColor: colors.dark[900],
              },
            ] as ImageStyle}
            resizeMode="cover"
          />
        )}

        {/* Note */}
        {type === 'note' && noteText && (
          <View
            style={[
              styles.noteContent,
              {
                padding: spacing[4],
                backgroundColor: colors.background.elevated,
                borderRadius: radius.lg,
              },
            ]}
          >
            <Text variant="textSm" color="secondary" numberOfLines={3}>
              {noteText}
            </Text>
          </View>
        )}

        {/* Timer */}
        {type === 'timer' && timerDuration && (
          <View
            style={[
              styles.timerContent,
              {
                padding: spacing[5],
                backgroundColor: colors.background.elevated,
                borderRadius: radius.lg,
                alignItems: 'center',
              },
            ]}
          >
            <Text variant="displayLg" color="primary" weight="bold">
              {timerDuration}
            </Text>
            <Text variant="textXs" color="muted" style={{ marginTop: spacing[1] }}>
              Session duration
            </Text>
          </View>
        )}

        {/* Audio */}
        {type === 'audio' && audioDuration && (
          <View
            style={[
              styles.audioContent,
              {
                padding: spacing[4],
                backgroundColor: colors.background.elevated,
                borderRadius: radius.lg,
                flexDirection: 'row',
                alignItems: 'center',
              },
            ]}
          >
            {/* Play button placeholder */}
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.accent[500],
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: spacing[3],
              }}
            >
              <View
                style={{
                  width: 0,
                  height: 0,
                  borderLeftWidth: 10,
                  borderTopWidth: 7,
                  borderBottomWidth: 7,
                  borderLeftColor: colors.dark[950],
                  borderTopColor: 'transparent',
                  borderBottomColor: 'transparent',
                  marginLeft: 2,
                }}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text variant="labelSm" color="primary" weight="medium">
                Audio note
              </Text>
              <Text variant="textXs" color="muted">
                {audioDuration}
              </Text>
            </View>

            {/* Waveform placeholder */}
            <View style={styles.waveform}>
              {[1, 0.6, 0.8, 1, 0.4, 0.9, 0.7, 1].map((height, i) => (
                <View
                  key={i}
                  style={{
                    width: 3,
                    height: 20 * height,
                    backgroundColor: colors.accent[600],
                    borderRadius: 2,
                    marginHorizontal: 1,
                  }}
                />
              ))}
            </View>
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

interface TypeConfig {
  label: string;
  icon: string;
  iconColor: string;
  bgColor: string;
}

function getTypeConfig(type: CaptureType, colors: any): TypeConfig {
  switch (type) {
    case 'photo':
      return {
        label: 'Photo',
        icon: '📸',
        iconColor: colors.accent[400],
        bgColor: colors.semantic.info.subtle,
      };
    case 'note':
      return {
        label: 'Note',
        icon: '📝',
        iconColor: colors.emerald[400],
        bgColor: colors.semantic.success.subtle,
      };
    case 'timer':
      return {
        label: 'Timer',
        icon: '⏱️',
        iconColor: colors.amber[400],
        bgColor: colors.semantic.warning.subtle,
      };
    case 'audio':
      return {
        label: 'Audio',
        icon: '🎤',
        iconColor: colors.violet[400],
        bgColor: colors.semantic.ai.subtle,
      };
  }
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  image: {
    width: '100%',
    height: 200,
  },
  noteContent: {
    minHeight: 80,
  },
  timerContent: {
    minHeight: 100,
  },
  audioContent: {
    minHeight: 80,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
  },
});

// =============================================================================
// EXPORTS
// =============================================================================

export default CaptureCard;
