# ATDD Checklist - Epic 0, Story 0.11: Voice/Speech-to-Text Infrastructure

**Date:** 2025-12-22
**Author:** Jack Luo
**Primary Test Level:** API Integration Tests

---

## Story Summary

Implement comprehensive Speech-to-Text (STT) infrastructure to enable voice-based interactions throughout the app. This includes core STT integration (AssemblyAI primary + Whisper fallback), audio storage in Supabase, API endpoints for transcription, voice recording UI components, rate limiting, and error handling.

**As a** user
**I want** to record voice notes and have them automatically transcribed
**So that** I can quickly capture thoughts, commitments, and reflections without typing

---

## Acceptance Criteria

1. **AC-1: Core STT Integration** - AssemblyAI (primary) + OpenAI Whisper (fallback) with provider abstraction pattern
2. **AC-2: Audio Storage** - Upload, retrieve, delete audio files in Supabase Storage with RLS
3. **AC-3: API Endpoint** - POST /api/transcribe for transcription with cost tracking
4. **AC-4: Voice Recording UI** - VoiceRecorder component with waveform, playback, transcript preview
5. **AC-5: Rate Limiting** - Max 50 transcriptions/day tracked in daily_aggregates
6. **AC-6: Error Handling** - Graceful fallbacks, retry logic, offline queueing

---

## Failing Tests Created (RED Phase)

### API Integration Tests (15 tests)

**File:** `weave-api/tests/test_transcribe_api.py` (463 lines)

- ✅ **Test:** `test_transcribe_audio_success_with_assemblyai`
  - **Status:** RED - Missing `/api/transcribe` endpoint
  - **Verifies:** AC-1, AC-3 - Happy path transcription with AssemblyAI

- ✅ **Test:** `test_transcribe_audio_with_goal_and_subtask_linking`
  - **Status:** RED - Missing goal/subtask linking logic
  - **Verifies:** AC-3 - Capture links to goal and subtask

- ✅ **Test:** `test_transcribe_falls_back_to_whisper_when_assemblyai_fails`
  - **Status:** RED - Missing fallback chain logic
  - **Verifies:** AC-1 - Silent fallback to Whisper when AssemblyAI fails

- ✅ **Test:** `test_transcribe_stores_audio_only_when_all_providers_fail`
  - **Status:** RED - Missing error handling for provider failures
  - **Verifies:** AC-1, AC-6 - Store audio without transcript when all providers fail

- ✅ **Test:** `test_transcribe_enforces_daily_limit_50_requests`
  - **Status:** RED - Missing rate limiting logic
  - **Verifies:** AC-5 - HTTP 429 when daily limit reached

- ✅ **Test:** `test_transcribe_rejects_audio_too_long`
  - **Status:** RED - Missing audio duration validation
  - **Verifies:** AC-6 - Reject audio > 5 minutes

- ✅ **Test:** `test_transcribe_rejects_invalid_audio_format`
  - **Status:** RED - Missing format validation
  - **Verifies:** AC-6 - Only accept MP3, M4A, WAV

- ✅ **Test:** `test_transcribe_handles_upload_timeout`
  - **Status:** RED - Missing timeout handling
  - **Verifies:** AC-6 - Handle upload timeouts gracefully

- ✅ **Test:** `test_get_audio_capture_with_signed_url`
  - **Status:** RED - Missing GET /api/captures/{id} endpoint
  - **Verifies:** AC-2 - Retrieve audio with signed URL

- ✅ **Test:** `test_delete_audio_capture_cascades_cleanup`
  - **Status:** RED - Missing DELETE /api/captures/{id} endpoint
  - **Verifies:** AC-2 - Delete from Storage + Database

- ✅ **Test:** `test_re_transcribe_capture_with_different_provider`
  - **Status:** RED - Missing POST /api/captures/{id}/re-transcribe endpoint
  - **Verifies:** AC-2 - Re-transcribe with optional provider selection

- ✅ **Test:** `test_transcribe_prevents_cross_user_audio_access`
  - **Status:** RED - Missing RLS verification
  - **Verifies:** AC-2 - RLS policies prevent cross-user access

- ✅ **Test:** `test_transcribe_logs_cost_to_ai_runs_table`
  - **Status:** RED - Missing cost tracking logic
  - **Verifies:** AC-1 - Log transcription cost to ai_runs

### Unit Tests (12+ tests)

**File:** `weave-api/tests/test_stt_service.py` (347 lines)

- ✅ **Test:** `test_stt_provider_abstract_class_cannot_be_instantiated`
  - **Status:** RED - Missing STTProvider abstract class
  - **Verifies:** AC-1 - Provider abstraction pattern

- ✅ **Test:** `test_assemblyai_provider_transcribe_success`
  - **Status:** RED - Missing AssemblyAIProvider implementation
  - **Verifies:** AC-1 - AssemblyAI integration with cost calculation

