# Core Architectural Decisions

## Styling Framework

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Primary Styling** | NativeWind (Tailwind CSS for RN) | Familiar Tailwind syntax, smaller bundle than Tamagui |
| **Alternative** | Tamagui (post-MVP) | Consider if web support or complex theming needed |

**NativeWind Setup:**
```bash
npm install nativewind
npx pod-install
```

## State Management Architecture

**Three-Layer Strategy:**

| Layer | Library | Purpose | Examples |
|-------|---------|---------|----------|
| **Server State** | TanStack Query | Remote data, caching, sync | Goals, completions, user profile |
| **Shared UI State** | Zustand | Cross-component state | Active filters, modal state |
| **Local State** | useState | Component-scoped | Form inputs, toggles |

**Why This Works:**
- TanStack Query handles 80% of state (server cache + mutations)
- Zustand for rare shared UI state (minimal stores)
- useState for everything component-local
- Clear boundaries = no state management debates

**TanStack Query Configuration:**
```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false, // Important for mobile
    },
  },
});
```

## Data Access Patterns

**Hybrid Approach:**

| Access Pattern | When to Use | Examples |
|----------------|-------------|----------|
| **Supabase Direct** | Auth, storage, simple CRUD | Login, file uploads, read user profile |
| **FastAPI Backend** | AI operations, complex business logic | Triad generation, onboarding, Dream Self chat |

**Decision Tree:**
1. Auth or file storage? → Supabase direct
2. Simple read/write with no business logic? → Supabase direct
3. AI involvement? → FastAPI
4. Complex validation or multi-table transactions? → FastAPI

## Type Safety

| Tool | Purpose |
|------|---------|
| **supabase gen types typescript** | Generate DB types from schema |
| **Zod** | Runtime validation at API boundaries |
| **TypeScript strict mode** | Compile-time type checking |

**Type Generation Command:**
```bash
npx supabase gen types typescript --project-id <project-ref> > lib/database.types.ts
```

## Data Integrity Rules

**Immutable Tables (Append-Only):**
- `subtask_completions` - Never UPDATE or DELETE, only INSERT
- Completions are canonical truth; stats derived from these events

**Soft Delete Pattern:**
- Use `deleted_at` timestamp instead of hard DELETE
- Preserves audit trail, enables undo

## Navigation Architecture

**Implementation:** Epic 1.5 - App Navigation Scaffolding

### Overview

Weave uses **Expo Router** (file-based routing) with a **3-tab structure** and a magical center AI button that opens a glassmorphism overlay. This design is inspired by iOS 18 Siri's elevated, translucent interface.

| Tab | Route | Purpose |
|-----|-------|---------|
| **Thread** | `/(tabs)/index` | Daily Binds, Journal, Captures (Epic 3, 4) |
| **AI Chat** | `/(tabs)/ai-chat` | Hidden tab - accessed via center button |
| **Dashboard** | `/(tabs)/dashboard` | Progress visualization, Goals, Settings (Epic 2, 5, 8) |

### Route Hierarchy

```
app/
├── index.tsx                    # Root entry with auth guards
├── (auth)/                      # Auth flow (Route Group 1)
│   ├── login.tsx
│   └── signup.tsx
├── (onboarding)/                # Onboarding flow (Route Group 2)
│   ├── index.tsx               # Redirect to welcome
│   ├── welcome.tsx
│   ├── vision.tsx
│   └── identity-generation.tsx
└── (tabs)/                      # Main app (Route Group 3)
    ├── _layout.tsx             # 3-tab nav + center AI button
    ├── index.tsx               # Thread tab (home)
    ├── ai-chat.tsx             # AI Coach (hidden from tabs)
    ├── dashboard.tsx           # Dashboard tab
    ├── goals/                  # Epic 2: Goal Management
    │   ├── index.tsx           # Goals list
    │   ├── [id].tsx            # Goal detail
    │   ├── new.tsx             # Create goal
    │   └── edit/[id].tsx       # Edit goal
    ├── binds/                  # Epic 3: Daily Actions
    │   ├── [id].tsx            # Bind detail
    │   └── proof/[id].tsx      # Attach proof
    ├── journal/                # Epic 4: Reflection
    │   ├── index.tsx           # Daily reflection
    │   ├── history.tsx         # Journal history
    │   └── [date].tsx          # Past entry
    ├── captures/               # Epic 3: Memory Capture
    │   ├── index.tsx           # Gallery
    │   └── [id].tsx            # Detail
    └── settings/               # Epic 8: Settings
        ├── index.tsx           # Settings home
        ├── identity.tsx        # Identity document
        └── subscription.tsx    # Subscription
```

### Center AI Button & Glassmorphism

