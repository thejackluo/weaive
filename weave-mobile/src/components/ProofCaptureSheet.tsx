/**
 * ProofCaptureSheet - Bottom sheet for capturing proof photos after bind completion
 * Story: 0.9 - AI-Powered Image Service
 */

import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { captureAndUploadProofPhoto, getUploadUsage } from '../services/imageCapture';
import { ProofCaptureContext, PhotoSource, UploadImageResponse } from '../types/captures';

interface ProofCaptureSheetProps {
  context: ProofCaptureContext;
  onSuccess: (result: UploadImageResponse) => void;
  onCancel: () => void;
  allowSkip?: boolean;
}

export function ProofCaptureSheet({
  context,
  onSuccess,
  onCancel,
  allowSkip = true,
}: ProofCaptureSheetProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch current upload usage
  const { data: usage } = useQuery({
    queryKey: ['upload-usage'],
    queryFn: getUploadUsage,
    refetchInterval: false, // Only fetch on mount
  });

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setUploading(false);
    setUploadProgress('');
  };

  const handleCapture = async (source: PhotoSource) => {
    try {
      // Create new AbortController for this upload
      abortControllerRef.current = new AbortController();

      setUploading(true);
      setUploadProgress(source === PhotoSource.CAMERA ? 'Opening camera...' : 'Opening gallery...');

      const result = await captureAndUploadProofPhoto(
        context,
        source,
        abortControllerRef.current.signal
      );

      if (!result) {
        // User canceled
        setUploading(false);
        return;
      }

      setUploadProgress('Upload complete!');

      // Show AI verification status
      if (result.data.ai_verified) {
        Alert.alert(
          '✅ AI Verified',
          'Your proof looks great! AI confirmed this matches your bind.',
          [{ text: 'OK', onPress: () => onSuccess(result) }]
        );
      } else {
        onSuccess(result);
      }
    } catch (error: any) {
      console.error('Proof capture error:', error);

      // Handle rate limit error
      if (error.message?.includes('Daily upload limit')) {
        Alert.alert(
          '📸 Daily Limit Reached',
          "You've uploaded 5 images today. Limit resets at midnight.",
          [{ text: 'OK' }]
        );
      } else if (error.message?.includes('permission')) {
        Alert.alert(
          'Permission Required',
          `Please grant ${source} permission in Settings to capture proof.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Upload Failed', error.message || 'Please try again.', [{ text: 'OK' }]);
      }

      setUploading(false);
    }
  };

  return (
    <View className="flex-1 bg-neutral-900 p-6">
      <View className="mb-8">
        <RNText className="text-2xl font-bold text-white mb-2">Capture Proof</RNText>
        <RNText className="text-neutral-400">
          Show your progress with a photo. AI will verify your work.
        </RNText>
      </View>

      {uploading ? (
        <View className="items-center py-12">
          <ActivityIndicator size="large" color="#3b82f6" />
          <RNText className="text-neutral-400 mt-4">{uploadProgress}</RNText>
          <TouchableOpacity
            onPress={handleCancelUpload}
            className="mt-6 px-6 py-3 bg-neutral-800 rounded-lg"
          >
            <RNText className="text-white font-medium">Cancel Upload</RNText>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="gap-4">
          {/* Camera Button */}
          <TouchableOpacity
            onPress={() => handleCapture(PhotoSource.CAMERA)}
            className="bg-blue-500 rounded-xl p-4 flex-row items-center justify-center gap-3"
          >
            <MaterialIcons name="camera-alt" size={24} color="white" />
            <RNText className="text-white font-semibold text-lg">Take Photo</RNText>
          </TouchableOpacity>

          {/* Gallery Button */}
          <TouchableOpacity
            onPress={() => handleCapture(PhotoSource.GALLERY)}
            className="bg-neutral-800 rounded-xl p-4 flex-row items-center justify-center gap-3"
          >
            <MaterialIcons name="photo-library" size={24} color="white" />
            <RNText className="text-white font-semibold text-lg">Choose from Gallery</RNText>
          </TouchableOpacity>

          {/* Skip Button */}
          {allowSkip && (
            <TouchableOpacity onPress={onCancel} className="mt-4 p-4 items-center">
              <RNText className="text-neutral-500 font-medium">Skip for Now</RNText>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Usage Indicator - Dynamic */}
      <View className="mt-auto pt-6 border-t border-neutral-800">
        {usage ? (
          <View className="gap-2">
            <RNText className="text-neutral-500 text-xs text-center">
              {usage.upload_count}/5 images today ({usage.upload_size_mb.toFixed(1)}MB/5MB)
            </RNText>
            {usage.upload_count >= 4 && usage.upload_count < 5 && (
              <RNText className="text-amber-500 text-xs text-center font-medium">
                ⚠️ {5 - usage.upload_count} image{5 - usage.upload_count === 1 ? '' : 's'} remaining
              </RNText>
            )}
          </View>
        ) : (
          <RNText className="text-neutral-500 text-xs text-center">
            Free tier: 5 images/day with AI analysis
          </RNText>
        )}
      </View>
    </View>
  );
}
