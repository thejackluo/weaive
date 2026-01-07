/**
 * Toast Component
 *
 * Story 0.3: Authentication Flow
 * Temporary notification component for success/error feedback
 *
 * Features:
 * - Auto-dismiss after configurable duration
 * - Slide-in animation from top
 * - Success, error, and info variants
 * - Blurred glass background (design system consistent)
 * - Safe area aware (respects notch/status bar)
 *
 * Usage:
 * ```tsx
 * import { showToast } from '@/design-system';
 *
 * showToast('Welcome back!', 'success');
 * showToast('Invalid credentials', 'error');
 * ```
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions as _Dimensions,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Conditional import for BlurView (not available on web)
let BlurView: any;
if (Platform.OS !== 'web') {
  BlurView = require('@react-native-community/blur').BlurView;
}
import { Text } from './Text/Text';
import { useTheme } from '../theme/ThemeProvider';

/**
 * Toast Types
 */
export type ToastType = 'success' | 'error' | 'info';

/**
 * Toast Configuration
 */
export interface ToastConfig {
  message: string;
  type: ToastType;
  duration?: number; // milliseconds
}

/**
 * Toast Props
 */
interface ToastProps extends ToastConfig {
  onDismiss: () => void;
}

/**
 * Toast Component
 * Internal component - use showToast() instead
 */
export function Toast({ message, type, duration = 3000, onDismiss }: ToastProps) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const [translateY] = useState(new Animated.Value(-100));

  /**
   * Get icon for toast type
   */
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'info':
        return 'i';
      default:
        return '';
    }
  };

  /**
   * Get color for toast type
   */
  const getColor = () => {
    switch (type) {
      case 'success':
        return colors.emerald[500];
      case 'error':
        return colors.rose[500];
      case 'info':
        return colors.accent[500];
      default:
        return colors.accent[500];
    }
  };

  /**
   * Animate in on mount, auto-dismiss after duration
   */
  useEffect(() => {
    // Slide in
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();

    // Auto-dismiss after duration
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  /**
   * Dismiss with slide-out animation
   */
  const handleDismiss = () => {
    Animated.timing(translateY, {
      toValue: -100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  const backgroundColor = getColor();
  const topOffset = insets.top + spacing[4];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: topOffset,
          transform: [{ translateY }],
        },
      ]}
    >
      <Pressable onPress={handleDismiss} style={styles.pressable}>
        {Platform.OS === 'ios' ? (
          <BlurView
            style={[styles.content, { borderColor: backgroundColor }]}
            blurType="dark"
            blurAmount={80}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: `${backgroundColor}20`,
                },
              ]}
            >
              <Text variant="textLg" weight="bold" style={{ color: backgroundColor }}>
                {getIcon()}
              </Text>
            </View>
            <Text variant="textBase" weight="medium" color="primary" style={styles.message}>
              {message}
            </Text>
          </BlurView>
        ) : (
          <View
            style={[
              styles.content,
              {
                backgroundColor: `${colors.dark[800]}F0`,
                borderColor: backgroundColor,
              },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: `${backgroundColor}20`,
                },
              ]}
            >
              <Text variant="textLg" weight="bold" style={{ color: backgroundColor }}>
                {getIcon()}
              </Text>
            </View>
            <Text variant="textBase" weight="medium" color="primary" style={styles.message}>
              {message}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  pressable: {
    width: '100%',
    maxWidth: 400,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  message: {
    flex: 1,
  },
});

/**
 * Toast Manager
 * Manages toast state and rendering
 */
class ToastManager {
  private listener: ((config: ToastConfig | null) => void) | null = null;

  /**
   * Set the listener function
   */
  setListener(listener: (config: ToastConfig | null) => void) {
    console.log('[TOAST_MANAGER] Listener registered:', !!listener);
    this.listener = listener;
  }

  /**
   * Show a toast notification
   */
  show(message: string, type: ToastType = 'info', duration?: number) {
    console.log('[TOAST_MANAGER] show() called:', {
      message,
      type,
      duration,
      hasListener: !!this.listener,
    });
    if (this.listener) {
      this.listener({ message, type, duration });
      console.log('[TOAST_MANAGER] Toast config sent to listener');
    } else {
      console.warn('[TOAST_MANAGER] No listener registered! Toast will not display.');
    }
  }

  /**
   * Hide current toast
   */
  hide() {
    console.log('[TOAST_MANAGER] hide() called');
    if (this.listener) {
      this.listener(null);
    }
  }
}

export const toastManager = new ToastManager();

/**
 * Toast Container Component
 * Add this to your app root (in _layout.tsx)
 */
export function ToastContainer() {
  const [toastConfig, setToastConfig] = useState<ToastConfig | null>(null);

  useEffect(() => {
    console.log('[TOAST_CONTAINER] Mounted, registering listener');
    toastManager.setListener(setToastConfig);
    return () => {
      console.log('[TOAST_CONTAINER] Unmounting, removing listener');
      toastManager.setListener(() => {});
    };
  }, []);

  useEffect(() => {
    if (toastConfig) {
      console.log('[TOAST_CONTAINER] Toast config updated, rendering toast:', toastConfig);
    } else {
      console.log('[TOAST_CONTAINER] No toast config, not rendering');
    }
  }, [toastConfig]);

  if (!toastConfig) return null;

  console.log('[TOAST_CONTAINER] Rendering Toast component with:', toastConfig);

  return (
    <Toast
      message={toastConfig.message}
      type={toastConfig.type}
      duration={toastConfig.duration}
      onDismiss={() => setToastConfig(null)}
    />
  );
}

/**
 * Helper function to show toast
 * Use this throughout your app for notifications
 *
 * @param message - Message to display
 * @param type - Toast type (success, error, info)
 * @param duration - Duration in milliseconds (default: 3000)
 *
 * @example
 * ```tsx
 * import { showToast } from '@/design-system';
 *
 * showToast('Welcome back!', 'success');
 * showToast('Invalid email', 'error', 5000);
 * ```
 */
export function showToast(message: string, type: ToastType = 'info', duration?: number) {
  console.log('[SHOW_TOAST] Function called with:', { message, type, duration });
  toastManager.show(message, type, duration);
}