**Design Specs:**
- **Position:** Absolute, bottom 20px, horizontally centered
- **Size:** 56x56px circular button
- **Color:** Primary blue (#3B72F6)
- **Icon:** ✨ sparkle emoji (displayMd variant)
- **Elevation:** 8px shadow (iOS) / elevation 8 (Android)
- **Animation:** Spring scale 0.95 on press
- **Haptics:** Medium impact feedback

**Glassmorphism Overlay:**
- **Blur:** BlurView with 20 blur amount, dark type
- **Card:** Translucent dark (`rgba(26, 26, 26, 0.95)`)
- **Border:** 1px white/20% opacity, 24px border radius
- **Height:** 60% of screen
- **Animation:** Slide up with spring physics
- **Dismissal:** Tap outside or close button

**Code Example:**
```tsx
// app/(tabs)/_layout.tsx
function CenterAIButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <View style={styles.centerButtonContainer}>
      <Animated.View style={[{ transform: [{ scale: scale.value }] }]}>
        <TouchableOpacity onPress={handlePress} style={styles.centerButton}>
          <Text variant="displayMd" className="text-white">✨</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
```

### Auth Guards & Routing Logic

**Three-Level Protection:**

```tsx
// app/index.tsx
export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const devSkipAuth = __DEV__ && Constants.expoConfig?.extra?.devSkipAuth === true;

  // Level 0: Testing Mode (bypasses all checks)
  if (devSkipAuth) return <Redirect href="/(tabs)" />;

  // Level 1: Loading State
  if (isLoading) return <LoadingScreen />;

  // Level 2: Authentication Required
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  // Level 3: Onboarding Required
  const onboardingComplete = user?.onboarding_completed_at != null;
  if (!onboardingComplete) return <Redirect href="/(onboarding)/welcome" />;

  // All checks passed → Main app
  return <Redirect href="/(tabs)" />;
}
```

### Testing Mode Pattern

**Purpose:** Allow developers to bypass auth during navigation development

**Configuration:**
```json
// app.json
{
  "expo": {
    "extra": {
      "devSkipAuth": false  // Set to true in local dev
    }
  }
}

// .env (local only)
EXPO_PUBLIC_DEV_SKIP_AUTH=true
```

**Dev Banner:**
When `devSkipAuth` is enabled, a visible banner appears at the top of the screen:
```
🧪 DEV MODE: Auth Bypassed
```

**Important:** Never enable this in production builds.

### Navigation Usage

**Link Component (Recommended):**
```tsx
import { Link } from 'expo-router';

<Link href="/goals/new" asChild>
  <TouchableOpacity>
    <Text>Create New Goal</Text>
  </TouchableOpacity>
</Link>
```

**Programmatic Navigation:**
```tsx
import { router } from 'expo-router';

// Navigate forward
router.push('/goals/123');

// Replace (no back button)
router.replace('/(tabs)/dashboard');

// Go back
router.back();
```

**Dynamic Routes:**
```tsx
// Navigate to: /goals/abc-123
<Link href="/goals/abc-123">View Goal</Link>

// Access params in screen
import { useLocalSearchParams } from 'expo-router';
const { id } = useLocalSearchParams();
```

### Stack vs Tabs vs Modal

| Pattern | Use Case | Example |
|---------|----------|---------|
| **Tabs** | Primary navigation (3 main sections) | Thread, Dashboard |
| **Stack** | Drill-down within a section | Goals list → Goal detail → Edit goal |
| **Modal** | Overlay without navigation | AI Chat overlay, Create goal form |

**Modal Pattern:**
```tsx
// Present as modal
<Link href="/goals/new" asChild>
  <TouchableOpacity>
    <Text>Create Goal</Text>
  </TouchableOpacity>
</Link>

// Screen configured as modal in _layout.tsx
<Stack.Screen
  name="new"
  options={{
    presentation: 'modal',
    title: 'New Goal',
  }}
/>
```

### Navigation State Persistence

Expo Router automatically persists navigation state across app restarts. Users return to the exact screen they left.

**Disable for specific screens:**
```tsx
// app/_layout.tsx
<Stack screenOptions={{ freezeOnBlur: true }} />
```

### Deep Linking

**Supported URL schemes:**
```
weave://goals/123              # Open goal detail
weave://journal                # Open today's journal
weave://settings/subscription  # Open subscription settings
```

**Configuration:** See `app.json` → `scheme: "weave"`

---

## Party Mode Review Enhancements

The following action items were validated by multi-agent review (Winston, Amelia, Barry, Murat):

1. **TanStack Query Mobile Defaults**: `refetchOnWindowFocus: false` configured to prevent unnecessary refetches on app foreground
2. **Typed Zustand Stores**: All stores must be typed from day one - no `any` types
3. **Generated DB Types**: Use `supabase gen types typescript` after every schema change
4. **Supabase vs FastAPI Decision Tree**: Documented above for clear routing decisions
5. **Append-Only Protection**: `subtask_completions` table must never have UPDATE/DELETE operations

## Offline Strategy

**Requirement:** NFR-C4 specifies "Basic read access" when offline. Users on subway, in elevators, or with poor connectivity must be able to use core features.

### Offline Capabilities

| Feature | Offline Support | Behavior |
|---------|-----------------|----------|
| View today's binds | ✅ Full | Cached data |
| Complete a bind | ✅ Full | Queue mutation, sync later |
| Attach proof (photo) | ✅ Full | Store locally, upload later |
| View dashboard | ✅ Partial | Cached data (may be stale) |
| AI chat | ❌ None | Show "Requires internet" |
| Submit journal | ⚠️ Queued | Queue for sync, no AI feedback until online |

### TanStack Query Persistence

```typescript
// mobile/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,           // 5 minutes
      gcTime: 1000 * 60 * 60 * 24,        // 24 hours (keep in cache)
      retry: 2,
      refetchOnWindowFocus: false,
      networkMode: 'offlineFirst',         // Use cache when offline
    },
    mutations: {
      networkMode: 'offlineFirst',         // Queue mutations when offline
      retry: 3,
    },
  },
});

// Persist to AsyncStorage
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'weave-query-cache',
});

persistQueryClient({
  queryClient,
  persister: asyncStoragePersister,
  maxAge: 1000 * 60 * 60 * 24,  // 24 hours
});
```

### Offline Mutation Queue

```typescript
// mobile/lib/offlineMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { completeBind } from './api';

export function useCompleteBind() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeBind,
    onMutate: async (variables) => {
      // Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey: ['binds', 'today'] });

      // Snapshot previous value
      const previous = queryClient.getQueryData(['binds', 'today']);

      // Optimistic update
      queryClient.setQueryData(['binds', 'today'], (old: any) => ({
        ...old,
        data: old.data.map((b: any) =>
          b.id === variables.bindId
            ? { ...b, completed: true, completed_at: new Date().toISOString() }
            : b
        ),
      }));

      return { previous };
    },
    onError: (err, variables, context) => {
      // Revert on error
      if (context?.previous) {
        queryClient.setQueryData(['binds', 'today'], context.previous);
      }
    },
    onSettled: () => {
      // Refetch when back online
      queryClient.invalidateQueries({ queryKey: ['binds', 'today'] });
    },
  });
}
```

### Connectivity Detection

```typescript
// mobile/hooks/useConnectivity.ts
import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export function useConnectivity() {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected ?? false);
      setIsInternetReachable(state.isInternetReachable ?? false);
    });

    return () => unsubscribe();
  }, []);

  return {
    isConnected,
    isInternetReachable,
    isOffline: !isConnected || !isInternetReachable,
  };
}
```

### Offline UI Indicator

```typescript
// mobile/components/ui/OfflineBanner.tsx
import { useConnectivity } from '@/hooks/useConnectivity';
import { View, Text } from 'react-native';

export function OfflineBanner() {
  const { isOffline } = useConnectivity();

  if (!isOffline) return null;

  return (
    <View className="bg-amber-500 px-4 py-2">
      <Text className="text-white text-center text-sm">
        You're offline. Changes will sync when connected.
      </Text>
    </View>
  );
}
```

### Sync on Reconnect

```typescript
// mobile/lib/syncManager.ts
import NetInfo from '@react-native-community/netinfo';
import { queryClient } from './queryClient';

export function setupSyncManager() {
  let wasOffline = false;

  NetInfo.addEventListener((state) => {
    const isOnline = state.isConnected && state.isInternetReachable;

    if (isOnline && wasOffline) {
      // Just came back online - trigger sync
      console.log('Back online - syncing...');

      // Invalidate all queries to refresh data
      queryClient.invalidateQueries();

      // Resume any paused mutations
      queryClient.resumePausedMutations();
    }

    wasOffline = !isOnline;
  });
}
```

### Required Dependencies

```bash
npm install @react-native-async-storage/async-storage @react-native-community/netinfo
npm install @tanstack/query-async-storage-persister @tanstack/react-query-persist-client
```

---

## Rate Limiting Architecture

**Purpose:** Control storage costs and prevent abuse for image uploads and voice transcriptions.

### Rate Limit Strategy

| Resource | Per-User Daily Limit | Rationale |
|----------|---------------------|-----------|
| **Image Uploads (count)** | 20 images/day | Prevents spam; industry standard (Discord: throttled) |
| **Image Uploads (size)** | 5MB total/day | Cost control: 10K users = 50GB/day max |
| **Voice Transcriptions** | 50 requests/day | Prevents STT API abuse; 2-3x normal usage buffer |
| **Voice Duration** | 5 min/request | Prevents excessive per-request costs |

### Implementation Pattern

**Tracking:**
- Store daily counters in `daily_aggregates` table:
  - `upload_count` (INT, default 0)
  - `upload_size_mb` (DECIMAL, default 0)
  - `transcription_count` (INT, default 0)
- Reset at midnight user's local timezone (calculated server-side)

**Enforcement:**
- Server-side validation in FastAPI middleware
- Check limits before processing upload/transcription
- Return HTTP 429 (Too Many Requests) with headers:
  - `Retry-After: {seconds_until_midnight}` (RFC 7231)
  - `X-RateLimit-Limit: {daily_limit}`
  - `X-RateLimit-Remaining: {remaining_quota}`
  - `X-RateLimit-Reset: {unix_timestamp_midnight}`

**Error Response Format:**
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Daily upload limit reached (20 images or 5MB). Try again in 6h 23m.",
    "retryable": true,
    "retryAfter": 22980
  }
}
```

**Mobile UI:**
- Show usage indicator in Quick Capture UI: "3/20 images uploaded today (2.5MB/5MB used)"
- Display friendly rate limit message with countdown timer
- Gray out upload buttons when limits reached

**Cost Protection:**
- 10K users * 5MB/day = **50GB/day max** = **1.5TB/month max**
- Supabase Storage pricing: $0.021/GB/month = ~$31.50/month for storage
- Compare to unlimited: Potential 10K users * 100MB/day = 1TB/day = catastrophic costs

---

## AI Vision Service Architecture

**Purpose:** Enable AI-powered image analysis for proof validation, OCR, content classification, and quality scoring.

### Provider Selection: Gemini 3.0 Flash

**Decision:** Use Gemini 3.0 Flash as primary vision provider

**Rationale:**
- **Cost:** $0.50 per 1M input tokens (~$0.0005 per image) - 10x cheaper than GPT-4o Vision ($5/1M tokens)
- **Performance:** Fast inference (<2 seconds per image), low latency
- **Quality:** Excellent for proof validation, OCR, classification tasks
- **Scalability:** Can handle high volume (6K+ images/day)
- **Preview status:** Currently free during preview period (but budget for paid pricing post-preview)
- **Integration:** Simple Google Cloud Console setup

### Vision Fallback Chain

```
1. Primary: Gemini 3.0 Flash ($0.50/1M tokens)
   ↓ (timeout/error)
