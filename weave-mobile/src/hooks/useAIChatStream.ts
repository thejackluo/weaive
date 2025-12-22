/**
 * useAIChatStream - Streaming AI Chat Hook (Story 6.1)
 *
 * Features:
 * - Real-time streaming of AI responses via SSE
 * - Character-by-character content updates
 * - Error handling and fallback to non-streaming
 * - Automatic cleanup on unmount
 *
 * NOTE: React Native doesn't have native EventSource, so we use fetch with streaming
 */

import React, { useState, useRef, useCallback } from 'react';
import apiClient from '@/services/apiClient';
import { getAccessToken } from '@/services/secureStorage';

export interface StreamChunk {
  type: 'chunk' | 'metadata' | 'done' | 'error';
  content?: string;
  message_id?: string;
  conversation_id?: string;
  response_id?: string;
  tokens_used?: number;
  cost_usd?: number;
  code?: string;
  message?: string;
}

export interface UseAIChatStreamReturn {
  sendStreamingMessage: (message: string, conversationId?: string) => Promise<void>;
  streamingContent: string;
  isStreaming: boolean;
  error: string | null;
  metadata: {
    messageId?: string;
    conversationId?: string;
    responseId?: string;
    tokensUsed?: number;
  };
  cancelStream: () => void;
}

export function useAIChatStream(): UseAIChatStreamReturn {
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<{
    messageId?: string;
    conversationId?: string;
    responseId?: string;
    tokensUsed?: number;
  }>({});

  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-clear error after 5 seconds to allow retry
  React.useEffect(() => {
    if (error) {
      const timerId = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timerId);
    }
  }, [error]);

  // Cleanup on unmount to prevent memory leaks
  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  const cleanup = useCallback(() => {
    // Clear all refs to prevent memory leaks
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  }, []);

  const cancelStream = useCallback(() => {
    cleanup();
    setIsStreaming(false);
  }, [cleanup]);

  const sendStreamingMessage = useCallback(
    async (message: string, conversationId?: string) => {
      try {
        // Reset state
        setStreamingContent('');
        setError(null);
        setMetadata({});
        setIsStreaming(true);

        // Create AbortController for cancellation support
        abortControllerRef.current = new AbortController();

        // Set 60-second timeout for streaming request
        timeoutIdRef.current = setTimeout(() => {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setError('Request timed out after 60 seconds. Please try again.');
            setIsStreaming(false);
          }
        }, 60000);

        // Get API base URL and headers from apiClient
        const baseURL = apiClient.defaults.baseURL || '';

        // ✅ FIX: Get JWT token for authentication
        const accessToken = await getAccessToken();
        const headers: Record<string, string> = {
          ...apiClient.defaults.headers.common,
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        };

        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }

        // ✅ Add admin key if available (for unlimited rate limits in dev)
        // @ts-ignore - accessing private property for streaming
        if (apiClient.adminKey) {
          // @ts-ignore
          headers['X-Admin-Key'] = apiClient.adminKey;
          console.log('[STREAM_DEBUG] 🔑 Admin key added to headers:', apiClient.adminKey);
        } else {
          console.log('[STREAM_DEBUG] ⚠️ No admin key found on apiClient');
        }

        console.log('[STREAM_DEBUG] 📤 Sending headers:', Object.keys(headers));

        // Make streaming POST request
        const response = await fetch(`${baseURL}/api/ai-chat/messages/stream`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            message,
            conversation_id: conversationId,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Check if response body is readable
        if (!response.body) {
          throw new Error('Response body is not readable');
        }

        // Read SSE stream
        const reader = response.body.getReader();
        // eslint-disable-next-line no-undef
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          // Decode chunk
          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE events (split by \n\n)
          const events = buffer.split('\n\n');
          buffer = events.pop() || ''; // Keep incomplete event in buffer

          for (const event of events) {
            if (!event.trim() || !event.startsWith('data: ')) {
              continue;
            }

            // Parse JSON from SSE data field
            const jsonStr = event.replace(/^data: /, '');
            try {
              const chunk: StreamChunk = JSON.parse(jsonStr);

              if (chunk.type === 'metadata') {
                // Store message and conversation IDs
                setMetadata((prev) => ({
                  ...prev,
                  messageId: chunk.message_id,
                  conversationId: chunk.conversation_id,
                }));
              } else if (chunk.type === 'chunk') {
                // Append content chunk
                if (chunk.content) {
                  setStreamingContent((prev) => prev + chunk.content);
                }
              } else if (chunk.type === 'done') {
                // Stream complete, store final metadata
                setMetadata((prev) => ({
                  ...prev,
                  responseId: chunk.response_id,
                  tokensUsed: chunk.tokens_used,
                }));
                setIsStreaming(false);
              } else if (chunk.type === 'error') {
                // Handle error event
                setError(chunk.message || 'Unknown error occurred');
                setIsStreaming(false);
                break;
              }
            } catch (parseError) {
              console.error('Failed to parse SSE event:', parseError, jsonStr);
            }
          }
        }

        // Clean up on successful completion
        cleanup();
        setIsStreaming(false);
      } catch (err: any) {
        // Handle errors and clean up
        if (err.name === 'AbortError') {
          console.log('Stream cancelled by user or timed out');
          // Error already set if timeout, otherwise user cancellation
        } else {
          console.error('Streaming error:', err);
          setError(err.message || 'Failed to stream response');
        }
        setIsStreaming(false);
        cleanup();
      }
    },
    [cleanup]
  );

  return {
    sendStreamingMessage,
    streamingContent,
    isStreaming,
    error,
    metadata,
    cancelStream,
  };
}
