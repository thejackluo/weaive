import { useTheme } from '../ThemeProvider';
import { TypographyToken } from '../../tokens/typography';

/**
 * Get typography tokens from the theme
 */
export function useTypography(): TypographyToken {
  const { typography } = useTheme();
  return typography;
}
