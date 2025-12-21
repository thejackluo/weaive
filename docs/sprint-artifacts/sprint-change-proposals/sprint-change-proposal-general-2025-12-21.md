# Sprint Change Proposal
**Date:** 2025-12-21
**Project:** Weavelight
**Epic:** Epic 0 - Foundation
**Prepared by:** BMAD Correct Course Workflow
**Status:** Pending Approval

---

## Executive Summary

This Sprint Change Proposal addresses two modifications to Epic 0 (Foundation):

1. **Change #1:** Add rate limiting to Story 0.9 (Image Upload Error Handling) to control storage costs and prevent abuse
2. **Change #2:** Create new Story 0.11 (Voice/Speech-to-Text Infrastructure) to add voice recording capabilities for captures

**Scope Classification:** Minor - Direct implementation by development team
**Impact:** Enhances Epic 0 with cost controls and voice feature foundation
**MVP Status:** Maintained - Changes enhance MVP without blocking core functionality

---

## Section 1: Issue Summary

### Change #1: Image Upload Rate Limits (Story 0.9 Enhancement)

**Problem Statement:**
Story 0.9 currently handles image upload validation (file size, format, dimensions) and error handling but lacks rate limiting. Without rate limits, users could:
- Upload unlimited images per day, causing storage costs to spiral
- Abuse the system with excessive uploads
- Create performance issues with concurrent uploads

**Discovery Context:**
Identified during Story 0.9 implementation planning. User requested adding rate limits to prevent potential abuse and control AWS/Supabase Storage costs.

**Evidence:**
- Current Story 0.9 AC: "Max 10MB per image" (per-file limit only)
- No daily/monthly limits specified in original requirements
- Industry standard: Most B2B apps limit daily uploads (Slack: 1GB/user/day, Discord: 10 files/10s)

---

### Change #2: Voice/Speech-to-Text Infrastructure (New Story 0.11)

**Problem Statement:**
The PRD and UX design specify voice recording capabilities for captures (Epic 3), but Epic 0 lacks the infrastructure story to set up speech-to-text integration. Without this foundation:
- Voice capture cannot be implemented in Epic 3
- No AI transcription pipeline exists
- Missing cost/provider decisions for STT services

**Discovery Context:**
Identified during Epic 0 review. User requested adding voice infrastructure as a new foundation story to unblock Epic 3 voice features.

**Evidence:**
- Epic 3 FR-3.5: "Quick Capture with photo/note/**voice**"
- Epic 1 FR-1.7: "Origin Story Capture with photo + **voice note** commitment"
- No Epic 0 story addresses STT provider selection or integration
- Research conducted on B2B STT services (Deepgram, AssemblyAI, OpenAI Whisper, AWS Transcribe, Azure, Google)

---

## Section 2: Impact Analysis

### 2.1 Epic Impact Assessment

**Epic 0: Foundation**

✅ **Current Epic Status:** Can be completed with these additions
✅ **Story 0.9:** Requires modification to add rate limiting (scope increase)
✅ **New Story 0.11:** Addition to Epic 0 (new infrastructure story)

**Modifications Required:**
- **Story 0.9:** Add 2 new acceptance criteria for rate limiting
- **Epic 0 Total Points:** Increases from 40 pts to 43 pts (Story 0.9: +0 pts, Story 0.11: +3 pts)

**Epic 1-8 Impact:**
✅ **No blocking impact** - Both changes are foundational and don't affect other epics' requirements

**Dependency Impact:**
- Voice infrastructure (Story 0.11) **unblocks** Epic 1 FR-1.7 (voice commitment) and Epic 3 FR-3.5 (voice capture)
- Image rate limits (Story 0.9) have **no downstream dependencies**

---

### 2.2 Artifact Conflicts

#### PRD Conflicts

✅ **No conflicts identified**

**Enhancements:**
- Image rate limits align with NFR-R1 (Zero data loss) and NFR-S4 (Max 500MB storage/user)
- Voice infrastructure fulfills existing PRD requirements:
  - Epic 1 FR-1.7: "Origin Story Capture with photo + **voice note**"
  - Epic 3 FR-3.5: "Quick Capture - photo/note/**voice**"

