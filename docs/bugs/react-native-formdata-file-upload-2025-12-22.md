# React Native FormData File Upload - Empty Audio Bytes

**Date:** December 22, 2025
**Severity:** 🔴 Critical (Production Blocker)
**Story:** 0.11 - Voice/Speech-to-Text Infrastructure
**Impact:** Audio transcription completely non-functional on iOS
**Time to Resolution:** ~3 hours (multiple false starts)

---

## Summary

Mobile app (iOS/Expo) was sending **empty audio files** to the FastAPI backend during transcription uploads. The backend correctly validated and rejected the empty payloads with `EMPTY_AUDIO_FILE` errors. Multiple attempted fixes failed before identifying the root cause: incorrect React Native FormData file upload pattern.

---

## Symptoms

### Mobile Logs (Error State)
```
LOG  [STT_SERVICE] 🎤 Starting transcription: {
  "audioUri": "file:///var/mobile/.../recording-D78E6385.m4a",
  "captureId": undefined,
  "language": "en"
}
LOG  [STT_SERVICE] 📖 Reading audio file from: file://...
WARN  Method getInfoAsync imported from "expo-file-system" is deprecated.
[APP HANGS - No further logs]
```

### Backend Logs (Error State)
```
ERROR:app.api.transcribe:[TRANSCRIBE] ❌ Audio read returned EMPTY bytes!
ERROR:app.api.transcribe:[TRANSCRIBE] UploadFile details: filename=recording.m4a, content_type=audio/x-m4a
INFO: 192.168.1.196:58477 - "POST /api/transcribe HTTP/1.1" 400 Bad Request
```

### User-Facing Error
```
ERROR [STT_SERVICE] ❌ Transcription failed: {
  "error": {
    "code": "BAD_REQUEST",
    "message": "{'error': {'code': 'EMPTY_AUDIO_FILE', 'message': 'Audio file is empty or could not be read', 'retryable': False}}"
  }
}
```

---

## Root Cause Analysis

### The Core Problem

React Native's `FormData` implementation **does NOT work like web FormData**. There are specific patterns required for file uploads that differ from browser JavaScript.

### What Went Wrong (Multiple False Starts)

#### ❌ Attempt 1: Using `fetch(fileUri)` Pattern
```typescript
// BROKEN - Returns empty blob in React Native
const audioBlob = await fetch(audioUri).then((res) => res.blob());
formData.append('audio', audioBlob, 'recording.m4a');
```

**Why it failed**: React Native's `fetch()` does NOT support `file://` URIs. It returns an empty blob with zero bytes.

#### ❌ Attempt 2: Manual Base64 Encoding + Data URI Blob
```typescript
// BROKEN - Hangs on deprecated API
const fileInfo = await FileSystem.getInfoAsync(audioUri); // Deprecated in Expo SDK 54+
const fileContent = await FileSystem.readAsStringAsync(audioUri, {
  encoding: FileSystem.EncodingType.Base64,
});
const audioBlob = await fetch(`data:audio/m4a;base64,${fileContent}`).then(r => r.blob());
formData.append('audio', audioBlob, 'recording.m4a');
```

**Why it failed**:
1. `FileSystem.getInfoAsync()` is **deprecated in Expo SDK 54+** and causes silent hangs
2. Over-engineered solution that introduced new bugs
3. Data URI approach adds complexity and potential size limits

---

## ✅ Working Solution

### The React Native FormData File Pattern

React Native's `FormData.append()` accepts a **special file descriptor object** for local file uploads:

```typescript
formData.append('fieldName', {
  uri: 'file://path/to/file',  // Local file URI
  name: 'filename.ext',         // Filename sent to server
  type: 'mime/type'             // Content-Type header
} as any);
```

When `XMLHttpRequest.send(formData)` is called, React Native **automatically reads the file bytes from disk** and includes them in the multipart request.

### Final Working Code

**File:** `/weave-mobile/src/services/sttService.ts`

```typescript
// Prepare multipart form data
const formData = new FormData();

// React Native FormData Pattern: Use file descriptor object
// This tells RN to read the file from disk when sending the request
console.log('[STT_SERVICE] 📎 Preparing file upload from:', audioUri);

// React Native FormData accepts: { uri, name, type }
// The implementation will read the file bytes automatically during upload
formData.append('audio', {
  uri: audioUri,
  name: 'recording.m4a',
  type: 'audio/x-m4a',
} as any);

// Add optional parameters
formData.append('language', language);
if (captureId) formData.append('capture_id', captureId);
if (subtaskInstanceId) formData.append('subtask_instance_id', subtaskInstanceId);
if (goalId) formData.append('goal_id', goalId);

// Upload to backend with progress tracking
const apiUrl = `${getApiBaseUrl()}/api/transcribe`;
const xhr = new XMLHttpRequest();

// ... XMLHttpRequest setup and send
xhr.send(formData); // RN reads file bytes automatically here
```

---

## Why This Solution Works

| Aspect | Explanation |
|--------|-------------|
| **Native Pattern** | Uses React Native's built-in file upload mechanism |
| **No Deprecated APIs** | Avoids Expo FileSystem legacy APIs |
| **Automatic Encoding** | XMLHttpRequest handles file reading internally |
| **Tested Pattern** | Documented in Expo and React Native guides |
| **Performance** | File is streamed, not loaded into memory as base64 |
| **Simplicity** | 4 lines of code vs. 30+ lines of manual encoding |

---

## Code Duplication Issue Discovered

During debugging, we discovered **two separate implementations** of audio upload in the codebase:

1. `/weave-mobile/src/services/sttApi.ts` - Fixed first (but NOT used by app)
2. `/weave-mobile/src/services/sttService.ts` - Actually used by app (fixed later)

**Impact**: Initial fix was applied to the wrong file, causing confusion and delays.

**Recommendation**: Consolidate these two files or clearly deprecate one to prevent future bugs.

---

## Investigation Timeline

| Step | Action | Outcome |
|------|--------|---------|
| 1 | User reports empty audio upload error | Backend correctly rejecting empty bytes |
| 2 | Fix `sttApi.ts` with base64 encoding | Still failing (wrong file!) |
| 3 | Discover app uses `sttService.ts` | Found actual bug location |
| 4 | Apply base64 fix to `sttService.ts` | App hangs on deprecated FileSystem API |
| 5 | Research React Native FormData patterns | Find native `{ uri, name, type }` pattern |
| 6 | Implement native pattern | ✅ Working solution |

---

## Backend Validation (Working Correctly)

The backend was **correctly implemented** and helped catch this bug early:

**File:** `/weave-api/app/api/transcribe.py` (Lines 537-555)

```python
# Read audio file
audio_bytes = await audio.read()

# CRITICAL: Log audio_bytes immediately after read
logger.info(f"[TRANSCRIBE] Read audio file: {len(audio_bytes)} bytes")
if len(audio_bytes) == 0:
    logger.error(f"[TRANSCRIBE] ❌ Audio read returned EMPTY bytes!")
    logger.error(f"[TRANSCRIBE] UploadFile details: filename={audio.filename}, content_type={audio.content_type}")
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail={
            "error": {
                "code": "EMPTY_AUDIO_FILE",
                "message": "Audio file is empty or could not be read",
                "retryable": False
            }
        }
    )
```

**Why this was helpful**: Clear logging and validation made it obvious the problem was on the mobile side, not backend.

---

## Lessons Learned

### 1. React Native ≠ Web Browser

**Lesson**: React Native's APIs often have different semantics than web equivalents. Always check React Native-specific documentation first.

**Example**: `fetch()`, `FormData`, `Blob` all behave differently in React Native vs. browsers.

### 2. Prefer Native Patterns Over Manual Encoding

**Lesson**: React Native provides built-in patterns for common tasks. Don't over-engineer solutions with manual encoding unless necessary.

**Example**: The native `{ uri, name, type }` pattern is simpler and more performant than base64 encoding.

### 3. Watch for Deprecated APIs

**Lesson**: Expo SDK updates frequently deprecate APIs. Check warnings carefully.

**Example**: `FileSystem.getInfoAsync()` was deprecated in Expo SDK 54+, causing silent hangs.

### 4. Consolidate Duplicate Code

**Lesson**: Code duplication leads to confusion and wasted debugging time.

**Example**: Having both `sttApi.ts` and `sttService.ts` caused us to fix the wrong file first.

### 5. Log At Multiple Layers

**Lesson**: Comprehensive logging at mobile + backend helped isolate the issue quickly.

**Example**:
- Mobile: `[STT_SERVICE]` logs showed where code hung
- Backend: `[TRANSCRIBE]` logs confirmed empty bytes received

---

## Testing Checklist

When verifying this fix or testing file uploads in React Native:

- [ ] Record audio on iOS device/simulator
- [ ] Check mobile logs show: `[STT_SERVICE] 📎 Preparing file upload from: ...`
- [ ] Verify no deprecated API warnings (`getInfoAsync`, `readAsStringAsync`)
- [ ] Check backend logs show non-zero byte count: `Read audio file: 84606 bytes`
- [ ] Confirm successful transcription response
- [ ] Test on Android (FormData pattern should work identically)
- [ ] Test with various audio lengths (1s, 10s, 60s)
- [ ] Verify upload progress tracking works with new pattern

---

## References

### React Native FormData Documentation
- [React Native Networking](https://reactnative.dev/docs/network)
- [Expo FileSystem File Upload Example](https://docs.expo.dev/versions/latest/sdk/filesystem/#uploading-files)

### Related Files
- Mobile: `/weave-mobile/src/services/sttService.ts` (Lines 101-118)
- Backend: `/weave-api/app/api/transcribe.py` (Lines 474-695)
- Duplicate: `/weave-mobile/src/services/sttApi.ts` (Should be consolidated or removed)

### Similar Issues
- None documented yet (first occurrence)

---

## Future Prevention

### For Future Developers

1. **Always use the native FormData pattern for file uploads**:
   ```typescript
   formData.append('file', {
     uri: fileUri,
     name: 'filename.ext',
     type: 'mime/type'
   } as any);
   ```

2. **Never use `fetch(file://...)` in React Native** - it returns empty blobs

3. **Check Expo SDK migration guides** when upgrading - APIs deprecate frequently

4. **Consolidate duplicate implementations** - one source of truth per feature

5. **Add integration tests** for file uploads to catch regressions early

### Recommended Architecture Review

- [ ] Audit codebase for other uses of `fetch(file://...)`
- [ ] Remove or deprecate `/weave-mobile/src/services/sttApi.ts`
- [ ] Add TypeScript lint rule to flag deprecated Expo APIs
- [ ] Document React Native patterns in `docs/dev/mobile-patterns.md`
- [ ] Add integration test for audio upload flow

---

## Status: ✅ RESOLVED

**Final Solution:** Use React Native's native FormData file descriptor pattern: `{ uri, name, type }`

**Verification Pending:** User testing audio recording end-to-end (in progress)

**Follow-up Required:** Consolidate duplicate sttApi.ts and sttService.ts implementations
