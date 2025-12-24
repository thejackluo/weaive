/**
 * Home Screen (Tabs Index)
 *
 * Story 0.3: Added logout button for testing auth flow
 *
 * This is a placeholder home screen for testing.
 * Will be replaced with actual Thread/Home screen in future stories.
 */

import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { SymbolView } from 'expo-symbols';
// Removed: import { Button, Text, showSimpleToast } from '@/design-system';
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
  const queryClient = useQueryClient();
  const router = useRouter();

  // Story 0.9: Image Capture Test State
  const [showCaptureSheet, setShowCaptureSheet] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);

  return (
    <View className="flex-1 items-center justify-center bg-background-primary p-4 gap-6">
      <View className="items-center gap-2">
        <Text style={{ fontSize: 72, fontWeight: 'bold', color: '#fafafa' }}>Weave MVP</Text>
        <Text style={{ fontSize: 16, color: '#a1a1aa' }}>Foundation Setup Complete ✅</Text>
      </View>

      {/* Design System Buttons */}
      <View className="gap-3 w-full max-w-xs">
        <Pressable
          onPress={() => router.push('/(tabs)/design-system-showcase')}
          className="bg-accent-500 px-6 py-4 rounded-lg active:opacity-80 active:scale-[0.98]"
        >
          <Text style={{ color: '#18181b', fontSize: 14, fontWeight: '500', letterSpacing: 1, textAlign: 'center' }}>
            View Full Design System
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/(tabs)/component-testing')}
          className="bg-violet-600 px-6 py-4 rounded-lg active:opacity-80 active:scale-[0.98] border border-violet-500"
        >
          <Text style={{ color: '#fafafa', fontSize: 14, fontWeight: '500', letterSpacing: 1, textAlign: 'center' }}>
            🧪 Component Testing
          </Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 w-full"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
      >
        {/* Story 3.1: Today's Binds */}
        <View className="mb-8">
          <Text style={{ fontSize: 36, fontWeight: '600', color: '#ffffff', marginBottom: 16 }}>
            Today's Binds
          </Text>

          {/* Morning Workout Bind */}
          <TouchableOpacity className="p-5 bg-white/5 rounded-xl mb-3 border border-white/10 active:bg-white/10">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center">
                  <SymbolView name="figure.run" size={20} tintColor="#60a5fa" />
                </View>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#ffffff' }}>
                  Morning Workout
                </Text>
              </View>
              <SymbolView name="chevron.right" size={16} tintColor="rgba(255,255,255,0.4)" />
            </View>
            <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.6)', marginLeft: 52 }}>
              Complete your 30-minute strength training session
            </Text>
          </TouchableOpacity>

          {/* Deep Work Block Bind */}
          <TouchableOpacity className="p-5 bg-white/5 rounded-xl mb-3 border border-white/10 active:bg-white/10">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-purple-500/20 items-center justify-center">
                  <SymbolView name="book.fill" size={20} tintColor="#a78bfa" />
                </View>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#ffffff' }}>
                  Deep Work Block
                </Text>
              </View>
              <SymbolView name="chevron.right" size={16} tintColor="rgba(255,255,255,0.4)" />
            </View>
            <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.6)', marginLeft: 52 }}>
              2 hours of focused project work
            </Text>
          </TouchableOpacity>

          {/* Evening Meditation Bind */}
          <TouchableOpacity className="p-5 bg-white/5 rounded-xl border border-white/10 active:bg-white/10">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-emerald-500/20 items-center justify-center">
                  <SymbolView name="sparkles" size={20} tintColor="#34d399" />
                </View>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#ffffff' }}>
                  Evening Meditation
                </Text>
              </View>
              <SymbolView name="chevron.right" size={16} tintColor="rgba(255,255,255,0.4)" />
            </View>
            <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.6)', marginLeft: 52 }}>
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
            onPress={() => router.push('/(tabs)/voice-demo')}
            style={{
              backgroundColor: '#a855f7',
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
              🎤 Voice Demo (Story 0.11)
            </Text>
          </Pressable>

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
                scrollEnabled={false}
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

        {/* Quick Actions - Primary Navigation */}
        <View className="mb-8">
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#ffffff', marginBottom: 16 }}>
            Quick Actions
          </Text>
          <View className="flex-row gap-3 mb-3">
            <Link href="/(tabs)/dashboard" asChild className="flex-1">
              <TouchableOpacity
                style={{
                  backgroundColor: '#3b82f6',
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 12,
                  alignItems: 'center',
                  flex: 1,
                }}
              >
                <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
                  📊 Dashboard
                </Text>
              </TouchableOpacity>
            </Link>
            <Link href="/journal" asChild className="flex-1">
              <TouchableOpacity
                style={{
                  backgroundColor: '#a855f7',
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 12,
                  alignItems: 'center',
                  flex: 1,
                }}
              >
                <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
                  📝 Journal
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
          <View className="flex-row gap-3 mb-3">
            <Link href="/goals" asChild className="flex-1">
              <TouchableOpacity
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 12,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  flex: 1,
                }}
              >
                <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
                  🎯 Goals
                </Text>
              </TouchableOpacity>
            </Link>
            <Link href="/captures" asChild className="flex-1">
              <TouchableOpacity
                style={{
                  backgroundColor: '#10b981',
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 12,
                  alignItems: 'center',
                  flex: 1,
                }}
              >
                <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
                  📸 Captures
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
          <Link href="/(tabs)/needles" asChild className="w-full">
            <TouchableOpacity
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 12,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '600' }}>
                📍 View Needles (Story 2.1)
              </Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Development Tools */}
        <View className="pt-6 border-t border-white/5 mb-8">
          <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.3)', marginBottom: 12, textAlign: 'center' }}>
            Development Tools
          </Text>
          <View className="gap-3">
            <Link href="/(tabs)/settings" asChild>
              <TouchableOpacity
                style={{
                  backgroundColor: 'transparent',
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#9ca3af', fontSize: 14, fontWeight: '500' }}>
                  ⚙️ Settings
                </Text>
              </TouchableOpacity>
            </Link>
            <Link href="/(tabs)/settings/reflection" asChild>
              <TouchableOpacity
                style={{
                  backgroundColor: 'transparent',
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#9ca3af', fontSize: 14, fontWeight: '500' }}>
                  💭 Test Reflection (Direct)
                </Text>
              </TouchableOpacity>
            </Link>
            <Link href="/sitemap" asChild>
              <TouchableOpacity
                style={{
                  backgroundColor: 'transparent',
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#9ca3af', fontSize: 14, fontWeight: '500' }}>
                  🗺️ View Sitemap
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Footer */}
        <View className="pt-8 pb-4">
          <Text style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.2)', textAlign: 'center', marginBottom: 4 }}>
            React Native-First Design System
          </Text>
          <Text style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.2)', textAlign: 'center' }}>
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
            // showSimpleToast('Image uploaded successfully! 🎉', 'success');
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
              // showSimpleToast('Image deleted', 'success');
              setSelectedImage(null);
              // Invalidate images query to refetch gallery
              queryClient.invalidateQueries({ queryKey: ['images'] });
            }}
          />
        </Modal>
      )}
    </View>
  );
}
