# Story 0.11: Voice/Speech-to-Text Infrastructure

**Epic:** 0 - Foundation
**Story ID:** 0.11
**Story Key:** 0-11-voice-stt-infrastructure
**Priority:** Must Have (Foundation)
**Estimate:** 5 story points
**Status:** ready-for-dev

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

## Developer Context

### Technical Requirements

**Frontend (React Native/Expo):**
- **Audio Recording:**
  - Use `expo-av` (~14.0.0) for audio recording
  - Request permissions with `Audio.requestPermissionsAsync()`
  - Handle permission denials gracefully
  - Recording quality: `Audio.RecordingOptions.HIGH_QUALITY`
  - Audio format: M4A (iOS default), compressed for mobile

- **Audio Upload:**
  - Upload to Supabase Storage using `@supabase/supabase-js` ^2.88.0
  - Generate unique filenames: `{user_id}/voice_{Date.now()}.m4a`
  - Track upload progress with progress callbacks
  - Cancel upload on user request (AbortController)

- **Audio Playback:**
  - Use `expo-av` Audio.Sound API for playback
  - Implement custom controls (play, pause, seek, speed)
  - Display playback progress in real-time
  - Handle background audio (optional for MVP)

- **State Management:**
  - Use TanStack Query for transcription requests (server state)
  - Use `networkMode: 'offlineFirst'` for offline support
  - Cache transcripts with 1-hour `staleTime`
  - Invalidate cache on re-transcription

- **UI Components:**
  - Follow design system patterns (NativeWind + design tokens)
  - Use `@/design-system` components (Button, Card, Text)
  - Implement bottom sheet for recording flow (e.g., `VoiceRecordSheet`)
  - Use skeleton loaders during transcription

**Backend (Python FastAPI):**
- **STT Service:**
  - Create `app/services/stt_service.py`
  - Implement `STTProvider` abstract class (similar to `AIProvider` from Story 0.6)
  - Implement `AssemblyAIProvider` for AssemblyAI integration
  - Implement `WhisperProvider` for OpenAI Whisper API
  - Use provider abstraction pattern for easy swapping

- **AssemblyAI Integration:**
  - SDK: `assemblyai` Python package (`pip install assemblyai`)
  - API Key: Environment variable `ASSEMBLYAI_API_KEY`
  - Endpoint: `https://api.assemblyai.com/v2/transcript`
  - Process: Upload → Poll → Retrieve transcript
  - Async upload + webhook (optional for faster response)
  - Cost: $0.0025/minute

- **Whisper API Integration:**
  - Use OpenAI Python SDK (`openai` package, already installed from Story 0.6)
  - Model: `whisper-1`
  - API Key: Environment variable `OPENAI_API_KEY`
  - Cost: $0.006/minute
  - Direct transcription (no polling required)

- **API Endpoints:**
  - `POST /api/transcribe` - Transcribe audio file
  - `GET /api/captures/audio/{audio_id}` - Get audio file
  - `DELETE /api/captures/audio/{audio_id}` - Delete audio file
  - `POST /api/captures/audio/{audio_id}/re-transcribe` - Retry transcription

- **Rate Limiting:**
  - Check `daily_aggregates` table before transcription
  - Increment counters atomically (use database transaction)
  - Calculate midnight in user's local timezone (from `user_profiles.timezone`)
  - Return HTTP 429 with `Retry-After` header

- **Cost Tracking:**
  - Log STT requests to `ai_runs` table (Story 0.6 pattern)
  - Track: `model`, `audio_duration_sec`, `provider`, `cost_usd`, `confidence_score`
  - Calculate cost:
    - AssemblyAI: $0.0025/minute = $0.00004167/second
    - Whisper: $0.006/minute = $0.0001/second
  - Monitor daily spend with alerts at $83.33/day threshold

### Architecture Compliance

**Data Access Pattern:**
- Use **Supabase Direct** for audio storage (file uploads)
- Use **FastAPI Backend** for STT transcription (AI operations)
- Decision tree (from architecture):
  1. File storage? → Supabase direct ✓
  2. AI involvement? → FastAPI backend ✓

**State Management:**
- **TanStack Query** for transcription requests (server state)
- **Zustand** for UI state (e.g., recording state, playback controls)
- **useState** for local state (e.g., recording timer, waveform data)
- Never use Zustand for server data (transcripts, audio files)

