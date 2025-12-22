# Voice/STT Manual Testing Guide (Story 0.11)

**Purpose:** Comprehensive guide to manually test all voice recording and speech-to-text features

**Components Tested:**
1. VoiceRecordSheet (complete workflow)
2. VoiceRecorder (standalone recording)
3. AudioWaveform (live + static visualization)
4. TranscriptPreview (editing + confidence)
5. AudioPlayer (playback controls)
6. RateLimitIndicator (usage display)

---

## Prerequisites

### 1. Environment Setup

**Backend (Required for transcription):**
```bash
# Terminal 1: Start backend API
cd weave-api
uv run uvicorn app.main:app --reload

# Verify backend is running
curl http://localhost:8000/health
# Expected: {"status": "healthy"}
```

**Mobile (Expo Dev Server):**
```bash
# Terminal 2: Start Expo dev server
cd weave-mobile
npm start

# Or with cache cleared (if issues)
npm run start:clean
```

### 2. Environment Variables

**Backend (`weave-api/.env`):**
```bash
# Required for transcription
ASSEMBLYAI_API_KEY=your_assemblyai_key_here
OPENAI_API_KEY=your_openai_key_here  # Fallback

# Supabase (for storage)
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Mobile (`weave-mobile/.env`):**
```bash
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Device Requirements

**✅ MUST use physical device** - Simulator/emulator has no microphone access

**iOS Setup:**
1. Install Expo Go from App Store
2. Scan QR code from Expo dev server
3. Grant microphone permissions when prompted

**Android Setup:**
1. Install Expo Go from Play Store
2. Scan QR code from Expo dev server
3. Grant microphone permissions when prompted

**Permissions Check:**
- iOS: Settings → Expo Go → Microphone → ✅ Allow
- Android: Settings → Apps → Expo Go → Permissions → Microphone → ✅ Allow

---

## Accessing the Demo Screen

### Option 1: Navigate via Tabs (Recommended)

1. Launch app on device
2. Look for **"Voice Demo"** tab in bottom navigation
3. Tap to open demo screen

### Option 2: Direct Route (Development)

```typescript
// In your app, navigate programmatically:
import { router } from 'expo-router';

router.push('/voice-demo');
```

### Option 3: Temporary Tab Addition

If tab doesn't exist, add to `app/(tabs)/_layout.tsx`:

```typescript
<Tabs.Screen
  name="voice-demo"
  options={{
    title: 'Voice Demo',
    tabBarIcon: ({ color }) => <Ionicons name="mic" size={24} color={color} />,
  }}
/>
```

---

## Test Suite

### Test 1: Complete Workflow (VoiceRecordSheet)

**What it tests:** End-to-end recording → transcription → editing → saving

**Steps:**

1. **Open Workflow**
   - Tap "Open VoiceRecordSheet" button
   - ✅ Bottom sheet slides up from bottom
   - ✅ Shows "Record Voice Note" title
   - ✅ Circular mic button visible (80px)

2. **Start Recording**
   - Tap mic button once
   - ✅ Button turns red
   - ✅ Pulsing ring animation starts
   - ✅ Waveform bars appear around button
   - ✅ Duration timer starts (00:01, 00:02...)
   - ✅ Haptic feedback on tap

3. **Monitor Recording**
   - Speak into microphone: "This is a test recording"
   - ✅ Waveform bars animate with voice (higher when louder)
   - ✅ Timer increments every second
   - ✅ Button remains red during recording

4. **Stop Recording**
   - Tap mic button again
   - ✅ Recording stops immediately
   - ✅ Screen transitions to "Transcribing..." view
   - ✅ Static waveform shown (no animation)
   - ✅ Loading spinner or progress indicator

5. **Wait for Transcription**
   - Backend processes audio (5-15 seconds)
   - ✅ Screen transitions to "Review Transcript" view
   - ✅ Transcript text appears
   - ✅ Confidence indicator shows (green ✓ if >90%)
   - ✅ Provider badge shows "AssemblyAI"

6. **Review Transcript**
   - Read transcribed text
   - ✅ Matches what you said (mostly accurate)
   - ✅ Confidence score displayed (e.g., "High confidence")
   - ✅ Character count shows (e.g., "42/2000")

