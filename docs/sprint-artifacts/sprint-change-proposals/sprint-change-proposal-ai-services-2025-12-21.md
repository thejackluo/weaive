# Sprint Change Proposal: AI-Powered Image & Voice Services + Observability
**Date:** 2025-12-21
**Project:** Weavelight
**Epic:** Epic 0 - Foundation (+ NEW Epic 0.5)
**Prepared by:** BMAD Correct Course Workflow
**Status:** Pending Approval

---

## Executive Summary

This Sprint Change Proposal addresses critical infrastructure gaps identified during Epic 0 implementation that are essential for core product features in Epics 1, 3, and 4.

**Three Major Changes:**

1. **Story 0.9 (EXPANDED):** Transform from basic error handling to Full AI-Powered Image Service with Gemini 3.0 Flash vision analysis
2. **Story 0.11 (NEW):** Voice/Speech-to-Text Infrastructure with AssemblyAI (primary) + OpenAI Whisper (fallback)
3. **Epic 0.5 (NEW):** Post-Development Observability
   - Story 0.12: LogRocket session replay and debugging
   - Story 0.13: Error tracking and performance monitoring

**Scope Classification:** Moderate - Requires architecture updates and new infrastructure
**Impact:** Unblocks Epic 1 (voice commitments), Epic 3 (proof captures with AI analysis), Epic 4 (voice journal entries)
**MVP Status:** CRITICAL - These services are foundational for core product functionality
**Total Effort:** 8-10 days (64-80 hours)
**Cost Impact:** +$276/month at 10K users (well within $2,500/month AI budget, $224/mo headroom remaining)

---

## Section 1: Issue Summary

### Change #1: AI-Powered Image Service (Story 0.9 - EXPANDED)

**Problem Statement:**

Story 0.9 (Image Upload Error Handling) currently only handles file validation and upload error scenarios, but lacks:
- **AI-powered image analysis** to extract insights from proof captures
- **Image content verification** to detect if image actually shows bind completion
- **Image management** (view history, delete, organize by goal/bind)
- **Proof quality assessment** to encourage meaningful documentation

Without AI vision analysis, the app cannot:
- Verify if proof image actually shows the claimed activity
- Extract text from images (OCR for workout logs, food labels, etc.)
- Generate insights from visual proof over time
- Validate completion authenticity (trust-based system needs AI assistance)

**Discovery Context:**

Retrospective analysis of Epic 3 (Daily Actions & Proof) revealed that:
- US-3.4 (Attach Proof to Bind) mentions "optional proof" but doesn't specify how to validate or analyze
- US-3.5 (Quick Capture) stores photos but provides no automated insights
- Product vision emphasizes "proof builds evidence" but current architecture only stores images

**Evidence:**
- Epic 3 FR-3.4: "Attach proof to bind" - but no mechanism to analyze proof quality
- Epic 4 FR-4.3: "Review past reflections" - would benefit from visual timeline of proof
- PRD Non-Functional NFR-AI3: "AI must add value, not just exist" - image analysis fulfills this

**Industry Context:**
- Strava uses computer vision to verify activity types from photos
- MyFitnessPal uses OCR to extract nutrition data from food labels
- Duolingo uses image recognition for language learning exercises

**Cost Analysis (Gemini 3.0 Flash):**
- **Pricing:** $0.50 per 1M input tokens (images) + $3.00 per 1M output tokens
- **Image cost:** ~1,000 tokens per image = $0.0005 per image analyzed
- **Assumptions (10K users at MVP):**
  - 30% of users capture proof daily (3K active users)
  - Average 2 proof captures/user/day = 6K images/day
  - Daily cost: 6K images × $0.0005 = **$3/day = $90/month**
  - Annual cost at 10K users: **$1,080/year**

---

### Change #2: Voice/Speech-to-Text Infrastructure (Story 0.11 - EXPANDED)

**Problem Statement:**

The PRD specifies voice recording capabilities in multiple epics, but Epic 0 lacks the infrastructure to:
- Record and store voice audio
- Transcribe audio to text for searchability and AI processing
- Analyze voice sentiment and tone
- Handle voice input as a first-class capture type

**Missing Capabilities:**
1. **Voice recording UI** - Microphone interface, waveform visualization, playback
2. **Audio storage** - Supabase Storage integration for audio files (.m4a, .mp3)
3. **Speech-to-text** - API integration for transcription
4. **Voice capture association** - Link voice to binds, goals, journal entries
5. **Cost tracking** - Monitor STT API usage and costs

**Discovery Context:**

Identified during Epic 0 review when analyzing Epic 1 and Epic 3 requirements:
- Epic 1 FR-1.7: "Origin Story Capture with photo + **voice note** commitment"
- Epic 3 FR-3.5: "Quick Capture - photo/note/**voice**"
- Epic 4 FR-4.2: "Daily Journal Entry" (voice journal for convenience)

