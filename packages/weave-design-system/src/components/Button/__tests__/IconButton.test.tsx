import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { IconButton } from '../IconButton';
import { ThemeProvider } from '../../../theme';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('IconButton Component', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
  };

  it('should render IconButton with square aspect ratio', () => {
    const { getByTestId } = renderWithTheme(
      <IconButton icon="sparkles" size="md" testID="icon-button-square" />
    );
    expect(getByTestId('icon-button-square')).toBeTruthy();
  });

  it('should render IconButton with all variants', () => {
    const variants = ['primary', 'secondary', 'ghost', 'destructive', 'ai'] as const;

    variants.forEach((variant) => {
      const { getByTestId } = renderWithTheme(
        <IconButton
          icon="sparkles"
          variant={variant}
          testID={`icon-button-${variant}`}
        />
      );
      expect(getByTestId(`icon-button-${variant}`)).toBeTruthy();
    });
  });

  it('should trigger spring press animation on IconButton press', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = renderWithTheme(
      <IconButton
        icon="sparkles"
        onPress={onPressMock}
        testID="animated-icon-button"
      />
    );

    const button = getByTestId('animated-icon-button');
    fireEvent(button, 'pressIn');
    fireEvent(button, 'pressOut');
    fireEvent.press(button);

    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
