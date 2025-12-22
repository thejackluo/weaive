# Story 0.9: AI-Powered Image Service

**Epic:** 0 - Foundation
**Story ID:** 0.9
**Story Key:** 0-9-ai-powered-image-service
**Priority:** Must Have (Foundation)
**Estimate:** 8 story points (expanded from 3 pts)
**Status:** ready-for-dev

---

> **🚨 CRITICAL: Fresh Implementation - Archive Old Code**
>
> Previous Story 0.9 implementation (3 pts, basic upload only) exists but is incomplete and should be archived.
>
> **DO NOT EXTEND** old files - create NEW implementations following this story's requirements.
>
> **Old files to ARCHIVE** (move to `weave-mobile/src/_archive/story-0.9-old/`):
> - `services/imageCapture.ts` (13KB, basic upload only)
> - `components/ProofCaptureSheet.tsx` (5KB, no AI analysis)
> - `components/CaptureImage.tsx` (3KB, no AI insights display)
> - `types/captures.ts` (basic types)
>
> **BUILD FROM SCRATCH** following complete requirements below (full AI vision service, 8 pts).

---

## User Story

**As a** user
**I want to** capture, manage, and get AI insights from my proof images
**So that** my progress is validated and I can see meaningful patterns over time

---

## Overview

Build comprehensive AI-powered image service infrastructure enabling users to:
1. **Capture & Upload** - Proof photos with validation and progress tracking
2. **AI Vision Analysis** - Gemini 3 Flash for proof validation, OCR, content classification
3. **Image Management** - Gallery view, filtering, deletion, cascading cleanup
4. **Rate Limiting** - Control storage costs (5 images/day free tier = 10 cents/user/day)
5. **Error Handling** - Retry logic, offline queuing, user-friendly feedback

**Foundation for:** Epic 3 Stories 3.4 (proof attachment), 3.5 (quick capture), Epic 4.2 (recap), Epic 5.1 (dashboard).

**Scope Expansion:** Original 3 pts (basic upload) → 8 pts (full AI vision service):
- Gemini 3 Flash vision analysis ($0.02/image after free preview)
- Image gallery UI with chronological grid + infinite scroll
- Rate limiting: 5 images/day, 5MB/day, 5 AI analyses/day (free tier)
- Comprehensive error handling with offline queue

---

## Acceptance Criteria

### AC-1: Full Image Service

> **✅ BUILD:** Complete image capture, upload, storage, retrieval, deletion, and gallery UI

**Image Upload with Validation:**
- [ ] Max 10MB per image (enforced at Supabase Storage bucket level)
- [ ] JPEG/PNG only (bucket MIME type restriction)
- [ ] Min 100x100px dimensions (client-side validation)
- [ ] Compress images before upload: max 1920px width, 80% quality using `expo-image-manipulator`
- [ ] Unique filename: `{user_id}/proof_{timestamp}.jpg`
- [ ] Upload progress indicator (0-100%) with cancel button
- [ ] Base64 encoding for React Native/Supabase compatibility

**Image Storage in Supabase:**
- [ ] Bucket: `captures` (private, authentication required)
- [ ] Folder structure: `/captures/images/{user_id}/`
- [ ] RLS policies enforce user isolation (Story 0.4 pattern: `(storage.foldername(name))[1]`)
- [ ] Signed URLs with 1-hour expiration (auto-refresh on display)

**Image Retrieval API:**
- [ ] Endpoint: `GET /api/captures/images?goal_id={uuid}&subtask_instance_id={uuid}&start_date={date}&end_date={date}&page={int}&per_page={int}`
- [ ] Return: `{ data: [...], meta: { total, page, per_page, has_next } }`
- [ ] Include signed URLs in response

**Image Deletion API:**
- [ ] Endpoint: `DELETE /api/captures/images/{image_id}`
- [ ] Cascading cleanup: Delete from Storage + Database atomically
- [ ] Verify user owns image (RLS + API check)
- [ ] Return 200 on success, 404 if not found, 403 if unauthorized

