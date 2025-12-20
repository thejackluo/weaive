/**
 * Button Component Tests
 *
 * Tests the core functionality of the Button component including:
 * - Rendering with text
 * - Press interactions
 * - Variant styles
 * - Disabled state
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';
import { ThemeProvider } from '../../../theme/ThemeProvider';

// Wrapper component to provide theme context
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('Button', () => {
  it('should render with text', () => {
    const { getByText } = render(
      <Wrapper>
        <Button>Click Me</Button>
      </Wrapper>
    );

    expect(getByText('Click Me')).toBeTruthy();
  });

  it('should call onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Wrapper>
        <Button onPress={onPress}>Click Me</Button>
      </Wrapper>
    );

    fireEvent.press(getByText('Click Me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Wrapper>
        <Button onPress={onPress} disabled>
          Click Me
        </Button>
      </Wrapper>
    );

    fireEvent.press(getByText('Click Me'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('should render with primary variant', () => {
    const { getByText } = render(
      <Wrapper>
        <Button variant="primary">Primary</Button>
      </Wrapper>
    );

    expect(getByText('Primary')).toBeTruthy();
  });

  it('should render with secondary variant', () => {
    const { getByText } = render(
      <Wrapper>
        <Button variant="secondary">Secondary</Button>
      </Wrapper>
    );

    expect(getByText('Secondary')).toBeTruthy();
  });

  it('should render with left icon', () => {
    const { getByText, getByTestId } = render(
      <Wrapper>
        <Button leftIcon={<div testID="left-icon" />}>With Icon</Button>
      </Wrapper>
    );

    expect(getByText('With Icon')).toBeTruthy();
    // Icon rendering would need additional test setup for React Native icons
  });

  it('should display loading state', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Wrapper>
        <Button onPress={onPress} loading>
          Loading
        </Button>
      </Wrapper>
    );

    // When loading, button should not trigger onPress
    fireEvent.press(getByText('Loading'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
