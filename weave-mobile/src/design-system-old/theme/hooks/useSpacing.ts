import { useTheme } from '../ThemeProvider';
import { SpacingToken } from '../../tokens/spacing';

/**
 * Get spacing tokens from the theme
 */
export function useSpacing(): SpacingToken {
  const { spacing } = useTheme();
  return spacing;
}