**API Response Format:**
```typescript
// Success response (from Story 0.8 pattern)
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "type": "voice",
    "storage_key": "user-123/voice_1703167200000.m4a",
    "content_text": "I completed my morning workout today. Felt great!",
    "goal_id": "uuid",
    "subtask_instance_id": "uuid",
    "local_date": "2025-12-21",
    "duration_sec": 45,
    "confidence_score": 0.92,
    "language": "en",
    "provider": "assemblyai",
    "created_at": "2025-12-21T10:30:00Z"
  },
  "meta": {
    "timestamp": "2025-12-21T10:30:05Z"
  }
}

// Error response (from Story 0.8 pattern)
{
  "error": {
    "code": "STT_RATE_LIMIT_EXCEEDED",
    "message": "Daily transcription limit reached (50/50 requests)",
    "retryable": false,
    "retryAfter": "2025-12-22T00:00:00Z"
  }
}
```

**Naming Conventions:**
- **Database:** `snake_case` (e.g., `stt_request_count`, `audio_duration_sec`)
- **API Endpoints:** `snake_case` params (e.g., `?goal_id=xxx&local_date=2025-12-21`)
- **TypeScript:** `camelCase` variables, `PascalCase` components
- **Python:** `snake_case` functions, `PascalCase` classes

**Data Integrity:**
- **Immutable Tables:** None in this story (captures can be deleted)
- **Soft Delete:** NOT used for audio captures (hard delete from Storage + DB)
- **RLS Policies:** Enforce user isolation at both Storage and Database layers (Story 0.4 pattern)

### Library & Framework Requirements

**AssemblyAI (Primary STT Provider):**
- **SDK:** `assemblyai` Python package
- **Pricing:** $0.15/hour = $0.0025/minute
- **API Docs:** https://www.assemblyai.com/docs
- **Features:**
  - Automatic punctuation
  - Speaker diarization (optional)
  - Custom vocabulary (optional)
  - Sentiment analysis (optional)
  - Language detection
- **Free tier:** None (pay-as-you-go)
- **Rate limits:** Generous (1000 concurrent transcriptions)

**OpenAI Whisper (Fallback STT Provider):**
- **SDK:** `openai` Python package (already installed from Story 0.6)
- **Model:** `whisper-1`
- **Pricing:** $0.006/minute
- **API Docs:** https://platform.openai.com/docs/guides/speech-to-text
- **Features:**
  - Multilingual (99 languages)
  - Automatic language detection
  - Timestamps (optional)
  - Word-level timestamps (optional)
- **Rate limits:** 50 RPM (requests per minute)

**React Native/Expo Packages:**
```bash
# Audio recording & playback (ADD to weave-mobile)
expo install expo-av

# Supabase client (already installed from Story 0.1)
@supabase/supabase-js ^2.88.0

# State management (already installed from Story 0.1)
@tanstack/react-query ^5.0.0
zustand ^5.0.0

# Offline support (already installed from Story 0.1)
@react-native-async-storage/async-storage
@react-native-community/netinfo
```

**Python FastAPI Packages:**
```bash
# AssemblyAI SDK (NEW - add to pyproject.toml)
uv add assemblyai

# OpenAI SDK (already installed from Story 0.6)
openai

# Supabase client (already installed from Story 0.1)
supabase-py
```

### File Structure Requirements

**Frontend (weave-mobile/):**
```
src/
├── services/
│   ├── audioRecording.ts         # Audio recording service
│   ├── audioUpload.ts            # Audio upload to Supabase
│   └── sttService.ts             # STT API client (calls backend)
├── components/
│   ├── VoiceRecorder.tsx         # Main recording component
│   ├── AudioWaveform.tsx         # Real-time waveform visualization
│   ├── TranscriptPreview.tsx     # Show transcript with edit
│   ├── AudioPlayer.tsx           # Playback controls
│   └── VoiceRecordSheet.tsx      # Bottom sheet for recording
├── hooks/
│   ├── useAudioRecording.ts      # Hook for recording state
│   ├── useAudioUpload.ts         # TanStack Query hook for upload
│   ├── useTranscription.ts       # TanStack Query hook for STT
│   └── useAudioPlayback.ts       # Hook for playback controls
├── types/
│   └── audio.ts                  # TypeScript types
└── stores/
    └── audioRecordingStore.ts    # Zustand store for recording UI state
```

**Backend (weave-api/):**
```
app/
├── services/
│   ├── stt_service.py            # STT provider abstraction
│   ├── assemblyai_provider.py   # AssemblyAI implementation
│   └── whisper_provider.py      # OpenAI Whisper implementation
├── api/
│   └── transcribe.py            # API endpoints
├── models/
│   └── transcription.py         # Pydantic models
└── tests/
    ├── test_stt_service.py      # Unit tests
    └── test_transcribe_api.py   # Integration tests
```

