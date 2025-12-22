# Epic 0: Foundation

## Overview

Before any user-facing features can be built, the development team must have a fully scaffolded, secure, and testable codebase with authentication, database, and AI infrastructure ready.

## User Stories

### US-0.1: Project Scaffolding

**Priority:** M (Must Have)

**As a** developer
**I want to** have a properly initialized Expo and FastAPI project
**So that** I can begin implementing features with the correct tech stack

**Acceptance Criteria:**
- [ ] Initialize Expo app using `npx create-expo-app` with blank-typescript template
- [ ] Use Expo SDK 53, React Native 0.79, React 19, Expo Router v5
- [ ] Initialize backend using `uv init` with FastAPI, uvicorn
- [ ] Use Python 3.11+, FastAPI 0.115+
- [ ] Configure NativeWind (Tailwind CSS for React Native) for styling
- [ ] Set up TanStack Query with `networkMode: 'offlineFirst'`
- [ ] Configure Zustand for shared UI state

**Story Points:** 5

---

### US-0.2: Supabase Setup

**Priority:** M (Must Have)

**As a** developer
**I want to** have Supabase configured with the database schema
**So that** authentication and data persistence work correctly

**Acceptance Criteria:**
- [ ] Create Supabase project with PostgreSQL database
- [ ] Run initial migrations for 8 core tables:
  - user_profiles, identity_docs, goals, subtask_templates
  - subtask_instances, subtask_completions, captures, journal_entries
- [ ] Configure Supabase Storage for user uploads
- [ ] Set up critical indexes on frequently queried columns
- [ ] Implement snake_case for database columns

**Story Points:** 5

---

### US-0.3: Authentication Flow

**Priority:** M (Must Have)

**As a** user
**I want to** be able to sign up and log in securely
**So that** my data is protected and associated with my account

**Acceptance Criteria:**
- [ ] Implement Supabase Auth with email + OAuth (Google, Apple)
- [ ] JWT token expiration set to 7 days
- [ ] Implement refresh token rotation
- [ ] Session management with secure storage
- [ ] Logout functionality clears local session

**Story Points:** 3

---

### US-0.4: Row Level Security (RLS)

**Priority:** M (Must Have) - **CRITICAL: Must complete before alpha release**

**As a** user
**I want to** know my data is secure from other users
**So that** I can trust the app with my personal reflections and goals

**Acceptance Criteria:**
- [ ] RLS policies on ALL user-owned tables (CRITICAL)
- [ ] Users can only SELECT/INSERT/UPDATE/DELETE own data
- [ ] API endpoint authorization validates user ownership
- [ ] Test RLS policies with multiple test users
- [ ] Document RLS policies in security documentation

**Story Points:** 5

---

### US-0.5: CI/CD Pipeline

**Priority:** M (Must Have)

**As a** developer
**I want to** have automated testing and deployment
**So that** code quality is maintained and releases are consistent

**Acceptance Criteria:**
- [ ] GitHub Actions for linting (ESLint, Black)
- [ ] GitHub Actions for type checking (TypeScript, mypy)
- [ ] GitHub Actions for running tests
- [ ] Expo EAS Build configured for iOS
- [ ] Railway deployment configured for FastAPI backend
- [ ] Environment variable management for staging/production

**Story Points:** 3

---

### US-0.6: AI Service Abstraction

**Priority:** M (Must Have)

**As a** developer
**I want to** have an abstracted AI provider layer
**So that** we can switch providers and implement fallbacks without changing business logic

**Acceptance Criteria:**
- [ ] Abstract AI provider interface supporting OpenAI and Anthropic
- [ ] Implement fallback chain: OpenAI → Anthropic → Deterministic
- [ ] Cost tracking with `input_tokens`, `output_tokens`, `model`, `cost_usd`
- [ ] Daily budget alerts at $83.33/day threshold
- [ ] Auto-throttle to cache-only mode at 100% daily budget
- [ ] Rate limiting: 10 AI calls/hour per user

**Story Points:** 3

---

### US-0.7: Test Infrastructure

**Priority:** M (Must Have)

**As a** developer
**I want to** have testing infrastructure set up
**So that** I can write and run tests for new features

**Acceptance Criteria:**
- [ ] Jest configured for React Native mobile testing
- [ ] pytest configured for FastAPI backend testing
- [ ] Test fixture factories for common entities (user, goal, subtask)
- [ ] Test database seeding scripts
- [ ] Minimum 1 integration test demonstrating the pattern

**Story Points:** 1

---

### US-0.8: Error Handling Framework

**Priority:** M (Must Have)

**As a** developer
**I want to** have a consistent error handling framework
**So that** users receive helpful error messages and errors are properly logged

**Acceptance Criteria:**
- [ ] Define standard error response format: `{error: {code, message, retryable, retryAfter?}}`
- [ ] Establish HTTP status codes for each error type:
  - 400 for validation errors
  - 401 for authentication errors
  - 429 for rate limiting
  - 500 for server errors
  - 503 for AI service unavailable
