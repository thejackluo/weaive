/**
 * DashboardScreen (Epic 2 + 5: Goal Management + Progress Visualization)
 *
 * Main dashboard showing:
 * - Header with Level, Weave character, streak, profile
 * - Your Needles section (up to 3 cards)
 * - Overall Consistency section with filters
 * - Average Fulfillment chart
 * - History section
 *
 * Wireframe: docs/pages/dashboard-page.md
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Text, Card } from '@/design-system';
import { useTheme } from '@/design-system/theme/ThemeProvider';
import { useActiveGoals } from '@/hooks/useActiveGoals';
import { Ionicons } from '@expo/vector-icons';

type ConsistencyFilter = 'Overall' | 'Needle' | 'Bind' | 'Thread';
type TimeframeOption = '7d' | '2w' | '1m' | '90d';

export function DashboardScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { data: goalsData, isLoading } = useActiveGoals();

  const [consistencyFilter, setConsistencyFilter] = useState<ConsistencyFilter>('Overall');
  const [timeframe, setTimeframe] = useState<TimeframeOption>('7d');

  const goals = goalsData?.data || [];

  // Mock data for MVP - will be replaced with real data
  const userLevel = 2;
  const userStreak = 12;
  const consistencyPercentage = 73;
  const consistencyTrend = '+17%';
  const averageFulfillment = 7.7;

  const handleNeedlePress = (goalId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/needles/${goalId}`);
  };

  const handleProfilePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/settings');
  };

  const handleAddGoal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/needles/create');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={styles.header}>
        {/* Left: Level */}
        <Text variant="textBase" weight="semibold" style={styles.levelText}>
          Level {userLevel}
        </Text>

        {/* Center: Weave Character Visualization (Placeholder) */}
        <View style={styles.weaveCharacter}>
          <View style={[styles.weaveCircle, { borderColor: colors.violet[500] }]}>
            <Text variant="textSm" style={{ color: colors.violet[500] }}>
              Strand
            </Text>
          </View>
        </View>

        {/* Right: Streak + Profile */}
        <View style={styles.headerRight}>
          <View style={styles.streakBadge}>
            <Text variant="textSm" weight="semibold">
              {userStreak} 🔥
            </Text>
          </View>
          <Pressable
            onPress={handleProfilePress}
            style={[styles.profileButton, { backgroundColor: colors.accent[500] }]}
          >
            <Ionicons name="person-outline" size={20} color="white" />
          </Pressable>
        </View>
      </View>

      {/* Your Needles Section */}
      <View style={styles.section}>
        <Text variant="textLg" weight="semibold" style={styles.sectionTitle}>
          Your Needles
        </Text>

        {isLoading ? (
          <View style={styles.needlesContainer}>
            {[1, 2, 3].map((i) => (
              <Card key={i} variant="glass" style={styles.needleCardInner}>
                <View style={styles.needleContent}>
                  {/* Skeleton color bar */}
                  <View
                    style={[
                      styles.needleColorBar,
                      { backgroundColor: colors.border.muted, opacity: 0.5 },
                    ]}
                  />

                  {/* Skeleton content */}
                  <View style={styles.needleInfo}>
                    <View
                      style={[
                        styles.skeletonLine,
                        { backgroundColor: colors.border.muted, width: '70%', height: 16 },
                      ]}
                    />
                    <View
                      style={[
                        styles.skeletonLine,
                        {
                          backgroundColor: colors.border.muted,
                          width: '90%',
                          height: 12,
                          marginTop: 8,
                        },
                      ]}
                    />
                  </View>

                  {/* Skeleton arrow */}
                  <View
                    style={[
                      styles.skeletonLine,
                      { backgroundColor: colors.border.muted, width: 20, height: 20 },
                    ]}
                  />
                </View>
              </Card>
            ))}
          </View>
        ) : goals.length === 0 ? (
          <>
            <Card variant="glass" style={styles.emptyCard}>
              <Text variant="textBase" style={[styles.emptyText, { color: colors.text.secondary }]}>
                No active needles yet
              </Text>
            </Card>
            <Pressable onPress={handleAddGoal} style={styles.addGoalButton}>
              <Card variant="glass" style={styles.addGoalCard}>
                <View style={styles.addGoalContent}>
                  <Ionicons name="add-circle-outline" size={24} color={colors.accent[500]} />
                  <Text variant="textBase" weight="semibold" style={{ color: colors.accent[500] }}>
                    Add Your First Needle
                  </Text>
                </View>
              </Card>
            </Pressable>
          </>
        ) : (
          <View style={styles.needlesContainer}>
            {goals.slice(0, 3).map((goal) => (
              <Pressable
                key={goal.id}
                onPress={() => handleNeedlePress(goal.id)}
                style={styles.needleCard}
              >
                <Card variant="glass" style={styles.needleCardInner}>
                  <View style={styles.needleContent}>
                    {/* Color bar */}
                    <View
                      style={[styles.needleColorBar, { backgroundColor: colors.accent[500] }]}
                    />

                    {/* Needle info */}
                    <View style={styles.needleInfo}>
                      <Text variant="textBase" weight="semibold">
                        {goal.title}
                      </Text>
                      {goal.description && (
                        <Text variant="textSm" color="secondary" style={styles.needleWhy}>
                          {goal.description}
                        </Text>
                      )}
                    </View>

                    {/* Arrow */}
                    <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
                  </View>
                </Card>
              </Pressable>
            ))}

            {/* Add Goal button if less than 3 active goals */}
            {goals.length < 3 && (
              <Pressable onPress={handleAddGoal} style={styles.addGoalButton}>
                <Card variant="glass" style={styles.addGoalCard}>
                  <View style={styles.addGoalContent}>
                    <Ionicons name="add-circle-outline" size={20} color={colors.accent[500]} />
                    <Text variant="textBase" weight="medium" style={{ color: colors.accent[500] }}>
                      Add Needle
                    </Text>
                  </View>
                </Card>
              </Pressable>
            )}
          </View>
        )}
      </View>

      {/* Overall Consistency Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="textLg" weight="semibold">
            Overall Consistency
          </Text>
          <Pressable
            style={styles.timeframeDropdown}
            onPress={() => {
              Haptics.selectionAsync();
              // Cycle through timeframe options
              const options: TimeframeOption[] = ['7d', '2w', '1m', '90d'];
              const currentIndex = options.indexOf(timeframe);
              const nextIndex = (currentIndex + 1) % options.length;
              setTimeframe(options[nextIndex]);
            }}
          >
            <Text variant="textSm" color="secondary">
              {timeframe}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.text.secondary} />
          </Pressable>
        </View>

        {/* Consistency percentage */}
        <View style={styles.consistencyStats}>
          <Text variant="displayLg" weight="bold">
            {consistencyPercentage}%
          </Text>
          <Text variant="textBase" style={[styles.trendIndicator, { color: colors.emerald[500] }]}>
            {consistencyTrend}
          </Text>
        </View>

        {/* Filter tabs */}
        <View style={styles.filterTabs}>
          {(['Overall', 'Needle', 'Bind', 'Thread'] as ConsistencyFilter[]).map((filter) => (
            <Pressable
              key={filter}
              onPress={() => {
                Haptics.selectionAsync();
                setConsistencyFilter(filter);
              }}
              style={[
                styles.filterTab,
                consistencyFilter === filter && [
                  styles.filterTabActive,
                  { backgroundColor: colors.accent[500] },
                ],
              ]}
            >
              <Text
                variant="textSm"
                weight={consistencyFilter === filter ? 'semibold' : 'regular'}
                style={{
                  color: consistencyFilter === filter ? colors.text.primary : colors.text.muted,
                }}
              >
                {filter}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Visualization placeholder */}
        <Card variant="glass" style={styles.visualizationCard}>
          <Text variant="textBase" style={[styles.placeholderText, { color: '#F5F5F5' }]}>
            {timeframe === '7d' ? '7-day table view' : 'Heat map visualization'}
          </Text>
          <Text variant="textSm" style={[styles.placeholderSubtext, { color: '#D4D4D4' }]}>
            Visualization coming soon
          </Text>
        </Card>

        {/* AI Insight card placeholder */}
        <Card variant="glass" style={styles.insightCard}>
          <View style={styles.insightContent}>
            <Ionicons name="sparkles" size={20} color={colors.violet[400]} />
            <Text variant="textSm" style={[styles.insightText, { color: colors.text.secondary }]}>
              AI insights coming soon
            </Text>
          </View>
        </Card>
      </View>

      {/* Average Fulfillment Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="textLg" weight="semibold">
            Average Fulfillment
          </Text>
          <Pressable
            style={styles.timeframeDropdown}
            onPress={() => {
              Haptics.selectionAsync();
              // Cycle through timeframe options
              const options: TimeframeOption[] = ['7d', '2w', '1m', '90d'];
              const currentIndex = options.indexOf(timeframe);
              const nextIndex = (currentIndex + 1) % options.length;
              setTimeframe(options[nextIndex]);
            }}
          >
            <Text variant="textSm" color="secondary">
              {timeframe}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.text.secondary} />
          </Pressable>
        </View>

        {/* Fulfillment score */}
        <View style={styles.consistencyStats}>
          <Text variant="displayLg" weight="bold">
            {averageFulfillment}
          </Text>
          <Text variant="textSm" color="secondary">
            / 10
          </Text>
        </View>

        {/* Chart placeholder */}
        <Card variant="glass" style={styles.visualizationCard}>
          <Text
            variant="textBase"
            style={[styles.placeholderText, { color: colors.text.secondary }]}
          >
            Line chart with 7-day rolling average
          </Text>
          <Text variant="textSm" style={[styles.placeholderSubtext, { color: colors.text.muted }]}>
            Chart coming soon
          </Text>
        </Card>

        {/* AI Insight card placeholder */}
        <Card variant="glass" style={styles.insightCard}>
          <View style={styles.insightContent}>
            <Ionicons name="sparkles" size={20} color={colors.violet[400]} />
            <Text variant="textSm" style={[styles.insightText, { color: colors.text.secondary }]}>
              AI insights coming soon
            </Text>
          </View>
        </Card>
      </View>

      {/* History Section */}
      <View style={[styles.section, styles.lastSection]}>
        <Text variant="textLg" weight="semibold" style={styles.sectionTitle}>
          History
        </Text>

        <Card variant="glass" style={styles.historyCard}>
          <Text
            variant="textBase"
            style={[styles.placeholderText, { color: colors.text.secondary }]}
          >
            No entries found
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  levelText: {
    flex: 1,
  },
  weaveCharacter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weaveCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  streakBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#27272A',
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  lastSection: {
    marginBottom: 0,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeframeDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#27272A',
  },
  needlesContainer: {
    gap: 12,
  },
  needleCard: {
    width: '100%',
  },
  needleCardInner: {
    padding: 0,
    overflow: 'hidden',
  },
  needleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  needleColorBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  needleInfo: {
    flex: 1,
    gap: 4,
  },
  needleWhy: {
    fontSize: 13,
  },
  loadingText: {
    textAlign: 'center',
    paddingVertical: 32,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
  consistencyStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 16,
  },
  trendIndicator: {
    fontSize: 18,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#27272A',
  },
  filterTabActive: {
    backgroundColor: '#8B5CF6',
  },
  filterTabActiveText: {
    color: '#FFFFFF',
  },
  visualizationCard: {
    padding: 40,
    alignItems: 'center',
    marginBottom: 12,
  },
  placeholderText: {
    textAlign: 'center',
    marginBottom: 4,
  },
  placeholderSubtext: {
    textAlign: 'center',
    fontSize: 12,
  },
  insightCard: {
    padding: 16,
  },
  insightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  insightText: {
    flex: 1,
  },
  historyCard: {
    padding: 40,
    alignItems: 'center',
  },
  skeletonLine: {
    borderRadius: 4,
  },
  addGoalButton: {
    width: '100%',
    marginTop: 12,
  },
  addGoalCard: {
    padding: 0,
    overflow: 'hidden',
  },
  addGoalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
});
