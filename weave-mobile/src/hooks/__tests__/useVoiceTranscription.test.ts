import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useVoiceTranscription } from '../useVoiceTranscription';

describe('useVoiceTranscription Hook', () => {
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

  describe('AC-7: React Native Hooks - useVoiceTranscription', () => {
    it('should provide transcribe function, isTranscribing state, and error handling', () => {
      const { result } = renderHook(() => useVoiceTranscription(), { wrapper });

      expect(result.current.transcribe).toBeDefined();
      expect(typeof result.current.transcribe).toBe('function');
      expect(result.current.isTranscribing).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should set isTranscribing to true while calling STT API', async () => {
      const { result } = renderHook(() => useVoiceTranscription(), { wrapper });

      const transcribePromise = result.current.transcribe({
        audioUri: 'file:///path/to/audio.m4a',
        language: 'en',
      });

      expect(result.current.isTranscribing).toBe(true);

      await waitFor(() => expect(result.current.isTranscribing).toBe(false));
    });

    it('should return transcript with confidence and duration', async () => {
      const { result } = renderHook(() => useVoiceTranscription(), { wrapper });

      await result.current.transcribe({
        audioUri: 'file:///voice-note.m4a',
        language: 'en',
      });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
        expect(result.current.data?.transcript).toBeTruthy();
        expect(result.current.data?.confidence).toBeGreaterThan(0);
        expect(result.current.data?.confidence).toBeLessThanOrEqual(1);
        expect(result.current.data?.duration_sec).toBeGreaterThan(0);
        expect(result.current.data?.provider).toMatch(/assemblyai|whisper/);
        expect(result.current.data?.cost_usd).toBeGreaterThan(0);
      });
    });

    it('should include word count in response', async () => {
      const { result } = renderHook(() => useVoiceTranscription(), { wrapper });

      await result.current.transcribe({
        audioUri: 'file:///long-recording.m4a',
        language: 'en',
      });

      await waitFor(() => {
        expect(result.current.data?.word_count).toBeGreaterThan(0);
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
              message: 'Daily limit reached (50/50 transcriptions)',
              retryAfter: 14400,
              limit: 50,
              usage: 50,
            },
          }),
        } as Response)
      );

      const { result } = renderHook(() => useVoiceTranscription(), { wrapper });

      await result.current.transcribe({
        audioUri: 'file:///audio.m4a',
        language: 'en',
      });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
        expect(result.current.error?.message).toContain('limit');
      });
    });

    it('should NOT cache transcription results (unique inputs)', () => {
      const { result } = renderHook(() => useVoiceTranscription(), { wrapper });

      const cachedData = queryClient.getQueryData(['ai', 'audio', 'file:///audio.m4a']);

      expect(cachedData).toBeUndefined();
    });

    it('should fallback from AssemblyAI to Whisper on primary failure', async () => {
      let callCount = 0;
      global.fetch = jest.fn(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: async () => ({ error: { message: 'AssemblyAI unavailable' } }),
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              transcript: 'Fallback transcription from Whisper',
              confidence: 0.92,
              duration_sec: 30,
              word_count: 45,
              provider: 'whisper',
              cost_usd: 0.003,
            },
          }),
        } as Response);
      });

      const { result } = renderHook(() => useVoiceTranscription(), { wrapper });

      await result.current.transcribe({
        audioUri: 'file:///audio.m4a',
        language: 'en',
      });

      await waitFor(() => {
        expect(result.current.data?.provider).toBe('whisper');
      });
    });

    it('should support language parameter for multilingual transcription', async () => {
      const { result } = renderHook(() => useVoiceTranscription(), { wrapper });

      await result.current.transcribe({
        audioUri: 'file:///spanish-audio.m4a',
        language: 'es',
      });

      await waitFor(() => {
        expect(result.current.data?.transcript).toBeTruthy();
      });
    });

    it('should support abort signal for cancelling transcription', async () => {
      const abortController = new AbortController();

      const { result } = renderHook(() => useVoiceTranscription(), { wrapper });

      const transcribePromise = result.current.transcribe(
        {
          audioUri: 'file:///long-audio.m4a',
          language: 'en',
        },
        { signal: abortController.signal }
      );

      abortController.abort();

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
        expect(result.current.error?.name).toBe('AbortError');
      });
    });

    it('should handle max duration validation', async () => {
      const { result } = renderHook(() => useVoiceTranscription(), { wrapper });

      await result.current.transcribe({
        audioUri: 'file:///very-long-audio.m4a',
        language: 'en',
        maxDurationSec: 300,
      });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });
    });
  });
});
