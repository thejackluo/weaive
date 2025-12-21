/**
 * Weave Design System - Overlay Components
 *
 * Modal, BottomSheet, and Toast components
 * Animated entrances/exits with backdrop dimming
 *
 * Usage:
 * <Modal visible={isVisible} onClose={handleClose} title="Create Goal">
 *   <ModalContent />
 * </Modal>
 *
 * <BottomSheet visible={isVisible} onClose={handleClose}>
 *   <SheetContent />
 * </BottomSheet>
 *
 * showToast({ type: 'success', title: 'Saved!', message: 'Your changes were saved.' })
 */

import React, { useEffect, useCallback } from 'react';
import {
  View,
  Modal as RNModal,
  Pressable,
  ScrollView,
  StyleSheet,
  ViewStyle,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../theme';
import { Text } from './Text';
import { IconButton } from './Button';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// =============================================================================
// MODAL
// =============================================================================

export interface ModalProps {
  /** Visibility state */
  visible: boolean;

  /** Close handler */
  onClose: () => void;

  /** Modal title */
  title?: string;

  /** Subtitle */
  subtitle?: string;

  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'full';

  /** Disable backdrop dismissal */
  disableBackdropDismiss?: boolean;

  /** Children */
  children: React.ReactNode;

  /** Custom style for content */
  style?: ViewStyle;
}

export function Modal({
  visible,
  onClose,
  title,
  subtitle,
  size = 'md',
  disableBackdropDismiss = false,
  children,
  style,
}: ModalProps) {
  const { colors, radius, spacing, shadows, durations } = useTheme();

  // Animation values
  const backdropOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(SCREEN_HEIGHT);
  const contentScale = useSharedValue(0.9);

  useEffect(() => {
    if (visible) {
      // Enter animations
      backdropOpacity.value = withTiming(1, {
        duration: durations.moderate,
        easing: Easing.out(Easing.ease),
      });
      contentTranslateY.value = withSpring(0, {
        damping: 25,
        stiffness: 250,
      });
      contentScale.value = withSpring(1, {
        damping: 20,
        stiffness: 200,
      });
    } else {
      // Exit animations
      backdropOpacity.value = withTiming(0, {
        duration: durations.fast,
      });
      contentTranslateY.value = withTiming(SCREEN_HEIGHT, {
        duration: durations.fast,
      });
      contentScale.value = withTiming(0.9, {
        duration: durations.fast,
      });
    }
  }, [visible, backdropOpacity, contentTranslateY, contentScale, durations]);

  // Animated styles
  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: contentTranslateY.value },
      { scale: contentScale.value },
    ],
  }));

  // Get modal width
  const modalWidth = getModalWidth(size);

  return (
    <RNModal
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
      animationType="none"
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={disableBackdropDismiss ? undefined : onClose}
        />
      </Animated.View>

      {/* Content */}
      <View style={styles.modalContainer}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.background.elevated,
              borderRadius: radius['2xl'],
              width: modalWidth,
              maxWidth: '90%',
              maxHeight: '85%',
              ...shadows.xl,
            },
            contentAnimatedStyle,
            style,
          ]}
        >
          {/* Header */}
          {(title || subtitle) && (
            <View
              style={[
                styles.modalHeader,
                {
                  paddingHorizontal: spacing[5],
                  paddingTop: spacing[5],
                  paddingBottom: spacing[4],
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border.subtle,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                {title && (
                  <Text variant="displayMd" color="primary" weight="semibold">
                    {title}
                  </Text>
                )}
                {subtitle && (
                  <Text
                    variant="textSm"
                    color="muted"
                    style={{ marginTop: spacing[1] }}
                  >
                    {subtitle}
                  </Text>
                )}
              </View>

              <IconButton
                icon={
                  <View
                    style={{
                      width: 16,
                      height: 16,
                    }}
                  >
                    <View
                      style={{
                        position: 'absolute',
                        width: 16,
                        height: 2,
                        backgroundColor: colors.text.muted,
                        transform: [{ rotate: '45deg' }],
                      }}
                    />
                    <View
                      style={{
                        position: 'absolute',
                        width: 16,
                        height: 2,
                        backgroundColor: colors.text.muted,
                        transform: [{ rotate: '-45deg' }],
                      }}
                    />
                  </View>
                }
                variant="ghost"
                size="md"
                onPress={onClose}
                accessibilityLabel="Close modal"
              />
            </View>
          )}

          {/* Body */}
          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={{
              padding: spacing[5],
            }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </RNModal>
  );
}

// =============================================================================
// BOTTOM SHEET
// =============================================================================

export interface BottomSheetProps {
  /** Visibility state */
  visible: boolean;

  /** Close handler */
  onClose: () => void;

  /** Sheet title */
  title?: string;

  /** Snap points (percentages of screen height) */
  snapPoints?: number[];

  /** Disable backdrop dismissal */
  disableBackdropDismiss?: boolean;

  /** Show drag handle */
  showDragHandle?: boolean;

  /** Children */
  children: React.ReactNode;

  /** Custom style */
  style?: ViewStyle;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  snapPoints = [0.5], // 50% by default
  disableBackdropDismiss = false,
  showDragHandle = true,
  children,
  style,
}: BottomSheetProps) {
  const { colors, radius, spacing, shadows, durations } = useTheme();

  const backdropOpacity = useSharedValue(0);
  const translateY = useSharedValue(SCREEN_HEIGHT);

  const sheetHeight = SCREEN_HEIGHT * snapPoints[0];

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, {
        duration: durations.moderate,
      });
      translateY.value = withSpring(0, {
        damping: 25,
        stiffness: 250,
      });
    } else {
      backdropOpacity.value = withTiming(0, {
        duration: durations.fast,
      });
      translateY.value = withTiming(SCREEN_HEIGHT, {
        duration: durations.fast,
      });
    }
  }, [visible, backdropOpacity, translateY, durations]);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <RNModal
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
      animationType="none"
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={disableBackdropDismiss ? undefined : onClose}
        />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheetContainer,
          {
            backgroundColor: colors.background.elevated,
            borderTopLeftRadius: radius['2xl'],
            borderTopRightRadius: radius['2xl'],
            maxHeight: sheetHeight,
            ...shadows.xl,
          },
          sheetAnimatedStyle,
          style,
        ]}
      >
        {/* Drag handle */}
        {showDragHandle && (
          <View style={[styles.dragHandle, { paddingVertical: spacing[3] }]}>
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: colors.dark[700],
                borderRadius: radius.full,
              }}
            />
          </View>
        )}

        {/* Title */}
        {title && (
          <View
            style={[
              styles.sheetHeader,
              {
                paddingHorizontal: spacing[5],
                paddingBottom: spacing[3],
                borderBottomWidth: 1,
                borderBottomColor: colors.border.subtle,
              },
            ]}
          >
            <Text variant="displaySm" color="primary" weight="semibold">
              {title}
            </Text>
          </View>
        )}

        {/* Content */}
        <ScrollView
          style={styles.sheetBody}
          contentContainerStyle={{
            padding: spacing[5],
          }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </Animated.View>
    </RNModal>
  );
}

