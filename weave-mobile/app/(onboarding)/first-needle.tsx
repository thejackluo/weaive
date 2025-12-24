/**
 * First Needle Selection Screen (Story 1.7)
 *
 * Allows new users to select their first goal from 10 suggested options or enter a custom goal.
 * Features:
 * - Two-step flow: Selection → Confirmation
 * - 10 pre-defined goal templates
 * - Custom goal input (escape hatch, max 80 chars)
 * - Optional goal customization (max 30 chars, skippable)
 * - Keyword-based template matching for custom goals
 * - Accessibility support (VoiceOver, reduced motion)
 * - Performance target: ≤30 seconds (target: ≤20s median)
 *
 * Navigation:
 * - From: identity-bootup.tsx (Story 1.6)
 * - To: Story 1.8 (AI Path Generation) [NOT YET IMPLEMENTED]
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StyleSheet,
  Platform as _Platform,
  AccessibilityInfo,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { GoalCard } from '../../src/components/onboarding/GoalCard';
import {
  GOAL_TEMPLATES,
  matchCustomGoalToTemplate,
  type GoalTemplate,
} from '../../src/constants/goalTemplates';

// ============================================================================
// DESIGN CONSTANTS
// ============================================================================

// Spacing (follows 8px grid)
const _SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

// Typography
const _FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
} as const;

// Colors
const _COLORS = {
  primary: '#4CAF50',
  primaryLight: 'rgba(76, 175, 80, 0.1)',
  text: {
    primary: '#000000',
    secondary: '#333333',
    tertiary: '#666666',
    placeholder: '#999999',
  },
  border: {
    default: '#E0E0E0',
    disabled: '#CCCCCC',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    input: '#FAFAFA',
  },
} as const;

// Component sizing
const _MIN_TOUCH_TARGET = 64; // React Native minimum for accessibility
const MAX_CUSTOM_GOAL_LENGTH = 80;
const MAX_CUSTOMIZATION_LENGTH = 30;
const MIN_CUSTOM_GOAL_LENGTH = 3;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type CurrentStep = 'intro' | 'selection' | 'confirmation';

interface GoalData {
  template_id: number | null;
  display_text: string;
  customization_text: string | null;
  is_custom: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FirstNeedleScreen() {
  const router = useRouter();

  // Step state machine: 'intro' | 'selection' | 'confirmation'
  const [currentStep, setCurrentStep] = useState<CurrentStep>('intro');

  // Goal data state
  const [goalData, setGoalData] = useState<GoalData>({
    template_id: null,
    display_text: '',
    customization_text: null,
    is_custom: false,
  });

  // Selection step state
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customGoal, setCustomGoal] = useState('');
  const [showCustomization, setShowCustomization] = useState(false);
  const [customizationText, setCustomizationText] = useState('');

  // Accessibility: Check for reduced motion preference
  const [reducedMotionEnabled, setReducedMotionEnabled] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference on mount
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        setReducedMotionEnabled(enabled || false);
      })
      .catch((error) => {
        // Fallback: Assume reduced motion is disabled if API unavailable
        console.warn('[ACCESSIBILITY] Failed to check reduced motion preference:', error);
        setReducedMotionEnabled(false);
      });

    // TODO (Story 0-4): Track analytics event 'first_needle_screen_viewed'
    // Example: analytics.track('first_needle_screen_viewed', { timestamp: new Date() });
  }, []);

  // ============================================================================
  // SELECTION STEP HANDLERS
  // ============================================================================

  /**
   * Handle template goal selection
   * - Clears custom goal if user switches back to template
   * - Stores template ID and display text
   */
  const handleTemplateSelect = (template: GoalTemplate) => {
    setSelectedTemplateId(template.id);
    setCustomGoal(''); // Clear custom input
    setShowCustomInput(false); // Hide custom input
    setGoalData({
      template_id: template.id,
      display_text: template.display_text,
      customization_text: null,
      is_custom: false,
    });

    // TODO (Story 0-4): Track analytics event 'first_needle_suggestion_selected'
    // Example: analytics.track('first_needle_suggestion_selected', {
    //   template_id: template.id,
    //   display_text: template.display_text
    // });
  };

  /**
   * Handle custom goal input change
   * - Max 80 characters enforced
   * - Input sanitization: no emoji-only or whitespace-only
   * - Maps to closest template via keyword matching
   * - Clears template selection
   */
  const handleCustomGoalChange = (text: string) => {
    // Enforce character limit
    if (text.length <= MAX_CUSTOM_GOAL_LENGTH) {
      setCustomGoal(text);

      const trimmedText = text.trim();

      // Validate: must meet minimum length requirement
      // Reject whitespace-only input
      if (trimmedText && trimmedText.length >= MIN_CUSTOM_GOAL_LENGTH) {
        // Match to closest template
        const matchedTemplateId = matchCustomGoalToTemplate(trimmedText);
        setSelectedTemplateId(null); // Clear template selection
        setGoalData({
          template_id: matchedTemplateId,
          display_text: trimmedText, // Store trimmed version
          customization_text: null,
          is_custom: true,
        });

        // TODO (Story 0-4): Track analytics event 'first_needle_custom_entered'
        // Example: analytics.track('first_needle_custom_entered', {
        //   custom_goal: trimmedText,
        //   matched_template_id: matchedTemplateId
        // });
      } else {
        // Reset if empty or too short
        setGoalData({
          template_id: null,
          display_text: '',
          customization_text: null,
          is_custom: false,
        });
      }
    }
  };

  /**
   * Handle customization text change
   * - Max 30 characters enforced
   * - Input sanitization: trim whitespace
   * - Updates goalData with customization
   */
  const handleCustomizationChange = (text: string) => {
    if (text.length <= MAX_CUSTOMIZATION_LENGTH) {
      setCustomizationText(text);
      const trimmedText = text.trim();
      setGoalData((prev) => ({
        ...prev,
        customization_text: trimmedText || null, // Store trimmed or null
      }));

      // TODO (Story 0-4): Track analytics event 'first_needle_customization_entered'
      // Example: analytics.track('first_needle_customization_entered', {
      //   customization_text: trimmedText
      // });
    }
  };

  /**
   * Handle "Continue" button from selection step
   * - Validates selection exists
   * - Dismisses keyboard for better UX
   * - Moves to confirmation step
   */
  const handleContinueFromSelection = () => {
    if (!goalData.display_text) {
      // Edge case: No selection (Continue button should be disabled, but double-check)
      return;
    }

    // Dismiss keyboard before transitioning
    Keyboard.dismiss();

    // Go directly to confirmation
    setCurrentStep('confirmation');
  };

  /**
   * Handle "Skip" customization
   */
  const _handleSkipCustomization = () => {
    setGoalData((prev) => ({
      ...prev,
      customization_text: null,
    }));
    setShowCustomization(false);
    setCurrentStep('confirmation');
  };

  // ============================================================================
  // CONFIRMATION STEP HANDLERS
  // ============================================================================

  /**
   * Handle back navigation from confirmation
   * - Preserves all state (selected goal, customization)
   * - Syncs customization input with goalData
   * - Returns to selection step
   */
  const handleBackToSelection = () => {
    // Sync customization text from goalData when returning
    if (goalData.customization_text) {
      setCustomizationText(goalData.customization_text);
    }
    setCurrentStep('selection');
  };

  /**
   * Handle final confirmation
   * - Navigate to Story 1.8a (Weave Path Generation)
   * - Passes goalData via route params
   */
  const handleFinalConfirmation = () => {
    // TODO (Story 0-4): Track analytics event 'first_needle_confirmed'
    // Example: analytics.track('first_needle_confirmed', {
    //   template_id: goalData.template_id,
    //   display_text: goalData.display_text,
    //   customization_text: goalData.customization_text,
    //   is_custom: goalData.is_custom
    // });

    // Navigate to Story 1.8a (AI Path Generation screen)
    router.push({
      pathname: '/(onboarding)/weave-path-generation',
      params: {
        template_id: goalData.template_id?.toString() || '',
        display_text: goalData.display_text,
        customization_text: goalData.customization_text || '',
        is_custom: goalData.is_custom.toString(),
      },
    });

    // Accessible announcement for screen readers
    AccessibilityInfo.announceForAccessibility(
      `Goal confirmed: ${goalData.display_text}. Loading your personalized path.`
    );

    // Dev logging
    if (__DEV__) {
      console.log('[ONBOARDING] Goal confirmed, navigating to Story 1.8a:', {
        template_id: goalData.template_id,
        display_text: goalData.display_text,
        customization_text: goalData.customization_text,
        is_custom: goalData.is_custom,
      });
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  /**
   * Check if Continue button should be enabled
   */
  const isContinueEnabled = Boolean(goalData.display_text);

  /**
   * Render Intro Step (Screen 1)
   */
  const renderIntroStep = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.introContainer}>
        {/* Title */}
        <Textstyle={styles.introTitle}>Give your actions direction.</Text>

        {/* Body Text */}
        <View style={styles.introBody}>
          <Textstyle={styles.introBodyText}>
            The Binds you complete each day connect to your Needles — the long-term goals you're
            working toward.
          </Text>
          <Textstyle={[styles.introBodyText, { marginTop: 20 }]}>
            Let's create your first one.
          </Text>
          <Textstyle={[styles.introBodyText, { marginTop: 20, fontStyle: 'italic' }]}>
            You can change or refine this anytime.
          </Text>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          onPress={() => setCurrentStep('selection')}
          style={styles.introContinueButton}
          accessibilityRole="button"
          accessibilityLabel="Create my first Needle"
        >
          <Textstyle={styles.introContinueButtonText}>Create my first Needle →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  /**
   * Render Selection Step (Screen 2)
   */
  const renderSelectionStep = () => (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title and Subtext (AC #1) */}
        <View style={styles.header}>
          <Textstyle={styles.title}>What do you want to work on first?</Text>
          <Textstyle={styles.subtext}>
            This doesn't have to be perfect — it's just a starting point.
          </Text>
        </View>

        {/* 10 Suggested Goal Options (AC #2-#5) */}
        <View style={styles.goalsContainer}>
          {GOAL_TEMPLATES.map((template: GoalTemplate) => (
            <GoalCard
              key={template.id}
              id={template.id}
              text={template.display_text}
              selected={selectedTemplateId === template.id}
              onPress={() => handleTemplateSelect(template)}
              reducedMotionEnabled={reducedMotionEnabled}
            />
          ))}
        </View>

        {/* Custom Goal Input (AC #6-#7) */}
        <View style={styles.customGoalSection}>
          {!showCustomInput ? (
            <TouchableOpacity
              onPress={() => setShowCustomInput(true)}
              accessibilityRole="button"
              accessibilityLabel="Type your own goal"
              accessibilityHint="Opens custom goal input field"
            >
              <Textstyle={styles.customGoalLink}>Can't find yours? Type your own goal.</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.customInputContainer}>
              <TextInput
                value={customGoal}
                onChangeText={handleCustomGoalChange}
                placeholder="Enter your goal (e.g., 'Run a 5K', 'Learn Spanish')"
                placeholderTextColor="#999999"
                maxLength={80}
                style={styles.customInput}
                accessibilityLabel="Custom goal input"
                accessibilityHint="Enter your own goal, max 80 characters"
                multiline
                numberOfLines={2}
              />
              <Textstyle={styles.charCounter}>
                {customGoal.length}/{MAX_CUSTOM_GOAL_LENGTH} characters
              </Text>
            </View>
          )}
        </View>

        {/* Optional Customization Step (AC #8-#9) - Inline */}
        {isContinueEnabled && !showCustomization && (
          <View style={styles.customizationPrompt}>
            <Textstyle={styles.customizationLabel}>Want to make this more specific?</Text>
            <TextInput
              value={customizationText}
              onChangeText={handleCustomizationChange}
              placeholder='e.g., "gym", "writing", "studying"'
              placeholderTextColor="#999999"
              maxLength={30}
              style={styles.customizationInput}
              accessibilityLabel="Goal customization input"
              accessibilityHint="Optional: Add specific details, max 30 characters"
            />
            <Textstyle={styles.charCounter}>
              {customizationText.length}/{MAX_CUSTOMIZATION_LENGTH} characters
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Continue Button (AC #8) */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleContinueFromSelection}
          disabled={!isContinueEnabled}
          style={[styles.continueButton, !isContinueEnabled && styles.continueButtonDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Continue to confirmation"
          accessibilityState={{ disabled: !isContinueEnabled }}
        >
          <Text
            style={[
              styles.continueButtonText,
              !isContinueEnabled && styles.continueButtonTextDisabled,
            ]}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  /**
   * Render Confirmation Step (AC #10-#12)
   */
  const renderConfirmationStep = () => {
    const displayText = goalData.customization_text
      ? `${goalData.display_text} — ${goalData.customization_text}`
      : goalData.display_text;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.confirmationContainer}>
          {/* Back Button */}
          <TouchableOpacity
            onPress={handleBackToSelection}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back to goal selection"
          >
            <Textstyle={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          {/* Confirmation Content */}
          <View style={styles.confirmationContent}>
            <Textstyle={styles.confirmationMessage}>Ready to commit to this Needle?</Text>
            <Textstyle={styles.confirmationGoalText}>{displayText}</Text>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            onPress={handleFinalConfirmation}
            style={styles.confirmButton}
            accessibilityRole="button"
            accessibilityLabel="Confirm your first Needle"
          >
            <Textstyle={styles.confirmButtonText}>This will be my first Needle</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <>
      {currentStep === 'intro' && renderIntroStep()}
      {currentStep === 'selection' && renderSelectionStep()}
      {currentStep === 'confirmation' && renderConfirmationStep()}
    </>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100, // Space for fixed footer
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666666',
    opacity: 0.9,
    textAlign: 'center',
  },
  goalsContainer: {
    marginBottom: 24,
  },
  customGoalSection: {
    marginBottom: 24,
  },
  customGoalLink: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  customInputContainer: {
    marginTop: 12,
  },
  customInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#FAFAFA',
    minHeight: 60,
  },
  charCounter: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
    textAlign: 'right',
  },
  customizationPrompt: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 24,
  },
  customizationLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 12,
  },
  customizationInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333333',
    backgroundColor: '#FFFFFF',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  continueButtonTextDisabled: {
    color: '#666666',
  },

  // Intro Step Styles
  introContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  introTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 32,
  },
  introBody: {
    marginBottom: 48,
  },
  introBodyText: {
    fontSize: 17,
    lineHeight: 26,
    color: '#333333',
    textAlign: 'center',
    opacity: 0.9,
  },
  introContinueButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 48,
  },
  introContinueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Confirmation Step Styles
  confirmationContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4CAF50',
  },
  confirmationContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  confirmationMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 24,
    textAlign: 'center',
  },
  confirmationGoalText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
    textAlign: 'center',
    lineHeight: 32,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