2. Secondary: GPT-4o Vision ($5.00/1M tokens)
   ↓ (timeout/error)
3. Tertiary: Store image only, defer analysis
   → User can retry later or view without AI insights
```

### Integration Architecture

**Backend Service:**
```python
# weave-api/app/services/vision_service.py
class VisionService:
    async def analyze_image(self, image_url: str, bind_context: dict) -> dict:
        """
        Analyze image using fallback chain.
        Returns: {
            proof_validated: bool,
            extracted_text: str,
            content_classification: str,
            quality_score: int (1-5),
            provider: str
        }
        """
        # Try Gemini 3.0 Flash
        # If fails, try GPT-4o Vision
        # If fails, return null analysis
```

**API Endpoints:**
```
POST /api/captures/images/analyze
Body: { image_id: str, bind_context?: dict }

Response: {
  "data": {
    "image_id": "uuid",
    "analysis": {
      "proof_validated": true,
      "extracted_text": "200 lbs x 8 reps",
      "content_classification": "gym_equipment",
      "quality_score": 4,
      "insights": "Image shows barbell with weights, matches workout bind"
    }
  }
}
```

**Cost Tracking:**
- Log in `ai_runs` table:
  - `operation_type = 'image_analysis'`
  - `provider = 'gemini_3.0_flash'`
  - `image_count = 1`
  - `cost_usd = 0.0005`

### Storage Pattern

**Image Files:**
- Store in Supabase Storage: `/captures/images/{user_id}/{uuid}.jpg`
- Max file size: 10MB per image
- Supported formats: JPEG, PNG
- Minimum dimensions: 100x100px

**AI Analysis Results:**
- Store in `captures` table:
  - `ai_analysis` (JSONB, nullable) - Vision API output
  - `ai_verified` (BOOLEAN, default false) - True if proof validated
  - `ai_quality_score` (INT, nullable) - 1-5 quality rating

### Vision Analysis Features

| Feature | Purpose | Example Output |
|---------|---------|----------------|
| **Proof Validation** | Detect if image shows claimed activity | "Image shows gym equipment matching workout bind" |
| **OCR** | Extract text from images | "200 lbs x 8 reps, Bench Press" from workout log |
| **Content Classification** | Categorize image type | "gym_equipment", "food", "outdoor_activity", "workspace" |
| **Quality Scoring** | Rate image relevance (1-5) | 5 = Clear, relevant proof; 1 = Blurry, irrelevant |

### Cost Projections

**MVP Assumptions (10K users):**
- 30% capture proof daily = 3K users
- Average 2 proof captures/user/day
- 6K images/day requiring analysis

**Daily Cost Calculation:**
```
6K images/day * $0.0005/image = $3/day = $90/month
```

**Budget Impact:**
- Vision: $90/month
- STT: $186/month (from Story 0.11)
- AI Coaching: ~$2,000/month (existing)
- **Total AI Budget:** $2,276/month (within $2,500 limit, $224 headroom)

### Rate Limiting

**Image Analysis Limits:**
- Max 20 AI vision analyses per user per day
- Track in `daily_aggregates` table: `ai_vision_count` (INT)
- Enforced via same middleware pattern (HTTP 429)

### UI Components

**AI Analysis Display:**
- **AIAnalysisBadge:** "AI Verified ✓" badge on validated proof
- **ImageDetailView:** Show extracted text, classification, quality score
- **Loading State:** "Analyzing image..." with progress indicator

### Dependencies

**Python Packages:**
```bash
# Google Generative AI SDK for Gemini
uv add google-generativeai

