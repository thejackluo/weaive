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