Without voice infrastructure, these features cannot be implemented in their respective epics.

**Evidence:**
- Epic 1 Story 1.7 explicitly requires voice commitment recording
- Epic 3 Story 3.5 lists voice as a capture type (MVP: optional)
- Epic 4 Story 4.2 could benefit from voice-based journaling for mobile convenience

**Industry Context:**
- Apple Health uses voice dictation for quick logging
- Headspace offers voice-based reflections
- Notion supports voice notes with auto-transcription

**Cost Analysis (OpenAI Whisper API):**
- **Pricing:** $0.006 per minute of audio transcribed
- **Assumptions (10K users at MVP):**
  - 20% of users record voice (2K users)
  - Average 2 voice recordings/user/day = 4K recordings/day
  - Average recording length: 30 seconds = 0.5 minutes
  - Daily cost: 4K recordings × 0.5 min × $0.006/min = **$12/day = $360/month**
  - Annual cost at 10K users: **$4,320/year**

**Alternative Considered:**
- **AssemblyAI** ($0.15/hour = $0.0025/min): 2.4x cheaper than Whisper API but requires additional setup
- **Whisper API chosen** for simplicity, OpenAI ecosystem integration, and proven accuracy

---

### Change #3: Epic 0.5 - Post-Development Observability (NEW EPIC)

**Problem Statement:**

Production debugging and user experience monitoring are critical for MVP launch, but no stories address:
- **Session replay** to understand user behavior and reproduce bugs
- **Error tracking** to catch and fix issues before users report them
- **Performance monitoring** to identify slow screens and API calls
- **User analytics** to track feature adoption and drop-off points

Without observability infrastructure:
- Bugs are hard to reproduce without user context
- Performance issues go undetected until users complain
- No visibility into how users actually use the app
- Support tickets require guesswork instead of data

**Discovery Context:**

User requested addition of:
- **Story 0.12:** LogRocket for session replay and debugging
- **Story 0.13:** Error tracking and performance monitoring

This represents a **new epic** (Epic 0.5) for post-development infrastructure that should be deployed before public launch.

**Evidence:**
- PRD NFR-R2: "Robust error handling and recovery" requires error tracking to work
- PRD NFR-P1: "Fast app performance" requires monitoring to validate
- Industry best practice: All B2C apps use session replay for support and debugging

**Cost Analysis (LogRocket + Sentry):**
- **LogRocket:** $99/month (up to 10K sessions/month) - session replay
- **Sentry:** Free tier (5K errors/month) or $26/month (50K errors) - error tracking
- **Total:** ~$125/month for observability stack
- **ROI:** Reduces support cost by 50%+ (fewer blind debugging sessions)

---

## Section 2: Impact Analysis

### 2.1 Epic Impact Assessment

**Epic 0: Foundation**

✅ **Current Epic Status:** Can accommodate these expansions as infrastructure stories
✅ **Story 0.9 (EXPANDED):** Image Upload → Full AI-Powered Image Service (8 story points, increased from 3)
✅ **Story 0.11 (NEW):** Voice/STT Infrastructure (5 story points)
✅ **Epic 0 Total Points:** Increases from 40 pts to **50 pts** (+10 pts)

**Epic 0.5: Post-Development Observability (NEW EPIC)**

✅ **Story 0.12:** LogRocket Integration (3 story points)
✅ **Story 0.13:** Error Tracking & Performance Monitoring (3 story points)
✅ **Epic 0.5 Total Points:** 6 story points

**Epic 1: Onboarding - UNBLOCKED**

Story 1.7 (Origin Story Capture) requires voice recording → Story 0.11 provides infrastructure

**Epic 3: Daily Actions & Proof - ENHANCED**

- Story 3.4 (Attach Proof) → Story 0.9 enables AI-powered proof validation
- Story 3.5 (Quick Capture) → Story 0.9 provides image management, Story 0.11 provides voice capture

**Epic 4: Reflection & Journaling - ENHANCED**

- Story 4.2 (Daily Journal) → Story 0.11 enables voice journaling
- Story 4.3 (Review Past Reflections) → Story 0.9 provides visual timeline with image analysis

**Dependency Impact:**
- **Story 0.9 UNBLOCKS:** Epic 3 Stories 3.4, 3.5 (proof analysis, image management)
- **Story 0.11 UNBLOCKS:** Epic 1 Story 1.7, Epic 3 Story 3.5, Epic 4 Story 4.2
- **Epic 0.5 UNBLOCKS:** Production launch readiness

---

### 2.2 Artifact Conflicts

#### PRD Conflicts

