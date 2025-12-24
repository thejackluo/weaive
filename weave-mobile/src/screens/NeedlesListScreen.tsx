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
import { View, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useActiveGoals } from '@/hooks/useActiveGoals';
import { GoalCard } from '@/components/GoalCard';
import { GoalCardSkeleton } from '@/components/GoalCardSkeleton';

export function NeedlesListScreen() {
  const router = useRouter();
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
      // TODO: Replace with new toast system
      // showSimpleToast("You've reached the 3-goal limit. Archive a goal to add a new one.", 'info', 4000);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/needles/create');
  };

  // Render loading state (AC5)
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: '#000000' }]}>
        <View style={styles.header}>
          <RNText style={[styles.title, { fontSize: 32, fontWeight: 'bold', color: '#ffffff' }]}>
            Your Needles
          </RNText>
          <RNText style={[styles.subtitle, { fontSize: 16, color: '#a1a1aa' }]}>
            Focus on what matters most
          </RNText>
        </View>

        <View style={styles.listContainer} testID="goals-skeleton-loader">
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
      <View style={[styles.container, { backgroundColor: '#000000' }]}>
        <View style={styles.header}>
          <RNText style={[styles.title, { fontSize: 32, fontWeight: 'bold', color: '#ffffff' }]}>
            Your Needles
          </RNText>
        </View>

        <View style={[styles.centerContent, styles.errorState]} testID="error-state">
          <RNText style={[styles.errorTitle, { fontSize: 24, fontWeight: '600', color: '#ef4444' }]}>
            Couldn't load your goals
          </RNText>
          <RNText style={[styles.errorMessage, { fontSize: 16, color: '#a1a1aa' }]}>
            Check your connection and try again
          </RNText>
          {error && (
            <RNText style={[styles.errorDetail, { fontSize: 14, color: '#71717a' }]}>
              {error.message}
            </RNText>
          )}
          <TouchableOpacity
            onPress={() => refetch()}
            testID="retry-button"
            style={[styles.retryButton, { backgroundColor: '#3b82f6', padding: 12, borderRadius: 8 }]}
          >
            <RNText style={{ color: '#ffffff', textAlign: 'center', fontWeight: '600' }}>Retry</RNText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Render empty state (AC6)
  if (goals.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: '#000000' }]}>
        <View style={styles.header}>
          <RNText style={[styles.title, { fontSize: 32, fontWeight: 'bold', color: '#ffffff' }]}>
            Your Needles
          </RNText>
        </View>

        <View style={[styles.centerContent, styles.emptyState]} testID="empty-state">
          <RNText style={[styles.emptyTitle, { fontSize: 24, fontWeight: '600', color: '#ffffff' }]}>
            You haven't set any goals yet
          </RNText>
          <RNText style={[styles.emptyMessage, { fontSize: 16, color: '#a1a1aa' }]}>
            What do you want to achieve?
          </RNText>
          <TouchableOpacity
            onPress={handleAddGoal}
            testID="create-first-goal-button"
            style={[styles.createButton, { backgroundColor: '#3b82f6', padding: 12, borderRadius: 8 }]}
          >
            <RNText style={{ color: '#ffffff', textAlign: 'center', fontWeight: '600' }}>
              Create Your First Goal
            </RNText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Render goals list (AC1, AC2)
  return (
    <View style={[styles.container, { backgroundColor: '#000000' }]}>
      <View style={styles.header}>
        <RNText style={[styles.title, { fontSize: 32, fontWeight: 'bold', color: '#ffffff' }]}>
          Your Needles
        </RNText>
        <RNText style={[styles.subtitle, { fontSize: 16, color: '#a1a1aa' }]}>
          {total} of {activeGoalLimit} active {total === 1 ? 'goal' : 'goals'}
        </RNText>
      </View>

      <FlatList
        data={goals}
        renderItem={({ item }) => <GoalCard goal={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={
          <View style={styles.footer}>
            <TouchableOpacity
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
              style={[
                styles.addButton,
                {
                  backgroundColor: isAtLimit ? '#27272a' : '#3b82f6',
                  padding: 12,
                  borderRadius: 8,
                  opacity: isAtLimit ? 0.5 : 1,
                },
              ]}
            >
              <RNText style={{ color: '#ffffff', textAlign: 'center', fontWeight: '600' }}>
                {isAtLimit ? 'Goal Limit Reached (3/3)' : 'Add New Goal'}
              </RNText>
            </TouchableOpacity>
            {isAtLimit && (
              <RNText style={[styles.limitHint, { fontSize: 14, color: '#a1a1aa', textAlign: 'center' }]}>
                Archive a goal to add a new one
              </RNText>
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
