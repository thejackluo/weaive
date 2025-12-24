/**
 * Development Environment Banner
 *
 * Shows which API endpoint is currently active in dev mode.
 * Useful when working on multiple worktrees with different backend ports.
 * Can be dismissed by tapping the X button.
 *
 * Usage:
 * ```tsx
 * import { DevEnvironmentBanner } from '@/components/DevEnvironmentBanner';
 *
 * export default function Layout() {
 *   return (
 *     <>
 *       <DevEnvironmentBanner />
 *       {children}
 *     </>
 *   );
 * }
 * ```
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';

export function DevEnvironmentBanner() {
  const [isDismissed, setIsDismissed] = useState(false);

  // Only show in development mode
  if (!__DEV__) return null;

  // Don't render if dismissed
  if (isDismissed) return null;

  const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || 'Not configured';

  // Extract port from URL for display (e.g., ":8001" from "http://localhost:8001")
  const portMatch = apiBaseUrl.match(/:(\d+)/);
  const port = portMatch ? portMatch[1] : 'unknown';

  return (
    <View style={styles.banner}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.text}>🔧 Dev Mode - API Port: {port}</RNText>
          <Text style={styles.url}>{apiBaseUrl}</RNText>
        </View>
        <TouchableOpacity
          onPress={() => setIsDismissed(true)}
          style={styles.closeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.closeButtonText}>✕</RNText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.9)', // Blue with transparency
    padding: 8,
    borderRadius: 8,
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
  },
  text: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  url: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    marginTop: 2,
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 24,
    minHeight: 24,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 18,
  },
});
