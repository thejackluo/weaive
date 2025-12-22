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
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Text, Card } from '@/design-system';
import { useTheme } from '@/design-system/theme/ThemeProvider';
import { useActiveGoals } from '@/hooks/useActiveGoals';
import { useUserStats } from '@/hooks/useUserStats';
import { Ionicons } from '@expo/vector-icons';
import { ConsistencyHeatmap } from '@/components/ConsistencyHeatmap';
import { FulfillmentChart } from '@/components/FulfillmentChart';
import { WeaveCharacter } from '@/components/WeaveCharacter';
import { HistoryList } from '@/components/HistoryList';

type ConsistencyFilter = 'Overall' | 'Needle' | 'Bind' | 'Thread';
type TimeframeOption = '7d' | '2w' | '1m';

export function DashboardScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { data: goalsData, isLoading } = useActiveGoals();
  const { data: userStatsData, isLoading: isStatsLoading } = useUserStats();

  const [consistencyFilter, setConsistencyFilter] = useState<ConsistencyFilter>('Overall');
  const [consistencyTimeframe, setConsistencyTimeframe] = useState<TimeframeOption>('7d');
  const [fulfillmentTimeframe, setFulfillmentTimeframe] = useState<TimeframeOption>('7d');

  // History filters
  const [historyTimeframe, setHistoryTimeframe] = useState<'days' | 'weeks' | 'months'>('days');
  const [historyType, setHistoryType] = useState<'all' | 'threads' | 'binds' | 'weave_chats'>(
    'all'
  );
  const [historySearch, setHistorySearch] = useState('');

  const goals = goalsData?.data || [];

  // User stats from API (with fallback to defaults)
  const userLevel = userStatsData?.data?.level || 1;
  const userStreak = userStatsData?.data?.current_streak || 0;
  const characterState = userStatsData?.data?.weave_character_state || 'strand';

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
        {/* Left: Level + Progress Bar + Streak */}
        <View style={styles.headerLeft}>
          {/* Level text */}
          <Text variant="textSm" style={{ color: colors.text.secondary }}>
            Level {userLevel}
          </Text>
          {/* Level progress bar */}
          <View style={styles.levelBarBackground}>
            <View
              style={[
                styles.levelBarFill,
                {
                  backgroundColor: colors.accent[500],
                  width: `${(userLevel % 10) * 10 || 5}%`, // Progress within current level
                },
              ]}
            />
          </View>
          {/* Streak badge */}
          <View style={styles.streakBadge}>
            <Text variant="textSm" weight="semibold">
              {userStreak} 🔥
            </Text>
          </View>
        </View>

        {/* Center: Weave Character Visualization */}
        <View style={styles.weaveCharacterContainer}>
          {isStatsLoading ? (
            <ActivityIndicator size="small" color={colors.accent[500]} />
          ) : (
            <WeaveCharacter characterState={characterState} size={64} />
          )}
        </View>

        {/* Right: Profile */}
        <View style={styles.headerRight}>
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
        {/* Consistency Heatmap (contains title, percentage, filters, grid, and insight) */}
        <ConsistencyHeatmap
          timeframe={consistencyTimeframe}
          filterType={consistencyFilter.toLowerCase() as 'overall' | 'needle' | 'bind' | 'thread'}
          onFilterChange={(filter) => {
            Haptics.selectionAsync();
            setConsistencyFilter(
              (filter.charAt(0).toUpperCase() + filter.slice(1)) as ConsistencyFilter
            );
          }}
          onTimeframeChange={(timeframe) => {
            Haptics.selectionAsync();
            setConsistencyTimeframe(timeframe);
          }}
        />
      </View>

      {/* Average Fulfillment Section */}
      <View style={styles.section}>
        {/* Fulfillment Chart */}
        <FulfillmentChart
          timeframe={fulfillmentTimeframe}
          onTimeframeChange={(timeframe) => {
            Haptics.selectionAsync();
            setFulfillmentTimeframe(timeframe);
          }}
        />
      </View>

      {/* History Section */}
      <View style={[styles.section, styles.lastSection]}>
        <Card variant="glass" style={styles.historyCardContainer}>
          {/* Title */}
          <Text
            variant="textLg"
            weight="semibold"
            style={[styles.historyTitle, { color: '#FFFFFF' }]}
          >
            History
          </Text>

          {/* Timeframe filters */}
          <View style={styles.filterRow}>
            {['days', 'weeks', 'months'].map((timeframe) => (
              <Pressable
                key={timeframe}
                onPress={() => {
                  Haptics.selectionAsync();
                  setHistoryTimeframe(timeframe as 'days' | 'weeks' | 'months');
                }}
                style={[
                  styles.filterPill,
                  historyTimeframe === timeframe && styles.filterPillActive,
                ]}
              >
                <Text
                  variant="textSm"
                  weight={historyTimeframe === timeframe ? 'semibold' : 'medium'}
                  style={{
                    color: historyTimeframe === timeframe ? '#000000' : colors.text.secondary,
                  }}
                >
                  {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Type filters */}
          <View style={styles.filterRow}>
            {[
              { value: 'all', label: 'All' },
              { value: 'threads', label: 'Threads' },
              { value: 'binds', label: 'Binds' },
              { value: 'weave_chats', label: 'Weave Chats' },
            ].map((type) => (
              <Pressable
                key={type.value}
                onPress={() => {
                  Haptics.selectionAsync();
                  setHistoryType(type.value as 'all' | 'threads' | 'binds' | 'weave_chats');
                }}
                style={[styles.filterPill, historyType === type.value && styles.filterPillActive]}
              >
                <Text
                  variant="textSm"
                  weight={historyType === type.value ? 'semibold' : 'medium'}
                  style={{
                    color: historyType === type.value ? '#000000' : colors.text.secondary,
                  }}
                >
                  {type.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Search bar */}
          <View style={[styles.searchBar, { backgroundColor: colors.background.elevated }]}>
            <Ionicons
              name="search-outline"
              size={20}
              color={colors.text.muted}
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search..."
              placeholderTextColor={colors.text.muted}
              value={historySearch}
              onChangeText={setHistorySearch}
              style={[styles.searchInput, { color: colors.text.primary }]}
            />
          </View>

          {/* History List */}
          <HistoryList limit={10} timeframe={historyTimeframe} type={historyType} />
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
  headerLeft: {
    flex: 1,
    gap: 6,
  },
  levelBarBackground: {
    height: 4,
    backgroundColor: '#27272A',
    borderRadius: 2,
    overflow: 'hidden',
    width: 80,
  },
  levelBarFill: {
    height: '100%',
    borderRadius: 2,
    minWidth: 4,
  },
  weaveCharacterContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  streakBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#27272A',
    alignSelf: 'flex-start',
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
  dropdownMenu: {
    position: 'absolute',
    top: 36,
    right: 0,
    minWidth: 80,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
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
  historyCardContainer: {
    padding: 20,
  },
  historyTitle: {
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#27272A',
  },
  filterPillActive: {
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter',
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
