# Conversation Switching Not Working (Can't Open Previous Chats)

**Date Discovered:** 2025-12-25
**Severity:** 🔴 **HIGH**
**Status:** 🔍 **INVESTIGATING**
**Affected Components:** AI Chat UI, Conversation Management
**Branch:** `story/6.2`
**Story Context:** Story 6.1 (AI Chat), Story 6.2 (Conversation Persistence)

---

## Problem Description

Users cannot switch between previous AI chat conversations. When attempting to view or resume past conversations, one or more of the following issues may occur:

1. **Conversation list doesn't show up**: Toggle button does nothing or list is empty
2. **Can't tap conversations**: Tapping conversation cards has no effect
3. **Messages don't load**: Conversation switches but messages don't appear
4. **API errors**: Backend requests fail with 404 or 500 errors
5. **State not updating**: currentConversationId doesn't change

**User Impact**: Users lose access to chat history, can't resume previous discussions, and feel like the app "forgets" their conversations.

**User Feedback**: "also we can't open up previous chat"

---

## Investigation Checklist

### Test 1: Can Conversation List Be Toggled?

**Steps**:
1. Open AI chat overlay
2. Look for list icon (☰) in top-left corner
3. Tap the icon

**Expected**:
- UI switches from chat view to conversation list view
- Header changes from "Weave AI" to "Conversations"
- Icon changes from list (☰) to chat bubbles (💬)

**Potential Issues**:
- ❌ Button doesn't respond
- ❌ List view doesn't render
- ❌ `showConversationList` state not updating

**Code Location**: `ChatScreen.tsx` lines 487-490, 503-517

### Test 2: Are Conversations Fetched from Backend?

**Steps**:
1. Check browser console or React Native logs
2. Look for query: `['ai-conversations']`
3. Look for GET request: `/api/ai-chat/conversations`

**Expected**:
```
LOG  [HISTORY] 🔍 Loading conversation history...
LOG  [HISTORY] 📊 Found conversations: 3
```

**Potential Issues**:
- ❌ API endpoint returns 404 (not implemented)
- ❌ API endpoint returns 401 (authentication failed)
- ❌ API endpoint returns 500 (server error)
- ❌ Empty array returned (no conversations in database)
- ❌ Wrong data format (missing required fields)

**Code Location**: `ChatScreen.tsx` lines 84-95, 100-170

### Test 3: Does ConversationList Render Conversations?

**Steps**:
1. Toggle conversation list view
2. Check if conversation cards appear
3. Look for "No conversations yet" empty state

**Expected**:
- If conversations exist: List of conversation cards with preview text
- If no conversations: Empty state with icon and "No conversations yet"

**Potential Issues**:
- ❌ Component doesn't render (import error)
- ❌ Data format mismatch (missing required fields)
- ❌ Styling issue (cards invisible or off-screen)
- ❌ `conversations` prop is undefined or empty

**Code Location**: `ConversationList.tsx` lines 70-132

### Test 4: Does Tapping a Conversation Work?

**Steps**:
1. In conversation list view, tap a conversation card
2. Watch console for logs: `[CONV_SWITCH]`
3. Check if UI switches back to chat view
4. Check if messages appear

**Expected**:
```
LOG  [CONV_SWITCH] 🔄 Switching to conversation: abc123
LOG  [CONV_SWITCH] ✅ Loaded 5 messages
```

**Potential Issues**:
- ❌ `onPress` handler not firing
- ❌ API request fails: `GET /api/ai-chat/conversations/{id}`
- ❌ Messages don't transform correctly
- ❌ State updates but UI doesn't re-render
- ❌ `handleSelectConversation` has bugs

**Code Location**: `ChatScreen.tsx` lines 451-475, `ConversationList.tsx` lines 43-48

### Test 5: Do Messages Display After Switching?

**Steps**:
1. After tapping conversation, check `messages` state
2. Look for MessageBubble components in UI
3. Check if ScrollView has content

**Expected**:
- Previous messages appear in chat view
- Scroll position at bottom of conversation
- No streaming indicator (static messages)

**Potential Issues**:
- ❌ `messages` state updated but UI doesn't reflect it
- ❌ Message transformation fails (wrong format)
- ❌ ScrollView doesn't scroll to show messages
- ❌ Same infinite loop issue (personality effect)

