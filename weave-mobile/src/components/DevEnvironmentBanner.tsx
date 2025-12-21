/**
 * Development Environment Banner
 *
 * Shows which API endpoint is currently active in dev mode.
 * Useful when working on multiple worktrees with different backend ports.
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
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

export function DevEnvironmentBanner() {
  // Only show in development mode
  if (!__DEV__) return null;

  const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || 'Not configured';

  // Extract port from URL for display (e.g., ":8001" from "http://localhost:8001")
  const portMatch = apiBaseUrl.match(/:(\d+)/);
  const port = portMatch ? portMatch[1] : 'unknown';

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>🔧 Dev Mode - API Port: {port}</Text>
      <Text style={styles.url}>{apiBaseUrl}</Text>
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
});
