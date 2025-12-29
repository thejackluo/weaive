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

## AI Module Orchestration Architecture (Story 1.5.3)

**Purpose:** Create product module orchestration layer on top of existing AI provider infrastructure, enabling feature-specific AI workflows with context-aware calls.

**Story Reference:** `docs/stories/1-5-3-ai-module-orchestration.md` (4-5 story points)

### Architectural Overview

Story 1.5.3 creates a **NEW orchestration layer** that sits above existing provider infrastructure:

```
Request Flow:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Request → AIOrchestrator (NEW - which product module?)
         → AIModule (NEW - what context to build?)
         → AIService (EXISTS - which AI provider?)
         → AIProvider (EXISTS - API call implementation)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Separation of Concerns:**
- **AIOrchestrator** (NEW): Routes requests to product modules
- **AIModules** (NEW): Build context and implement product features
- **AIService** (EXISTS): Routes to AI providers with rate limiting, cost tracking, fallback
- **AIProviders** (EXISTS): Implement API calls to OpenAI, Anthropic, Gemini

### Existing Infrastructure (Stories 0.6, 0.9)

**Already Implemented - DO NOT DUPLICATE:**

1. **AIProvider Base Class** (`weave-api/app/services/ai/base.py`)
   ```python
   class AIProvider(ABC):
       def complete(self, prompt: str, model: str, **kwargs) -> AIResponse:
           """Generate AI completion."""
           pass

       def count_tokens(self, text: str, model: str) -> int:
           """Count tokens for cost estimation."""
           pass

       def estimate_cost(self, input_tokens: int, output_tokens: int, model: str) -> float:
           """Calculate USD cost."""
           pass
   ```

2. **AIService Orchestrator** (`weave-api/app/services/ai/ai_service.py`)
   - 4-tier fallback chain (Bedrock → OpenAI → Anthropic → Deterministic)
   - 24-hour caching with input_hash
   - Dual cost tracking (application-wide + per-user)
   - Role-based rate limiting (admin unlimited, paid 10/hour, free 10/day)
   - Budget enforcement with auto-throttle
   - Comprehensive logging to `ai_runs` table

3. **Six AI Providers Implemented:**
   - `BedrockProvider` - AWS Bedrock text generation
   - `OpenAIProvider` - GPT-4o/GPT-4o-mini
   - `AnthropicProvider` - Claude 3.7 Sonnet/Haiku
   - `DeterministicProvider` - Template fallback
   - `GeminiVisionProvider` - Image analysis (Story 0.9)
   - `OpenAIVisionProvider` - Vision fallback (Story 0.9)

### New AI Module Layer (Story 1.5.3)

**AIModuleBase - Product Feature Abstraction:**

```python
# weave-api/app/services/ai/ai_module_base.py
from abc import ABC, abstractmethod
from app.services.ai import AIService  # Use existing service

class AIModuleBase(ABC):
    """
    Base class for all AI product modules.

    Modules represent product features (Onboarding Coach, Triad Planner, etc.)
    that use existing AIService for provider orchestration.
    """

    def __init__(self, ai_service: AIService, context_builder):
        self.ai_service = ai_service  # Use existing service
        self.context_builder = context_builder

    @abstractmethod
    def get_module_name(self) -> str:
        """Return module identifier (e.g., 'onboarding_coach')."""
        pass

    @abstractmethod
    async def execute(self, user_id: str, operation_type: str, params: dict) -> dict:
        """
        Execute AI module operation.

        Flow:
        1. Build context using ContextBuilder
        2. Call existing AIService.generate()
        3. Parse and validate output
        """
        pass