**Image Gallery UI:**
- [ ] Chronological grid (3 columns, newest first)
- [ ] Filters: goal dropdown, date picker
- [ ] Infinite scroll (FlatList `onEndReached`, fetch when 50% from bottom)
- [ ] Tap → open Image Detail View
- [ ] Empty state: "No images yet. Capture your first proof!"

**Image Detail View:**
- [ ] Full-screen display with pinch-to-zoom
- [ ] Swipe left/right for prev/next
- [ ] Delete button with confirmation: "Delete this image? This cannot be undone."
- [ ] Display AI insights (see AC-2)
- [ ] Show metadata: date, goal, bind, quality score

---

### AC-2: AI Vision Analysis (Gemini 3 Flash)

> **🚨 MUST IMPLEMENT:** Provider abstraction pattern (Story 0.6) with fallback chain

**Gemini API Setup:**
- [ ] Visit https://aistudio.google.com/app/apikey → Create API key
- [ ] Add to `.env`: `GOOGLE_AI_API_KEY=your_key`
- [ ] Install SDK: `uv add google-generativeai`
- [ ] Free tier: 15 RPM during preview (currently FREE, later $0.02/image)

**Vision Service Architecture:**
- [ ] Create `app/services/vision_service.py` with `VisionProvider` abstract class
- [ ] Implement `GeminiVisionProvider` (primary): Model `gemini-3-flash-preview`
- [ ] Implement `OpenAIVisionProvider` (fallback): GPT-4o Vision (higher cost)
- [ ] Final fallback: Store image without AI analysis (graceful degradation)
- [ ] Cost per image: ~$0.0005 input + ~$0.0006 output = ~$0.02/image (after preview)

**AI Vision Features:**
- [ ] **Proof Validation:** Analyze image vs. bind description
  - Score 0-100 (80+ = "AI Verified ✓" badge)
  - Example: Workout photo → detect gym equipment; outdoor activity → detect nature
- [ ] **OCR:** Extract text from workout logs, food labels, notes
  - Store in `captures.content_text` field
- [ ] **Content Classification:** Categorize as `gym`, `food`, `outdoor`, `workspace`, `social`, `other`
  - Return top 2 categories with confidence scores
  - Store in `ai_analysis` JSONB column
- [ ] **Quality Scoring:** Rate image quality 1-5 (lighting, focus, relevance)
  - Display as star rating in UI

**Store AI Analysis:**
- [ ] Add column: `captures.ai_analysis` JSONB (see migration below)
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
- [ ] Log to `ai_runs` table: `operation_type='image_analysis'`, `input_tokens`, `output_tokens`, `cost_usd`, `duration_ms`

**Display AI Insights:**
- [ ] Image Detail View: Show AI insights section
- [ ] Badge: "AI Verified ✓" if `validation_score >= 80`
- [ ] OCR text: Expandable section with extracted text
- [ ] Categories: Display top 2 with confidence bars
- [ ] Quality: Show 1-5 star rating
- [ ] Handle missing analysis: "Analysis pending..." (if AI failed, show retry button)

---

### AC-3: Rate Limiting (Free Tier Cost Control)

> **⚡ FREE TIER LIMITS:** 5 images/day, 5MB/day, 5 AI analyses/day = 10 cents/user/day max

**Daily Limits per User:**
- [ ] Max 5 images per user per day (free tier)
- [ ] Max 5MB total uploads per user per day
- [ ] Max 5 AI vision analyses per user per day
- [ ] Reset at midnight user's local timezone (from `user_profiles.timezone`)

**Database Columns (daily_aggregates Table):**
```sql
-- Add if not exists
ALTER TABLE daily_aggregates ADD COLUMN IF NOT EXISTS upload_count INT DEFAULT 0;
ALTER TABLE daily_aggregates ADD COLUMN IF NOT EXISTS upload_size_mb DECIMAL DEFAULT 0;
ALTER TABLE daily_aggregates ADD COLUMN IF NOT EXISTS ai_vision_count INT DEFAULT 0;
```