7. **Edit Transcript**
   - Tap in text area
   - Type to edit: "This is a TEST recording (edited)"
   - ✅ Text updates in real-time
   - ✅ Character count updates
   - ✅ Save/Cancel buttons appear

8. **Playback Audio**
   - Scroll down to audio player
   - Tap play button
   - ✅ Audio plays back (your voice)
   - ✅ Seek bar moves during playback
   - ✅ Time displays (e.g., "0:03 / 0:08")
   - ✅ Can seek by dragging slider
   - ✅ Can change speed (0.5x, 1.0x, 1.5x, 2.0x)

9. **Save or Cancel**
   - Tap "Save" button
   - ✅ Alert shows "Recording Saved!"
   - ✅ Shows transcript preview + audio URI
   - ✅ Bottom sheet closes automatically
   - ✅ Returns to main demo screen

**Expected Logs:**
```
[VOICE_RECORD_SHEET] 🎤 Recording complete: {duration: "8.3s", size: "132.4KB"}
[VOICE_RECORD_SHEET] ✅ Transcription complete
[VOICE_RECORD_SHEET] ✅ Saving transcript
[DEMO] ✅ Saved from sheet: {transcript: "...", audioUri: "file://..."}
```

**Error Cases to Test:**

**A. Network Error (No Backend)**
- Stop backend server
- Complete recording
- ✅ Alert: "Transcription Failed"
- ✅ Options: "Retry" or "Edit Manually"
- Choose "Edit Manually"
- ✅ Can enter transcript manually
- ✅ Provider badge shows "Manual"

**B. Rate Limit Exceeded**
- (If daily limit reached)
- ✅ 429 error returned from API
- ✅ Alert: "Daily limit reached"
- ✅ Shows reset time

---

### Test 2: Standalone Recording (VoiceRecorder)

**What it tests:** Recording without transcription

**Steps:**

1. **Start Recording**
   - Scroll to "Test 2: Standalone Recording"
   - Tap circular mic button
   - ✅ Recording starts (red button, pulsing)
   - ✅ Waveform animates

2. **Record for 5 seconds**
   - Speak normally
   - ✅ Waveform responds to voice
   - ✅ Duration increments

3. **Stop Recording**
   - Tap button again
   - ✅ Alert shows recording stats
   - ✅ Text below shows duration + file size
   - ✅ Waveform in Test 3 populates

**Verify:**
- File size reasonable (~16KB per second)
- Duration accurate
- No transcription occurs (no API call)

---

### Test 3: Waveform Visualization (AudioWaveform)

**What it tests:** Static waveform display after recording

**Steps:**

1. Complete Test 2 first (creates recording)
2. Scroll to "Test 3: Waveform Visualization"
3. ✅ Static waveform displayed (30 bars)
4. ✅ Bar heights vary (not all same)
5. ✅ Bars represent recording amplitude
6. ✅ Taller bars where you spoke louder

**Visual Check:**
- Bars should NOT all be same height (indicates real data)
- Bars should NOT animate (static mode)
- Should fill horizontal space evenly

---

### Test 4: Transcript Editing (TranscriptPreview)

**What it tests:** Text editing with validation

**Steps:**

1. **View Initial State**
   - Scroll to "Test 4: Transcript Editing"
   - ✅ Shows sample transcript
   - ✅ Confidence indicator: "High confidence" (green)
   - ✅ Provider badge: "AssemblyAI"
   - ✅ Character count: "XX/2000"

2. **Edit Text**
   - Tap in text area
   - Add more text: "Additional words to test character counting and validation rules."
   - ✅ Text updates in real-time
   - ✅ Character count updates
   - ✅ Save/Cancel buttons appear

3. **Test Character Limit**
   - Copy/paste large text (>2000 chars)
   - ✅ Stops at 2000 characters
   - ✅ Character count turns red: "2000/2000"
   - ✅ Cannot type more

4. **Save Changes**
   - Tap "Save"
   - ✅ Alert: "Transcript Updated"
   - ✅ Shows first 100 chars
   - ✅ Save/Cancel buttons disappear

