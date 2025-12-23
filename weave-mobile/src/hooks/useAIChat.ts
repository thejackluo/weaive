/**
 * useAIChat - AI Chat API Hook (Story 6.1)
 *
 * Features:
 * - Send chat messages with rate limiting
 * - Get usage statistics (tiered: premium/free/monthly)
 * - List conversations
 * - Get conversation details
 * - React Query integration for caching
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';

// Types matching backend Pydantic models
interface ChatMessageResponse {
  message_id: string;
  response: string;
  response_id: string;
  conversation_id: string;
  tokens_used: number;
}

interface UsageStats {
  premium_today: { used: number; limit: number };
  free_today: { used: number; limit: number };
  monthly: { used: number; limit: number };
  tier: 'free' | 'pro' | 'admin';
}

interface ConversationSummary {
  id: string;
  started_at: string;
  last_message_at: string;
  initiated_by: 'user' | 'system';
  last_message_preview: string;
}

interface ConversationDetail {
  id: string;
  started_at: string;
  last_message_at: string;
  initiated_by: 'user' | 'system';
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    created_at: string;
    tokens_used?: number;
  }>;
}

/**
 * Custom hook for AI chat functionality
 */
export function useAIChat() {
  const queryClient = useQueryClient();

  /**
   * Send a chat message
   */
  const sendMessage = async ({
    message,
    conversation_id,
  }: {
    message: string;
    conversation_id?: string;
  }): Promise<ChatMessageResponse> => {
    const response = await apiClient.post<{ data: ChatMessageResponse }>('/api/ai-chat/messages', {
      message,
      conversation_id,
    });

    return response.data.data;
  };

  /**
   * Get user's AI usage statistics
   */
  const getUsageStats = async (): Promise<UsageStats> => {
    const response = await apiClient.get<{ data: UsageStats }>('/api/ai/usage');
    return response.data.data;
  };

  /**
   * List user's conversation history
   */
  const listConversations = async (): Promise<ConversationSummary[]> => {
    const response = await apiClient.get<{ data: ConversationSummary[] }>(
      '/api/ai-chat/conversations'
    );
    return response.data.data;
  };

  /**
   * Get full conversation thread
   */
  const getConversation = async (conversationId: string): Promise<ConversationDetail> => {
    const response = await apiClient.get<{ data: ConversationDetail }>(
      `/api/ai-chat/conversations/${conversationId}`
    );
    return response.data.data;
  };

  /**
   * Query: List conversations
   */
  const conversationsQuery = useQuery({
    queryKey: ['ai-chat-conversations'],
    queryFn: listConversations,
    staleTime: 30000, // 30 seconds
  });

  /**
   * Query: Get specific conversation
   */
  const useConversation = (conversationId: string) => {
    return useQuery({
      queryKey: ['ai-chat-conversation', conversationId],
      queryFn: () => getConversation(conversationId),
      enabled: !!conversationId,
    });
  };

  return {
    // Mutations
    sendMessage,

    // Queries
    getUsageStats,
    listConversations,
    getConversation,

    // Query hooks
    conversations: conversationsQuery.data,
    isLoading: conversationsQuery.isLoading,
    useConversation,

    // Utils
    invalidateConversations: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-chat-conversations'] });
    },
    invalidateUsage: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-usage'] });
    },
  };
}