- ✅ **Test:** `test_assemblyai_provider_handles_timeout`
  - **Status:** RED - Missing timeout handling in AssemblyAI provider
  - **Verifies:** AC-1, AC-6 - Handle API timeouts

- ✅ **Test:** `test_whisper_provider_transcribe_success`
  - **Status:** RED - Missing WhisperProvider implementation
  - **Verifies:** AC-1 - Whisper API integration

- ✅ **Test:** `test_stt_service_uses_assemblyai_as_primary`
  - **Status:** RED - Missing STT service orchestration
  - **Verifies:** AC-1 - AssemblyAI is primary provider

- ✅ **Test:** `test_stt_service_falls_back_to_whisper_on_assemblyai_failure`
  - **Status:** RED - Missing fallback chain logic
  - **Verifies:** AC-1 - Silent fallback mechanism

- ✅ **Test:** `test_stt_service_stores_audio_only_when_all_providers_fail`
  - **Status:** RED - Missing all-providers-failed handling
  - **Verifies:** AC-1, AC-6 - Store audio without transcript

- ✅ **Test:** `test_stt_service_retries_transient_failures_3_times`
  - **Status:** RED - Missing retry logic with exponential backoff
  - **Verifies:** AC-1 - 3 retries (1s, 2s, 4s backoff)

- ✅ **Test:** `test_stt_service_does_not_retry_client_errors`
  - **Status:** RED - Missing client error detection
  - **Verifies:** AC-6 - Don't retry 4xx errors

### Component Tests (12+ tests)

**File:** `weave-mobile/src/components/__tests__/VoiceRecorder.test.tsx` (296 lines)

- ✅ **Test:** `should render idle state with microphone button`
  - **Status:** RED - Missing VoiceRecorder component
  - **Verifies:** AC-4 - Idle UI state

- ✅ **Test:** `should start recording when microphone button is pressed`
  - **Status:** RED - Missing recording logic
  - **Verifies:** AC-4 - Start recording on button press

- ✅ **Test:** `should show 3-button layout during recording`
  - **Status:** RED - Missing recording UI state
  - **Verifies:** AC-4 - Cancel, Stop, Pause buttons

- ✅ **Test:** `should display elapsed time during recording`
  - **Status:** RED - Missing timer display
  - **Verifies:** AC-4 - MM:SS format timer

- ✅ **Test:** `should show warning at 4:30 remaining`
  - **Status:** RED - Missing duration warning logic
  - **Verifies:** AC-4 - Warning at 4:30

- ✅ **Test:** `should auto-stop at 5:00 limit`
  - **Status:** RED - Missing max duration enforcement
  - **Verifies:** AC-4 - Auto-stop at 5 minutes

- ✅ **Test:** `should cancel recording when cancel button is pressed`
  - **Status:** RED - Missing cancel logic
  - **Verifies:** AC-4 - Discard recording

- ✅ **Test:** `should request microphone permissions on mount`
  - **Status:** RED - Missing permission request
  - **Verifies:** AC-6 - Request microphone access

- ✅ **Test:** `should show permission denied error when microphone access is denied`
  - **Status:** RED - Missing permission error UI
  - **Verifies:** AC-6 - Permission denied handling

- ✅ **Test:** `should show daily usage indicator`
  - **Status:** RED - Missing rate limit UI
  - **Verifies:** AC-5 - Display usage count

- ✅ **Test:** `should show warning at 80% usage (40/50)`
  - **Status:** RED - Missing warning threshold UI
  - **Verifies:** AC-5 - Yellow warning at 80%

- ✅ **Test:** `should show error at 100% usage (50/50)`
  - **Status:** RED - Missing limit reached UI
  - **Verifies:** AC-5 - Red error at 100%, disable button

- ✅ **Test:** `should queue recording when offline`
  - **Status:** RED - Missing offline queueing
  - **Verifies:** AC-6 - Save to AsyncStorage when offline

---

## Data Factories Created

### Audio Factory

**File:** `weave-api/tests/factories/audio_factory.py`

**Exports:**

- `create_test_audio_capture(user_id?, **overrides)` - Create audio capture with transcript
- `create_test_transcription_result(**overrides)` - Create TranscriptionResult mock
- `create_test_audio_bytes(duration_sec, format)` - Generate test audio file bytes
- `create_test_audio_file_multipart(filename, mime_type, duration)` - Create multipart file tuple
- `create_test_ai_run_log(**overrides)` - Create ai_runs log entry
- `create_test_daily_aggregates(**overrides)` - Create daily_aggregates with STT usage
- `create_audio_captures_batch(count, user_id)` - Create multiple captures at once
- `create_rate_limit_scenario(used, limit, user_id)` - Create rate limit test scenario

**Example Usage:**

