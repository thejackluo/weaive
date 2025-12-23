import React from 'react';
import { render } from '@testing-library/react-native';
import { Mono } from '../Mono';
import { ThemeProvider } from '../../../theme';

describe('Mono Component', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
  };

  it('should render Mono with monospace font family', () => {
    const { getByText } = renderWithTheme(<Mono>Monospace Text</Mono>);
    expect(getByText('Monospace Text')).toBeTruthy();
  });

  it('should support mono variants (xs, sm, md, lg)', () => {
    const variants = ['xs', 'sm', 'md', 'lg'] as const;

    variants.forEach((variant) => {
      const { getByTestId } = renderWithTheme(
        <Mono variant={variant} testID={`mono-${variant}`}>
          Mono {variant}
        </Mono>
      );
      expect(getByTestId(`mono-${variant}`)).toBeTruthy();
    });
  });
});
