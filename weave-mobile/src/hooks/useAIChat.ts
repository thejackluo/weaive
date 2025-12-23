/**
 * useAIChat - AI Chat API Hook (Story 6.1)
 *
 * NOTE: This is a STUB implementation for Story 6.1 AI Chat Interface.
 * The full implementation will be completed in Story 6.1.
 *
 * This stub exists to satisfy TypeScript compilation for ChatScreen.tsx
 * which was merged from main but is not yet fully functional in story/1.5.3.
 *
 * For AI text generation (Story 1.5.3), use useAITextGeneration instead.
 *
 * Features (when fully implemented in Story 6.1):
 * - Send chat messages with rate limiting
 * - Get usage statistics (tiered: premium/free/monthly)
 * - List conversations
 * - Get conversation details
 * - React Query integration for caching
 */

import { useQuery } from '@tanstack/react-query';

// Types matching backend Pydantic models (Story 6.1)
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
 * Custom hook for AI chat functionality (STUB - Story 6.1)
 */
export function useAIChat() {
  /**
   * Send a chat message (STUB)
   */
  const sendMessage = async ({
    message: _message,
    conversation_id: _conversation_id,
  }: {
    message: string;
    conversation_id?: string;
  }): Promise<ChatMessageResponse> => {
    throw new Error(
      'useAIChat.sendMessage() is not yet implemented. This is a stub for Story 6.1. Use useAITextGeneration for AI text generation (Story 1.5.3).'
    );
  };

  /**
   * Get user's AI usage statistics (STUB with default data)
   */
  const getUsageStats = async (): Promise<UsageStats> => {
    // Return default stats to satisfy TypeScript
    return {
      premium_today: { used: 0, limit: 10 },
      free_today: { used: 0, limit: 3 },
      monthly: { used: 0, limit: 100 },
      tier: 'free',
    };
  };

  /**
   * List user's conversation history (STUB)
   */
  const listConversations = async (): Promise<ConversationSummary[]> => {
    return [];
  };

  /**
   * Get full conversation thread (STUB)
   */
  const getConversation = async (_conversationId: string): Promise<ConversationDetail> => {
    throw new Error(
      'useAIChat.getConversation() is not yet implemented. This is a stub for Story 6.1.'
    );
  };

  /**
   * React Query hook for usage stats
   */
  const useUsageStats = () => {
    return useQuery({
      queryKey: ['ai-usage-stats'],
      queryFn: getUsageStats,
      staleTime: 60000, // 1 minute
    });
  };

  return {
    sendMessage,
    getUsageStats,
    listConversations,
    getConversation,
    useUsageStats,
  };
}
