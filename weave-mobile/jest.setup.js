/* global jest, global */
// Jest setup file for React Native Testing Library
// Note: @testing-library/react-native v12.4+ includes Jest matchers by default

// Set environment variables for tests
process.env.API_BASE_URL = 'http://localhost:8000';

// Mock API utilities to provide test environment
jest.mock('./src/utils/api', () => ({
  getApiBaseUrl: () => 'http://localhost:8000',
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock NativeWind - Jest doesn't process NativeWind's Babel transformations
// This prevents "require is not defined" errors from nativewind/babel plugin
jest.mock('nativewind', () => ({}));

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

// Mock FlatList to avoid VirtualizedList context issues in tests
jest.mock('react-native/Libraries/Lists/FlatList', () => {
  const React = require('react');
  const { View } = require('react-native');

  class MockFlatList extends React.Component {
    render() {
      const { data, renderItem, keyExtractor, ListFooterComponent, contentContainerStyle } = this.props;

      return React.createElement(
        View,
        { style: contentContainerStyle, testID: 'flat-list' },
        data && data.map((item, index) => {
          const key = keyExtractor ? keyExtractor(item, index) : item.key || item.id || index;
          return React.createElement(View, { key }, renderItem({ item, index }));
        }),
        ListFooterComponent
      );
    }
  }

  // Add static properties to satisfy react-native-css's copyComponentProperties
  MockFlatList.displayName = 'FlatList';

  return {
    __esModule: true,
    default: MockFlatList,
    FlatList: MockFlatList,
  };
});

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

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

// Mock expo-modules-core (required by @expo/vector-icons)
jest.mock('expo-modules-core', () => ({
  EventEmitter: class MockEventEmitter {
    addListener = jest.fn();
    removeAllListeners = jest.fn();
    removeSubscription = jest.fn();
  },
  NativeModulesProxy: {},
  requireNativeViewManager: jest.fn(),
}));

// Mock expo-font (required by @expo/vector-icons)
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');

  const createMockIcon = (name) => {
    return React.forwardRef((props, ref) =>
      React.createElement(Text, { ...props, ref, testID: `icon-${name}` }, '🎤')
    );
  };

  return {
    MaterialIcons: createMockIcon('MaterialIcons'),
    Ionicons: createMockIcon('Ionicons'),
    FontAwesome: createMockIcon('FontAwesome'),
    FontAwesome5: createMockIcon('FontAwesome5'),
    Feather: createMockIcon('Feather'),
    AntDesign: createMockIcon('AntDesign'),
  };
});

// Mock expo-av (audio recording)
jest.mock('expo-av', () => ({
  Audio: {
    requestPermissionsAsync: jest.fn(() =>
      Promise.resolve({ status: 'granted', granted: true })
    ),
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
    Recording: class MockRecording {
      prepareToRecordAsync = jest.fn(() => Promise.resolve());
      startAsync = jest.fn(() => Promise.resolve());
      stopAndUnloadAsync = jest.fn(() => Promise.resolve());
      pauseAsync = jest.fn(() => Promise.resolve());
      getStatusAsync = jest.fn(() =>
        Promise.resolve({
          isRecording: true,
          durationMillis: 0,
          metering: -160,
        })
      );
      getURI = jest.fn(() => 'file://test-audio.m4a');
    },
    RecordingOptionsPresets: {
      HIGH_QUALITY: {
        android: {
          extension: '.m4a',
          outputFormat: 2,
          audioEncoder: 3,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: 'mpeg4AAC',
          audioQuality: 127,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      },
    },
  },
}));

jest.mock('expo-blur', () => {
  const React = require('react');
  return {
    BlurView: React.forwardRef((props, ref) => {
      const { View } = require('react-native');
      return React.createElement(View, { ...props, ref, testID: 'blur-view' });
    }),
  };
});

jest.mock('@react-native-community/blur', () => {
  const React = require('react');
  return {
    BlurView: React.forwardRef((props, ref) => {
      const { View } = require('react-native');
      return React.createElement(View, { ...props, ref, testID: 'blur-view-community' });
    }),
  };
});

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
  }),
  useSegments: () => [],
  usePathname: () => '/',
}));

// Export mock functions for tests to access
global.mockRouterPush = mockPush;
global.mockRouterReplace = mockReplace;
global.mockRouterBack = mockBack;

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
