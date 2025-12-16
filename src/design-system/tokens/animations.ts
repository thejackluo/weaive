/**
 * Weave Design System - Animation Tokens
 *
 * Smooth, purposeful animations that feel natural
 * Uses react-native-reanimated for implementation
 *
 * Usage:
 * import { durations, easings } from '@/design-system';
 * withTiming(1, { duration: durations.normal, easing: easings.easeOut })
 */

import { Easing } from 'react-native-reanimated';

// =============================================================================
// DURATION SCALE
// =============================================================================

export const durations = {
  instant: 0,
  fastest: 100,
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,
  slowest: 700,
  deliberate: 1000,
} as const;

// Named durations for specific use cases
export const timing = {
  // Micro-interactions
  press: durations.fast,        // 150ms - button press feedback
  hover: durations.fast,        // 150ms - hover state changes
  toggle: durations.normal,     // 250ms - toggle switches

  // Component transitions
  fade: durations.normal,       // 250ms - fade in/out
  slide: durations.slow,        // 350ms - slide transitions
  expand: durations.slow,       // 350ms - accordion expand
  collapse: durations.normal,   // 250ms - accordion collapse

  // Screen transitions
  screenEnter: durations.slow,  // 350ms - screen enters
  screenExit: durations.normal, // 250ms - screen exits
  modal: durations.slower,      // 500ms - modal animations
  sheet: durations.slow,        // 350ms - bottom sheet

  // Loading states
  skeleton: durations.slowest,  // 700ms - skeleton pulse
  spinner: durations.deliberate, // 1000ms - spinner rotation

  // Celebrations
  confetti: 2000,               // 2s - confetti animation
  celebration: 1500,            // 1.5s - success celebration
} as const;

// =============================================================================
// EASING FUNCTIONS
// =============================================================================

// Pre-configured Reanimated easings
export const easings = {
  // Standard easings
  linear: Easing.linear,
  ease: Easing.ease,
  easeIn: Easing.in(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  easeInOut: Easing.inOut(Easing.ease),

  // Cubic easings (more pronounced)
  easeInCubic: Easing.in(Easing.cubic),
  easeOutCubic: Easing.out(Easing.cubic),
  easeInOutCubic: Easing.inOut(Easing.cubic),

  // Quart easings (even more pronounced)
  easeInQuart: Easing.in(Easing.quad),
  easeOutQuart: Easing.out(Easing.quad),
  easeInOutQuart: Easing.inOut(Easing.quad),

  // Expo easings (dramatic)
  easeInExpo: Easing.in(Easing.exp),
  easeOutExpo: Easing.out(Easing.exp),
  easeInOutExpo: Easing.inOut(Easing.exp),

  // Bounce and elastic
  bounce: Easing.bounce,
  elastic: Easing.elastic(1),

  // Back (overshoot)
  backIn: Easing.in(Easing.back(1.7)),
  backOut: Easing.out(Easing.back(1.7)),
  backInOut: Easing.inOut(Easing.back(1.7)),
} as const;

// Named easings for specific use cases
export const motion = {
  // Enter animations (ease out - start fast, end slow)
  enter: easings.easeOutCubic,
  fadeIn: easings.easeOut,
  slideIn: easings.easeOutCubic,

  // Exit animations (ease in - start slow, end fast)
  exit: easings.easeInCubic,
  fadeOut: easings.easeIn,
  slideOut: easings.easeIn,

  // Movement (ease in out - smooth both ends)
  move: easings.easeInOutCubic,
  resize: easings.easeInOutCubic,

  // Interactive feedback
  press: easings.easeOut,
  release: easings.easeOutCubic,

  // Playful animations
  bounce: easings.bounce,
  spring: easings.elastic,
  overshoot: easings.backOut,

  // Continuous animations
  loop: easings.linear,
} as const;

// =============================================================================
// SPRING CONFIGURATIONS
// =============================================================================

// For react-native-reanimated withSpring
export const springs = {
  // Gentle - for subtle movements
  gentle: {
    damping: 20,
    stiffness: 100,
    mass: 1,
  },

  // Default - balanced feel
  default: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },

  // Bouncy - for playful elements
  bouncy: {
    damping: 10,
    stiffness: 200,
    mass: 1,
  },

  // Stiff - for quick, snappy movements
  stiff: {
    damping: 20,
    stiffness: 300,
    mass: 1,
  },

  // Slow - for deliberate movements
  slow: {
    damping: 25,
    stiffness: 80,
    mass: 1.5,
  },

  // Sheet/Modal - smooth sheet animations
  sheet: {
    damping: 20,
    stiffness: 120,
    mass: 1,
  },

  // Press feedback
  press: {
    damping: 15,
    stiffness: 400,
    mass: 0.5,
  },
} as const;

// =============================================================================
// ANIMATION PRESETS
// =============================================================================

// Common animation configurations ready to use
export const presets = {
  // Fade animations
  fadeIn: {
    duration: timing.fade,
    easing: motion.fadeIn,
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeOut: {
    duration: timing.fade,
    easing: motion.fadeOut,
    from: { opacity: 1 },
    to: { opacity: 0 },
  },

  // Slide animations
  slideInFromBottom: {
    duration: timing.slide,
    easing: motion.slideIn,
    from: { translateY: 100 },
    to: { translateY: 0 },
  },
  slideInFromRight: {
    duration: timing.slide,
    easing: motion.slideIn,
    from: { translateX: 100 },
    to: { translateX: 0 },
  },
  slideOutToBottom: {
    duration: timing.slide,
    easing: motion.slideOut,
    from: { translateY: 0 },
    to: { translateY: 100 },
  },

  // Scale animations
  scaleIn: {
    duration: timing.fade,
    easing: motion.enter,
    from: { scale: 0.9, opacity: 0 },
    to: { scale: 1, opacity: 1 },
  },
  scaleOut: {
    duration: timing.fade,
    easing: motion.exit,
    from: { scale: 1, opacity: 1 },
    to: { scale: 0.95, opacity: 0 },
  },

  // Press feedback
  pressIn: {
    scale: 0.97,
    spring: springs.press,
  },
  pressOut: {
    scale: 1,
    spring: springs.press,
  },

  // Expand/collapse
  expand: {
    duration: timing.expand,
    easing: motion.enter,
  },
  collapse: {
    duration: timing.collapse,
    easing: motion.exit,
  },
} as const;

// =============================================================================
// REDUCED MOTION
// =============================================================================

// Alternative values when user prefers reduced motion
export const reducedMotion = {
  durations: {
    instant: 0,
    fastest: 0,
    fast: 0,
    normal: 0,
    slow: 100,
    slower: 150,
    slowest: 200,
    deliberate: 200,
  },
  // Use linear for all easings
  easing: Easing.linear,
  // Minimal spring
  spring: {
    damping: 30,
    stiffness: 500,
    mass: 1,
  },
} as const;

// =============================================================================
// COMBINED EXPORT
// =============================================================================

export const animations = {
  durations,
  timing,
  easings,
  motion,
  springs,
  presets,
  reducedMotion,
} as const;

export type Animations = typeof animations;
export type DurationKey = keyof typeof durations;
export type EasingKey = keyof typeof easings;
export type SpringKey = keyof typeof springs;
