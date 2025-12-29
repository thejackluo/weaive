# AI Chat Eager Loading Strategy

## Overview

Implements eager prefetching of AI conversations and usage stats so users see data **immediately** when opening AI Chat (no loading spinners).

## Implementation

### Backend: Tools Registered at Startup

**File:** `weave-api/app/main.py`

```python
@app.on_event("startup")
async def startup_event():
    """Initialize tools and services on app startup."""
    logger.info("🚀 Registering AI tools...")
    register_default_tools()  # Registers modify_personality, modify_identity_document
    logger.info("✅ AI tools registered successfully")
```

**Result:** All AI tools are available as soon as the backend starts. No lazy loading.

---

### Frontend: Prefetch on Authentication

**File:** `weave-mobile/app/_layout.tsx`

```typescript
// ApiInitializer component
useEffect(() => {
  if (user) {
    console.log('[ROOT_LAYOUT] 🔄 Prefetching AI conversations...');

    // Prefetch conversations list
    queryClient.prefetchQuery({
      queryKey: ['ai-conversations'],
      queryFn: async () => {
        const response = await apiClient.get('/api/ai-chat/conversations');
        return response.data.data || [];
      },
    });

    // Prefetch usage stats
    queryClient.prefetchQuery({
      queryKey: ['ai-usage'],
      queryFn: async () => {
        const response = await apiClient.get('/api/ai-chat/usage');
        return response.data.data;
      },
    });
  }
}, [user]);
```

**When it runs:** As soon as user authentication completes (after login, or on app startup if already logged in)

**Where the data goes:** TanStack Query cache with `staleTime: 5 minutes`

---

### Usage in Components

**File:** `weave-mobile/app/(tabs)/_layout.tsx` (Tab layout with unread badge)

```typescript
const { data: conversations } = useQuery({
  queryKey: ['ai-conversations'], // ✅ Same key = instant data
  queryFn: async () => {
    const response = await apiClient.get('/api/ai-chat/conversations');
    return response.data.data || [];
  },
  refetchInterval: 30000, // Background refresh every 30s
  enabled: !isLoading && !aiChatVisible && !!user,
});
```

**File:** `weave-mobile/src/components/features/ai-chat/ChatScreen.tsx` (AI Chat screen)

```typescript
const { data: conversationsData } = useQuery({
  queryKey: ['ai-conversations'], // ✅ Same key = instant data
  queryFn: async () => {
    const response = await apiClient.get('/api/ai-chat/conversations');
    return response.data.data || [];
  },
  refetchOnMount: true, // Ensure fresh data if stale
});
```

**Result:** When user opens AI Chat, data is **already in cache** from prefetch. No loading spinner!

---

## Data Flow

```
User Login
    ↓
ApiInitializer detects user
    ↓
Prefetch conversations → TanStack Query cache ['ai-conversations']
Prefetch usage stats → TanStack Query cache ['ai-usage']
    ↓
User navigates to AI Chat
    ↓
ChatScreen queries ['ai-conversations'] → ✅ Instant data from cache
    ↓
Background: refetch if stale (5 min staleTime)
```

---

## Benefits

1. **Instant UI:** No loading spinners when opening AI Chat
2. **Smart caching:** Data shared across components using same query key
3. **Background refresh:** Stale data refetches automatically
4. **Offline-friendly:** Cached data available even if network fails temporarily
5. **Battery efficient:** Single prefetch serves multiple components

---

## Cache Configuration

**File:** `weave-mobile/app/_layout.tsx`

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1, // Retry once on failure (offline-friendly)
      refetchOnWindowFocus: false, // Mobile doesn't have window focus concept
    },
  },
});
```

- **staleTime: 5 min** - Data considered fresh for 5 minutes
- **gcTime: 10 min** - Unused data cleaned up after 10 minutes
- **retry: 1** - Single retry on network failure (good for spotty mobile networks)

---

## Testing Prefetch

### Console Logs to Watch For:

```
[ROOT_LAYOUT] 🔄 Prefetching AI conversations...
[ROOT_LAYOUT] ✅ AI conversations prefetched
[ROOT_LAYOUT] ✅ AI usage stats prefetched
```

### Backend Logs to Watch For:

```
🚀 Registering AI tools...
✅ Registered tool: modify_personality
✅ Registered tool: modify_identity_document
✅ Registered 2 default tools
✅ AI tools registered successfully
```

### User Experience Test:

1. **Login to app**
2. **Wait 1 second** (prefetch completes)
3. **Open AI Chat overlay** (click center button)
4. **Result:** Conversations list appears **instantly** (no spinner)

---

## Related Files

- **Backend tool registration:** `weave-api/app/main.py:42-47`
- **Frontend prefetch:** `weave-mobile/app/_layout.tsx:112-144`
- **Query usage (tabs):** `weave-mobile/app/(tabs)/_layout.tsx:208-216`
- **Query usage (chat):** `weave-mobile/src/components/features/ai-chat/ChatScreen.tsx:69-80`
- **Tool registry:** `weave-api/app/services/tools/tool_registry.py:177-193`
