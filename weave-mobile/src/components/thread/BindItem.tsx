/**
 * BindItem Component
 * Individual bind/task card with completion checkbox
 *
 * Minimal aesthetic:
 * - Large, rounded cards (iOS 17 style)
 * - Green checkmark for completed
 * - Clean typography
 */

import React, { useEffect, useRef } from 'react';
import { View, Pressable, StyleSheet, Animated } from 'react-native';
import { useTheme, Body } from '@/design-system';
import type { Bind } from '@/types/binds';
import { Ionicons } from '@expo/vector-icons';

interface BindItemProps {
  bind: Bind;
  onPress: () => void;
  isHighlighted?: boolean; // For onboarding spotlight
  disabled?: boolean; // Disable interaction during onboarding
}

export function BindItem({ bind, onPress, isHighlighted, disabled }: BindItemProps) {
  const { colors, spacing } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0.3)).current;

  // Shimmer animation for highlighted state
  useEffect(() => {
    if (isHighlighted) {
      const shimmer = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      );
      shimmer.start();
      return () => shimmer.stop();
    }
  }, [isHighlighted]);

  const animatedBorderColor = shimmerAnim.interpolate({
    inputRange: [0.3, 1],
    outputRange: ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 1)'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.background.secondary,
          borderColor: isHighlighted ? animatedBorderColor : colors.border.subtle,
          borderWidth: isHighlighted ? 2 : 1,
          padding: spacing[4],
          marginBottom: spacing[2],
          borderRadius: 20,
          shadowColor: isHighlighted ? '#FFFFFF' : '#000',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: isHighlighted ? shimmerAnim : 0.2,
          shadowRadius: isHighlighted ? 8 : 4,
          elevation: isHighlighted ? 8 : 4,
          opacity: disabled ? 0.3 : 1,
        },
      ]}
    >
      <Pressable
        style={styles.pressable}
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
      >
      <View style={styles.content}>
        {/* Checkbox - Green when completed */}
        <View
          style={[
            styles.checkbox,
            {
              borderColor: bind.completed ? colors.green[500] : colors.border.muted,
              backgroundColor: bind.completed ? colors.green[500] : 'transparent',
            },
          ]}
        >
          {bind.completed && (
            <Ionicons name="checkmark" size={18} color="#000000" /> // Black checkmark on green
          )}
        </View>

        {/* Bind Title */}
        <View style={styles.details}>
          <Body
            weight="semibold"
            style={{
              color: colors.text.primary,
              opacity: bind.completed ? 0.5 : 1, // Dim when completed
              fontSize: 16,
              letterSpacing: -0.2,
            }}
          >
            {bind.title}
          </Body>
        </View>

        {/* Chevron */}
        <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
      </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {},
  pressable: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14, // Perfect circle
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
  },
});
