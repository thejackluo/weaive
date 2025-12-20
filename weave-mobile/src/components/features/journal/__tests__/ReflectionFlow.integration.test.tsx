/**
 * E2E Integration Tests for Daily Reflection Flow
 *
 * This test suite follows ATDD (Acceptance Test-Driven Development) principles.
 * All tests are initially FAILING (RED phase) and will guide implementation.
 *
 * Story: 4.1 - Daily Reflection Entry
 * Coverage: AC #1, #3, #4, #5, #6, #9, #10, #11 (Full user journey)
 *
 * Test Strategy: Integration tests that simulate complete user flows
 * from navigation to successful submission.
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Components to be implemented
// import { ReflectionScreen } from '../ReflectionScreen';
// import { ThreadHome } from '../../thread/ThreadHome';

// Mock API client
import * as journalApi from '../../../../services/journalApi';

// Test utilities
import { generateMockUser } from '../../../../test-utils/mockData';

// Mock the API
jest.mock('../../../../services/journalApi');

// Mock AsyncStorage for offline support
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('Daily Reflection Flow - E2E Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create fresh QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Mock user data
    const mockUser = generateMockUser({ preferred_name: 'Jack' });
    (journalApi.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
  });

  describe('AC #1 + #6: Complete Reflection Submission Flow', () => {
    it('should allow user to complete reflection and submit successfully', async () => {
      /**
       * GIVEN: User is on Thread Home with "Daily Check-in" CTA
       * WHEN: User taps CTA, fills questions, and submits
       * THEN: Journal entry is created and success feedback shown
       *
       * Validates: AC #1 (Access & Navigation), AC #6 (Submit & Loading)
       */

      // Mock successful API response
      (journalApi.submitJournalEntry as jest.Mock).mockResolvedValue({
        data: {
          id: 'journal-123',
          local_date: '2025-12-20',
          fulfillment_score: 8,
          created_at: new Date().toISOString(),
        },
        meta: { timestamp: new Date().toISOString() },
      });

      // Render ThreadHome (entry point)
      const { getByTestId, getByText } = render(
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            {/* <ThreadHome /> - Component to be implemented */}
            <div data-testid="thread-home">Thread Home Placeholder</div>
          </NavigationContainer>
        </QueryClientProvider>
      );

      // GIVEN: User sees "Daily Check-in" CTA on Thread Home
      const checkInButton = getByTestId('daily-checkin-cta');
      expect(checkInButton).toBeTruthy();

      // WHEN: User taps CTA to navigate to Reflection screen
      fireEvent.press(checkInButton);

      // THEN: Reflection screen loads with personalized header
      await waitFor(() => {
        expect(getByText(/How did today go, Jack?/i)).toBeTruthy();
      });

      // WHEN: User fills in default question 1 (reflection text)
      const reflectionInput = getByTestId('reflection-text-input');
      fireEvent.changeText(
        reflectionInput,
        'Today was productive. I completed my morning routine and made progress on my goals.'
      );

      // THEN: Character counter updates (AC #3)
      await waitFor(() => {
        expect(getByText(/91 \/ 500/)).toBeTruthy();
      });

      // WHEN: User fills in default question 2 (tomorrow's focus)
      const tomorrowInput = getByTestId('tomorrow-focus-input');
      fireEvent.changeText(tomorrowInput, 'Finish the team presentation');

      // WHEN: User sets fulfillment score to 8 (AC #5)
      const slider = getByTestId('fulfillment-slider');
      fireEvent(slider, 'valueChange', 8);

      // THEN: Score display updates
      await waitFor(() => {
        expect(getByText('8')).toBeTruthy();
      });

      // WHEN: User taps Submit button
      const submitButton = getByTestId('submit-button');
      fireEvent.press(submitButton);

      // THEN: Loading state shown (AC #6)
      await waitFor(() => {
        expect(getByText(/Submitting your reflection/i)).toBeTruthy();
      });

      // THEN: API called with correct payload
      await waitFor(() => {
        expect(journalApi.submitJournalEntry).toHaveBeenCalledWith({
          local_date: expect.any(String),
          fulfillment_score: 8,
          default_responses: {
            today_reflection:
              'Today was productive. I completed my morning routine and made progress on my goals.',
            tomorrow_focus: 'Finish the team presentation',
          },
          custom_responses: {},
        });
      });

      // THEN: Success feedback shown and navigation occurs
      await waitFor(() => {
        // Navigation to AI Feedback screen (Story 4.3) happens here
        expect(getByText(/Reflection submitted/i)).toBeTruthy();
      });
    });

    it('should allow submission with only fulfillment score (skip text questions)', async () => {
      /**
       * GIVEN: User opens Reflection screen
       * WHEN: User only sets fulfillment score and submits
       * THEN: Submission succeeds with empty text responses
       *
       * Validates: AC #3, #4 (Skip links allowed), AC #6 (Submit enabled)
       */

      // Mock successful API response
      (journalApi.submitJournalEntry as jest.Mock).mockResolvedValue({
        data: { id: 'journal-456' },
        meta: { timestamp: new Date().toISOString() },
      });

      const { getByTestId } = render(
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            {/* <ReflectionScreen /> - Component to be implemented */}
            <div data-testid="reflection-screen">Reflection Screen Placeholder</div>
          </NavigationContainer>
        </QueryClientProvider>
      );

      // WHEN: User skips text questions (leaves empty)
      // (No fireEvent.changeText calls)

      // WHEN: User sets fulfillment score to 5
      const slider = getByTestId('fulfillment-slider');
      fireEvent(slider, 'valueChange', 5);

      // WHEN: User taps Submit
      const submitButton = getByTestId('submit-button');
      expect(submitButton).not.toBeDisabled();
      fireEvent.press(submitButton);

      // THEN: API called with empty default_responses
      await waitFor(() => {
        expect(journalApi.submitJournalEntry).toHaveBeenCalledWith({
          local_date: expect.any(String),
          fulfillment_score: 5,
          default_responses: {
            today_reflection: '',
            tomorrow_focus: '',
          },
          custom_responses: {},
        });
      });
    });
  });

  describe('AC #9: Error Handling', () => {
    it('should handle network errors gracefully with offline queue', async () => {
      /**
       * GIVEN: User completes reflection but device is offline
       * WHEN: User submits journal entry
       * THEN: Entry saved locally and queued for sync
       *
       * Validates: AC #9 (Network error + offline queue)
       */

      // Mock network error
      (journalApi.submitJournalEntry as jest.Mock).mockRejectedValue(
        new Error('Network request failed')
      );

      const { getByTestId, getByText } = render(
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            {/* <ReflectionScreen /> - Component to be implemented */}
            <div data-testid="reflection-screen">Reflection Screen Placeholder</div>
          </NavigationContainer>
        </QueryClientProvider>
      );

      // WHEN: User fills and submits
      const slider = getByTestId('fulfillment-slider');
      fireEvent(slider, 'valueChange', 7);

      const submitButton = getByTestId('submit-button');
      fireEvent.press(submitButton);

      // THEN: Error toast shown with offline message (AC #9)
      await waitFor(() => {
        expect(getByText(/Couldn't submit. Saved locally, will retry/i)).toBeTruthy();
      });

      // THEN: Data saved to AsyncStorage for retry
      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'pending-journal-entry',
          expect.stringContaining('fulfillment_score')
        );
      });
    });

    it('should show duplicate entry error when journal already exists for today', async () => {
      /**
       * GIVEN: User already submitted journal for today
       * WHEN: User tries to submit again
       * THEN: Duplicate error shown with "Edit" option
       *
       * Validates: AC #9 (Duplicate entry error handling)
       */

      // Mock 409 Conflict response
      (journalApi.submitJournalEntry as jest.Mock).mockRejectedValue({
        response: {
          status: 409,
          data: {
            error: {
              code: 'DUPLICATE_JOURNAL_ENTRY',
              message: 'You already reflected today. Want to edit?',
            },
          },
        },
      });

      const { getByTestId, getByText } = render(
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            {/* <ReflectionScreen /> - Component to be implemented */}
            <div data-testid="reflection-screen">Reflection Screen Placeholder</div>
          </NavigationContainer>
        </QueryClientProvider>
      );

      // WHEN: User submits
      const slider = getByTestId('fulfillment-slider');
      fireEvent(slider, 'valueChange', 7);

      const submitButton = getByTestId('submit-button');
      fireEvent.press(submitButton);

      // THEN: Duplicate error message shown (AC #9)
      await waitFor(() => {
        expect(getByText(/You already reflected today. Want to edit?/i)).toBeTruthy();
      });
    });

    it('should handle server errors with retry option', async () => {
      /**
       * GIVEN: Server error occurs during submission
       * WHEN: User submits journal entry
       * THEN: Error message with retry button shown
       *
       * Validates: AC #9 (Server error handling)
       */

      // Mock 500 Server Error
      (journalApi.submitJournalEntry as jest.Mock).mockRejectedValue({
        response: {
          status: 500,
          data: {
            error: {
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Something went wrong. Please try again.',
            },
          },
        },
      });

      const { getByTestId, getByText } = render(
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            {/* <ReflectionScreen /> - Component to be implemented */}
            <div data-testid="reflection-screen">Reflection Screen Placeholder</div>
          </NavigationContainer>
        </QueryClientProvider>
      );

      // WHEN: User submits
      const slider = getByTestId('fulfillment-slider');
      fireEvent(slider, 'valueChange', 7);

      const submitButton = getByTestId('submit-button');
      fireEvent.press(submitButton);

      // THEN: Server error message shown with retry button (AC #9)
      await waitFor(() => {
        expect(getByText(/Something went wrong. Try again?/i)).toBeTruthy();
      });

      const retryButton = getByTestId('retry-button');
      expect(retryButton).toBeTruthy();
    });
  });

  describe('AC #10-#11: Custom Questions Flow', () => {
    it('should display and submit custom question responses', async () => {
      /**
       * GIVEN: User has 2 custom questions configured
       * WHEN: User fills custom questions and submits
       * THEN: Custom responses saved correctly in journal entry
       *
       * Validates: AC #10 (Custom Questions Display), AC #13 (Storage)
       */

      // Mock user with custom questions
      const mockUserWithCustomQuestions = generateMockUser({
        preferences: {
          custom_reflection_questions: [
            {
              id: 'uuid-1',
              question: 'Did I stick to my diet?',
              type: 'yes_no',
            },
            {
              id: 'uuid-2',
              question: 'Rate my energy level',
              type: 'numeric',
            },
          ],
        },
      });

      (journalApi.getCurrentUser as jest.Mock).mockResolvedValue(mockUserWithCustomQuestions);
      (journalApi.submitJournalEntry as jest.Mock).mockResolvedValue({
        data: { id: 'journal-789' },
        meta: { timestamp: new Date().toISOString() },
      });

      const { getByTestId, getByText } = render(
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            {/* <ReflectionScreen /> - Component to be implemented */}
            <div data-testid="reflection-screen">Reflection Screen Placeholder</div>
          </NavigationContainer>
        </QueryClientProvider>
      );

      // THEN: Custom questions displayed below default questions (AC #10)
      await waitFor(() => {
        expect(getByText('Did I stick to my diet?')).toBeTruthy();
        expect(getByText('Rate my energy level')).toBeTruthy();
      });

      // WHEN: User answers custom questions
      const dietToggle = getByTestId('custom-question-uuid-1-input');
      fireEvent.press(dietToggle); // Toggle to "Yes"

      const energySlider = getByTestId('custom-question-uuid-2-input');
      fireEvent(energySlider, 'valueChange', 9);

      // WHEN: User submits with fulfillment score
      const fulfillmentSlider = getByTestId('fulfillment-slider');
      fireEvent(fulfillmentSlider, 'valueChange', 8);

      const submitButton = getByTestId('submit-button');
      fireEvent.press(submitButton);

      // THEN: API called with custom_responses (AC #13)
      await waitFor(() => {
        expect(journalApi.submitJournalEntry).toHaveBeenCalledWith({
          local_date: expect.any(String),
          fulfillment_score: 8,
          default_responses: {
            today_reflection: '',
            tomorrow_focus: '',
          },
          custom_responses: {
            'uuid-1': {
              question_text: 'Did I stick to my diet?',
              response: 'Yes',
            },
            'uuid-2': {
              question_text: 'Rate my energy level',
              response: 9,
            },
          },
        });
      });
    });

    it('should open Manage Questions modal when "+ Add custom question" tapped', async () => {
      /**
       * GIVEN: User is on Reflection screen
       * WHEN: User taps "+ Add custom question" link
       * THEN: Manage Questions modal opens
       *
       * Validates: AC #11 (Manage Custom Questions)
       */

      const { getByTestId, getByText } = render(
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            {/* <ReflectionScreen /> - Component to be implemented */}
            <div data-testid="reflection-screen">Reflection Screen Placeholder</div>
          </NavigationContainer>
        </QueryClientProvider>
      );

      // WHEN: User taps "+ Add custom question" link (AC #11)
      const addQuestionLink = getByTestId('add-custom-question-link');
      fireEvent.press(addQuestionLink);

      // THEN: Manage Questions modal opens
      await waitFor(() => {
        expect(getByText(/Manage Questions/i)).toBeTruthy();
      });

      // Modal should show "Add new question" button
      expect(getByTestId('add-new-question-button')).toBeTruthy();
    });
  });

  describe('AC #3-#5: UI Behavior and Validation', () => {
    it('should enforce character limits on text inputs', async () => {
      /**
       * GIVEN: User types into reflection text input
       * WHEN: User reaches 500 character limit
       * THEN: Input disabled and character counter shows limit
       *
       * Validates: AC #3 (Character limit enforcement)
       */

      const { getByTestId, getByText } = render(
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            {/* <ReflectionScreen /> - Component to be implemented */}
            <div data-testid="reflection-screen">Reflection Screen Placeholder</div>
          </NavigationContainer>
        </QueryClientProvider>
      );

      // WHEN: User types 500 characters
      const reflectionInput = getByTestId('reflection-text-input');
      const maxText = 'a'.repeat(500);
      fireEvent.changeText(reflectionInput, maxText);

      // THEN: Character counter shows "500 / 500" (AC #3)
      await waitFor(() => {
        expect(getByText('500 / 500')).toBeTruthy();
      });

      // THEN: Input disabled at 500 characters
      expect(reflectionInput.props.editable).toBe(false);
    });

    it('should update fulfillment score emoji based on slider value', async () => {
      /**
       * GIVEN: User moves fulfillment slider
       * WHEN: Slider value changes from 3 to 8
       * THEN: Emoji/color feedback changes accordingly
       *
       * Validates: AC #5 (Visual feedback for fulfillment score)
       */

      const { getByTestId } = render(
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            {/* <ReflectionScreen /> - Component to be implemented */}
            <div data-testid="reflection-screen">Reflection Screen Placeholder</div>
          </NavigationContainer>
        </QueryClientProvider>
      );

      const slider = getByTestId('fulfillment-slider');

      // WHEN: Low fulfillment (1-3)
      fireEvent(slider, 'valueChange', 3);

      // THEN: Low fulfillment feedback shown (AC #5)
      await waitFor(() => {
        // Check for red color or neutral emoji
        const feedbackElement = getByTestId('fulfillment-feedback');
        expect(feedbackElement.props.accessibilityLabel).toMatch(/low|neutral/i);
      });

      // WHEN: High fulfillment (7-10)
      fireEvent(slider, 'valueChange', 8);

      // THEN: High fulfillment feedback shown (AC #5)
      await waitFor(() => {
        const feedbackElement = getByTestId('fulfillment-feedback');
        expect(feedbackElement.props.accessibilityLabel).toMatch(/happy|positive/i);
      });
    });
  });

  describe('AC #3: Auto-save Draft Functionality', () => {
    it('should auto-save draft every 5 seconds to prevent data loss', async () => {
      /**
       * GIVEN: User is typing in reflection screen
       * WHEN: 5 seconds pass
       * THEN: Draft saved to local storage
       *
       * Validates: AC #3 (Auto-save draft every 5 seconds)
       */

      // Enable fake timers
      jest.useFakeTimers();

      const { getByTestId } = render(
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            {/* <ReflectionScreen /> - Component to be implemented */}
            <div data-testid="reflection-screen">Reflection Screen Placeholder</div>
          </NavigationContainer>
        </QueryClientProvider>
      );

      // WHEN: User types reflection
      const reflectionInput = getByTestId('reflection-text-input');
      fireEvent.changeText(reflectionInput, 'Today was a good day');

      // WHEN: 5 seconds pass
      jest.advanceTimersByTime(5000);

      // THEN: Draft saved to AsyncStorage (AC #3)
      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'reflection-draft',
          expect.stringContaining('Today was a good day')
        );
      });

      jest.useRealTimers();
    });
  });
});

/**
 * Additional E2E test TODOs:
 * - test_deep_link_from_evening_notification() - AC #1
 * - test_smooth_transition_animation() - AC #1 (< 300ms)
 * - test_custom_question_section_collapsible() - AC #16
 * - test_submit_button_always_visible_sticky() - AC #16
 */