5. **Cancel Changes**
   - Edit again
   - Tap "Cancel"
   - ✅ Reverts to last saved version
   - ✅ Buttons disappear

**Edge Cases:**
- Empty text (delete all) → ✅ Still allows save
- Special characters → ✅ Accepted (emojis, punctuation)
- Line breaks → ✅ Preserved

---

### Test 5: Audio Playback (AudioPlayer)

**What it tests:** Play/pause, seeking, speed control

**Steps:**

1. **Initial State**
   - Complete Test 2 first (creates audio)
   - Scroll to "Test 5: Audio Playback"
   - ✅ Player visible with play button
   - ✅ Shows "0:00 / 0:XX" duration

2. **Play Audio**
   - Tap play button (▶️)
   - ✅ Changes to pause button (⏸)
   - ✅ Audio plays (hear your voice)
   - ✅ Seek bar moves smoothly
   - ✅ Time updates: "0:01 / 0:05"

3. **Pause Audio**
   - Tap pause button
   - ✅ Playback stops
   - ✅ Button returns to play
   - ✅ Position preserved

4. **Seek Forward**
   - Drag slider to 50% position
   - ✅ Audio jumps to middle
   - ✅ Time updates correctly
   - ✅ Continues playing

5. **Seek While Paused**
   - Pause audio
   - Drag slider to start
   - ✅ Position updates
   - ✅ Remains paused
   - Tap play → ✅ Starts from new position

6. **Speed Control**
   - Tap "0.5x" button
   - ✅ Audio plays slower (easier to understand)
   - ✅ Button highlighted
   - Tap "1.5x"
   - ✅ Audio plays faster
   - Tap "2.0x"
   - ✅ Audio plays very fast
   - Tap "1.0x"
   - ✅ Returns to normal speed

7. **Playback Complete**
   - Let audio play to end
   - ✅ Auto-stops at end
   - ✅ Position resets to 0:00
   - ✅ Button returns to play
   - ✅ Alert: "Playback Complete"

**Audio Quality Check:**
- Sound should be clear (no distortion)
- Speed changes should not affect pitch
- No crackling or popping sounds

---

### Test 6: Rate Limit Display (RateLimitIndicator)

**What it tests:** Visual progress bars for daily limits

**Steps:**

1. **Normal State (< 80%)**
   - Scroll to "Test 6: Rate Limit Display"
   - ✅ Shows "15/50" transcriptions
   - ✅ Shows "45/300" minutes
   - ✅ Progress bars green
   - ✅ No warning message

2. **Warning State (80-99%)**
   - Mock data: Change to 42 requests, 250 minutes
   - ✅ Progress bars yellow
   - ✅ Icons change to warning (⚠️)
   - ✅ Shows reset time: "Resets in 8h 23m"

3. **Error State (100%)**
   - Mock data: Change to 50 requests, 300 minutes
   - ✅ Progress bars red
   - ✅ Icons change to error (❌)
   - ✅ Shows warning: "Daily limit reached. Resets at midnight."
   - ✅ Reset time prominent

**Visual Checks:**
- Progress bar width matches percentage
- Colors distinct (green → yellow → red)
- Text readable on all backgrounds

---

### Test 7: Compact Mode (RateLimitIndicator)

**What it tests:** Minimal display for toolbars

**Steps:**

1. Scroll to "Test 7: Rate Limit (Compact)"
2. ✅ Shows only icon + percentage
3. ✅ Icon color matches status
4. ✅ Single line layout
5. ✅ Percentage: "15%" (max of both limits)

**Use Case:** Could be placed in header/toolbar

---

## Integration Testing

### Test A: Backend Integration (Full Stack)

**Prerequisites:**
- Backend running on localhost:8000
- AssemblyAI API key configured
- Supabase connected

**Steps:**

1. Complete Test 1 (VoiceRecordSheet workflow)
2. After save, check backend logs:
   ```
   [STT_SERVICE] 🎯 Starting transcription...
   [ASSEMBLYAI] 📤 Uploading audio: 132.4 KB
   [ASSEMBLYAI] ⏳ Polling for results...
   [ASSEMBLYAI] ✅ Transcription complete (confidence: 0.92)
   [STT_SERVICE] 💾 Saved to captures table
   ```