**Code Location**: `ChatScreen.tsx` lines 458-465, 549-577

---

## Potential Root Causes

### Cause 1: Backend API Not Implemented

**Symptom**: 404 errors when fetching conversations

**Check**:
```bash
# Test API endpoint directly
curl -X GET http://localhost:8000/api/ai-chat/conversations \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Expected Response**:
```json
{
  "data": [
    {
      "id": "abc123",
      "started_at": "2025-12-25T10:00:00Z",
      "last_message_at": "2025-12-25T10:05:00Z",
      "last_message_preview": "Hello! How can I help?",
      "initiated_by": "user"
    }
  ],
  "meta": {}
}
```

**If Missing**: Backend router doesn't have conversation endpoints implemented.

**Fix Location**: `weave-api/app/api/ai_chat_router.py`

### Cause 2: Authentication Issues

**Symptom**: 401 Unauthorized errors

**Check**:
- JWT token validity
- Supabase session expiration
- Missing Authorization header

**Related**: `docs/bugs/jwt-authentication-401-errors-2025-12-25.md`

**Fix**: Ensure `apiClient.get()` includes auth headers automatically

### Cause 3: Data Format Mismatch

**Symptom**: Conversations fetch successfully but don't display

**Check Backend Response Format**:
```typescript
// Expected format (from ConversationList.tsx line 18-24)
interface Conversation {
  id: string;                      // ✅ Required
  started_at: string;              // ✅ Required
  last_message_at: string;         // ✅ Required
  last_message_preview: string;    // ✅ Required
  initiated_by: 'user' | 'system'; // ✅ Required
}
```

**If backend returns different field names** (e.g., `createdAt` vs `started_at`):
- Frontend expects snake_case
- Backend might return camelCase
- Need transformation layer

**Fix**: Add response transformer in `ChatScreen.tsx` line 91:
```typescript
queryFn: async () => {
  const response = await apiClient.get('/api/ai-chat/conversations');
  const conversations = response.data.data || [];

  // Transform if needed
  return conversations.map((conv: any) => ({
    id: conv.id,
    started_at: conv.started_at || conv.startedAt,
    last_message_at: conv.last_message_at || conv.lastMessageAt,
    last_message_preview: conv.last_message_preview || conv.lastMessagePreview || '',
    initiated_by: conv.initiated_by || conv.initiatedBy || 'user',
  }));
},
```

### Cause 4: Empty Conversations Array

**Symptom**: Empty state shows "No conversations yet" even after sending messages

**Check**:
- Are conversations being persisted to database?
- Does `/api/ai-chat/send` create conversation records?
- Is `conversation_id` tracked correctly?

**Debug**:
```typescript
// In ChatScreen.tsx line 91
queryFn: async () => {
  const response = await apiClient.get('/api/ai-chat/conversations');
  console.log('[CONV_DEBUG] Raw response:', response.data);
  console.log('[CONV_DEBUG] Conversations:', response.data.data);
  return response.data.data || [];
},
```

### Cause 5: Conversation Detail Endpoint Missing

**Symptom**: Conversation list works, but tapping conversation fails

**Check**:
```bash
# Test conversation detail endpoint
curl -X GET http://localhost:8000/api/ai-chat/conversations/abc123 \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Expected Response**:
```json
{
  "data": {
    "id": "abc123",
    "started_at": "2025-12-25T10:00:00Z",
    "messages": [
      {
        "id": "msg1",
        "role": "user",
        "content": "Hello",
        "created_at": "2025-12-25T10:00:00Z"
      },
      {
        "id": "msg2",
        "role": "assistant",
        "content": "Hi there!",
        "created_at": "2025-12-25T10:00:05Z"
      }
    ]
  },
  "meta": {}
}
```

**If Missing**: `handleSelectConversation` at line 454 will fail.

**Fix Location**: `weave-api/app/api/ai_chat_router.py`

### Cause 6: State Update Not Triggering Re-render

**Symptom**: `handleSelectConversation` runs, state updates, but UI doesn't change

**Check React DevTools**:
- Does `messages` state update?
- Does `currentConversationId` change?
- Does component re-render?

**Potential Issue**: Same batching problem as streaming messages bug