**Middleware Implementation (Backend):**
```python
# app/middleware/rate_limit.py
from datetime import datetime
import pytz

async def check_upload_rate_limit(user_id: UUID, file_size_mb: float, user_timezone: str):
    # Calculate user's local date
    user_tz = pytz.timezone(user_timezone)
    local_date = datetime.now(user_tz).date()

    # Get or create daily aggregate
    agg = await get_or_create_daily_aggregate(user_id, local_date)

    # Check limits
    if agg.upload_count >= 5:
        seconds_until_midnight = calculate_seconds_until_midnight(user_timezone)
        raise RateLimitError(
            code="RATE_LIMIT_EXCEEDED",
            message="Daily upload limit reached (5/5 images). Upgrade to Pro for unlimited.",
            retry_after=seconds_until_midnight
        )

    if agg.upload_size_mb + file_size_mb > 5.0:
        raise RateLimitError(
            message="Daily storage limit reached (5MB). Upgrade to Pro for unlimited."
        )

    # Increment atomically
    await increment_usage(user_id, local_date, file_size_mb)
```

**Rate Limit Response:**
- [ ] HTTP 429 status code
- [ ] Error format:
  ```json
  {
    "error": {
      "code": "RATE_LIMIT_EXCEEDED",
      "message": "Daily upload limit reached (5/5 images)",
      "retryable": false,
      "retryAfter": "2025-12-22T00:00:00Z"
    }
  }
  ```
- [ ] Include `Retry-After` header (seconds until midnight)

**Daily Usage Indicator (Mobile UI):**
```typescript
// Fetch usage before showing upload UI
const { data: usage } = useQuery({
  queryKey: ['upload-usage', localDate],
  queryFn: () => fetch('/api/captures/usage').then(r => r.json())
});

// Display: "3/5 images uploaded today (2.5MB/5MB used)"
<Text className="text-sm text-neutral-400">
  {usage.upload_count}/5 images today ({usage.upload_size_mb.toFixed(1)}MB/5MB)
</Text>

// Warning at 80%: "4/5 images used today. 1 remaining."
{usage.upload_count >= 4 && (
  <Text className="text-sm text-amber-500">
    ⚠️ {5 - usage.upload_count} image{5 - usage.upload_count === 1 ? '' : 's'} remaining today
  </Text>
)}

// Error at 100%: Show upgrade prompt
{usage.upload_count >= 5 && (
  <View className="p-4 bg-amber-500/10 rounded-lg">
    <Text className="text-amber-500 font-semibold">Daily Limit Reached</Text>
    <Text className="text-neutral-300">Upgrade to Pro for unlimited images</Text>
    <Button onPress={handleUpgrade}>Upgrade Now</Button>
  </View>
)}
```

---

### AC-4: Error Handling & Offline Support

> **✅ MUST HANDLE:** Network errors, timeouts, rate limits, AI failures, offline mode

**Error Scenarios:**
- [ ] File too large (>10MB): "Image too large (max 10MB). Try compressing."
- [ ] Invalid format: "Only JPEG and PNG supported"
- [ ] Upload timeout (>30s): "Upload timed out. Check connection."
- [ ] Rate limit: "Daily limit reached (5/5 images). Resets at midnight."
- [ ] AI analysis failed: "AI analysis unavailable. Image saved."
- [ ] Network error: "No internet. Upload queued for later."

**Progress UI:**
- [ ] Upload: Progress bar 0-100% with cancel button
- [ ] AI analysis: "Analyzing image..." with spinner
- [ ] Success: "Upload complete ✓" → "AI Verified ✓"
- [ ] Error: Show message + retry button

**Retry Logic:**
- [ ] 3 attempts with exponential backoff (1s, 2s, 4s)
- [ ] Retry on: 500, 502, 503, 504 (server errors)
- [ ] Don't retry on: 400, 401, 403, 404, 429 (client errors)
- [ ] Show: "Retrying... (2/3)"