3. Check Supabase Storage:
   - Open Supabase dashboard
   - Navigate to Storage → "captures" bucket
   - ✅ New audio file present (user_id/capture_id.m4a)
   - ✅ File size matches recorded size

4. Check Supabase Database:
   ```sql
   SELECT * FROM captures ORDER BY created_at DESC LIMIT 1;
   -- Verify:
   -- - audio_url points to storage
   -- - transcript matches what you said
   -- - provider = 'assemblyai'
   -- - confidence ~0.8-0.95
   ```

5. Verify Rate Limiting:
   ```sql
   SELECT stt_requests_today, stt_minutes_today
   FROM user_profiles
   WHERE id = 'your_user_id';
   -- Should increment after each transcription
   ```

---

### Test B: Offline Queueing

**What it tests:** Uploads retry when network returns

**Steps:**

1. **Enable Airplane Mode**
   - iOS: Swipe up → tap airplane icon
   - Android: Swipe down → tap airplane mode

2. **Record and Attempt Upload**
   - Open VoiceRecordSheet
   - Record audio
   - Tap stop
   - ✅ Shows "Transcribing..."
   - ✅ After timeout: Alert "Transcription Failed"
   - ✅ Choose "Retry"

3. **Check Queue**
   ```typescript
   // In Chrome DevTools or React Native Debugger:
   import AsyncStorage from '@react-native-async-storage/async-storage';
   const queue = await AsyncStorage.getItem('@weave_stt_offline_queue');
   console.log(JSON.parse(queue));
   // Should show queued transcription request
   ```

4. **Restore Network**
   - Disable airplane mode
   - Call `processOfflineQueue()` (or wait for app to call it)
   - ✅ Queued requests upload
   - ✅ Transcription completes
   - ✅ Queue cleared

**Expected Behavior:**
- No data loss during offline period
- Automatic retry when network restored
- User notified of success

---

## Error Scenario Testing

### Error 1: Permission Denied

**Simulate:**
- iOS: Settings → Expo Go → Microphone → ❌ Deny
- Tap mic button

**Expected:**
- ✅ Alert: "Microphone permission required"
- ✅ Button to open settings
- ✅ Recording does NOT start

---

### Error 2: Backend Timeout

**Simulate:**
```bash
# Stop backend server
cd weave-api
# Ctrl+C to stop
```

**Test:**
- Complete recording
- ✅ Shows "Transcribing..." for 30 seconds
- ✅ Timeout error: "Request failed"
- ✅ Options: "Retry" or "Edit Manually"

---

### Error 3: File Too Large

**Simulate:**
- Record for 10+ minutes (maxDuration not enforced)

**Expected:**
- ✅ Error before upload: "Audio file too large (max 25MB)"
- ✅ Recording still saved locally
- ✅ User can manually edit transcript

---

### Error 4: Rate Limit Exceeded

**Simulate:**
```sql
-- In Supabase SQL Editor
UPDATE user_profiles
SET stt_requests_today = 50
WHERE id = 'your_user_id';
```

**Test:**
- Attempt transcription
- ✅ 429 error from API
- ✅ Alert: "Daily limit reached. Resets at midnight."
- ✅ RateLimitIndicator shows red/error state

---

## Performance Testing

### Test P1: Recording Performance

**Metrics to Check:**

1. **Frame Rate**
   - Enable FPS monitor: Shake device → "Show Perf Monitor"
   - Start recording
   - ✅ FPS stays >50 during recording
   - ✅ Waveform animation smooth (60fps target)

2. **Memory Usage**
   - Record for 5 minutes
   - ✅ Memory does not leak
   - ✅ App remains responsive

3. **Battery Drain**
   - Record multiple 5-minute clips
   - ✅ Reasonable battery usage (~5% per 5 min)

---

### Test P2: Upload Speed

**Benchmark:**
- Record 30-second clip (~480KB)
- Measure time to transcription complete
- ✅ Should complete in <15 seconds (AssemblyAI)
- ✅ Progress indicator visible throughout

---

## Accessibility Testing

### Test A1: VoiceOver (iOS)