```python
from tests.factories.audio_factory import create_test_audio_capture, create_test_transcription_result

# Create audio capture with custom transcript
capture = create_test_audio_capture(
    user_id="123",
    content_text="I completed my workout today",
    duration_sec=45
)

# Create transcription result from AssemblyAI
result = create_test_transcription_result(
    provider="assemblyai",
    confidence=0.92,
    cost_usd=0.001875
)
```

---

## Fixtures Created

### Audio Fixtures

**File:** `weave-api/tests/fixtures/audio_fixtures.py`

**Fixtures:**

- `audio_capture_fixture` - Create audio capture in DB with auto-cleanup
  - **Setup:** Inserts capture into captures table
  - **Provides:** Capture dict with id, storage_key, content_text
  - **Cleanup:** Deletes capture from database

- `multiple_audio_captures_fixture` - Create 5 audio captures with auto-cleanup
  - **Setup:** Inserts 5 captures with varying durations
  - **Provides:** List of 5 capture dicts
  - **Cleanup:** Deletes all 5 captures

- `mock_assemblyai_success` - Mock successful AssemblyAI response
  - **Provides:** TranscriptionResult with confidence 0.92

- `mock_whisper_success` - Mock successful Whisper response
  - **Provides:** TranscriptionResult from Whisper

- `mock_stt_service_with_fallback` - Mock fallback chain (AssemblyAI fail → Whisper success)
  - **Provides:** Mock service simulating provider fallback

- `daily_aggregates_at_warning_threshold` - Create daily_aggregates at 80% usage (40/50)
  - **Setup:** Creates record with stt_request_count=40
  - **Provides:** Daily aggregates dict
  - **Cleanup:** Deletes record

- `daily_aggregates_at_limit` - Create daily_aggregates at 100% usage (50/50)
  - **Setup:** Creates record with stt_request_count=50
  - **Provides:** Daily aggregates dict
  - **Cleanup:** Deletes record

- `test_audio_file_m4a` - Provide test M4A audio bytes
- `test_audio_file_mp3` - Provide test MP3 audio bytes
- `test_audio_file_wav` - Provide test WAV audio bytes
- `test_audio_file_too_long` - Provide 6-minute audio (exceeds limit)
- `test_invalid_audio_file` - Provide non-audio bytes

- `ai_run_log_fixture` - Create ai_runs log entry with auto-cleanup
  - **Setup:** Inserts log into ai_runs table
  - **Provides:** Log dict with cost tracking data
  - **Cleanup:** Deletes log entry

**Example Usage:**

```python
from tests.fixtures.audio_fixtures import audio_capture_fixture

async def test_get_audio(client, audio_capture_fixture):
    # audio_capture_fixture is already created in database
    capture_id = audio_capture_fixture['id']

    response = client.get(f'/api/captures/{capture_id}')

    assert response.status_code == 200
    # Fixture auto-cleanup happens after test completes
```

---

## Mock Requirements

### AssemblyAI API Mock

**Endpoint:** `POST https://api.assemblyai.com/v2/transcript`

**Success Response:**

```json
{
  "id": "transcript_123",
  "status": "completed",
  "text": "I completed my morning workout today. Felt great and energized.",
  "confidence": 0.92,
  "audio_duration": 45,
  "language_code": "en"
}
```

**Failure Response (Timeout):**

```json
{
  "error": "Request timeout after 30 seconds"
}
```

**Notes:** AssemblyAI uses async upload + polling pattern. Mock should simulate:
1. Upload response with transcript_id
2. Poll endpoint returning status "processing" → "completed"
3. Final response with transcript text

---

### OpenAI Whisper API Mock

**Endpoint:** `POST https://api.openai.com/v1/audio/transcriptions`

**Success Response:**

```json
{
  "text": "I completed my morning workout today. Felt great and energized.",
  "language": "en",
  "duration": 45
}
```

**Failure Response (Rate Limit):**

```json
{
  "error": {
    "message": "Rate limit exceeded",
    "type": "rate_limit_error",
    "code": "rate_limit_exceeded"
  }
}
```

**Notes:** Whisper uses direct transcription (no polling). Mock should return immediately.

---

### Supabase Storage Mock

**Upload Endpoint:** `POST /storage/v1/object/captures/{path}`

**Success Response:**

```json
{
  "Key": "captures/user-123/voice_1703167200000.m4a",
  "Id": "uuid"
}
```

**Signed URL Endpoint:** `POST /storage/v1/object/sign/captures/{path}`

**Success Response:**

```json
{
  "signedURL": "https://storage.supabase.co/captures/user-123/voice_...?token=..."
}
```

**Notes:** Storage operations require valid JWT token. Mock should verify token before returning success.

---

## Required data-testid Attributes

### VoiceRecorder Component

