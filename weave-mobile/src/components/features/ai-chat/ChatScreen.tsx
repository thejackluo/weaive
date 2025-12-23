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
import { ScrollView, View, StyleSheet, Keyboard, TouchableOpacity, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeIn, FadeInDown, SlideInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import MessageBubble from './MessageBubble';
import QuickActionChips from './QuickActionChips';
import MessageInput from './MessageInput';
import RateLimitIndicator from './RateLimitIndicator';
import TypingIndicator from './TypingIndicator';
import ConversationList, { Conversation } from './ConversationList';
import { useAIChat } from '@/hooks/useAIChat';
import { useAIChatStream } from '@/hooks/useAIChatStream';
import apiClient from '@/services/apiClient';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export default function ChatScreen() {
  // ✅ FIX: Load conversation history from TanStack Query on mount
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showQuickChips, setShowQuickChips] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(undefined);
  const [showConversationList, setShowConversationList] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const streamingMessageIdRef = useRef<string | null>(null);
  const isStreamingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    refetchInterval: 60000,
  });

  // Fetch conversations list
  const {
    data: conversationsData,
    refetch: refetchConversations,
    isRefetching,
  } = useQuery({
    queryKey: ['ai-conversations'],
    queryFn: async () => {
      const response = await apiClient.get('/api/ai-chat/conversations');
      return response.data.data || [];
    },
    refetchOnMount: true,
  });

  const conversations: Conversation[] = conversationsData || [];

  // Load conversation history on mount
  useEffect(() => {
    loadConversationHistory();
  }, []);

  const loadConversationHistory = async () => {
    setIsLoadingHistory(true);
    try {
      if (__DEV__) console.log('[HISTORY] 🔍 Loading conversation history...');

      // Fetch latest conversation from backend
      const response = await apiClient.get('/api/ai-chat/conversations');
      if (__DEV__)
        console.log('[HISTORY] 📦 Response:', JSON.stringify(response.data).substring(0, 200));

      const conversations = response.data.data || [];
      if (__DEV__) console.log('[HISTORY] 📊 Found conversations:', conversations.length);

      if (conversations.length > 0) {
        // Load most recent conversation
        const latestConv = conversations[0];
        setCurrentConversationId(latestConv.id);
        if (__DEV__) console.log('[HISTORY] 🔄 Loading conversation:', latestConv.id);

        try {
          // ✅ FIX: Fetch conversation details which includes messages
          const detailResponse = await apiClient.get(`/api/ai-chat/conversations/${latestConv.id}`);
          if (__DEV__)
            console.log(
              '[HISTORY] 📨 Detail response:',
              JSON.stringify(detailResponse.data).substring(0, 200)
            );

          const conversationDetail = detailResponse.data.data;
          const convMessages = conversationDetail.messages || [];
          if (__DEV__) console.log('[HISTORY] 💬 Loaded messages:', convMessages.length);

          // Transform backend messages to UI format
          const transformedMessages: Message[] = convMessages.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.created_at),
          }));

          if (transformedMessages.length > 0) {
            setMessages(transformedMessages);
            setShowQuickChips(false); // Hide chips if conversation exists
            if (__DEV__)
              console.log('[HISTORY] ✅ Loaded', transformedMessages.length, 'messages into UI');
          } else {
            // ✅ FIX: Don't add greeting to existing empty conversation
            if (__DEV__) console.log('[HISTORY] ⚠️ Empty conversation, keeping blank');
            setShowQuickChips(true);
          }
        } catch (detailError: any) {
          if (__DEV__)
            console.error('[HISTORY] ❌ Failed to load conversation detail:', detailError.message);
          // ✅ FIX: If detail fetch fails, only show greeting if no conversations at all
        }
      } else {
        // ✅ FIX: Only show initial greeting if NO conversations exist
        if (__DEV__) console.log('[HISTORY] 📭 No conversations found, showing greeting');
        loadInitialGreeting();
      }
    } catch (error: any) {
      if (__DEV__) console.error('[HISTORY] ❌ Failed to load conversation list:', error.message);
      // Always fall back to greeting on error
      loadInitialGreeting();
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadInitialGreeting = () => {
    const hour = new Date().getHours();
    let greeting = '';

    if (hour < 12) {
      greeting = "good morning! I'm weave, your AI coach. how can I help you make today count?";
    } else if (hour < 17) {
      greeting = "hey there! ready to crush your goals today? what's on your mind?";
    } else {
      greeting =
        "evening! let's reflect on your day and plan for tomorrow. what would you like to talk about?";
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
    if (streamMetadata.conversationId) {
      // ✅ FIX: Always update conversation ID from metadata
      setCurrentConversationId(streamMetadata.conversationId);
      if (__DEV__) console.log('[CONV] 🆔 Conversation ID set:', streamMetadata.conversationId);
    }
  }, [streamMetadata.conversationId]);

  // ✅ FIX: Cleanup streaming timeout on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      if (isStreamingTimeoutRef.current) {
        clearTimeout(isStreamingTimeoutRef.current);
        isStreamingTimeoutRef.current = null;
      }
    };
  }, []);

  // Effect: Update streaming message in real-time
  useEffect(() => {
    if (isStreaming && streamingContent) {
      // Create or update streaming message
      const streamingMessageId =
        streamingMessageIdRef.current || `assistant-streaming-${Date.now()}`;
      streamingMessageIdRef.current = streamingMessageId;

      if (__DEV__)
        console.log(
          '[STREAM_UPDATE] 📝 Updating message:',
          streamingMessageId,
          '- isStreaming: true'
        );

      // Set failsafe timeout (30s) to force clear isStreaming if stuck
      if (isStreamingTimeoutRef.current) {
        clearTimeout(isStreamingTimeoutRef.current);
      }
      isStreamingTimeoutRef.current = setTimeout(() => {
        if (__DEV__)
          console.log('[STREAM_FAILSAFE] ⚠️ Timeout reached, forcing isStreaming = false');
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingMessageIdRef.current ? { ...m, isStreaming: false } : m
          )
        );
        streamingMessageIdRef.current = null;
      }, 30000);

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
    if (__DEV__)
      console.log(
        '[STREAM_FINALIZE] 🔍 Effect triggered - isStreaming:',
        isStreaming,
        'streamingMessageIdRef:',
        streamingMessageIdRef.current
      );

    if (!isStreaming && streamingMessageIdRef.current) {
      if (__DEV__)
        console.log(
          '[STREAM_FINALIZE] ✅ Finalizing streaming message:',
          streamingMessageIdRef.current
        );

      // Clear failsafe timeout
      if (isStreamingTimeoutRef.current) {
        clearTimeout(isStreamingTimeoutRef.current);
        isStreamingTimeoutRef.current = null;
        if (__DEV__) console.log('[STREAM_FINALIZE] 🧹 Cleared failsafe timeout');
      }

      // Mark message as complete (not streaming)
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === streamingMessageIdRef.current) {
            if (__DEV__)
              console.log(
                '[STREAM_FINALIZE] 🎯 Found message to finalize:',
                m.id,
                '-> isStreaming: false'
              );
            return { ...m, isStreaming: false, id: streamMetadata.responseId || m.id };
          }
          return m;
        })
      );

      // Update conversation ID
      if (streamMetadata.conversationId) {
        setCurrentConversationId(streamMetadata.conversationId);
      }

      // Refetch usage stats and conversations
      refetchUsage();
      refetchConversations();

      // Haptic feedback on completion
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Reset streaming message ref
      streamingMessageIdRef.current = null;
      if (__DEV__) console.log('[STREAM_FINALIZE] 🏁 Finalization complete');
    }
  }, [isStreaming, streamingContent, streamMetadata, refetchUsage, refetchConversations]);

  // Effect: Handle streaming errors
  useEffect(() => {
    if (streamError) {
      if (__DEV__) console.error('Streaming error:', streamError);

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

    // ✅ FIX: Dismiss keyboard when sending message
    Keyboard.dismiss();

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

  const handleSelectConversation = async (conversationId: string) => {
    if (__DEV__) console.log('[CONV_SWITCH] 🔄 Switching to conversation:', conversationId);
    try {
      const response = await apiClient.get(`/api/ai-chat/conversations/${conversationId}`);
      const conversationDetail = response.data.data;
      const convMessages = conversationDetail.messages || [];

      const transformedMessages: Message[] = convMessages.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.created_at),
      }));

      setMessages(transformedMessages);
      setCurrentConversationId(conversationId);
      setShowQuickChips(transformedMessages.length === 0);
      setShowConversationList(false);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (__DEV__) console.log('[CONV_SWITCH] ✅ Loaded', transformedMessages.length, 'messages');
    } catch (error: any) {
      if (__DEV__) console.error('[CONV_SWITCH] ❌ Failed to switch conversation:', error.message);
    }
  };

  const handleNewConversation = () => {
    if (__DEV__) console.log('[CONV_NEW] 🆕 Creating new conversation');
    setMessages([]);
    setCurrentConversationId(undefined);
    setShowQuickChips(true);
    setShowConversationList(false);
    loadInitialGreeting();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const toggleConversationList = () => {
    setShowConversationList(!showConversationList);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Check if rate limited
  const isRateLimited = usageStats
    ? (usageStats.premium_today.used >= usageStats.premium_today.limit &&
        usageStats.free_today.used >= usageStats.free_today.limit) ||
      usageStats.monthly.used >= usageStats.monthly.limit
    : false;

  return (
    <View style={styles.container}>
      {/* Header with conversation toggle */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleConversationList} style={styles.headerButton}>
          <Ionicons
            name={showConversationList ? 'chatbubbles' : 'list'}
            size={24}
            color="#a78bfa"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {showConversationList ? 'Conversations' : 'Weave AI'}
        </Text>
        {showConversationList && (
          <TouchableOpacity onPress={handleNewConversation} style={styles.headerButton}>
            <Ionicons name="add-circle" size={24} color="#a78bfa" />
          </TouchableOpacity>
        )}
      </View>

      {/* Rate Limit Indicator */}
      {usageStats && !showConversationList && (
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

      {showConversationList ? (
        <ConversationList
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onRefresh={refetchConversations}
          isRefreshing={isRefetching}
        />
      ) : (
        <>
          {/* Chat Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={scrollToBottom}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {/* ✅ FIX: Show loading state when fetching history */}
            {isLoadingHistory && messages.length === 0 ? (
              <View style={{ padding: 16, alignItems: 'center' }}>
                <Text style={{ color: '#888', fontSize: 14 }}>Loading conversation...</Text>
              </View>
            ) : null}

            {messages.map((message) => (
              <Animated.View
                key={message.id}
                style={{ width: '100%' }}
                entering={
                  message.role === 'user'
                    ? SlideInUp.duration(300).springify()
                    : FadeIn.duration(400).delay(200)
                }
              >
                <MessageBubble message={message} />
              </Animated.View>
            ))}

            {/* Typing Indicator */}
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
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.10)',
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 8,
    paddingBottom: 24,
  },
});