```

**Five Product Modules Implemented:**

| Module | Purpose | Epic/Story Usage |
|--------|---------|------------------|
| **Onboarding Coach** | Goal breakdown from vague input | Stories 1.8, 2.3 |
| **Triad Planner** | Generate tomorrow's 3-task plan | Story 4.3 |
| **Daily Recap** | AI feedback after reflection | Story 4.3 |
| **Dream Self Advisor** | Conversational AI coaching | Stories 6.1, 6.2 |
| **AI Insights Engine** | Weekly pattern analysis | Story 6.4 |

**Module Example:**

```python
class OnboardingCoachModule(AIModuleBase):
    """Epic 1, Story 1.8: Generate goal breakdown from vague input."""

    def get_module_name(self) -> str:
        return "onboarding_coach"

    async def execute(self, user_id: str, operation_type: str, params: dict) -> dict:
        # 1. Build minimal context (onboarding needs less)
        context = await self.build_context(user_id, operation_type)

        # 2. Call existing AIService (not a new provider)
        response: AIResponse = self.ai_service.generate(
            user_id=user_id,
            user_role=context.get('role', 'user'),
            user_tier=context.get('tier', 'free'),
            module=self.get_module_name(),
            prompt=self._build_prompt(params, context)
        )

        # 3. Parse and validate
        parsed = self._parse_goal_breakdown(response.content)
        await self.validate_output(parsed)

        return parsed
```

### AIOrchestrator - Request Router

```python
# weave-api/app/services/ai/ai_orchestrator.py
class AIOrchestrator:
    """
    Routes requests to product modules.

    Does NOT duplicate existing AIService functionality:
    - Rate limiting → handled by AIService
    - Cost tracking → handled by AIService
    - Fallback chains → handled by AIService
    """

    def __init__(
        self,
        module_registry: AIModuleRegistry,
        context_builder: ContextBuilder,
        ai_service: AIService  # Use existing service
    ):
        self.module_registry = module_registry
        self.context_builder = context_builder
        self.ai_service = ai_service  # Delegate to existing infrastructure

    async def execute_ai_operation(
        self,
        user_id: str,
        operation_type: str,
        params: dict
    ) -> dict:
        """
        Execute AI operation by routing to correct module.

        Flow:
        1. Get module for operation_type (NEW)
        2. Module builds context (NEW)
        3. Module calls AIService.generate() (EXISTING)
        4. AIService handles rate limiting, fallback, cost tracking (EXISTING)
        5. Module parses and validates output (NEW)
        """

        # Get module
        module = self.module_registry.get_module(operation_type)
        if not module:
            raise ValueError(f"No module registered for operation: {operation_type}")

        # Execute module (module uses existing AIService internally)
        result = await module.execute(user_id, operation_type, params)

        return result
```

### ContextBuilder - User State Assembly

```python
# weave-api/app/services/ai/context_builder.py
class ContextBuilder:
    """
    Assembles canonical user context for AI calls.

    Different operations need different context:
    - Onboarding: minimal (just user input)
    - Triad: goals + history + journal
    - Recap: today's completions + captures + journal
    - Chat: full context (identity + goals + history + patterns)
    - Insights: 30-day history + patterns
    """

    async def get_context(self, user_id: str, operation_type: str) -> dict:
        """Build context based on operation type."""

        if operation_type == "generate_goal_breakdown":
            # Minimal context for onboarding
            return {"identity": await self._get_identity_doc(user_id)}

        elif operation_type == "generate_triad":
            # Rich context for triad planning
            return {
                "goals": await self._get_active_goals(user_id),
                "history": await self._get_recent_completions(user_id, days=7),
                "journal": await self._get_recent_journals(user_id, days=3)
            }

        elif operation_type == "chat_response":
            # Full context for Dream Self chat
            return {
                "identity": await self._get_identity_doc(user_id),
                "goals": await self._get_active_goals(user_id),
                "history": await self._get_recent_completions(user_id, days=7),
                "journal": await self._get_recent_journals(user_id, days=7),
                "patterns": await self._get_user_patterns(user_id)
            }

        # ... other operation types
