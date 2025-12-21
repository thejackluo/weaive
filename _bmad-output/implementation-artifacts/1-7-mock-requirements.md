# Mock Requirements & Test Infrastructure
## Story 1.7: Commitment Ritual & Origin Story

**Generated:** 2025-12-20
**Status:** RED Phase - Tests failing until implementation complete

---

## Overview

This document specifies all mock requirements and test infrastructure needed for Story 1.7 ATDD tests. Follows ATDD workflow Step 4: Build Data Infrastructure.

**Test Files:**
- `weave-mobile/src/constants/__tests__/originStoryContent.test.ts` (Unit tests - 30+ tests)
- `weave-mobile/app/(onboarding)/__tests__/origin-story.test.tsx` (Component tests - 77 tests)

**Factories:**
- `weave-mobile/tests/support/factories/originStory.factory.ts`

**Fixtures:**
- `weave-mobile/tests/support/fixtures/originStory.fixture.ts`

---

## Mock Requirements

### 1. expo-router (Navigation)

**Location:** Already mocked in test files

```typescript
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));
```

**Purpose:** Mock navigation between screens and stories

**Tests Using:** All navigation tests (Screen 1 → 2 → 3 → Story 1.8)

---

### 2. @react-native-async-storage/async-storage (Persistence)

**Location:** Already mocked in test files

```typescript
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));
```

**Purpose:**
- Mock AsyncStorage for persistence testing (AC #17)
- **CRITICAL R1-001:** Test data recovery during app backgrounding

**Setup in Tests:**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setupAsyncStorage, setupOriginStoryDraft } from '../fixtures/originStory.fixture';

beforeEach(async () => {
  await setupAsyncStorage(); // Pre-populate with painpoints + traits
});

afterEach(async () => {
  await AsyncStorage.clear();
});
```

**Tests Using:**
- Screen 1: Load painpoints/traits from AsyncStorage
- Screen 2: Save photo/audio immediately after capture
- Multi-Screen Flow: Restore draft on app resume (R1-001)

---

### 3. expo-image-picker (Camera)

**Location:** Already mocked in test files

```typescript
jest.mock('expo-image-picker', () => ({
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
  requestCameraPermissionsAsync: jest.fn(),
}));
```

**Purpose:**
- Mock camera launch for photo capture (AC #10)
- Mock permission requests (AC #15)

**Usage in Tests:**
```typescript
import * as ImagePicker from 'expo-image-picker';
import { mockCameraLaunch } from '../fixtures/originStory.fixture';

// Mock successful photo capture
(ImagePicker.launchCameraAsync as jest.Mock).mockImplementation(mockCameraLaunch(true, 'file:///test-photo.jpg'));

// Mock canceled capture
(ImagePicker.launchCameraAsync as jest.Mock).mockImplementation(mockCameraLaunch(false));
```

**Tests Using:**
- Screen 2: Photo capture button
- Screen 2: Photo retake flow
- Screen 2: Camera permission denied (R1-002)

---

### 4. expo-av (Audio Recording & Playback)

**Location:** Already mocked in test files

```typescript
jest.mock('expo-av', () => ({
  Audio: {
    Recording: {
      createAsync: jest.fn(),
    },
    Sound: {
      createAsync: jest.fn(),
    },
    setAudioModeAsync: jest.fn(),
    usePermissions: jest.fn(() => [null, jest.fn()]),
    RecordingOptionsPresets: {
      HIGH_QUALITY: {},
    },
  },
}));
```

**Purpose:**
- Mock audio recording for voice commitment (AC #11)
- Mock audio playback for preview (AC #11)
- Mock microphone permissions (AC #15)

**Usage in Tests (Recording):**
```typescript
import { Audio } from 'expo-av';
import { mockAudioRecording } from '../fixtures/originStory.fixture';

