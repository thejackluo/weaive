/**
 * Data Factory for Origin Story Test Data
 * Story 1.7: Commitment Ritual & Origin Story
 *
 * Uses @faker-js/faker to generate randomized test data for ATDD tests.
 * Follows ATDD workflow Step 4: Build Data Infrastructure
 */

import { faker } from '@faker-js/faker';

/**
 * Origin Story Data Factory
 *
 * Generates complete origin story test data matching Story 1.7 data structure.
 *
 * @param overrides - Partial data to override defaults
 * @returns Complete origin story test data object
 */
export const createOriginStoryData = (overrides: Partial<OriginStoryData> = {}) => ({
  // Screen 2: Photo capture
  photo_uri: faker.system.filePath() + '/test-photo.jpg',

  // Screen 2: Audio recording
  audio_uri: faker.system.filePath() + '/test-audio.aac',
  audio_duration: faker.number.int({ min: 10, max: 60 }), // seconds (max 60s per AC #11)

  // Screen 1 & 2: Narrative text
  from_text: faker.lorem.sentence({ min: 10, max: 20 }), // Struggle text
  to_text: faker.lorem.words(5), // Dream traits summary

  // Metadata
  timestamp: faker.date.recent().getTime(),

  ...overrides,
});

/**
 * User Onboarding Data Factory
 *
 * Generates AsyncStorage data from previous stories (1.2, 1.6)
 * required for Story 1.7 Screen 1 narrative generation.
 *
 * @param overrides - Partial data to override defaults
 * @returns AsyncStorage-compatible onboarding data
 */
export const createUserOnboardingData = (overrides: Partial<UserOnboardingData> = {}) => ({
  preferred_name: faker.person.firstName(),

  // From Story 1.2: Emotional State Selection
  selected_painpoints: faker.helpers.arrayElements(
    ['clarity', 'action', 'consistency', 'alignment'],
    { min: 1, max: 4 }
  ),

  // From Story 1.6: Identity Traits Selection
  identity_traits: faker.helpers.arrayElements(
    ['Disciplined', 'Focused', 'Intentional', 'Confident', 'Creative', 'Resilient', 'Calm', 'Bold'],
    { min: 3, max: 5 }
  ),

  ...overrides,
});

/**
 * Origin Story Draft Data Factory
 *
 * Generates AsyncStorage draft data for AC #17 (persistence during app backgrounding).
 * Used to test R1-001 (Critical Risk: data loss during multi-screen flows).
 *
 * @param overrides - Partial data to override defaults
 * @returns AsyncStorage-compatible draft data
 */
export const createOriginStoryDraft = (overrides: Partial<OriginStoryDraft> = {}) => ({
  photo: faker.system.filePath() + '/draft-photo.jpg',
  audio: faker.system.filePath() + '/draft-audio.aac',
  duration: faker.number.int({ min: 10, max: 60 }),
  timestamp: faker.date.recent().getTime(),

  ...overrides,
});

/**
 * Photo Capture Result Factory
 *
 * Mocks expo-image-picker camera response for AC #10.
 *
 * @param overrides - Partial data to override defaults
 * @returns expo-image-picker result structure
 */
export const createPhotoCaptureResult = (overrides: Partial<PhotoCaptureResult> = {}) => ({
  canceled: false,
  assets: [
    {
      uri: faker.system.filePath() + '/captured-photo.jpg',
      width: 1024,
      height: 1024,
      type: 'image',
      fileName: 'photo.jpg',
      fileSize: faker.number.int({ min: 50000, max: 500000 }), // 50KB-500KB
    },
  ],

  ...overrides,
});

/**
 * Audio Recording Result Factory
 *
 * Mocks expo-av recording response for AC #11.
 *
 * @param overrides - Partial data to override defaults
 * @returns expo-av Recording status structure
 */
export const createAudioRecordingResult = (overrides: Partial<AudioRecordingResult> = {}) => ({
  uri: faker.system.filePath() + '/recorded-audio.aac',
  durationMillis: faker.number.int({ min: 10000, max: 60000 }), // 10-60 seconds
  metering: faker.number.int({ min: -160, max: 0 }), // dB

  ...overrides,
});

/**
 * Permissions Status Factory
 *
 * Mocks permission status for camera and microphone (AC #15).
 *
 * @param granted - Whether permission is granted
 * @returns Permission status structure
 */
export const createPermissionStatus = (granted: boolean) => ({
  granted,
  status: granted ? 'granted' : 'denied',
  canAskAgain: !granted,
  expires: 'never',
});

// TypeScript interfaces for type safety
export interface OriginStoryData {
  photo_uri: string;
  audio_uri: string;
  audio_duration: number;
  from_text: string;
  to_text: string;
  timestamp: number;
}

export interface UserOnboardingData {
  preferred_name: string;
  selected_painpoints: string[];
  identity_traits: string[];
}

export interface OriginStoryDraft {
  photo: string | null;
  audio: string | null;
  duration: number;
  timestamp: number;
}

export interface PhotoCaptureResult {
  canceled: boolean;
  assets: Array<{
    uri: string;
    width: number;
    height: number;
    type: string;
    fileName: string;
    fileSize: number;
  }>;
}

export interface AudioRecordingResult {
  uri: string;
  durationMillis: number;
  metering: number;
}
