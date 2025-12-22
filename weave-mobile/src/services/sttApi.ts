/**
 * Story 0.11: Speech-to-Text API Client
 *
 * HTTP client for STT operations
 * Communicates with FastAPI backend: /api/stt/*
 *
 * Endpoints:
 * - POST /api/stt/transcribe: Upload and transcribe audio
 * - GET /api/stt/captures/{capture_id}: Retrieve capture with signed URL
 * - DELETE /api/stt/captures/{capture_id}: Delete capture
 * - POST /api/stt/captures/{capture_id}/re-transcribe: Retry transcription
 */

import { getApiBaseUrl } from '@/utils/api';

// API endpoint (loaded from .env via app.config.js)
const API_BASE_URL = getApiBaseUrl();

// Auth token getter (set by initSttApi)
let getAuthTokenFn: (() => Promise<string>) | null = null;

/**
 * Initialize STT API with auth token getter from AuthContext
 * MUST be called before using any API methods
 */
export function initSttApi(getAuthToken: () => Promise<string>) {
  getAuthTokenFn = getAuthToken;
}

/**
 * Transcribe request options
 */
export interface TranscribeOptions {
  /**
   * Audio file to transcribe (local file URI)
   */
  audioUri: string;

  /**
   * Language code (default: 'en')
   */
  language?: string;

  /**
   * Optional existing capture ID to update
   */
  captureId?: string;

  /**
   * Optional subtask instance ID to link
   */
  subtaskInstanceId?: string;

  /**
   * Optional goal ID to link
   */
  goalId?: string;
}

/**
 * Transcription response from API
 */
export interface TranscriptionResponse {
  transcript: string;
  confidence: number;
  duration_sec: number;
  language: string;
  provider: 'assemblyai' | 'whisper' | 'manual';
  audio_url: string;
}

/**
 * Capture response from API
 */
export interface CaptureResponse {
  id: string;
  user_id: string;
  type: 'audio';
  storage_key: string;
  content_text: string | null;
  duration_sec: number | null;
  goal_id: string | null;
  subtask_instance_id: string | null;
  local_date: string;
  created_at: string;
  audio_url: string | null;
}

/**
 * Rate limit error details
 */
export interface RateLimitError {
  code: 'STT_RATE_LIMIT_EXCEEDED';
  message: string;
  retryable: boolean;
  retryAfter: string; // ISO 8601 timestamp
}

/**
 * Get authenticated user's access token from AuthContext
 */
async function getAuthToken(): Promise<string> {
  const start = performance.now();
  console.log('[STT_API] 🔑 Getting auth token...');

  if (!getAuthTokenFn) {
    console.error('[STT_API] ❌ sttApi not initialized!');
    throw new Error('sttApi not initialized. Call initSttApi(getAuthToken) in app/_layout.tsx');
  }

  const token = await getAuthTokenFn();
  const duration = (performance.now() - start).toFixed(2);
  console.log(`[STT_API] ✅ Auth token retrieved in ${duration}ms`);
  return token;
}

/**
 * POST /api/stt/transcribe
 * Upload audio file and transcribe with provider fallback
 *
 * Process:
 * 1. Validate audio file format and size
 * 2. Check rate limits (50 req/day, 300 min/day)
 * 3. Upload to Supabase Storage
 * 4. Transcribe with fallback (AssemblyAI → Whisper → None)
 * 5. Store in captures table
 * 6. Return transcript + audio URL
 *
 * @throws {Error} Rate limit exceeded (429)
 * @throws {Error} Invalid audio format (400)
 * @throws {Error} Audio too large (400)
 * @throws {Error} Network error
 */
