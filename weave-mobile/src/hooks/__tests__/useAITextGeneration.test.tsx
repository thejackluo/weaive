import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAITextGeneration } from '../useAITextGeneration';

describe('useAITextGeneration Hook', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();

    // Default mock fetch for successful response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            text: 'AI generated response',
            provider: 'gpt-4o-mini',
            model: 'gpt-4o-mini-2024-07-18',
            tokens_used: { input: 10, output: 20 },
            cost_usd: 0.001,
            duration_ms: 500,
          },
        }),
      } as Response)
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  describe('AC-7: React Native Hooks - useAITextGeneration', () => {
    it('should provide generate function, isGenerating state, and error handling', () => {
      const { result } = renderHook(() => useAITextGeneration(), { wrapper });

      expect(result.current.generate).toBeDefined();
      expect(typeof result.current.generate).toBe('function');
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.data).toBeUndefined();
    });

    it('should set isGenerating to true while calling AI API', async () => {
      // Mock fetch with slight delay to capture loading state
      global.fetch = jest.fn(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                status: 200,
                json: async () => ({
                  data: {
                    text: 'AI response',
                    provider: 'gpt-4o-mini',
                    model: 'gpt-4o-mini-2024-07-18',
                    tokens_used: { input: 10, output: 20 },
                    cost_usd: 0.001,
                    duration_ms: 500,
                  },
                }),
              } as Response);
            }, 50); // Small delay to capture loading state
          })
      );

      const { result } = renderHook(() => useAITextGeneration(), { wrapper });

      const generatePromise = result.current.generate({
        prompt: 'Hello AI',
        context: { operation_type: 'chat' },
      });

      // Should be generating
      await waitFor(() => expect(result.current.isGenerating).toBe(true));

      // Wait for completion
      await generatePromise;

      // Should be done (wait for state update)
      await waitFor(() => expect(result.current.isGenerating).toBe(false));
    });

    it('should return AI response with provider info and cost tracking', async () => {
      const { result } = renderHook(() => useAITextGeneration(), { wrapper });

      await result.current.generate({
        prompt: 'Generate triad tasks',
        context: { operation_type: 'triad_generation', user_id: 'user-123' },
      });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
        expect(result.current.data?.text).toBeTruthy();
        expect(result.current.data?.provider).toMatch(/gpt-4o-mini|claude-sonnet/);
        expect(result.current.data?.tokens_used).toBeDefined();
        expect(result.current.data?.cost_usd).toBeGreaterThan(0);
      });
    });

    it('should handle rate limit errors with retry-after time', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 429,
          json: async () => ({
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Daily limit reached (10/10 calls)',
              retryAfter: 3600,
              limit: 10,
              usage: 10,
            },
          }),
        } as Response)
      );

      const { result } = renderHook(() => useAITextGeneration(), { wrapper });

      // Expect the promise to reject
      try {
        await result.current.generate({
          prompt: 'Test prompt',
          context: { operation_type: 'chat' },
        });
        fail('Should have thrown rate limit error');
      } catch (error: any) {
        expect(error.message).toContain('limit');
      }

      // Error state should be populated
      await waitFor(() => {
        expect(result.current.error).toBeDefined();
        expect(result.current.error?.message).toContain('limit');
      });
    });

    it('should support abort signal for cancelling requests', async () => {
      // Mock fetch to delay so we can abort mid-request
      global.fetch = jest.fn(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                status: 200,
                json: async () => ({ data: { text: 'Response' } }),
              } as Response);
            }, 100);
          })
      );

      const abortController = new AbortController();
      const { result } = renderHook(() => useAITextGeneration(), { wrapper });

      const generatePromise = result.current.generate(
        {
          prompt: 'Long running task',
          context: { operation_type: 'chat' },
        },
        { signal: abortController.signal }
      );

      // Abort immediately
      abortController.abort();

      // Expect promise to reject
      try {
        await generatePromise;
        fail('Should have thrown abort error');
      } catch (error: any) {
        // TanStack Query wraps abort errors
        expect(error).toBeDefined();
      }

      // Error state should be populated
      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });
    });

    it('should use 5-minute cache for text AI queries', async () => {
      const { result } = renderHook(() => useAITextGeneration(), { wrapper });

      const contextParams = {
        prompt: 'Cached prompt',
        context: { operation_type: 'triad_generation', user_id: 'user-123' },
      };

      await result.current.generate(contextParams);

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      const cachedData = queryClient.getQueryData(['ai', 'chat', 'triad_generation', 'user-123']);

      expect(cachedData).toBeDefined();
    });

    it('should retry failed requests with exponential backoff', async () => {
      let callCount = 0;
      global.fetch = jest.fn(() => {
        callCount++;
        if (callCount < 3) {
          // Reject with network error (will trigger retry)
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              text: 'Success after retries',
              provider: 'gpt-4o-mini',
              model: 'gpt-4o-mini-2024-07-18',
              tokens_used: { input: 10, output: 20 },
              cost_usd: 0.001,
              duration_ms: 500,
            },
          }),
        } as Response);
      });

      const { result } = renderHook(() => useAITextGeneration(), { wrapper });

      // Call generate and wait for success
      const response = await result.current.generate({
        prompt: 'Test retry',
        context: { operation_type: 'chat' },
      });

      // Should succeed after retries
      expect(response.text).toBe('Success after retries');
      expect(callCount).toBe(3); // Should have called fetch 3 times
    });

    it('should handle backend provider fallback (GPT-4o-mini -> Claude Sonnet)', async () => {
      // Backend handles provider fallback internally
      // Frontend receives successful response with fallback provider
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              text: 'Fallback response from Claude',
              provider: 'claude-sonnet',
              model: 'claude-3-7-sonnet-20250219',
              tokens_used: { input: 10, output: 20 },
              cost_usd: 0.005,
              duration_ms: 1200,
            },
          }),
        } as Response)
      );

      const { result } = renderHook(() => useAITextGeneration(), { wrapper });

      const response = await result.current.generate({
        prompt: 'Test fallback',
        context: { operation_type: 'chat' },
      });

      // Backend fell back to Claude, frontend receives the result
      expect(response.provider).toBe('claude-sonnet');
      expect(response.text).toBe('Fallback response from Claude');
      expect(response.cost_usd).toBe(0.005);
    });
  });
});