✅ **No conflicts identified**

**Enhancements:**
- Story 0.9 fulfills PRD vision: "Proof builds evidence" with AI-powered validation
- Story 0.11 fulfills existing PRD requirements:
  - Epic 1 FR-1.7: "Origin Story Capture with photo + **voice note**"
  - Epic 3 FR-3.5: "Quick Capture - photo/note/**voice**"
- Epic 0.5 fulfills NFR-R2 (Error handling), NFR-P1 (Performance monitoring)

**MVP Impact:** ✅ **Enhances MVP** - These are foundational capabilities, not scope creep

---

#### Architecture Conflicts

✅ **No conflicts - Additions required**

**Architecture Additions Needed:**

1. **AI Vision Service Architecture (Story 0.9):**
   - Add section: "AI Vision Provider Architecture"
   - Recommended provider: **Gemini 3.0 Flash**
   - Cost: $0.50/1M tokens (~$0.0005 per image)
   - Use cases:
     - Proof validation (detect if image shows claimed activity)
     - OCR (extract text from workout logs, food labels)
     - Content classification (gym, food, outdoor activity, etc.)
     - Proof quality scoring (encourage meaningful documentation)
   - Fallback chain: Gemini 3.0 Flash → GPT-4o Vision → Store image only
   - Integration: New `services/vision_service.py` in backend
   - Rate limiting: Max 20 AI vision analyses per user per day

2. **Full Image Service Architecture (Story 0.9):**
   - Image upload (already in Story 0.9)
   - Image storage (Supabase Storage `/captures/images/{user_id}/`)
   - Image retrieval (list, filter by goal/bind/date)
   - Image deletion (with cascading cleanup)
   - AI analysis results storage (`captures` table: `ai_analysis` JSONB column)
   - Image management UI (gallery view, detail view, delete confirmation)

3. **Voice/STT Infrastructure (Story 0.11):**
   - Add section: "Speech-to-Text Provider Architecture"
   - Primary provider: **AssemblyAI** ($0.15/hour, excellent accuracy-to-cost ratio)
   - Fallback provider: **OpenAI Whisper API** ($0.36/hour, handles edge cases)
   - Fallback chain: AssemblyAI → Whisper API → Store audio only (manual transcript later)
   - Audio storage: Supabase Storage `/captures/audio/{user_id}/`
   - Supported formats: MP3, M4A, WAV
   - Integration: New `services/stt_service.py` in backend
   - Rate limiting: Max 50 transcriptions per user per day, max 5 minutes per recording

4. **Observability Infrastructure (Epic 0.5):**
   - Add section: "Observability Architecture"
   - **LogRocket:** Session replay, user behavior tracking, performance monitoring
   - **Sentry:** Error tracking, crash reports, performance metrics
   - Integration points:
     - Frontend: React Native SDK for both services
     - Backend: Sentry SDK for FastAPI error tracking
   - Data retention: 30 days (LogRocket), 90 days (Sentry)
   - Privacy: Mask sensitive fields (passwords, auth tokens)

**No conflicts with existing architecture decisions** (state management, offline strategy, data access patterns remain unchanged)

---

#### UX/UI Specification Conflicts

✅ **No conflicts - UI additions required**

**UX Additions Needed:**

1. **AI Vision Analysis UI (Story 0.9):**
   - **Proof Analysis Badge:** "AI Verified ✓" on proof captures that pass validation
   - **Analysis Insights:** Show extracted text, activity classification, quality score
   - **Image Gallery:** View all proof images in chronological or goal-based view
   - **Image Detail View:** Full-screen image with AI analysis, edit/delete options
   - **Loading State:** "Analyzing image..." with progress indicator
   - **Error State:** "Could not analyze image" with retry button

2. **Voice Recording UI (Story 0.11):**
   - **Voice Capture Button:** Microphone icon in Quick Capture sheet (alongside photo/note)
   - **Recording UI:** Waveform animation + elapsed time + "Stop" button
   - **Playback UI:** Play/pause controls, scrubbing, volume
   - **Transcription Status:** "Transcribing..." → "Transcript ready" → show text
   - **Voice Note Badge:** Indicator on captures that have audio attached

3. **Observability UI (Epic 0.5):**
   - **No user-facing UI changes** (backend infrastructure only)
   - **Developer Dashboard:** LogRocket and Sentry dashboards for debugging

**Design System Impact:**
- New components: `VoiceRecorder`, `AudioWaveform`, `TranscriptPreview`, `ImageGallery`, `AIAnalysisBadge`

---

#### Other Artifacts

✅ **Testing Strategy (test-design.md):**
- Add test cases for AI vision service (Story 0.9)
- Add test cases for STT integration (Story 0.11)
- Add test cases for LogRocket/Sentry integration (Epic 0.5)