const mockRecording = mockAudioRecording(45000); // 45 seconds
(Audio.Recording.createAsync as jest.Mock).mockImplementation(mockRecording.createAsync);
```

**Usage in Tests (Playback):**
```typescript
import { mockAudioPlayback } from '../fixtures/originStory.fixture';

const mockSound = mockAudioPlayback();
(Audio.Sound.createAsync as jest.Mock).mockImplementation(mockSound.createAsync);
```

**Tests Using:**
- Screen 2: Voice recording button
- Screen 2: 60-second auto-stop
- Screen 2: 65-second force-stop (safety)
- Screen 2: Audio playback controls
- Screen 2: Re-record flow
- Screen 2: Microphone permission denied (R1-002)

---

### 5. expo-haptics (Haptic Feedback)

**Location:** Already mocked in test files

```typescript
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Success: 'success' },
}));
```

**Purpose:** Mock haptic feedback for celebration (AC #22)

**Usage in Tests:**
```typescript
import * as Haptics from 'expo-haptics';

// Verify haptic triggered
expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Success);
```

**Tests Using:**
- Screen 3: Completion celebration

---

### 6. react-native-confetti-cannon (Confetti Animation)

**Location:** Mock in test files if implementation uses this library

```typescript
jest.mock('react-native-confetti-cannon', () => 'ConfettiCannon');
```

**Purpose:** Mock confetti animation for AC #22 (celebration effects)

**Tests Using:**
- Screen 3: Confetti burst on load

---

### 7. lottie-react-native (Weave Character Animation)

**Location:** Mock in test files if implementation uses Lottie

```typescript
jest.mock('lottie-react-native', () => 'LottieView');
```

**Purpose:** Mock Weave character animation (AC #20)

**Tests Using:**
- Screen 3: Weave animation (blank → thread → weave)

---

## Required data-testid Attributes

All interactive elements and content areas must have `testID` props for React Native Testing Library queries.

### Screen 1: Narrative Validation

| Element | testID | Purpose |
|---------|--------|---------|
| Title text | `narrative-title` | "This is where your story shifts." |
| Body text container | `narrative-body` | Dynamic content (struggle, aspiration, bridge) |
| Continue button | `narrative-continue-button` | Navigate to Screen 2 |
| Animated background | `narrative-background` | Thread-lines pattern |

**Usage Example:**
```typescript
const title = getByTestId('narrative-title');
expect(title).toHaveTextContent('This is where your story shifts.');
```

---

### Screen 2: Origin Story Capture

| Element | testID | Purpose |
|---------|--------|---------|
| From/To summary card | `from-to-summary-card` | Display struggle → traits |
| "From" text | `from-text` | Current struggle text |
| "To" text | `to-text` | Dream traits text |
| Take photo button | `take-photo-button` | Launch camera |
| Photo thumbnail | `photo-thumbnail` | Preview after capture |
| Retake photo button | `retake-photo-button` | Replace photo |
| Record audio button | `record-audio-button` | Start recording |
| Recording indicator | `recording-indicator` | Red pulsing dot |
| Recording timer | `recording-timer` | Countdown (60s → 0s) |
| Stop recording button | `stop-recording-button` | End recording |
| Audio waveform | `audio-waveform` | Preview visualization |
| Play audio button | `play-audio-button` | Playback controls |
| Re-record button | `re-record-audio-button` | Replace audio |
| Audio duration display | `audio-duration` | "0:42" format |
| Prompt chips container | `prompt-chips` | 3 suggested prompts |
| Preview card | `preview-card` | Both captures complete |
| Complete Bind button | `complete-bind-button` | Navigate to Screen 3 |

**Usage Example:**
```typescript
const photoButton = getByTestId('take-photo-button');
fireEvent.press(photoButton);
expect(ImagePicker.launchCameraAsync).toHaveBeenCalled();
```

---

### Screen 3: Completion & Reinforcement

| Element | testID | Purpose |
|---------|--------|---------|
| Title text | `completion-title` | "This is your beginning." |
| Subheading text | `completion-subheading` | "You just took the first step..." |
| Weave animation | `weave-animation` | Character progression |
| Progress bar | `level-progress-bar` | Animate 0 → 1 |
| Level text | `level-text` | "Level 1" |
| Confetti animation | `confetti-animation` | Celebration burst |
| Summary card | `origin-summary-card` | Photo + audio recap |
| Summary photo | `origin-summary-photo` | 80x80 circular |
| Summary text | `origin-summary-text` | From/To condensed |
| Summary duration | `origin-summary-duration` | "0:42 commitment recorded" |
| Continue button | `continue-to-goal-button` | Navigate to Story 1.8 |

**Usage Example:**
```typescript
const continueButton = getByTestId('continue-to-goal-button');
fireEvent.press(continueButton);
expect(router.push).toHaveBeenCalledWith('/(onboarding)/first-needle');
```

---

## AsyncStorage Data Structure

### Key: `onboarding_data` (From Stories 1.2 & 1.6)

**Set by:** Story 1.6 (Name & Identity Traits)
**Read by:** Story 1.7 Screen 1 (Narrative generation)

```typescript
{
  "preferred_name": "Alex",
  "selected_painpoints": ["clarity", "action"],  // From Story 1.2
  "identity_traits": ["Disciplined", "Focused", "Intentional"]  // From Story 1.6
}
```

**Factory:** `createUserOnboardingData()` in `originStory.factory.ts`

---

### Key: `origin_story_draft` (AC #17 - Persistence)

**Set by:** Story 1.7 Screen 2 (immediately after photo/audio capture)
**Read by:** Story 1.7 Screen 2 (on mount, if app backgrounded)
**Cleared by:** Story 1.7 Screen 3 (on completion)

```typescript
{
  "photo": "file:///path/to/photo.jpg",
  "audio": "file:///path/to/audio.aac",
  "duration": 42,  // seconds
  "timestamp": 1703001234567
}
```

**Factory:** `createOriginStoryDraft()` in `originStory.factory.ts`

**CRITICAL R1-001 Test:**
```typescript
// Test: App backgrounds during Screen 2, then resumes
it('should restore captured data from AsyncStorage on app resume', async () => {
  // Setup: Draft exists in AsyncStorage
  await setupOriginStoryDraft({ photo: 'test-photo.jpg', audio: 'test-audio.aac' });

  // Action: Remount component (simulate app resume)
  const { getByTestId } = render(<OriginStoryScreen />);

  // Assert: Photo and audio restored from draft
  await waitFor(() => {
    expect(getByTestId('photo-thumbnail')).toBeTruthy();
    expect(getByTestId('audio-waveform')).toBeTruthy();
  });
});
```

---

## Test Execution Commands

### Run All Story 1.7 Tests

```bash
cd weave-mobile

