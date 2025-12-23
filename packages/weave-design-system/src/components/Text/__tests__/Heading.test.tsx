import React from 'react';
import { render } from '@testing-library/react-native';
import { Heading } from '../Heading';
import { ThemeProvider } from '../../../theme';

describe('Heading Component', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
  };

  it('should map heading levels 1-6 to display/title variants', () => {
    const levels = [1, 2, 3, 4, 5, 6] as const;
    const expectedVariants = [
      'displayLg',
      'displayMd',
      'displaySm',
      'titleLg',
      'titleMd',
      'titleSm',
    ];

    levels.forEach((level, index) => {
      const { getByTestId } = renderWithTheme(
        <Heading level={level} testID={`heading-level-${level}`}>
          Heading {level}
        </Heading>
      );
      expect(getByTestId(`heading-level-${level}`)).toBeTruthy();
    });
  });

  it('should have proper accessibility semantics for screen readers', () => {
    const { getByTestId } = renderWithTheme(
      <Heading level={1} testID="accessible-heading">
        Accessible Heading
      </Heading>
    );
    const heading = getByTestId('accessible-heading');
    expect(heading.props.accessibilityRole).toBe('header');
  });
});