**Database Migrations:**
```
supabase/migrations/
└── 20251221000003_audio_storage_and_stt.sql  # Storage bucket + RLS + columns
```

### Testing Requirements

**Unit Tests (Backend):**
- [ ] Test `STTProvider` abstraction with mock providers
- [ ] Test AssemblyAI integration (mock API responses)
- [ ] Test Whisper API integration (mock API responses)
- [ ] Test fallback chain (AssemblyAI → Whisper → Store only)
- [ ] Test rate limiting logic (daily_aggregates checks)
- [ ] Test cost tracking (ai_runs table logging)
- [ ] Coverage target: 80%+ for services

**Integration Tests (Backend):**
- [ ] Test audio upload → storage → database flow
- [ ] Test STT transcription → database storage
- [ ] Test audio retrieval with signed URLs
- [ ] Test audio deletion (Storage + DB cleanup)
- [ ] Test rate limiting enforcement (HTTP 429)
- [ ] Use pytest fixtures for test data

**E2E Tests (Mobile):**
- [ ] Test voice recording flow (record → upload → transcribe → display)
- [ ] Test playback controls (play, pause, seek, speed)
- [ ] Test transcript editing and saving
- [ ] Test re-transcription (retry with different provider)
- [ ] Test offline recording queueing
- [ ] Test rate limit UI feedback
- [ ] Use Expo's testing library (Jest + React Native Testing Library)

**Manual Testing Checklist:**
- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Test microphone permissions (grant, deny)
- [ ] Test recording quality (clarity, no distortion)
- [ ] Test transcription accuracy (read sample text)
- [ ] Test waveform animation (smooth, responsive)
- [ ] Test playback controls (all states)
- [ ] Test rate limit warnings (80%, 100%)
- [ ] Test offline recording queueing
- [ ] Test cross-user isolation (2 accounts)

---

## Git Intelligence Summary

**Recent Commit Patterns (Last 10 commits):**
- Story 0.9 implementation active (image service foundation)
- Commit message format: `feat: <description>` or `fix: <description>`
- Sprint change proposals documented before implementation
- Epic 0 expansion to 50 points (Stories 0.9 and 0.11 added)
- Testing infrastructure improvements (better organization)

**Learnings from Recent Work:**
- Epic 0 stories follow consistent structure: migration → service → API → UI
- RLS patterns established in Story 0.4 (reuse for Storage)
- AI service abstraction pattern from Story 0.6 (reuse for STT)
- Provider abstraction pattern works well (use for AssemblyAI + Whisper)
- Cost tracking via `ai_runs` table is standard (Story 0.6 pattern)
- Test infrastructure from Story 0.7 ready to use

---

## Latest Tech Information

**AssemblyAI (as of December 2025):**
- **Pricing:** $0.15/hour = $0.0025/minute
- **58% cheaper than Whisper** ($0.006/minute)
- **API:** RESTful API, async upload + polling
- **Accuracy:** Industry-leading (95%+ on clean audio)
- **Features:**
  - Automatic punctuation and capitalization
  - Speaker diarization (identify speakers)
  - Custom vocabulary (improve domain-specific accuracy)
  - Sentiment analysis
  - Entity detection
  - PII redaction (optional)
- **Rate Limits:** 1000 concurrent transcriptions
- **Free Tier:** None (pay-as-you-go)

**OpenAI Whisper API (as of December 2025):**
- **Model:** `whisper-1`
- **Pricing:** $0.006/minute
- **Languages:** 99 languages supported
- **API:** Direct transcription (no polling)
- **Features:**
  - Automatic language detection
  - Multilingual support
  - Timestamps
  - Word-level timestamps
- **Rate Limits:** 50 RPM (requests per minute)
- **Max File Size:** 25MB

**Cost Projection (10K users):**
- 30% voice adoption (3K users)
- 2 voice notes/user/day = 6K recordings/day
- Average duration: 30 seconds = 0.5 minutes
- Total minutes/day: 6K * 0.5 = 3K minutes/day
- 90% AssemblyAI + 10% Whisper (fallback)
- **AssemblyAI cost:** 2.7K min/day * $0.0025/min = $6.75/day
- **Whisper cost:** 300 min/day * $0.006/min = $1.80/day
- **Total: ~$8.55/day = ~$256.50/month**
- Well within $2,500/month AI budget (90% headroom)

**Supabase Storage Best Practices:**
- Use private buckets for user audio (require authentication)
- Implement RLS policies at Storage level (folder-based isolation)
- Generate signed URLs with short expiration (1 hour default)
- Monitor storage quota (free tier: 1GB, paid: unlimited with billing)
- Use storage triggers for cleanup (delete orphaned files)