# Alternative: Use OpenAI SDK for GPT-4o Vision fallback (already installed)
```

**Environment Variables:**
```bash
GOOGLE_AI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_gpt4o_fallback_key  # Already configured
```

---

## Unified AI Service Architecture (Story 1.5.3)

**Purpose:** Standardize AI integrations across text, image, and audio modalities with consistent patterns for provider abstraction, cost tracking, and error handling.

### AIProviderBase Abstraction

**Pattern:** All AI providers (text/image/audio) inherit from single `AIProviderBase` abstract class.

**Architecture:**
```python
# weave-api/app/services/ai_provider_base.py
from abc import ABC, abstractmethod

class AIProviderBase(ABC):
    @abstractmethod
    async def call_ai(self, input: dict, context: dict) -> dict:
        """Execute AI call with provider-specific logic."""
        pass

    @abstractmethod
    def estimate_cost(self, input: dict) -> float:
        """Estimate cost before making call."""
        pass

    @abstractmethod
    def get_provider_name(self) -> str:
        """Return provider identifier (e.g., 'gpt-4o-mini', 'gemini-3-flash')."""
        pass

    async def log_to_ai_runs(self, operation_type: str, input_tokens: int,
                             output_tokens: int, cost_usd: float, duration_ms: int):
        """Unified cost tracking to ai_runs table."""
        # Common implementation for all providers

    async def check_rate_limit(self, user_id: UUID, operation_type: str):
        """Check daily_aggregates before AI call."""
        # Common implementation for all providers
```

### Provider Fallback Pattern

**Standard Fallback Chain:**
```
1. Primary Provider (cost-optimized)
   ↓ (timeout/error)
2. Secondary Provider (quality-optimized)
   ↓ (timeout/error)
3. Graceful Degradation (return None or cached/default response)
```

**Implementation:**
```python
async def call_with_fallback(input: dict, context: dict):
    try:
        return await primary_provider.call_ai(input, context)
    except Exception as e:
        logger.warning(f"Primary provider failed: {e}")
        try:
            return await secondary_provider.call_ai(input, context)
        except Exception as e2:
            logger.error(f"Secondary provider failed: {e2}")
            return graceful_degradation_response()
```

### Unified Cost Tracking

**Pattern:** ALL AI calls log to `ai_runs` table with consistent schema:

```python
# Common fields for all AI modalities
await log_to_ai_runs(
    operation_type="text_generation" | "image_analysis" | "transcription",
    provider="gpt-4o-mini" | "gemini-3-flash" | "assemblyai",
    input_tokens=500,      # or image_count, audio_duration_sec
    output_tokens=200,     # or null for non-text
    model="gpt-4o-mini-2024-07-18",
    cost_usd=0.0025,       # Calculated per-provider pricing
    duration_ms=1200
)
```

### Unified Rate Limiting

**Pattern:** Check `daily_aggregates` table before ALL AI calls:

| AI Modality | Rate Limit Column | Limit |
|-------------|-------------------|-------|
| Text Generation | `ai_text_count` | 10 calls/hour |
| Image Analysis | `ai_vision_count` | 5 analyses/day |
| Voice Transcription | `transcription_count` | 50 transcriptions/day |

**Enforcement:**
- HTTP 429 response with `Retry-After` header
- Error code: `RATE_LIMIT_EXCEEDED`
- Message includes next reset time in user's timezone

### React Native AI Hooks

**Standard Hooks for All Modalities:**

```typescript
// Text AI
const { generate, isGenerating, error } = useAIChat();
const result = await generate({ prompt: "...", context: {...} });