✅ **Security Architecture:**
- AI vision (Story 0.9): Rate limiting prevents abuse (20 analyses/user/day)
- Voice (Story 0.11): Rate limiting prevents abuse (50 transcriptions/user/day, 5 min max)
- Observability (Epic 0.5): Mask sensitive data in LogRocket/Sentry

✅ **CI/CD Pipeline (Story 0.5):**
- No changes needed - existing test pipelines handle new tests

---

## Section 3: Recommended Approach

### Selected Path: **Option 1 - Direct Adjustment**

**Rationale:**

All three changes are **additive enhancements** to Epic 0 and create a new observability epic (Epic 0.5). No rollback or MVP reduction needed. Direct implementation is the most efficient path.

**Why Not Rollback (Option 2)?**
- No completed stories need reverting
- Changes are forward-looking enhancements, not fixes

**Why Not MVP Review (Option 3)?**
- MVP scope is **enhanced, not expanded**
- These are infrastructure stories that unblock core product features

**Effort Estimate:** **Large**
- Story 0.9 expansion: 3-4 days (24-32 hours)
- Story 0.11 implementation: 2-3 days (16-24 hours)
- Epic 0.5 implementation: 1-2 days (8-16 hours)
- **Total: 8-10 days (64-80 hours)**

**Risk Level:** **Medium**
- Well-defined changes with clear scope
- External API dependencies (Gemini, Whisper, LogRocket, Sentry)
- Cost monitoring required to stay within AI budget

---

## Section 4: Detailed Change Proposals

### Change Proposal 1: Story 0.9 - AI-Powered Image Service (EXPANDED)

**Epic:** Epic 0 - Foundation
**Story ID:** 0.9 (EXPANDED from basic error handling)
**Priority:** M (Must Have)
**Story Points:** 8 (increased from 3)

#### Story Content:

**Title:** AI-Powered Image Service with Gemini Vision

**As a** developer
**I want to** have a complete image service with AI vision analysis
**So that** proof captures are validated, analyzed, and managed automatically

**Acceptance Criteria:**

**Full Image Service:**
- [ ] Implement image upload (extends Story 0.9 validation logic)
- [ ] Implement image storage in Supabase Storage (`/captures/images/{user_id}/{filename}.jpg`)
- [ ] Implement image retrieval API: `GET /api/captures/images?filter=goal_id|bind_id|date_range`
- [ ] Implement image deletion API: `DELETE /api/captures/images/{image_id}` (with cascading cleanup)
- [ ] Create Image Gallery UI (chronological grid view, filter by goal/date)
- [ ] Create Image Detail View (full-screen, swipe navigation, delete confirmation)

**AI Vision Analysis:**
- [ ] Integrate **Gemini 3.0 Flash** for image analysis
- [ ] Create `services/vision_service.py` with provider abstraction
- [ ] Implement AI vision fallback chain: Gemini 3.0 Flash → GPT-4o Vision → Store image only
- [ ] Add AI vision cost tracking to `ai_runs` table (columns: `image_count`, `provider`, `cost_usd`)
- [ ] Implement vision analysis features:
  - **Proof validation:** Detect if image shows claimed activity (e.g., gym equipment for workout bind)
  - **OCR:** Extract text from images (workout logs, food labels, etc.)
  - **Content classification:** Categorize image (gym, food, outdoor, workspace, etc.)
  - **Proof quality scoring:** Rate image quality/relevance (1-5 scale)
- [ ] Store AI analysis results in `captures` table (`ai_analysis` JSONB column)
- [ ] Display AI insights in Image Detail View (extracted text, activity type, quality score)

**API Endpoints:**
- [ ] `POST /api/captures/images/analyze` - Trigger AI vision analysis for existing image
- [ ] `GET /api/captures/images/{image_id}` - Get image with AI analysis results
- [ ] `GET /api/captures/images` - List user's images with filters

**Rate Limiting:**
- [ ] Max 20 AI vision analyses per user per day (prevent abuse)
- [ ] Max 5MB per image (already enforced by Story 0.9)
- [ ] Track usage in `daily_aggregates` table (`ai_vision_count` column)

**UI Components:**
- [ ] **AIAnalysisBadge:** "AI Verified ✓" badge on validated proof
- [ ] **ImageGallery:** Grid view of proof images with filters
- [ ] **ImageDetailView:** Full-screen image with AI insights, edit/delete options
- [ ] **Loading State:** "Analyzing image..." with progress indicator

**Testing:**
- [ ] Unit tests for vision service (mock Gemini API responses)
- [ ] Integration test: Upload image → trigger analysis → verify results stored
- [ ] Cost tracking test: Verify `ai_runs` table logged correctly
- [ ] E2E test: Capture proof → see AI verification badge

