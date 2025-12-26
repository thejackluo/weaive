/**
 * MessageInput - Chat Message Input Field (Story 6.1)
 *
 * Features:
 * - Text input with 500 character limit
 * - Character counter shown at 400+
 * - Send button (disabled when empty, enabled when text present)
 * - Haptic feedback on send
 * - Scale animation on send button press
 * - Glassmorphism design
 */

import React, { useEffect } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

interface MessageInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  onVoiceRecord?: () => void;
  isRecording?: boolean;
}

const MAX_CHARACTERS = 500;
const SHOW_COUNTER_AT = 400;

export default function MessageInput({
  value,
  onChangeText,
  onSend,
  disabled = false,
  placeholder = 'Talk to Weave...',
  onVoiceRecord,
  isRecording = false,
}: MessageInputProps) {
  const scale = useSharedValue(1);
  const micScale = useSharedValue(1);
  const micOpacity = useSharedValue(1);
  const characterCount = value.length;
  const showCounter = characterCount >= SHOW_COUNTER_AT;
  const isOverLimit = characterCount > MAX_CHARACTERS;
  const canSend = value.trim().length > 0 && !isOverLimit && !disabled;

  // Pulsing animation when recording
  useEffect(() => {
    if (isRecording) {
      // Start pulsing animation (opacity: 1 → 0.3 → 1)
      micOpacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1, // Infinite repeat
        false // Don't reverse
      );
    } else {
      // Stop animation and reset to full opacity
      micOpacity.value = withTiming(1, { duration: 300 });
    }
  }, [isRecording, micOpacity]);

  const handleSend = () => {
    if (!canSend) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSend(value);
  };

  const handleVoicePress = () => {
    if (!onVoiceRecord || disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onVoiceRecord();
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  const animatedMicStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(micScale.value) }],
    opacity: micOpacity.value, // Pulsing effect when recording
  }));

  return (
    <BlurView intensity={20} tint="dark" style={styles.container}>
      <View style={styles.inputContainer}>
        {/* Character Counter */}
        {showCounter && (
          <Animated.View style={styles.counterContainer} testID="character-counter">
            <Text style={[styles.counterText, isOverLimit && styles.counterTextError]}>
              {characterCount}/{MAX_CHARACTERS}
            </Text>
          </Animated.View>
        )}

        {/* Text Input */}
        <TextInput
          testID="message-input"
          style={[styles.input, disabled && styles.inputDisabled]}
          value={value}
          onChangeText={(text) => {
            // Enforce character limit
            if (text.length <= MAX_CHARACTERS) {
              onChangeText(text);
            }
          }}
          placeholder={placeholder}
          placeholderTextColor="#6b7280"
          multiline
          maxLength={MAX_CHARACTERS}
          editable={!disabled}
          returnKeyType="send"
          blurOnSubmit={false}
          onSubmitEditing={() => {
            if (canSend) {
              handleSend();
            }
          }}
        />

        {/* Voice Input Button */}
        {onVoiceRecord && (
          <Pressable
            testID="voice-button"
            onPress={handleVoicePress}
            onPressIn={() => {
              if (!disabled) {
                micScale.value = 0.95;
              }
            }}
            onPressOut={() => {
              micScale.value = 1;
            }}
            disabled={disabled}
            style={styles.voiceButtonWrapper}
          >
            <Animated.View
              style={[
                styles.voiceButton,
                isRecording && styles.voiceButtonRecording,
                disabled && styles.voiceButtonDisabled,
                animatedMicStyle,
              ]}
            >
              <Ionicons
                name={isRecording ? 'mic' : 'mic-outline'}
                size={20}
                color={isRecording ? '#ef4444' : disabled ? '#6b7280' : '#a78bfa'}
              />
            </Animated.View>
          </Pressable>
        )}

        {/* Send Button */}
        <Pressable
          testID="send-button"
          onPress={handleSend}
          onPressIn={() => {
            if (canSend) {
              scale.value = 0.95;
            }
          }}
          onPressOut={() => {
            scale.value = 1;
          }}
          disabled={!canSend}
          style={styles.sendButtonWrapper}
        >
          <Animated.View
            style={[styles.sendButton, !canSend && styles.sendButtonDisabled, animatedButtonStyle]}
          >
            <Ionicons name="arrow-up" size={20} color={canSend ? '#ffffff' : '#6b7280'} />
          </Animated.View>
        </Pressable>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: 'rgba(10, 10, 10, 0.8)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    gap: 8,
  },
  counterContainer: {
    position: 'absolute',
    top: -20,
    right: 16,
    backgroundColor: 'rgba(10, 10, 10, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  counterText: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
  },
  counterTextError: {
    color: '#ef4444', // Red
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  inputDisabled: {
    opacity: 0.5,
  },
  voiceButtonWrapper: {
    marginBottom: 2,
  },
  voiceButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(167, 139, 250, 0.2)', // Purple translucent
    borderWidth: 1,
    borderColor: '#a78bfa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButtonRecording: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)', // Red translucent when recording
    borderColor: '#ef4444',
  },
  voiceButtonDisabled: {
    opacity: 0.5,
    borderColor: '#6b7280',
  },
  sendButtonWrapper: {
    marginBottom: 2,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#a78bfa', // Purple
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(107, 114, 128, 0.3)', // Gray translucent
  },
});
