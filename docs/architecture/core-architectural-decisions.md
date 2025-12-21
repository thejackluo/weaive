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
