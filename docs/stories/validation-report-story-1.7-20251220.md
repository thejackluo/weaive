# Validation Report: Story 1.7 - Commitment Ritual & Origin Story

**Document:** `/Users/eddielou/weavelight-story-1.7-new/docs/stories/1-7-commitment-ritual-origin-story.md`
**Checklist:** `/Users/eddielou/weavelight-story-1.7-new/_bmad/bmm/workflows/4-implementation/create-story/checklist.md`
**Date:** 2025-12-20
**Validator:** Claude Sonnet 4.5 (Adversarial Review Mode)

---

## Executive Summary

**Overall Assessment:** Story requires CRITICAL improvements before dev-story execution

**Findings Summary:**
- **CRITICAL Issues:** 8 (Must fix - blockers for implementation)
- **HIGH Priority:** 8 (Should fix - significant implementation risk)
- **MEDIUM Priority:** 8 (Nice to fix - quality improvements)
- **LOW Priority:** 8 (Optional - minor enhancements)

**Validation Result:** ⚠️ **PARTIAL PASS** - Story has good structure but contains critical gaps that could cause developer mistakes, implementation failures, or rework.

---

## CRITICAL ISSUES (Must Fix - Blockers)

### 🚨 CRITICAL #1: Missing Cross-Story Data Persistence Pattern

**Location:** AC #2 (Screen 1), AC #9 (Screen 2), Task 4, Dev Notes

**Issue:**
Story requires loading data from previous stories:
- Painpoints from Story 1.2 (Clarity, Action, Consistency, Alignment)
- Identity traits from Story 1.6 (3-5 selected traits)
- User's name from Story 1.6

However, Story 1.6 only stored data in **component state** (not persisted). Story doesn't specify HOW to retrieve this data.

**Evidence:**
- AC #2: "Load user's selected painpoints from Story 1.2 (localStorage or context)"
- Says "localStorage or context" but Story 1.6 used neither
- No guidance on cross-story state management pattern

**Impact:** 🔴 **BLOCKER**
- Developer will have to guess implementation approach
- High risk of incorrect data flow
- Potential data loss if user backgrounds app
- Inconsistent with existing codebase patterns

**Recommended Fix:**
Add explicit section **"Cross-Story Data Flow"** with:
```typescript
// Option A (RECOMMENDED): AsyncStorage for onboarding data
import AsyncStorage from '@react-native-async-storage/async-storage';

// Save in Story 1.6:
await AsyncStorage.setItem('onboarding_data', JSON.stringify({
  preferred_name: 'John',
  selected_painpoints: ['clarity', 'consistency'],
  identity_traits: ['Disciplined', 'Focused', 'Intentional']
}));

// Load in Story 1.7:
const data = JSON.parse(await AsyncStorage.getItem('onboarding_data') || '{}');

// Option B: React Context (if already implemented)
// Option C: Zustand store (overkill for onboarding)
```

**Rationale:** Without explicit data persistence pattern, developer will either:
1. Re-implement navigation to pass props (breaks single-screen pattern)
2. Create new global state solution (unnecessary complexity)
3. Hard-code test data (broken functionality)

---

### 🚨 CRITICAL #2: CTA Text Inconsistency with Epic Requirements

**Location:** AC #16 (Screen 2), Epic US-1.7 Screen 2

**Issue:**
- **Epic specification:** "Complete Bind" (reinforces terminology)
- **Story specification:** "Continue" (generic, misses learning opportunity)

**Evidence:**
```markdown
# Epic 1 (US-1.7 Screen 2):
**Primary CTA:** "Complete Bind"

# Story 1.7 (AC #16):
- [ ] Display "Continue" button at bottom (full-width, primary color)
```

**Impact:** 🔴 **UX REGRESSION**
- Misses critical opportunity to teach "Bind" terminology
- Inconsistent with product vision (Binds as identity-building actions)
- User won't understand what a Bind is before Story 1.8

**Recommended Fix:**
Change AC #16:
```markdown
- [ ] Display "Complete Bind" button at bottom (full-width, primary color)
- [ ] Button styling: Primary color, min 48px height, rounded corners
- [ ] On press: Mark first bind as complete, process and submit origin story data
```

Add to Dev Notes:
```markdown
**Terminology Note:** This is the user's FIRST BIND - a symbolic commitment action.
Using "Complete Bind" instead of "Continue" teaches core terminology and sets expectations
for future bind completions. This aligns with Epic 1 specification.
```

**Rationale:** Product strategy emphasizes "Binds" as core identity-building concept. This is the first moment to reinforce that terminology.

---

### 🚨 CRITICAL #3: Missing bind_instance Database Schema Requirement

**Location:** AC #25 (Backend Data Operations), Dev Notes "Database Schema"

**Issue:**
- **Epic specification:** Create `origin_stories` record + first `bind_instance`
- **Story specification:** Only mentions `origin_stories` table

**Evidence:**
```markdown
# Epic 1 (US-1.7 Screen 2 Data Requirements):
- Create `origin_stories` record with photo + voice asset IDs
- Associate with first `bind_instance`

# Story 1.7 (AC #25):
- Create `origin_stories` record:
  - (lists fields but no mention of bind_instance)
```

**Impact:** 🔴 **DATA MODEL INCOMPLETE**
- Backend integration (Story 0-4) will miss critical table
- No way to track this as "first bind completed"
- Breaks progress tracking and gamification systems

