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

/**
 * Thread (Home) Tab
 * Epic 3: Daily Actions & Proof
 * Story 3.1: View Today's Binds
 */
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
    <ScrollView className="flex-1" style={{ backgroundColor: '#0a0a0a' }}>
      <View className="p-6">
        {/* Main Header */}
        <View className="mb-8">
          <Text variant="displayLg" className="text-white mb-2 font-bold">
            Good Morning ✨
          </Text>
          <Text variant="textBase" className="text-white/60">
            Friday, December 20 • Let's make today count
          </Text>
        </View>

        {/* Today's Binds - Primary Section */}
        <View className="mb-8">
          <Text variant="displayMd" className="text-white mb-4 font-semibold">
            Today's Binds
          </Text>

          <TouchableOpacity className="p-5 bg-white/5 rounded-xl mb-3 border border-white/10 active:bg-white/10">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center">
                  <SymbolView name="figure.run" size={20} tintColor="#60a5fa" />
                </View>
                <Text variant="textLg" className="text-white font-semibold">
                  Morning Workout
                </Text>
              </View>
              <SymbolView name="chevron.right" size={16} tintColor="rgba(255,255,255,0.4)" />
            </View>
            <Text variant="textSm" className="text-white/60 ml-13">
              Complete your 30-minute strength training session
            </Text>
          </TouchableOpacity>

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
          <TouchableOpacity className="p-5 bg-white/5 rounded-xl mb-3 border border-white/10 active:bg-white/10">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-purple-500/20 items-center justify-center">
                  <SymbolView name="book.fill" size={20} tintColor="#a78bfa" />
                </View>
                <Text variant="textLg" className="text-white font-semibold">
                  Deep Work Block
                </Text>
              </View>
              <SymbolView name="chevron.right" size={16} tintColor="rgba(255,255,255,0.4)" />
            </View>
            <Text variant="textSm" className="text-white/60 ml-13">
              2 hours of focused project work
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="p-5 bg-white/5 rounded-xl border border-white/10 active:bg-white/10">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-emerald-500/20 items-center justify-center">
                  <SymbolView name="sparkles" size={20} tintColor="#34d399" />
                </View>
                <Text variant="textLg" className="text-white font-semibold">
                  Evening Meditation
                </Text>
              </View>
              <SymbolView name="chevron.right" size={16} tintColor="rgba(255,255,255,0.4)" />
            </View>
            <Text variant="textSm" className="text-white/60 ml-13">
              10-minute mindfulness practice
            </Text>
          </TouchableOpacity>
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
                height: 400,
                backgroundColor: '#0F0F10',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <ImageGallery
                onImagePress={(capture) => setSelectedImage(capture)}
                scrollEnabled={true}
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
            onPress={() => router.push('/(tabs)/dashboard')}
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
                textAlign: 'center',
              }}
            >
              📊 Dashboard (Epic 2 + 5)
            </Text>
          </Pressable>

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
        </View>

        {/* Development Navigation */}
        <View className="mb-8">
          <Text variant="textLg" className="text-white mb-4 font-semibold">
            Development Navigation
          </Text>

          <Pressable
            onPress={() => router.push('/(tabs)/settings')}
            style={{
              backgroundColor: '#10B981',
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderRadius: 12,
              marginBottom: 16,
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
        </View>

        {/* Footer */}
        <View style={{ alignItems: 'center', marginTop: 32 }}>
          <Text style={{ color: '#71717A', fontSize: 12 }}>React Native-First Design System</Text>
          <Text style={{ color: '#71717A', fontSize: 12 }}>
            NativeWind v5 • Tailwind v4 • Liquid Glass UI
          </Text>
        </View>

        {/* Quick Actions */}
        <View className="mb-8">
          <Text variant="textLg" className="text-white mb-4 font-semibold">
            Quick Actions
          </Text>
          <View className="flex-row gap-3 mb-3">
            <Link href="/dashboard" asChild className="flex-1">
              <Button variant="primary" size="md">
                Dashboard
              </Button>
            </Link>
            <Link href="/journal" asChild className="flex-1">
              <Button variant="ai" size="md">
                Journal
              </Button>
            </Link>
          </View>
          <View className="flex-row gap-3">
            <Link href="/goals" asChild className="flex-1">
              <Button variant="secondary" size="md">
                Goals
              </Button>
            </Link>
            <Link href="/captures" asChild className="flex-1">
              <Button variant="success" size="md">
                Captures
              </Button>
            </Link>
          </View>
        </View>

        {/* Navigation Testing (Bottom - de-emphasized) */}
        <View className="pt-6 border-t border-white/5">
          <Text variant="textSm" className="text-white/30 mb-3 text-center">
            Development Tools
          </Text>
          <Link href="/sitemap" asChild>
            <Button variant="ghost" size="sm">
              View Sitemap
            </Button>
          </Link>
        </View>

        {/* Footer */}
        <View className="pt-8 pb-4">
          <Text variant="textXs" className="text-white/20 text-center mb-1">
            React Native-First Design System
          </Text>
          <Text variant="textXs" className="text-white/20 text-center">
            NativeWind v5 • Tailwind v4 • Liquid Glass UI
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
