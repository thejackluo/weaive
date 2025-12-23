/**
 * useImageAnalysis Hook - Image AI Analysis with TanStack Query
 *
 * Story: 1.5.3 - AI Services Standardization (AC-7)
 * Provides image analysis with proof validation, OCR, and content classification.
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
 * - Primary: Gemini 3.0 Flash (~$0.0005/image)
 * - Secondary: GPT-4o Vision (~$0.02/image)
 * - Tertiary: Store image without analysis (graceful degradation)
 *
 * Usage:
 * ```tsx
 * const { analyze, isAnalyzing, error, data } = useImageAnalysis();
 *
 * const result = await analyze({
 *   imageUri: "file:///path/to/image.jpg",
 *   operations: ["proof_validation", "ocr"],
 *   bindDescription: "Workout at the gym with weights"
 * });
 * ```
 */

import { useMutation } from '@tanstack/react-query';
import { getApiBaseUrl } from '@/utils/api';

// ===========================
// TYPES
// ===========================

interface ImageAnalysisRequest {
  imageUri: string; // Local file URI or HTTP URL
  operations: ('proof_validation' | 'ocr' | 'classification')[];
  bindDescription?: string; // Expected content description for validation
  maxTokens?: number;
}

interface CategoryScore {
  label: 'gym' | 'food' | 'outdoor' | 'workspace' | 'social' | 'other';
  confidence: number; // 0.0-1.0
}

interface ImageAnalysisResponse {
  proof_validated: boolean;
  quality_score: number; // 1-5 rating (1=poor, 5=excellent)
  extracted_text: string | null;
  categories: CategoryScore[];
  analysis: string; // AI-generated description
  provider: string; // 'gemini-3-flash' or 'gpt-4o-vision'
  cost_usd: number;
  duration_ms: number;
}

// Rate limit error structure (parsed from API response)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface RateLimitError {
  code: 'RATE_LIMIT_EXCEEDED';
  message: string;
  retryAfter: number; // Seconds until rate limit resets
  limit: number; // Rate limit threshold (5 images/day)
  usage: number; // Current usage
}

interface APIErrorResponse {
  error: {
    code: string;
    message: string;
    retryAfter?: number;
  };
}

interface AnalyzeOptions {
  signal?: AbortSignal; // For cancelling requests
}

// ===========================
// HOOK
// ===========================

export function useImageAnalysis() {
  const apiBaseUrl = getApiBaseUrl();

  const mutation = useMutation({
    mutationFn: async (
      request: ImageAnalysisRequest & { options?: AnalyzeOptions }
    ): Promise<ImageAnalysisResponse> => {
      const { imageUri, operations, bindDescription, maxTokens, options } = request;

      // Convert local file URI to base64 (required for API)
      let imageData: string;
      if (imageUri.startsWith('http')) {
        // HTTP URL - pass directly
        imageData = imageUri;
      } else {
        // Local file - convert to base64
        const base64 = await convertLocalImageToBase64(imageUri);
        imageData = `data:image/jpeg;base64,${base64}`;
      }

      const payload = {
        image_url: imageData,
        prompt: bindDescription
          ? `Analyze this proof image. Expected content: ${bindDescription}`
          : 'Analyze this image and extract relevant information.',
        operations,
        max_tokens: maxTokens || 300,
      };

      const response = await fetch(`${apiBaseUrl}/api/captures/images/analyze`, {
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
            errorData.error.message,
            errorData.error.retryAfter || 86400 // Default: 1 day
          );
        }

        throw new Error(errorData.error.message || 'Image analysis failed');
      }

      const responseData = await response.json();
      return responseData.data;
    },

    // Retry configuration (AC-7)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // 1s, 2s, 4s

    // NO CACHING - each image is unique (AC-7)
    // TanStack Query default: no cache for mutations

    // Error logging (dev mode only)
    onError: (error) => {
      if (__DEV__) {
        console.error('[useImageAnalysis] Analysis failed:', error);
      }
    },
  });

  return {
    /**
     * Analyze image with AI providers.
     *
     * @param request - Image URI, operations, and context
     * @param options - Optional abort signal
     * @returns AI analysis with validation, OCR, and categories
     */
    analyze: (request: ImageAnalysisRequest, options?: AnalyzeOptions) =>
      mutation.mutateAsync({ ...request, options }),

    /**
     * Loading state - True while AI is analyzing image.
     */
    isAnalyzing: mutation.isPending,

    /**
     * Error state - Populated on failure (includes rate limit errors).
     */
    error: mutation.error,

    /**
     * Analysis data - Populated on successful analysis.
     */
    data: mutation.data,

    /**
     * Reset hook state (clear error/data).
     */
    reset: mutation.reset,
  };
}

// ===========================
// UTILITIES
// ===========================

/**
 * Convert local image URI to base64 string.
 *
 * @param imageUri - Local file URI (e.g., "file:///path/to/image.jpg")
 * @returns Base64-encoded image string
 */
async function convertLocalImageToBase64(imageUri: string): Promise<string> {
  const response = await fetch(imageUri);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64String = base64.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
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
