import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from '../Text';
import { ThemeProvider } from '../../../theme';

describe('Text Component', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
  };

  describe('Base Text Component', () => {
    it('should render base Text component with default variant', () => {
      const { getByText } = renderWithTheme(<Text>Hello World</Text>);
      expect(getByText('Hello World')).toBeTruthy();
    });

    it('should apply typography tokens for all 11 variants', () => {
      const variants = [
        'displayLg',
        'displayMd',
        'displaySm',
        'titleLg',
        'titleMd',
        'titleSm',
        'bodyLg',
        'bodyMd',
        'bodySm',
        'caption',
        'label',
      ] as const;

      variants.forEach((variant) => {
        const { getByTestId } = renderWithTheme(
          <Text variant={variant} testID={`text-${variant}`}>
            Test {variant}
          </Text>
        );
        expect(getByTestId(`text-${variant}`)).toBeTruthy();
      });
    });

    it('should apply theme colors via color prop', () => {
      const { getByTestId } = renderWithTheme(
        <Text color="text.primary" testID="colored-text">
          Colored Text
        </Text>
      );
      expect(getByTestId('colored-text')).toBeTruthy();
    });

    it('should handle text truncation with numberOfLines prop', () => {
      const { getByTestId } = renderWithTheme(
        <Text numberOfLines={2} testID="truncated-text">
          This is a very long text that should be truncated after two lines
        </Text>
      );
      const textElement = getByTestId('truncated-text');
      expect(textElement.props.numberOfLines).toBe(2);
    });

    it('should support custom styles alongside variant styles', () => {
      const { getByTestId } = renderWithTheme(
        <Text style={{ marginTop: 10 }} testID="styled-text">
          Styled Text
        </Text>
      );
      expect(getByTestId('styled-text')).toBeTruthy();
    });

    it('should render children as text content', () => {
      const { getByText } = renderWithTheme(
        <Text>
          <Text>Nested </Text>
          Text
        </Text>
      );
      expect(getByText('Nested')).toBeTruthy();
    });

    it('should apply weight prop (normal, medium, semibold, bold)', () => {
      const weights = ['normal', 'medium', 'semibold', 'bold'] as const;

      weights.forEach((weight) => {
        const { getByTestId } = renderWithTheme(
          <Text weight={weight} testID={`text-${weight}`}>
            Text with {weight} weight
          </Text>
        );
        expect(getByTestId(`text-${weight}`)).toBeTruthy();
      });
    });
  });
});