**Offline Behavior:**
```typescript
// Queue upload when offline
await AsyncStorage.setItem('pending-uploads', JSON.stringify([
  {
    id: uuid(),
    localUri: compressedImageUri,
    context: { subtask_instance_id, goal_id, local_date, note },
    timestamp: Date.now()
  }
]));

// TanStack Query auto-retries when online
const uploadMutation = useMutation({
  mutationFn: uploadImage,
  networkMode: 'offlineFirst',  // Queue if offline
  retry: 3,
  onSuccess: () => {
    // Clear from AsyncStorage
  }
});
```

**Offline UI:**
- [ ] When offline: Show "Upload pending - will sync when online"
- [ ] When online: Auto-retry queued uploads
- [ ] Progress: "1 upload pending" indicator
- [ ] User can: View queued images locally, cancel queued uploads

**Error Recovery UI Patterns:**

**Upload Timeout:**
```
┌─────────────────────────────────┐
│ ⚠️ Upload Timed Out             │
│                                  │
│ Your connection may be slow.     │
│                                  │
│ [Try Again] [Cancel]             │
└─────────────────────────────────┘
```

**Rate Limit:**
```
┌─────────────────────────────────┐
│ 📸 Daily Upload Limit Reached   │
│                                  │
│ You've uploaded 5 images today.  │
│ Resets at midnight (3h 24m).    │
│                                  │
│ [Upgrade to Pro] [OK]            │
└─────────────────────────────────┘
```

**AI Analysis Failed:**
```
┌─────────────────────────────────┐
│ ✅ Image Uploaded                │
│ ⚠️ AI Analysis Unavailable      │
│                                  │
│ Your proof is saved, but AI      │
│ insights aren't available now.   │
│                                  │
│ [Retry Analysis] [Continue]      │
└─────────────────────────────────┘
```

---

## Developer Context

### Learnings from Previous Stories

> **🎓 APPLY PATTERNS:** Reuse proven approaches from Stories 0.4, 0.6, 0.7

**From Story 0.4 (RLS):**
- Pattern: `(storage.foldername(name))[1]` extracts `user_id` from storage paths
- Pattern: Cast `auth.uid()::text` when comparing with `auth_user_id` column
- Testing: Run `scripts/test_rls_security.py` to verify cross-user isolation

**From Story 0.6 (AI Service Abstraction):**
- Pattern: Provider abstraction with fallback chain (Gemini → OpenAI → Fallback)
- Pattern: Log all AI calls to `ai_runs` table: `input_tokens`, `output_tokens`, `model`, `cost_usd`, `duration_ms`
- Cost tracking: Calculate cost per provider, aggregate daily spend

**From Story 0.7 (Test Infrastructure):**
- Pattern: Use pytest fixtures (`user_fixture`, `goal_fixture`) for test data
- Pattern: File naming: `test_{feature}_api.py` for integration tests
- Coverage target: 80%+ services, 60%+ API routes

---

### Technical Requirements

**Frontend (React Native/Expo):**
- **Image Capture:** `expo-image-picker ~17.0.10` for camera/gallery
- **Compression:** `expo-image-manipulator` for resizing (max 1920px width, 80% quality)
- **Upload:** `@supabase/supabase-js ^2.88.0` with base64 encoding
- **State:** TanStack Query (`networkMode: 'offlineFirst'`), Zustand (gallery filters), useState (local)
- **UI:** Use `@/design-system` components (Button, Card, Text), NativeWind styling

**Backend (Python FastAPI):**
- **Vision:** `google-generativeai` (Gemini), `openai` (GPT-4o fallback), `pillow` (validation)
- **API:** FastAPI 0.115+, Pydantic models, async/await
- **Rate Limiting:** Check `daily_aggregates`, calculate midnight in user timezone (`pytz`)
- **Cost Tracking:** Log to `ai_runs` table after each AI call

---

### Architecture Compliance

**Data Access:**
- ✅ Supabase Direct for image storage (file uploads)
- ✅ FastAPI Backend for AI vision analysis (complex business logic)

**State Management:**
- ✅ TanStack Query for images (server state)
- ✅ Zustand for gallery filters (UI state)
- ✅ useState for upload progress (local state)

**API Response Format:**
```typescript
// Success
{ "data": {...}, "meta": { "timestamp": "2025-12-21T10:30:05Z" } }

// Error
{ "error": { "code": "RATE_LIMIT_EXCEEDED", "message": "...", "retryable": false } }
```