**Expo AV Best Practices:**
- Request permissions before accessing microphone
- Use `Audio.setAudioModeAsync()` to configure recording mode
- Handle background audio carefully (iOS restrictions)
- Clean up audio resources on component unmount
- Use `Audio.RecordingOptions.HIGH_QUALITY` for best results

---

## Project Context Reference

**Critical Guidelines from CLAUDE.md:**
- **State Management:** Use TanStack Query for server state (transcripts), Zustand for UI state (recording controls), useState for local state
- **Design System:** ALWAYS use `@/design-system` components (Button, Card, Text, etc.)
- **Naming:** snake_case for DB/API, camelCase for TypeScript, PascalCase for components
- **Data Integrity:** captures table is NOT immutable (can be deleted)
- **Security:** RLS policies enforce user isolation at both Storage and Database layers
- **Offline:** Use TanStack Query `networkMode: 'offlineFirst'` for offline support

**Architecture Decisions:**
- **Data Access:** Supabase Direct for audio storage, FastAPI for STT transcription
- **STT Provider:** AssemblyAI primary (58% cheaper), Whisper fallback
- **Rate Limiting:** Track in daily_aggregates, reset at midnight user's local timezone
- **Cost Tracking:** Log to ai_runs table (Story 0.6 pattern)

---

## Dependencies

**Requires:**
- Story 0.2 (Database Schema) - `captures` table exists ✅
- Story 0.3 (Authentication) - JWT tokens for API access ✅
- Story 0.4 (RLS) - Security patterns for Storage + DB ✅
- Story 0.6 (AI Service Abstraction) - Provider pattern for STT ✅
- Story 0.7 (Test Infrastructure) - pytest + Jest setup ✅

**Unblocks:**
- Epic 1 Story 1.7 (Commitment Ritual & Origin Story) - Voice commitment recording
- Epic 3 Story 3.5 (Quick Capture) - Voice memo capture
- Epic 4 Story 4.2 (Daily Reflection) - Voice journal entries
- Epic 6 Story 6.1 (AI Chat) - Voice-to-text for chat input (future)

---

## Integration Points

### Epic 1: Onboarding (Optimized Hybrid Flow)

**US-1.7: Commitment Ritual & Origin Story:**
- Screen 2 (Origin Story Capture): Required voice note commitment
- Use `VoiceRecorder` component for recording
- Pass context: `user_id`, `commitment_type: 'origin_story'`
- Store audio in `captures` table with `type: 'voice'`
- Transcribe audio immediately after upload
- Display transcript in preview card (editable)
- Link to `origin_stories` record (immutable)

### Epic 3: Daily Actions & Proof

**US-3.5: Quick Capture (Document):**
- Floating menu → "Voice Note" button
- Use `VoiceRecordSheet` component (bottom sheet)
- No bind/goal linkage required (optional)
- Store with `local_date` only
- Support transcription or audio-only
- Display in capture list with 🎤 badge

### Epic 4: Reflection & Journaling

**US-4.1: Daily Reflection Entry:**
- Add "Voice Reflection" button to reflection screen
- Use `VoiceRecorder` component for recording
- Transcribe audio and populate reflection text field
- User can edit transcript before submitting
- Store both audio and transcript in `journal_entries` table

**US-4.2: Recap Before Reflection:**
- Fetch today's voice captures with `getUserCaptures(local_date, 'voice')`
- Display in recap screen with playback controls
- Show transcript preview (first 100 characters)
- Tap to expand full transcript

---

## Success Metrics

**Technical:**
- [ ] Audio upload success rate > 98%
- [ ] Average upload time < 2 seconds
- [ ] STT transcription success rate > 95%
- [ ] Average transcription time < 10 seconds (AssemblyAI)
- [ ] Average transcription time < 5 seconds (Whisper)
- [ ] Zero cross-user access incidents (RLS working)
- [ ] Rate limit enforcement 100% (no bypasses)

**User Experience:**
- [ ] Microphone launch < 1 second
- [ ] Recording quality: Clear, no distortion
- [ ] Transcription accuracy: 95%+ on clean audio
- [ ] Playback controls responsive (<200ms)
- [ ] Clear progress feedback during upload/transcription
- [ ] Graceful error handling with retry

**Business:**
- [ ] Voice capture adoption rate (target: 30%+)
- [ ] Voice notes per user per day (target: 2+)
- [ ] Voice reflection usage (target: 15%+)
- [ ] STT costs per user (target: <$0.30/month)
- [ ] User retention impact (measure voice vs. text-only users)

