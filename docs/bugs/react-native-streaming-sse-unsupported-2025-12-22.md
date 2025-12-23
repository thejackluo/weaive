# React Native Streaming SSE Unsupported (2025-12-22)

**Issue ID:** `react-native-streaming-sse-unsupported-2025-12-22`
**Component:** Frontend (React Native) - AI Chat Streaming
**Status:** Identified - Fix Available
**Severity:** High (breaks streaming feature)
**Story:** 6.1 - AI Chat Interface

---

## Problem Description

React Native's `fetch` API doesn't support streaming with `response.body.getReader()`. The Web Streams API is not available in React Native, causing AI chat streaming to fail.

### Error Logs

```
LOG  [STREAM_DEBUG] 🔍 response.body value: undefined
ERROR  Streaming error: Response body is not readable - streaming not supported in this environment
```

### Root Cause

**File:** `weave-mobile/src/hooks/useAIChatStream.ts:162-179`

```typescript
// ❌ This doesn't work in React Native
const reader = response.body.getReader();  // response.body is undefined
```

React Native's `fetch` implementation does not include the Web Streams API (`ReadableStream`, `getReader()`). This is a browser-only feature.

---

## Impact

- ✅ **Non-streaming AI chat works** (using `POST /api/ai-chat/messages`)
- ❌ **Streaming AI chat fails** (using `POST /api/ai-chat/messages/stream`)
- ❌ No real-time typing effect for AI responses
- ❌ Users see error messages instead of streaming content

---

## Solution Options

### Option 1: Install `react-native-sse` (Recommended ⭐)

**Why:** Purpose-built for React Native, handles SSE correctly, supports POST requests.

**Install:**
```bash
cd weave-mobile
npm install react-native-sse
```

**Update `src/hooks/useAIChatStream.ts` (lines 144-238):**

```typescript
import RNEventSource from 'react-native-sse';

const sendStreamingMessage = useCallback(
  async (message: string, conversationId?: string) => {
    try {
      setStreamingContent('');
      setError(null);
      setMetadata({});
      setIsStreaming(true);

      const baseURL = apiClient.defaults.baseURL || '';
      const accessToken = await getAccessToken();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      };

      // ✅ Add admin key if available
      if (apiClient.adminKey) {
        headers['X-Admin-Key'] = apiClient.adminKey;
      }

      // ✅ Create EventSource for SSE streaming
      const eventSource = new RNEventSource(
        `${baseURL}/api/ai-chat/messages/stream`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            message,
            conversation_id: conversationId,
          }),
        }
      );

      // Store for cancellation
      abortControllerRef.current = {
        abort: () => eventSource.close()
      } as any;

      // Set timeout
      timeoutIdRef.current = setTimeout(() => {
        eventSource.close();
        setError('Request timed out after 60 seconds. Please try again.');
        setIsStreaming(false);
      }, 60000);

      // ✅ Listen for SSE messages
      eventSource.addEventListener('message', (event) => {
        try {
          const chunk: StreamChunk = JSON.parse(event.data);

          if (chunk.type === 'metadata') {
            setMetadata((prev) => ({
              ...prev,
              messageId: chunk.message_id,
              conversationId: chunk.conversation_id,
            }));
          } else if (chunk.type === 'chunk') {
            if (chunk.content) {
              setStreamingContent((prev) => prev + chunk.content);
            }
          } else if (chunk.type === 'done') {
            setMetadata((prev) => ({
              ...prev,
              responseId: chunk.response_id,
              tokensUsed: chunk.tokens_used,
            }));
            cleanup();
            setIsStreaming(false);
          } else if (chunk.type === 'error') {
            setError(chunk.message || 'Unknown error occurred');
            cleanup();
            setIsStreaming(false);
          }
        } catch (parseError) {
          console.error('Failed to parse SSE event:', parseError);
        }
      });

      // ✅ Handle connection errors
      eventSource.addEventListener('error', (error) => {
        console.error('SSE error:', error);
        setError('Connection error occurred');
        cleanup();
        setIsStreaming(false);
      });

    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream cancelled by user or timed out');
      } else {
        console.error('Streaming error:', err);
        setError(err.message || 'Failed to stream response');
      }
      setIsStreaming(false);
      cleanup();
    }
  },
  [cleanup]
);
```

---

### Option 2: Use Non-Streaming Fallback (Quick Fix)

**When to use:** Need immediate fix without dependencies.

**Update `ChatScreen.tsx`:**

