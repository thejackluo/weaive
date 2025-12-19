/**
 * Home Screen (Tabs Index)
 *
 * Story 0.3: Added logout button for testing auth flow
 *
 * This is a placeholder home screen for testing.
 * Will be replaced with actual Thread/Home screen in future stories.
 */

import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/design-system';

export default function HomeScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /**
   * Handle logout with confirmation
   */
  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await signOut();
              // Redirect handled automatically by auth state change in _layout.tsx
            } catch (error) {
              console.error('[HOME] Logout error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View className="flex-1 items-center justify-center bg-background-primary p-4 gap-6">
      <View className="items-center gap-2">
        <Text className="text-7xl font-bold text-text-primary">Weave MVP</Text>
        <Text className="text-base text-text-secondary">Foundation Setup Complete ✅</Text>
        {user && (
          <Text className="text-sm text-text-muted mt-2">
            Signed in as: {user.email}
          </Text>
        )}
      </View>

      {/* Design System Preview Button */}
      <Pressable
        onPress={() => router.push('/(tabs)/design-system-showcase')}
        className="bg-accent-500 px-6 py-4 rounded-lg active:opacity-80 active:scale-98"
      >
        <Text className="text-dark-900 text-sm font-medium tracking-wide">View Design System</Text>
      </Pressable>

      {/* Logout Button (Story 0.3 - Testing) */}
      <View style={{ width: '100%', maxWidth: 300, marginTop: 16 }}>
        <Button
          variant="secondary"
          size="lg"
          onPress={handleLogout}
          disabled={isLoggingOut}
          loading={isLoggingOut}
          fullWidth
        >
          {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
        </Button>
      </View>

      <View className="absolute bottom-8 items-center">
        <Text className="text-text-muted text-xs">React Native-First Design System</Text>
        <Text className="text-text-muted text-xs">
          NativeWind v5 • Tailwind v4 • Liquid Glass UI
        </Text>
        <Text className="text-text-muted text-xs mt-2">
          Story 0.3: Authentication Flow
        </Text>
      </View>
    </View>
  );
}
