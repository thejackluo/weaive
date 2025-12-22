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
import { useSubmitJournal, useUpdateJournal, useGetTodayJournal } from '@/hooks/useJournal';
import { useUserPreferences, useUpdateCustomQuestions } from '@/hooks/useUserPreferences';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomQuestionInput, {
  CustomQuestion,
} from '@/components/features/journal/CustomQuestionInput';
import ManageQuestionsModal from '@/components/features/journal/ManageQuestionsModal';
import { UserAvatarMenu } from '@/components/UserAvatarMenu';
import CountdownTimer from '@/components/features/journal/CountdownTimer';

const DRAFT_KEY = '@weave_reflection_draft';

export default function ReflectionScreen() {
  console.log('[REFLECTION_SCREEN] 🎬 Component mounting...');
  const router = useRouter();

  // Form state
  const [todayReflection, setTodayReflection] = useState('');
  const [tomorrowFocus, setTomorrowFocus] = useState('');
  const [fulfillmentScore, setFulfillmentScore] = useState(5);
  const [customResponses, setCustomResponses] = useState<Record<string, any>>({});

  // UI state
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingJournalId, setExistingJournalId] = useState<string | null>(null);
  const [userName, _setUserName] = useState('there'); // TODO: Fetch from user profile
  const [showManageQuestionsModal, setShowManageQuestionsModal] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Hooks
  console.log('[REFLECTION_SCREEN] 🎣 Initializing hooks...');
  const {
    data: todayJournal,
    isLoading: isLoadingJournal,
    error: journalError,
  } = useGetTodayJournal();
  const {
    data: customQuestions = [],
    isLoading: isLoadingQuestions,
    error: questionsError,
  } = useUserPreferences();
  const submitMutation = useSubmitJournal();
  const updateMutation = useUpdateJournal();
  const updateQuestionsMutation = useUpdateCustomQuestions();

  console.log('[REFLECTION_SCREEN] 📊 Loading states:', {
    isLoadingJournal,
    isLoadingQuestions,
    hasJournalError: !!journalError,
    hasQuestionsError: !!questionsError,
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
      setCustomResponses(todayJournal.custom_responses || {});
    } else {
      // Create mode: Try to restore draft
      console.log('[REFLECTION_SCREEN] ➕ Entering CREATE mode - loading draft if exists');
      loadDraft();
    }
  }, [todayJournal]);

  // Set timeout after 10 seconds of loading
  useEffect(() => {
    if (isLoadingJournal || isLoadingQuestions) {
      console.log('[REFLECTION_SCREEN] ⏱️  Loading in progress - starting 10s timeout timer');
      const startTime = performance.now();

      const timeoutId = setTimeout(() => {
        const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
        console.error(`[REFLECTION_SCREEN] ⚠️  TIMEOUT after ${elapsed}s!`);
        console.error('[REFLECTION_SCREEN] 🔍 Debug info:', {
          isLoadingJournal,
          isLoadingQuestions,
          journalError: journalError?.message,
          questionsError: questionsError?.message,
        });
        setLoadingTimeout(true);
      }, 10000); // 10-second timeout

      return () => {
        clearTimeout(timeoutId);
        const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
        console.log(`[REFLECTION_SCREEN] ⏱️  Timeout cleared after ${elapsed}s`);
      };
    } else {
      console.log('[REFLECTION_SCREEN] ✅ Loading complete - both queries finished');
      setLoadingTimeout(false);
    }
  }, [isLoadingJournal, isLoadingQuestions, journalError, questionsError]);

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
    // Build custom responses with question text (AC #13)
    const formattedCustomResponses: Record<string, any> = {};
    Object.keys(customResponses).forEach((questionId) => {
      const question = customQuestions.find((q) => q.id === questionId);
      if (question) {
        formattedCustomResponses[questionId] = {
          question_text: question.question,
          response: customResponses[questionId],
        };
      }
    });

    const payload = {
      fulfillment_score: fulfillmentScore,
      default_responses: {
        today_reflection: todayReflection,
        tomorrow_focus: tomorrowFocus,
      },
      custom_responses:
        Object.keys(formattedCustomResponses).length > 0 ? formattedCustomResponses : undefined,
    };

    try {
      if (isEditMode && existingJournalId) {
        // Update existing journal
        await updateMutation.mutateAsync({
          journalId: existingJournalId,
          data: payload,
        });
      } else {
        // Create new journal
        await submitMutation.mutateAsync(payload);
        await clearDraft();
      }

      // Navigate to AI Feedback screen (Story 4.3)
      // For now, just go back
      router.back();
    } catch (error) {
      console.error('Failed to submit journal:', error);
      // Error handling will be improved in Task 2
    }
  };

  const isSubmitEnabled = fulfillmentScore >= 1 && fulfillmentScore <= 10;
  const isLoading = submitMutation.isPending || updateMutation.isPending;

  // Handle custom question response change (AC #10)
  const handleCustomResponseChange = (questionId: string, value: string | number | boolean) => {
    setCustomResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Handle saving custom questions from modal (AC #11)
  const handleSaveCustomQuestions = async (questions: CustomQuestion[]) => {
    try {
      await updateQuestionsMutation.mutateAsync(questions);
      setShowManageQuestionsModal(false);
    } catch (error) {
      console.error('Failed to save custom questions:', error);
      // TODO: Show error toast
    }
  };

  if (isLoadingJournal || isLoadingQuestions) {
    console.log('[REFLECTION_SCREEN] 🔄 Rendering loading state...');

    return (
      <View style={styles.loadingContainer}>
        {!loadingTimeout ? (
          <>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Loading your reflection...</Text>
            <Text style={styles.loadingDebugText}>
              Journal: {isLoadingJournal ? 'Loading...' : 'Done'}
              {'\n'}
              Questions: {isLoadingQuestions ? 'Loading...' : 'Done'}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.errorText}>⚠️ Cannot load reflection</Text>
            <Text style={styles.errorSubtext}>
              {journalError
                ? `Journal error: ${journalError.message}`
                : questionsError
                  ? `Questions error: ${questionsError.message}`
                  : 'Loading took too long. Check your connection and try again.'}
            </Text>
            <Text style={styles.errorDebugText}>
              Debug Info:{'\n'}• Journal:{' '}
              {isLoadingJournal ? 'Still loading' : journalError ? 'Error' : 'Done'}
              {'\n'}• Questions:{' '}
              {isLoadingQuestions ? 'Still loading' : questionsError ? 'Error' : 'Done'}
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
    <View style={{ flex: 1 }}>
      {/* User Avatar Menu - Top Right */}
      <UserAvatarMenu />

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>How did today go, {userName}?</Text>
          <Text style={styles.headerSubtitle}>Take 60 seconds to reflect</Text>
        </View>

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
            <View style={styles.sliderTrack}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[styles.sliderDot, num <= fulfillmentScore && styles.sliderDotActive]}
                  onPress={() => setFulfillmentScore(num)}
                >
                  <Text style={styles.sliderDotText}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>Low</Text>
              <Text style={styles.sliderLabel}>High</Text>
            </View>
          </View>
          <Text style={styles.sliderFeedback}>
            {fulfillmentScore <= 3 && '🤔 Tomorrow is a fresh start'}
            {fulfillmentScore > 3 && fulfillmentScore <= 6 && '💭 Steady progress'}
            {fulfillmentScore > 6 && '✨ Great momentum!'}
          </Text>
        </View>

        {/* Custom Questions (AC #10) */}
        {customQuestions.length > 0 && (
          <View style={styles.customQuestionsSection}>
            <View style={styles.customQuestionsHeader}>
              <Text style={styles.customQuestionsSectionTitle}>Your Custom Questions</Text>
              <TouchableOpacity onPress={() => setShowManageQuestionsModal(true)}>
                <Text style={styles.manageQuestionsLink}>Manage</Text>
              </TouchableOpacity>
            </View>
            {customQuestions.map((question) => (
              <CustomQuestionInput
                key={question.id}
                question={question}
                value={customResponses[question.id]}
                onChange={(value) => handleCustomResponseChange(question.id, value)}
              />
            ))}
          </View>
        )}

        {/* Add Custom Questions Link (AC #11) */}
        {customQuestions.length === 0 && (
          <TouchableOpacity
            style={styles.addCustomQuestionsButton}
            onPress={() => setShowManageQuestionsModal(true)}
          >
            <Text style={styles.addCustomQuestionsText}>+ Add custom tracking questions</Text>
          </TouchableOpacity>
        )}
        {customQuestions.length > 0 && customQuestions.length < 5 && (
          <TouchableOpacity
            style={styles.addMoreQuestionsButton}
            onPress={() => setShowManageQuestionsModal(true)}
          >
            <Text style={styles.addMoreQuestionsText}>+ Add more questions</Text>
          </TouchableOpacity>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, !isSubmitEnabled && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!isSubmitEnabled || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditMode ? 'Update Reflection' : 'Submit'}
            </Text>
          )}
        </TouchableOpacity>
        {isLoading && (
          <Text style={styles.loadingText}>
            {isEditMode ? 'Updating your reflection...' : 'Submitting your reflection...'}
          </Text>
        )}

        {/* Manage Questions Modal */}
        <ManageQuestionsModal
          visible={showManageQuestionsModal}
          questions={customQuestions}
          onClose={() => setShowManageQuestionsModal(false)}
          onSave={handleSaveCustomQuestions}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  contentContainer: {
    padding: 20,
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
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
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
  sliderTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sliderDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderDotActive: {
    backgroundColor: '#3b82f6',
  },
  sliderDotText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  sliderFeedback: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 12,
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
  customQuestionsSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  customQuestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  customQuestionsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  manageQuestionsLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  addCustomQuestionsButton: {
    marginTop: 20,
    marginBottom: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addCustomQuestionsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  addMoreQuestionsButton: {
    marginTop: 8,
    marginBottom: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addMoreQuestionsText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(16, 185, 129, 0.8)',
  },
});