// Image AI
const { analyze, isAnalyzing, error } = useImageAnalysis();
const result = await analyze({ imageUrl: "...", operations: [...] });

// Audio AI
const { transcribe, isTranscribing, error } = useVoiceTranscription();
const result = await transcribe({ audioFile: blob, format: "m4a" });
```

**Loading States:**
- Text: "Generating..."
- Image: "Analyzing image..."
- Audio: "Transcribing audio..."

**Error States:**
- Provider failure: "AI service unavailable. Try again."
- Rate limit: "Daily limit reached. Resets at midnight."
- Network error: "No internet. Try again when online."

### Complete Documentation

**Developer Guides Created by Story 1.5.3:**
- `docs/dev/ai-services-guide.md` - Comprehensive AI integration guide
- Examples for all 3 modalities (text, image, audio)
- Provider decision tree (when to use which provider)
- Cost calculation formulas
- Frontend hook usage patterns

**Reference:** See Story 1.5.3 acceptance criteria for complete implementation details.

---

## Full Image Service Architecture

**Purpose:** Complete image lifecycle management (upload, store, retrieve, analyze, delete) with gallery UI.

### Image Upload Validation

**Pre-Upload Checks:**
- File type: JPEG, PNG only
- File size: Max 10MB per image
- Dimensions: Minimum 100x100px
- Rate limit: Max 20 images/day per user

**Upload Flow:**
```
Mobile → POST /api/captures/images
      → Validate (type, size, rate limit)
      → Upload to Supabase Storage
      → Trigger AI analysis (async)
      → Return image_id + presigned URL
```

### Storage Strategy

**File Storage:**
- **Location:** Supabase Storage bucket `captures`
- **Path Pattern:** `/captures/images/{user_id}/{uuid}.{ext}`
- **Access Control:** RLS policies (user can only access own images)
- **Presigned URLs:** 1-hour expiry for client downloads

**Metadata Storage:**
- Store in `captures` table:
  - `capture_type = 'image'`
  - `file_url` (TEXT) - Supabase Storage path
  - `file_size_bytes` (INT) - For quota tracking
  - `ai_analysis` (JSONB) - Vision API results
  - `ai_verified` (BOOLEAN) - Proof validation result

### Image Retrieval API

**List Images:**
```
GET /api/captures/images?filter=goal_id|bind_id|date_range

Query Params:
- goal_id (optional): Filter by specific goal
- bind_id (optional): Filter by specific bind
- start_date, end_date (optional): Date range filter
- limit, offset (pagination)

Response: {
  "data": [
    {
      "id": "uuid",
      "file_url": "https://storage.supabase.co/...",
      "captured_at": "2025-12-21T10:00:00Z",
      "ai_verified": true,
      "ai_quality_score": 4,
      "bind_id": "uuid"
    }
  ],
  "meta": { "total": 42, "page": 1 }
}
```

**Get Single Image:**
```
GET /api/captures/images/{image_id}

Response: {
  "data": {
    "id": "uuid",
    "file_url": "https://...",
    "ai_analysis": {
      "proof_validated": true,
      "extracted_text": "...",
      "content_classification": "gym",
      "quality_score": 4
    }
  }
}
```

### Image Deletion

**Cascade Cleanup:**
```
DELETE /api/captures/images/{image_id}

Backend Actions:
1. Check ownership (RLS policy)
2. Delete from Supabase Storage
3. Soft delete from captures table (set deleted_at)
4. Update daily_aggregates (decrement upload_count, upload_size_mb)
```

### UI Components

**Image Gallery View:**
- Chronological grid layout (3 columns on mobile)
- Filters: By goal, by date range
- AI verification badge overlay
- Tap to open full-screen detail view

**Image Detail View:**
- Full-screen image with pinch-to-zoom
- Swipe left/right for prev/next image
- AI insights panel (extracted text, classification, quality)
- Delete button with confirmation dialog
- Share option (export image with AI insights)

### Error Handling

**Error Scenarios:**
| Error | HTTP Code | Message | Retry Strategy |
|-------|-----------|---------|----------------|
| File too large | 400 | "Image must be under 10MB" | None - user must resize |
| Invalid format | 400 | "Only JPEG/PNG supported" | None |
| Rate limit | 429 | "Daily limit reached (20 images)" | Retry after midnight |
| Storage quota | 507 | "Storage full" | Contact support |
| Upload timeout | 408 | "Upload timed out" | 3 retries with exponential backoff |

**Retry Logic:**
- 3 attempts with exponential backoff (1s, 2s, 4s)
- Queue failed uploads locally in AsyncStorage
- Auto-retry when back online (via TanStack Query mutation queue)

---

## Observability Architecture

**Purpose:** Production debugging, error tracking, and user experience monitoring for fast issue resolution.

### LogRocket: Session Replay & Debugging

**Purpose:** Reproduce bugs by watching user sessions, understand user behavior, track performance.

**Integration Points:**

**Frontend (React Native):**
```typescript
// weave-mobile/app/_layout.tsx
import LogRocket from '@logrocket/react-native';

LogRocket.init('weave/production');

