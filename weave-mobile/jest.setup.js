// Jest setup file for React Native Testing Library
// Note: @testing-library/react-native v12.4+ includes Jest matchers by default

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  default: {
    call: () => {},
  },
  useSharedValue: (initialValue) => ({ value: initialValue }),
  useAnimatedStyle: (callback) => callback(),
  withTiming: (value) => value,
  withSpring: (value) => value,
  withSequence: (...values) => values[values.length - 1],
  interpolate: (value) => value,
  Extrapolate: { CLAMP: 'clamp' },
  createAnimatedComponent: (Component) => Component,
}));

// Mock Animated API
jest.mock('react-native/Libraries/Animated/AnimatedImplementation');

// Mock expo modules
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {},
  },
  manifest: {},
}));

jest.mock('expo-linking', () => ({
  createURL: jest.fn(),
  parse: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSegments: () => [],
  usePathname: () => '/',
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
  })),
}));

// Silence console warnings during tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
