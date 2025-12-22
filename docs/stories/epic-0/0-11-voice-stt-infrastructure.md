# Story 0.11: Voice/Speech-to-Text Infrastructure

**Epic:** 0 - Foundation
**Story ID:** 0.11
**Story Key:** 0-11-voice-stt-infrastructure
**Priority:** Must Have (Foundation)
**Estimate:** 5 story points
**Status:** in-progress

---

## User Story

**As a** user
**I want to** record voice notes and have them automatically transcribed
**So that** I can quickly capture thoughts, commitments, and reflections without typing

---

## Overview

Implement comprehensive Speech-to-Text (STT) infrastructure to enable voice-based interactions throughout the app:
1. **Core STT Integration:** AssemblyAI (primary) + Whisper API (fallback) with provider abstraction
2. **Audio Storage:** Upload, retrieve, and delete audio files in Supabase Storage
3. **API Endpoints:** `/api/transcribe` for transcription with cost tracking
4. **Voice Recording UI:** VoiceRecorder component with waveform, playback, transcript preview
5. **Rate Limiting:** Max 50 transcriptions/day, 5 minutes audio length per request
6. **Error Handling:** Graceful fallbacks, retry logic, offline queueing

This story establishes the foundation for voice-based features and unblocks:
- Epic 1 FR-1.7 (Origin Story voice commitment)
- Epic 3 FR-3.5 (Voice capture/quick capture)
- Epic 4 FR-4.2 (Voice journal entries)

**Cost Efficiency:** AssemblyAI is 58% cheaper than Whisper ($0.0025/min vs $0.006/min), resulting in significant cost savings at scale.

---

## Acceptance Criteria

### AC-1: Core STT Integration

**AssemblyAI Integration (Primary Provider):**
- [ ] Create `services/stt_service.py` with `STTProvider` abstract class
- [ ] Implement `AssemblyAIProvider` class
- [ ] API Key management via environment variable `ASSEMBLYAI_API_KEY`
- [ ] Transcription endpoint: `https://api.assemblyai.com/v2/transcript`
- [ ] Support audio formats: MP3, M4A, WAV, FLAC, OGG
- [ ] Cost tracking: $0.15/hour = $0.0025/minute
- [ ] Return transcript with confidence score (0-1.0)

**OpenAI Whisper Integration (Fallback Provider):**
- [ ] Implement `WhisperProvider` class
- [ ] Use `whisper-1` model via OpenAI API
- [ ] API Key management via environment variable `OPENAI_API_KEY`
- [ ] Cost tracking: $0.006/minute
- [ ] Support same audio formats as AssemblyAI
- [ ] Return transcript with language detection

**Provider Abstraction Pattern:**
- [ ] Abstract base class `STTProvider` with methods:
  - `transcribe(audio_file: bytes, language: str = 'en') -> TranscriptionResult`
  - `get_cost(duration_seconds: int) -> float`
  - `is_available() -> bool`
- [ ] Fallback chain: AssemblyAI → Whisper API → Store audio only (manual transcript)
- [ ] Automatic retry on transient failures (3 attempts, exponential backoff)
- [ ] Log provider used in `ai_runs` table

**STT Cost Tracking:**
- [ ] Add columns to `ai_runs` table:
  - `audio_duration_sec` (INT)
  - `provider` (TEXT: 'assemblyai' | 'whisper' | 'manual')
  - `cost_usd` (DECIMAL)
  - `confidence_score` (DECIMAL, 0-1.0)
- [ ] Calculate cost per transcription
- [ ] Monitor daily spend with alerts at $83.33/day threshold (AI budget)
- [ ] Include STT costs in daily budget tracking

### AC-2: Audio Storage

**Captures Table Structure:**
- [ ] **Single table design**: `captures` table with `type` enum ('photo' | 'audio' | 'text' | 'timer' | 'link')
- [ ] Audio captures use `type = 'audio'`
- [ ] Image captures use `type = 'photo'` (Story 0.9)
- [ ] Both types share same table for unified capture history
- [ ] Type-specific columns:
  - `storage_key`: File path in Supabase Storage (both photo and audio)
  - `content_text`: Transcript for audio, notes for text captures
  - `duration_sec`: Audio/video duration (NEW column, migration 20251221000002)