**Naming:**
- Database: `snake_case` (`ai_vision_count`, `upload_size_mb`)
- API: `snake_case` params (`?goal_id=xxx&local_date=2025-12-21`)
- TypeScript: `camelCase` vars, `PascalCase` components
- Python: `snake_case` functions, `PascalCase` classes

---

### File Structure

> **🚨 CREATE NEW FILES** - Archive old Story 0.9 implementation first

**Frontend (weave-mobile/):**
```
src/
├── services/
│   ├── imageCapture.ts          # NEW - Image capture, upload, compression
│   └── visionService.ts         # NEW - AI vision API client
├── components/
│   ├── ProofCaptureSheet.tsx    # NEW - Bottom sheet for proof capture
│   ├── CaptureImage.tsx         # NEW - Display captured images
│   ├── ImageGallery.tsx         # NEW - Gallery grid with infinite scroll
│   └── ImageDetailView.tsx      # NEW - Full-screen detail + AI insights
├── hooks/
│   ├── useImageUpload.ts        # NEW - Upload mutation hook
│   ├── useImageList.ts          # NEW - Fetch images hook
│   └── useImageDelete.ts        # NEW - Delete mutation hook
├── types/
│   └── captures.ts              # NEW - TypeScript types
└── stores/
    └── imageGalleryStore.ts     # NEW - Gallery filters state
```

**Backend (weave-api/):**
```
app/
├── services/
│   ├── vision_service.py        # NEW - VisionProvider abstraction
│   ├── gemini_vision_provider.py  # NEW - Gemini 3 Flash
│   └── openai_vision_provider.py  # NEW - GPT-4o fallback
├── api/
│   └── captures.py              # NEW - Image API endpoints
├── models/
│   └── capture.py               # NEW - Pydantic models
├── middleware/
│   └── rate_limit.py            # NEW - Rate limiting logic
└── tests/
    ├── test_vision_service.py   # NEW - Unit tests
    └── test_captures_api.py     # NEW - Integration tests
```

---

### Database Migrations

> **⚠️ MIGRATION REQUIRED:** Add AI analysis columns to existing `captures` table

**Existing Migration (DO NOT MODIFY):**
- `20251221000001_captures_storage_bucket.sql` - Storage bucket + RLS (already applied)

**New Migration to CREATE:**

**File:** `supabase/migrations/20251221000002_ai_vision_columns.sql`

```sql
-- Migration: Add AI Vision Analysis Columns
-- Story: 0.9 - AI-Powered Image Service (8 pts expansion)
-- Purpose: Add AI vision analysis to existing captures table

-- Add AI analysis columns
ALTER TABLE captures ADD COLUMN IF NOT EXISTS ai_analysis JSONB;
ALTER TABLE captures ADD COLUMN IF NOT EXISTS ai_verified BOOLEAN DEFAULT false;
ALTER TABLE captures ADD COLUMN IF NOT EXISTS ai_quality_score INT;

-- Add quality score constraint
ALTER TABLE captures ADD CONSTRAINT check_ai_quality_score
  CHECK (ai_quality_score IS NULL OR (ai_quality_score BETWEEN 1 AND 5));

-- Add index for verified proofs
CREATE INDEX IF NOT EXISTS idx_captures_ai_verified
  ON captures(ai_verified) WHERE ai_verified = true;

-- Add comments
COMMENT ON COLUMN captures.ai_analysis IS 'JSONB: Gemini 3 Flash vision analysis (provider, validation_score, ocr_text, categories, quality_score)';
COMMENT ON COLUMN captures.ai_verified IS 'True if validation_score >= 80';
COMMENT ON COLUMN captures.ai_quality_score IS '1-5 rating (null if analysis failed)';
```

---

### Cost Monitoring

> **💰 BUDGET:** $3/day baseline ($90/month), alert at $4/day (33% over)

**Alert Thresholds:**
- Daily baseline: $3.00/day
- Warning: $4.00/day (33% over budget)
- Critical: $5.00/day (67% over budget)