```typescript
// Replace useAIChatStream with useAIChat
import { useAIChat } from '@/hooks/useAIChat';

// In component:
const { sendMessage } = useAIChat();

// In handleSend:
const handleSend = async () => {
  if (!inputValue.trim()) return;

  // Add user message immediately
  const userMessage: Message = {
    id: `user-${Date.now()}`,
    role: 'user',
    content: inputValue,
    timestamp: new Date(),
  };
  setMessages((prev) => [...prev, userMessage]);
  setInputValue('');
  setShowQuickChips(false);

  // ✅ Use non-streaming endpoint
  try {
    const response = await sendMessage(inputValue, currentConversationId);

    // Add AI response
    const aiMessage: Message = {
      id: response.data.response_id,
      role: 'assistant',
      content: response.data.response,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMessage]);

    if (response.data.conversation_id) {
      setCurrentConversationId(response.data.conversation_id);
    }

    refetchUsage();
  } catch (error) {
    console.error('AI chat error:', error);
    setMessages((prev) => [
      ...prev,
      {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      },
    ]);
  }
};
```

**Trade-offs:**
- ✅ Works immediately without new dependencies
- ✅ No code changes to SSE logic
- ❌ No real-time typing effect
- ❌ Higher perceived latency (wait for full response)

---

### Option 3: Install `eventsource` Polyfill

**Why:** Standard EventSource API, works in Node.js environments.

**Install:**
```bash
cd weave-mobile
npm install eventsource
npm install --save-dev @types/eventsource
```

**Update `useAIChatStream.ts`:**

```typescript
import EventSource from 'eventsource';

// NOTE: This option has limitations - EventSource doesn't support POST requests
// directly. You may need to encode the message in query params or use a
// workaround. react-native-sse (Option 1) is better for POST + SSE.
```

**Trade-offs:**
- ✅ Standard API
- ❌ No native POST support (need workarounds)
- ❌ Not optimized for React Native

---

## Recommended Fix

**Use Option 1** (`react-native-sse`):

```bash
cd weave-mobile
npm install react-native-sse
npm start --reset-cache
npm run ios  # or android
```

Then apply the code changes shown in Option 1.

---

## Testing Steps

1. **Install package:**
   ```bash
   cd weave-mobile
   npm install react-native-sse
   ```

2. **Update code:** Apply Option 1 changes to `useAIChatStream.ts`

3. **Clear cache and rebuild:**
   ```bash
   npm start --reset-cache
   npm run ios  # or npm run android
   ```

4. **Test streaming:**
   - Open AI Chat screen
   - Send a message
   - Verify: See character-by-character streaming
   - Verify: No "response.body undefined" error

5. **Test edge cases:**
   - Long messages (>500 tokens)
   - Network interruption (airplane mode mid-stream)
   - Rate limit exceeded
   - Backend timeout (60s)

---

## Related Files

- `weave-mobile/src/hooks/useAIChatStream.ts` - Streaming hook (needs fix)
- `weave-mobile/src/components/features/ai-chat/ChatScreen.tsx` - Chat UI
- `weave-api/app/api/ai_chat_router.py` - Backend SSE endpoint (working correctly)

---

## Additional Note: Admin Key Naming

**Unrelated warning that appeared alongside this error:**

```
[ADMIN_KEY_CHECK] AI_ADMIN_KEY not set in .env!
```

**Cause:** Environment variable was named `ADMIN_API_KEY` (wrong) instead of `AI_ADMIN_KEY` (correct).

**Impact:** Admin bypass wasn't working (rate limits still applied even with header).

**Fix:** Rename in `weave-api/.env`:
```bash
# ❌ Wrong (ignored by code)
ADMIN_API_KEY=dev-unlimited-access-key-2025

# ✅ Correct
AI_ADMIN_KEY=dev-admin-key-12345-change-in-production
```

**See:** `docs/setup/ai-admin-key-setup.md` for full admin key setup guide.

---

## Backend Verification (Already Working)

The backend SSE implementation is correct:

```python
# weave-api/app/api/ai_chat_router.py:317-523
@router.post("/ai-chat/messages/stream")
async def send_chat_message_stream(...):
    """SSE streaming endpoint - works correctly"""

    async def event_generator() -> AsyncGenerator[str, None]:
        # Yields: data: {"type": "chunk", "content": "..."}\n\n
        yield f"data: {chunk_event}\n\n"
```

**Confirmed:** Backend SSE format is correct (`data: {json}\n\n`).

---

## Status

- ✅ **Backend:** Working correctly
- ❌ **Frontend:** Needs `react-native-sse` package
- 📋 **Next Step:** Install dependency + apply code changes

---

## References

- **React Native fetch limitations:** https://reactnative.dev/docs/network#using-fetch
- **react-native-sse package:** https://github.com/binaryminds/react-native-sse
- **Web Streams API (not in RN):** https://developer.mozilla.org/en-US/docs/Web/API/Streams_API
- **Story 6.1:** `docs/stories/6-1-ai-chat-interface.md`
- **Backend implementation:** `weave-api/app/api/ai_chat_router.py:317-523`
