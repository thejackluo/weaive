/**
 * BindItem Component
 * Individual bind/task card with completion checkbox
 *
 * Minimal aesthetic:
 * - Large, rounded cards (iOS 17 style)
 * - Green checkmark for completed
 * - Clean typography
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useTheme, Body } from '@/design-system';
import type { Bind } from '@/types/binds';
import { Ionicons } from '@expo/vector-icons';

interface BindItemProps {
  bind: Bind;
  onPress: () => void;
}

export function BindItem({ bind, onPress }: BindItemProps) {
  const { colors, spacing } = useTheme();

  return (
    <Pressable
      style={[
        styles.container,
        {
          backgroundColor: colors.background.secondary,
          borderColor: colors.border.subtle,
          padding: spacing[4],
          marginBottom: spacing[2],
          borderRadius: 20, // iOS 17 style (generous rounding)
        },
      ]}
      onPress={onPress}
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
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
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
