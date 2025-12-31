/**
 * useAIChatStream - Streaming AI Chat Hook (Story 6.1)
 *
 * Features:
 * - Real-time streaming of AI responses via SSE
 * - Character-by-character content updates
 * - Error handling and fallback to non-streaming
 * - Automatic cleanup on unmount
 *
 * NOTE: Uses react-native-sse for proper React Native SSE support
 */

import React, { useState, useRef, useCallback } from 'react';
// ✅ FIX: react-native-sse exports EventSource as default, not named export
import EventSource from 'react-native-sse';
import { useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { getAccessToken } from '@/services/secureStorage';

export interface StreamChunk {
  type: 'chunk' | 'metadata' | 'done' | 'error' | 'tool_start' | 'tool_result' | 'tool_error';
  content?: string;
  message_id?: string;
  conversation_id?: string;
  response_id?: string;
  tokens_used?: number;
  cost_usd?: number;
  code?: string;
  message?: string;
  // Tool execution fields
  tool_name?: string;
  tool_input?: any;
  tool_result?: any;
  tool_error?: string;
}

export interface ToolExecution {
  toolName: string;
  status: 'starting' | 'running' | 'completed' | 'error';
  input?: any;
  result?: any;
  error?: string;
  timestamp: number;
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
  toolExecutions: ToolExecution[];
  currentTool: ToolExecution | null;
  cancelStream: () => void;
}

export function useAIChatStream(): UseAIChatStreamReturn {
  const queryClient = useQueryClient();
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<{
    messageId?: string;
    conversationId?: string;
    responseId?: string;
    tokensUsed?: number;
  }>({});
  const [toolExecutions, setToolExecutions] = useState<ToolExecution[]>([]);
  const [currentTool, setCurrentTool] = useState<ToolExecution | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

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
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
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
        setToolExecutions([]);
        setCurrentTool(null);
        setIsStreaming(true);

        // Create AbortController for cancellation support
        abortControllerRef.current = new AbortController();

        // Set 60-second timeout for streaming request
        timeoutIdRef.current = setTimeout(() => {
          if (__DEV__) console.log('[STREAM_TIMEOUT] ⏱️ 60s timeout reached, aborting stream');
          cleanup();
          setError('Request timed out after 60 seconds. Please try again.');
          setIsStreaming(false);
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
        // ✅ FIX: Use public getter instead of @ts-ignore
        const adminKey = apiClient.getAdminKey();
        if (adminKey) {
          headers['X-Admin-Key'] = adminKey;
          if (__DEV__) console.log('[STREAM_DEBUG] 🔑 Admin key added to headers');
        } else {
          if (__DEV__) console.log('[STREAM_DEBUG] ⚠️ No admin key found');
        }

        if (__DEV__) console.log('[STREAM_DEBUG] 📤 Sending headers:', Object.keys(headers));

        // ✅ Use EventSource from react-native-sse for proper React Native SSE support
        if (__DEV__)
          console.log('[STREAM_DEBUG] 🚀 Setting up EventSource with react-native-sse...');

        // Create EventSource-compatible URL with POST data as query params for SSE
        const sseUrl = `${baseURL}/api/ai-chat/messages/stream`;

        // Create EventSource instance
        eventSourceRef.current = new EventSource(sseUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            message,
            conversation_id: conversationId || null,
            include_context: true, // Story 6.2: Enable context building
            enable_tools: true, // Story 6.2: Enable tool calling
          }),
        });

        // Handle incoming messages
        eventSourceRef.current.addEventListener('message', (event: any) => {
          try {
            if (__DEV__) console.log('[STREAM_DEBUG] 📨 Received SSE event:', event.data);
            const chunk: StreamChunk = JSON.parse(event.data as string);

            if (chunk.type === 'metadata') {
              // Store message and conversation IDs
              setMetadata((prev) => ({
                ...prev,
                messageId: chunk.message_id,
                conversationId: chunk.conversation_id,
              }));
            } else if (chunk.type === 'tool_start') {
              // Tool execution started
              const toolExec: ToolExecution = {
                toolName: chunk.tool_name || 'unknown',
                status: 'starting',
                input: chunk.tool_input,
                timestamp: Date.now(),
              };
              setCurrentTool(toolExec);
              setToolExecutions((prev) => [...prev, toolExec]);
              if (__DEV__) console.log('[TOOL_EXEC] 🔧 Tool started:', toolExec.toolName);
            } else if (chunk.type === 'tool_result') {
              // Tool execution completed
              const toolName = chunk.tool_name;
              if (toolName) {
                // Update tool executions array - find most recent tool with matching name
                setToolExecutions((prev) => {
                  const toolIndex = prev.findIndex(
                    (t) => t.toolName === toolName && t.status === 'starting'
                  );
                  if (toolIndex >= 0) {
                    const updated = [...prev];
                    const completedTool = {
                      ...prev[toolIndex],
                      status: 'completed' as const,
                      result: chunk.tool_result,
                    };
                    updated[toolIndex] = completedTool;

                    // Show completed state in indicator
                    setCurrentTool(completedTool);

                    // Auto-clear after 2.5 seconds so user sees success state
                    setTimeout(() => {
                      setCurrentTool(null);
                    }, 2500);

                    return updated;
                  }
                  return prev;
                });

                if (__DEV__)
                  console.log('[TOOL_EXEC] ✅ Tool completed:', toolName, chunk.tool_result);

                // ✅ Invalidate relevant caches to update app state
                if (toolName === 'modify_identity_document') {
                  queryClient.invalidateQueries({ queryKey: ['identity-doc'] });
                  if (__DEV__) console.log('[CACHE] 🔄 Invalidated identity-doc cache');
                } else if (toolName === 'modify_personality') {
                  queryClient.invalidateQueries({ queryKey: ['personality'] });
                  if (__DEV__) console.log('[CACHE] 🔄 Invalidated personality cache');
                }
              }
            } else if (chunk.type === 'tool_error') {
              // Tool execution failed
              const toolName = chunk.tool_name;
              if (toolName) {
                // Update tool executions array - find most recent tool with matching name
                setToolExecutions((prev) => {
                  const toolIndex = prev.findIndex(
                    (t) => t.toolName === toolName && t.status === 'starting'
                  );
                  if (toolIndex >= 0) {
                    const updated = [...prev];
                    const errorTool = {
                      ...prev[toolIndex],
                      status: 'error' as const,
                      error: chunk.tool_error || 'Unknown tool error',
                    };
                    updated[toolIndex] = errorTool;

                    // Show error state in indicator
                    setCurrentTool(errorTool);

                    // Auto-clear after 3 seconds so user sees error state
                    setTimeout(() => {
                      setCurrentTool(null);
                    }, 3000);

                    return updated;
                  }
                  return prev;
                });

                if (__DEV__) console.log('[TOOL_EXEC] ❌ Tool failed:', toolName, chunk.tool_error);
              }
            } else if (chunk.type === 'chunk') {
              // Append content chunk
              if (chunk.content) {
                setStreamingContent((prev) => prev + chunk.content);
              }
            } else if (chunk.type === 'done') {
              // ✅ FIX: Clear timeout on successful completion
              if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current);
                timeoutIdRef.current = null;
              }

              // Stream complete, store final metadata
              setMetadata((prev) => ({
                ...prev,
                responseId: chunk.response_id,
                tokensUsed: chunk.tokens_used,
              }));

              // Close EventSource first, then update state
              if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
              }
              setIsStreaming(false);

              if (__DEV__) console.log('[STREAM_DEBUG] ✅ Stream completed, cleaned up');
            } else if (chunk.type === 'error') {
              // ✅ FIX: Clear timeout on error
              if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current);
                timeoutIdRef.current = null;
              }

              // Handle error event
              setError(chunk.message || 'Unknown error occurred');

              // Close EventSource first, then update state
              if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
              }
              setIsStreaming(false);

              if (__DEV__) console.log('[STREAM_DEBUG] ❌ Stream error, cleaned up');
            }
          } catch (parseError) {
            if (__DEV__)
              console.error('[STREAM_DEBUG] Failed to parse SSE event:', parseError, event.data);
          }
        });

        // Handle EventSource errors
        eventSourceRef.current.addEventListener('error', (error) => {
          if (__DEV__) console.error('[STREAM_DEBUG] EventSource error:', error);
          setError('Connection error - please try again');
          setIsStreaming(false);
          eventSourceRef.current?.close();
        });

        // Handle EventSource open
        eventSourceRef.current.addEventListener('open', () => {
          if (__DEV__) console.log('[STREAM_DEBUG] ✅ EventSource connection opened');
        });
      } catch (err: any) {
        // Handle errors and clean up
        if (err.name === 'AbortError') {
          if (__DEV__) console.log('Stream cancelled by user or timed out');
          // Error already set if timeout, otherwise user cancellation
        } else {
          if (__DEV__) console.error('Streaming error:', err);
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
    toolExecutions,
    currentTool,
    cancelStream,
  };
}
