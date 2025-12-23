/**
 * Daily Reflection Entry - Simplified Version
 *
 * TEMPORARY LOCATION: Settings tab (for development testing)
 * PRODUCTION LOCATION: Move to app/(tabs)/thread/reflection.tsx when Story 3.1 complete
 *
 * This screen allows users to:
 * - Reflect on their day (Question 1: multi-line text)
 * - Set tomorrow's focus (Question 2: single-line text)
 * - Rate daily fulfillment (1-10 drag slider)
 * - Edit existing journal entries
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import {
  useSubmitJournal,
  useUpdateJournal,
  useGetTodayJournal,
  journalKeys,
} from '@/hooks/useJournal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CompletionCelebration } from '@/components/thread/CompletionCelebration';

const DRAFT_KEY = '@weave_reflection_draft';

export default function ReflectionScreen() {
  console.log('[REFLECTION_SCREEN] 🎬 Component mounting...');
  const router = useRouter();
  const queryClient = useQueryClient();

  // Form state
  const [todayReflection, setTodayReflection] = useState('');
  const [tomorrowFocus, setTomorrowFocus] = useState('');
  const [fulfillmentScore, setFulfillmentScore] = useState(5);

  // UI state
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingJournalId, setExistingJournalId] = useState<string | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent double-click

  // Celebration modal state
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    level: number;
    levelProgress: number;
  } | null>(null);

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

  // Clear corrupted cache on mount (temp-id from failed submissions)
  useEffect(() => {
    const cachedData = queryClient.getQueryData(journalKeys.today());
    if (cachedData && (cachedData as any).id === 'temp-id') {
      console.log('[REFLECTION_SCREEN] 🧹 Clearing corrupted cache (temp-id detected)');
      queryClient.removeQueries({ queryKey: journalKeys.today() });
      queryClient.invalidateQueries({ queryKey: journalKeys.today() });
    }
  }, [queryClient]);

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
          journalError: journalError ? String(journalError) : null,
        });
        setLoadingTimeout(true);
      }, 10000); // 10-second timeout

      return () => {
        clearTimeout(timeoutId);
        const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
        console.log(`[REFLECTION_SCREEN] ⏱️  Timeout cleared after ${elapsed}s`);
      };
    } else {
      console.log('[REFLECTION_SCREEN] ✅ Loading complete - query finished');
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
    // Prevent double-click
    if (isSubmitting) {
      console.log('[REFLECTION_SCREEN] ⚠️ Already submitting, ignoring duplicate click');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      fulfillment_score: fulfillmentScore,
      default_responses: {
        today_reflection: todayReflection,
        tomorrow_focus: tomorrowFocus,
      },
    };

    try {
      let result;
      if (isEditMode && existingJournalId) {
        // Update existing journal
        result = await updateMutation.mutateAsync({
          journalId: existingJournalId,
          data: payload,
        });
      } else {
        // Create new journal
        result = await submitMutation.mutateAsync(payload);
        await clearDraft();
      }

      // Manually invalidate journal query to force refresh on Thread home screen
      console.log('[REFLECTION_SCREEN] 🔄 Invalidating journal queries after submission');
      await queryClient.invalidateQueries({ queryKey: journalKeys.today() });
      await queryClient.invalidateQueries({ queryKey: journalKeys.all });

      // Show celebration modal with level data (only for NEW reflections, not edits)
      if (
        !isEditMode &&
        result?.meta?.level !== undefined &&
        result?.meta?.level_progress !== undefined
      ) {
        setCelebrationData({
          level: result.meta.level,
          levelProgress: result.meta.level_progress,
        });
        setShowCelebration(true);
      } else {
        // If editing or no level data, navigate to Thread home
        console.log('[REFLECTION_SCREEN] ✅ Journal saved, navigating to Thread home');
        router.push('/(tabs)/');
      }
    } catch (error) {
      console.error('Failed to submit journal:', error);
      // Error handling will be improved in Task 2
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitEnabled = fulfillmentScore >= 1 && fulfillmentScore <= 10;
  const isLoading = submitMutation.isPending || updateMutation.isPending || isSubmitting;

  if (isLoadingJournal) {
    console.log('[REFLECTION_SCREEN] 🔄 Rendering loading state...');

    return (
      <View style={styles.loadingContainer}>
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
              {journalError
                ? `Journal error: ${String(journalError)}`
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
      </View>
    );
  }

  console.log('[REFLECTION_SCREEN] ✅ Rendering main form');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }} edges={['top']}>
      {/* Header with back button */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Check-In</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
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
                minimumTrackTintColor="#3b82f6"
                maximumTrackTintColor="#2a2a2a"
                thumbTintColor="#3b82f6"
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
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>{isEditMode ? 'Update Check-In' : 'Submit'}</Text>
          )}
        </TouchableOpacity>
        {isLoading && (
          <Text style={styles.loadingText}>
            {isEditMode ? 'Updating your check-in...' : 'Submitting your check-in...'}
          </Text>
        )}
      </ScrollView>

      {/* Celebration Modal */}
      {celebrationData && (
        <CompletionCelebration
          visible={showCelebration}
          needleName="your goals"
          level={celebrationData.level}
          levelProgress={celebrationData.levelProgress}
          showNotes={false}
          onComplete={() => {
            console.log('[REFLECTION_SCREEN] 🎉 Celebration complete, navigating to Thread home');
            setShowCelebration(false);
            router.push('/(tabs)/');
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 16, // Reduced from 20 to fit more on screen
    paddingBottom: 40,
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backButton: {
    padding: 4,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40, // Balance the back button
  },
  questionContainer: {
    marginBottom: 28,
  },
  questionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 12,
  },
  multilineInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  singleLineInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  characterCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'right',
    marginTop: 8,
  },
  hint: {
    fontSize: 12,
    color: 'rgba(255, 165, 0, 0.8)',
    marginTop: 4,
  },
  sliderContainer: {
    paddingVertical: 16,
  },
  scoreDisplay: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  sliderWrapper: {
    width: '100%',
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
  },
  sliderLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#2a2a2a',
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
