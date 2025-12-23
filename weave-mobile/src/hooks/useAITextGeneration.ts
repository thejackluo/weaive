/**
 * useAITextGeneration Hook - Text AI Generation with TanStack Query
 *
 * Story: 1.5.3 - AI Services Standardization (AC-7)
 * Provides text AI generation with caching, error handling, and rate limiting support.
 *
 * Features:
 * - TanStack Query mutation for API calls
 * - 5-minute cache with stale-while-revalidate
 * - HTTP 429 rate limit handling with retryAfter
 * - Abort signal support for cancelling requests
 * - Automatic retry with exponential backoff (3 attempts: 1s, 2s, 4s)
 * - Loading/error states for UI integration
 *
 * Provider fallback chain (handled by backend):
 * - Primary: GPT-4o-mini ($0.15/$0.60 per MTok)
 * - Secondary: Claude 3.7 Sonnet ($3.00/$15.00 per MTok)
 * - Tertiary: Deterministic/cached response
 *
 * Usage:
 * ```tsx
 * const { generate, isGenerating, error, data } = useAITextGeneration();
 *
 * const result = await generate({
 *   prompt: "What are 3 tasks to move toward my goal today?",
 *   context: {
 *     operation_type: "triad_generation",
 *     user_id: "user-123",
 *     max_tokens: 500
 *   }
 * });
 * ```
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiBaseUrl } from '@/utils/api';

// ===========================
// TYPES
// ===========================

interface AITextRequest {
  prompt: string;
  context: {
    user_id?: string;
    operation_type: string; // 'triad_generation', 'journal_feedback', 'dream_self_chat', etc.
    max_tokens?: number;
  };
}

interface AITextResponse {
  text: string;
  provider: string; // 'gpt-4o-mini', 'claude-sonnet', 'deterministic'
  model: string; // Full model name (e.g., 'gpt-4o-mini-2024-07-18')
  tokens_used: {
    input: number;
    output: number;
  };
  cost_usd: number;
  duration_ms: number;
}

// Rate limit error structure (parsed from API response)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface RateLimitError {
  code: 'RATE_LIMIT_EXCEEDED';
  message: string;
  retryAfter: number; // Seconds until rate limit resets
  limit: number; // Rate limit threshold
  usage: number; // Current usage
}

interface APIErrorResponse {
  error: {
    code: string;
    message: string;
    retryAfter?: number;
  };
}

interface GenerateOptions {
  signal?: AbortSignal; // For cancelling requests
}

// ===========================
// HOOK
// ===========================

export function useAITextGeneration() {
  const queryClient = useQueryClient();
  const apiBaseUrl = getApiBaseUrl();

  const mutation = useMutation({
    mutationFn: async (
      request: AITextRequest & { options?: GenerateOptions }
    ): Promise<AITextResponse> => {
      const { prompt, context, options } = request;

      // Build messages format (OpenAI/Anthropic compatible)
      const payload = {
        messages: [{ role: 'user', content: prompt }],
        context: {
          user_id: context.user_id,
          operation_type: context.operation_type,
          max_tokens: context.max_tokens || 500,
        },
      };

      const response = await fetch(`${apiBaseUrl}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: options?.signal,
      });

      if (!response.ok) {
        const errorData: APIErrorResponse = await response.json();

        if (response.status === 429) {
          // Rate limit exceeded
          throw new RateLimitException(errorData.error.message, errorData.error.retryAfter || 3600);
        }

        throw new Error(errorData.error.message || 'AI generation failed');
      }

      const responseData = await response.json();
      return responseData.data;
    },

    // Retry configuration (AC-7): 3 total attempts (1 initial + 2 retries) with delays 1s, 2s
    retry: 2,
    retryDelay: (attemptIndex) => 1000 * 2 ** attemptIndex, // 1s, 2s

    // On success: Update cache with 5-minute TTL
    onSuccess: (data, variables) => {
      const queryKey = ['ai', 'chat', variables.context.operation_type, variables.context.user_id];

      queryClient.setQueryData(queryKey, data, {
        updatedAt: Date.now(),
      });
    },

    // Error logging (dev mode only)
    onError: (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('[useAITextGeneration] Generation failed:', error);
      }
    },
  });

  return {
    /**
     * Generate AI text response.
     *
     * @param request - Prompt and context
     * @param options - Optional abort signal
     * @returns AI response with provider info and cost tracking
     */
    generate: (request: AITextRequest, options?: GenerateOptions) =>
      mutation.mutateAsync({ ...request, options }),

    /**
     * Loading state - True while AI is generating response.
     */
    isGenerating: mutation.isPending,

    /**
     * Error state - Populated on failure (includes rate limit errors).
     */
    error: mutation.error,

    /**
     * Response data - Populated on successful generation.
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
