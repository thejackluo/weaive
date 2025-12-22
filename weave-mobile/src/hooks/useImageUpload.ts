/**
 * useImageUpload - TanStack Query hook for image upload with offline queue
 * Story: 0.9 - AI-Powered Image Service
 * Architecture: Story 1.5.1 (TanStack Query for server state)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { uploadImageToAPI } from '../services/imageCapture';
import { ProofCaptureContext, UploadImageResponse } from '../types/captures';

interface UploadParams {
  imageUri: string;
  context: ProofCaptureContext;
  runAIAnalysis?: boolean;
}

interface PendingUpload extends UploadParams {
  id: string;
  timestamp: number;
}

const PENDING_UPLOADS_KEY = 'pending-uploads';

/**
 * Get pending uploads from AsyncStorage
 */
async function getPendingUploads(): Promise<PendingUpload[]> {
  try {
    const data = await AsyncStorage.getItem(PENDING_UPLOADS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to read pending uploads:', error);
    return [];
  }
}

/**
 * Save pending upload to AsyncStorage (offline queue)
 */
async function savePendingUpload(upload: PendingUpload): Promise<void> {
  try {
    const pending = await getPendingUploads();
    pending.push(upload);
    await AsyncStorage.setItem(PENDING_UPLOADS_KEY, JSON.stringify(pending));
    console.log('✅ Queued upload for later:', upload.id);
  } catch (error) {
    console.error('Failed to queue upload:', error);
  }
}

/**
 * Remove pending upload from AsyncStorage
 */
async function removePendingUpload(id: string): Promise<void> {
  try {
    const pending = await getPendingUploads();
    const updated = pending.filter((u) => u.id !== id);
    await AsyncStorage.setItem(PENDING_UPLOADS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to remove pending upload:', error);
  }
}

/**
 * Hook: Upload image with AI analysis and offline queue support
 *
 * Features:
 * - Offline-first: Queues failed uploads to AsyncStorage
 * - Auto-retry: TanStack Query handles retries on reconnect
 * - Cache invalidation: Refreshes image list on success
 * - Optimistic updates: Optional (not implemented yet)
 *
 * Usage:
 * ```tsx
 * const upload = useImageUpload();
 * await upload.mutateAsync({ imageUri, context, runAIAnalysis: true });
 * ```
 */
export function useImageUpload() {
  const queryClient = useQueryClient();

  return useMutation<UploadImageResponse | null, Error, UploadParams>({
    mutationFn: async ({ imageUri, context, runAIAnalysis = true }) => {
      try {
        // Attempt upload
        const result = await uploadImageToAPI(imageUri, context, runAIAnalysis);
        return result;
      } catch (error) {
        // Queue for later if network error
        if (error instanceof TypeError && error.message.includes('network')) {
          const pendingUpload: PendingUpload = {
            id: `upload-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            imageUri,
            context,
            runAIAnalysis,
            timestamp: Date.now(),
          };
          await savePendingUpload(pendingUpload);
          throw new Error('Network unavailable. Upload queued for later.');
        }
        throw error;
      }
    },

    // Offline-first: Allow mutations even when offline
    networkMode: 'offlineFirst',

    // On success: Invalidate image list cache
    onSuccess: (data) => {
      if (data) {
        console.log('✅ Upload successful:', data.data.id);
        // Invalidate all image-related queries
        queryClient.invalidateQueries({ queryKey: ['images'] });
        queryClient.invalidateQueries({ queryKey: ['upload-usage'] });
      }
    },

    // On error: Log but don't show alert (already queued for retry)
    onError: (error) => {
      console.error('Upload failed:', error.message);
    },

    // Retry logic (TanStack Query default: 3 retries with exponential backoff)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Max 30s
  });
}

/**
 * Hook: Process pending uploads (call on app start or network reconnect)
 *
 * Usage:
 * ```tsx
 * const processPending = useProcessPendingUploads();
 * await processPending.mutateAsync();
 * ```
 */
export function useProcessPendingUploads() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      const pending = await getPendingUploads();
      console.log(`📤 Processing ${pending.length} pending uploads...`);

      for (const upload of pending) {
        try {
          await uploadImageToAPI(upload.imageUri, upload.context, upload.runAIAnalysis);
          await removePendingUpload(upload.id);
          console.log('✅ Processed pending upload:', upload.id);
        } catch (error) {
          console.error('Failed to process pending upload:', upload.id, error);
          // Keep in queue for next retry
        }
      }
    },

    onSuccess: () => {
      // Invalidate cache after processing all uploads
      queryClient.invalidateQueries({ queryKey: ['images'] });
    },
  });
}

/**
 * Hook: Get pending upload count (for UI badge)
 *
 * Usage:
 * ```tsx
 * const { data: pendingCount } = usePendingUploadCount();
 * ```
 */
export async function getPendingUploadCount(): Promise<number> {
  const pending = await getPendingUploads();
  return pending.length;
}