// Identify user after auth
LogRocket.identify(userId, {
  name: userName,
  email: userEmail,
  subscriptionTier: 'free' | 'pro' | 'max'
});
```

**Custom Event Tracking:**
```typescript
// Track key user actions
LogRocket.track('goal_created', { goalId, goalTitle });
LogRocket.track('bind_completed', { bindId, goalId, proofType });
LogRocket.track('proof_captured', { captureType: 'image' | 'voice' });
LogRocket.track('journal_submitted', { fulfillmentScore, wordCount });
LogRocket.track('triad_generated', { triadDate, bindCount });
```

**Screen Tracking:**
```typescript
// Automatic with Expo Router
// LogRocket captures navigation events
```

**Privacy Controls:**

**Sensitive Field Masking:**
```typescript
// Mask password inputs, auth tokens, sensitive profile data
LogRocket.redactText('.password-input');
LogRocket.redactText('.auth-token');
LogRocket.redactText('.sensitive-profile-field');
```

**Disable Recording (Settings/Profile):**
```typescript
// Optional: Disable session recording for settings screens
LogRocket.stopRecording(); // Pause recording
LogRocket.startRecording(); // Resume recording
```

**Data Retention:**
- 30 days (LogRocket default)
- Session videos automatically deleted after retention period

**Cost:**
- **Plan:** $99/month (up to 10K sessions/month)
- **ROI:** Reduces support cost by 50%+ (fewer blind debugging sessions)

### Sentry: Error Tracking & Performance Monitoring

**Purpose:** Catch errors before users report them, monitor performance, track releases.

**Integration Points:**

**Frontend (React Native):**
```typescript
// weave-mobile/app/_layout.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.EXPO_PUBLIC_ENV,
  tracesSampleRate: 0.2, // 20% of transactions monitored
  enableAutoSessionTracking: true,
  sessionTrackingIntervalMillis: 30000, // 30 seconds
});
```

**Backend (FastAPI):**
```python
# weave-api/app/main.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    environment=os.getenv("ENVIRONMENT", "development"),
    traces_sample_rate=0.2,
    integrations=[FastApiIntegration()],
)
```

**Performance Monitoring:**

**Frontend - Key Screens:**
```typescript
// Track screen load times
const transaction = Sentry.startTransaction({
  name: 'ThreadHomeScreen',
  op: 'screen.load',
});

// ... screen loads ...

transaction.finish();
```

**Tracked Screens:**
- Thread (Home) - Target <1s load time
- Goal Details - Target <1s load time
- Journal Entry - Target <1s load time
- Triad View - Target <1s load time

**Frontend - API Calls:**
```typescript
// Automatic via Sentry.Http integration
// Tracks GET /api/goals, POST /api/completions, etc.
```

**Backend - API Endpoints:**
```python
# Automatic via FastApiIntegration
# Tracks P50, P95, P99 latencies for all endpoints
```

**Error Tracking:**

**Frontend Alerts:**
- Error rate > 1% of sessions
- API response time > 5 seconds
- App crash rate > 1%

**Backend Alerts:**
- API error rate > 0.5%
- Database query time > 2 seconds
- AI API failures (Gemini, AssemblyAI, Whisper, OpenAI)

**Breadcrumbs:**
```typescript
// Automatic user action tracking leading to errors
Sentry.addBreadcrumb({
  category: 'user.action',
  message: 'User tapped "Complete Bind" button',
  level: 'info',
});
```

**Release Tracking:**
```typescript
// Link errors to specific app versions
Sentry.setRelease(`weave-mobile@${version}`);
Sentry.setDist(buildNumber);
```

**Cost:**
- **Plan:** Free tier (5K errors/month) or $26/month (50K errors)
- **ROI:** Proactive issue detection, faster debugging

### Monitoring Dashboard Access

**LogRocket Dashboard:** https://app.logrocket.com/weave/production
- Session replays
- User actions
- Console logs
- Network requests
- Performance metrics

**Sentry Dashboard:** https://sentry.io/organizations/weave/projects/
- Error tracking
- Performance monitoring
- Alerts
- Release tracking

### Dependencies

**Frontend:**
```bash
# LogRocket React Native SDK
npm install @logrocket/react-native

# Sentry React Native SDK
npm install @sentry/react-native
npx @sentry/wizard -i reactNative
```

**Backend:**
```bash
# Sentry FastAPI SDK
uv add sentry-sdk[fastapi]
```

**Environment Variables:**
```bash
# LogRocket
EXPO_PUBLIC_LOGROCKET_APP_ID=weave/production

# Sentry
EXPO_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_DSN=https://...@sentry.io/...  # Backend
EXPO_PUBLIC_ENV=production  # or staging
```

---

## Speech-to-Text Provider Architecture

**Purpose:** Enable voice recording features for captures and origin stories with cost-effective, accurate transcription.

### Provider Selection: AssemblyAI

**Decision:** Use AssemblyAI as primary STT provider

**Rationale:**
- **Accuracy:** 2nd place in 2025 benchmarks (behind only Whisper/Gemini, ahead of AWS/Azure/Deepgram)
- **Cost:** $0.15/hour (3x cheaper than Deepgram, 10x cheaper than AWS/Azure)
- **Ease of integration:** Simple REST API, excellent docs, 10+ SDKs
- **Free tier:** $50 credits = 333 hours of testing (covers full MVP development)
- **Features:** Speaker diarization, punctuation, confidence scores, multi-language support
- **Better than:** Apple's on-device STT, comparable to best-in-class B2B services

### STT Fallback Chain

```
1. Primary: AssemblyAI API ($0.15/hr)
   ↓ (timeout/error)
2. Secondary: OpenAI Whisper API ($0.36/hr)
   ↓ (timeout/error)
3. Tertiary: Store audio only, defer transcription
   → User can manually transcribe later or retry
```

### Integration Architecture

**Backend Service:**
```python
# weave-api/app/services/stt_service.py
class STTService:
    async def transcribe(self, audio_file: bytes, format: str) -> dict:
        """
        Transcribe audio using fallback chain.
        Returns: {transcript: str, confidence: float, duration_sec: float, provider: str}
        """
        # Try AssemblyAI
        # If fails, try Whisper
        # If fails, return audio URL only
```

**API Endpoint:**
```
POST /api/transcribe
Content-Type: multipart/form-data
Body: { audio_file: File }

