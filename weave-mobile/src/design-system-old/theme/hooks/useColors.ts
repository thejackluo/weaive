import { useTheme } from '../ThemeProvider';
import { ColorToken } from '../../tokens/colors';

/**
 * Get color tokens from the theme
 */
export function useColors(): ColorToken {
  const { colors } = useTheme();
  return colors;
}