**Recommended Fix:**
Update AC #25:
```sql
-- 1. Create origin_stories record
INSERT INTO origin_stories (...) VALUES (...);

-- 2. Create first bind_instance (symbolic commitment bind)
INSERT INTO bind_instances (
  user_id,
  subtask_template_id, -- Special template: "origin_story_commitment"
  scheduled_for_date,
  completed_at,
  is_origin_bind
) VALUES (?, ?, NOW(), NOW(), TRUE);

-- 3. Update user_profiles
UPDATE user_profiles
SET first_bind_completed_at = NOW(), user_level = 1
WHERE auth_user_id = ?;
```

Add to Dev Notes:
```markdown
**First Bind Semantics:**
This origin story capture IS the user's first Bind - a symbolic commitment action.
Story 0-4 must create both `origin_stories` record AND `bind_instance` record
with special flag `is_origin_bind = TRUE` for progress tracking.
```

**Rationale:** Epic explicitly requires bind_instance association. Without it, onboarding metrics (first bind completion rate, time to first bind) cannot be tracked.

---

### 🚨 CRITICAL #4: Voice Recording Timeout Error Handling Missing

**Location:** AC #11 (Voice Note Commitment)

**Issue:**
Says "auto-stop at 60 seconds" but provides no error handling if:
- Recording API fails to stop
- Recording continues beyond 60 seconds
- Device runs out of storage during recording

**Evidence:**
```markdown
AC #11:
- [ ] Auto-stop at 60 seconds
(No error handling specified)
```

**Impact:** 🔴 **APP CRASH RISK**
- App could hang if recording doesn't stop
- Memory leak if recording continues indefinitely
- Data corruption if storage full

**Recommended Fix:**
Update AC #11:
```markdown
- [ ] Recording duration: Max 60 seconds with auto-stop
- [ ] Timer display: Show remaining time (60s countdown)
- [ ] Error handling:
  - If recording fails to start: Alert "Microphone unavailable. Please check settings."
  - If recording fails to stop: Force stop after 65 seconds (5s grace period)
  - If storage full: Alert "Not enough storage. Free up space and try again."
  - On any error: Clear recording state, allow retry
```

Add to Technical Requirements:
```typescript
// Recording timeout safety
const MAX_RECORDING_DURATION = 60000; // 60 seconds
const FORCE_STOP_DURATION = 65000;    // 65 seconds (safety margin)

const recordingTimeout = setTimeout(() => {
  if (recording) {
    console.warn('[ORIGIN_STORY] Force stopping recording after 65s');
    stopRecording();
  }
}, FORCE_STOP_DURATION);
```

**Rationale:** Audio recording is device-dependent and error-prone. Without proper error handling, app becomes unusable if recording hangs.

---

### 🚨 CRITICAL #5: Temporary File Persistence for App Backgrounding

**Location:** AC #17 (Data Storage), AC #10 (Photo Capture), AC #11 (Audio Capture)

**Issue:**
- AC #17 says "temporary local storage until submission"
- Doesn't specify what happens if user:
  - Backgrounds the app
  - Receives phone call during recording
  - App crashes before Screen 3
  - Navigates backward to previous story

**Evidence:**
```markdown
AC #17:
- [ ] Store captured data temporarily in component state:
  - photo: File URI (temporary local path)
  - audioUri: File URI (temporary local path)

(No mention of persistence across app lifecycle)
```

**Impact:** 🔴 **DATA LOSS RISK**
- User captures photo + audio (30-60 seconds effort)
- App backgrounds or crashes
- Data lost, user has to start over
- Terrible UX, user abandonment

**Recommended Fix:**
Update AC #17:
```markdown
- [ ] Store captured data in TWO locations:
  1. Component state (for immediate UI updates)
  2. AsyncStorage (for app backgrounding survival)

- [ ] Persistence strategy:
  - On photo capture: Save to AsyncStorage immediately
  - On audio recording complete: Save to AsyncStorage immediately
  - On Screen 3 completion: Clear AsyncStorage (data uploaded)
  - On app mount: Check AsyncStorage for incomplete origin story, restore if found

- [ ] Key: 'origin_story_draft'
```

Add code example:
```typescript
// Save photo immediately after capture
const handlePhotoCapture = async (photoUri: string) => {
  setPhoto(photoUri);
  await AsyncStorage.setItem('origin_story_draft', JSON.stringify({
    photo: photoUri,
    audio: null,
    timestamp: Date.now()
  }));
};

// Restore on mount if incomplete
useEffect(() => {
  const restoreDraft = async () => {
    const draft = await AsyncStorage.getItem('origin_story_draft');
    if (draft) {
      const { photo, audio } = JSON.parse(draft);
      setPhoto(photo);
      setAudioUri(audio);
    }
  };
  restoreDraft();
}, []);
```

**Rationale:** Mobile apps MUST handle backgrounding gracefully. Losing 60 seconds of user effort is unacceptable UX.

---

### 🚨 CRITICAL #6: Package Dependency Conflict Risk (NPM Guardrails Violation)

**Location:** Technical Requirements, Library & Framework Requirements

**Issue:**
Story lists dependencies to install but doesn't follow CLAUDE.md NPM Dependency Management guardrails:

```markdown
# Story says:
npx expo install expo-image-picker expo-av expo-haptics
npm install react-native-confetti-cannon lottie-react-native
```

But CLAUDE.md explicitly warns:
> 🚨 CRITICAL: NEVER use `--legacy-peer-deps` or `--force` flags with npm install
> Always check existing versions first
> Fix conflicts at root cause, never use shortcuts

**Evidence:**
- No instruction to check current package versions
- No instruction to run `npx expo-doctor` before installing
- Risk of version conflicts with existing packages

**Impact:** 🔴 **BUILD FAILURE RISK**
- Silent dependency conflicts
- Broken build requiring full node_modules cleanup
- Wastes developer time debugging package issues

