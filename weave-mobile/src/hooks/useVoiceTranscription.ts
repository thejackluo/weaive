/**
 * useVoiceTranscription Hook - Audio AI Transcription with TanStack Query
 *
 * Story: 1.5.3 - AI Services Standardization (AC-7)
 * Provides speech-to-text transcription with confidence scores and language detection.
 *
 * Features:
 * - TanStack Query mutation for API calls
 * - NO caching (unique inputs per request)
 * - HTTP 429 rate limit handling with retryAfter
 * - Abort signal support for cancelling requests
 * - Automatic retry with exponential backoff (3 attempts: 1s, 2s, 4s)
 * - Loading/error states for UI integration
 *
 * Provider fallback chain (handled by backend):
 * - Primary: AssemblyAI ($0.15/hour = $0.00004167/second)
 * - Secondary: OpenAI Whisper ($0.006/minute = $0.0001/second)
 * - Tertiary: Store audio without transcript (graceful degradation)
 *
 * Usage:
 * ```tsx
 * const { transcribe, isTranscribing, error, data } = useVoiceTranscription();
 *
 * const result = await transcribe({
 *   audioUri: "file:///path/to/recording.m4a",
 *   language: "en"
 * });
 * ```
 */

import { useMutation } from '@tanstack/react-query';
import { getApiBaseUrl } from '@/utils/api';
import * as FileSystem from 'expo-file-system';

// ===========================
// TYPES
// ===========================

interface TranscriptionRequest {
  audioUri: string; // Local file URI (e.g., "file:///path/to/audio.m4a")
  language?: string; // Language code (default: 'en')
  maxDuration?: number; // Max duration in seconds (default: 300)
}

interface TranscriptionResponse {
  transcript: string;
  confidence: number; // 0.0-1.0 confidence score
  duration_sec: number; // Audio duration in seconds
  word_count: number;
  language: string; // Detected/specified language code
  provider: string; // 'assemblyai' or 'whisper'
  cost_usd: number;
}

// Rate limit error structure (parsed from API response)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface RateLimitError {
  code: 'RATE_LIMIT_EXCEEDED';
  message: string;
  retryAfter: number; // Seconds until rate limit resets
  limit: number; // Rate limit threshold (50 transcriptions/day)
  usage: number; // Current usage
}

interface APIErrorResponse {
  error: {
    code: string;
    message: string;
    retryAfter?: number;
  };
}

interface TranscribeOptions {
  signal?: AbortSignal; // For cancelling requests
}

// ===========================
// HOOK
// ===========================

export function useVoiceTranscription() {
  const apiBaseUrl = getApiBaseUrl();

  const mutation = useMutation({
    mutationFn: async (
      request: TranscriptionRequest & { options?: TranscribeOptions }
    ): Promise<TranscriptionResponse> => {
      const { audioUri, language = 'en', maxDuration = 300, options } = request;

      // Check if request was aborted before expensive conversion
      if (options?.signal?.aborted) {
        const abortError = new Error('Request aborted');
        abortError.name = 'AbortError';
        throw abortError;
      }

      // Read audio file as base64
      const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
        encoding: 'base64',
      });

      // Detect audio format from file extension
      const fileExtension = audioUri.split('.').pop()?.toLowerCase() || 'm4a';

      const payload = {
        audio_file: audioBase64,
        format: fileExtension,
        language,
        max_duration_sec: maxDuration,
      };

      const response = await fetch(`${apiBaseUrl}/api/transcribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: options?.signal,
      });

      if (!response.ok) {
        const errorData: APIErrorResponse = await response.json();

        if (response.status === 429) {
          // Rate limit exceeded
          throw new RateLimitException(
            errorData?.error?.message || 'Rate limit exceeded',
            errorData?.error?.retryAfter || 86400 // Default: 1 day
          );
        }

        throw new Error(errorData?.error?.message || 'Transcription failed');
      }

      const responseData = await response.json();
      return responseData.data;
    },

    // Retry configuration (AC-7): 3 total attempts (1 initial + 2 retries) with delays 1s, 2s
    retry: 2,
    retryDelay: (attemptIndex) => 1000 * 2 ** attemptIndex, // 1s, 2s

    // NO CACHING - each audio file is unique (AC-7)
    // TanStack Query default: no cache for mutations

    // Error logging (dev mode only)
    onError: (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('[useVoiceTranscription] Transcription failed:', error);
      }
    },
  });

  return {
    /**
     * Transcribe audio file to text.
     *
     * @param request - Audio URI, language, and max duration
     * @param options - Optional abort signal
     * @returns Transcription with confidence score and provider info
     */
    transcribe: (request: TranscriptionRequest, options?: TranscribeOptions) =>
      mutation.mutateAsync({ ...request, options }),

    /**
     * Loading state - True while AI is transcribing audio.
     */
    isTranscribing: mutation.isPending,

    /**
     * Error state - Populated on failure (includes rate limit errors).
     */
    error: mutation.error,

    /**
     * Transcription data - Populated on successful transcription.
     */
    data: mutation.data,

    /**
     * Reset hook state (clear error/data).
     */
    reset: mutation.reset,
  };
}

// ===========================
// CUSTOM ERRORS
// ===========================

class RateLimitException extends Error {
  public retryAfter: number;

  constructor(message: string, retryAfter: number) {
    super(message);
    this.name = 'RateLimitException';
    this.retryAfter = retryAfter;
  }
}
