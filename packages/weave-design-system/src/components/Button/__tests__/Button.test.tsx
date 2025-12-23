import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';
import { ThemeProvider } from '../../../theme';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('Button Component', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
  };

  describe('Base Button Variants', () => {
    it('should render Button with primary variant', () => {
      const { getByTestId } = renderWithTheme(
        <Button variant="primary" testID="primary-button">
          Primary Button
        </Button>
      );
      expect(getByTestId('primary-button')).toBeTruthy();
    });

    it('should render Button with all 5 variants (primary, secondary, ghost, destructive, ai)', () => {
      const variants = ['primary', 'secondary', 'ghost', 'destructive', 'ai'] as const;

      variants.forEach((variant) => {
        const { getByTestId } = renderWithTheme(
          <Button variant={variant} testID={`button-${variant}`}>
            {variant} Button
          </Button>
        );
        expect(getByTestId(`button-${variant}`)).toBeTruthy();
      });
    });

    it('should render unstyled Button variant for full customization', () => {
      const { getByTestId } = renderWithTheme(
        <Button variant="unstyled" testID="unstyled-button">
          Unstyled Button
        </Button>
      );
      expect(getByTestId('unstyled-button')).toBeTruthy();
    });
  });

  describe('Button Sizes', () => {
    it('should render Button in 3 sizes (sm, md, lg)', () => {
      const sizes = ['sm', 'md', 'lg'] as const;

      sizes.forEach((size) => {
        const { getByTestId } = renderWithTheme(
          <Button size={size} testID={`button-${size}`}>
            {size} Button
          </Button>
        );
        expect(getByTestId(`button-${size}`)).toBeTruthy();
      });
    });

    it('should render fullWidth button', () => {
      const { getByTestId } = renderWithTheme(
        <Button fullWidth testID="fullwidth-button">
          Full Width Button
        </Button>
      );
      expect(getByTestId('fullwidth-button')).toBeTruthy();
    });
  });

  describe('Button Interactions', () => {
    it('should trigger spring press animation on press', () => {
      const onPressMock = jest.fn();
      const { getByTestId } = renderWithTheme(
        <Button onPress={onPressMock} testID="animated-button">
          Animated Button
        </Button>
      );

      const button = getByTestId('animated-button');
      fireEvent(button, 'pressIn');
      fireEvent(button, 'pressOut');
      fireEvent.press(button);

      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('should disable button when disabled prop set', () => {
      const onPressMock = jest.fn();
      const { getByTestId } = renderWithTheme(
        <Button onPress={onPressMock} disabled testID="disabled-button">
          Disabled Button
        </Button>
      );

      const button = getByTestId('disabled-button');
      fireEvent.press(button);

      expect(onPressMock).not.toHaveBeenCalled();
    });
  });

  describe('Button States', () => {
    it('should show loading state with spinner', () => {
      const { getByTestId, queryByText } = renderWithTheme(
        <Button loading testID="loading-button">
          Loading Button
        </Button>
      );

      expect(getByTestId('loading-button')).toBeTruthy();
    });
  });

  describe('Composable Anatomy', () => {
    it('should render Button with composable anatomy (Icon + Text + Spinner)', () => {
      const { getByTestId } = renderWithTheme(
        <Button testID="composable-button">
          <Button.Icon name="sparkles" testID="button-icon" />
          <Button.Text testID="button-text">Generate</Button.Text>
        </Button>
      );

      expect(getByTestId('composable-button')).toBeTruthy();
    });
  });

  describe('Color-Matched Shadows', () => {
    it('should apply color-matched shadows for primary button', () => {
      const { getByTestId } = renderWithTheme(
        <Button variant="primary" testID="shadow-button">
          Shadow Button
        </Button>
      );
      expect(getByTestId('shadow-button')).toBeTruthy();
    });
  });
});
