/**
 * Weave Path Generation Screen (Story 1.8a)
 *
 * Displays AI-generated goal breakdown with loading state and inline editing.
 * Features:
 * - Loading animation while processing (WeavePathLoadingScreen)
 * - Card-based breakdown display (goal, milestones, binds)
 * - Inline editing for all sections
 * - Error handling (AI failure, timeout, offline)
 * - Navigation to Story 1.9 (First Commitment Ritual)
 *
 * CRITICAL: Uses MOCK DATA since Story 1.8b (AI backend) not implemented yet
 *
 * Navigation:
 * - From: first-needle.tsx (Story 1.7)
 * - To: Story 1.9 (First Commitment Ritual) [NOT YET IMPLEMENTED]
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  AccessibilityInfo,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import NetInfo from '@react-native-community/netinfo';
import { WeavePathLoadingScreen } from '../../src/components/WeavePathLoadingScreen';
import { GoalBreakdownCard } from '../../src/components/onboarding/GoalBreakdownCard';
import { MilestoneCard } from '../../src/components/onboarding/MilestoneCard';
import { BindCard } from '../../src/components/onboarding/BindCard';

// ============================================================================
// DESIGN CONSTANTS
// ============================================================================

const COLORS = {
  primary: '#4CAF50',
  text: {
    primary: '#000000',
    secondary: '#333333',
    tertiary: '#666666',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
  },
  border: {
    default: '#E0E0E0',
  },
} as const;

const FONT_SIZE = {
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
} as const;

const SPACING = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

// Timing constants
const MIN_LOADING_TIME_MS = 1000; // Minimum 1 second display
const TIMEOUT_WARNING_MS = 10000; // 10 seconds
const TIMEOUT_ERROR_MS = 15000; // 15 seconds

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Milestone {
  id: string;
  title: string;
  description?: string;
}

interface Bind {
  id: string;
  name: string;
  description: string;
  frequency?: string;
}

interface GoalBreakdown {
  goal_title: string;
  goal_summary: string;
  milestones: Milestone[];
  binds: Bind[];
  ai_model_used?: string;
  generation_time_ms?: number;
}

type LoadingState = 'idle' | 'loading' | 'success' | 'error' | 'timeout';

// ============================================================================
// MOCK DATA (Story 1.8b not implemented)
// ============================================================================

/**
 * Mock AI-generated goal breakdown
 * TODO: Replace with actual API call to Story 1.8b endpoint when available
 */
