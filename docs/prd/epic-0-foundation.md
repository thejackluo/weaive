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

### US-0.9: Image Upload Error Handling

**Priority:** M (Must Have)

**As a** user
**I want to** understand what went wrong when image uploads fail and have fair daily limits
**So that** I can take corrective action and system costs are controlled

**Acceptance Criteria:**
- [ ] Implement file validation: Max 10MB per image, JPEG/PNG only, minimum 100x100px
- [ ] Implement rate limiting:
  - [ ] Max 5MB total uploads per user per day
  - [ ] Max 20 images per user per day
  - [ ] Track daily usage in `daily_aggregates` table (columns: `upload_count`, `upload_size_mb`)
  - [ ] Reset counters at midnight user's local timezone
- [ ] Handle error scenarios:
  - File too large (per-file limit)
  - Invalid file format
  - Storage quota exceeded
  - Upload timeout
  - Rate limit exceeded (daily limit)
- [ ] Display progress UI with upload progress bar and cancel button
- [ ] Show daily usage indicator: "3/20 images uploaded today (2.5MB/5MB used)"
- [ ] Implement retry logic with 3 attempts using exponential backoff
- [ ] Queue failed uploads locally for retry when connection returns

**Technical Notes:**
- User sees clear, actionable error messages
- Failed uploads automatically retry when online
- Rate limit enforced server-side (backend validation)
- Rate limit errors return HTTP 429 with `Retry-After` header (seconds until midnight)
- Supabase Storage integration with signed URLs

**Story Points:** 3

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

Core Integration:
- [ ] Research and select B2B speech-to-text provider (recommended: AssemblyAI)
- [ ] Create `services/stt_service.py` with provider abstraction
- [ ] Implement STT fallback chain: AssemblyAI → Whisper API → Store audio only (manual transcript later)
- [ ] Add STT cost tracking to `ai_runs` table (columns: `audio_duration_sec`, `provider`, `cost_usd`)
- [ ] Support audio formats: MP3, M4A, WAV (common mobile recording formats)

API Endpoint:
- [ ] Create `/api/transcribe` POST endpoint
- [ ] Accept audio file upload (multipart/form-data)
- [ ] Return: `{ transcript: string, confidence: number, duration_sec: number }`
- [ ] Handle transcription errors gracefully (return audio URL if STT fails)

Rate Limiting:
- [ ] Max 50 transcription requests per user per day (prevent abuse)
- [ ] Max 5 minutes audio length per request (prevent excessive costs)
- [ ] Track usage in `daily_aggregates` table

Testing:
- [ ] Unit tests for STT service (mock provider responses)
- [ ] Integration test: Upload sample audio → verify transcript returned
- [ ] Cost tracking test: Verify `ai_runs` table logged correctly

**Technical Notes:**
- **Recommended Provider:** AssemblyAI
  - Cost: $0.15/hour (cheapest among top performers)
  - Accuracy: High (2nd place in 2025 benchmarks, better than Apple/Azure/AWS)
  - Ease of integration: Simple API, good docs, $50 free credits (333 hours testing)
  - Alternative: Deepgram ($0.46/hr, highest accuracy but 3x cost)
  - Fallback: OpenAI Whisper API ($0.006/min = $0.36/hr)

- **Cost Projections (10K users, MVP):**
  - 20% voice adoption (2K users)
  - 2 recordings/user/day, 30 sec average
  - Daily cost: 4K recordings * 0.5min * ($0.15/60min) = $5/day = $150/month
  - Well within AI budget ($2,500/month)

- **Integration Points:**
  - Epic 1 FR-1.7: Origin Story voice commitment
  - Epic 3 FR-3.5: Quick Capture voice notes
  - Store audio: Supabase Storage `/captures/audio/{user_id}/{filename}.m4a`
  - Store transcripts: `captures` table (`transcript` TEXT column, nullable)

**Story Points:** 3

**Dependencies:**
- Requires: Story 0.2 (Database), Story 0.3 (Auth), Story 0.6 (AI Service Abstraction)
- Unblocks: Epic 1 Story 1.7 (voice commitment), Epic 3 Story 3.5 (voice capture)

---

## Epic 0 Summary

| Metric | Value |
|--------|-------|
| Total Story Points | 43 |
| Priority M (Must Have) | 11 |
| Priority S (Should Have) | 0 |
| Dependencies | None (True Foundation) |

---
