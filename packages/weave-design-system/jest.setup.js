// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  // Create a comprehensive manual mock without relying on react-native
  const React = require('react');

  // Simple mock component
  const MockComponent = (props) => React.createElement('View', props, props.children);

  return {
    __esModule: true,
    default: {
      View: MockComponent,
      createAnimatedComponent: (component) => component,
      call: jest.fn(),
    },
    // Animation functions
    withSpring: jest.fn((toValue, config) => toValue),
    withTiming: jest.fn((toValue, config) => toValue),
    withDecay: jest.fn((config) => 0),
    withSequence: jest.fn((...animations) => animations[0]),
    withRepeat: jest.fn((animation, count) => animation),
    withDelay: jest.fn((delay, animation) => animation),
    // Hooks
    useSharedValue: jest.fn((initial) => ({ value: initial })),
    useAnimatedStyle: jest.fn((callback) => callback()),
    useAnimatedProps: jest.fn((callback) => callback()),
    useAnimatedGestureHandler: jest.fn(() => ({})),
    useAnimatedScrollHandler: jest.fn(() => ({})),
    useAnimatedReaction: jest.fn(),
    useDerivedValue: jest.fn((callback) => ({ value: callback() })),
    useAnimatedRef: jest.fn(() => ({ current: null })),
    // Utilities
    runOnJS: jest.fn((fn) => fn),
    runOnUI: jest.fn((fn) => fn),
    cancelAnimation: jest.fn(),
    measure: jest.fn(),
    scrollTo: jest.fn(),
    // Easing
    Easing: {
      linear: jest.fn((t) => t),
      ease: jest.fn((t) => t),
      quad: jest.fn((t) => t * t),
      cubic: jest.fn((t) => t * t * t),
      bezier: jest.fn(() => (t) => t),
      in: jest.fn((easing) => easing),
      out: jest.fn((easing) => easing),
      inOut: jest.fn((easing) => easing),
    },
    // Animated components
    View: MockComponent,
    Text: MockComponent,
    Image: MockComponent,
    ScrollView: MockComponent,
  };
});

// Mock react-native AccessibilityInfo
jest.mock('react-native', () => ({
  AccessibilityInfo: {
    isReduceMotionEnabled: jest.fn(() => Promise.resolve(false)),
    addEventListener: jest.fn(() => ({
      remove: jest.fn(),
    })),
  },
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios || obj.default),
  },
}));

// Mock Tamagui for test environment
jest.mock('@tamagui/core', () => {
  const React = require('react');

  return {
    __esModule: true,
    createTamagui: jest.fn((config) => config),
    createTokens: jest.fn((tokens) => tokens),
    TamaguiProvider: ({ children }) => React.createElement(React.Fragment, {}, children),
    Theme: ({ children }) => React.createElement(React.Fragment, {}, children),
    useThemeName: jest.fn(() => 'dark'),
    useTheme: jest.fn(() => ({})),
    styled: jest.fn(() => () => null),
  };
});

jest.mock('@tamagui/themes', () => ({
  themes: {},
  tokens: {},
}));

jest.mock('@tamagui/animations-reanimated', () => ({
  createAnimations: jest.fn((config) => config),
}));

jest.mock('@tamagui/shorthands', () => ({
  shorthands: {},
}));

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