1. Enable VoiceOver: Settings → Accessibility → VoiceOver
2. Navigate through voice demo screen
3. ✅ All buttons have labels
4. ✅ Mic button: "Record voice note"
5. ✅ Play button: "Play audio"
6. ✅ Speed buttons: "Playback speed 0.5x", etc.

### Test A2: TalkBack (Android)

1. Enable TalkBack: Settings → Accessibility → TalkBack
2. Test same as VoiceOver
3. ✅ Same accessibility labels

---

## Cross-Platform Testing

### iOS-Specific Tests

1. **Silent Mode**
   - Enable silent mode (switch on side)
   - ✅ Audio still records
   - ✅ Audio plays back through speaker

2. **Background Recording**
   - Start recording
   - Home button (app backgrounds)
   - ✅ Recording stops (expected - not background mode)

3. **Interruptions**
   - Start recording
   - Incoming phone call
   - ✅ Recording pauses
   - Decline call
   - ✅ Recording can resume

### Android-Specific Tests

1. **Do Not Disturb**
   - Enable DND mode
   - ✅ Audio records normally
   - ✅ Audio plays normally

2. **Split Screen**
   - Enable split screen mode
   - ✅ Recording works in split view

---

## Troubleshooting

### Issue: "No microphone permission"

**Solution:**
```bash
# iOS
1. Settings → Expo Go → Microphone → Enable
2. Force quit Expo Go
3. Reopen and grant permission

# Android
1. Settings → Apps → Expo Go → Permissions → Microphone → Allow
2. Restart app
```

---

### Issue: "Recording starts but no waveform"

**Cause:** Metering not enabled

**Solution:**
```typescript
// In VoiceRecorder.tsx, verify:
const recordingOptions = {
  isMeteringEnabled: true, // ← Must be true
  // ...
};
```

---

### Issue: "Transcription always fails"

**Check:**
1. Backend running? `curl http://localhost:8000/health`
2. API key set? Check `weave-api/.env`
3. Network connected? Disable airplane mode
4. API URL correct? Check `weave-mobile/.env`

---

### Issue: "Audio playback has no sound"

**Solutions:**
1. Check device volume (not muted)
2. iOS: Disable silent mode switch
3. Android: Media volume (not ringer volume)
4. Check Audio.setAudioModeAsync settings

---

### Issue: "Bottom sheet doesn't open"

**Solution:**
```typescript
// Verify GestureHandlerRootView wraps BottomSheet
<GestureHandlerRootView style={{ flex: 1 }}>
  <BottomSheet ref={sheetRef}>
    {/* content */}
  </BottomSheet>
</GestureHandlerRootView>
```

---

## Testing Checklist

### Pre-Release Checklist

- [ ] Test 1: VoiceRecordSheet workflow (happy path)
- [ ] Test 2: Standalone recording
- [ ] Test 3: Waveform visualization
- [ ] Test 4: Transcript editing
- [ ] Test 5: Audio playback (all speeds)
- [ ] Test 6: Rate limit display (all states)
- [ ] Test 7: Compact rate limit
- [ ] Error: Permission denied
- [ ] Error: Backend timeout
- [ ] Error: Network offline
- [ ] Error: File too large
- [ ] Error: Rate limit exceeded
- [ ] Performance: Recording smoothness
- [ ] Performance: Upload speed
- [ ] Accessibility: VoiceOver/TalkBack
- [ ] iOS: Silent mode, interruptions
- [ ] Android: DND mode, split screen

### Sign-Off

**Tested by:** _______________
**Date:** _______________
**Device:** _______________ (iOS X.X / Android X.X)
**Result:** ☐ Pass ☐ Fail (notes: _______________)

---

## Next Steps

After completing manual testing:

1. **Document Issues**
   - Create bug reports in `docs/bugs/`
   - Include steps to reproduce

2. **Automated Tests**
   - Write Detox E2E tests (future)
   - Add pytest integration tests (backend)

3. **User Acceptance Testing**
   - Share TestFlight build (iOS)
   - Share APK (Android)
   - Gather feedback

4. **Production Readiness**
   - Monitor Sentry for errors
   - Check AssemblyAI usage/costs
   - Verify rate limits effective
