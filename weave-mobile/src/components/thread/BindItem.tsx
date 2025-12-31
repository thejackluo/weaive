/**
 * BindItem Component
 * Individual bind/task card with completion checkbox
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useTheme, Body, Caption } from '@/design-system';
import type { Bind } from '@/types/binds';

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
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        {/* Checkbox */}
        <View
          style={[
            styles.checkbox,
            {
              borderColor: bind.completed ? colors.semantic.success.base : colors.border.muted,
              backgroundColor: bind.completed ? colors.semantic.success.base : 'transparent',
            },
          ]}
        >
          {bind.completed && <View style={styles.checkmark} />}
        </View>

        {/* Bind Details */}
        <View style={styles.details}>
          <Body
            weight="semibold"
            style={{
              color: colors.text.primary,
              opacity: bind.completed ? 0.5 : 1,
              fontSize: 18,
            }}
          >
            {bind.title}
          </Body>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
  },
  details: {
    flex: 1,
  },
});