**MVP Impact:** ✅ **No change** - Enhancements support existing MVP scope

---

#### Architecture Conflicts

✅ **No conflicts - Additions required**

**Architecture Additions Needed:**

1. **Rate Limiting Strategy (Story 0.9):**
   - Add section: "Rate Limiting Architecture"
   - Document: Per-user daily limits (5MB total, 20 images max)
   - Implementation: Track uploads in `daily_aggregates` table or new `user_upload_stats` table
   - Storage calculation: 5MB/day * 10K users = 50GB/day max (controlled cost)

2. **Voice/STT Infrastructure (Story 0.11):**
   - Add section: "Speech-to-Text Provider Architecture"
   - Recommended provider: **AssemblyAI** (best accuracy-to-cost ratio)
   - Fallback chain: AssemblyAI → Whisper → Local storage (transcript manually later)
   - Cost tracking: Log STT API calls in `ai_runs` table
   - Integration: New `services/stt_service.py` in backend

**No conflicts with existing architecture decisions** (state management, offline strategy, data access patterns remain unchanged)

---

#### UX/UI Specification Conflicts

✅ **No conflicts - UI additions required**

**UX Additions Needed:**

1. **Image Upload Rate Limit UI (Story 0.9):**
   - **Error message:** "Daily upload limit reached (20 images or 5MB). Try again tomorrow."
   - **Progress indicator:** "3 images uploaded today (15MB remaining)" - shown in Quick Capture UI
   - **Location:** Capture upload screen + settings page (show usage stats)

2. **Voice Recording UI (Story 0.11):**
   - **Voice capture button:** Microphone icon in Quick Capture sheet (alongside photo/note)
   - **Recording UI:** Waveform animation + elapsed time + "Stop" button
   - **Playback:** Preview recorded audio before attaching to capture
   - **Transcription status:** "Transcribing..." loading state → show transcript when ready

**Design System Impact:** Requires new components (VoiceRecorder, AudioWaveform, TranscriptPreview)

---

#### Other Artifacts

✅ **Testing Strategy (test-design.md):**
- Add test cases for rate limiting (Story 0.9)
- Add STT integration tests (Story 0.11)

✅ **Security Architecture:**
- Rate limiting enhances SEC-I4 (Rate limiting on all endpoints)
- Voice uploads follow same SEC-D4 (Supabase Storage signed URLs) pattern as images

✅ **CI/CD Pipeline (Story 0.5):**
- No changes needed - existing test pipelines handle new tests

---

## Section 3: Recommended Approach

### Selected Path: **Option 1 - Direct Adjustment**

**Rationale:**
Both changes are additive enhancements to Epic 0. No rollback or MVP reduction needed. Direct implementation is the most efficient path.

**Why Not Rollback (Option 2)?**
- No completed stories need reverting
- Changes are forward-looking enhancements, not fixes

**Why Not MVP Review (Option 3)?**
- MVP scope remains intact
- Changes enhance but don't expand MVP goals

**Effort Estimate:** **Medium**
- Story 0.9 modification: ~2 hours (add rate limit checks + tests)
- Story 0.11 implementation: ~8-12 hours (STT integration + testing)

**Risk Level:** **Low**
- Well-defined changes with clear scope
- No architectural conflicts
- Established patterns (rate limiting, API integration) already in use

---

## Section 4: Detailed Change Proposals

### Change Proposal 1: Story 0.9 - Add Image Upload Rate Limits

**Story ID:** 0.9 (Image Upload Error Handling)
**Section:** Acceptance Criteria

#### OLD (Current):
```markdown
**Acceptance Criteria:**
- [ ] Implement file validation: Max 10MB, JPEG/PNG only, minimum 100x100px
- [ ] Handle error scenarios:
  - File too large
  - Invalid file format
  - Storage quota exceeded
  - Upload timeout
- [ ] Display progress UI with upload progress bar and cancel button
- [ ] Implement retry logic with 3 attempts using exponential backoff
- [ ] Queue failed uploads locally for retry when connection returns
```

