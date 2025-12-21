# Story 0.9: AI-Powered Image Service

**Epic:** 0 - Foundation
**Story ID:** 0.9
**Story Key:** 0-9-ai-powered-image-service
**Priority:** Must Have (Foundation)
**Estimate:** 8 story points (expanded from 3 pts)
**Status:** ready-for-dev

---

## User Story

**As a** user
**I want to** capture, manage, and get AI insights from my proof images
**So that** my progress is validated and I can see meaningful patterns over time

---

## Overview

Implement comprehensive AI-powered image service infrastructure to enable users to:
1. **Capture & Upload** proof photos with validation and progress tracking
2. **AI Vision Analysis** using Gemini 3 Flash for proof validation, OCR, content classification
3. **Image Management** with gallery view, filtering, deletion, and cascading cleanup
4. **Rate Limiting** to control storage costs and prevent abuse
5. **Error Handling** with retry logic, offline queuing, and user-friendly feedback

This story establishes the foundation for all image-based features and unblocks Epic 3 Stories 3.4 (proof attachment) and 3.5 (quick capture).

**Scope Expansion:** Original story 0.9 was basic upload only (3 pts). New PRD expands to full AI vision service (8 pts) with:
- Gemini 3 Flash vision analysis (~$0.0005 per image)
- Image gallery UI with chronological grid view
- Advanced rate limiting (5MB/day, 20 images/day, 20 AI analyses/day)
- Comprehensive error handling and retry logic

---

## Acceptance Criteria

### AC-1: Full Image Service

**Image Upload with Validation:**
- [ ] Max 10MB per image (configurable in Supabase Storage bucket)
- [ ] JPEG/PNG only (enforced at bucket level)
- [ ] Minimum 100x100px dimensions (client-side validation)
- [ ] Unique filename generation with timestamp: `{user_id}/proof_{timestamp}.jpg`
- [ ] Upload progress indicator with cancel button
- [ ] Base64 encoding for React Native compatibility

**Image Storage in Supabase Storage:**
- [ ] Storage bucket: `captures` (private, requires authentication)
- [ ] User-based folder structure: `/captures/images/{user_id}/`
- [ ] RLS policies enforce user isolation (see Story 0.4 patterns)
- [ ] Signed URLs with 1-hour expiration (default)
- [ ] Auto-refresh expired URLs on display

**Image Retrieval API:**
- [ ] `GET /api/captures/images?filter=goal_id|bind_id|date_range`
- [ ] Filter by goal_id (optional)
- [ ] Filter by subtask_instance_id (bind_id) (optional)
- [ ] Filter by date_range (start_date, end_date) (optional)
- [ ] Return array of captures with signed URLs
- [ ] Pagination support (page, per_page params)

**Image Deletion API:**
- [ ] `DELETE /api/captures/images/{image_id}` endpoint
- [ ] Cascading cleanup: Delete from Storage + Database
- [ ] Verify user owns image before deletion (RLS + API check)
- [ ] Return success confirmation
- [ ] Handle errors gracefully (image not found, unauthorized)

**Image Gallery UI:**
- [ ] Chronological grid view (newest first)
- [ ] Filter by goal (dropdown)
- [ ] Filter by date (date picker)
- [ ] Lazy loading for performance
- [ ] Tap to open Image Detail View
- [ ] Empty state when no images

**Image Detail View:**
- [ ] Full-screen image display
- [ ] Swipe left/right to navigate between images
- [ ] Delete confirmation dialog
- [ ] Display AI insights (see AC-2)
- [ ] Show metadata (date, goal, bind, quality score)

### AC-2: AI Vision Analysis (Gemini 3 Flash)

**Integrate Gemini 3 Flash for Image Analysis:**
- [ ] Create `services/vision_service.py` with provider abstraction
- [ ] Implement VisionProvider interface (similar to AIProvider pattern)
- [ ] Primary provider: Gemini 3 Flash (`gemini-3-flash-preview`)
- [ ] Fallback provider: GPT-4o Vision (optional, higher cost)
- [ ] Final fallback: Store image only (no AI analysis)
- [ ] Cost per image: ~$0.0005 (Gemini 3 Flash, currently FREE during preview)

