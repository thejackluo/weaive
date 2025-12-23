import React from 'react';
import { render } from '@testing-library/react-native';
import { PrimaryButton } from '../PrimaryButton';
import { SecondaryButton } from '../SecondaryButton';
import { GhostButton } from '../GhostButton';
import { DestructiveButton } from '../DestructiveButton';
import { AIButton } from '../AIButton';
import { ThemeProvider } from '../../../theme';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('Convenience Button Components', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
  };

  it('should render PrimaryButton with primary variant', () => {
    const { getByText } = renderWithTheme(
      <PrimaryButton>Primary</PrimaryButton>
    );
    expect(getByText('Primary')).toBeTruthy();
  });

  it('should render SecondaryButton with secondary variant', () => {
    const { getByText } = renderWithTheme(
      <SecondaryButton>Secondary</SecondaryButton>
    );
    expect(getByText('Secondary')).toBeTruthy();
  });

  it('should render GhostButton with ghost variant', () => {
    const { getByText } = renderWithTheme(
      <GhostButton>Ghost</GhostButton>
    );
    expect(getByText('Ghost')).toBeTruthy();
  });

  it('should render DestructiveButton with destructive variant', () => {
    const { getByText } = renderWithTheme(
      <DestructiveButton>Destructive</DestructiveButton>
    );
    expect(getByText('Destructive')).toBeTruthy();
  });

  it('should render AIButton with ai variant', () => {
    const { getByText } = renderWithTheme(
      <AIButton>Generate</AIButton>
    );
    expect(getByText('Generate')).toBeTruthy();
  });
});
