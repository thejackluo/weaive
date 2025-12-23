/**
 * QuickActionChips - Quick Action Buttons (Story 6.1)
 *
 * Features:
 * - Pre-defined prompts for common actions
 * - Glassmorphism design with hover/press states
 * - Disappears when user starts typing custom message
 * - Haptic feedback on press
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface QuickActionChipsProps {
  onAction: (prompt: string) => void;
}

const QUICK_ACTIONS = [
  { label: 'Plan my day', prompt: 'Help me plan my day and prioritize my goals' },
  { label: "I'm stuck", prompt: "I'm feeling stuck on my goals. Can you help me?" },
  { label: 'Edit my goal', prompt: 'I want to edit or update one of my goals' },
  { label: 'Explain this bind', prompt: 'Can you explain what binds are and how they work?' },
];

export default function QuickActionChips({ onAction }: QuickActionChipsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick actions</Text>
      <View style={styles.chipsContainer}>
        {QUICK_ACTIONS.map((action, index) => (
          <ChipButton
            key={index}
            label={action.label}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onAction(action.prompt);
            }}
          />
        ))}
      </View>
    </View>
  );
}

interface ChipButtonProps {
  label: string;
  onPress: () => void;
}

function ChipButton({ label, onPress }: ChipButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
    opacity: opacity.value,
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = 0.97;
        opacity.value = 0.8;
      }}
      onPressOut={() => {
        scale.value = 1;
        opacity.value = 1;
      }}
      style={styles.chipWrapper}
    >
      <Animated.View style={animatedStyle}>
        <BlurView intensity={15} tint="dark" style={styles.chipBlur}>
          <Text style={styles.chipText}>{label}</Text>
        </BlurView>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(10, 10, 10, 0.8)', // Dark translucent
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipWrapper: {
    marginBottom: 4,
  },
  chipBlur: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(167, 139, 250, 0.15)', // Purple translucent
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    overflow: 'hidden',
  },
  chipText: {
    fontSize: 13,
    color: '#e5e7eb',
    fontWeight: '500',
  },
});
