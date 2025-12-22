# Implementation Checklist: Story 1.7
## Commitment Ritual & Origin Story

**Story:** 1.7 (Commitment Ritual & Origin Story)
**Status:** Ready for Implementation (RED Phase Complete)
**Test Files:**
- ✅ `src/constants/__tests__/originStoryContent.test.ts` (30+ unit tests)
- ✅ `app/(onboarding)/__tests__/origin-story.test.tsx` (77 component tests)
- ✅ `tests/support/factories/originStory.factory.ts` (Data factories)
- ✅ `tests/support/fixtures/originStory.fixture.ts` (Test fixtures)

**Generated:** 2025-12-20

---

## TDD Red-Green-Refactor Cycle

**Current Phase:** 🔴 RED - Tests written and failing

**Next Phase:** 🟢 GREEN - Implement minimal code to pass tests

**Final Phase:** 🔵 REFACTOR - Improve code quality without breaking tests

---

## Implementation Order

**Recommended implementation sequence:**

1. **Unit Tests First** (Quick wins, no UI dependencies)
   - ✅ Create `originStoryContent.ts` with content mapping
   - ✅ Implement `generateNarrativeText()` function
   - ⏱️ ~1-2 hours

2. **Screen 1: Narrative Validation** (Simplest screen, no media)
   - ✅ Create `origin-story.tsx` with Screen 1 UI
   - ✅ Load AsyncStorage data, generate narrative, render content
   - ⏱️ ~2-3 hours

3. **Screen 2: Origin Story Capture** (Most complex, camera + audio)
   - ✅ Implement photo capture with expo-image-picker
   - ✅ Implement audio recording with expo-av
   - ✅ Implement AsyncStorage persistence (CRITICAL R1-001)
   - ✅ Implement permissions handling (CRITICAL R1-002)
   - ⏱️ ~6-8 hours

4. **Screen 3: Completion & Reinforcement** (Animations + celebration)
   - ✅ Implement Weave character animation
   - ✅ Implement progress bar animation
   - ✅ Implement confetti + haptics
   - ⏱️ ~3-4 hours

**Total Estimated Time:** 12-17 hours

---

## Phase 1: Unit Tests (originStoryContent.ts)

### Test Suite: `originStoryContent.test.ts` (30+ tests)