**AI Vision Features:**
- [ ] **Proof Validation:** Detect if image shows claimed activity
  - Analyze image content vs. bind description
  - Return validation score (0-100, 80+ = "verified")
  - Examples: workout photo → detect gym equipment, outdoor activity → detect nature
- [ ] **OCR (Optical Character Recognition):** Extract text from images
  - Workout logs, food labels, book pages, notes
  - Return extracted text as string
  - Store in `captures.content_text` field
- [ ] **Content Classification:** Categorize image
  - Categories: `gym`, `food`, `outdoor`, `workspace`, `social`, `other`
  - Return top 2 categories with confidence scores
  - Store in `ai_analysis` JSONB column
- [ ] **Proof Quality Scoring:** Rate image quality/relevance
  - Score: 1-5 scale (1 = poor, 5 = excellent)
  - Factors: lighting, focus, relevance to bind
  - Display "AI Verified ✓" badge for scores >= 4

**Store AI Analysis:**
- [ ] Update `captures` table with `ai_analysis` JSONB column
- [ ] JSONB structure:
  ```json
  {
    "provider": "gemini-3-flash-preview",
    "validation_score": 85,
    "is_verified": true,
    "ocr_text": "Bench press 135 lbs x 10 reps",
    "categories": [
      {"label": "gym", "confidence": 0.92},
      {"label": "workspace", "confidence": 0.15}
    ],
    "quality_score": 4,
    "timestamp": "2025-12-21T10:30:00Z"
  }
  ```
- [ ] Write to `ai_runs` table for cost tracking (Story 0.6 pattern)
- [ ] Log: `input_tokens`, `output_tokens`, `model`, `cost_usd`, `duration_ms`

**Display AI Insights:**
- [ ] Show AI insights in Image Detail View
- [ ] Display "AI Verified ✓" badge on validated proof (score >= 80)
- [ ] Show extracted OCR text (expandable section)
- [ ] Show content categories with confidence
- [ ] Show quality score (1-5 stars)
- [ ] Handle missing AI analysis gracefully (fallback: "Analysis pending...")

### AC-3: Rate Limiting

**Daily Limits per User:**
- [ ] Max 5MB total uploads per user per day
- [ ] Max 20 images per user per day
- [ ] Max 20 AI vision analyses per user per day
- [ ] Reset counters at midnight user's local timezone (server-calculated)

**Track Usage in daily_aggregates Table:**
- [ ] Add columns: `upload_count` (INT, default 0)
- [ ] Add columns: `upload_size_mb` (DECIMAL, default 0)
- [ ] Add columns: `ai_vision_count` (INT, default 0)
- [ ] Increment counters on each upload/AI analysis
- [ ] Check limits before allowing upload/analysis

**Rate Limit Errors:**
- [ ] HTTP 429 status code for rate limit exceeded
- [ ] Error response format (Story 0.8 pattern):
  ```json
  {
    "error": {
      "code": "RATE_LIMIT_EXCEEDED",
      "message": "Daily upload limit reached (20/20 images)",
      "retryable": false,
      "retryAfter": "2025-12-22T00:00:00Z"
    }
  }
  ```
- [ ] Include `Retry-After` header with next reset time

**Daily Usage Indicator:**
- [ ] Show in upload UI: "3/20 images uploaded today (2.5MB/5MB used)"
- [ ] Update indicator after each upload
- [ ] Show warning at 80% usage: "16/20 images used today"
- [ ] Show error at 100% usage: "Daily limit reached. Resets at midnight."

### AC-4: Error Handling