**Monitoring Query:**
```sql
-- Daily AI vision cost
SELECT
  local_date,
  SUM(cost_usd) as total_cost,
  COUNT(*) as analysis_count,
  AVG(cost_usd) as avg_cost_per_image
FROM ai_runs
WHERE operation_type = 'image_analysis'
  AND local_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY local_date
ORDER BY local_date DESC;
```

**Alert Implementation (Backend):**
```python
# After each AI call
async def check_ai_cost_alert(local_date: date):
    daily_cost = await get_daily_ai_cost(local_date)

    if daily_cost > 5.00:
        await send_alert_to_slack(f"🚨 CRITICAL: AI cost ${daily_cost:.2f}/day")
    elif daily_cost > 4.00:
        await send_alert_to_slack(f"⚠️ WARNING: AI cost ${daily_cost:.2f}/day")
```

---

### Testing Requirements

**Unit Tests (Backend):**
- [ ] Test `VisionProvider` abstraction with mock responses
- [ ] Test Gemini 3 Flash integration (mock Google API)
- [ ] Test fallback chain: Gemini fails → OpenAI → Store only
- [ ] Test rate limiting: daily_aggregates checks, timezone handling
- [ ] Test cost tracking: ai_runs table logging
- [ ] Coverage: 80%+ services

**Integration Tests (Backend):**
- [ ] Test: Upload image → Storage → DB → AI analysis → DB update
- [ ] Test: Image retrieval with filters (goal, date range, pagination)
- [ ] Test: Image deletion (Storage + DB cascade)
- [ ] Test: Rate limit enforcement (HTTP 429 at 5/5 images)
- [ ] Use pytest fixtures for test data

**E2E Tests (Mobile):**
- [ ] Test: Camera capture → compress → upload → display
- [ ] Test: Gallery selection → compress → upload → display
- [ ] Test: Image gallery (infinite scroll, filters)
- [ ] Test: Image detail view (swipe, delete, AI insights)
- [ ] Test: Offline queue (go offline → upload → go online → auto-sync)
- [ ] Test: Rate limit UI (approach 5/5, show warning, hit limit)

**Manual Testing:**
- [ ] Test on iOS simulator + Android emulator
- [ ] Test permissions: grant, deny, request again
- [ ] Test compression: large images (>10MB) → compressed (<2MB)
- [ ] Test AI analysis: gym photo, food photo, outdoor photo, text document
- [ ] Test rate limits: upload 5 images, verify 6th blocked
- [ ] Test cross-user isolation: 2 accounts, verify no cross-access

---

## Integration Points

> **✅ UNBLOCKS:** Epic 3 Stories 3.4, 3.5; Epic 4 Story 4.2; Epic 5 Story 5.1

**Epic 3: Daily Actions & Proof**

**Story 3.4: Attach Proof to Bind**
- After bind completion: Show `<ProofCaptureSheet context={{subtask_instance_id, goal_id, local_date, note}} />`
- Use `captureAndUploadProofPhoto(context, source)` function
- Display "AI Verified ✓" badge if `ai_analysis.validation_score >= 80`
- Allow skip (trust-based system)

**Story 3.5: Quick Capture**
- Floating menu → "Document" button
- Use `captureQuickPhoto(localDate, source, note)` function
- No bind/goal linkage (store with `local_date` only)

**Epic 4: Reflection & Journaling**

**Story 4.2: Recap Before Reflection**
- Fetch: `getUserCaptures(localDate, 'photo')`
- Display in recap screen (grid or carousel)
- Show AI verified badge, tap to open detail view

**Epic 5: Progress Visualization**

**Story 5.1: Dashboard Overview**
- Show "Recent Proof" section with last 3 photos
- Display AI verification status
- Tap to open image gallery

---

## Success Metrics

**Technical:**
- [ ] Upload success rate > 98%
- [ ] Average upload time < 3s
- [ ] AI analysis success rate > 95%
- [ ] Average AI analysis time < 2s
- [ ] Zero cross-user access incidents