# Run both unit and component tests
npm test -- originStory

# Run unit tests only
npm test -- originStoryContent.test.ts

# Run component tests only
npm test -- origin-story.test.tsx

# Run with coverage
npm test -- --coverage originStory
```

### Expected Output (RED Phase)

**All tests should FAIL** until implementation is complete. Example output:

```
FAIL  src/constants/__tests__/originStoryContent.test.ts
  ● Test suite failed to run

    Cannot find module '../originStoryContent' from 'src/constants/__tests__/originStoryContent.test.ts'

FAIL  app/(onboarding)/__tests__/origin-story.test.tsx
  ● Test suite failed to run

    Cannot find module '../origin-story' from 'app/(onboarding)/__tests__/origin-story.test.tsx'

Test Suites: 2 failed, 2 total
Tests:       0 total (77 todo)
```

**After Implementation (GREEN Phase):** All 107 tests should pass.

---

## Mock Setup Example (Complete)

Full test file setup with all mocks and fixtures:

```typescript
// app/(onboarding)/__tests__/origin-story.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import OriginStoryScreen from '../origin-story';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

// Import fixtures and factories
import {
  setupAsyncStorage,
  cleanupAsyncStorage,
  setupOriginStoryDraft,
  mockCameraLaunch,
  mockAudioRecording,
} from '../../../tests/support/fixtures/originStory.fixture';

