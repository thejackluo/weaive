/**
 * Story 4.1a + 4.1b: Daily Reflection Entry - Default + Custom Questions
 *
 * TEMPORARY LOCATION: Settings tab (for development testing)
 * PRODUCTION LOCATION: Move to app/(tabs)/thread/reflection.tsx when Story 3.1 complete
 *
 * This screen allows users to:
 * - Reflect on their day (Question 1: multi-line text)
 * - Set tomorrow's focus (Question 2: single-line text)
 * - Rate daily fulfillment (1-10 slider)
 * - Answer custom tracking questions (text, numeric, yes/no)
 * - Manage custom questions (add/edit/delete)
 * - Edit existing journal entries
 *
 * During onboarding, all form interactions are blocked via an absolutely positioned overlay
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Animated,
  Pressable,
  Modal,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useSubmitJournal, useUpdateJournal, useGetTodayJournal } from '@/hooks/useJournal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CompletionCelebration } from '@/components/thread/CompletionCelebration';
import { useInAppOnboarding } from '@/contexts/InAppOnboardingContext';

const DRAFT_KEY = '@weave_reflection_draft';

export default function ReflectionScreen() {
  console.log('[REFLECTION_SCREEN] 🎬 Component mounting (v3)...');
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentStep, completeCurrentStep } = useInAppOnboarding();

  // Onboarding state
  const [showOnboardingTooltip, setShowOnboardingTooltip] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(-20)).current;

  // Form state
  const [todayReflection, setTodayReflection] = useState('');
  const [tomorrowFocus, setTomorrowFocus] = useState('');
  const [fulfillmentScore, setFulfillmentScore] = useState(5);

  // UI state
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingJournalId, setExistingJournalId] = useState<string | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Celebration modal state
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<any | null>(null);

  // Hooks
  console.log('[REFLECTION_SCREEN] 🎣 Initializing hooks...');
  const {
    data: todayJournal,
    isLoading: isLoadingJournal,
    error: journalError,
  } = useGetTodayJournal();
  const submitMutation = useSubmitJournal();
  const updateMutation = useUpdateJournal();

  console.log('[REFLECTION_SCREEN] 📊 Loading states:', {
    isLoadingJournal,
    hasJournalError: !!journalError,
  });

  // Character counts
  const reflectionCount = todayReflection.length;
  const focusCount = tomorrowFocus.length;

  // Load existing journal or draft on mount
  useEffect(() => {
    console.log('[REFLECTION_SCREEN] 📝 Journal data changed:', {
      hasJournal: !!todayJournal,
      journalId: todayJournal?.id,
    });

    if (todayJournal) {
      // Edit mode: Pre-populate with existing data
      console.log(
        '[REFLECTION_SCREEN] ✏️  Entering EDIT mode - pre-populating form with existing journal'
      );
      setIsEditMode(true);
      setExistingJournalId(todayJournal.id);
      setTodayReflection(todayJournal.default_responses?.today_reflection || '');
      setTomorrowFocus(todayJournal.default_responses?.tomorrow_focus || '');
      setFulfillmentScore(todayJournal.fulfillment_score);
    } else {
      // Create mode: Try to restore draft
      console.log('[REFLECTION_SCREEN] ➕ Entering CREATE mode - loading draft if exists');
      loadDraft();
    }
  }, [todayJournal]);

  // Show onboarding tooltip if coming from onboarding OR currently in home_page_tour step
  // Use ref to prevent re-showing after dismissal
  const hasShownTooltipRef = React.useRef(false);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const shouldShowTooltip =
      (params.fromOnboarding === 'true' || currentStep === 'home_page_tour') &&
      !hasShownTooltipRef.current;

    if (shouldShowTooltip) {
      console.log('[REFLECTION_SCREEN] 🎓 In onboarding flow - showing tooltip');
      hasShownTooltipRef.current = true; // Mark as shown to prevent re-trigger

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
  }, [params.fromOnboarding, currentStep]);

  // Set timeout after 10 seconds of loading
  useEffect(() => {
    if (isLoadingJournal) {
      console.log('[REFLECTION_SCREEN] ⏱️  Loading in progress - starting 10s timeout timer');
      const startTime = performance.now();

      const timeoutId = setTimeout(() => {
        const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
        console.error(`[REFLECTION_SCREEN] ⚠️  TIMEOUT after ${elapsed}s!`);
        console.error('[REFLECTION_SCREEN] 🔍 Debug info:', {
          isLoadingJournal,
          journalError:
            journalError && typeof journalError === 'object' && 'message' in journalError
              ? (journalError as Error).message
              : 'Unknown error',
        });
        setLoadingTimeout(true);
      }, 10000); // 10-second timeout

      return () => {
        clearTimeout(timeoutId);
        const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
        console.log(`[REFLECTION_SCREEN] ⏱️  Timeout cleared after ${elapsed}s`);
      };
    } else {
      console.log('[REFLECTION_SCREEN] ✅ Loading complete - journal query finished');
      setLoadingTimeout(false);
    }
  }, [isLoadingJournal, journalError]);

  // Auto-save draft every 5 seconds
  useEffect(() => {
    if (!isEditMode) {
      const interval = setInterval(() => {
        saveDraft();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [todayReflection, tomorrowFocus, fulfillmentScore, isEditMode]);

  const loadDraft = async () => {
    try {
      const draft = await AsyncStorage.getItem(DRAFT_KEY);
      if (draft) {
        const parsed = JSON.parse(draft);
        setTodayReflection(parsed.todayReflection || '');
        setTomorrowFocus(parsed.tomorrowFocus || '');
        setFulfillmentScore(parsed.fulfillmentScore || 5);
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  };

  const saveDraft = async () => {
    try {
      await AsyncStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ todayReflection, tomorrowFocus, fulfillmentScore })
      );
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  const clearDraft = async () => {
    try {
      await AsyncStorage.removeItem(DRAFT_KEY);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  };

  const handleSubmit = async () => {
    const payload = {
      fulfillment_score: fulfillmentScore,
      default_responses: {
        today_reflection: todayReflection,
        tomorrow_focus: tomorrowFocus,
      },
    };

    try {
      let result;
      if (isEditMode && existingJournalId && existingJournalId !== 'temp-id') {
        // Update existing journal (skip if existingJournalId is temp-id)
        result = await updateMutation.mutateAsync({
          journalId: existingJournalId,
          data: payload,
        });
      } else {
        // Create new journal (handles both CREATE mode and temp-id cases)
        result = await submitMutation.mutateAsync(payload);
        await clearDraft();
      }

      // Show celebration modal with progress data (only for NEW reflections, not edits)
      if (!isEditMode && result?.meta?.progress_update) {
        setCelebrationData(result.meta.progress_update);
        setShowCelebration(true);
      } else {
        // If editing or no progress data, just go back
        router.back();
      }
    } catch (error) {
      console.error('Failed to submit journal:', error);
      Alert.alert('Submission Failed', 'Please check your connection and try again.');
    }
  };

  const isSubmitEnabled =
    fulfillmentScore >= 1 &&
    fulfillmentScore <= 10 &&
    todayReflection.length >= 50 &&
    tomorrowFocus.trim().length > 0;
  const isLoading = submitMutation.isPending || updateMutation.isPending;

  if (isLoadingJournal) {
    console.log('[REFLECTION_SCREEN] 🔄 Rendering loading state...');

    return (
      <SafeAreaView style={styles.loadingContainer}>
        {!loadingTimeout ? (
          <>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Loading your reflection...</Text>
            <Text style={styles.loadingDebugText}>
              Journal: {isLoadingJournal ? 'Loading...' : 'Done'}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.errorText}>⚠️ Cannot load reflection</Text>
            <Text style={styles.errorSubtext}>
              {journalError && typeof journalError === 'object' && 'message' in journalError
                ? `Journal error: ${(journalError as Error).message}`
                : 'Loading took too long. Check your connection and try again.'}
            </Text>
            <Text style={styles.errorDebugText}>
              Debug Info:{'\n'}• Journal:{' '}
              {isLoadingJournal ? 'Still loading' : journalError ? 'Error' : 'Done'}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                console.log('[REFLECTION_SCREEN] 🔄 User clicked Go Back - navigating away');
                setLoadingTimeout(false);
                router.back();
              }}
            >
              <Text style={styles.retryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </>
        )}
      </SafeAreaView>
    );
  }

  console.log('[REFLECTION_SCREEN] ✅ Rendering main form');
  const isInOnboarding = params.fromOnboarding === 'true' || currentStep === 'home_page_tour';
  console.log('[REFLECTION_SCREEN] Onboarding overlay active:', isInOnboarding);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Daily Check-in</Text>
        </View>

        {/* Form Content */}
        <View>
          {/* Question 1: Today's Reflection */}
          <View style={styles.questionContainer}>
            <Text style={styles.questionLabel}>
              How do you feel about today? What worked well and what didn't?
            </Text>
            <TextInput
              style={styles.multilineInput}
              multiline
              numberOfLines={5}
              maxLength={500}
              value={todayReflection}
              onChangeText={setTodayReflection}
              placeholder="Today I felt... The highlight was... I struggled with..."
              placeholderTextColor="#999"
              editable={!isInOnboarding}
            />
            <Text style={styles.characterCount}>{reflectionCount} / 500</Text>
            {reflectionCount < 50 && reflectionCount > 0 && (
              <Text style={styles.hint}>Keep going! Aim for at least 50 characters.</Text>
            )}
          </View>

          {/* Question 2: Tomorrow's Focus */}
          <View style={styles.questionContainer}>
            <Text style={styles.questionLabel}>
              What is the one thing you want to accomplish tomorrow?
            </Text>
            <TextInput
              style={styles.singleLineInput}
              maxLength={100}
              value={tomorrowFocus}
              onChangeText={setTomorrowFocus}
              placeholder="Tomorrow I will..."
              placeholderTextColor="#999"
              editable={!isInOnboarding}
            />
            <Text style={styles.characterCount}>{focusCount} / 100</Text>
          </View>

          {/* Fulfillment Score Slider */}
          <View style={styles.questionContainer}>
            <Text style={styles.questionLabel}>Overall, how fulfilled do you feel about today?</Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.scoreDisplay}>{fulfillmentScore}</Text>
              <View style={styles.sliderWrapper}>
                <Slider
                  style={styles.slider}
                  value={fulfillmentScore}
                  onValueChange={(value) => {
                    const rounded = Math.round(value);
                    if (rounded !== fulfillmentScore) {
                      setFulfillmentScore(rounded);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                  }}
                  minimumValue={1}
                  maximumValue={10}
                  step={1}
                  minimumTrackTintColor="#FFFFFF"
                  maximumTrackTintColor="#2a2a2a"
                  thumbTintColor="#FFFFFF"
                  disabled={isInOnboarding}
                />
              </View>
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>1 - Low</Text>
                <Text style={styles.sliderLabel}>10 - High</Text>
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, !isSubmitEnabled && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!isSubmitEnabled || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditMode ? 'Update Reflection' : 'Submit'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
        {isLoading && (
          <Text style={styles.loadingText}>
            {isEditMode ? 'Updating your reflection...' : 'Submitting your reflection...'}
          </Text>
        )}
      </ScrollView>

      {/* Onboarding Overlay - Blocks all form interactions during tutorial */}
      {isInOnboarding && (
        <View
          style={styles.onboardingFormOverlay}
          pointerEvents="box-only"
        />
      )}

      {/* Celebration Modal */}
      {celebrationData && (
        <CompletionCelebration
          visible={showCelebration}
          needleName="your goals"
          progressUpdate={celebrationData}
          showNotes={false}
          onComplete={() => {
            setShowCelebration(false);
            // Delay navigation to prevent RNSScreenContainerView recycling crash
            // (native view needs time to finish unmounting the modal before screen navigates)
            setTimeout(() => {
              router.back();
            }, 100);
          }}
        />
      )}

      {/* Onboarding Tooltip Modal */}
      <Modal visible={showOnboardingTooltip} transparent animationType="fade">
        <View style={styles.onboardingOverlay}>
          {/* Semi-transparent backdrop */}
          <View style={styles.onboardingBackdrop} />

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
                <Ionicons name="calendar" size={32} color="#FFFFFF" />
              </View>

              {/* Message */}
              <Text style={styles.onboardingMessage}>Daily reflection</Text>

              {/* Description */}
              <Text style={styles.onboardingDescription}>
                Reflect at the end of your day to stay mindful of the process
              </Text>

              {/* Got It Button */}
              <Pressable
                onPress={async () => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    console.log('[REFLECTION] 🎯 Starting step completion...');

                    // CRITICAL: Complete step FIRST (save to AsyncStorage)
                    await completeCurrentStep();
                    console.log('[REFLECTION] ✅ Step completed and saved');

                    // THEN dismiss modal (prevents race condition)
                    setShowOnboardingTooltip(false);
                    console.log('[REFLECTION] ✅ Modal dismissed');
                  } catch (error) {
                    console.error('[REFLECTION] ❌ Error completing onboarding:', error);
                    // Still close modal even if save fails
                    setShowOnboardingTooltip(false);
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  loadingDebugText: {
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  errorDebugText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
    marginBottom: 20,
    textAlign: 'left',
    paddingHorizontal: 40,
    fontFamily: 'monospace',
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  timerContainer: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  timerLabel: {
    fontSize: 12,
    color: '#71717A',
    marginBottom: 8,
    textAlign: 'center',
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 10,
  },
  multilineInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  singleLineInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  characterCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'right',
    marginTop: 6,
  },
  hint: {
    fontSize: 12,
    color: 'rgba(255, 165, 0, 0.8)',
    marginTop: 4,
  },
  sliderContainer: {
    paddingVertical: 12,
  },
  scoreDisplay: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  sliderWrapper: {
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  sliderLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  submitButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  // Onboarding styles
  onboardingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  onboardingBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  onboardingTooltipContainer: {
    width: '100%',
    maxWidth: 400,
  },
  onboardingTooltip: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
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
  onboardingFormOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    zIndex: 999,
  },
});