export async function transcribeAudio(options: TranscribeOptions): Promise<TranscriptionResponse> {
  const overallStart = performance.now();
  console.log('[STT_API] 🎤 Transcribing audio...', {
    language: options.language ?? 'en',
    captureId: options.captureId ?? 'new',
  });

  try {
    // Step 1: Get auth token
    const token = await getAuthToken();

    // Step 2: Prepare file upload using React Native FormData pattern
    console.log('[STT_API] 📎 Preparing audio upload from:', options.audioUri);

    // Step 3: Create multipart form data with React Native file descriptor
    // React Native FormData accepts { uri, name, type } and reads file automatically during upload
    const formData = new FormData();
    formData.append('audio', {
      uri: options.audioUri,
      name: 'audio.m4a',
      type: 'audio/x-m4a',
    } as any);
    formData.append('language', options.language ?? 'en');

    if (options.captureId) {
      formData.append('capture_id', options.captureId);
    }
    if (options.subtaskInstanceId) {
      formData.append('subtask_instance_id', options.subtaskInstanceId);
    }
    if (options.goalId) {
      formData.append('goal_id', options.goalId);
    }

    // Step 4: Upload and transcribe
    console.log('[STT_API] 🚀 Uploading to /api/stt/transcribe');
    const uploadStart = performance.now();

    // Create AbortController for 30-second timeout (STT can be slow)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error('[STT_API] ⏱️  Request timeout - aborting after 30s');
      controller.abort();
    }, 30000);

    try {
      const uploadResponse = await fetch(`${API_BASE_URL}/api/stt/transcribe`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - FormData sets it automatically with boundary
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const uploadDuration = (performance.now() - uploadStart).toFixed(2);
      console.log(
        `[STT_API] 📡 Response received in ${uploadDuration}ms - Status: ${uploadResponse.status}`
      );

      // Handle rate limiting (429)
      if (uploadResponse.status === 429) {
        const errorData = await uploadResponse.json();
        const rateLimitError: RateLimitError = errorData.error;

        console.error('[STT_API] ⏸️  Rate limit exceeded:', rateLimitError.message);
        throw new Error(rateLimitError.message);
      }

      // Handle other errors
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => null);
        const errorMessage =
          errorData?.error?.message || errorData?.detail || uploadResponse.statusText;

        console.error(`[STT_API] ❌ API error: ${uploadResponse.status} ${errorMessage}`);
        throw new Error(`Transcription failed: ${errorMessage}`);
      }

      // Step 5: Parse response
      const parseStart = performance.now();
      const result = await uploadResponse.json();
      const parseDuration = (performance.now() - parseStart).toFixed(2);
      console.log(`[STT_API] 📄 Response parsed in ${parseDuration}ms`);

      const totalDuration = (performance.now() - overallStart).toFixed(2);
      console.log(`[STT_API] ✅ Transcription completed in ${totalDuration}ms`);
      console.log('[STT_API] 📊 Result:', {
        transcript_length: result.data.transcript.length,
        confidence: result.data.confidence,
        provider: result.data.provider,
      });

      return result.data;
    } catch (fetchError) {
      clearTimeout(timeoutId);

      // Handle abort error
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('[STT_API] ⏱️  Request aborted after 30s timeout');
        throw new Error('Transcription timeout - server not responding');
      }

      throw fetchError;
    }
  } catch (error) {
    const totalDuration = (performance.now() - overallStart).toFixed(2);
    console.error(`[STT_API] ❌ transcribeAudio error after ${totalDuration}ms:`, error);

    // Enhanced error diagnostics
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      console.error('[STT_API] 🔴 NETWORK ERROR: Cannot reach backend server');
    } else if (error instanceof Error && error.message.includes('timeout')) {
      console.error('[STT_API] ⏱️  TIMEOUT ERROR: Request took too long');
    }

    throw error;
  }
}

/**
 * GET /api/stt/captures/{capture_id}
 * Retrieve capture with signed audio URL (1-hour expiration)
 */
export async function getCapture(captureId: string): Promise<CaptureResponse> {
  try {
    console.log('[STT_API] 📖 Fetching capture:', captureId);

    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/stt/captures/${captureId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 404) {
      throw new Error('Capture not found');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error?.message || errorData?.detail || response.statusText;
      throw new Error(`Failed to fetch capture: ${errorMessage}`);
    }

    const result = await response.json();
    console.log('[STT_API] ✅ Capture fetched:', result.data.id);

    return result.data;
  } catch (error) {
    console.error('[STT_API] ❌ getCapture error:', error);
    throw error;
  }
}

/**
 * DELETE /api/stt/captures/{capture_id}
 * Delete capture (storage + database)
 */
export async function deleteCapture(captureId: string): Promise<void> {
  try {
    console.log('[STT_API] 🗑️  Deleting capture:', captureId);

    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/stt/captures/${captureId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 404) {
      throw new Error('Capture not found');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error?.message || errorData?.detail || response.statusText;
      throw new Error(`Failed to delete capture: ${errorMessage}`);
    }

    console.log('[STT_API] ✅ Capture deleted');
  } catch (error) {
    console.error('[STT_API] ❌ deleteCapture error:', error);
    throw error;
  }
}

/**
 * POST /api/stt/captures/{capture_id}/re-transcribe
 * Re-transcribe audio with different provider
 *
 * Free retry policy:
 * - First re-transcription is complementary
 * - Subsequent retries count against daily limit
 */
export async function retranscribeCapture(
  captureId: string,
  provider?: 'assemblyai' | 'whisper'
): Promise<CaptureResponse> {
  try {
    console.log('[STT_API] 🔄 Re-transcribing capture:', captureId, { provider });

    const token = await getAuthToken();

    const formData = new FormData();
    if (provider) {
      formData.append('provider', provider);
    }

    const response = await fetch(`${API_BASE_URL}/api/stt/captures/${captureId}/re-transcribe`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (response.status === 404) {
      throw new Error('Capture not found');
    }

    if (response.status === 503) {
      throw new Error('Re-transcription failed - all providers unavailable');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error?.message || errorData?.detail || response.statusText;
      throw new Error(`Failed to re-transcribe: ${errorMessage}`);
    }

    const result = await response.json();
    console.log('[STT_API] ✅ Capture re-transcribed');

    return result.data;
  } catch (error) {
    console.error('[STT_API] ❌ retranscribeCapture error:', error);
    throw error;
  }
}

// Export as namespace
export const sttApi = {
  transcribeAudio,
  getCapture,
  deleteCapture,
  retranscribeCapture,
};