Response: {
  "data": {
    "transcript": "This is my commitment to becoming...",
    "confidence": 0.94,
    "duration_sec": 45.2,
    "audio_url": "https://storage.supabase.co/..."
  }
}
```

**Cost Tracking:**
- Log in `ai_runs` table:
  - `operation_type = 'transcription'`
  - `provider = 'assemblyai'`
  - `audio_duration_sec = 45.2`
  - `cost_usd = 0.00188` (calculated: 45.2s / 3600s * $0.15)

### Storage Pattern

**Audio Files:**
- Store in Supabase Storage: `/captures/audio/{user_id}/{uuid}.m4a`
- Max file size: 10MB (same as images)
- Supported formats: MP3, M4A, WAV (common iOS/Android formats)

**Transcripts:**
- Store in `captures` table:
  - `transcript` (TEXT, nullable) - STT output
  - `transcript_confidence` (DECIMAL, nullable) - 0.0-1.0 confidence score
  - `audio_duration_sec` (INT, nullable) - for cost tracking

### Cost Projections

**MVP Assumptions (10K users):**
- 20% voice adoption rate = 2K users recording voice
- 2 recordings/user/day (origin story + 1 daily capture)
- Average recording length: 30 seconds

**Daily Cost Calculation:**
```
4K recordings/day * 30 sec/recording = 120,000 sec = 33.3 hours
33.3 hours * $0.15/hour = $5.00/day = $150/month
```

**Budget Impact:**
- STT: $150/month
- AI (GPT/Claude): ~$2,000/month (existing)
- **Total AI Budget:** $2,150/month (within $2,500 limit)

**Scaling Considerations:**
- At 100K users: $1,500/month STT (still affordable)
- At 1M users: $15,000/month (may need volume discounts)

### Rate Limiting

**Transcription Limits:**
- Max 50 transcription requests per user per day (2-3x normal usage)
- Max 5 minutes audio per request (prevents $1+ single-request costs)
- Enforced via same middleware pattern as image uploads (HTTP 429)

### Dependencies

**NPM Packages:**
```bash
# AssemblyAI SDK (optional, can use REST API directly)
npm install assemblyai
```

**Python Packages:**
```bash
# AssemblyAI SDK
uv add assemblyai

# Alternative: Use httpx for direct REST API calls
uv add httpx
```

**Environment Variables:**
```bash
ASSEMBLYAI_API_KEY=your_api_key_here
OPENAI_API_KEY=your_whisper_fallback_key  # Already configured
```

---

## Production Deployment Architecture

**Purpose:** Document production infrastructure configuration for backend (Railway), database (Supabase), and monitoring services.

### Backend Deployment (Railway)

**Platform:** Railway.app (managed Node.js/Python hosting)

**Configuration:**
- **Project:** weave-api-production
- **Service:** FastAPI backend
- **Region:** us-west-1 (low latency for US users)
- **Instance:** Shared vCPU, 512MB RAM (scale to 1GB if needed)
- **Auto-scaling:** Enabled (max 3 instances)

**Environment Variables (Production):**
```bash
# Database
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx  # Server-side only (never expose to client)
DATABASE_URL=postgresql://xxx

# AI Providers
OPENAI_API_KEY=sk-proj-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
GOOGLE_AI_API_KEY=xxx  # Gemini

# Auth
JWT_SECRET=xxx  # 256-bit random string
JWT_ALGORITHM=HS256

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
LOGROCKET_APP_ID=weave/production

# Environment
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO
```

**Deployment Strategy:**
- **CI/CD:** GitHub Actions triggers Railway deploy on push to `main`
- **Health Check:** `GET /health` endpoint (200 = healthy)
- **Rollback:** Railway auto-rollback on failed health check

**Cost Estimate:** $20-50/month (depends on usage, scales automatically)

---

### Database (Supabase Production)

**Instance:** Supabase Production Project (dedicated, separate from dev/staging)

**Configuration:**
- **Region:** us-west-1 (same as Railway for low latency)
- **Plan:** Pro Plan ($25/month) - required for production SLA
- **Database:** PostgreSQL 15
- **Connection Pooling:** Enabled (PgBouncer)

**Migration Strategy:**
```bash
# Run migrations via Supabase CLI
npx supabase db push --db-url $DATABASE_URL

# Verify migration success
npx supabase db diff --linked
```

**Backup Strategy:**
- **Automatic:** Daily backups (included in Supabase Pro Plan)
- **Retention:** 7 days
- **Manual Backup:** Run before major migrations or schema changes

**Security:**
- Row Level Security (RLS) enabled on all 12 user-owned tables
- SSL/TLS encryption for all connections
- Firewall rules restrict access to Railway backend only

---

### Monitoring & Observability

**Sentry (Error Tracking):**
- **Projects:** weave-mobile, weave-api
- **Alert Rules:**
  - Error rate > 1% of sessions → Slack #alerts
  - API response time > 5s → Email engineering@
  - App crash rate > 1% → Slack #alerts (urgent)
- **Integration:** See Epic 0.5 (Observability) for implementation details

**LogRocket (Session Replay):**
- **Project:** weave/production
- **Plan:** $99/month (10K sessions)
- **Usage:** Debug user issues, watch session recordings
- **Privacy:** Mask password fields, auth tokens, PII
- **Integration:** See Epic 0.5 (Observability) for implementation details

**UptimeRobot (Uptime Monitoring):**
- **URL:** `https://weave-api-production.railway.app/health`
- **Check Interval:** 5 minutes
- **Alert Threshold:** Downtime > 2 minutes

---

### CDN & Static Assets

**Not Required for MVP:**
- Expo serves mobile app bundle (built-in CDN)
- Supabase Storage serves images/audio (built-in CDN)
- No separate CDN needed

**Future Consideration (Post-MVP):**
- Cloudflare CDN for global users (low latency worldwide)
- Cost: Free tier covers 10GB/month bandwidth

---

### Production Security

**Security Measures (Story 9.5):**
- Rate limiting: 100 req/min (public), 1000 req/min (authenticated)
- HTTPS-only (Railway auto-SSL)
- Secure cookie flags: `HttpOnly`, `Secure`, `SameSite=Strict`
- CORS whitelist (mobile app origin only)
- Debug mode disabled (`DEBUG=false`)
- Secrets stored in Railway dashboard (not GitHub)

