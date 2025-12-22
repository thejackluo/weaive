/**
 * MessageBubble - Individual Chat Message (Story 6.1)
 *
 * Features:
 * - Glassmorphism design (translucent background, blur effect)
 * - User messages: right-aligned, blue gradient
 * - Assistant messages: left-aligned, purple gradient
 * - Long-press to show timestamp and copy option
 * - Spring animations on mount
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Clipboard, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [showTimestamp, setShowTimestamp] = useState(false);
  const scale = useSharedValue(1);
  const cursorOpacity = useSharedValue(1);

  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isStreaming = message.isStreaming || false;

  // Animated cursor for streaming messages
  React.useEffect(() => {
    if (isStreaming) {
      cursorOpacity.value = withRepeat(withTiming(0, { duration: 500 }), -1, true);
    } else {
      cursorOpacity.value = 0;
    }
  }, [isStreaming, cursorOpacity]);

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowTimestamp((prev) => !prev);
  };

  const handleCopyMessage = () => {
    Clipboard.setString(message.content);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Copied', 'Message copied to clipboard');
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  const cursorStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
  }));

  return (
    <Pressable
      onLongPress={handleLongPress}
      onPressIn={() => {
        scale.value = 0.98;
      }}
      onPressOut={() => {
        scale.value = 1;
      }}
      style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}
    >
      <Animated.View style={[styles.bubble, animatedStyle]} testID="message-bubble">
        {/* Glassmorphism Background */}
        <BlurView
          intensity={20}
          tint="dark"
          style={[
            styles.blurContainer,
            isUser ? styles.userBubble : isSystem ? styles.systemBubble : styles.assistantBubble,
          ]}
        >
          {/* System message indicator */}
          {isSystem && (
            <View style={styles.systemIndicator}>
              <Text style={styles.systemIndicatorText}>✨ Weave checked in</Text>
            </View>
          )}

          {/* Message Content */}
          <View style={styles.messageContentRow}>
            <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
              {message.content}
            </Text>

            {/* Streaming Cursor */}
            {isStreaming && (
              <Animated.View style={[styles.streamingCursor, cursorStyle]}>
                <View style={styles.cursorBlock} />
              </Animated.View>
            )}
          </View>

          {/* Timestamp (shown on long-press) */}
          {showTimestamp && (
            <Animated.View
              style={styles.timestampContainer}
              entering={FadeIn.duration(200)}
              testID="message-timestamp"
            >
              <Text style={styles.timestamp}>
                {message.timestamp.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
              <Pressable onPress={handleCopyMessage} style={styles.copyButton} testID="copy-message-button">
                <Text style={styles.copyButtonText}>Copy</Text>
              </Pressable>
            </Animated.View>
          )}
        </BlurView>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    paddingHorizontal: 0, // ✅ Removed to maximize bubble width
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    // ✅ CRITICAL: Explicit width needed because parent Pressable has alignItems: flex-start/flex-end
    // Without this, bubble shrinks to minimum content width (~10% screen)
    // 88% provides good balance: wide enough for text, narrow enough for visual separation
    width: '88%',
    minWidth: 60,
  },
  blurContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: 14,
    borderWidth: 1,
  },
  userBubble: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)', // Blue translucent
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  assistantBubble: {
    backgroundColor: 'rgba(167, 139, 250, 0.15)', // Purple translucent
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  systemBubble: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)', // Gold translucent
    borderColor: 'rgba(234, 179, 8, 0.30)',
  },
  systemIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.10)',
  },
  systemIndicatorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fbbf24', // Gold
    letterSpacing: 0.5,
  },
  messageContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%', // ✅ Force row to stretch full width (fixes text wrapping issue)
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
    flex: 1,
  },
  userText: {
    color: '#ffffff',
  },
  assistantText: {
    color: '#e5e7eb', // Light gray
  },
  streamingCursor: {
    marginLeft: 4,
    marginBottom: 2,
  },
  cursorBlock: {
    width: 2,
    height: 16,
    backgroundColor: '#a78bfa', // Purple
    borderRadius: 1,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.10)',
  },
  timestamp: {
    fontSize: 11,
    color: '#9ca3af', // Gray
  },
  copyButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: 6,
  },
  copyButtonText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
  },
});
