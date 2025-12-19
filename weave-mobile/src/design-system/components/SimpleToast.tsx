/**
 * Simple Toast Component
 *
 * A minimal, crash-proof toast notification system.
 * No animations, no BlurView, no Reanimated - just works.
 *
 * Use this as a fallback when the fancy Toast crashes.
 */

import React, { useEffect, useState } from 'react';
import { View, Text as RNText, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type SimpleToastType = 'success' | 'error' | 'info';

export interface SimpleToastConfig {
  message: string;
  type: SimpleToastType;
  duration?: number;
}

interface SimpleToastProps extends SimpleToastConfig {
  onDismiss: () => void;
}

/**
 * Simple Toast Component
 */
export function SimpleToast({ message, type, duration = 3000, onDismiss }: SimpleToastProps) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    console.log('[SIMPLE_TOAST] Toast mounted with message:', message);
    const timer = setTimeout(() => {
      console.log('[SIMPLE_TOAST] Auto-dismissing after', duration, 'ms');
      onDismiss();
    }, duration);

    return () => {
      console.log('[SIMPLE_TOAST] Toast unmounting, clearing timer');
      clearTimeout(timer);
    };
  }, [duration, onDismiss, message]);

  const backgroundColor = getBackgroundColor(type);
  const icon = getIcon(type);

  return (
    <View
      style={[
        styles.container,
        {
          top: insets.top + 16,
        },
      ]}
    >
      <Pressable
        onPress={onDismiss}
        style={[
          styles.toast,
          {
            backgroundColor,
          },
        ]}
      >
        <RNText style={styles.icon}>{icon}</RNText>
        <RNText style={styles.message}>{message}</RNText>
      </Pressable>
    </View>
  );
}

function getBackgroundColor(type: SimpleToastType): string {
  switch (type) {
    case 'success':
      return 'rgba(16, 185, 129, 0.95)'; // emerald-500
    case 'error':
      return 'rgba(239, 68, 68, 0.95)'; // rose-500
    case 'info':
      return 'rgba(139, 92, 246, 0.95)'; // accent-500
    default:
      return 'rgba(139, 92, 246, 0.95)';
  }
}

function getIcon(type: SimpleToastType): string {
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
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

/**
 * Simple Toast Manager
 */
class SimpleToastManager {
  private listener: ((config: SimpleToastConfig | null) => void) | null = null;

  setListener(listener: (config: SimpleToastConfig | null) => void) {
    console.log('[SIMPLE_TOAST_MANAGER] Listener registered:', !!listener);
    this.listener = listener;
  }

  show(message: string, type: SimpleToastType = 'info', duration?: number) {
    console.log('[SIMPLE_TOAST_MANAGER] show() called:', { message, type, duration, hasListener: !!this.listener });
    if (this.listener) {
      this.listener({ message, type, duration });
      console.log('[SIMPLE_TOAST_MANAGER] Toast config sent to listener');
    } else {
      console.warn('[SIMPLE_TOAST_MANAGER] No listener registered! Toast will not display.');
    }
  }

  hide() {
    console.log('[SIMPLE_TOAST_MANAGER] hide() called');
    if (this.listener) {
      this.listener(null);
    }
  }
}

export const simpleToastManager = new SimpleToastManager();

/**
 * Simple Toast Container
 */
export function SimpleToastContainer() {
  const [toastConfig, setToastConfig] = useState<SimpleToastConfig | null>(null);

  useEffect(() => {
    console.log('[SIMPLE_TOAST_CONTAINER] Mounted, registering listener');
    simpleToastManager.setListener(setToastConfig);
    return () => {
      console.log('[SIMPLE_TOAST_CONTAINER] Unmounting, removing listener');
      simpleToastManager.setListener(() => {});
    };
  }, []);

  if (!toastConfig) {
    return null;
  }

  console.log('[SIMPLE_TOAST_CONTAINER] Rendering SimpleToast with:', toastConfig);

  return (
    <SimpleToast
      message={toastConfig.message}
      type={toastConfig.type}
      duration={toastConfig.duration}
      onDismiss={() => setToastConfig(null)}
    />
  );
}

/**
 * Show simple toast (global function)
 */
export function showSimpleToast(
  message: string,
  type: SimpleToastType = 'info',
  duration?: number
) {
  console.log('[SHOW_SIMPLE_TOAST] Function called with:', { message, type, duration });
  simpleToastManager.show(message, type, duration);
}
