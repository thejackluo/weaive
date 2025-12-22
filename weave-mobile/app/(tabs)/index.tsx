/**
 * Home Screen (Tabs Index)
 *
 * Story 0.3: Added logout button for testing auth flow
 *
 * This is a placeholder home screen for testing.
 * Will be replaced with actual Thread/Home screen in future stories.
 */

import React, { useState } from 'react';
import { View, Text, Pressable, Alert, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Button as _Button, showSimpleToast } from '@/design-system';
import CountdownTimer from '@/components/features/journal/CountdownTimer';
import { ProofCaptureSheet } from '@/components/ProofCaptureSheet';
import { ImageGallery } from '@/components/ImageGallery';
import { ImageDetailView } from '@/components/ImageDetailView';

export default function HomeScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Story 0.9: Image Capture Test State
  const [showCaptureSheet, setShowCaptureSheet] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);

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

      {/* Main Content - Scrollable */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 24,
          gap: 24,
          paddingBottom: 100,
        }}
      >
        {/* Header */}
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

        {/* Story 0.9: Test Image Capture */}
        <View
          style={{
            backgroundColor: '#1F1F23',
            borderRadius: 16,
            padding: 20,
            borderWidth: 2,
            borderColor: '#3B82F6',
            gap: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 24 }}>📸</Text>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#FAFAFA',
                }}
              >
                Story 0.9: Image Capture Test
              </Text>
              <Text style={{ fontSize: 12, color: '#71717A', marginTop: 4 }}>
                AI-Powered Image Service with Gemini Vision
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => setShowCaptureSheet(true)}
            style={{
              backgroundColor: '#3B82F6',
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: '#FAFAFA',
                fontSize: 16,
                fontWeight: '600',
              }}
            >
              📷 Capture & Upload Image
            </Text>
          </Pressable>

          {/* Mini Gallery Preview */}
          <View style={{ gap: 8 }}>
            <Text style={{ color: '#A1A1AA', fontSize: 14, fontWeight: '500' }}>
              Recent Uploads:
            </Text>
            <View
              style={{
                height: 200,
                backgroundColor: '#0F0F10',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <ImageGallery
                onImagePress={(capture) => setSelectedImage(capture)}
              />
            </View>
          </View>

          <Text
            style={{ fontSize: 11, color: '#71717A', textAlign: 'center', fontStyle: 'italic' }}
          >
            Tap "Capture" → Take/Choose photo → Watch AI analysis → View in gallery
          </Text>
        </View>

        {/* Story 4.1c: Countdown Timer (Section C) */}
        <View style={{ width: '100%', maxWidth: 400, paddingHorizontal: 16 }}>
          <Text
            style={{
              fontSize: 12,
              color: '#71717A',
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            Story 4.1c: Countdown Timer Demo
          </Text>
          <CountdownTimer debug={true} />
        </View>

        {/* Navigation Buttons */}
        <View style={{ gap: 12, width: '100%', maxWidth: 300 }}>
          <Pressable
            onPress={() => router.push('/(tabs)/needles')}
            style={{
              backgroundColor: '#10B981',
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
                textAlign: 'center',
              }}
            >
              📍 View Needles (Story 2.1)
            </Text>
          </Pressable>

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
                textAlign: 'center',
              }}
            >
              🎨 View Design System
            </Text>
          </Pressable>
        </View>

        {/* Settings Screen */}
        <Pressable
          onPress={() => router.push('/(tabs)/settings')}
          style={{
            backgroundColor: '#10B981',
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
            ⚙️ Settings (with Reflection)
          </Text>
        </Pressable>

        {/* TEST: Direct Reflection Link (Story 4.1a) */}
        <Pressable
          onPress={() => router.push('/(tabs)/settings/reflection')}
          style={{
            backgroundColor: '#3B82F6',
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
            📝 Test Reflection (Direct)
          </Text>
        </Pressable>

        {/* Footer */}
        <View style={{ alignItems: 'center', marginTop: 32 }}>
          <Text style={{ color: '#71717A', fontSize: 12 }}>React Native-First Design System</Text>
          <Text style={{ color: '#71717A', fontSize: 12 }}>
            NativeWind v5 • Tailwind v4 • Liquid Glass UI
          </Text>
          <Text style={{ color: '#71717A', fontSize: 12, marginTop: 8 }}>
            Story 0.3: Authentication Flow
          </Text>
        </View>
      </ScrollView>

      {/* Story 0.9: Capture Sheet Modal */}
      <Modal visible={showCaptureSheet} animationType="slide" presentationStyle="pageSheet">
        <ProofCaptureSheet
          context={{
            goal_id: null, // Quick capture - no specific goal binding
            subtask_instance_id: null,
            bind_description: 'Quick capture from home screen',
            local_date: new Date().toISOString().split('T')[0],
          }}
          onSuccess={(result) => {
            console.log('✅ Upload success:', result);
            showSimpleToast('Image uploaded successfully! 🎉', 'success');
            setShowCaptureSheet(false);
            // Invalidate images query to refetch gallery
            queryClient.invalidateQueries({ queryKey: ['images'] });
          }}
          onCancel={() => setShowCaptureSheet(false)}
          allowSkip={true}
        />
      </Modal>

      {/* Story 0.9: Image Detail Modal */}
      {selectedImage && (
        <Modal visible={true} animationType="fade" presentationStyle="fullScreen">
          <ImageDetailView
            capture={selectedImage}
            onClose={() => setSelectedImage(null)}
            onDelete={() => {
              showSimpleToast('Image deleted', 'success');
              setSelectedImage(null);
              // Invalidate images query to refetch gallery
              queryClient.invalidateQueries({ queryKey: ['images'] });
            }}
          />
        </Modal>
      )}
    </SafeAreaView>
  );
}
