/**
 * AI Chat Tab (Story 6.1)
 * Epic 6: AI Coaching
 *
 * Features:
 * - Full chat interface with streaming responses
 * - Server-initiated conversations
 * - Tiered rate limiting (10 premium + 40 free messages/day, 500/month)
 * - World-class UX: animations, glassmorphism, haptics
 * - Quick action chips for common prompts
 */

import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import ChatScreen from '@/components/features/ai-chat/ChatScreen';

export default function AIChatScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ChatScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a', // Dark background
  },
});
