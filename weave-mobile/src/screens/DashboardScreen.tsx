/**
 * DashboardScreen (Epic 2 + 5: Goal Management + Progress Visualization)
 *
 * Main dashboard showing:
 * - Header with Level, Weave character, profile
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
  Animated,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useQueryClient } from '@tanstack/react-query';
import { Text, Card, Skeleton } from '@/design-system';
import { useTheme } from '@/design-system/theme/ThemeProvider';
import { useActiveGoals } from '@/hooks/useActiveGoals';
import { useUserStats } from '@/hooks/useUserStats';
import { useGetTodayJournal } from '@/hooks/useJournal';
import { consistencyQueryKeys } from '@/hooks/useConsistencyData';
import { bindsQueryKeys } from '@/hooks/useTodayBinds';
import { Ionicons } from '@expo/vector-icons';
import { ConsistencyHeatmap } from '@/components/ConsistencyHeatmap';
import { FulfillmentChart } from '@/components/FulfillmentChart';
import { HistoryList } from '@/components/HistoryList';
import { getLevelProgress } from '@/utils/levelProgression';
import { useInAppOnboarding } from '@/contexts/InAppOnboardingContext';
import { useAuth } from '@/contexts/AuthContext';

type ConsistencyFilter = 'Overall' | 'Needle' | 'Bind' | 'Thread';
type TimeframeOption = '7d' | '2w' | '1m';

export function DashboardScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const { data: goalsData, isLoading, refetch: refetchGoals } = useActiveGoals();
  const { data: userStatsData, isLoading: isStatsLoading } = useUserStats();
  const { data: todayJournal } = useGetTodayJournal();
  const { currentStep, completeCurrentStep, isOnboardingComplete } = useInAppOnboarding();
  const { user } = useAuth();

  // Onboarding state
  const [showOnboardingTooltip, setShowOnboardingTooltip] = useState(false);
  const [showTutorialCompleteModal, setShowTutorialCompleteModal] = useState(false);
  const [hasShownCompletion, setHasShownCompletion] = useState(false);
  const [hasLoadedCompletionFlag, setHasLoadedCompletionFlag] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(-20)).current;
  const completeFadeAnim = React.useRef(new Animated.Value(0)).current;
  const completeSlideAnim = React.useRef(new Animated.Value(-20)).current;
  const isMountedRef = React.useRef(true);

  // Load "has shown tutorial complete modal" flag from AsyncStorage on mount
  React.useEffect(() => {
    const loadCompletionFlag = async () => {
      try {
        const flag = await AsyncStorage.getItem('@weave:tutorial_complete_shown');
        setHasShownCompletion(flag === 'true');
        setHasLoadedCompletionFlag(true);
        console.log('[DASHBOARD] Loaded tutorial completion flag:', flag);
      } catch (error) {
        console.error('[DASHBOARD] Failed to load tutorial completion flag:', error);
        setHasLoadedCompletionFlag(true);
      }
    };
    loadCompletionFlag();
  }, []);

  // Track mounted state
  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 🐛 FIX: Force refetch all data when screen comes into focus
  // This ensures new/deleted/archived goals, bind completions, and consistency grid updates appear immediately
  useFocusEffect(
    React.useCallback(() => {
      const refetchAllData = async () => {
        console.log('[Dashboard] Screen focused - force refetching all data');
        // Force immediate refetch (not just invalidate) for all queries
        await Promise.all([
          refetchGoals(),
          queryClient.refetchQueries({ queryKey: consistencyQueryKeys.all }),
          queryClient.refetchQueries({ queryKey: bindsQueryKeys.all }),
          queryClient.refetchQueries({ queryKey: ['bindsGrid'], exact: false }),
          queryClient.refetchQueries({ queryKey: ['userStats'] }),
          queryClient.refetchQueries({ queryKey: ['journal'], exact: false }), // Include journal data
        ]);
        console.log('[Dashboard] All data refetched successfully');
      };

      refetchAllData();
    }, [refetchGoals, queryClient])
  );

  const [consistencyFilter, setConsistencyFilter] = useState<ConsistencyFilter>('Overall');
  const [consistencyTimeframe, setConsistencyTimeframe] = useState<TimeframeOption>('7d');
  const [fulfillmentTimeframe, setFulfillmentTimeframe] = useState<TimeframeOption>('7d');
  const [selectedNeedleId, setSelectedNeedleId] = useState<string | undefined>(undefined);
  const [selectedBindId, setSelectedBindId] = useState<string | undefined>(undefined);

  // History filters
  const [historyTimeframe, setHistoryTimeframe] = useState<'days' | 'weeks' | 'months'>('days');
  const [historyType, setHistoryType] = useState<'all' | 'threads' | 'binds'>('all');
  const [historySearch, setHistorySearch] = useState('');

  const goals = Array.isArray(goalsData?.data) ? goalsData.data : [];

  // Auto-select first needle when needle filter is active but no needle is selected
  React.useEffect(() => {
    if (consistencyFilter === 'Needle' && !selectedNeedleId && goals.length > 0) {
      setSelectedNeedleId(goals[0].id);
    }
  }, [consistencyFilter, selectedNeedleId, goals]);

  // Show onboarding tooltip when user arrives during dashboard_tour
  React.useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (currentStep === 'dashboard_tour') {
      console.log('[DASHBOARD_SCREEN] 🎓 Dashboard tour active - showing tooltip');
      // Small delay to ensure screen is rendered
      timeoutId = setTimeout(() => {
        if (isMounted) {
          setShowOnboardingTooltip(true);
          // Animate in
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
        }
      }, 500);
    }

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      // Stop any ongoing animations
      fadeAnim.stopAnimation();
      slideAnim.stopAnimation();
    };
  }, [currentStep]);

  // Show "Tutorial Complete" modal after dashboard_tour is completed
  React.useEffect(() => {
    let isMounted = true;
    let delayTimeout: ReturnType<typeof setTimeout> | undefined;

    // Debug: Log all conditions
    console.log('[DASHBOARD] Tutorial complete modal check:', {
      currentStep,
      isOnboardingComplete,
      hasLoadedCompletionFlag,
      hasShownCompletion,
      shouldShow:
        currentStep === 'complete_first_bind' &&
        !isOnboardingComplete &&
        hasLoadedCompletionFlag &&
        !hasShownCompletion,
    });

    // Show completion modal when user advances FROM dashboard_tour (currentStep will be 'complete_first_bind')
    // BUT only if:
    // 1. In-app tutorial isn't fully complete yet (prevents showing modal after tutorial is done)
    // 2. We've loaded the persisted flag from AsyncStorage
    // 3. We haven't shown the modal before (checked via persisted flag)
    if (
      currentStep === 'complete_first_bind' &&
      !isOnboardingComplete &&
      hasLoadedCompletionFlag &&
      !hasShownCompletion
    ) {
      console.log('[DASHBOARD_SCREEN] 🎉 Dashboard tour completed - showing tutorial complete modal after delay');

      // Save flag to AsyncStorage IMMEDIATELY so it doesn't show on next app restart
      AsyncStorage.setItem('@weave:tutorial_complete_shown', 'true').then(() => {
        console.log('[DASHBOARD] Saved tutorial completion flag to AsyncStorage');
      }).catch((error) => {
        console.error('[DASHBOARD] Failed to save tutorial completion flag:', error);
      });

      // CRITICAL: Set state flag AFTER modal appears (inside timeout)
      // This prevents re-render from cancelling the timeout

      // Wait 3 seconds before showing the completion modal
      delayTimeout = setTimeout(() => {
        if (isMounted) {
          setShowTutorialCompleteModal(true);

          // Animate in
          Animated.parallel([
            Animated.timing(completeFadeAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(completeSlideAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            // Set state flag AFTER animation completes
            // This prevents re-render from interrupting animation
            if (isMounted) {
              setHasShownCompletion(true);
            }
          });
        }
      }, 3000);
    }

    return () => {
      isMounted = false;
      if (delayTimeout) clearTimeout(delayTimeout);
      // Stop any ongoing animations
      completeFadeAnim.stopAnimation();
      completeSlideAnim.stopAnimation();
    };
  }, [currentStep, isOnboardingComplete, hasLoadedCompletionFlag, hasShownCompletion]);

  // User stats from API (with fallback to defaults)
  const userLevel = userStatsData?.data?.level || 1;
  const totalXP = userStatsData?.data?.total_xp || 0;
  const xpToNext = userStatsData?.data?.xp_to_next_level || 4;

  // Calculate level progress percentage (0-100) within current level
  const levelProgressPercent = getLevelProgress(totalXP, userLevel);

  // Journal completion status
  const hasCompletedJournal = !!todayJournal;

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
        {/* Left: Level + Progress Bar */}
        <View style={styles.headerLeft}>
          {isStatsLoading ? (
            <>
              {/* Skeleton level text */}
              <Skeleton width={60} height={14} borderRadius={4} />
              {/* Skeleton progress bar */}
              <Skeleton width={80} height={4} borderRadius={2} />
              {/* Skeleton XP text */}
              <Skeleton width={80} height={10} borderRadius={4} />
            </>
          ) : (
            <>
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
                      width: `${Math.max(5, levelProgressPercent)}%`,
                    },
                  ]}
                />
              </View>
              {/* XP to next level */}
              <Text variant="textXs" style={{ color: colors.text.muted, fontSize: 10 }}>
                {xpToNext} XP to Level {userLevel + 1}
              </Text>
            </>
          )}
        </View>

        {/* Right: Profile */}
        <View style={styles.headerRight}>
          <Pressable onPress={handleProfilePress} style={styles.profileButton}>
            <Ionicons name="person-outline" size={20} color="#000000" />
          </Pressable>
        </View>
      </View>

      {/* Your Needles Section */}
      <View style={styles.needlesSection}>
        {isLoading ? (
          <View style={styles.needlesContainer}>
            {[1, 2, 3].map((i) => (
              <Card key={i} variant="glass" style={styles.needleCardInner}>
                <View style={styles.needleContent}>
                  {/* Skeleton color bar */}
                  <Skeleton width={4} height={40} borderRadius={2} />

                  {/* Skeleton content */}
                  <View style={styles.needleInfo}>
                    <Skeleton width="70%" height={16} borderRadius={4} />
                    <Skeleton width="90%" height={12} borderRadius={4} style={{ marginTop: 8 }} />
                  </View>

                  {/* Skeleton arrow */}
                  <Skeleton width={20} height={20} borderRadius={4} />
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
                      <Text
                        variant="displayMd"
                        weight="bold"
                        style={{ fontSize: 20, color: '#FFFFFF', fontWeight: '800' }}
                      >
                        {goal.title}
                      </Text>
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
          filterId={
            consistencyFilter === 'Needle'
              ? selectedNeedleId
              : consistencyFilter === 'Bind'
                ? selectedBindId
                : undefined
          }
          onFilterChange={(filter) => {
            Haptics.selectionAsync();
            setConsistencyFilter(
              (filter.charAt(0).toUpperCase() + filter.slice(1)) as ConsistencyFilter
            );
            // When switching to needle filter, auto-select first needle for consistency percentage
            if (filter === 'needle' && goals.length > 0) {
              setSelectedNeedleId(goals[0].id);
              setSelectedBindId(undefined);
            } else if (filter === 'bind') {
              // Reset needle selection, bind will be selected by ConsistencyHeatmap component
              setSelectedNeedleId(undefined);
              // selectedBindId will be set by onBindChange callback
            } else {
              // Reset both selections when changing to overall or thread
              setSelectedNeedleId(undefined);
              setSelectedBindId(undefined);
            }
          }}
          onTimeframeChange={(timeframe) => {
            Haptics.selectionAsync();
            setConsistencyTimeframe(timeframe);
          }}
          onNeedleChange={(needleId) => {
            setSelectedNeedleId(needleId);
          }}
          onBindChange={(bindId) => {
            setSelectedBindId(bindId);
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
            ].map((type) => (
              <Pressable
                key={type.value}
                onPress={() => {
                  Haptics.selectionAsync();
                  setHistoryType(type.value as 'all' | 'threads' | 'binds');
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

      {/* Onboarding Tooltip */}
      {showOnboardingTooltip && (
        <View style={styles.onboardingOverlay} pointerEvents="box-none">
          {/* Semi-transparent backdrop - blocks ALL touch events */}
          <View style={styles.onboardingBackdrop} pointerEvents="auto" />

          {/* Centered Tooltip */}
          <Animated.View
            style={[
              styles.onboardingTooltipContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.onboardingTooltip}>
              {/* Icon */}
              <View style={styles.onboardingIconContainer}>
                <Ionicons name="stats-chart" size={32} color="#FFFFFF" />
              </View>

              {/* Message */}
              <Text style={styles.onboardingMessage}>View your progress overtime</Text>

              {/* Description */}
              <Text style={styles.onboardingDescription}>
                Track your consistency, fulfillment, and growth
              </Text>

              {/* Got It Button */}
              <Pressable
                onPress={async () => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    console.log('[DASHBOARD] 🎯 Starting step completion...');

                    // CRITICAL: Complete step FIRST (save to AsyncStorage)
                    await completeCurrentStep();
                    console.log('[DASHBOARD] ✅ Step completed and saved');

                    // THEN dismiss tooltip (prevents race condition)
                    if (isMountedRef.current) {
                      setShowOnboardingTooltip(false);
                      console.log('[DASHBOARD] ✅ Tooltip dismissed');
                    }
                  } catch (error) {
                    console.error('[DASHBOARD] ❌ Error completing dashboard tour:', error);
                    // Still dismiss tooltip even if step completion fails
                    if (isMountedRef.current) {
                      setShowOnboardingTooltip(false);
                    }
                  }
                }}
                style={styles.onboardingButton}
              >
                <Text style={styles.onboardingButtonText}>Got it</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      )}

      {/* Tutorial Complete Modal */}
      <Modal visible={showTutorialCompleteModal} transparent animationType="fade">
        <View style={styles.onboardingOverlay}>
          {/* Semi-transparent backdrop */}
          <View style={styles.onboardingBackdrop} />

          {/* Centered Modal */}
          <Animated.View
            style={[
              styles.onboardingTooltipContainer,
              {
                opacity: completeFadeAnim,
                transform: [{ translateY: completeSlideAnim }],
              },
            ]}
          >
            <View style={styles.onboardingTooltip}>
              {/* Icon */}
              <View style={styles.onboardingIconContainer}>
                <Ionicons name="checkmark-circle" size={32} color="#10b981" />
              </View>

              {/* Message */}
              <Text style={styles.onboardingMessage}>Tutorial complete!</Text>

              {/* Description */}
              <Text style={styles.onboardingDescription}>
                • Complete the binds for the day{'\n'}• Complete your daily reflection{'\n'}• Watch
                your progress over time{'\n'}• Adjust along the way
              </Text>

              {/* Got It Button */}
              <Pressable
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowTutorialCompleteModal(false);
                    console.log('[DASHBOARD] ✅ Tutorial complete modal dismissed');
                  } catch (error) {
                    console.error('[DASHBOARD] ❌ Error dismissing tutorial modal:', error);
                  }
                }}
                style={styles.onboardingButton}
              >
                <Text style={styles.onboardingButtonText}>Got it</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
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
    backgroundColor: '#2A2A2A', // Dark gray (design system)
    borderRadius: 2,
    overflow: 'hidden',
    width: 80,
  },
  levelBarFill: {
    height: '100%',
    borderRadius: 2,
    minWidth: 4,
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    gap: 8,
  },
  journalBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)', // Green with 20% opacity
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18, // Perfect circle
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF', // White circle for profile
  },
  needlesSection: {
    paddingHorizontal: 20,
    marginTop: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  lastSection: {
    marginBottom: 0,
  },
  sectionTitle: {
    marginBottom: 12,
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
    backgroundColor: '#2A2A2A', // Dark gray (design system)
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
    backgroundColor: '#2A2A2A', // Dark gray (design system)
  },
  filterTabActive: {
    backgroundColor: '#FFFFFF', // White for active (minimal aesthetic)
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
    borderRadius: 20, // iOS 17 style rounded pills
    backgroundColor: '#2A2A2A', // Dark gray (design system)
  },
  filterPillActive: {
    backgroundColor: '#FFFFFF', // White background for active state
    // Text color handled inline: black (#000000) for high contrast
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
  addGoalButton: {
    width: '100%',
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
  // Onboarding styles
  onboardingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  onboardingBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  onboardingTooltipContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 100,
  },
  onboardingTooltip: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  onboardingIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  onboardingMessage: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  onboardingDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  onboardingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  onboardingButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});
