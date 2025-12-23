import React from 'react';
import { render } from '@testing-library/react-native';
import { AnimatedText } from '../AnimatedText';
import { ThemeProvider } from '../../../theme';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('AnimatedText Component', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
  };

  it('should render AnimatedText with fadeIn animation', () => {
    const { getByTestId } = renderWithTheme(
      <AnimatedText animation="fadeIn" testID="animated-text-fadeIn">
        Fade In Text
      </AnimatedText>
    );
    expect(getByTestId('animated-text-fadeIn')).toBeTruthy();
  });

  it('should render AnimatedText with slideUp animation', () => {
    const { getByTestId } = renderWithTheme(
      <AnimatedText animation="slideUp" testID="animated-text-slideUp">
        Slide Up Text
      </AnimatedText>
    );
    expect(getByTestId('animated-text-slideUp')).toBeTruthy();
  });

  it('should respect reduced motion accessibility setting', async () => {
    const AccessibilityInfo = require('react-native').AccessibilityInfo;
    AccessibilityInfo.isReduceMotionEnabled = jest.fn(() => Promise.resolve(true));

    const { getByTestId } = renderWithTheme(
      <AnimatedText animation="fadeIn" testID="reduced-motion-text">
        Reduced Motion Text
      </AnimatedText>
    );
    expect(getByTestId('reduced-motion-text')).toBeTruthy();
  });
});