**Handle Scenarios:**
- [ ] File too large (>10MB) → "Image too large (max 10MB)"
- [ ] Invalid format (not JPEG/PNG) → "Only JPEG and PNG images supported"
- [ ] Storage quota exceeded → "Storage quota exceeded. Contact support."
- [ ] Upload timeout (>30s) → "Upload timed out. Check connection."
- [ ] Rate limit exceeded → "Daily limit reached (20/20 images)"
- [ ] AI analysis failed → "AI analysis failed. Retrying..."
- [ ] Network error → "No internet connection. Upload queued."

**Progress UI:**
- [ ] Upload progress bar (0-100%)
- [ ] Cancel button during upload
- [ ] Loading state: "Uploading image..."
- [ ] AI loading state: "Analyzing image..." (with spinner)
- [ ] Success state: "Upload complete ✓"
- [ ] Error state: Show error message with retry button

**Retry Logic:**
- [ ] 3 attempts with exponential backoff (1s, 2s, 4s)
- [ ] Retry on network errors (500, 502, 503, 504)
- [ ] Don't retry on client errors (400, 401, 403, 404, 429)
- [ ] Show retry attempt number: "Retrying... (2/3)"

**Queue Failed Uploads Locally:**
- [ ] Use TanStack Query offline mode (Story 0.6 architecture)
- [ ] Store failed uploads in AsyncStorage
- [ ] Retry when connection restored
- [ ] Show queued uploads in UI: "1 upload pending"
- [ ] Auto-sync on app foreground

---

## Developer Context

### Technical Requirements

**Frontend (React Native/Expo):**
- **Image Capture:**
  - Use `expo-image-picker` (~17.0.10) for camera/gallery access
  - Request permissions with `requestCameraPermissionsAsync()` and `requestMediaLibraryPermissionsAsync()`
  - Handle permission denials gracefully with user-friendly messages
  - Convert image URI to base64 for React Native compatibility

- **Image Upload:**
  - Upload to Supabase Storage using `@supabase/supabase-js` ^2.88.0
  - Generate unique filenames: `{user_id}/proof_{Date.now()}.jpg`
  - Track upload progress with progress callbacks
  - Cancel upload on user request (AbortController)

- **State Management:**
  - Use TanStack Query for image fetching (server state)
  - Use `networkMode: 'offlineFirst'` for offline support
  - Cache signed URLs with 1-hour `staleTime`
  - Invalidate cache on upload/delete

- **UI Components:**
  - Follow design system patterns (NativeWind + design tokens)
  - Use `@/design-system` components (Button, Card, Text)
  - Implement bottom sheet for capture flow (e.g., `ProofCaptureSheet`)
  - Use skeleton loaders during image loading

**Backend (Python FastAPI):**
- **Vision Service:**
  - Create `app/services/vision_service.py`
  - Implement `VisionProvider` abstract class (similar to `AIProvider` from Story 0.6)
  - Implement `GeminiVisionProvider` for Gemini 3 Flash
  - Implement `OpenAIVisionProvider` for GPT-4o Vision (fallback)
  - Use provider abstraction pattern for easy swapping

- **API Endpoints:**
  - `POST /api/captures/images` - Upload image
  - `GET /api/captures/images` - List images with filters
  - `GET /api/captures/images/{image_id}` - Get single image
  - `DELETE /api/captures/images/{image_id}` - Delete image
  - `POST /api/captures/images/{image_id}/analyze` - Manual AI analysis retry

- **Rate Limiting:**
  - Check `daily_aggregates` table before upload
  - Increment counters atomically (use database transaction)
  - Calculate midnight in user's local timezone (from `user_profiles.timezone`)
  - Return HTTP 429 with `Retry-After` header

- **Cost Tracking:**
  - Log AI analysis to `ai_runs` table (Story 0.6 pattern)
  - Track: `model`, `input_tokens`, `output_tokens`, `cost_usd`, `duration_ms`
  - Calculate cost: Gemini 3 Flash = $0.50/MTok input + $3.00/MTok output
  - Monitor daily spend with alerts at $83.33/day threshold

### Architecture Compliance