**Fix**: Ensure state updates are applied correctly:
```typescript
setMessages(transformedMessages);      // Should trigger re-render
setCurrentConversationId(conversationId); // Should trigger re-render
setShowConversationList(false);        // Should switch view
```

---

## Diagnostic Commands

### Check Backend Logs
```bash
cd weave-api
tail -f logs/app.log | grep -i conversation
```

### Check Frontend Console
Open React Native debugger and filter logs:
```
[CONV_SWITCH]
[HISTORY]
ai-conversations
```

### Test API Directly
```bash
# Get conversations list
curl -X GET http://192.168.1.6:8000/api/ai-chat/conversations \
  -H "Authorization: Bearer $(cat .jwt_token)"

# Get conversation detail
curl -X GET http://192.168.1.6:8000/api/ai-chat/conversations/abc123 \
  -H "Authorization: Bearer $(cat .jwt_token)"
```

### Check Database (if using Supabase)
```sql
-- Check if conversations table exists
SELECT * FROM conversations LIMIT 5;

-- Check if messages are linked to conversations
SELECT c.id, c.started_at, COUNT(m.id) as message_count
FROM conversations c
LEFT JOIN messages m ON m.conversation_id = c.id
GROUP BY c.id, c.started_at;
```

---

## Fixes by Root Cause

### Fix 1: Implement Missing Backend Endpoints

**If `/api/ai-chat/conversations` doesn't exist**:

```python
# weave-api/app/api/ai_chat_router.py

@router.get("/conversations")
async def get_conversations(user: dict = Depends(get_current_user)):
    """Get user's conversation list."""
    auth_user_id = user["sub"]

    # Fetch user's conversations from database
    conversations = await get_user_conversations(auth_user_id)

    return {
        "data": conversations,
        "meta": {"total": len(conversations)}
    }

@router.get("/conversations/{conversation_id}")
async def get_conversation_detail(
    conversation_id: str,
    user: dict = Depends(get_current_user)
):
    """Get conversation with full message history."""
    auth_user_id = user["sub"]

    # Fetch conversation with messages
    conversation = await get_conversation_with_messages(
        conversation_id,
        auth_user_id
    )

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return {"data": conversation, "meta": {}}
```

### Fix 2: Add Data Transformation Layer

**If backend returns different format**:

```typescript
// ChatScreen.tsx - Transform backend response
const { data: conversationsData } = useQuery({
  queryKey: ['ai-conversations'],
  queryFn: async () => {
    const response = await apiClient.get('/api/ai-chat/conversations');
    const rawConversations = response.data.data || [];

    // Transform to expected format
    return rawConversations.map((conv: any) => ({
      id: conv.id,
      started_at: conv.started_at || conv.startedAt || new Date().toISOString(),
      last_message_at: conv.last_message_at || conv.lastMessageAt || conv.started_at,
      last_message_preview: conv.last_message_preview || conv.lastMessagePreview || 'No preview',
      initiated_by: conv.initiated_by || conv.initiatedBy || 'user',
    }));
  },
});
```

### Fix 3: Add Null Checks and Fallbacks

**If data might be missing**:

```typescript
// ChatScreen.tsx line 454
const handleSelectConversation = async (conversationId: string) => {
  if (__DEV__) console.log('[CONV_SWITCH] 🔄 Switching to conversation:', conversationId);

  try {
    const response = await apiClient.get(`/api/ai-chat/conversations/${conversationId}`);

    // Add null checks
    if (!response || !response.data || !response.data.data) {
      console.error('[CONV_SWITCH] ❌ Invalid response format');
      return;
    }

    const conversationDetail = response.data.data;
    const convMessages = conversationDetail.messages || [];

    // Validate message format
    const transformedMessages: Message[] = convMessages
      .filter((msg: any) => msg.id && msg.role && msg.content) // Filter invalid
      .map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.created_at || Date.now()),
      }));

    setMessages(transformedMessages);
    setCurrentConversationId(conversationId);
    setShowQuickChips(transformedMessages.length === 0);
    setShowConversationList(false);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (__DEV__) console.log('[CONV_SWITCH] ✅ Loaded', transformedMessages.length, 'messages');
  } catch (error: any) {
    if (__DEV__) console.error('[CONV_SWITCH] ❌ Failed to switch conversation:', error.message);

    // Show error toast to user
    // TODO: Add toast notification
  }
};
```