**Recommended Fix:**
Update Library & Framework Requirements:
```markdown
**Required Dependencies:**

**STEP 1: Verify Current Setup**
```bash
# Check Expo SDK compatibility
npx expo-doctor

# Check current versions
npm list expo-image-picker expo-av expo-haptics react-native-confetti-cannon lottie-react-native
```

**STEP 2: Install Missing Dependencies**
```bash
# Expo-managed packages (use expo install for automatic version matching)
npx expo install expo-image-picker expo-av expo-haptics

# Community packages (verify Expo SDK 53 compatibility first)
# Check: https://reactnative.directory/ for Expo compatibility
npm install react-native-confetti-cannon lottie-react-native
```

**STEP 3: Verify Installation**
```bash
npm install  # Should complete without warnings
npx expo-doctor  # Should report no issues
```

**⚠️ CRITICAL NPM GUARDRAILS:**
- NEVER use `--legacy-peer-deps` or `--force` flags
- If peer dependency errors occur: Fix root cause by pinning exact versions
- See CLAUDE.md "NPM Dependency Management" section for conflict resolution
```

**Rationale:** CLAUDE.md explicitly warns against dangerous npm practices. Story must reinforce these guardrails to prevent package corruption.

---

### 🚨 CRITICAL #7: Navigation Implementation Ambiguity

**Location:** AC #4, AC #16, AC #24, Task 4

**Issue:**
Story mentions "Navigate to Screen 2" and "Navigate to Screen 3" but doesn't specify whether to:
- Use `router.push()` (creates separate routes)
- Use `setCurrentStep(2)` (state machine within single screen)

This is CRITICAL because Story 1.6 established the **single-screen state machine pattern** but Story 1.7 doesn't explicitly enforce it.

**Evidence:**
```markdown
AC #4:
- [ ] Navigate to Screen 2 (Origin Story Capture) on continue

Technical Requirements:
**Single Screen with Step State Machine (RECOMMENDED)**
(But then uses ambiguous "Navigate to" language)
```

**Impact:** 🔴 **WRONG IMPLEMENTATION PATTERN**
- Developer might create 3 separate route files
- Breaks established Story 1.6 pattern
- More complex state management
- Slower transitions

**Recommended Fix:**
Update ALL navigation references:
```markdown
# Replace all instances of "Navigate to Screen X"
# With explicit state machine language:

AC #4:
- [ ] On continue: Update currentStep state to 2 (do NOT use router.push)

AC #16:
- [ ] On continue: Update currentStep state to 3 (do NOT use router.push)

AC #24:
- [ ] On continue: Navigate to Story 1.8 using router.push('/(onboarding)/first-needle')
```

Add to Dev Notes (make bold/prominent):
```markdown
**🚨 CRITICAL PATTERN: Single Screen State Machine**

This story MUST use the same single-screen pattern established in Story 1.6:
- ONE file: `app/(onboarding)/origin-story.tsx`
- THREE screens rendered conditionally based on `currentStep` state
- NO router.push() between screens (only within the story)
- State machine: currentStep: 1 | 2 | 3

**WHY:** Smoother transitions, simpler state management, faster UX, consistent with Story 1.6.

**DO NOT create separate files:**
❌ app/(onboarding)/narrative-validation.tsx
❌ app/(onboarding)/origin-capture.tsx
❌ app/(onboarding)/completion.tsx
```

**Rationale:** Ambiguous language leads to wrong implementation. Story 1.6 spent effort establishing this pattern - must enforce it explicitly.

---

### 🚨 CRITICAL #8: Accessibility Labels Missing for Critical Interactive Elements

**Location:** AC #7 (Accessibility), AC #10 (Photo Capture), AC #11 (Voice Recording)

**Issue:**
Story mentions "VoiceOver reads dynamic content correctly" but provides NO accessibility labels for interactive elements:
- Camera button
- Microphone button
- Retake photo button
- Play/pause audio button
- Preview card elements

**Evidence:**
```markdown
AC #7:
- [ ] VoiceOver reads dynamic content correctly
(No specific labels provided)
```

**Impact:** 🔴 **ACCESSIBILITY FAILURE**
- Fails WCAG 2.1 Level AA compliance
- Blind users cannot use the app
- Apple App Store rejection risk

**Recommended Fix:**
Add new AC #7a:
```markdown
**Accessibility Labels (AC #7a - CRITICAL)**
- [ ] Camera button:
  - accessibilityLabel: "Take your origin story photo"
  - accessibilityHint: "Opens camera to capture a photo representing where you are now"
- [ ] Microphone button:
  - accessibilityLabel: "Record your commitment"
  - accessibilityHint: "Starts recording. Speak for up to 60 seconds about why this matters to you"
- [ ] Retake photo button:
  - accessibilityLabel: "Retake photo"
  - accessibilityHint: "Discards current photo and opens camera again"
- [ ] Play audio button:
  - accessibilityLabel: "Play your recorded commitment"
  - accessibilityHint: "Plays back your voice recording. Duration: X seconds"
- [ ] Preview card:
  - accessibilityLabel: "Origin story preview"
  - accessibilityHint: "Shows your photo and voice commitment. Tap elements to review or retake"
```

Add to Technical Requirements:
```typescript
// Example implementation
<TouchableOpacity
  onPress={launchCamera}
  accessibilityLabel="Take your origin story photo"
  accessibilityHint="Opens camera to capture a photo representing where you are now"
  accessibilityRole="button"
>
  <Text>Take a photo</Text>
</TouchableOpacity>
```

