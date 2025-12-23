/**
 * GoalCardSkeleton Component (Story 2.1: Needles List View)
 *
 * Skeleton loader for goal cards during initial data fetch
 *
 * Features (AC5):
 * - Shows skeleton placeholder during loading
 * - Matches GoalCard layout
 * - Provides visual feedback for <1s load time
 *
 * Note: Simplified version without animation to avoid React 19 + Reanimated issues
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

export function GoalCardSkeleton() {
  const skeletonColor = '#3f3f46';

  return (
    <View style={{ marginBottom: 16 }}>
      {/* Using plain View instead of Card to avoid React 19 compatibility issues */}
      <View
        style={[
          styles.cardContainer,
          {
            backgroundColor: '#18181b',
            borderColor: '#3f3f46',
          },
        ]}
      >
        <View style={styles.container}>
          {/* Title skeleton */}
          <View style={[styles.titleSkeleton, { backgroundColor: skeletonColor, opacity: 0.4 }]} />

          {/* Stats row skeleton */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View
                style={[styles.statLabelSkeleton, { backgroundColor: skeletonColor, opacity: 0.4 }]}
              />
              <View
                style={[styles.statValueSkeleton, { backgroundColor: skeletonColor, opacity: 0.4 }]}
              />
            </View>

            <View style={styles.statItem}>
              <View
                style={[styles.statLabelSkeleton, { backgroundColor: skeletonColor, opacity: 0.4 }]}
              />
              <View
                style={[styles.statValueSkeleton, { backgroundColor: skeletonColor, opacity: 0.4 }]}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    overflow: 'hidden',
  },
  container: {
    gap: 16,
  },
  titleSkeleton: {
    height: 32,
    width: '70%',
    borderRadius: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 24,
  },
  statItem: {
    flex: 1,
    gap: 8,
  },
  statLabelSkeleton: {
    height: 12,
    width: '60%',
    borderRadius: 4,
  },
  statValueSkeleton: {
    height: 28,
    width: '40%',
    borderRadius: 6,
  },
});
