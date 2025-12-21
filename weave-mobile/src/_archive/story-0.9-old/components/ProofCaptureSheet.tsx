/**
 * ProofCaptureSheet Component
 *
 * Story 0.9: Image Handling with Supabase Storage
 * Epic 3: Daily Actions & Proof (US-3.4 - Attach Proof to Bind)
 *
 * Bottom sheet that appears after completing a bind to capture proof photo.
 * Offers camera or gallery options with clean, delightful UX.
 */

import React, { useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { Button, Text } from '@/design-system';
import {
  captureAndUploadProofPhoto,
  requestCameraPermissions,
  requestGalleryPermissions,
} from '@/services/imageCapture';
import type { ProofCaptureContext, Capture } from '@/types/captures';

interface ProofCaptureSheetProps {
  /** Proof context (subtask, goal, date) */
  context: ProofCaptureContext;

  /** Called when proof is successfully captured */
  onSuccess: (capture: Capture) => void;

  /** Called when user cancels or closes without capturing */
  onCancel: () => void;

  /** Optional: Show skip button (default: true) */
  allowSkip?: boolean;
}

export function ProofCaptureSheet({
  context,
  onSuccess,
  onCancel,
  allowSkip = true,
}: ProofCaptureSheetProps) {
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Handle camera capture
   */
  const handleCamera = async () => {
    try {
      setIsUploading(true);

      // Request permissions first
      const hasPermission = await requestCameraPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Camera Permission Required',
          'Please enable camera access in Settings to take proof photos.',
          [{ text: 'OK' }]
        );
        setIsUploading(false);
        return;
      }

      // Capture and upload
      const capture = await captureAndUploadProofPhoto(context, 'camera');

      if (capture) {
        console.log('[ProofCapture] ✅ Proof captured via camera');
        onSuccess(capture);
      } else {
        // User cancelled camera
        console.log('[ProofCapture] Camera cancelled');
        setIsUploading(false);
      }
    } catch (error) {
      console.error('[ProofCapture] Camera capture failed:', error);
      Alert.alert(
        'Upload Failed',
        'Failed to upload proof photo. Please try again.',
        [{ text: 'OK' }]
      );
      setIsUploading(false);
    }
  };

  /**
   * Handle gallery selection
   */
  const handleGallery = async () => {
    try {
      setIsUploading(true);

      // Request permissions first
      const hasPermission = await requestGalleryPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Gallery Permission Required',
          'Please enable photo library access in Settings to select proof photos.',
          [{ text: 'OK' }]
        );
        setIsUploading(false);
        return;
      }

      // Capture and upload
      const capture = await captureAndUploadProofPhoto(context, 'gallery');

      if (capture) {
        console.log('[ProofCapture] ✅ Proof selected from gallery');
        onSuccess(capture);
      } else {
        // User cancelled gallery picker
        console.log('[ProofCapture] Gallery cancelled');
        setIsUploading(false);
      }
    } catch (error) {
      console.error('[ProofCapture] Gallery selection failed:', error);
      Alert.alert(
        'Upload Failed',
        'Failed to upload proof photo. Please try again.',
        [{ text: 'OK' }]
      );
      setIsUploading(false);
    }
  };

  return (
    <View className="flex-1 p-6 bg-neutral-900">
      {/* Header */}
      <View className="mb-8">
        <Text variant="displaySm" className="text-white mb-2">
          Add proof?
        </Text>
        <Text variant="bodyMd" className="text-neutral-400">
          Optional — but proof helps you stay accountable
        </Text>
      </View>

      {/* Loading state */}
      {isUploading && (
        <View className="items-center justify-center py-12">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text variant="bodySm" className="text-neutral-400 mt-4">
            Uploading proof...
          </Text>
        </View>
      )}

      {/* Capture options */}
      {!isUploading && (
        <View className="space-y-4">
          {/* Camera button */}
          <Button
            variant="primary"
            size="lg"
            onPress={handleCamera}
            className="w-full"
          >
            📸 Take Photo
          </Button>

          {/* Gallery button */}
          <Button
            variant="secondary"
            size="lg"
            onPress={handleGallery}
            className="w-full"
          >
            🖼️ Choose from Gallery
          </Button>

          {/* Skip button */}
          {allowSkip && (
            <Button
              variant="ghost"
              size="md"
              onPress={onCancel}
              className="w-full mt-2"
            >
              Skip for now
            </Button>
          )}
        </View>
      )}

      {/* Footer hint */}
      {!isUploading && (
        <View className="mt-8">
          <Text variant="bodySm" className="text-neutral-500 text-center">
            Photos are stored securely and only visible to you
          </Text>
        </View>
      )}
    </View>
  );
}