**Rationale:** Accessibility is not optional. Without labels, VoiceOver users cannot complete onboarding, making the app unusable for blind users.

---

## HIGH PRIORITY ISSUES (Should Fix - Significant Risk)

### ⚠️ HIGH #1: Photo Quality Settings Not Specified for iOS API

**Location:** AC #10 (Photo Capture)

**Issue:**
- Says "Photo format: JPEG, 85% quality"
- Says "Photo dimensions: Max 1024x1024px (resized if larger)"
- But doesn't provide `expo-image-picker` configuration to achieve this

**Impact:** Developer will use default settings, resulting in:
- Unnecessarily large file sizes
- Longer upload times
- Higher storage costs

**Recommended Fix:**
Add to Technical Requirements #2:
```typescript
// Photo capture with quality settings
const launchCamera = async () => {
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],                    // Square crop
    quality: 0.85,                     // 85% JPEG quality
    exif: false,                       // Remove EXIF data (privacy)
    base64: false,                     // Don't return base64 (memory efficient)
  });

  if (!result.canceled) {
    const photoUri = result.assets[0].uri;
    // Resize if needed (ImagePicker doesn't have built-in resize)
    const resizedUri = await resizeImage(photoUri, 1024, 1024);
    setPhoto(resizedUri);
  }
};

// Helper function for resize (requires expo-image-manipulator)
import * as ImageManipulator from 'expo-image-manipulator';

const resizeImage = async (uri: string, maxWidth: number, maxHeight: number) => {
  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: maxWidth, height: maxHeight } }],
    { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
  );
  return manipResult.uri;
};
```

Add to Library Requirements:
```bash
npx expo install expo-image-manipulator  # For resizing
```

**Rationale:** Vague requirements lead to suboptimal implementations. Explicit code examples prevent mistakes.

---

### ⚠️ HIGH #2: Audio Recording Quality Preset Not Specified

**Location:** AC #11 (Voice Note Commitment)

**Issue:**
- Says "Audio format: AAC-LC, 64kbps, mono"
- But doesn't specify which `expo-av` preset achieves this

**Impact:** Developer might use wrong preset:
- `HIGH_QUALITY` = 192kbps stereo (too large)
- `LOW_QUALITY` = 32kbps mono (too compressed)

**Recommended Fix:**
Update Technical Requirements #3:
```typescript
import { Audio } from 'expo-av';

// Start recording with custom settings
const startRecording = async () => {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
  });

  // CUSTOM recording options for voice (not preset)
  const { recording } = await Audio.Recording.createAsync({
    isMeteringEnabled: true,  // For waveform visualization
    android: {
      extension: '.m4a',
      outputFormat: Audio.AndroidOutputFormat.MPEG_4,
      audioEncoder: Audio.AndroidAudioEncoder.AAC,
      sampleRate: 44100,
      numberOfChannels: 1,
      bitRate: 64000,
    },
    ios: {
      extension: '.m4a',
      outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
      audioQuality: Audio.IOSAudioQuality.MEDIUM,
      sampleRate: 44100,
      numberOfChannels: 1,
      bitRate: 64000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
    web: {
      mimeType: 'audio/webm',
      bitsPerSecond: 64000,
    }
  });

  setRecording(recording);
};
```

**Rationale:** Audio quality directly impacts user experience. Clear specifications prevent trial-and-error implementation.

---

### ⚠️ HIGH #3: Permissions Denied Deep Link Not Provided

**Location:** AC #15 (Permissions Handling)

**Issue:**
Says "Provide 'Open Settings' button in alert (iOS deep link)" but doesn't specify the link.

**Impact:** Developer will search documentation, might use wrong link.

**Recommended Fix:**
Update AC #15:
```typescript
import { Linking, Alert, Platform } from 'react-native';

const handlePermissionDenied = (type: 'camera' | 'microphone') => {
  Alert.alert(
    `${type === 'camera' ? 'Camera' : 'Microphone'} Access Required`,
    `Weave needs ${type} access to capture your origin story. You can enable this in Settings.`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Open Settings',
        onPress: () => {
          if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
          } else {
            Linking.openSettings();
          }
        },
      },
    ]
  );
};
```

**Rationale:** Incorrect deep link = broken UX. Provide exact implementation to avoid mistakes.

---

### ⚠️ HIGH #4: Confetti Library Expo Compatibility Not Verified

**Location:** Task 6, Subtask 6.2, Technical Requirements #6

**Issue:**
Suggests `react-native-confetti-cannon` but doesn't verify:
- Expo SDK 53 compatibility
- Whether it requires native code (breaks Expo Go)
- Alternative if incompatible

**Impact:** Developer installs library, build breaks, wastes time finding alternative.

**Recommended Fix:**
Update Technical Requirements #6:
```markdown
**6. Confetti Animation (Screen 3):**

**⚠️ COMPATIBILITY CHECK REQUIRED:**
Before installing, verify `react-native-confetti-cannon` is Expo-compatible:
- Check: https://reactnative.directory/
- Search: "react-native-confetti-cannon"
- Verify: "✓ Expo Go" badge present

**Option A: react-native-confetti-cannon (if Expo-compatible)**
```bash
npm install react-native-confetti-cannon
```

**Option B: Custom confetti with react-native-reanimated (RECOMMENDED for MVP)**
Use Animated.View to create simple confetti effect:
- 10-15 animated circles falling from top
- Random colors, sizes, positions
- 2-second duration
- No external dependency

**Option C: Lottie confetti animation**
```bash
npx expo install lottie-react-native
```
Use pre-made Lottie confetti animation from LottieFiles.

**Recommendation for MVP:** Option B (custom) - minimal code, no dependencies, guaranteed Expo compatibility.
```

