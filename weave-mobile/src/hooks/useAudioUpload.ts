/**
 * Story 0.11: Audio Upload Hooks
 *
 * TanStack Query hooks for STT operations:
 * - useTranscribeAudio: Upload and transcribe audio file
 * - useGetCapture: Fetch capture by ID
 * - useDeleteCapture: Delete capture
 * - useRetranscribeCapture: Retry transcription with different provider
 *
 * Implements offline queueing and optimistic updates
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  sttApi,
  TranscribeOptions,
  TranscriptionResponse,
  CaptureResponse,
} from '@/services/sttApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_QUEUE_KEY = '@weave_stt_offline_queue';

// Query keys
export const sttKeys = {
  all: ['stt'] as const,
  captures: () => [...sttKeys.all, 'captures'] as const,
  capture: (id: string) => [...sttKeys.captures(), id] as const,
};

/**
 * Upload and transcribe audio file
 * Implements offline queueing for failed uploads
 *
 * Usage:
 * ```tsx
 * const { mutate: transcribe, isPending, error } = useTranscribeAudio();
 *
 * const handleRecordingComplete = async (result: RecordingResult) => {
 *   transcribe({
 *     audioUri: result.uri,
 *     language: 'en',
 *     goalId: currentGoalId,
 *   });
 * };
 * ```
 */
export function useTranscribeAudio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sttApi.transcribeAudio,

    onMutate: async (options: TranscribeOptions) => {
      console.log('[AUDIO_UPLOAD_HOOK] 🎤 Transcription mutation started:', {
        audioUri: options.audioUri,
        language: options.language ?? 'en',
      });
    },

    onSuccess: (data: TranscriptionResponse, variables: TranscribeOptions) => {
      console.log('[AUDIO_UPLOAD_HOOK] ✅ Transcription successful:', {
        transcript_length: data.transcript.length,
        confidence: data.confidence,
        provider: data.provider,
      });

      // Invalidate captures query to refetch list
      queryClient.invalidateQueries({ queryKey: sttKeys.captures() });
    },

    onError: async (error: Error, variables: TranscribeOptions) => {
      console.error('[AUDIO_UPLOAD_HOOK] ❌ Transcription failed:', error.message);

      // Queue for retry if network error
      if (error.message.includes('Network') || error.message.includes('timeout')) {
        console.log('[AUDIO_UPLOAD_HOOK] 📥 Queueing for offline retry...');

        try {
          // Load existing queue
          const queueJson = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
          const queue: TranscribeOptions[] = queueJson ? JSON.parse(queueJson) : [];

          // Add to queue
          queue.push(variables);

          // Save queue
          await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));

          console.log('[AUDIO_UPLOAD_HOOK] ✅ Queued for retry (queue size:', queue.length, ')');
        } catch (queueError) {
          console.error('[AUDIO_UPLOAD_HOOK] ❌ Failed to queue for retry:', queueError);
        }
      }
    },

    retry: 1, // Retry once before giving up
    retryDelay: 2000, // Wait 2 seconds before retry
  });
}

/**
 * Process offline queue
 * Should be called when network connection is restored
 *
 * Usage:
 * ```tsx
 * useEffect(() => {
 *   if (isOnline) {
 *     processOfflineQueue();
 *   }
 * }, [isOnline]);
 * ```
 */
export async function processOfflineQueue(): Promise<void> {
  try {
    console.log('[AUDIO_UPLOAD_HOOK] 📤 Processing offline queue...');

    // Load queue
    const queueJson = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!queueJson) {
      console.log('[AUDIO_UPLOAD_HOOK] ℹ️  No offline queue found');
      return;
    }

    const queue: TranscribeOptions[] = JSON.parse(queueJson);
    console.log('[AUDIO_UPLOAD_HOOK] 📋 Found', queue.length, 'queued transcriptions');

    // Process each item
    const results = await Promise.allSettled(
      queue.map((options) => sttApi.transcribeAudio(options))
    );

    // Log results
    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    console.log(`[AUDIO_UPLOAD_HOOK] ✅ Processed offline queue: ${successful} successful, ${failed} failed`);

    // Clear queue
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch (error) {
    console.error('[AUDIO_UPLOAD_HOOK] ❌ Error processing offline queue:', error);
  }
}

