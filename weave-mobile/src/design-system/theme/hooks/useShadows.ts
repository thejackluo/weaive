import { useTheme } from '../ThemeProvider';
import { ShadowToken, GlassToken } from '../../tokens/effects';

/**
 * Get shadow and glass effect tokens from the theme
 */
export function useShadows(): { shadows: ShadowToken; glass: GlassToken } {
  const { shadows, glass } = useTheme();
  return { shadows, glass };
}
