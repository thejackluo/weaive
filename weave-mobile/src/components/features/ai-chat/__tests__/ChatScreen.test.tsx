/**
 * ChatScreen Component Tests - Story 6.1
 * RED Phase: Tests written BEFORE implementation
 * All tests should FAIL initially (missing components)
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ChatScreen from '../ChatScreen';

// Create QueryClient for tests
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

// Wrapper component with providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = createTestQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('ChatScreen Component', () => {
  /**
   * AC #1: Chat Interface UI - Initial Greeting
   * GIVEN: User opens AI chat screen
   * WHEN: Screen renders
   * THEN: Weave initiates conversation with contextual greeting
   */
  it('renders initial greeting from Weave on mount', async () => {
    // GIVEN: User opens AI chat
    render(<ChatScreen />, { wrapper: TestWrapper });

    // THEN: Initial greeting is displayed
    await waitFor(() => {
      expect(screen.getByText(/good morning|hello|hey/i)).toBeTruthy();
    });

    // AND: Message is from assistant (not user)
    const greeting = screen.getByText(/good morning|hello|hey/i);
    expect(greeting.props.accessibilityLabel).toContain('assistant');
  });

  /**
   * AC #1: Chat Interface UI - Message Bubbles
   * GIVEN: Chat with multiple messages
   * WHEN: Screen renders
   * THEN: User messages right-aligned blue, Weave messages left-aligned purple
   */
  it('displays user messages with blue styling on right', async () => {
    // GIVEN: Chat screen with user message
    const { getByTestId } = render(<ChatScreen />, { wrapper: TestWrapper });

    // WHEN: User sends message
    const input = getByTestId('message-input');
    const sendButton = getByTestId('send-button');

    fireEvent.changeText(input, 'How do I complete a bind?');
    fireEvent.press(sendButton);

    // THEN: User message appears on right with blue styling
    await waitFor(() => {
      const userMessage = getByTestId('message-bubble-user');
      expect(userMessage).toBeTruthy();
      expect(userMessage.props.style).toContain('right'); // Right alignment
      expect(userMessage.props.style).toContain('blue'); // Blue color
    });
  });

  it('displays Weave messages with purple styling on left', async () => {
    // GIVEN: Chat screen with AI response
    render(<ChatScreen />, { wrapper: TestWrapper });

    // THEN: Weave message appears on left with purple styling
    await waitFor(() => {
      const weaveMessage = screen.getByTestId('message-bubble-assistant');
      expect(weaveMessage).toBeTruthy();
      expect(weaveMessage.props.style).toContain('left'); // Left alignment
      expect(weaveMessage.props.style).toContain('purple'); // Purple gradient
    });
  });

  /**
   * AC #1: Chat Interface UI - Streaming Response
   * GIVEN: User sends message
   * WHEN: AI generates response
   * THEN: Typing indicator shown, then streaming text appears
   */
  it('shows typing indicator while AI generates response', async () => {
    // GIVEN: Chat screen
    const { getByTestId } = render(<ChatScreen />, { wrapper: TestWrapper });

    // WHEN: User sends message
    const input = getByTestId('message-input');
    const sendButton = getByTestId('send-button');

    fireEvent.changeText(input, 'Tell me about binds');
    fireEvent.press(sendButton);

    // THEN: Typing indicator appears
    await waitFor(() => {
      expect(getByTestId('typing-indicator')).toBeTruthy();
    });

    // AND: Typing indicator has 3 animated dots
    const typingIndicator = getByTestId('typing-indicator');
    const dots = typingIndicator.findAllByTestId('typing-dot');
    expect(dots).toHaveLength(3);
  });

  it('auto-scrolls to bottom when new message arrives', async () => {
    // GIVEN: Chat with multiple messages
    const { getByTestId } = render(<ChatScreen />, { wrapper: TestWrapper });
    const scrollView = getByTestId('chat-scrollview');

    // WHEN: New message arrives
    const input = getByTestId('message-input');
    const sendButton = getByTestId('send-button');

    fireEvent.changeText(input, 'New message');
    fireEvent.press(sendButton);

    // THEN: ScrollView scrolls to bottom
    await waitFor(() => {
      expect(scrollView.props.scrollToEnd).toHaveBeenCalled();
    });
  });

  /**
   * AC #1: Chat Interface UI - Keyboard Avoidance
   * GIVEN: User taps input field
   * WHEN: Keyboard opens
   * THEN: Messages scroll above keyboard
   */
  it('adjusts layout when keyboard opens', async () => {
    // GIVEN: Chat screen
    const { getByTestId } = render(<ChatScreen />, { wrapper: TestWrapper });

    // WHEN: User focuses input (keyboard opens)
    const input = getByTestId('message-input');
    fireEvent(input, 'focus');

    // THEN: KeyboardAvoidingView adjusts layout
    const keyboardView = getByTestId('keyboard-avoiding-view');
    expect(keyboardView.props.behavior).toBe('padding');
  });

  /**
   * AC #2: Quick Action Chips
   * GIVEN: Chat screen with chips
   * WHEN: User taps a chip
   * THEN: Predefined prompt sent to AI
   */
  it('renders quick action chips above input', () => {
    // GIVEN: Chat screen
    const { getByTestId } = render(<ChatScreen />, { wrapper: TestWrapper });

    // THEN: Quick action chips are displayed
    expect(getByTestId('chip-plan-day')).toBeTruthy();
    expect(getByTestId('chip-im-stuck')).toBeTruthy();
    expect(getByTestId('chip-edit-goal')).toBeTruthy();
    expect(getByTestId('chip-explain-bind')).toBeTruthy();
  });

  it('sends predefined prompt when chip is tapped', async () => {
    // GIVEN: Chat screen
    const { getByTestId } = render(<ChatScreen />, { wrapper: TestWrapper });

    // WHEN: User taps "Plan my day" chip
    const planDayChip = getByTestId('chip-plan-day');
    fireEvent.press(planDayChip);

    // THEN: Predefined prompt sent and appears in chat
    await waitFor(() => {
      expect(screen.getByText(/plan my day/i)).toBeTruthy();
    });
  });

  it('hides chips when user starts typing', async () => {
    // GIVEN: Chat screen with visible chips
    const { getByTestId } = render(<ChatScreen />, { wrapper: TestWrapper });
    const chipsContainer = getByTestId('quick-action-chips');

    // WHEN: User starts typing
    const input = getByTestId('message-input');
    fireEvent.changeText(input, 'I am typing...');

    // THEN: Chips disappear
    await waitFor(() => {
      expect(chipsContainer.props.style).toContain('display: none');
    });
  });

  /**
   * AC #3: Message Input
   * GIVEN: Chat screen
   * WHEN: User interacts with input field
   * THEN: Input behavior correct
   */
  it('disables send button when input is empty', () => {
    // GIVEN: Chat screen
    const { getByTestId } = render(<ChatScreen />, { wrapper: TestWrapper });

    // WHEN: Input is empty
    const sendButton = getByTestId('send-button');

    // THEN: Send button is disabled
    expect(sendButton.props.disabled).toBe(true);
  });

  it('enables send button when text is entered', async () => {
    // GIVEN: Chat screen
    const { getByTestId } = render(<ChatScreen />, { wrapper: TestWrapper });

    // WHEN: User types message
    const input = getByTestId('message-input');
    fireEvent.changeText(input, 'Hello Weave');

    // THEN: Send button is enabled
    await waitFor(() => {
      const sendButton = getByTestId('send-button');
      expect(sendButton.props.disabled).toBe(false);
    });
  });

  it('shows character counter when approaching limit', async () => {
    // GIVEN: Chat screen
    const { getByTestId } = render(<ChatScreen />, { wrapper: TestWrapper });

    // WHEN: User types 400+ characters
    const input = getByTestId('message-input');
    const longMessage = 'a'.repeat(450);
    fireEvent.changeText(input, longMessage);

    // THEN: Character counter appears
    await waitFor(() => {
      expect(getByTestId('character-counter')).toBeTruthy();
      expect(screen.getByText('450/500')).toBeTruthy();
    });
  });

  it('enforces 500 character limit', async () => {
    // GIVEN: Chat screen
    const { getByTestId } = render(<ChatScreen />, { wrapper: TestWrapper });

    // WHEN: User tries to type more than 500 characters
    const input = getByTestId('message-input');
    const tooLongMessage = 'a'.repeat(501);
    fireEvent.changeText(input, tooLongMessage);

    // THEN: Input is truncated to 500 characters
    expect(input.props.value.length).toBe(500);
  });

  /**
   * AC #4: Rate Limiting UI
   * GIVEN: User has used messages
   * WHEN: Approaching or hitting limit
   * THEN: UI shows usage indicator and limits access
   */
  it('displays usage indicator showing messages used', async () => {
    // GIVEN: User has sent 3 premium messages
    render(<ChatScreen />, { wrapper: TestWrapper });

    // THEN: Usage indicator shows "3/10 messages used today"
    await waitFor(() => {
      expect(screen.getByText(/3\/10.*messages/i)).toBeTruthy();
    });
  });

  it('shows friendly message when rate limit reached', async () => {
    // GIVEN: User has used all 10 premium messages
    render(<ChatScreen />, { wrapper: TestWrapper });

    // THEN: Friendly limit message displayed
    await waitFor(() => {
      expect(
        screen.getByText(/you've used all 10 messages today.*resets at midnight/i)
      ).toBeTruthy();
    });
  });

  it('disables input when rate limited', async () => {
    // GIVEN: User is rate limited
    const { getByTestId } = render(<ChatScreen />, { wrapper: TestWrapper });

    // THEN: Input and chips are disabled
    await waitFor(() => {
      const input = getByTestId('message-input');
      const chips = getByTestId('quick-action-chips');

      expect(input.props.editable).toBe(false);
      expect(chips.props.disabled).toBe(true);
    });
  });

  it('shows countdown timer to midnight reset', async () => {
    // GIVEN: User is rate limited
    const { getByTestId } = render(<ChatScreen />, { wrapper: TestWrapper });

    // THEN: Countdown timer displayed
    await waitFor(() => {
      expect(getByTestId('reset-countdown-timer')).toBeTruthy();
      expect(screen.getByText(/resets in/i)).toBeTruthy();
    });
  });

  /**
   * AC #5: Server-Initiated Conversation Indicators
   * GIVEN: Weave initiated conversation
   * WHEN: User opens chat
   * THEN: Special indicator shown
   */
  it('shows special indicator for server-initiated messages', async () => {
    // GIVEN: Server-initiated conversation
    const { getByTestId } = render(<ChatScreen />, { wrapper: TestWrapper });

    // THEN: Server-initiated indicator displayed
    await waitFor(() => {
      expect(getByTestId('server-initiated-indicator')).toBeTruthy();
      expect(screen.getByText(/✨ Weave checked in/i)).toBeTruthy();
    });
  });

  /**
   * AC #14: UX Polish - Animations and Haptics
   */
  it('triggers haptic feedback when send button pressed', async () => {
    // GIVEN: Chat screen
    const { getByTestId } = render(<ChatScreen />, { wrapper: TestWrapper });

    // Mock Haptics
    const mockHaptics = jest.fn();
    jest.mock('expo-haptics', () => ({
      impactAsync: mockHaptics,
    }));

    // WHEN: User presses send button
    const input = getByTestId('message-input');
    const sendButton = getByTestId('send-button');

    fireEvent.changeText(input, 'Test message');
    fireEvent.press(sendButton);

    // THEN: Haptic feedback triggered
    await waitFor(() => {
      expect(mockHaptics).toHaveBeenCalledWith('medium');
    });
  });

  it('animates send button on press', async () => {
    // GIVEN: Chat screen
    const { getByTestId } = render(<ChatScreen />, { wrapper: TestWrapper });

    // WHEN: User presses send button
    const sendButton = getByTestId('send-button');
    fireEvent.press(sendButton);

    // THEN: Button animates to scale 0.95
    expect(sendButton.props.style).toContain('transform: scale(0.95)');
  });
});
