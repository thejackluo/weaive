/**
 * Animation Tokens (35+ tokens)
 *
 * Durations, easings, spring presets, and motion presets.
 *
 * @packageDocumentation
 */

export const animations = {
  durations: {
    instant: 0,
    fast: 150,
    base: 250,
    slow: 350,
    slower: 500,
  },

  easings: {
    linear: [0, 0, 1, 1],
    easeIn: [0.4, 0, 1, 1],
    easeOut: [0, 0, 0.2, 1],
    easeInOut: [0.4, 0, 0.2, 1],
  },

  springs: {
    gentle: {
      damping: 20,
      stiffness: 150,
    },
    snappy: {
      damping: 15,
      stiffness: 250,
    },
    bouncy: {
      damping: 10,
      stiffness: 200,
    },
    stiff: {
      damping: 25,
      stiffness: 400,
    },
  },

  // Motion presets (common animations with timing/spring configs)
  motionPresets: {
    // Fade animations
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
      duration: 250,
      easing: [0, 0, 0.2, 1], // easeOut
    },
    fadeOut: {
      from: { opacity: 1 },
      to: { opacity: 0 },
      duration: 200,
      easing: [0.4, 0, 1, 1], // easeIn
    },

    // Slide animations
    slideUp: {
      from: { transform: [{ translateY: 20 }], opacity: 0 },
      to: { transform: [{ translateY: 0 }], opacity: 1 },
      duration: 300,
      easing: [0, 0, 0.2, 1], // easeOut
    },
    slideDown: {
      from: { transform: [{ translateY: -20 }], opacity: 0 },
      to: { transform: [{ translateY: 0 }], opacity: 1 },
      duration: 300,
      easing: [0, 0, 0.2, 1], // easeOut
    },
    slideLeft: {
      from: { transform: [{ translateX: 20 }], opacity: 0 },
      to: { transform: [{ translateX: 0 }], opacity: 1 },
      duration: 300,
      easing: [0, 0, 0.2, 1], // easeOut
    },
    slideRight: {
      from: { transform: [{ translateX: -20 }], opacity: 0 },
      to: { transform: [{ translateX: 0 }], opacity: 1 },
      duration: 300,
      easing: [0, 0, 0.2, 1], // easeOut
    },

    // Scale animations
    scale: {
      from: { transform: [{ scale: 0.95 }], opacity: 0 },
      to: { transform: [{ scale: 1 }], opacity: 1 },
      duration: 200,
      easing: [0, 0, 0.2, 1], // easeOut
    },
    scaleIn: {
      from: { transform: [{ scale: 0.9 }] },
      to: { transform: [{ scale: 1 }] },
      spring: {
        damping: 15,
        stiffness: 250,
      },
    },
    scaleOut: {
      from: { transform: [{ scale: 1 }] },
      to: { transform: [{ scale: 0.95 }] },
      duration: 150,
      easing: [0.4, 0, 1, 1], // easeIn
    },

    // Press/interaction animations
    pressIn: {
      to: { transform: [{ scale: 0.97 }] },
      duration: 100,
      easing: [0, 0, 0.2, 1], // easeOut
    },
    pressOut: {
      to: { transform: [{ scale: 1 }] },
      spring: {
        damping: 15,
        stiffness: 250,
      },
    },

    // Rotate animations
    rotate: {
      from: { transform: [{ rotate: '0deg' }] },
      to: { transform: [{ rotate: '360deg' }] },
      duration: 500,
      easing: [0, 0, 1, 1], // linear
    },
    rotateIn: {
      from: { transform: [{ rotate: '-10deg' }], opacity: 0 },
      to: { transform: [{ rotate: '0deg' }], opacity: 1 },
      duration: 300,
      easing: [0, 0, 0.2, 1], // easeOut
    },
  },
} as const;
