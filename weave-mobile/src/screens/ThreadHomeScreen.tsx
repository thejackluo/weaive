/**
 * Thread Home Screen (US-3.1: View Today's Binds)
 *
 * Main daily action loop screen showing:
 * - Header with streak + greeting + profile
 * - Week calendar widget (current week view)
 * - AI insight card (tappable to open chat)
 * - Needles with collapsible binds (hide-others behavior)
 * - Daily Check-In card with countdown timer
 */

import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme, Card, Heading, Body, Caption, Button } from '@/design-system';
import { NeedleCard } from '@/components/thread/NeedleCard';
import CountdownTimer from '@/components/features/journal/CountdownTimer';
import { useTodayBinds } from '@/hooks/useTodayBinds';
import { useGetTodayJournal } from '@/hooks/useJournal';
import { useActiveGoals } from '@/hooks/useActiveGoals';
import type { Bind } from '@/types/binds';
import { mockUser, getGreeting, getRandomInsight } from '@/data/mockThreadData';

export function ThreadHomeScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const [expandedNeedleId, setExpandedNeedleId] = useState<string | null>(null);

  // Fetch today's binds
  const { data, isLoading, isError, error, refetch } = useTodayBinds();

  // Fetch active goals (needles) - to show goals even without binds
  const { data: goalsData, isLoading: isLoadingGoals, refetch: refetchGoals } = useActiveGoals();

  // Check if today's journal entry exists (for completion status)
  const { data: todayJournal, refetch: refetchJournal } = useGetTodayJournal();

  // 🐛 FIX: Refetch goals when screen comes into focus
  // This ensures new/deleted goals appear immediately when navigating back from create/delete actions
  useFocusEffect(
    React.useCallback(() => {
      console.log('[ThreadHome] Screen focused - refetching goals');
      refetchGoals();
    }, [refetchGoals])
  );

  // Refetch journal status when screen comes into focus
  // This ensures the red dot disappears after submitting reflection
  useFocusEffect(
    React.useCallback(() => {
      console.log('[ThreadHome] Screen focused - refetching binds and journal');
      // Force refetch by invalidating cache first
      refetch(); // Refetch today's binds
      refetchJournal(); // Refetch journal status
    }, [refetch, refetchJournal])
  );

  // Also refetch when data changes (to catch new binds)
  React.useEffect(() => {
    if (data) {
      console.log('[ThreadHome] Data updated - total binds:', data.data.length);
      console.log('[ThreadHome] Bind IDs:', data.data.map((b) => b.id).join(', '));
    }
  }, [data]);

  // Mock user data (will be replaced with real user data in future)
  const user = mockUser;
  const greeting = getGreeting();
  const aiInsight = getRandomInsight();

  // Get today's date formatted as "Monday, December 28"
  const getTodayDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    };
    return today.toLocaleDateString('en-US', options);
  };

  const todayDate = getTodayDate();

  // Determine if reflection is complete (has today's journal entry)
  const hasCompletedReflection = !!todayJournal;
  console.log('[ThreadHome] Journal status:', {
    hasJournal: !!todayJournal,
    journalId: todayJournal?.id,
    hasCompletedReflection,
  });

  // Handle needle toggle
  const handleNeedleToggle = (needleId: string) => {
    setExpandedNeedleId((prev) => (prev === needleId ? null : needleId));
  };

  // Group binds by needle + include active needles without binds
  const groupBindsByNeedle = () => {
    const needleMap = new Map<string, { needle: any; binds: Bind[] }>();

    // First, add all binds from today
    if (data?.data) {
      data.data.forEach((bind) => {
        const needleId = bind.needle_id || 'no-needle';

        if (!needleMap.has(needleId)) {
          needleMap.set(needleId, {
            needle: {
              id: needleId,
              title: bind.needle_title,
              why: 'Focus on your goals',
              color: bind.needle_color,
              completedBinds: 0,
              totalBinds: 0,
              consistency7d: null,
            },
            binds: [],
          });
        }

        const group = needleMap.get(needleId)!;
        group.binds.push(bind);
        group.needle.totalBinds += 1;
        if (bind.completed) {
          group.needle.completedBinds += 1;
        }
      });
    }

    // Then, add active goals that don't have binds today
    if (goalsData?.data) {
      goalsData.data.forEach((goal) => {
        if (!needleMap.has(goal.id)) {
          needleMap.set(goal.id, {
            needle: {
              id: goal.id,
              title: goal.title,
              why: goal.why || 'Focus on your goals',
              color: goal.color || '#6366f1', // Default accent color
              completedBinds: 0,
              totalBinds: 0,
              consistency7d: goal.consistency_7d,
            },
            binds: [], // No binds scheduled for today
          });
        }
      });
    }

    return Array.from(needleMap.values());
  };

  const needleGroups = groupBindsByNeedle();

  // Handle bind press
  const handleBindPress = (bind: Bind) => {
    console.log('[ThreadHome] Navigate to bind:', bind.id);
    router.push(`/(tabs)/binds/${bind.id}`);
  };

  // Handle AI insight tap
  const handleAIInsightPress = () => {
    console.log('AI Insight tapped - open Weave AI modal');
    // TODO: Open Weave AI modal with this insight as context
  };

  // Loading state
  if (isLoading || isLoadingGoals) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background.primary }]}
        edges={['top']}
      >
        <View style={[styles.centerContent, { padding: spacing[4] }]}>
          <ActivityIndicator size="large" color={colors.accent[500]} />
          <Body style={{ color: colors.text.secondary, marginTop: spacing[4] }}>
            Loading your needles...
          </Body>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (isError) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background.primary }]}
        edges={['top']}
      >
        <View style={[styles.centerContent, { padding: spacing[4] }]}>
          <Card variant="default" style={{ padding: spacing[5] }}>
            <Heading
              variant="displayLg"
              style={{ color: colors.semantic.error.base, marginBottom: spacing[3] }}
            >
              Failed to Load Binds
            </Heading>
            <Body style={{ color: colors.text.secondary, marginBottom: spacing[4] }}>
              {error?.message || 'An error occurred while fetching your binds.'}
            </Body>
            <Button variant="primary" onPress={() => refetch()}>
              Retry
            </Button>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top']}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { padding: spacing[4], gap: spacing[4] }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Combined Header with Progress */}
        {(() => {
          const totalBinds = data?.data?.length || 0;
          const completedBinds = data?.data?.filter((bind) => bind.completed).length || 0;
          const totalTasks = totalBinds + 1; // +1 for daily reflection
          const completedTasks = completedBinds + (hasCompletedReflection ? 1 : 0);
          const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

          const badgeColor =
            percentage === 100
              ? colors.emerald[700]
              : percentage >= 50
                ? colors.emerald[500]
                : colors.background.secondary;

          return (
            <Card variant="default" style={{ padding: spacing[4] }}>
              <View style={styles.combinedHeader}>
                {/* Left side: Greeting, date, and progress */}
                <View style={styles.headerLeft}>
                  <Body style={{ color: colors.text.secondary, marginBottom: spacing[1] }}>
                    {greeting}, {user.name}
                  </Body>
                  <Heading
                    variant="displayXl"
                    style={{ color: colors.text.primary, marginBottom: spacing[2] }}
                  >
                    {todayDate}
                  </Heading>
                  <View style={styles.progressInfo}>
                    <Caption style={{ color: colors.text.muted }}>Today's Progress</Caption>
                    <Body
                      weight="semibold"
                      style={{ color: colors.text.primary, marginTop: spacing[1] }}
                    >
                      {completedTasks}/{totalTasks}
                    </Body>
                  </View>
                </View>

                {/* Right side: Progress badge */}
                <View style={[styles.progressBadgeLarge, { backgroundColor: badgeColor }]}>
                  <Heading variant="displayXl" style={{ color: 'white' }}>
                    {percentage}%
                  </Heading>
                </View>
              </View>
            </Card>
          );
        })()}

        {/* AI Insight Card */}
        <Card variant="ai" pressable onPress={handleAIInsightPress}>
          <View style={styles.aiInsightContent}>
            <Body style={{ fontSize: 24, marginRight: spacing[2] }}>🧶</Body>
            <Body style={{ flex: 1, color: colors.violet[200] }}>{aiInsight}</Body>
          </View>
        </Card>

        {/* Your Needles Section */}
        <View>
          <Heading
            variant="displayLg"
            style={{ color: colors.text.primary, marginBottom: spacing[3] }}
          >
            Your Needles
          </Heading>

          {needleGroups.length === 0 ? (
            <Card variant="default" style={{ padding: spacing[5], alignItems: 'center' }}>
              <Heading
                variant="displayLg"
                style={{ color: colors.text.primary, marginBottom: spacing[3] }}
              >
                No Needles Yet
              </Heading>
              <Body
                style={{
                  color: colors.text.secondary,
                  marginBottom: spacing[4],
                  textAlign: 'center',
                }}
              >
                Create your first needle to get started with consistent actions toward your goals!
              </Body>
              <Button variant="primary" onPress={() => router.push('/(tabs)/dashboard')}>
                Add Your First Needle
              </Button>
            </Card>
          ) : (
            needleGroups.map((group) => {
              const isExpanded = expandedNeedleId === group.needle.id;
              const isVisible = expandedNeedleId === null || expandedNeedleId === group.needle.id;

              return (
                <NeedleCard
                  key={group.needle.id}
                  needle={group.needle}
                  binds={group.binds}
                  isExpanded={isExpanded}
                  isVisible={isVisible}
                  onToggle={() => handleNeedleToggle(group.needle.id)}
                  onBindPress={handleBindPress}
                />
              );
            })
          )}
        </View>

        {/* Your Thread Section */}
        <View>
          <Heading
            variant="displayLg"
            style={{ color: colors.text.primary, marginBottom: spacing[3] }}
          >
            Your Thread
          </Heading>

          {/* Daily Check-In Card */}
          <Card variant="default" style={styles.checkInCard}>
            {/* Status Header - Timer + Badges */}
            <View style={styles.statusHeader}>
              {/* Red dot indicator - only show if not completed */}
              {!hasCompletedReflection && (
                <View style={[styles.statusBadge, { backgroundColor: colors.semantic.error.base }]}>
                  <Body weight="semibold" style={{ color: 'white', fontSize: 11 }}>
                    Pending
                  </Body>
                </View>
              )}

              {/* Completion badge - only show if completed */}
              {hasCompletedReflection && (
                <View style={[styles.statusBadge, { backgroundColor: colors.accent[500] }]}>
                  <Body weight="semibold" style={{ color: 'white', fontSize: 11 }}>
                    ✓ Completed
                  </Body>
                </View>
              )}
            </View>

            {/* Countdown Timer */}
            <CountdownTimer style={{ marginBottom: spacing[5] }} />

            {/* Title */}
            <Heading
              variant="displayLg"
              style={{
                color: colors.text.primary,
                textAlign: 'center',
                marginBottom: spacing[4],
              }}
            >
              Daily Check-In
            </Heading>

            {/* Begin/Edit Button */}
            <Button
              variant={hasCompletedReflection ? 'secondary' : 'primary'}
              size="lg"
              onPress={() => router.push('/(tabs)/settings/reflection')}
            >
              {hasCompletedReflection ? 'Edit Reflection' : 'Begin'}
            </Button>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  combinedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
  },
  progressInfo: {
    marginTop: 2,
  },
  progressBadgeLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  aiInsightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkInCard: {
    position: 'relative',
    alignItems: 'center',
  },
  statusHeader: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
});
