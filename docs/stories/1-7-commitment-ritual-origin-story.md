# Story 1.7: Commitment Ritual & Origin Story

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **new user who has just completed identity bootup (name, personality, traits)**,
I want to **create my origin story through a meaningful commitment ritual**,
So that **I establish an emotional anchor and immutable record of my transformation journey before defining goals**.

## Acceptance Criteria

### Screen 1: Narrative Validation (AC #1-#7)

**Display & Content (AC #1)**
- [ ] Display title: "This is where your story shifts."
- [ ] Display dynamic body text that:
  - Injects current struggles (from Story 1.2 emotional state selection)
  - Injects aspirational traits (from Story 1.6 identity traits)
  - Explains how Weave bridges the gap between current state and future self
- [ ] Typography: Title semi-bold (24-28px), body text medium (16-18px) at 90% opacity
- [ ] Text alignment: Center for title, left-aligned for body
- [ ] Background: Subtle animated thread-lines pattern

**Dynamic Content Generation (AC #2)**
- [ ] Load user's selected painpoints from Story 1.2 via AsyncStorage
- [ ] Load user's identity traits from Story 1.6 via AsyncStorage
- [ ] Load user's preferred name from Story 1.6 via AsyncStorage
- [ ] Data retrieval pattern:
  ```typescript
  import AsyncStorage from '@react-native-async-storage/async-storage';

  const onboardingData = JSON.parse(
    await AsyncStorage.getItem('onboarding_data') || '{}'
  );

  // Expected data structure from Stories 1.2 & 1.6:
  // {
  //   preferred_name: string,
  //   selected_painpoints: string[], // e.g., ['clarity', 'consistency']
  //   identity_traits: string[]      // e.g., ['Disciplined', 'Focused', 'Intentional']
  // }
  ```
- [ ] Generate narrative text dynamically based on:
  - Current struggle: Map painpoint to relatable struggle statement
  - Dream traits: List 3-5 selected traits as aspirational future
  - Bridge statement: How Weave helps transform struggle → aspiration
- [ ] Content completion <100ms (all local data, no API calls)

**Example Content Mapping (AC #3)**
```typescript
// Painpoint: Clarity
Struggle: "You've been feeling scattered — like there's too much to do, but no clear direction."

// Painpoint: Action
Struggle: "You know what you want, but taking consistent action feels impossible."

// Painpoint: Consistency
Struggle: "You start strong, but momentum fades. You're tired of the cycle."

// Painpoint: Alignment
Struggle: "Something feels off. You're busy, but not building the life you actually want."

// Dream Traits: ["Disciplined", "Confident", "Intentional"]
Aspiration: "You want to become someone Disciplined, Confident, and Intentional — someone who acts with purpose."

// Bridge Statement
"Weave helps you turn that vision into reality, one small bind at a time. This is where you begin."
```

**CTA & Navigation (AC #4)**
- [ ] Display CTA: "Take the first step →" (full-width button, fixed at bottom)
- [ ] Button styling: Primary color, min 48px height, rounded corners
- [ ] Smooth transition animation on press
- [ ] On continue: Update currentStep state to 2 (do NOT use router.push - stay within single screen)

**Event Tracking (AC #5)**
- [ ] Track `origin_story_intro_viewed` event when screen loads
- [ ] Include payload: `{ user_id, selected_painpoints, identity_traits, timestamp }`
- [ ] DEFERRED: Analytics integration (Story 0-4 backend)

**Performance (AC #6)**
- [ ] Content generation <100ms (deterministic, no AI calls)
- [ ] Screen load time <500ms
- [ ] Smooth animations at 60fps

**Accessibility (AC #7)**
- [ ] VoiceOver reads dynamic content correctly
- [ ] Minimum touch target 48px for CTA button
- [ ] Respect reduced motion settings

**Accessibility Labels (AC #7a - CRITICAL for WCAG Compliance)**
- [ ] Camera button:
  - accessibilityLabel: "Take your origin story photo"
  - accessibilityHint: "Opens camera to capture a photo representing where you are now"
  - accessibilityRole: "button"
- [ ] Microphone button:
  - accessibilityLabel: "Record your commitment"
  - accessibilityHint: "Starts recording. Speak for up to 60 seconds about why this matters to you"
  - accessibilityRole: "button"
- [ ] Retake photo button:
  - accessibilityLabel: "Retake photo"
  - accessibilityHint: "Discards current photo and opens camera again"
  - accessibilityRole: "button"
- [ ] Play audio button:
  - accessibilityLabel: "Play your recorded commitment"
  - accessibilityHint: "Plays back your voice recording. Duration: {X} seconds"
  - accessibilityRole: "button"
- [ ] Preview card:
  - accessibilityLabel: "Origin story preview"
  - accessibilityHint: "Shows your photo and voice commitment. Tap elements to review or retake"
- [ ] Implementation example:
  ```typescript
  <TouchableOpacity
    onPress={launchCamera}
    accessibilityLabel="Take your origin story photo"
    accessibilityHint="Opens camera to capture a photo representing where you are now"
    accessibilityRole="button"
  >
    <Text>Take a photo</Text>
  </TouchableOpacity>
  ```

---

### Screen 2: Origin Story Capture (AC #8-#18)

**Header & Instructions (AC #8)**
- [ ] Display title: "Let's make this moment official."
- [ ] Display subheading: "Capture where you are now — and commit to where you're going."
- [ ] Typography: Title semi-bold (24-28px), subheading medium (16px) at 85% opacity
- [ ] Vertical spacing: Title → Subheading (spacing[3] = 12px)

**From/To Summary Display (AC #9)**
- [ ] Display summary card at top of screen:
  - From: User's current struggle (1 sentence from Screen 1)
  - To: User's dream traits (comma-separated list from Story 1.6)
- [ ] Card styling: Light background, subtle border, 16px padding
- [ ] Typography: "From" and "To" labels bold, content regular

**Photo Capture (Required) (AC #10)**
- [ ] Display "Take a photo" button with camera icon
- [ ] On press: Launch iOS camera (not photo library)
- [ ] Capture options: Front camera (selfie) or back camera (environment)
- [ ] After capture: Display thumbnail preview (120x120px)
- [ ] Allow retake: Tap thumbnail to retake photo
- [ ] Photo dimensions: Max 1024x1024px (resized if larger)
- [ ] Photo format: JPEG, 85% quality
- [ ] Photo storage: Temporary local storage until submission

**Voice Note Commitment (Required) (AC #11)**
- [ ] Display "Record your commitment" button with microphone icon
- [ ] On press: Start audio recording (max 60 seconds)
- [ ] Recording UI:
  - Red recording indicator pulsing
  - Timer display showing remaining time (60s countdown, e.g., "0:42 left")
  - "Stop" button to end recording
  - Auto-stop at 60 seconds
  - Force-stop safety timeout at 65 seconds (prevents hang)
- [ ] After recording: Display waveform preview + playback controls
- [ ] Allow re-record: "Re-record" button to replace audio
- [ ] Audio format: AAC-LC, 64kbps, mono
- [ ] Audio storage: Temporary local storage until submission
- [ ] Error handling:
  - If recording fails to start: Alert "Microphone unavailable. Please check settings."
  - If recording fails to stop: Force stop after 65 seconds (5s grace period)
  - If storage full: Alert "Not enough storage. Free up space and try again."
  - If recording API error: Alert "Recording failed. Please try again."
  - On any error: Clear recording state, allow retry
- [ ] Safety implementation:
  ```typescript
  const MAX_RECORDING_DURATION = 60000; // 60 seconds
  const FORCE_STOP_DURATION = 65000;    // 65 seconds (safety margin)

  const recordingTimeout = setTimeout(() => {
    if (recording) {
      console.warn('[ORIGIN_STORY] Force stopping recording after 65s');
      stopRecording();
    }
  }, FORCE_STOP_DURATION);
  ```

**Prompt Guidance (AC #12)**
- [ ] Display suggested prompts for voice commitment:
  - "Why does this matter to you?"
  - "What will be different in 10 days?"
  - "What are you leaving behind?"
- [ ] Prompts displayed as chips above record button
- [ ] Tap chip to highlight (visual only, not required to use)

**Preview Card (AC #13)**
- [ ] Display preview card after BOTH photo and voice captured:
  - Photo thumbnail (120x120px, rounded corners)
  - From/To summary text (2-3 lines)
  - Voice waveform visualization + playback button
  - Duration display (e.g., "0:42")
- [ ] Card styling: Glass-panel aesthetic, soft shadow, 24px rounded corners
- [ ] Play/pause audio by tapping waveform or play button

**Validation (AC #14)**
- [ ] BOTH photo and voice are REQUIRED
- [ ] Continue button disabled until both captured
- [ ] Visual indicator: Gray disabled state until both complete
- [ ] No error messages (implicit requirement through disabled button)

**Permissions Handling (AC #15)**
- [ ] Request camera permission on first photo capture attempt
- [ ] Request microphone permission on first voice recording attempt
- [ ] If permission denied: Show alert with explanation and link to Settings
- [ ] Error message: "Weave needs camera/microphone access to capture your origin story. You can enable this in Settings."
- [ ] Provide "Open Settings" button in alert (iOS deep link)

**CTA & Navigation (AC #16)**
- [ ] Display "Complete Bind" button at bottom (full-width, primary color)
- [ ] Button disabled state: Gray, opacity 0.5
- [ ] Button enabled state: Primary color, full opacity
- [ ] Button text reinforces terminology: This is the user's FIRST BIND (symbolic commitment action)
- [ ] On press: Mark first bind as complete, process and submit origin story data
- [ ] Update currentStep state to 3 (do NOT use router.push - stay within single screen)

**Data Storage (AC #17)**
- [ ] Store captured data in TWO locations for app backgrounding survival:
  1. **Component state** (for immediate UI updates):
     - photo: File URI (temporary local path)
     - audioUri: File URI (temporary local path)
     - audioDuration: number (seconds)
     - fromText: string (struggle summary)
     - toText: string (dream traits summary)
  2. **AsyncStorage** (for persistence across app lifecycle):
     - Key: 'origin_story_draft'
     - Save immediately after photo capture
     - Save immediately after audio recording complete
     - Clear on Screen 3 completion (data uploaded)
- [ ] Persistence strategy:
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

  // Save audio immediately after recording
  const handleAudioComplete = async (audioUri: string, duration: number) => {
    setAudioUri(audioUri);
    setAudioDuration(duration);
    const draft = JSON.parse(await AsyncStorage.getItem('origin_story_draft') || '{}');
    await AsyncStorage.setItem('origin_story_draft', JSON.stringify({
      ...draft,
      audio: audioUri,
      duration,
      timestamp: Date.now()
    }));
  };

  // Restore on mount if incomplete (app backgrounding recovery)
  useEffect(() => {
    const restoreDraft = async () => {
      const draft = await AsyncStorage.getItem('origin_story_draft');
      if (draft) {
        const { photo, audio, duration } = JSON.parse(draft);
        if (photo) setPhoto(photo);
        if (audio) {
          setAudioUri(audio);
          setAudioDuration(duration);
        }
      }
    };
    restoreDraft();
  }, []);

  // Clear on completion (Screen 3)
  const handleCompletion = async () => {
    await AsyncStorage.removeItem('origin_story_draft');
    // Navigate to Story 1.8
  };
  ```
- [ ] DEFERRED: Upload to Supabase Storage + create `origin_stories` record (Story 0-4)

**Event Tracking (AC #18)**
- [ ] Track `origin_story_photo_captured` when photo taken
- [ ] Track `origin_story_voice_recorded` when audio recorded
- [ ] Track `origin_story_preview_played` when user plays back audio
- [ ] DEFERRED: Analytics integration (Story 0-4 backend)

---

### Screen 3: Completion & Reinforcement (AC #19-#27)

**Title & Messaging (AC #19)**
- [ ] Display title: "This is your beginning."
- [ ] Display subheading: "You just took the first step toward your future self."
- [ ] Typography: Title semi-bold (28-32px), subheading medium (16-18px) at 85% opacity
- [ ] Text alignment: Center

**Weave Character Animation (AC #20)**
- [ ] Display Weave character visualization at center of screen
- [ ] Animation sequence:
  - Start: Blank canvas (empty state)
  - Animate: Single thread appears and weaves into simple form
  - End: First weave pattern established (level 1 complexity)
- [ ] Animation duration: 2-3 seconds
- [ ] Animation style: Smooth, purposeful, delightful
- [ ] Use mathematical curve visualization (simple thread → basic weave)

**Level Progress Bar (AC #21)**
- [ ] Display level progress bar below Weave animation
- [ ] Bar animates from 0 → 1 (empty → first level)
- [ ] Progress bar styling: Gradient fill, rounded caps
- [ ] Animation synchronized with Weave character animation
- [ ] Display "Level 1" text label when animation completes

**Celebration Effects (AC #22)**
- [ ] Confetti burst animation when screen loads
- [ ] Confetti style: Classy, not overwhelming, 1-2 seconds duration
- [ ] Soft glow effect around Weave character during animation
- [ ] Haptic feedback on iOS (success pattern) when animation completes

**Origin Story Summary (AC #23)**
- [ ] Display summary card below animations:
  - Small photo thumbnail (80x80px, circular)
  - From/To text (2-3 lines, condensed)
  - Audio duration indicator (e.g., "0:42 commitment recorded")
- [ ] Card styling: Subtle background, minimal border
- [ ] Card purpose: Reinforce accomplishment

**CTA & Navigation (AC #24)**
- [ ] Display "Continue to set your first goal →" button at bottom
- [ ] Button enabled immediately (no waiting for animations)
- [ ] Button styling: Primary color, full-width, min 48px height
- [ ] On continue: Navigate to Story 1.8 using router.push('/(onboarding)/first-needle')
  - Note: This IS a router.push because we're navigating to a DIFFERENT story (1.8)
  - Within Story 1.7, use setCurrentStep; between stories, use router.push

**Backend Data Operations (AC #25)**
- [ ] DEFERRED to Story 0-4: Write to backend on Screen 3 load:
  1. **Upload assets to Supabase Storage:**
     - Photo: `/origin_stories/{user_id}/photo.jpg`
     - Audio: `/origin_stories/{user_id}/commitment.aac`

  2. **Create `origin_stories` record:**
    ```sql
    INSERT INTO origin_stories (
      user_id,
      photo_url,
      audio_url,
      audio_duration_seconds,
      from_text,
      to_text,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, NOW());
    ```

  3. **Create first `bind_instance` record (CRITICAL - tracks first bind completion):**
    ```sql
    -- This origin story capture IS the user's first Bind
    INSERT INTO bind_instances (
      user_id,
      subtask_template_id,  -- Special template: "origin_story_commitment"
      scheduled_for_date,   -- Today's date
      completed_at,         -- NOW() - completed immediately
      is_origin_bind        -- TRUE flag to mark as origin bind
    ) VALUES (?, ?, CURRENT_DATE, NOW(), TRUE);
    ```

  4. **Update user profile with first bind completion:**
    ```sql
    UPDATE user_profiles
    SET
      first_bind_completed_at = NOW(),
      user_level = 1
    WHERE auth_user_id = ?;
    ```

- [ ] **First Bind Semantics Note:**
  This origin story capture is the user's FIRST BIND - a symbolic commitment action.
  Story 0-4 backend integration MUST create both `origin_stories` AND `bind_instance` records
  with `is_origin_bind = TRUE` flag for progress tracking and gamification systems.
  - Update `user_profiles`:
    ```sql
    UPDATE user_profiles
    SET first_bind_completed_at = NOW(), user_level = 1
    WHERE auth_user_id = ?;
    ```
- [ ] For now: Store all data in local state, add TODO comments for backend integration

**Event Tracking (AC #26)**
- [ ] Track `origin_story_created` when Screen 3 loads
- [ ] Track `origin_bind_completed` when user continues to Story 1.8
- [ ] Include payload: `{ user_id, photo_uploaded, audio_uploaded, level: 1, timestamp }`
- [ ] DEFERRED: Analytics integration (Story 0-4 backend)

**Performance & UX (AC #27)**
- [ ] Animations run at 60fps (no lag or jank)
- [ ] Total screen time: 3-5 seconds (user can skip animations by pressing Continue)
- [ ] Respect reduced motion accessibility settings (skip animations if enabled)

---

## Tasks / Subtasks

### Task 1: Screen 1 - Narrative Validation (AC: #1-#7)

- [ ] **Subtask 1.1**: Create NarrativeValidationScreen component
  - File: `app/(onboarding)/origin-story.tsx` with Screen 1
  - Decision: Single file with 3 screens (following Story 1.6 pattern)
- [ ] **Subtask 1.2**: Load user data from previous stories
  - Load selected_painpoints from Story 1.2 (localStorage or context)
  - Load identity_traits from Story 1.6 (localStorage or context)
- [ ] **Subtask 1.3**: Implement dynamic content generation
  - Create content mapping functions (painpoint → struggle text)
  - Create aspiration text from identity_traits array
  - Create bridge statement text
- [ ] **Subtask 1.4**: Implement title and body text rendering
  - Title: "This is where your story shifts."
  - Body: Dynamic 3-paragraph structure (struggle → aspiration → bridge)
- [ ] **Subtask 1.5**: Add animated thread-lines background (optional)
  - Subtle SVG or Lottie animation
  - Low opacity, non-distracting
- [ ] **Subtask 1.6**: Implement Continue CTA button
  - Full-width, primary color, fixed bottom
  - Navigate to Screen 2 on press
- [ ] **Subtask 1.7**: Add event tracking (TODO comments)
  - `origin_story_intro_viewed` event
  - DEFERRED: Analytics integration

### Task 2: Screen 2 - Origin Story Capture (AC: #8-#18)

- [ ] **Subtask 2.1**: Create OriginStoryCaptureScreen component
- [ ] **Subtask 2.2**: Implement From/To summary card at top
  - Display fromText (struggle) and toText (dream traits)
  - Light card styling with border
- [ ] **Subtask 2.3**: Implement photo capture functionality
  - Install and configure `expo-camera` and `expo-image-picker`
  - "Take a photo" button with camera icon
  - Launch camera (not photo library)
  - Handle camera permissions request
  - Display thumbnail preview after capture
  - Allow retake (tap thumbnail to retake)
  - Store photo URI in component state
- [ ] **Subtask 2.4**: Implement voice recording functionality
  - Install and configure `expo-av` (Audio module)
  - "Record your commitment" button with microphone icon
  - Recording UI: Red pulse indicator, timer, Stop button
  - Max 60 seconds recording, auto-stop
  - Handle microphone permissions request
  - Display waveform preview + playback controls
  - Allow re-record
  - Store audio URI and duration in component state
- [ ] **Subtask 2.5**: Create preview card component
  - Display after BOTH photo and audio captured
  - Photo thumbnail (120x120px)
  - From/To summary text
  - Audio waveform + play button
  - Audio duration display
- [ ] **Subtask 2.6**: Implement audio playback controls
  - Play/pause button
  - Waveform visualization (optional, can use simple progress bar)
  - Update playback progress in real-time
- [ ] **Subtask 2.7**: Implement prompt guidance chips
  - Display 3 suggested prompts as chips
  - Tap to highlight (visual feedback only)
- [ ] **Subtask 2.8**: Implement validation logic
  - Continue button disabled until BOTH photo and audio captured
  - Gray disabled state, enabled state with primary color
- [ ] **Subtask 2.9**: Handle permissions denied scenarios
  - Alert with explanation + "Open Settings" button
  - iOS deep link to Settings app
- [ ] **Subtask 2.10**: Store captured data in component state
  - photo URI, audio URI, audio duration, fromText, toText
  - Navigate to Screen 3 on Continue

### Task 3: Screen 3 - Completion & Reinforcement (AC: #19-#27)

- [ ] **Subtask 3.1**: Create CompletionReinforcementScreen component
- [ ] **Subtask 3.2**: Implement title and subheading
  - "This is your beginning."
  - "You just took the first step toward your future self."
- [ ] **Subtask 3.3**: Create Weave character animation
  - Option A: Lottie animation (blank → thread → weave)
  - Option B: React Native Animated or Reanimated custom animation
  - Animation duration: 2-3 seconds
  - Mathematical curve visualization (simple → complex)
- [ ] **Subtask 3.4**: Implement level progress bar
  - Animate from 0 → 1
  - Synchronized with Weave animation
  - Display "Level 1" text when complete
- [ ] **Subtask 3.5**: Add celebration effects
  - Confetti burst animation (1-2 seconds)
  - Soft glow around Weave character
  - Haptic feedback on iOS (success pattern)
- [ ] **Subtask 3.6**: Display origin story summary card
  - Photo thumbnail (80x80px, circular)
  - From/To text condensed
  - Audio duration indicator
- [ ] **Subtask 3.7**: Implement Continue CTA
  - "Continue to set your first goal →"
  - Navigate to Story 1.8 on press
- [ ] **Subtask 3.8**: DEFERRED: Backend data operations (Story 0-4)
  - TODO: Upload photo to Supabase Storage
  - TODO: Upload audio to Supabase Storage
  - TODO: Create `origin_stories` record
  - TODO: Update `user_profiles.first_bind_completed_at` and `user_level`
  - For now: Add console.log for debugging

### Task 4: Data Integration & Flow Coordination (AC: #17, #25)

- [ ] **Subtask 4.1**: Implement multi-screen state management
  - Single screen file with step state machine (currentStep: 1 | 2 | 3)
  - Share data across all 3 screens via component state
- [ ] **Subtask 4.2**: Implement navigation between screens
  - Screen 1 → Screen 2: Pass selected_painpoints and identity_traits
  - Screen 2 → Screen 3: Pass photo, audio, fromText, toText
  - Screen 3 → Story 1.8: Pass origin story confirmation
- [ ] **Subtask 4.3**: Implement back navigation (optional)
  - Screen 2 → Screen 1: Preserve captured photo/audio in state
  - Screen 3 cannot go back (commitment is final)
- [ ] **Subtask 4.4**: DEFERRED: Backend integration (Story 0-4)
  - Database schema: `origin_stories` table
  - Supabase Storage buckets: `/origin_stories/{user_id}/`
  - API endpoint: `POST /api/origin-stories` (if needed)
  - For now: Store in local state, add TODO comments

### Task 5: Event Tracking (AC: #5, #18, #26)

- [ ] **Subtask 5.1**: Add TODO comments for all analytics events
  - `origin_story_intro_viewed`
  - `origin_story_photo_captured`
  - `origin_story_voice_recorded`
  - `origin_story_preview_played`
  - `origin_story_created`
  - `origin_bind_completed`
- [ ] **Subtask 5.2**: DEFERRED: Implement analytics tracking (Story 0-4 backend)

### Task 6: Animations & Delight (AC: #20, #21, #22)

- [ ] **Subtask 6.1**: Create or source Weave character animation
  - Option A: Commission Lottie animation (blank → thread → weave)
  - Option B: Build custom SVG + Animated.View animation
  - Option C: Use placeholder animation (circle → line → weave pattern)
- [ ] **Subtask 6.2**: Implement confetti animation (Screen 3)
  - Use `react-native-confetti-cannon` or similar library
  - OR: Custom particle system with React Native Animated
- [ ] **Subtask 6.3**: Implement progress bar animation
  - Use React Native Animated or Reanimated
  - Smooth fill animation synchronized with Weave character
- [ ] **Subtask 6.4**: Add haptic feedback (iOS)
  - Use `expo-haptics` for success pattern on Screen 3
- [ ] **Subtask 6.5**: Test animations at 60fps
  - Profile performance with React Native DevTools
  - Optimize if frame drops detected

### Task 7: Permissions & Error Handling (AC: #15)

- [ ] **Subtask 7.1**: Implement camera permission request flow
  - Request on first photo capture attempt
  - Handle denied scenario with alert + Settings link
- [ ] **Subtask 7.2**: Implement microphone permission request flow
  - Request on first audio recording attempt
  - Handle denied scenario with alert + Settings link
- [ ] **Subtask 7.3**: Handle edge cases
  - Photo capture fails (camera error, storage full)
  - Audio recording fails (microphone error, storage full)
  - Audio playback fails (file corrupted, codec issue)
  - Provide retry options for all failures

### Task 8: Testing (Required)

- [ ] **Subtask 8.1**: Manual testing on iOS simulator (all 3 screens)
- [ ] **Subtask 8.2**: Manual testing on physical iOS device
  - Camera capture and preview
  - Audio recording and playback
  - Permissions flow (camera, microphone)
- [ ] **Subtask 8.3**: Test dynamic content generation (Screen 1)
  - Verify different painpoint combinations
  - Verify different identity trait combinations
- [ ] **Subtask 8.4**: Test capture validation (Screen 2)
  - Verify Continue button disabled until both captured
  - Test retake flows (photo and audio)
- [ ] **Subtask 8.5**: Test animations (Screen 3)
  - Verify 60fps performance
  - Verify confetti and Weave animations
  - Test reduced motion accessibility
- [ ] **Subtask 8.6**: Test navigation flow (Screen 1 → 2 → 3 → Story 1.8)
- [ ] **Subtask 8.7**: Test permissions denied scenarios
  - Camera permission denied
  - Microphone permission denied
  - Verify "Open Settings" deep link works
- [ ] **Subtask 8.8**: Test accessibility
  - VoiceOver on iOS
  - Dynamic type support
  - Reduced motion support

---

## Dev Notes

### 🚨 CRITICAL PATTERN: Single Screen State Machine

**THIS STORY MUST USE THE SAME SINGLE-SCREEN PATTERN ESTABLISHED IN STORY 1.6**

- ✅ **ONE file:** `app/(onboarding)/origin-story.tsx`
- ✅ **THREE screens** rendered conditionally based on `currentStep` state
- ✅ **State machine:** `currentStep: 1 | 2 | 3`
- ✅ **NO router.push()** between screens (only within the story)
- ✅ **State management:** All data in component state + AsyncStorage for persistence

**WHY:**
- Smoother transitions between screens (<300ms)
- Simpler state management (single source of truth)
- Faster UX (no route mounting/unmounting)
- Consistent with Story 1.6 implementation pattern
- No navigation stack complexity

**❌ DO NOT CREATE SEPARATE FILES:**
- ❌ `app/(onboarding)/narrative-validation.tsx`
- ❌ `app/(onboarding)/origin-capture.tsx`
- ❌ `app/(onboarding)/completion.tsx`

**✅ CORRECT IMPLEMENTATION:**
```typescript
// app/(onboarding)/origin-story.tsx
const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

return (
  <SafeAreaView style={{ flex: 1 }}>
    {currentStep === 1 && <NarrativeValidation onContinue={() => setCurrentStep(2)} />}
    {currentStep === 2 && <OriginCapture onContinue={() => setCurrentStep(3)} />}
    {currentStep === 3 && <Completion onContinue={() => router.push('/(onboarding)/first-needle')} />}
  </SafeAreaView>
);
```

---

### 🎯 IMPLEMENTATION SCOPE: FRONT-END ONLY

**Focus:** Three-screen commitment ritual with photo + voice capture

**DEFERRED to Story 0-4 (Backend Integration):**
- ❌ Database writes to `origin_stories` table
- ❌ File uploads to Supabase Storage
- ❌ Update `user_profiles.first_bind_completed_at` and `user_level`
- ❌ Analytics event tracking

**Front-End Implementation:**
- ✅ Three-screen flow (Narrative → Capture → Completion)
- ✅ Dynamic content generation from previous story data
- ✅ Photo capture with camera integration
- ✅ Voice recording with playback
- ✅ Weave character animation + confetti
- ✅ Level progress bar animation
- ✅ State management for all captured data
- ✅ Navigation to Story 1.8 on completion

---

### Previous Story Intelligence (Story 1.6 Learnings)

**Pattern Established:**
- ✅ Single screen with step state machine (currentStep: 1 | 2 | 3)
- ✅ Inline styles instead of NativeWind className for iOS compatibility
- ✅ SafeAreaView with `flex: 1` and explicit backgroundColor
- ✅ Comprehensive console logging removed in production
- ✅ Error handling with try/catch and fallbacks
- ✅ Backend integration deferred to Story 0-4 with TODO comments
- ✅ Front-end prototype approach: Simulate backend, focus on UX

**File Structure Pattern:**
- ✅ Screen components: `weave-mobile/app/(onboarding)/[screen-name].tsx`
- ✅ Reusable components: `weave-mobile/src/components/[ComponentName].tsx`
- ✅ Constants: `weave-mobile/src/constants/[dataName]Content.ts`

**Code Patterns from Story 1.6:**
```typescript
// SafeAreaView pattern
<SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
  {/* Content */}
</SafeAreaView>

// Button disabled state pattern
<TouchableOpacity
  disabled={!isValid}
  style={{
    opacity: isValid ? 1 : 0.5,
    backgroundColor: isValid ? '#4CAF50' : '#CCCCCC'
  }}
  onPress={handleContinue}
>
  <Text>Continue</Text>
</TouchableOpacity>

// Navigation pattern
import { useRouter } from 'expo-router';
const router = useRouter();
router.push('/(onboarding)/next-screen');

// Multi-step state machine pattern
const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
```

---

### Architecture Compliance

**Mobile App Stack:**
- React Native via Expo SDK 53
- Expo Router for file-based navigation
- TypeScript for type safety
- Inline styles for iOS compatibility (NOT NativeWind className in this story)
- React hooks for state management

**Required Expo Modules:**
- `expo-camera` - Camera access for photo capture
- `expo-image-picker` - Image selection and processing
- `expo-av` - Audio recording and playback
- `expo-haptics` - Haptic feedback on iOS
- `react-native-confetti-cannon` (optional) - Confetti animations
- `lottie-react-native` (optional) - Weave character animation

**File Naming Conventions:**
- Components: PascalCase (e.g., `WeaveAnimation.tsx`)
- Screens: kebab-case in app/ directory (e.g., `origin-story.tsx`)
- Functions/variables: camelCase

**State Management:**
- Local component state (useState) for capture flow data
- No need for TanStack Query (all local data, no API calls)
- No need for Zustand (single screen flow, simple state)

**Data Flow (Front-End Only):**
```
User Input → Component State → Navigate to Next Screen → Final State → (TODO: Supabase write + upload)
```

**Database Schema (DEFERRED):**
```sql
-- Story 0-4 will implement this schema
CREATE TABLE origin_stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  photo_url TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  audio_duration_seconds INT NOT NULL,
  from_text TEXT NOT NULL,
  to_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Immutable: No UPDATE or DELETE allowed
  CONSTRAINT origin_stories_immutable CHECK (false) -- Enforced by RLS
);

-- Supabase Storage buckets
-- /origin_stories/{user_id}/photo.jpg
-- /origin_stories/{user_id}/commitment.aac

-- Update user_profiles
ALTER TABLE user_profiles
  ADD COLUMN first_bind_completed_at TIMESTAMPTZ,
  ADD COLUMN user_level INT DEFAULT 0;
```

---

### Technical Requirements

**1. Screen Architecture Decision:**

**Single Screen with Step State Machine (RECOMMENDED)**
```typescript
// app/(onboarding)/origin-story.tsx
const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
const [originData, setOriginData] = useState({
  photo: null as string | null,
  audioUri: null as string | null,
  audioDuration: 0,
  fromText: '',
  toText: '',
});

return (
  <SafeAreaView style={{ flex: 1 }}>
    {currentStep === 1 && <Screen1NarrativeValidation onContinue={() => setCurrentStep(2)} />}
    {currentStep === 2 && <Screen2OriginStoryCapture onContinue={(data) => {...setCurrentStep(3)}} />}
    {currentStep === 3 && <Screen3CompletionReinforcement onContinue={() => router.push('/(onboarding)/first-needle')} />}
  </SafeAreaView>
);
```

**Rationale:**
- ✅ Smoother transitions between screens
- ✅ Shared state management across screens
- ✅ No navigation stack complexity
- ✅ Consistent with Story 1.6 implementation pattern

---

**2. Photo Capture Implementation:**

**Option A: expo-camera (RECOMMENDED)**
```bash
npx expo install expo-camera
```

```typescript
import { CameraView, useCameraPermissions } from 'expo-camera';

const [permission, requestPermission] = useCameraPermissions();

if (!permission?.granted) {
  return (
    <View>
      <Text>Camera access required</Text>
      <Button title="Grant Permission" onPress={requestPermission} />
    </View>
  );
}

// Camera capture UI
<CameraView
  style={{ flex: 1 }}
  facing="front"
  onTakePicture={(photo) => handlePhotoCapture(photo.uri)}
/>
```

**Option B: expo-image-picker (Alternative)**
```bash
npx expo install expo-image-picker
```

```typescript
import * as ImagePicker from 'expo-image-picker';

const launchCamera = async () => {
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });

  if (!result.canceled) {
    setPhoto(result.assets[0].uri);
  }
};
```

**Recommendation:** Option B (expo-image-picker) for simplicity and built-in editing.

---

**3. Audio Recording Implementation:**

**Using expo-av:**
```bash
npx expo install expo-av
```

```typescript
import { Audio } from 'expo-av';

// Request permissions
const [permissionResponse, requestPermission] = Audio.usePermissions();

// Start recording
const startRecording = async () => {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  const { recording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );
  setRecording(recording);
};

// Stop recording
const stopRecording = async () => {
  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  const { durationMillis } = await recording.getStatusAsync();
  setAudioUri(uri);
  setAudioDuration(Math.round(durationMillis / 1000));
};

// Playback
const playSound = async () => {
  const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
  await sound.playAsync();
};
```

---

**4. Dynamic Content Generation (Screen 1):**

```typescript
// src/constants/originStoryContent.ts
export const PAINPOINT_STRUGGLES = {
  clarity: "You've been feeling scattered — like there's too much to do, but no clear direction.",
  action: "You know what you want, but taking consistent action feels impossible.",
  consistency: "You start strong, but momentum fades. You're tired of the cycle.",
  alignment: "Something feels off. You're busy, but not building the life you actually want.",
};

export const generateNarrativeText = (
  painpoints: string[],
  identityTraits: string[]
): { struggle: string; aspiration: string; bridge: string } => {
  const struggle = painpoints.map(p => PAINPOINT_STRUGGLES[p]).join(' ');

  const aspiration = `You want to become someone ${identityTraits.slice(0, 3).join(', ')} — someone who acts with purpose.`;

  const bridge = "Weave helps you turn that vision into reality, one small bind at a time. This is where you begin.";

  return { struggle, aspiration, bridge };
};

// Usage in component
const narrativeContent = generateNarrativeText(selectedPainpoints, identityTraits);
```

---

**5. Weave Character Animation (Screen 3):**

**Option A: Lottie Animation (RECOMMENDED)**
```bash
npx expo install lottie-react-native
```

```typescript
import LottieView from 'lottie-react-native';

<LottieView
  source={require('@/assets/animations/weave-level-up.json')}
  autoPlay
  loop={false}
  style={{ width: 200, height: 200 }}
/>
```

**Option B: Custom React Native Animated**
```typescript
import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

const WeaveAnimation = () => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: true,
    }).start();
  }, []);

  const scale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      {/* Weave SVG or Image */}
    </Animated.View>
  );
};
```

**Recommendation:** Option A (Lottie) for high-quality animation with minimal code.

---

**6. Confetti Animation (Screen 3):**

```bash
npm install react-native-confetti-cannon
```

```typescript
import ConfettiCannon from 'react-native-confetti-cannon';

<ConfettiCannon
  count={150}
  origin={{ x: screenWidth / 2, y: 0 }}
  autoStart={true}
  fadeOut={true}
  fallSpeed={2500}
/>
```

---

**7. Permissions Denied Handling:**

```typescript
import { Linking, Alert } from 'react-native';

const handlePermissionDenied = (type: 'camera' | 'microphone') => {
  Alert.alert(
    `${type === 'camera' ? 'Camera' : 'Microphone'} Access Required`,
    `Weave needs ${type} access to capture your origin story. You can enable this in Settings.`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Open Settings',
        onPress: () => Linking.openSettings(),
      },
    ]
  );
};
```

---

### Library & Framework Requirements

**Required Dependencies:**
- ✅ `expo-camera` OR `expo-image-picker` - Photo capture
- ✅ `expo-av` - Audio recording and playback
- ✅ `expo-haptics` - Haptic feedback (iOS)
- ✅ `expo-router` - Navigation (already installed)
- ✅ `@react-native-async-storage/async-storage` - Cross-story data persistence (already installed)
- ✅ `lottie-react-native` (OPTIONAL) - Weave animation
- ✅ `react-native-confetti-cannon` (OPTIONAL) - Confetti effect

**🚨 CRITICAL NPM DEPENDENCY MANAGEMENT GUARDRAILS**

**STEP 1: Verify Current Setup (REQUIRED BEFORE INSTALLING)**
```bash
# Check Expo SDK compatibility
npx expo-doctor

# Check current versions of packages
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

**STEP 3: Verify Installation Success**
```bash
# Should complete without warnings
npm install

# Should report no issues
npx expo-doctor
```

**⚠️ CRITICAL NPM GUARDRAILS (from CLAUDE.md):**
- 🚨 **NEVER use `--legacy-peer-deps` or `--force` flags** - These are extremely dangerous
- ✅ If peer dependency errors occur: Fix root cause by pinning exact versions in package.json
- ✅ See CLAUDE.md "NPM Dependency Management" section for conflict resolution
- ✅ Always run `npx expo-doctor` before and after installing dependencies
- ✅ If install fails: Fix conflicts at root cause, never use shortcuts

**Why These Guardrails Matter:**
- Silent dependency conflicts break production builds
- `--legacy-peer-deps` causes security vulnerabilities and hard-to-debug issues
- Package corruption requires full `node_modules` cleanup (wasted time)

**Expo SDK 53 Compatibility:**
- All dependencies are Expo SDK 53 compatible
- expo-camera version 15.x+
- expo-av version 14.x+
- expo-haptics version 13.x+
- react-native-confetti-cannon: Check version compatibility on npm
- lottie-react-native: 6.x+ (Expo SDK 53 compatible)

---

### File Structure Requirements

**Files to Create:**

**Main Screen File (Single Screen Approach - RECOMMENDED)**
- `weave-mobile/app/(onboarding)/origin-story.tsx` - Main screen with 3 steps

**Component Files (Optional - Separate Components)**
- `weave-mobile/src/components/onboarding/Screen1NarrativeValidation.tsx`
- `weave-mobile/src/components/onboarding/Screen2OriginStoryCapture.tsx`
- `weave-mobile/src/components/onboarding/Screen3CompletionReinforcement.tsx`

**Constants & Utils**
- `weave-mobile/src/constants/originStoryContent.ts` - Painpoint/trait mappings
- `weave-mobile/src/utils/mediaHelpers.ts` - Photo/audio processing helpers

**Assets**
- `weave-mobile/assets/animations/weave-level-up.json` - Lottie animation (if using)
- `weave-mobile/assets/audio/success.mp3` - Success sound (optional)

**Tests (OPTIONAL)**
- `weave-mobile/app/(onboarding)/__tests__/origin-story.test.tsx`

---

### Testing Requirements - FRONT-END ONLY

**Manual Testing Checklist (Priority):**

**Screen 1: Narrative Validation**
- [ ] Title and dynamic content display correctly
- [ ] Content generated based on different painpoint combinations
- [ ] Content generated based on different identity trait combinations
- [ ] Animated background (if implemented) runs smoothly
- [ ] Continue button navigates to Screen 2

**Screen 2: Origin Story Capture**
- [ ] From/To summary card displays correctly
- [ ] Camera permission request appears on first photo capture
- [ ] Photo captures successfully (front and back camera)
- [ ] Photo thumbnail displays after capture
- [ ] Retake photo works correctly
- [ ] Microphone permission request appears on first audio recording
- [ ] Audio recording starts and stops correctly
- [ ] Recording timer displays elapsed time
- [ ] Audio auto-stops at 60 seconds
- [ ] Audio waveform/preview displays after recording
- [ ] Audio playback works correctly
- [ ] Re-record audio works correctly
- [ ] Preview card displays after both captures
- [ ] Continue button disabled until both captured
- [ ] Continue button enabled after both captured
- [ ] Permissions denied alert shows "Open Settings" option
- [ ] "Open Settings" deep link works on iOS

**Screen 3: Completion & Reinforcement**
- [ ] Title and subheading display correctly
- [ ] Weave character animation plays smoothly (60fps)
- [ ] Level progress bar animates from 0 → 1
- [ ] Confetti animation plays on screen load
- [ ] Haptic feedback triggers on iOS
- [ ] Origin story summary card displays photo + duration
- [ ] Continue button navigates to Story 1.8
- [ ] Reduced motion accessibility disables animations
- [ ] Animations run at 60fps (no lag)

**Navigation & State Management**
- [ ] Screen 1 → Screen 2 transition smooth
- [ ] Screen 2 → Screen 3 transition smooth
- [ ] Screen 3 → Story 1.8 transition smooth
- [ ] Back navigation works (Screen 2 → Screen 1)
- [ ] Captured data persists across screens
- [ ] State resets if user exits and re-enters

**Device Compatibility**
- [ ] Test on iOS simulator (all screens)
- [ ] Test on physical iOS device (camera, microphone, haptics)
- [ ] Test on iOS 15, 16, 17 (permissions, media APIs)

**Accessibility**
- [ ] VoiceOver reads all content correctly
- [ ] Touch targets are min 48px
- [ ] Reduced motion settings respected
- [ ] Dynamic type support (text scales)

---

### Git Intelligence Summary

**Recent Work Pattern (from Story 1.6 review):**
- ✅ Commits follow pattern: "story X.Y" with descriptive summary
- ✅ Branch naming: `story/X.Y` (e.g., `story/1.7`)
- ✅ Pull request workflow: Feature branch → PR → Merge to main
- ✅ Stories 1.5, 1.6 recently completed and merged

**Code Patterns to Follow:**
- ✅ Inline styles for iOS compatibility (NOT NativeWind className)
- ✅ Comprehensive error handling with try/catch
- ✅ Console logs removed in production code (or commented out)
- ✅ Accessibility support (VoiceOver, reduced motion)
- ✅ Backend integration deferred with TODO comments
- ✅ SafeAreaView with explicit backgroundColor
- ✅ Single screen with step state machine for multi-step flows

**Recent Commits (from git log):**
```
b317e0f Merge pull request #45 from thejackluo/main
2ccd9ba package update
ee00774 devop: fixed package dependencies
d32e4e7 devop: added dev components
ec1251b devop: docs on multi worktree setup
```

---

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (global.anthropic.claude-sonnet-4-5-20250929-v1:0)

### Implementation Context

**Story Dependencies:**
- **Requires:** Story 1.6 (Name Entry, Personality, Identity Traits) must be complete
  - User must have selected painpoints, personality, and identity traits
  - Navigation target: origin-story.tsx
- **Blocks:** Story 1.8 (Create Your First Needle) cannot start until this story is complete
  - Origin story establishes emotional anchor before goal definition
  - User must complete commitment ritual first

**Critical Path:**
- This is a **critical path story** - core onboarding flow
- Without this, user cannot proceed to goal creation (Story 1.8)
- Origin story creates immutable emotional anchor for future reference
- Establishes "why this matters" before defining "what to do"

**Performance Target:**
- Screen 1: <5s (read narrative, continue)
- Screen 2: 30-90s (capture photo + voice)
- Screen 3: 3-5s (watch animation, continue)
- Total flow: 40-100s depending on user

**User Experience Priority:**
- This is the first "big" commitment moment in onboarding
- Must feel significant and meaningful (not trivial)
- Photo + voice capture creates stronger psychological commitment than text alone
- Weave animation reinforces "this is the beginning of something real"
- Completion screen celebrates accomplishment

**Future Impact:**
- `origin_stories` record will be referenced:
  - During low motivation moments (AI can reference user's original commitment)
  - In progress dashboard (Day 10 snapshot: "Remember where you started?")
  - In Dream Self chat (AI knows user's original "why")
- `first_bind_completed_at` triggers:
  - Progress tracking calculations
  - Milestone badges (first commitment completed)
- `user_level = 1` unlocks:
  - Level 1 Weave character visualization
  - Progress bar display in dashboard

---

### Debug Log References

**Logging Convention:**
```typescript
console.log('[ORIGIN_STORY] Screen 1: Narrative generated:', narrativeContent);
console.log('[ORIGIN_STORY] Screen 2: Photo captured:', photoUri);
console.log('[ORIGIN_STORY] Screen 2: Audio recorded:', audioDuration, 'seconds');
console.log('[ORIGIN_STORY] Screen 3: Origin story complete, navigating to Story 1.8');
```

**Remove all console logs before code review** or comment them out for debugging purposes.

---

### Completion Notes List

**Definition of Done (Front-End Only):**
- [ ] All front-end tasks completed (Tasks 1-8)
- [ ] Three-screen flow functional (Narrative → Capture → Completion)
- [ ] Photo capture working with camera integration
- [ ] Voice recording working with playback controls
- [ ] Dynamic content generation working (Screen 1)
- [ ] Preview card displays correctly (Screen 2)
- [ ] Weave animation + confetti working (Screen 3)
- [ ] Level progress bar animation working
- [ ] Continue button validation working (disabled until both captured)
- [ ] Permissions handling working (camera, microphone)
- [ ] Navigation to Story 1.8 works
- [ ] Manual testing completed on iOS simulator
- [ ] Manual testing completed on physical iOS device
- [ ] Accessibility tested (VoiceOver, reduced motion)
- [ ] Backend integration deferred to Story 0-4 (documented with TODO comments)
- [ ] Code review passed

---

### File List

**To Be Created:**
- [ ] `weave-mobile/app/(onboarding)/origin-story.tsx` - Main screen with 3 steps
- [ ] `weave-mobile/src/constants/originStoryContent.ts` - Painpoint/trait mappings
- [ ] `weave-mobile/src/utils/mediaHelpers.ts` (OPTIONAL) - Photo/audio processing
- [ ] `weave-mobile/assets/animations/weave-level-up.json` (OPTIONAL) - Lottie animation

**To Be Modified:**
- [ ] `weave-mobile/app/(onboarding)/identity-bootup.tsx` - Update navigation target
  - Change: `router.push('/(onboarding)/origin-story')` after Step 3 completion
- [ ] `weave-mobile/package.json` - Add dependencies
  - `expo-image-picker`, `expo-av`, `expo-haptics`, `react-native-confetti-cannon`, `lottie-react-native`

**Not Created (Decision: Inline Implementation):**
- ❌ Separate component files for Screen 1, 2, 3 (implemented inline in origin-story.tsx)

---

## Project Context Reference

**Critical Constraints from CLAUDE.md:**
- ✅ Use inline styles for iOS device compatibility (NOT NativeWind className)
- ✅ All onboarding data stored in user_profiles table (Story 0-4 backend)
- ✅ Track all user events for analytics (deferred to Story 0-4)
- ✅ Front-end prototype approach: Focus on UX, defer backend integration
- ✅ Three-screen flow: Narrative → Capture → Completion
- ✅ Photo + voice capture required (not optional)

**Data Storage Pattern:**
```typescript
// Story 1.7 will collect:
const originStoryData = {
  photo_url: string,              // Uploaded to Supabase Storage
  audio_url: string,              // Uploaded to Supabase Storage
  audio_duration_seconds: number, // Duration of voice commitment
  from_text: string,              // Current struggle text
  to_text: string,                // Dream traits text
  created_at: Date,               // Timestamp
};

// TODO (Story 0-4): Write to Supabase
// 1. Upload photo to /origin_stories/{user_id}/photo.jpg
// 2. Upload audio to /origin_stories/{user_id}/commitment.aac
// 3. Create record in origin_stories table
// 4. Update user_profiles: first_bind_completed_at, user_level = 1
```

**Terminology (CLAUDE.md):**
- "Bind" = Consistent action/habit toward goal
- "Origin Story" = Immutable record of user's starting point and commitment
- "Weave" = Visual representation of user's progress and identity evolution

---

**Created by:** Scrum Master (SM Agent) via create-story workflow (YOLO mode)
**Date:** 2025-12-20
**Epic:** 1 - Onboarding (Optimized Hybrid Flow)
**Story Points:** 5
**Priority:** Must Have (M)
**Estimated Time:** 40-100 seconds user completion
**Implementation Time:** 10-16 hours (developer estimate)