- [ ] Schema validation: `CHECK` constraint ensures audio captures have `storage_key`

**Upload Audio to Supabase Storage:**
- [ ] Storage bucket: `captures` (REUSE existing bucket from Story 0.9)
- [ ] Folder structure: `/captures/{user_id}/voice_{timestamp}.m4a`
- [ ] Unique filename generation: `voice_{Date.now()}.m4a`
- [ ] Max audio size: 25MB per file (updated from 10MB via migration 20251221000002)
- [ ] Supported formats: MP3, M4A, WAV (mobile recording formats)
- [ ] MIME types allowed: `audio/mpeg`, `audio/mp4`, `audio/x-m4a`, `audio/wav`, `audio/wave`
- [ ] RLS policies enforce user isolation (existing policies from Story 0.9 apply to audio)

**Audio Retrieval API:**
- [ ] `GET /api/captures/{capture_id}` endpoint (same endpoint for audio and photos)
- [ ] Filter by `type = 'audio'` if audio-specific query needed
- [ ] Return signed URL with 1-hour expiration
- [ ] Include metadata: `user_id`, `created_at`, `duration_sec`, `content_text` (transcript)
- [ ] Auto-refresh expired URLs on playback

**Audio Deletion API:**
- [ ] `DELETE /api/captures/{capture_id}` endpoint (same endpoint for audio and photos)
- [ ] Cascading cleanup: Delete from Storage + Database (`captures` table)
- [ ] Verify user owns capture before deletion (RLS + API check)
- [ ] Return success confirmation