const MOCK_GOAL_BREAKDOWN: GoalBreakdown = {
  goal_title: 'Build a Consistent Fitness Routine',
  goal_summary:
    'Establish sustainable exercise habits that fit your schedule and gradually increase in intensity over time. This path focuses on building consistency first, then adding variety and challenge as the habit solidifies.',
  milestones: [
    {
      id: 'm-1',
      title: 'Complete First Week',
      description: '7 consecutive days of movement',
    },
    {
      id: 'm-2',
      title: 'Hit 21-Day Mark',
      description: 'Habit formation threshold',
    },
    {
      id: 'm-3',
      title: '30-Day Milestone',
      description: 'Full month of consistency',
    },
  ],
  binds: [
    {
      id: 'b-1',
      name: 'Morning Movement',
      description: '10-minute stretch or walk to start your day',
      frequency: 'Daily',
    },
    {
      id: 'b-2',
      name: 'Track Workout',
      description: 'Log each session in the app',
      frequency: 'Daily',
    },
    {
      id: 'b-3',
      name: 'Weekly Reflection',
      description: 'Check in on your progress and adjust as needed',
      frequency: 'Weekly',
    },
  ],
  ai_model_used: 'mock',
  generation_time_ms: 0,
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function WeavePathGenerationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Extract goal input from Story 1.7
  const _goalText = (params.display_text as string) || (params.goalText as string) || '';
  const _customizationText = (params.customization_text as string) || '';

  // Loading state
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [elapsedTimeMs, setElapsedTimeMs] = useState(0);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [showTimeoutError, setShowTimeoutError] = useState(false);

  // Breakdown data
  const [breakdown, setBreakdown] = useState<GoalBreakdown | null>(null);

  // Edit tracking
  const [editedSections, setEditedSections] = useState<Set<string>>(new Set());

  // Accessibility
  const [reducedMotionEnabled, setReducedMotionEnabled] = useState(false);

  // Network connectivity (AC #9)
  const [isOffline, setIsOffline] = useState(false);

  // ============================================================================
  // INITIALIZATION & AI CALL (MOCKED)
  // ============================================================================

  useEffect(() => {
    // Check for reduced motion preference
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        setReducedMotionEnabled(enabled || false);
      })
      .catch((error) => {
        console.warn('[ACCESSIBILITY] Failed to check reduced motion preference:', error);
        setReducedMotionEnabled(false);
      });

    // Network connectivity listener (AC #9)
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      const offline = !state.isConnected || !state.isInternetReachable;
      setIsOffline(offline);
      if (__DEV__) {
        console.log('[NETWORK] Connection status:', {
          isConnected: state.isConnected,
          isInternetReachable: state.isInternetReachable,
          offline,
        });
      }
    });

    // Simulate AI processing
    simulateAIProcessing();

    // Elapsed time tracker
    const startTime = Date.now();
    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setElapsedTimeMs(elapsed);

      // Show timeout warning at 10 seconds
      if (elapsed >= TIMEOUT_WARNING_MS && !showTimeoutWarning) {
        setShowTimeoutWarning(true);
      }

      // Show timeout error at 15 seconds
      if (elapsed >= TIMEOUT_ERROR_MS) {
        setShowTimeoutError(true);
        setLoadingState('timeout');
        clearInterval(intervalId);
      }
    }, 100);

    return () => {
      clearInterval(intervalId);
      unsubscribeNetInfo();
    };
  }, []);

  /**
   * Simulate AI processing with mock data
   * TODO: Replace with actual API call to Story 1.8b endpoint
   */
  const simulateAIProcessing = async () => {
    setLoadingState('loading');

    try {
      // Simulate network delay (1-3 seconds)
      const simulatedDelay = Math.random() * 2000 + 1000;
      await new Promise((resolve) => setTimeout(resolve, simulatedDelay));

      // Ensure minimum loading time for smooth UX
      const elapsed = elapsedTimeMs;
      if (elapsed < MIN_LOADING_TIME_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_LOADING_TIME_MS - elapsed));
      }

      // Set mock data
      setBreakdown(MOCK_GOAL_BREAKDOWN);
      setLoadingState('success');

      // TODO: Replace with actual API call
      // const response = await fetch('/api/onboarding/goal-breakdown', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     goal_text: goalText,
      //     user_context: { /* painpoints, identity_traits, personality */ }
      //   })
      // });
      // const data = await response.json();
      // setBreakdown(data.data);
      // setLoadingState('success');
    } catch (error) {
      console.error('[AI] Goal breakdown generation failed:', error);
      setLoadingState('error');
    }
  };

  /**
   * Handle timeout error
   */
  const handleTimeout = () => {
    setShowTimeoutError(true);
    setLoadingState('timeout');
  };

  /**
   * Retry AI generation
   */
  const handleRetry = () => {
    setElapsedTimeMs(0);
    setShowTimeoutWarning(false);
    setShowTimeoutError(false);
    simulateAIProcessing();
  };

  // ============================================================================
  // EDIT HANDLERS
  // ============================================================================

  /**
   * Handle goal card edit save
   */
  const handleGoalSave = (title: string, summary: string) => {
    if (breakdown) {
      setBreakdown({
        ...breakdown,
        goal_title: title,
        goal_summary: summary,
      });
      setEditedSections((prev) => new Set(prev).add('goal'));
    }
  };

  /**
   * Handle milestone edit save
   */
  const handleMilestoneSave = (index: number, title: string, description?: string) => {
    if (breakdown) {
      const updatedMilestones = [...breakdown.milestones];
      updatedMilestones[index] = {
        ...updatedMilestones[index],
        title,
        description,
      };
      setBreakdown({
        ...breakdown,
        milestones: updatedMilestones,
      });
      setEditedSections((prev) => new Set(prev).add(`milestone_${index}`));
    }
  };

  /**
   * Handle bind edit save
   */
  const handleBindSave = (index: number, name: string, description: string, frequency?: string) => {
    if (breakdown) {
      const updatedBinds = [...breakdown.binds];
      updatedBinds[index] = {
        ...updatedBinds[index],
        name,
        description,
        frequency,
      };
      setBreakdown({
        ...breakdown,
        binds: updatedBinds,
      });
      setEditedSections((prev) => new Set(prev).add(`bind_${index}`));
    }
  };

  /**
   * Handle final confirmation (Accept button)
   */
  const handleFinalConfirmation = () => {
    // TODO (Story 0-4): Track analytics event 'goal_breakdown_accepted'

    // TODO (Story 1.9): Navigate to First Commitment Ritual screen
    // When Story 1.9 is implemented, uncomment:
    // router.push({
    //   pathname: '/(onboarding)/first-commitment-ritual',
    //   params: {
    //     breakdown: JSON.stringify(breakdown),
    //     edited_sections: JSON.stringify(Array.from(editedSections)),
    //   },
    // });

    // Temporary: Show confirmation
    const message =
      `Goal: "${breakdown?.goal_title}"\n\n` +
      `✅ Story 1.8a complete!\n\n` +
      `[Story 1.9 (First Commitment Ritual) not yet implemented]`;

    Alert.alert('Path Confirmed', message);

    if (__DEV__) {
      console.log('[ONBOARDING] Goal breakdown confirmed:', {
        breakdown,
        edited_sections: Array.from(editedSections),
      });
    }
  };

  /**
   * Handle back navigation to Story 1.7
   */
  const handleBackToGoalInput = () => {
    // Show confirmation if user has made edits
    if (editedSections.size > 0) {
      Alert.alert(
        'Discard Changes?',
        "You'll lose your edits if you go back. Continue?",
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ],
        { cancelable: true }
      );
      return;
    }

    router.back();
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // Show loading screen
  if (loadingState === 'loading') {
    return (
      <WeavePathLoadingScreen
        isLoading={true}
        elapsedTimeMs={elapsedTimeMs}
        showTimeoutWarning={showTimeoutWarning}
        showTimeoutError={showTimeoutError}
        onTimeout={handleTimeout}
      />
    );
  }

  // Show timeout error
  if (loadingState === 'timeout' || loadingState === 'error') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <RNText style={styles.errorTitle}>
            {loadingState === 'timeout' ? 'Taking too long...' : 'Something went wrong'}
          </RNText>
          <RNText style={styles.errorMessage}>
            {loadingState === 'timeout'
              ? 'This is taking longer than expected. Please try again.'
              : "We couldn't generate your path. Let's try again."}
          </RNText>

          {/* Retry Button */}
          <TouchableOpacity
            onPress={handleRetry}
            style={styles.retryButton}
            accessibilityRole="button"
            accessibilityLabel="Retry goal breakdown generation"
          >
            <RNText style={styles.retryButtonText}>Retry</RNText>
          </TouchableOpacity>

          {/* Back Button */}
          <TouchableOpacity
            onPress={handleBackToGoalInput}
            style={styles.backLinkButton}
            accessibilityRole="button"
            accessibilityLabel="Go back to goal input"
          >
            <RNText style={styles.backLinkText}>← Back to goal input</RNText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show breakdown (success state)
  if (loadingState === 'success' && breakdown) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Offline Banner (AC #9) */}
        {isOffline && (
          <View style={styles.offlineBanner}>
            <RNText style={styles.offlineBannerText}>
              ⚠️ No internet connection. Please check your network.
            </RNText>
          </View>
        )}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <RNText style={styles.sectionTitle}>Your Path Forward</RNText>
            <RNText style={styles.sectionSubtext}>
              Review and edit your personalized plan. You can adjust anything before starting.
            </RNText>
          </View>

          {/* Goal Title & Summary Card (Task 3) */}
          <GoalBreakdownCard
            title={breakdown.goal_title}
            summary={breakdown.goal_summary}
            isEdited={editedSections.has('goal')}
            reducedMotionEnabled={reducedMotionEnabled}
            onSave={handleGoalSave}
          />

          {/* Milestones Section (Task 4) */}
          <View style={styles.section}>
            <RNText style={styles.subsectionTitle}>Milestones</RNText>
            {breakdown.milestones.map((milestone, index) => (
              <MilestoneCard
                key={milestone.id}
                number={index + 1}
                title={milestone.title}
                description={milestone.description}
                isEdited={editedSections.has(`milestone_${index}`)}
                delayIndex={index}
                reducedMotionEnabled={reducedMotionEnabled}
                onSave={(title, description) => handleMilestoneSave(index, title, description)}
              />
            ))}
          </View>

          {/* Binds Section (Task 5) */}
          <View style={styles.section}>
            <RNText style={styles.subsectionTitle}>Your Daily Binds</RNText>
            <RNText style={styles.subsectionDescription}>
              These are the consistent actions that will move you toward your goal.
            </RNText>
            {breakdown.binds.map((bind, index) => (
              <BindCard
                key={bind.id}
                name={bind.name}
                description={bind.description}
                frequency={bind.frequency}
                isEdited={editedSections.has(`bind_${index}`)}
                delayIndex={breakdown.milestones.length + index}
                reducedMotionEnabled={reducedMotionEnabled}
                onSave={(name, description, frequency) =>
                  handleBindSave(index, name, description, frequency)
                }
              />
            ))}
          </View>
        </ScrollView>

        {/* Footer with CTAs (Task 7) */}
        <View style={styles.footer}>
          {/* Optional Back Link */}
          <TouchableOpacity
            onPress={handleBackToGoalInput}
            style={styles.editGoalLink}
            accessibilityRole="button"
            accessibilityLabel="Go back to edit goal"
          >
            <RNText style={styles.editGoalLinkText}>← Edit my goal</RNText>
          </TouchableOpacity>

          {/* Accept Button */}
          <TouchableOpacity
            onPress={handleFinalConfirmation}
            style={styles.acceptButton}
            accessibilityRole="button"
            accessibilityLabel="Accept path and continue"
          >
            <RNText style={styles.acceptButtonText}>Looks good – Let's start</RNText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Fallback (should never reach here)
  return null;
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: 140, // Space for fixed footer (increased for two buttons)
  },

  // Section Headers
  sectionHeader: {
    marginBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  sectionSubtext: {
    fontSize: FONT_SIZE.md,
    fontWeight: '400',
    color: COLORS.text.tertiary,
    lineHeight: 22,
  },
  section: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  subsectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  subsectionDescription: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '400',
    color: COLORS.text.tertiary,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  errorTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  errorMessage: {
    fontSize: FONT_SIZE.md,
    fontWeight: '400',
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xxl,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl * 2,
    paddingVertical: SPACING.lg,
    borderRadius: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  retryButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  backLinkButton: {
    paddingVertical: SPACING.md,
  },
  backLinkText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.primary,
    textAlign: 'center',
  },

  // Footer CTAs
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.xl,
    backgroundColor: COLORS.background.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },
  editGoalLink: {
    alignSelf: 'center',
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
  },
  editGoalLinkText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.primary,
    textAlign: 'center',
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Offline Banner (AC #9)
  offlineBanner: {
    backgroundColor: '#FFA726',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#FF9800',
  },
  offlineBannerText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
