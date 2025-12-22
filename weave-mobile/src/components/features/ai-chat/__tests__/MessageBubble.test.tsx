/**
 * MessageBubble Component Tests - Story 6.1
 * RED Phase: Tests written BEFORE implementation
 */
import React from 'react';
import { render } from '@testing-library/react-native';
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
      role: 'user' as const,
      content: 'How do I complete a bind?',
      timestamp: '2025-12-22T10:00:00Z',
    };

    // WHEN: Rendering message bubble
    const { getByTestId } = render(<MessageBubble message={message} />);

    // THEN: Correct styling applied
    const bubble = getByTestId('message-bubble');
    expect(bubble.props.style).toContain('alignSelf: flex-end'); // Right-aligned
    expect(bubble.props.style).toContain('blue'); // Blue color
  });

  /**
   * GIVEN: Assistant message data
   * WHEN: Rendering message bubble
   * THEN: Assistant message styled correctly (purple gradient, left-aligned)
   */
  it('renders assistant message with purple gradient and left alignment', () => {
    // GIVEN: Assistant message
    const message = {
      role: 'assistant' as const,
      content: 'To complete a bind, tap the checkmark next to it.',
      timestamp: '2025-12-22T10:01:00Z',
    };

    // WHEN: Rendering message bubble
    const { getByTestId } = render(<MessageBubble message={message} />);

    // THEN: Correct styling applied
    const bubble = getByTestId('message-bubble');
    expect(bubble.props.style).toContain('alignSelf: flex-start'); // Left-aligned
    expect(bubble.props.style).toContain('purple'); // Purple gradient
  });

  /**
   * GIVEN: Message with glassmorphism design
   * WHEN: Rendering message bubble
   * THEN: Translucent background with backdrop blur applied
   */
  it('applies glassmorphism effect to message bubble', () => {
    // GIVEN: Any message
    const message = {
      role: 'user' as const,
      content: 'Test message',
      timestamp: '2025-12-22T10:00:00Z',
    };

    // WHEN: Rendering message bubble
    const { getByTestId } = render(<MessageBubble message={message} />);

    // THEN: Glassmorphism styling applied
    const bubble = getByTestId('message-bubble');
    expect(bubble.props.style).toContain('backdrop-filter: blur');
    expect(bubble.props.style).toContain('opacity'); // Translucent
  });

  /**
   * GIVEN: User long-presses message
   * WHEN: Long-press gesture detected
   * THEN: Timestamp and copy option shown
   */
  it('shows timestamp on long-press', async () => {
    // GIVEN: Message bubble
    const message = {
      role: 'user' as const,
      content: 'Test message',
      timestamp: '2025-12-22T10:00:00Z',
    };

    const { getByTestId } = render(<MessageBubble message={message} />);

    // WHEN: User long-presses message
    const bubble = getByTestId('message-bubble');
    fireEvent(bubble, 'longPress');

    // THEN: Timestamp appears
    expect(getByTestId('message-timestamp')).toBeTruthy();
    expect(screen.getByText(/10:00/)).toBeTruthy();
  });

  it('shows copy option on long-press', async () => {
    // GIVEN: Message bubble
    const message = {
      role: 'user' as const,
      content: 'Test message',
      timestamp: '2025-12-22T10:00:00Z',
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
      role: 'user' as const,
      content: 'This is a very long message that should wrap properly within the message bubble without overflowing or breaking the layout in any way.',
      timestamp: '2025-12-22T10:00:00Z',
    };

    // WHEN: Rendering message bubble
    const { getByText } = render(<MessageBubble message={message} />);

    // THEN: Text wraps properly
    const content = getByText(message.content);
    expect(content.props.numberOfLines).toBeUndefined(); // No truncation
    expect(content.props.style).toContain('flexWrap: wrap');
  });
});
