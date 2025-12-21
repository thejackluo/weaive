/**
 * Animation Design Tokens
 *
 * Optimized for React Native Reanimated v4+
 * Provides spring configurations, timing durations, and easing functions
 */

import { WithSpringConfig } from 'react-native-reanimated';
import { Easing } from 'react-native';

// ============================================================================
// Spring Configurations (for withSpring)
// ============================================================================
export const springs = {
  // Default spring - smooth, natural
  default: {
    damping: 15,
    stiffness: 150,
    mass: 1,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
  } as WithSpringConfig,

  // Quick spring - fast, snappy
  quick: {
    damping: 20,
    stiffness: 300,
    mass: 0.8,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
  } as WithSpringConfig,

  // Gentle spring - slow, smooth
  gentle: {
    damping: 20,
    stiffness: 100,
    mass: 1.2,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
  } as WithSpringConfig,

  // Bouncy spring - playful, overshoots
  bouncy: {
    damping: 10,
    stiffness: 200,
    mass: 1,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
  } as WithSpringConfig,

  // Press spring - button press feedback
  press: {
    damping: 15,
    stiffness: 400,
    mass: 0.5,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
  } as WithSpringConfig,

  // Stiff spring - minimal bounce
  stiff: {
    damping: 25,
    stiffness: 300,
    mass: 0.8,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
  } as WithSpringConfig,
} as const;

// ============================================================================
// Timing Durations (for withTiming)
// ============================================================================
export const durations = {
  instant: 0,
  fast: 150, // Quick UI feedback
  normal: 200, // Standard animations
  moderate: 300, // Modal transitions
  slow: 500, // Page transitions
  verySlow: 800, // Special effects
} as const;

// ============================================================================
// Easing Functions
// ============================================================================
export const easings = {
  // Standard easing curves
  linear: Easing.linear,
  easeIn: Easing.in(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  easeInOut: Easing.inOut(Easing.ease),

  // Cubic bezier curves (iOS-style)
  cubic: Easing.bezier(0.4, 0.0, 0.2, 1),
  easeInCubic: Easing.bezier(0.4, 0.0, 1, 1),
  easeOutCubic: Easing.bezier(0.0, 0.0, 0.2, 1),
  easeInOutCubic: Easing.bezier(0.4, 0.0, 0.2, 1),

  // Sine curves (smooth)
  easeInSine: Easing.in(Easing.sin),
  easeOutSine: Easing.out(Easing.sin),
  easeInOutSine: Easing.inOut(Easing.sin),

  // Quad curves (subtle)
  easeInQuad: Easing.in(Easing.quad),
  easeOutQuad: Easing.out(Easing.quad),
  easeInOutQuad: Easing.inOut(Easing.quad),

  // Expo curves (dramatic)
  easeInExpo: Easing.in(Easing.exp),
  easeOutExpo: Easing.out(Easing.exp),
  easeInOutExpo: Easing.inOut(Easing.exp),

  // Back curves (overshoot)
  easeInBack: Easing.in(Easing.back(1.7)),
  easeOutBack: Easing.out(Easing.back(1.7)),
  easeInOutBack: Easing.inOut(Easing.back(1.7)),

  // Elastic curves (bouncy)
  easeInElastic: Easing.in(Easing.elastic(1)),
  easeOutElastic: Easing.out(Easing.elastic(1)),
  easeInOutElastic: Easing.inOut(Easing.elastic(1)),
} as const;

// ============================================================================
// Animation Presets (Common Use Cases)
// ============================================================================
export const animationPresets = {
  // Button press feedback
  buttonPress: {
    scale: {
      from: 1,
      to: 0.97,
      spring: springs.press,
    },
  },

  // Card tap feedback
  cardPress: {
    scale: {
      from: 1,
      to: 0.98,
      spring: springs.quick,
    },
  },

  // Fade in
  fadeIn: {
    opacity: {
      from: 0,
      to: 1,
      duration: durations.normal,
      easing: easings.easeOut,
    },
  },

  // Fade out
  fadeOut: {
    opacity: {
      from: 1,
      to: 0,
      duration: durations.fast,
      easing: easings.easeIn,
    },
  },

  // Slide up (modals, sheets)
  slideUp: {
    translateY: {
      from: 100,
      to: 0,
      duration: durations.moderate,
      easing: easings.easeOutCubic,
    },
  },

  // Slide down
  slideDown: {
    translateY: {
      from: 0,
      to: 100,
      duration: durations.normal,
      easing: easings.easeInCubic,
    },
  },

  // Scale in (popovers)
  scaleIn: {
    scale: {
      from: 0.9,
      to: 1,
      spring: springs.quick,
    },
    opacity: {
      from: 0,
      to: 1,
      duration: durations.fast,
    },
  },

  // Scale out
  scaleOut: {
    scale: {
      from: 1,
      to: 0.9,
      spring: springs.quick,
    },
    opacity: {
      from: 1,
      to: 0,
      duration: durations.fast,
    },
  },
} as const;

// ============================================================================
// Layout Animation Configs
// ============================================================================
export const layoutAnimations = {
  // Smooth layout changes
  default: {
    duration: durations.normal,
    type: 'easeInEaseOut' as const,
  },

  // Quick layout changes
  quick: {
    duration: durations.fast,
    type: 'easeInEaseOut' as const,
  },

  // Springy layout changes
  spring: {
    type: 'spring' as const,
    springDamping: 15,
    initialVelocity: 0,
  },
} as const;

// ============================================================================
// Type Exports
// ============================================================================
export type SpringConfig = typeof springs;
export type SpringPreset = keyof typeof springs;
export type Duration = typeof durations;
export type DurationKey = keyof typeof durations;
export type EasingConfig = typeof easings;
export type EasingPreset = keyof typeof easings;
export type AnimationPreset = keyof typeof animationPresets;
export type LayoutAnimationConfig = keyof typeof layoutAnimations;