**Technical Notes:**

**Why Gemini 3.0 Flash?**
- **Cost:** $0.50 per 1M tokens (~$0.0005 per image) - 10x cheaper than GPT-4o Vision
- **Performance:** Fast inference (<2 seconds per image), low latency
- **Quality:** Excellent for proof validation, OCR, classification
- **Google Cloud integration:** Easy setup with Google Cloud Console
- **Preview bonus:** Currently free during preview period (but budget for paid pricing post-preview)
- **Scalability:** Can handle high volume (6K+ images/day)

**Cost Projections (10K users, MVP):**
- Assume 30% of users capture proof daily (3K users)
- Average 2 proof captures/user/day = 6K images/day
- Daily cost: 6K images × $0.0005 = **$3/day = $90/month**
- Annual cost at 10K users: **$1,080/year**
- Well within AI budget ($2,500/month)

**Integration Points:**
- Epic 3 FR-3.4: Proof validation for bind completions
- Epic 3 FR-3.5: Image management for quick captures
- Epic 4 FR-4.3: Visual timeline for past reflections

**Fallback Strategy:**
- If Gemini fails: Try GPT-4o Vision ($5/1M tokens = $0.005 per image)
- If both fail: Store image without analysis, user can retry later

---

### Change Proposal 2: Story 0.11 - Voice/Speech-to-Text Infrastructure (NEW)

**Epic:** Epic 0 - Foundation
**Story ID:** 0.11 (NEW)
**Priority:** M (Must Have)
**Story Points:** 5

#### Story Content:

**Title:** Voice/Speech-to-Text Infrastructure with AssemblyAI + OpenAI Whisper Fallback

**As a** developer
**I want to** have a speech-to-text service integrated with the backend
**So that** voice recordings can be transcribed for captures, commitments, and journal entries

**Acceptance Criteria:**

**Core STT Integration:**
- [ ] Integrate **AssemblyAI** as primary speech-to-text provider
- [ ] Integrate **OpenAI Whisper API** as fallback provider
- [ ] Create `services/stt_service.py` with provider abstraction
- [ ] Implement STT fallback chain: AssemblyAI → Whisper API → Store audio only (manual transcript)
- [ ] Add STT cost tracking to `ai_runs` table (columns: `audio_duration_sec`, `provider`, `cost_usd`)
- [ ] Support audio formats: MP3, M4A, WAV (common mobile recording formats)

**Audio Storage:**
- [ ] Implement audio upload to Supabase Storage (`/captures/audio/{user_id}/{filename}.m4a`)
- [ ] Implement audio retrieval API: `GET /api/captures/audio/{audio_id}`
- [ ] Implement audio deletion API: `DELETE /api/captures/audio/{audio_id}`

**API Endpoint:**
- [ ] Create `POST /api/transcribe` endpoint
- [ ] Accept audio file upload (multipart/form-data)
- [ ] Return: `{ transcript: string, confidence: number, duration_sec: number }`
- [ ] Handle transcription errors gracefully (return audio URL if STT fails)

**Rate Limiting:**
- [ ] Max 50 transcription requests per user per day (prevent abuse)
- [ ] Max 5 minutes audio length per request (prevent excessive costs)
- [ ] Track usage in `daily_aggregates` table (`transcription_count` column)

**Voice Recording UI:**
- [ ] **VoiceRecorder Component:**
  - Microphone icon button in Quick Capture sheet
  - Recording UI: Waveform animation + elapsed time + "Stop" button
  - Playback controls: Play/pause, scrubbing, volume
  - "Transcribing..." loading state → show transcript when ready
- [ ] **AudioWaveform Component:** Real-time waveform visualization during recording
- [ ] **TranscriptPreview Component:** Show transcript with edit capability
- [ ] **Voice Note Badge:** Indicator on captures that have audio attached

**Testing:**
- [ ] Unit tests for STT service (mock Whisper API responses)
- [ ] Integration test: Upload sample audio → verify transcript returned
- [ ] Cost tracking test: Verify `ai_runs` table logged correctly
- [ ] E2E test: Record voice → see transcript → play audio

**Technical Notes:**

**Why AssemblyAI (Primary)?**
- **Cost:** $0.15/hour = $0.0025/minute (58% cheaper than OpenAI Whisper)
- **Quality:** High accuracy (2nd place in 2025 benchmarks, only 2% behind Deepgram)
- **Ease of integration:** Simple REST API, excellent documentation
- **Free credits:** $50 free credits = 333 hours of transcription (enough for full MVP testing)
- **Advanced features:** Speaker diarization, sentiment analysis, auto-highlights

