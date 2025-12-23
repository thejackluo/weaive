# Voice Demo - Quick Start Guide

**Get testing in 5 minutes!**

## 1. Start Backend (Optional - for transcription)

```bash
cd weave-api
uv run uvicorn app.main:app --reload
```

**Skip if:** Only testing recording (no transcription needed)

## 2. Start Mobile App

```bash
cd weave-mobile
npm start
```

## 3. Run on Physical Device

**⚠️ MUST use real device** (simulator has no microphone)

### iOS:
1. Install Expo Go from App Store
2. Scan QR code from terminal
3. Grant microphone permission when prompted

### Android:
1. Install Expo Go from Play Store
2. Scan QR code from terminal
3. Grant microphone permission when prompted

## 4. Navigate to Demo Screen

**The demo screen is at:** `app/(tabs)/voice-demo.tsx`

**To add to tabs (if not visible):**

Edit `app/(tabs)/_layout.tsx` and add:

```typescript
<Tabs.Screen
  name="voice-demo"
  options={{
    title: 'Voice Demo',
    tabBarIcon: ({ color }) => (
      <Ionicons name="mic" size={24} color={color} />
    ),
  }}
/>
```

Restart app → Look for "Voice Demo" tab at bottom

## 5. Quick Test Sequence

### Test 1: Complete Workflow (30 seconds)

1. Tap "Open VoiceRecordSheet"
2. Tap mic button → Speak: "This is a test"
3. Tap mic button again (stop)
4. Wait for transcription (10s)
5. Review transcript → Tap "Save"
6. ✅ Done!

### Test 2: Standalone Recording (10 seconds)

1. Scroll to "Test 2: Standalone Recording"
2. Tap mic button → Speak → Tap stop
3. ✅ See duration + waveform

### Test 3-7: Explore Components

Scroll through screen and interact with each component:
- Edit transcript (Test 4)
- Play audio (Test 5)
- View rate limits (Test 6)

## 6. Troubleshooting

### No mic permission?
**iOS:** Settings → Expo Go → Microphone → Allow
**Android:** Settings → Apps → Expo Go → Permissions → Microphone → Allow

### Transcription fails?
- Backend running? Check terminal
- Network connected? Check WiFi
- Check backend logs for errors

### No sound during playback?
- Check device volume (not muted)
- iOS: Turn off silent mode switch
- Android: Increase media volume

## 7. What to Test

**Must Work:**
- ✅ Recording starts/stops cleanly
- ✅ Waveform animates during recording
- ✅ Transcription completes (if backend running)
- ✅ Audio playback works
- ✅ Can edit transcript
- ✅ Speed controls work (0.5x - 2.0x)

**Expected Behaviors:**
- Recording stops at 5 minutes (maxDuration)
- Character limit enforced (2000 chars)
- Rate limits displayed correctly
- Offline queueing works (airplane mode test)

## 8. Next Steps

**Detailed testing:** See `docs/testing/voice-stt-manual-testing-guide.md` (25 pages)

**Issues?** Create bug report in `docs/bugs/`

**Ready for integration?** Import components from `@/components/voice`

## 9. Demo Screen Features

The demo screen (`voice-demo.tsx`) provides:

1. **7 isolated tests** - Each component testable independently
2. **Mock data** - No backend required for UI testing
3. **Console logs** - Check developer console for debugging
4. **Alerts** - Shows results of actions
5. **Testing tips** - Built-in checklist at bottom

## 10. Integration Example

Once tested, integrate into your app:

```typescript
import { VoiceRecordSheet } from '@/components/voice';
import BottomSheet from '@gorhom/bottom-sheet';

export default function MyScreen() {
  const sheetRef = useRef<BottomSheet>(null);

  const handleSave = (transcript: string, audioUri: string) => {
    console.log('Saved:', transcript);
    // Save to database, link to goal, etc.
  };

  return (
    <>
      <Button onPress={() => sheetRef.current?.expand()}>
        Record Voice Note
      </Button>

      <VoiceRecordSheet
        ref={sheetRef}
        onSave={handleSave}
        goalId="goal-123"
        subtaskInstanceId="subtask-456"
      />
    </>
  );
}
```

---

**That's it!** You're ready to test. 🎤

For comprehensive testing (error cases, performance, accessibility), see the full manual testing guide.