#### NEW (Proposed):
```markdown
**Acceptance Criteria:**
- [ ] Implement file validation: Max 10MB **per image**, JPEG/PNG only, minimum 100x100px
- [ ] **Implement rate limiting:**
  - **[ ] Max 5MB total uploads per user per day**
  - **[ ] Max 20 images per user per day**
  - **[ ] Track daily usage in `daily_aggregates` table (columns: `upload_count`, `upload_size_mb`)**
  - **[ ] Reset counters at midnight user's local timezone**
- [ ] Handle error scenarios:
  - File too large (per-file limit)
  - Invalid file format
  - Storage quota exceeded
  - Upload timeout
  - **Rate limit exceeded (daily limit)**
- [ ] Display progress UI with upload progress bar and cancel button
- [ ] **Show daily usage indicator: "3/20 images uploaded today (2.5MB/5MB used)"**
- [ ] Implement retry logic with 3 attempts using exponential backoff
- [ ] Queue failed uploads locally for retry when connection returns

**Technical Notes:**
- User sees clear, actionable error messages
- Failed uploads automatically retry when online
- **Rate limit enforced server-side (backend validation)**
- **Rate limit errors return HTTP 429 with `Retry-After` header (seconds until midnight)**
```

**Rationale:**
- Prevents storage cost escalation (5MB/user/day = 50GB/day for 10K users max)
- Industry-standard limits (Slack: 1GB/day, Discord: throttled uploads)
- Enhances SEC-I4 (Rate limiting requirement)
- User-friendly error messaging with clear limits

**Impact:** Story points remain **3 pts** (rate limiting is minor addition, not substantial complexity increase)

---

### Change Proposal 2: New Story 0.11 - Voice/Speech-to-Text Infrastructure

**Epic:** Epic 0 - Foundation
**Story ID:** 0.11 (NEW)
**Priority:** M (Must Have)
**Story Points:** 3

#### Story Content:

**Title:** Voice/Speech-to-Text Infrastructure Setup

**As a** developer
**I want to** have a speech-to-text service integrated with the backend
**So that** voice recordings can be transcribed for captures and origin stories

**Acceptance Criteria:**

Core Integration:
- [ ] Research and select B2B speech-to-text provider (recommended: AssemblyAI)
- [ ] Create `services/stt_service.py` with provider abstraction
- [ ] Implement STT fallback chain: Primary provider → Whisper API → Store audio only (manual transcript)
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
  - Accuracy: High (2nd place in 2025 benchmarks)
  - Ease of integration: Simple API, good docs, $50 free credits
  - Alternative: Deepgram ($0.46/hr, highest accuracy but 3x cost)
  - Fallback: OpenAI Whisper API ($0.006/min = $0.36/hr, good for edge cases)

- **Cost Projections (10K users, MVP):**
  - Assume 20% of users record voice (2K users)
  - Average 2 voice recordings/user/day = 4K recordings/day
  - Average recording length: 30 seconds = 0.5 min
  - Daily cost: 4K * 0.5min * ($0.15/60min) = **$5/day = $150/month**
  - Well within AI budget ($2,500/month)

- **Integration Points:**
  - Epic 1 FR-1.7: Origin Story voice commitment
  - Epic 3 FR-3.5: Quick Capture voice notes
  - Store audio files in Supabase Storage `/captures/audio/{user_id}/{filename}.m4a`
  - Store transcripts in `captures` table (`transcript` TEXT column, nullable)

**Story Points:** 3

**Dependencies:**
- Blocks: Epic 1 Story 1.7 (voice commitment), Epic 3 Story 3.5 (voice capture)
- Requires: Story 0.2 (Database), Story 0.3 (Auth), Story 0.6 (AI Service Abstraction)

---

**Rationale for Story 0.11:**

✅ **Why AssemblyAI?**
- Best cost-to-accuracy ratio among tested providers
- $0.15/hr vs Deepgram $0.46/hr (3x cheaper, only 2% less accurate)
- Better than AWS Transcribe ($1.44/hr) and Google ($1.44-$2.16/hr)
- Simple API, excellent docs, active support
- $50 free credits = 333 hours of transcription (enough for full MVP testing)

✅ **Why Epic 0 (Foundation)?**
- Voice is a **core capture type** (alongside photo/note) mentioned in PRD Epic 1 & 3
- Infrastructure must exist before UI implementation
- STT provider selection is architectural decision (like AI Service Abstraction in Story 0.6)