```

### Module Registry Pattern

```python
# weave-api/app/services/ai/module_registry.py
class AIModuleRegistry:
    """Maps operation types to module instances."""

    def get_module(self, operation_type: str) -> AIModuleBase:
        """Get module for operation type."""

        operation_module_map = {
            'generate_goal_breakdown': 'onboarding_coach',
            'create_identity_doc_v1': 'onboarding_coach',
            'generate_triad': 'triad_planner',
            'generate_recap': 'daily_recap',
            'chat_response': 'dream_self_advisor',
            'generate_weekly_insights': 'ai_insights'
        }

        module_name = operation_module_map.get(operation_type)
        if not module_name:
            raise ValueError(f"No module registered for operation: {operation_type}")

        return self._modules.get(module_name)
```

### React Native Hooks

**Existing Hooks (Story 6.1):**
- ✅ `useAIChat()` - Text AI chat (already implemented)

**New Hooks (Story 1.5.3):**
- `useImageAnalysis()` - Image AI analysis
- `useVoiceTranscription()` - Audio STT transcription

**Standard Pattern:**
```typescript
// weave-mobile/src/hooks/useImageAnalysis.ts
export function useImageAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (options: ImageAnalysisOptions): Promise<ImageAnalysisResult> => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Upload image to Supabase Storage
      const imageUrl = await uploadImage(options.imageUrl);

      // Call image analysis API (uses orchestrator internally)
      const response = await apiClient.post('/api/ai/analyze-image', {
        image_url: imageUrl,
        operations: options.operations
      });

      return response.data.data;
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError('Daily image analysis limit reached (5/5). Resets at midnight.');
      } else {
        setError('Image analysis failed. Try again.');
      }
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { analyze, isAnalyzing, error };
}
```

### FastAPI Integration

```python
# weave-api/app/main.py
from app.services.ai import AIService  # Existing service
from app.services.ai.ai_orchestrator import AIOrchestrator
from app.services.ai.module_registry import AIModuleRegistry
from app.services.ai.context_builder import ContextBuilder
from app.services.ai.modules import (
    OnboardingCoachModule,
    TriadPlannerModule,
    DailyRecapModule,
    DreamSelfAdvisorModule,
    AIInsightsModule
)

def create_app() -> FastAPI:
    app = FastAPI()

    # Initialize existing AIService
    ai_service = AIService(
        db=get_supabase_client(),
        bedrock_region='us-east-1',
        openai_key=os.getenv('OPENAI_API_KEY'),
        anthropic_key=os.getenv('ANTHROPIC_API_KEY')
    )

    # Initialize context builder
    context_builder = ContextBuilder(db=get_supabase_client())

    # Initialize module registry
    module_registry = AIModuleRegistry()

    # Register modules
    module_registry.register_module(OnboardingCoachModule(ai_service, context_builder))
    module_registry.register_module(TriadPlannerModule(ai_service, context_builder))
    module_registry.register_module(DailyRecapModule(ai_service, context_builder))
    module_registry.register_module(DreamSelfAdvisorModule(ai_service, context_builder))
    module_registry.register_module(AIInsightsModule(ai_service, context_builder))

    # Initialize orchestrator
    orchestrator = AIOrchestrator(
        module_registry=module_registry,
        context_builder=context_builder,
        ai_service=ai_service  # Pass existing service
    )

    # Make available via dependency injection
    app.state.ai_orchestrator = orchestrator

    return app

# Dependency function for routes
def get_ai_orchestrator(request: Request) -> AIOrchestrator:
    """Get AI orchestrator from app state."""
    return request.app.state.ai_orchestrator
```

**Example API Endpoint:**

```python
# weave-api/app/api/goals_router.py
@router.post("/api/goals")
async def create_goal(
    goal_data: GoalCreate,
    user: User = Depends(get_current_user),
    orchestrator: AIOrchestrator = Depends(get_ai_orchestrator)
):
    """Create new goal with AI breakdown."""

    # Orchestrator handles: rate limits, module routing, context, logging
    ai_result = await orchestrator.execute_ai_operation(
        user_id=str(user.id),
        operation_type="generate_goal_breakdown",
        params={"title": goal_data.title, "description": goal_data.description}
    )

    # Use AI output to create goal
    goal = Goal(
        user_id=user.id,
        title=goal_data.title,
        q_goals=ai_result['q_goals'],
        binds=ai_result['binds']
    )

    # Save to database...

    return {"data": goal.to_dict()}