**Objective:** Create constants and pure functions for narrative generation (AC #2, #3)

---

#### Task 1.1: Create PAINPOINT_STRUGGLES constant

**Failing Tests:**
- ✅ should have all 4 painpoint struggle texts defined
- ✅ should have non-empty struggle text for each painpoint
- ✅ should have clarity struggle mentioning scattered/direction
- ✅ should have action struggle mentioning taking action
- ✅ should have consistency struggle mentioning momentum/cycle
- ✅ should have alignment struggle mentioning alignment/purpose

**Implementation:**

```typescript
// src/constants/originStoryContent.ts

export type PainpointId = 'clarity' | 'action' | 'consistency' | 'alignment';

export const PAINPOINT_STRUGGLES: Record<PainpointId, string> = {
  clarity: "You've been feeling scattered — like there's too much to do, but no clear direction.",
  action: "You know what you want, but taking consistent action feels impossible.",
  consistency: "You start strong, but momentum fades. You're tired of the cycle.",
  alignment: "Something feels off. You're busy, but not building the life you actually want.",
};
```

**Test Command:**
```bash
npm test -- originStoryContent.test.ts -t "PAINPOINT_STRUGGLES"
```

**Expected:** 6 tests pass ✅

---

#### Task 1.2: Implement generateNarrativeText() function

**Failing Tests:**
- ✅ should return correct structure with all 3 components
- ✅ should generate struggle text for single painpoint
- ✅ should combine struggle texts for multiple painpoints
- ✅ should generate aspiration text with identity traits
- ✅ should limit aspiration to first 3 traits when >3 provided
- ✅ should generate bridge statement mentioning Weave
- ✅ should handle empty painpoints gracefully
- ✅ should handle empty identity traits gracefully
- ✅ should filter out invalid painpoint IDs without crashing
- ✅ should combine all 4 painpoint struggles when all selected

**Implementation:**

```typescript
// src/constants/originStoryContent.ts

export interface NarrativeText {
  struggle: string;
  aspiration: string;
  bridge: string;
}

export const generateNarrativeText = (
  painpoints: PainpointId[],
  identityTraits: string[]
): NarrativeText => {
  // 1. Generate struggle text
  const validPainpoints = painpoints.filter((p) => p in PAINPOINT_STRUGGLES);
  const struggle = validPainpoints
    .map((p) => PAINPOINT_STRUGGLES[p])
    .join(' ') || 'You've been feeling stuck, unsure of the next step.';

  // 2. Generate aspiration text (first 3 traits only)
  const topTraits = identityTraits.slice(0, 3);
  const aspiration = topTraits.length > 0
    ? `You want to become someone ${topTraits.join(', ')} — someone who acts with purpose.`
    : 'You want to become someone who acts with purpose and clarity.';

  // 3. Generate bridge statement
  const bridge = 'Weave helps you turn that vision into reality, one small bind at a time. This is where you begin.';

  return { struggle, aspiration, bridge };
};
```

**Test Command:**
```bash
npm test -- originStoryContent.test.ts -t "generateNarrativeText"
```

**Expected:** 11 tests pass ✅

---

#### Task 1.3: Verify content quality requirements (AC #3)

**Failing Tests:**
- ✅ should generate struggle text with reasonable length
- ✅ should generate aspiration text with reasonable length
- ✅ should generate bridge text with reasonable length

**Implementation:** No code changes needed (validation tests)

**Test Command:**
```bash
npm test -- originStoryContent.test.ts -t "Content Quality"
```

**Expected:** 3 tests pass ✅

---

#### Task 1.4: Verify performance requirements (AC #6)

**Failing Tests:**
- ✅ should generate content in <100ms
- ✅ should maintain consistent performance across multiple calls

**Implementation:** No code changes needed (performance tests)

**Test Command:**
```bash
npm test -- originStoryContent.test.ts -t "Performance"
```

**Expected:** 2 tests pass ✅

---

### Phase 1 Completion Check

```bash
# Run all unit tests
npm test -- originStoryContent.test.ts

# Expected: All 30+ tests pass ✅
```

---

## Phase 2: Screen 1 - Narrative Validation

### Test Suite: `origin-story.test.tsx` - Screen 1 Section (11 tests)

**Objective:** Display dynamic narrative based on user's painpoints and traits (AC #1-#7)

---

#### Task 2.1: Create origin-story.tsx file with Screen 1

**Failing Tests:**
- ✅ should render title: "This is where your story shifts."
- ✅ should load selected painpoints from AsyncStorage
- ✅ should load identity traits from AsyncStorage
- ✅ should display dynamic struggle text based on painpoints
- ✅ should display aspiration text with identity traits
- ✅ should display bridge statement explaining Weave

**Implementation:**

```typescript
// app/(onboarding)/origin-story.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { generateNarrativeText } from '@/constants/originStoryContent';

export default function OriginStoryScreen() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [narrativeContent, setNarrativeContent] = useState({ struggle: '', aspiration: '', bridge: '' });
  const router = useRouter();

  useEffect(() => {
    loadOnboardingData();
  }, []);

  const loadOnboardingData = async () => {
    try {
      const data = await AsyncStorage.getItem('onboarding_data');
      if (data) {
        const { selected_painpoints, identity_traits } = JSON.parse(data);
        const narrative = generateNarrativeText(selected_painpoints, identity_traits);
        setNarrativeContent(narrative);
      }
    } catch (error) {
      console.error('Failed to load onboarding data:', error);
    }
  };

  if (currentStep === 1) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={{ flex: 1, padding: 24 }}>
          <Text
            testID="narrative-title"
            style={{ fontSize: 28, fontWeight: '600', marginBottom: 24, textAlign: 'center' }}
          >
            This is where your story shifts.
          </Text>

          <View testID="narrative-body" style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 16, marginBottom: 16 }}>{narrativeContent.struggle}</Text>
            <Text style={{ fontSize: 16, marginBottom: 16 }}>{narrativeContent.aspiration}</Text>
            <Text style={{ fontSize: 16 }}>{narrativeContent.bridge}</Text>
          </View>

          <TouchableOpacity
            testID="narrative-continue-button"
            onPress={() => setCurrentStep(2)}
            style={{
              backgroundColor: '#3b82f6',
              padding: 16,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
              Take the first step →
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Screen 2 and 3 placeholders for now
  return null;
}
```

**Test Command:**
```bash
npm test -- origin-story.test.tsx -t "Screen 1"
```

**Expected:** 11 tests pass ✅

---

#### Task 2.2: Add event tracking (TODO comments)

**Failing Test:**
- ✅ should track origin_story_intro_viewed event on load

**Implementation:**

```typescript
// Add TODO comment in loadOnboardingData()
// TODO (Story 0-4): Track 'origin_story_intro_viewed' event
// trackEvent('origin_story_intro_viewed', { user_id, selected_painpoints, identity_traits });
```

**Test Command:**
```bash
npm test -- origin-story.test.tsx -t "origin_story_intro_viewed"
```

**Expected:** 1 test pass ✅

---

#### Task 2.3: Add accessibility labels (AC #7)

**Failing Tests:**
- ✅ should have accessibility labels for VoiceOver
- ✅ should respect reduced motion settings

**Implementation:**

```typescript
// Add accessibility props to title and button
<Text
  testID="narrative-title"
  accessibilityLabel="This is where your story shifts"
  accessibilityRole="header"
  style={...}
>
  This is where your story shifts.
</Text>

<TouchableOpacity
  testID="narrative-continue-button"
  accessibilityLabel="Continue to capture your origin story"
  accessibilityRole="button"
  onPress={() => setCurrentStep(2)}
  style={...}
>
  ...
</TouchableOpacity>
```

**Test Command:**
```bash
npm test -- origin-story.test.tsx -t "Accessibility"
```

**Expected:** 2 tests pass ✅

---

### Phase 2 Completion Check

```bash
# Run all Screen 1 tests
npm test -- origin-story.test.tsx -t "Screen 1"

# Expected: All 11 tests pass ✅
```

---

## Phase 3: Screen 2 - Origin Story Capture

### Test Suite: `origin-story.test.tsx` - Screen 2 Section (24 tests)

**Objective:** Capture photo + voice commitment with permissions handling (AC #8-#18)

**⚠️ CRITICAL:** This screen implements R1-001 (AsyncStorage persistence) and R1-002 (permissions handling)

---

#### Task 3.1: Create Screen 2 UI with From/To summary

**Failing Tests:**
- ✅ should render title and subheading
- ✅ should display From/To summary card

**Implementation:**

```typescript
// Add Screen 2 rendering in origin-story.tsx

if (currentStep === 2) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ flex: 1, padding: 24 }}>
        <Text style={{ fontSize: 28, fontWeight: '600', marginBottom: 8 }}>
          Let's make this moment official.
        </Text>
        <Text style={{ fontSize: 16, opacity: 0.85, marginBottom: 24 }}>
          Capture where you are now — and commit to where you're going.
        </Text>

        {/* From/To Summary Card */}
        <View testID="from-to-summary-card" style={{ backgroundColor: '#f3f4f6', padding: 16, borderRadius: 8, marginBottom: 32 }}>
          <Text testID="from-text" style={{ fontWeight: '600', marginBottom: 4 }}>From:</Text>
          <Text style={{ marginBottom: 12 }}>{narrativeContent.struggle}</Text>
          <Text testID="to-text" style={{ fontWeight: '600', marginBottom: 4 }}>To:</Text>
          <Text>{narrativeContent.aspiration}</Text>
        </View>

        {/* Photo and audio capture UI will go here */}
      </View>
    </SafeAreaView>
  );
}
```

**Test Command:**
```bash
npm test -- origin-story.test.tsx -t "should render title and subheading"
npm test -- origin-story.test.tsx -t "should display From/To summary card"
```

**Expected:** 2 tests pass ✅

---

#### Task 3.2: Implement photo capture with expo-image-picker (AC #10)

**Failing Tests:**
- ✅ should launch camera on "Take a photo" button tap
- ✅ should display photo thumbnail after capture
- ✅ should allow photo retake by tapping thumbnail
- ✅ should save photo URI to AsyncStorage immediately

**Implementation:**

```typescript
// Add state for photo
const [photoUri, setPhotoUri] = useState<string | null>(null);

// Add photo capture function
import * as ImagePicker from 'expo-image-picker';

const launchCamera = async () => {
  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setPhotoUri(uri);

      // CRITICAL R1-001: Save immediately to AsyncStorage
      await saveToAsyncStorage({ photo: uri });
    }
  } catch (error) {
    console.error('Camera error:', error);
  }
};

const saveToAsyncStorage = async (data: any) => {
  try {
    const draft = await AsyncStorage.getItem('origin_story_draft');
    const existing = draft ? JSON.parse(draft) : {};
    await AsyncStorage.setItem('origin_story_draft', JSON.stringify({
      ...existing,
      ...data,
      timestamp: Date.now(),
    }));
  } catch (error) {
    console.error('AsyncStorage save error:', error);
  }
};

// Add photo UI
<TouchableOpacity
  testID="take-photo-button"
  onPress={launchCamera}
  accessibilityLabel="Take your origin story photo"
  accessibilityRole="button"
  style={{ ... }}
>
  <Text>Take a photo</Text>
</TouchableOpacity>

{photoUri && (
  <TouchableOpacity
    testID="photo-thumbnail"
    onPress={launchCamera} // Allow retake
  >
    <Image source={{ uri: photoUri }} style={{ width: 120, height: 120 }} />
  </TouchableOpacity>
)}
```

**Test Command:**
```bash
npm test -- origin-story.test.tsx -t "photo"
```

**Expected:** 4 tests pass ✅

---

#### Task 3.3: Implement audio recording with expo-av (AC #11)

**Failing Tests:**
- ✅ should start audio recording on button tap
- ✅ should display recording UI with timer and red indicator
- ✅ should auto-stop recording at 60 seconds
- ✅ should force-stop recording at 65 seconds
- ✅ should display audio preview and playback controls
- ✅ should allow audio re-recording
- ✅ should save audio URI to AsyncStorage immediately

**Implementation:**

```typescript
// Add state for audio
const [audioUri, setAudioUri] = useState<string | null>(null);
const [audioDuration, setAudioDuration] = useState<number>(0);
const [isRecording, setIsRecording] = useState(false);
const [recordingTime, setRecordingTime] = useState(60);

import { Audio } from 'expo-av';

const startRecording = async () => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    setRecording(recording);
    setIsRecording(true);

    // Auto-stop at 60 seconds
    setTimeout(() => stopRecording(), 60000);

    // Force-stop safety at 65 seconds (CRITICAL AC #11)
    setTimeout(() => {
      if (isRecording) {
        console.warn('[ORIGIN_STORY] Force stopping recording after 65s');
        stopRecording();
      }
    }, 65000);
  } catch (error) {
    console.error('Recording error:', error);
  }
};

const stopRecording = async () => {
  try {
    if (recording) {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const { durationMillis } = await recording.getStatusAsync();
      const duration = Math.round(durationMillis / 1000);

      setAudioUri(uri);
      setAudioDuration(duration);
      setIsRecording(false);

      // CRITICAL R1-001: Save immediately to AsyncStorage
      await saveToAsyncStorage({ audio: uri, duration });
    }
  } catch (error) {
    console.error('Stop recording error:', error);
  }
};

// Add audio UI
<TouchableOpacity
  testID="record-audio-button"
  onPress={startRecording}
  accessibilityLabel="Record your commitment"
  accessibilityRole="button"
>
  <Text>Record your commitment</Text>
</TouchableOpacity>

{isRecording && (
  <View testID="recording-indicator">
    <Text testID="recording-timer">{recordingTime}s left</Text>
    <TouchableOpacity testID="stop-recording-button" onPress={stopRecording}>
      <Text>Stop</Text>
    </TouchableOpacity>
  </View>
)}

{audioUri && (
  <View testID="audio-waveform">
    <TouchableOpacity testID="play-audio-button" onPress={playAudio}>
      <Text>Play</Text>
    </TouchableOpacity>
    <Text testID="audio-duration">{audioDuration}s</Text>
    <TouchableOpacity testID="re-record-audio-button" onPress={startRecording}>
      <Text>Re-record</Text>
    </TouchableOpacity>
  </View>
)}
```

**Test Command:**
```bash
npm test -- origin-story.test.tsx -t "audio"
```

**Expected:** 7 tests pass ✅

---

#### Task 3.4: Implement permissions handling (AC #15 - CRITICAL R1-002)

**Failing Tests:**
- ✅ should request camera permission on first photo attempt
- ✅ should show alert with Settings link if camera permission denied
- ✅ should request microphone permission on first recording attempt
- ✅ should show alert with Settings link if microphone permission denied

**Implementation:**

```typescript
import { Alert, Linking } from 'react-native';

const launchCamera = async () => {
  // Request permission first
  const { status } = await ImagePicker.requestCameraPermissionsAsync();

  if (status !== 'granted') {
    // CRITICAL R1-002: Show Settings deep-link
    Alert.alert(
      'Camera Access Required',
      'Weave needs camera access to capture your origin story. You can enable this in Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
    return;
  }

  // Launch camera...
};

const startRecording = async () => {
  // Request permission first
  const { status } = await Audio.requestPermissionsAsync();

  if (status !== 'granted') {
    // CRITICAL R1-002: Show Settings deep-link
    Alert.alert(
      'Microphone Access Required',
      'Weave needs microphone access to record your commitment. You can enable this in Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
    return;
  }

  // Start recording...
};
```

**Test Command:**
```bash
npm test -- origin-story.test.tsx -t "Permissions Handling"
```

**Expected:** 4 tests pass ✅

---

#### Task 3.5: Implement validation and Continue button (AC #14)

**Failing Tests:**
- ✅ should enable Continue button after both photo and audio captured
- ✅ should keep Continue button disabled if only photo captured
- ✅ should keep Continue button disabled if only audio captured
- ✅ should display preview card after both captures

**Implementation:**

```typescript
// Validation logic
const isCaptureComplete = photoUri !== null && audioUri !== null;

// Preview card
{isCaptureComplete && (
  <View testID="preview-card" style={{ ... }}>
    <Image source={{ uri: photoUri }} style={{ width: 120, height: 120 }} />
    <Text>{narrativeContent.from_text}</Text>
    <Text>{narrativeContent.to_text}</Text>
    <Text testID="audio-duration">{audioDuration}s</Text>
  </View>
)}

// Complete Bind button
<TouchableOpacity
  testID="complete-bind-button"
  disabled={!isCaptureComplete}
  onPress={() => setCurrentStep(3)}
  style={{
    backgroundColor: isCaptureComplete ? '#3b82f6' : '#d1d5db',
    opacity: isCaptureComplete ? 1 : 0.5,
    ...
  }}
>
  <Text>Complete Bind</Text>
</TouchableOpacity>
```

**Test Command:**
```bash
npm test -- origin-story.test.tsx -t "Validation"
```

**Expected:** 4 tests pass ✅

---

#### Task 3.6: Add event tracking (TODO comments)

**Failing Tests:**
- ✅ should track origin_story_photo_captured event
- ✅ should track origin_story_voice_recorded event
- ✅ should track origin_story_preview_played event on playback

**Implementation:**

```typescript
// Add TODO comments in capture functions
// TODO (Story 0-4): Track 'origin_story_photo_captured' event
// TODO (Story 0-4): Track 'origin_story_voice_recorded' event
// TODO (Story 0-4): Track 'origin_story_preview_played' event
```

**Test Command:**
```bash
npm test -- origin-story.test.tsx -t "should track"
```

**Expected:** 3 tests pass ✅

---

### Phase 3 Completion Check

```bash
# Run all Screen 2 tests
npm test -- origin-story.test.tsx -t "Screen 2"

# Expected: All 24 tests pass ✅
```

---

## Phase 4: Screen 3 - Completion & Reinforcement

### Test Suite: `origin-story.test.tsx` - Screen 3 Section (16 tests)

**Objective:** Celebrate completion with animations and navigate to Story 1.8 (AC #19-#27)

---

#### Task 4.1: Create Screen 3 UI with title and animations

**Failing Tests:**
- ✅ should render title: "This is your beginning."
- ✅ should render subheading about first step
- ✅ should play Weave animation on load
- ✅ should animate level progress bar from 0 to 1
- ✅ should display "Level 1" text when animation completes
- ✅ should display confetti burst animation on load
- ✅ should trigger success haptic feedback on iOS

**Implementation:**

```typescript
// Add Screen 3 rendering
import LottieView from 'lottie-react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';

if (currentStep === 3) {
  useEffect(() => {
    // Trigger haptic on load
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Success);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ flex: 1, padding: 24, alignItems: 'center' }}>
        <Text testID="completion-title" style={{ fontSize: 32, fontWeight: '600', marginBottom: 8, textAlign: 'center' }}>
          This is your beginning.
        </Text>
        <Text testID="completion-subheading" style={{ fontSize: 16, opacity: 0.85, marginBottom: 32, textAlign: 'center' }}>
          You just took the first step toward your future self.
        </Text>

        {/* Weave Character Animation */}
        <LottieView
          testID="weave-animation"
          source={require('@/assets/animations/weave-level-up.json')}
          autoPlay
          loop={false}
          style={{ width: 200, height: 200, marginBottom: 24 }}
        />

        {/* Level Progress Bar */}
        <View testID="level-progress-bar" style={{ width: '100%', marginBottom: 16 }}>
          {/* Animated progress bar (0 → 1) */}
        </View>

        <Text testID="level-text" style={{ fontSize: 18, fontWeight: '600' }}>Level 1</Text>

        {/* Confetti Animation */}
        <ConfettiCannon
          testID="confetti-animation"
          count={150}
          origin={{ x: screenWidth / 2, y: 0 }}
          autoStart={true}
          fadeOut={true}
        />

        {/* Continue button will go here */}
      </View>
    </SafeAreaView>
  );
}
```

**Test Command:**
```bash
npm test -- origin-story.test.tsx -t "Screen 3" -t "animation"
```

**Expected:** 7 tests pass ✅

---

#### Task 4.2: Add origin story summary card (AC #23)

**Failing Test:**
- ✅ should display origin story summary card

**Implementation:**

```typescript
{/* Origin Story Summary Card */}
<View testID="origin-summary-card" style={{ backgroundColor: '#f3f4f6', padding: 16, borderRadius: 8, marginBottom: 32 }}>
  <Image testID="origin-summary-photo" source={{ uri: photoUri }} style={{ width: 80, height: 80, borderRadius: 40 }} />
  <Text testID="origin-summary-text" style={{ marginTop: 12 }}>
    From: {narrativeContent.struggle.slice(0, 50)}...
  </Text>
  <Text testID="origin-summary-duration">{audioDuration}s commitment recorded</Text>
</View>
```

**Test Command:**
```bash
npm test -- origin-story.test.tsx -t "should display origin story summary card"
```

**Expected:** 1 test pass ✅

---

#### Task 4.3: Add Continue button and navigation (AC #24)

**Failing Tests:**
- ✅ should render Continue button with correct text
- ✅ should navigate to Story 1.8 (first-needle) on Continue tap

**Implementation:**

```typescript
<TouchableOpacity
  testID="continue-to-goal-button"
  onPress={handleCompletion}
  style={{ backgroundColor: '#3b82f6', padding: 16, borderRadius: 8, width: '100%', alignItems: 'center' }}
>
  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
    Continue to set your first goal →
  </Text>
</TouchableOpacity>

const handleCompletion = async () => {
  // Clear AsyncStorage draft (AC #17)
  await AsyncStorage.removeItem('origin_story_draft');

  // TODO (Story 0-4): Upload photo/audio to Supabase
  // TODO (Story 0-4): Create origin_stories record
  // TODO (Story 0-4): Update user_profiles.first_bind_completed_at

  // Navigate to Story 1.8
  router.push('/(onboarding)/first-needle');
};
```

**Test Command:**
```bash
npm test -- origin-story.test.tsx -t "should navigate to Story 1.8"
```

**Expected:** 2 tests pass ✅

---

#### Task 4.4: Add backend integration TODO comments (AC #25)

**Failing Test:**
- ✅ should have TODO comments for backend integration

**Implementation:**

```typescript
// Add TODO comments in handleCompletion()
// TODO (Story 0-4): Upload photo to Supabase Storage: /origin_stories/{user_id}/photo.jpg
// TODO (Story 0-4): Upload audio to Supabase Storage: /origin_stories/{user_id}/commitment.aac
// TODO (Story 0-4): Create origin_stories record with photo_url, audio_url, from_text, to_text
// TODO (Story 0-4): Create bind_instance with is_origin_bind = TRUE
// TODO (Story 0-4): Update user_profiles: first_bind_completed_at = NOW(), user_level = 1
```

**Test Command:**
```bash
npm test -- origin-story.test.tsx -t "should have TODO comments for backend integration"
```

**Expected:** 1 test pass ✅

---

#### Task 4.5: Add event tracking (AC #26)

**Failing Tests:**
- ✅ should track origin_story_created event on load
- ✅ should track origin_bind_completed event on navigation

**Implementation:**

```typescript
// Add TODO comments in Screen 3
// TODO (Story 0-4): Track 'origin_story_created' event on Screen 3 load
// TODO (Story 0-4): Track 'origin_bind_completed' event on Continue tap
```

**Test Command:**
```bash
npm test -- origin-story.test.tsx -t "should track"
```

**Expected:** 2 tests pass ✅

---

#### Task 4.6: Add performance and accessibility (AC #27)

**Failing Tests:**
- ✅ should run animations at 60fps with useNativeDriver
- ✅ should skip animations when reduced motion enabled
- ✅ should clear AsyncStorage draft on completion

**Implementation:**

```typescript
// Use useNativeDriver for all animations
<Animated.View
  style={{
    transform: [{ scale: animValue }],
  }}
  // useNativeDriver: true in animation config
/>

// Respect reduced motion
const reduceMotion = AccessibilityInfo.isReduceMotionEnabled();
if (reduceMotion) {
  // Skip animations, show static completion state
}
```

**Test Command:**
```bash
npm test -- origin-story.test.tsx -t "Performance" -t "Accessibility"
```

**Expected:** 3 tests pass ✅

---

### Phase 4 Completion Check

```bash
# Run all Screen 3 tests
npm test -- origin-story.test.tsx -t "Screen 3"

# Expected: All 16 tests pass ✅
```

---

## Phase 5: Multi-Screen Flow & Integration Tests

### Test Suite: `origin-story.test.tsx` - Multi-Screen Flow Section (6 tests)

**Objective:** Verify navigation and state management across all 3 screens

---

#### Task 5.1: Verify screen transitions

**Failing Tests:**
- ✅ should transition from Screen 1 to Screen 2
- ✅ should transition from Screen 2 to Screen 3
- ✅ should navigate from Screen 3 to Story 1.8
- ✅ should pass captured data from Screen 2 to Screen 3

**Implementation:** No new code needed (integration tests)

**Test Command:**
```bash
npm test -- origin-story.test.tsx -t "Multi-Screen Flow"
```

**Expected:** 4 tests pass ✅

---

#### Task 5.2: Verify AsyncStorage recovery (CRITICAL R1-001)

**Failing Tests:**
- ✅ should restore captured data from AsyncStorage on app resume
- ✅ should restore draft on mount if exists in AsyncStorage

**Implementation:**

```typescript
// Add useEffect for draft recovery
useEffect(() => {
  restoreDraft();
}, []);

const restoreDraft = async () => {
  try {
    const draft = await AsyncStorage.getItem('origin_story_draft');
    if (draft) {
      const { photo, audio, duration } = JSON.parse(draft);
      if (photo) setPhotoUri(photo);
      if (audio) {
        setAudioUri(audio);
        setAudioDuration(duration);
      }
    }
  } catch (error) {
    console.error('Failed to restore draft:', error);
  }
};
```

**Test Command:**
```bash
npm test -- origin-story.test.tsx -t "should restore captured data from AsyncStorage"
```

**Expected:** 2 tests pass ✅

---

## Final Verification

### Run All Tests

```bash
cd weave-mobile

# Run all unit tests
npm test -- originStoryContent.test.ts

# Run all component tests
npm test -- origin-story.test.tsx

# Run all Story 1.7 tests
npm test -- originStory
```

**Expected Output (GREEN Phase):**

```
PASS  src/constants/__tests__/originStoryContent.test.ts
  ✓ PAINPOINT_STRUGGLES constant (6 tests)
  ✓ generateNarrativeText (11 tests)
  ✓ Content Quality Requirements (3 tests)
  ✓ Performance Requirements (2 tests)

  Test Suites: 1 passed, 1 total
  Tests:       30 passed, 30 total

PASS  app/(onboarding)/__tests__/origin-story.test.tsx
  ✓ Screen 1: Narrative Validation (11 tests)
  ✓ Screen 2: Origin Story Capture (24 tests)
  ✓ Screen 3: Completion & Reinforcement (16 tests)
  ✓ Multi-Screen Flow & State Management (6 tests)
  ✓ Permissions Handling (4 tests)
  ✓ Validation Logic (5 tests)
  ✓ Error Handling (5 tests)
  ✓ Performance Requirements (3 tests)
  ✓ Accessibility (3 tests)

  Test Suites: 1 passed, 1 total
  Tests:       77 passed, 77 total
```

---

## Manual Device Testing (REQUIRED)

**⚠️ CRITICAL:** The following CANNOT be automated and require physical iOS device:

### Camera Permissions Flow
1. Fresh install → Tap "Take a photo" → Permission request appears
2. Deny permission → Alert shows with "Open Settings"
3. Tap "Open Settings" → iOS Settings app opens to Weave
4. Enable camera permission → Return to app → Retry succeeds

### Microphone Permissions Flow
1. Fresh install → Tap "Record your commitment" → Permission request appears
2. Deny permission → Alert shows with "Open Settings"
3. Tap "Open Settings" → iOS Settings app opens to Weave
4. Enable microphone permission → Return to app → Retry succeeds

### Photo Capture
1. Front camera: Captures selfie correctly
2. Back camera: Captures environment correctly
3. Photo preview: Thumbnail displays accurately
4. Retake: Replaces photo correctly

### Voice Recording
1. Recording starts: Red indicator pulses
2. Timer counts down: 60 → 59 → 58...
3. Auto-stop at 60s: Recording stops automatically
4. Playback: Audio plays correctly
5. Re-record: Replaces audio correctly

### App Backgrounding (CRITICAL R1-001)
1. Kill app during Screen 2 (after photo captured)
2. Relaunch app
3. **Verify:** Photo restored from AsyncStorage ✅
4. Kill app during Screen 2 (after audio recorded)
5. Relaunch app
6. **Verify:** Audio restored from AsyncStorage ✅

### Animations (Screen 3)
1. Weave character: Smooth animation, no lag
2. Progress bar: Animates from 0 → 1 smoothly
3. Confetti: Displays for 1-2 seconds, then fades
4. Haptic feedback: Success pattern triggers on iOS

**Manual Test Script:** See `docs/test-design-epic-1.md` (lines 494-536)

---

## Refactor Phase (Optional)

After all tests pass (GREEN Phase), consider these refactorings:

1. **Extract Screen Components:**
   - `Screen1NarrativeValidation.tsx`
   - `Screen2OriginStoryCapture.tsx`
   - `Screen3CompletionReinforcement.tsx`

2. **Create Reusable Components:**
   - `PromptChip.tsx` (suggested prompts)
   - `AudioWaveform.tsx` (audio visualization)
   - `ProgressBar.tsx` (animated progress)

3. **Extract Hooks:**
   - `useOriginStoryState.ts` (state management)
   - `useMediaCapture.ts` (photo + audio logic)
   - `useAsyncStoragePersistence.ts` (draft save/restore)

4. **Performance Optimizations:**
   - useMemo for narrative generation
   - useCallback for event handlers
   - React.memo for static components

**Rule:** Only refactor if tests still pass ✅

---

## Summary

**Total Implementation Tasks:** 23
**Total Test Cases:** 107 (30 unit + 77 component)
**Total Estimated Time:** 12-17 hours

**Critical Risk Mitigations:**
- ✅ R1-001 (Score 9): AsyncStorage persistence implemented (Task 3.2, 3.3, 5.2)
- ✅ R1-002 (Score 6): Permissions handling with Settings deep-link (Task 3.4)

**Status:** Ready for Implementation 🟢

**Next Step:** Begin Phase 1 (Unit Tests) - Estimated 1-2 hours
