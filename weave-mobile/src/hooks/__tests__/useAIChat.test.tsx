import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAIChat } from '../useAIChat';

describe('useAIChat Hook', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  function wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  describe('AC-7: React Native Hooks - useAIChat', () => {
    it('should provide generate function, isGenerating state, and error handling', () => {
      const { result } = renderHook(() => useAIChat(), { wrapper });

      expect(result.current.generate).toBeDefined();
      expect(typeof result.current.generate).toBe('function');
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.data).toBeUndefined();
    });

    it('should set isGenerating to true while calling AI API', async () => {
      const { result } = renderHook(() => useAIChat(), { wrapper });

      const generatePromise = result.current.generate({
        prompt: 'Hello AI',
        context: { operation_type: 'chat' },
      });

      expect(result.current.isGenerating).toBe(true);

      await waitFor(() => expect(result.current.isGenerating).toBe(false));
    });

    it('should return AI response with provider info and cost tracking', async () => {
      const { result } = renderHook(() => useAIChat(), { wrapper });

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

      const { result } = renderHook(() => useAIChat(), { wrapper });

      await result.current.generate({
        prompt: 'Test prompt',
        context: { operation_type: 'chat' },
      });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
        expect(result.current.error?.message).toContain('limit');
        expect(result.current.data).toBeUndefined();
      });
    });

    it('should support abort signal for cancelling requests', async () => {
      const abortController = new AbortController();

      const { result } = renderHook(() => useAIChat(), { wrapper });

      const generatePromise = result.current.generate(
        {
          prompt: 'Long running task',
          context: { operation_type: 'chat' },
        },
        { signal: abortController.signal }
      );

      abortController.abort();

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
        expect(result.current.error?.name).toBe('AbortError');
      });
    });

    it('should use 5-minute cache for text AI queries', async () => {
      const { result } = renderHook(() => useAIChat(), { wrapper });

      const contextParams = {
        prompt: 'Cached prompt',
        context: { operation_type: 'triad_generation', user_id: 'user-123' },
      };

      await result.current.generate(contextParams);

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      const cachedData = queryClient.getQueryData([
        'ai',
        'chat',
        'triad_generation',
        'user-123',
      ]);

      expect(cachedData).toBeDefined();
    });

    it('should retry failed requests with exponential backoff', async () => {
      let callCount = 0;
      global.fetch = jest.fn(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              text: 'Success after retries',
              provider: 'gpt-4o-mini',
              tokens_used: { input: 10, output: 20 },
              cost_usd: 0.001,
            },
          }),
        } as Response);
      });

      const { result } = renderHook(() => useAIChat(), { wrapper });

      await result.current.generate({
        prompt: 'Test retry',
        context: { operation_type: 'chat' },
      });

      await waitFor(() => {
        expect(result.current.data?.text).toBe('Success after retries');
      });

      expect(callCount).toBe(3);
    });

    it('should fallback from GPT-4o-mini to Claude Sonnet on primary failure', async () => {
      let callCount = 0;
      global.fetch = jest.fn(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: async () => ({ error: { message: 'GPT-4o-mini unavailable' } }),
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              text: 'Fallback response from Claude',
              provider: 'claude-sonnet',
              tokens_used: { input: 10, output: 20 },
              cost_usd: 0.005,
            },
          }),
        } as Response);
      });

      const { result } = renderHook(() => useAIChat(), { wrapper });

      await result.current.generate({
        prompt: 'Test fallback',
        context: { operation_type: 'chat' },
      });

      await waitFor(() => {
        expect(result.current.data?.provider).toBe('claude-sonnet');
      });
    });
  });
});
