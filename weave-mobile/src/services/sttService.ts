/**
 * STT (Speech-to-Text) Service
 *
 * Client service for transcribing audio files using the backend /api/transcribe endpoint
 *
 * Features:
 * - Upload audio file and get transcript
 * - Provider abstraction (AssemblyAI primary, Whisper fallback handled by backend)
 * - Progress tracking for large uploads
 * - Error handling with retryable errors
 * - Rate limit detection
 */

/* eslint-env browser */

import { supabase } from '@lib/supabase';
import { getApiBaseUrl } from '@/utils/api';

/**
 * Transcription result from backend
 */
export interface TranscriptionResult {
  transcript: string;
  confidence: number; // 0.0-1.0
  duration_sec: number;
  language: string;
  provider: 'assemblyai' | 'whisper' | 'manual';
  audio_url: string;
}

/**
 * Transcription error response
 */
export interface TranscriptionError {
  code: string;
  message: string;
  retryable: boolean;
  retryAfter?: string; // ISO timestamp for rate limit
}

/**
 * Transcribe audio options
 */
export interface TranscribeOptions {
  /**
   * Audio file URI (local file path)
   */
  audioUri: string;

  /**
   * Language code (default: 'en')
   */
  language?: string;

  /**
   * Link to existing capture record (optional)
   */
  captureId?: string;

  /**
   * Link to subtask instance (optional)
   */
  subtaskInstanceId?: string;

  /**
   * Link to goal (optional)
   */
  goalId?: string;

  /**
   * Progress callback for upload
   */
  onProgress?: (progress: number) => void;
}

/**
 * Transcribe audio file
 * Uploads audio to backend /api/transcribe endpoint
 */
export async function transcribeAudio(options: TranscribeOptions): Promise<TranscriptionResult> {
  const { audioUri, language = 'en', captureId, subtaskInstanceId, goalId, onProgress } = options;

  try {
    console.log('[STT_SERVICE] 🎤 Starting transcription:', {
      audioUri,
      language,
      captureId,
    });

    // Get current user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error('Not authenticated');
    }

    // Prepare multipart form data
    const formData = new FormData();

    // React Native FormData Pattern: Use file descriptor object
    // This tells RN to read the file from disk when sending the request
    console.log('[STT_SERVICE] 📎 Preparing file upload from:', audioUri);

    // React Native FormData accepts: { uri, name, type }
    // The implementation will read the file bytes automatically during upload
    formData.append('audio', {
      uri: audioUri,
      name: 'recording.m4a',
      type: 'audio/x-m4a',
    } as any);

    // Add optional parameters
    formData.append('language', language);
    if (captureId) formData.append('capture_id', captureId);
    if (subtaskInstanceId) formData.append('subtask_instance_id', subtaskInstanceId);
    if (goalId) formData.append('goal_id', goalId);

    // Upload to backend with progress tracking
    const apiUrl = `${getApiBaseUrl()}/api/transcribe`;

    const xhr = new XMLHttpRequest();

    // Promise wrapper for XMLHttpRequest
    const uploadPromise = new Promise<TranscriptionResult>((resolve, reject) => {
      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = event.loaded / event.total;
            onProgress(progress);
          }
        });
      }

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('[STT_SERVICE] ✅ Transcription complete:', response);

            // Extract data from standard API response format
            const { data } = response;
            resolve(data);
          } catch (parseError) {
            console.error('[STT_SERVICE] ❌ Failed to parse response:', parseError);
            reject(new Error('Invalid response format'));
          }
        } else {
          // Handle error response
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            console.error('[STT_SERVICE] ❌ Transcription failed:', errorResponse);

            // Check for 404 - backend endpoint not found
            if (xhr.status === 404) {
              const error: any = new Error(
                'Backend transcription service is not available. Please start the backend server (weave-api) and ensure /api/transcribe endpoint is implemented.'
              );
              error.code = 'BACKEND_NOT_AVAILABLE';
              error.retryable = false;
              reject(error);
              return;
            }

            const error: TranscriptionError = errorResponse.error || {
              code: 'UNKNOWN_ERROR',
              message: 'Transcription failed',
              retryable: false,
            };

            // Return error with additional context
            const enrichedError: any = new Error(error.message);
            enrichedError.code = error.code;
            enrichedError.retryable = error.retryable;
            enrichedError.retryAfter = error.retryAfter;
            reject(enrichedError);
          } catch (parseError) {
            // Couldn't parse error response - check if it's 404
            if (xhr.status === 404) {
              const error: any = new Error(
                'Backend transcription service is not available. Please start the backend server.'
              );
              error.code = 'BACKEND_NOT_AVAILABLE';
              error.retryable = false;
              reject(error);
            } else {
              reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
            }
          }
        }
      });

      // Handle network errors
      xhr.addEventListener('error', () => {
        console.error('[STT_SERVICE] ❌ Network error during upload');
        const error: any = new Error('Network error');
        error.code = 'NETWORK_ERROR';
        error.retryable = true;
        reject(error);
      });

      // Handle timeout
      xhr.addEventListener('timeout', () => {
        console.error('[STT_SERVICE] ❌ Upload timeout');
        const error: any = new Error('Upload timeout');
        error.code = 'UPLOAD_TIMEOUT';
        error.retryable = true;
        reject(error);
      });

      // Open request
      xhr.open('POST', apiUrl);

      // Set headers
      xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);

      // Set timeout (30 seconds)
      xhr.timeout = 30000;

      // Send request
      xhr.send(formData);
    });

    return await uploadPromise;
  } catch (error) {
    console.error('[STT_SERVICE] ❌ Transcription error:', error);
    throw error;
  }
}

/**
 * Re-transcribe an existing capture
 * Useful for retrying with a different provider
 */
export async function retranscribeCapture(captureId: string): Promise<TranscriptionResult> {
  try {
    console.log('[STT_SERVICE] 🔄 Re-transcribing capture:', captureId);

    // Get current user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error('Not authenticated');
    }

    // Call re-transcribe endpoint
    const apiUrl = `${getApiBaseUrl()}/api/captures/${captureId}/re-transcribe`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      const error: TranscriptionError = errorData.error || {
        code: 'UNKNOWN_ERROR',
        message: 'Re-transcription failed',
        retryable: false,
      };

      const enrichedError: any = new Error(error.message);
      enrichedError.code = error.code;
      enrichedError.retryable = error.retryable;
      enrichedError.retryAfter = error.retryAfter;
      throw enrichedError;
    }

    const result = await response.json();
    console.log('[STT_SERVICE] ✅ Re-transcription complete:', result);

    return result.data;
  } catch (error) {
    console.error('[STT_SERVICE] ❌ Re-transcription error:', error);
    throw error;
  }
}