**Why OpenAI Whisper API (Fallback)?**
- **Cost:** $0.006/minute = $0.36/hour (backup when AssemblyAI fails)
- **Quality:** Industry-leading accuracy, proven reliability
- **OpenAI ecosystem:** Already using GPT-4o for AI coaching
- **Edge case handling:** Excellent for noisy audio, accents, multilingual

**Cost Projections (10K users, MVP):**
- Assume 20% of users record voice (2K users)
- Average 2 voice recordings/user/day = 4K recordings/day
- Average recording length: 30 seconds = 0.5 minutes
- Daily cost (AssemblyAI 90%): 4K × 0.5 min × ($0.15/60 min) × 0.9 = **$4.50/day**
- Daily cost (Whisper 10%): 4K × 0.5 min × $0.006/min × 0.1 = **$1.20/day**
- **Total: $5.70/day = $171/month = ~$186/month (with overhead)**
- Annual cost at 10K users: **$2,232/year**
- Well within AI budget ($2,500/month, $224/mo headroom remaining)

**Integration Points:**
- Epic 1 FR-1.7: Origin Story voice commitment
- Epic 3 FR-3.5: Quick Capture voice notes
- Epic 4 FR-4.2: Voice journal entries
- Store audio files in Supabase Storage `/captures/audio/{user_id}/`
- Store transcripts in `captures` table (`transcript` TEXT column, nullable)

**Dependencies:**
- Blocks: Epic 1 Story 1.7 (voice commitment), Epic 3 Story 3.5 (voice capture), Epic 4 Story 4.2 (voice journal)
- Requires: Story 0.2 (Database), Story 0.3 (Auth), Story 0.6 (AI Service Abstraction)

**Reference:**
This story expands on the original Sprint Change Proposal (`sprint-change-proposal-general-2025-12-21.md`) which identified the need for voice infrastructure and recommended AssemblyAI as the primary provider based on cost-to-accuracy analysis.

---

### Change Proposal 3: Epic 0.5 - Post-Development Observability (NEW EPIC)

**Epic ID:** 0.5 (NEW)
**Epic Name:** Post-Development Observability
**Priority:** M (Must Have for production launch)
**Total Story Points:** 6

#### Epic Overview:

Production debugging, error tracking, and user experience monitoring infrastructure to ensure product quality and enable fast issue resolution post-launch.

**Why Epic 0.5 (Not Epic 9)?**
- These are **foundational infrastructure stories**, not post-MVP enhancements
- Must be deployed **before public launch** to catch issues early
- Directly supports NFR-R2 (Error handling) and NFR-P1 (Performance monitoring)

---

#### Story 0.12: LogRocket Session Replay & Debugging (NEW)

**Priority:** M (Must Have)
**Story Points:** 3

**As a** developer
**I want to** have session replay and user behavior tracking
**So that** I can reproduce bugs and understand how users interact with the app

**Acceptance Criteria:**

**LogRocket Integration:**
- [ ] Create LogRocket account and obtain API key
- [ ] Install LogRocket React Native SDK in mobile app
- [ ] Configure LogRocket with user identification (user_id from Supabase Auth)
- [ ] Implement privacy controls: Mask sensitive fields (passwords, auth tokens)
- [ ] Set up LogRocket dashboard with:
  - Session replay video
  - Console logs
  - Network requests
  - Performance metrics (FPS, memory usage)
  - User actions (taps, navigation)

**Integration Points:**
- [ ] Add LogRocket initialization to `app/_layout.tsx` (root layout)
- [ ] Track custom events:
  - `goal_created`, `bind_completed`, `proof_captured`
  - `journal_submitted`, `triad_generated`
- [ ] Track screen views automatically (using Expo Router)

**Privacy & Security:**
- [ ] Mask input fields: password, auth token, sensitive profile data
- [ ] Disable session recording for settings/profile screens (optional toggle)
- [ ] Data retention: 30 days (LogRocket default)

**Testing:**
- [ ] Verify session recordings appear in LogRocket dashboard
- [ ] Verify sensitive fields are masked
- [ ] Verify custom events are tracked correctly

**Cost:**
- **LogRocket Plan:** $99/month (up to 10K sessions/month)
- **ROI:** Reduces support cost by 50%+ (fewer blind debugging sessions)

---

#### Story 0.13: Error Tracking & Performance Monitoring (NEW)

**Priority:** M (Must Have)
**Story Points:** 3

**As a** developer
**I want to** have error tracking and performance monitoring
**So that** I can catch issues before users report them and optimize slow screens

**Acceptance Criteria:**

