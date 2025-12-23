/**
 * Home Screen (Tabs Index)
 *
 * Story 0.3: Added logout button for testing auth flow
 *
 * This is a placeholder home screen for testing.
 * Will be replaced with actual Thread/Home screen in future stories.
 */

import React, { useState } from 'react';
import { View, Text as RNText, Pressable, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { SymbolView } from 'expo-symbols';
import { Button, Text, showSimpleToast } from '@/design-system';
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
        <Text className="text-7xl font-bold text-text-primary">Weave MVP</Text>
        <Text className="text-base text-text-secondary">Foundation Setup Complete ✅</Text>
      </View>

      {/* Design System Buttons */}
      <View className="gap-3 w-full max-w-xs">
        <Pressable
          onPress={() => router.push('/(tabs)/design-system-showcase')}
          className="bg-accent-500 px-6 py-4 rounded-lg active:opacity-80 active:scale-98"
        >
          <Text className="text-dark-900 text-sm font-medium tracking-wide text-center">
            View Full Design System
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/(tabs)/component-testing')}
          className="bg-violet-600 px-6 py-4 rounded-lg active:opacity-80 active:scale-98 border border-violet-500"
        >
          <Text className="text-dark-50 text-sm font-medium tracking-wide text-center">
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
          <Text variant="displayMd" className="text-white mb-4 font-semibold">
            Today's Binds
          </Text>

          {/* Morning Workout Bind */}
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

          {/* Deep Work Block Bind */}
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

          {/* Evening Meditation Bind */}
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
            <RNText style={{ fontSize: 24 }}>📸</RNText>
            <View style={{ flex: 1 }}>
              <RNText
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#FAFAFA',
                }}
              >
                Story 0.9: Image Capture Test
              </RNText>
              <RNText style={{ fontSize: 12, color: '#71717A', marginTop: 4 }}>
                AI-Powered Image Service with Gemini Vision
              </RNText>
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
            <RNText
              style={{
                color: '#FAFAFA',
                fontSize: 16,
                fontWeight: '600',
              }}
            >
              📷 Capture & Upload Image
            </RNText>
          </Pressable>

          {/* Mini Gallery Preview */}
          <View style={{ gap: 8 }}>
            <RNText style={{ color: '#A1A1AA', fontSize: 14, fontWeight: '500' }}>
              Recent Uploads:
            </RNText>
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

          <RNText
            style={{ fontSize: 11, color: '#71717A', textAlign: 'center', fontStyle: 'italic' }}
          >
            Tap "Capture" → Take/Choose photo → Watch AI analysis → View in gallery
          </RNText>
        </View>

        {/* Story 4.1c: Countdown Timer (Section C) */}
        <View style={{ width: '100%', maxWidth: 400, paddingHorizontal: 16 }}>
          <RNText
            style={{
              fontSize: 12,
              color: '#71717A',
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            Story 4.1c: Countdown Timer Demo
          </RNText>
          <CountdownTimer debug={true} />
        </View>

        {/* Quick Actions - Primary Navigation */}
        <View className="mb-8">
          <Text variant="textLg" className="text-white mb-4 font-semibold">
            Quick Actions
          </Text>
          <View className="flex-row gap-3 mb-3">
            <Link href="/(tabs)/dashboard" asChild className="flex-1">
              <Button variant="primary" size="md">
                📊 Dashboard
              </Button>
            </Link>
            <Link href="/journal" asChild className="flex-1">
              <Button variant="ai" size="md">
                📝 Journal
              </Button>
            </Link>
          </View>
          <View className="flex-row gap-3 mb-3">
            <Link href="/goals" asChild className="flex-1">
              <Button variant="secondary" size="md">
                🎯 Goals
              </Button>
            </Link>
            <Link href="/captures" asChild className="flex-1">
              <Button variant="success" size="md">
                📸 Captures
              </Button>
            </Link>
          </View>
          <Link href="/(tabs)/needles" asChild className="w-full">
            <Button variant="secondary" size="md">
              📍 View Needles (Story 2.1)
            </Button>
          </Link>
        </View>

        {/* Development Tools */}
        <View className="pt-6 border-t border-white/5 mb-8">
          <Text variant="textSm" className="text-white/30 mb-3 text-center">
            Development Tools
          </Text>
          <View className="gap-3">
            <Link href="/(tabs)/settings" asChild>
              <Button variant="ghost" size="sm">
                ⚙️ Settings
              </Button>
            </Link>
            <Link href="/(tabs)/settings/reflection" asChild>
              <Button variant="ghost" size="sm">
                💭 Test Reflection (Direct)
              </Button>
            </Link>
            <Link href="/sitemap" asChild>
              <Button variant="ghost" size="sm">
                🗺️ View Sitemap
              </Button>
            </Link>
          </View>
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
    </View>
  );
}
