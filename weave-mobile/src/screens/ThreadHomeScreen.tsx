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
import type { Bind } from '@/types/binds';
import { mockUser, getGreeting, getRandomInsight } from '@/data/mockThreadData';

export function ThreadHomeScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const [expandedNeedleId, setExpandedNeedleId] = useState<string | null>(null);

  // Fetch today's binds
  const { data, isLoading, isError, error, refetch } = useTodayBinds();

  // Check if today's journal entry exists (for completion status)
  const { data: todayJournal, refetch: refetchJournal } = useGetTodayJournal();

  // Refetch journal status when screen comes into focus
  // This ensures the red dot disappears after submitting reflection
  useFocusEffect(
    React.useCallback(() => {
      console.log('[ThreadHome] Screen focused - refetching journal status');
      refetchJournal();
    }, [refetchJournal])
  );

  // Mock user data (will be replaced with real user data in future)
  const user = mockUser;
  const greeting = getGreeting();
  const aiInsight = getRandomInsight();

  // Determine if reflection is complete (has today's journal entry)
  const hasCompletedReflection = !!todayJournal;
  console.log('[ThreadHome] Journal status:', {
    hasJournal: !!todayJournal,
    journalId: todayJournal?.id,
    hasCompletedReflection,
  });

  // Get current week dates (Su-Sa)
  const getCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday
    const weekDates = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - dayOfWeek + i);
      weekDates.push({
        day: ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'][i],
        date: date.getDate(),
        isToday: i === dayOfWeek,
      });
    }

    return weekDates;
  };

  const weekDates = getCurrentWeek();

  // Handle needle toggle
  const handleNeedleToggle = (needleId: string) => {
    setExpandedNeedleId((prev) => (prev === needleId ? null : needleId));
  };

  // Group binds by needle
  const groupBindsByNeedle = () => {
    if (!data?.data) return [];

    // Group binds by needle_id
    const needleMap = new Map<string, { needle: any; binds: Bind[] }>();

    data.data.forEach((bind) => {
      const needleId = bind.needle_id || 'no-needle';

      if (!needleMap.has(needleId)) {
        needleMap.set(needleId, {
          needle: {
            id: needleId,
            title: bind.needle_title,
            why: 'Focus on your goals', // TODO: Get from goals API
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

    return Array.from(needleMap.values());
  };

  const needleGroups = groupBindsByNeedle();

  // Handle bind press
  const handleBindPress = (bind: Bind) => {
    router.push(`/(tabs)/thread/bind/${bind.id}`);
  };

  // Handle AI insight tap
  const handleAIInsightPress = () => {
    console.log('AI Insight tapped - open Weave AI modal');
    // TODO: Open Weave AI modal with this insight as context
  };

  // Handle profile press
  const handleProfilePress = () => {
    router.push('/(tabs)/settings');
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background.primary }]}
        edges={['top']}
      >
        <View style={[styles.centerContent, { padding: spacing[4] }]}>
          <ActivityIndicator size="large" color={colors.accent[500]} />
          <Body style={{ color: colors.text.secondary, marginTop: spacing[4] }}>
            Loading today's binds...
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
        contentContainerStyle={[styles.content, { padding: spacing[4] }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { marginBottom: spacing[6] }]}>
          {/* Streak counter */}
          <View style={styles.streakBadge}>
            <Body weight="semibold" style={{ color: colors.text.primary }}>
              {user.streak} 🔥
            </Body>
          </View>

          {/* Greeting */}
          <View style={styles.greetingContainer}>
            <Body style={{ color: colors.text.secondary }}>{greeting},</Body>
            <Heading variant="displayLg" style={{ color: colors.text.primary }}>
              {user.name}.
            </Heading>
          </View>

          {/* Profile button */}
          <Pressable
            style={[styles.profileButton, { backgroundColor: colors.accent[500] }]}
            onPress={handleProfilePress}
          >
            <Body weight="bold" style={{ color: 'white' }}>
              {user.name.charAt(0).toUpperCase()}
            </Body>
          </Pressable>
        </View>

        {/* Calendar Widget */}
        <View style={[styles.calendar, { marginBottom: spacing[5] }]}>
          {weekDates.map((item, index) => (
            <View key={index} style={styles.calendarDay}>
              <Caption style={{ color: colors.text.muted, marginBottom: spacing[1] }}>
                {item.day}
              </Caption>
              <View
                style={[
                  styles.dateCircle,
                  {
                    backgroundColor: item.isToday
                      ? colors.text.primary
                      : colors.background.secondary,
                    borderColor: colors.border.subtle,
                  },
                ]}
              >
                <Body
                  style={{
                    color: item.isToday ? colors.background.primary : colors.text.primary,
                  }}
                >
                  {item.date}
                </Body>
              </View>
            </View>
          ))}
        </View>

        {/* AI Insight Card */}
        <Card
          variant="ai"
          pressable
          onPress={handleAIInsightPress}
          style={{ marginBottom: spacing[5] }}
        >
          <View style={styles.aiInsightContent}>
            <Body style={{ fontSize: 24, marginRight: spacing[2] }}>🧶</Body>
            <Body style={{ flex: 1, color: colors.violet[200] }}>{aiInsight}</Body>
          </View>
        </Card>

        {/* Your Needles Section */}
        <View style={{ marginBottom: spacing[5] }}>
          <Heading
            variant="displayLg"
            style={{ color: colors.text.primary, marginBottom: spacing[4] }}
          >
            Your Needles
          </Heading>

          {needleGroups.length === 0 ? (
            <Card variant="default" style={{ padding: spacing[5], alignItems: 'center' }}>
              <Heading
                variant="displayLg"
                style={{ color: colors.text.primary, marginBottom: spacing[3] }}
              >
                No Binds Today
              </Heading>
              <Body
                style={{
                  color: colors.text.secondary,
                  marginBottom: spacing[4],
                  textAlign: 'center',
                }}
              >
                You don't have any tasks scheduled for today. Create a goal and add consistent
                actions to get started!
              </Body>
              <Button variant="primary" onPress={() => router.push('/(tabs)/needles')}>
                View Goals
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
        <View style={{ marginBottom: spacing[8] }}>
          <Heading
            variant="displayLg"
            style={{ color: colors.text.primary, marginBottom: spacing[4] }}
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
    paddingBottom: 32,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingContainer: {
    flex: 1,
    alignItems: 'center',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calendarDay: {
    alignItems: 'center',
  },
  dateCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