**Sentry Integration:**
- [ ] Create Sentry account and obtain DSN keys (frontend + backend)
- [ ] Install Sentry React Native SDK in mobile app
- [ ] Install Sentry FastAPI SDK in backend
- [ ] Configure Sentry with:
  - Automatic error capture (unhandled exceptions, promise rejections)
  - Performance monitoring (screen load times, API response times)
  - Breadcrumbs (user actions leading to errors)
  - Release tracking (link errors to specific app versions)

**Frontend Monitoring:**
- [ ] Track screen load times for key screens:
  - Thread (Home), Goal Details, Journal Entry, Triad View
- [ ] Track API call performance:
  - `GET /api/goals`, `POST /api/completions`, `POST /api/journal-entries`
- [ ] Set up alerts for:
  - Error rate > 1% of sessions
  - API response time > 5 seconds

**Backend Monitoring:**
- [ ] Track API endpoint performance:
  - P50, P95, P99 latencies for all endpoints
  - Error rates by endpoint
- [ ] Set up alerts for:
  - API error rate > 0.5%
  - Database query time > 2 seconds
  - AI API failures (Gemini, Whisper, OpenAI)

**Testing:**
- [ ] Trigger test errors in dev environment → verify they appear in Sentry
- [ ] Verify performance metrics are tracked
- [ ] Verify alerts are configured correctly

**Cost:**
- **Sentry Plan:** Free tier (5K errors/month) or $26/month (50K errors)
- **ROI:** Proactive issue detection, faster debugging

---

**Epic 0.5 Total Cost:** ~$125/month (LogRocket + Sentry)

---

## Section 5: Implementation Handoff

### Change Scope Classification

**Scope:** **Moderate**

**Justification:**
- Changes are additive enhancements to Epic 0 + new observability epic
- No existing stories broken or invalidated
- Requires new architecture sections and external API integrations
- Moderate complexity: 3 stories + 1 new epic, 8-10 days effort

### Handoff Plan

**Route to:** Development Team (Direct Implementation) + Product Owner (for observability tooling decisions)

**Deliverables:**
1. Expanded Story 0.9 specification (from error handling to full AI-Powered Image Service)
2. New Story 0.11 specification (Voice/STT Infrastructure)
3. New Epic 0.5 specification (Post-Development Observability)
   - Story 0.12: LogRocket Integration
   - Story 0.13: Sentry Integration
4. Architecture updates:
   - AI Vision Provider Architecture (Gemini 3.0 Flash)
   - Full Image Service Architecture
   - Speech-to-Text Provider Architecture (OpenAI Whisper)
   - Observability Architecture (LogRocket + Sentry)
5. Updated test design checklist (Epic 0 + Epic 0.5)
6. Updated cost projections (AI budget analysis)

**Implementation Sequence:**

1. **Story 0.9 (AI-Powered Image Service Expansion):** 3-4 days (24-32 hours)
   - Backend: Integrate Gemini 3.0 Flash, create `/api/captures/images/analyze` endpoint
   - Database: Add `ai_analysis` JSONB column to `captures` table
   - Frontend: Create ImageGallery, ImageDetailView, AIAnalysisBadge components
   - Tests: Vision service integration tests, E2E proof validation test

2. **Story 0.11 (Voice/STT Infrastructure):** 2-3 days (16-24 hours)
   - Backend: Integrate AssemblyAI (primary) + OpenAI Whisper (fallback), create `/api/transcribe` endpoint
   - Database: Add `transcript` TEXT column to `captures` table
   - Frontend: Create VoiceRecorder, AudioWaveform, TranscriptPreview components
   - Tests: STT integration tests, E2E voice capture test

3. **Epic 0.5 (Observability):** 1-2 days (8-16 hours)
   - Story 0.12: LogRocket setup (1 day)
   - Story 0.13: Sentry setup (1 day)
   - Tests: Verify error tracking, session replay, performance metrics

**Success Criteria:**
- ✅ Users can upload images and see AI-powered proof validation ("AI Verified ✓" badge)
- ✅ AI vision extracts text, classifies activity, scores proof quality
- ✅ Users can record voice, see transcript, play audio
- ✅ Voice recordings transcribe successfully with <5 second latency
- ✅ LogRocket captures session replays with masked sensitive data
- ✅ Sentry tracks errors and performance metrics
- ✅ AI costs tracked in `ai_runs` table (vision + STT)
- ✅ All tests pass (unit + integration + E2E)

### Estimated Timeline

- **Story 0.9 Expansion:** 3-4 days (24-32 hours)
- **Story 0.11:** 2-3 days (16-24 hours)
- **Epic 0.5:** 1-2 days (8-16 hours)
- **Total:** **8-10 days (64-80 hours)**

**No sprint delay expected** if prioritized immediately after current Story 0.9 completion.

---

## Section 6: Cost Impact Analysis

### AI Budget Breakdown (10K Users at MVP)

