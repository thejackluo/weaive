/**
 * ChatScreen - Main AI Chat Interface (Story 6.1)
 *
 * Features:
 * - Full chat interface with message history
 * - Streaming AI responses with typing indicator
 * - Quick action chips for common prompts
 * - Rate limiting UI with usage indicators
 * - World-class UX: animations, glassmorphism, haptics
 * - Server-initiated conversation support
 */

import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeIn, FadeInDown, SlideInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import MessageBubble from './MessageBubble';
import QuickActionChips from './QuickActionChips';
import MessageInput from './MessageInput';
import RateLimitIndicator from './RateLimitIndicator';
import TypingIndicator from './TypingIndicator';
import { useAIChat } from '@/hooks/useAIChat';
import { useAIChatStream } from '@/hooks/useAIChatStream';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showQuickChips, setShowQuickChips] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(undefined);
  const scrollViewRef = useRef<ScrollView>(null);
  const streamingMessageIdRef = useRef<string | null>(null);

  // Custom hook for AI chat API (non-streaming fallback)
  const { getUsageStats } = useAIChat();

  // Custom hook for streaming AI responses
  const {
    sendStreamingMessage,
    streamingContent,
    isStreaming,
    error: streamError,
    metadata: streamMetadata,
  } = useAIChatStream();

  // Fetch usage stats
  const { data: usageStats, refetch: refetchUsage } = useQuery({
    queryKey: ['ai-usage'],
    queryFn: getUsageStats,
    refetchInterval: 60000, // Refetch every minute
  });

  // Initial greeting on mount
  useEffect(() => {
    loadInitialGreeting();
  }, []);

  const loadInitialGreeting = () => {
    const hour = new Date().getHours();
    let greeting = '';

    if (hour < 12) {
      greeting = "Good morning! I'm Weave, your AI coach. How can I help you make today count?";
    } else if (hour < 17) {
      greeting = "Hey there! Ready to crush your goals today? What's on your mind?";
    } else {
      greeting =
        "Evening! Let's reflect on your day and plan for tomorrow. What would you like to talk about?";
    }

    const initialMessage: Message = {
      id: 'initial-greeting',
      role: 'assistant',
      content: greeting,
      timestamp: new Date(),
    };

    setMessages([initialMessage]);
  };

  // Effect: Update conversation ID as soon as metadata arrives (prevents desync)
  useEffect(() => {
    if (streamMetadata.conversationId && !currentConversationId) {
      setCurrentConversationId(streamMetadata.conversationId);
    }
  }, [streamMetadata.conversationId, currentConversationId]);

  // Effect: Update streaming message in real-time
  useEffect(() => {
    if (isStreaming && streamingContent) {
      // Create or update streaming message
      const streamingMessageId =
        streamingMessageIdRef.current || `assistant-streaming-${Date.now()}`;
      streamingMessageIdRef.current = streamingMessageId;

      setMessages((prev) => {
        const existingIndex = prev.findIndex((m) => m.id === streamingMessageId);

        const streamingMessage: Message = {
          id: streamingMessageId,
          role: 'assistant',
          content: streamingContent,
          timestamp: new Date(),
          isStreaming: true,
        };

        if (existingIndex >= 0) {
          // Update existing streaming message
          const updated = [...prev];
          updated[existingIndex] = streamingMessage;
          return updated;
        } else {
          // Add new streaming message
          return [...prev, streamingMessage];
        }
      });

      // Auto-scroll as content streams in
      scrollToBottom();
    }
  }, [streamingContent, isStreaming]);

  // Effect: Finalize streaming message when complete
  useEffect(() => {
    if (!isStreaming && streamingMessageIdRef.current && streamingContent) {
      // Mark message as complete (not streaming)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamingMessageIdRef.current
            ? { ...m, isStreaming: false, id: streamMetadata.responseId || m.id }
            : m
        )
      );

      // Update conversation ID
      if (streamMetadata.conversationId) {
        setCurrentConversationId(streamMetadata.conversationId);
      }

      // Refetch usage stats
      refetchUsage();

      // Haptic feedback on completion
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Reset streaming message ref
      streamingMessageIdRef.current = null;
    }
  }, [isStreaming, streamingContent, streamMetadata, refetchUsage]);

  // Effect: Handle streaming errors
  useEffect(() => {
    if (streamError) {
      console.error('Streaming error:', streamError);

      // Show error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: streamError || 'Sorry, I encountered an issue. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => {
        // Remove streaming message if exists
        const filtered = prev.filter((m) => m.id !== streamingMessageIdRef.current);
        return [...filtered, errorMessage];
      });

      // Reset refs
      streamingMessageIdRef.current = null;
    }
  }, [streamError]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Hide quick chips when user sends message
    setShowQuickChips(false);

    // Add user message to chat
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Clear input
    setInputValue('');

    // Haptic feedback on send
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Scroll to bottom
    setTimeout(() => scrollToBottom(), 100);

    // Send to API with streaming
    try {
      await sendStreamingMessage(text.trim(), currentConversationId);
    } catch (error) {
      console.error('Failed to send streaming message:', error);
    }
  };

  const handleQuickAction = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  // Check if rate limited
  const isRateLimited = usageStats
    ? (usageStats.premium_today.used >= usageStats.premium_today.limit &&
        usageStats.free_today.used >= usageStats.free_today.limit) ||
      usageStats.monthly.used >= usageStats.monthly.limit
    : false;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Rate Limit Indicator */}
      {usageStats && (
        <Animated.View entering={FadeInDown.duration(300)}>
          <RateLimitIndicator
            premiumUsed={usageStats.premium_today.used}
            premiumLimit={usageStats.premium_today.limit}
            freeUsed={usageStats.free_today.used}
            freeLimit={usageStats.free_today.limit}
            monthlyUsed={usageStats.monthly.used}
            monthlyLimit={usageStats.monthly.limit}
            isRateLimited={isRateLimited}
          />
        </Animated.View>
      )}

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={scrollToBottom}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <Animated.View
            key={message.id}
            style={{ width: '100%' }} // ✅ Force full width
            entering={
              message.role === 'user'
                ? SlideInUp.duration(300).springify()
                : FadeIn.duration(400).delay(200)
            }
          >
            <MessageBubble message={message} />
          </Animated.View>
        ))}

        {/* Typing Indicator (only show before content starts streaming) */}
        {isStreaming && !streamingContent && (
          <Animated.View entering={FadeIn.duration(300)}>
            <TypingIndicator />
          </Animated.View>
        )}
      </ScrollView>

      {/* Quick Action Chips */}
      {showQuickChips && !isRateLimited && (
        <Animated.View entering={FadeInDown.duration(300)}>
          <QuickActionChips onAction={handleQuickAction} />
        </Animated.View>
      )}

      {/* Message Input */}
      <MessageInput
        value={inputValue}
        onChangeText={setInputValue}
        onSend={handleSendMessage}
        disabled={isRateLimited || isStreaming}
        placeholder={isRateLimited ? 'Rate limit reached' : 'Talk to Weave...'}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a', // Dark background
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 8, // ✅ Reduced from 16 to give more width to message bubbles
    paddingBottom: 24,
  },
});
