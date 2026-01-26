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
import { getCurrentLocalDate } from '@/utils/dateUtils';

// Test utilities
import {
  generateMockUser,
  generateMockJournalEntry,
  generateMockCustomQuestions,
} from '../../../../test-utils/mockData';

// Mock toast notifications
const mockShowToast = jest.fn();
jest.mock('../../../../utils/toast', () => ({
  showToast: mockShowToast,
}));

// Mock the API
jest.mock('../../../../services/journalApi');

// Mock AsyncStorage for offline support
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe.skip('Daily Reflection Flow - E2E Integration Tests', () => {
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
              created_at: new Date().toISOString(),
            },
            {
              id: 'uuid-2',
              question: 'Rate my energy level',
              type: 'numeric',
              created_at: new Date().toISOString(),
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

  describe('Issue #9: Edge Cases - Journal Pre-Population', () => {
    it('should pre-populate form when journal entry already exists for today', async () => {
      /**
       * GIVEN: User navigates to Daily Check-in screen
       * WHEN: Journal entry already exists for today (API returns existing data)
       * THEN: Form fields pre-populate with saved reflection, focus, fulfillment score, and custom responses
       *
       * Validates: Issue #9 - Journal pre-population edge case
       * Purpose: Better UX - user can edit existing entry instead of creating duplicate
       */

      // GIVEN: Existing journal entry for today
      const existingEntry = generateMockJournalEntry({
        local_date: getCurrentLocalDate(),
        fulfillment_score: 8,
        default_responses: {
          today_reflection: 'Great day with lots of progress!',
          tomorrow_focus: 'Continue momentum on project',
        },
        custom_responses: {
          'uuid-123': {
            question_text: 'Did I meditate?',
            response: 'Yes',
          },
        },
      });

      // Mock API to return existing entry
      (journalApi.getJournalEntryForDate as jest.Mock).mockResolvedValue({
        data: existingEntry,
      });

      const { getByTestId, getByDisplayValue } = render(
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            {/* <ReflectionScreen /> - Component to be implemented */}
            <div data-testid="reflection-screen">Reflection Screen Placeholder</div>
          </NavigationContainer>
        </QueryClientProvider>
      );

      // WHEN: Screen loads and fetches existing entry
      await waitFor(() => {
        expect(journalApi.getJournalEntryForDate).toHaveBeenCalledWith(
          expect.stringMatching(/\d{4}-\d{2}-\d{2}/)
        );
      });

      // THEN: Form fields pre-populate with existing data
      await waitFor(() => {
        expect(getByDisplayValue('Great day with lots of progress!')).toBeTruthy();
        expect(getByDisplayValue('Continue momentum on project')).toBeTruthy();
      });

      const slider = getByTestId('fulfillment-slider');
      expect(slider.props.value).toBe(8);

      // Custom question response pre-populated
      const customInput = getByTestId('custom-question-uuid-123-input');
      expect(customInput.props.value).toBe('Yes');
    });
  });

  describe('Issue #9: Edge Cases - Offline Queue and Auto-Sync', () => {
    it('should queue offline submission and auto-sync on reconnect', async () => {
      /**
       * GIVEN: User completes reflection form
       * WHEN: User submits while in airplane mode (network unavailable)
       * THEN:
       *   - Toast shows "Saved locally, will sync when online"
       *   - Entry saved to AsyncStorage under `pending-journal-submissions`
       *   - Navigation still proceeds to AI Feedback screen (with "pending" state)
       * WHEN: Network reconnects
       * THEN:
       *   - TanStack Query resumePausedMutations() triggers auto-sync
       *   - Entry successfully submitted to API
       *   - AsyncStorage queue cleared
       *   - Toast shows "✓ Reflection synced"
       *
       * Validates: Issue #9 - Offline submission queue and auto-sync
       * Purpose: Reliability - prevent data loss when network unavailable
       */

      // GIVEN: User fills reflection form
      const { getByTestId } = render(
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            {/* <ReflectionScreen /> - Component to be implemented */}
            <div data-testid="reflection-screen">Reflection Screen Placeholder</div>
          </NavigationContainer>
        </QueryClientProvider>
      );

      const reflectionInput = getByTestId('reflection-text-input');
      const submitButton = getByTestId('submit-button');

      fireEvent.changeText(reflectionInput, 'Offline reflection test');

      // WHEN: Network error occurs during submission
      (journalApi.submitJournalEntry as jest.Mock).mockRejectedValue(
        new Error('Network request failed')
      );

      fireEvent.press(submitButton);

      // THEN: Offline queue toast shown
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.stringMatching(/saved locally|will sync when online/i)
        );
      });

      // THEN: Entry saved to AsyncStorage
      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'pending-journal-submissions',
          expect.stringContaining('Offline reflection test')
        );
      });

      // WHEN: Network reconnects (simulate successful submission)
      (journalApi.submitJournalEntry as jest.Mock).mockResolvedValue({
        data: generateMockJournalEntry(),
      });

      // Simulate TanStack Query resuming paused mutations
      await queryClient.resumePausedMutations();

      // THEN: Entry synced successfully
      await waitFor(() => {
        expect(journalApi.submitJournalEntry).toHaveBeenCalled();
        expect(mockShowToast).toHaveBeenCalledWith(expect.stringMatching(/synced|uploaded/i));
      });

      // THEN: AsyncStorage queue cleared
      await waitFor(() => {
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('pending-journal-submissions');
      });
    });
  });

  describe('Issue #9: Edge Cases - Max Custom Questions Enforcement', () => {
    it('should enforce max 5 custom questions limit', async () => {
      /**
       * GIVEN: User has 5 existing custom questions in preferences
       * WHEN: User taps "+ Add custom question" link
       * THEN: Modal opens showing existing 5 questions
       * WHEN: User taps "Add new question" button
       * THEN:
       *   - Button is disabled or shows tooltip
       *   - Toast appears: "You can have up to 5 custom questions"
       *   - No new question form is shown
       *
       * Validates: Issue #9 - Max 5 custom questions enforcement
       * Purpose: Feature guardrails - prevent UI clutter and performance issues
       */

      // GIVEN: User has 5 existing custom questions
      const mockUser = generateMockUser({
        preferences: {
          custom_reflection_questions: generateMockCustomQuestions(5), // Max limit
        },
      });

      (journalApi.getCurrentUser as jest.Mock).mockResolvedValue({
        data: mockUser,
      });

      const { getByTestId } = render(
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            {/* <ReflectionScreen /> - Component to be implemented */}
            <div data-testid="reflection-screen">Reflection Screen Placeholder</div>
          </NavigationContainer>
        </QueryClientProvider>
      );

      // WHEN: User taps "+ Add custom question" link
      const addQuestionLink = getByTestId('add-custom-question-link');
      fireEvent.press(addQuestionLink);

      // THEN: Modal opens
      await waitFor(() => {
        expect(getByTestId('manage-questions-modal')).toBeTruthy();
      });

      // WHEN: User attempts to add 6th question
      const addButton = getByTestId('add-new-question-button');
      fireEvent.press(addButton);

      // THEN: Toast shows max limit reached
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.stringMatching(/max 5 questions|up to 5/i)
        );
      });

      // THEN: Button disabled (or no new question form shown)
      expect(addButton.props.disabled).toBe(true);
    });
  });

  describe('Issue #9: Edge Cases - Character Limit Enforcement', () => {
    it('should prevent typing beyond 500 character limit', async () => {
      /**
       * GIVEN: User is typing in reflection text input
       * WHEN: User reaches 500 characters
       * THEN: Cannot type additional characters (maxLength enforcement works)
       *
       * Validates: Issue #9 - Character limit enforcement at exactly 500 chars
       * Purpose: Data validation and UX feedback
       */

      const { getByTestId } = render(
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            {/* <ReflectionScreen /> - Component to be implemented */}
            <div data-testid="reflection-screen">Reflection Screen Placeholder</div>
          </NavigationContainer>
        </QueryClientProvider>
      );

      const reflectionInput = getByTestId('reflection-text-input');

      // GIVEN: User types exactly 500 characters
      const text500Chars = 'A'.repeat(500);
      fireEvent.changeText(reflectionInput, text500Chars);

      // THEN: Character counter shows 500 / 500
      await waitFor(() => {
        const counterText = getByTestId('character-counter').props.children;
        expect(counterText).toMatch(/500\s*\/\s*500/);
      });

      // WHEN: User tries to type 501st character
      const text501Chars = 'A'.repeat(501);
      fireEvent.changeText(reflectionInput, text501Chars);

      // THEN: Input truncated at 500 characters (maxLength prop enforces this)
      await waitFor(() => {
        expect(reflectionInput.props.value.length).toBe(500);
      });
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
