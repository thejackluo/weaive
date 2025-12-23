/**
 * ConversationList - List of AI chat conversations (Story 6.1+)
 *
 * Features:
 * - List of conversation threads with preview
 * - Tap to switch conversations
 * - Pull to refresh
 * - New conversation button
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export interface Conversation {
  id: string;
  started_at: string;
  last_message_at: string;
  last_message_preview: string;
  initiated_by: 'user' | 'system';
}

interface ConversationListProps {
  conversations: Conversation[];
  currentConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function ConversationList({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onRefresh,
  isRefreshing,
}: ConversationListProps) {
  const handleSelectConversation = (id: string) => {
    if (id !== currentConversationId) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSelectConversation(id);
    }
  };

  const handleNewConversation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onNewConversation();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const isActive = item.id === currentConversationId;

    return (
      <TouchableOpacity onPress={() => handleSelectConversation(item.id)} activeOpacity={0.7}>
        <Animated.View entering={FadeIn.duration(300)}>
          <BlurView
            intensity={15}
            tint="dark"
            style={[styles.conversationCard, isActive && styles.conversationCardActive]}
          >
            <View style={styles.conversationHeader}>
              <View style={styles.conversationIcon}>
                <Ionicons
                  name={item.initiated_by === 'system' ? 'notifications' : 'chatbubble'}
                  size={16}
                  color={isActive ? '#a78bfa' : '#9ca3af'}
                />
              </View>
              <Text style={[styles.conversationDate, isActive && styles.textActive]}>
                {formatDate(item.last_message_at)}
              </Text>
            </View>
            <Text
              style={[styles.conversationPreview, isActive && styles.textActive]}
              numberOfLines={2}
            >
              {item.last_message_preview || 'No messages yet'}
            </Text>
          </BlurView>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conversations</Text>
        <TouchableOpacity onPress={handleNewConversation} style={styles.newButton}>
          <Ionicons name="add-circle" size={28} color="#a78bfa" />
        </TouchableOpacity>
      </View>

      {/* Conversation List */}
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#a78bfa" />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color="#6b7280" />
            <Text style={styles.emptyText}>No conversations yet</Text>
            <Text style={styles.emptySubtext}>Start chatting with Weave!</Text>
          </View>
        }
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.10)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  newButton: {
    padding: 4,
  },
  listContent: {
    padding: 12,
    paddingBottom: 24,
  },
  conversationCard: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(26, 26, 26, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  conversationCardActive: {
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    borderColor: '#a78bfa',
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  conversationIcon: {
    marginRight: 8,
  },
  conversationDate: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
  },
  conversationPreview: {
    fontSize: 13,
    color: '#d1d5db',
    lineHeight: 18,
  },
  textActive: {
    color: '#ffffff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
});