**Rationale:** External libraries can break builds. Always verify compatibility and provide fallback options.

---

### ⚠️ HIGH #5: Weave Animation Source Unclear

**Location:** AC #20 (Weave Character Animation), Task 6, Subtask 6.1

**Issue:**
Says "Create or source Weave character animation" but provides no guidance on:
- Where to source animations
- How to create placeholder if not available
- Acceptance criteria for animation quality

**Impact:** Developer blocks waiting for design asset that might not exist.

**Recommended Fix:**
Update AC #20:
```markdown
**Weave Character Animation (AC #20)**
- [ ] Display Weave character visualization at center of screen
- [ ] Animation sequence:
  - Start: Blank canvas (empty circle)
  - Animate: Single line appears and weaves into simple pattern
  - End: Basic woven structure (level 1)
- [ ] Animation duration: 2-3 seconds
- [ ] Animation style: Smooth, purposeful

**IMPLEMENTATION OPTIONS:**

**Option 1: Placeholder SVG animation (RECOMMENDED for MVP)**
Create simple animated SVG:
- Start: Empty circle outline
- Animate: Draw diagonal line across circle (0% → 100%)
- End: Circle with single woven line

Use react-native-svg + react-native-reanimated:
```typescript
import Svg, { Circle, Path } from 'react-native-svg';
import Animated, { useAnimatedProps } from 'react-native-reanimated';

// Simple thread drawing animation
const AnimatedPath = Animated.createAnimatedComponent(Path);
// (implementation details)
```

**Option 2: Lottie animation (future enhancement)**
- Requires design team to create animation
- Use LottieFiles or commission custom animation
- Replace SVG placeholder when available

**DO NOT BLOCK on Lottie animation** - implement SVG placeholder first.
```

**Rationale:** Developer should never block on external dependencies. Always provide self-sufficient implementation path.

---

### ⚠️ HIGH #6: Waveform Visualization Library Not Specified

**Location:** AC #11, AC #13 (Preview Card)

**Issue:**
Mentions "waveform visualization" multiple times but never specifies:
- Which library to use
- How to generate waveform from audio
- Fallback if waveform fails

**Impact:** Developer wastes time researching waveform libraries, might choose wrong one.

**Recommended Fix:**
Update AC #13:
```markdown
**Audio Waveform Visualization (OPTIONAL - MVP SIMPLIFICATION)**

For MVP, use **simple progress bar** instead of true waveform:
- Progress bar fills as audio plays (0% → 100%)
- Display duration: "0:00 / 0:42"
- Tap to play/pause

**Rationale:** True waveform visualization requires:
- Audio file analysis (computationally expensive)
- Real-time audio metering during recording
- Complex visualization library
- Not critical for MVP UX

**If waveform required (post-MVP):**
```bash
npm install react-native-audio-waveform
```
Or use `expo-av` metering data during recording:
```typescript
const { metering } = await recording.getStatusAsync();
// Store metering values, render as bars
```

**Recommendation:** Ship with progress bar, add waveform in post-MVP polish pass.
```

**Rationale:** Waveforms are complex and non-critical. Simplify MVP scope to reduce implementation risk.

---

### ⚠️ HIGH #7: Android Back Button Behavior Not Specified

**Location:** AC #16, Dev Notes "Back Navigation"

**Issue:**
Story is iOS-first but mentions "Screen 3 cannot go back". Doesn't specify:
- How to handle Android hardware back button
- Whether to prevent back navigation or allow it
- What happens to captured data if user goes back

**Impact:** Undefined behavior on Android platform.

**Recommended Fix:**
Add to Task 7 (Edge Cases & Error Handling):
```markdown
**Subtask 7.6: Handle Android back button behavior**
- [ ] Install back handler: `npm install @react-navigation/native` (if not already)
- [ ] Prevent hardware back on Screen 3 (commitment is final)
- [ ] Allow hardware back on Screen 1 and 2 (with confirmation)

```typescript
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

useFocusEffect(
  useCallback(() => {
    const onBackPress = () => {
      if (currentStep === 3) {
        // Screen 3: Cannot go back (commitment is final)
        return true; // Prevent back
      } else if (currentStep === 2 && (photo || audioUri)) {
        // Screen 2: Confirm before going back if data captured
        Alert.alert(
          'Discard origin story?',
          'Your photo and voice recording will be lost.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Discard', style: 'destructive', onPress: () => setCurrentStep(1) }
          ]
        );
        return true; // Prevent default back
      }
      return false; // Allow back
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, [currentStep, photo, audioUri])
);
```
```

**Rationale:** Android hardware back button is common user behavior. Must define behavior to prevent confusion.

---

### ⚠️ HIGH #8: File Integrity Validation Missing

**Location:** AC #14, AC #16

**Issue:**
Says "Continue button disabled until both captured" but doesn't validate:
- File actually exists at URI
- File size > 0 (not corrupted)
- File format is correct (JPEG/AAC)

**Impact:** User could capture corrupt files, Continue button enables, upload fails later.

**Recommended Fix:**
Update AC #14:
```markdown
**Validation (AC #14)**
- [ ] BOTH photo and voice are REQUIRED
- [ ] Continue button disabled until both captured AND validated
- [ ] Validation checks:
  1. Photo URI exists and file size > 0
  2. Audio URI exists and file size > 0
  3. Audio duration >= 1 second (not empty recording)
- [ ] Visual indicator: Gray disabled state until validation passes
- [ ] No error messages (implicit requirement through disabled button)
```

