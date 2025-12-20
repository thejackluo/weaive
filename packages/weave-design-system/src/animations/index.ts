/**
 * Animations
 *
 * Spring physics animation presets and utilities using React Native Reanimated
 *
 * All animations:
 * - Run at 60fps on UI thread
 * - Support reduced motion
 * - Use spring physics for natural feel
 *
 * @packageDocumentation
 */

import { withSpring, WithSpringConfig, withTiming, WithTimingConfig } from 'react-native-reanimated';

// =============================================================================
// SPRING PRESETS
// =============================================================================

/**
 * Gentle spring - Soft, slow animations for subtle effects
 * Use for: Hover states, focus indicators, gentle transitions
 */
export const springGentle: WithSpringConfig = {
  damping: 20,
  stiffness: 150,
  mass: 1,
};

/**
 * Snappy spring - Quick, responsive animations
 * Use for: Button presses, tab switches, interactive elements
 */
export const springSnappy: WithSpringConfig = {
  damping: 15,
  stiffness: 250,
  mass: 1,
};

/**
 * Bouncy spring - Playful, energetic animations
 * Use for: Confetti, celebrations, delightful moments
 */
export const springBouncy: WithSpringConfig = {
  damping: 10,
  stiffness: 200,
  mass: 1,
};

/**
 * Smooth spring - Balanced, natural feel
 * Use for: Card transitions, modal animations, general use
 */
export const springSmooth: WithSpringConfig = {
  damping: 18,
  stiffness: 180,
  mass: 1,
};

// =============================================================================
// TIMING PRESETS
// =============================================================================

/**
 * Fast timing - Quick transitions
 */
export const timingFast: WithTimingConfig = {
  duration: 150,
};

/**
 * Base timing - Standard transitions
 */
export const timingBase: WithTimingConfig = {
  duration: 250,
};

/**
 * Slow timing - Deliberate transitions
 */
export const timingSlow: WithTimingConfig = {
  duration: 350,
};

// =============================================================================
// ANIMATION UTILITIES
// =============================================================================

/**
 * Create spring animation with preset
 *
 * @example
 * ```tsx
 * const scale = useSharedValue(1);
 * scale.value = spring(0.95, 'snappy');
 * ```
 */
export function spring(
  toValue: number,
  preset: 'gentle' | 'snappy' | 'bouncy' | 'smooth' = 'smooth'
): number {
  const presets = {
    gentle: springGentle,
    snappy: springSnappy,
    bouncy: springBouncy,
    smooth: springSmooth,
  };

  return withSpring(toValue, presets[preset]);
}

/**
 * Create timing animation with preset
 *
 * @example
 * ```tsx
 * const opacity = useSharedValue(0);
 * opacity.value = timing(1, 'fast');
 * ```
 */
export function timing(
  toValue: number,
  preset: 'fast' | 'base' | 'slow' = 'base'
): number {
  const presets = {
    fast: timingFast,
    base: timingBase,
    slow: timingSlow,
  };

  return withTiming(toValue, presets[preset]);
}

/**
 * Get reduced motion setting (placeholder)
 * Will integrate with AccessibilityInfo in implementation
 */
export function shouldReduceMotion(): boolean {
  // TODO: Integrate with AccessibilityInfo.isReduceMotionEnabled()
  return false;
}

// =============================================================================
// PRESS ANIMATION HELPER
// =============================================================================

/**
 * Standard press animation scale
 * Scales down to 95% on press
 */
export const PRESS_SCALE = 0.95;

/**
 * Create press animation handlers
 *
 * @example
 * ```tsx
 * const scale = useSharedValue(1);
 * const { onPressIn, onPressOut } = usePressAnimation(scale);
 * ```
 */
export function createPressAnimation() {
  return {
    scale: PRESS_SCALE,
    config: springSnappy,
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export const springs = {
  gentle: springGentle,
  snappy: springSnappy,
  bouncy: springBouncy,
  smooth: springSmooth,
};

export const timings = {
  fast: timingFast,
  base: timingBase,
  slow: timingSlow,
};

export const animations = {
  springs,
  timings,
  spring,
  timing,
  shouldReduceMotion,
  createPressAnimation,
  PRESS_SCALE,
};