---

## Cost Impact Summary

**AssemblyAI (Primary STT):**
- ~$202.50/month at 10K users (2.7K min/day)
- 58% cheaper than Whisper
- Industry-leading accuracy
- Well within $2,500/month AI budget

**OpenAI Whisper (Fallback STT):**
- ~$54/month at 10K users (300 min/day fallback, 10% of requests)
- Multilingual support
- Reliable fallback option

**Supabase Storage:**
- 10K users * 60 voice notes/month * 500KB avg = 300GB/month
- Supabase pricing: $0.021/GB/month = ~$6.30/month
- Total infrastructure cost: ~$262.80/month (STT + Storage)

**Total Epic 0 AI Infrastructure:**
- Story 0.6 (AI Service Abstraction): Base infrastructure
- Story 0.9 (AI Vision): +$90/month (Gemini 3 Flash)
- Story 0.11 (Voice/STT): +$256.50/month (AssemblyAI + Whisper)
- **Total: ~$346.50/month** (well within $2,500/month budget, 86% headroom)

---

## Rollout Checklist

### Development Phase
- [ ] Create audio storage bucket migration
- [ ] Implement STT service with AssemblyAI + Whisper
- [ ] Create API endpoints (transcribe, get, delete, re-transcribe)
- [ ] Build mobile components (VoiceRecorder, AudioWaveform, TranscriptPreview, etc.)
- [ ] Implement rate limiting logic
- [ ] Add STT cost tracking to ai_runs table
- [ ] Write unit tests (80%+ coverage)
- [ ] Write integration tests
- [ ] Update CLAUDE.md with new patterns

### Testing Phase
- [ ] Run migration on local Supabase
- [ ] Test microphone permissions (grant, deny)
- [ ] Test audio recording quality
- [ ] Test STT transcription accuracy (AssemblyAI)
- [ ] Test fallback to Whisper
- [ ] Test rate limiting (approach 80%, hit 100%)
- [ ] Test offline recording queueing
- [ ] Test RLS security (2 test accounts)
- [ ] Test audio file format validation
- [ ] Load test (20 concurrent transcriptions)

### Staging Phase
- [ ] Apply migrations to staging database
- [ ] Create test users with voice recordings
- [ ] Verify cross-user isolation
- [ ] Monitor STT costs (AssemblyAI + Whisper)
- [ ] Monitor storage usage
- [ ] Test error scenarios (timeout, rate limit, network error)
- [ ] Performance profiling (upload, transcription, playback)

### Production Phase
- [ ] Apply migrations to production database
- [ ] Enable AssemblyAI + Whisper in production
- [ ] Monitor error rates (target: <2%)
- [ ] Track storage usage metrics
- [ ] Set up alerts for rate limits
- [ ] Set up alerts for storage quota (80%, 100%)
- [ ] Set up alerts for STT costs ($83.33/day threshold)
- [ ] Document any issues in `docs/bugs/`

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

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2025-12-21 | Bob (Scrum Master) | Initial story creation using BMAD create-story workflow in YOLO mode. Comprehensive developer guide with AssemblyAI + Whisper integration. |

---

**Status:** ✅ **READY FOR DEVELOPMENT**

This comprehensive story provides the DEV agent with everything needed for flawless implementation: complete requirements, architecture constraints, latest technical specs, file structure, testing requirements, and integration points.

**Next Steps:**
1. **Optional:** Run `*validate-create-story` for quality competition review
2. **Required:** Run `dev-story` workflow to implement Story 0.11
3. **Required:** Run `code-review` when implementation complete

---

`★ Insight ─────────────────────────────────────`
**AssemblyAI vs. Whisper Cost Efficiency:**
AssemblyAI is 58% cheaper than Whisper ($0.0025/min vs $0.006/min). At scale (10K users, 3K min/day), this saves ~$153/month ($256.50 vs $410), making it the clear primary choice while maintaining Whisper as a robust fallback.

**Provider Abstraction Pattern:**
Following the same pattern from Story 0.6 (AI Service) and Story 0.9 (Vision), we use abstract base classes to enable seamless provider swapping. This architectural consistency reduces cognitive load and makes the codebase more maintainable.

**Voice as a First-Class Citizen:**
Voice infrastructure unlocks three critical user experiences: (1) Origin Story emotional commitment (Epic 1), (2) Quick capture without typing friction (Epic 3), and (3) Reflective journaling in natural speech (Epic 4). This is foundational for the product's "low-friction, high-impact" philosophy.
`─────────────────────────────────────────────────`