Add code example:
```typescript
const validateCapturedData = async () => {
  try {
    // Check photo
    const photoInfo = await FileSystem.getInfoAsync(photo);
    if (!photoInfo.exists || photoInfo.size === 0) {
      return false;
    }

    // Check audio
    const audioInfo = await FileSystem.getInfoAsync(audioUri);
    if (!audioInfo.exists || audioInfo.size === 0) {
      return false;
    }

    // Check audio duration
    if (audioDuration < 1) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('[ORIGIN_STORY] Validation error:', error);
    return false;
  }
};

const isValid = await validateCapturedData();
```

**Rationale:** File URIs can become invalid (deleted, moved). Validate before allowing user to proceed.

---

## MEDIUM PRIORITY ISSUES (Nice to Fix - Quality Improvements)

### ⚠️ MEDIUM #1: Terminology Inconsistency (Origin Story vs Bind)

**Location:** Throughout document, especially Screen 2

**Issue:**
Document uses both "origin story" and "Bind" but doesn't clearly explain relationship.

**Fix:** Add clarification in Dev Notes:
```markdown
**Terminology Clarification:**
- **Origin Story** = Narrative artifact (photo + voice + context)
- **First Bind** = Symbolic commitment action (completing this origin story)
- **Relationship:** Creating the origin story IS the first Bind

This distinction matters for:
- Database: `origin_stories` table + `bind_instances` table (separate records)
- UX: "Complete Bind" CTA reinforces that this is an action, not just capturing data
- Metrics: Track "first bind completion" as key onboarding milestone
```

---

### ⚠️ MEDIUM #2: Animation Loading State Missing

**Location:** AC #20 (Weave Character Animation)

**Issue:**
Lottie animations might not load instantly on slow devices or poor network.

**Fix:** Add loading state requirement:
```markdown
- [ ] Show placeholder while animation loads (spinning thread icon or blank circle)
- [ ] Fallback: If animation fails to load after 3 seconds, show static Weave icon
```

---

### ⚠️ MEDIUM #3: Dynamic Content Generation Performance Unclear

**Location:** AC #2, AC #6

**Issue:**
Says "<100ms" but no guidance on how to achieve this.

**Fix:** Add implementation note:
```markdown
**Performance Optimization (AC #2):**
Pre-compute narrative text on Screen 1 mount (useEffect):
- Load painpoints and traits from AsyncStorage
- Generate narrative strings immediately
- Cache in state
- Result: Screen 1 renders in <100ms (no computation during render)
```

---

### ⚠️ MEDIUM #4: Audio Playback During Recording Undefined

**Location:** AC #11

**Issue:**
Doesn't specify what happens if user tries to play audio while recording.

**Fix:** Add to AC #11:
```markdown
- [ ] Playback button disabled during recording (grayed out)
- [ ] If user taps disabled button: Show toast "Finish recording first"
```

---

### ⚠️ MEDIUM #5: Photo Retake UX Flow Missing

**Location:** AC #10

**Issue:**
Says "Tap thumbnail to retake" but doesn't specify if preview shows full-screen first.

**Fix:** Add UX flow:
```markdown
- [ ] Tap thumbnail → Show full-screen preview with:
  - Full-size photo
  - "Retake" button (bottom left)
  - "Keep" button (bottom right)
- [ ] Tap "Retake" → Launch camera again
- [ ] Tap "Keep" → Return to Screen 2 with thumbnail
```

---

### ⚠️ MEDIUM #6: Recording Pulse Animation Not Specified

**Location:** AC #11

**Issue:**
Says "red recording indicator pulsing" but no animation spec.

**Fix:** Add animation details:
```markdown
- [ ] Pulse animation: Red circle fades 100% → 60% opacity
- [ ] Duration: 1 second per pulse (smooth easing)
- [ ] Color: #FF0000 (bright red) to #CC0000 (darker red)
```

---

### ⚠️ MEDIUM #7: Preview Card Tap Behavior Clarification

**Location:** AC #13

**Issue:**
Says "Tap waveform or play button" - two tap targets might confuse developer.

**Fix:** Clarify:
```markdown
- [ ] Play/pause behavior: Tap anywhere on audio section triggers play/pause
  - Tap waveform/progress bar: Play/pause
  - Tap play button icon: Play/pause
  - Tap duration text: Play/pause
  - (All trigger same behavior for easier interaction)
```

---

### ⚠️ MEDIUM #8: Backend Upload Retry Logic Not Mentioned

**Location:** AC #25 (deferred backend operations)

**Issue:**
When Story 0-4 implements upload, no guidance on error handling.

**Fix:** Add TODO note:
```markdown
**TODO (Story 0-4): Upload Error Handling**
- Retry failed uploads up to 3 times (exponential backoff)
- If all retries fail: Store data locally, show "Upload pending" banner
- Sync on next app open when connection restored
- Do NOT block user from continuing if upload fails
```

---

## LOW PRIORITY ISSUES (Optional - Minor Enhancements)

### ℹ️ LOW #1: Animation Skip Behavior Conflict

**Location:** AC #24 vs AC #27

**Issue:** AC #24 says "Continue enabled immediately", AC #27 says "user can skip animations by pressing Continue" (implies button appears after animation).

**Fix:** Clarify in AC #27:
```markdown
- [ ] Continue button visible and enabled immediately (does not wait for animations)
- [ ] If user presses Continue before animation completes: Skip remaining animation, navigate immediately
- [ ] If user waits: Animation completes, then user presses Continue
```

---

### ℹ️ LOW #2: Reduced Motion Code Example Missing

**Location:** AC #7, AC #27

**Issue:** Mentioned twice but no code example.

