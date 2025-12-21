/**
 * First Daily Reflection Screen (Story 1.9)
 *
 * Day 0 check-in that establishes the daily reflection ritual.
 * Features:
 * - Fulfillment slider (1-10 scale)
 * - Optional text input (50-500 chars)
 * - Creates first journal_entries record
 * - Completes onboarding core loop
 *
 * Navigation:
 * - From: daily-reflection-intro.tsx (Story 1.8c)
 * - To: Story 1.10 (Dashboard Introduction) [NOT YET IMPLEMENTED]
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Keyboard,
  Alert,
  AccessibilityInfo,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';

// ============================================================================
// DESIGN CONSTANTS
// ============================================================================

const COLORS = {
  primary: '#4CAF50',
  text: {
    primary: '#1a1a1a',
    secondary: '#333333',
    tertiary: '#666666',
    placeholder: '#999999',
  },
  border: {
    default: '#E0E0E0',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#FAFAFA',
  },
  error: '#F44336',
} as const;

const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 26,
  xxxl: 48,
} as const;

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// Validation constants
const MIN_TEXT_LENGTH = 50;
const MAX_TEXT_LENGTH = 500;
const MIN_FULFILLMENT = 1;
const MAX_FULFILLMENT = 10;
const DEFAULT_FULFILLMENT = 5;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FirstDailyReflection() {
  const router = useRouter();

  // Form state
  const [fulfillmentScore, setFulfillmentScore] = useState(DEFAULT_FULFILLMENT);
  const [entryText, setEntryText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AC #7: Skip screen if user has already completed first reflection
  useEffect(() => {
    const checkAlreadyCompleted = async () => {
      try {
        const completed = await AsyncStorage.getItem('first_reflection_completed');
        if (completed === 'true') {
          if (__DEV__) {
            console.log('[FIRST_REFLECTION] Already completed - skipping screen');
          }

          // TODO (Story 1.10): Navigate to Dashboard Introduction when implemented
          // For now, show alert to prevent duplicate submissions
          Alert.alert('Already Completed', 'You have already completed your first reflection.', [
            { text: 'OK', onPress: () => router.back() },
          ]);
          return;
        }
      } catch (error) {
        console.warn('[FIRST_REFLECTION] Failed to check completion status:', error);
        // Continue to screen on error (fail open)
      }
    };

    checkAlreadyCompleted();

    // TODO (Story 0-4): Track analytics event 'first_reflection_viewed'
    // Example: analytics.track('first_reflection_viewed', {
    //   user_id: userId,
    //   timestamp: new Date().toISOString()
    // });

    if (__DEV__) {
      console.log('[FIRST_REFLECTION] Screen viewed');
    }
  }, [router]);

  /**
   * Handle text input change
   * - Enforces max length via maxLength prop
   * - Updates state for real-time character counter
   */
  const handleTextChange = (text: string) => {
    setEntryText(text);
  };

  /**
   * Handle form submission
   * - Validates text length (0 or ≥50 chars)
   * - Saves to AsyncStorage (backend deferred)
   * - Navigates to Story 1.10 (Dashboard Introduction)
   */
  const handleSubmit = async () => {
    // Validate text length
    const trimmedText = entryText.trim();
    if (trimmedText.length > 0 && trimmedText.length < MIN_TEXT_LENGTH) {
      Alert.alert(
        'Almost there',
        `Please write at least ${MIN_TEXT_LENGTH} characters, or leave it blank.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Create journal entry object
      const journalEntry = {
        user_id: 'temp_user_id', // TODO: Get from auth context when Story 0-3 is integrated
        local_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        fulfillment_score: fulfillmentScore,
        entry_text: trimmedText || null,
        is_onboarding: true,
        created_at: new Date().toISOString(),
      };

      // TODO (Story 0-4): API integration
      // const response = await api.post('/journal-entries', journalEntry);
      // await AsyncStorage.setItem('first_journal_entry_synced', 'true');

      // Temporary: Save to AsyncStorage
      await AsyncStorage.setItem('first_journal_entry', JSON.stringify(journalEntry));
      await AsyncStorage.setItem('first_reflection_completed', 'true');

      // TODO (Story 0-4): Track analytics event 'first_reflection_completed'
      // Example: analytics.track('first_reflection_completed', {
      //   user_id: userId,
      //   fulfillment_score: fulfillmentScore,
      //   text_length: trimmedText.length,
      //   has_text: trimmedText.length > 0,
      //   timestamp: new Date().toISOString()
      // });

      if (__DEV__) {
        console.log('[FIRST_REFLECTION] Completed:', journalEntry);
      }

      // Accessible announcement for screen readers
      AccessibilityInfo.announceForAccessibility(
        'Your first check-in is complete. Preparing your dashboard.'
      );

      // TODO (Story 1.10): Navigate to Dashboard Introduction
      // When Story 1.10 is implemented, uncomment:
      // router.push({
      //   pathname: '/(onboarding)/dashboard-intro',
      //   params: {
      //     journal_entry: JSON.stringify(journalEntry),
      //   },
      // });

      // Temporary: Show confirmation
      Alert.alert(
        'First Check-In Complete! 🎉',
        `Fulfillment score: ${fulfillmentScore}/10\n\n` +
          `✅ Story 1.9 complete!\n\n` +
          `[Story 1.10 (Dashboard Introduction) not yet implemented]`
      );
    } catch (error) {
      // Fail gracefully - continue navigation even if save fails
      console.error('[FIRST_REFLECTION] Save failed:', error);

      // Don't show error to user - just continue
      Alert.alert(
        'First Check-In Complete! 🎉',
        `Fulfillment score: ${fulfillmentScore}/10\n\n` +
          `✅ Story 1.9 complete!\n\n` +
          `[Story 1.10 (Dashboard Introduction) not yet implemented]`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Dismiss keyboard when tapping outside input
   */
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  /**
   * Check if character count exceeds max
   */
  const isOverMaxLength = entryText.length > MAX_TEXT_LENGTH;

  /**
   * Get character counter color
   */
  const getCharCounterColor = () => {
    if (isOverMaxLength) return COLORS.error;
    return COLORS.text.placeholder;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        onTouchStart={dismissKeyboard}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>How are you feeling about starting this journey?</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          This is your first check-in — a quick moment to reflect.
        </Text>

        {/* Fulfillment Slider Section */}
        <View style={styles.sliderSection}>
          <Text style={styles.sectionLabel}>How fulfilled do you feel right now?</Text>

          {/* Current Value Display */}
          <Text
            style={styles.fulfillmentValue}
            accessibilityLabel={`Fulfillment score ${fulfillmentScore} out of ${MAX_FULFILLMENT}`}
          >
            {fulfillmentScore}
          </Text>

          {/* Slider */}
          <Slider
            minimumValue={MIN_FULFILLMENT}
            maximumValue={MAX_FULFILLMENT}
            step={1}
            value={fulfillmentScore}
            onValueChange={(value) => {
              setFulfillmentScore(value);
              // Announce value change for screen readers
              AccessibilityInfo.announceForAccessibility(`${value} out of ${MAX_FULFILLMENT}`);
            }}
            minimumTrackTintColor={COLORS.primary}
            maximumTrackTintColor={COLORS.border.default}
            thumbTintColor="#FFFFFF"
            style={styles.slider}
            accessibilityLabel="Fulfillment score slider"
            accessibilityHint={`Adjust your fulfillment score from ${MIN_FULFILLMENT} to ${MAX_FULFILLMENT}`}
          />

          {/* Scale Labels */}
          <View style={styles.scaleLabels}>
            <Text style={styles.scaleLabel}>{MIN_FULFILLMENT}</Text>
            <Text style={styles.scaleLabel}>{MAX_FULFILLMENT}</Text>
          </View>
        </View>

        {/* Text Input Section */}
        <View style={styles.textInputSection}>
          <Text style={styles.sectionLabel}>What's on your mind right now? (optional)</Text>

          <TextInput
            value={entryText}
            onChangeText={handleTextChange}
            placeholder="Share any thoughts, hopes, or concerns..."
            placeholderTextColor={COLORS.text.placeholder}
            multiline
            maxLength={MAX_TEXT_LENGTH}
            style={styles.textInput}
            accessibilityLabel="Reflection text input"
            accessibilityHint={`Optional. Write between ${MIN_TEXT_LENGTH} and ${MAX_TEXT_LENGTH} characters, or leave blank`}
            textAlignVertical="top"
          />

          {/* Character Counter */}
          <Text
            style={[styles.charCounter, { color: getCharCounterColor() }]}
            accessibilityLabel={`${entryText.length} of ${MAX_TEXT_LENGTH} characters`}
          >
            {entryText.length}/{MAX_TEXT_LENGTH} characters
          </Text>
        </View>
      </ScrollView>

      {/* Submit Button (Fixed at Bottom) */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Complete my first check-in"
          accessibilityHint="Submit your reflection and continue to dashboard"
          accessibilityState={{ disabled: isSubmitting }}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Saving...' : 'Complete my first check-in'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scrollContent: {
    padding: SPACING.xxl,
    paddingBottom: 120, // Space for fixed footer
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: SPACING.xxxl,
    lineHeight: 22,
  },

  // Slider Section
  sliderSection: {
    marginBottom: SPACING.xxxl,
  },
  sectionLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.text.secondary,
    marginBottom: SPACING.lg,
  },
  fulfillmentValue: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  slider: {
    width: '100%',
    height: 48, // Minimum touch target
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  scaleLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
  },

  // Text Input Section
  textInputSection: {
    marginBottom: SPACING.xxl,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 12,
    padding: SPACING.lg,
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    backgroundColor: COLORS.background.secondary,
    minHeight: 120,
  },
  charCounter: {
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
    textAlign: 'right',
  },

  // Footer
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
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 48, // Accessibility: minimum touch target
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