**Data Access Pattern:**
- Use **Supabase Direct** for image storage (file uploads)
- Use **FastAPI Backend** for AI vision analysis (complex business logic)
- Decision tree (from architecture):
  1. File storage? → Supabase direct ✓
  2. AI involvement? → FastAPI backend ✓

**State Management:**
- **TanStack Query** for image fetching (server state)
- **Zustand** for UI state (e.g., gallery filters, selected image)
- **useState** for local state (e.g., upload progress, form inputs)
- Never use Zustand for server data (images, captures)

**API Response Format:**
```typescript
// Success response (from Story 0.8 pattern)
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "type": "photo",
    "storage_key": "user-123/proof_1703167200000.jpg",
    "content_text": "Completed workout",
    "goal_id": "uuid",
    "subtask_instance_id": "uuid",
    "local_date": "2025-12-21",
    "ai_analysis": { /* JSONB */ },
    "created_at": "2025-12-21T10:30:00Z"
  },
  "meta": {
    "timestamp": "2025-12-21T10:30:05Z"
  }
}

// Error response (from Story 0.8 pattern)
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Daily upload limit reached (20/20 images)",
    "retryable": false,
    "retryAfter": "2025-12-22T00:00:00Z"
  }
}
```

**Naming Conventions:**
- **Database:** `snake_case` (e.g., `ai_vision_count`, `upload_size_mb`)
- **API Endpoints:** `snake_case` params (e.g., `?goal_id=xxx&local_date=2025-12-21`)
- **TypeScript:** `camelCase` variables, `PascalCase` components
- **Python:** `snake_case` functions, `PascalCase` classes

**Data Integrity:**
- **Immutable Tables:** None in this story (captures can be deleted)
- **Soft Delete:** NOT used for captures (hard delete from Storage + DB)
- **RLS Policies:** Enforce user isolation at both Storage and Database layers (Story 0.4 pattern)

### Library & Framework Requirements