**Fix:** Add code snippet:
```typescript
import { AccessibilityInfo } from 'react-native';

const [reducedMotion, setReducedMotion] = useState(false);

useEffect(() => {
  AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
}, []);

// Skip animations if reduced motion enabled
if (!reducedMotion) {
  // Play animations
}
```

---

### ℹ️ LOW #3: Photo File Size Limit Missing

**Location:** AC #10

**Issue:**
Says max 1024x1024px but no file size limit.

**Fix:** Add requirement:
```markdown
- [ ] Max file size: 5MB (compress if larger)
```

---

### ℹ️ LOW #4: Audio Codec Fallback Not Specified

**Location:** AC #11

**Issue:**
Specifies AAC-LC but no fallback if unavailable.

**Fix:** Add fallback:
```markdown
- [ ] Preferred codec: AAC-LC (if available)
- [ ] Fallback: Use device default codec if AAC-LC unavailable
```

---

### ℹ️ LOW #5: Haptic Feedback Intensity Not Specified

**Location:** AC #22

**Issue:**
Says "haptic feedback (success pattern)" but doesn't specify which one.

**Fix:** Be specific:
```typescript
import * as Haptics from 'expo-haptics';

// On Screen 3 animation completion
await Haptics.notificationAsync(
  Haptics.NotificationFeedbackType.Success
);
```

---

### ℹ️ LOW #6: Date Format in Voice Script Missing

**Location:** Epic Screen 2 body (not in current Story file)

**Issue:**
Epic suggests "Today is [date]" but Story file removed this. If added back, needs format spec.

**Fix:** If including date in prompt:
```markdown
- Suggested format: "Today is December 20, 2025" (localized long date format)
```

---

### ℹ️ LOW #7: Progress Indicator for 3-Screen Flow Missing

**Location:** General UX

**Issue:**
Story 1.6 had pagination dots for 2 personas. Story 1.7 has 3 screens but no progress indicator.

**Fix:** Add optional progress indicator:
```markdown
**Optional Enhancement (AC #27a):**
- [ ] Display progress indicator at top: "Step 1 of 3", "Step 2 of 3", "Step 3 of 3"
- [ ] Or pagination dots: ○ ○ ○ → ● ○ ○ → ○ ● ○ → ○ ○ ●
```

---

### ℹ️ LOW #8: Camera Facing Direction Default Not Specified

**Location:** AC #10

**Issue:**
Says "Front camera (selfie) or back camera (environment)" but no default.

**Fix:** Add default:
```markdown
- [ ] Default camera: Front-facing (selfie) for origin story photo
- [ ] Allow user to flip to back camera if desired
```

---

## TOKEN EFFICIENCY & LLM OPTIMIZATION ISSUES

### 🤖 VERBOSE #1: Redundant Code Pattern Sections

**Location:** Dev Notes "Previous Story Intelligence" and "Code Patterns from Story 1.6"

**Issue:**
Same information duplicated in two sections:
- Dev Notes line 474-516: "Previous Story Intelligence"
- Dev Notes line 490-516: "Code Patterns from Story 1.6"

**Fix:** Consolidate into single section:
```markdown
### Story 1.6 Learnings & Code Patterns

**Architecture Pattern (MUST FOLLOW):**
- ✅ Single screen with step state machine (currentStep: 1 | 2 | 3)
- ✅ Inline styles (NOT NativeWind className)
- ✅ SafeAreaView pattern with flex: 1, explicit backgroundColor
- ✅ Backend deferred with TODO comments

**Code Examples:**
(Keep examples from line 490-516, remove duplication)
```

**Impact:** Saves ~400 tokens, makes document more scannable.

---

### 🤖 VERBOSE #2: Excessive Technical Options

**Location:** Technical Requirements sections 2, 3, 5

**Issue:**
Provides "Option A" and "Option B" but always recommends Option A. Developer doesn't need rationale for rejected options.

**Fix:** Remove Option B sections entirely:
```markdown
# Current (verbose):
**Option A: expo-camera (RECOMMENDED)**
(code example)

**Option B: expo-image-picker (Alternative)**
(code example)

**Recommendation:** Option A

# Improved (concise):
**Photo Capture: expo-image-picker**
(single code example - the recommended one)
```

**Impact:** Saves ~800 tokens, faster to read.

---

### 🤖 VERBOSE #3: Duplicate Database Schema

**Location:** AC #25 and Dev Notes "Database Schema (DEFERRED)"

**Issue:**
Same SQL schema appears twice with minor differences.

**Fix:** Keep only in Dev Notes, reference from AC #25:
```markdown
AC #25:
- [ ] DEFERRED: Backend data operations (see Dev Notes "Database Schema" for complete SQL)
```

**Impact:** Saves ~200 tokens.

---

### 🤖 VERBOSE #4: Example Content Mapping Too Long

**Location:** AC #3

**Issue:**
Provides 4 painpoint mappings + 3 trait examples. Developer can infer pattern from 1-2 examples.

**Fix:** Shorten to 2 examples:
```markdown
**Example Content Mapping (AC #3)**
```typescript
// Pattern: Painpoint → Struggle statement
PAINPOINT_STRUGGLES = {
  clarity: "You've been feeling scattered — like there's too much to do, but no clear direction.",
  action: "You know what you want, but taking consistent action feels impossible.",
  // (2 more - see src/constants/originStoryContent.ts)
};

// Pattern: Traits → Aspiration statement
identityTraits: ["Disciplined", "Confident", "Intentional"]
→ "You want to become someone Disciplined, Confident, and Intentional — someone who acts with purpose."
```
```

**Impact:** Saves ~150 tokens.

---

### 🤖 UNCLEAR #1: "DEFERRED" Mentioned 20+ Times

