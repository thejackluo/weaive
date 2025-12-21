/**
 * NeedlesListScreen (Story 2.1: Needles List View)
 *
 * Displays a list of active goals (needles) with progress metrics
 *
 * Acceptance Criteria:
 * - AC1: Display up to 3 active goals with stats
 * - AC2: Tap goal to navigate to detail view with haptics
 * - AC3: Add Goal button (disabled at 3-goal limit)
 * - AC5: Load and render in <1 second
 * - AC6: Empty state when no goals
 * - AC7: Error state with retry
 * - AC8: Accessibility support
 */

import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Button, Text } from '@/design-system';
import { useTheme } from '@/design-system/theme/ThemeProvider';
import { useActiveGoals } from '@/hooks/useActiveGoals';
import { GoalCard } from '@/components/GoalCard';
import { GoalCardSkeleton } from '@/components/GoalCardSkeleton';
import { showSimpleToast } from '@/design-system/components/SimpleToast';

export function NeedlesListScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { data, isLoading, isError, error, refetch, isFetching } = useActiveGoals();

  const goals = data?.data || [];
  const total = data?.meta.total || 0;
  const activeGoalLimit = data?.meta.active_goal_limit || 3;

  const isAtLimit = total >= activeGoalLimit;

  // Handle Add Goal button press (AC3)
  const handleAddGoal = () => {
    if (isAtLimit) {
      // AC3: Show tooltip when at limit
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      showSimpleToast(
        "You've reached the 3-goal limit. Archive a goal to add a new one.",
        'info',
        4000
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/needles/create');
  };

  // Render loading state (AC5)
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={styles.header}>
          <Text variant="displayLg" weight="bold" style={styles.title}>
            Your Needles
          </Text>
          <Text variant="textBase" color="secondary" style={styles.subtitle}>
            Focus on what matters most
          </Text>
        </View>

        <View style={styles.listContainer}>
          <GoalCardSkeleton />
          <GoalCardSkeleton />
          <GoalCardSkeleton />
        </View>
      </View>
    );
  }

  // Render error state (AC7)
  if (isError) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={styles.header}>
          <Text variant="displayLg" weight="bold" style={styles.title}>
            Your Needles
          </Text>
        </View>

        <View style={[styles.centerContent, styles.errorState]} testID="error-state">
          <Text variant="displayMd" weight="semibold" color="error" style={styles.errorTitle}>
            Couldn't load your goals
          </Text>
          <Text variant="textBase" color="secondary" style={styles.errorMessage}>
            Check your connection and try again
          </Text>
          {error && (
            <Text variant="textSm" color="muted" style={styles.errorDetail}>
              {error.message}
            </Text>
          )}
          <Button
            variant="primary"
            size="md"
            onPress={() => refetch()}
            testID="retry-button"
            style={styles.retryButton}
          >
            Retry
          </Button>
        </View>
      </View>
    );
  }

  // Render empty state (AC6)
  if (goals.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={styles.header}>
          <Text variant="displayLg" weight="bold" style={styles.title}>
            Your Needles
          </Text>
        </View>

        <View style={[styles.centerContent, styles.emptyState]} testID="empty-state">
          <Text variant="displayMd" weight="semibold" style={styles.emptyTitle}>
            You haven't set any goals yet
          </Text>
          <Text variant="textBase" color="secondary" style={styles.emptyMessage}>
            What do you want to achieve?
          </Text>
          <Button
            variant="primary"
            size="md"
            onPress={handleAddGoal}
            testID="create-first-goal-button"
            style={styles.createButton}
          >
            Create Your First Goal
          </Button>
        </View>
      </View>
    );
  }

  // Render goals list (AC1, AC2)
  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={styles.header}>
        <Text variant="displayLg" weight="bold" style={styles.title}>
          Your Needles
        </Text>
        <Text variant="textBase" color="secondary" style={styles.subtitle}>
          {total} of {activeGoalLimit} active {total === 1 ? 'goal' : 'goals'}
        </Text>
      </View>

      <FlatList
        data={goals}
        renderItem={({ item }) => <GoalCard goal={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={
          <View style={styles.footer}>
            <Button
              variant={isAtLimit ? 'secondary' : 'primary'}
              size="md"
              onPress={handleAddGoal}
              disabled={isAtLimit}
              testID="add-goal-button"
              accessibilityLabel="Add new goal"
              accessibilityHint={
                isAtLimit
                  ? '3-goal limit reached. Archive a goal to add new one.'
                  : 'Double tap to create a new goal'
              }
              accessibilityState={{ disabled: isAtLimit }}
              style={styles.addButton}
            >
              {isAtLimit ? 'Goal Limit Reached (3/3)' : 'Add New Goal'}
            </Button>
            {isAtLimit && (
              <Text variant="textSm" color="secondary" style={styles.limitHint}>
                Archive a goal to add a new one
              </Text>
            )}
          </View>
        }
        refreshing={isFetching && !isLoading}
        onRefresh={refetch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
    gap: 8,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 24,
  },
  footer: {
    marginTop: 16,
    gap: 12,
    alignItems: 'center',
  },
  addButton: {
    width: '100%',
  },
  limitHint: {
    textAlign: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  emptyState: {
    marginTop: -60,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 16,
  },
  createButton: {
    marginTop: 8,
    width: '100%',
  },
  errorState: {
    marginTop: -60,
  },
  errorTitle: {
    textAlign: 'center',
  },
  errorMessage: {
    textAlign: 'center',
    fontSize: 16,
  },
  errorDetail: {
    textAlign: 'center',
    marginTop: -8,
  },
  retryButton: {
    marginTop: 8,
    minWidth: 120,
  },
});
