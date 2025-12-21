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
              color: bind.completed ? colors.text.muted : colors.text.primary,
              textDecorationLine: bind.completed ? 'line-through' : 'none',
            }}
          >
            {bind.title}
          </Body>
          <Caption style={{ color: colors.text.secondary, marginTop: spacing[1] }}>
            {bind.subtitle}
          </Caption>
        </View>

        {/* Proof Indicator (if completed) */}
        {bind.has_proof && (
          <View style={styles.proofBadge}>
            <Caption style={{ color: colors.emerald[400] }}>✓</Caption>
          </View>
        )}
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
  proofBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
