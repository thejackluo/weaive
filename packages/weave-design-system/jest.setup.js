// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');

  // Mock the worklet directive
  Reanimated.default.call = () => {};

  // Mock animation functions
  Reanimated.withSpring = jest.fn((toValue, config) => toValue);
  Reanimated.withTiming = jest.fn((toValue, config) => toValue);

  return Reanimated;
});

// Mock react-native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
