/**
 * MessageInput Component Tests - Story 6.1
 * RED Phase: Tests written BEFORE implementation
 */
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import MessageInput from '../MessageInput';

describe('MessageInput Component', () => {
  /**
   * GIVEN: MessageInput component
   * WHEN: Component renders
   * THEN: Input and send button are displayed
   */
  it('renders text input and send button', () => {
    // GIVEN: MessageInput component
    const { getByTestId } = render(
      <MessageInput value="" onChange={jest.fn()} onSend={jest.fn()} disabled={false} />
    );

    // THEN: Input and button are rendered
    expect(getByTestId('message-input')).toBeTruthy();
    expect(getByTestId('send-button')).toBeTruthy();
  });

  /**
   * GIVEN: Input is empty
   * WHEN: Component renders
   * THEN: Send button is disabled
   */
  it('disables send button when input is empty', () => {
    // GIVEN: Empty input
    const { getByTestId } = render(
      <MessageInput value="" onChange={jest.fn()} onSend={jest.fn()} disabled={false} />
    );

    // THEN: Send button is disabled
    const sendButton = getByTestId('send-button');
    expect(sendButton.props.disabled).toBe(true);
  });

  /**
   * GIVEN: Input has text
   * WHEN: Component renders
   * THEN: Send button is enabled
   */
  it('enables send button when input has text', () => {
    // GIVEN: Input with text
    const { getByTestId } = render(
      <MessageInput value="Hello Weave" onChange={jest.fn()} onSend={jest.fn()} disabled={false} />
    );

    // THEN: Send button is enabled
    const sendButton = getByTestId('send-button');
    expect(sendButton.props.disabled).toBe(false);
  });

  /**
   * GIVEN: User types in input
   * WHEN: Text changes
   * THEN: onChange callback fired with new text
   */
  it('calls onChange when user types', () => {
    // GIVEN: MessageInput with mock callback
    const mockOnChange = jest.fn();
    const { getByTestId } = render(
      <MessageInput value="" onChange={mockOnChange} onSend={jest.fn()} disabled={false} />
    );

    // WHEN: User types
    const input = getByTestId('message-input');
    fireEvent.changeText(input, 'How do I complete a bind?');

    // THEN: onChange called with new text
    expect(mockOnChange).toHaveBeenCalledWith('How do I complete a bind?');
  });

  /**
   * GIVEN: User presses send button
   * WHEN: Button is enabled
   * THEN: onSend callback fired
   */
  it('calls onSend when send button pressed', () => {
    // GIVEN: MessageInput with text
    const mockOnSend = jest.fn();
    const { getByTestId } = render(
      <MessageInput
        value="Test message"
        onChange={jest.fn()}
        onSend={mockOnSend}
        disabled={false}
      />
    );

    // WHEN: User presses send button
    const sendButton = getByTestId('send-button');
    fireEvent.press(sendButton);

    // THEN: onSend called
    expect(mockOnSend).toHaveBeenCalled();
  });

  /**
   * GIVEN: Input with 400+ characters
   * WHEN: Component renders
   * THEN: Character counter is displayed
   */
  it('shows character counter at 400+ characters', () => {
    // GIVEN: Input with 450 characters
    const longText = 'a'.repeat(450);
    const { getByTestId } = render(
      <MessageInput value={longText} onChange={jest.fn()} onSend={jest.fn()} disabled={false} />
    );

    // THEN: Character counter is displayed
    expect(getByTestId('character-counter')).toBeTruthy();
    expect(screen.getByText('450/500')).toBeTruthy();
  });

  /**
   * GIVEN: Input at exactly 500 characters
   * WHEN: Component renders
   * THEN: Character counter shows 500/500
   */
  it('shows 500/500 when at character limit', () => {
    // GIVEN: Input with exactly 500 characters
    const maxText = 'a'.repeat(500);
    render(<MessageInput value={maxText} onChange={jest.fn()} onSend={jest.fn()} disabled={false} />);

    // THEN: Character counter shows limit
    expect(screen.getByText('500/500')).toBeTruthy();
  });

  /**
   * GIVEN: User tries to type more than 500 characters
   * WHEN: Text exceeds limit
   * THEN: Input is truncated
   */
  it('enforces 500 character limit', () => {
    // GIVEN: MessageInput
    const mockOnChange = jest.fn();
    const { getByTestId } = render(
      <MessageInput value="" onChange={mockOnChange} onSend={jest.fn()} disabled={false} />
    );

    // WHEN: User tries to type 501 characters
    const input = getByTestId('message-input');
    const tooLongText = 'a'.repeat(501);
    fireEvent.changeText(input, tooLongText);

    // THEN: onChange called with truncated text (500 chars)
    expect(mockOnChange).toHaveBeenCalledWith('a'.repeat(500));
  });

  /**
   * GIVEN: MessageInput disabled
   * WHEN: Component renders
   * THEN: Input and button are disabled
   */
  it('disables input and button when disabled prop is true', () => {
    // GIVEN: Disabled MessageInput
    const { getByTestId } = render(
      <MessageInput value="" onChange={jest.fn()} onSend={jest.fn()} disabled={true} />
    );

    // THEN: Both input and button are disabled
    const input = getByTestId('message-input');
    const sendButton = getByTestId('send-button');

    expect(input.props.editable).toBe(false);
    expect(sendButton.props.disabled).toBe(true);
  });

  /**
   * GIVEN: User presses Enter/Return on keyboard
   * WHEN: onSubmitEditing triggered
   * THEN: onSend callback fired
   */
  it('submits message when Enter pressed on keyboard', () => {
    // GIVEN: MessageInput with text
    const mockOnSend = jest.fn();
    const { getByTestId } = render(
      <MessageInput
        value="Test message"
        onChange={jest.fn()}
        onSend={mockOnSend}
        disabled={false}
      />
    );

    // WHEN: User presses Enter
    const input = getByTestId('message-input');
    fireEvent(input, 'submitEditing');

    // THEN: onSend called
    expect(mockOnSend).toHaveBeenCalled();
  });

  /**
   * GIVEN: MessageInput component
   * WHEN: Rendered
   * THEN: Placeholder text is correct
   */
  it('displays correct placeholder text', () => {
    // GIVEN: MessageInput
    const { getByTestId } = render(
      <MessageInput value="" onChange={jest.fn()} onSend={jest.fn()} disabled={false} />
    );

    // THEN: Placeholder is "Talk to Weave..."
    const input = getByTestId('message-input');
    expect(input.props.placeholder).toBe('Talk to Weave...');
  });

  /**
   * GIVEN: User presses send button
   * WHEN: Button press occurs
   * THEN: Send button animates with scale effect
   */
  it('animates send button on press', () => {
    // GIVEN: MessageInput with text
    const { getByTestId } = render(
      <MessageInput value="Test" onChange={jest.fn()} onSend={jest.fn()} disabled={false} />
    );

    // WHEN: User presses send button
    const sendButton = getByTestId('send-button');
    fireEvent.pressIn(sendButton);

    // THEN: Scale animation applied
    expect(sendButton.props.style).toContain('transform: scale(0.95)');
  });
});