✅ **Why 3 Story Points?**
- Similar complexity to Story 0.6 (AI Service Abstraction) which is also 3 pts
- Straightforward API integration with well-documented providers
- No complex ML model training or custom logic required

---

## Section 5: Implementation Handoff

### Change Scope Classification

**Scope:** **Minor**

**Justification:**
- Changes are additive enhancements to Epic 0
- No existing stories broken or invalidated
- Clear, well-defined requirements with low ambiguity
- No architectural conflicts or major redesigns

### Handoff Plan

**Route to:** Development Team (Direct Implementation)

**Deliverables:**
1. Updated Story 0.9 specification (with rate limiting ACs)
2. New Story 0.11 specification (voice/STT infrastructure)
3. Architecture updates:
   - Rate Limiting Architecture section
   - Speech-to-Text Provider Architecture section
4. Updated test design checklist (Epic 0)

**Implementation Sequence:**
1. **Story 0.9 (Enhanced):** Implement rate limiting (2-4 hours)
   - Backend: Add rate limit middleware
   - Database: Add `upload_count`, `upload_size_mb` to `daily_aggregates`
   - Frontend: Add usage indicator UI
   - Tests: Rate limit exceeded scenarios

2. **Story 0.11 (New):** Implement voice/STT infrastructure (8-12 hours)
   - Research: Finalize AssemblyAI vs alternatives (if needed)
   - Backend: Create STT service + `/api/transcribe` endpoint
   - Database: Add `transcript` column to `captures` table
   - Tests: STT integration tests

**Success Criteria:**
- ✅ Image uploads reject after 20 images or 5MB daily limit
- ✅ Rate limit errors display user-friendly messages with remaining quota
- ✅ Voice recordings upload, transcribe, and store successfully
- ✅ STT costs tracked in `ai_runs` table
- ✅ All tests pass (unit + integration)

### Estimated Timeline

- **Story 0.9 Enhancement:** 0.5 days (4 hours)
- **Story 0.11 Implementation:** 1.5 days (12 hours)
- **Total:** 2 days (16 hours total)

**No sprint delay expected** - Both stories can be completed within Story 0.9's original timeline if prioritized.

---

## Section 6: Artifacts Modified Summary

### Documents Requiring Updates

| Artifact | Update Type | Specific Changes |
|----------|-------------|------------------|
| **docs/epics.md** | Modify | Update Story 0.9 ACs, Add Story 0.11 |
| **docs/prd/epic-0-foundation.md** | Modify | Update US-0.9, Add US-0.11 |
| **docs/architecture/core-architectural-decisions.md** | Add Section | Rate Limiting Architecture, STT Provider Architecture |
| **docs/test-design.md** | Modify | Add test cases for rate limiting & STT |
| **docs/architecture/implementation-patterns-consistency-rules.md** | Minor | Note rate limiting pattern for future stories |

### Stories Affected

| Story | Status | Change Type | Impact |
|-------|--------|-------------|--------|
| **0.9** | In Progress | Enhancement | Add rate limiting (scope increase, same 3 pts) |
| **0.11** | NEW | Addition | Voice/STT infrastructure (new 3 pt story) |

---

## Approval & Next Steps

**Prepared by:** BMAD Correct Course Workflow
**Approval Status:** ⏳ **Pending**

**User Approval Required:**
Please review this Sprint Change Proposal and confirm:

1. ✅ **Story 0.9 enhancement** (add image rate limits) is approved
2. ✅ **Story 0.11 creation** (voice/STT infrastructure) is approved
3. ✅ **Implementation handoff** to development team is approved
4. ✅ **Timeline estimate** (2 days, 16 hours) is acceptable

**Post-Approval Actions:**
- [ ] Update `docs/epics.md` with changes
- [ ] Update `docs/prd/epic-0-foundation.md` with new US-0.11
- [ ] Add architecture sections (Rate Limiting, STT Provider)
- [ ] Update `docs/test-design.md` with new test cases
- [ ] Create implementation tasks in backlog
- [ ] Assign to development team for immediate execution

---

**End of Sprint Change Proposal**
