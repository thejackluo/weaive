/**
 * Thread Home Screen (US-3.1: View Today's Binds)
 *
 * Main daily action loop screen showing:
 * - Large greeting with progress percentage (prominent)
 * - Collapsible needle cards (hide-others behavior)
 * - Daily Check-In card with countdown timer
 *
 * Minimal aesthetic improvements:
 * - Dramatic typography hierarchy (48px greeting, 60px percentage)
 * - Increased spacing (32px between sections)
 * - Simplified needle cards (no "Why:" when collapsed)
 * - Prominent reflection button
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, Pressable, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, Card, Heading, Body, Caption, Button, Text } from '@/design-system';
import { NeedleCard } from '@/components/thread/NeedleCard';
import { YesterdayIntentionCard } from '@/components/thread/YesterdayIntentionCard';
import { CircularProgress } from '@/components/CircularProgress';
import { HomePageOnboardingOverlay } from '@/components/onboarding/HomePageOnboardingOverlay';
import { useInAppOnboarding } from '@/contexts/InAppOnboardingContext';
import { useTodayBinds } from '@/hooks/useTodayBinds';
import { useGetTodayJournal, useUpdateJournal, useSubmitJournal } from '@/hooks/useJournal';
import { useActiveGoals } from '@/hooks/useActiveGoals';
import type { Bind } from '@/types/binds';
import { mockUser, getGreeting } from '@/data/mockThreadData';

export function ThreadHomeScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  // Store expanded needles as a Set (all open by default)
  const [expandedNeedleIds, setExpandedNeedleIds] = useState<Set<string>>(new Set());

  // Track if we've done initial expansion (so we don't re-expand when user closes all)
  const hasInitializedExpansion = useRef(false);

  // User's name from onboarding
  const [userName, setUserName] = useState<string>('');

  // In-app onboarding
  const { currentStep, completeCurrentStep } = useInAppOnboarding();
  const showHomePageTour = currentStep === 'home_page_tour';

  // Tour step state
  type TourStep = 'intro' | 'highlight_bind' | 'bind_completed' | 'highlight_checkin';
  const [tourStep, setTourStep] = useState<TourStep>('intro');
  const hasNavigatedAwayRef = useRef(false);

  // Refs for onboarding element positions
  const scrollViewRef = useRef<ScrollView>(null);
  const [firstBindPosition, setFirstBindPosition] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [checkinPosition, setCheckinPosition] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // Shimmer animation for check-in highlight (same as bind highlighting)
  const checkinShimmerAnim = useRef(new Animated.Value(0.3)).current;

  // Reset tour step when entering home page tour
  React.useEffect(() => {
    if (showHomePageTour) {
      setTourStep('intro');
      hasNavigatedAwayRef.current = false;

      // Auto-expand first needle to show binds for spotlight
      if (needleGroups.length > 0) {
        const firstNeedleId = needleGroups[0].needle.id;
        setExpandedNeedleIds(new Set([firstNeedleId]));
      }
    }
  }, [showHomePageTour]);

  // When user returns to home screen after clicking bind, go to checkin highlight
  useFocusEffect(
    React.useCallback(() => {
      if (showHomePageTour && tourStep === 'highlight_bind' && hasNavigatedAwayRef.current) {
        // User is returning from bind screen, go directly to highlight checkin
        setTourStep('highlight_checkin');
        hasNavigatedAwayRef.current = false; // Reset flag
      }
    }, [showHomePageTour, tourStep])
  );

  // Shimmer animation for check-in highlight
  useEffect(() => {
    if (showHomePageTour && tourStep === 'highlight_checkin') {
      const shimmer = Animated.loop(
        Animated.sequence([
          Animated.timing(checkinShimmerAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(checkinShimmerAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      );
      shimmer.start();
      return () => shimmer.stop();
    }
  }, [showHomePageTour, tourStep]);

  // Load user's name from AsyncStorage
  React.useEffect(() => {
    const loadUserName = async () => {
      try {
        const onboardingDataStr = await AsyncStorage.getItem('onboarding_data');
        if (onboardingDataStr) {
          const data = JSON.parse(onboardingDataStr);
          if (data.preferred_name) {
            setUserName(data.preferred_name);
          }
        }
      } catch (error) {
        console.error('[ThreadHome] Failed to load user name:', error);
      }
    };
    loadUserName();
  }, []);

  // Countdown timer state
  const [timeRemaining, setTimeRemaining] = React.useState('');

  // Update countdown every minute
  React.useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const ms = tomorrow.getTime() - now.getTime();
      const totalMinutes = Math.floor(ms / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      setTimeRemaining(`${hours}h ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Fetch today's binds
  const { data, isLoading, isError, error, refetch } = useTodayBinds();

  // Fetch active goals (needles) - to show goals even without binds
  const { data: goalsData, isLoading: isLoadingGoals, refetch: refetchGoals } = useActiveGoals();

  // Check if today's journal entry exists (for completion status)
  const { data: todayJournal, refetch: refetchJournal } = useGetTodayJournal();

  // Journal mutations for saving intentions
  const updateJournalMutation = useUpdateJournal();
  const submitJournalMutation = useSubmitJournal();

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

  // Get today's date formatted as "Thursday, January 1"
  const getTodayDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    };
    return today.toLocaleDateString('en-US', options);
  };

  // Get abbreviated date for top right corner (e.g., "Thu, Jan 1")
  const getAbbreviatedDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    };
    return today.toLocaleDateString('en-US', options);
  };

  const todayDate = getTodayDate();
  const abbreviatedDate = getAbbreviatedDate();

  // Determine if reflection is complete (has today's journal entry)
  const hasCompletedReflection = !!todayJournal;
  console.log('[ThreadHome] Journal status:', {
    hasJournal: !!todayJournal,
    journalId: todayJournal?.id,
    hasCompletedReflection,
  });

  // Handle needle toggle (independent toggles)
  const handleNeedleToggle = (needleId: string) => {
    setExpandedNeedleIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(needleId)) {
        newSet.delete(needleId);
      } else {
        newSet.add(needleId);
      }
      return newSet;
    });
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
              why: bind.needle_description || 'Focus on your goals',
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
    if (goalsData?.data && Array.isArray(goalsData.data)) {
      goalsData.data.forEach((goal) => {
        if (!needleMap.has(goal.id)) {
          needleMap.set(goal.id, {
            needle: {
              id: goal.id,
              title: goal.title,
              why: goal.description || 'Focus on your goals',
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

  // Initialize all needles as expanded on first load (only once)
  React.useEffect(() => {
    if (needleGroups.length > 0 && !hasInitializedExpansion.current) {
      const allNeedleIds = new Set(needleGroups.map((group) => group.needle.id));
      setExpandedNeedleIds(allNeedleIds);
      hasInitializedExpansion.current = true;
    }
  }, [needleGroups]);

  // Handle bind press
  const handleBindPress = (bind: Bind) => {
    console.log('[ThreadHome] Navigate to bind:', bind.id);

    // If in onboarding tour, pass flag to bind screen and mark navigation
    if (showHomePageTour && tourStep === 'highlight_bind') {
      hasNavigatedAwayRef.current = true;
      router.push({
        pathname: `/(tabs)/binds/${bind.id}`,
        params: { fromOnboarding: 'true' },
      });
    } else {
      router.push(`/(tabs)/binds/${bind.id}`);
    }
  };

  // Handle saving intention (either update existing journal or store locally until journal is completed)
  const handleSaveIntention = async (intention: string) => {
    const startTime = performance.now();
    console.log('[ThreadHome] 💾 handleSaveIntention called', {
      hasExistingJournal: !!todayJournal?.id,
      intention: intention.substring(0, 50) + '...',
    });

    try {
      if (todayJournal?.id) {
        // Update existing journal entry
        console.log('[ThreadHome] 🔄 Updating existing journal:', todayJournal.id);
        await updateJournalMutation.mutateAsync({
          journalId: todayJournal.id,
          data: {
            default_responses: {
              ...todayJournal.default_responses,
              today_focus: intention,
            },
          },
        });

        const duration = (performance.now() - startTime).toFixed(0);
        console.log(`[ThreadHome] ✅ Save successful in ${duration}ms`);

        // Refetch both today's journal AND yesterday's intention cache
        refetchJournal();
        queryClient.invalidateQueries({ queryKey: ['journal-entries', 'yesterday-intention'] });
      } else {
        // 🐛 FIX: Don't create a journal entry just for intention
        // Store it in AsyncStorage with today's date as key (auto-expires on new day)
        // This is purely for display on Thread Home screen - NOT part of journal system
        console.log('[ThreadHome] 💾 Storing intention locally (display-only, no journal entry)');
        const today = new Date().toISOString().split('T')[0];
        await AsyncStorage.setItem(`@weave_today_focus_${today}`, intention);

        const duration = (performance.now() - startTime).toFixed(0);
        console.log(`[ThreadHome] ✅ Intention saved locally in ${duration}ms`);

        // Invalidate cache to trigger refetch (YesterdayIntentionCard will check AsyncStorage)
        queryClient.invalidateQueries({ queryKey: ['journal-entries', 'yesterday-intention'] });
      }
    } catch (error) {
      const duration = (performance.now() - startTime).toFixed(0);
      console.error(`[ThreadHome] ❌ Save failed after ${duration}ms:`, error);
      throw error; // Re-throw so the component can handle it
    }
  };

  // Loading state
  if (isLoading || isLoadingGoals) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background.primary }]}
        edges={['top']}
      >
        <View style={[styles.centerContent, { padding: spacing[4] }]}>
          <ActivityIndicator size="large" color={colors.neutral[0]} />
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

  // Calculate progress
  const totalBinds = data?.data?.length || 0;
  const completedBinds = data?.data?.filter((bind) => bind.completed).length || 0;
  const totalTasks = totalBinds + 1; // +1 for daily reflection
  const completedTasks = completedBinds + (hasCompletedReflection ? 1 : 0);
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Onboarding handlers
  const handleTourNext = () => {
    if (tourStep === 'intro') {
      setTourStep('highlight_bind');
    }
    // bind_completed step removed - popup shows on bind screen instead
  };

  const handleCheckinClick = () => {
    // User clicked the highlighted check-in button, navigate to reflection
    // The tooltip will show on the reflection screen
    router.push({
      pathname: '/(tabs)/settings/reflection',
      params: { fromOnboarding: 'true' },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]} edges={['top']}>
      {/* Home Page Onboarding Overlay */}
      <HomePageOnboardingOverlay
        visible={showHomePageTour}
        currentStep={tourStep}
        checkinPosition={checkinPosition || undefined}
        onNext={handleTourNext}
        onCheckinClick={handleCheckinClick}
      />

      {/* Subtle gradient background for depth */}
      <LinearGradient
        colors={[colors.background.primary, 'rgba(0, 0, 0, 0.95)', colors.background.primary]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: spacing[5],
            paddingTop: spacing[4],
            gap: spacing[4],
            paddingBottom: 70, // Extra padding for smaller absolute positioned tab bar
          },
        ]} // Balanced spacing
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting & Progress Card - Enhanced */}
        <Card
          variant="default"
          style={[
            styles.greetingCard,
            styles.enhancedCard,
            {
              opacity: showHomePageTour && tourStep === 'highlight_checkin' ? 0.3 : 1,
            },
          ]}
        >
          {/* Date Badge - Top Right Corner */}
          <View style={styles.dateBadge}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: 'rgba(255, 255, 255, 0.45)',
                letterSpacing: 0.3,
                textTransform: 'uppercase',
              }}
            >
              {abbreviatedDate}
            </Text>
          </View>

          {/* Greeting Text - First Line */}
          <Text
            style={{
              fontSize: 22,
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.7)',
              letterSpacing: -0.3,
              marginBottom: spacing[1],
            }}
          >
            {greeting},
          </Text>

          {/* Name - Second Line, More Prominent */}
          <Text
            style={{
              fontSize: 32,
              fontWeight: '500',
              color: '#FFFFFF',
              letterSpacing: -0.8,
              marginBottom: spacing[4],
              textShadowColor: 'rgba(0, 0, 0, 0.3)',
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 4,
            }}
          >
            {userName || user.name}
          </Text>

          {/* Circular Progress Ring with Timer */}
          <View style={styles.progressSection}>
            {/* Countdown Timer - Shows time left to complete today's tasks */}
            <Text
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: 15,
                fontWeight: '600',
                letterSpacing: -0.3,
                textAlign: 'center',
                marginBottom: spacing[3],
              }}
            >
              ⏰ {timeRemaining} left to complete
            </Text>

            <CircularProgress
              percentage={percentage}
              size={160}
              strokeWidth={8}
              label={`${percentage}%`}
              sublabel={`${completedTasks}/${totalTasks} tasks`}
            />
          </View>
        </Card>

        {/* Yesterday's Intention Card */}
        <View
          style={{
            opacity: showHomePageTour && (tourStep === 'highlight_bind' || tourStep === 'highlight_checkin') ? 0.3 : 1
          }}
          pointerEvents={showHomePageTour && (tourStep === 'highlight_bind' || tourStep === 'highlight_checkin') ? 'none' : 'auto'}
        >
          <YesterdayIntentionCard onQuickIntention={handleSaveIntention} />
        </View>

        {/* Your Needles Section */}
        <View style={{ gap: spacing[2] }}>
          {/* Section Header - Medium weight, softer white */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.9)', // Slightly softer than pure white
              letterSpacing: -0.5,
              textShadowColor: 'rgba(0, 0, 0, 0.2)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}
          >
            Your Needles
          </Text>

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
            <View style={{ gap: spacing[2] }}>
              {needleGroups.map((group, index) => {
                const isExpanded = expandedNeedleIds.has(group.needle.id);

                return (
                  <NeedleCard
                    key={group.needle.id}
                    needle={group.needle}
                    binds={group.binds}
                    isExpanded={isExpanded}
                    isVisible={true}
                    onToggle={() => handleNeedleToggle(group.needle.id)}
                    onBindPress={handleBindPress}
                    firstBindRef={
                      index === 0 && showHomePageTour
                        ? (ref) => {
                            if (ref) {
                              setTimeout(() => {
                                ref.measureInWindow((x, y, width, height) => {
                                  setFirstBindPosition({ x, y, width, height });
                                });
                              }, 100);
                            }
                          }
                        : undefined
                    }
                    isHighlightedFirstBind={
                      index === 0 && showHomePageTour && tourStep === 'highlight_bind'
                    }
                    isTourActive={showHomePageTour && (tourStep === 'highlight_bind' || tourStep === 'highlight_checkin')}
                  />
                );
              })}
            </View>
          )}
        </View>

        {/* Your Thread Section */}
        <View style={{ gap: spacing[2] }}>
          {/* Section Header - Medium weight, softer white */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.9)', // Slightly softer than pure white
              letterSpacing: -0.5,
              textShadowColor: 'rgba(0, 0, 0, 0.2)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}
          >
            Your Thread
          </Text>

          {/* Daily Check-In Card */}
          <Animated.View
            ref={(ref) => {
              // Capture position of check-in card for onboarding
              if (ref && showHomePageTour) {
                setTimeout(() => {
                  ref.measureInWindow((x, y, width, height) => {
                    setCheckinPosition({ x, y, width, height });
                  });
                }, 100);
              }
            }}
            style={{
              opacity: showHomePageTour && tourStep === 'highlight_bind' ? 0.3 : 1,
            }}
          >
            <Animated.View
              style={[
                styles.checkInCard,
                {
                  backgroundColor: colors.background.secondary,
                  borderColor: (showHomePageTour && tourStep === 'highlight_checkin')
                    ? checkinShimmerAnim.interpolate({
                        inputRange: [0.3, 1],
                        outputRange: ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 1)'],
                      })
                    : colors.border.subtle,
                  shadowColor: (showHomePageTour && tourStep === 'highlight_checkin') ? '#FFFFFF' : '#000',
                  shadowOpacity: (showHomePageTour && tourStep === 'highlight_checkin')
                    ? checkinShimmerAnim.interpolate({
                        inputRange: [0.3, 1],
                        outputRange: [0.6, 1],
                      })
                    : 0.2,
                  shadowRadius: (showHomePageTour && tourStep === 'highlight_checkin') ? 24 : 4,
                  elevation: (showHomePageTour && tourStep === 'highlight_checkin') ? 16 : 4,
                },
              ]}
            >
              <Pressable
                style={styles.checkInPressable}
                onPress={() => {
                  if (showHomePageTour && tourStep === 'highlight_checkin') {
                    handleCheckinClick();
                  } else {
                    router.push('/(tabs)/settings/reflection');
                  }
                }}
                disabled={showHomePageTour && tourStep === 'highlight_bind'}
              >
                <View style={styles.checkInContent}>
                  {/* Checkbox Circle - Empty when incomplete, filled with checkmark when complete */}
                  <View
                    style={[
                      styles.checkInCheckbox,
                      {
                        borderColor: hasCompletedReflection ? colors.green[500] : colors.border.muted,
                        backgroundColor: hasCompletedReflection ? colors.green[500] : 'transparent',
                      },
                    ]}
                  >
                    {hasCompletedReflection && (
                      <Text style={{ fontSize: 18, color: '#000000' }}>✓</Text>
                    )}
                  </View>

                  {/* Daily Check-in Title */}
                  <View style={styles.checkInDetails}>
                    <Body
                      weight="semibold"
                      style={{
                        color: colors.text.primary,
                        opacity: hasCompletedReflection ? 0.5 : 1,
                        fontSize: 16,
                        letterSpacing: -0.2,
                        textAlign: 'center',
                      }}
                    >
                      Daily Check-in
                    </Body>
                  </View>

                  {/* Completion Count */}
                  <Caption
                    style={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: 14,
                      fontWeight: '600',
                      marginRight: spacing[2],
                    }}
                  >
                    {hasCompletedReflection ? '1' : '0'}/1
                  </Caption>
                </View>
              </Pressable>
            </Animated.View>
          </Animated.View>
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
  greetingCard: {
    padding: 20, // Comfortable padding
    position: 'relative',
  },
  enhancedCard: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  dateBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  progressSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  checkInCard: {
    position: 'relative',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },
  checkInPressable: {
    width: '100%',
  },
  checkInContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkInCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInDetails: {
    flex: 1,
  },
});
