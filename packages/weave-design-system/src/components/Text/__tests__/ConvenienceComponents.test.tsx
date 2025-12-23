import React from 'react';
import { render } from '@testing-library/react-native';
import { Title } from '../Title';
import { Subtitle } from '../Subtitle';
import { Body } from '../Body';
import { BodySmall } from '../BodySmall';
import { Caption } from '../Caption';
import { Label } from '../Label';
import { ThemeProvider } from '../../../theme';

describe('Convenience Text Components', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
  };

  it('should render Title with titleMd variant', () => {
    const { getByText } = renderWithTheme(<Title>Title Text</Title>);
    expect(getByText('Title Text')).toBeTruthy();
  });

  it('should render Subtitle with titleSm variant', () => {
    const { getByText } = renderWithTheme(<Subtitle>Subtitle Text</Subtitle>);
    expect(getByText('Subtitle Text')).toBeTruthy();
  });

  it('should render Body with bodyMd variant', () => {
    const { getByText } = renderWithTheme(<Body>Body Text</Body>);
    expect(getByText('Body Text')).toBeTruthy();
  });

  it('should render BodySmall with bodySm variant', () => {
    const { getByText } = renderWithTheme(<BodySmall>Small Body Text</BodySmall>);
    expect(getByText('Small Body Text')).toBeTruthy();
  });

  it('should render Caption with caption variant', () => {
    const { getByText } = renderWithTheme(<Caption>Caption Text</Caption>);
    expect(getByText('Caption Text')).toBeTruthy();
  });

  it('should render Label with label variant', () => {
    const { getByText } = renderWithTheme(<Label>Label Text</Label>);
    expect(getByText('Label Text')).toBeTruthy();
  });
});
