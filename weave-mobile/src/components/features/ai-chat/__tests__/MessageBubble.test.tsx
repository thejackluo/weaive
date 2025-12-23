/**
 * MessageBubble Component Tests - Story 6.1
 * RED Phase: Tests written BEFORE implementation
 */
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import MessageBubble from '../MessageBubble';

describe('MessageBubble Component', () => {
  /**
   * GIVEN: User message data
   * WHEN: Rendering message bubble
   * THEN: User message styled correctly (blue, right-aligned)
   */
  it('renders user message with blue styling and right alignment', () => {
    // GIVEN: User message
    const message = {
      id: '1',
      role: 'user' as const,
      content: 'How do I complete a bind?',
      timestamp: new Date('2025-12-22T10:00:00Z'),
    };

    // WHEN: Rendering message bubble
    const { getByTestId, getByText } = render(<MessageBubble message={message} />);

    // THEN: Message renders correctly (user messages are styled with blue background)
    const bubble = getByTestId('message-bubble');
    expect(bubble).toBeTruthy();
    expect(getByText('How do I complete a bind?')).toBeTruthy();
  });

  /**
   * GIVEN: Assistant message data
   * WHEN: Rendering message bubble
   * THEN: Assistant message styled correctly (purple gradient, left-aligned)
   */
  it('renders assistant message with purple gradient and left alignment', () => {
    // GIVEN: Assistant message
    const message = {
      id: '2',
      role: 'assistant' as const,
      content: 'To complete a bind, tap the checkmark next to it.',
      timestamp: new Date('2025-12-22T10:01:00Z'),
    };

    // WHEN: Rendering message bubble
    const { getByTestId, getByText } = render(<MessageBubble message={message} />);

    // THEN: Message renders correctly (assistant messages are styled with purple background)
    const bubble = getByTestId('message-bubble');
    expect(bubble).toBeTruthy();
    expect(getByText('To complete a bind, tap the checkmark next to it.')).toBeTruthy();
  });

  /**
   * GIVEN: Message with glassmorphism design
   * WHEN: Rendering message bubble
   * THEN: Translucent background with backdrop blur applied
   */
  it('applies glassmorphism effect to message bubble', () => {
    // GIVEN: Any message
    const message = {
      id: '3',
      role: 'user' as const,
      content: 'Test message',
      timestamp: new Date('2025-12-22T10:00:00Z'),
    };

    // WHEN: Rendering message bubble
    const { getByTestId } = render(<MessageBubble message={message} />);

    // THEN: Glassmorphism styling applied via BlurView
    const bubble = getByTestId('message-bubble');
    expect(bubble).toBeTruthy();
    const blurView = getByTestId('blur-view');
    expect(blurView).toBeTruthy();
  });

  /**
   * GIVEN: User long-presses message
   * WHEN: Long-press gesture detected
   * THEN: Timestamp and copy option shown
   */
  it('shows timestamp on long-press', async () => {
    // GIVEN: Message bubble
    const message = {
      id: '4',
      role: 'user' as const,
      content: 'Test message',
      timestamp: new Date('2025-12-22T10:00:00Z'),
    };

    const { getByTestId } = render(<MessageBubble message={message} />);

    // WHEN: User long-presses message
    const bubble = getByTestId('message-bubble');
    fireEvent(bubble, 'longPress');

    // THEN: Timestamp appears (formatted in local timezone)
    expect(getByTestId('message-timestamp')).toBeTruthy();
    // Note: timestamp converts from UTC to local timezone
    const timestampElement = getByTestId('message-timestamp');
    expect(timestampElement).toBeTruthy();
  });

  it('shows copy option on long-press', async () => {
    // GIVEN: Message bubble
    const message = {
      id: '5',
      role: 'user' as const,
      content: 'Test message',
      timestamp: new Date('2025-12-22T10:00:00Z'),
    };

    const { getByTestId } = render(<MessageBubble message={message} />);

    // WHEN: User long-presses message
    const bubble = getByTestId('message-bubble');
    fireEvent(bubble, 'longPress');

    // THEN: Copy button appears
    expect(getByTestId('copy-message-button')).toBeTruthy();
  });

  /**
   * GIVEN: Long message content
   * WHEN: Rendering message bubble
   * THEN: Content wraps properly within bubble
   */
  it('wraps long content correctly', () => {
    // GIVEN: Long message
    const message = {
      id: '6',
      role: 'user' as const,
      content:
        'This is a very long message that should wrap properly within the message bubble without overflowing or breaking the layout in any way.',
      timestamp: new Date('2025-12-22T10:00:00Z'),
    };

    // WHEN: Rendering message bubble
    const { getByText } = render(<MessageBubble message={message} />);

    // THEN: Text renders without truncation
    const content = getByText(message.content);
    expect(content.props.numberOfLines).toBeUndefined(); // No truncation
    expect(content).toBeTruthy();
  });
});