```

### Complete Documentation

**Developer Guide:** `docs/dev/ai-services-guide.md`

**Sections:**
1. Provider Abstraction (existing infrastructure)
2. Text AI Patterns (existing)
3. Image AI Patterns (existing)
4. Audio AI Patterns (existing)
5. Cost Tracking (existing)
6. Rate Limiting (existing)
7. Frontend Hooks (existing + new)
8. Provider Decision Tree (existing)
9. **AI Module Abstraction (NEW)**
10. **AI Orchestrator (NEW)**
11. **Context Builder Usage (NEW)**
12. **Implementing New AI Modules (NEW)**

**Integration with Epic 2-8:**
- 15+ AI integrations use module orchestration pattern
- Context building standardized (different operations need different data)
- Module registry enables dynamic feature loading
- Simplified Epic 2-8 implementation (use orchestrator, not raw AIService)

**Reference:** See `docs/stories/1-5-3-ai-module-orchestration.md` for complete implementation details.

---

## AI Tool Use System - "Mini Private MCP Server" (Story 6.2)

**Purpose:** Enable AI to execute actions directly in chat using industry-standard function calling patterns (OpenAI/Anthropic tool use).

### Architecture Overview

**Pattern:** AI can call tools/functions to execute workflows, not just respond conversationally.

**Example Flow:**
```
1. User: "Change my personality to be more direct"
2. AI Service receives message + tool definitions
3. AI decides to call tool → { tool: "modify_personality", params: { new_traits: "assertive, direct" } }
4. Tool Registry executes → modify_personality(user_id, new_traits)
5. Tool updates identity_docs table → Returns { success: true, message: "Personality updated" }
6. AI wraps result naturally → "Done! I've made your personality more assertive and direct."
```

**Why This Pattern:**
- **Natural UX:** Users say "Create a goal" instead of navigating to Goal Creation screen
- **Composable:** AI can chain tools (e.g., "Create goal X, then break it down")
- **Extensible:** Add new tools without changing AI service logic
- **Industry Standard:** Same pattern as OpenAI function calling, Anthropic tool use, MCP protocol
- **Future-proof:** Enables 10+ tools (goal creation, breakdown, reflection, scheduling, analytics)

### Tool Registry Pattern

**Core Components:**

```python
# weave-api/app/services/tools/registry.py
class ToolRegistry:
    """Central registry for all AI-callable tools."""

    def __init__(self):
        self.tools: dict[str, ToolBase] = {
            "modify_personality": ModifyPersonalityTool(),
            # Future tools: create_goal, breakdown_goal, analyze_reflection, etc.
        }

    def get_tool_definitions(self) -> list[dict]:
        """Return OpenAI/Anthropic-compatible tool schemas."""
        return [tool.get_schema() for tool in self.tools.values()]

    async def execute_tool(self, tool_name: str, params: dict, user_id: UUID) -> dict:
        """Execute a tool by name."""
        if tool_name not in self.tools:
            return {"success": False, "message": f"Tool '{tool_name}' not found"}

        tool = self.tools[tool_name]
        return await tool.execute(user_id, params)
```

**ToolBase Abstract Class:**

```python
# weave-api/app/services/tools/base.py
from abc import ABC, abstractmethod

class ToolBase(ABC):
    @abstractmethod
    async def execute(self, user_id: UUID, params: dict) -> dict:
        """Execute the tool with given params."""
        pass

    @abstractmethod
    def get_schema(self) -> dict:
        """Return OpenAI/Anthropic-compatible tool schema."""
        pass

    @abstractmethod
    def get_name(self) -> str:
        """Return tool name."""
        pass
