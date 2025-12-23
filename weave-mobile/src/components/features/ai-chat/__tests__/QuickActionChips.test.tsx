/**
 * QuickActionChips Component Tests - Story 6.1
 * RED Phase: Tests written BEFORE implementation
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import QuickActionChips from '../QuickActionChips';

describe('QuickActionChips Component', () => {
  /**
   * GIVEN: Quick action chips component
   * WHEN: Component renders
   * THEN: All 4 chips are displayed
   */
  it('renders all 4 quick action chips', () => {
    // GIVEN: QuickActionChips component
    const { getByTestId } = render(<QuickActionChips onAction={jest.fn()} />);

    // THEN: All chips are rendered
    expect(getByTestId('chip-plan-day')).toBeTruthy();
    expect(getByTestId('chip-im-stuck')).toBeTruthy();
    expect(getByTestId('chip-edit-goal')).toBeTruthy();
    expect(getByTestId('chip-explain-bind')).toBeTruthy();
  });

  /**
   * GIVEN: Quick action chip
   * WHEN: User taps chip
   * THEN: onAction callback fired with predefined prompt
   */
  it('calls onAction with correct prompt when "Plan my day" tapped', () => {
    // GIVEN: QuickActionChips with mock callback
    const mockOnAction = jest.fn();
    const { getByTestId } = render(
      <QuickActionChips onAction={mockOnAction}  />
    );

    // WHEN: User taps "Plan my day" chip
    const planDayChip = getByTestId('chip-plan-day');
    fireEvent.press(planDayChip);

    // THEN: Callback fired with predefined prompt
    expect(mockOnAction).toHaveBeenCalledWith('Can you help me plan my day?');
  });

  it('calls onAction with correct prompt when "I\'m stuck" tapped', () => {
    // GIVEN: QuickActionChips with mock callback
    const mockOnAction = jest.fn();
    const { getByTestId } = render(
      <QuickActionChips onAction={mockOnAction}  />
    );

    // WHEN: User taps "I'm stuck" chip
    const stuckChip = getByTestId('chip-im-stuck');
    fireEvent.press(stuckChip);

    // THEN: Callback fired with predefined prompt
    expect(mockOnAction).toHaveBeenCalledWith(
      "I'm stuck and need help figuring out what to do next."
    );
  });

  /**
   * GIVEN: Chips are hidden (visible=false)
   * WHEN: Component renders
   * THEN: Chips container is hidden
   */
  it('hides chips when visible prop is false', () => {
    // GIVEN: QuickActionChips with visible=false
    const { getByTestId } = render(<QuickActionChips onAction={jest.fn()}  />);

    // THEN: Container is hidden
    const container = getByTestId('quick-action-chips-container');
    expect(container.props.style).toContain('display: none');
  });

  /**
   * GIVEN: Chips are disabled
   * WHEN: User taps chip
   * THEN: No action triggered
   */
  it('does not trigger onAction when disabled', () => {
    // GIVEN: Disabled chips
    const mockOnAction = jest.fn();
    const { getByTestId } = render(
      <QuickActionChips onAction={mockOnAction}   />
    );

    // WHEN: User taps chip
    const chip = getByTestId('chip-plan-day');
    fireEvent.press(chip);

    // THEN: Callback not fired
    expect(mockOnAction).not.toHaveBeenCalled();
  });

  /**
   * GIVEN: User taps chip
   * WHEN: Press event occurs
   * THEN: Chip animates with scale and opacity change
   */
  it('animates chip on press', async () => {
    // GIVEN: QuickActionChips
    const { getByTestId } = render(<QuickActionChips onAction={jest.fn()}  />);

    // WHEN: User presses chip
    const chip = getByTestId('chip-plan-day');
    fireEvent.press(chip);

    // THEN: Scale animation applied
    expect(chip.props.style).toContain('transform: scale(0.97)');
    expect(chip.props.style).toContain('opacity: 0.8');
  });

  /**
   * GIVEN: Chips rendered
   * WHEN: Component displayed
   * THEN: Chips have correct labels
   */
  it('displays correct chip labels', () => {
    // GIVEN: QuickActionChips
    const { getByText } = render(<QuickActionChips onAction={jest.fn()}  />);

    // THEN: Labels are correct
    expect(getByText('Plan my day')).toBeTruthy();
    expect(getByText("I'm stuck")).toBeTruthy();
    expect(getByText('Edit my goal')).toBeTruthy();
    expect(getByText('Explain this bind')).toBeTruthy();
  });
});
