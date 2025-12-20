/**
 * Story 4.1a: Daily Reflection Entry - Default Questions
 *
 * TEMPORARY LOCATION: Settings tab (for development testing)
 * PRODUCTION LOCATION: Move to app/(tabs)/thread/reflection.tsx when Story 3.1 complete
 *
 * This screen allows users to:
 * - Reflect on their day (Question 1: multi-line text)
 * - Set tomorrow's focus (Question 2: single-line text)
 * - Rate daily fulfillment (1-10 slider)
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
import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFT_KEY = '@weave_reflection_draft';

export default function ReflectionScreen() {
  const router = useRouter();

  // Form state
  const [todayReflection, setTodayReflection] = useState('');
  const [tomorrowFocus, setTomorrowFocus] = useState('');
  const [fulfillmentScore, setFulfillmentScore] = useState(5);

  // UI state
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingJournalId, setExistingJournalId] = useState<string | null>(null);
  const [userName, setUserName] = useState('there'); // TODO: Fetch from user profile

  // Hooks
  const { data: todayJournal, isLoading: isLoadingJournal } = useGetTodayJournal();
  const submitMutation = useSubmitJournal();
  const updateMutation = useUpdateJournal();

  // Character counts
  const reflectionCount = todayReflection.length;
  const focusCount = tomorrowFocus.length;

  // Load existing journal or draft on mount
  useEffect(() => {
    if (todayJournal) {
      // Edit mode: Pre-populate with existing data
      setIsEditMode(true);
      setExistingJournalId(todayJournal.id);
      setTodayReflection(todayJournal.default_responses?.today_reflection || '');
      setTomorrowFocus(todayJournal.default_responses?.tomorrow_focus || '');
      setFulfillmentScore(todayJournal.fulfillment_score);
    } else {
      // Create mode: Try to restore draft
      loadDraft();
    }
  }, [todayJournal]);

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

  if (isLoadingJournal) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading your reflection...</Text>
      </View>
    );
  }

  return (
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
        <Text style={styles.questionLabel}>
          Overall, how fulfilled do you feel about today?
        </Text>
        <View style={styles.sliderContainer}>
          <Text style={styles.scoreDisplay}>{fulfillmentScore}</Text>
          <View style={styles.sliderTrack}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.sliderDot,
                  num <= fulfillmentScore && styles.sliderDotActive,
                ]}
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
    </ScrollView>
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
  header: {
    marginBottom: 32,
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
});