**Compliance:**
- GDPR (EU users): Data export, right to be forgotten
- COPPA (if users <13): Parental consent, minimal data collection
- App Store guidelines: Privacy policy, no prohibited content

---

### Disaster Recovery

**Database Restoration:**
1. Access Supabase Dashboard → Project Settings → Backups
2. Select backup to restore (daily backups available)
3. Click "Restore" (creates new database from backup)
4. Update `DATABASE_URL` in Railway to point to restored database
5. Verify data integrity

**Backend Rollback:**
1. Railway Dashboard → Deployments tab
2. Select previous working deployment
3. Click "Redeploy" (instant rollback)
4. Verify `/health` endpoint returns 200

**RTO (Recovery Time Objective):** < 15 minutes
**RPO (Recovery Point Objective):** < 24 hours (daily backups)

---

### AI Module Orchestration Architecture

**Added:** 2025-12-22 (Story 1.5.3 AC-9, AC-10)

**Overview:**

Weave AI system uses a modular architecture with 5 product modules orchestrated centrally. This separates:
- **AI Providers** (HOW to call APIs): OpenAI, Anthropic, Gemini, AssemblyAI
- **AI Modules** (WHAT product features): Onboarding, Triad, Recap, Dream Self, Insights

**Architecture Diagram:**

```
┌─────────────────────────────────────────────────────────────────┐
│                      API Endpoint Layer                          │
│  POST /api/goals, POST /api/ai/recap, POST /api/ai/chat, etc.  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AI Orchestrator                             │
│  - Route requests to correct module                              │
│  - Enforce rate limiting                                         │
│  - Log all AI calls to ai_runs                                   │
│  - Coordinate Context Builder                                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ Module        │  │ Context       │  │ Module        │
│ Registry      │  │ Builder       │  │ Instances     │
│               │  │               │  │               │
│ operation →   │  │ Assemble:     │  │ 1. Onboarding │
│ module map    │  │ - Identity    │  │ 2. Triad      │
│               │  │ - Goals       │  │ 3. Recap      │
│               │  │ - History     │  │ 4. Dream Self │
│               │  │ - Metrics     │  │ 5. Insights   │
└───────────────┘  └───────────────┘  └───────┬───────┘
                                               │
                            ┌──────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AI Provider Layer                           │
│  AIProviderBase → OpenAI, Anthropic, Gemini, AssemblyAI        │
└─────────────────────────────────────────────────────────────────┘
```

**Components:**

**1. AI Orchestrator** (`app/services/ai/ai_orchestrator.py`)
- Central coordinator for all AI operations
- Routes requests to appropriate module
- Enforces rate limiting before execution
- Logs all AI calls to `ai_runs` table
- Handles fallback chains

**2. Module Registry** (`app/services/ai/module_registry.py`)
- Maps operation types to module instances
- Example: `generate_triad` → Triad Planner module
- Enables dynamic module loading

**3. Context Builder** (`app/services/ai/context_builder.py`)
- Assembles user context for AI calls
- Operation-specific context (Triad needs different data than Chat)
- Prevents redundant database queries

**4. AI Modules** (5 total)
- Inherit from `AIModuleBase`
- Implement specific product features
- Use AI providers through orchestrator

**5 AI Modules:**

| Module | Operations | Used In Stories |
|--------|-----------|-----------------|
| **Onboarding Coach** | `generate_goal_breakdown`, `create_identity_doc_v1` | 1.8, 2.3 |
| **Triad Planner** | `generate_triad` | 4.3 |
| **Daily Recap** | `generate_recap` | 4.3 |
| **Dream Self Advisor** | `chat_response` | 6.1, 6.2 |
| **AI Insights Engine** | `generate_weekly_insights` | 6.4 |

**Benefits:**

1. **Consistent Patterns:** All AI features use orchestrator (no direct provider calls)
2. **Cost Tracking:** Automatic logging to `ai_runs` table
3. **Rate Limiting:** Enforced centrally before module execution
4. **Context Optimization:** Single fetch per operation (via Context Builder)
5. **Maintainability:** Add new modules without changing orchestrator

**Usage Example:**

```python
# API route using orchestrator
from app.services.ai.ai_orchestrator import get_orchestrator

@router.post("/api/goals")
async def create_goal(goal_data: GoalCreate, user: User = Depends(get_current_user)):
    orchestrator = get_orchestrator()

    # Orchestrator handles: rate limits, module routing, context, logging
    ai_result = await orchestrator.execute_ai_operation(
        user_id=str(user.id),
        operation_type="generate_goal_breakdown",
        params={"title": goal_data.title, "description": goal_data.description}
    )

    # Use AI output to create goal
    goal = Goal(user_id=user.id, title=goal_data.title, ...)
    return {"data": goal.to_dict()}
```

**Reference:** Complete implementation guide in `docs/dev/ai-services-guide.md` (Sections 8-11)

---

### Cost Summary (Production Infrastructure)

| Service | Monthly Cost | Purpose |
|---------|--------------|---------|
| Railway (Backend) | $20-50 | FastAPI hosting |
| Supabase Pro | $25 | Database + Auth + Storage |
| Apple Developer | $8 ($99/year) | App Store publishing |
| RevenueCat | Free (up to $10K MRR) | Subscription management |
| LogRocket | $99 | Session replay |
| Sentry | Free or $26 | Error tracking |
| **Total** | **$172-208/month** | **Excluding AI costs** |

**AI Costs (Separate Budget):**
- OpenAI + Anthropic: ~$2,000/month (text AI)
- Google AI (Gemini): ~$90/month (image analysis)
- AssemblyAI: ~$150/month (voice transcription)
- **Total AI:** ~$2,240/month (within $2,500 budget)

---