- `mic-button` - Microphone button (idle state)
- `stop-button` - Stop button (recording state)
- `cancel-button` - Cancel button (recording state)
- `pause-button` - Pause button (recording state)
- `elapsed-time` - Timer display (MM:SS format)
- `warning-message` - Warning message container (4:30, rate limits)
- `usage-indicator` - Daily usage indicator (X/50)
- `usage-indicator-warning` - Warning color indicator (40/50)

### TranscriptPreview Component

- `transcript-text` - Transcript display text
- `transcript-input` - Editable transcript input
- `confidence-badge` - Confidence score indicator
- `save-button` - Save edited transcript button
- `re-transcribe-button` - Re-transcribe button

### AudioPlayer Component

- `play-button` - Play/pause button
- `seek-bar` - Scrubbing/seek bar
- `playback-speed-button` - Speed control (1x, 1.5x, 2x)
- `time-display` - Current time / total duration

**Implementation Example:**

```tsx
<View testID="mic-button">
  <TouchableOpacity onPress={startRecording}>
    <MicrophoneIcon />
  </TouchableOpacity>
</View>

<Text testID="elapsed-time">{formatTime(duration)}</Text>

<View testID="usage-indicator">
  <Text>{used}/50 transcriptions used today</Text>
</View>
```

---

## Implementation Checklist

### Test: AC-1 - STT Provider Abstraction

**File:** `test_stt_service.py` (lines 18-100)

**Tasks to make this test pass:**

- [ ] Create `app/services/stt/base.py` with `STTProvider` abstract class
- [ ] Define abstract methods: `transcribe()`, `get_cost()`, `is_available()`
- [ ] Create `TranscriptionResult` dataclass (transcript, confidence, duration, language, provider, cost)
- [ ] Create `app/services/stt/assemblyai_provider.py` implementing `STTProvider`
- [ ] Implement AssemblyAI upload + poll logic
- [ ] Calculate cost: $0.0025/minute
- [ ] Create `app/services/stt/whisper_provider.py` implementing `STTProvider`
- [ ] Implement Whisper direct transcription
- [ ] Calculate cost: $0.006/minute
- [ ] Add required data-testid attributes: N/A (backend service)
- [ ] Run test: `uv run pytest weave-api/tests/test_stt_service.py::test_stt_provider_abstract_class_cannot_be_instantiated -v`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 4 hours

---

### Test: AC-1 - STT Fallback Chain

**File:** `test_stt_service.py` (lines 210-270)

**Tasks to make this test pass:**

- [ ] Create `app/services/stt/stt_service.py` with `STTService` class
- [ ] Implement provider priority list: [AssemblyAI, Whisper]
- [ ] Try AssemblyAI first
- [ ] On failure (timeout, 5xx), automatically try Whisper (SILENT fallback)
- [ ] On all providers fail, raise exception for API layer to handle
- [ ] Implement retry logic: 3 attempts with exponential backoff (1s, 2s, 4s)
- [ ] Only retry on 5xx errors (not 4xx)
- [ ] Add logging for provider used
- [ ] Add required data-testid attributes: N/A
- [ ] Run test: `uv run pytest weave-api/tests/test_stt_service.py::test_stt_service_falls_back_to_whisper_on_assemblyai_failure -v`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 3 hours

---

### Test: AC-3 - POST /api/transcribe Endpoint

**File:** `test_transcribe_api.py` (lines 52-90)

**Tasks to make this test pass:**

- [ ] Create `app/api/transcribe.py` router
- [ ] Implement `POST /api/transcribe` endpoint
- [ ] Accept multipart/form-data with audio file
- [ ] Optional params: `language`, `goal_id`, `subtask_instance_id`, `local_date`
- [ ] Validate audio format (MP3, M4A, WAV only)
- [ ] Validate audio duration (max 5 minutes)
- [ ] Check rate limits (daily_aggregates.stt_request_count < 50)
- [ ] Upload audio to Supabase Storage (`captures` bucket)
- [ ] Call STT service with fallback
- [ ] Store transcript in `captures` table (`type='audio'`, `content_text`)
- [ ] Log to `ai_runs` table (provider, duration, cost, confidence)
- [ ] Increment `daily_aggregates.stt_request_count`
- [ ] Generate signed URL (1-hour expiration)
- [ ] Return response: `{data: {transcript, confidence, duration_sec, language, provider, audio_url}, meta: {timestamp}}`
- [ ] Add required data-testid attributes: N/A
- [ ] Run test: `uv run pytest weave-api/tests/test_transcribe_api.py::test_transcribe_audio_success_with_assemblyai -v`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 5 hours

---

### Test: AC-2 - GET /api/captures/{id} Endpoint

**File:** `test_transcribe_api.py` (lines 343-366)

**Tasks to make this test pass:**

