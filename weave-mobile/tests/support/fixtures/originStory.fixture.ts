/**
 * Test Fixtures for Origin Story Screen
 * Story 1.7: Commitment Ritual & Origin Story
 *
 * Provides setup/teardown with auto-cleanup for ATDD tests.
 * Follows ATDD workflow Step 4: Build Data Infrastructure
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createUserOnboardingData, createOriginStoryDraft } from '../factories/originStory.factory';

/**
 * AsyncStorage Fixture
 *
 * Sets up AsyncStorage with pre-populated onboarding data from Stories 1.2 & 1.6.
 * Auto-cleans up after each test.
 *
 * Usage:
 * ```typescript
 * beforeEach(async () => {
 *   await setupAsyncStorage();
 * });
 *
 * afterEach(async () => {
 *   await cleanupAsyncStorage();
 * });
 * ```
 */
export const setupAsyncStorage = async (customData?: any) => {
  const onboardingData = customData || createUserOnboardingData();

  await AsyncStorage.setItem('onboarding_data', JSON.stringify(onboardingData));
};

/**
 * AsyncStorage Cleanup
 *
 * Clears all AsyncStorage data after tests.
 */
export const cleanupAsyncStorage = async () => {
  await AsyncStorage.clear();
};

/**
 * AsyncStorage Draft Fixture
 *
 * Sets up AsyncStorage with origin_story_draft for testing AC #17 (persistence).
 * Used to test R1-001 (Critical Risk: data loss during app backgrounding).
 *
 * Usage:
 * ```typescript
 * beforeEach(async () => {
 *   await setupOriginStoryDraft({ photo: 'test-photo.jpg', audio: null });
 * });
 * ```
 */
export const setupOriginStoryDraft = async (customDraft?: any) => {
  const draft = customDraft || createOriginStoryDraft();

  await AsyncStorage.setItem('origin_story_draft', JSON.stringify(draft));
};

/**
 * Mock Expo Image Picker
 *
 * Mocks expo-image-picker camera launch for AC #10 (photo capture).
 *
 * Usage:
 * ```typescript
 * jest.mock('expo-image-picker', () => ({
 *   launchCameraAsync: mockCameraLaunch(true), // true = success, false = canceled
 * }));
 * ```
 */
export const mockCameraLaunch = (success: boolean, uri?: string) => {
  return jest.fn().mockResolvedValue({
    canceled: !success,
    assets: success
      ? [
          {
            uri: uri || 'file:///test-photo.jpg',
            width: 1024,
            height: 1024,
            type: 'image',
            fileName: 'photo.jpg',
            fileSize: 100000,
          },
        ]
      : [],
  });
};

/**
 * Mock Expo Audio Recording
 *
 * Mocks expo-av audio recording for AC #11 (voice commitment).
 *
 * Usage:
 * ```typescript
 * const mockRecording = mockAudioRecording(45000); // 45 seconds
 * jest.mock('expo-av', () => ({
 *   Audio: {
 *     Recording: {
 *       createAsync: mockRecording.createAsync,
 *     },
 *   },
 * }));
 * ```
 */
export const mockAudioRecording = (durationMs: number = 30000) => {
  const mockRecordingInstance = {
    stopAndUnloadAsync: jest.fn().mockResolvedValue(undefined),
    getURI: jest.fn().mockReturnValue('file:///test-audio.aac'),
    getStatusAsync: jest.fn().mockResolvedValue({
      durationMillis: durationMs,
      isRecording: false,
      isDoneRecording: true,
    }),
  };

  return {
    createAsync: jest.fn().mockResolvedValue({
      recording: mockRecordingInstance,
      status: { isRecording: true },
    }),
    mockRecordingInstance,
  };
};

/**
 * Mock Expo Audio Playback
 *
 * Mocks expo-av sound playback for audio preview (AC #11).
 *
 * Usage:
 * ```typescript
 * const mockSound = mockAudioPlayback();
 * jest.mock('expo-av', () => ({
 *   Audio: {
 *     Sound: {
 *       createAsync: mockSound.createAsync,
 *     },
 *   },
 * }));
 * ```
 */