**Location:** Throughout document

**Issue:**
Word "DEFERRED" appears in 20+ locations, creating impression that entire story is deferred.

**Fix:** Add single prominent callout at top:
```markdown
## 🎯 IMPLEMENTATION SCOPE

**Focus:** Front-end UX prototype (photo + voice capture, animations, navigation)
**Backend:** All database writes and file uploads deferred to Story 0-4
**Approach:** Store data in AsyncStorage, add TODO comments for backend integration

(Remove "DEFERRED" from most AC items, only keep in AC #25)
```

**Impact:** Clearer scope, less repetition.

---

### 🤖 UNCLEAR #2: Testing Priority Not Marked

**Location:** Task 8 (Testing)

**Issue:**
11 testing subtasks but no indication which are critical vs nice-to-have.

**Fix:** Add priority markers:
```markdown
### Task 8: Testing

**🚨 CRITICAL (Must Test):**
- [ ] Photo capture works on iOS device
- [ ] Audio recording works on iOS device
- [ ] Permissions flow works (camera, microphone)
- [ ] Navigation to Story 1.8 works

**⚠️ IMPORTANT (Should Test):**
- [ ] Animations run at 60fps
- [ ] VoiceOver accessibility

**ℹ️ OPTIONAL (Nice to Test):**
- [ ] Reduced motion respect
- [ ] Different painpoint/trait combinations
```

**Impact:** Developer knows where to focus testing effort.

---

### 🤖 STRUCTURE #1: Acceptance Criteria Too Granular

**Location:** 27 acceptance criteria split across 3 screens

**Issue:**
Developer has to read all 27 items linearly to understand flow.

**Fix:** Add high-level summary at top:
```markdown
## Acceptance Criteria Summary

**Screen 1 (5 seconds):** Display dynamic narrative, CTA to continue
**Screen 2 (60 seconds):** Capture photo + 60s voice, preview, CTA when both complete
**Screen 3 (5 seconds):** Celebrate with animation + confetti, CTA to Story 1.8

**Detailed Criteria Below (27 items)**
```

**Impact:** Faster comprehension of story scope.

---

### 🤖 STRUCTURE #2: Too Many Subtasks (56 total)

**Location:** Tasks section

**Issue:**
8 tasks with 56 subtasks is overwhelming. Many subtasks are obvious steps.

**Fix:** Consolidate to ~25 essential subtasks:
```markdown
### Task 1: Screen 1 - Narrative Validation (5 subtasks → 3)
- [x] Create component with dynamic content generation
- [x] Load user data from AsyncStorage (painpoints, traits)
- [x] Implement Continue CTA, navigate to Screen 2

### Task 2: Screen 2 - Capture (10 subtasks → 6)
(group related subtasks)
```

**Impact:** More actionable, less noise.

---

## RECOMMENDATIONS FOR STORY IMPROVEMENT

### Must Fix Before dev-story (Critical)
1. ✅ Add explicit cross-story data persistence pattern (AsyncStorage)
2. ✅ Fix CTA text to "Complete Bind" (Epic compliance)
3. ✅ Add bind_instance database schema requirement
4. ✅ Add voice recording timeout error handling
5. ✅ Add temporary file persistence for app backgrounding
6. ✅ Add NPM dependency verification steps (follow CLAUDE.md guardrails)
7. ✅ Clarify navigation implementation (state machine, not router.push)
8. ✅ Add accessibility labels for all interactive elements

### Should Fix Before dev-story (High Priority)
1. ✅ Add photo quality settings code example
2. ✅ Add audio recording preset code example
3. ✅ Add permissions deep link implementation
4. ✅ Verify confetti library Expo compatibility (or provide fallback)
5. ✅ Add Weave animation placeholder implementation path
6. ✅ Simplify waveform to progress bar for MVP
7. ✅ Add Android back button handling
8. ✅ Add file integrity validation before Continue enabled

### Nice to Fix (Medium/Low Priority)
1. Clarify origin story vs bind terminology
2. Add animation loading states
3. Consolidate redundant sections (token efficiency)
4. Remove rejected technical options (verbose)
5. Add testing priority markers
6. Reduce "DEFERRED" repetition

---

## OVERALL ASSESSMENT

**Story Quality:** 7/10 (Good structure, but critical gaps)

**Strengths:**
- ✅ Comprehensive acceptance criteria with measurable outcomes
- ✅ Follows Story 1.6 patterns (single-screen state machine, inline styles)
- ✅ Clear separation of front-end vs backend scope
- ✅ Detailed technical requirements with code examples
- ✅ Good task breakdown with subtasks

**Weaknesses:**
- ❌ Missing cross-story data flow pattern (BLOCKER)
- ❌ CTA text inconsistency with Epic (UX regression)
- ❌ Missing database schema completeness (bind_instance)
- ❌ Insufficient error handling for recording/capture
- ❌ No file persistence for app backgrounding (data loss risk)
- ❌ Verbose with redundant sections (token inefficiency)

**Recommendation:** 🔴 **FIX CRITICAL ISSUES BEFORE dev-story**

This story has good bones but contains 8 critical gaps that could cause:
- Implementation blockers (data flow)
- UX regressions (terminology)
- Data loss (backgrounding)
- Build failures (npm conflicts)
- Accessibility failures (missing labels)

**Estimated Fix Time:** 2-3 hours to address all critical issues

**Reviewer Confidence:** 95% (High confidence in findings - thorough cross-referencing with Epic, Story 1.6, Architecture, and CLAUDE.md)

---

**Validation Completed:** 2025-12-20
**Next Action:** Review findings with user, apply selected improvements
