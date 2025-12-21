import { useTheme } from '../ThemeProvider';
import { SpringConfig, Duration, EasingConfig } from '../../tokens/animations';

/**
 * Get animation tokens from the theme
 */
export function useAnimations(): {
  springs: SpringConfig;
  durations: Duration;
  easings: EasingConfig;
} {
  const { springs, durations, easings } = useTheme();
  return { springs, durations, easings };
}