export const mockAudioPlayback = () => {
  const mockSoundInstance = {
    playAsync: jest.fn().mockResolvedValue(undefined),
    pauseAsync: jest.fn().mockResolvedValue(undefined),
    stopAsync: jest.fn().mockResolvedValue(undefined),
    unloadAsync: jest.fn().mockResolvedValue(undefined),
    getStatusAsync: jest.fn().mockResolvedValue({
      isPlaying: false,
      positionMillis: 0,
      durationMillis: 30000,
    }),
  };

  return {
    createAsync: jest.fn().mockResolvedValue({
      sound: mockSoundInstance,
      status: { isLoaded: true },
    }),
    mockSoundInstance,
  };
};

/**
 * Mock Camera Permissions
 *
 * Mocks expo-camera permission status for AC #15 (permissions handling).
 *
 * Usage:
 * ```typescript
 * const [permission, requestPermission] = mockCameraPermissions(true); // true = granted
 * jest.mock('expo-camera', () => ({
 *   useCameraPermissions: jest.fn(() => [permission, requestPermission]),
 * }));
 * ```
 */
export const mockCameraPermissions = (granted: boolean) => {
  const permission = {
    granted,
    status: granted ? 'granted' : 'denied',
    canAskAgain: !granted,
    expires: 'never' as const,
  };

  const requestPermission = jest.fn().mockResolvedValue({
    granted,
    status: granted ? 'granted' : 'denied',
  });

  return [permission, requestPermission] as const;
};

/**
 * Mock Microphone Permissions
 *
 * Mocks expo-av audio permission status for AC #15 (permissions handling).
 *
 * Usage:
 * ```typescript
 * const [permission, requestPermission] = mockMicrophonePermissions(false); // false = denied
 * jest.mock('expo-av', () => ({
 *   Audio: {
 *     usePermissions: jest.fn(() => [permission, requestPermission]),
 *   },
 * }));
 * ```
 */
export const mockMicrophonePermissions = (granted: boolean) => {
  const permission = {
    granted,
    status: granted ? 'granted' : 'denied',
    canAskAgain: !granted,
    expires: 'never' as const,
  };

  const requestPermission = jest.fn().mockResolvedValue({
    granted,
    status: granted ? 'granted' : 'denied',
  });

  return [permission, requestPermission] as const;
};

/**
 * Mock Expo Haptics
 *
 * Mocks expo-haptics for AC #22 (celebration effects).
 *
 * Usage:
 * ```typescript
 * const mockHaptic = mockHapticFeedback();
 * jest.mock('expo-haptics', () => ({
 *   impactAsync: mockHaptic,
 * }));
 * ```
 */
export const mockHapticFeedback = () => {
  return jest.fn().mockResolvedValue(undefined);
};

/**
 * Mock React Native Linking
 *
 * Mocks Linking.openSettings() for AC #15 (permissions denied deep-link).
 *
 * Usage:
 * ```typescript
 * const mockOpenSettings = mockLinkingOpenSettings();
 * jest.mock('react-native', () => ({
 *   Linking: {
 *     openSettings: mockOpenSettings,
 *   },
 * }));
 * ```
 */
export const mockLinkingOpenSettings = () => {
  return jest.fn().mockResolvedValue(undefined);
};

/**
 * Complete Test Fixture Setup
 *
 * Sets up all mocks and AsyncStorage data for origin story tests.
 * Call this in beforeEach for comprehensive setup.
 *
 * Usage:
 * ```typescript
 * beforeEach(async () => {
 *   await setupOriginStoryFixtures();
 * });
 *
 * afterEach(async () => {
 *   await teardownOriginStoryFixtures();
 * });
 * ```
 */
export const setupOriginStoryFixtures = async (options?: {
  cameraGranted?: boolean;
  microphoneGranted?: boolean;
  withDraft?: boolean;
}) => {
  const { cameraGranted = true, microphoneGranted = true, withDraft = false } = options || {};

  // Setup AsyncStorage with onboarding data
  await setupAsyncStorage();

  // Optionally setup draft (for app backgrounding tests)
  if (withDraft) {
    await setupOriginStoryDraft();
  }

  // Note: Permission mocks must be set up in jest.mock() calls in test files
  // This function only handles AsyncStorage setup
};

/**
 * Complete Test Fixture Teardown
 *
 * Cleans up all AsyncStorage data and mocks after tests.
 */
export const teardownOriginStoryFixtures = async () => {
  await cleanupAsyncStorage();
};