**User Experience:**
- [ ] Camera/gallery launch < 1s
- [ ] Image display load < 2s
- [ ] Clear progress feedback
- [ ] Graceful error handling

**Business:**
- [ ] Proof attachment rate > 60%
- [ ] Quick capture adoption > 20%
- [ ] Storage cost < $0.50/user/month
- [ ] AI cost < $0.15/user/month (5 images * $0.02 * 75% adoption)

---

## Cost Impact Summary

**Free Tier Limits (Per User):**
- 5 images/day * $0.02/image = **$0.10/user/day = $3/month**
- 10K users * 75% adoption * $3/month = **$22,500/month** (at scale)

**After Preview Period Ends:**
- Gemini 3 Flash: $0.50/MTok input + $3.00/MTok output
- Typical image: 560 input tokens + 200 output tokens
- Cost: (560 * $0.50 + 200 * $3.00) / 1,000,000 = **~$0.02/image**

**Supabase Storage:**
- 10K users * 5 images/day * 30 days * 2MB avg = 3TB/month
- Supabase: $0.021/GB/month = **$63/month**

**Total Infrastructure:**
- AI: $22,500/month (at scale, after preview)
- Storage: $63/month
- **Total: $22,563/month** (within $25K/month budget at 10K users)

**Mitigation Strategy:**
- Free tier: 5 images/day (keeps costs manageable)
- Pro tier: Unlimited images ($9.99/month) to offset AI costs
- Compression: Reduces storage costs by 60%

---

## Rollout Checklist

### Development
- [ ] Archive old Story 0.9 implementation
- [ ] Create migration: `20251221000002_ai_vision_columns.sql`
- [ ] Implement vision service (Gemini + OpenAI providers)
- [ ] Create API endpoints (upload, list, get, delete, analyze)
- [ ] Build mobile components (gallery, detail view, capture sheet)
- [ ] Implement rate limiting middleware
- [ ] Add image compression (expo-image-manipulator)
- [ ] Write tests (80%+ coverage)

### Testing
- [ ] Run migration on local Supabase
- [ ] Test camera/gallery permissions
- [ ] Test compression (10MB → <2MB)
- [ ] Test AI vision analysis
- [ ] Test rate limiting (hit 5/5 limit)
- [ ] Test offline queue (disconnect → upload → reconnect)
- [ ] Test RLS (2 accounts, verify isolation)

### Staging
- [ ] Apply migrations
- [ ] Create test users
- [ ] Monitor AI costs
- [ ] Monitor storage usage
- [ ] Performance profiling

### Production
- [ ] Apply migrations
- [ ] Enable Gemini 3 Flash
- [ ] Set up cost alerts ($4/day warning, $5/day critical)
- [ ] Monitor error rates (<2%)
- [ ] Track storage usage
- [ ] Document issues in `docs/bugs/`

---

## References

- **PRD:** `docs/prd/epic-0-foundation.md` (US-0.9, lines 177-238)
- **Architecture:** `docs/architecture/core-architectural-decisions.md`
- **RLS:** Story 0.4, `supabase/migrations/20251219170656_row_level_security.sql`
- **AI Service:** Story 0.6, `weave-api/app/services/ai_service.py`
- **Gemini API:** https://ai.google.dev/gemini-api/docs
- **Gemini Pricing:** https://ai.google.dev/gemini-api/docs/pricing
- **Supabase Storage:** https://supabase.com/docs/guides/storage

---

## Changelog

| Date | Author | Changes |
|------|--------|----|
| 2025-12-21 | Bob (SM) | Initial creation (8 pts expansion) |
| 2025-12-21 | Bob (SM) | Validation improvements applied: Fresh implementation, 5 images/day limit, cost monitoring, offline support, compression, infinite scroll, optimized structure |

---

**Status:** ✅ **READY FOR DEVELOPMENT**

This story provides complete requirements for fresh implementation with AI vision, rate limiting, and cost controls.

**Next Steps:**
1. Archive old Story 0.9 files to `_archive/story-0.9-old/`
2. Run `dev-story` workflow to implement Story 0.9
3. Run `code-review` when complete
