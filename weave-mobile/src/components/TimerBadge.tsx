/**
 * TimerBadge Component
 *
 * Display duration badge for completed binds (e.g., "25 min").
 * Used in Daily Detail page to show Pomodoro/timer duration.
 *
 * Tech-Spec: Task 7
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Caption, useTheme } from '@/design-system';

export interface TimerBadgeProps {
  durationMinutes: number;
}

export function TimerBadge({ durationMinutes }: TimerBadgeProps) {
  const { colors, spacing, radius } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background.secondary,
          borderRadius: radius.full,
          paddingHorizontal: spacing[3],
          paddingVertical: spacing[2],
        },
      ]}
    >
      <MaterialIcons name="timer" size={14} color={colors.accent[500]} />
      <Caption
        style={{
          color: colors.text.primary,
          marginLeft: spacing[1],
          fontWeight: '600',
        }}
      >
        {durationMinutes} min
      </Caption>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
});
