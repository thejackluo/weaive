import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { Link } from '../Link';
import { ThemeProvider } from '../../../theme';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(),
}));

describe('Link Component', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render Link with onPress callback', () => {
    const onPressMock = jest.fn();
    const { getByText } = renderWithTheme(
      <Link onPress={onPressMock}>Click Me</Link>
    );

    const link = getByText('Click Me');
    fireEvent.press(link);
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('should render Link with spring press animation', () => {
    const { getByTestId } = renderWithTheme(
      <Link testID="animated-link">Animated Link</Link>
    );
    const link = getByTestId('animated-link');
    
    fireEvent(link, 'pressIn');
    fireEvent(link, 'pressOut');
    
    expect(link).toBeTruthy();
  });

  it('should open external links in browser when external=true', () => {
    const { getByText } = renderWithTheme(
      <Link href="https://example.com" external>
        External Link
      </Link>
    );

    const link = getByText('External Link');
    fireEvent.press(link);
    expect(Linking.openURL).toHaveBeenCalledWith('https://example.com');
  });

  it('should disable Link when disabled prop set', () => {
    const onPressMock = jest.fn();
    const { getByText } = renderWithTheme(
      <Link onPress={onPressMock} disabled>
        Disabled Link
      </Link>
    );

    const link = getByText('Disabled Link');
    fireEvent.press(link);
    expect(onPressMock).not.toHaveBeenCalled();
  });
});