### Fix 4: Ensure Conversations Are Persisted

**If conversations aren't being created**:

```python
# weave-api/app/api/ai_chat_router.py

@router.post("/send")
async def send_message(
    request: ChatRequest,
    user: dict = Depends(get_current_user)
):
    """Send message and get AI response."""
    auth_user_id = user["sub"]

    # Get or create conversation
    if request.conversation_id:
        conversation_id = request.conversation_id
    else:
        # Create new conversation
        conversation_id = await create_conversation(auth_user_id, initiated_by='user')

    # Save user message
    await save_message(
        conversation_id=conversation_id,
        role='user',
        content=request.message
    )

    # Get AI response
    ai_response = await get_ai_response(conversation_id, request.message)

    # Save AI message
    await save_message(
        conversation_id=conversation_id,
        role='assistant',
        content=ai_response
    )

    return {
        "data": {
            "message": ai_response,
            "conversation_id": conversation_id
        },
        "meta": {}
    }
```

---

## Testing Plan

### Test Case 1: Conversation List Toggle
1. Open AI chat
2. Tap list icon (☰)
3. ✅ Verify conversation list view appears
4. ✅ Verify header changes to "Conversations"
5. Tap chat icon (💬)
6. ✅ Verify chat view returns

### Test Case 2: Empty State
1. Fresh user (no conversations)
2. Toggle to conversation list
3. ✅ Verify empty state appears
4. ✅ Verify "No conversations yet" message
5. ✅ Verify icon and styling

### Test Case 3: List Conversations
1. User with 3 conversations
2. Toggle to conversation list
3. ✅ Verify 3 conversation cards appear
4. ✅ Verify preview text shows last message
5. ✅ Verify timestamps (e.g., "5m ago", "2h ago")

### Test Case 4: Switch Conversation
1. In conversation list, tap first conversation
2. ✅ Verify API request: `GET /conversations/abc123`
3. ✅ Verify messages load
4. ✅ Verify UI switches to chat view
5. ✅ Verify currentConversationId updates

### Test Case 5: Resume Conversation
1. Switch to previous conversation
2. Send new message
3. ✅ Verify message added to correct conversation
4. ✅ Verify conversation_id sent to backend
5. Toggle to list view
6. ✅ Verify preview updated with new message

### Test Case 6: New Conversation
1. In conversation list, tap "+" button
2. ✅ Verify new empty chat view
3. ✅ Verify greeting message appears
4. ✅ Verify currentConversationId is undefined
5. Send message
6. ✅ Verify new conversation created

---

## Acceptance Criteria for Resolution

1. ✅ **Toggle Works**: List icon switches between chat and conversation list views
2. ✅ **Conversations Load**: Backend API returns user's conversations
3. ✅ **List Displays**: Conversation cards render with preview and timestamp
4. ✅ **Tapping Works**: Clicking conversation loads messages
5. ✅ **Messages Appear**: Previous messages display after switching
6. ✅ **State Persists**: Current conversation tracked correctly
7. ✅ **New Conversation**: "+" button creates fresh chat
8. ✅ **Empty State**: Proper UI when no conversations exist

---

## Related Issues

- Streaming Messages Bug: `docs/bugs/streaming-messages-not-displaying-ui-2025-12-25.md`
- JWT Authentication: `docs/bugs/jwt-authentication-401-errors-2025-12-25.md`
- Infinite Loop: `docs/bugs/personality-greeting-infinite-loop-2025-12-25.md`
- Story 6.1: AI Chat Implementation
- Story 6.2: Server-Initiated Check-ins

---

## Status

**Current**: 🔍 **INVESTIGATING** - Need to run diagnostic tests

**Next Steps**:
1. Run Test 1: Check if toggle button works
2. Run Test 2: Check backend API responses
3. Run Test 3: Check ConversationList rendering
4. Run Test 4: Check conversation switching
5. Run Test 5: Check message display
6. Identify root cause from test results
7. Apply appropriate fix
8. Re-test all scenarios
9. Commit fix with documentation

**Priority**: 🔴 **HIGH** - Users need access to chat history for continuity.