| Service | Provider | Unit Cost | Usage Projection | Monthly Cost | Annual Cost |
|---------|----------|-----------|------------------|--------------|-------------|
| **AI Vision** | Gemini 3.0 Flash | $0.0005/image | 6K images/day | **$90/mo** | $1,080/yr |
| **Speech-to-Text** | AssemblyAI + Whisper | $0.0025/min (avg) | 2K min/day | **$186/mo** | $2,232/yr |
| **AI Coaching** | GPT-4o / Claude 3.7 | $15/MTok (avg) | Existing budget | $2,000/mo | $24,000/yr |
| **Total AI Costs** | - | - | - | **$2,276/mo** | $27,312/yr |

**Budget Headroom:** $224/month remaining (within $2,500/month AI budget ✅)

### Observability Budget

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| **LogRocket** | Starter (10K sessions) | $99/mo |
| **Sentry** | Free Tier (5K errors) | $0/mo |
| **Total Observability** | - | **$99/mo** |

**Total Added Cost:** $2,276/mo (AI) + $99/mo (Observability) = **$2,375/mo**

**Well within budget** (AI budget: $2,500/mo, total infrastructure: $2,375/mo)

### Cost Optimization Strategies

**If costs exceed budget:**
1. **AI Vision:** Reduce to 10 analyses/user/day (from 20) → saves $45/mo
2. **STT:** Use AssemblyAI only (remove Whisper fallback) → saves $36/mo
3. **STT:** Encourage shorter voice notes (<30 sec) → saves $93/mo
3. **LogRocket:** Downgrade to 5K sessions/month → saves $50/mo
4. **Sentry:** Stay on free tier (5K errors) → $0 impact

---

## Section 7: Artifacts Modified Summary

### Documents Requiring Updates

| Artifact | Update Type | Specific Changes |
|----------|-------------|------------------|
| **docs/epics.md** | Modify | Expand Story 0.9, Add Story 0.11, Add Epic 0.5 (Stories 0.12, 0.13) |
| **docs/prd/epic-0-foundation.md** | Modify | Expand US-0.9 (Image Service with AI), Add US-0.11 (Voice/STT) |
| **docs/prd/** | Create | `epic-0.5-observability.md` (new file) |
| **docs/architecture/core-architectural-decisions.md** | Add Section | AI Vision Architecture, Full Image Service, STT Architecture, Observability Architecture |
| **docs/test-design.md** | Modify | Add test cases for vision, STT, observability |
| **docs/architecture/implementation-patterns-consistency-rules.md** | Minor | Note AI service patterns for future stories |
| **docs/idea/ai.md** | Update | Add vision and STT to AI system architecture (lines 50-100) |

### Stories Affected

| Story | Status | Change Type | Impact |
|-------|--------|-------------|--------|
| **0.9** | EXPANDED | Scope Increase | From error handling (3 pts) to full AI Image Service (8 pts) |
| **0.11** | NEW | Addition | Voice/STT Infrastructure (new 5 pt story) |
| **0.12** | NEW | Addition | LogRocket Integration (new 3 pt story) |
| **0.13** | NEW | Addition | Sentry Integration (new 3 pt story) |

### New Epic Created

| Epic | Stories | Total Points | Purpose |
|------|---------|--------------|---------|
| **Epic 0.5** | Stories 0.12, 0.13 | 6 pts | Post-Development Observability |

---

## Approval & Next Steps

**Prepared by:** BMAD Correct Course Workflow
**Approval Status:** ⏳ **Pending**

**User Approval Required:**

Please review this Sprint Change Proposal and confirm:

1. ✅ **Story 0.9 Expansion** (from error handling to full AI-Powered Image Service with Gemini 3.0 Flash) is approved
2. ✅ **Story 0.11** (Voice/STT Infrastructure with AssemblyAI + Whisper fallback) is approved
3. ✅ **Epic 0.5** (Observability with LogRocket + Sentry) is approved
4. ✅ **Timeline estimate** (8-10 days, 64-80 hours) is acceptable
5. ✅ **Cost impact** (+$2,375/mo total, well within budget) is acceptable

**Post-Approval Actions:**
- [ ] Update `docs/epics.md` with expanded Story 0.9, new Story 0.11, new Epic 0.5
- [ ] Update `docs/prd/epic-0-foundation.md` with expanded US-0.9, new US-0.11
- [ ] Create `docs/prd/epic-0.5-observability.md`
- [ ] Add architecture sections (Vision, Image Service, STT, Observability)
- [ ] Update `docs/test-design.md` with new test cases
- [ ] Update AI budget tracker with new projections
- [ ] Create implementation tasks in backlog
- [ ] Assign to development team for immediate execution

---

**End of Sprint Change Proposal**
