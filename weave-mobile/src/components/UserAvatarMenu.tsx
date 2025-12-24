/**
 * UserAvatarMenu - Reusable user avatar with dropdown menu
 * Story: 0.9 - Global user menu for all app pages
 *
 * Features:
 * - User avatar with first letter of email
 * - Dropdown menu showing signed-in email
 * - Sign out functionality
 */

import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export function UserAvatarMenu() {
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
            console.log('[USER MENU] Logout successful');
            // TODO: Replace with new toast system
            // showSimpleToast('Signed out successfully. See you soon! 👋', 'success');

            // Redirect to login screen
            router.replace('/(auth)/login');
          } catch (error) {
            console.error('[USER MENU] Logout error:', error);
            Alert.alert('Error', 'Failed to sign out. Please try again.');
          } finally {
            setIsLoggingOut(false);
            setShowUserMenu(false);
          }
        },
      },
    ]);
  };

  if (!user) {
    return null; // Don't render if no user
  }

  return (
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
        <RNText style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
          {user.email?.charAt(0).toUpperCase() || 'U'}
        </RNText>
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
            <RNText style={{ color: '#71717A', fontSize: 12 }}>Signed in as</RNText>
            <RNText style={{ color: '#FAFAFA', fontSize: 14, fontWeight: '500', marginTop: 4 }}>
              {user.email}
            </RNText>
          </View>
          <Pressable onPress={handleLogout} disabled={isLoggingOut} style={{ padding: 12 }}>
            <RNText style={{ color: '#EF4444', fontWeight: '500' }}>
              {isLoggingOut ? 'Signing out...' : 'Sign Out'}
            </RNText>
          </Pressable>
        </View>
      )}
    </View>
  );
}