- [ ] Create error response utilities for backend
- [ ] Create error handling hooks for mobile (API errors, network errors, AI errors)
- [ ] Document all error codes in `/docs/api-error-codes.md`

**Technical Notes:**
- All API endpoints must return consistent error format
- Mobile should handle errors gracefully with user-friendly messages
- Error handling smoke tests must pass

**Story Points:** 3

---

### US-0.9: AI-Powered Image Service

**Priority:** M (Must Have)

**As a** user
**I want to** capture, manage, and get AI insights from my proof images
**So that** my progress is validated and I can see meaningful patterns over time

**Acceptance Criteria:**

**Full Image Service:**
- [ ] Image upload with validation: Max 10MB per image, JPEG/PNG only, minimum 100x100px
- [ ] Image storage in Supabase Storage (`/captures/images/{user_id}/`)
- [ ] Image retrieval API: `GET /api/captures/images?filter=goal_id|bind_id|date_range`
- [ ] Image deletion API: `DELETE /api/captures/images/{image_id}` with cascading cleanup
- [ ] Image Gallery UI: Chronological grid view, filter by goal/date
- [ ] Image Detail View: Full-screen image, swipe navigation, delete confirmation

**AI Vision Analysis (Gemini 3.0 Flash):**
- [ ] Integrate Gemini 3.0 Flash for image analysis (~$0.0005 per image)
- [ ] Create `services/vision_service.py` with provider abstraction
- [ ] Implement fallback chain: Gemini 3.0 Flash → GPT-4o Vision → Store image only
- [ ] AI vision features:
  - [ ] Proof validation: Detect if image shows claimed activity
  - [ ] OCR: Extract text from images (workout logs, food labels)
  - [ ] Content classification: Categorize image (gym, food, outdoor, workspace)
  - [ ] Proof quality scoring: Rate image quality/relevance (1-5 scale)
- [ ] Store AI analysis in `captures` table (`ai_analysis` JSONB column)
- [ ] Display AI insights in Image Detail View (extracted text, activity type, quality score)
- [ ] Show "AI Verified ✓" badge on validated proof

**Rate Limiting:**
- [ ] Max 5MB total uploads per user per day
- [ ] Max 20 images per user per day
- [ ] Max 20 AI vision analyses per user per day
- [ ] Track usage in `daily_aggregates` table (columns: `upload_count`, `upload_size_mb`, `ai_vision_count`)
- [ ] Reset counters at midnight user's local timezone

**Error Handling:**
- [ ] Handle scenarios: File too large, invalid format, storage quota exceeded, upload timeout, rate limit exceeded
- [ ] Progress UI with upload progress bar and cancel button
- [ ] Daily usage indicator: "3/20 images uploaded today (2.5MB/5MB used)"
- [ ] Retry logic: 3 attempts with exponential backoff
- [ ] Queue failed uploads locally for retry when online
- [ ] Loading state: "Analyzing image..." with progress indicator

**Data Requirements:**
- Write to `captures` table with `ai_analysis` JSONB column
- Write to `ai_runs` table for cost tracking
- Store images in Supabase Storage

**Technical Notes:**
- Gemini 3.0 Flash: $0.50 per 1M tokens (~$0.0005 per image), currently free during preview
- Cost projection: ~$90/month at 10K users (6K images/day)
- Rate limit errors return HTTP 429 with `Retry-After` header
- AI analysis triggers automatically on upload (can retry manually)
- Unblocks Epic 3 Stories 3.4, 3.5 (proof validation and image management)

**Story Points:** 8 (expanded from 3)

---

### US-0.10: Memory System Architecture Decision

**Priority:** M (Must Have)

**As a** developer
**I want to** have a clear memory storage architecture
**So that** AI can recall user context without over-engineering

**Acceptance Criteria:**
- [ ] Decision documented: Simple PostgreSQL TEXT[] arrays (no vector DB for MVP)
- [ ] Implement basic keyword search (no semantic/vector search yet)
- [ ] Define memory lifecycle: Created on journal submit, pruned at 100 memories per user
- [ ] Document memory schema in architecture docs
- [ ] Implement memory retrieval strategy for AI context

**Technical Notes:**
- Keep it simple for MVP - no fancy vector embeddings
- Memory storage works and retrieval returns relevant memories
- Can be enhanced with vector search post-MVP if needed

**Story Points:** 2

---

### US-0.11: Voice/Speech-to-Text Infrastructure

**Priority:** M (Must Have)

**As a** developer
**I want to** have a speech-to-text service integrated with the backend
**So that** voice recordings can be transcribed for captures and origin stories

**Acceptance Criteria:**

**Core STT Integration:**
- [ ] Integrate **AssemblyAI** as primary provider ($0.15/hr, 58% cheaper than Whisper)
- [ ] Integrate **OpenAI Whisper API** as fallback provider ($0.006/min, handles edge cases)
- [ ] Create `services/stt_service.py` with provider abstraction
- [ ] Implement STT fallback chain: AssemblyAI → Whisper API → Store audio only (manual transcript)
- [ ] Add STT cost tracking to `ai_runs` table (columns: `audio_duration_sec`, `provider`, `cost_usd`)
- [ ] Support audio formats: MP3, M4A, WAV (common mobile recording formats)