/**
 * Get capture by ID
 * Fetches capture with signed audio URL (1-hour expiration)
 *
 * Usage:
 * ```tsx
 * const { data: capture, isLoading, error } = useGetCapture(captureId);
 * ```
 */
export function useGetCapture(captureId: string | null) {
  return useQuery({
    queryKey: sttKeys.capture(captureId ?? ''),
    queryFn: () => {
      if (!captureId) {
        throw new Error('Capture ID is required');
      }
      return sttApi.getCapture(captureId);
    },
    enabled: !!captureId, // Only run if captureId is provided
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });
}

/**
 * Delete capture
 * Removes audio file and database record
 *
 * Usage:
 * ```tsx
 * const { mutate: deleteCapture, isPending } = useDeleteCapture();
 *
 * const handleDelete = () => {
 *   deleteCapture(captureId);
 * };
 * ```
 */
export function useDeleteCapture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sttApi.deleteCapture,

    onMutate: async (captureId: string) => {
      console.log('[AUDIO_UPLOAD_HOOK] 🗑️  Deleting capture:', captureId);

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: sttKeys.capture(captureId) });

      // Snapshot previous value
      const previousCapture = queryClient.getQueryData(sttKeys.capture(captureId));

      // Optimistically remove from cache
      queryClient.removeQueries({ queryKey: sttKeys.capture(captureId) });

      return { previousCapture, captureId };
    },

    onSuccess: (_, captureId) => {
      console.log('[AUDIO_UPLOAD_HOOK] ✅ Capture deleted:', captureId);

      // Invalidate captures list
      queryClient.invalidateQueries({ queryKey: sttKeys.captures() });
    },

    onError: (err, captureId, context) => {
      console.error('[AUDIO_UPLOAD_HOOK] ❌ Delete failed:', err);

      // Restore previous data on error
      if (context?.previousCapture) {
        queryClient.setQueryData(sttKeys.capture(captureId), context.previousCapture);
      }
    },
  });
}

/**
 * Re-transcribe capture with different provider
 * First retry is free, subsequent retries count against daily limit
 *
 * Usage:
 * ```tsx
 * const { mutate: retranscribe, isPending } = useRetranscribeCapture();
 *
 * const handleRetry = () => {
 *   retranscribe({ captureId, provider: 'whisper' });
 * };
 * ```
 */
export function useRetranscribeCapture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ captureId, provider }: { captureId: string; provider?: 'assemblyai' | 'whisper' }) =>
      sttApi.retranscribeCapture(captureId, provider),

    onMutate: async ({ captureId }) => {
      console.log('[AUDIO_UPLOAD_HOOK] 🔄 Re-transcribing capture:', captureId);

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: sttKeys.capture(captureId) });

      // Snapshot previous value
      const previousCapture = queryClient.getQueryData<CaptureResponse>(sttKeys.capture(captureId));

      return { previousCapture, captureId };
    },

    onSuccess: (data: CaptureResponse, { captureId }) => {
      console.log('[AUDIO_UPLOAD_HOOK] ✅ Re-transcription successful:', captureId);

      // Update capture in cache
      queryClient.setQueryData(sttKeys.capture(captureId), data);

      // Invalidate captures list
      queryClient.invalidateQueries({ queryKey: sttKeys.captures() });
    },

    onError: (err, { captureId }, context) => {
      console.error('[AUDIO_UPLOAD_HOOK] ❌ Re-transcription failed:', err);

      // Restore previous data on error
      if (context?.previousCapture) {
        queryClient.setQueryData(sttKeys.capture(captureId), context.previousCapture);
      }
    },
  });
}