// =============================================================================
// TOAST
// =============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // milliseconds
  position?: 'top' | 'bottom';
}

export interface ToastProps extends ToastConfig {
  visible: boolean;
  onDismiss: () => void;
}

export function Toast({
  visible,
  type,
  title,
  message,
  position = 'top',
  onDismiss,
}: ToastProps) {
  const { colors, radius, spacing, shadows, durations } = useTheme();

  const translateY = useSharedValue(position === 'top' ? -200 : 200);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 200,
      });
      opacity.value = withTiming(1, {
        duration: durations.fast,
      });
    } else {
      const direction = position === 'top' ? -200 : 200;
      translateY.value = withTiming(direction, {
        duration: durations.fast,
      });
      opacity.value = withTiming(0, {
        duration: durations.fast,
      });
    }
  }, [visible, translateY, opacity, position, durations]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const typeConfig = getToastConfig(type, colors);

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          [position]: spacing[5],
          backgroundColor: typeConfig.bgColor,
          borderLeftWidth: 4,
          borderLeftColor: typeConfig.accentColor,
          borderRadius: radius.lg,
          padding: spacing[4],
          ...shadows.lg,
        },
        animatedStyle,
      ]}
    >
      <View style={styles.toastContent}>
        {/* Icon */}
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: radius.full,
            backgroundColor: typeConfig.iconBgColor,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: spacing[3],
          }}
        >
          <Text variant="labelSm">{typeConfig.icon}</Text>
        </View>

        {/* Text */}
        <View style={{ flex: 1 }}>
          <Text variant="labelBase" color="primary" weight="semibold">
            {title}
          </Text>
          {message && (
            <Text
              variant="textSm"
              color="secondary"
              style={{ marginTop: spacing[0.5] }}
            >
              {message}
            </Text>
          )}
        </View>

        {/* Close button */}
        <Pressable onPress={onDismiss} hitSlop={8}>
          <Text variant="labelLg" color="muted">
            ×
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function getModalWidth(size: string): number | string {
  switch (size) {
    case 'sm':
      return 320;
    case 'lg':
      return 640;
    case 'full':
      return '100%';
    case 'md':
    default:
      return 480;
  }
}

interface ToastConfig {
  icon: string;
  accentColor: string;
  bgColor: string;
  iconBgColor: string;
}

function getToastConfig(type: ToastType, colors: any): ToastConfig {
  switch (type) {
    case 'success':
      return {
        icon: '✓',
        accentColor: colors.semantic.success.emphasis,
        bgColor: colors.background.elevated,
        iconBgColor: colors.semantic.success.subtle,
      };
    case 'error':
      return {
        icon: '✕',
        accentColor: colors.semantic.error.emphasis,
        bgColor: colors.background.elevated,
        iconBgColor: colors.semantic.error.subtle,
      };
    case 'warning':
      return {
        icon: '⚠',
        accentColor: colors.semantic.warning.emphasis,
        bgColor: colors.background.elevated,
        iconBgColor: colors.semantic.warning.subtle,
      };
    case 'info':
    default:
      return {
        icon: 'ℹ',
        accentColor: colors.accent[500],
        bgColor: colors.background.elevated,
        iconBgColor: colors.accent[900],
      };
  }
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  // Modal
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  modalBody: {
    flex: 1,
  },

  // Bottom Sheet
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  dragHandle: {
    alignItems: 'center',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetBody: {
    flex: 1,
  },

  // Toast
  toastContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

// =============================================================================
// EXPORTS
// =============================================================================

export default Modal;