**Gemini 3 Flash (Primary Vision Provider):**
- **Model:** `gemini-3-flash-preview`
- **Pricing:** $0.50/MTok input, $3.00/MTok output (currently FREE during preview)
- **Cost per image:** ~$0.0005 (typical image ~560 tokens)
- **API:** Google AI Gemini API (https://ai.google.dev/gemini-api/docs)
- **SDK:** `google-generativeai` Python package (or HTTP API)
- **Capabilities:** Multimodal analysis (text, image, video, audio)
- **Free tier:** 15 RPM (requests per minute) during preview

**React Native/Expo Packages:**
```bash
# Image capture (already installed from Story 0.1)
expo-image-picker ~17.0.10

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
# Gemini SDK (NEW - add to pyproject.toml)
uv add google-generativeai

# Supabase client (already installed from Story 0.1)
supabase-py

# Image processing (optional, for validation)
uv add pillow  # For image dimension checks
```

### File Structure Requirements

**Frontend (weave-mobile/):**
```
src/
├── services/
│   ├── imageCapture.ts          # Image capture & upload service
│   └── visionService.ts         # AI vision API client (calls backend)
├── components/
│   ├── ProofCaptureSheet.tsx    # Bottom sheet for proof capture
│   ├── CaptureImage.tsx         # Display captured images
│   ├── ImageGallery.tsx         # Gallery grid view
│   └── ImageDetailView.tsx      # Full-screen image detail
├── hooks/
│   ├── useImageUpload.ts        # TanStack Query hook for upload
│   ├── useImageList.ts          # TanStack Query hook for fetching
│   └── useImageDelete.ts        # TanStack Query hook for deletion
├── types/
│   └── captures.ts              # TypeScript types
└── stores/
    └── imageGalleryStore.ts     # Zustand store for gallery filters
```

**Backend (weave-api/):**
```
app/
├── services/
│   ├── vision_service.py        # Vision provider abstraction
│   ├── gemini_vision_provider.py  # Gemini 3 Flash implementation
│   └── openai_vision_provider.py  # GPT-4o Vision fallback
├── api/
│   └── captures.py              # API endpoints
├── models/
│   └── capture.py               # Pydantic models
└── tests/
    ├── test_vision_service.py   # Unit tests
    └── test_captures_api.py     # Integration tests
```

**Database Migrations:**
```
supabase/migrations/
└── 20251221000001_captures_storage_bucket.sql  # Storage bucket + RLS
└── 20251221000002_ai_vision_columns.sql        # Add ai_analysis JSONB column
```

### Testing Requirements

**Unit Tests (Backend):**
- [ ] Test `VisionProvider` abstraction with mock providers
- [ ] Test Gemini 3 Flash integration (mock API responses)
- [ ] Test fallback chain (Gemini → OpenAI → Store only)
- [ ] Test rate limiting logic (daily_aggregates checks)
- [ ] Test cost tracking (ai_runs table logging)
- [ ] Coverage target: 80%+ for services

**Integration Tests (Backend):**
- [ ] Test image upload → storage → database flow
- [ ] Test AI vision analysis → database storage
- [ ] Test image retrieval with filters
- [ ] Test image deletion (Storage + DB cleanup)
- [ ] Test rate limiting enforcement (HTTP 429)
- [ ] Use pytest fixtures for test data

**E2E Tests (Mobile):**
- [ ] Test proof capture flow (camera → upload → display)
- [ ] Test quick capture flow (gallery → upload → display)
- [ ] Test image gallery (filtering, pagination)
- [ ] Test image detail view (swipe, delete)
- [ ] Test offline upload queueing
- [ ] Test rate limit UI feedback
- [ ] Use Expo's testing library (Jest + React Native Testing Library)

**Manual Testing Checklist:**
- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Test camera permissions (grant, deny)
- [ ] Test gallery permissions (grant, deny)
- [ ] Test upload progress indicator
- [ ] Test upload cancellation
- [ ] Test AI analysis loading state
- [ ] Test rate limit warnings (80%, 100%)
- [ ] Test offline upload queueing
- [ ] Test cross-user isolation (2 accounts)

---

## Git Intelligence Summary

**Recent Commit Patterns (Last 5 commits):**
- Story implementation pattern: Feature branches → main via PR
- Commit message format: `feat: <description>` or `fix: <description>`
- Documentation updates: Separate commits for docs changes
- Testing: Tests added in same PR as feature implementation
- Architecture changes: Documented in `docs/architecture/` before implementation

**Learnings from Recent Work:**
- Epic 0 stories follow consistent structure: migration → service → API → UI
- RLS patterns established in Story 0.4 (reuse for Storage)
- AI service abstraction pattern from Story 0.6 (reuse for Vision)
- Test infrastructure from Story 0.7 (reuse for vision tests)

---

## Latest Tech Information

**Gemini 3 Flash Preview (as of December 2025):**
- **Model ID:** `gemini-3-flash-preview`
- **Pricing:** $0.50/MTok input, $3.00/MTok output
- **Free Tier:** Currently FREE during preview period
- **Rate Limits (Free):** 15 RPM (requests per minute)
- **Rate Limits (Paid):** Higher limits, exact values TBD
- **Context Window:** 1M tokens (same as Gemini 2.5 Pro)
- **Multimodal:** Text, image, video, audio analysis
- **Vision Capabilities:**
  - Object detection
  - OCR (optical character recognition)
  - Scene understanding
  - Image classification
  - Content moderation

**Cost Projection (10K users):**
- 20% image upload adoption (2K users)
- 3 images/user/day = 6K images/day
- AI analysis on 90% of images = 5.4K analyses/day
- Input tokens per image: ~560 tokens (typical)
- Output tokens per analysis: ~200 tokens (typical)
- Daily input cost: 5.4K * 560 * $0.50/MTok = $1.51/day
- Daily output cost: 5.4K * 200 * $3.00/MTok = $3.24/day
- **Total: ~$4.75/day = ~$142.50/month**
- Well within $2,500/month AI budget (94% headroom)

**Supabase Storage Best Practices:**
- Use private buckets for user data (require authentication)
- Implement RLS policies at Storage level (folder-based isolation)
- Generate signed URLs with short expiration (1 hour default)
- Use storage triggers for cleanup (delete orphaned files)
- Monitor storage quota (free tier: 1GB, paid: unlimited with billing)

---

## Project Context Reference

**Critical Guidelines from CLAUDE.md:**
- **State Management:** Use TanStack Query for server state (images), Zustand for UI state (filters), useState for local state
- **Design System:** ALWAYS use `@/design-system` components (Button, Card, Text, etc.)
- **Naming:** snake_case for DB/API, camelCase for TypeScript, PascalCase for components
- **Data Integrity:** captures table is NOT immutable (can be deleted)
- **Security:** RLS policies enforce user isolation at both Storage and Database layers
- **Offline:** Use TanStack Query `networkMode: 'offlineFirst'` for offline support

**Architecture Decisions:**
- **Data Access:** Supabase Direct for file storage, FastAPI for AI vision
- **AI Provider:** Gemini 3 Flash primary, GPT-4o Vision fallback
- **Rate Limiting:** Track in daily_aggregates, reset at midnight user's local timezone
- **Cost Tracking:** Log to ai_runs table (Story 0.6 pattern)

---

## Dependencies

**Requires:**
- Story 0.2 (Database Schema) - `captures` table exists ✅
- Story 0.3 (Authentication) - JWT tokens for API access ✅
- Story 0.4 (RLS) - Security patterns for Storage + DB ✅
- Story 0.6 (AI Service Abstraction) - Provider pattern for Gemini ✅
- Story 0.7 (Test Infrastructure) - pytest + Jest setup ✅

**Unblocks:**
- Epic 3 Story 3.4 (Attach Proof to Bind) - Proof capture after bind completion
- Epic 3 Story 3.5 (Quick Capture) - General photo capture without bind context
- Epic 4 Story 4.2 (Recap Before Reflection) - Display proof photos in recap
- Epic 5 Story 5.1 (Dashboard Overview) - Show recent proof photos

---

## Integration Points

**Epic 3: Daily Actions & Proof**

**US-3.4: Attach Proof to Bind:**
- After bind completion, show `ProofCaptureSheet` component
- Pass context: `subtask_instance_id`, `goal_id`, `local_date`, `note`
- Use `captureAndUploadProofPhoto()` service function
- Display AI verification badge if `validation_score >= 80`
- Allow skip (trust-based system)

**US-3.5: Quick Capture (Document):**
- Floating menu → "Document" button
- Use `captureQuickPhoto()` service function
- No bind/goal linkage required
- Store with `local_date` only
- Support camera or gallery

**Epic 4: Reflection & Journaling**

**US-4.2: Recap Before Reflection:**
- Fetch today's proof photos with `getUserCaptures(local_date, 'photo')`
- Display in recap screen (grid or carousel)
- Show AI verified badge on validated proof
- Tap to open full-screen detail view

**Epic 5: Progress Visualization**

**US-5.1: Dashboard Overview:**
- Show "Recent Proof" section with last 3 proof photos
- Display AI verification status
- Tap to open image gallery

---

## Success Metrics

**Technical:**
- [ ] Image upload success rate > 98%
- [ ] Average upload time < 3 seconds
- [ ] AI analysis success rate > 95%
- [ ] Average AI analysis time < 2 seconds
- [ ] Zero cross-user access incidents (RLS working)
- [ ] Rate limit enforcement 100% (no bypasses)

**User Experience:**
- [ ] Camera/gallery launch < 1 second
- [ ] Image display load time < 2 seconds
- [ ] Clear progress feedback during upload
- [ ] Graceful error handling with retry
- [ ] AI verified badge displayed correctly

**Business:**
- [ ] Proof attachment rate (target: 60%+)
- [ ] Quick capture daily usage (target: 20% adoption)
- [ ] Storage costs per user (target: <$0.50/month)
- [ ] AI analysis costs per user (target: <$0.15/month)
- [ ] User retention impact (measure proof vs. no-proof users)

---

## Cost Impact Summary

**Gemini 3 Flash Vision:**
- ~$90/month at 10K users (6K images/day with 90% AI analysis)
- Currently FREE during preview period
- Well within $2,500/month AI budget

**Supabase Storage:**
- 10K users * 20 images/month * 2MB avg = 400GB/month
- Supabase pricing: $0.021/GB/month = ~$8.40/month
- Total infrastructure cost: ~$98.40/month (AI + Storage)

**Total Epic 0 AI Infrastructure:**
- Story 0.6 (AI Service Abstraction): Base infrastructure
- Story 0.9 (AI Vision): +$90/month
- Story 0.11 (Voice/STT): +$186/month (from PRD)
- **Total: ~$276/month** (well within $2,500/month budget)

---

## Rollout Checklist

### Development Phase
- [ ] Create `captures` storage bucket migration
- [ ] Implement vision service with Gemini 3 Flash
- [ ] Create API endpoints (upload, list, get, delete, analyze)
- [ ] Build mobile components (ProofCaptureSheet, CaptureImage, etc.)
- [ ] Implement rate limiting logic
- [ ] Add AI analysis to upload flow
- [ ] Write unit tests (80%+ coverage)
- [ ] Write integration tests
- [ ] Update CLAUDE.md with new patterns

### Testing Phase
- [ ] Run migration on local Supabase
- [ ] Test camera/gallery permissions
- [ ] Test image upload with progress tracking
- [ ] Test AI vision analysis
- [ ] Test rate limiting (approach 80%, hit 100%)
- [ ] Test offline upload queueing
- [ ] Test RLS security (2 test accounts)
- [ ] Test file size/type validation
- [ ] Load test (50 concurrent uploads)

### Staging Phase
- [ ] Apply migrations to staging database
- [ ] Create test users with proof photos
- [ ] Verify cross-user isolation
- [ ] Monitor AI analysis costs
- [ ] Monitor storage usage
- [ ] Test error scenarios (timeout, rate limit, network error)
- [ ] Performance profiling (upload, AI analysis, display)

### Production Phase
- [ ] Apply migrations to production database
- [ ] Enable Gemini 3 Flash in production
- [ ] Monitor error rates (target: <2%)
- [ ] Track storage usage metrics
- [ ] Set up alerts for rate limits
- [ ] Set up alerts for storage quota (80%, 100%)
- [ ] Set up alerts for AI costs ($83.33/day threshold)
- [ ] Document any issues in `docs/bugs/`

---

## References

- **PRD:** `docs/prd/epic-0-foundation.md` (US-0.9, lines 177-238)
- **Architecture:** `docs/architecture/core-architectural-decisions.md`
- **Implementation Patterns:** `docs/architecture/implementation-patterns-consistency-rules.md`
- **Security (RLS):** Story 0.4, `supabase/migrations/20251219170656_row_level_security.sql`
- **AI Service:** Story 0.6, `weave-api/app/services/ai_service.py`
- **Test Infrastructure:** Story 0.7, `weave-api/tests/` + `weave-mobile/src/components/__tests__/`
- **Gemini API Docs:** https://ai.google.dev/gemini-api/docs
- **Gemini Pricing:** https://ai.google.dev/gemini-api/docs/pricing
- **Supabase Storage Docs:** https://supabase.com/docs/guides/storage

---

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2025-12-21 | Bob (Scrum Master) | Complete rewrite from scratch using updated PRD requirements. Expanded from 3 pts to 8 pts. |

---

**Status:** ✅ **READY FOR DEVELOPMENT**

This comprehensive story provides the DEV agent with everything needed for flawless implementation: complete requirements, architecture constraints, latest technical specs, file structure, testing requirements, and integration points.

**Next Steps:**
1. **Optional:** Run `*validate-create-story` for quality competition review
2. **Required:** Run `dev-story` workflow to implement Story 0.9
3. **Required:** Run `code-review` when implementation complete

---
