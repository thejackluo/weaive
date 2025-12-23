import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useImageAnalysis } from '../useImageAnalysis';

describe('useImageAnalysis Hook', () => {
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

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('AC-7: React Native Hooks - useImageAnalysis', () => {
    it('should provide analyze function, isAnalyzing state, and error handling', () => {
      const { result } = renderHook(() => useImageAnalysis(), { wrapper });

      expect(result.current.analyze).toBeDefined();
      expect(typeof result.current.analyze).toBe('function');
      expect(result.current.isAnalyzing).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should set isAnalyzing to true while calling image AI API', async () => {
      const { result } = renderHook(() => useImageAnalysis(), { wrapper });

      const analyzePromise = result.current.analyze({
        imageUri: 'file:///path/to/image.jpg',
        operations: ['proof_validation'],
      });

      expect(result.current.isAnalyzing).toBe(true);

      await waitFor(() => expect(result.current.isAnalyzing).toBe(false));
    });

    it('should return image analysis with proof validation and quality score', async () => {
      const { result } = renderHook(() => useImageAnalysis(), { wrapper });

      await result.current.analyze({
        imageUri: 'file:///path/to/workout.jpg',
        operations: ['proof_validation', 'ocr'],
      });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
        expect(result.current.data?.proof_validated).toBe(true);
        expect(result.current.data?.quality_score).toBeGreaterThanOrEqual(0);
        expect(result.current.data?.provider).toMatch(/gemini|gpt-4o-vision/);
        expect(result.current.data?.cost_usd).toBeGreaterThan(0);
      });
    });

    it('should extract text with OCR operation', async () => {
      const { result } = renderHook(() => useImageAnalysis(), { wrapper });

      await result.current.analyze({
        imageUri: 'file:///path/to/receipt.jpg',
        operations: ['ocr'],
      });

      await waitFor(() => {
        expect(result.current.data?.extracted_text).toBeTruthy();
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
              message: 'Daily limit reached (5/5 images)',
              retryAfter: 43200,
              limit: 5,
              usage: 5,
            },
          }),
        } as Response)
      );

      const { result } = renderHook(() => useImageAnalysis(), { wrapper });

      await result.current.analyze({
        imageUri: 'file:///image.jpg',
        operations: ['proof_validation'],
      });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
        expect(result.current.error?.message).toContain('limit');
      });
    });

    it('should NOT cache image analysis results (unique inputs)', () => {
      const { result } = renderHook(() => useImageAnalysis(), { wrapper });

      const cachedData = queryClient.getQueryData(['ai', 'image', 'file:///image.jpg']);

      expect(cachedData).toBeUndefined();
    });

    it('should fallback from Gemini to GPT-4o Vision on primary failure', async () => {
      let callCount = 0;
      global.fetch = jest.fn(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: async () => ({ error: { message: 'Gemini unavailable' } }),
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              proof_validated: true,
              quality_score: 8,
              provider: 'gpt-4o-vision',
              cost_usd: 0.02,
            },
          }),
        } as Response);
      });

      const { result } = renderHook(() => useImageAnalysis(), { wrapper });

      await result.current.analyze({
        imageUri: 'file:///image.jpg',
        operations: ['proof_validation'],
      });

      await waitFor(() => {
        expect(result.current.data?.provider).toBe('gpt-4o-vision');
      });
    });

    it('should support multiple operations in single request', async () => {
      const { result } = renderHook(() => useImageAnalysis(), { wrapper });

      await result.current.analyze({
        imageUri: 'file:///complex.jpg',
        operations: ['proof_validation', 'ocr', 'classification'],
      });

      await waitFor(() => {
        expect(result.current.data?.proof_validated).toBeDefined();
        expect(result.current.data?.extracted_text).toBeDefined();
        expect(result.current.data?.categories).toBeDefined();
      });
    });

    it('should support abort signal for cancelling analysis', async () => {
      const abortController = new AbortController();

      const { result } = renderHook(() => useImageAnalysis(), { wrapper });

      const analyzePromise = result.current.analyze(
        {
          imageUri: 'file:///large-image.jpg',
          operations: ['proof_validation', 'ocr'],
        },
        { signal: abortController.signal }
      );

      abortController.abort();

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
        expect(result.current.error?.name).toBe('AbortError');
      });
    });
  });
});