// Mock modules (at top of file)
jest.mock('expo-router');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-image-picker');
jest.mock('expo-av');
jest.mock('expo-haptics');

describe('OriginStoryScreen', () => {
  beforeEach(async () => {
    // Setup AsyncStorage with onboarding data
    await setupAsyncStorage();

    // Clear all mock calls
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await cleanupAsyncStorage();
  });

  it('should load painpoints and generate narrative', async () => {
    const { getByTestId } = render(<OriginStoryScreen />);

    await waitFor(() => {
      expect(getByTestId('narrative-title')).toHaveTextContent('This is where your story shifts.');
    });

    expect(AsyncStorage.getItem).toHaveBeenCalledWith('onboarding_data');
  });
});
```

---

## Critical Risk Mitigation Tests

### R1-001 (Score 9): Data Loss During App Backgrounding

**Test Location:** `origin-story.test.tsx` - Multi-Screen Flow section

**Mock Setup:**
```typescript
beforeEach(async () => {
  // Pre-populate draft as if user captured photo then backgrounded app
  await setupOriginStoryDraft({ photo: 'test-photo.jpg', audio: null });
});

it('should restore captured data from AsyncStorage on app resume', async () => {
  const { getByTestId } = render(<OriginStoryScreen />);

  // Verify photo restored
  await waitFor(() => {
    expect(getByTestId('photo-thumbnail')).toBeTruthy();
  });
});
```

---

### R1-002 (Score 6): Permissions Denied - User Stuck

**Test Location:** `origin-story.test.tsx` - Permissions Handling section

**Mock Setup:**
```typescript
import { Linking } from 'react-native';
import { mockCameraPermissions } from '../fixtures/originStory.fixture';

jest.mock('react-native', () => ({
  Linking: {
    openSettings: jest.fn(),
  },
  Alert: {
    alert: jest.fn(),
  },
}));

it('should show alert with Settings link if camera permission denied', async () => {
  const [permission, requestPermission] = mockCameraPermissions(false);
  (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });

  const { getByTestId } = render(<OriginStoryScreen />);

  // User taps photo button
  fireEvent.press(getByTestId('take-photo-button'));

  // Alert shown with "Open Settings" option
  await waitFor(() => {
    expect(Linking.openSettings).toHaveBeenCalled();
  });
});
```

---

## Factory Usage Examples

### Generate Random Test Data

```typescript
import { createOriginStoryData, createUserOnboardingData } from '../factories/originStory.factory';

// Random origin story data
const originData = createOriginStoryData();
// { photo_uri: '/tmp/test-photo.jpg', audio_uri: '/tmp/test-audio.aac', ... }

// Random onboarding data
const userData = createUserOnboardingData();
// { preferred_name: 'Alex', selected_painpoints: ['clarity', 'action'], ... }

// Override specific fields
const customData = createOriginStoryData({
  audio_duration: 60, // Max duration
});
```

---

## Summary

**Total Mocks Required:** 7 (expo-router, AsyncStorage, expo-image-picker, expo-av, expo-haptics, confetti, lottie)

**Total testID Attributes Required:** 34 (11 Screen 1 + 17 Screen 2 + 11 Screen 3)

**Total Factory Functions:** 7 (originStory, userOnboarding, draft, photoCapture, audioRecording, permission status, etc.)

**Total Fixture Functions:** 11 (setupAsyncStorage, mockCameraLaunch, mockAudioRecording, mockPermissions, etc.)

**Critical Risk Tests:** 2 (R1-001 AsyncStorage recovery, R1-002 permissions handling)

**Status:** RED Phase - All mocks ready, tests will fail until implementation complete

**Next Step:** Proceed to Step 5 (Create Implementation Checklist)