```

### Tool Schema Format

**OpenAI/Anthropic Compatible:**

```python
{
    "name": "modify_personality",
    "description": "Updates the user's AI personality traits (Dream Self)",
    "parameters": {
        "type": "object",
        "properties": {
            "new_traits": {
                "type": "string",
                "description": "Comma-separated personality traits (e.g., 'assertive, direct, supportive')"
            }
        },
        "required": ["new_traits"]
    }
}
```

### AI Service Integration

**Enhanced AIService with Tool Use:**

```python
# weave-api/app/services/ai/ai_service.py
async def generate(
    self,
    user_id: UUID,
    module: str,
    prompt: str,
    model: str,
    tools: Optional[list[dict]] = None  # NEW: Tool definitions
) -> dict:
    """Generate AI response with optional tool calling."""

    # For Anthropic (Claude)
    if provider == "anthropic":
        response = anthropic.messages.create(
            model=model,
            messages=[...],
            tools=tools  # Pass tool definitions
        )

        # Detect tool use
        for content_block in response.content:
            if content_block.type == "tool_use":
                tool_name = content_block.name
                tool_params = content_block.input

                # Execute tool
                tool_result = await tool_registry.execute_tool(
                    tool_name, tool_params, user_id
                )

                # Send result back to AI for natural wrapping
                # ... continue conversation with tool result

    # For OpenAI (GPT-4o)
    if provider == "openai":
        response = openai.chat.completions.create(
            model=model,
            messages=[...],
            tools=tools  # Pass tool definitions
        )

        # Detect tool calls
        if response.choices[0].message.tool_calls:
            for tool_call in response.choices[0].message.tool_calls:
                tool_name = tool_call.function.name
                tool_params = json.loads(tool_call.function.arguments)

                # Execute tool
                tool_result = await tool_registry.execute_tool(
                    tool_name, tool_params, user_id
                )

                # Send result back to AI for natural wrapping
                # ... continue conversation with tool result
```

### Initial Tool: Personality Modification

**Implementation:**

```python
# weave-api/app/services/tools/modify_personality.py
class ModifyPersonalityTool(ToolBase):
    """Updates the user's AI personality traits (Dream Self)."""

    def get_name(self) -> str:
        return "modify_personality"

    def get_schema(self) -> dict:
        return {
            "name": "modify_personality",
            "description": "Updates the user's AI personality traits (Dream Self)",
            "parameters": {
                "type": "object",
                "properties": {
                    "new_traits": {
                        "type": "string",
                        "description": "Comma-separated personality traits"
                    }
                },
                "required": ["new_traits"]
            }
        }

    async def execute(self, user_id: UUID, params: dict) -> dict:
        try:
            new_traits = params.get("new_traits", "").strip()

            # Load Dream Self document
            supabase = get_supabase()
            identity_doc = supabase.table("identity_docs")\
                .select("*")\
                .eq("user_id", str(user_id))\
                .eq("type", "dream_self")\
                .single()\
                .execute()

            if not identity_doc.data:
                return {
                    "success": False,
                    "message": "No Dream Self personality found"
                }

            # Update personality traits
            updated_content = self._update_traits(
                identity_doc.data["content"],
                new_traits
            )

            supabase.table("identity_docs")\
                .update({"content": updated_content})\
                .eq("id", identity_doc.data["id"])\
                .execute()

            return {
                "success": True,
                "message": f"Personality updated with traits: {new_traits}",
                "data": {"new_traits": new_traits}
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to update personality: {str(e)}"
            }
