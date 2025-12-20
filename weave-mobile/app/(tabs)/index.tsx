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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Button as _Button, showSimpleToast } from '@/design-system';

export default function HomeScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /**
   * Handle logout with confirmation
   */
  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
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

            // Show success toast
            console.log('[HOME] Calling showSimpleToast for logout...');
            showSimpleToast('Signed out successfully. See you soon! 👋', 'success');

            // Redirect handled automatically by auth state change in _layout.tsx
          } catch (error) {
            console.error('[HOME] Logout error:', error);
            Alert.alert('Error', 'Failed to sign out. Please try again.');
          } finally {
            setIsLoggingOut(false);
            setShowUserMenu(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#0F0F10',
      }}
    >
      {/* User Avatar in Top Right */}
      <View
        style={{
          position: 'absolute',
          top: 48,
          right: 16,
          zIndex: 50,
        }}
      >
        <Pressable
          onPress={() => setShowUserMenu(!showUserMenu)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#8B5CF6',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </Pressable>

        {/* User Menu Dropdown */}
        {showUserMenu && (
          <View
            style={{
              position: 'absolute',
              top: 48,
              right: 0,
              backgroundColor: '#1F1F23',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#27272A',
              minWidth: 192,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                padding: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#27272A',
              }}
            >
              <Text style={{ color: '#71717A', fontSize: 12 }}>Signed in as</Text>
              <Text style={{ color: '#FAFAFA', fontSize: 14, fontWeight: '500', marginTop: 4 }}>
                {user?.email}
              </Text>
            </View>
            <Pressable onPress={handleLogout} disabled={isLoggingOut} style={{ padding: 12 }}>
              <Text style={{ color: '#EF4444', fontWeight: '500' }}>
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Main Content */}
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          gap: 24,
        }}
      >
        <View style={{ alignItems: 'center', gap: 12 }}>
          <Text
            style={{
              fontSize: 48,
              fontWeight: 'bold',
              color: '#FAFAFA',
              textAlign: 'center',
            }}
          >
            Weave MVP
          </Text>
          <Text
            style={{
              fontSize: 18,
              color: '#A1A1AA',
              textAlign: 'center',
            }}
          >
            Foundation Setup Complete ✅
          </Text>
          {user && (
            <Text
              style={{
                fontSize: 14,
                color: '#71717A',
                marginTop: 8,
                textAlign: 'center',
              }}
            >
              Signed in as: {user.email}
            </Text>
          )}
        </View>

        {/* Design System Preview Button */}
        <Pressable
          onPress={() => router.push('/(tabs)/design-system-showcase')}
          style={{
            backgroundColor: '#8B5CF6',
            paddingHorizontal: 24,
            paddingVertical: 16,
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              color: '#FAFAFA',
              fontSize: 16,
              fontWeight: '600',
            }}
          >
            View Design System
          </Text>
        </Pressable>

        {/* Footer */}
        <View style={{ position: 'absolute', bottom: 32, alignItems: 'center' }}>
          <Text style={{ color: '#71717A', fontSize: 12 }}>React Native-First Design System</Text>
          <Text style={{ color: '#71717A', fontSize: 12 }}>
            NativeWind v5 • Tailwind v4 • Liquid Glass UI
          </Text>
          <Text style={{ color: '#71717A', fontSize: 12, marginTop: 8 }}>
            Story 0.3: Authentication Flow
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
