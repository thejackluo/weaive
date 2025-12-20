/**
 * Button Component Tests
 *
 * Basic smoke tests for the Button component infrastructure.
 * These tests verify that Jest and React Native Testing Library are configured correctly.
 */

import React from 'react';
import { Text, Pressable } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';

// Simple button component for testing purposes
interface SimpleButtonProps {
  onPress?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const SimpleButton: React.FC<SimpleButtonProps> = ({ onPress, disabled, children }) => (
  <Pressable onPress={onPress} disabled={disabled} testID="simple-button">
    <Text>{children}</Text>
  </Pressable>
);

describe('Button', () => {
  it('should render with text', () => {
    const { getByText } = render(<SimpleButton>Click Me</SimpleButton>);
    expect(getByText('Click Me')).toBeTruthy();
  });

  it('should call onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <SimpleButton onPress={onPress}>Click Me</SimpleButton>
    );

    fireEvent.press(getByText('Click Me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <SimpleButton onPress={onPress} disabled>
        Click Me
      </SimpleButton>
    );

    fireEvent.press(getByText('Click Me'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