**Re-transcribe API:**
- [ ] `POST /api/captures/{capture_id}/re-transcribe` endpoint
- [ ] Re-run transcription with optional provider selection (retry with Whisper if AssemblyAI failed)
- [ ] Track re-transcription count in capture metadata
- [ ] **Free retry policy**: First re-transcription is complementary (doesn't count against daily limit)
- [ ] Subsequent retries count against daily limit
- [ ] Update `captures.content_text` with new transcript
- [ ] Return updated capture with new transcript

### AC-3: API Endpoint

**POST /api/transcribe Endpoint:**
- [ ] Accept audio file via multipart/form-data
- [ ] Optional parameters:
  - `language` (default: 'en')
  - `capture_id` (link to existing capture record)
  - `subtask_instance_id` (link to bind)
  - `goal_id` (link to goal)
- [ ] Return response format:
  ```json
  {
    "data": {
      "transcript": "I completed my morning workout today...",
      "confidence": 0.92,
      "duration_sec": 45,
      "language": "en",
      "provider": "assemblyai",
      "audio_url": "signed_url_here"
    },
    "meta": {
      "timestamp": "2025-12-21T10:30:00Z"
    }
  }
  ```
- [ ] Handle transcription errors gracefully:
  - If STT fails → return audio URL + error message
  - User can retry transcription manually
- [ ] Rate limiting: Max 50 transcriptions per user per day
- [ ] Store transcript in `captures.content_text` field

### AC-4: Voice Recording UI (Whisper Flow Inspired)

**VoiceRecorder Component Design:**
- [ ] **Recording Interface** (inspired by Whisper Flow):
  - Circular microphone button (center, 80px diameter)
  - **3-button layout during recording:**
    - 🎤 Record button (center) - transforms to Stop when recording
    - ❌ Cancel button (left) - discard recording
    - ⏸️ Pause button (right) - pause/resume recording (optional for MVP)
  - Visual states:
    - Idle: Microphone icon, neutral color
    - Recording: Pulsing red circle animation, "Recording..." text
    - Paused: Frozen waveform, "Paused" text (optional)
  - Real-time waveform animation during recording (see below)
  - Elapsed time display (MM:SS format, updates every second)
  - Max recording duration: 5 minutes (enforced)
  - Warning at 4:30 ("⚠️ 30 seconds remaining")
  - Auto-stop at 5:00 limit with completion animation
  - Permissions handling (request microphone access with clear explanation)

**AudioWaveform Component:**
- [ ] **Real-time visualization** of audio input levels:
  - Bar-based waveform (similar to Whisper Flow)
  - 20-30 vertical bars arranged horizontally
  - Bar height varies with audio amplitude (0-100% of container height)
  - Smooth animation (60fps target)
  - Color: Primary gradient (blue → violet)
- [ ] **Recording states:**
  - Active: Bars animate with audio input
  - Paused: Bars frozen at last recorded state
  - Stopped: Bars fade out gradually
- [ ] **Performance optimization:**
  - Simple amplitude-based visualization (not FFT-based)
  - Use `expo-av` Audio.Recording.setOnRecordingStatusUpdate() for levels
  - Throttle updates to 30fps for performance
  - Maximum 30 bars to keep rendering lightweight

**TranscriptPreview Component:**
- [ ] Show transcript after transcription completes
- [ ] Edit capability (user can correct transcript)
- [ ] Confidence score indicator (color-coded):
  - 0.9-1.0: Green "High confidence"
  - 0.7-0.9: Yellow "Medium confidence"
  - <0.7: Red "Low confidence - please review"
- [ ] Save button to confirm edited transcript
- [ ] Re-transcribe button (retry with different provider)

**Playback Controls:**
- [ ] Play/pause button
- [ ] Scrubbing/seek bar (tap to jump to position)
- [ ] Playback speed (1x, 1.5x, 2x)
- [ ] Volume control (iOS only)
- [ ] Current time / total duration display

**Voice Note Badge:**
- [ ] Indicator icon on captures with audio (`🎤` or microphone icon)
- [ ] Display in capture list views
- [ ] Tap to open audio player

### AC-5: Rate Limiting

**Daily Limits per User:**
- [ ] Max 50 transcription requests per user per day
- [ ] Max 5 minutes audio length per request
- [ ] Track usage in `daily_aggregates` table:
  - Add column: `stt_request_count` (INT, default 0)
  - Add column: `stt_duration_minutes` (DECIMAL, default 0)
- [ ] Reset counters at midnight user's local timezone
- [ ] Check limits before allowing transcription

**Rate Limit Errors:**
- [ ] HTTP 429 status code for rate limit exceeded
- [ ] Error response format (Story 0.8 pattern):
  ```json
  {
    "error": {
      "code": "STT_RATE_LIMIT_EXCEEDED",
      "message": "Daily transcription limit reached (50/50 requests)",
      "retryable": false,
      "retryAfter": "2025-12-22T00:00:00Z"
    }
  }
  ```
- [ ] Include `Retry-After` header with next reset time

**Daily Usage Indicator:**
- [ ] Show in recording UI: "12/50 transcriptions used today"
- [ ] Update after each transcription
- [ ] Show warning at 80% usage: "40/50 transcriptions used today"
- [ ] Show error at 100% usage: "Daily limit reached. Resets at midnight."

### AC-6: Error Handling

**Error Code Mapping:**

| Scenario | Error Code | HTTP Status | User Message | Retryable |
|----------|-----------|-------------|--------------|-----------|
| Audio too long (>5 min) | `AUDIO_TOO_LONG` | 400 | "Audio too long (max 5 minutes)" | false |
| Invalid format | `INVALID_AUDIO_FORMAT` | 400 | "Only MP3, M4A, and WAV formats supported" | false |
| Storage quota exceeded | `STORAGE_QUOTA_EXCEEDED` | 507 | "Storage quota exceeded. Contact support." | false |
| Upload timeout (>30s) | `UPLOAD_TIMEOUT` | 504 | "Upload timed out. Check connection." | true |
| Rate limit exceeded | `STT_RATE_LIMIT_EXCEEDED` | 429 | "Daily limit reached (50/50 transcriptions)" | false |
| STT primary failed | `STT_PRIMARY_UNAVAILABLE` | 503 | "Transcribing..." (silent fallback to Whisper) | true |
| STT all providers failed | `STT_ALL_PROVIDERS_FAILED` | 503 | "Transcription failed. Audio saved. Retry?" | true |
| Network error (no connection) | `NETWORK_ERROR` | 503 | "No internet connection. Recording saved locally." | true |
| Microphone permission denied | `MICROPHONE_PERMISSION_DENIED` | 403 | "Microphone access required. Enable in Settings." | false |

**Handle Scenarios:**
- [ ] Audio too long (>5 minutes) → Error code `AUDIO_TOO_LONG`, display before upload
- [ ] Invalid format → Error code `INVALID_AUDIO_FORMAT`, validate on file selection
- [ ] Storage quota exceeded → Error code `STORAGE_QUOTA_EXCEEDED`, contact support CTA
- [ ] Upload timeout (>30s) → Error code `UPLOAD_TIMEOUT`, show retry button
- [ ] Rate limit exceeded → Error code `STT_RATE_LIMIT_EXCEEDED`, show reset time
- [ ] STT primary failed → Error code `STT_PRIMARY_UNAVAILABLE`, **silent fallback** to Whisper (user doesn't see error)
- [ ] STT all failed → Error code `STT_ALL_PROVIDERS_FAILED`, store audio only, show retry button
- [ ] Network error → Error code `NETWORK_ERROR`, queue recording for upload when online
- [ ] Microphone permission denied → Error code `MICROPHONE_PERMISSION_DENIED`, show iOS Settings deep link

**Provider Fallback Triggers:**
- [ ] AssemblyAI timeout: 30 seconds → fallback to Whisper
- [ ] AssemblyAI HTTP 5xx errors → immediate fallback to Whisper
- [ ] AssemblyAI rate limit (429) → wait 60s, then try Whisper
- [ ] Whisper timeout: 15 seconds → store audio only (no transcription)
- [ ] Whisper HTTP 5xx errors → store audio only
- [ ] Both providers fail → store audio with `content_text = NULL`, show retry UI

**Progress UI:**
- [ ] Recording state: "Recording..." with waveform animation
- [ ] Uploading state: "Uploading audio..." with progress bar
- [ ] Transcribing state: "Transcribing..." with spinner (5-15s typical)
- [ ] Success state: "Transcription complete ✓"
- [ ] Error state: Show error message with retry button

**Retry Logic:**
- [ ] 3 attempts with exponential backoff (1s, 2s, 4s)
- [ ] Retry on network errors (500, 502, 503, 504)
- [ ] Don't retry on client errors (400, 401, 403, 404, 429)
- [ ] Show retry attempt number: "Retrying transcription... (2/3)"

**Queue Failed Transcriptions Locally:**
- [ ] Store audio in AsyncStorage if upload fails
- [ ] Retry when connection restored
- [ ] Show queued transcriptions in UI: "1 transcription pending"
- [ ] Auto-sync on app foreground

---

## Tasks/Subtasks

### Task 1: Database Migration - Audio Storage Enhancement
- [ ] Create migration `20251221000002_audio_storage_enhancement.sql`
- [ ] Add `duration_sec` column to `captures` table (INT, nullable)
- [ ] Consolidate transcript columns: rename `transcript_text` → `content_text` usage pattern
- [ ] Create `captures` storage bucket (if not exists from Story 0.9)
- [ ] Set bucket config: private, 25MB limit, audio MIME types
- [ ] Create RLS policies for captures bucket (folder-based user isolation)
- [ ] Update `CHECK` constraints for audio type validation

### Task 2: Backend STT Service - Provider Abstraction
- [ ] Create `app/services/stt/` directory
- [ ] Implement `base.py` with `STTProvider` abstract class
- [ ] Define `TranscriptionResult` dataclass
- [ ] Implement `AssemblyAIProvider` class
  - [ ] API key from environment
  - [ ] Upload audio to AssemblyAI
  - [ ] Poll for transcription completion
  - [ ] Parse response with confidence score
  - [ ] Calculate cost ($0.0025/min)
- [ ] Implement `WhisperProvider` class
  - [ ] Use OpenAI SDK (already installed)
  - [ ] Direct transcription (no polling)
  - [ ] Language detection
  - [ ] Calculate cost ($0.006/min)
- [ ] Implement fallback chain logic in `stt_service.py`
- [ ] Add retry logic (3 attempts, exponential backoff)
- [ ] Log to `ai_runs` table with provider metadata

### Task 3: API Endpoints - Transcription & Audio Management
- [ ] Create `app/api/transcribe.py`
- [ ] Implement `POST /api/transcribe` endpoint
  - [ ] Accept multipart/form-data (audio file)
  - [ ] Validate file format and size
  - [ ] Check rate limits (daily_aggregates)
  - [ ] Upload to Supabase Storage
  - [ ] Call STT service with fallback
  - [ ] Store in captures table
  - [ ] Return transcript + audio URL
- [ ] Implement `GET /api/captures/{capture_id}` endpoint
  - [ ] Fetch from database
  - [ ] Generate signed URL (1-hour expiration)
  - [ ] Return with metadata
- [ ] Implement `DELETE /api/captures/{capture_id}` endpoint
  - [ ] Verify user ownership
  - [ ] Delete from Storage
  - [ ] Delete from Database
- [ ] Implement `POST /api/captures/{capture_id}/re-transcribe` endpoint
  - [ ] Check retry count (free first retry)
  - [ ] Run transcription with optional provider
  - [ ] Update captures.content_text

### Task 4: Rate Limiting & Cost Tracking
- [ ] Create migration to add columns to `daily_aggregates`:
  - `stt_request_count` INT DEFAULT 0
  - `stt_duration_minutes` DECIMAL DEFAULT 0
- [ ] Implement rate limit check function
  - [ ] Query daily_aggregates for today's usage
  - [ ] Check against limits (50 requests, 300 minutes)
  - [ ] Return HTTP 429 if exceeded
- [ ] Implement usage increment function
  - [ ] Atomic update of daily_aggregates
  - [ ] Reset at midnight (user's timezone)
- [ ] Add cost tracking to ai_runs table
  - [ ] Log provider, duration, cost per request
  - [ ] Monitor daily spend ($83.33 threshold)

### Task 5: Mobile Audio Recording Service
- [ ] Install `expo-av` package
- [ ] Create `src/services/audioRecording.ts`
  - [ ] Request microphone permissions
  - [ ] Configure audio mode for recording
  - [ ] Start/stop/pause recording
  - [ ] Get recording URI
  - [ ] Get recording status (duration, metering)
- [ ] Create `src/hooks/useAudioRecording.ts`
  - [ ] Manage recording state (idle, recording, paused, stopped)
  - [ ] Track elapsed time
  - [ ] Enforce 5-minute limit
  - [ ] Handle permission errors
  - [ ] Clean up resources on unmount

### Task 6: Mobile Audio Upload Service
- [ ] Create `src/services/audioUpload.ts`
  - [ ] Upload to Supabase Storage
  - [ ] Generate unique filename
  - [ ] Track upload progress
  - [ ] Support cancellation (AbortController)
- [ ] Create `src/hooks/useAudioUpload.ts` (TanStack Query)
  - [ ] Mutation for audio upload
  - [ ] Progress tracking
  - [ ] Error handling
  - [ ] Offline queue support

### Task 7: Mobile STT Service
- [ ] Create `src/services/sttService.ts`
  - [ ] API client for `/api/transcribe`
  - [ ] Call with audio file + metadata
  - [ ] Parse response
  - [ ] Handle errors
- [ ] Create `src/hooks/useTranscription.ts` (TanStack Query)
  - [ ] Mutation for transcription request
  - [ ] Cache transcripts (1-hour staleTime)
  - [ ] Offline support (networkMode: 'offlineFirst')
  - [ ] Invalidate cache on re-transcription

### Task 8: Mobile VoiceRecorder Component
- [ ] Create `src/components/VoiceRecorder.tsx`
  - [ ] Circular microphone button (80px)
  - [ ] 3-button layout (record, cancel, pause)
  - [ ] Visual states (idle, recording, paused, stopped)
  - [ ] Elapsed time display (MM:SS)
  - [ ] 5-minute limit enforcement
  - [ ] Warning at 4:30
  - [ ] Auto-stop at 5:00
  - [ ] Permission handling UI
- [ ] Use design system components (Button, Text, Card)
- [ ] Follow NativeWind styling patterns

### Task 9: Mobile AudioWaveform Component
- [ ] Create `src/components/AudioWaveform.tsx`
  - [ ] Render 20-30 vertical bars
  - [ ] Animate bar height based on audio amplitude
  - [ ] Use expo-av recording status for levels
  - [ ] Throttle updates to 30fps
  - [ ] Apply primary gradient color
  - [ ] Handle recording states (active, paused, stopped)
- [ ] Optimize for performance (lightweight rendering)

### Task 10: Mobile TranscriptPreview Component
- [ ] Create `src/components/TranscriptPreview.tsx`
  - [ ] Display transcript text
  - [ ] Editable text input
  - [ ] Confidence score indicator (color-coded)
  - [ ] Save button
  - [ ] Re-transcribe button
- [ ] Use design system Text and Input components

### Task 11: Mobile AudioPlayer Component
- [ ] Create `src/components/AudioPlayer.tsx`
  - [ ] Play/pause button
  - [ ] Seek bar (scrubbing)
  - [ ] Playback speed controls (1x, 1.5x, 2x)
  - [ ] Volume control (iOS only)
  - [ ] Time display (current / total)
- [ ] Create `src/hooks/useAudioPlayback.ts`
  - [ ] Manage playback state
  - [ ] Load audio from signed URL
  - [ ] Update position
  - [ ] Handle playback completion

### Task 12: Mobile VoiceRecordSheet Component
- [ ] Create `src/components/VoiceRecordSheet.tsx`
  - [ ] Bottom sheet container
  - [ ] Embed VoiceRecorder
  - [ ] Show AudioWaveform during recording
  - [ ] Show upload progress
  - [ ] Show transcription progress
  - [ ] Show TranscriptPreview on completion
- [ ] Handle sheet dismissal (confirm if recording active)

### Task 13: Mobile Rate Limit UI
- [ ] Create `src/components/VoiceUsageIndicator.tsx`
  - [ ] Display "X/50 transcriptions used today"
  - [ ] Fetch usage from daily_aggregates
  - [ ] Update after each transcription
  - [ ] Show warning at 80% (yellow)
  - [ ] Show error at 100% (red)
  - [ ] Display reset time
- [ ] Integrate into VoiceRecorder component

### Task 14: Mobile Error Handling
- [ ] Create error handling utilities in `src/services/sttService.ts`
  - [ ] Map HTTP errors to error codes
  - [ ] Create user-friendly error messages
  - [ ] Implement retry logic
- [ ] Create error UI components
  - [ ] Error banner with retry button
  - [ ] Permission denial deep link to Settings
  - [ ] Offline queue indicator
- [ ] Implement offline queueing
  - [ ] Store failed uploads in AsyncStorage
  - [ ] Retry on connection restore
  - [ ] Show pending count in UI

### Task 15: Backend Unit Tests
- [ ] Test `STTProvider` abstraction (`test_stt_base.py`)
  - [ ] Mock providers
  - [ ] Test abstract methods
- [ ] Test `AssemblyAIProvider` (`test_assemblyai_provider.py`)
  - [ ] Mock API responses
  - [ ] Test upload + poll flow
  - [ ] Test cost calculation
  - [ ] Test error handling
- [ ] Test `WhisperProvider` (`test_whisper_provider.py`)
  - [ ] Mock OpenAI API
  - [ ] Test direct transcription
  - [ ] Test language detection
  - [ ] Test cost calculation
- [ ] Test fallback chain (`test_stt_service.py`)
  - [ ] AssemblyAI success
  - [ ] AssemblyAI fail → Whisper success
  - [ ] Both fail → store audio only
- [ ] Test rate limiting (`test_rate_limiting.py`)
  - [ ] Check limits
  - [ ] Increment counters
  - [ ] Reset at midnight
- [ ] Coverage target: 80%+

### Task 16: Backend Integration Tests
- [ ] Test audio upload flow (`test_audio_upload.py`)
  - [ ] Upload to Storage
  - [ ] Create captures record
  - [ ] Verify RLS isolation
- [ ] Test transcription flow (`test_transcription_integration.py`)
  - [ ] Upload audio
  - [ ] Transcribe with mock STT
  - [ ] Store transcript
  - [ ] Verify cost tracking
- [ ] Test audio retrieval (`test_audio_retrieval.py`)
  - [ ] Fetch capture
  - [ ] Generate signed URL
  - [ ] Verify expiration
- [ ] Test audio deletion (`test_audio_deletion.py`)
  - [ ] Delete from Storage
  - [ ] Delete from Database
  - [ ] Verify cascading cleanup

### Task 17: Mobile E2E Tests
- [ ] Test voice recording flow (`VoiceRecorder.test.tsx`)
  - [ ] Start recording
  - [ ] Stop recording
  - [ ] Cancel recording
  - [ ] Max duration enforcement
- [ ] Test transcription flow (`useTranscription.test.ts`)
  - [ ] Upload audio
  - [ ] Mock transcription API
  - [ ] Display transcript
  - [ ] Edit transcript
- [ ] Test playback controls (`AudioPlayer.test.tsx`)
  - [ ] Play/pause
  - [ ] Seek
  - [ ] Speed control
- [ ] Test rate limiting UI (`VoiceUsageIndicator.test.tsx`)
  - [ ] Display usage count
  - [ ] Show warnings
  - [ ] Show limit error
- [ ] Test offline queueing (`audioUpload.test.ts`)
  - [ ] Queue failed upload
  - [ ] Retry on connection
  - [ ] Display pending count

### Task 18: Documentation & Manual Testing
- [ ] Update CLAUDE.md with STT patterns
- [ ] Document AssemblyAI + Whisper integration
- [ ] Document rate limiting logic
- [ ] Manual testing checklist:
  - [ ] iOS simulator recording
  - [ ] Android emulator recording
  - [ ] Microphone permissions
  - [ ] Recording quality
  - [ ] Transcription accuracy
  - [ ] Waveform animation
  - [ ] Playback controls
  - [ ] Rate limit warnings
  - [ ] Offline queueing
  - [ ] Cross-user isolation

---

## Dev Agent Record

### Implementation Plan

**Phase 1: Database & Storage Foundation**
- Create migration for audio storage enhancements
- Add duration_sec column
- Create captures bucket with RLS policies
- Update CHECK constraints

**Phase 2: Backend STT Service**
- Implement provider abstraction (base.py)
- Implement AssemblyAI provider
- Implement Whisper provider
- Implement fallback chain
- Add cost tracking and rate limiting

**Phase 3: Backend API Endpoints**
- POST /api/transcribe
- GET /api/captures/{capture_id}
- DELETE /api/captures/{capture_id}
- POST /api/captures/{capture_id}/re-transcribe

**Phase 4: Mobile Recording Infrastructure**
- Audio recording service
- Audio upload service
- STT service client
- TanStack Query hooks

**Phase 5: Mobile UI Components**
- VoiceRecorder component
- AudioWaveform component
- TranscriptPreview component
- AudioPlayer component
- VoiceRecordSheet component

**Phase 6: Testing & Validation**
- Backend unit tests (80%+ coverage)
- Backend integration tests
- Mobile E2E tests
- Manual testing on iOS/Android

### Debug Log
<!-- Record implementation decisions, blockers, and workarounds here -->

### Completion Notes
<!-- Summary of what was implemented, tests added, and any deviations from plan -->

---

## File List
<!-- Auto-generated list of all files created/modified during implementation -->

---

## Change Log
<!-- Auto-generated summary of changes made to the story during implementation -->

---

## References

- **PRD:** `docs/epics.md` (Story 0.11, lines 492-520)
- **Architecture:** `docs/architecture/core-architectural-decisions.md`
- **Implementation Patterns:** `docs/architecture/implementation-patterns-consistency-rules.md`
- **Security (RLS):** Story 0.4, `supabase/migrations/20251219170656_row_level_security.sql`
- **AI Service:** Story 0.6, `weave-api/app/services/ai_service.py`
- **Test Infrastructure:** Story 0.7, `weave-api/tests/` + `weave-mobile/src/components/__tests__/`
- **AssemblyAI API Docs:** https://www.assemblyai.com/docs
- **OpenAI Whisper API Docs:** https://platform.openai.com/docs/guides/speech-to-text
- **Expo AV Docs:** https://docs.expo.dev/versions/latest/sdk/av/
- **Supabase Storage Docs:** https://supabase.com/docs/guides/storage

---

**Status:** 🚀 **IN PROGRESS**

Implementation started: 2025-12-21