- [ ] Implement `GET /api/captures/{capture_id}` endpoint (may already exist from Story 0.9)
- [ ] Fetch capture from `captures` table
- [ ] Filter by `type='audio'` if audio-specific
- [ ] Verify user ownership (RLS + API check)
- [ ] Generate signed URL with 1-hour expiration
- [ ] Return capture with metadata: `{id, type, storage_key, signed_url, content_text, duration_sec, created_at}`
- [ ] Handle not found (HTTP 404)
- [ ] Add required data-testid attributes: N/A
- [ ] Run test: `uv run pytest weave-api/tests/test_transcribe_api.py::test_get_audio_capture_with_signed_url -v`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test: AC-2 - DELETE /api/captures/{id} Endpoint

**File:** `test_transcribe_api.py` (lines 369-391)

**Tasks to make this test pass:**

- [ ] Implement `DELETE /api/captures/{capture_id}` endpoint (may already exist from Story 0.9)
- [ ] Verify user ownership (RLS + API check)
- [ ] Delete from Supabase Storage (cascading cleanup)
- [ ] Delete from `captures` table
- [ ] Return success confirmation: `{data: {deleted: true}}`
- [ ] Handle not found (HTTP 404)
- [ ] Add required data-testid attributes: N/A
- [ ] Run test: `uv run pytest weave-api/tests/test_transcribe_api.py::test_delete_audio_capture_cascades_cleanup -v`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test: AC-2 - POST /api/captures/{id}/re-transcribe Endpoint

**File:** `test_transcribe_api.py` (lines 394-419)

**Tasks to make this test pass:**

- [ ] Create `POST /api/captures/{capture_id}/re-transcribe` endpoint
- [ ] Fetch capture from database
- [ ] Verify user ownership
- [ ] Optional param: `provider` (force AssemblyAI or Whisper)
- [ ] Re-run transcription with specified provider
- [ ] **Free retry policy:** First re-transcription doesn't count against daily limit
- [ ] Track re-transcription count in capture metadata
- [ ] Update `captures.content_text` with new transcript
- [ ] Update `captures.confidence_score` (if available)
- [ ] Return updated capture
- [ ] Add required data-testid attributes: N/A
- [ ] Run test: `uv run pytest weave-api/tests/test_transcribe_api.py::test_re_transcribe_capture_with_different_provider -v`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test: AC-5 - Rate Limiting Enforcement

**File:** `test_transcribe_api.py` (lines 246-271)

**Tasks to make this test pass:**

- [ ] Create migration `20251221000003_audio_stt_columns.sql`
- [ ] Add columns to `daily_aggregates` table:
  - `stt_request_count` INT DEFAULT 0
  - `stt_duration_minutes` DECIMAL DEFAULT 0
