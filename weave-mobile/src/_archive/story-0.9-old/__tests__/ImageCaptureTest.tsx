/**
 * ImageCaptureTest Component
 *
 * Story 0.9: Image Handling with Supabase Storage
 * Manual test screen for verifying image capture and upload functionality
 *
 * To use this test screen:
 * 1. Import and render in a test route (e.g., app/(tabs)/test.tsx)
 * 2. Ensure Supabase migrations are applied (run: npx supabase db push)
 * 3. Make sure you're authenticated in the app
 * 4. Test camera, gallery, and image display
 */

import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Button, Text } from '@/design-system';
import { ProofCaptureSheet } from '../ProofCaptureSheet';
import { CaptureImage } from '../CaptureImage';
import { captureQuickPhoto, getUserCaptures } from '@/services/imageCapture';
import type { Capture } from '@/types/captures';

export function ImageCaptureTest() {
  const [showProofSheet, setShowProofSheet] = useState(false);
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock proof context for testing
  const mockProofContext = {
    subtask_instance_id: '00000000-0000-0000-0000-000000000001', // Fake UUID for testing
    goal_id: '00000000-0000-0000-0000-000000000002', // Fake UUID for testing
    local_date: new Date().toISOString().split('T')[0], // Today's date
    note: 'Test proof photo',
  };

  /**
   * Test: Quick capture (no bind context)
   */
  const handleQuickCapture = async () => {
    try {
      setIsLoading(true);
      const localDate = new Date().toISOString().split('T')[0];

      const capture = await captureQuickPhoto(localDate, 'camera', 'Test quick capture');

      if (capture) {
        Alert.alert('Success', 'Quick capture uploaded successfully!');
        await loadCaptures();
      }
    } catch (error) {
      Alert.alert('Error', `Quick capture failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load today's captures
   */
  const loadCaptures = async () => {
    try {
      setIsLoading(true);
      const localDate = new Date().toISOString().split('T')[0];
      const userCaptures = await getUserCaptures(localDate, 'photo');
      setCaptures(userCaptures);
    } catch (error) {
      Alert.alert('Error', `Failed to load captures: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-neutral-950 p-6">
      {/* Header */}
      <View className="mb-8">
        <Text variant="displaySm" className="text-white mb-2">
          Image Capture Test
        </Text>
        <Text variant="bodyMd" className="text-neutral-400">
          Story 0.9: Verify image upload functionality
        </Text>
      </View>

      {/* Test Actions */}
      <View className="space-y-4 mb-8">
        <Text variant="bodyLg" className="text-white mb-2">
          Test Actions:
        </Text>

        {/* Test 1: Proof capture with context */}
        <Button
          variant="primary"
          size="md"
          onPress={() => setShowProofSheet(true)}
          disabled={isLoading}
        >
          Test Proof Capture (with context)
        </Button>

        {/* Test 2: Quick capture */}
        <Button
          variant="secondary"
          size="md"
          onPress={handleQuickCapture}
          disabled={isLoading}
        >
          Test Quick Capture (no context)
        </Button>

        {/* Test 3: Load captures */}
        <Button
          variant="secondary"
          size="md"
          onPress={loadCaptures}
          disabled={isLoading}
        >
          Load Today's Captures
        </Button>
      </View>

      {/* Display captures */}
      {captures.length > 0 && (
        <View className="mb-8">
          <Text variant="bodyLg" className="text-white mb-4">
            Today's Captures ({captures.length}):
          </Text>

          {captures.map((capture) => (
            <View key={capture.id} className="mb-6 bg-neutral-900 rounded-lg p-4">
              {/* Image */}
              {capture.storage_key && (
                <CaptureImage
                  storageKey={capture.storage_key}
                  width="100%"
                  height={200}
                  borderRadius={8}
                />
              )}

              {/* Metadata */}
              <View className="mt-4">
                <Text variant="bodySm" className="text-neutral-400">
                  ID: {capture.id.substring(0, 8)}...
                </Text>
                <Text variant="bodySm" className="text-neutral-400">
                  Type: {capture.type}
                </Text>
                <Text variant="bodySm" className="text-neutral-400">
                  Date: {capture.local_date}
                </Text>
                {capture.content_text && (
                  <Text variant="bodySm" className="text-neutral-400">
                    Note: {capture.content_text}
                  </Text>
                )}
                <Text variant="bodySm" className="text-neutral-400">
                  Storage: {capture.storage_key}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Empty state */}
      {captures.length === 0 && !isLoading && (
        <View className="items-center py-12">
          <Text variant="bodyMd" className="text-neutral-500">
            No captures yet. Test the buttons above!
          </Text>
        </View>
      )}

      {/* Proof capture sheet modal */}
      {showProofSheet && (
        <View className="absolute inset-0 bg-black/80 justify-end">
          <View className="bg-neutral-900 rounded-t-3xl">
            <ProofCaptureSheet
              context={mockProofContext}
              onSuccess={async (capture) => {
                Alert.alert('Success', 'Proof photo uploaded successfully!');
                setShowProofSheet(false);
                await loadCaptures();
              }}
              onCancel={() => setShowProofSheet(false)}
              allowSkip={true}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}
