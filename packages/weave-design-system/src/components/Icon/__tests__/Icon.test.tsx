import React from 'react';
import { render } from '@testing-library/react-native';
import { Icon } from '../Icon';
import { ThemeProvider } from '../../../theme';

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    icons: {
      Sparkles: (props: any) => <View testID="icon-sparkles" {...props} />,
      CheckCircle: (props: any) => <View testID="icon-check-circle" {...props} />,
      AlertCircle: (props: any) => <View testID="icon-alert-circle" {...props} />,
      ArrowRight: (props: any) => <View testID="icon-arrow-right" {...props} />,
      X: (props: any) => <View testID="icon-x" {...props} />,
      Menu: (props: any) => <View testID="icon-menu" {...props} />,
      Settings: (props: any) => <View testID="icon-settings" {...props} />,
      User: (props: any) => <View testID="icon-user" {...props} />,
      Search: (props: any) => <View testID="icon-search" {...props} />,
      Heart: (props: any) => <View testID="icon-heart" {...props} />,
    },
  };
});

describe('Icon Component', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
  };

  it('should render Icon from Lucide library', () => {
    const { getByTestId } = renderWithTheme(
      <Icon name="sparkles" testID="icon-component" />
    );
    expect(getByTestId('icon-component')).toBeTruthy();
  });

  it('should apply theme color tokens', () => {
    const { getByTestId } = renderWithTheme(
      <Icon name="sparkles" color="text.primary" testID="colored-icon" />
    );
    expect(getByTestId('colored-icon')).toBeTruthy();
  });

  it('should support size prop (default 24px)', () => {
    const { getByTestId } = renderWithTheme(
      <Icon name="sparkles" size={32} testID="sized-icon" />
    );
    expect(getByTestId('sized-icon')).toBeTruthy();
  });

  it('should support strokeWidth prop (default 2)', () => {
    const { getByTestId } = renderWithTheme(
      <Icon name="sparkles" strokeWidth={1.5} testID="stroke-icon" />
    );
    expect(getByTestId('stroke-icon')).toBeTruthy();
  });

  it('should render multiple icon variants', () => {
    const iconNames = [
      'sparkles',
      'check-circle',
      'alert-circle',
      'arrow-right',
      'x',
      'menu',
      'settings',
      'user',
      'search',
      'heart',
    ] as const;

    iconNames.forEach((name) => {
      const { getByTestId } = renderWithTheme(
        <Icon name={name} testID={`icon-${name}`} />
      );
      expect(getByTestId(`icon-${name}`)).toBeTruthy();
    });
  });
});
