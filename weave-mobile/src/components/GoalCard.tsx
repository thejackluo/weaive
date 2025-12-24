/**
 * GoalCard Component (Story 2.1: Needles List View)
 *
 * Displays a single goal (needle) with progress metrics
 *
 * Features:
 * - Pressable card with tap animation (AC2)
 * - Shows title, consistency %, and active binds count (AC1)
 * - Visual progress indicator
 * - Accessibility labels for screen readers (AC8)
 * - Handles "New" badge for goals without 7-day data (AC4)
 */

import React from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import type { Goal } from '@/types/goals';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface GoalCardProps {
  goal: Goal;
  testID?: string;
}

/**
 * Goal card component
 *
 * @param goal - Goal object with stats
 * @param testID - Test identifier (default: goal-card-{goal.id})
 */
export function GoalCard({ goal, testID }: GoalCardProps) {
  const router = useRouter();
  const scale = useSharedValue(1);

  // Format consistency percentage
  const consistencyDisplay =
    goal.consistency_7d !== null ? `${Math.round(goal.consistency_7d)}%` : 'New';

  const isNewGoal = goal.consistency_7d === null;

  // Accessibility label (AC8)
  const accessibilityLabel = `${goal.title}, ${consistencyDisplay} consistency${
    isNewGoal ? ' (new goal)' : ''
  }, ${goal.active_binds_count} active ${goal.active_binds_count === 1 ? 'bind' : 'binds'}`;

  // Handle press with navigation and haptics (AC2)
  const handlePress = () => {
    // Haptic feedback (AC2)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Navigate to goal detail view (AC2)
    router.push(`/needles/${goal.id}`);
  };

  // Press animation (AC2)
  const handlePressIn = () => {
    scale.value = withSpring(0.97, {
      damping: 15,
      stiffness: 150,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      testID={testID || `goal-card-${goal.id}`}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityHint="Double tap to view goal details"
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, { marginBottom: 16 }]}
    >
      <View
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 12,
          padding: 20,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        <View style={styles.container}>
          {/* Goal Title */}
          <Text
            style={[styles.title, { fontSize: 24, fontWeight: '600', color: '#FFFFFF' }]}
            numberOfLines={2}
          >
            {goal.title}
          </Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {/* Consistency */}
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { fontSize: 14, color: '#A1A1AA' }]}>
                CONSISTENCY
              </Text>
              <View style={styles.consistencyContainer}>
                {isNewGoal ? (
                  <View style={[styles.newBadge, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                    <Text style={[styles.newBadgeText, { color: '#8b5cf6' }]}>
                      NEW
                    </Text>
                  </View>
                ) : (
                  <>
                    <Text
                      style={[styles.consistencyValue, { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' }]}
                    >
                      {Math.round(goal.consistency_7d!)}
                    </Text>
                    <Text style={{ fontSize: 18, color: '#D4D4DC' }}>
                      %
                    </Text>
                  </>
                )}
              </View>
              {/* Visual progress bar */}
              {!isNewGoal && (
                <View style={[styles.progressBar, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(goal.consistency_7d!, 100)}%`,
                        backgroundColor: '#8b5cf6',
                      },
                    ]}
                  />
                </View>
              )}
            </View>

            {/* Active Binds Count */}
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { fontSize: 14, color: '#A1A1AA' }]}>
                ACTIVE BINDS
              </Text>
              <View style={styles.bindsContainer}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' }}>
                  {goal.active_binds_count}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  title: {
    marginBottom: 4,
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
  statLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  consistencyContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  consistencyValue: {
    fontSize: 32,
    lineHeight: 36,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  bindsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  newBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  newBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