**Audio Storage:**
- [ ] Upload audio to Supabase Storage (`/captures/audio/{user_id}/{filename}.m4a`)
- [ ] Retrieval API: `GET /api/captures/audio/{audio_id}`
- [ ] Deletion API: `DELETE /api/captures/audio/{audio_id}`

**API Endpoint:**
- [ ] Create `/api/transcribe` POST endpoint accepting audio file (multipart/form-data)
- [ ] Return: `{transcript: string, confidence: number, duration_sec: number}`
- [ ] Handle transcription errors gracefully (return audio URL if STT fails)

**Voice Recording UI:**
- [ ] VoiceRecorder component: Microphone button in Quick Capture sheet, waveform animation, elapsed time, Stop button
- [ ] AudioWaveform component: Real-time waveform visualization during recording
- [ ] TranscriptPreview component: Show transcript with edit capability
- [ ] Playback controls: Play/pause, scrubbing, volume
- [ ] Voice Note Badge: Indicator on captures with audio attached
- [ ] Loading state: "Transcribing..." → "Transcript ready" → show text

**Rate Limiting:**
- [ ] Max 50 transcription requests per user per day (prevent abuse)
- [ ] Max 5 minutes audio length per request (prevent excessive costs)
- [ ] Track usage in `daily_aggregates` table (column: `transcription_count`)

**Testing:**
- [ ] Unit tests for STT service (mock provider responses)
- [ ] Integration test: Upload sample audio → verify transcript returned
- [ ] Cost tracking test: Verify `ai_runs` table logged correctly
- [ ] E2E test: Record voice → see transcript → play audio

**Technical Notes:**
- **Recommended Provider:** AssemblyAI
  - Cost: $0.15/hour (cheapest among top performers)
  - Accuracy: High (2nd place in 2025 benchmarks, better than Apple/Azure/AWS)
  - Ease of integration: Simple API, good docs, $50 free credits (333 hours testing)
  - Alternative: Deepgram ($0.46/hr, highest accuracy but 3x cost)
  - Fallback: OpenAI Whisper API ($0.006/min = $0.36/hr)

- **Cost Projections (10K users, MVP):**
  - 20% voice adoption (2K users)
  - 2 recordings/user/day, 30 sec average = 4K recordings/day, 2K min/day
  - Daily cost (AssemblyAI 90%): 4K * 0.5min * ($0.15/60min) * 0.9 = $4.50/day
  - Daily cost (Whisper 10%): 4K * 0.5min * $0.006/min * 0.1 = $1.20/day
  - **Total: $5.70/day = ~$186/month** (with overhead)
  - Well within AI budget ($2,500/month, $224/mo headroom)

- **Integration Points:**
  - Epic 1 FR-1.7: Origin Story voice commitment
  - Epic 3 FR-3.5: Quick Capture voice notes
  - Store audio: Supabase Storage `/captures/audio/{user_id}/{filename}.m4a`
  - Store transcripts: `captures` table (`transcript` TEXT column, nullable)

**Data Requirements:**
- Write to `captures` table with `transcript` TEXT column
- Write to `ai_runs` table for STT cost tracking
- Store audio files in Supabase Storage

**Story Points:** 5 (expanded from 3 to include UI components)

**Dependencies:**
- Requires: Story 0.2 (Database), Story 0.3 (Auth), Story 0.6 (AI Service Abstraction)
- Unblocks: Epic 1 Story 1.7 (voice commitment), Epic 3 Story 3.5 (voice capture), Epic 4 Story 4.2 (voice journal)

---

## Epic 0 Summary

| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| US-0.1 | Project Scaffolding | M | 5 pts |
| US-0.2a | Database Schema (Core Tables) | M | 3 pts |
| US-0.2b | Database Schema Refinement | M | 4 pts |
| US-0.3 | Authentication Flow | M | 3 pts |
| US-0.4 | Row Level Security (RLS) | M | 5 pts |
| US-0.5 | CI/CD Pipeline | M | 3 pts |
| US-0.6 | AI Service Abstraction | M | 3 pts |
| US-0.7 | Test Infrastructure | M | 3 pts |
| US-0.8 | Error Handling Framework | M | 3 pts |
| US-0.9 | AI-Powered Image Service | M | 8 pts |
| US-0.10 | Memory System Architecture | M | 2 pts |
| US-0.11 | Voice/STT Infrastructure | M | 5 pts |

**Epic Total:** 50 story points (increased from 40 pts)

**Cost Impact:**
- Story 0.9 (AI Vision): ~$90/month at 10K users (Gemini 3.0 Flash)
- Story 0.11 (STT): ~$186/month at 10K users (AssemblyAI 90% + Whisper 10%)
- **Total AI infrastructure cost: +$276/month** (well within $2,500/month AI budget)

**Dependencies:** None (True Foundation) - Epic 0 must complete before any other epic can begin

---