- [ ] Implement rate limit check function
- [ ] Query `daily_aggregates` for today's usage
- [ ] Check: `stt_request_count < 50`
- [ ] If exceeded, return HTTP 429 with error code `STT_RATE_LIMIT_EXCEEDED`
- [ ] Include `Retry-After` header with midnight reset time
- [ ] Error response: `{error: {code, message, retryable: false, retryAfter}}`
- [ ] Implement usage increment function (atomic update)
- [ ] Reset counters at midnight (user's timezone from `user_profiles.timezone`)
- [ ] Add required data-testid attributes: N/A
- [ ] Run test: `uv run pytest weave-api/tests/test_transcribe_api.py::test_transcribe_enforces_daily_limit_50_requests -v`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 3 hours

---

### Test: AC-6 - Error Handling (Validation)

**File:** `test_transcribe_api.py` (lines 274-342)

**Tasks to make this test pass:**

- [ ] Implement audio duration validation (max 5 minutes = 300 seconds)
- [ ] Return HTTP 400, error code `AUDIO_TOO_LONG` if duration > 300
- [ ] Implement audio format validation (only MP3, M4A, WAV)
- [ ] Check MIME type: `audio/mpeg`, `audio/mp4`, `audio/x-m4a`, `audio/wav`
- [ ] Return HTTP 400, error code `INVALID_AUDIO_FORMAT` if unsupported
- [ ] Implement upload timeout handling (max 30 seconds)
- [ ] Return HTTP 504, error code `UPLOAD_TIMEOUT` if timeout
- [ ] Error response format: `{error: {code, message, retryable}}`
- [ ] Add required data-testid attributes: N/A
- [ ] Run tests:
  - `uv run pytest weave-api/tests/test_transcribe_api.py::test_transcribe_rejects_audio_too_long -v`
  - `uv run pytest weave-api/tests/test_transcribe_api.py::test_transcribe_rejects_invalid_audio_format -v`
  - `uv run pytest weave-api/tests/test_transcribe_api.py::test_transcribe_handles_upload_timeout -v`
- [ ] ✅ All tests pass (green phase)

**Estimated Effort:** 2 hours

---

### Test: AC-1 - Cost Tracking to ai_runs Table

**File:** `test_transcribe_api.py` (lines 468-493)

**Tasks to make this test pass:**

- [ ] Create migration to add columns to `ai_runs` table (if not exists):
  - `audio_duration_sec` INT
  - `provider` TEXT ('assemblyai' | 'whisper' | 'manual')
  - `confidence_score` DECIMAL (0-1.0)
- [ ] After successful transcription, insert log entry into `ai_runs`
- [ ] Include: user_id, operation='stt_transcribe', model, provider, audio_duration_sec, cost_usd, confidence_score, timestamp
- [ ] Calculate cost based on provider:
  - AssemblyAI: $0.0025/minute = $0.00004167/second
  - Whisper: $0.006/minute = $0.0001/second
- [ ] Add required data-testid attributes: N/A
- [ ] Run test: `uv run pytest weave-api/tests/test_transcribe_api.py::test_transcribe_logs_cost_to_ai_runs_table -v`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: AC-4 - VoiceRecorder Component (Idle → Recording)

**File:** `VoiceRecorder.test.tsx` (lines 40-100)

**Tasks to make this test pass:**

- [ ] Install `expo-av` package: `cd weave-mobile && expo install expo-av`
- [ ] Create `src/services/audioRecording.ts`
- [ ] Request microphone permissions: `Audio.requestPermissionsAsync()`
- [ ] Configure audio mode: `Audio.setAudioModeAsync()`
- [ ] Start/stop/pause recording logic
- [ ] Create `src/hooks/useAudioRecording.ts` hook
- [ ] Manage recording state: idle, recording, paused, stopped
- [ ] Track elapsed time (updates every second)
- [ ] Enforce 5-minute limit
- [ ] Create `src/components/VoiceRecorder.tsx`
- [ ] Render circular microphone button (80px, testID="mic-button")
- [ ] Show "Tap to record" hint in idle state
- [ ] On press, start recording
- [ ] Show 3-button layout during recording:
  - Cancel (testID="cancel-button")
  - Stop (testID="stop-button")
  - Pause (testID="pause-button")
- [ ] Display elapsed time (testID="elapsed-time", format: MM:SS)
- [ ] Use design system components (Button, Text, Card)
- [ ] Add required data-testid attributes: `mic-button`, `stop-button`, `cancel-button`, `pause-button`, `elapsed-time`
- [ ] Run tests:
  - `npm test -- VoiceRecorder.test.tsx -t "should render idle state"`
  - `npm test -- VoiceRecorder.test.tsx -t "should start recording"`
  - `npm test -- VoiceRecorder.test.tsx -t "should show 3-button layout"`
- [ ] ✅ Tests pass (green phase)

**Estimated Effort:** 6 hours

---

### Test: AC-4 - Max Duration Enforcement

**File:** `VoiceRecorder.test.tsx` (lines 145-175)

**Tasks to make this test pass:**

- [ ] Implement warning at 4:30 (270 seconds)
- [ ] Show: "⚠️ 30 seconds remaining" (testID="warning-message")
- [ ] Implement auto-stop at 5:00 (300 seconds)
- [ ] Call `stopRecording()` automatically
- [ ] Show completion animation
- [ ] Proceed to transcription
- [ ] Add required data-testid attributes: `warning-message`
- [ ] Run tests:
  - `npm test -- VoiceRecorder.test.tsx -t "should show warning at 4:30"`
  - `npm test -- VoiceRecorder.test.tsx -t "should auto-stop at 5:00"`
- [ ] ✅ Tests pass (green phase)

**Estimated Effort:** 2 hours

---

### Test: AC-6 - Microphone Permissions

**File:** `VoiceRecorder.test.tsx` (lines 200-240)

**Tasks to make this test pass:**

- [ ] Request microphone permissions on component mount
- [ ] Use `Audio.requestPermissionsAsync()`
- [ ] Handle permission granted: enable recording
- [ ] Handle permission denied:
  - Show error: "Microphone access required. Enable in Settings."
  - Disable microphone button
  - Show iOS Settings deep link button
  - Error code: `MICROPHONE_PERMISSION_DENIED`
- [ ] Add required data-testid attributes: N/A (error text is sufficient)
- [ ] Run tests:
  - `npm test -- VoiceRecorder.test.tsx -t "should request microphone permissions"`
  - `npm test -- VoiceRecorder.test.tsx -t "should show permission denied error"`
- [ ] ✅ Tests pass (green phase)

**Estimated Effort:** 2 hours

---

### Test: AC-5 - Rate Limit UI

**File:** `VoiceRecorder.test.tsx` (lines 253-295)

**Tasks to make this test pass:**

- [ ] Create `src/components/VoiceUsageIndicator.tsx`
- [ ] Fetch daily usage from backend: `GET /api/transcribe/usage`
- [ ] Display: "X/50 transcriptions used today" (testID="usage-indicator")
- [ ] Show warning at 80% (40/50):
  - Yellow color (testID="usage-indicator-warning")
  - Message: "40/50 transcriptions used today"
- [ ] Show error at 100% (50/50):
  - Red color
  - Message: "Daily limit reached. Resets at midnight."
  - Disable microphone button
- [ ] Update usage count after each transcription
- [ ] Integrate into VoiceRecorder component
- [ ] Add required data-testid attributes: `usage-indicator`, `usage-indicator-warning`
- [ ] Run tests:
  - `npm test -- VoiceRecorder.test.tsx -t "should show daily usage indicator"`
  - `npm test -- VoiceRecorder.test.tsx -t "should show warning at 80%"`
  - `npm test -- VoiceRecorder.test.tsx -t "should show error at 100%"`
- [ ] ✅ Tests pass (green phase)

**Estimated Effort:** 3 hours

---

### Test: AC-6 - Offline Queueing

**File:** `VoiceRecorder.test.tsx` (lines 310-340)

**Tasks to make this test pass:**

- [ ] Create `src/services/audioUpload.ts`
- [ ] Check network status: `@react-native-community/netinfo`
- [ ] If offline:
  - Save audio to AsyncStorage
  - Show: "No internet connection. Recording saved locally."
  - Display: "1 transcription pending"
- [ ] On connection restore:
  - Auto-sync pending recordings
  - Show upload progress
- [ ] Create `src/hooks/useAudioUpload.ts` (TanStack Query)
- [ ] Mutation for audio upload with offline queue support
- [ ] `networkMode: 'offlineFirst'`
- [ ] Add required data-testid attributes: N/A
- [ ] Run test: `npm test -- VoiceRecorder.test.tsx -t "should queue recording when offline"`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 3 hours

---

### Test: Additional Mobile Components

**Tasks:**

- [ ] Create `AudioWaveform.tsx` component (20-30 bars, amplitude-based)
- [ ] Use `expo-av` recording status for levels
- [ ] Throttle updates to 30fps
- [ ] Create `TranscriptPreview.tsx` component (display, edit, confidence, save, re-transcribe)
- [ ] Create `AudioPlayer.tsx` component (play/pause, seek, speed, time display)
- [ ] Create `VoiceRecordSheet.tsx` bottom sheet container

**Estimated Effort:** 8 hours

---

## Running Tests

```bash
# Run all API integration tests for Story 0.11
cd weave-api
uv run pytest tests/test_transcribe_api.py -v

# Run STT service unit tests
uv run pytest tests/test_stt_service.py -v

# Run specific test
uv run pytest tests/test_transcribe_api.py::test_transcribe_audio_success_with_assemblyai -v

# Run with coverage
uv run pytest tests/test_transcribe_api.py --cov=app/api/transcribe --cov=app/services/stt

# Run all mobile component tests
cd weave-mobile
npm test -- VoiceRecorder.test.tsx

# Run specific mobile test
npm test -- VoiceRecorder.test.tsx -t "should start recording"

# Run all tests with watch mode
npm test -- --watch
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete) ✅

**TEA Agent Responsibilities:**

- ✅ All tests written and failing (40+ tests across 3 levels)
- ✅ Fixtures and factories created with auto-cleanup
- ✅ Mock requirements documented (AssemblyAI, Whisper, Supabase Storage)
- ✅ data-testid requirements listed (8 attributes for mobile UI)
- ✅ Implementation checklist created (14 test groups with tasks)

**Verification:**

- All tests run and fail as expected
- Failure messages are clear and actionable
- Tests fail due to missing implementation, not test bugs

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Pick one failing test** from implementation checklist (start with AC-1: STT Provider Abstraction)
2. **Read the test** to understand expected behavior
3. **Implement minimal code** to make that specific test pass
4. **Run the test** to verify it now passes (green)
5. **Check off the task** in implementation checklist above
6. **Move to next test** and repeat

**Key Principles:**

- One test at a time (don't try to fix all at once)
- Minimal implementation (don't over-engineer)
- Run tests frequently (immediate feedback)
- Use implementation checklist as roadmap

**Progress Tracking:**

- Check off tasks as you complete them
- Share progress in daily standup
- Mark story as IN PROGRESS in `bmm-workflow-status.md`

**Recommended Order:**

1. AC-1: STT Provider Abstraction (backend foundation)
2. AC-1: STT Fallback Chain (backend service orchestration)
3. AC-3: POST /api/transcribe (main endpoint)
4. AC-5: Rate Limiting (backend enforcement)
5. AC-6: Error Handling (validation + timeouts)
6. AC-2: Audio Retrieval/Deletion (Storage endpoints)
7. AC-1: Cost Tracking (ai_runs logging)
8. AC-4: VoiceRecorder Component (mobile UI)
9. AC-4: Max Duration (mobile logic)
10. AC-6: Permissions (mobile error handling)
11. AC-5: Rate Limit UI (mobile display)
12. AC-6: Offline Queueing (mobile resilience)
13. Additional Components (AudioWaveform, TranscriptPreview, AudioPlayer)

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

**DEV Agent Responsibilities:**

1. **Verify all tests pass** (green phase complete)
2. **Review code for quality** (readability, maintainability, performance)
3. **Extract duplications** (DRY principle)
4. **Optimize performance** (if needed)
5. **Ensure tests still pass** after each refactor
6. **Update documentation** (if API contracts change)

**Key Principles:**

- Tests provide safety net (refactor with confidence)
- Make small refactors (easier to debug if tests fail)
- Run tests after each change
- Don't change test behavior (only implementation)

**Completion:**

- All tests pass
- Code quality meets team standards
- No duplications or code smells
- Ready for code review and story approval

---

## Next Steps

1. **Review this checklist** with team in standup or planning
2. **Run failing tests** to confirm RED phase: `uv run pytest tests/test_transcribe_api.py -v`
3. **Begin implementation** using implementation checklist as guide
4. **Work one test at a time** (red → green for each)
5. **Share progress** in daily standup
6. **When all tests pass**, refactor code for quality
7. **When refactoring complete**, manually update story status to 'done' in sprint-status.yaml

---

## Knowledge Base References Applied

This ATDD workflow consulted the following knowledge fragments:

- **Provider abstraction patterns** - Similar to Story 0.6 (AI Service), used for STT providers
- **fixture-architecture patterns** - Test fixture setup/teardown with auto-cleanup using pytest
- **data-factories patterns** - Factory functions with override support following existing `factories.py` patterns
- **test-quality principles** - Given-When-Then format, one assertion per test, deterministic tests, isolation
- **API response patterns** - Following Story 0.8 format: `{data, meta}` success, `{error}` failure

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Command:** `uv run pytest tests/test_transcribe_api.py tests/test_stt_service.py -v`

**Expected Results:**

```
tests/test_transcribe_api.py::test_transcribe_audio_success_with_assemblyai FAILED (Missing endpoint)
tests/test_transcribe_api.py::test_transcribe_audio_with_goal_and_subtask_linking FAILED (Missing endpoint)
tests/test_transcribe_api.py::test_transcribe_falls_back_to_whisper_when_assemblyai_fails FAILED (Missing fallback logic)
... (15 tests)

tests/test_stt_service.py::test_stt_provider_abstract_class_cannot_be_instantiated FAILED (Missing class)
tests/test_stt_service.py::test_assemblyai_provider_transcribe_success FAILED (Missing provider)
... (12 tests)
```

**Mobile Tests:**

```bash
npm test -- VoiceRecorder.test.tsx

FAIL src/components/__tests__/VoiceRecorder.test.tsx
  VoiceRecorder Component
    ✕ should render idle state with microphone button (Missing component)
    ✕ should start recording when microphone button is pressed (Missing logic)
    ... (12 tests)
```

**Summary:**

- Total tests: 40+
- Passing: 0 (expected)
- Failing: 40+ (expected)
- Status: ✅ RED phase verified

**Expected Failure Messages:**

- `ModuleNotFoundError: No module named 'app.api.transcribe'` - Missing endpoint
- `ModuleNotFoundError: No module named 'app.services.stt'` - Missing STT service
- `Cannot find module './VoiceRecorder'` - Missing mobile component
- `TypeError: Cannot read property 'transcribe' of undefined` - Missing STT provider

---

## Notes

**AssemblyAI vs. Whisper:**

- AssemblyAI is 58% cheaper ($0.0025/min vs $0.006/min)
- At 10K users scale: AssemblyAI saves ~$153/month vs Whisper-only
- Use AssemblyAI as primary, Whisper as fallback

**Provider Abstraction Pattern:**

- Follows same pattern as Story 0.6 (AI Service) and Story 0.9 (Vision)
- Easy to add new providers (e.g., Google Cloud Speech-to-Text) in future
- Consistent architecture reduces cognitive load

**Cost Efficiency:**

- Total STT cost at 10K users: ~$256.50/month (AssemblyAI + Whisper fallback)
- Well within $2,500/month AI budget (90% headroom)
- Free first re-transcription per capture (user-friendly)

**Rate Limiting:**

- 50 transcriptions/day = generous for typical usage (2-3 voice notes/day)
- Prevents abuse without restricting legitimate users
- Clear feedback to user (usage indicator, warnings, errors)

**Offline Support:**

- AsyncStorage queue ensures no data loss
- Auto-sync on connection restore
- Good UX for unreliable network conditions

---

## Contact

**Questions or Issues?**

- Ask in team standup
- Tag @Jack Luo in Slack/Discord
- Refer to `docs/stories/epic-0/0-11-voice-stt-infrastructure.md` for full story
- Consult backend tests for API contract details

---

**Generated by BMad TEA Agent** - 2025-12-22