```

### Chat API Integration

**Tool Use Flow:**

```python
# weave-api/app/api/ai_chat_router.py
@router.post("/messages")
async def send_message(request: ChatMessageCreate, user: User):
    # 1. Load tool definitions
    tool_registry = ToolRegistry()
    tool_definitions = tool_registry.get_tool_definitions()

    # 2. Call AI with tools
    ai_service = AIService()
    response = await ai_service.generate(
        user_id=user.id,
        module="ai_chat",
        prompt=request.message,
        model="claude-3-7-sonnet-20250219",
        tools=tool_definitions  # Pass tools
    )

    # 3. If AI called tool, execute it
    if response.get("tool_calls"):
        for tool_call in response["tool_calls"]:
            tool_result = await tool_registry.execute_tool(
                tool_call["name"],
                tool_call["params"],
                user.id
            )

            # 4. Send tool result back to AI for natural wrapping
            final_response = await ai_service.wrap_tool_result(
                tool_result, user.id
            )

            return {"data": {"response": final_response}}

    return {"data": {"response": response["text"]}}
```

### Future Tools (Enabled by This Pattern)

| Tool Name | Purpose | Epic | Story |
|-----------|---------|------|-------|
| `create_goal` | Create new goal from natural language | Epic 2 | US-2.1 |
| `breakdown_goal` | Generate subtasks/binds for goal | Epic 2 | US-2.2 |
| `delete_goal` | Delete/archive goal | Epic 2 | US-2.3 |
| `update_goal` | Modify goal title/description | Epic 2 | US-2.3 |
| `analyze_reflection` | Analyze journal patterns | Epic 4 | US-4.4 |
| `generate_weekly_insights` | Create weekly pattern report | Epic 6 | US-6.4 |
| `schedule_reminder` | Set bind reminder notifications | Epic 7 | US-7.2 |
| `suggest_goals` | Recommend goals based on behavior | Future | - |
| `optimize_habit` | Suggest timing/frequency adjustments | Future | - |

### Cost Tracking

**Tool Execution Logging:**

```python
# Log to ai_runs table
await log_ai_run(
    user_id=user_id,
    module=f"tool:{tool_name}",
    provider="tool_execution",
    tokens_used=0,  # No tokens for tool execution itself
    cost_usd=0.0,   # Tool execution is server-side (no API cost)
    context_used=True,
    metadata={
        "tool_name": tool_name,
        "params": params,
        "execution_time_ms": execution_time
    }
)
```

**Cost Impact:**
- Tool calling is **part of normal AI chat** (no additional API cost)
- Tool definitions included in system prompt (~200 tokens per message)
- Tool execution results included in conversation (~50-100 tokens per tool call)
- **Marginal cost increase: ~20% more tokens when tools used** (still within AI budget)

### Security Considerations

**Always Validate User Ownership:**

```python
# ✅ GOOD - Verify user owns the resource
resource = supabase.table("goals")\
    .select("*")\
    .eq("id", goal_id)\
    .eq("user_id", str(user_id))\\  # CRITICAL
    .single()\
    .execute()

if not resource.data:
    return {"success": False, "message": "Resource not found or access denied"}
```

**Rate Limiting:**
- Tools that trigger expensive operations (AI calls, external APIs) should check rate limits
- Tool execution logged to `ai_runs` for cost tracking

**Input Validation:**
- Never trust tool params directly from AI
- Validate and sanitize all inputs
- Check length constraints, format requirements

### Developer Guide

**Complete Documentation:** `docs/dev/ai-tool-development-guide.md`

**Key Sections:**
- Creating new tools (step-by-step)
- Tool schema best practices
- Tool implementation patterns (data modification, retrieval, AI-powered analysis)
- Error handling
- Testing strategies
- OpenAI/Anthropic compatibility
- Security considerations
- Performance optimization

**Quick Start Checklist:**
- [ ] Create `weave-api/app/services/tools/your_tool.py`
- [ ] Inherit from `ToolBase`
- [ ] Implement `get_name()`, `get_schema()`, `execute()`
- [ ] Register tool in `ToolRegistry.__init__()`
- [ ] Write unit tests in `tests/test_tools/test_your_tool.py`
- [ ] Write integration test in `tests/test_ai_chat_integration.py`
- [ ] Test manually: Send message to AI chat that should trigger your tool
- [ ] Verify tool execution logged to `ai_runs` table

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
